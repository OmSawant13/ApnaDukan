import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { useOrders } from '../../context/OrderContext';
import { useCredit } from '../../context/CreditContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useShopLanguage } from '../../context/LanguageContext';

export default function ShopkeeperOrderDetailsScreen({ route, navigation }) {
    const { orderId } = route.params || {};
    const { orders, updateOrderStatus, markOrderAsCredit } = useOrders();
    const { customers, addOrderToCredit, isProcessing } = useCredit();
    const { t } = useShopLanguage();

    const [isCreditModalVisible, setCreditModalVisible] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const order = orders.find(o => o._id === orderId);

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

    const handleMarkCompleted = () => {
        updateOrderStatus(order._id, 'completed');
        navigation.goBack();
    };

    const handleOpenCredit = () => {
        // ALWAYS skip modal - Use ID or Name for Zero-Click Auto-Onboard
        handleAddToCredit(order.customerId || null, order.customer);
    };

    const handleAddToCredit = async (customerId, customerName = null) => {
        const success = await addOrderToCredit(customerId, order._id, order.totalAmount, customerName);
        if (success) {
            setIsSuccess(true);
            setCreditModalVisible(true); // Still show success animation
            markOrderAsCredit(order._id); // Instant local update
            setTimeout(() => {
                setCreditModalVisible(false);
                setIsSuccess(false);
                updateOrderStatus(order._id, 'completed');
                navigation.goBack();
            }, 1500);
        }
    };


    const renderCustomer = ({ item }) => (
        <TouchableOpacity style={styles.customerRow} onPress={() => handleAddToCredit(item._id)}>
            <View style={styles.avatar}>
                <Text style={styles.avatarText}>{item.name[0]?.toUpperCase()}</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.cName}>{item.name}</Text>
                <Text style={styles.cUsage}>{t('balance')}: ₹{item.balance}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>
    );

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
        <>
            <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color="#111827" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Order #{order._id.slice(-4)}</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView contentContainerStyle={styles.content}>
                    <View style={styles.customerCard}>
                        <Text style={styles.label}>{t('onboard_title_1') === 'Welcome' ? 'Customer' : 'ग्राहक'}</Text>
                        <Text style={styles.customerName}>{order.customer}</Text>
                        <Text style={styles.time}>{new Date(order.createdAt).toLocaleString()}</Text>
                    </View>

                    <View style={styles.itemList}>
                        <Text style={styles.sectionTitle}>{t('items')}</Text>
                        <FlatList
                            data={order.items}
                            keyExtractor={item => item.productId || Math.random().toString()}
                            renderItem={renderItem}
                            scrollEnabled={false}
                        />
                        <View style={styles.divider} />
                        <View style={styles.totalRow}>
                            <Text style={styles.totalLabel}>{t('total')}</Text>
                            <Text style={styles.totalValue}>₹{order.totalAmount}</Text>
                        </View>
                    </View>

                    <View style={styles.noteContainer}>
                        <Text style={styles.noteLabel}>{t('status') || 'Status'}</Text>
                        <Text style={[styles.noteText, { color: order.status === 'open' ? '#059669' : '#4B5563' }]}>
                            {t(order.status)?.toUpperCase() || order.status.toUpperCase()}
                        </Text>
                    </View>
                </ScrollView>

                <View style={styles.footer}>
                    {!order.isCredit && !isProcessing && (
                        <TouchableOpacity 
                            style={styles.creditBtn} 
                            onPress={handleOpenCredit}
                            disabled={isProcessing}
                        >
                            <Ionicons name="book-outline" size={20} color="#111827" />
                            <Text style={styles.creditText}>{t('add_to_credit')}</Text>
                        </TouchableOpacity>
                    )}


                    {order.status === 'open' && (
                        <TouchableOpacity style={styles.finishBtn} onPress={handleMarkCompleted}>
                            <Text style={styles.finishText}>{t('mark_packed')}</Text>
                            <Ionicons name="checkmark-circle" size={20} color="#fff" />
                        </TouchableOpacity>
                    )}
                </View>
            </SafeAreaView>

            {/* Select Customer Modal */}
            <Modal transparent visible={isCreditModalVisible} animationType="slide" onRequestClose={() => setCreditModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        {isSuccess ? (
                            <View style={styles.successContainer}>
                                <View style={styles.successCircle}>
                                    <Ionicons name="checkmark" size={50} color="#fff" />
                                </View>
                                <Text style={styles.successTitle}>{t('added_to_credit')}</Text>
                                <Text style={styles.successSubtitle}>{t('ledger_updated')}</Text>
                            </View>
                        ) : (
                            <>
                                <View style={styles.modalHeader}>
                                    <Text style={styles.modalTitle}>{t('select_language') === 'Select Language' ? 'Select Customer' : 'ग्राहक निवडा'}</Text>
                                    <TouchableOpacity onPress={() => setCreditModalVisible(false)}>
                                        <Ionicons name="close" size={24} color="#6B7280" />
                                    </TouchableOpacity>
                                </View>

                                <FlatList
                                    data={customers}
                                    keyExtractor={item => item._id}
                                    renderItem={renderCustomer}
                                    style={{ maxHeight: 400 }}
                                    showsVerticalScrollIndicator={false}
                                    ListEmptyComponent={
                                        <Text style={styles.emptyText}>No customers found.</Text>
                                    }
                                />
                            </>
                        )}
                    </View>
                </View>
            </Modal>
        </>
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
        backgroundColor: '#fff',
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
    headerTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#111827',
    },
    content: {
        padding: 20,
    },
    customerCard: {
        backgroundColor: '#fff',
        paddingVertical: 10,
        marginBottom: 20,
    },
    label: {
        fontSize: 13,
        color: '#6B7280',
        fontWeight: '600',
        marginBottom: 4,
        textTransform: 'uppercase'
    },
    customerName: {
        fontSize: 22,
        fontWeight: '800',
        color: '#111827',
        letterSpacing: -0.5
    },
    time: {
        fontSize: 15,
        color: '#6B7280',
        marginTop: 4,
        fontWeight: '500'
    },
    itemList: {
        backgroundColor: '#F9FAFB',
        padding: 20,
        borderRadius: 20,
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: '#111827',
        marginBottom: 16,
        textTransform: 'uppercase',
        letterSpacing: 0.5
    },
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    itemInfo: { flex: 1 },
    itemName: {
        fontSize: 16,
        color: '#111827',
        fontWeight: '700',
    },
    itemWeight: {
        fontSize: 13,
        color: '#6B7280',
        fontWeight: '500',
        marginTop: 2
    },
    itemPrice: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
    },
    divider: {
        height: 1,
        backgroundColor: '#E5E7EB',
        marginVertical: 16,
        borderStyle: 'dashed',
        borderWidth: 1,
        borderColor: '#E5E7EB'
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 4
    },
    totalLabel: {
        fontSize: 18,
        fontWeight: '800',
        color: '#111827',
    },
    totalValue: {
        fontSize: 24,
        fontWeight: '900',
        color: '#111827',
    },
    noteContainer: {
        backgroundColor: '#FFFBEB',
        padding: 16,
        borderRadius: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#FDE68A',
    },
    noteLabel: {
        fontSize: 12,
        color: '#B45309',
        fontWeight: '700',
        marginBottom: 4,
        textTransform: 'uppercase'
    },
    noteText: {
        fontSize: 15,
        color: '#92400E',
        fontWeight: '500',
    },
    footer: {
        flexDirection: 'row',
        padding: 20,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#f3f4f6',
        gap: 16,
    },
    creditBtn: {
        flex: 1,
        flexDirection: 'row',
        height: 56,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: '#E5E7EB',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    creditText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
    },
    finishBtn: {
        flex: 1,
        flexDirection: 'row',
        height: 56,
        borderRadius: 16,
        backgroundColor: '#111827',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        shadowColor: '#111827',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4
    },
    finishText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
    },
    successContainer: {
        paddingVertical: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    successCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#10B981',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    successTitle: {
        fontSize: 24,
        fontWeight: '900',
        color: '#111827',
        marginBottom: 8,
    },
    successSubtitle: {
        fontSize: 16,
        color: '#6B7280',
        fontWeight: '600',
    },
    modalOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: 24,
        paddingBottom: 40,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    modalTitle: { fontSize: 22, fontWeight: '900', color: '#111827' },
    customerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        fontSize: 18,
        fontWeight: '800',
        color: '#111827',
    },
    cName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
    },
    cUsage: {
        fontSize: 13,
        color: '#6B7280',
        marginTop: 2,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 20,
        color: '#9CA3AF',
    },
});
