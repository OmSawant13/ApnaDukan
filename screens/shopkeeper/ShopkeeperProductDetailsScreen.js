import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    StatusBar,
    SafeAreaView,
    TouchableOpacity,
    Image,
    TextInput,
    Switch,
    Alert,
    ScrollView,
    FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useProducts } from '../../context/ProductContext';
import { useShopLanguage } from '../../context/LanguageContext';

export default function ShopkeeperProductDetailsScreen({ navigation, route }) {
    const { item: initialItem } = route.params;
    const { products, categories, updateProduct, toggleStock, incrementStock, decrementStock, deleteProduct } = useProducts();
    const { t, translateProduct } = useShopLanguage();

    const product = products.find(p => p.id === initialItem.id) || initialItem;
    const [price, setPrice] = useState(product.price.toString());
    const [isEditingPrice, setIsEditingPrice] = useState(false);
    const scrollRef = useRef(null);

    useEffect(() => {
        setPrice(product.price.toString());
    }, [product.price]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({ y: (product.stockCount || 0) * 40, animated: true });
        }
    }, [product.stockCount]);

    const handleSavePrice = () => {
        const newPrice = parseFloat(price);
        if (!isNaN(newPrice)) {
            updateProduct(product.id, { price: newPrice });
            setIsEditingPrice(false);
        } else {
            Alert.alert(t('error') || 'Error', t('invalid_price') || "Please enter a valid number");
            setPrice(product.price.toString());
        }
    };


    const handleDelete = () => {
        Alert.alert(
            t('delete_category') === 'Delete Category' ? 'Delete Product' : (t('delete') + ' ' + t('products')),
            (t('delete_category_confirm') === 'Delete this category and all its products?' ? "Are you sure you want to delete this product?" : t('delete_category_confirm')),
            [
                { text: t('cancel') || "Cancel", style: "cancel" },
                {
                    text: t('delete') || "Delete",
                    style: "destructive",
                    onPress: () => {
                        deleteProduct(product.id, product.categoryId);
                        navigation.goBack();
                    }
                }
            ]
        );
    };

    const category = categories.find(c => c.id === product.categoryId);
    const isWeightType = product.type === 'weight' || (product.type !== 'unit' && category?.type === 'weight');

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#f9fafb" />

            <SafeAreaView style={styles.headerSafeArea}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
                        <Ionicons name="chevron-back" size={24} color="#1f2937" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{t('product_details')}</Text>
                    <TouchableOpacity onPress={handleDelete} style={[styles.iconButton, { borderColor: '#FEE2E2', backgroundColor: '#FEF2F2' }]}>
                        <Ionicons name="trash-outline" size={22} color="#EF4444" />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Image Section (Matches Customer UI) */}
                <View style={styles.imageSection}>
                    <Image source={product.image} style={[styles.productImage, !product.stock && { opacity: 0.5 }]} resizeMode="cover" />
                    {!product.stock && (
                        <View style={styles.outOfStockBadge}>
                            <Text style={styles.outOfStockText}>{t('hidden')}</Text>
                        </View>
                    )}
                </View>

                {/* Details Container */}
                <View style={styles.detailsContainer}>

                    {/* Title & Live Toggle */}
                    <View style={styles.titleRow}>
                        <View style={styles.titleWrapper}>
                            <Text style={styles.productName}>{translateProduct(product.name)}</Text>
                            <Text style={styles.rateSubheading}>{product.subtitle || t(product.unit) || product.unit}</Text>
                        </View>

                        {/* Live Toggle Pill */}
                        <View style={styles.liveToggleContainer}>
                            <Text style={[styles.liveText, product.stock ? { color: '#10B981' } : { color: '#EF4444' }]}>
                                {product.stock ? t('live') : t('off')}
                            </Text>
                            <Switch
                                trackColor={{ false: "#D1D5DB", true: "#10B981" }}
                                thumbColor={product.stock ? "#ffffff" : "#f4f3f4"}
                                onValueChange={() => toggleStock(product.id)}
                                value={product.stock}
                                style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
                            />
                        </View>
                    </View>


                    {/* Controls Section (Replaces Calculator) */}
                    <View style={styles.controlsContainer}>

                        {/* Price Edit Card */}
                        <View style={styles.controlCard}>
                            <Text style={styles.controlLabel}>{t('selling_price')}</Text>
                            <View style={styles.priceEditRow}>
                                {isEditingPrice ? (
                                    <View style={styles.editWrapper}>
                                        <Text style={styles.currency}>₹</Text>
                                        <TextInput
                                            style={styles.priceInput}
                                            value={price}
                                            onChangeText={setPrice}
                                            keyboardType="numeric"
                                            autoFocus
                                            onBlur={handleSavePrice}
                                        />
                                        <TouchableOpacity onPress={handleSavePrice} style={styles.saveIcon}>
                                            <Ionicons name="checkmark-circle" size={28} color="#10B981" />
                                        </TouchableOpacity>
                                    </View>
                                ) : (
                                    <TouchableOpacity onPress={() => setIsEditingPrice(true)} style={styles.displayWrapper}>
                                        <Text style={styles.displayPrice}>₹{product.price}</Text>
                                        <Ionicons name="pencil" size={18} color="#9CA3AF" style={{ marginLeft: 8 }} />
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>

                        {/* Stock Manager Card */}
                        <View style={styles.controlCard}>
                            <Text style={styles.controlLabel}>{t('current_stock')}</Text>
                            <View style={styles.stockRow}>
                                <TouchableOpacity
                                    style={styles.stockBtn}
                                    onPress={() => decrementStock(product.id)}
                                    disabled={!product.stock}
                                >
                                    <Ionicons name="remove" size={24} color="#1f2937" />
                                </TouchableOpacity>

                                <View style={styles.stockInfo}>
                                    <View style={styles.verticalPickerContainer}>
                                        <ScrollView
                                            ref={scrollRef}
                                            showsVerticalScrollIndicator={false}
                                            snapToInterval={40}
                                            decelerationRate="fast"
                                            nestedScrollEnabled={true}
                                            contentOffset={{ x: 0, y: (product.stockCount || 0) * 40 }}
                                            onMomentumScrollEnd={(e) => {
                                                const newIndex = Math.round(e.nativeEvent.contentOffset.y / 40);
                                                if (newIndex !== product.stockCount) {
                                                    updateProduct(product.id, { stockCount: newIndex });
                                                }
                                            }}
                                        >
                                            {[...Array(501).keys()].map((val) => (
                                                <View key={val} style={styles.pickerItem}>
                                                    <Text style={styles.stockCount}>{val}</Text>
                                                </View>
                                            ))}
                                        </ScrollView>
                                    </View>
                                    <Text style={styles.stockUnit}>{isWeightType ? (t('kg') || 'kg') : (t('unit') || 'Pcs')}</Text>
                                </View>

                                <TouchableOpacity
                                    style={[styles.stockBtn, styles.stockBtnActive]}
                                    onPress={() => incrementStock(product.id)}
                                    disabled={!product.stock}
                                >
                                    <Ionicons name="add" size={24} color="#fff" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Details Section */}
                        {/* (This part was previously here) */}
                    </View>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
    },
    headerSafeArea: {
        backgroundColor: '#f9fafb',
        zIndex: 10,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 10,
        marginTop: 30,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1f2937',
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    scrollContent: {
        paddingBottom: 20,
    },
    imageSection: {
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 20,
    },
    productImage: {
        width: 320,
        height: 320,
        borderRadius: 40,
        backgroundColor: '#fff',
    },
    outOfStockBadge: {
        position: 'absolute',
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    outOfStockText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 14,
        letterSpacing: 1,
    },
    detailsContainer: {
        paddingHorizontal: 20,
        marginTop: 10,
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 24,
    },
    titleWrapper: {
        flex: 1,
        marginRight: 10,
    },
    productName: {
        fontSize: 26,
        fontWeight: '800',
        color: '#111',
        marginBottom: 4,
    },
    rateSubheading: {
        fontSize: 16,
        color: '#6b7280',
        fontWeight: '600',
    },
    liveToggleContainer: {
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    liveText: {
        fontSize: 10,
        fontWeight: '700',
        marginBottom: 2,
        textTransform: 'uppercase',
    },

    /* Controls */
    controlsContainer: {
        gap: 20,
    },
    controlCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: '#f3f4f6',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 8,
        elevation: 2,
    },
    controlLabel: {
        fontSize: 11,
        color: '#9ca3af',
        fontWeight: '700',
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 1.2,
    },

    /* Price Edit */
    priceEditRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    displayWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    displayPrice: {
        fontSize: 32,
        fontWeight: '800',
        color: '#1f2937',
    },
    editWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        borderBottomWidth: 2,
        borderBottomColor: '#10B981',
        paddingBottom: 4,
    },
    currency: {
        fontSize: 32,
        fontWeight: '800',
        color: '#9CA3AF',
        marginRight: 4,
    },
    priceInput: {
        flex: 1,
        fontSize: 32,
        fontWeight: '800',
        color: '#1f2937',
        padding: 0,
    },
    saveIcon: {
        marginLeft: 10,
    },

    /* Stock Manager */
    stockRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    stockBtn: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#f3f4f6',
        alignItems: 'center',
        justifyContent: 'center',
    },
    stockBtnActive: {
        backgroundColor: '#111827',
    },
    stockInfo: {
        alignItems: 'center',
    },
    stockCount: {
        fontSize: 28,
        fontWeight: '800',
        color: '#1f2937',
    },
    stockUnit: {
        fontSize: 14,
        color: '#6b7280',
        fontWeight: '600',
    },
    stockInputWrapper: {
        borderBottomWidth: 2,
        borderBottomColor: '#111827',
        minWidth: 60,
        alignItems: 'center',
    },
    stockInput: {
        fontSize: 28,
        fontWeight: '800',
        color: '#1f2937',
        paddingVertical: 0,
        textAlign: 'center',
    },
    verticalPickerContainer: {
        height: 40,
        width: 80,
        alignItems: 'center',
        justifyContent: 'center',
    },
    pickerItem: {
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
