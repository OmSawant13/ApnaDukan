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
    ScrollView,
    Keyboard,
} from "react-native";

import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useState, useRef, useEffect } from 'react';

export default function Login({ navigation }) {
    const { login } = useAuth();
    const { t } = useLanguage();
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [isScrollEnabled, setIsScrollEnabled] = useState(false); // Locked by default
    const scrollViewRef = useRef(null);

    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener(
            'keyboardDidShow',
            () => {
                // Force enough height and scroll aggressively
                scrollViewRef.current?.scrollTo({ y: 320, animated: true });
            }
        );

        const keyboardDidHideListener = Keyboard.addListener(
            'keyboardDidHide',
            () => {
                scrollViewRef.current?.scrollTo({ y: 0, animated: true });
            }
        );

        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
        };
    }, []);

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
                behavior={null}
            >
                <ScrollView
                    ref={scrollViewRef}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ flexGrow: 1 }}
                    keyboardShouldPersistTaps="handled"
                    scrollEnabled={isScrollEnabled}
                >
                    <View style={styles.header}>
                        <Text style={styles.headerText}>{t('login')}</Text>
                    </View>

                    {/* IMAGE */}
                    <Image
                        source={require("../assets/Login.png")}
                        style={styles.image}
                    />

                    {/* CONTENT */}
                    <View style={styles.content}>
                        <Text style={styles.heading}>{t('welcome_back')}</Text>
                        <Text style={styles.subHeading}>
                            {t('login_desc')}
                        </Text>

                        <Text style={styles.label}>{t('phone_number')}</Text>
                        <TextInput
                            placeholder={t('phone_placeholder')}
                            style={styles.input}
                            placeholderTextColor="#999"
                            keyboardType="phone-pad"
                            value={phone}
                            onChangeText={setPhone}
                        />

                        <Text style={styles.label}>{t('password')}</Text>
                        <TextInput
                            placeholder={t('password_placeholder')}
                            style={styles.input}
                            placeholderTextColor="#999"
                            secureTextEntry
                            value={password}
                            onChangeText={setPassword}
                        />

                        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
                            <Text style={styles.buttonText}>{loading ? t('logging_in') : t('login')}</Text>
                        </TouchableOpacity>

                        <View style={styles.signupRow}>
                            <Text style={styles.signupText}>{t('no_account')}</Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                                <Text style={styles.signupLink}>{t('signup')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
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
        paddingBottom: 600, // Increased headroom significantly to allow y: 400 scroll
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
