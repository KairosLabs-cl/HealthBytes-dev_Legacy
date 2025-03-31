import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, Pressable, TextInput, ActivityIndicator, Alert, Platform, ToastAndroid } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Componentes
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Header } from '@/components/ui/Header';
import { SettingsSelector } from '@/components/ui/SettingsSelector';
import { useThemeColor } from '@/hooks/useThemeColor';

// Datos y traducciones
import { getLocalizedData } from '@/constants/Translations';

// Contexts
import { useCart } from '@/contexts/CartContext';
import { useAppSettings } from '@/contexts/AppSettingsContext';

// Definimos los tipos para los métodos de envío y pago
type ShippingMethod = {
  id: string;
  price: number;
  days: string;
  minimumOrder?: number;
};

export default function CheckoutScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const primaryColor = useThemeColor({}, 'primary');
  const surfaceColor = useThemeColor({}, 'surface');
  const borderColor = useThemeColor({}, 'border');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  
  const { language, resolvedTheme } = useAppSettings();
  const { texts } = getLocalizedData(language);
  const { items, getTotal, clearCart } = useCart();
  
  // Datos específicos del checkout según el idioma
  const SHIPPING_METHODS: ShippingMethod[] = [
    { 
      id: '1', 
      price: 4.99, 
      days: '3-5' 
    },
    { 
      id: '2', 
      price: 9.99, 
      days: '1-2' 
    },
    { 
      id: '3', 
      price: 0, 
      days: '5-7', 
      minimumOrder: 50 
    },
  ];
  
  const PAYMENT_METHODS = [
    { id: 'credit', name: language === 'en' ? 'Credit Card' : 'Tarjeta de Crédito' },
    { id: 'debit', name: language === 'en' ? 'Debit Card' : 'Tarjeta de Débito' },
    { id: 'paypal', name: 'PayPal' },
  ];
  
  // Estados del formulario
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [selectedShipping, setSelectedShipping] = useState(SHIPPING_METHODS[0].id);
  const [selectedPayment, setSelectedPayment] = useState(PAYMENT_METHODS[0].id);
  const [isLoading, setIsLoading] = useState(false);

  // Notificación
  const showNotification = (message: string) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      Alert.alert('SafeBities', message);
    }
  };
  
  // Cálculos
  const subtotal = getTotal();
  const shipping = SHIPPING_METHODS.find(method => method.id === selectedShipping)?.price || 0;
  const tax = subtotal * 0.07; // Impuesto del 7%
  const total = subtotal + shipping + tax;
  
  // Validación de formulario
  const isFormValid = name && email && address && city && zipCode;
  
  const handleSettingsPress = () => {
    setIsSettingsVisible(true);
  };
  
  const handlePlaceOrder = () => {
    if (!isFormValid) {
      showNotification(texts.checkout.fillFields);
      return;
    }
    
    setIsLoading(true);
    
    // Simular una solicitud de API
    setTimeout(() => {
      setIsLoading(false);
      
      Alert.alert(
        texts.checkout.orderConfirmed,
        texts.checkout.orderSuccess,
        [
          {
            text: texts.checkout.ok,
            onPress: () => {
              clearCart();
              router.push('/');
            },
          },
        ]
      );
    }, 2000);
  };
  
  return (
    <ThemedView style={styles.container}>
      <StatusBar style="auto" />
      <Header 
        title={texts.checkout.title} 
        onSettingsPress={handleSettingsPress}
      />
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 100 }
        ]}
      >
        {/* Resumen de compra */}
        <ThemedView style={[styles.section, { borderColor }]} lightColor={surfaceColor} darkColor={surfaceColor}>
          <ThemedText style={styles.sectionTitle} type="subtitle">{texts.checkout.orderSummary}</ThemedText>
          
          <View style={styles.row}>
            <ThemedText>{texts.checkout.items} ({items.length})</ThemedText>
            <ThemedText>${subtotal.toFixed(2)}</ThemedText>
          </View>
          
          <View style={styles.row}>
            <ThemedText>{texts.checkout.shipping}</ThemedText>
            <ThemedText>${shipping.toFixed(2)}</ThemedText>
          </View>
          
          <View style={styles.row}>
            <ThemedText>{texts.checkout.tax} (7%)</ThemedText>
            <ThemedText>${tax.toFixed(2)}</ThemedText>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.row}>
            <ThemedText style={styles.totalText} type="defaultSemiBold">{texts.checkout.total}</ThemedText>
            <ThemedText style={styles.totalAmount} type="defaultSemiBold">${total.toFixed(2)}</ThemedText>
          </View>
        </ThemedView>
        
        {/* Información de contacto */}
        <ThemedView style={[styles.section, { borderColor }]} lightColor={surfaceColor} darkColor={surfaceColor}>
          <ThemedText style={styles.sectionTitle} type="subtitle">{texts.checkout.contactInfo}</ThemedText>
          
          <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>{texts.checkout.fullName}</ThemedText>
            <TextInput
              style={[styles.input, { borderColor, color: textSecondaryColor }]}
              value={name}
              onChangeText={setName}
              placeholder={texts.checkout.yourName}
              placeholderTextColor={textSecondaryColor}
            />
          </View>
          
          <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>{texts.checkout.email}</ThemedText>
            <TextInput
              style={[styles.input, { borderColor, color: textSecondaryColor }]}
              value={email}
              onChangeText={setEmail}
              placeholder={texts.checkout.emailPlaceholder}
              placeholderTextColor={textSecondaryColor}
              keyboardType="email-address"
            />
          </View>
        </ThemedView>
        
        {/* Dirección de envío */}
        <ThemedView style={[styles.section, { borderColor }]} lightColor={surfaceColor} darkColor={surfaceColor}>
          <ThemedText style={styles.sectionTitle} type="subtitle">{texts.checkout.shippingAddress}</ThemedText>
          
          <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>{texts.checkout.address}</ThemedText>
            <TextInput
              style={[styles.input, { borderColor, color: textSecondaryColor }]}
              value={address}
              onChangeText={setAddress}
              placeholder={texts.checkout.addressPlaceholder}
              placeholderTextColor={textSecondaryColor}
            />
          </View>
          
          <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>{texts.checkout.city}</ThemedText>
            <TextInput
              style={[styles.input, { borderColor, color: textSecondaryColor }]}
              value={city}
              onChangeText={setCity}
              placeholder={texts.checkout.cityPlaceholder}
              placeholderTextColor={textSecondaryColor}
            />
          </View>
          
          <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>{texts.checkout.zipCode}</ThemedText>
            <TextInput
              style={[styles.input, { borderColor, color: textSecondaryColor }]}
              value={zipCode}
              onChangeText={setZipCode}
              placeholder={texts.checkout.zipCodePlaceholder}
              placeholderTextColor={textSecondaryColor}
              keyboardType="number-pad"
            />
          </View>
        </ThemedView>
        
        {/* Métodos de envío */}
        <ThemedView style={[styles.section, { borderColor }]} lightColor={surfaceColor} darkColor={surfaceColor}>
          <ThemedText style={styles.sectionTitle} type="subtitle">{texts.checkout.shippingMethod}</ThemedText>
          
          {SHIPPING_METHODS.map(method => {
            const methodName = method.id === '1' 
              ? texts.checkout.standardShipping
              : method.id === '2'
                ? texts.checkout.expressShipping
                : texts.checkout.freeShipping;
                
            return (
              <Pressable
                key={method.id}
                style={[
                  styles.optionContainer,
                  selectedShipping === method.id && { borderColor: primaryColor, borderWidth: 2 }
                ]}
                onPress={() => setSelectedShipping(method.id)}
              >
                <View style={styles.optionInfo}>
                  <ThemedText style={styles.optionTitle}>{methodName}</ThemedText>
                  <ThemedText style={styles.optionDescription}>
                    {method.days} {texts.checkout.businessDays}
                    {method.minimumOrder && ` (${texts.checkout.freeForOrders} $${method.minimumOrder})`}
                  </ThemedText>
                </View>
                <ThemedText style={styles.optionPrice}>
                  {method.price === 0 ? 'FREE' : `$${method.price.toFixed(2)}`}
                </ThemedText>
              </Pressable>
            );
          })}
        </ThemedView>
        
        {/* Métodos de pago */}
        <ThemedView style={[styles.section, { borderColor }]} lightColor={surfaceColor} darkColor={surfaceColor}>
          <ThemedText style={styles.sectionTitle} type="subtitle">{texts.checkout.paymentMethod}</ThemedText>
          
          {PAYMENT_METHODS.map(method => (
            <Pressable
              key={method.id}
              style={[
                styles.optionContainer,
                selectedPayment === method.id && { borderColor: primaryColor, borderWidth: 2 }
              ]}
              onPress={() => setSelectedPayment(method.id)}
            >
              <ThemedText style={styles.optionTitle}>{method.name}</ThemedText>
            </Pressable>
          ))}
        </ThemedView>
      </ScrollView>
      
      {/* Botón de finalizar compra */}
      <ThemedView style={[styles.bottomContainer, { paddingBottom: insets.bottom + 16 }]} lightColor={surfaceColor} darkColor={surfaceColor}>
        <Pressable
          style={[styles.placeOrderButton, { backgroundColor: primaryColor }, !isFormValid && styles.disabledButton]}
          onPress={handlePlaceOrder}
          disabled={!isFormValid || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <ThemedText style={styles.placeOrderButtonText} lightColor="#FFFFFF" darkColor="#FFFFFF">
              {texts.checkout.placeOrder} (${total.toFixed(2)})
            </ThemedText>
          )}
        </Pressable>
      </ThemedView>
      
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
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  section: {
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  row: {
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
    fontSize: 16,
  },
  totalAmount: {
    fontSize: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 4,
    fontSize: 14,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  optionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    marginBottom: 8,
  },
  optionInfo: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  optionDescription: {
    fontSize: 14,
    marginTop: 4,
  },
  optionPrice: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomContainer: {
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
  placeOrderButton: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
  placeOrderButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});