import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { useOrders } from '../context/OrderContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../context/LanguageContext';

export default function OrderDetailsScreen({ route, navigation }) {
    const { orderId } = route.params || {};
    const { orders } = useOrders();
    const { t } = useLanguage();

    const [order, setOrder] = React.useState(orders.find(o => o._id === orderId));
    const [loading, setLoading] = React.useState(!order);

    React.useEffect(() => {
        if (!order && orderId) {
            fetchOrder();
        }
    }, [orderId]);

    const fetchOrder = async () => {
        try {
            const { API_URL } = require('../config');
            const res = await fetch(`${API_URL}/orders/${orderId}`);
            const data = await res.json();
            setOrder(data);
        } catch (err) {
            console.error('Fetch Order Error:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color="#111827" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{t('loading') || 'Loading...'}</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (!order) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color="#111827" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Order Not Found</Text>
                </View>
            </SafeAreaView>
        );
    }


    const renderItem = ({ item }) => (
        <View style={styles.itemRow}>
            <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemWeight}>
                    {item.weight ? `${item.weight}${item.weightUnit}` : `${t(item.unit) || item.unit} x ${item.quantity}`}
                </Text>
            </View>
            <Text style={styles.itemPrice}>₹{item.price * (item.quantity || 1)}</Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#111827" />
                </TouchableOpacity>
                <View style={styles.headerTextContainer}>
                    <Text style={styles.headerTitle}>Order Receipt</Text>
                    <Text style={styles.orderId}>#{order._id.slice(-6).toUpperCase()}</Text>
                </View>
                <TouchableOpacity style={styles.shareBtn}>
                    <Ionicons name="share-outline" size={22} color="#111827" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.statusSection}>
                    <View style={[styles.statusBadge, order.status === 'open' ? styles.statusOpen : styles.statusClosed]}>
                        <Text style={[styles.statusText, order.status === 'open' ? styles.textOpen : styles.textClosed]}>
                            {order.status === 'open' ? 'Active / Processing' : 'Completed / Delivered'}
                        </Text>
                    </View>
                    <Text style={styles.time}>{new Date(order.createdAt).toLocaleString()}</Text>
                </View>

                <View style={styles.itemList}>
                    <Text style={styles.sectionTitle}>{t('items')}</Text>
                    <FlatList
                        data={order.items}
                        keyExtractor={(item, index) => (item.productId || index).toString()}
                        renderItem={renderItem}
                        scrollEnabled={false}
                    />
                    
                    <View style={styles.divider} />
                    
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Subtotal</Text>
                        <Text style={styles.summaryValue}>₹{order.totalAmount}</Text>
                    </View>
                    <View style={[styles.summaryRow, { marginTop: 8 }]}>
                        <Text style={styles.totalLabel}>Grand Total</Text>
                        <Text style={styles.totalValue}>₹{order.totalAmount}</Text>
                    </View>
                </View>

                <View style={styles.paymentCard}>
                    <View style={styles.paymentInfo}>
                        <View style={styles.paymentIcon}>
                            <Ionicons name={order.isCredit ? "book" : "cash"} size={20} color="#111827" />
                        </View>
                        <View>
                            <Text style={styles.paymentLabel}>Payment Method</Text>
                            <Text style={styles.paymentMethod}>{order.isCredit ? 'Added to Khata (Pay Later)' : 'Paid with Cash'}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.shopCard}>
                    <Text style={styles.label}>Purchased From</Text>
                    <Text style={styles.shopName}>{order.shopName || 'Jai Malhar Store'}</Text>
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity style={styles.supportBtn}>
                    <Ionicons name="help-circle-outline" size={20} color="#111827" />
                    <Text style={styles.supportText}>Need Help?</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

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
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTextContainer: {
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '900',
        color: '#111827',
    },
    orderId: {
        fontSize: 12,
        color: '#6B7280',
        fontWeight: '700',
        marginTop: 2,
    },
    shareBtn: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        padding: 24,
    },
    statusSection: {
        alignItems: 'center',
        marginBottom: 32,
    },
    statusBadge: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
        marginBottom: 10,
    },
    statusOpen: {
        backgroundColor: '#FEF3C7',
    },
    statusClosed: {
        backgroundColor: '#D1FAE5',
    },
    statusText: {
        fontSize: 12,
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    textOpen: { color: '#B45309' },
    textClosed: { color: '#065F46' },
    time: {
        fontSize: 14,
        color: '#6B7280',
        fontWeight: '600',
    },
    itemList: {
        backgroundColor: '#F9FAFB',
        padding: 24,
        borderRadius: 24,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '900',
        color: '#111827',
        marginBottom: 20,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 18,
    },
    itemInfo: { flex: 1 },
    itemName: {
        fontSize: 16,
        color: '#111827',
        fontWeight: '700',
    },
    itemWeight: {
        fontSize: 12,
        color: '#6B7280',
        fontWeight: '600',
        marginTop: 2
    },
    itemPrice: {
        fontSize: 16,
        fontWeight: '800',
        color: '#111827',
    },
    divider: {
        height: 1,
        backgroundColor: '#E5E7EB',
        marginVertical: 20,
        borderStyle: 'dashed',
        borderWidth: 1,
        borderColor: '#E5E7EB'
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    summaryLabel: {
        fontSize: 14,
        color: '#6B7280',
        fontWeight: '600',
    },
    summaryValue: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
    },
    totalLabel: {
        fontSize: 20,
        fontWeight: '900',
        color: '#111827',
    },
    totalValue: {
        fontSize: 26,
        fontWeight: '900',
        color: '#111827',
    },
    paymentCard: {
        backgroundColor: '#F9FAFB',
        padding: 20,
        borderRadius: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    paymentInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    paymentIcon: {
        width: 48,
        height: 48,
        borderRadius: 14,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 1,
    },
    paymentLabel: {
        fontSize: 12,
        color: '#6B7280',
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    paymentMethod: {
        fontSize: 15,
        color: '#111827',
        fontWeight: '800',
        marginTop: 2,
    },
    shopCard: {
        padding: 4,
        alignItems: 'center',
    },
    label: {
        fontSize: 11,
        color: '#9CA3AF',
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 4,
    },
    shopName: {
        fontSize: 16,
        fontWeight: '800',
        color: '#4B5563',
    },
    footer: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#f3f4f6',
        alignItems: 'center',
    },
    supportBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 20,
        paddingVertical: 12,
        backgroundColor: '#F3F4F6',
        borderRadius: 16,
    },
    supportText: {
        fontSize: 14,
        fontWeight: '800',
        color: '#111827',
    },
});
