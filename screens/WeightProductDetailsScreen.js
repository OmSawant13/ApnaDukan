import React, { useState } from 'react';
import {
    View,
    StyleSheet,
    StatusBar,
    SafeAreaView,
    Text,
    TouchableOpacity,
    Image,
    Platform,
    TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const WeightProductDetailsScreen = ({ navigation, route }) => {
    // Get item from navigation params
    const { item } = route.params || {};

    // Default Fallback Data
    const product = item || {
        name: "Toor Dal",
        weight: "1 kg",
        price: 140,
        type: 'weight'
    };

    // State
    const [isFavorite, setIsFavorite] = useState(false);

    // --- Calculator Logic ---
    const ratePerKg = product.price; // Simplified rate assumption

    const [customWeight, setCustomWeight] = useState('1000'); // in grams
    const [customPrice, setCustomPrice] = useState(product.price.toString());

    // Update Price when Weight changes
    const onWeightChange = (wtText) => {
        setCustomWeight(wtText);
        const wt = parseFloat(wtText);
        if (!isNaN(wt)) {
            const newPrice = (wt / 1000) * ratePerKg;
            setCustomPrice(Math.round(newPrice).toString());
        } else {
            setCustomPrice('');
        }
    };

    // Update Weight when Price changes
    const onPriceChange = (priceText) => {
        setCustomPrice(priceText);
        const p = parseFloat(priceText);
        if (!isNaN(p)) {
            const newWeight = (p / ratePerKg) * 1000;
            setCustomWeight(Math.round(newWeight).toString());
        } else {
            setCustomWeight('');
        }
    };

    const displayedPrice = parseFloat(customPrice || 0);

    const toggleFavorite = () => setIsFavorite(!isFavorite);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#f9fafb" />

            {/* Header */}
            <SafeAreaView style={styles.headerSafeArea}>
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.iconButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="chevron-back" size={24} color="#1f2937" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Product Details</Text>
                    <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('Cart')}>
                        <Ionicons name="cart-outline" size={24} color="#1f2937" />
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>2</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            <View style={styles.staticContent}>
                {/* Product Image Section */}
                <View style={styles.imageSection}>
                    {/* Simplified Image Logic */}
                    <Image
                        source={require('../assets/Panipuri.jpeg')}
                        style={styles.productImage}
                        resizeMode="cover"
                    />
                    <View style={styles.discountBadge}>
                        <LinearGradient
                            colors={['#f59e0b', '#ef4444']}
                            style={styles.discountGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <Text style={styles.discountText}>OFFER</Text>
                        </LinearGradient>
                    </View>
                </View>

                {/* Product Info */}
                <View style={styles.detailsContainer}>
                    {/* Title & Favorite */}
                    <View style={styles.titleRow}>
                        <View style={styles.titleWrapper}>
                            <Text style={styles.productName}>{product.name}</Text>
                            <Text style={styles.rateSubheading}>₹{product.price}/kg</Text>
                        </View>
                        <TouchableOpacity
                            style={[
                                styles.favoriteButton,
                                isFavorite && styles.favoriteActive,
                            ]}
                            onPress={toggleFavorite}
                        >
                            <Ionicons
                                name={isFavorite ? 'heart' : 'heart-outline'}
                                size={24}
                                color={isFavorite ? '#fff' : '#10b981'}
                            />
                        </TouchableOpacity>
                    </View>

                    {/* Weight/Price Calculator */}
                    <View style={styles.calculatorContainer}>
                        {/* Weight Input Container */}
                        <View style={styles.calcInputBox}>
                            <Text style={styles.calcLabel}>Weight (g)</Text>
                            <View style={styles.inputWrapper}>
                                <TextInput
                                    style={styles.calcInput}
                                    keyboardType="numeric"
                                    value={customWeight}
                                    onChangeText={onWeightChange}
                                    placeholder="1000"
                                />
                                <Text style={styles.unitText}>g</Text>
                            </View>
                        </View>

                        {/* Divider Integration Icon */}
                        <View style={styles.calcDivider}>
                            <View style={styles.dividerCircle}>
                                <Ionicons name="swap-vertical" size={20} color="#10b981" />
                            </View>
                        </View>

                        {/* Price Input Container */}
                        <View style={styles.calcInputBox}>
                            <Text style={styles.calcLabel}>Price (₹)</Text>
                            <View style={styles.inputWrapper}>
                                <Text style={styles.currencyPrefix}>₹</Text>
                                <TextInput
                                    style={styles.calcInput}
                                    keyboardType="numeric"
                                    value={customPrice}
                                    onChangeText={onPriceChange}
                                    placeholder="0"
                                />
                            </View>
                        </View>
                    </View>

                    {/* Action Row */}
                    <View style={styles.actionRow}>
                        {/* Add to Cart Button */}
                        <TouchableOpacity style={styles.addToCartBtn}>
                            <LinearGradient
                                colors={['#10b981', '#059669']}
                                style={styles.btnGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            >
                                <Ionicons name="cart-outline" size={20} color="#fff" />
                                <Text style={styles.btnText}>
                                    Add {customWeight}g
                                </Text>
                                <View style={styles.verticalDivider} />
                                <Text style={styles.btnPrice}>₹{displayedPrice}</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>

                    <View style={{ height: 40 }} />
                </View>
            </View>
        </View>
    );
};

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
    badge: {
        position: 'absolute',
        top: -4,
        right: -4,
        backgroundColor: '#ef4444',
        width: 18,
        height: 18,
        borderRadius: 9,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#fff',
    },
    badgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    staticContent: {
        paddingBottom: 20,
        paddingTop: 10,
        flex: 1,
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
    },
    discountBadge: {
        position: 'absolute',
        bottom: 0,
        right: 40,
        borderRadius: 20,
        overflow: 'hidden',
    },
    discountGradient: {
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    discountText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    detailsContainer: {
        paddingHorizontal: 20,
        marginTop: 20,
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 10,
    },
    titleWrapper: {
        flex: 1,
        marginRight: 10,
        marginLeft: 10,
    },
    productName: {
        fontSize: 24,
        fontWeight: '800',
        color: '#111',
        marginBottom: 4,
    },
    rateSubheading: {
        fontSize: 16,
        color: '#6b7280',
        fontWeight: '600',
        marginTop: 2,
    },
    favoriteButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#ecfdf5',
        alignItems: 'center',
        justifyContent: 'center',
    },
    favoriteActive: {
        backgroundColor: '#10b981',
    },

    // Calculator Styles
    calculatorContainer: {
        marginTop: 15,
        gap: 0,
        paddingHorizontal: 5,
    },
    calcInputBox: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#f3f4f6',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 8,
        elevation: 2,
    },
    calcLabel: {
        fontSize: 11,
        color: '#9ca3af',
        fontWeight: '700',
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 1.2,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingBottom: 4,
    },
    calcInput: {
        flex: 1,
        fontSize: 24,
        fontWeight: '700',
        color: '#1f2937',
        padding: 0,
    },
    unitText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#9ca3af',
        marginLeft: 8,
    },
    currencyPrefix: {
        fontSize: 24,
        fontWeight: '700',
        color: '#9ca3af',
        marginRight: 4,
    },
    calcDivider: {
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
        marginTop: -14,
        marginBottom: -14,
    },
    dividerCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#ecfdf5',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 4,
        borderColor: '#f9fafb',
    },

    actionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center', // Centered single button
        marginTop: 60,
        paddingHorizontal: 40,
    },
    addToCartBtn: {
        flex: 1,
        height: 54,
        borderRadius: 27,
        overflow: 'hidden',
    },
    btnGradient: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    btnText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
        marginRight: 10,
    },
    verticalDivider: {
        width: 1,
        height: 20,
        backgroundColor: 'rgba(255,255,255,0.3)',
        marginRight: 10,
    },
    btnPrice: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
    },
});

export default WeightProductDetailsScreen;