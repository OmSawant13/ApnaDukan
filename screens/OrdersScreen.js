import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    FlatList,
    TouchableOpacity,
    RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useOrders } from '../context/OrderContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useFocusEffect } from '@react-navigation/native';

const STATUS_CONFIG = {
    open: {
        label: 'Open',
        icon: 'time-outline',
        colors: ['#FEF3C7', '#FDE68A'],
        textColor: '#92400E',
        dotColor: '#F59E0B',
    },
    packed: {
        label: 'Packed',
        icon: 'cube-outline',
        colors: ['#DBEAFE', '#BFDBFE'],
        textColor: '#1E40AF',
        dotColor: '#3B82F6',
    },
    closed: {
        label: 'Delivered',
        icon: 'checkmark-circle-outline',
        colors: ['#D1FAE5', '#A7F3D0'],
        textColor: '#065F46',
        dotColor: '#10B981',
    },
};

export default function OrdersScreen({ navigation }) {
    const { orders, fetchOrders, loading } = useOrders();
    const { user } = useAuth();
    const { t } = useLanguage();

    const fetchMyOrders = () => {
        if (user?._id) {
            fetchOrders(null, user._id);
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            fetchMyOrders();
        }, [])
    );

    const renderOrderItem = ({ item, index }) => {
        const date = new Date(item.createdAt).toLocaleDateString('en-IN', {
            day: 'numeric', month: 'short', year: 'numeric'
        });
        const time = new Date(item.createdAt).toLocaleTimeString([], {
            hour: '2-digit', minute: '2-digit'
        });

        const status = STATUS_CONFIG[item.status] || STATUS_CONFIG.open;

        return (
            <TouchableOpacity
                style={styles.orderCard}
                onPress={() => navigation.navigate('OrderDetails', { orderId: item._id })}
                activeOpacity={0.75}
            >
                {/* Top Row: ID + Status */}
                <View style={styles.cardTop}>
                    <View style={styles.orderIdRow}>
                        <View style={styles.orderIconBox}>
                            <Ionicons name="receipt-outline" size={16} color="#10b981" />
                        </View>
                        <View>
                            <Text style={styles.orderId}>
                                #{item._id.slice(-6).toUpperCase()}
                            </Text>
                            <Text style={styles.orderDate}>{date}  •  {time}</Text>
                        </View>
                    </View>

                    <LinearGradient
                        colors={status.colors}
                        style={styles.statusBadge}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <View style={[styles.statusDot, { backgroundColor: status.dotColor }]} />
                        <Text style={[styles.statusText, { color: status.textColor }]}>
                            {t(item.status)?.toUpperCase() || item.status.toUpperCase()}
                        </Text>
                    </LinearGradient>
                </View>

                {/* Dashed Divider */}
                <View style={styles.dashedDivider} />

                {/* Middle: Items + Amount */}
                <View style={styles.cardMiddle}>
                    <View style={styles.itemsInfo}>
                        <Ionicons name="bag-outline" size={15} color="#94a3b8" />
                        <Text style={styles.itemCount}>
                            {item.items.length} {t('items')}
                        </Text>
                    </View>
                    <Text style={styles.totalAmount}>₹{item.totalAmount}</Text>
                </View>

                {/* Bottom: Payment + Arrow */}
                <View style={styles.cardBottom}>
                    <View style={[
                        styles.paymentChip,
                        item.isCredit ? styles.chipCredit : styles.chipCash
                    ]}>
                        <Ionicons
                            name={item.isCredit ? 'book-outline' : 'cash-outline'}
                            size={12}
                            color={item.isCredit ? '#7C3AED' : '#059669'}
                        />
                        <Text style={[
                            styles.paymentText,
                            { color: item.isCredit ? '#7C3AED' : '#059669' }
                        ]}>
                            {item.isCredit ? 'Udhari' : 'Cash Paid'}
                        </Text>
                    </View>

                    <View style={styles.viewDetailsRow}>
                        <Text style={styles.viewDetailsText}>View Details</Text>
                        <Ionicons name="chevron-forward" size={14} color="#10b981" />
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar style="dark" />
            <SafeAreaView style={{ flex: 1 }}>

                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.headerSubtitle}>Your</Text>
                        <Text style={styles.headerTitle}>{t('my_orders')}</Text>
                    </View>
                    {orders.length > 0 && (
                        <View style={styles.orderCountBadge}>
                            <Text style={styles.orderCountText}>{orders.length}</Text>
                        </View>
                    )}
                </View>

                <FlatList
                    data={orders}
                    keyExtractor={(item) => item._id}
                    renderItem={renderOrderItem}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={loading}
                            onRefresh={fetchMyOrders}
                            tintColor="#10b981"
                            colors={['#10b981']}
                        />
                    }
                    ListEmptyComponent={
                        !loading && (
                            <View style={styles.emptyContainer}>
                                <View style={styles.emptyIconBox}>
                                    <Ionicons name="receipt-outline" size={40} color="#10b981" />
                                </View>
                                <Text style={styles.emptyTitle}>{t('no_orders')}</Text>
                                <Text style={styles.emptySubtitle}>
                                    Abhi tak koi order nahi hai
                                </Text>
                            </View>
                        )
                    }
                />
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },

    // Header
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        paddingHorizontal: 24,
        paddingTop: 40,
        paddingBottom: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    headerSubtitle: {
        fontSize: 12,
        fontWeight: '800',
        color: '#94a3b8',
        letterSpacing: 1.5,
        textTransform: 'uppercase',
        marginBottom: 2,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '900',
        color: '#0f172a',
        letterSpacing: -0.8,
    },
    orderCountBadge: {
        backgroundColor: '#ecfdf5',
        borderRadius: 14,
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderWidth: 1,
        borderColor: '#a7f3d0',
    },
    orderCountText: {
        fontSize: 14,
        fontWeight: '800',
        color: '#059669',
    },

    listContent: {
        padding: 20,
        paddingBottom: 120,
        gap: 16,
    },

    // Card
    orderCard: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 16,
        borderWidth: 1,
        borderColor: '#f1f5f9',
        // Advanced Layered Shadow
        shadowColor: '#64748b',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 4,
    },
    cardTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    orderIdRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    orderIconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#f1f5f9',
        alignItems: 'center',
        justifyContent: 'center',
    },
    orderId: {
        fontSize: 16,
        fontWeight: '800',
        color: '#0f172a',
        letterSpacing: 0.5,
    },
    orderDate: {
        fontSize: 11,
        color: '#94a3b8',
        fontWeight: '600',
        marginTop: 2,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: 12,
    },
    statusDot: {
        width: 7,
        height: 7,
        borderRadius: 3.5,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '800',
        letterSpacing: 1,
    },

    // Dashed Divider
    dashedDivider: {
        height: 1,
        borderStyle: 'dashed',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        marginBottom: 16,
        opacity: 0.8,
    },

    // Middle
    cardMiddle: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        paddingHorizontal: 4,
    },
    itemsInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    itemCount: {
        fontSize: 14,
        color: '#64748b',
        fontWeight: '700',
    },
    totalAmount: {
        fontSize: 24,
        fontWeight: '900',
        color: '#0f172a',
        letterSpacing: -0.8,
    },

    // Bottom
    cardBottom: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 14,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
    },
    paymentChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
    },
    chipCash: {
        backgroundColor: '#f0fdf4',
    },
    chipCredit: {
        backgroundColor: '#f5f3ff',
    },
    paymentText: {
        fontSize: 12,
        fontWeight: '800',
        letterSpacing: 0.3,
    },
    viewDetailsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    viewDetailsText: {
        fontSize: 14,
        fontWeight: '800',
        color: '#10b981',
    },

    // Empty
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 100,
        gap: 16,
    },
    emptyIconBox: {
        width: 90,
        height: 90,
        borderRadius: 30,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#f1f5f9',
        shadowColor: '#64748b',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 5,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '900',
        color: '#334155',
        letterSpacing: -0.5,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#94a3b8',
        fontWeight: '600',
        textAlign: 'center',
    },
});