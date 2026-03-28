import React from 'react';
import { View, Image, StyleSheet, Dimensions, Text } from 'react-native';

const { width } = Dimensions.get('window');

const LoadingScreen = () => {
    return (
        <View style={styles.container}>
            <View style={styles.cardContainer}>
                <View style={styles.imageCard}>
                    <Image
                        source={require('../assets/ApnaDukan.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                </View>
                <Text style={styles.appName}>Apna Dukan</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FF69B4', // Bright Pink for Testing
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardContainer: {
        alignItems: 'center',
    },
    imageCard: {
        width: width * 0.55,
        height: width * 0.55,
        backgroundColor: '#FFFFFF',
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 8,
        marginBottom: 25,
        padding: 10,
    },
    logo: {
        width: '100%',
        height: '100%',
    },
    appName: {
        fontSize: 24,
        fontWeight: '700',
        color: '#000000',
        letterSpacing: 0.5,
    },
});

export default LoadingScreen;
