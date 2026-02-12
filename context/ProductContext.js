import React, { createContext, useState, useContext, useEffect } from 'react';
import { Alert } from 'react-native';

const ProductContext = createContext();

export const useProducts = () => useContext(ProductContext);

// API Configuration
import { API_URL } from '../config';

// Asset Map for Static Images (Backend stores string keys)
const ASSET_MAP = {
    'Panipuri.jpeg': require('../assets/Panipuri.jpeg'),
    // Add other assets here as needed
};

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

    // Fetch Data on Load
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [catsRes, prodsRes] = await Promise.all([
                fetch(`${API_URL}/categories`),
                fetch(`${API_URL}/products`)
            ]);

            const cats = await catsRes.json();
            const prods = await prodsRes.json();

            if (cats.length === 0) {
                console.log('🌱 Database Empty. Seeding Initial Data...');
                await seedDatabase();
            } else {
                setCategories(cats);
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
        return dbProducts.map(p => ({
            ...p,
            id: p._id, // Map _id to id
            image: ASSET_MAP[p.image] || DEFAULT_IMAGE // Resolve Image
        }));
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
        try {
            const res = await fetch(`${API_URL}/products`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...productData,
                    stock: true,
                    stockCount: 0,
                    image: 'Panipuri.jpeg' // Default string for now
                })
            });
            const newProd = await res.json();

            // Optimistic Update
            setProducts(prev => [
                { ...newProd, id: newProd._id, image: DEFAULT_IMAGE },
                ...prev
            ]);
            // Refresh categories count logic? Ideally re-fetch or manual update
            const catId = productData.categoryId;
            setCategories(prev => prev.map(c => c.id === catId ? { ...c, items: (c.items || 0) + 1 } : c));
        } catch (err) {
            console.error('Add Error:', err);
        }
    };

    const updateProduct = async (id, updatedData) => {
        try {
            await fetch(`${API_URL}/products/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData)
            });

            // Local Update
            setProducts(prev => prev.map(prod =>
                prod.id === id ? { ...prod, ...updatedData } : prod
            ));
        } catch (err) {
            console.error('Update Error:', err);
        }
    };

    const deleteProduct = async (id, categoryId) => {
        try {
            await fetch(`${API_URL}/products/${id}`, { method: 'DELETE' });

            // Local Update
            setProducts(prev => prev.filter(prod => prod.id !== id));
            if (categoryId) {
                setCategories(prev => prev.map(c =>
                    c.id === categoryId ? { ...c, items: Math.max(0, (c.items || 0) - 1) } : c
                ));
            }
        } catch (err) {
            console.error('Delete Error:', err);
        }
    };

    const addCategory = async (name, type = 'unit') => {
        try {
            const res = await fetch(`${API_URL}/categories`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    type,
                    icon: type === 'weight' ? 'leaf' : 'grid'
                })
            });
            const newCat = await res.json();

            // Local Update
            setCategories(prev => [...prev, { ...newCat, id: newCat._id, items: 0 }]); // Ensure ID mapping if needed? Context uses .id mostly
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
            categories: Array.isArray(categories) ? categories.map(c => ({ ...c, id: c._id || c.id })) : [], // Ensure 'id' compatibility and array check
            loading,
            refreshProducts: loadData,
            addProduct,
            updateProduct,
            deleteProduct,
            addCategory,
            toggleStock,
            incrementStock,
            decrementStock
        }}>
            {children}
        </ProductContext.Provider>
    );
};

