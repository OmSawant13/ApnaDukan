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

// Get screen width for the curve calculation
const { width } = Dimensions.get('window');

// Static Showcase Data (Can be dynamic later)
const CATEGORY_SHOWCASE = [
    { id: 1, title: 'Soft Drinks', subtitle: 'Cool & Fizzy', tag: 'UPTO 20% OFF', image: require('../assets/images/soft_drinks_v3.png'), color: '#db2777', bgColor: '#fce7f3', catId: '3' },
    { id: 2, title: 'Spices', subtitle: 'Authentic Taste', tag: 'Fresh', image: require('../assets/images/spices_v3.png'), color: '#d97706', bgColor: '#F9E9BA', catId: '5' },
    { id: 3, title: 'Cleaning', subtitle: 'Essentials', tag: 'Best Seller', image: require('../assets/images/cleaning_v3.png'), color: '#C2E3F7', bgColor: '#C2E3F6', catId: '6' },
    { id: 4, title: 'Baby Care', subtitle: 'Gentle & Safe', tag: 'Trusted', image: require('../assets/images/baby_care_v3.png'), color: '#D6D0EB', bgColor: '#D6D0EB', catId: '4' },
];

export default function HomeScreen({ navigation }) {
    const { products, categories } = useProducts();

    // --- Data Filtering Logic ---

    // 1. You Might Need (Random/Mix of Veg & Fruits)
    const featuredProducts = products.filter(p => (p.categoryId === '1' || p.categoryId === '2') && p.stock).slice(0, 5);

    // 2. Daily Use (Dairy & Bakery)
    const dailyUseProducts = products.filter(p => (p.categoryId === '3' || p.categoryId === '4') && p.stock).map(p => ({
        ...p,
        weight: p.unit, // Map unit to weight for card compatibility
        bgColor: '#eff6ff',
        accent: '#3b82f6'
    }));

    // 3. Snacks (Snacks Category)
    const snacksProducts = products.filter(p => p.categoryId === '6' && p.stock).map(p => ({
        ...p,
        weight: p.unit,
        bgColor: '#fff7ed',
        accent: '#d97706'
    }));

    // 4. Spices/Pulses (Spices Category)
    const coursesProducts = products.filter(p => p.categoryId === '5' && p.stock).map(p => ({
        ...p,
        weight: p.unit,
        bgColor: '#fefce8',
        accent: '#ca8a04'
    }));


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
                contentContainerStyle={{ paddingBottom: 100 }}
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
                                    placeholder='Search for "Grocery"'
                                    placeholderTextColor="#9ca3af"
                                    style={styles.searchInput}
                                />
                            </View>
                            <TouchableOpacity style={styles.cartBtn} onPress={() => navigation.navigate('Cart')}>
                                <Ionicons name="cart-outline" size={24} color="#000" />
                                <View style={styles.badge}>
                                    <Text style={styles.badgeText}>2</Text>
                                </View>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.locationSection}>
                            <Text style={styles.locationLabel}>Pickup From</Text>
                            <View style={styles.locationRow}>
                                <Text style={styles.locationText}>Jai Malhar Store</Text>
                            </View>
                        </View>

                        {/* 4 Circles on the Curve Border - Dynamic from Top Categories */}
                        <View style={styles.curveIconsContainer}>
                            {(() => {
                                // 1. Get 2 Weight Categories
                                const weightCats = categories.filter(c => c.type === 'weight').slice(0, 2);
                                // 2. Get 2 Packet Categories (Unit)
                                const packetCats = categories.filter(c => c.type === 'unit').slice(0, 2);
                                // 3. Combine (Order: Weight, Weight, Pkt, Pkt or Interleaved)
                                // Let's interleave: Weight, Pkt, Weight, Pkt
                                const curveData = [];
                                if (weightCats[0]) curveData.push(weightCats[0]);
                                if (packetCats[0]) curveData.push(packetCats[0]);
                                if (weightCats[1]) curveData.push(weightCats[1]);
                                if (packetCats[1]) curveData.push(packetCats[1]);

                                // Fallback if data is insufficient? Current dummy data has enough.

                                return curveData.map((item, index) => {
                                    const relativeIndex = index - 1.5;
                                    const translateY = Math.abs(relativeIndex) * Math.abs(relativeIndex) * 14;

                                    return (
                                        <TouchableOpacity
                                            key={item.id}
                                            style={[styles.curveCircleWrapper, { transform: [{ translateY: -translateY }] }]}
                                            onPress={() => navigation.navigate('CategoryProducts', { categoryId: item.id, categoryName: item.name })}
                                            activeOpacity={0.8}
                                        >
                                            <View style={styles.curveCircle}>
                                                <View style={styles.innerCircle}>
                                                    <Ionicons name={item.icon || 'grid'} size={32} color="#f59e0b" />
                                                </View>
                                            </View>
                                            <Text style={styles.circleLabel} numberOfLines={1}>{item.name}</Text>
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
                        <Text style={styles.sectionTitle}>Fresh Arrivals</Text>
                        <TouchableOpacity>
                            <Text style={styles.seeMore}>See more</Text>
                        </TouchableOpacity>
                    </View>

                    <View>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
                        >
                            {featuredProducts.length > 0 ? featuredProducts.map((item) => (
                                <HomeProductCard
                                    key={item.id}
                                    item={{ ...item, weight: item.unit }} // Map unit to weight
                                    onPress={() => handleProductPress(item)}
                                />
                            )) : (
                                <Text style={{ marginLeft: 20, color: '#9ca3af' }}>Start adding products from Shopkeeper Mode!</Text>
                            )}
                        </ScrollView>
                    </View>

                    {/* Category Showcase Section (Horizontal) */}
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Explore Categories</Text>
                        <TouchableOpacity>
                            <Text style={styles.seeMore}>See all</Text>
                        </TouchableOpacity>
                    </View>

                    <View>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
                        >
                            {CATEGORY_SHOWCASE.map((item) => (
                                <CategoryShowcaseCard
                                    key={item.id}
                                    title={item.title}
                                    subtitle={item.subtitle}
                                    tag={item.tag}
                                    icon={item.icon}
                                    image={item.image}
                                    color={item.color}
                                    bgColor={item.bgColor}
                                    onPress={() => console.log('Category Selected:', item.title)}
                                />
                            ))}
                        </ScrollView>
                    </View>

                    {/* 'Daily Use' Section */}
                    {dailyUseProducts.length > 0 && (
                        <View>
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>Daily Use</Text>
                                <TouchableOpacity>
                                    <Text style={styles.seeMore}>See all</Text>
                                </TouchableOpacity>
                            </View>

                            <View>
                                <ScrollView
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
                                >
                                    {dailyUseProducts.map((item) => (
                                        <DailyItemCard
                                            key={item.id}
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
                                <Text style={styles.sectionTitle}>Chai & Nashta</Text>
                                <TouchableOpacity>
                                    <Text style={styles.seeMore}>See all</Text>
                                </TouchableOpacity>
                            </View>

                            <View>
                                <ScrollView
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
                                >
                                    {snacksProducts.map((item) => (
                                        <DailyItemCard
                                            key={item.id}
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
                                <Text style={styles.sectionTitle}>Spices & Pulses</Text>
                                <TouchableOpacity>
                                    <Text style={styles.seeMore}>See all</Text>
                                </TouchableOpacity>
                            </View>

                            <View>
                                <ScrollView
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
                                >
                                    {coursesProducts.map((item) => (
                                        <DailyItemCard
                                            key={item.id}
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
