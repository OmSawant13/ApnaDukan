import 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './navigation/AppNavigator';

import { ProductProvider } from './context/ProductContext';

import { OrderProvider } from './context/OrderContext';

import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { CreditProvider } from './context/CreditContext';
import { LanguageProvider } from './context/LanguageContext';
import { ShopProvider } from './context/ShopContext';

import * as SplashScreen from 'expo-splash-screen';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync().catch(() => {
  /* reloading the app might cause some security errors, ignore the warning */
});

export default function App() {
  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <LanguageProvider>
          <SocketProvider>
            <AuthProvider>
              <ShopProvider>
                <ProductProvider>
                  <CreditProvider>
                    <OrderProvider>
                      <NavigationContainer>
                        <AppNavigator />
                      </NavigationContainer>
                    </OrderProvider>
                  </CreditProvider>
                </ProductProvider>
              </ShopProvider>
            </AuthProvider>
          </SocketProvider>
        </LanguageProvider>
        <StatusBar style="light" />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});
