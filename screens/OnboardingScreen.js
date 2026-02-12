import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';

const { width, height } = Dimensions.get('window');

const OnboardingScreen = ({ navigation }) => {
  const scrollViewRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoSliding, setIsAutoSliding] = useState(true);

  const slides = [
    {
      id: 1,
      title: 'Welcome',
      description: 'Your daily essentials, delivered fresh from your trusted local Kirana store.',
      image: require('../assets/onboarding_1.png'), // Atta, Ghee, Rice
    },
    {
      id: 2,
      title: 'Organic Pulses',
      description: 'High-quality Toor, Moong, and Masoor Dal sourced directly for your family.',
      image: require('../assets/onboarding_2.png'), // Dals
    },
    {
      id: 3,
      title: 'Fresh Vegetables',
      description: 'Farm-fresh onions, potatoes, and tomatoes. Handpicked daily.',
      image: require('../assets/onboarding_3.png'), // Veggies
    },
    {
      id: 4,
      title: 'Authentic Spices',
      description: 'Pure Haldi, Mirchi, and Dhania to bring the real taste of India to your kitchen.',
      image: require('../assets/onboarding_4.png'), // Spices
    },
  ];

  // Auto-Sliding Logic
  React.useEffect(() => {
    let interval;
    if (isAutoSliding) {
      interval = setInterval(() => {
        if (currentIndex < slides.length - 1) {
          // Slide to next
          scrollViewRef.current?.scrollTo({
            x: (currentIndex + 1) * width,
            animated: true,
          });
          setCurrentIndex(prev => prev + 1);
        } else {
          // Last Slide - Navigate
          setIsAutoSliding(false); // Stop sliding
          setTimeout(() => {
            navigation.replace('Login');
          }, 1000); // Wait 1 sec before nav
        }
      }, 3000); // 3 Seconds per slide
    }
    return () => clearInterval(interval);
  }, [currentIndex, isAutoSliding, slides.length, navigation]);

  const handleScroll = (event) => {
    const slideIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentIndex(slideIndex);
  };

  const handleManualScroll = () => {
    setIsAutoSliding(false);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        onScrollBeginDrag={handleManualScroll}
        scrollEventThrottle={16}
        bounces={false}
        style={styles.scrollView}
      >
        {slides.map((slide) => (
          <View key={slide.id} style={styles.slide}>
            {/* Background Image - Full Screen */}
            <Image
              source={slide.image}
              style={styles.backgroundImage}
              resizeMode="cover"
            />

            {/* Overlay Gradient (Optional for better text visibility) */}
            {/* Overlay Gradient (Optional for better text visibility) - REMOVED as per user request */}
            {/* <View style={styles.overlay} /> */}

            {/* Content Overlay */}
            <View style={styles.contentContainer}>
              <View style={styles.textSection}>
                <Text style={styles.slideTitle}>{slide.title}</Text>
                <Text style={styles.slideDescription}>{slide.description}</Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Dots Indicator */}
      <View style={styles.dotsContainer}>
        {slides.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              currentIndex === index && styles.dotActive,
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFBF9',
  },
  scrollView: {
    flex: 1,
  },
  slide: {
    width: width,
    height: height,
    flex: 1,
    position: 'relative',
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    width: width,
    height: height,
    top: height * 0.20, // Shift image down by 15% to clear text area
    zIndex: -1,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 100, // Push text down a bit from status bar
    zIndex: 1,
    width: '100%',
  },
  textSection: {
    alignItems: 'center',
    paddingHorizontal: 30,
    marginBottom: 30,
  },
  slideTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 16,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'sans-serif',
  },
  slideDescription: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 10,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'sans-serif',
    fontWeight: '500',
  },
  nextButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
    marginTop: 20,
  },
  dotsContainer: {
    position: 'absolute',
    bottom: 50,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(0,0,0,0.2)',
    marginHorizontal: 4,
  },
  dotActive: {
    width: 24,
    height: 8,
    backgroundColor: '#4CAF50',
  },
});

export default OnboardingScreen;
