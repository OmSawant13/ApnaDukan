import React, { createContext, useState, useContext, useEffect } from 'react';
import { Alert } from 'react-native';
import { useShop } from './ShopContext';

const CreditContext = createContext();

export const useCredit = () => useContext(CreditContext);

import { API_URL } from '../config';

export const CreditProvider = ({ children }) => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const { selectedShop } = useShop();

    // Fetch All Customers
    const fetchCustomers = async () => {
        try {
            if (customers.length === 0) {
                setLoading(true);
            }
            const res = await fetch(`${API_URL}/customers`, {
                headers: { 'x-shop-id': selectedShop?._id }
            });
            const data = await res.json();
            setCustomers(data);
        } catch (err) {
            console.error('Fetch Credit Error:', err);
        } finally {
            setLoading(false);
        }
    };

    // Add New Customer
    const addCustomer = async (name, phone) => {
        try {
            setLoading(true);
            const res = await fetch(`${API_URL}/customers`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-shop-id': selectedShop?._id
                },
                body: JSON.stringify({
                    name, phone,
                    isCreditUser: true,
                    password: '123456',
                    shopId: selectedShop?._id
                })
            });
            const newCustomer = await res.json();
            setCustomers(prev => [...prev, newCustomer]);
            return true;
        } catch (err) {
            console.error('Add Customer Error:', err);
            return false;
        } finally {
            setLoading(false);
        }
    };

    // Add Transaction (Manual)
    const addTransaction = async (customerId, type, amount, note) => {
        if (isProcessing) return;
        try {
            setIsProcessing(true);
            const res = await fetch(`${API_URL}/customers/${customerId}/transaction`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type, amount, note })
            });
            const updatedCustomer = await res.json();
            setCustomers(prev => prev.map(c => c._id === customerId ? updatedCustomer : c));
        } catch (err) {
            console.error('Transaction Error:', err);
            Alert.alert('Error', 'Transaction Failed');
        } finally {
            setIsProcessing(false);
        }
    };

    // Link Order to Credit
    const addOrderToCredit = async (customerId, orderId, amount, customerName = null) => {
        if (isProcessing) return false;
        try {
            setIsProcessing(true);
            const res = await fetch(`${API_URL}/customers/from-order`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ customerId, orderId, amount, customerName })
            });

            const updatedCustomer = await res.json();

            if (!res.ok) {
                // If backend says "already added", we should still return true 
                // to the UI so it can hide the button and show success 
                // (since the goal is already achieved).
                if (res.status === 400 && (updatedCustomer.error?.includes('already') || updatedCustomer.error?.includes('processed'))) {
                    return true;
                }
                throw new Error(updatedCustomer.error || 'Failed');
            }

            setCustomers(prev => prev.map(c => c._id === customerId ? updatedCustomer : c));
            return true;
        } catch (err) {
            console.error('Order Credit Error:', err);
            Alert.alert('Notice', err.message || 'Transaction could not be completed');
            return false;
        } finally {
            setIsProcessing(false);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, [selectedShop]);

    return (
        <CreditContext.Provider value={{
            customers,
            loading,
            fetchCustomers,
            addCustomer,
            addTransaction,
            addOrderToCredit,
            isProcessing
        }}>
            {children}
        </CreditContext.Provider>
    );
};
