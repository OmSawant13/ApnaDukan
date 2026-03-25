import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../context/LanguageContext';

const { width } = Dimensions.get('window');

export default function CategoryShowcaseCard({ title, subtitle, tag, icon, image, color, bgColor, onPress, style }) {
    const { translateProduct } = useLanguage();
    return (
        <TouchableOpacity
            style={[styles.cardContainer, { backgroundColor: bgColor }, style]}
            onPress={onPress}
            activeOpacity={0.8}
        >
            <View style={styles.contentContainer}>
                <Text style={styles.title}>{translateProduct(title)}</Text>
                {subtitle && <Text style={styles.subtitle}>{translateProduct(subtitle)}</Text>}
                {tag && <Text style={styles.tag}>{tag}</Text>}
            </View>

            <View style={styles.imageContainer}>
                {image ? (
                    <Image source={image} style={styles.categoryImage} resizeMode="contain" />
                ) : (
                    <Ionicons name={icon || "basket"} size={48} color={color || "#000"} />
                )}
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    cardContainer: {
        width: 260, // Default width for horizontal lists
        height: 140,
        borderRadius: 20,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginRight: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 3,
    },
    // ... rest of styles unchanged ...
    contentContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 6,
    },
    subtitle: {
        fontSize: 13,
        color: '#475569',
        fontWeight: '500',
        marginBottom: 10,
    },
    tag: {
        fontSize: 12,
        fontWeight: '700',
        color: '#059669',
        backgroundColor: 'rgba(255,255,255,0.6)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        alignSelf: 'flex-start',
        overflow: 'hidden'
    },
    imageContainer: {
        width: 100,
        height: 100,
        alignItems: 'center',
        justifyContent: 'center',
    },
    categoryImage: {
        width: '100%',
        height: '100%',
    }
});
