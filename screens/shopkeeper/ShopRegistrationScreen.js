import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    SafeAreaView,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Alert,
    ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useShop } from '../../context/ShopContext';
import { useShopLanguage } from '../../context/LanguageContext';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'react-native';

const LANGUAGES = [
    { id: 'en', label: 'English', sub: 'Default' },
    { id: 'hi', label: 'हिन्दी', sub: 'Hindi' },
    { id: 'mr', label: 'मराठी', sub: 'Marathi' },
    { id: 'hg', label: 'Hinglish', sub: 'Hindi + English' },
];

const ShopRegistrationScreen = () => {
    const { registerShop } = useShop();
    const { t, currentLanguage, changeLanguage } = useShopLanguage();
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [fetchingLocation, setFetchingLocation] = useState(false);

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to make this work!');
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
            base64: true,
        });

        if (!result.canceled) {
            setImage(`data:image/jpeg;base64,${result.assets[0].base64}`);
        }
    };

    const handleRegister = async () => {
        if (!name.trim() || !address.trim()) {
            Alert.alert('Error', 'Please enter shop name and address');
            return;
        }

        setLoading(true);
        try {
            const success = await registerShop(name, address, image);
            if (!success) {
                Alert.alert('Error', 'Failed to register shop. Please try again.');
            }
        } catch (err) {
            Alert.alert('Error', err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchLocation = async () => {
        setFetchingLocation(true);
        try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Denied', 'Permission to access location was denied');
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            const [reverseGeocode] = await Location.reverseGeocodeAsync({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude
            });

            if (reverseGeocode) {
                const fullAddress = `${reverseGeocode.name || ''}, ${reverseGeocode.street || ''}, ${reverseGeocode.city || ''}, ${reverseGeocode.region || ''}, ${reverseGeocode.postalCode || ''}`.replace(/^, |, $/g, '').replace(/, ,/g, ',');
                setAddress(fullAddress);
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Could not fetch live location.');
        } finally {
            setFetchingLocation(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.header}>
                        <TouchableOpacity onPress={pickImage} style={styles.imageSelector}>
                            {image ? (
                                <View style={styles.shopImageContainer}>
                                    <Image source={{ uri: image }} style={styles.shopImage} />
                                    <View style={styles.editBadge}>
                                        <Ionicons name="camera" size={12} color="#fff" />
                                    </View>
                                </View>
                            ) : (
                                <View style={styles.iconContainer}>
                                    <Ionicons name="storefront" size={40} color="#16a34a" />
                                    <View style={styles.addBadge}>
                                        <Ionicons name="add" size={14} color="#fff" />
                                    </View>
                                </View>
                            )}
                        </TouchableOpacity>
                        <Text style={styles.title}>{t('register_shop')}</Text>
                        <Text style={styles.subtitle}>{t('register_shop_desc')}</Text>
                        <TouchableOpacity onPress={pickImage}>
                            <Text style={styles.imageActionText}>
                                {image ? t('change_image') : t('add_shop_image')}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.form}>
                        {/* Shop Name */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>{t('shop_name')}</Text>
                            <TextInput
                                style={styles.input}
                                placeholder={t('shop_name_placeholder')}
                                value={name}
                                onChangeText={setName}
                                placeholderTextColor="#94a3b8"
                            />
                        </View>

                        {/* Shop Address */}
                        <View style={styles.inputGroup}>
                            <View style={styles.labelRow}>
                                <Text style={styles.label}>{t('shop_address')}</Text>
                                <TouchableOpacity
                                    onPress={fetchLocation}
                                    style={styles.locationBtn}
                                    disabled={fetchingLocation}
                                >
                                    {fetchingLocation ? (
                                        <ActivityIndicator size="small" color="#16a34a" />
                                    ) : (
                                        <>
                                            <Ionicons name="location" size={14} color="#16a34a" />
                                            <Text style={styles.locationBtnText}>{t('fetch_location')}</Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                            </View>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                placeholder={t('shop_address_placeholder')}
                                value={address}
                                onChangeText={setAddress}
                                multiline
                                numberOfLines={3}
                                placeholderTextColor="#94a3b8"
                            />
                        </View>

                        {/* Language Selection */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>{t('select_lang')}</Text>
                            <View style={styles.langGrid}>
                                {LANGUAGES.map((lang) => (
                                    <TouchableOpacity
                                        key={lang.id}
                                        style={[
                                            styles.langBtn,
                                            currentLanguage === lang.id && styles.langBtnActive
                                        ]}
                                        onPress={() => changeLanguage(lang.id)}
                                    >
                                        <Text style={[
                                            styles.langBtnText,
                                            currentLanguage === lang.id && styles.langBtnTextActive
                                        ]}>{lang.label}</Text>
                                        <Text style={styles.langBtnSub}>{lang.sub}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <TouchableOpacity
                            style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
                            onPress={handleRegister}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.submitBtnText}>{t('create_store')}</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollContent: {
        padding: 24,
    },
    header: {
        alignItems: 'center',
        marginTop: 40,
        marginBottom: 40,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#dcfce7',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
        position: 'relative',
    },
    imageSelector: {
        marginBottom: 8,
    },
    shopImageContainer: {
        width: 80,
        height: 80,
        marginBottom: 12,
        position: 'relative',
    },
    shopImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#f1f5f9',
    },
    addBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#16a34a',
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    editBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#475569',
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageActionText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#16a34a',
        marginTop: 4,
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        color: '#1e293b',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 15,
        color: '#64748b',
        textAlign: 'center',
        lineHeight: 22,
        paddingHorizontal: 20,
    },
    form: {
        flex: 1,
    },
    inputGroup: {
        marginBottom: 24,
    },
    labelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#475569',
        marginBottom: 8,
    },
    locationBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    locationBtnText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#16a34a',
    },
    input: {
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: '#1e293b',
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    submitBtn: {
        backgroundColor: '#16a34a',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 10,
        shadowColor: '#16a34a',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    submitBtnDisabled: {
        backgroundColor: '#94a3b8',
    },
    submitBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    langGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    langBtn: {
        flex: 1,
        minWidth: '45%',
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: '#f1f5f9',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
    },
    langBtnActive: {
        borderColor: '#16a34a',
        backgroundColor: '#f0fdf4',
    },
    langBtnText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#475569',
    },
    langBtnTextActive: {
        color: '#16a34a',
    },
    langBtnSub: {
        fontSize: 10,
        color: '#94a3b8',
        fontWeight: '500',
        marginTop: 2,
    },
});

export default ShopRegistrationScreen;
