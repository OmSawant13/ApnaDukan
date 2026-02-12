import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    StatusBar,
    Image,
    TouchableOpacity,
    ScrollView,
    Platform,
    Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';

export default function ProfileScreen({ navigation }) {
    const { user, logout } = useAuth();

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to log out?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Logout', style: 'destructive', onPress: logout }
            ]
        );
    };

    const USER_STATS = {
        totalOrders: 12,
        totalSpent: 4580
    };

    const INFO_ITEMS = [
        { icon: 'person-outline', label: 'Edit Profile' },
        { icon: 'notifications-outline', label: 'Notifications' },
        { icon: 'help-circle-outline', label: 'Help & Support' },
    ];

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#111827" />

            {/* HEADER */}
            <View style={styles.headerContainer}>
                <LinearGradient
                    colors={['#1f2937', '#111827']}
                    style={styles.headerGradient}
                >
                    <Text style={styles.headerTitle}>My Profile</Text>

                    <View style={styles.profileSection}>
                        <View style={styles.avatarContainer}>
                            <Image
                                source={require('../assets/images/baby_care_v3.png')}
                                style={styles.avatar}
                            />
                            <View style={styles.editIconBtn}>
                                <Ionicons name="camera" size={14} color="#fff" />
                            </View>
                        </View>

                        <Text style={styles.userName}>{user?.name || 'Guest User'}</Text>
                        <Text style={styles.userEmail}>{user?.email || 'No Email Linked'}</Text>
                        <Text style={styles.userPhone}>{user?.phone || '+91 -'}</Text>
                    </View>
                </LinearGradient>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >

                {/* STATS */}
                <View style={styles.statsContainer}>
                    <View style={styles.statBlock}>
                        <View style={[styles.statIcon, { backgroundColor: '#e0f2fe' }]}>
                            <Ionicons name="receipt-outline" size={22} color="#0ea5e9" />
                        </View>
                        <Text style={styles.statValue}>{USER_STATS.totalOrders}</Text>
                        <Text style={styles.statLabel}>Orders</Text>
                    </View>

                    <View style={styles.verticalLine} />

                    <View style={styles.statBlock}>
                        <View style={[styles.statIcon, { backgroundColor: '#dcfce7' }]}>
                            <Ionicons name="wallet-outline" size={22} color="#10b981" />
                        </View>
                        <Text style={styles.statValue}>₹{USER_STATS.totalSpent}</Text>
                        <Text style={styles.statLabel}>Spent</Text>
                    </View>
                </View>

                {/* SETTINGS */}
                <View style={styles.menuContainer}>
                    <Text style={styles.sectionHeader}>Settings</Text>

                    {INFO_ITEMS.map((item, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[
                                styles.menuItem,
                                index === INFO_ITEMS.length - 1 && { borderBottomWidth: 0 }
                            ]}
                            activeOpacity={0.6}
                        >
                            <View style={styles.menuLeft}>
                                <View style={styles.menuIconBox}>
                                    <Ionicons name={item.icon} size={20} color="#374151" />
                                </View>
                                <Text style={styles.menuLabel}>{item.label}</Text>
                            </View>

                            <Ionicons
                                name="chevron-forward"
                                size={18}
                                color="#9ca3af"
                            />
                        </TouchableOpacity>
                    ))}

                    <TouchableOpacity
                        style={[styles.menuItem, { borderBottomWidth: 0, marginTop: 10 }]}
                        onPress={() => navigation.navigate('Shopkeeper')}
                        activeOpacity={0.6}
                    >
                        <View style={styles.menuLeft}>
                            <View style={[styles.menuIconBox, { backgroundColor: '#dcfce7' }]}>
                                <Ionicons name="storefront" size={20} color="#166534" />
                            </View>
                            <Text style={[styles.menuLabel, { color: '#166534', fontWeight: '700' }]}>Switch to Shopkeeper</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color="#166534" />
                    </TouchableOpacity>
                </View>

                {/* LOGOUT */}
                <TouchableOpacity style={styles.logoutBtn} activeOpacity={0.7} onPress={handleLogout}>
                    <Text style={styles.logoutText}>Log Out</Text>
                </TouchableOpacity>

                <View style={{ height: 80 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
    },

    /* HEADER */
    headerContainer: {
        borderBottomLeftRadius: 28,
        borderBottomRightRadius: 28,
        overflow: 'hidden',
        elevation: 4,
    },
    headerGradient: {
        paddingTop: Platform.OS === 'android'
            ? StatusBar.currentHeight + 20
            : 60,
        paddingBottom: 30,
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 18,
    },
    profileSection: {
        alignItems: 'center',
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 12,
    },
    avatar: {
        width: 90,
        height: 90,
        borderRadius: 45,
        borderWidth: 3,
        borderColor: '#fff',
        backgroundColor: '#f3f4f6',
    },
    editIconBtn: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#10b981',
        width: 26,
        height: 26,
        borderRadius: 13,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#111827',
    },
    userName: {
        fontSize: 22,
        fontWeight: '700',
        color: '#fff',
    },
    userEmail: {
        fontSize: 14,
        color: '#9ca3af',
        marginTop: 4,
    },
    userPhone: {
        fontSize: 14,
        color: '#d1d5db',
        marginTop: 2,
    },

    /* CONTENT */
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 20,
    },

    /* STATS */
    statsContainer: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 18,
        paddingVertical: 12,
        justifyContent: 'space-around',
        alignItems: 'center',
        marginBottom: 15, // Reduced from 25
        elevation: 2,
    },
    statBlock: {
        alignItems: 'center',
        width: '40%',
    },
    statIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    statValue: {
        fontSize: 18,
        fontWeight: '700',
        marginTop: 8,
        color: '#111827',
    },
    statLabel: {
        fontSize: 12,
        color: '#6b7280',
        marginTop: 2,
    },
    verticalLine: {
        width: 1,
        height: 40,
        backgroundColor: '#f3f4f6',
    },

    /* MENU */
    menuContainer: {
        backgroundColor: '#fff',
        borderRadius: 18,
        padding: 20,
        marginBottom: 15, // Reduced from 25
        elevation: 2,
    },
    sectionHeader: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 10,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    menuLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    menuIconBox: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#f3f4f6',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
    },
    menuLabel: {
        fontSize: 15,
        color: '#374151',
        fontWeight: '500',
    },

    /* LOGOUT */
    logoutBtn: {
        backgroundColor: '#fee2e2',
        borderRadius: 14,
        paddingVertical: 14, // Slightly smaller
        alignItems: 'center',
        width: "50%",
        marginRight: "25%",
        marginLeft: "25%",
    },
    logoutText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#ef4444',
    },
});


