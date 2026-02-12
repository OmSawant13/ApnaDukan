import React, { createContext, useState, useContext, useEffect } from 'react';
import { Alert } from 'react-native';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

import { API_URL } from '../config';

import AsyncStorage from '@react-native-async-storage/async-storage'; // Ensure this is installed

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); // null = not logged in
    const [loading, setLoading] = useState(true); // Start loading true to check auth

    useEffect(() => {
        checkUserLoggedIn();
    }, []);

    const checkUserLoggedIn = async () => {
        try {
            const userData = await AsyncStorage.getItem('user');
            if (userData) {
                setUser(JSON.parse(userData));
            }
        } catch (e) {
            console.error('Failed to load user', e);
        } finally {
            setLoading(false);
        }
    };

    // Login via Phone & Password
    const login = async (phone, password) => {
        try {
            setLoading(true);
            const res = await fetch(`${API_URL}/customers/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone, password })
            });

            const data = await res.json();

            if (res.ok) {
                setUser(data);
                await AsyncStorage.setItem('user', JSON.stringify(data)); // Save User
                return { success: true };
            } else {
                Alert.alert('Login Failed', data.error || 'User not found');
                return { success: false, error: data.error };
            }
        } catch (err) {
            Alert.alert('Error', 'Network error. Try again.');
            console.error(err);
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    };

    // Signup (Name + Phone + Password + Optional ProfilePic)
    const signup = async (name, phone, password, profilePic = null) => {
        try {
            setLoading(true);
            const res = await fetch(`${API_URL}/customers`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, phone, password, profilePic })
            });

            const data = await res.json();

            if (res.ok) {
                setUser(data);
                await AsyncStorage.setItem('user', JSON.stringify(data)); // Save User
                return { success: true };
            } else {
                Alert.alert('Signup Failed', data.error || 'Could not create account');
                return { success: false, error: data.error };
            }
        } catch (err) {
            Alert.alert('Error', 'Network error. Try again.');
            console.error(err);
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        setUser(null);
        await AsyncStorage.removeItem('user'); // Clear User
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
