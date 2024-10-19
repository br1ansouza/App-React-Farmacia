import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ListProducts = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>tela</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  text: {
    fontSize: 18,
    color: '#fff',
  },
});

export default ListProducts;