import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    StatusBar,
    Modal,
    TextInput,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useCredit } from '../../context/CreditContext';
import { useShopLanguage } from '../../context/LanguageContext';

export default function ShopkeeperCreditScreen({ navigation }) {
    const { customers, addCustomer, addTransaction } = useCredit();
    const { t } = useShopLanguage();
    const [isModalVisible, setModalVisible] = useState(false);
    const [newName, setNewName] = useState('');
    const [newPhone, setNewPhone] = useState('');
    const [newDesc, setNewDesc] = useState('');
    const [newAmount, setNewAmount] = useState('');

    const handleAddUser = async () => {
        if (!newName.trim()) return;

        await addCustomer(newName.trim(), newPhone.trim());

        setNewName('');
        setNewPhone('');
        setNewDesc('');
        setNewAmount('');
        setModalVisible(false);
    };

    // Calculate Totals
    const totalDue = customers.reduce((sum, c) => sum + (c.balance > 0 ? c.balance : 0), 0);

    // Last Date Logic
    const getLastDate = (customer) => {
        if (!customer.transactions || customer.transactions.length === 0) return 'New';
        const lastTx = customer.transactions[customer.transactions.length - 1];
        return new Date(lastTx.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
    };

    const renderUser = ({ item }) => (
        <TouchableOpacity
            style={styles.userCard}
            onPress={() => navigation.navigate('ShopkeeperCreditDetails', { userId: item._id, userName: item.name })}
        >
            <View style={styles.avatar}>
                <Text style={styles.avatarText}>{item.name[0]?.toUpperCase()}</Text>
            </View>
            <View style={styles.userInfo}>
                <Text style={styles.userName}>{item.name}</Text>
                <Text style={styles.lastDate}>Last: {getLastDate(item)}</Text>
            </View>
            <View style={styles.dueInfo}>
                <Text style={styles.dueLabel}>{t('due')}</Text>
                <Text style={styles.dueAmount}>₹{item.balance}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <StatusBar barStyle="dark-content" />

            <View style={styles.header}>
                <Text style={styles.headerTitle}>{t('credit_khata')}</Text>
                <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
                    <Ionicons name="person-add" size={24} color="#111827" />
                </TouchableOpacity>
            </View>

            <View style={styles.summaryCard}>
                <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>{t('total_due')}</Text>
                    <Text style={styles.summaryValue}>₹{totalDue}</Text>
                </View>
            </View>

            <FlatList
                data={customers.filter(c => c.balance > 0 || c.isCreditUser)}
                keyExtractor={(item, index) => (item._id || item.id || index).toString()}
                renderItem={renderUser}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <Text style={styles.emptyText}>No customers. Add one to start.</Text>
                }
            />

            {/* Add Customer Modal */}
            <Modal transparent visible={isModalVisible} animationType="slide" onRequestClose={() => setModalVisible(false)}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={styles.modalOverlay}
                >
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{t('add_customer')}</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#6B7280" />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.label}>{t('customer_name')}</Text>
                        <TextInput
                            placeholder="e.g. Rahul Kumar"
                            value={newName}
                            onChangeText={setNewName}
                            style={styles.input}
                            autoFocus
                        />

                        <Text style={styles.label}>Phone Number (Optional)</Text>
                        <TextInput
                            placeholder="Mobile Number"
                            value={newPhone}
                            onChangeText={setNewPhone}
                            keyboardType="phone-pad"
                            style={styles.input}
                        />

                        <Text style={styles.label}>First Purchase (Optional)</Text>
                        <TextInput
                            placeholder="e.g. Rice, Sugar (Saman)"
                            value={newDesc}
                            onChangeText={setNewDesc}
                            style={styles.input}
                        />

                        <Text style={styles.label}>{t('initial_amount')}</Text>
                        <TextInput
                            placeholder="0"
                            value={newAmount}
                            onChangeText={setNewAmount}
                            keyboardType="number-pad"
                            style={[styles.input, { fontSize: 20, fontWeight: '700' }]}
                        />

                        <TouchableOpacity style={styles.saveBtn} onPress={handleAddUser}>
                            <Text style={styles.saveText}>{t('add_customer')}</Text>
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
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
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 16,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: '#111827',
        letterSpacing: -0.5
    },
    addBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
        justifyContent: 'center',
    },

    // PREMIUM DARK CARD
    summaryCard: {
        flexDirection: 'row',
        marginHorizontal: 20,
        marginBottom: 24,
        padding: 24,
        backgroundColor: '#111827',
        borderRadius: 24,
        shadowColor: '#111827',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
        alignItems: 'center'
    },
    summaryItem: {
        flex: 1,
        alignItems: 'center',
    },
    summaryDivider: {
        width: 1,
        height: '80%',
        backgroundColor: 'rgba(255,255,255,0.15)',
    },
    summaryLabel: {
        fontSize: 12,
        color: '#9CA3AF',
        marginBottom: 8,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 1
    },
    summaryValue: {
        fontSize: 26,
        fontWeight: '800',
        color: '#FFFFFF'
    },

    list: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    userCard: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        fontSize: 22,
        fontWeight: '800',
        color: '#111827',
    },
    userInfo: {
        flex: 1,
        marginLeft: 20,
    },
    userName: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 4,
    },
    lastDate: {
        fontSize: 13,
        color: '#6B7280',
        fontWeight: '500'
    },
    dueInfo: {
        alignItems: 'flex-end',
    },
    dueLabel: {
        fontSize: 11,
        color: '#EF4444',
        marginBottom: 4,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5
    },
    dueAmount: {
        fontSize: 18,
        fontWeight: '800',
        color: '#111827',
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 40,
        color: '#9CA3AF',
        fontSize: 16
    },

    /* Modal Styles */
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
    saveBtn: {
        backgroundColor: '#111827',
        paddingVertical: 18,
        borderRadius: 18,
        alignItems: 'center',
        marginTop: 8
    },
    saveText: { color: '#fff', fontSize: 18, fontWeight: '800' }
});
