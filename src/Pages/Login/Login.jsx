import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

                                                            // checagem do usuário já está logado ao carregar a tela
  useEffect(() => {
    const checkLoginStatus = async () => {
      const userName = await AsyncStorage.getItem('@userName');
      if (userName) {
                                                              // quando o usuário logado, redireciona para a Home
        navigation.reset({
          index: 0,
          routes: [{ name: 'Home' }],
        });
      }
    };
    checkLoginStatus();
  }, []);

  const handleLogin = async () => {
    if (email === '' || senha === '') {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }

    try {
      const response = await axios.post('http://10.0.2.2:3000/login', { email, password: senha });

      if (response.status === 200) {
        const { name, profile } = response.data;

        
        await AsyncStorage.setItem('@userName', name);           // armazena o nome e perfil do usuário no AsyncStorage
        await AsyncStorage.setItem('@userProfile', profile);

        
        navigation.reset({                                       // redireciona para a tela Home
          index: 0,
          routes: [{ name: 'Home' }],
        });
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        Alert.alert('Erro', 'Credenciais inválidas.');
      } else {
        Alert.alert('Erro', 'Falha ao conectar-se ao servidor.');
      }
    }
  };

  return (
    <View style={styles.container}>
      <Image 
        source={{ uri: 'https://imgs.search.brave.com/LxW04-pB5zsiGrWTxqVUVxKaZlN_maZwECxYQ6kLwqQ/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly9sb2dv/cy13b3JsZC5uZXQv/d3AtY29udGVudC91/cGxvYWRzLzIwMjMv/MDEvVW1icmVsbGEt/Q29ycG9yYXRpb24t/TG9nby01MDB4Mjgx/LnBuZw' }} 
        style={styles.logo} 
      />
      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        placeholder="email@email.com"
        placeholderTextColor="#888"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <Text style={styles.label}>Senha</Text>
      <TextInput
        style={styles.input}
        placeholder="******"
        placeholderTextColor="#888"
        value={senha}
        onChangeText={setSenha}
        secureTextEntry
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Entrar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212', 
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: 40,
  },
  label: {
    color: '#fff',
    alignSelf: 'flex-start',
    marginBottom: 5,
    marginLeft: 20,
  },
  input: {
    width: '100%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    backgroundColor: '#1E1E1E', 
    color: '#fff', 
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#6200EE', // roxo
    paddingVertical: 12,
    paddingHorizontal: 80,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
