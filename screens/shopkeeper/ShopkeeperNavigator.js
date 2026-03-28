import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useShopLanguage } from '../../context/LanguageContext';

const { width } = Dimensions.get('window');
const TAB_WIDTH = width * 0.6;

// Shopkeeper Screens
import ShopkeeperOrdersScreen from './OrdersScreen';
import ShopkeeperInventoryScreen from './InventoryScreen';
import ShopkeeperCreditScreen from './CreditScreen';
import ShopkeeperProfileScreen from './ShopkeeperProfileScreen';

const Tab = createBottomTabNavigator();

function ShopkeeperTabBar({ state, descriptors, navigation }) {
    const insets = useSafeAreaInsets();
    const dynamicBottom = insets.bottom > 0 ? insets.bottom + 10 : 25;

    return (
        <View style={[styles.wrapper, { bottom: dynamicBottom }]}>
            <View style={styles.tabBar}>
                {state.routes.map((route, index) => {
                    const isFocused = state.index === index;

                    let iconName;
                    if (route.name === 'ShopOrders') iconName = isFocused ? 'receipt' : 'receipt-outline';
                    if (route.name === 'ShopInventory') iconName = isFocused ? 'cube' : 'cube-outline';
                    if (route.name === 'ShopCredit') iconName = isFocused ? 'people' : 'people-outline';
                    if (route.name === 'ShopProfile') iconName = isFocused ? 'person' : 'person-outline';

                    const onPress = () => {
                        const event = navigation.emit({
                            type: 'tabPress',
                            target: route.key,
                            canPreventDefault: true,
                        });

                        if (!isFocused && !event.defaultPrevented) {
                            navigation.navigate(route.name);
                        }
                    };

                    return (
                        <TouchableOpacity
                            key={route.key}
                            onPress={onPress}
                            style={styles.tabItem}
                            activeOpacity={0.8}
                        >
                            <View style={[styles.iconCircle, isFocused && styles.active]}>
                                <Ionicons
                                    name={iconName}
                                    size={22}
                                    color={isFocused ? '#166534' : '#9ca3af'}
                                />
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
}

export default function ShopkeeperNavigator() {
    const { t } = useShopLanguage();

    return (
        <Tab.Navigator
            screenOptions={{ headerShown: false }}
            tabBar={(props) => <ShopkeeperTabBar {...props} />}
        >
            <Tab.Screen
                name="ShopOrders"
                component={ShopkeeperOrdersScreen}
                options={{ tabBarLabel: t('shop_orders') }}
            />
            <Tab.Screen
                name="ShopInventory"
                component={ShopkeeperInventoryScreen}
                options={{ tabBarLabel: t('inventory') }}
            />
            <Tab.Screen
                name="ShopCredit"
                component={ShopkeeperCreditScreen}
                options={{ tabBarLabel: t('credit') }}
            />
            <Tab.Screen
                name="ShopProfile"
                component={ShopkeeperProfileScreen}
                options={{ tabBarLabel: t('profile') }}
            />
        </Tab.Navigator>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        position: 'absolute',
        width: '100%',
        alignItems: 'center',
    },
    tabBar: {
        width: TAB_WIDTH,
        height: 70,
        backgroundColor: '#fff',
        borderRadius: 35,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        // Shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 6,
    },
    tabItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    active: {
        backgroundColor: '#dcfce7',
        borderRadius: 22,
    },
});
