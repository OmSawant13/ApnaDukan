import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Modal,
    TextInput,
    StatusBar,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const INITIAL_HISTORY = [
    { id: '1', date: '02 Feb', text: 'Milk, Bread', amount: 150, type: 'credit', source: 'manual' },
    { id: '2', date: '01 Feb', text: 'Paid ₹500', amount: 500, type: 'payment', source: 'manual' },
];

export default function ShopkeeperCreditDetailsScreen({ navigation, route }) {
    const { userName } = route.params || { userName: 'Customer' }; // Fallback
    const [history, setHistory] = useState(INITIAL_HISTORY);
    const [balance, setBalance] = useState(850); // Derived from initial history logic if needed, or fixed

    const [showAdd, setShowAdd] = useState(false);
    const [showPay, setShowPay] = useState(false);

    const [desc, setDesc] = useState('');
    const [amount, setAmount] = useState('');

    const formatDate = (date) => {
        return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
    };

    const handleAddCredit = () => {
        if (!amount) return;
        const val = parseFloat(amount);
        if (isNaN(val)) return;

        const newItem = {
            id: Date.now().toString(),
            date: formatDate(new Date()),
            text: desc || 'Manual Credit',
            amount: val,
            type: 'credit',
            source: 'manual',
        };

        setHistory([newItem, ...history]);
        setBalance(prev => prev + val);
        resetForms();
    };

    const handleReceivePayment = () => {
        if (!amount) return;
        const val = parseFloat(amount);
        if (isNaN(val)) return;

        const newItem = {
            id: Date.now().toString(),
            date: formatDate(new Date()),
            text: `Payment Received`,
            amount: val,
            type: 'payment',
            source: 'manual',
        };

        setHistory([newItem, ...history]);
        setBalance(prev => prev - val);
        resetForms();
    };

    const resetForms = () => {
        setDesc('');
        setAmount('');
        setShowAdd(false);
        setShowPay(false);
    };

    const renderItem = ({ item }) => (
        <View style={styles.txnRow}>
            <View style={styles.dateBox}>
                <Text style={styles.date}>{item.date.split(' ')[0]}</Text>
                <Text style={styles.month}>{item.date.split(' ')[1]}</Text>
            </View>

            <View style={{ flex: 1 }}>
                <View style={styles.txnHeader}>
                    <Text style={styles.desc}>{item.text}</Text>
                    {item.source === 'manual' && (
                        <View style={styles.manualTag}>
                            <Text style={styles.manualText}>MANUAL</Text>
                        </View>
                    )}
                </View>

                <Text
                    style={[
                        styles.amount,
                        { color: item.type === 'credit' ? '#EF4444' : '#10B981' },
                    ]}
                >
                    {item.type === 'credit' ? '+' : '-'} ₹{item.amount}
                </Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <StatusBar barStyle="dark-content" />

            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color="#111827" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{userName}</Text>
                </View>

                <TouchableOpacity style={styles.callBtn}>
                    <Ionicons name="call" size={24} color="#fff" />
                </TouchableOpacity>
            </View>

            {/* Balance Card - Premium Dark */}
            <View style={styles.balanceCard}>
                <View>
                    <Text style={styles.balanceLabel}>Total Due</Text>
                    <Text style={styles.balanceValue}>₹{balance}</Text>
                </View>
                <TouchableOpacity style={styles.remindBtn}>
                    <Text style={styles.remindText}>Remind</Text>
                </TouchableOpacity>
            </View>

            {/* History List */}
            <View style={styles.listContainer}>
                <Text style={styles.sectionTitle}>Transaction History</Text>
                <FlatList
                    data={history}
                    keyExtractor={item => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={{ paddingBottom: 100 }}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <Text style={styles.emptyText}>No transactions yet</Text>
                    }
                />
            </View>

            {/* Bottom Action Bar */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.actionBtn, styles.creditBtn]}
                    onPress={() => setShowAdd(true)}
                >
                    <Ionicons name="add-circle-outline" size={20} color="#EF4444" />
                    <Text style={[styles.actionText, { color: '#EF4444' }]}>Give Credit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionBtn, styles.payBtn]}
                    onPress={() => setShowPay(true)}
                >
                    <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                    <Text style={[styles.actionText, { color: '#fff' }]}>Receive Pay</Text>
                </TouchableOpacity>
            </View>

            {/* Add Credit Modal */}
            <Modal transparent visible={showAdd} animationType="slide" onRequestClose={resetForms}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={styles.modalOverlay}
                >
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Add New Credit</Text>
                            <TouchableOpacity onPress={resetForms}>
                                <Ionicons name="close" size={24} color="#6B7280" />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.label}>Items / Description</Text>
                        <TextInput
                            placeholder="e.g. Rice, Oil, Sugar"
                            value={desc}
                            onChangeText={setDesc}
                            style={styles.input}
                            autoFocus
                        />

                        <Text style={styles.label}>Amount (₹)</Text>
                        <TextInput
                            placeholder="0"
                            keyboardType="number-pad"
                            value={amount}
                            onChangeText={setAmount}
                            style={[styles.input, styles.amountInput]}
                        />

                        <TouchableOpacity style={styles.saveBtn} onPress={handleAddCredit}>
                            <Text style={styles.saveText}>Add to Credit</Text>
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </Modal>

            {/* Receive Payment Modal */}
            <Modal transparent visible={showPay} animationType="slide" onRequestClose={resetForms}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={styles.modalOverlay}
                >
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Receive Payment</Text>
                            <TouchableOpacity onPress={resetForms}>
                                <Ionicons name="close" size={24} color="#6B7280" />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.label}>Amount Received (₹)</Text>
                        <TextInput
                            placeholder="0"
                            keyboardType="number-pad"
                            value={amount}
                            onChangeText={setAmount}
                            style={[styles.input, styles.amountInput]}
                            autoFocus
                        />

                        <TouchableOpacity style={[styles.saveBtn, { backgroundColor: '#10B981' }]} onPress={handleReceivePayment}>
                            <Text style={styles.saveText}>Confirm Payment</Text>
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </Modal>

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingTop: 20,
        paddingBottom: 24,
        backgroundColor: '#F9FAFB', // Match container
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    backBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '900',
        color: '#111827',
    },
    callBtn: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: '#10B981',
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 4,
    },

    /* Balance Card */
    balanceCard: {
        margin: 20,
        padding: 24,
        backgroundColor: '#111827', // Dark Premium
        borderRadius: 24,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        shadowColor: '#111827',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    balanceLabel: { fontSize: 13, color: '#9CA3AF', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
    balanceValue: { fontSize: 32, fontWeight: '800', color: '#fff', marginTop: 4 },
    remindBtn: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)'
    },
    remindText: { color: '#fff', fontWeight: '700', fontSize: 13 },

    /* List */
    listContainer: {
        flex: 1,
        backgroundColor: '#fff',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        paddingHorizontal: 24,
        paddingTop: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.03,
        shadowRadius: 10,
        elevation: 0,
    },
    sectionTitle: { fontSize: 18, fontWeight: '800', color: '#111827', marginBottom: 16 },

    txnRow: {
        flexDirection: 'row',
        marginBottom: 20,
        alignItems: 'flex-start'
    },
    dateBox: {
        width: 48,
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        alignItems: 'center',
        paddingVertical: 8,
        marginRight: 16,
    },
    date: { fontWeight: '800', fontSize: 16, color: '#111827' },
    month: { fontSize: 11, color: '#6B7280', fontWeight: '600', textTransform: 'uppercase' },

    txnHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 4, flexWrap: 'wrap' },
    desc: { fontSize: 16, fontWeight: '600', color: '#111827', marginRight: 8 },
    manualTag: {
        backgroundColor: '#F3F4F6',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#E5E7EB'
    },
    manualText: { fontSize: 10, fontWeight: '700', color: '#6B7280' },
    amount: { fontSize: 16, fontWeight: '700' },

    emptyText: { textAlign: 'center', color: '#9CA3AF', marginTop: 40 },

    /* Footer */
    footer: {
        flexDirection: 'row',
        padding: 20,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
        gap: 16
    },
    actionBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 18,
        gap: 8
    },
    creditBtn: {
        backgroundColor: '#FEF2F2',
        borderWidth: 1,
        borderColor: '#FECACA'
    },
    payBtn: {
        backgroundColor: '#111827', // Black for primary
    },
    actionText: { fontWeight: '700', fontSize: 16 },

    /* Modal */
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
        marginBottom: 24,
    },
    modalTitle: { fontSize: 20, fontWeight: '800', color: '#111827' },

    label: { fontSize: 13, fontWeight: '700', color: '#4B5563', marginBottom: 8, textTransform: 'uppercase' },
    input: {
        backgroundColor: '#F9FAFB',
        borderRadius: 16,
        padding: 18,
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#E5E7EB'
    },
    amountInput: { fontSize: 24, fontWeight: '800' },

    saveBtn: {
        backgroundColor: '#EF4444',
        paddingVertical: 18,
        borderRadius: 18,
        alignItems: 'center',
        marginTop: 8
    },
    saveText: { color: '#fff', fontSize: 18, fontWeight: '800' }
});
