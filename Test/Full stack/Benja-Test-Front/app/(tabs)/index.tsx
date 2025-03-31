import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, View, Text, ToastAndroid, Platform, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Componentes
import { ThemedView } from '@/components/ThemedView';
import { Header } from '@/components/ui/Header';
import { SearchBar } from '@/components/ui/SearchBar';
import { CategoryButtons } from '@/components/ui/CategoryButtons';
import { PromoBanner } from '@/components/ui/PromoBanner';
import { ProductCarousel } from '@/components/ui/ProductCarousel';
import { Footer } from '@/components/ui/Footer';
import { SettingsSelector } from '@/components/ui/SettingsSelector';

// Datos y traducciones
import { getLocalizedData } from '@/constants/Translations';

// Contexts
import { useCart } from '@/contexts/CartContext';
import { useAppSettings } from '@/contexts/AppSettingsContext';

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { addToCart, getItemCount } = useCart();
  const { language } = useAppSettings();
  
  // Obtener los datos localizados según el idioma
  const {
    categories,
    featuredProducts,
    newProducts,
    discountProducts,
    footerLinks,
    promoBanners,
    texts
  } = getLocalizedData(language);
  
  // Verificar si tenemos categorías disponibles
  console.log("Index - categories from data:", categories);

  // Notification helper function
  const showNotification = (message: string) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      Alert.alert('SafeBities', message);
    }
  };

  // Manejadores de eventos
  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push({
        pathname: '/explore',
        params: { query: searchQuery },
      });
    }
  };

  const handleFilterPress = () => {
    router.push('/explore');
  };

  const handleCategoryPress = (categoryId: string) => {
    setSelectedCategory(categoryId);
    // Filtramos los productos según la categoría seleccionada
  };

  const handleProductPress = (productId: string) => {
    console.log('Product pressed:', productId);
    // En una implementación real, navegaríamos a la página de detalles del producto
  };

  const handleAddToCart = (productId: string) => {
    const product = [...featuredProducts, ...newProducts]
      .find(product => product.id === productId);
    
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

  const handleProfilePress = () => {
    console.log('Profile pressed');
    // En una implementación real, navegaríamos al perfil del usuario
  };
  
  const handleSettingsPress = () => {
    setIsSettingsVisible(true);
  };

  const handlePromoBannerPress = () => {
    router.push('/explore');
  };

  return (
    <ThemedView style={styles.container}>
      <StatusBar style="auto" />
      <Header 
        onCartPress={handleCartPress}
        onProfilePress={handleProfilePress}
        onSettingsPress={handleSettingsPress}
        cartItemsCount={getItemCount()}
      />
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom }}
      >
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmit={handleSearch}
          onFilterPress={handleFilterPress}
          placeholder={texts.home.search}
        />
        
        {/* Datos depuración */}
        <Text style={{padding: 10, fontSize: 12, color: 'red'}}>
          Debug: Categoría seleccionada: {selectedCategory}, 
          Número de categorías: {categories?.length || 0}, 
          Primera categoría: {categories && categories.length > 0 ? `${categories[0].id}:${categories[0].name}` : 'ninguna'}
        </Text>
        
        <CategoryButtons
          categories={categories}
          selectedCategoryId={selectedCategory || 'all'}
          onCategoryPress={handleCategoryPress}
        />
        
        <View style={styles.bannerContainer}>
          <PromoBanner
            title={promoBanners[0].title}
            subtitle={promoBanners[0].subtitle}
            imageUrl={promoBanners[0].imageUrl}
            onPress={handlePromoBannerPress}
          />
        </View>
        
        <ProductCarousel
          title={texts.home.featuredProducts}
          products={selectedCategory === 'all' 
            ? featuredProducts 
            : featuredProducts.filter((_, index) => index % categories.length === categories.findIndex(c => c.id === selectedCategory))}
          onProductPress={handleProductPress}
          onAddToCart={handleAddToCart}
          onFavorite={handleFavorite}
        />
        
        <ProductCarousel
          title={texts.home.newArrivals}
          products={selectedCategory === 'all' 
            ? newProducts 
            : newProducts.filter((_, index) => index % categories.length === categories.findIndex(c => c.id === selectedCategory))}
          onProductPress={handleProductPress}
          onAddToCart={handleAddToCart}
          onFavorite={handleFavorite}
        />
        
        <ProductCarousel
          title={texts.home.specialOffers}
          products={selectedCategory === 'all' 
            ? discountProducts 
            : discountProducts.filter((_, index) => index % categories.length === categories.findIndex(c => c.id === selectedCategory))}
          onProductPress={handleProductPress}
          onAddToCart={handleAddToCart}
          onFavorite={handleFavorite}
        />

        <Footer links={footerLinks} />
      </ScrollView>
      
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
  bannerContainer: {
    marginTop: 8,
    marginBottom: 16,
  },
});