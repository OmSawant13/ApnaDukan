import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
// Card width = (Screen Width - Padding - Gap) / 2.5 items visible
const CARD_WIDTH = width * 0.35;

export default function ProductCard({ item, onPress, style, imageHeight = 100 }) {
    const [quantity, setQuantity] = useState(0);

    const handleAdd = () => {
        if (item.type === 'weight') {
            onPress();
        } else {
            setQuantity(1);
        }
    };
    const handleIncrement = () => setQuantity(prev => prev + 1);
    const handleDecrement = () => setQuantity(prev => (prev > 1 ? prev - 1 : 0));

    return (
        <TouchableOpacity style={[styles.cardContainer, style]} onPress={onPress} activeOpacity={1}>
            {/* Image Placeholder */}
            <View style={[styles.imageContainer, { height: imageHeight }]}>
                {/* Replace with actual Image component later */}
                {/* <Image source={{ uri: item.image }} style={styles.image} resizeMode="contain" /> */}
                <Ionicons name="cube-outline" size={40} color="#cbd5e1" />
            </View>

            {/* Details */}
            <View style={styles.detailsContainer}>
                <Text style={styles.title} numberOfLines={2}>{item.name}</Text>
                <Text style={styles.weight}>{item.subtitle || item.weight}</Text>

                <View style={styles.priceRow}>
                    <Text style={styles.price}>₹{item.price}</Text>
                    {item.mrp && <Text style={styles.mrp}>₹{item.mrp}</Text>}
                </View>
            </View>

            {/* Add Button / Quantity Control */}
            <View style={styles.actionContainer}>
                {quantity === 0 ? (
                    <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
                        <Text style={styles.addText}>ADD</Text>
                        <Ionicons name="add" size={16} color="#042e23" />
                    </TouchableOpacity>
                ) : (
                    <View style={styles.quantityControl}>
                        <TouchableOpacity onPress={handleDecrement} style={styles.qtyBtn}>
                            <Ionicons name="remove" size={16} color="#fff" />
                        </TouchableOpacity>
                        <Text style={styles.qtyText}>{quantity}</Text>
                        <TouchableOpacity onPress={handleIncrement} style={styles.qtyBtn}>
                            <Ionicons name="add" size={16} color="#fff" />
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
        height: 250, // Reduced height to tighten spacing
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 10,
        marginRight: 12,
        alignItems: 'center',
        justifyContent: 'space-between', // Push content apart
        // Shadow
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#f1f5f9'
    },
    imageContainer: {
        width: '100%',
        height: 100, // Reduced from 120
        backgroundColor: '#f8fafc',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    detailsContainer: {
        width: '100%',
        alignItems: 'flex-start',
        // marginBottom: 10, // Removed to let justifyContent handle spacing
        flex: 1, // Take available space
    },
    title: {
        fontSize: 15, // Increased from 14
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 2, // Reduced slightly to pull subtitle up
        height: 40, // Restored height for consistency
    },
    weight: {
        fontSize: 13, // Increased from 12
        color: '#64748b',
        marginBottom: 4,
        top: -13, // Shift up slightly without affecting layout
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        top: -8, // Shift up slightly without affecting layout
    },
    price: {
        fontSize: 16, // Increased from 14
        fontWeight: 'bold',
        color: '#0f172a',
    },
    mrp: {
        fontSize: 11,
        color: '#94a3b8',
        textDecorationLine: 'line-through',
    },
    actionContainer: {
        width: '100%',
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f1f5f9',
        paddingVertical: 6,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        gap: 4
    },
    addText: {
        fontSize: 13, // Increased from 12
        fontWeight: 'bold',
        color: '#042e23',
    },
    quantityControl: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#042e23', // Kirana Green
        borderRadius: 6,
        paddingVertical: 4,
        paddingHorizontal: 4,
    },
    qtyBtn: {
        padding: 2,
    },
    qtyText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    }
});
