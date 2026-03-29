import React, { useEffect, useState } from 'react';
import {
    View, Text, StyleSheet, StatusBar,
    TouchableOpacity, ScrollView, Alert, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { useOrders } from '../../context/OrderContext';
import { useLanguage, useShopLanguage } from '../../context/LanguageContext';
import { useShop } from '../../context/ShopContext';

export default function ShopkeeperProfileScreen({ navigation }) {
    const { user, logout } = useAuth();
    const { orders, fetchOrders } = useOrders();
    const { t, changeLanguage, currentLanguage } = useShopLanguage();
    const { selectedShop, updateShopStatus } = useShop();
    const [isDeleting, setIsDeleting] = useState(false);

    // Fetch orders on mount to get latest stats
    useEffect(() => {
        fetchOrders();
    }, []);

    const handleLogout = () => {
        Alert.alert(t('logout'), 'Are you sure you want to log out?', [
            { text: 'Cancel', style: 'cancel' },
            { text: t('logout'), style: 'destructive', onPress: logout },
        ]);
    };

    const handleDeleteAccount = () => {
        Alert.alert(
            t('delete_account'),
            t('delete_account_confirm'),
            [
                { text: 'Cancel', style: 'cancel' },
                {
        text: t('delete_account'),
        style: 'destructive',
        onPress: async () => {
            try {
                setIsDeleting(true);
                const { API_URL } = require('../../config');
                const response = await fetch(`${API_URL}/customers/${user._id}`, {
                    method: 'DELETE',
                });

                if (response.ok) {
                    Alert.alert('Success', 'Your account and all associated data have been deleted.');
                    logout(); // Log out and redirect
                } else {
                    const data = await response.json();
                    Alert.alert('Error', data.error || 'Failed to delete account.');
                }
            } catch (err) {
                console.error('Delete Account Error:', err);
                Alert.alert('Error', 'Network error. Could not delete account.');
            } finally {
                setIsDeleting(false);
            }
        }
    },
]);
};

    // Calculate Shop Statistics
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const pendingOrders = orders.filter(o => o.status === 'pending').length;

    const MENU_ITEMS = [
        { icon: 'storefront-outline', label: t('store_settings'), color: '#16a34a', bg: '#dcfce7' },
        { icon: 'notifications-outline', label: t('notifications'), color: '#f59e0b', bg: '#fffbeb' },
        { icon: 'help-circle-outline', label: t('support_faq'), color: '#0ea5e9', bg: '#e0f2fe' },
    ];

    const initials = user?.name
        ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : 'SK';

    const LANGUAGES = [
        { id: 'en', label: 'English', sub: 'Default' },
        { id: 'hi', label: 'हिन्दी', sub: 'Hindi' },
        { id: 'mr', label: 'मराठी', sub: 'Marathi' },
        { id: 'hg', label: 'Hinglish', sub: 'Hindi + English' },
    ];

    return (
        <View style={styles.root}>
            <StatusBar barStyle="light-content" backgroundColor="#166534" />

            {/* ── SHOPKEEPER HEADER ── */}
            <View style={styles.topHeader}>
                <SafeAreaView edges={['top']}>
                    <View style={styles.headerContent}>
                        <Text style={styles.screenTitle}>{t('shopkeeper_profile')}</Text>

                        <View style={styles.profileRow}>
                            {/* Avatar */}
                            <View style={styles.avatarWrap}>
                                <View style={styles.avatar}>
                                    <Text style={styles.avatarText}>{initials}</Text>
                                </View>
                                <View style={styles.statusBadge}>
                                    <View style={styles.statusDot} />
                                </View>
                            </View>

                            {/* Info */}
                            <View style={styles.profileInfo}>
                                <Text style={styles.profileName}>{user?.name || t('shop_owner')}</Text>
                                <Text style={styles.storeName}>{selectedShop?.name || 'Jai Malhar Store'}</Text>
                                <Text style={styles.profilePhone}>
                                    {user?.phone ? `+91 ${user.phone}` : t('no_phone')}
                                </Text>
                            </View>

                            {/* Settings icon */}
                            <TouchableOpacity style={styles.settingsCircle}>
                                <Ionicons name="settings-outline" size={20} color="#166534" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </SafeAreaView>
            </View>

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >

                {/* ── SHOP PERFORMANCE STRIP ── */}
                <Text style={styles.sectionLabel}>{t('shop_performance')}</Text>
                <View style={styles.statStrip}>
                    <View style={styles.statItem}>
                        <Text style={styles.statNum}>{totalOrders}</Text>
                        <Text style={styles.statLbl}>{t('orders')}</Text>
                    </View>
                    <View style={styles.statSep} />
                    <View style={styles.statItem}>
                        <Text style={[styles.statNum, { color: '#059669' }]}>₹{totalRevenue}</Text>
                        <Text style={styles.statLbl}>{t('revenue')}</Text>
                    </View>
                    <View style={styles.statSep} />
                    <View style={styles.statItem}>
                        <Text style={[styles.statNum, { color: '#dc2626' }]}>{pendingOrders}</Text>
                        <Text style={styles.statLbl}>{t('pending')}</Text>
                    </View>
                </View>

                {/* ── SHOP STATUS TOGGLE ── */}
                <Text style={styles.sectionLabel}>{t('show_shop_to_customers')}</Text>
                <View style={styles.listCard}>
                    <View style={styles.statusRow}>
                        <View style={styles.statusInfo}>
                            <View style={[
                                styles.statusPill,
                                { backgroundColor: selectedShop?.active ? '#dcfce7' : '#fee2e2' }
                            ]}>
                                <View style={[
                                    styles.statusDotInner,
                                    { backgroundColor: selectedShop?.active ? '#10b981' : '#ef4444' }
                                ]} />
                                <Text style={[
                                    styles.statusPillText,
                                    { color: selectedShop?.active ? '#166534' : '#991b1b' }
                                ]}>
                                    {selectedShop?.active ? t('shop_online') : t('shop_offline')}
                                </Text>
                            </View>
                        </View>
                        <TouchableOpacity
                            onPress={() => updateShopStatus(selectedShop._id, !selectedShop.active)}
                            style={[
                                styles.toggleContainer,
                                { backgroundColor: selectedShop?.active ? '#10b981' : '#e2e8f0' }
                            ]}
                        >
                            <View style={[
                                styles.toggleCircle,
                                { transform: [{ translateX: selectedShop?.active ? 22 : 2 }] }
                            ]} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* ── LANGUAGE SETTINGS ── */}
                <Text style={styles.sectionLabel}>{t('language')}</Text>
                <View style={styles.listCard}>
                    <View style={styles.languageSection}>
                        <View style={styles.langGrid}>
                            {LANGUAGES.map((lang) => (
                                <TouchableOpacity
                                    key={lang.id}
                                    style={[
                                        styles.langBtn,
                                        currentLanguage === lang.id && styles.langBtnActive
                                    ]}
                                    onPress={() => changeLanguage(lang.id)}
                                >
                                    <Text style={[
                                        styles.langBtnText,
                                        currentLanguage === lang.id && styles.langBtnTextActive
                                    ]}>{lang.label}</Text>
                                    <Text style={styles.langBtnSub}>{lang.sub}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </View>

                {/* ── MANAGEMENT SECTION ── */}
                <Text style={styles.sectionLabel}>{t('management')}</Text>
                <View style={styles.listCard}>
                    {MENU_ITEMS.map((item, i) => (
                        <TouchableOpacity
                            key={i}
                            style={[styles.listRow, i < MENU_ITEMS.length - 1 && styles.listRowBorder]}
                            activeOpacity={0.55}
                        >
                            <View style={[styles.listIconBox, { backgroundColor: item.bg }]}>
                                <Ionicons name={item.icon} size={19} color={item.color} />
                            </View>
                            <Text style={styles.listLabel}>{item.label}</Text>
                            <Ionicons name="chevron-forward" size={18} color="#c4c9d4" />
                        </TouchableOpacity>
                    ))}
                </View>


                {/* ── LOGOUT ── */}
                <View style={styles.listCard}>
                    <TouchableOpacity style={styles.listRow} onPress={handleLogout} activeOpacity={0.55}>
                        <View style={[styles.listIconBox, { backgroundColor: '#fee2e2' }]}>
                            <Ionicons name="log-out-outline" size={19} color="#ef4444" />
                        </View>
                        <Text style={[styles.listLabel, { color: '#ef4444' }]}>{t('logout')}</Text>
                        <Ionicons name="chevron-forward" size={18} color="#fca5a5" />
                    </TouchableOpacity>
                </View>

                {/* ── DELETE ACCOUNT ── */}
                <View style={[styles.listCard, { marginTop: 8 }]}>
                    <TouchableOpacity style={styles.listRow} onPress={handleDeleteAccount} activeOpacity={0.55}>
                        <View style={[styles.listIconBox, { backgroundColor: '#ffe4e6' }]}>
                            <Ionicons name="trash-outline" size={19} color="#e11d48" />
                        </View>
                        <Text style={[styles.listLabel, { color: '#e11d48' }]}>{t('delete_account')}</Text>
                        <Ionicons name="chevron-forward" size={18} color="#fda4af" />
                    </TouchableOpacity>
                </View>

                <Text style={styles.version}>{t('shop_panel_v1')}</Text>

                <View style={{ height: 120 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#f4f6f8' },

    /* ── HEADER ── */
    topHeader: {
        backgroundColor: '#166534',
        paddingBottom: 24,
        borderBottomLeftRadius: 28,
        borderBottomRightRadius: 28,
        shadowColor: '#166534',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 14,
        elevation: 10,
    },
    headerContent: {
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'android' ? 16 : 12,
    },
    screenTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: '#86efac',
        letterSpacing: 2,
        textTransform: 'uppercase',
        marginBottom: 20,
    },
    profileRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
    },

    // Avatar
    avatarWrap: { position: 'relative' },
    avatar: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: '#064e3b',
        borderWidth: 2.5,
        borderColor: '#86efac',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: { fontSize: 24, fontWeight: '900', color: '#86efac' },
    statusBadge: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        width: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    statusDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#10b981',
    },

    // Info
    profileInfo: { flex: 1 },
    profileName: { fontSize: 19, fontWeight: '800', color: '#fff', marginBottom: 2 },
    storeName: { fontSize: 13, color: '#86efac', fontWeight: '700', marginBottom: 2 },
    profilePhone: { fontSize: 12, color: '#a7f3d0', fontWeight: '500' },

    settingsCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#dcfce7',
        alignItems: 'center',
        justifyContent: 'center',
    },

    /* ── SCROLL ── */
    scroll: { flex: 1 },
    scrollContent: { paddingHorizontal: 16, paddingTop: 20 },

    /* ── STAT STRIP ── */
    statStrip: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 18,
        paddingVertical: 18,
        marginBottom: 22,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.07,
        shadowRadius: 8,
        elevation: 3,
    },
    statItem: { flex: 1, alignItems: 'center' },
    statNum: { fontSize: 19, fontWeight: '900', color: '#111827', marginBottom: 3 },
    statLbl: { fontSize: 11, color: '#9ca3af', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
    statSep: { width: 1, height: 36, backgroundColor: '#f3f4f6', alignSelf: 'center' },

    /* ── SECTION LABEL ── */
    sectionLabel: {
        fontSize: 11,
        fontWeight: '800',
        color: '#9ca3af',
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        marginBottom: 8,
        marginLeft: 4,
    },

    /* ── LIST CARD ── */
    listCard: {
        backgroundColor: '#fff',
        borderRadius: 18,
        marginBottom: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    listRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 15,
        gap: 13,
    },
    listRowBorder: { borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
    listIconBox: {
        width: 40,
        height: 40,
        borderRadius: 13,
        alignItems: 'center',
        justifyContent: 'center',
    },
    listLabel: {
        flex: 1,
        fontSize: 15,
        fontWeight: '600',
        color: '#1f2937',
    },
    listSub: { fontSize: 12, color: '#9ca3af', fontWeight: '500', marginTop: 1 },

    /* ── LANGUAGE SECTION ── */
    languageSection: {
        padding: 16,
    },
    langGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    langBtn: {
        flex: 1,
        minWidth: '45%',
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: '#f1f5f9',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
    },
    langBtnActive: {
        borderColor: '#10b981',
        backgroundColor: '#ecfdf5',
    },
    langBtnText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#475569',
    },
    langBtnTextActive: {
        color: '#047857',
    },
    langBtnSub: {
        fontSize: 10,
        color: '#94a3b8',
        fontWeight: '500',
        marginTop: 2,
    },

    /* ── TOGGLE ── */
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },
    statusPill: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 6,
    },
    statusDotInner: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    statusPillText: {
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    toggleContainer: {
        width: 48,
        height: 26,
        borderRadius: 13,
        padding: 2,
        justifyContent: 'center',
    },
    toggleCircle: {
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
    },

    /* ── VERSION ── */
    version: {
        textAlign: 'center',
        fontSize: 12,
        color: '#c4c9d4',
        fontWeight: '500',
        marginTop: 8,
    },
});
