import React from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    StatusBar,
    Platform,
    Dimensions,
    ScrollView
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import HomeProductCard from "../components/HomeProductCard";
import ProductCard from "../components/ProductCard";
import CategoryShowcaseCard from "../components/CategoryShowcaseCard";
import DailyItemCard from "../components/DailyItemCard";
import { useProducts } from '../context/ProductContext'; // Import Context
import { useOrders } from '../context/OrderContext'; // Import Order Context
import { useLanguage } from '../context/LanguageContext'; // Import Language Context
import { useShop } from '../context/ShopContext';

// Get screen width for the curve calculation
const { width } = Dimensions.get('window');

// Helper for consistent styling based on category name
const getCategoryStyle = (name) => {
    const n = (name || '').toLowerCase(); // Safety check for undefined/null
    if (n.includes('soft')) return { subtitle: 'Cool & Fizzy', color: '#db2777', bgColor: '#fce7f3', image: require('../assets/images/soft_drinks_v3.png'), tag: 'UPTO 20% OFF' };
    if (n.includes('spice')) return { subtitle: 'Authentic Taste', color: '#d97706', bgColor: '#F9E9BA', image: require('../assets/images/spices_v3.png'), tag: 'Fresh' };
    if (n.includes('cleaning')) return { subtitle: 'Essentials', color: '#0ea5e9', bgColor: '#e0f2fe', image: require('../assets/images/cleaning_v3.png'), tag: 'Best Seller' };
    if (n.includes('baby')) return { subtitle: 'Gentle & Safe', color: '#7c3aed', bgColor: '#ede9fe', image: require('../assets/images/baby_care_v3.png'), tag: 'Trusted' };
    if (n.includes('bakery')) return { subtitle: 'Oven Fresh', color: '#ea580c', bgColor: '#ffedd5', image: require('../assets/images/bakery_cat.png'), tag: 'Hot' };
    if (n.includes('dairy')) return { subtitle: 'Farm Fresh', color: '#0284c7', bgColor: '#e0f2fe', image: require('../assets/images/dairy_cat.png'), tag: 'Daily' };
    if (n.includes('veg')) return { subtitle: 'Farm to Home', color: '#16a34a', bgColor: '#dcfce7', image: require('../assets/images/veg_cat.png'), tag: 'Healthy' };

    return { subtitle: 'Explore', color: '#6366f1', bgColor: '#e0e7ff', image: require('../assets/images/spices_v3.png'), tag: 'New' };
};

