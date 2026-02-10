import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import CheckoutScreen from '../checkout';
import { useCart } from '@/store/cartStore';
import { useAuth } from '@clerk/clerk-expo';

// Mocks
const mockMutate = jest.fn();

jest.mock('@tanstack/react-query', () => ({
  useMutation: jest.fn(() => ({
    mutate: mockMutate,
    isPending: false,
    isSuccess: false,
  })),
}));

jest.mock('@/store/cartStore', () => ({
  useCart: jest.fn(),
}));

jest.mock('@clerk/clerk-expo', () => ({
  useAuth: jest.fn(),
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
}));

// Mock API
jest.mock('@/api/orders', () => ({
  createOrder: jest.fn(),
}));

// Mock UI Components
jest.mock('@/components/ui/button', () => {
    const { TouchableOpacity, Text } = require('react-native');
    return {
        Button: ({ onPress, children, disabled, ...props }: any) => (
            <TouchableOpacity onPress={onPress} disabled={disabled} testID="checkout-button" {...props}>
                {children}
            </TouchableOpacity>
        ),
        ButtonText: ({ children }: any) => <Text>{children}</Text>
    };
});

jest.mock('@/components/ui/vstack', () => ({
    VStack: ({ children }: any) => children
}));

jest.mock('@/components/ui/hstack', () => ({
    HStack: ({ children }: any) => children
}));

jest.mock('lucide-react-native', () => ({
    CheckCircleIcon: () => null
}));

describe('CheckoutScreen Performance', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (useCart as unknown as jest.Mock).mockReturnValue({
      items: [
        { product: { id: 1, price: 100, name: 'Item 1' }, quantity: 1 }
      ],
      resetCart: jest.fn(),
    });

    (useAuth as unknown as jest.Mock).mockReturnValue({
      isSignedIn: true,
      getToken: jest.fn().mockResolvedValue('fake-token'),
    });
  });

  it('triggers order creation', async () => {
    render(<CheckoutScreen />);

    const button = screen.getByTestId('checkout-button');
    fireEvent.press(button);

    // With the bug, this might need a long timeout or fail if we didn't wait 3s.
    // We expect it to be called reasonably fast.
    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalled();
    }, { timeout: 1000 }); // Fail if it takes longer than 1s (which it will with the 3s delay)
  });
});
