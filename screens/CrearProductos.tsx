// screens/CrearProductos.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, ScrollView, TouchableOpacity } from 'react-native';
import { ref, set, push } from 'firebase/database';
import { db } from '../firebase/Config';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ProductStackParamList } from '../navigations/ProductoNavegacion';

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
      <View style={styles.header}>
        {/* Icono de Producto (SVG inline) */}
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>📦</Text>
        </View>
        <Text style={styles.title}>Registrar Nuevo Producto</Text>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Nombre del Producto"
        placeholderTextColor="#888"
        value={nombre}
        onChangeText={setNombre}
      />
      <TextInput
        style={styles.input}
        placeholder="Precio Original"
        placeholderTextColor="#888"
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
        placeholderTextColor="#888"
        value={categoria}
        onChangeText={setCategoria}
      />
      <TextInput
        style={styles.input}
        placeholder="Stock"
        placeholderTextColor="#888"
        value={stock}
        onChangeText={setStock}
        keyboardType="numeric"
      />

      <TouchableOpacity style={styles.primaryButton} onPress={guardar}>
        <Text style={styles.buttonText}>Guardar Producto</Text>
      </TouchableOpacity>

      <View style={styles.buttonSpacer} />
      <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate('LeerProductos')}>
        <Text style={styles.buttonText}>Ver Lista de Productos</Text>
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
    backgroundColor: '#fcfcfc', // Fondo muy claro, casi blanco
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 35,
  },
  iconContainer: {
    marginRight: 10,
    backgroundColor: '#D32F2F', // Fondo rojo para el icono
    borderRadius: 8,
    padding: 5,
  },
  icon: {
    fontSize: 30, // Tamaño del icono
    color: '#ffffff', // Color blanco para el icono
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: '#212121', // Negro oscuro para el título
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  input: {
    width: '95%',
    padding: 16,
    borderWidth: 1,
    borderColor: '#bdbdbd', // Borde gris medio
    borderRadius: 12,
    marginBottom: 18,
    fontSize: 17,
    backgroundColor: '#ffffff',
    color: '#424242', // Texto gris oscuro
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  discountedPriceContainer: {
    width: '95%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffebee', // Rojo muy claro para el contenedor de descuento
    padding: 18,
    borderRadius: 12,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#ef9a9a', // Borde rojo claro
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  discountedPriceLabel: {
    fontSize: 17,
    color: '#D32F2F', // Rojo oscuro para la etiqueta
    fontWeight: '600',
  },
  discountedPriceValue: {
    fontSize: 22,
    color: '#D32F2F', // Rojo oscuro para el valor
    fontWeight: 'bold',
  },
  primaryButton: {
    width: '95%',
    padding: 18,
    borderRadius: 12,
    backgroundColor: '#D32F2F', // Rojo principal para guardar
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  secondaryButton: {
    width: '95%',
    padding: 18,
    borderRadius: 12,
    backgroundColor: '#424242', // Gris oscuro para ver lista
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
  buttonSpacer: {
    height: 20,
  },
});

export default CrearProductosScreen;
