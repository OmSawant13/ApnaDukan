import React, { createContext, useState, useContext, useEffect } from 'react';
import { Alert } from 'react-native';
import { io } from "socket.io-client";
import { useSocket } from './SocketContext';
import { useShop } from './ShopContext';

const ProductContext = createContext();

export const useProducts = () => useContext(ProductContext);

// API Configuration
import { API_URL } from '../config';

// Asset Map for Static Images (Backend stores string keys)

// Asset Map for Static Images (Backend stores string keys)
export const ASSET_MAP = {
    'Panipuri.jpeg': require('../assets/Panipuri.jpeg'),
    // Categories
    'Vegetables.png': require('../assets/images/Vegetables.png'),
    'Atta & Chawal.png': require('../assets/images/Atta & Chawal.png'),
    'Dal.png': require('../assets/images/Dal.png'),
    'soft_drinks.png': require('../assets/images/soft_drinks.png'),
    'spices.png': require('../assets/images/spices.png'),
    'cleaning.png': require('../assets/images/cleaning.png'),
    'baby_care.png': require('../assets/images/baby_care.png'),
    'Chini & Namak.png': require('../assets/images/Chini & Namak.png'),
    'Dairy.jpeg': require('../assets/images/Dairy.jpeg'),
    'Chai & Nashta.png': require('../assets/images/Chai & Nashta.png'),
    'Bakery aur Bread.jpeg': require('../assets/images/Bakery aur Bread.jpeg'),
    // Fallbacks or extras
    'fruit_cat.png': require('../assets/images/fruit_cat.png'),
    'veg_cat.png': require('../assets/images/veg_cat.png'),
};

export const AVAILABLE_ASSETS = Object.keys(ASSET_MAP).filter(k => k.endsWith('.png') || k.endsWith('.jpeg'));

const DEFAULT_IMAGE = require('../assets/Panipuri.jpeg');

// Initial Data for Seeding
const INITIAL_CATEGORIES_DATA = [
    { name: 'Vegetables', items: 0, icon: 'nutrition', type: 'weight' }, // Items count will be dynamic
    { name: 'Fruits', items: 0, icon: 'nutrition', type: 'weight' },
    { name: 'Dairy', items: 0, icon: 'water', type: 'unit' },
    { name: 'Bakery', items: 0, icon: 'pizza', type: 'unit' },
    { name: 'Spices', items: 0, icon: 'flask', type: 'unit' },
    { name: 'Snacks', items: 0, icon: 'restaurant', type: 'unit' },
];

const INITIAL_PRODUCTS_DATA = [
    { name: 'Fresh Tomato', price: 40, unit: 'kg', stock: true, stockCount: 20, imageName: 'Panipuri.jpeg', categoryName: 'Vegetables' },
    { name: 'Potatoes (New)', price: 30, unit: 'kg', stock: true, stockCount: 50, imageName: 'Panipuri.jpeg', categoryName: 'Vegetables' },
    { name: 'Onions', price: 60, unit: 'kg', stock: false, stockCount: 0, imageName: 'Panipuri.jpeg', categoryName: 'Vegetables' },
    { name: 'Green Chillies', price: 20, unit: '250g', stock: true, stockCount: 15, imageName: 'Panipuri.jpeg', categoryName: 'Vegetables' },
    { name: 'Apple (Kashmir)', price: 120, unit: 'kg', stock: true, stockCount: 12, imageName: 'Panipuri.jpeg', categoryName: 'Fruits' },
    { name: 'Banana', price: 40, unit: 'dozen', stock: true, stockCount: 24, imageName: 'Panipuri.jpeg', categoryName: 'Fruits' },
    { name: 'Amul Taaza Milk', price: 54, unit: '1 L', stock: true, stockCount: 20, imageName: 'Panipuri.jpeg', categoryName: 'Dairy' },
    { name: 'Curd (Dahi)', price: 35, unit: '500g', stock: true, stockCount: 10, imageName: 'Panipuri.jpeg', categoryName: 'Dairy' },
    { name: 'Whole Wheat Bread', price: 45, unit: 'pkt', stock: true, stockCount: 15, imageName: 'Panipuri.jpeg', categoryName: 'Bakery' },
    { name: 'Turmeric Powder', price: 40, unit: '100g', stock: true, stockCount: 30, imageName: 'Panipuri.jpeg', categoryName: 'Spices' },
    { name: 'Red Chilli Powder', price: 60, unit: '100g', stock: true, stockCount: 25, imageName: 'Panipuri.jpeg', categoryName: 'Spices' },
    { name: 'Parle-G Gold', price: 140, unit: 'kg', stock: true, stockCount: 10, imageName: 'Panipuri.jpeg', categoryName: 'Snacks' },
    { name: 'Maggie Noodles', price: 14, unit: 'pkt', stock: true, stockCount: 50, imageName: 'Panipuri.jpeg', categoryName: 'Snacks' },
];

