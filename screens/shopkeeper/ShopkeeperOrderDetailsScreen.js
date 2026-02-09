import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const ORDER_ITEMS = [
    { id: '1', name: 'Toor Dal', weight: '1 kg', price: 140, quantity: 1 },
    { id: '2', name: 'Brown Bread', weight: '400 gm', price: 40, quantity: 2 },
    { id: '3', name: 'Amul Butter', weight: '100 gm', price: 56, quantity: 1 },
];

export default function ShopkeeperOrderDetailsScreen({ route, navigation }) {
    // const { orderId } = route.params || {}; 
    const orderTotal = 276;

    const renderItem = ({ item }) => (
        <View style={styles.itemRow}>
            <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemWeight}>{item.subtitle || item.weight} x {item.quantity}</Text>
            </View>
            <Text style={styles.itemPrice}>₹{item.price * item.quantity}</Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#111827" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Order #101</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.customerCard}>
                    <Text style={styles.label}>Customer</Text>
                    <Text style={styles.customerName}>Raju Bhai</Text>
                    <Text style={styles.time}>Today, 10:30 AM</Text>
                </View>

                <View style={styles.itemList}>
                    <Text style={styles.sectionTitle}>Items</Text>
                    <FlatList
                        data={ORDER_ITEMS}
                        keyExtractor={item => item.id}
                        renderItem={renderItem}
                        scrollEnabled={false}
                    />
                    <View style={styles.divider} />
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Total Amount</Text>
                        <Text style={styles.totalValue}>₹{orderTotal}</Text>
                    </View>
                </View>

                <View style={styles.noteContainer}>
                    <Text style={styles.noteLabel}>Note</Text>
                    <Text style={styles.noteText}>"Please pack in separate bags."</Text>
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity style={styles.creditBtn} onPress={() => navigation.navigate('ShopkeeperCreditDetails')}>
                    <Ionicons name="book-outline" size={20} color="#111827" />
                    <Text style={styles.creditText}>Add to Credit</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.finishBtn} onPress={() => navigation.goBack()}>
                    <Text style={styles.finishText}>Mark Completed</Text>
                    <Ionicons name="checkmark-circle" size={20} color="#fff" />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff', // Unified white bg
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
        // Removed border, just layout
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
        backgroundColor: '#F9FAFB', // Light gray block for items
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
        borderColor: '#E5E7EB' // Dashed line effect simulation or just line
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
        color: '#111827', // Black total
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
        backgroundColor: '#111827', // Black
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
});
