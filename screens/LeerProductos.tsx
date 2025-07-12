// screens/LeerProductos.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { ref, onValue, remove } from 'firebase/database';
import { db } from '../firebase/Config';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ProductStackParamList } from '../navigations/ProductoNavegacion';

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
        <ActivityIndicator size="large" color="#D32F2F" />
        <Text style={styles.loadingText}>Cargando productos...</Text>
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
          Total Inventario: <Text style={styles.totalInventarioValue}>${totalInventario.toFixed(2)}</Text>
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
            <View style={[styles.productCard, item.stock < 10 && styles.lowStockCard]}>
              <Text style={styles.cardTitle}>{item.nombre}</Text>
              <Text style={styles.cardText}><Text style={styles.cardLabel}>Categoría:</Text> {item.categoria}</Text>
              <Text style={styles.cardText}><Text style={styles.cardLabel}>Stock:</Text> {item.stock}</Text>
              <Text style={styles.cardText}><Text style={styles.cardLabel}>Precio Original:</Text> <Text style={styles.originalPriceValue}>${item.precioOriginal.toFixed(2)}</Text></Text>
              <Text style={styles.discountedPriceText}><Text style={styles.cardLabel}>Precio con Descuento:</Text> <Text style={styles.discountedPriceValue}>${item.precioConDescuento.toFixed(2)}</Text></Text>

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
    padding: 25,
    backgroundColor: '#fcfcfc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fcfcfc',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 17,
    color: '#555',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 25,
    backgroundColor: '#ffebee', 
    borderRadius: 15,
    margin: 20,
    borderWidth: 1,
    borderColor: '#ef9a9a',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
  },
  errorText: {
    color: '#D32F2F', 
    fontSize: 17,
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: '600',
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    marginBottom: 25,
    color: '#212121',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  headerControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
    width: '100%',
    paddingHorizontal: 5,
  },
  filterButton: {
    backgroundColor: '#424242', 
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 4,
  },
  filterButtonActive: {
    backgroundColor: '#D32F2F', 
  },
  filterButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.3,
  },
  totalInventario: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
  },
  totalInventarioValue: {
    color: '#D32F2F', 
    fontSize: 19,
    fontWeight: 'bold',
  },
  productCard: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
    borderLeftWidth: 6,
    borderLeftColor: '#424242', 
  },
  lowStockCard: {
    borderLeftColor: '#D32F2F', 
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 10,
    color: '#212121',
  },
  cardText: {
    fontSize: 16,
    marginBottom: 5,
    color: '#555',
  },
  cardLabel: {
    fontWeight: '600',
    color: '#424242',
  },
  originalPriceValue: {
    color: '#4CAF50', 
    fontWeight: 'bold',
  },
  discountedPriceText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#D32F2F', 
    marginTop: 10,
  },
  discountedPriceValue: {
    fontSize: 19,
    fontWeight: 'bold',
  },
  noDataText: {
    fontSize: 18,
    color: '#6c757d',
    textAlign: 'center',
    marginTop: 60,
    fontStyle: 'italic',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#eeeeee', 
    paddingTop: 15,
  },
  actionButton: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
    marginLeft: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  editButton: {
    backgroundColor: '#FFC107', 
  },
  deleteButton: {
    backgroundColor: '#D32F2F', 
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
    letterSpacing: 0.3,
  },
});

export default LeerProductosScreen;
