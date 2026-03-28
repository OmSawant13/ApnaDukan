import React from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
import ShopkeeperAddCategoryScreen from '../screens/shopkeeper/ShopkeeperAddCategoryScreen';
import ShopkeeperCreditDetailsScreen from '../screens/shopkeeper/ShopkeeperCreditDetailsScreen';
import OrderDetailsScreen from '../screens/OrderDetailsScreen';
import GlobalProfileScreen from '../screens/GlobalProfileScreen';


const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const { width } = Dimensions.get('window');

const TAB_WIDTH = width * 0.6;

function CustomTabBar({ state, descriptors, navigation }) {
    const insets = useSafeAreaInsets();
    
    // Dynamic bottom spacing: 
    // - On phones with buttons (insets.bottom == 0), we want ~20px offset.
    // - On phones with gestures/notch (insets.bottom > 0), we use the inset + extra breathing room.
    const dynamicBottom = insets.bottom > 0 ? insets.bottom + 10 : 25;

    return (
        <View style={[styles.wrapper, { bottom: dynamicBottom }]}>
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
import { useShop } from '../context/ShopContext';
import OnboardingScreen from '../screens/OnboardingScreen';
import LoginScreen from '../screens/Login';
import SignupScreen from '../screens/SignupScreen';
import ShopSelectionScreen from '../screens/ShopSelectionScreen';
import ShopRegistrationScreen from '../screens/shopkeeper/ShopRegistrationScreen';
import LoadingScreen from '../screens/LoadingScreen';

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
const AppStack = () => {
    const { user } = useAuth();
    const initialRoute = user?.role === 'shopkeeper' ? 'Shopkeeper' : 'MainTabs';

    return (
        <Stack.Navigator
            initialRouteName={initialRoute}
            screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
        >
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
            <Stack.Screen
                name="ShopkeeperAddCategory"
                component={ShopkeeperAddCategoryScreen}
                options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
            />
        </Stack.Navigator>
    );
};


import * as SplashScreen from 'expo-splash-screen';

export default function AppNavigator() {
    const [minLoading, setMinLoading] = React.useState(true);
    const { user, loading: authLoading } = useAuth();
    const { selectedShop, loading: shopLoading } = useShop();

    React.useEffect(() => {
        const timer = setTimeout(() => {
            setMinLoading(false);
            SplashScreen.hideAsync().catch(() => { });
        }, 5000);
        return () => clearTimeout(timer);
    }, []);

    // 1. Critical Guard: Wait for Auth + Min Timer
    if (authLoading || minLoading) {
        return <LoadingScreen />;
    }

    // 2. Shopkeeper Guard: If user is shopkeeper, wait for SHOP data to settle
    // This prevents the "ShopRegistration" flash when selectedShop is still null but being fetched.
    if (user?.role === 'shopkeeper' && shopLoading) {
        return <LoadingScreen />;
    }

    // 3. Customer Guard: If user is customer, they need ShopSelection screen (always)
    // We don't necessarily need to wait for shopLoading here if ShopSelection screen handles its own list loading.

    const initialRoute = !user
        ? 'Auth'
        : (user?.role === 'customer'
            ? 'ShopSelection'
            : (user?.role === 'shopkeeper' && !selectedShop ? 'ShopRegistration' : 'App'));

    return (
        <Stack.Navigator
            initialRouteName={initialRoute}
            screenOptions={{ headerShown: false }}
        >
            {!user ? (
                <Stack.Screen name="Auth" component={AuthStack} />
            ) : user.role === 'customer' ? (
                <>
                    <Stack.Screen name="ShopSelection" component={ShopSelectionScreen} />
                    <Stack.Screen name="GlobalProfile" component={GlobalProfileScreen} />
                    <Stack.Screen name="OrderDetails" component={OrderDetailsScreen} />

                    <Stack.Screen name="App" component={AppStack} />
                </>
            ) : user.role === 'shopkeeper' && !selectedShop ? (
                <Stack.Screen name="ShopRegistration" component={ShopRegistrationScreen} />
            ) : (
                <Stack.Screen name="App" component={AppStack} />
            )}
        </Stack.Navigator>
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
        overflow: 'hidden',
    },

    active: {
        backgroundColor: '#dcfce7',
        borderRadius: 22,
    },
});
