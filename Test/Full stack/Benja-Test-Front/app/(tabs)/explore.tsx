import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { StyleSheet, FlatList, Text, Platform, ToastAndroid, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Componentes
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Header } from '@/components/ui/Header';
import { SearchBar } from '@/components/ui/SearchBar';
import { CategoryButtons } from '@/components/ui/CategoryButtons';
import { ProductCard } from '@/components/ui/ProductCard';
import { SettingsSelector } from '@/components/ui/SettingsSelector';

// Datos y traducciones
import { getLocalizedData } from '@/constants/Translations';

// Contexts
import { useCart } from '@/contexts/CartContext';
import { useAppSettings } from '@/contexts/AppSettingsContext';

export default function SearchScreen() {
  const { query } = useLocalSearchParams<{ query: string }>();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { addToCart, getItemCount } = useCart();
  const { language, resolvedTheme } = useAppSettings();
  
  // Obtener los datos localizados según el idioma
  const {
    categories,
    featuredProducts,
    newProducts,
    texts
  } = getLocalizedData(language);
  
  // Verificar si tenemos categorías disponibles
  console.log("Explore - categories from data:", categories);
  
  // Combinar productos para la vista de rejilla
  const ALL_PRODUCTS = [...featuredProducts, ...newProducts];
  
  const [filteredProducts, setFilteredProducts] = useState(ALL_PRODUCTS);

  // Notification helper function
  const showNotification = (message: string) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      Alert.alert('SafeBities', message);
    }
  };

  // Inicializar la búsqueda si viene desde otra pantalla
  useEffect(() => {
    if (query) {
      setSearchQuery(query);
      filterProducts(query, selectedCategory);
    }
  }, [query]);

  // Filtrar productos por categoría y búsqueda
  const filterProducts = (query: string, category: string) => {
    const searchText = query.toLowerCase().trim();
    let filtered = ALL_PRODUCTS;
    
    // Filtrar por categoría
    if (category !== 'all') {
      // Simulamos filtrado por categoría (en una app real, tendrías una propiedad de categoría)
      filtered = filtered.filter((_, index) => 
        index % categories.length === categories.findIndex(c => c.id === category)
      );
    }
    
    // Filtrar por texto de búsqueda
    if (searchText) {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(searchText)
      );
    }
    
    setFilteredProducts(filtered);
  };

  const handleSearch = () => {
    filterProducts(searchQuery, selectedCategory);
  };

  const handleCategoryPress = (categoryId: string) => {
    setSelectedCategory(categoryId);
    filterProducts(searchQuery, categoryId);
  };

  const handleProductPress = (productId: string) => {
    console.log('Product pressed:', productId);
    // En una implementación real, navegaríamos a la página de detalles del producto
  };

  const handleAddToCart = (productId: string) => {
    const product = ALL_PRODUCTS.find(product => product.id === productId);
    
    if (product) {
      addToCart(product);
      showNotification(texts.home.productAdded);
    }
  };

  const handleFavorite = (productId: string) => {
    showNotification(texts.home.favoriteAdded);
  };

  const handleCartPress = () => {
    router.push('/cart');
  };
  
  const handleSettingsPress = () => {
    setIsSettingsVisible(true);
  };

  return (
    <ThemedView style={styles.container}>
      <StatusBar style="auto" />
      <Header 
        title={texts.search.title}
        onCartPress={handleCartPress}
        onSettingsPress={handleSettingsPress}
        cartItemsCount={getItemCount()}
      />
      
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        onSubmit={handleSearch}
        placeholder={texts.home.search}
      />
      
      <CategoryButtons
        categories={categories}
        selectedCategoryId={selectedCategory || 'all'}
        onCategoryPress={handleCategoryPress}
      />
      
      <FlatList
        data={filteredProducts}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + 20 }
        ]}
        renderItem={({ item }) => (
          <ProductCard
            {...item}
            onPress={() => handleProductPress(item.id)}
            onAddToCart={() => handleAddToCart(item.id)}
            onFavorite={() => handleFavorite(item.id)}
          />
        )}
        ListEmptyComponent={
          <ThemedView style={styles.emptyContainer}>
            <Text style={[styles.emptyText, {color: resolvedTheme === 'dark' ? '#FFF' : '#000'}]}>
              {texts.search.noResults}
            </Text>
          </ThemedView>
        }
      />
      
      <SettingsSelector 
        isVisible={isSettingsVisible} 
        onClose={() => setIsSettingsVisible(false)} 
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 8,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
    marginTop: 40,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
  },
});