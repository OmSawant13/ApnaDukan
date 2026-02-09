import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Modal,
    TextInput,
    Alert,
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useProducts } from '../../context/ProductContext';

export default function ShopkeeperInventoryScreen({ navigation }) {
    const { categories, addCategory } = useProducts();

    const [isModalVisible, setModalVisible] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newCategoryType, setNewCategoryType] = useState('weight');

    const handleAddCategory = () => {
        if (!newCategoryName.trim()) return;
        addCategory(newCategoryName.trim(), newCategoryType);
        setNewCategoryName('');
        setNewCategoryType('weight');
        setModalVisible(false);
    };

    const handleDeleteCategory = (id, name) => {
        Alert.alert(
            'Delete Category',
            `Delete "${name}" and all its products?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        console.log('Delete category', id);
                        // deleteCategory(id);
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
                        <Text style={styles.catName}>{item.name}</Text>
                        <Text style={styles.subText}>
                            {isWeight ? 'Weight Based' : 'Packet Based'}
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
                <Text style={styles.title}>Inventory</Text>
                <TouchableOpacity style={styles.headerAddBtn} onPress={() => setModalVisible(true)}>
                    <Ionicons name="add" size={28} color="#fff" />
                </TouchableOpacity>
            </View>

            {/* List */}
            <FlatList
                data={categories}
                keyExtractor={(item) => item.id}
                renderItem={renderCategoryItem}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Ionicons name="cube-outline" size={48} color="#CBD5E1" />
                        <Text style={styles.emptyText}>No categories yet</Text>
                        <Text style={styles.subText}>Tap + to add your first one</Text>
                    </View>
                }
            />

            {/* Modal */}
            <Modal
                transparent
                visible={isModalVisible}
                animationType="fade"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        {/* Drag Indicator */}
                        <View style={styles.dragIndicator} />

                        <Text style={styles.modalTitle}>New Category</Text>

                        <Text style={styles.label}>Name</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. Vegetables"
                            value={newCategoryName}
                            onChangeText={setNewCategoryName}
                            autoFocus
                        />

                        <Text style={styles.label}>Category Type</Text>
                        <View style={styles.typeRow}>
                            <TouchableOpacity
                                style={[
                                    styles.typeOption,
                                    newCategoryType === 'weight' && styles.activeType,
                                ]}
                                onPress={() => setNewCategoryType('weight')}
                            >
                                <Ionicons name="scale" size={22} />
                                <Text style={styles.typeText}>Weight</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.typeOption,
                                    newCategoryType === 'packet' && styles.activeType,
                                ]}
                                onPress={() => setNewCategoryType('packet')}
                            >
                                <Ionicons name="cube" size={22} />
                                <Text style={styles.typeText}>Packet</Text>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity style={styles.saveBtn} onPress={handleAddCategory}>
                            <Text style={styles.saveText}>Save Category</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => setModalVisible(false)}>
                            <Text style={styles.closeText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

/* ---------------- STYLES ---------------- */

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

    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(15,23,42,0.45)',
        justifyContent: 'flex-end',
    },

    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 36,
        borderTopRightRadius: 36,
        padding: 28,
    },

    dragIndicator: {
        width: 40,
        height: 5,
        backgroundColor: '#E5E7EB',
        borderRadius: 10,
        alignSelf: 'center',
        marginBottom: 20,
    },

    modalTitle: {
        fontSize: 24,
        fontWeight: '900',
        marginBottom: 24,
    },

    label: {
        fontSize: 12,
        fontWeight: '700',
        color: '#64748B',
        marginBottom: 8,
        textTransform: 'uppercase',
    },

    input: {
        backgroundColor: '#F1F5F9',
        borderRadius: 18,
        padding: 18,
        fontSize: 17,
        marginBottom: 22,
    },

    typeRow: {
        flexDirection: 'row',
        gap: 14,
        marginBottom: 28,
    },

    typeOption: {
        flex: 1,
        paddingVertical: 18,
        borderRadius: 18,
        borderWidth: 2,
        borderColor: '#E5E7EB',
        alignItems: 'center',
        gap: 6,
    },

    activeType: {
        borderColor: '#0F172A',
        backgroundColor: '#F8FAFC',
    },

    typeText: {
        fontWeight: '700',
    },

    saveBtn: {
        backgroundColor: '#0F172A',
        paddingVertical: 20,
        borderRadius: 20,
        alignItems: 'center',
        marginBottom: 14,
    },

    saveText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '900',
    },

    closeText: {
        textAlign: 'center',
        color: '#64748B',
        fontWeight: '700',
    },
});
