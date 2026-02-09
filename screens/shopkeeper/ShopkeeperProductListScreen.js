import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Image,
    Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useProducts } from '../../context/ProductContext';

/* -------------------------------- Product Row -------------------------------- */

const ProductRow = ({ item, incrementStock, decrementStock, toggleStock, onPress }) => {
    return (
        <TouchableOpacity
            activeOpacity={0.9}
            onPress={onPress}
            style={[styles.card, !item.stock && styles.cardDisabled]}
        >
            {/* Left: Product Image */}
            <Image source={item.image} style={[styles.img, !item.stock && { opacity: 0.5 }]} />

            {/* Center: Product Info */}
            <View style={styles.info}>
                <Text style={[styles.name, !item.stock && { color: '#9CA3AF' }]}>{item.name}</Text>
                <Text style={styles.subtitle}>{item.subtitle || item.unit}</Text>
                {!item.stock && (
                    <View style={styles.outOfStockBadge}>
                        <Text style={styles.outOfStockText}>Out of Stock</Text>
                    </View>
                )}
            </View>

            {/* Right: Price + Stock Controls */}
            <View style={styles.rightSection}>

                <View style={styles.priceRow}>
                    <Text style={styles.price}>₹{item.price}</Text>
                    <Switch
                        trackColor={{ false: "#D1D5DB", true: "#10B981" }}
                        thumbColor={item.stock ? "#ffffff" : "#f4f3f4"}
                        ios_backgroundColor="#3e3e3e"
                        onValueChange={() => toggleStock(item.id)}
                        value={item.stock}
                        style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }} // Make it slightly smaller
                    />
                </View>

                <View style={[styles.stepper, !item.stock && { opacity: 0.3 }]}>
                    <TouchableOpacity
                        style={styles.stepBtn}
                        onPress={() => decrementStock(item.id)}
                        disabled={!item.stock}
                    >
                        <Ionicons name="remove" size={18} color="#111827" />
                    </TouchableOpacity>

                    <Text style={styles.count}>{item.stockCount || 0}</Text>

                    <TouchableOpacity
                        style={[styles.stepBtn, styles.stepPlus]}
                        onPress={() => incrementStock(item.id)}
                        disabled={!item.stock}
                    >
                        <Ionicons name="add" size={18} color="#ffffff" />
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );
};

/* -------------------------- Main Screen -------------------------- */

export default function ShopkeeperProductListScreen({ route, navigation }) {
    const { categoryId, categoryName, categoryType } = route.params;
    const { products, incrementStock, decrementStock, toggleStock } = useProducts();

    const categoryProducts = products.filter(
        p => p.categoryId === categoryId
    );

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backBtn}
                >
                    <Ionicons name="arrow-back" size={22} color="#111827" />
                </TouchableOpacity>

                <Text style={styles.title}>{categoryName}</Text>

                <TouchableOpacity
                    style={styles.addBtn}
                    onPress={() =>
                        navigation.navigate('ShopkeeperAddProduct', {
                            categoryId,
                            categoryType,
                        })
                    }
                >
                    <Ionicons name="add" size={22} color="#ffffff" />
                </TouchableOpacity>
            </View>

            {/* Product List */}
            <FlatList
                data={categoryProducts}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                    <ProductRow
                        item={item}
                        incrementStock={incrementStock}
                        decrementStock={decrementStock}
                        toggleStock={toggleStock}
                        onPress={() => navigation.navigate('ShopkeeperProductDetails', { item })}
                    />
                )}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Ionicons name="cube-outline" size={42} color="#D1D5DB" />
                        <Text style={styles.emptyText}>No products yet</Text>
                        <Text style={styles.subText}>
                            Tap + to add your first product
                        </Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
}

/* ------------------------------- Styles ------------------------------- */

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },

    /* Header */
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between', // Push Add Button to right
        paddingHorizontal: 24,
        paddingTop: 20,
        paddingBottom: 24,
        backgroundColor: '#F9FAFB', // Match container
        // Removed border to match Inventory
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    backBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        // Soft Shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    title: {
        fontSize: 26, // Larger title
        fontWeight: '900',
        color: '#111827',
    },
    addBtn: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: '#111827',
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 4,
    },

    /* List */
    list: {
        padding: 16,
    },

    /* Product Card */
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        backgroundColor: '#ffffff',
        borderRadius: 14,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    cardDisabled: {
        backgroundColor: '#F9FAFB', // Gray out card when off
        borderColor: '#F3F4F6',
    },
    img: {
        width: 54,
        height: 54,
        borderRadius: 10,
        backgroundColor: '#F3F4F6',
        marginRight: 14,
    },

    /* Info */
    info: {
        flex: 1,
    },
    name: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
    },
    subtitle: {
        marginTop: 2,
        fontSize: 13,
        color: '#6B7280',
    },
    outOfStockBadge: {
        marginTop: 6,
        alignSelf: 'flex-start',
        backgroundColor: '#FEE2E2',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    outOfStockText: {
        color: '#EF4444',
        fontSize: 10,
        fontWeight: 'bold',
    },

    /* Right Section */
    rightSection: {
        alignItems: 'flex-end',
        justifyContent: 'center',
        gap: 8,
        minWidth: 100, // Ensure space for items
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 4,
    },
    price: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
    },

    /* Stepper */
    stepper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 10,
        overflow: 'hidden',
        backgroundColor: '#fff',
    },
    stepBtn: {
        width: 34,
        height: 34,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F9FAFB',
    },
    stepPlus: {
        backgroundColor: '#111827',
    },
    count: {
        width: 42,
        textAlign: 'center',
        fontSize: 15,
        fontWeight: '700',
        color: '#111827',
    },

    /* Empty State */
    empty: {
        alignItems: 'center',
        paddingTop: 80,
    },
    emptyText: {
        marginTop: 12,
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
    },
    subText: {
        marginTop: 4,
        fontSize: 14,
        color: '#9CA3AF',
    },
});
