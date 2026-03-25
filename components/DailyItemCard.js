import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.32; // Comfortable width

import { useLanguage } from '../context/LanguageContext';
import { useOrders } from '../context/OrderContext';

export default function DailyItemCard({ item, onPress }) {
    const { t, translateProduct } = useLanguage();
    const { cart, addToCart, removeFromCart, updateQuantity } = useOrders();
    
    // Find if this item is in global cart
    const cartItem = cart.find(i => i.id === (item.id || item._id));
    const quantity = cartItem ? cartItem.quantity : 0;
    const isWeightBased = item.type === 'weight' || item.unit === 'kg';

    const handleAdd = () => {
        if (isWeightBased) {
            onPress(); // Navigate to weight calculator
        } else {
            addToCart(item);
        }
    };

    const handleIncrement = () => {
        if (!isWeightBased) {
            updateQuantity(item.id || item._id, 1);
        }
    };

    const handleDecrement = () => {
        if (!isWeightBased) {
            updateQuantity(item.id || item._id, -1);
        }
    };

    // Fallback accent color if not provided
    const accentColor = item.accent || '#166534';

    return (
        <TouchableOpacity
            style={styles.cardContainer}
            onPress={onPress}
            activeOpacity={0.9}
        >
            {/* Top Section: Image & Info */}
            <View>
                <View style={styles.imageContainer}>
                    {item.image ? (
                        <Image source={item.image} style={styles.image} resizeMode="cover" />
                    ) : (
                        <Ionicons name="cube-outline" size={36} color="#cbd5e1" />
                    )}
                </View>

                <Text style={styles.title} numberOfLines={1}>{translateProduct(item.name)}</Text>
                <Text style={styles.weight}>
                    {translateProduct(item.subtitle) || translateProduct(item.weight)}
                    {(!item.subtitle && !item.weight && item.unit) ? t(item.unit) : ''}
                </Text>
            </View>

            {/* Bottom Section: Price & Action */}
            <View style={styles.bottomSection}>
                <View style={styles.priceRow}>
                    <Text style={styles.price}>₹{item.price}</Text>
                    {item.mrp && <Text style={styles.mrp}>₹{item.mrp}</Text>}
                </View>

                {/* PCS items show counter, Weight items always show ADD button */}
                {(quantity === 0 || isWeightBased) ? (
                    <TouchableOpacity
                        style={[styles.addButton, { borderColor: accentColor }]}
                        onPress={handleAdd}
                    >
                        <Text style={[styles.addText, { color: accentColor }]}>
                            {isWeightBased && cartItem ? t('added_to_cart') : t('add')}
                        </Text>
                    </TouchableOpacity>
                ) : (
                    <View style={[styles.qtyControl, { backgroundColor: accentColor }]}>
                        <TouchableOpacity onPress={handleDecrement} style={styles.qtyBtn}>
                            <Ionicons name="remove" size={14} color="#fff" />
                        </TouchableOpacity>
                        <Text style={styles.qtyText}>{quantity}</Text>
                        <TouchableOpacity onPress={handleIncrement} style={styles.qtyBtn}>
                            <Ionicons name="add" size={14} color="#fff" />
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    cardContainer: {
        width: CARD_WIDTH,
        height: 220, // Increased height as requested
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 10,
        marginRight: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        justifyContent: 'space-between', // Restored spacing
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    imageContainer: {
        width: '100%',
        height: 70, // Increased height
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8fafc',
        borderRadius: 8,
        marginBottom: 8,
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    title: {
        fontSize: 14, // Increased from 13
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 2,
    },
    weight: {
        fontSize: 12, // Increased from 11
        color: '#64748b',
    },
    bottomSection: {
        gap: 8, // Space between Price and Button
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    price: {
        fontSize: 14,
        fontWeight: '700',
        color: '#0f172a',
    },
    mrp: {
        fontSize: 11,
        color: '#94a3b8',
        textDecorationLine: 'line-through',
    },
    addButton: {
        width: '100%', // Full width button
        paddingVertical: 6,
        borderRadius: 8,
        borderWidth: 1.5,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    addText: {
        fontSize: 12,
        fontWeight: '800',
    },
    qtyControl: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%', // Full width control
        borderRadius: 8,
        paddingVertical: 6,
        paddingHorizontal: 8,
    },
    qtyBtn: {
        padding: 2,
    },
    qtyText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: 'bold',
    }
});
