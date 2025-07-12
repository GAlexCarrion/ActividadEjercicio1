// screens/EliminarProductos.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ScrollView } from 'react-native';
import { ref, remove } from 'firebase/database';
import { db } from '../firebase/Config'; // Ruta actualizada a firebase/Config.tsx

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
        value={productId}
        onChangeText={setProductId}
        autoCapitalize="none"
      />

      <Button
        title="Eliminar Producto"
        onPress={eliminar}
        color="#dc3545"
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#343a40',
    textAlign: 'center',
  },
  input: {
    width: '90%',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#fff',
  },
});

export default EliminarProductosScreen;
