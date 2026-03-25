import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { strings } from '../constants/strings';
import { API_URL } from '../config';

const LanguageContext = createContext();

export const useLanguage = () => useContext(LanguageContext);

// Separate hook for Shopkeeper to avoid changing every screen's code manually
export const useShopLanguage = () => {
    const context = useContext(LanguageContext);
    return {
        ...context,
        currentLanguage: context.shopLanguage,
        changeLanguage: (lang) => context.changeLanguage(lang, 'shop'),
        t: (key) => context.t(key, 'shop'),
        translateProduct: (name) => context.translateProduct(name, 'shop'),
        bulkTranslate: (texts) => context.bulkTranslate(texts, 'shop'),
    };
};

export const LanguageProvider = ({ children }) => {
    const [customerLanguage, setCustomerLanguage] = useState('en');
    const [shopLanguage, setShopLanguage] = useState('en');
    const [translations, setTranslations] = useState({});
    const [isTranslating, setIsTranslating] = useState(false);

    useEffect(() => {
        loadPreferences();
    }, []);

    const loadPreferences = async () => {
        try {
            const [cust, shop] = await Promise.all([
                AsyncStorage.getItem('userLanguage'),
                AsyncStorage.getItem('shopLanguage')
            ]);
            if (cust) setCustomerLanguage(cust);
            if (shop) setShopLanguage(shop);
        } catch (error) {
            console.error('Error loading language preferences:', error);
        }
    };

    const changeLanguage = async (lang, role = 'customer') => {
        try {
            if (role === 'shop') {
                await AsyncStorage.setItem('shopLanguage', lang);
                setShopLanguage(lang);
            } else {
                await AsyncStorage.setItem('userLanguage', lang);
                setCustomerLanguage(lang);
            }
        } catch (error) {
            console.error('Error saving language preference:', error);
        }
    };

    const t = (key, role = 'customer') => {
        const lang = role === 'shop' ? shopLanguage : customerLanguage;
        return strings[lang]?.[key] || strings['en'][key] || key;
    };

    const translateProduct = (name, role = 'customer') => {
        const lang = role === 'shop' ? shopLanguage : customerLanguage;
        if (lang === 'en') return name;
        const cacheKey = `${lang}_${name}`;
        return translations[cacheKey] || name;
    };

    const bulkTranslate = async (texts, role = 'customer') => {
        const lang = role === 'shop' ? shopLanguage : customerLanguage;
        if (lang === 'en' || !texts || texts.length === 0) return;

        const toTranslate = texts.filter(text => !translations[`${lang}_${text}`]);
        if (toTranslate.length === 0) return;

        console.log(`[AI Magic] Translating ${toTranslate.length} items to ${lang} (${role})...`);
        setIsTranslating(true);
        try {
            const response = await fetch(`${API_URL}/translate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ texts: toTranslate, targetLanguage: lang })
            });

            const data = await response.json();
            if (data.translations && data.translations.length === toTranslate.length) {
                const newTranslations = {};
                toTranslate.forEach((text, index) => {
                    newTranslations[`${lang}_${text}`] = data.translations[index];
                });
                setTranslations(prev => ({ ...prev, ...newTranslations }));
                console.log(`[AI Magic] Successfully translated ${toTranslate.length} items.`);
            }
        } catch (error) {
            console.error('[AI Magic] Bulk Translation Error:', error);
        } finally {
            setIsTranslating(false);
        }
    };

    return (
        <LanguageContext.Provider value={{
            customerLanguage,
            shopLanguage,
            currentLanguage: customerLanguage, // Default for backward compatibility
            changeLanguage,
            t,
            translateProduct,
            bulkTranslate,
            isTranslating
        }}>
            {children}
        </LanguageContext.Provider>
    );
};
