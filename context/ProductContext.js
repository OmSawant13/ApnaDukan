import React, { createContext, useState, useContext } from 'react';

const ProductContext = createContext();

export const useProducts = () => useContext(ProductContext);

const INITIAL_CATEGORIES = [
    { id: '1', name: 'Vegetables', items: 4, icon: 'nutrition', type: 'weight' },
    { id: '2', name: 'Fruits', items: 2, icon: 'nutrition', type: 'weight' },
    { id: '3', name: 'Dairy', items: 1, icon: 'water', type: 'unit' },
    { id: '4', name: 'Bakery', items: 1, icon: 'pizza', type: 'unit' },
    { id: '5', name: 'Spices', items: 5, icon: 'flask', type: 'unit' },
    { id: '6', name: 'Snacks', items: 3, icon: 'restaurant', type: 'unit' },
];

const INITIAL_PRODUCTS = [
    { id: '1', categoryId: '1', name: 'Fresh Tomato', price: 40, unit: 'kg', stock: true, stockCount: 20, image: require('../assets/Panipuri.jpeg'), type: 'weight' },
    { id: '2', categoryId: '1', name: 'Potatoes (New)', price: 30, unit: 'kg', stock: true, stockCount: 50, image: require('../assets/Panipuri.jpeg'), type: 'weight' },
    { id: '3', categoryId: '1', name: 'Onions', price: 60, unit: 'kg', stock: false, stockCount: 0, image: require('../assets/Panipuri.jpeg'), type: 'weight' },
    { id: '4', categoryId: '1', name: 'Green Chillies', price: 20, unit: '250g', stock: true, stockCount: 15, image: require('../assets/Panipuri.jpeg'), type: 'weight' },
    { id: '5', categoryId: '2', name: 'Apple (Kashmir)', price: 120, unit: 'kg', stock: true, stockCount: 12, image: require('../assets/Panipuri.jpeg'), type: 'weight' },
    { id: '6', categoryId: '2', name: 'Banana', price: 40, unit: 'dozen', stock: true, stockCount: 24, image: require('../assets/Panipuri.jpeg'), type: 'unit' },
    // Dairy (Cat 3) & Bakery (Cat 4)
    { id: '7', categoryId: '3', name: 'Amul Taaza Milk', price: 54, unit: '1 L', stock: true, stockCount: 20, image: require('../assets/Panipuri.jpeg'), type: 'unit' },
    { id: '8', categoryId: '3', name: 'Curd (Dahi)', price: 35, unit: '500g', stock: true, stockCount: 10, image: require('../assets/Panipuri.jpeg'), type: 'unit' },
    { id: '9', categoryId: '4', name: 'Whole Wheat Bread', price: 45, unit: 'pkt', stock: true, stockCount: 15, image: require('../assets/Panipuri.jpeg'), type: 'unit' },
    // Spices (Cat 5)
    { id: '10', categoryId: '5', name: 'Turmeric Powder', price: 40, unit: '100g', stock: true, stockCount: 30, image: require('../assets/Panipuri.jpeg'), type: 'unit' },
    { id: '11', categoryId: '5', name: 'Red Chilli Powder', price: 60, unit: '100g', stock: true, stockCount: 25, image: require('../assets/Panipuri.jpeg'), type: 'unit' },
    // Snacks (Cat 6)
    { id: '12', categoryId: '6', name: 'Parle-G Gold', price: 140, unit: 'kg', stock: true, stockCount: 10, image: require('../assets/Panipuri.jpeg'), type: 'unit' },
    { id: '13', categoryId: '6', name: 'Maggie Noodles', price: 14, unit: 'pkt', stock: true, stockCount: 50, image: require('../assets/Panipuri.jpeg'), type: 'unit' },
];

export const ProductProvider = ({ children }) => {
    const [products, setProducts] = useState(INITIAL_PRODUCTS);
    const [categories, setCategories] = useState(INITIAL_CATEGORIES);

    // 1. Add Product
    const addProduct = (productData) => {
        const newProduct = {
            id: Date.now().toString(),
            stock: true,
            stockCount: 0, // Default if not provided
            ...productData, // Spread AFTER defaults to allow overrides
            image: require('../assets/Panipuri.jpeg'), // Fallback for now
        };
        setProducts(prev => [newProduct, ...prev]);

        // Update category count
        setCategories(prev => prev.map(cat =>
            cat.id === productData.categoryId
                ? { ...cat, items: cat.items + 1 }
                : cat
        ));
    };

    // 2. Update Product
    const updateProduct = (id, updatedData) => {
        setProducts(prev => prev.map(prod =>
            prod.id === id ? { ...prod, ...updatedData } : prod
        ));
    };

    // 3. Delete Product
    const deleteProduct = (id, categoryId) => {
        setProducts(prev => prev.filter(prod => prod.id !== id));

        // Update category count
        if (categoryId) {
            setCategories(prev => prev.map(cat =>
                cat.id === categoryId
                    ? { ...cat, items: Math.max(0, cat.items - 1) }
                    : cat
            ));
        }
    };

    // 4. Add Category
    const addCategory = (name, type = 'unit') => {
        const newCategory = {
            id: Date.now().toString(),
            name,
            items: 0,
            icon: type === 'weight' ? 'leaf' : 'grid', // Auto-icon based on type
            type
        };
        setCategories(prev => [...prev, newCategory]);
    };

    // 5. Toggle Stock
    const toggleStock = (id) => {
        setProducts(prev => prev.map(prod =>
            prod.id === id ? { ...prod, stock: !prod.stock } : prod
        ));
    };

    // 6. Increment Stock
    const incrementStock = (id) => {
        setProducts(prev => prev.map(prod => {
            if (prod.id === id) {
                const newCount = (prod.stockCount || 0) + 1;
                return { ...prod, stockCount: newCount, stock: true };
            }
            return prod;
        }));
    };

    // 7. Decrement Stock
    const decrementStock = (id) => {
        setProducts(prev => prev.map(prod => {
            if (prod.id === id) {
                const newCount = Math.max(0, (prod.stockCount || 0) - 1);
                return { ...prod, stockCount: newCount, stock: newCount > 0 };
            }
            return prod;
        }));
    };

    return (
        <ProductContext.Provider value={{
            products,
            categories,
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
