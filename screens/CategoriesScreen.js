import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TextInput,
    ScrollView,
    StatusBar,
    Dimensions,
    TouchableOpacity,
    Image,
    Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useProducts } from '../context/ProductContext';
import ProductCard from '../components/ProductCard';
import { useLanguage } from '../context/LanguageContext';

const { width } = Dimensions.get('window');
// 2 Columns with 12px gap and 20px screen padding
const GRID_SPACING = 12;
const SCREEN_PADDING = 20;
const CARD_WIDTH = (width - (SCREEN_PADDING * 2) - GRID_SPACING) / 2;

// ─── Staggered animated wrapper ───────────────────────────────────
const FadeSlide = ({ children, delay = 0 }) => {
    const opacity = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(15)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(opacity, {
                toValue: 1, duration: 400, delay, useNativeDriver: true,
            }),
            Animated.timing(translateY, {
                toValue: 0, duration: 400, delay, useNativeDriver: true,
            }),
        ]).start();
    }, []);

    return (
        <Animated.View style={{ opacity, transform: [{ translateY }] }}>
            {children}
        </Animated.View>
    );
};

// ─── Category Tile (2-Column Grid) ────────────────────────────────
const CategoryTile = ({ title, image, tagBg, onPress, index }) => (
    <FadeSlide delay={index * 50}>
        <TouchableOpacity
            activeOpacity={0.85}
            style={styles.tile}
            onPress={onPress}
        >
            <View style={[styles.tileIconBox, { backgroundColor: tagBg }]}>
                <Image source={image} style={styles.tileImage} resizeMode="contain" />
            </View>
            <Text 
                style={styles.tileTitle} 
                numberOfLines={1} 
                adjustsFontSizeToFit={true}
                minimumFontSize={12}
            >
                {title}
            </Text>
        </TouchableOpacity>
    </FadeSlide>
);

// ─── Main Screen ───────────────────────────────────────────────────
export default function CategoriesScreen({ navigation }) {
    const { categories, products } = useProducts();
    const { t, translateProduct, bulkTranslate, currentLanguage } = useLanguage();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchFocused, setSearchFocused] = useState(false);

    const query = searchQuery.toLowerCase().trim();
    const isSearching = query.length > 0;

    const filteredCategories = categories.filter(cat =>
        (cat.name || '').toLowerCase().includes(query)
    );

    const filteredProducts = products.filter(prod =>
        (prod.name || '').toLowerCase().includes(query) && prod.stock
    );

    React.useEffect(() => {
        if (categories.length > 0 || products.length > 0) {
            bulkTranslate([
                ...categories.map(c => c.name),
                ...products.map(p => p.name),
            ]);
        }
    }, [categories, products, currentLanguage]);

    const getCategoryImage = (name) => {
        const n = (name || '').toLowerCase();
        if (n.includes('veg')) return require('../assets/images/veg_cat.png');
        if (n.includes('fruit')) return require('../assets/images/fruit_cat.png');
        if (n.includes('dairy')) return require('../assets/images/dairy_cat.png');
        if (n.includes('bakery')) return require('../assets/images/bakery_cat.png');
        return require('../assets/images/spices_v3.png');
    };

    const getTagBg = (type) => (
        type === 'weight' ? '#f0fdf4' : '#f8fafc'
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />
            <SafeAreaView style={{ flex: 1 }}>

                {/* ── HEADER ───────────────────────────────────── */}
                <View style={styles.header}>
                    <View style={styles.headerTop}>
                        <View>
                            <Text style={styles.headerTitle}>{t('all_categories')}</Text>
                            <View style={styles.subLine}>
                                <View style={styles.activeDot} />
                                <Text style={styles.subText}>{categories.length} item types</Text>
                            </View>
                        </View>
                    </View>

                    {/* Search Bar */}
                    <View style={[
                        styles.searchWrap,
                        searchFocused && styles.searchWrapFocused,
                    ]}>
                        <Ionicons
                            name="search-sharp"
                            size={18}
                            color={searchFocused ? '#059669' : '#94a3b8'}
                        />
                        <TextInput
                            placeholder={t('search_placeholder') || 'Search everything...'}
                            placeholderTextColor="#94a3b8"
                            style={styles.searchInput}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            onFocus={() => setSearchFocused(true)}
                            onBlur={() => setSearchFocused(false)}
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery('')}>
                                <Ionicons name="close-circle" size={18} color="#cbd5e1" />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* ── CONTENT ──────────────────────────────────── */}
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >

                    {/* CATEGORIES GRID */}
                    {(!isSearching || filteredCategories.length > 0) && (
                        <View style={styles.section}>
                            <View style={styles.grid}>
                                {filteredCategories.map((item, index) => (
                                    <CategoryTile
                                        key={(item.id || item._id || index).toString()}
                                        index={index}
                                        title={translateProduct(item.name)}
                                        image={item.image || getCategoryImage(item.name)}
                                        tagBg={getTagBg(item.type)}
                                        onPress={() =>
                                            navigation.navigate('CategoryProducts', {
                                                categoryId: item.id,
                                                categoryName: item.name,
                                                categoryType: item.type,
                                            })
                                        }
                                    />
                                ))}
                            </View>
                        </View>
                    )}

                    {/* PRODUCTS (SEARCH ONLY) */}
                    {isSearching && filteredProducts.length > 0 && (
                        <View style={[styles.section, { marginTop: 24 }]}>
                            <Text style={styles.sectionLabel}>
                                {t('products')}
                                <Text style={styles.sectionCount}> ({filteredProducts.length})</Text>
                            </Text>
                            <View style={styles.productsGrid}>
                                {filteredProducts.map((item, index) => (
                                    <ProductCard
                                        key={(item.id || item._id || index).toString()}
                                        item={item}
                                        onPress={() => {
                                            if (item.type === 'weight') {
                                                navigation.navigate('WeightProductDetails', { item });
                                            } else {
                                                navigation.navigate('ProductDetails', { item });
                                            }
                                        }}
                                        containerStyle={styles.searchProductCard}
                                    />
                                ))}
                            </View>
                        </View>
                    )}

                    {/* EMPTY STATE */}
                    {isSearching && filteredCategories.length === 0 && filteredProducts.length === 0 && (
                        <View style={styles.emptyWrap}>
                            <Ionicons name="search-outline" size={48} color="#e2e8f0" />
                            <Text style={styles.emptyTitle}>Nothing Found</Text>
                            <Text style={styles.emptySubtitle}>Try searching for something else</Text>
                        </View>
                    )}

                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

