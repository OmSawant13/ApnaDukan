import React, { createContext, useState, useContext, useEffect } from 'react';
import { Alert } from 'react-native';
import { useProducts } from './ProductContext';
import { useAuth } from './AuthContext'; // Import Auth

const OrderContext = createContext();

export const useOrders = () => useContext(OrderContext);

import { API_URL } from '../config';

export const OrderProvider = ({ children }) => {
    const { refreshProducts } = useProducts();
    const { user } = useAuth(); // Get User
    // Cart State
    const [cart, setCart] = useState([]);

    // Shopkeeper Order State
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);

    // ... (Cart Logic remains same)

    const addToCart = (product) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(item => item.id === product.id);
            if (existingItem) {
                return prevCart.map(item =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            } else {
                return [...prevCart, { ...product, quantity: 1 }];
            }
        });
    };

    const removeFromCart = (productId) => {
        setCart(prevCart => prevCart.filter(item => item.id !== productId));
    };

    const updateQuantity = (productId, change) => {
        setCart(prevCart => prevCart.map(item => {
            if (item.id === productId) {
                const newQuantity = Math.max(0, item.quantity + change);
                return { ...item, quantity: newQuantity };
            }
            return item;
        }).filter(item => item.quantity > 0));
    };

    const clearCart = () => setCart([]);

    const getCartTotal = () => {
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    // --- Order Logic (API) ---

    // ... (fetchOrders remains same)
    const fetchOrders = async (status = null) => {
        try {
            setLoading(true);
            let url = `${API_URL}/orders`;
            if (status) url += `?status=${status}`;

            const res = await fetch(url);
            const data = await res.json();
            setOrders(data);
        } catch (err) {
            console.error('Fetch Orders Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const placeOrder = async () => {
        if (cart.length === 0) return;

        try {
            setLoading(true);

            // Determine Customer Name & ID
            const customerName = user ? user.name : 'Guest Customer';
            const customerId = user ? user._id : null;

            const orderPayload = {
                customer: customerName,
                customerId: customerId, // Send ID
                items: cart.map(item => ({
                    productId: item.id,
                    name: item.name,
                    price: item.price,
                    unit: item.unit,
                    quantity: item.quantity,
                    image: item.image
                })),
                totalAmount: getCartTotal(),
                paymentMethod: 'cash',
                isCredit: false
            };

            const res = await fetch(`${API_URL}/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderPayload)
            });

            if (!res.ok) throw new Error('Order Failed');

            await res.json();
            Alert.alert('Success', 'Order Placed Successfully! 🎉');
            clearCart();
            // Optionally refresh orders if shopkeeper is viewing
            fetchOrders();
            if (refreshProducts) refreshProducts();
        } catch (err) {
            Alert.alert('Error', 'Could not place order. Try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const updateOrderStatus = async (orderId, status) => {
        try {
            const res = await fetch(`${API_URL}/orders/${orderId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            const updatedOrder = await res.json();

            // Local Update
            setOrders(prev => prev.map(o => o._id === orderId ? updatedOrder : o));
        } catch (err) {
            console.error('Update Status Error:', err);
        }
    };

    return (
        <OrderContext.Provider value={{
            cart,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            getCartTotal,
            orders,
            loading,
            fetchOrders,
            placeOrder,
            updateOrderStatus
        }}>
            {children}
        </OrderContext.Provider>
    );
};
