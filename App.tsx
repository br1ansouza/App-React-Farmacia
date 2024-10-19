import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './src/Pages/Login/Login';  // vai manter o login
import HomeScreen from './src/Pages/Home/Home';
import ListProductsScreen from './src/Pages/Products/ListProducts'; // tela de estoque
import ListUsersScreen from './src/Pages/Users/ListUsers'; // tela de usuários
import RegisterUserScreen from './src/Pages/Users/RegisterUsers'; // cadastro de usuários
import ListMovements from './src/Pages/Movements/ListMovements'; // lista movimentações
import RegisterMovementScreen from './src/Pages/Movements/RegisterMovements'; // registro movimentações

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }} // isso remove o cabeçalho da tela
        />
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ListProducts"
          component={ListProductsScreen}
          options={{
            headerShown: true,
            title: 'Produtos',
            headerStyle: { backgroundColor: '#121212' },
            headerTintColor: '#fff',
          }}
        />
        <Stack.Screen
          name="ListUsers"
          component={ListUsersScreen}
          options={{
            headerShown: true,
            title: 'Usuários',
            headerStyle: { backgroundColor: '#121212' },
            headerTintColor: '#fff',
          }}
        />
        <Stack.Screen
          name="RegisterUser"
          component={RegisterUserScreen}
          options={{
            headerShown: true,
            title: 'Criar Usuário',
            headerStyle: { backgroundColor: '#121212' },
            headerTintColor: '#fff',
          }}
        />
        <Stack.Screen
          name="ListMovements"
          component={ListMovements}
          options={{
            headerShown: true,
            title: 'Movimentações',
            headerStyle: { backgroundColor: '#121212' },
            headerTintColor: '#fff',
          }}
        />
        <Stack.Screen
          name="RegisterMovement"
          component={RegisterMovementScreen}
          options={{
            headerShown: true,
            title: 'Adicionar Movimentação',
            headerStyle: { backgroundColor: '#121212' },
            headerTintColor: '#fff',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
