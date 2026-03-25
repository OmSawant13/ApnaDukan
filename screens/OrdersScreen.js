import React, { useEffect } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    SafeAreaView, 
    FlatList, 
    TouchableOpacity, 
    ActivityIndicator,
    RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useOrders } from '../context/OrderContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useFocusEffect } from '@react-navigation/native';

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

    const renderOrderItem = ({ item }) => {
        const date = new Date(item.createdAt).toLocaleDateString();
        const time = new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        return (
            <View style={styles.orderCard}>
                <View style={styles.orderHeader}>
                    <View>
                        <Text style={styles.orderId}>Order #{item._id.slice(-6).toUpperCase()}</Text>
                        <Text style={styles.orderDate}>{date} • {time}</Text>
                    </View>
                    <View style={[
                        styles.statusBadge, 
                        item.status === 'open' ? styles.statusOpen : 
                        item.status === 'packed' ? styles.statusPacked : styles.statusClosed
                    ]}>
                        <Text style={[
                            styles.statusText, 
                            item.status === 'open' ? styles.textOpen : 
                            item.status === 'packed' ? styles.textPacked : styles.textClosed
                        ]}>
                            {t(item.status)?.toUpperCase() || item.status.toUpperCase()}
                        </Text>
                    </View>

                </View>

                <View style={styles.divider} />

                <View style={styles.orderBody}>
                    <Text style={styles.itemCount}>{item.items.length} {t('items')}</Text>
                    <Text style={styles.totalAmount}>₹{item.totalAmount}</Text>
                </View>

                <View style={styles.orderFooter}>
                    <View style={styles.paymentMethod}>
                        <Ionicons name={item.isCredit ? "book-outline" : "cash-outline"} size={14} color="#64748b" />
                        <Text style={styles.paymentText}>{item.isCredit ? 'Pay Later (Udhari)' : 'Paid Cash'}</Text>
                    </View>
                    <TouchableOpacity 
                        style={styles.detailsBtn} 
                        onPress={() => navigation.navigate('OrderDetails', { orderId: item._id })}
                    >
                        <Text style={styles.detailsText}>View Details</Text>
                    </TouchableOpacity>

                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar style="dark" />
            <SafeAreaView style={{ flex: 1 }}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>{t('my_orders')}</Text>
                </View>

                <FlatList
                    data={orders}
                    keyExtractor={(item) => item._id}
                    renderItem={renderOrderItem}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl refreshing={loading} onRefresh={fetchMyOrders} tintColor="#FFB800" />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="receipt-outline" size={80} color="#f1f5f9" />
                            <Text style={styles.emptyText}>{t('no_orders')}</Text>
                        </View>
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
    header: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '900',
        color: '#111827',
    },
    listContent: {
        padding: 20,
        paddingBottom: 100,
    },
    orderCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#f1f5f9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.02,
        shadowRadius: 10,
        elevation: 2,
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    orderId: {
        fontSize: 15,
        fontWeight: '800',
        color: '#111827',
    },
    orderDate: {
        fontSize: 12,
        color: '#64748b',
        marginTop: 2,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    statusOpen: {
        backgroundColor: '#FFFBEB',
    },
    statusPacked: {
        backgroundColor: '#E0F2FE',
    },
    statusClosed: {
        backgroundColor: '#F0FDF4',
    },
    statusText: {
        fontSize: 10,
        fontWeight: '900',
        textTransform: 'uppercase',
    },
    textOpen: {
        color: '#D97706',
    },
    textPacked: {
        color: '#0284C7',
    },
    textClosed: {
        color: '#16A34A',
    },
    divider: {
        height: 1,
        backgroundColor: '#f1f5f9',
        marginBottom: 12,
    },
    orderBody: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    itemCount: {
        fontSize: 14,
        color: '#475569',
        fontWeight: '600',
    },
    totalAmount: {
        fontSize: 18,
        fontWeight: '900',
        color: '#111827',
    },
    orderFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#f8fafc',
    },
    paymentMethod: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    paymentText: {
        fontSize: 12,
        color: '#64748b',
        fontWeight: '600',
    },
    detailsBtn: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: '#f1f5f9',
        borderRadius: 8,
    },
    detailsText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#475569',
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 100,
    },
    emptyText: {
        fontSize: 16,
        color: '#94a3b8',
        fontWeight: '700',
        marginTop: 16,
    },
});
