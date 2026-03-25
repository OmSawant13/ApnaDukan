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
    KeyboardAvoidingView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useProducts, AVAILABLE_ASSETS, ASSET_MAP } from '../../context/ProductContext';
import { API_URL } from '../../config';
import { useShopLanguage } from '../../context/LanguageContext';

export default function ShopkeeperAddCategoryScreen({ navigation }) {
    const { addCategory } = useProducts();
    const { t } = useShopLanguage();

    const [newCategoryName, setNewCategoryName] = useState('');
    const [newCategoryType, setNewCategoryType] = useState('weight');
    const [image, setImage] = useState(null); // Local URI for upload
    const [selectedAsset, setSelectedAsset] = useState(null); // Key for predefined asset
    const [uploading, setUploading] = useState(false);
    const [isKeyboardVisible, setKeyboardVisible] = useState(false);

    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
        const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
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
            setSelectedAsset(null); // Clear asset selection if uploading custom
        }
    };

    const selectAsset = (assetKey) => {
        setSelectedAsset(assetKey);
        setImage(null); // Clear custom upload if selecting asset
    };

    const handleAddCategory = async () => {
        if (!newCategoryName.trim()) return;

        let finalImage = null;
        setUploading(true);

        if (selectedAsset) {
            finalImage = selectedAsset; // Save key directly
        } else if (image) {
            // Upload Logic
            try {
                const formData = new FormData();
                formData.append('image', {
                    uri: image,
                    name: 'category.jpg',
                    type: 'image/jpeg',
                });

                const res = await fetch(`${API_URL}/upload`, {
                    method: 'POST',
                    body: formData,
                    headers: { 'Content-Type': 'multipart/form-data' },
                });

                const data = await res.json();
                if (data.imageUrl) finalImage = data.imageUrl;
            } catch (error) {
                console.error("Upload Failed", error);
            }
        }

        await addCategory(newCategoryName.trim(), newCategoryType, finalImage);
        setUploading(false);
        navigation.goBack();
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
            <View style={styles.header}>
                <Text style={styles.title}>{t('new_category')}</Text>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
                    <Ionicons name="close" size={24} color="#111827" />
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.content}>

                    <Text style={styles.label}>{t('choose_icon')}</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.assetScroll}>
                        {AVAILABLE_ASSETS.map((key) => (
                            <TouchableOpacity
                                key={key}
                                onPress={() => selectAsset(key)}
                                style={[styles.assetItem, selectedAsset === key && styles.selectedAsset]}
                            >
                                <Image source={ASSET_MAP[key]} style={styles.assetImage} />
                                {selectedAsset === key && (
                                    <View style={styles.checkBadge}>
                                        <Ionicons name="checkmark" size={12} color="#fff" />
                                    </View>
                                )}
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    <Text style={styles.separatorText}>— {t('upload_custom')} —</Text>

                    {/* Image Picker */}
                    <TouchableOpacity onPress={pickImage} style={[styles.imagePlaceholder, image && styles.imageSelected]}>
                        {image ? (
                            <Image source={{ uri: image }} style={styles.cardImage} />
                        ) : (
                            <View style={styles.placeholderContent}>
                                <Ionicons name="cloud-upload-outline" size={32} color="#9ca3af" />
                                <Text style={styles.imageText}>{t('upload_gallery')}</Text>
                            </View>
                        )}
                        {/* Clear Button if image selected */}
                        {image && (
                            <TouchableOpacity style={styles.clearImageBtn} onPress={() => setImage(null)}>
                                <Ionicons name="close-circle" size={24} color="#ef4444" />
                            </TouchableOpacity>
                        )}
                    </TouchableOpacity>

                    <Text style={styles.label}>{t('category_name_label')}</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="..."
                        value={newCategoryName}
                        onChangeText={setNewCategoryName}
                        autoFocus
                    />

                    <Text style={styles.label}>{t('how_to_sell')}</Text>
                    <View style={styles.typeRow}>
                        <TouchableOpacity
                            style={[
                                styles.typeOption,
                                newCategoryType === 'weight' && styles.activeType,
                            ]}
                            onPress={() => setNewCategoryType('weight')}
                        >
                            <Ionicons
                                name="scale"
                                size={28}
                                color={newCategoryType === 'weight' ? '#0F172A' : '#9ca3af'}
                            />
                            <View>
                                <Text style={[styles.typeTitle, newCategoryType === 'weight' && styles.activeText]}>
                                    {t('weight_based_title')}
                                </Text>
                                <Text style={styles.typeSub}>{t('kg') || 'kg'}, {t('g') || 'g'}</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.typeOption,
                                newCategoryType === 'unit' && styles.activeType,
                            ]}
                            onPress={() => setNewCategoryType('unit')}
                        >
                            <Ionicons
                                name="cube"
                                size={28}
                                color={newCategoryType === 'unit' ? '#0F172A' : '#9ca3af'}
                            />
                            <View>
                                <Text style={[styles.typeTitle, newCategoryType === 'unit' && styles.activeText]}>
                                    {t('item_based_title')}
                                </Text>
                                <Text style={styles.typeSub}>{t('unit') || 'Unit'}, Piece</Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                    <View style={{ height: 100 }} />
                    {/* Extra Space for scrolling */}

                </ScrollView>
            </KeyboardAvoidingView>

            {/* Footer - Hides when keyboard is visible */}
            {!isKeyboardVisible && (
                <View style={styles.footer}>
                    <TouchableOpacity
                        style={[styles.saveBtn, (!newCategoryName.trim() || uploading) && { opacity: 0.5 }]}
                        onPress={handleAddCategory}
                        disabled={!newCategoryName.trim() || uploading}
                    >
                        <Text style={styles.saveText}>{uploading ? '...' : t('create_category_btn')}</Text>
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingVertical: 30, // Big Jump
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    title: {
        fontSize: 24,
        fontWeight: '900',
        color: '#111827',
    },
    closeBtn: {
        padding: 8,
        backgroundColor: '#f3f4f6',
        borderRadius: 20,
    },
    content: {
        padding: 24,
    },
    imagePlaceholder: {
        width: '100%',
        height: 180,
        backgroundColor: '#f9fafb',
        borderRadius: 20,
        borderWidth: 2,
        borderColor: '#e5e7eb',
        borderStyle: 'dashed',
        marginBottom: 24,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden'
    },
    placeholderContent: {
        alignItems: 'center',
        gap: 8
    },
    imageText: {
        color: '#9ca3af',
        fontWeight: '600'
    },
    cardImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover'
    },
    label: {
        fontSize: 14,
        fontWeight: '700',
        color: '#374151',
        marginBottom: 12,
        marginTop: 10,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    input: {
        backgroundColor: '#f9fafb',
        borderWidth: 1.5,
        borderColor: '#e5e7eb',
        borderRadius: 16,
        padding: 18,
        fontSize: 18,
        color: '#111827',
        marginBottom: 30,
    },
    typeRow: {
        gap: 16,
    },
    typeOption: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        padding: 20,
        backgroundColor: '#fff',
        borderWidth: 1.5,
        borderColor: '#e5e7eb',
        borderRadius: 20,
    },
    activeType: {
        borderColor: '#0F172A',
        backgroundColor: '#f8fafc',
    },
    typeTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#6b7280',
    },
    activeText: {
        color: '#0F172A',
    },
    typeSub: {
        fontSize: 13,
        color: '#9ca3af',
        marginTop: 2,
    },
    footer: {
        padding: 24,
        borderTopWidth: 1,
        borderTopColor: '#f3f4f6',
        backgroundColor: '#fff' // Ensure it has background to cover anything if needed
    },
    saveBtn: {
        backgroundColor: '#0F172A',
        height: 56,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    saveText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '800',
    },
    // New Styles for Asset Picker
    assetScroll: {
        marginBottom: 30,
    },
    assetItem: {
        width: 80,
        height: 80,
        borderRadius: 12,
        backgroundColor: '#f3f4f6',
        marginRight: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
        overflow: 'hidden'
    },
    selectedAsset: {
        borderColor: '#0F172A', // Highlight selection
        backgroundColor: '#e2e8f0'
    },
    assetImage: {
        width: '80%',
        height: '80%',
        resizeMode: 'contain'
    },
    checkBadge: {
        position: 'absolute',
        top: 4,
        right: 4,
        backgroundColor: '#0F172A',
        borderRadius: 10,
        width: 20,
        height: 20,
        alignItems: 'center',
        justifyContent: 'center'
    },
    separatorText: {
        textAlign: 'center',
        fontSize: 14,
        fontWeight: '600',
        color: '#9ca3af',
        marginBottom: 20
    },
    imageSelected: {
        borderColor: '#0F172A',
        backgroundColor: '#fff',
        borderStyle: 'solid'
    },
    clearImageBtn: {
        position: 'absolute',
        top: -10,
        right: -10,
        backgroundColor: '#fff',
        borderRadius: 15
    }
});
