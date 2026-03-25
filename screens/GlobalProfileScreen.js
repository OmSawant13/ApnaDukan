import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Dimensions,
    RefreshControl,
    Image
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';

const { width } = Dimensions.get('window');

const GlobalProfileScreen = ({ navigation }) => {
    const { user, logout } = useAuth();
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchGlobalSummary = async () => {
        if (!user?._id) return;
        try {
            const res = await fetch(`${API_URL}/credits/summary/${user._id}`);
            const data = await res.json();
            setSummary(data);
        } catch (err) {
            console.error('Fetch Summary Error:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            fetchGlobalSummary();
        }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchGlobalSummary();
    };

    if (loading && !refreshing) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#FFB800" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar style="dark" />
            <SafeAreaView style={{ flex: 1 }}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#111827" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Profile Insights</Text>
                    <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
                        <Ionicons name="log-out-outline" size={24} color="#ef4444" />
                    </TouchableOpacity>
                </View>

                <ScrollView 
                    contentContainerStyle={styles.scrollContent} 
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFB800" />
                    }
                >
                    {/* User Info Card */}
                    <View style={styles.userCard}>
                        <View style={styles.avatarContainer}>
                            {user?.profilePic ? (
                                <Image source={{ uri: user.profilePic }} style={styles.avatar} />
                            ) : (
                                <View style={styles.placeholderAvatar}>
                                    <Text style={styles.avatarInitial}>{user?.name?.charAt(0) || 'U'}</Text>
                                </View>
                            )}
                            <View style={styles.onlineBadge} />
                        </View>
                        <View style={styles.userDetails}>
                            <Text style={styles.userName}>{user?.name || 'User'}</Text>
                            <Text style={styles.userPhone}>+91 {user?.phone}</Text>
                            <View style={styles.tag}>
                                <Text style={styles.tagText}>CUSTOMER</Text>
                            </View>
                        </View>
                    </View>

                    {/* Balance & Stats Grid */}
                    <View style={styles.statsGrid}>
                        <View style={[styles.statBox, { backgroundColor: '#111827' }]}>
                            <Text style={styles.statLabel}>Total Balance</Text>
                            <Text style={[styles.statValue, { color: '#ef4444' }]}>₹{summary?.totalBalance || 0}</Text>
                            <Text style={styles.statSub}>Across {summary?.accounts?.length || 0} Shops</Text>
                        </View>
                        <View style={[styles.statBox, { backgroundColor: '#FFB800' }]}>
                            <Text style={[styles.statLabel, { color: '#111827' }]}>Avg Order</Text>
                            <Text style={[styles.statValue, { color: '#111827' }]}>₹{summary?.avgOrderValue || 0}</Text>
                            <Text style={[styles.statSub, { color: '#1e293b' }]}>{summary?.totalOrders || 0} Total Orders</Text>
                        </View>
                    </View>

                    {/* Recent Transactions List */}
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Recent Global Activity</Text>
                        <Ionicons name="time-outline" size={20} color="#64748b" />
                    </View>
                    
                    {summary?.recentTransactions?.length > 0 ? (
                        <View style={styles.recentList}>
                            {summary.recentTransactions.map((tx, idx) => (

                                <TouchableOpacity 
                                    key={idx} 
                                    style={styles.transactionRow}
                                    onPress={() => tx.orderId && navigation.navigate('OrderDetails', { orderId: tx.orderId })}
                                    activeOpacity={0.7}
                                    disabled={!tx.orderId}
                                >
                                    <View style={[styles.txIcon, { backgroundColor: tx.type === 'credit' ? '#fef2f2' : '#f0fdf4' }]}>
                                        <Ionicons 
                                            name={tx.type === 'credit' ? 'arrow-up' : 'arrow-down'} 
                                            size={16} 
                                            color={tx.type === 'credit' ? '#ef4444' : '#10b981'} 
                                        />
                                    </View>

                                    <View style={styles.txInfo}>
                                        <Text style={styles.txShop}>{tx.shopName || 'Unknown Shop'}</Text>
                                        <Text style={styles.txDate}>{new Date(tx.date || tx.createdAt).toLocaleDateString()}</Text>
                                    </View>
                                    <View style={{ alignItems: 'flex-end', flexDirection: 'row', gap: 6 }}>
                                        <Text style={[styles.txAmount, { color: tx.type === 'credit' ? '#ef4444' : '#10b981' }]}>
                                            {tx.type === 'credit' ? '+' : '-'}₹{tx.amount}
                                        </Text>
                                        {tx.orderId && <Ionicons name="chevron-forward" size={14} color="#D1D5DB" />}
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    ) : (

                        <View style={styles.emptyActivity}>
                            <Text style={styles.emptyActivityText}>No recent transactions found.</Text>
                        </View>
                    )}

                    {/* Shop-wise Breakdown */}
                    <Text style={styles.sectionTitle}>Shop-wise Udhari</Text>
                    {summary?.accounts?.length > 0 ? (
                        summary.accounts.map((acc, index) => (
                            <View key={index} style={styles.shopAccountCard}>
                                <View style={styles.shopInfo}>
                                    <View style={styles.shopImageContainer}>
                                        {acc.shopImage ? (
                                            <Image source={{ uri: acc.shopImage }} style={styles.shopImage} />
                                        ) : (
                                            <Ionicons name="storefront" size={24} color="#64748b" />
                                        )}
                                    </View>
                                    <View>
                                        <Text style={styles.shopName}>{acc.shopName}</Text>
                                        <Text style={styles.lastUpdate}>
                                            Updated {new Date(acc.lastUpdated).toLocaleDateString()}
                                        </Text>
                                    </View>
                                </View>
                                <View style={styles.balanceInfo}>
                                    <Text style={[
                                        styles.balanceValue, 
                                        acc.balance > 0 ? { color: '#ef4444' } : { color: '#10b981' }
                                    ]}>
                                        ₹{acc.balance}
                                    </Text>
                                    <Text style={styles.balanceLabel}>{acc.balance > 0 ? 'To Pay' : 'Settled'}</Text>
                                </View>
                            </View>
                        ))
                    ) : (
                        <View style={styles.emptyCard}>
                            <Ionicons name="checkmark-circle" size={48} color="#10b981" />
                            <Text style={styles.emptyText}>No pending udhari in any shop!</Text>
                        </View>
                    )}
                </ScrollView>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 40,
        paddingBottom: 20,
        backgroundColor: '#FFFFFF',
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '900',
        color: '#111827',
        letterSpacing: -0.5,
    },
    logoutBtn: {
        padding: 8,
    },
    scrollContent: {
        padding: 20,
    },
    userCard: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 30,
        backgroundColor: '#F9FAFB',
        padding: 22,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    avatarContainer: {
        position: 'relative',
    },
    avatar: {
        width: 75,
        height: 75,
        borderRadius: 20,
        borderWidth: 3,
        borderColor: '#FFB800',
    },
    placeholderAvatar: {
        width: 75,
        height: 75,
        borderRadius: 20,
        backgroundColor: '#111827',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#FFB800',
    },
    avatarInitial: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#FFB800',
    },
    onlineBadge: {
        position: 'absolute',
        bottom: -2,
        right: -2,
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#10B981',
        borderWidth: 3,
        borderColor: '#FFFFFF',
    },
    userDetails: {
        marginLeft: 20,
    },
    userName: {
        fontSize: 26,
        fontWeight: '900',
        color: '#111827',
        marginBottom: 4,
    },
    userPhone: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 10,
    },
    tag: {
        backgroundColor: '#FEF3C7',
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 10,
        alignSelf: 'flex-start',
    },
    tagText: {
        fontSize: 10,
        fontWeight: '900',
        color: '#B45309',
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    statsGrid: {
        flexDirection: 'row',
        gap: 15,
        marginBottom: 20,
    },
    statBox: {
        flex: 1,
        padding: 22,
        borderRadius: 24,
        backgroundColor: '#111827',
    },
    statLabel: {
        fontSize: 12,
        fontWeight: '800',
        color: '#94A3B8',
        letterSpacing: 0.8,
        marginBottom: 10,
        textTransform: 'uppercase',
    },
    statValue: {
        fontSize: 26,
        fontWeight: '900',
        marginBottom: 4,
        color: '#FFB800',
    },
    statSub: {
        fontSize: 11,
        color: '#64748B',
        fontWeight: '700',
    },
    insightCard: {
        backgroundColor: '#F9FAFB',
        borderRadius: 24,
        padding: 22,
        marginBottom: 35,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    insightItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    insightIcon: {
        width: 48,
        height: 48,
        borderRadius: 16,
        backgroundColor: '#FEF3C7',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 18,
    },
    insightLabel: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 4,
        fontWeight: '800',
    },
    insightValue: {
        fontSize: 18,
        fontWeight: '900',
        color: '#111827',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '900',
        color: '#111827',
        marginBottom: 20,
    },
    shopAccountCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFFFFF',
        padding: 20,
        borderRadius: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    shopInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    shopImageContainer: {
        width: 55,
        height: 55,
        borderRadius: 16,
        backgroundColor: '#FEF3C7',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 18,
        overflow: 'hidden',
    },
    shopImage: {
        width: '100%',
        height: '100%',
    },
    shopName: {
        fontSize: 18,
        fontWeight: '900',
        color: '#111827',
        marginBottom: 4,
    },
    lastUpdate: {
        fontSize: 11,
        color: '#6B7280',
        fontWeight: '600',
    },
    balanceInfo: {
        alignItems: 'flex-end',
    },
    balanceValue: {
        fontSize: 22,
        fontWeight: '900',
        color: '#111827',
    },
    balanceLabel: {
        fontSize: 10,
        color: '#94A3B8',
        fontWeight: '800',
        marginTop: 4,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    emptyCard: {
        alignItems: 'center',
        padding: 45,
        backgroundColor: '#F9FAFB',
        borderRadius: 24,
    },
    emptyText: {
        marginTop: 18,
        fontSize: 16,
        color: '#6B7280',
        fontWeight: '900',
    },
    // New Styles
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
        marginTop: 10,
    },
    recentList: {
        backgroundColor: '#F9FAFB',
        borderRadius: 24,
        padding: 16,
        marginBottom: 30,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    transactionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    txIcon: {
        width: 36,
        height: 36,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    txInfo: {
        flex: 1,
    },
    txShop: {
        fontSize: 14,
        fontWeight: '800',
        color: '#111827',
    },
    txDate: {
        fontSize: 11,
        color: '#64748b',
        fontWeight: '600',
    },
    txAmount: {
        fontSize: 16,
        fontWeight: '900',
    },
    emptyActivity: {
        padding: 20,
        alignItems: 'center',
    },
    emptyActivityText: {
        color: '#94a3b8',
        fontSize: 13,
        fontWeight: '600',
    }
});

export default GlobalProfileScreen;
