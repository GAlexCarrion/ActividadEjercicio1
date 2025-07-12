// App.tsx
import 'react-native-gesture-handler';

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Text } from 'react-native';

// Importa el navegador con su nuevo nombre
import ProductoNavegacion from './navigations/ProductoNavegacion';

export default function App() {
  return (
    <NavigationContainer>
      <ProductoNavegacion />
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
