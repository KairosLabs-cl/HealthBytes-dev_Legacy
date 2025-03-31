import { ProductProps } from '@/components/ui/ProductCard';
import { CATEGORIES, FEATURED_PRODUCTS, NEW_PRODUCTS, DISCOUNT_PRODUCTS, FOOTER_LINKS, PROMO_BANNERS } from '@/constants/MockData';

// Traducción de categorías
export const CATEGORIES_ES = [
  { id: 'all', name: 'Todos' },
  { id: 'supplements', name: 'Suplementos' },
  { id: 'organics', name: 'Orgánicos' },
  { id: 'glutenfree', name: 'Sin Gluten' },
  { id: 'vegan', name: 'Vegano' },
  { id: 'superfoods', name: 'Superalimentos' },
  { id: 'snacks', name: 'Snacks Saludables' },
  { id: 'beverages', name: 'Bebidas' },
];

// Traducción de footer links
export const FOOTER_LINKS_ES = [
  { id: 'about', title: 'Sobre Nosotros', onPress: () => console.log('Sobre Nosotros') },
  { id: 'terms', title: 'Términos y Condiciones', onPress: () => console.log('Términos') },
  { id: 'privacy', title: 'Política de Privacidad', onPress: () => console.log('Privacidad') },
  { id: 'contact', title: 'Contáctanos', onPress: () => console.log('Contacto') },
];

// Traducción de productos destacados
export const FEATURED_PRODUCTS_ES: ProductProps[] = [
  {
    id: '1',
    name: 'Proteína Orgánica en Polvo',
    price: 29.99,
    imageUrl: require('@/assets/images/react-logo.png'),
    rating: 4.8,
    discount: 15,
  },
  {
    id: '2',
    name: 'Granola Sin Gluten',
    price: 12.50,
    imageUrl: require('@/assets/images/react-logo.png'),
    rating: 4.5,
  },
  {
    id: '3',
    name: 'Suplemento Vegano de Omega-3',
    price: 24.99,
    imageUrl: require('@/assets/images/react-logo.png'),
    rating: 4.7,
    discount: 10,
  },
  {
    id: '4',
    name: 'Polvo de Açaí Orgánico',
    price: 19.99,
    imageUrl: require('@/assets/images/react-logo.png'),
    rating: 4.6,
  },
  {
    id: '5',
    name: 'Barras Energéticas Naturales',
    price: 16.50,
    imageUrl: require('@/assets/images/react-logo.png'),
    rating: 4.4,
    discount: 20,
  },
];

// Traducción de productos nuevos
export const NEW_PRODUCTS_ES: ProductProps[] = [
  {
    id: '6',
    name: 'Suplemento de Calcio de Origen Vegetal',
    price: 18.99,
    imageUrl: require('@/assets/images/react-logo.png'),
    rating: 4.3,
  },
  {
    id: '7',
    name: 'Chocolate Negro Sin Azúcar',
    price: 8.99,
    imageUrl: require('@/assets/images/react-logo.png'),
    rating: 4.8,
  },
  {
    id: '8',
    name: 'Té Verde Matcha Orgánico',
    price: 14.50,
    imageUrl: require('@/assets/images/react-logo.png'),
    rating: 4.9,
    discount: 5,
  },
  {
    id: '9',
    name: 'Complejo Probiótico Natural',
    price: 26.99,
    imageUrl: require('@/assets/images/react-logo.png'),
    rating: 4.6,
  },
  {
    id: '10',
    name: 'Galletas de Proteína Vegana',
    price: 10.99,
    imageUrl: require('@/assets/images/react-logo.png'),
    rating: 4.5,
    discount: 15,
  },
];

// Productos en oferta (español)
export const DISCOUNT_PRODUCTS_ES: ProductProps[] = FEATURED_PRODUCTS_ES.concat(NEW_PRODUCTS_ES).filter(p => p.discount && p.discount > 0);

// Banners promocionales (español)
export const PROMO_BANNERS_ES = [
  {
    id: '1',
    title: 'Ofertas de Verano',
    subtitle: 'Hasta 30% de descuento en productos seleccionados',
    imageUrl: require('@/assets/images/react-logo.png'),
  },
  {
    id: '2',
    title: 'Nuevos Productos',
    subtitle: 'Descubre nuestros más recientes productos orgánicos',
    imageUrl: require('@/assets/images/react-logo.png'),
  },
];

