// screens/EliminarProductos.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, ScrollView, TouchableOpacity } from 'react-native';
import { ref, remove } from 'firebase/database';
import { db } from '../firebase/Config';

const EliminarProductosScreen = () => {
  const [productId, setProductId] = useState('');

  const eliminar = () => {
    if (!productId) {
      Alert.alert('Error', 'Por favor, ingresa el ID del producto a eliminar.');
      return;
    }

    Alert.alert(
      'Confirmar Eliminación',
      `¿Estás seguro de que quieres eliminar el producto con ID: ${productId}?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Eliminar',
          onPress: () => {
            remove(ref(db, 'products/' + productId))
              .then(() => {
                Alert.alert('Éxito', `Producto con ID ${productId} eliminado correctamente.`);
                setProductId('');
              })
              .catch((error) => {
                Alert.alert('Error', 'Hubo un problema al eliminar el producto: ' + error.message);
                console.error('Error al eliminar producto:', error);
              });
          },
          style: 'destructive',
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Eliminar Producto</Text>

      <TextInput
        style={styles.input}
        placeholder="ID del Producto a Eliminar"
        placeholderTextColor="#888"
        value={productId}
        onChangeText={setProductId}
        autoCapitalize="none"
      />

      <TouchableOpacity style={styles.deleteButton} onPress={eliminar}>
        <Text style={styles.buttonText}>Eliminar Producto</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 25,
    backgroundColor: '#fcfcfc',
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    marginBottom: 35,
    color: '#212121',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  input: {
    width: '95%',
    padding: 16,
    borderWidth: 1,
    borderColor: '#bdbdbd',
    borderRadius: 12,
    marginBottom: 25,
    fontSize: 17,
    backgroundColor: '#ffffff',
    color: '#424242',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  deleteButton: {
    width: '95%',
    padding: 18,
    borderRadius: 12,
    backgroundColor: '#D32F2F', // Rojo principal para eliminar
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 19,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});

export default EliminarProductosScreen;
