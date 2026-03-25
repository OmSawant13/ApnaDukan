import React, { createContext, useState, useContext, useEffect } from 'react';
import { Alert } from 'react-native';
import { useProducts } from './ProductContext';
import { useAuth } from './AuthContext'; // Import Auth
import { useShop } from './ShopContext';

const OrderContext = createContext();

export const useOrders = () => useContext(OrderContext);

import { io } from "socket.io-client";
import { useSocket } from './SocketContext'; // Import Socket Context
import { API_URL } from '../config';

export const OrderProvider = ({ children }) => {
    const { refreshProducts } = useProducts();
    const { user } = useAuth(); // Get User
    const { socket } = useSocket(); // Use Shared Socket
    const { selectedShop } = useShop();

    // Cart State
    const [cart, setCart] = useState([]);

    // Clear cart if shop changes
    useEffect(() => {
        setCart([]);
    }, [selectedShop]);

    // Shopkeeper Order State
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);

    // Socket Listener for Real-time Orders
    useEffect(() => {
        if (!socket) return;

        const handleNewOrder = (newOrder) => {
            console.log('⚡ New Order Received via Socket:', newOrder._id);
            setOrders(prev => [newOrder, ...prev]);
        };

        const handleOrderUpdate = (updatedOrder) => {
            setOrders(prev => prev.map(o => o._id === updatedOrder._id ? updatedOrder : o));
        };

        socket.on('new_order', handleNewOrder);
        socket.on('order_updated', handleOrderUpdate);

        return () => {
            socket.off('new_order', handleNewOrder);
            socket.off('order_updated', handleOrderUpdate);
        };
    }, [socket]);

    // ... (Cart Logic remains same)

    const addToCart = (product, customWeight = null, customPrice = null) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(item => item.id === product.id);
            
            if (existingItem) {
                // If weight-based, we add to the weight/price instead of unit quantity
                if (product.type === 'weight' || product.unit === 'kg') {
                    const currentWeight = parseFloat(existingItem.customWeight || 0);
                    const newWeight = currentWeight + parseFloat(customWeight || 0);
                    // Price is already calculated for the customWeight in the screen, 
                    // or we recalculate here if adding same item again.
                    const unitPrice = parseFloat(product.price) / 1000; // Price per gram
                    const newPrice = Math.round(unitPrice * newWeight);

                    return prevCart.map(item =>
                        item.id === product.id
                            ? { ...item, customWeight: newWeight, price: newPrice, quantity: 1 }
                            : item
                    );
                }

                // If unit-based, just increment quantity
                return prevCart.map(item =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            } else {
                // For new weight-based item
                if (product.type === 'weight' || product.unit === 'kg') {
                    return [...prevCart, { 
                        ...product, 
                        quantity: 1, 
                        customWeight: parseFloat(customWeight || 0), 
                        price: Math.round(parseFloat(customPrice || product.price)) 
                    }];
                }
                // For new unit item
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
    const fetchOrders = async (status = null, customerId = null) => {
        try {
            setLoading(true);
            let url = `${API_URL}/orders?`;
            if (status) url += `status=${status}&`;
            if (customerId) url += `customerId=${customerId}&`;

            const res = await fetch(url, {
                headers: { 'x-shop-id': selectedShop?._id }
            });
            const data = await res.json();
            setOrders(data);
        } catch (err) {
            console.error('Fetch Orders Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const placeOrder = async (isCredit = false) => {
        if (cart.length === 0) return;

        try {
            setLoading(true);

            // Determine Customer Name & ID from user state (No more fake data)
            const customerName = user?.name || 'Guest Customer';
            const customerId = user?._id || null;

            const orderPayload = {
                customer: customerName,
                customerId: customerId,
                items: cart.map(item => ({
                    productId: item.id || item._id,
                    name: item.name,
                    price: item.price,
                    unit: item.unit,
                    quantity: item.quantity,
                    weight: item.customWeight || 0,
                    weightUnit: item.customWeight ? (item.customWeight >= 1000 ? 'kg' : 'g') : '',
                    image: item.image
                })),
                totalPrice: getCartTotal(), // Match typical backend field
                totalAmount: getCartTotal(),
                paymentMethod: isCredit ? 'credit' : 'cash',
                isCredit: isCredit,
                status: isCredit ? 'open' : 'closed', // Credit orders stay open
                shopId: selectedShop?._id
            };

            const res = await fetch(`${API_URL}/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-shop-id': selectedShop?._id
                },
                body: JSON.stringify(orderPayload)
            });

            if (!res.ok) throw new Error('Order Failed');

            await res.json();
            // We should use t() here but Context doesn't have useLanguage hook directly
            // For now keep simple or pass t as arg. Let's stick to success message.
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

    const markOrderAsCredit = (orderId) => {
        setOrders(prev => prev.map(o => 
            o._id === orderId ? { ...o, isCredit: true, paymentMethod: 'credit' } : o
        ));
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
            updateOrderStatus,
            markOrderAsCredit
        }}>
            {children}
        </OrderContext.Provider>
    );
};
