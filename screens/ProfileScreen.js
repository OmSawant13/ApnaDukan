import React, { useEffect } from 'react';
import {
    View, Text, StyleSheet, StatusBar,
    TouchableOpacity, ScrollView, Alert, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrderContext';
import { useLanguage } from '../context/LanguageContext';

export default function ProfileScreen({ navigation }) {
    const { user, logout } = useAuth();
    const { orders, fetchOrders } = useOrders();
    const { t, customerLanguage, changeLanguage } = useLanguage();

    // Fetch orders on mount so stats are fresh
    useEffect(() => {
        fetchOrders();
    }, []);

    const handleLogout = () => {
        Alert.alert(t('logout'), 'Are you sure you want to log out?', [
            { text: 'Cancel', style: 'cancel' },
            { text: t('logout'), style: 'destructive', onPress: logout },
        ]);
    };

    // Filter orders by customer name (customerId not always stored in older orders)
    const myOrders = orders.filter(o =>
        (o.customerId && o.customerId === user?._id) ||
        (o.customer && user?.name && o.customer.toLowerCase() === user.name.toLowerCase())
    );
    const totalOrders = myOrders.length;
    const totalSpent = myOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    const INFO_ITEMS = [
        { icon: 'book-outline', label: 'My Credit Ledger (Khata)', color: '#db2777', bg: '#fce7f3', screen: 'GlobalProfile' },
        { icon: 'person-outline', label: t('personal_info'), color: '#6366f1', bg: '#eef2ff' },
        { icon: 'notifications-outline', label: 'Notifications', color: '#f59e0b', bg: '#fffbeb' },
        { icon: 'help-circle-outline', label: t('help_support'), color: '#0ea5e9', bg: '#e0f2fe' },
    ];


    const LANGUAGES = [
        { id: 'en', label: 'English', sub: 'Default' },
        { id: 'hi', label: 'हिन्दी', sub: 'Hindi' },
        { id: 'mr', label: 'मराठी', sub: 'Marathi' },
        { id: 'hg', label: 'Hinglish', sub: 'Hindi + English' },
    ];

    const initials = user?.name
        ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : 'GU';

    return (
        <View style={styles.root}>
            <StatusBar barStyle="light-content" backgroundColor="#042e23" />

            {/* ── TOP PROFILE HEADER ── */}
            <View style={styles.topHeader}>
                <SafeAreaView edges={['top']}>
                    <View style={styles.headerContent}>
                        <Text style={styles.screenTitle}>{t('profile')}</Text>

                        <View style={styles.profileRow}>
                            {/* Avatar */}
                            <View style={styles.avatarWrap}>
                                <View style={styles.avatar}>
                                    <Text style={styles.avatarText}>{initials}</Text>
                                </View>
                                <TouchableOpacity style={styles.cameraTag}>
                                    <Ionicons name="camera" size={11} color="#fff" />
                                </TouchableOpacity>
                            </View>

                            {/* Info */}
                            <View style={styles.profileInfo}>
                                <Text style={styles.profileName}>{user?.name || 'Guest User'}</Text>
                                <Text style={styles.profilePhone}>
                                    {user?.phone ? `+91 ${user.phone}` : 'No phone linked'}
                                </Text>
                                <Text style={styles.profileEmail} numberOfLines={1}>
                                    {user?.email || 'No email linked'}
                                </Text>
                            </View>

                            {/* Edit icon */}
                            <TouchableOpacity style={styles.editCircle}>
                                <Ionicons name="pencil" size={16} color="#042e23" />
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

                {/* ── STAT STRIP ── */}
                <View style={styles.statStrip}>
                    <View style={styles.statItem}>
                        <Text style={styles.statNum}>{totalOrders}</Text>
                        <Text style={styles.statLbl}>{t('orders')}</Text>
                    </View>
                    <View style={styles.statSep} />
                    <View style={styles.statItem}>
                        <Text style={styles.statNum}>₹{totalSpent}</Text>
                        <Text style={styles.statLbl}>{t('total')}</Text>
                    </View>
                    <View style={styles.statSep} />
                    <View style={styles.statItem}>
                        <Text style={[styles.statNum, { color: '#ef4444' }]}>₹{user?.balance || 0}</Text>
                        <Text style={styles.statLbl}>Udhari</Text>
                    </View>

                </View>

                {/* ── SETTINGS SECTION ── */}
                <Text style={styles.sectionLabel}>{t('app_settings')}</Text>
                <View style={styles.listCard}>
                    <View style={styles.languageSection}>
                        <View style={styles.languageHeader}>
                            <View style={[styles.listIconBox, { backgroundColor: '#fdf2f8' }]}>
                                <Ionicons name="language-outline" size={19} color="#db2777" />
                            </View>
                            <Text style={styles.listLabel}>{t('language')}</Text>
                        </View>
                        <View style={styles.langGrid}>
                            {LANGUAGES.map((lang) => (
                                <TouchableOpacity
                                    key={lang.id}
                                    style={[
                                        styles.langBtn,
                                        customerLanguage === lang.id && styles.langBtnActive
                                    ]}
                                    onPress={() => changeLanguage(lang.id, 'customer')}
                                >
                                    <Text style={[
                                        styles.langBtnText,
                                        customerLanguage === lang.id && styles.langBtnTextActive
                                    ]}>{lang.label}</Text>
                                    <Text style={styles.langBtnSub}>{lang.sub}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </View>

                <View style={styles.listCard}>
                    {INFO_ITEMS.map((item, i) => (
                        <TouchableOpacity
                            key={i}
                            style={[styles.listRow, i < INFO_ITEMS.length - 1 && styles.listRowBorder]}
                            activeOpacity={0.55}
                            onPress={() => item.screen && navigation.navigate(item.screen)}
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

                <Text style={styles.version}>ApnaDukan v1.0.0</Text>

                <View style={{ height: 120 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#f4f6f8' },

    /* ── HEADER ── */
    topHeader: {
        backgroundColor: '#042e23',
        paddingBottom: 24,
        borderBottomLeftRadius: 28,
        borderBottomRightRadius: 28,
        // shadow
        shadowColor: '#042e23',
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
        backgroundColor: '#0d4a2e',
        borderWidth: 2.5,
        borderColor: '#86efac',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: { fontSize: 24, fontWeight: '900', color: '#86efac' },
    cameraTag: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: '#10b981',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#042e23',
    },

    // Info
    profileInfo: { flex: 1 },
    profileName: { fontSize: 19, fontWeight: '800', color: '#fff', marginBottom: 3, letterSpacing: -0.3 },
    profilePhone: { fontSize: 13, color: '#a7f3d0', fontWeight: '600', marginBottom: 2 },
    profileEmail: { fontSize: 12, color: '#5a8a72', fontWeight: '500' },

    editCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#86efac',
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
        // shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.07,
        shadowRadius: 8,
        elevation: 3,
    },
    statItem: { flex: 1, alignItems: 'center' },
    statNum: { fontSize: 20, fontWeight: '900', color: '#111827', marginBottom: 3 },
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
    languageHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 13,
        marginBottom: 16,
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

    /* ── VERSION ── */
    version: {
        textAlign: 'center',
        fontSize: 12,
        color: '#c4c9d4',
        fontWeight: '500',
        marginTop: 8,
    },
});
