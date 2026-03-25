import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Image,
    TouchableOpacity,
    StatusBar,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useOrders } from '../context/OrderContext';
import { useLanguage } from '../context/LanguageContext';

/* -------------------- DUMMY DATA -------------------- */

const DUMMY_CART_ITEMS = [
    {
        id: '101',
        name: 'Beetroot',
        weight: '500 gm',
        price: 17,
        image: require('../assets/Panipuri.jpeg'),
        quantity: 1,
    },
    {
        id: '202',
        name: 'Brown Bread',
        weight: '400 gm',
        price: 40,
        image: require('../assets/images/baby_care_v3.png'),
        quantity: 2,
    },
    {
        id: '401',
        name: 'Toor Dal',
        weight: '1 kg',
        price: 140,
        image: require('../assets/Panipuri.jpeg'),
        quantity: 1,
    },
];

/* -------------------- CART ITEM -------------------- */

const CartItem = ({ item, onIncrement, onDecrement, onRemove }) => {
    const { translateProduct } = useLanguage();
    return (
        <View style={styles.cartCard}>
            <Image source={item.image} style={styles.itemImage} />

            <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{translateProduct(item.name)}</Text>
                <Text style={styles.itemWeight}>
                    {item.type === 'weight' ? `${item.customWeight} g` : (translateProduct(item.subtitle) || translateProduct(item.weight))}
                </Text>
                <Text style={styles.itemPrice}>
                    ₹{item.price * item.quantity}
                </Text>
            </View>

            <View style={styles.controls}>
                {item.type !== 'weight' ? (
                    <View style={styles.quantityControl}>
                        <TouchableOpacity onPress={onDecrement} style={styles.qtyBtn}>
                            <Ionicons name="remove" size={16} color="#10b981" />
                        </TouchableOpacity>

                        <Text style={styles.qtyText}>{item.quantity}</Text>

                        <TouchableOpacity onPress={onIncrement} style={styles.qtyBtn}>
                            <Ionicons name="add" size={16} color="#10b981" />
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={{ height: 36 }} /> // Spacer to keep layout consistent
                )}

                <TouchableOpacity onPress={onRemove} style={styles.removeBtn}>
                    <Ionicons name="trash-outline" size={18} color="#9ca3af" />
                </TouchableOpacity>
            </View>
        </View>
    );
};

/* -------------------- SCREEN -------------------- */

export default function CartScreen({ navigation }) {
    const { cart, updateQuantity, removeFromCart, getCartTotal, placeOrder, clearCart } = useOrders();
    const { t } = useLanguage();
    const insets = useSafeAreaInsets();
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);

    const [isCredit, setIsCredit] = useState(false);

    const handlePlaceOrder = async () => {
        setIsPlacingOrder(true);
        // Customer Name & ID now handled automatically by the context from Auth
        await placeOrder(isCredit);
        setIsPlacingOrder(false);
    };

    const subtotal = getCartTotal();
    // Delivery Fee Removed as per user request
    const total = subtotal;

    /* ---------------- EMPTY CART ---------------- */

    if (cart.length === 0) {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="dark-content" />

                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={styles.backBtn}
                    >
                        <Ionicons name="chevron-back" size={24} color="#111827" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{t('my_cart')}</Text>
                    <View style={{ width: 40 }} />
                </View>

                <View style={styles.emptyContainer}>
                    <Ionicons name="cart-outline" size={90} color="#e5e7eb" />
                    <Text style={styles.emptyText}>{t('cart_empty')}</Text>

                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={styles.shopNowBtn}
                    >
                        <Text style={styles.shopNowText}>{t('start_shopping')}</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    /* ---------------- MAIN UI ---------------- */

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* HEADER */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backBtn}
                >
                    <Ionicons name="chevron-back" size={24} color="#111827" />
                </TouchableOpacity>

                <Text style={styles.headerTitle}>{t('my_cart')}</Text>

                <TouchableOpacity onPress={clearCart}>
                    <Text style={styles.clearText}>{t('clear')}</Text>
                </TouchableOpacity>
            </View>

            {/* CART LIST */}
            <FlatList
                data={cart}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <CartItem
                        item={item}
                        onIncrement={() => updateQuantity(item.id, 1)}
                        onDecrement={() => updateQuantity(item.id, -1)}
                        onRemove={() => removeFromCart(item.id)}
                    />
                )}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />

            {/* FOOTER / BILL */}
            <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
                <View style={styles.billRow}>
                    <Text style={styles.billLabel}>{t('subtotal')}</Text>
                    <Text style={styles.billValue}>₹{subtotal}</Text>
                </View>

                {/* Delivery Fee Removed */}

                <View style={styles.divider} />

                <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>{t('total')}</Text>
                    <Text style={styles.totalValue}>₹{total}</Text>
                </View>

                {/* --- Pay on Credit Toggle --- */}
                <TouchableOpacity 
                    style={styles.creditToggle} 
                    onPress={() => setIsCredit(!isCredit)}
                    activeOpacity={0.7}
                >
                    <View style={[styles.toggleCircle, isCredit && styles.toggleActive]}>
                        {isCredit && <Ionicons name="checkmark" size={14} color="#fff" />}
                    </View>
                    <Text style={styles.creditText}>Pay Later (Add to Udhari/Credit)</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.checkoutBtn, isPlacingOrder && { opacity: 0.7 }]}
                    onPress={handlePlaceOrder}
                    disabled={isPlacingOrder}
                >
                    <LinearGradient
                        colors={['#10b981', '#059669']}
                        style={styles.gradientBtn}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <Text style={styles.checkoutText}>
                            {isPlacingOrder ? t('placing_order') : t('proceed_to_buy')}
                        </Text>
                        {!isPlacingOrder && <Ionicons name="arrow-forward" size={20} color="#fff" />}
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

