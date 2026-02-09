import 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './navigation/AppNavigator';

import { ProductProvider } from './context/ProductContext';

export default function App() {
  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <ProductProvider>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </ProductProvider>
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
