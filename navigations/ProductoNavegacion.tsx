import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import CrearProductosScreen from '../screens/CrearProductos';
import LeerProductosScreen from '../screens/LeerProductos';
import EditarProductosScreen from '../screens/EditarProductos';
import EliminarProductosScreen from '../screens/EliminarProductos';

export type ProductStackParamList = {
  CrearProductos: undefined;
  LeerProductos: undefined;
  EditarProductos: { productId: string };
  EliminarProductos: undefined;
};

const ProductStack = createStackNavigator<ProductStackParamList>();

const ProductoNavegacion = () => {
  return (
    <ProductStack.Navigator initialRouteName="CrearProductos">
      <ProductStack.Screen
        name="CrearProductos"
        component={CrearProductosScreen}
        options={{ title: 'Registro de Productos' }}
      />
      <ProductStack.Screen
        name="LeerProductos"
        component={LeerProductosScreen}
        options={{ title: 'Lista de Productos' }}
      />
      <ProductStack.Screen
        name="EditarProductos"
        component={EditarProductosScreen}
        options={{ title: 'Editar Producto' }}
      />
      <ProductStack.Screen
        name="EliminarProductos"
        component={EliminarProductosScreen}
        options={{ title: 'Eliminar Producto' }}
      />
    </ProductStack.Navigator>
  );
};

export default ProductoNavegacion;
