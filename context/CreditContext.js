import React, { createContext, useState, useContext, useEffect } from 'react';
import { Alert } from 'react-native';

const CreditContext = createContext();

export const useCredit = () => useContext(CreditContext);

import { API_URL } from '../config';

export const CreditProvider = ({ children }) => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(false);

    // Fetch All Customers
    const fetchCustomers = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_URL}/customers`);
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
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, phone })
            });
            const newCustomer = await res.json();
            setCustomers(prev => [...prev, newCustomer]);
            Alert.alert('Success', 'Customer Added Successfully');
        } catch (err) {
            Alert.alert('Error', 'Could not add customer');
        } finally {
            setLoading(false);
        }
    };

    // Add Transaction (Manual)
    const addTransaction = async (customerId, type, amount, note) => {
        try {
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
        }
    };

    // Link Order to Credit
    const addOrderToCredit = async (customerId, orderId, amount) => {
        try {
            const res = await fetch(`${API_URL}/customers/from-order`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ customerId, orderId, amount })
            });
            const updatedCustomer = await res.json();
            setCustomers(prev => prev.map(c => c._id === customerId ? updatedCustomer : c));
            Alert.alert('Success', 'Order added to Credit Ledger');
        } catch (err) {
            console.error('Order Credit Error:', err);
            Alert.alert('Error', 'Failed to add order to credit');
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    return (
        <CreditContext.Provider value={{
            customers,
            loading,
            fetchCustomers,
            addCustomer,
            addTransaction,
            addOrderToCredit
        }}>
            {children}
        </CreditContext.Provider>
    );
};
