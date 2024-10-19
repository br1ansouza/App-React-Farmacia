import React, { useEffect, useState, useLayoutEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Image, Alert } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';

export default function ListProducts() {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Estoque de Produtos',
      headerStyle: {
        backgroundColor: '#121212',
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    });
  }, [navigation]);

  // função para buscar a lista de produtos do backend
  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://10.0.2.2:3000/products');
      setProducts(response.data);
      setFilteredProducts(response.data);  // mostra os produtos
    } catch (error) {
      Alert.alert(':(', 'Não foi possível carregar a lista de produtos.');
    }
  };

  // carregar a lista de produtos 
  useEffect(() => {
    fetchProducts();
  }, []);

  // function de filtro
  const handleSearch = () => {
    const filtered = products.filter(product =>
      product.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.branch_name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredProducts(filtered);
  };

  const renderProductItem = ({ item }) => {
    return (
      <View style={styles.card}>
        <Image source={{ uri: item.image_url }} style={styles.productImage} />
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{item.product_name}</Text>
          <Text style={styles.branchName}>Loja: {item.branch_name}</Text>
          <Text style={styles.quantity}>Quantidade: {item.quantity}</Text>
          <Text style={styles.description}>{item.description}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Estoque</Text>

      <TextInput
        style={styles.searchInput}
        placeholder="O que você procura?"
        placeholderTextColor="#888"  // tive que forçar a alteração da cor aqui, nos styles não está mudando
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
        <Text style={styles.searchButtonText}>Pesquisar</Text>
      </TouchableOpacity>

      <FlatList
        data={filteredProducts}
        keyExtractor={(item, index) => item.id ? item.id.toString() : index.toString()} // corrigido o keyExtractor
        renderItem={renderProductItem}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  searchInput: {
    backgroundColor: '#1E1E1E',
    color: '#fff',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#333',
  },
  searchButton: {
    backgroundColor: '#6200EE',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  list: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#fff', 
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 5,  // sombra 
  },
  productImage: {
    width: 80,
    height: 80,
    marginRight: 15,
  },
  productInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  branchName: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  quantity: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  description: {
    fontSize: 12,
    color: '#888',
    marginTop: 5,
  },
});