// ─── Styles ───────────────────────────────────────────────────────
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },

    // Header
    header: {
        paddingHorizontal: 20,
        paddingTop: 45,
        paddingBottom: 20,
        backgroundColor: '#fff',
    },
    headerTop: {
        marginBottom: 16,
    },
    headerTitle: {
        fontSize: 30,
        fontWeight: '900',
        color: '#0f172a',
        letterSpacing: -0.8,
    },
    subLine: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
        gap: 6,
    },
    activeDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#059669',
    },
    subText: {
        fontSize: 13,
        color: '#64748b',
        fontWeight: '700',
    },

    // Search
    searchWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 52,
        borderRadius: 16,
        paddingHorizontal: 16,
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#f1f5f9',
        gap: 12,
    },
    searchWrapFocused: {
        borderColor: '#059669',
        backgroundColor: '#fff',
        shadowColor: '#059669',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 4,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#0f172a',
        fontWeight: '600',
    },

    // Scroll
    scrollContent: {
        paddingHorizontal: SCREEN_PADDING,
        paddingBottom: 160,
    },

    // Grid
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: GRID_SPACING,
    },

    // ── Category Tile (2-Column Grid) ──
    tile: {
        width: CARD_WIDTH,
        alignItems: 'center',
        marginBottom: 20,
    },
    tileIconBox: {
        width: CARD_WIDTH,
        height: CARD_WIDTH - 20, // Slightly landscape rounded box
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#f1f5f9',
        // Soft shadow
        shadowColor: '#64748b',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.04,
        shadowRadius: 10,
        elevation: 2,
    },
    tileImage: {
        width: '70%',
        height: '70%',
    },
    tileTitle: {
        fontSize: 14,
        fontWeight: '900',
        color: '#1e293b',
        textAlign: 'center',
        paddingHorizontal: 4,
        letterSpacing: -0.3,
    },

    // Search Results Section
    section: { width: '100%' },
    sectionLabel: {
        fontSize: 18,
        fontWeight: '900',
        color: '#1e293b',
        marginBottom: 12,
    },
    sectionCount: {
        color: '#94a3b8',
    },
    productsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: GRID_SPACING,
    },
    searchProductCard: {
        marginRight: 0,
        marginBottom: 0,
        width: (width - (SCREEN_PADDING * 2) - GRID_SPACING) / 2,
    },

    // Empty
    emptyWrap: {
        alignItems: 'center',
        paddingTop: 80,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '900',
        color: '#0f172a',
        marginTop: 12,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#94a3b8',
        fontWeight: '600',
        marginTop: 4,
    },
});