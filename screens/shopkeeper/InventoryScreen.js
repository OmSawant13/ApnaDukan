import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Alert,
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useProducts } from '../../context/ProductContext';
import { useShopLanguage } from '../../context/LanguageContext';

export default function ShopkeeperInventoryScreen({ navigation }) {
    const { categories, addCategory, deleteCategory } = useProducts();
    const { t, translateProduct } = useShopLanguage();

    const handleDeleteCategory = (id, name) => {
        Alert.alert(
            t('delete_category'),
            t('delete_category_confirm'),
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: t('delete'),
                    style: 'destructive',
                    onPress: () => {
                        deleteCategory(id);
                    },
                },
            ]
        );
    };

    const renderCategoryItem = ({ item }) => {
        const isWeight = item.type === 'weight';
        const accent = isWeight ? '#2563EB' : '#16A34A';

        return (
            <TouchableOpacity
                activeOpacity={0.85}
                style={styles.categoryRow}
                onPress={() =>
                    navigation.navigate('ShopkeeperProductList', {
                        categoryId: item.id,
                        categoryName: item.name,
                        categoryType: item.type,
                    })
                }
                onLongPress={() => handleDeleteCategory(item.id, item.name)}
            >
                <View style={styles.rowLeft}>
                    <View style={[styles.iconContainer, { backgroundColor: accent + '15' }]}>
                        <Ionicons
                            name={isWeight ? 'scale' : 'cube'}
                            size={26}
                            color={accent}
                        />
                    </View>

                    <View>
                        <Text style={styles.catName}>{translateProduct(item.name)}</Text>
                        <Text style={styles.subText}>
                            {isWeight ? t('weight_based') : t('packet_based')}
                        </Text>
                    </View>
                </View>

                <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <StatusBar barStyle="dark-content" />

            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>{t('inventory')}</Text>
                <TouchableOpacity
                    style={styles.headerAddBtn}
                    onPress={() => navigation.navigate('ShopkeeperAddCategory')}
                >
                    <Ionicons name="add" size={28} color="#fff" />
                </TouchableOpacity>
            </View>

            {/* List */}
            <FlatList
                data={categories}
                keyExtractor={(item, index) => (item.id || item._id || index).toString()}
                renderItem={renderCategoryItem}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Ionicons name="cube-outline" size={48} color="#CBD5E1" />
                        <Text style={styles.emptyText}>{t('no_categories')}</Text>
                        <Text style={styles.subText}>{t('tap_to_add_category')}</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA',
    },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingTop: 20,
        paddingBottom: 24,
    },

    title: {
        fontSize: 32,
        fontWeight: '900',
        color: '#0F172A',
    },

    headerAddBtn: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: '#0F172A',
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 4,
    },

    listContent: {
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 140,
    },

    categoryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 18,
        backgroundColor: '#fff',
        borderRadius: 28,
        marginBottom: 18,
        elevation: 6,
    },

    rowLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },

    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },

    catName: {
        fontSize: 19,
        fontWeight: '800',
        color: '#0F172A',
    },

    subText: {
        fontSize: 13,
        color: '#64748B',
        marginTop: 2,
    },

    empty: {
        alignItems: 'center',
        marginTop: 120,
    },

    emptyText: {
        fontSize: 18,
        fontWeight: '800',
        marginTop: 12,
        color: '#0F172A',
    },
});
