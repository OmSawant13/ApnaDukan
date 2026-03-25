import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config';
import { useAuth } from './AuthContext';

const ShopContext = createContext();

export const useShop = () => useContext(ShopContext);

export const ShopProvider = ({ children }) => {
    const { user } = useAuth();
    const [selectedShop, setSelectedShop] = useState(null);
    const [shops, setShops] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchShops = async () => {
        try {
            if (shops.length === 0) {
                setLoading(true);
            }
            const res = await fetch(`${API_URL}/shops`);
            const allShops = await res.json();
            if (res.ok) {
                setShops(allShops);
                return allShops;
            }
        } catch (err) {
            console.error('Failed to fetch shops:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                // 1. Fetch all shops first
                const allShops = await fetchShops();
                if (!allShops) return;

                // 2. Determine selected shop
                if (user?.role === 'shopkeeper') {
                    // Auto-select the shop owned by this shopkeeper
                    const myShop = allShops.find(s => s.ownerId === user._id);
                    if (myShop) {
                        setSelectedShop(myShop);
                        return;
                    }
                }

                // For customers, we now want them to see the list every time.
                // So we don't auto-load from AsyncStorage here.
                setSelectedShop(null);
            } catch (err) {
                console.error('Failed to load shops:', err);
            } finally {
                setLoading(false);
            }
        };

        loadInitialData();
    }, [user]); // Re-run when user logs in/out

    const setShop = async (shop) => {
        try {
            setSelectedShop(shop);
            if (shop) {
                await AsyncStorage.setItem('selectedShop', JSON.stringify(shop));
            } else {
                await AsyncStorage.removeItem('selectedShop');
            }
        } catch (err) {
            console.error('Failed to save shop:', err);
        }
    };

    const registerShop = async (name, address, image = null) => {
        try {
            const res = await fetch(`${API_URL}/shops`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    address,
                    image,
                    ownerId: user._id
                })
            });

            const newShop = await res.json();
            if (res.ok) {
                setShops(prev => [...prev, newShop]);
                setSelectedShop(newShop);
                return true;
            }
            return false;
        } catch (err) {
            console.error('Registration failed:', err);
            return false;
        }
    };

    const updateShopStatus = async (shopId, active) => {
        try {
            const res = await fetch(`${API_URL}/shops/${shopId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ active })
            });

            const updatedShop = await res.json();
            if (res.ok) {
                setShops(prev => prev.map(s => s._id === shopId ? updatedShop : s));
                if (selectedShop?._id === shopId) {
                    setSelectedShop(updatedShop);
                }
                return true;
            }
            return false;
        } catch (err) {
            console.error('Failed to update shop status:', err);
            return false;
        }
    };

    return (
        <ShopContext.Provider value={{ selectedShop, shops, setShop, registerShop, updateShopStatus, fetchShops, loading }}>
            {children}
        </ShopContext.Provider>
    );
};