export const ProductProvider = ({ children }) => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const { socket } = useSocket();
    const { selectedShop } = useShop();

    // Fetch Data on Load
    useEffect(() => {
        loadData();
    }, [selectedShop]); // Reload when shop changes

    // Setup Socket
    useEffect(() => {
        if (!socket) return;

        // Listen for Updates
        const handleUpdate = (data) => {
            console.log('⚡ Socket Update Received:', data);
            handleSocketUpdate(data);
        };

        socket.on('product_updated', handleUpdate);

        return () => {
            socket.off('product_updated', handleUpdate);
        };
    }, [socket]);

    // Handle Socket Updates Locally
    const handleSocketUpdate = (data) => {
        const { action, product, productId } = data;

        // Only update if it belongs to the current shop
        if (product && product.shopId && selectedShop && product.shopId !== selectedShop._id) {
            return;
        }

        setProducts(prev => {
            let newProducts = [...prev];

            if (action === 'create') {
                // Check if this product already exists (by _id or tempId match)
                // If we find a 'temp-' product with the same name, we replace it
                const existingIndex = newProducts.findIndex(p =>
                    p._id === product._id ||
                    p.id === product._id ||
                    (p.id?.startsWith('temp-') && p.name === product.name)
                );

                if (existingIndex !== -1) {
                    newProducts[existingIndex] = product;
                } else {
                    newProducts = [product, ...newProducts];
                }
            } else if (action === 'update') {
                newProducts = newProducts.map(p =>
                    (p._id === product._id || p.id === product._id) ? product : p
                );
            } else if (action === 'delete') {
                newProducts = newProducts.filter(p => p._id !== productId && p.id !== productId);
            }

            return mapProducts(newProducts);
        });
    };

    const loadData = async () => {
        try {
            const headers = selectedShop ? { 'x-shop-id': selectedShop._id } : {};

            const [catsRes, prodsRes] = await Promise.all([
                fetch(`${API_URL}/categories`, { headers }),
                fetch(`${API_URL}/products`, { headers })
            ]);

            const cats = await catsRes.json();
            const prods = await prodsRes.json();

            if (cats.length === 0) {
                // console.log('🌱 Database Empty. Seeding Initial Data...');
                // await seedDatabase();
                setCategories([]); // Keep it empty!
                setProducts([]);
            } else {
                setCategories(mapCategories(cats));
                setProducts(mapProducts(prods));
            }
        } catch (error) {
            console.error('❌ Error loading data:', error);
            Alert.alert('Connection Error', 'Could not connect to server. Ensure backend is running.');
        } finally {
            setLoading(false);
        }
    };

    // Helper to map DB product to UI product (Handling Images)
    const mapProducts = (dbProducts) => {
        return dbProducts.map(p => {
            let imageSource = DEFAULT_IMAGE;
            if (p.image && typeof p.image === 'string') {
                if (p.image.startsWith('http') || p.image.startsWith('file')) {
                    imageSource = { uri: p.image };
                } else {
                    imageSource = ASSET_MAP[p.image] || DEFAULT_IMAGE;
                }
            }
            return {
                ...p,
                id: p._id, // Map _id to id
                image: imageSource
            };
        });
    };

    // Helper to map DB categories
    const mapCategories = (dbCategories) => {
        return dbCategories.map(c => {
            let imageSource = null;
            if (c.image && typeof c.image === 'string') {
                if (c.image.startsWith('http') || c.image.startsWith('file')) {
                    imageSource = { uri: c.image };
                } else {
                    imageSource = ASSET_MAP[c.image];
                }
            }
            return {
                ...c,
                id: c._id,
                image: imageSource // Could be null, or require object
            };
        });
    };

    // Seed Logic
    const seedDatabase = async () => {
        try {
            // 1. Post Categories
            const catMap = {}; // Map Name -> ID
            for (const cat of INITIAL_CATEGORIES_DATA) {
                const res = await fetch(`${API_URL}/categories`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(cat)
                });
                const savedCat = await res.json();
                catMap[savedCat.name] = savedCat._id;
            }

            // 2. Post Products with mapped Category IDs
            for (const prod of INITIAL_PRODUCTS_DATA) {
                const categoryId = catMap[prod.categoryName];
                if (categoryId) {
                    await fetch(`${API_URL}/products`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            name: prod.name,
                            price: prod.price,
                            unit: prod.unit,
                            stock: prod.stock,
                            stockCount: prod.stockCount,
                            image: prod.imageName, // Store string
                            categoryId: categoryId
                        })
                    });
                }
            }

            // 3. Reload
            await loadData(); // Recursively load real data
        } catch (err) {
            console.error('❌ Seeding Failed:', err);
        }
    };

    // --- Actions ---

    const addProduct = async (productData) => {
        // 1. Truly Optimistic Update: Add to state BEFORE fetch
        const tempId = `temp-${Date.now()}`;
        const tempProduct = {
            ...productData,
            _id: tempId,
            id: tempId,
            shopId: selectedShop?._id,
            stock: true,
            stockCount: productData.stockCount || 0,
            image: productData.image || 'Panipuri.jpeg',
            createdAt: new Date().toISOString()
        };

        setProducts(prev => mapProducts([tempProduct, ...prev]));

        // Update category count immediately
        const catId = productData.categoryId;
        setCategories(prev => prev.map(c =>
            (c._id === catId || c.id === catId) ? { ...c, items: (c.items || 0) + 1 } : c
        ));

        try {
            const res = await fetch(`${API_URL}/products`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-shop-id': selectedShop?._id
                },
                body: JSON.stringify({
                    ...productData,
                    shopId: selectedShop?._id,
                    stock: true,
                    image: productData.image || 'Panipuri.jpeg'
                })
            });
            const newProd = await res.json();

            if (!res.ok) throw new Error(newProd.error || 'Failed to add product');

            // 2. Replace temp product with real one from server
            // This ensures we have the correct ID and mapped properties
            setProducts(prev => {
                const filtered = prev.filter(p => p.id !== tempId);
                // Check if socket already added it to avoid double add
                if (filtered.find(p => p._id === newProd._id)) return filtered;
                return mapProducts([newProd, ...filtered]);
            });

        } catch (err) {
            console.error('Add Error:', err);
            // Rollback on error
            setProducts(prev => prev.filter(p => p.id !== tempId));
            setCategories(prev => prev.map(c =>
                (c._id === catId || c.id === catId) ? { ...c, items: Math.max(0, (c.items || 0) - 1) } : c
            ));
            Alert.alert('Error', err.message || 'Failed to add product. Please try again.');
        }
    };

    const updateProduct = async (id, updatedData) => {
        // Optimistic Update
        setProducts(prev => prev.map(prod =>
            prod.id === id ? { ...prod, ...updatedData } : prod
        ));

        try {
            await fetch(`${API_URL}/products/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-shop-id': selectedShop?._id
                },
                body: JSON.stringify(updatedData)
            });
        } catch (err) {
            console.error('Update Error:', err);
            // Rollback (requires storing previous state, but for now we just Alert)
            Alert.alert('Update Failed', 'Changes might not be saved.');
            loadData(); // Re-fetch on error to sync back
        }
    };

    const deleteProduct = async (id, categoryId) => {
        // Optimistic Update
        setProducts(prev => prev.filter(prod => prod.id !== id));
        if (categoryId) {
            setCategories(prev => prev.map(c =>
                (c._id === categoryId || c.id === categoryId) ? { ...c, items: Math.max(0, (c.items || 0) - 1) } : c
            ));
        }

        try {
            await fetch(`${API_URL}/products/${id}`, { method: 'DELETE' });
        } catch (err) {
            console.error('Delete Error:', err);
            Alert.alert('Delete Failed', 'Product might still exist.');
            loadData(); // Sync back
        }
    };

    const deleteCategory = async (id) => {
        try {
            await fetch(`${API_URL}/categories/${id}`, { method: 'DELETE' });
            // Local Update
            setCategories(prev => prev.filter(c => c.id !== id));
        } catch (err) {
            console.error('Delete Cat Error:', err);
        }
    };

    const addCategory = async (name, type = 'unit', image = null) => {
        try {
            const res = await fetch(`${API_URL}/categories`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-shop-id': selectedShop?._id
                },
                body: JSON.stringify({
                    name,
                    type,
                    icon: type === 'weight' ? 'leaf' : 'grid',
                    image,
                    shopId: selectedShop?._id
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to add category');

            const newCat = data;

            // Local Update
            setCategories(prev => [...prev, { ...newCat, id: newCat._id, items: 0 }]);
            // If Category model uses _id, frontend maps it.
            // Wait, my loadData maps products but not categories.
            // But categories already come with _id.
            // If frontend code expects `id` property (string "1"), Mongo gives `_id`.
            // I should map categories too in `loadData` to be safe like products: `...c, id: c._id`.
        } catch (err) {
            console.error('Add Cat Error:', err);
        }
    };

    // Wrappers for Stock (reuse updateProduct)
    const toggleStock = (id) => {
        const prod = products.find(p => p.id === id);
        if (prod) updateProduct(id, { stock: !prod.stock });
    };

    const incrementStock = (id) => {
        const prod = products.find(p => p.id === id);
        if (prod) updateProduct(id, { stockCount: (prod.stockCount || 0) + 1, stock: true });
    };

    const decrementStock = (id) => {
        const prod = products.find(p => p.id === id);
        if (prod) {
            const newCount = Math.max(0, (prod.stockCount || 0) - 1);
            updateProduct(id, { stockCount: newCount, stock: newCount > 0 });
        }
    };

    return (
        <ProductContext.Provider value={{
            products,
            categories: Array.isArray(categories) ? categories.map(c => ({
                ...c,
                id: c._id || c.id,
                items: Array.isArray(products) ? products.filter(p => (p.categoryId === (c._id || c.id)) && p.stock).length : 0
            })) : [],
            loading,
            refreshProducts: loadData,
            addProduct,
            updateProduct,
            deleteProduct,
            addCategory,
            deleteCategory,
            toggleStock,
            incrementStock,
            decrementStock
        }}>
            {children}
        </ProductContext.Provider>
    );
};