export default function HomeScreen({ navigation }) {
    const { products, categories, loading } = useProducts();
    const { cart } = useOrders();
    const { t, translateProduct, bulkTranslate, currentLanguage } = useLanguage();
    const { selectedShop } = useShop();

    const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

    // Bulk translate products and categories when they load
    React.useEffect(() => {
        if (products.length > 0) {
            const productNames = products.map(p => p.name);
            const categoryNames = categories.map(c => c.name);
            bulkTranslate([...productNames, ...categoryNames]);
        }
    }, [products, categories, currentLanguage]);

    // --- Data Filtering Logic ---
    const safeProducts = Array.isArray(products) ? products : [];

    // --- Dynamic Category Filtering ---
    const getCategoryIds = (names) => {
        if (!categories || categories.length === 0) return [];
        return categories
            .filter(c => names.some(n => (c.name || '').toLowerCase().includes(n.toLowerCase())))
            .map(c => c.id);
    };

    // 1. Fresh Arrivals (STRICTLY Manual Selection) - LIMIT 7
    const featuredProducts = safeProducts
        .filter(p => p.stock && p.isFeatured)
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)) // Show last featured first
        .slice(0, 7);

    // Original limit was 5, now 7 for all sections

    // 2. Daily Use (AI Tagged: 'daily' OR Fallback Keywords)
    const dailyIds = getCategoryIds(['dairy', 'milk', 'curd', 'paneer', 'butter', 'cheese', 'bakery', 'bread', 'essential']);
    const dailyUseProducts = safeProducts
        .filter(p => (p.smartCategory === 'daily' || dailyIds.includes(p.categoryId)) && p.stock)
        .map(p => ({ ...p, weight: p.unit, bgColor: '#eff6ff', accent: '#3b82f6' }))
        .slice(0, 7);

    // 3. Snacks (AI Tagged: 'snacks' OR Fallback Keywords)
    const snackIds = getCategoryIds(['snack', 'biscuit', 'chips', 'namkeen', 'chocolate', 'drink', 'chai']);
    const snacksProducts = safeProducts
        .filter(p => (p.smartCategory === 'snacks' || snackIds.includes(p.categoryId)) && p.stock)
        .map(p => ({ ...p, weight: p.unit, bgColor: '#fff7ed', accent: '#d97706' }))
        .slice(0, 7);

    // 4. Spices/Pulses (AI Tagged: 'cooking' OR Fallback Keywords)
    const spiceIds = getCategoryIds(['spice', 'masala', 'pulse', 'dal', 'rice', 'atta', 'oil']);
    const coursesProducts = safeProducts
        .filter(p => (p.smartCategory === 'cooking' || spiceIds.includes(p.categoryId)) && p.stock)
        .map(p => ({ ...p, weight: p.unit, bgColor: '#fefce8', accent: '#ca8a04' }))
        .slice(0, 7);

    // 5. Cleaning & Household (AI Tagged: 'household')
    const cleaningProducts = safeProducts
        .filter(p => p.smartCategory === 'household' && p.stock)
        .map(p => ({ ...p, weight: p.unit, bgColor: '#f0f9ff', accent: '#0ea5e9' }))
        .slice(0, 7);


    const handleProductPress = (item) => {
        // Updated navigation logic ensuring complete item is passed
        const navItem = {
            ...item,
            weight: item.weight || item.unit, // Fallback
        };

        if (item.type === 'weight' || item.unit === 'kg') {
            navigation.navigate('WeightProductDetails', { item: navItem });
        } else {
            navigation.navigate('ProductDetails', { item: navItem });
        }
    };

    return (
        <View style={styles.mainContainer}>
            <StatusBar barStyle="light-content" backgroundColor="#042e23" />
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 120 }}
                bounces={false}
                overScrollMode="never"
            >
                <View style={styles.headerCurveContainer} />

                <SafeAreaView style={styles.safeAreaContent}>
                    <View style={styles.headerContent}>

                        <View style={styles.topRow}>
                            <View style={styles.searchBar}>
                                <Ionicons name="search" size={20} color="#9ca3af" />
                                <TextInput
                                    placeholder={t('search_placeholder')}
                                    placeholderTextColor="#9ca3af"
                                    style={styles.searchInput}
                                />
                            </View>
                            <TouchableOpacity style={styles.cartBtn} onPress={() => navigation.navigate('Cart')}>
                                <Ionicons name="cart-outline" size={24} color="#000" />
                                {cartItemCount > 0 && (
                                    <View style={styles.badge}>
                                        <Text style={styles.badgeText}>{cartItemCount}</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        </View>

                        <View style={styles.locationSection}>
                            <Text style={styles.locationLabel}>{t('pickup_from')}</Text>
                            <View style={styles.locationRow}>
                                <Text style={styles.locationText}>{selectedShop?.name || 'Jai Malhar Store'}</Text>
                            </View>
                        </View>

                        {/* 4 Circles on the Curve Border - Dynamic from Top Categories */}
                        <View style={styles.curveIconsContainer}>
                            {(() => {
                                // 1. Get 2 Weight Categories
                                const safeCategories = Array.isArray(categories) ? categories : [];
                                const weightCats = safeCategories.filter(c => c.type === 'weight').slice(0, 2);
                                // 2. Get 2 Packet Categories (Unit)
                                const packetCats = safeCategories.filter(c => c.type === 'unit').slice(0, 2);
                                // 3. Combine (Order: Weight, Weight, Pkt, Pkt or Interleaved)
                                // Let's interleave: Weight, Pkt, Weight, Pkt
                                const curveData = [];
                                if (weightCats[0]) curveData.push(weightCats[0]);
                                if (packetCats[0]) curveData.push(packetCats[0]);
                                if (weightCats[1]) curveData.push(weightCats[1]);
                                if (packetCats[1]) curveData.push(packetCats[1]);

                                // Fallback if data is insufficient? Current dummy data has enough.

                                return curveData.map((item, index) => {
                                    // Individual position handling for each of the 4 circles
                                    let translateY = 14; // Default

                                    if (curveData.length === 4) {
                                        // Standard 4-item symmetrical curve
                                        const positions = { 0: 35, 1: 5, 2: 5, 3: 35 };
                                        translateY = positions[index] || 15;
                                    } else if (curveData.length === 2) {
                                        // Perfect sync for 2 items
                                        translateY = 15;
                                    }

                                    return (
                                        <TouchableOpacity
                                            key={(item.id || item._id || index).toString()}
                                            style={[styles.curveCircleWrapper, { transform: [{ translateY: -translateY }] }]}
                                            onPress={() => navigation.navigate('CategoryProducts', { categoryId: item.id, categoryName: item.name })}
                                            activeOpacity={0.8}
                                        >
                                            <View style={styles.curveCircle}>
                                                <View style={styles.innerCircle}>
                                                    <Ionicons name={item.icon || 'grid'} size={32} color="#f59e0b" />
                                                </View>
                                            </View>
                                            <Text style={styles.circleLabel} numberOfLines={1}>{translateProduct(item.name)}</Text>
                                        </TouchableOpacity>
                                    );
                                });
                            })()}
                        </View>

                    </View>
                </SafeAreaView>

                {/* Body Content */}
                <View style={styles.bodyContainer}>

                    {/* 'You might need' Section (Featured) */}
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>{t('fresh_arrivals')}</Text>
                        <TouchableOpacity>
                            <Text style={styles.seeMore}>{t('see_more')}</Text>
                        </TouchableOpacity>
                    </View>

                    <View>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
                        >
                            {featuredProducts.length > 0 ? featuredProducts.map((item, index) => (
                                <HomeProductCard
                                    key={(item.id || item._id || index).toString()}
                                    onPress={() => handleProductPress(item)}
                                />
                            )) : (
                                <Text style={{ marginLeft: 20, color: '#9ca3af' }}>
                                    {loading ? t('loading') : 'No products available'}
                                </Text>
                            )}
                        </ScrollView>
                    </View>

                    {/* Category Showcase Section (Horizontal) */}
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>{t('explore_categories')}</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Categories')}>
                            <Text style={styles.seeMore}>{t('see_all')}</Text>
                        </TouchableOpacity>
                    </View>

                    <View>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
                        >
                            {/* Category Showcase - Fixed 4 Cards */}
                            {(() => {
                                const SHOWCASE = [
                                    { title: t('soft_drinks'), subtitle: t('cool_fizzy'), color: '#db2777', bgColor: '#fce7f3', image: require('../assets/images/soft_drinks_v3.png'), tag: t('upto_20_off') },
                                    { title: t('spices'), subtitle: t('authentic_taste'), color: '#d97706', bgColor: '#F9E9BA', image: require('../assets/images/spices_v3.png'), tag: t('fresh_tag') },
                                    { title: t('cleaning'), subtitle: t('essentials'), color: '#0ea5e9', bgColor: '#e0f2fe', image: require('../assets/images/cleaning_v3.png'), tag: t('best_seller') },
                                    { title: t('baby_care'), subtitle: t('gentle_safe'), color: '#7c3aed', bgColor: '#ede9fe', image: require('../assets/images/baby_care_v3.png'), tag: t('trusted') },
                                ];

                                return SHOWCASE.map((item, index) => {
                                    // Find real category ID
                                    const realCat = categories.find(c => c.name.toLowerCase() === item.title.toLowerCase());
                                    const catId = realCat ? realCat.id : null;

                                    return (
                                        <CategoryShowcaseCard
                                            key={index}
                                            title={item.title}
                                            subtitle={item.subtitle}
                                            tag={item.tag}
                                            image={item.image}
                                            color={item.color}
                                            bgColor={item.bgColor}
                                            onPress={() => {
                                                if (catId) {
                                                    navigation.navigate('CategoryProducts', {
                                                        categoryId: catId,
                                                        categoryName: item.title
                                                    });
                                                } else {
                                                    alert(`Wait for Shopkeeper to add "${item.title}" category.`);
                                                }
                                            }}
                                        />
                                    );
                                });
                            })()}
                        </ScrollView>
                    </View>

                    {/* 'Daily Use' Section */}
                    {dailyUseProducts.length > 0 && (
                        <View>
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>{t('daily_use')}</Text>
                                <TouchableOpacity>
                                    <Text style={styles.seeMore}>{t('see_all')}</Text>
                                </TouchableOpacity>
                            </View>

                            <View>
                                <ScrollView
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
                                >
                                    {dailyUseProducts.map((item, index) => (
                                        <DailyItemCard
                                            key={(item.id || item._id || index).toString()}
                                            item={item}
                                            onPress={() => handleProductPress(item)}
                                        />
                                    ))}
                                </ScrollView>
                            </View>
                        </View>
                    )}

                    {/* 'Chai & Nashta' Section */}
                    {snacksProducts.length > 0 && (
                        <View>
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>{t('chai_nashta')}</Text>
                                <TouchableOpacity>
                                    <Text style={styles.seeMore}>{t('see_all')}</Text>
                                </TouchableOpacity>
                            </View>

                            <View>
                                <ScrollView
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
                                >
                                    {snacksProducts.map((item, index) => (
                                        <DailyItemCard
                                            key={(item.id || item._id || index).toString()}
                                            item={item}
                                            onPress={() => handleProductPress(item)}
                                        />
                                    ))}
                                </ScrollView>
                            </View>
                        </View>
                    )}

                    {/* 'Pulses' Section */}
                    {coursesProducts.length > 0 && (
                        <View>
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>{t('spices_pulses')}</Text>
                                <TouchableOpacity>
                                    <Text style={styles.seeMore}>{t('see_all')}</Text>
                                </TouchableOpacity>
                            </View>

                            <View>
                                <ScrollView
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
                                >
                                    {coursesProducts.map((item, index) => (
                                        <DailyItemCard
                                            key={(item.id || item._id || index).toString()}
                                            item={item}
                                            onPress={() => handleProductPress(item)}
                                        />
                                    ))}
                                </ScrollView>
                            </View>
                        </View>
                    )}

                    {/* 'Cleaning & Household' Section (AI-Powered) */}
                    {cleaningProducts.length > 0 && (
                        <View>
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>{t('household')}</Text>
                                <TouchableOpacity>
                                    <Text style={styles.seeMore}>{t('see_all')}</Text>
                                </TouchableOpacity>
                            </View>

                            <View>
                                <ScrollView
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
                                >
                                    {cleaningProducts.map((item, index) => (
                                        <DailyItemCard
                                            key={(item.id || item._id || index).toString()}
                                            item={item}
                                            onPress={() => handleProductPress(item)}
                                        />
                                    ))}
                                </ScrollView>
                            </View>
                        </View>
                    )}

                </View>

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: "#fff",
    },
    headerCurveContainer: {
        backgroundColor: "#042e23",
        width: width * 2,
        height: 420,
        borderBottomLeftRadius: width * 1.6,
        borderBottomRightRadius: width * 1.6,
        position: "absolute",
        top: -160,
        left: -(width * 0.5),
        zIndex: 0,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 18,
        elevation: 14,
    },
    safeAreaContent: {
        zIndex: 10,
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 10 : 10,
    },
    headerContent: {
        paddingHorizontal: 20,
    },
    topRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 30,
    },
    searchBar: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 999,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        height: 50,
        top: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        fontSize: 15,
        color: '#333'
    },
    cartBtn: {
        width: 50,
        height: 50,
        backgroundColor: '#fff',
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        top: 10,
    },
    badge: {
        position: 'absolute',
        top: -2,
        right: -2,
        backgroundColor: '#f97316',
        width: 20,
        height: 20,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    badgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    locationSection: {
        alignItems: 'center',
        marginTop: 0,
    },
    locationLabel: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 14,
        fontWeight: 'bold',
        letterSpacing: 1,
        marginBottom: 4,
        top: 10,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    locationText: {
        color: '#fff',
        fontSize: 22,
        fontWeight: 'bold',
        top: 10,
    },
    curveIconsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        paddingHorizontal: 0,
        marginTop: 20,
        height: 120,
        width: '100%',
        zIndex: 20,
    },
    curveCircleWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 70,
    },
    curveCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 8,
        borderWidth: 3,
        borderColor: '#f9fafb',
        marginBottom: 5,
    },
    innerCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#fffbeb',
        alignItems: 'center',
        justifyContent: 'center',
    },
    circleLabel: {
        color: '#000',
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'center',
        textShadowColor: 'rgba(0,0,0,0.3)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },
    bodyContainer: {
        flex: 1,
        marginTop: 40,
        zIndex: 0,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    seeMore: {
        fontSize: 13,
        color: '#ef4444',
        fontWeight: '600',
    }
});
