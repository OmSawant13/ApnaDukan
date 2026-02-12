import React from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Image,
    KeyboardAvoidingView,
    Platform,
} from "react-native";

import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

export default function Login({ navigation }) {
    const { login } = useAuth();
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!phone || !password) return;
        setLoading(true);
        const res = await login(phone, password);
        setLoading(false);
        // Navigation is handled automatically by AppNavigator based on user state
    };

    return (
        <View style={styles.container}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "position" : "height"}
            >
                <View style={styles.header}>
                    <Text style={styles.headerText}>Login</Text>
                </View>

                {/* IMAGE */}
                <Image
                    source={require("../assets/Login.png")}
                    style={styles.image}
                />

                {/* CONTENT */}
                <View style={styles.content}>
                    <Text style={styles.heading}>Welcome Back!</Text>
                    <Text style={styles.subHeading}>
                        Log in to continue your fresh shopping.
                    </Text>

                    <Text style={styles.label}>Phone Number</Text>
                    <TextInput
                        placeholder="Enter your phone (e.g. 9876543210)"
                        style={styles.input}
                        placeholderTextColor="#999"
                        keyboardType="phone-pad"
                        value={phone}
                        onChangeText={setPhone}
                    />

                    <Text style={styles.label}>Password</Text>
                    <TextInput
                        placeholder="Enter your password"
                        style={styles.input}
                        placeholderTextColor="#999"
                        secureTextEntry
                        value={password}
                        onChangeText={setPassword}
                    />

                    <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
                        <Text style={styles.buttonText}>{loading ? 'Logging in...' : 'Login'}</Text>
                    </TouchableOpacity>

                    <View style={styles.signupRow}>
                        <Text style={styles.signupText}>Don't have an account?</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                            <Text style={styles.signupLink}>Sign Up</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f8f9f6",

    },
    header: {
        marginTop: 55,
        alignSelf: "center",
    },
    headerText: {
        fontSize: 20,
        fontWeight: "500",
    },

    image: {
        width: 360,
        height: 210,
        borderBottomLeftRadius: 60,
        borderBottomRightRadius: 60,
        borderTopLeftRadius: 60,
        borderTopRightRadius: 60,
        alignSelf: "center",
        marginTop: 30,
    },

    content: {
        padding: 24,
        marginTop: 20,
    },

    heading: {
        fontSize: 28,
        fontWeight: "700",
        marginTop: 10,
    },

    subHeading: {
        fontSize: 16,
        color: "#6b7280",
        marginBottom: 25,
        marginTop: 10
    },

    label: {
        fontSize: 14,
        marginBottom: 6,
        fontWeight: "500",
        marginTop: 10
    },

    input: {
        borderWidth: 1,
        borderColor: "#e5e7eb",
        borderRadius: 14,
        padding: 14,
        marginBottom: 18,
    },

    passwordRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },

    forgot: {
        color: "#4ade80",
        fontSize: 13,
        fontWeight: "500",
    },

    button: {
        backgroundColor: "#6ee56b",
        padding: 16,
        borderRadius: 30,
        marginTop: 10,
    },

    buttonText: {
        textAlign: "center",
        fontSize: 16,
        fontWeight: "700",
        color: "#000",
    },
    signupRow: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 20,
    },

    signupText: {
        fontSize: 14,
        color: "#6b7280",
        marginRight: 5,
    },

    signupLink: {
        fontSize: 14,
        color: "#4ade80",
        fontWeight: "600",
    },
});
