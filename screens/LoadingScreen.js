import React from 'react';
import { View, Image, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const LoadingScreen = () => {
    return (
        <View style={styles.container}>
            <View style={styles.logoWrapper}>
                <Image
                    source={require('../assets/ApnaDukan.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#111827', // Match splash-background in app.json and user photo
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoWrapper: {
        width: width * 0.7,
        height: width * 0.7,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logo: {
        width: '100%',
        height: '100%',
    },
});

export default LoadingScreen;
