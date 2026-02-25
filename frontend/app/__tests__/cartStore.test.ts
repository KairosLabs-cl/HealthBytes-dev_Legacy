
import { useCart } from '@/store/cartStore';
import * as cartApi from '@/api/cart';

// Mock the API
jest.mock('@/api/cart', () => ({
  addToCart: jest.fn(),
  removeFromCart: jest.fn(),
  updateCartItem: jest.fn(),
  clearCart: jest.fn(),
}));

describe('Cart Store Logic', () => {
  const initialState = useCart.getState();

  beforeEach(() => {
    useCart.setState({ ...initialState, items: [], isAuthenticated: true, authToken: 'fake-token' });
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const product = {
    id: 1,
    name: 'Test Product',
    price: 100,
  };

  test('addProduct rolls back on API failure', async () => {
    // Setup API failure
    (cartApi.addToCart as jest.Mock).mockRejectedValue(new Error('API Error'));

    // Initial state: empty
    expect(useCart.getState().items).toHaveLength(0);

    // Action
    await useCart.getState().addProduct(product);

    // Expectation:
    // 1. Optimistic update happened (we can't easily check 'during' without async hacks,
    //    but we check that it TRIED to call API)
    expect(cartApi.addToCart).toHaveBeenCalledWith('fake-token', 1, 1);

    // 2. Final state should be empty (rolled back)
    expect(useCart.getState().items).toHaveLength(0);
  });

  test('removeProduct rolls back on API failure', async () => {
    // Setup initial state with one item
    useCart.setState({
      items: [{ product: product, quantity: 1 }]
    });

    // Setup API failure
    (cartApi.removeFromCart as jest.Mock).mockRejectedValue(new Error('API Error'));

    // Action
    await useCart.getState().removeProduct(product.id);

    // Expectation:
    expect(cartApi.removeFromCart).toHaveBeenCalledWith('fake-token', 1);

    // Final state should still have the item (rolled back)
    expect(useCart.getState().items).toHaveLength(1);
    expect(useCart.getState().items[0].product.id).toBe(1);
  });

  test('decrementProduct rolls back (quantity > 1) on API failure', async () => {
    // Setup initial state with quantity 2
    useCart.setState({
      items: [{ product: product, quantity: 2 }]
    });

    // Setup API failure
    (cartApi.updateCartItem as jest.Mock).mockRejectedValue(new Error('API Error'));

    // Action
    await useCart.getState().decrementProduct(product.id);

    // Expectation:
    expect(cartApi.updateCartItem).toHaveBeenCalledWith('fake-token', 1, 1);

    // Final state should still have quantity 2 (rolled back)
    expect(useCart.getState().items[0].quantity).toBe(2);
  });

  test('decrementProduct rolls back (quantity = 1, remove) on API failure', async () => {
    // Setup initial state with quantity 1
    useCart.setState({
      items: [{ product: product, quantity: 1 }]
    });

    // Setup API failure
    (cartApi.removeFromCart as jest.Mock).mockRejectedValue(new Error('API Error'));

    // Action
    await useCart.getState().decrementProduct(product.id);

    // Expectation:
    expect(cartApi.removeFromCart).toHaveBeenCalledWith('fake-token', 1);

    // Final state should still have item (rolled back)
    expect(useCart.getState().items).toHaveLength(1);
  });

  test('resetCart rolls back on API failure', async () => {
    // Setup initial state with items
    useCart.setState({
      items: [{ product: product, quantity: 1 }]
    });

    // Setup API failure
    (cartApi.clearCart as jest.Mock).mockRejectedValue(new Error('API Error'));

    // Action
    await useCart.getState().resetCart();

    // Expectation:
    expect(cartApi.clearCart).toHaveBeenCalledWith('fake-token');

    // Final state should still have items (rolled back)
    expect(useCart.getState().items).toHaveLength(1);
  });
});
