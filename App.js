import 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './navigation/AppNavigator';

import { ProductProvider } from './context/ProductContext';

import { OrderProvider } from './context/OrderContext';

import { AuthProvider } from './context/AuthContext';
import { CreditProvider } from './context/CreditContext';

export default function App() {
  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <AuthProvider>
          <ProductProvider>
            <CreditProvider>
              <OrderProvider>
                <NavigationContainer>
                  <AppNavigator />
                </NavigationContainer>
              </OrderProvider>
            </CreditProvider>
          </ProductProvider>
        </AuthProvider>
        <StatusBar style="auto" />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
