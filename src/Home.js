import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';

const categories = [
  { id: '1', name: 'Electronics', image: 'https://via.placeholder.com/100' },
  { id: '2', name: 'Fashion', image: 'https://via.placeholder.com/100' },
  { id: '3', name: 'Home & Kitchen', image: 'https://via.placeholder.com/100' },
];

const products = [
  { id: '1', name: 'Smartphone', price: '$699', image: 'https://via.placeholder.com/150' },
  { id: '2', name: 'Laptop', price: '$999', image: 'https://via.placeholder.com/150' },
  { id: '3', name: 'Headphones', price: '$199', image: 'https://via.placeholder.com/150' },
];

export default function HomeScreen() {
  const renderCategory = ({ item }) => (
    <TouchableOpacity style={styles.category}>
      <Image source={{ uri: item.image }} style={styles.categoryImage} />
      <Text style={styles.categoryName}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderProduct = ({ item }) => (
    <View style={styles.product}>
      <Image source={{ uri: item.image }} style={styles.productImage} />
      <Text style={styles.productName}>{item.name}</Text>
      <Text style={styles.productPrice}>{item.price}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Our Store!</Text>

      <Text style={styles.subtitle}>Categories</Text>
      <FlatList
        data={categories}
        renderItem={renderCategory}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}
      />

      <Text style={styles.subtitle}>Featured Products</Text>
      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.productRow}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F0F4FF',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  categoriesContainer: {
    paddingVertical: 8,
  },
  category: {
    alignItems: 'center',
    marginRight: 16,
  },
  categoryImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  categoryName: {
    marginTop: 4,
    fontWeight: 'bold',
  },
  productRow: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  product: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
    marginBottom: 16,
    elevation: 2, // For Android shadow
    shadowColor: '#000', // For iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    flexGrow: 1,
    marginHorizontal: 4,
  },
  productImage: {
    width: '100%',
    height: 100,
    borderRadius: 10,
    resizeMode: 'contain',
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 4,
  },
  productPrice: {
    color: '#888',
    fontSize: 14,
  },
});
