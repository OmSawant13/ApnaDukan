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
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const ProductDetailsScreen = ({ navigation, route }) => {
    const { item } = route.params || {};

    const product = item || {
        name: "Beef Mixed Cut Bone",
        weight: "500 gm",
        price: 23,
        mrp: 45,
        type: 'unit'
    };

    const [quantity, setQuantity] = useState(1);
    const [isFavorite, setIsFavorite] = useState(false);

    const incrementQuantity = () => setQuantity(q => q + 1);
    const decrementQuantity = () => setQuantity(q => (q > 1 ? q - 1 : 1));
    const toggleFavorite = () => setIsFavorite(!isFavorite);

    const displayPrice = product.price * quantity;

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
                {/* Product Image */}
                <View style={styles.imageSection}>
                    <Image
                        source={require('../assets/Panipuri.jpeg')}
                        style={styles.productImage}
                        resizeMode="cover"
                    />
                    <View style={styles.discountBadge}>
                        <LinearGradient
                            colors={['#f59e0b', '#ef4444']}
                            style={styles.discountGradient}
                        >
                            <Text style={styles.discountText}>OFFER</Text>
                        </LinearGradient>
                    </View>
                </View>

                {/* Product Info */}
                <View style={styles.detailsContainer}>

                    {/* Title */}
                    <View style={styles.titleRow}>
                        <View style={styles.titleWrapper}>
                            <Text style={styles.productName}>{product.name}</Text>
                            <Text style={styles.productWeight}>{product.weight}</Text>
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
                        Fresh and high quality products delivered directly to your doorstep.
                        Verified by local farmers.
                    </Text>

                    {/* ✅ TRUST ROW ADDED */}
                    <View style={styles.trustRow}>
                        <View style={styles.trustItem}>
                            <Ionicons name="checkmark-circle" size={18} color="#10b981" />
                            <Text style={styles.trustText}>Fresh</Text>
                        </View>

                        <View style={styles.trustItem}>
                            <Ionicons name="time-outline" size={18} color="#10b981" />
                            <Text style={styles.trustText}>30 Min</Text>
                        </View>

                        <View style={styles.trustItem}>
                            <Ionicons name="refresh-outline" size={18} color="#10b981" />
                            <Text style={styles.trustText}>Easy Return</Text>
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

                        <TouchableOpacity style={styles.addToCartBtn}>
                            <LinearGradient
                                colors={['#10b981', '#059669']}
                                style={styles.btnGradient}
                            >
                                <Ionicons name="cart-outline" size={20} color="#fff" />
                                <Text style={styles.btnText}>Add to Cart</Text>
                                <View style={styles.verticalDivider} />
                                <Text style={styles.btnPrice}>₹{displayPrice}</Text>
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

    productImage: { width: 320, height: 320, borderRadius: 40 },

    discountBadge: {
        position: 'absolute',
        bottom: 0,
        right: 40,
        borderRadius: 20,
        overflow: 'hidden',
    },

    discountGradient: { paddingHorizontal: 12, paddingVertical: 6 },

    discountText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },

    detailsContainer: { paddingHorizontal: 30, marginTop: 45 },

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
        marginBottom: 20,
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
        marginTop: 70,
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
