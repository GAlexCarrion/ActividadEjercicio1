// screens/LeerProductos.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { ref, onValue, remove } from 'firebase/database';
import { db } from '../firebase/Config'; // Ruta actualizada a firebase/Config.tsx
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ProductStackParamList } from '../navigations/ProductoNavegacion'; // Ruta actualizada a ProductoNavegacion

type LeerProductosScreenNavigationProp = StackNavigationProp<ProductStackParamList, 'LeerProductos'>;

interface ProductData {
  id: string;
  nombre: string;
  precioOriginal: number;
  precioConDescuento: number;
  categoria: string;
  stock: number;
}

const LeerProductosScreen = () => {
  const navigation = useNavigation<LeerProductosScreenNavigationProp>();
  const [allProducts, setAllProducts] = useState<ProductData[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterActive, setFilterActive] = useState(false);
  const [totalInventario, setTotalInventario] = useState(0);

  useEffect(() => {
    const productsRef = ref(db, 'products/');

    const unsubscribe = onValue(productsRef, (snapshot) => {
      try {
        const data = snapshot.val();
        const loadedProducts: ProductData[] = [];
        let calculatedTotal = 0;

        if (data) {
          Object.keys(data).forEach((key) => {
            const product = data[key];
            loadedProducts.push({
              id: key,
              nombre: product.nombre,
              precioOriginal: product.precioOriginal,
              precioConDescuento: product.precioConDescuento,
              categoria: product.categoria,
              stock: product.stock,
            });
            calculatedTotal += product.precioOriginal * product.stock;
          });
        }
        setAllProducts(loadedProducts);
        setTotalInventario(calculatedTotal);
        setLoading(false);
      } catch (e: any) {
        setError('Error al procesar los datos de productos: ' + e.message);
        setLoading(false);
        console.error('Error al leer productos:', e);
      }
    }, (errorObject: Error) => {
      interface FirebaseErrorWithCode extends Error {
        code?: string;
      }
      const err = errorObject as FirebaseErrorWithCode;
      setError('Error al conectar con la base de datos de productos: ' + err.message);
      setLoading(false);
      console.error('Error de Firebase (productos):', err.code ?? 'No code', err.message);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (filterActive) {
      setFilteredProducts(allProducts.filter(product => product.stock < 10));
    } else {
      setFilteredProducts(allProducts);
    }
  }, [allProducts, filterActive]);

  const toggleFilter = () => {
    setFilterActive(prev => !prev);
  };

  const handleDeleteProduct = (productId: string, productName: string) => {
    Alert.alert(
      'Confirmar Eliminación',
      `¿Estás seguro de que quieres eliminar "${productName}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          onPress: () => {
            remove(ref(db, 'products/' + productId))
              .catch((error) => {
                Alert.alert('Error', 'No se pudo eliminar el producto: ' + error.message);
                console.error('Error al eliminar producto:', error);
              });
          },
          style: 'destructive',
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Cargando productos...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <Text style={styles.errorText}>Asegúrate de que tus reglas de Firebase Realtime Database permitan lectura para `products`.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lista de Productos</Text>

      <View style={styles.headerControls}>
        <TouchableOpacity
          style={[styles.filterButton, filterActive ? styles.filterButtonActive : {}]}
          onPress={toggleFilter}
        >
          <Text style={styles.filterButtonText}>
            {filterActive ? 'Mostrar Todos' : 'Stock < 10'}
          </Text>
        </TouchableOpacity>
        <Text style={styles.totalInventario}>
          Total Inventario: ${totalInventario.toFixed(2)}
        </Text>
      </View>

      {filteredProducts.length === 0 ? (
        <Text style={styles.noDataText}>
          {filterActive ? 'No hay productos con stock menor a 10.' : 'No hay productos registrados aún.'}
        </Text>
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.productCard}>
              <Text style={styles.cardTitle}>{item.nombre}</Text>
              <Text style={styles.cardText}><Text style={styles.cardLabel}>Categoría:</Text> {item.categoria}</Text>
              <Text style={styles.cardText}><Text style={styles.cardLabel}>Stock:</Text> {item.stock}</Text>
              <Text style={styles.cardText}><Text style={styles.cardLabel}>Precio Original:</Text> ${item.precioOriginal.toFixed(2)}</Text>
              <Text style={styles.discountedPriceText}><Text style={styles.cardLabel}>Precio con Descuento:</Text> ${item.precioConDescuento.toFixed(2)}</Text>

              <View style={styles.cardActions}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.editButton]}
                  onPress={() => navigation.navigate('EditarProductos', { productId: item.id })}
                >
                  <Text style={styles.actionButtonText}>Editar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => handleDeleteProduct(item.id, item.nombre)}
                >
                  <Text style={styles.actionButtonText}>Eliminar</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFCCCC',
  },
  errorText: {
    color: '#CC0000',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#343a40',
    textAlign: 'center',
  },
  headerControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
  },
  filterButton: {
    backgroundColor: '#007bff',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  filterButtonActive: {
    backgroundColor: '#28a745',
  },
  filterButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  totalInventario: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#343a40',
  },
  productCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#007bff',
  },
  cardText: {
    fontSize: 15,
    marginBottom: 3,
    color: '#495057',
  },
  cardLabel: {
    fontWeight: 'bold',
    color: '#343a40',
  },
  discountedPriceText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#dc3545',
    marginTop: 5,
  },
  noDataText: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    marginTop: 50,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
    marginLeft: 10,
  },
  editButton: {
    backgroundColor: '#ffc107',
  },
  deleteButton: {
    backgroundColor: '#dc3545',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default LeerProductosScreen;