/* -------------------- STYLES -------------------- */

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f3f4f6',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#111827',
    },
    clearText: {
        color: '#ef4444',
        fontWeight: '600',
    },

    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 140,
    },

    cartCard: {
        flexDirection: 'row',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
        alignItems: 'center',
    },
    itemImage: {
        width: 64,
        height: 64,
        borderRadius: 14,
        backgroundColor: '#f3f4f6',
    },
    itemInfo: {
        flex: 1,
        marginLeft: 12,
    },
    itemName: {
        fontSize: 15,
        fontWeight: '700',
        color: '#111827',
    },
    itemWeight: {
        fontSize: 12,
        color: '#6b7280',
        marginVertical: 4,
    },
    itemPrice: {
        fontSize: 16,
        fontWeight: '800',
        color: '#10b981',
    },

    controls: {
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        height: 64,
    },
    quantityControl: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f3f4f6',
        borderRadius: 20,
        paddingHorizontal: 6,
        paddingVertical: 4,
    },
    qtyBtn: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    qtyText: {
        marginHorizontal: 10,
        fontWeight: '700',
        fontSize: 14,
    },
    removeBtn: {
        marginTop: 6,
    },

    footer: {
        backgroundColor: '#fff',
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#f3f4f6',
    },
    billRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    billLabel: {
        color: '#6b7280',
        fontSize: 14,
    },
    billValue: {
        fontWeight: '700',
        color: '#111827',
    },
    divider: {
        height: 1,
        backgroundColor: '#f3f4f6',
        marginVertical: 10,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 18,
    },
    totalLabel: {
        fontSize: 18,
        fontWeight: '800',
    },
    totalValue: {
        fontSize: 22,
        fontWeight: '900',
        color: '#10b981',
    },
    creditToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        padding: 12,
        borderRadius: 12,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    toggleCircle: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 2,
        borderColor: '#94a3b8',
        marginRight: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    toggleActive: {
        backgroundColor: '#10b981',
        borderColor: '#10b981',
    },
    creditText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#475569',
    },
    checkoutBtn: {
        height: 56,
        borderRadius: 28,
        overflow: 'hidden',
    },
    gradientBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    checkoutText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '800',
    },

    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#9ca3af',
        marginTop: 16,
    },
    shopNowBtn: {
        marginTop: 20,
        paddingHorizontal: 28,
        paddingVertical: 12,
        backgroundColor: '#10b981',
        borderRadius: 24,
    },
    shopNowText: {
        color: '#fff',
        fontWeight: '800',
    },
});
