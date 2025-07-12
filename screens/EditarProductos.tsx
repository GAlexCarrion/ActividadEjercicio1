// screens/EditarProductos.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { ref, update, get } from 'firebase/database';
import { db } from '../firebase/Config';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ProductStackParamList } from '../navigations/ProductoNavegacion';

type EditarProductosScreenRouteProp = RouteProp<ProductStackParamList, 'EditarProductos'>;
type EditarProductosScreenNavigationProp = StackNavigationProp<ProductStackParamList, 'EditarProductos'>;

interface ProductData {
  id: string;
  nombre: string;
  precioOriginal: number;
  precioConDescuento: number;
  categoria: string;
  stock: number;
}

const EditarProductosScreen = () => {
  const route = useRoute<EditarProductosScreenRouteProp>();
  const navigation = useNavigation<EditarProductosScreenNavigationProp>();
  const { productId: routeProductId } = route.params;

  const [productIdInput, setProductIdInput] = useState(routeProductId || '');
  const [currentProduct, setCurrentProduct] = useState<ProductData | null>(null);
  const [newPrecio, setNewPrecio] = useState('');
  const [newStock, setNewStock] = useState('');
  const [newPrecioConDescuento, setNewPrecioConDescuento] = useState('0.00');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const precioNum = parseFloat(newPrecio);
    if (!isNaN(precioNum) && precioNum > 0) {
      const descuento = precioNum * 0.90;
      setNewPrecioConDescuento(descuento.toFixed(2));
    } else {
      setNewPrecioConDescuento('0.00');
    }
  }, [newPrecio]);

  const buscarProducto = useCallback(async (idToSearch: string) => {
    if (!idToSearch) {
      console.warn('buscarProducto: ID de búsqueda vacío. No se realizará la búsqueda.');
      return;
    }
    setLoading(true);
    setCurrentProduct(null);
    setNewPrecio('');
    setNewStock('');

    try {
      const productRef = ref(db, 'products/' + idToSearch);
      const snapshot = await get(productRef);

      if (snapshot.exists()) {
        const data = snapshot.val() as ProductData;
        setCurrentProduct(data);
        setNewPrecio(data.precioOriginal.toString());
        setNewStock(data.stock.toString());
      } else {
        Alert.alert('No encontrado', 'No se encontró ningún producto con ese ID.');
      }
    } catch (error: any) {
      Alert.alert('Error', 'Hubo un problema al buscar el producto: ' + error.message);
      console.error('Error al buscar producto:', error);
    } finally {
      setLoading(false);
    }
  }, [db]);

  useEffect(() => {
    if (routeProductId) {
      buscarProducto(routeProductId);
    }
  }, [routeProductId, buscarProducto]);

  const editar = () => {
    if (!currentProduct || !newPrecio || !newStock) {
      Alert.alert('Error', 'Por favor, busca un producto y completa los campos para actualizar.');
      return;
    }

    const precioNum = parseFloat(newPrecio);
    const stockNum = parseInt(newStock);

    if (isNaN(precioNum) || precioNum <= 0) {
      Alert.alert('Error', 'El nuevo precio debe ser un número positivo.');
      return;
    }
    if (isNaN(stockNum) || stockNum < 0) {
      Alert.alert('Error', 'El nuevo stock debe ser un número entero no negativo.');
      return;
    }

    update(ref(db, 'products/' + currentProduct.id), {
      precioOriginal: precioNum,
      precioConDescuento: parseFloat(newPrecioConDescuento),
      stock: stockNum,
    })
    .then(() => {
      Alert.alert('Éxito', 'Producto actualizado correctamente.', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    })
    .catch((error) => {
      Alert.alert('Error', 'Hubo un problema al actualizar los datos: ' + error.message);
      console.error('Error al actualizar datos:', error);
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Editar Producto</Text>

      <TextInput
        style={styles.input}
        placeholder="ID del Producto a Editar"
        placeholderTextColor="#888"
        value={productIdInput}
        onChangeText={setProductIdInput}
        autoCapitalize="none"
        editable={!routeProductId}
      />
      {!routeProductId && (
        <TouchableOpacity style={styles.primaryButton} onPress={() => buscarProducto(productIdInput)}>
          <Text style={styles.buttonText}>Buscar Producto</Text>
        </TouchableOpacity>
      )}

      {loading ? (
        <ActivityIndicator size="large" color="#D32F2F" style={{ marginTop: 20 }} />
      ) : null}

      {currentProduct ? (
        <View style={styles.productDetails}>
          <Text style={styles.detailTitle}>Producto Encontrado:</Text>
          <Text style={styles.detailText}><Text style={styles.detailLabel}>Nombre:</Text> {currentProduct.nombre}</Text>
          <Text style={styles.detailText}><Text style={styles.detailLabel}>Categoría:</Text> {currentProduct.categoria}</Text>

          <TextInput
            style={styles.input}
            placeholder="Nuevo Precio Original"
            placeholderTextColor="#888"
            value={newPrecio}
            onChangeText={setNewPrecio}
            keyboardType="numeric"
          />
          <View style={styles.discountedPriceContainer}>
            <Text style={styles.discountedPriceLabel}>Nuevo Precio con Descuento:</Text>
            <Text style={styles.discountedPriceValue}>${newPrecioConDescuento}</Text>
          </View>
          <TextInput
            style={styles.input}
            placeholder="Nuevo Stock"
            placeholderTextColor="#888"
            value={newStock}
            onChangeText={setNewStock}
            keyboardType="numeric"
          />
          <TouchableOpacity style={styles.updateButton} onPress={editar}>
            <Text style={styles.buttonText}>Actualizar Producto</Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'flex-start',
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
    marginBottom: 18,
    fontSize: 17,
    backgroundColor: '#ffffff',
    color: '#424242',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButton: {
    width: '95%',
    padding: 18,
    borderRadius: 12,
    backgroundColor: '#424242', // Gris oscuro para buscar
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  updateButton: {
    backgroundColor: '#D32F2F', // Rojo principal para actualizar
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 19,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  productDetails: {
    width: '100%',
    marginTop: 30,
    paddingTop: 25,
    borderTopWidth: 1,
    borderTopColor: '#eeeeee',
    alignItems: 'center',
  },
  detailTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
    color: '#212121',
  },
  detailText: {
    fontSize: 17,
    marginBottom: 8,
    color: '#555',
  },
  detailLabel: {
    fontWeight: '600',
    color: '#424242',
  },
  discountedPriceContainer: {
    width: '95%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffebee',
    padding: 18,
    borderRadius: 12,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#ef9a9a',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  discountedPriceLabel: {
    fontSize: 17,
    color: '#D32F2F',
    fontWeight: '600',
  },
  discountedPriceValue: {
    fontSize: 22,
    color: '#D32F2F',
    fontWeight: 'bold',
  },
});

export default EditarProductosScreen;
