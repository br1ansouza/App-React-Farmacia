import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './src/Pages/Login/Login';  // vai manter o login
import HomeScreen from './src/Pages/Home/Home'; 
import ListProductsScreen from './src/Pages/Products/ListProducts'; // tela de estoque
import ListUsersScreen from './src/Pages/Users/ListUsers'; // tela de usuários

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
          options={{ headerShown: true }} // manter o cabeçalho?
        />
        <Stack.Screen
          name="ListUsers"
          component={ListUsersScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
