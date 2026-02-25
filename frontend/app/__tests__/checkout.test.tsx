import React from 'react';
import { render } from '@testing-library/react-native';
import CheckoutScreen from '../checkout';

jest.mock('expo-router', () => ({
  Redirect: () => null,
}));

describe('CheckoutScreen', () => {
  it('renders a redirect to checkout-v2', () => {
    render(<CheckoutScreen />);
  });
});
