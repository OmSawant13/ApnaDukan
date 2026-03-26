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
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useProducts } from '../context/ProductContext';
import { useOrders } from '../context/OrderContext';
import { useLanguage } from '../context/LanguageContext';

const ProductDetailsScreen = ({ navigation, route }) => {
    const { item } = route.params || {};
    const { addToCart, cart } = useOrders();
    const { products } = useProducts();
    const { t, translateProduct } = useLanguage();
    const insets = useSafeAreaInsets();

    // Find LIVE product data from context (updated via Socket)
    const liveProduct = products.find(p => p.id === item.id) || item;

    // Find in Cart
    const cartItem = cart.find(c => c.id === liveProduct.id);
    const initialQuantity = cartItem ? cartItem.quantity : 1;

    // Calculate total cart items for badge
    const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

    const product = liveProduct || {
        name: "Beef Mixed Cut Bone",
        weight: "500 gm",
        price: 23,
        mrp: 45,
        type: 'unit',
        stock: true,
        stockCount: 0
    };

    const [quantity, setQuantity] = useState(initialQuantity); // Sync with Cart
    const [isFavorite, setIsFavorite] = useState(false);

    // Update local state if cart changes externally (e.g. cleared)
    // Optional: useEffect(() => { if (cartItem) setQuantity(cartItem.quantity); }, [cartItem]);

    const incrementQuantity = () => {
        // Check Stock Limit (Target Quantity)
        if (product.stock && quantity >= product.stockCount) {
            alert(`Only ${product.stockCount} items available in stock!`);
            return;
        }
        setQuantity(q => q + 1);
    }
    const decrementQuantity = () => setQuantity(q => (q > 1 ? q - 1 : 1));
    const toggleFavorite = () => setIsFavorite(!isFavorite);

    const displayPrice = product.price * quantity;

    const { updateQuantity } = useOrders(); // Destructure updateQuantity

    const handleAddToCart = () => {
        // Stock Validation
        if (!product.stock || product.stockCount <= 0) {
            alert('Product is Out of Stock!');
            return;
        }

        if (quantity > product.stockCount) {
            alert(`Stock Limit Reached! Only ${product.stockCount} available.`);
            return;
        }

        const currentInCart = cartItem ? cartItem.quantity : 0;
        const delta = quantity - currentInCart;

        if (delta === 0) {
            alert('Cart updated!'); // Or just navigate
            navigation.navigate('Cart');
            return;
        }

        if (currentInCart === 0) {
            // New Item: Add 'quantity' times
            for (let i = 0; i < quantity; i++) {
                addToCart(product);
            }
        } else {
            // Update Existing Item
            updateQuantity(product.id, delta);
        }

        navigation.navigate('Cart');
    };

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

                    <Text style={styles.headerTitle}>{t('product_details')}</Text>

                    <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('Cart')}>
                        <Ionicons name="cart-outline" size={24} color="#1f2937" />
                        {cartItemCount > 0 && (
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>{cartItemCount}</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            <View style={styles.staticContent}>
                {/* Product Image */}
                <View style={styles.imageSection}>
                    <Image
                        source={product.image} // Use item image directly
                        style={styles.productImage}
                        resizeMode="cover"
                    />
                    <View style={styles.discountBadge}>
                        <LinearGradient
                            colors={['#f59e0b', '#ef4444']}
                            style={styles.discountGradient}
                        >
                            <Text style={styles.discountText}>{t('offer')}</Text>
                        </LinearGradient>
                    </View>
                </View>

                {/* Product Info */}
                <View style={styles.detailsContainer}>

                    {/* Title */}
                    <View style={styles.titleRow}>
                        <View style={styles.titleWrapper}>
                            <Text style={styles.productName}>{translateProduct(product.name)}</Text>
                            <Text style={styles.productWeight}>{translateProduct(product.subtitle) || translateProduct(product.weight) || translateProduct(product.unit)}</Text>
                        </View>

                        <TouchableOpacity
                            style={[styles.favoriteButton, isFavorite && styles.favoriteActive]}
                            onPress={toggleFavorite}
                        >
                            <Ionicons
                                name={isFavorite ? 'heart' : 'heart-outline'}
                                size={24}
                                color={isFavorite ? '#fff' : '#10b981'}
                            />
                        </TouchableOpacity>
                    </View>

                    {/* Price */}
                    <View style={styles.priceContainer}>
                        <Text style={styles.price}>₹{product.price}</Text>
                    </View>

                    {/* Description */}
                    <Text style={styles.description}>
                        {t('product_desc_fallback')}
                    </Text>

                    {/* ✅ TRUST ROW ADDED */}
                    <View style={styles.trustRow}>
                        <View style={styles.trustItem}>
                            <Ionicons name="checkmark-circle" size={18} color="#10b981" />
                            <Text style={styles.trustText}>{t('fresh')}</Text>
                        </View>

                        <View style={styles.trustItem}>
                            <Ionicons name="time-outline" size={18} color="#10b981" />
                            <Text style={styles.trustText}>{t('30_min')}</Text>
                        </View>

                        <View style={styles.trustItem}>
                            <Ionicons name="refresh-outline" size={18} color="#10b981" />
                            <Text style={styles.trustText}>{t('easy_return')}</Text>
                        </View>
                    </View>

                    {/* Action Row */}
                    <View style={styles.actionRow}>
                        <View style={styles.quantitySelector}>
                            <TouchableOpacity onPress={decrementQuantity} style={styles.qtyBtn}>
                                <Ionicons name="remove" size={20} color="#1f2937" />
                            </TouchableOpacity>

                            <Text style={styles.qtyText}>{quantity}</Text>

                            <TouchableOpacity onPress={incrementQuantity} style={styles.qtyBtn}>
                                <Ionicons name="add" size={20} color="#1f2937" />
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity style={styles.addToCartBtn} onPress={handleAddToCart}>
                            <LinearGradient
                                colors={['#10b981', '#059669']}
                                style={styles.btnGradient}
                            >
                                <Ionicons name="cart-outline" size={20} color="#fff" />
                                <Text style={styles.btnText}>{t('add_to_cart')}</Text>
                                <View style={styles.verticalDivider} />
                                <Text style={styles.btnPrice}>₹{displayPrice}</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>

                    <View style={{ height: 40 }} />
                </View>
            </View>
        </View >
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f9fafb' },

    headerSafeArea: { backgroundColor: '#f9fafb', zIndex: 10 },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 10,
        marginTop: 30,
    },

    headerTitle: { fontSize: 18, fontWeight: '700', color: '#1f2937' },

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

    badgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },

    staticContent: { paddingBottom: 20, paddingTop: 10, flex: 1 },

    imageSection: { alignItems: 'center', marginVertical: 20 },

    productImage: { width: 280, height: 280, borderRadius: 32 },

    discountBadge: {
        position: 'absolute',
        bottom: 0,
        right: 40,
        borderRadius: 20,
        overflow: 'hidden',
    },

    discountGradient: { paddingHorizontal: 12, paddingVertical: 6 },

    discountText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },

    detailsContainer: { paddingHorizontal: 30, marginTop: 5 },

    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 10,
    },

    titleWrapper: { flex: 1, marginRight: 10 },

    productName: { fontSize: 24, fontWeight: '800', color: '#111' },

    productWeight: { fontSize: 16, color: '#6b7280', fontWeight: '500' },

    favoriteButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#ecfdf5',
        alignItems: 'center',
        justifyContent: 'center',
    },

    favoriteActive: { backgroundColor: '#10b981' },

    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 25,
    },

    price: { fontSize: 32, fontWeight: '800', color: '#064e3b' },

    description: {
        fontSize: 14,
        color: '#6b7280',
        lineHeight: 22,
        marginBottom: 10,
    },

    /* ✅ TRUST STYLES */
    trustRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
        marginTop: 20,
    },
    trustItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    trustText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#374151',
    },

    actionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 15,
        marginTop: 60,
    },


    quantitySelector: {
        flex: 1,
        height: 54,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#f7f7f7',
        borderRadius: 27,
        paddingHorizontal: 5,
    },

    qtyBtn: {
        width: 44,
        height: 44,
        backgroundColor: '#fff',
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },

    qtyText: { fontSize: 18, fontWeight: '700', color: '#111' },

    addToCartBtn: { flex: 1.5, height: 54, borderRadius: 27, overflow: 'hidden' },

    btnGradient: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },

    btnText: { fontSize: 16, fontWeight: '700', color: '#fff', marginRight: 10 },

    verticalDivider: {
        width: 1,
        height: 20,
        backgroundColor: 'rgba(255,255,255,0.3)',
        marginRight: 10,
    },

    btnPrice: { fontSize: 16, fontWeight: '700', color: '#fff' },
});

export default ProductDetailsScreen;
