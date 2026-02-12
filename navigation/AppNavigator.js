import React from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

// Screens
import HomeScreen from '../screens/HomeScreen';
import CategoriesScreen from '../screens/CategoriesScreen';
import OrdersScreen from '../screens/OrdersScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ProductDetailsScreen from '../screens/ProductDetailsScreen';
import WeightProductDetailsScreen from '../screens/WeightProductDetailsScreen';
import CategoryProductsScreen from '../screens/CategoryProductsScreen';
import CartScreen from '../screens/CartScreen';
import ShopkeeperNavigator from '../screens/shopkeeper/ShopkeeperNavigator';
import ShopkeeperOrderDetailsScreen from '../screens/shopkeeper/ShopkeeperOrderDetailsScreen';
import ShopkeeperProductDetailsScreen from '../screens/shopkeeper/ShopkeeperProductDetailsScreen';
import ShopkeeperProductListScreen from '../screens/shopkeeper/ShopkeeperProductListScreen';
import ShopkeeperAddProductScreen from '../screens/shopkeeper/ShopkeeperAddProductScreen';
import ShopkeeperCreditDetailsScreen from '../screens/shopkeeper/ShopkeeperCreditDetailsScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const { width } = Dimensions.get('window');

const TAB_WIDTH = width * 0.6;

function CustomTabBar({ state, descriptors, navigation }) {
    return (
        <View style={styles.wrapper}>
            <View style={styles.tabBar}>
                {state.routes.map((route, index) => {
                    const isFocused = state.index === index;

                    let iconName;
                    if (route.name === 'Home') iconName = isFocused ? 'home' : 'home-outline';
                    if (route.name === 'Categories') iconName = isFocused ? 'grid' : 'grid-outline';
                    if (route.name === 'Orders') iconName = isFocused ? 'receipt' : 'receipt-outline';
                    if (route.name === 'Profile') iconName = isFocused ? 'person' : 'person-outline';

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

function MainTabs() {
    return (
        <Tab.Navigator
            screenOptions={{ headerShown: false }}
            tabBar={(props) => <CustomTabBar {...props} />}
        >
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="Categories" component={CategoriesScreen} />
            <Tab.Screen name="Orders" component={OrdersScreen} />
            <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
    );
}

import { useAuth } from '../context/AuthContext';
import OnboardingScreen from '../screens/OnboardingScreen';
import LoginScreen from '../screens/Login';
import SignupScreen from '../screens/SignupScreen';

// ... (Existing Imports)

// Auth Stack Config
const AuthStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
    </Stack.Navigator>
);

// Main App Stack Config
const AppStack = () => (
    <Stack.Navigator initialRouteName="MainTabs" screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen name="ProductDetails" component={ProductDetailsScreen} />
        <Stack.Screen name="WeightProductDetails" component={WeightProductDetailsScreen} />
        <Stack.Screen name="CategoryProducts" component={CategoryProductsScreen} />
        <Stack.Screen name="Cart" component={CartScreen} />
        <Stack.Screen name="Shopkeeper" component={ShopkeeperNavigator} />
        <Stack.Screen name="ShopkeeperOrderDetails" component={ShopkeeperOrderDetailsScreen} />
        <Stack.Screen name="ShopkeeperProductList" component={ShopkeeperProductListScreen} />
        <Stack.Screen name="ShopkeeperAddProduct" component={ShopkeeperAddProductScreen} />
        <Stack.Screen name="ShopkeeperProductDetails" component={ShopkeeperProductDetailsScreen} />
        <Stack.Screen name="ShopkeeperCreditDetails" component={ShopkeeperCreditDetailsScreen} />
    </Stack.Navigator>
);

export default function AppNavigator() {
    const { user, loading } = useAuth();

    if (loading) {
        // You could return a Splash Screen here
        return <View style={{ flex: 1, backgroundColor: '#fff' }} />;
    }

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {user ? (
                <Stack.Screen name="App" component={AppStack} />
            ) : (
                <Stack.Screen name="Auth" component={AuthStack} />
            )}
        </Stack.Navigator>
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
        width: TAB_WIDTH,
        height: 70,
        backgroundColor: '#fff',
        borderRadius: 35,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        // Modern shadow
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
    },

    active: {
        backgroundColor: '#dcfce7',
    },
});