// Traducción de textos de la interfaz
export const UI_TEXTS = {
  en: {
    home: {
      search: 'Search products...',
      featuredProducts: 'Featured Products',
      newArrivals: 'New Arrivals',
      specialOffers: 'Special Offers',
      addToCart: 'Add to Cart',
      productAdded: 'Product added to cart!',
      favoriteAdded: 'Product added to favorites!',
    },
    search: {
      title: 'Search Products',
      noResults: 'No products found. Try a different category or search term.',
    },
    cart: {
      title: 'Shopping Cart',
      empty: 'Your cart is empty.',
      startShopping: 'Start Shopping',
      subtotal: 'Subtotal',
      discount: 'Discount',
      total: 'Total',
      continueShopping: 'Continue Shopping',
      checkout: 'Checkout',
      removeItem: 'Remove item',
      removeConfirmation: 'Are you sure you want to remove this item from your cart?',
      cancel: 'Cancel',
      remove: 'Remove',
      itemRemoved: 'Item removed from cart',
    },
    checkout: {
      title: 'Checkout',
      orderSummary: 'Order Summary',
      items: 'Items',
      shipping: 'Shipping',
      tax: 'Tax',
      contactInfo: 'Contact Information',
      fullName: 'Full Name',
      yourName: 'Your full name',
      email: 'Email',
      emailPlaceholder: 'your.email@example.com',
      shippingAddress: 'Shipping Address',
      address: 'Address',
      addressPlaceholder: 'Street address',
      city: 'City',
      cityPlaceholder: 'City',
      zipCode: 'ZIP Code',
      zipCodePlaceholder: 'ZIP Code',
      shippingMethod: 'Shipping Method',
      standardShipping: 'Standard Shipping',
      expressShipping: 'Express Shipping',
      freeShipping: 'Free Shipping',
      businessDays: 'business days',
      freeForOrders: 'Free for orders over',
      paymentMethod: 'Payment Method',
      creditCard: 'Credit Card',
      debitCard: 'Debit Card',
      paypal: 'PayPal',
      placeOrder: 'Place Order',
      fillFields: 'Please fill in all required fields',
      orderConfirmed: 'Order Confirmed!',
      orderSuccess: 'Your order has been placed successfully!',
      ok: 'OK',
    },
  },
  es: {
    home: {
      search: 'Buscar productos...',
      featuredProducts: 'Productos Destacados',
      newArrivals: 'Nuevos Ingresos',
      specialOffers: 'Ofertas Especiales',
      addToCart: 'Añadir al Carrito',
      productAdded: '¡Producto añadido al carrito!',
      favoriteAdded: '¡Producto añadido a favoritos!',
    },
    search: {
      title: 'Buscar Productos',
      noResults: 'No se encontraron productos. Intenta con otra categoría o término de búsqueda.',
    },
    cart: {
      title: 'Carrito de Compras',
      empty: 'Tu carrito está vacío.',
      startShopping: 'Comenzar a Comprar',
      subtotal: 'Subtotal',
      discount: 'Descuento',
      total: 'Total',
      continueShopping: 'Continuar Comprando',
      checkout: 'Finalizar Compra',
      removeItem: 'Eliminar producto',
      removeConfirmation: '¿Estás seguro de que quieres eliminar este producto de tu carrito?',
      cancel: 'Cancelar',
      remove: 'Eliminar',
      itemRemoved: 'Producto eliminado del carrito',
    },
    checkout: {
      title: 'Finalizar Compra',
      orderSummary: 'Resumen del Pedido',
      items: 'Productos',
      shipping: 'Envío',
      tax: 'Impuestos',
      contactInfo: 'Información de Contacto',
      fullName: 'Nombre Completo',
      yourName: 'Tu nombre completo',
      email: 'Correo Electrónico',
      emailPlaceholder: 'tu.correo@ejemplo.com',
      shippingAddress: 'Dirección de Envío',
      address: 'Dirección',
      addressPlaceholder: 'Calle y número',
      city: 'Ciudad',
      cityPlaceholder: 'Ciudad',
      zipCode: 'Código Postal',
      zipCodePlaceholder: 'Código Postal',
      shippingMethod: 'Método de Envío',
      standardShipping: 'Envío Estándar',
      expressShipping: 'Envío Express',
      freeShipping: 'Envío Gratuito',
      businessDays: 'días hábiles',
      freeForOrders: 'Gratis para pedidos superiores a',
      paymentMethod: 'Método de Pago',
      creditCard: 'Tarjeta de Crédito',
      debitCard: 'Tarjeta de Débito',
      paypal: 'PayPal',
      placeOrder: 'Realizar Pedido',
      fillFields: 'Por favor complete todos los campos requeridos',
      orderConfirmed: '¡Pedido Confirmado!',
      orderSuccess: '¡Tu pedido ha sido realizado con éxito!',
      ok: 'Aceptar',
    },
  },
};

// Función para obtener los datos según el idioma
export function getLocalizedData(language: 'en' | 'es') {
  if (language === 'en') {
    return {
      categories: CATEGORIES,
      featuredProducts: FEATURED_PRODUCTS,
      newProducts: NEW_PRODUCTS,
      discountProducts: DISCOUNT_PRODUCTS,
      footerLinks: FOOTER_LINKS,
      promoBanners: PROMO_BANNERS,
      texts: UI_TEXTS.en,
    };
  } else {
    return {
      categories: CATEGORIES_ES,
      featuredProducts: FEATURED_PRODUCTS_ES,
      newProducts: NEW_PRODUCTS_ES,
      discountProducts: DISCOUNT_PRODUCTS_ES,
      footerLinks: FOOTER_LINKS_ES,
      promoBanners: PROMO_BANNERS_ES,
      texts: UI_TEXTS.es,
    };
  }
}