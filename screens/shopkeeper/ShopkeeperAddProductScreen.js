import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Image,
    Keyboard,
    Platform,
    KeyboardAvoidingView,
    Switch,
    Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useProducts } from '../../context/ProductContext';
import { API_URL } from '../../config';
import { useShopLanguage } from '../../context/LanguageContext';

export default function ShopkeeperAddProductScreen({ route, navigation }) {
    const { categoryId, categoryType } = route.params;
    const { addProduct } = useProducts();
    const { t } = useShopLanguage();

    const [name, setName] = useState('');
    const [subtitle, setSubtitle] = useState('');
    const [price, setPrice] = useState('');
    const [stockCount, setStockCount] = useState('');
    const [isFeatured, setIsFeatured] = useState(false);

    const [image, setImage] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [isKeyboardVisible, setKeyboardVisible] = useState(false);

    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener(
            'keyboardDidShow',
            () => { setKeyboardVisible(true); }
        );
        const keyboardDidHideListener = Keyboard.addListener(
            'keyboardDidHide',
            () => { setKeyboardVisible(false); }
        );

        return () => {
            keyboardDidHideListener.remove();
            keyboardDidShowListener.remove();
        };
    }, []);

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const handleSave = async () => {
        if (!name || !price) {
            alert(t('error') || "Name and Price are required!");
            return;
        }

        let finalImageUrl = null;

        // 1. Upload Image if selected
        if (image) {
            setUploading(true);
            try {
                const formData = new FormData();
                formData.append('image', {
                    uri: image,
                    name: 'product.jpg',
                    type: 'image/jpeg',
                });

                const res = await fetch(`${API_URL}/upload`, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });

                const data = await res.json();
                if (data.imageUrl) {
                    finalImageUrl = data.imageUrl;
                }
            } catch (error) {
                console.error("Upload Failed", error);
                alert("Image Upload Failed");
                setUploading(false);
                return;
            }
            setUploading(false);
        }

        // 2. Save Product
        const productData = {
            id: Date.now().toString(),
            categoryId,
            name,
            subtitle: subtitle || (categoryType === 'weight' ? (t('kg') || '1 kg') : (t('unit') || '1 unit')),
            price: parseFloat(price),
            stockCount: parseInt(stockCount) || 0,
            image: finalImageUrl,
            unit: categoryType === 'weight' ? (t('kg') || 'kg') : (t('unit') || 'unit'),
            type: categoryType,
            isFeatured: isFeatured,
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
                <Text style={styles.title}>{t('add_item')}</Text>
                <View style={{ width: 40 }} />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0} // Adjust if needed
            >
                <ScrollView contentContainerStyle={styles.content}>

                    {/* 1. Image */}
                    <TouchableOpacity onPress={pickImage} style={styles.imagePlaceholder}>
                        {image ? (
                            <Image source={{ uri: image }} style={{ width: '100%', height: '100%', borderRadius: 20 }} />
                        ) : (
                            <>
                                <Ionicons name="camera-outline" size={40} color="#9ca3af" />
                                <Text style={styles.imageText}>{t('tap_add_photo')}</Text>
                            </>
                        )}
                    </TouchableOpacity>

                    {/* 2. Name */}
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>{t('product_name_label')}</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="..."
                            value={name}
                            onChangeText={setName}
                        />
                    </View>

                    {/* 3. Subtitle */}
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>{t('subtitle_optional')}</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="..."
                            value={subtitle}
                            onChangeText={setSubtitle}
                        />
                    </View>

                    {/* 4. Price */}
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>{t('price_label')}</Text>
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
                        <Text style={styles.label}>{t('stock_label')}</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="0"
                            keyboardType="numeric"
                            value={stockCount}
                            onChangeText={setStockCount}
                        />
                    </View>

                    {/* 6. Featured Toggle */}
                    <View style={[styles.formGroup, styles.toggleRow]}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.label}>{t('show_in_featured')}</Text>
                            <Text style={styles.toggleSub}>{t('featured_sub')}</Text>
                        </View>
                        <Switch
                            trackColor={{ false: "#D1D5DB", true: "#10B981" }}
                            thumbColor={isFeatured ? "#ffffff" : "#f4f3f4"}
                            onValueChange={setIsFeatured}
                            value={isFeatured}
                        />
                    </View>

                    <View style={{ height: 100 }} />

                </ScrollView>

                {/* Footer Inside KeyboardAvoidingView to stick above keyboard */}
                <View style={styles.footer}>
                    <TouchableOpacity
                        style={[styles.saveBtn, uploading && { opacity: 0.7 }]}
                        onPress={handleSave}
                        disabled={uploading}
                    >
                        <Text style={styles.saveText}>{uploading ? '...' : t('save_product')}</Text>
                    </TouchableOpacity>
                </View>

            </KeyboardAvoidingView>
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
        paddingTop: 38,      // Keep top space for status bar
        paddingBottom: 12,   // Reduced from 38 to 12
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
        marginTop: -40,
    },
    backBtn: { padding: 8, backgroundColor: '#f3f4f6', borderRadius: 20, marginTop: 10 },
    title: { fontSize: 18, fontWeight: '800', color: '#111827', marginTop: 10 },
    content: { padding: 24, },

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
    toggleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor: '#f3f4f6',
    },
    toggleSub: {
        fontSize: 12,
        color: '#9ca3af',
        marginLeft: 4,
        marginTop: -4,
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
