import React from 'react';
import { render, screen } from '@testing-library/react-native';
import CartScreen from '../cart';
import { useCart } from '@/store/cartStore';

// Mocks
jest.mock('@/store/cartStore', () => ({
  useCart: jest.fn(),
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

jest.mock('@/lib/formatPrice', () => ({
  formatPrice: (price: number) => `$${price}`,
}));

jest.mock('@/components/CartItem', () => {
  const { View } = require('react-native');
  return (props: any) => <View testID="cart-item" {...props} />;
});

describe('CartScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders empty state when cart is empty', () => {
    (useCart as unknown as jest.Mock).mockImplementation((selector) => {
      const state = { 
        items: [],
        addProduct: jest.fn(),
        decrementProduct: jest.fn(),
        removeProduct: jest.fn(),
      };
      return selector(state);
    });

    render(<CartScreen />);
    
    expect(screen.getByText('Tu carrito está vacío')).toBeTruthy();
  });

  it('renders cart items and footer when items exist', () => {
    const mockItems = [
      { product: { id: 1, name: 'Prod 1', price: 10 }, quantity: 2 },
      { product: { id: 2, name: 'Prod 2', price: 20 }, quantity: 1 },
    ];

    (useCart as unknown as jest.Mock).mockImplementation((selector) => {
      const state = { 
        items: mockItems,
        addProduct: jest.fn(),
        decrementProduct: jest.fn(),
        removeProduct: jest.fn(),
      };
      return selector(state);
    });

    render(<CartScreen />);

    // Check items rendered
    expect(screen.getAllByTestId('cart-item')).toHaveLength(2);

    // Check footer rendered (checks for text in footer)
    expect(screen.getByText('Resumen de compra')).toBeTruthy();
    expect(screen.getByText('Total')).toBeTruthy();
  });
});
