import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useProducts } from '../../context/ProductContext';

export default function ShopkeeperAddProductScreen({ route, navigation }) {
    const { categoryId, categoryType } = route.params;
    const { addProduct } = useProducts();

    const [name, setName] = useState('');
    const [subtitle, setSubtitle] = useState('');
    const [price, setPrice] = useState('');
    const [stockCount, setStockCount] = useState('');

    // Placeholder image logic (can be expanded later)
    const defaultImage = require('../../assets/Panipuri.jpeg'); // Using a fallback asset for now

    const handleSave = () => {
        if (!name || !price) return;

        const productData = {
            id: Date.now().toString(),
            categoryId,
            name,
            subtitle: subtitle || (categoryType === 'weight' ? '1 kg' : '1 unit'),
            price: parseFloat(price),
            stockCount: parseInt(stockCount) || 0,
            image: defaultImage,
            unit: categoryType === 'weight' ? 'kg' : 'unit', // For internal logic if needed
            type: categoryType, // Explicitly save type
        };

        addProduct(productData);
        navigation.goBack();
    };

    const isWeight = categoryType === 'weight';

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#111827" />
                </TouchableOpacity>
                <Text style={styles.title}>Add {isWeight ? 'Weight' : 'Packet'} Item</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>

                {/* 1. Image */}
                <View style={styles.imagePlaceholder}>
                    <Ionicons name="image-outline" size={40} color="#9ca3af" />
                    <Text style={styles.imageText}>Product Image</Text>
                </View>

                {/* 2. Name */}
                <View style={styles.formGroup}>
                    <Text style={styles.label}>Product Name</Text>
                    <TextInput
                        style={styles.input}
                        placeholder={isWeight ? "e.g. Potato" : "e.g. Amul Dahi"}
                        value={name}
                        onChangeText={setName}
                    />
                </View>

                {/* 3. Subtitle */}
                <View style={styles.formGroup}>
                    <Text style={styles.label}>Subtitle (Optional)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder={isWeight ? "e.g. ₹20 / kg" : "e.g. 500 ml"}
                        value={subtitle}
                        onChangeText={setSubtitle}
                    />
                </View>

                {/* 4. Price */}
                <View style={styles.formGroup}>
                    <Text style={styles.label}>{isWeight ? "Price per kg (₹)" : "Price per unit (₹)"}</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="0"
                        keyboardType="numeric"
                        value={price}
                        onChangeText={setPrice}
                    />
                </View>

                {/* 5. Stock */}
                <View style={styles.formGroup}>
                    <Text style={styles.label}>{isWeight ? "Available Weight (kg)" : "Available Quantity (units)"}</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="0"
                        keyboardType="numeric"
                        value={stockCount}
                        onChangeText={setStockCount}
                    />
                </View>

            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                    <Text style={styles.saveText}>Save Product</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f9fafb' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    backBtn: { padding: 8, backgroundColor: '#f3f4f6', borderRadius: 20 },
    title: { fontSize: 18, fontWeight: '800', color: '#111827' },
    content: { padding: 24 },

    imagePlaceholder: {
        width: 120, // Bigger
        height: 120,
        backgroundColor: '#fff',
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 30,
        alignSelf: 'center',
        borderWidth: 1.5,
        borderColor: '#e5e7eb',
        borderStyle: 'dashed',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    imageText: { fontSize: 13, color: '#6b7280', marginTop: 8, fontWeight: '600' },

    formGroup: { marginBottom: 24 },
    label: { fontSize: 14, fontWeight: '700', color: '#374151', marginBottom: 10, marginLeft: 4 },
    input: {
        backgroundColor: '#fff',
        borderWidth: 1.5, // slightly thicker
        borderColor: '#f3f4f6', // Subtle border
        borderRadius: 16, // More rounded
        padding: 16,
        fontSize: 16,
        color: '#111827',
        // Shadow for inputs
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 2,
    },

    footer: {
        padding: 24,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#f3f4f6'
    },
    saveBtn: {
        backgroundColor: '#111827', // Black
        height: 56, // Taller button
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#111827',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 5
    },
    saveText: { color: '#fff', fontSize: 18, fontWeight: '800' }
});
