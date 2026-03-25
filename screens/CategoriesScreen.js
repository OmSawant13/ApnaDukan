import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TextInput,
    FlatList,
    ScrollView,
    StatusBar,
    Dimensions,
    TouchableOpacity,
    Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useProducts } from '../context/ProductContext';
import ProductCard from '../components/ProductCard';
import { useLanguage } from '../context/LanguageContext';

const { width } = Dimensions.get('window');
const cardWidth = (width / 2) - 24; // Increased margin for better horizontal gap

// --- INTERNAL CARD COMPONENT ---
const CategoryCard = ({ title, subtitle, tag, image, bgColor, tagColor, onPress }) => (
    <TouchableOpacity
        activeOpacity={0.8}
        style={[styles.card, { backgroundColor: bgColor }]}
        onPress={onPress}
    >
        <View style={styles.cardContent}>
            {/* Text Section - Isko zyada flex diya hai taaki text na tute */}
            <View style={styles.textSection}>
                <Text style={styles.cardTitle} numberOfLines={2} ellipsizeMode="tail">
                    {title}
                </Text>
                <Text style={styles.cardSubtitle}>{subtitle}</Text>
                <View style={styles.tagBadge}>
                    <Text style={[styles.tagText, { color: tagColor }]}>{tag}</Text>
                </View>
            </View>

            {/* Image Section */}
            <View style={styles.imageSection}>
                <Image source={image} style={styles.cardImage} resizeMode="contain" />
            </View>
        </View>
    </TouchableOpacity>
);

// --- MAIN SCREEN ---
export default function CategoriesScreen({ navigation }) {
    const { categories, products } = useProducts();
    const { t, translateProduct, bulkTranslate, currentLanguage } = useLanguage();
    const [searchQuery, setSearchQuery] = useState('');

    const query = searchQuery.toLowerCase().trim();

    const filteredCategories = categories.filter(cat =>
        (cat.name || '').toLowerCase().includes(query)
    );

    const filteredProducts = products.filter(prod =>
        (prod.name || '').toLowerCase().includes(query) && prod.stock
    );

    // AI Translation Magic - Trigger bulk translation when data or language changes
    React.useEffect(() => {
        if (categories.length > 0 || products.length > 0) {
            const categoryNames = categories.map(c => c.name);
            const productNames = products.map(p => p.name);
            bulkTranslate([...categoryNames, ...productNames]);
        }
    }, [categories, products, currentLanguage]);

    const isSearching = query.length > 0;

    const getCategoryImage = (name) => {
        const n = (name || '').toLowerCase();
        // Yahan maine snacks_cat hata diya hai taaki error na aaye
        if (n.includes('veg')) return require('../assets/images/veg_cat.png');
        if (n.includes('fruit')) return require('../assets/images/fruit_cat.png');
        if (n.includes('dairy')) return require('../assets/images/dairy_cat.png');
        if (n.includes('bakery')) return require('../assets/images/bakery_cat.png');
        // Default image for snacks and others
        return require('../assets/images/spices_v3.png');
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />
            <SafeAreaView style={{ flex: 1 }}>

                {/* HEADER */}
                <View style={styles.header}>
                    <Text style={styles.mainTitle}>{t('all_categories')}</Text>
                    <View style={styles.searchBar}>
                        <Ionicons name="search" size={18} color="#9ca3af" />
                        <TextInput
                            placeholder={t('search_placeholder')}
                            placeholderTextColor="#9ca3af"
                            style={styles.searchInput}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>
                </View>

                {/* SEARCH RESULTS OR GRID */}
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>

                    {/* CATEGORIES SECTION */}
                    {(!isSearching || filteredCategories.length > 0) && (
                        <View style={styles.section}>
                            {isSearching && <Text style={styles.sectionHeaderLabel}>{t('categories')}</Text>}
                            <View style={styles.grid}>
                                {filteredCategories.map((item, index) => (
                                    <CategoryCard
                                        key={(item.id || item._id || index).toString()}
                                        title={translateProduct(item.name)}
                                        subtitle={`${item.items || 0} ${t('items')}`}
                                        tag={item.type === 'weight' ? t('fresh') : t('packet')}
                                        image={item.image || getCategoryImage(item.name)}
                                        bgColor="#ffffff"
                                        tagColor={item.type === 'weight' ? '#059669' : '#db2777'}
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

                    {/* PRODUCTS SECTION (ONLY WHEN SEARCHING) */}
                    {isSearching && filteredProducts.length > 0 && (
                        <View style={[styles.section, { marginTop: 24 }]}>
                            <Text style={styles.sectionHeaderLabel}>{t('products')}</Text>
                            <View style={styles.productsGrid}>
                                {filteredProducts.map((item, index) => (
                                    <ProductCard
                                        key={(item.id || item._id || index).toString()}
                                        item={item}
                                        style={styles.searchProductCard}
                                        onPress={() => {
                                            if (item.type === 'weight' || item.unit === 'kg') {
                                                navigation.navigate('WeightProductDetails', { item });
                                            } else {
                                                navigation.navigate('ProductDetails', { item });
                                            }
                                        }}
                                    />
                                ))}
                            </View>
                        </View>
                    )}

                    {isSearching && filteredCategories.length === 0 && filteredProducts.length === 0 && (
                        <View style={styles.noResults}>
                            <Ionicons name="search-outline" size={48} color="#e2e8f0" />
                            <Text style={styles.noResultsText}>No matches found for "{searchQuery}"</Text>
                        </View>
                    )}

                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff', paddingTop: 35 },
    header: {
        paddingHorizontal: 16,
        paddingVertical: 14,
        backgroundColor: '#fff',
    },
    mainTitle: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 12,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 48,
        borderRadius: 12,
        paddingHorizontal: 12,
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    searchInput: {
        flex: 1,
        marginLeft: 8,
        fontSize: 16,
        color: '#111827',
    },
    list: {
        padding: 12,
        paddingBottom: 150,
    },
    section: {
        width: '100%',
    },
    sectionHeaderLabel: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 16,
        marginLeft: 4,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingHorizontal: 4, // Added slight side padding
    },
    productsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        paddingLeft: 4,
    },
    searchProductCard: {
        marginRight: 0,
        marginBottom: 12,
        width: (width - 44) / 2, // 2 column product grid in search
    },
    noResults: {
        alignItems: 'center',
        marginTop: 60,
    },
    noResultsText: {
        fontSize: 16,
        color: '#64748b',
        marginTop: 12,
        fontWeight: '500',
    },
    columnWrapper: {
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    // --- CARD STYLES ---
    card: {
        width: cardWidth,
        height: 120,
        borderRadius: 20,
        backgroundColor: '#fff',
        marginBottom: 16, // Added spacing at bottom
        overflow: 'hidden',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    cardContent: {
        flexDirection: 'row',
        flex: 1,
    },
    textSection: {
        flex: 1.0,
        justifyContent: 'center',
        paddingLeft: 18, // Shift more right
        paddingVertical: 10,
        paddingRight: 0,
    },
    cardTitle: {
        fontSize: 15,
        fontWeight: '800',
        color: '#1f2937',
        lineHeight: 18,
        marginBottom: 2,
    },
    cardSubtitle: {
        fontSize: 12,
        color: '#6b7280',
        fontWeight: '500',
        marginBottom: 6,
    },
    tagBadge: {
        backgroundColor: '#f3f4f6',
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
    },
    tagText: {
        fontSize: 10,
        fontWeight: 'bold',
    },
    imageSection: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'flex-end', // Shift image right
        paddingRight: 12, // Shift more left
    },
    cardImage: {
        width: '90%',
        height: '90%',
    },
});