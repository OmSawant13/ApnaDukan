import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Image,
    Switch,
    Alert,
    Dimensions,
    Modal,
    Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useProducts } from '../../context/ProductContext';
import { useShopLanguage } from '../../context/LanguageContext';

/* -------------------------------- Product Row -------------------------------- */

const ProductRow = ({ item, incrementStock, decrementStock, toggleStock, onPress, onLongPress, t, translateProduct }) => {
    return (
        <TouchableOpacity
            activeOpacity={0.9}
            onPress={onPress}
            onLongPress={onLongPress}
            style={[styles.card, !item.stock && styles.cardDisabled]}
        >
            {/* Left: Product Image */}
            <View>
                <Image source={item.image} style={[styles.img, !item.stock && { opacity: 0.5 }]} />
                {item.isFeatured && (
                    <View style={styles.featuredBadge}>
                        <Ionicons name="star" size={12} color="#fff" />
                    </View>
                )}
            </View>

            {/* Center: Product Info */}
            <View style={styles.info}>
                <Text style={[styles.name, !item.stock && { color: '#9CA3AF' }]}>{translateProduct(item.name)}</Text>
                <Text style={styles.subtitle}>{item.subtitle || t(item.unit) || item.unit}</Text>
                {!item.stock && (
                    <View style={styles.outOfStockBadge}>
                        <Text style={styles.outOfStockText}>{t('out_of_stock')}</Text>
                    </View>
                )}
            </View>

            {/* Right: Price + Stock Controls */}
            <View style={styles.rightSection}>

                <View style={styles.priceRow}>
                    <Text style={styles.price}>₹{item.price}</Text>
                    <Switch
                        trackColor={{ false: "#D1D5DB", true: "#10B981" }}
                        thumbColor={item.stock ? "#ffffff" : "#f4f3f4"}
                        ios_backgroundColor="#3e3e3e"
                        onValueChange={() => toggleStock(item.id)}
                        value={item.stock}
                        style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
                    />
                </View>

                <View style={[styles.stepper, !item.stock && { opacity: 0.3 }]}>
                    <TouchableOpacity
                        style={styles.stepBtn}
                        onPress={() => decrementStock(item.id)}
                        disabled={!item.stock}
                    >
                        <Ionicons name="remove" size={18} color="#111827" />
                    </TouchableOpacity>

                    <Text style={styles.count}>{item.stockCount || 0}</Text>

                    <TouchableOpacity
                        style={[styles.stepBtn, styles.stepPlus]}
                        onPress={() => incrementStock(item.id)}
                        disabled={!item.stock}
                    >
                        <Ionicons name="add" size={18} color="#ffffff" />
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );
};

/* -------------------------- Main Screen -------------------------- */

export default function ShopkeeperProductListScreen({ route, navigation }) {
    const { categoryId, categoryName, categoryType } = route.params;
    const { products, incrementStock, decrementStock, toggleStock, deleteProduct, updateProduct } = useProducts();
    const { t, translateProduct, bulkTranslate, currentLanguage } = useShopLanguage();

    // AI Translation Magic - Trigger bulk translation when data or language changes
    React.useEffect(() => {
        if (products.length > 0) {
            const currentCategoryProducts = products.filter(p => p.categoryId === categoryId);
            const productNames = currentCategoryProducts.map(p => p.name);
            if (productNames.length > 0) {
                bulkTranslate(productNames);
            }
        }
    }, [products, categoryId, currentLanguage]);

    const [selectedProduct, setSelectedProduct] = React.useState(null);
    const [isBottomSheetVisible, setIsBottomSheetVisible] = React.useState(false);

    const handleLongPress = (product) => {
        setSelectedProduct(product);
        setIsBottomSheetVisible(true);
    };

    const closeBottomSheet = () => {
        setIsBottomSheetVisible(false);
        setSelectedProduct(null);
    };

    const handleAction = (action) => {
        if (!selectedProduct) return;

        if (action === 'feature') {
            updateProduct(selectedProduct.id, { isFeatured: !selectedProduct.isFeatured });
            closeBottomSheet();
        } else if (action === 'delete') {
            closeBottomSheet();
            // Delay slightly to let the sheet close before showing the second confirmation alert
            setTimeout(() => {
                handleDeleteProduct(selectedProduct);
            }, 300);
        }
    };

    const handleDeleteProduct = (product) => {
        Alert.alert(
            t('delete_category') === 'Delete Category' ? 'Delete Product' : (t('delete') + ' ' + t('products')),
            (t('delete_category_confirm') === 'Delete this category and all its products?' ? `Are you sure you want to delete "${product.name}"?` : t('delete_category_confirm')),
            [
                { text: t('cancel') || 'Cancel', style: 'cancel' },
                {
                    text: t('delete'),
                    style: 'destructive',
                    onPress: () => deleteProduct(product.id, categoryId)
                }
            ]
        );
    };

    const categoryProducts = products.filter(
        p => p.categoryId === categoryId
    );

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backBtn}
                >
                    <Ionicons name="arrow-back" size={22} color="#111827" />
                </TouchableOpacity>

                <Text
                    style={styles.title}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                >
                    {translateProduct(categoryName)}
                </Text>

                <TouchableOpacity
                    style={styles.addBtn}
                    onPress={() =>
                        navigation.navigate('ShopkeeperAddProduct', {
                            categoryId,
                            categoryType,
                        })
                    }
                >
                    <Ionicons name="add" size={22} color="#ffffff" />
                </TouchableOpacity>
            </View>

            {/* Product List */}
            <FlatList
                data={categoryProducts}
                keyExtractor={(item, index) => (item.id || item._id || index).toString()}
                renderItem={({ item }) => (
                    <ProductRow
                        item={item}
                        incrementStock={incrementStock}
                        decrementStock={decrementStock}
                        toggleStock={toggleStock}
                        onPress={() => navigation.navigate('ShopkeeperProductDetails', { item })}
                        onLongPress={() => handleLongPress(item)}
                        t={t}
                        translateProduct={translateProduct}
                    />
                )}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Ionicons name="cube-outline" size={42} color="#D1D5DB" />
                        <Text style={styles.emptyText}>{t('no_products')}</Text>
                        <Text style={styles.subText}>
                            {t('tap_to_add_product')}
                        </Text>
                    </View>
                }
            />

            {/* Premium Bottom Sheet for Quick Actions */}
            <Modal
                visible={isBottomSheetVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={closeBottomSheet}
            >
                <Pressable style={styles.modalOverlay} onPress={closeBottomSheet}>
                    <View style={styles.bottomSheetContainer}>
                        <View style={styles.bottomSheetHeader}>
                            <View style={styles.dragHandle} />
                            <Text style={styles.bottomSheetTitle}>{translateProduct(selectedProduct?.name)}</Text>
                        </View>

                        <View style={styles.bottomSheetContent}>
                            <TouchableOpacity
                                style={styles.actionButton}
                                onPress={() => handleAction('feature')}
                            >
                                <View style={[styles.actionIconContainer, { backgroundColor: '#FEF3C7' }]}>
                                    <Ionicons
                                        name={selectedProduct?.isFeatured ? "star" : "star-outline"}
                                        size={24}
                                        color="#F59E0B"
                                    />
                                </View>
                                <Text style={styles.actionText}>
                                    {selectedProduct?.isFeatured ? t('remove_featured') : t('add_featured')}
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.actionButton}
                                onPress={() => handleAction('delete')}
                            >
                                <View style={[styles.actionIconContainer, { backgroundColor: '#FEE2E2' }]}>
                                    <Ionicons name="trash-outline" size={24} color="#EF4444" />
                                </View>
                                <Text style={[styles.actionText, { color: '#EF4444' }]}>{t('delete_category') === 'Delete Category' ? 'Delete Product' : (t('delete') + ' ' + t('products'))}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.actionButton, styles.cancelButton]}
                                onPress={closeBottomSheet}
                            >
                                <Text style={styles.cancelText}>{t('cancel') || 'Cancel'}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Pressable>
            </Modal>
        </SafeAreaView>
    );
}

