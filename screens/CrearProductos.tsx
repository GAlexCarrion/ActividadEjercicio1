// screens/CrearProductos.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ScrollView } from 'react-native';
import { ref, set, push } from 'firebase/database';
import { db } from '../firebase/Config'; // Ruta actualizada a firebase/Config.tsx
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ProductStackParamList } from '../navigations/ProductoNavegacion'; // Ruta actualizada a ProductoNavegacion

type CrearProductosScreenNavigationProp = StackNavigationProp<ProductStackParamList, 'CrearProductos'>;

const CrearProductosScreen = () => {
  const navigation = useNavigation<CrearProductosScreenNavigationProp>();
  const [nombre, setNombre] = useState('');
  const [precio, setPrecio] = useState('');
  const [categoria, setCategoria] = useState('');
  const [stock, setStock] = useState('');
  const [precioConDescuento, setPrecioConDescuento] = useState('0.00');

  useEffect(() => {
    const precioNum = parseFloat(precio);
    if (!isNaN(precioNum) && precioNum > 0) {
      const descuento = precioNum * 0.90;
      setPrecioConDescuento(descuento.toFixed(2));
    } else {
      setPrecioConDescuento('0.00');
    }
  }, [precio]);

  const guardar = () => {
    if (!nombre || !precio || !categoria || !stock) {
      Alert.alert('Error', 'Por favor, completa todos los campos.');
      return;
    }

    const precioNum = parseFloat(precio);
    const stockNum = parseInt(stock);

    if (isNaN(precioNum) || precioNum <= 0) {
      Alert.alert('Error', 'El precio debe ser un número positivo.');
      return;
    }
    if (isNaN(stockNum) || stockNum < 0) {
      Alert.alert('Error', 'El stock debe ser un número entero no negativo.');
      return;
    }

    const productsRef = ref(db, 'products/');
    const newProductRef = push(productsRef);
    const newProductKey = newProductRef.key;

    if (!newProductKey) {
      Alert.alert('Error', 'No se pudo generar una clave única para el producto.');
      return;
    }

    set(ref(db, 'products/' + newProductKey), {
      id: newProductKey,
      nombre: nombre,
      precioOriginal: precioNum,
      precioConDescuento: parseFloat(precioConDescuento),
      categoria: categoria,
      stock: stockNum,
    })
    .then(() => {
      Alert.alert('Éxito', 'Producto guardado correctamente en Firebase.');
      setNombre('');
      setPrecio('');
      setCategoria('');
      setStock('');
    })
    .catch((error) => {
      Alert.alert('Error', 'Hubo un problema al guardar el producto: ' + error.message);
      console.error('Error al guardar producto:', error);
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Registrar Nuevo Producto</Text>

      <TextInput
        style={styles.input}
        placeholder="Nombre del Producto"
        value={nombre}
        onChangeText={setNombre}
      />
      <TextInput
        style={styles.input}
        placeholder="Precio Original"
        value={precio}
        onChangeText={setPrecio}
        keyboardType="numeric"
      />
      <View style={styles.discountedPriceContainer}>
        <Text style={styles.discountedPriceLabel}>Precio con Descuento (10%):</Text>
        <Text style={styles.discountedPriceValue}>${precioConDescuento}</Text>
      </View>
      <TextInput
        style={styles.input}
        placeholder="Categoría"
        value={categoria}
        onChangeText={setCategoria}
      />
      <TextInput
        style={styles.input}
        placeholder="Stock"
        value={stock}
        onChangeText={setStock}
        keyboardType="numeric"
      />

      <Button
        title="Guardar Producto"
        onPress={guardar}
        color="#28a745"
      />

      <View style={styles.buttonSpacer} />
      <Button
        title="Ver Lista de Productos"
        onPress={() => navigation.navigate('LeerProductos')}
        color="#007bff"
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
  discountedPriceContainer: {
    width: '90%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#e9ecef',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  discountedPriceLabel: {
    fontSize: 16,
    color: '#495057',
    fontWeight: 'bold',
  },
  discountedPriceValue: {
    fontSize: 18,
    color: '#dc3545',
    fontWeight: 'bold',
  },
  buttonSpacer: {
    height: 15,
  },
});

export default CrearProductosScreen;
