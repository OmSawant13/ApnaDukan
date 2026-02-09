import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Shopkeeper Screens
import ShopkeeperOrdersScreen from './OrdersScreen';
import ShopkeeperInventoryScreen from './InventoryScreen';
import ShopkeeperCreditScreen from './CreditScreen';
import ShopkeeperProductDetailsScreen from './ShopkeeperProductDetailsScreen';

const Tab = createBottomTabNavigator();

function ShopkeeperTabBar({ state, descriptors, navigation }) {
    return (
        <View style={styles.wrapper}>
            <View style={styles.tabBar}>
                {state.routes.map((route, index) => {
                    const isFocused = state.index === index;
                    const { options } = descriptors[route.key];

                    let iconName;
                    if (route.name === 'ShopOrders') iconName = isFocused ? 'receipt' : 'receipt-outline';
                    if (route.name === 'ShopInventory') iconName = isFocused ? 'cube' : 'cube-outline';
                    if (route.name === 'ShopCredit') iconName = isFocused ? 'people' : 'people-outline';

                    const onPress = () => {
                        // ... (rest of the onPress logic is skipped in replace, just matching context) 
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
    return (
        <Tab.Navigator
            screenOptions={{ headerShown: false }}
            tabBar={(props) => <ShopkeeperTabBar {...props} />}
        >
            <Tab.Screen
                name="ShopOrders"
                component={ShopkeeperOrdersScreen}
                options={{ tabBarLabel: 'Orders' }}
            />
            <Tab.Screen
                name="ShopInventory"
                component={ShopkeeperInventoryScreen}
                options={{ tabBarLabel: 'Inventory' }}
            />
            <Tab.Screen
                name="ShopCredit"
                component={ShopkeeperCreditScreen}
                options={{ tabBarLabel: 'Credit' }}
            />
        </Tab.Navigator>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        position: 'absolute',
        bottom: 40,
        width: '100%',
        alignItems: 'center',
    },
    tabBar: {
        width: '60%',
        height: 60,
        backgroundColor: '#fff',
        borderRadius: 30,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
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
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    active: {
        backgroundColor: '#dcfce7',
    },
});
