// screens/EditarProductos.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { ref, update, get } from 'firebase/database';
import { db } from '../firebase/Config'; // Ruta actualizada a firebase/Config.tsx
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ProductStackParamList } from '../navigations/ProductoNavegacion'; // Ruta actualizada a ProductoNavegacion

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
        value={productIdInput}
        onChangeText={setProductIdInput}
        autoCapitalize="none"
        editable={!routeProductId}
      />
      {!routeProductId && (
        <Button
          title="Buscar Producto"
          onPress={() => buscarProducto(productIdInput)}
          color="#007bff"
          disabled={loading}
        />
      )}

      {loading ? (
        <ActivityIndicator size="small" color="#0000ff" style={{ marginTop: 15 }} />
      ) : null}

      {currentProduct ? (
        <View style={styles.productDetails}>
          <Text style={styles.detailTitle}>Producto Encontrado:</Text>
          <Text style={styles.detailText}><Text style={styles.detailLabel}>Nombre:</Text> {currentProduct.nombre}</Text>
          <Text style={styles.detailText}><Text style={styles.detailLabel}>Categoría:</Text> {currentProduct.categoria}</Text>

          <TextInput
            style={styles.input}
            placeholder="Nuevo Precio Original"
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
            value={newStock}
            onChangeText={setNewStock}
            keyboardType="numeric"
          />
          <Button
            title="Actualizar Producto"
            onPress={editar}
            color="#ffc107"
          />
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
  productDetails: {
    width: '100%',
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    alignItems: 'center',
  },
  detailTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#555',
  },
  detailText: {
    fontSize: 16,
    marginBottom: 5,
    color: '#495057',
  },
  detailLabel: {
    fontWeight: 'bold',
    color: '#343a40',
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
});

export default EditarProductosScreen;
