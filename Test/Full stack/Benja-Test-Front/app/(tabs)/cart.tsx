import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, View, FlatList, Pressable, Alert, Platform, ToastAndroid } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Componentes
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Header } from '@/components/ui/Header';
import { CartItem } from '@/components/ui/CartItem';
import { SettingsSelector } from '@/components/ui/SettingsSelector';
import { useThemeColor } from '@/hooks/useThemeColor';

// Datos y traducciones
import { getLocalizedData } from '@/constants/Translations';

// Contexts
import { useCart } from '@/contexts/CartContext';
import { useAppSettings } from '@/contexts/AppSettingsContext';

export default function CartScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const primaryColor = useThemeColor({}, 'primary');
  const accentColor = useThemeColor({}, 'accent');
  const surfaceColor = useThemeColor({}, 'surface');
  const borderColor = useThemeColor({}, 'border');
  const errorColor = useThemeColor({}, 'error');
  
  const { language, resolvedTheme } = useAppSettings();
  const { texts } = getLocalizedData(language);
  
  const { 
    items, 
    removeFromCart, 
    updateQuantity, 
    getTotal, 
    clearCart 
  } = useCart();
  
  // Notification helper function
  const showNotification = (message: string) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      Alert.alert('SafeBities', message);
    }
  };
  
  const handleRemoveItem = (productId: string) => {
    Alert.alert(
      texts.cart.removeItem,
      texts.cart.removeConfirmation,
      [
        {
          text: texts.cart.cancel,
          style: 'cancel',
        },
        {
          text: texts.cart.remove,
          onPress: () => {
            removeFromCart(productId);
            showNotification(texts.cart.itemRemoved);
          },
          style: 'destructive',
        },
      ]
    );
  };
  
  const handleSettingsPress = () => {
    setIsSettingsVisible(true);
  };
  
  const handleUpdateQuantity = (productId: string, newQuantity: number) => {
    updateQuantity(productId, newQuantity);
  };
  
  const handleCheckout = () => {
    if (items.length === 0) {
      showNotification('Your cart is empty');
      return;
    }
    
    router.push('/checkout');
  };
  
  const handleContinueShopping = () => {
    router.push('/');
  };
  
  const subtotal = items.reduce((total, item) => 
    total + (item.product.price * item.quantity), 0);
  
  const discount = items.reduce((total, item) => 
    total + (item.product.discount ? 
      (item.product.price * item.quantity * (item.product.discount / 100)) : 0), 0);
  
  const total = getTotal();
  
  return (
    <ThemedView style={styles.container}>
      <StatusBar style="auto" />
      <Header 
        title={texts.cart.title} 
        onSettingsPress={handleSettingsPress}
      />
      
      <FlatList
        data={items}
        keyExtractor={(item) => item.product.id}
        ListEmptyComponent={
          <ThemedView style={styles.emptyContainer}>
            <ThemedText style={styles.emptyText}>
              {texts.cart.empty}
            </ThemedText>
            <Pressable
              style={[styles.emptyButton, { backgroundColor: primaryColor }]}
              onPress={handleContinueShopping}
            >
              <ThemedText style={styles.emptyButtonText} lightColor="#FFFFFF" darkColor="#FFFFFF">
                {texts.cart.startShopping}
              </ThemedText>
            </Pressable>
          </ThemedView>
        }
        renderItem={({ item }) => (
          <CartItem
            product={item.product}
            quantity={item.quantity}
            onUpdateQuantity={(quantity) => handleUpdateQuantity(item.product.id, quantity)}
            onRemove={() => {
              console.log('Removing product with ID:', item.product.id);
              removeFromCart(item.product.id);
              showNotification('Item removed from cart');
            }}
          />
        )}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: items.length ? 200 : insets.bottom }
        ]}
      />
      
      {items.length > 0 && (
        <ThemedView style={[styles.summaryContainer, { paddingBottom: insets.bottom + 16 }]} lightColor={surfaceColor} darkColor={surfaceColor}>
          <View style={styles.summaryRow}>
            <ThemedText>{texts.cart.subtotal}</ThemedText>
            <ThemedText>${subtotal.toFixed(2)}</ThemedText>
          </View>
          
          <View style={styles.summaryRow}>
            <ThemedText>{texts.cart.discount}</ThemedText>
            <ThemedText lightColor={accentColor} darkColor={accentColor}>-${discount.toFixed(2)}</ThemedText>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.summaryRow}>
            <ThemedText style={styles.totalText} type="defaultSemiBold">{texts.cart.total}</ThemedText>
            <ThemedText style={styles.totalAmount} type="defaultSemiBold">${total.toFixed(2)}</ThemedText>
          </View>
          
          <View style={styles.buttonsContainer}>
            <Pressable 
              style={[styles.continueButton, { borderColor: primaryColor }]}
              onPress={handleContinueShopping}
            >
              <ThemedText style={[styles.continueButtonText, { color: primaryColor }]}>
                {texts.cart.continueShopping}
              </ThemedText>
            </Pressable>
            
            <Pressable 
              style={[styles.checkoutButton, { backgroundColor: primaryColor }]}
              onPress={handleCheckout}
            >
              <ThemedText style={styles.checkoutButtonText} lightColor="#FFFFFF" darkColor="#FFFFFF">
                {texts.cart.checkout}
              </ThemedText>
            </Pressable>
          </View>
        </ThemedView>
      )}
      
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
    padding: 16,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    height: 300,
  },
  emptyText: {
    fontSize: 16,
    marginBottom: 16,
  },
  emptyButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  summaryContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 8,
  },
  totalText: {
    fontSize: 18,
  },
  totalAmount: {
    fontSize: 18,
  },
  buttonsContainer: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 12,
  },
  continueButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
  },
  continueButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  checkoutButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  checkoutButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});