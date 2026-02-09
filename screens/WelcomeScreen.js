
import {
    View,
    Text,
    StyleSheet,
    Image,
    Dimensions,
    TouchableOpacity,
    Platform,
} from 'react-native';
import { AntDesign } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const WelcomeScreen = () => {
    return (
        <View style={styles.container}>
            {/* Upper Section with Illustration */}
            <View style={styles.upperSection}>
                <Image
                    source={require('../assets/Welcome.png')}
                    style={styles.welcomeImage}
                    resizeMode="cover"
                />
            </View>

            {/* White Container with Curved Top - Overlapping Image */}
            <View style={styles.whiteContainer}>
                <View style={styles.textContainer}>
                    <Text style={styles.titleMain}>Shop Your Daily</Text>
                    <Text style={styles.titleHighlight}>Necessities</Text>
                    <Text style={styles.subtitle}>
                        Order from your neighbourhood store.{'\n'}
                        Everything from your trusted local shop, in one click.
                    </Text>
                </View>

                <TouchableOpacity style={styles.getStartedButton}>
                    <Text style={styles.buttonText}>Get Started</Text>
                    <AntDesign name="arrowright" size={20} color="#fff" style={styles.buttonIcon} />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#C9E6CA',
    },
    upperSection: {
        height: height * 0.60, // Slight adjustments for better fit
        width: '100%',
    },
    welcomeImage: {
        width: '100%',
        height: '100%',
    },
    whiteContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: height * 0.42,
        backgroundColor: '#fff',
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        paddingTop: 40, // Reduced from 55 to move text up
        paddingHorizontal: 24,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -5 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 10,
    },
    textContainer: {
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 20,
        paddingHorizontal: 10,
    },
    titleMain: {
        fontSize: 32, // Bigger
        fontWeight: '800', // Bold
        color: '#1A1A1A',
        textAlign: 'center',
        lineHeight: 38,
        fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'sans-serif',
    },
    titleHighlight: {
        fontSize: 35, // Lil chota (smaller than main)
        fontWeight: '700',
        color: '#F57c00', // Kept generic orange/brand color requested earlier
        textAlign: 'center',
        marginTop: 5,
        fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'sans-serif-medium',
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginTop: 12,
        lineHeight: 20,
        fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'sans-serif',
        opacity: 0.8,
    },
    getStartedButton: {
        backgroundColor: '#2F80ED',
        paddingVertical: 16,
        width: '70%',
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row', // Align text and icon horizontally
        marginTop: 'auto',
        marginBottom: 60,

        // Soft, premium shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 3,
    },

    buttonText: {
        color: '#FFFFFF',
        fontSize: 17,
        fontWeight: '600',
        letterSpacing: 0.4,
        fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'sans-serif-medium',
    },
    buttonIcon: {
        marginLeft: 10, // Add space between text and icon
    },
});

export default WelcomeScreen;