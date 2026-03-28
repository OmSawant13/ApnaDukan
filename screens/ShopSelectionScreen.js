import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    SafeAreaView,
    Dimensions,
    TextInput,
    ScrollView,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useShop } from '../context/ShopContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { API_URL } from '../config';
import LoadingScreen from './LoadingScreen';

const { width } = Dimensions.get('window');

const FILTERS = ['All Shops', 'Open Now', 'Nearby', 'Favorites'];

const ShopSelectionScreen = ({ navigation }) => {
    const { shops, setShop, loading: shopsLoading, fetchShops } = useShop();
    const { user } = useAuth();
    const { t } = useLanguage();
    
    const [activeFilter, setActiveFilter] = useState('All Shops');
    const [searchQuery, setSearchQuery] = useState('');
    const [refreshing, setRefreshing] = useState(false);
    const [summary, setSummary] = useState({ totalBalance: 0, accounts: [] });

    // Fetch real balance summary from backend
    const fetchSummary = async () => {
        if (!user?._id) return;
        try {
            const res = await fetch(`${API_URL}/credits/summary/${user._id}`);
            if (res.ok) {
                const data = await res.json();
                setSummary(data);
            }
        } catch (err) {
            console.error('Home Summary Fetch Error:', err);
        }
    };

    // Refresh when screen comes into focus
    useFocusEffect(
        React.useCallback(() => {
            fetchSummary();
            fetchShops(); // Ensure we have latest shop statuses (Online/Offline)
        }, [])
    );

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchSummary();
        setRefreshing(false);
    };

    const customerName = user?.name || 'User';
    const totalBalance = summary.totalBalance || 0;

    // Filter Logic
    const filteredShops = shops.filter(shop => {
        const matchesSearch = shop.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             shop.address?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch;
    });

    const getStatusBadge = (item) => {
        // Replace with your actual status logic
        const statuses = ['open', 'busy', 'open'];
        const idx = shops.indexOf(item) % statuses.length;
        return statuses[idx];
    };

    const renderShopItem = ({ item, index }) => {
        // Find balance from summary accounts
        const account = summary.accounts?.find(acc => acc.shopId === item._id || acc.shopName === item.name);
        const balance = account?.balance || 0;

        const status = item.status || 'open';
        const badgeConfig = {
            open:   { color: '#16a34a', bg: '#f0fdf4', border: '#dcfce7', label: 'Open' },
            busy:   { color: '#d97706', bg: '#fffbeb', border: '#fef3c7', label: 'Busy' },
            closed: { color: '#dc2626', bg: '#fef2f2', border: '#fee2e2', label: 'Closed' },
        };
        const badge = badgeConfig[status] || badgeConfig.open;

        return (
            <TouchableOpacity 
                key={item._id}
                style={styles.shopCard}
                onPress={() => {
                    setShop(item);
                    navigation.navigate('App');
                }}
                activeOpacity={0.8}
            >
                <View style={styles.imageContainer}>
                    {item.image ? (
                        <Image source={{ uri: item.image }} style={{ width: '100%', height: '100%', borderRadius: 16 }} />
                    ) : (
                        <Text style={styles.initialText}>{item.name?.[0] || 'S'}</Text>
                    )}
                </View>
                
                <View style={styles.shopInfo}>
                    <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'flex-start'}}>
                        <Text style={styles.shopName} numberOfLines={1}>{item.name}</Text>
                        <Text style={styles.shopDue}>₹{balance}</Text>
                    </View>
                    <Text style={styles.shopAddress} numberOfLines={1}>{item.address || 'Local Area'}</Text>
                    
                    <View style={styles.cardFooter}>
                        <View style={[styles.badge, { backgroundColor: badge.bg, borderColor: badge.border }]}>
                            <Text style={[styles.badgeText, { color: badge.color }]}>{badge.label}</Text>
                        </View>
                        <TouchableOpacity style={styles.payBtn}>
                            <Text style={styles.payBtnText}>{item.balance > 0 ? 'Pay' : 'View'}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="dark" />
            
            {/* ── Header ────────────────────────────────────────── */}
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <View>
                        <Text style={styles.brandName}>Apna Dukan</Text>
                        <Text style={styles.greeting}>Namaste, {customerName}!</Text>
                    </View>
                    <TouchableOpacity 
                        style={styles.avatarBtn} 
                        onPress={() => navigation.navigate('GlobalProfile')}
                    >
                        <Ionicons name="person-outline" size={24} color="#111827" />
                        <View style={styles.notifBadge} />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 40 }}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFB800" />
                }
            >
                {/* ── Navy Hero Card ───────────────────────────────── */}
                <View style={styles.heroWrapper}>
                    <View style={styles.heroCard}>
                        <Text style={styles.heroLabel}>My Credit Balance</Text>
                        <Text style={styles.heroBalance}>₹{totalBalance}</Text>
                        <Text style={styles.heroSub}>Total Kirana Credit</Text>
                        <View style={styles.heroDivider} />
                        <View style={styles.heroFooter}>
                            <Text style={styles.heroFooterText}>Recent Activity</Text>
                            <Ionicons name="chevron-forward" size={14} color="#FFB800" />
                        </View>
                    </View>
                </View>

                {/* ── Search Bar ───────────────────────────────────── */}
                <View style={styles.searchWrapper}>
                    <View style={styles.searchBar}>
                        <Ionicons name="search" size={20} color="#94A3B8" />
                        <TextInput
                            placeholder="Search shops or owners..."
                            placeholderTextColor="#94A3B8"
                            style={styles.searchInput}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery('')}>
                                <Ionicons name="close-circle" size={20} color="#94A3B8" />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* ── List Section ──────────────────────────────────── */}
                <View style={styles.listSection}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionLabel}>Weekly Shop List</Text>
                        <TouchableOpacity><Text style={styles.viewMore}>Categories</Text></TouchableOpacity>
                    </View>

                    <View style={styles.listContent}>
                        {shopsLoading && !refreshing ? (
                            <LoadingScreen />
                        ) : filteredShops.length > 0 ? (
                            filteredShops.map((item, index) => renderShopItem({ item, index }))
                        ) : (
                            <View style={styles.center}>
                                <Text style={{ color: '#94A3B8', fontWeight: '700' }}>No shops found</Text>
                            </View>
                        )}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF', // Clean White
    },

    // ── Header ─────────────────────────────────────────────
    header: {
        paddingHorizontal: 20,
        paddingTop: 50, // Back to original
        paddingBottom: 20,
        backgroundColor: '#FFFFFF',
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    brandName: {
        fontSize: 28, // Thoda kam kiya focus balance karne ke liye
        fontWeight: '900',
        color: '#111827',
        letterSpacing: -1,
    },
    greeting: {
        fontSize: 18, // Thoda bada kiya wapas taaki readable rahe
        color: '#4B5563', // Thoda dark grey taaki brand se contrast rahe
        fontWeight: '700',
        marginTop: 4, 
    },
    avatarBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    notifBadge: {
        position: 'absolute',
        top: 10,
        right: 12,
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#EF4444',
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },

    // ── Navy Hero Card ─────────────────────────────────────
    heroWrapper: {
        paddingHorizontal: 20,
        marginTop: 10, // Back to original
    },
    heroCard: {
        backgroundColor: '#111827', // Deep Navy
        borderRadius: 24,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 10,
    },
    heroLabel: {
        fontSize: 14,
        fontWeight: '700',
        color: '#94A3B8',
        marginBottom: 8,
    },
    heroBalance: {
        fontSize: 34,
        fontWeight: '900',
        color: '#FFB800', // Haldi Yellow
        letterSpacing: -1,
    },
    heroSub: {
        fontSize: 12,
        color: '#64748B',
        marginTop: 4,
        fontWeight: '600',
    },
    heroDivider: {
        height: 1,
        backgroundColor: '#1F2937',
        marginVertical: 20,
    },
    heroFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    heroFooterText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#FFFFFF',
    },

    // ── Search Bar ─────────────────────────────────────────
    searchWrapper: {
        paddingHorizontal: 20,
        marginTop: 25,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: '#F9FAFB',
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
    },

    // ── List Section ───────────────────────────────────────
    listSection: {
        marginTop: 35,
        paddingHorizontal: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: 20,
    },
    sectionLabel: {
        fontSize: 18,
        fontWeight: '900',
        color: '#111827',
    },
    viewMore: {
        fontSize: 13,
        fontWeight: '700',
        color: '#FFB800',
    },
    listContent: {
        gap: 16,
    },
    shopCard: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 16,
        alignItems: 'center',
        gap: 16,
        borderWidth: 1,
        borderColor: '#F3F4F6',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.02,
        shadowRadius: 10,
        elevation: 2,
    },
    imageContainer: {
        width: 56,
        height: 56,
        borderRadius: 16,
        backgroundColor: '#FEF3C7', // Soft Yellow
        justifyContent: 'center',
        alignItems: 'center',
    },
    initialText: {
        fontSize: 22,
        fontWeight: '900',
        color: '#FFB800',
    },
    shopInfo: {
        flex: 1,
    },
    shopName: {
        fontSize: 16,
        fontWeight: '900',
        color: '#111827',
    },
    shopDue: {
        fontSize: 16,
        fontWeight: '900',
        color: '#111827',
    },
    shopAddress: {
        fontSize: 12,
        color: '#6B7280',
        fontWeight: '600',
        marginTop: 2,
        marginBottom: 10,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    badge: {
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 8,
        borderWidth: 1,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: '900',
    },
    payBtn: {
        backgroundColor: '#FFB800',
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 10,
    },
    payBtnText: {
        fontSize: 12,
        fontWeight: '900',
        color: '#111827',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
    },
});

export default ShopSelectionScreen; 