/* ------------------------------- Styles ------------------------------- */

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },

    /* Header */
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16, // Reduced from 24
        height: 60, // Fixed height
        backgroundColor: '#F9FAFB',
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    title: {
        fontSize: 22, // Smaller than original 26, but visible
        fontWeight: '900', // Restored heavy weight
        color: '#111827',
        flex: 1,
        textAlign: 'center',
        marginHorizontal: 10,
    },
    addBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#111827',
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 4,
    },

    /* List */
    list: {
        padding: 16,
    },

    /* Product Card */
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        backgroundColor: '#ffffff',
        borderRadius: 14,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    cardDisabled: {
        backgroundColor: '#F9FAFB', // Gray out card when off
        borderColor: '#F3F4F6',
    },
    img: {
        width: 54,
        height: 54,
        borderRadius: 10,
        backgroundColor: '#F3F4F6',
        marginRight: 14,
    },
    featuredBadge: {
        position: 'absolute',
        top: -4,
        right: 10,
        backgroundColor: '#F59E0B',
        width: 20,
        height: 20,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#fff',
    },

    /* Info */
    info: {
        flex: 1,
    },
    name: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
    },
    subtitle: {
        marginTop: 2,
        fontSize: 13,
        color: '#6B7280',
    },
    outOfStockBadge: {
        marginTop: 6,
        alignSelf: 'flex-start',
        backgroundColor: '#FEE2E2',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    outOfStockText: {
        color: '#EF4444',
        fontSize: 10,
        fontWeight: 'bold',
    },

    /* Right Section */
    rightSection: {
        alignItems: 'flex-end',
        justifyContent: 'center',
        gap: 8,
        minWidth: 100, // Ensure space for items
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 4,
    },
    price: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
    },

    /* Stepper */
    stepper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 10,
        overflow: 'hidden',
        backgroundColor: '#fff',
    },
    stepBtn: {
        width: 34,
        height: 34,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F9FAFB',
    },
    stepPlus: {
        backgroundColor: '#111827',
    },
    count: {
        width: 42,
        textAlign: 'center',
        fontSize: 15,
        fontWeight: '700',
        color: '#111827',
    },

    /* Empty State */
    empty: {
        alignItems: 'center',
        paddingTop: 80,
    },
    emptyText: {
        marginTop: 12,
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
    },
    subText: {
        marginTop: 4,
        fontSize: 14,
        color: '#9CA3AF',
    },

    /* Bottom Sheet Styles */
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        justifyContent: 'flex-end',
    },
    bottomSheetContainer: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingBottom: 40,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 20,
    },
    bottomSheetHeader: {
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    dragHandle: {
        width: 40,
        height: 4,
        backgroundColor: '#E5E7EB',
        borderRadius: 2,
        marginBottom: 12,
    },
    bottomSheetTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#111827',
    },
    bottomSheetContent: {
        padding: 24,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 8,
        borderRadius: 16,
        marginBottom: 8,
    },
    actionIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    actionText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1F2937',
    },
    cancelButton: {
        marginTop: 8,
        justifyContent: 'center',
        backgroundColor: '#F3F4F6',
    },
    cancelText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#6B7280',
    },
});
