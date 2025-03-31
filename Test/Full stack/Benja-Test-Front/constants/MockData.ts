import { ProductProps } from '@/components/ui/ProductCard';

// Categorías para el e-commerce
export const CATEGORIES = [
  { id: 'all', name: 'All' },
  { id: 'supplements', name: 'Supplements' },
  { id: 'organics', name: 'Organic' },
  { id: 'glutenfree', name: 'Gluten-Free' },
  { id: 'vegan', name: 'Vegan' },
  { id: 'superfoods', name: 'Superfoods' },
  { id: 'snacks', name: 'Healthy Snacks' },
  { id: 'beverages', name: 'Beverages' },
];

// Enlaces para el footer
export const FOOTER_LINKS = [
  { id: 'about', title: 'About Us', onPress: () => console.log('About Us') },
  { id: 'terms', title: 'Terms & Conditions', onPress: () => console.log('Terms') },
  { id: 'privacy', title: 'Privacy Policy', onPress: () => console.log('Privacy') },
  { id: 'contact', title: 'Contact Us', onPress: () => console.log('Contact') },
];

// Productos destacados
export const FEATURED_PRODUCTS: ProductProps[] = [
  {
    id: '1',
    name: 'Organic Protein Powder',
    price: 29.99,
    imageUrl: require('@/assets/images/react-logo.png'), // Placeholder, reemplazar con imágenes reales
    rating: 4.8,
    discount: 15,
  },
  {
    id: '2',
    name: 'Gluten-Free Granola',
    price: 12.50,
    imageUrl: require('@/assets/images/react-logo.png'),
    rating: 4.5,
  },
  {
    id: '3',
    name: 'Vegan Omega-3 Supplement',
    price: 24.99,
    imageUrl: require('@/assets/images/react-logo.png'),
    rating: 4.7,
    discount: 10,
  },
  {
    id: '4',
    name: 'Organic Açaí Powder',
    price: 19.99,
    imageUrl: require('@/assets/images/react-logo.png'),
    rating: 4.6,
  },
  {
    id: '5',
    name: 'Natural Energy Bars',
    price: 16.50,
    imageUrl: require('@/assets/images/react-logo.png'),
    rating: 4.4,
    discount: 20,
  },
];

// Productos nuevos
export const NEW_PRODUCTS: ProductProps[] = [
  {
    id: '6',
    name: 'Plant-Based Calcium Supplement',
    price: 18.99,
    imageUrl: require('@/assets/images/react-logo.png'),
    rating: 4.3,
  },
  {
    id: '7',
    name: 'Sugar-Free Dark Chocolate',
    price: 8.99,
    imageUrl: require('@/assets/images/react-logo.png'),
    rating: 4.8,
  },
  {
    id: '8',
    name: 'Organic Matcha Green Tea',
    price: 14.50,
    imageUrl: require('@/assets/images/react-logo.png'),
    rating: 4.9,
    discount: 5,
  },
  {
    id: '9',
    name: 'Natural Probiotic Complex',
    price: 26.99,
    imageUrl: require('@/assets/images/react-logo.png'),
    rating: 4.6,
  },
  {
    id: '10',
    name: 'Vegan Protein Cookies',
    price: 10.99,
    imageUrl: require('@/assets/images/react-logo.png'),
    rating: 4.5,
    discount: 15,
  },
];

// Productos en oferta
export const DISCOUNT_PRODUCTS: ProductProps[] = FEATURED_PRODUCTS.concat(NEW_PRODUCTS).filter(p => p.discount && p.discount > 0);

// Banners promocionales
export const PROMO_BANNERS = [
  {
    id: '1',
    title: 'Summer Sale',
    subtitle: 'Up to 30% off selected products',
    imageUrl: require('@/assets/images/react-logo.png'),
  },
  {
    id: '2',
    title: 'New Arrivals',
    subtitle: 'Check out our latest organic products',
    imageUrl: require('@/assets/images/react-logo.png'),
  },
];