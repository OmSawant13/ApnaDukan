import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    StatusBar,
    SafeAreaView,
    Dimensions, // Added Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useProducts } from '../context/ProductContext';
import ProductCard from '../components/ProductCard';

const { width } = Dimensions.get('window');
const SPACING = 12; // Gap between cards
const PADDING = 16; // Side padding
const itemWidth = (width - (PADDING * 2) - SPACING) / 2;

export default function CategoryProductsScreen({ navigation, route }) {
    const { categoryId, categoryName } = route.params;
    const { products } = useProducts();

    const categoryProducts = products.filter(
        p => p.categoryId === categoryId && p.stock
    );

    const handleProductPress = (item) => {
        const navItem = {
            ...item,
            weight: item.weight || item.unit,
        };

        if (item.type === 'weight' || item.unit === 'kg') {
            navigation.navigate('WeightProductDetails', { item: navItem });
        } else {
            navigation.navigate('ProductDetails', { item: navItem });
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />

            <SafeAreaView style={{ flex: 1 }}>
                {/* HEADER */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" size={22} color="#111827" />
                    </TouchableOpacity>

                    <Text style={styles.headerTitle}>{categoryName}</Text>

                    <View style={{ width: 22 }} />
                </View>

                {/* GRID */}
                <FlatList
                    data={categoryProducts}
                    keyExtractor={(item) => item.id}
                    numColumns={2}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.list}
                    columnWrapperStyle={{ justifyContent: 'space-between' }}
                    renderItem={({ item }) => (
                        <View style={styles.card}>
                            <ProductCard
                                item={{ ...item, weight: item.unit }}
                                onPress={() => handleProductPress(item)}
                                style={{ width: '100%', marginRight: 0 }}
                            />
                        </View>
                    )}
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <Text style={styles.emptyText}>
                                No products found in this category
                            </Text>
                        </View>
                    }
                />
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
        paddingTop: 5,
    },

    header: {
        height: 80,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },

    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
        textTransform: 'capitalize',
    },

    list: {
        paddingHorizontal: PADDING,
        paddingTop: 12,
        paddingBottom: 20,
    },

    card: {
        width: itemWidth,
        marginBottom: 12, // vertical spacing
    },

    empty: {
        marginTop: 80,
        alignItems: 'center',
    },

    emptyText: {
        fontSize: 15,
        color: '#94a3b8',
    },
});
