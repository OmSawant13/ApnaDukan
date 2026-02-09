import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const DUMMY_ORDERS = [
  { id: '1', customer: 'Raju Bhai', price: 450, time: '10:30 AM', status: 'open', items: 3 },
  { id: '2', customer: 'Priya Sharma', price: 120, time: '11:15 AM', status: 'open', items: 1 },
  { id: '3', customer: 'Amit Kumar', price: 890, time: '09:45 AM', status: 'completed', items: 5 },
  { id: '4', customer: 'Sneha Gupta', price: 340, time: 'Yesterday', status: 'completed', items: 2 },
];

export default function ShopkeeperOrdersScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('open');

  const filteredOrders = DUMMY_ORDERS.filter(
    order => order.status === activeTab
  );

  const renderOrder = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.85}
      style={styles.orderCard}
      onPress={() =>
        navigation.navigate('ShopkeeperOrderDetails', { orderId: item.id })
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
          <Text style={styles.timeText}>{item.time}</Text>
        </View>

        <View style={styles.priceContainer}>
          <Text style={styles.orderPrice}>₹{item.price}</Text>
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

      <View style={styles.orderDetails}>
        <Ionicons name="cube-outline" size={14} color="#6B7280" />
        <Text style={styles.detailText}>{item.items} Items</Text>
      </View>

      {activeTab === 'open' && (
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionBtn} activeOpacity={0.8}>
            <Ionicons name="checkmark-done" size={16} color="#fff" />
            <Text style={styles.actionText}>Mark Packed</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>All Orders</Text>
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
            Open
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
            Completed
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredOrders}
        keyExtractor={item => item.id}
        renderItem={renderOrder}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyText}>
              No {activeTab} orders yet
            </Text>
          </View>
        }
      />
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

  actions: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    alignItems: 'flex-end',
  },

  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#10B981',
    borderRadius: 14,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },

  actionText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
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
});
