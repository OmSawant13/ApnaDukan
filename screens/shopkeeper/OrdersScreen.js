import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useOrders } from '../../context/OrderContext';
import { useCredit } from '../../context/CreditContext';
import { useIsFocused } from '@react-navigation/native';
import { Modal } from 'react-native';
import { useShopLanguage } from '../../context/LanguageContext';

export default function ShopkeeperOrdersScreen({ navigation }) {
  const { orders, fetchOrders, updateOrderStatus, markOrderAsCredit, loading } = useOrders();
  const { customers, addOrderToCredit, isProcessing } = useCredit();
  const { t } = useShopLanguage();
  const [activeTab, setActiveTab] = useState('open');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isCreditModalVisible, setCreditModalVisible] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      fetchOrders();
    }
  }, [isFocused]);

  const onRefresh = () => {
    fetchOrders();
  };

  const filteredOrders = orders.filter(
    order => order.status === activeTab
  );

  const handleMarkPacked = (orderId) => {
    updateOrderStatus(orderId, 'completed');
  };

  const handleOpenCredit = (order) => {
    // ALWAYS skip modal - Use ID or Name for Zero-Click Auto-Onboard
    handleConfirmCredit(order.customerId || null, order);
  };


  const handleConfirmCredit = async (customerId, orderOverride = null) => {
    if (isProcessing) return;

    const orderToUse = orderOverride || selectedOrder;
    if (orderToUse) {
      const success = await addOrderToCredit(customerId, orderToUse._id, orderToUse.totalAmount, orderToUse.customer);
      if (success) {

        setIsSuccess(true);
        setSelectedOrder(orderToUse);
        setCreditModalVisible(true);

        markOrderAsCredit(orderToUse._id);

        setTimeout(() => {
          updateOrderStatus(orderToUse._id, 'completed');
          setCreditModalVisible(false);
          setIsSuccess(false);
          setSelectedOrder(null);
        }, 1500);
      }
    }
  };

  const renderOrder = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.85}
      style={styles.orderCard}
      onPress={() =>
        navigation.navigate('ShopkeeperOrderDetails', { orderId: item._id })
      }
    >
      {/* Accent Line */}
      <View
        style={[
          styles.accent,
          { backgroundColor: item.status === 'open' ? '#10B981' : '#9CA3AF' },
        ]}
      />

      <View style={styles.orderHeader}>
        <View>
          <Text style={styles.customerName}>{item.customer}</Text>
          <Text style={styles.timeText}>{new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
        </View>

        <View style={styles.priceContainer}>
          <Text style={styles.orderPrice}>₹{item.totalAmount}</Text>
          <View style={{ flexDirection: 'row', gap: 4, marginTop: 6, justifyContent: 'flex-end' }}>
            {item.isCredit && (
              <View style={[styles.statusBadge, { backgroundColor: '#DBEAFE' }]}>
                <Text style={[styles.statusText, { color: '#1E40AF' }]}>CREDIT</Text>
              </View>
            )}
            <View
              style={[
                styles.statusBadge,
                item.status === 'open'
                  ? styles.openBadge
                  : styles.completedBadge,
              ]}
            >
              <Text style={styles.statusText}>
                {item.status === 'open' ? 'OPEN' : 'DONE'}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.orderDetails}>
        <Ionicons name="cube-outline" size={14} color="#6B7280" />
        <Text style={styles.detailText}>{item.items.length} {t('items')}</Text>
      </View>

      {activeTab === 'open' && (
        <View style={styles.actions}>
          {!item.isCredit && (isProcessing && selectedOrder?._id === item._id ? null : (
            <TouchableOpacity
              style={styles.creditActionBtn}
              onPress={() => handleOpenCredit(item)}
              disabled={isProcessing}
            >
              <Ionicons name="book-outline" size={18} color="#111827" />
            </TouchableOpacity>
          ))}


          <TouchableOpacity
            style={styles.actionBtn}
            activeOpacity={0.8}
            onPress={() => handleMarkPacked(item._id)}
          >
            <Ionicons name="checkmark-done" size={16} color="#fff" />
            <Text style={styles.actionText}>{t('mark_packed')}</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('all_orders')}</Text>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'open' && styles.activeTab]}
          onPress={() => setActiveTab('open')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'open' && styles.activeTabText,
            ]}
          >
            {t('open')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'completed' && styles.activeTab,
          ]}
          onPress={() => setActiveTab('completed')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'completed' && styles.activeTabText,
            ]}
          >
            {t('completed')}
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredOrders}
        keyExtractor={(item, index) => (item._id || item.id || index).toString()}
        renderItem={renderOrder}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyText}>
              {t('no_orders')}
            </Text>
          </View>
        }
      />

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
                  <Text style={styles.modalTitle}>{t('add_to_credit')}</Text>
                  <TouchableOpacity onPress={() => setCreditModalVisible(false)}>
                    <Ionicons name="close" size={24} color="#6B7280" />
                  </TouchableOpacity>
                </View>
                <Text style={styles.modalSubtitle}>Select customer for Order ₹{selectedOrder?.totalAmount}</Text>

                <FlatList
                  data={customers}
                  keyExtractor={(item, index) => (item._id || item.id || index).toString()}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.customerRow}
                      onPress={() => handleConfirmCredit(item._id)}
                    >
                      <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{item.name[0]?.toUpperCase()}</Text>
                      </View>
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={styles.cName}>{item.name}</Text>
                        <Text style={styles.cUsage}>{t('balance')}: ₹{item.balance}</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                    </TouchableOpacity>
                  )}
                  style={{ maxHeight: 400 }}
                  showsVerticalScrollIndicator={false}
                  ListEmptyComponent={
                    <Text style={styles.emptyModalText}>No customers found. Add one in Credit Tab.</Text>
                  }
                />
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },

  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#111827',
  },

  tabs: {
    flexDirection: 'row',
    padding: 6,
    marginHorizontal: 24,
    marginBottom: 24,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
  },
  activeTab: {
    backgroundColor: '#111827',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#fff',
    fontWeight: '700',
  },

  list: {
    paddingHorizontal: 24,
    paddingBottom: 100,
  },

  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 4,
    overflow: 'hidden',
  },

  accent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },

  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  customerName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  timeText: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },

  priceContainer: {
    alignItems: 'flex-end',
  },
  orderPrice: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },

  statusBadge: {
    marginTop: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  openBadge: {
    backgroundColor: '#D1FAE5',
  },
  completedBadge: {
    backgroundColor: '#E5E7EB',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#065F46',
  },

  orderDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F3F4F6',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },

  detailText: {
    fontSize: 13,
    color: '#4B5563',
    fontWeight: '600',
  },

  emptyContainer: {
    padding: 60,
    alignItems: 'center',
    gap: 12,
  },
  emptyText: {
    color: '#9CA3AF',
    fontSize: 16,
    fontWeight: '600',
  },

  modalOverlay: {
    flex: 1,
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
  modalSubtitle: { fontSize: 14, color: '#6B7280', marginBottom: 20, fontWeight: '500' },

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
  emptyModalText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#9CA3AF',
  },

  actions: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    alignItems: 'center',
  },
  creditActionBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#10B981',
    borderRadius: 12,
  },
  actionText: {
    fontSize: 14,
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
});
