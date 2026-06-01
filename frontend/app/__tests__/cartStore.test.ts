import { useCart } from "@/store/cartStore";
import * as cartApi from "@/api/cart";

// Mock the API
jest.mock("@/api/cart", () => ({
  addToCart: jest.fn(),
  removeFromCart: jest.fn(),
  updateCartItem: jest.fn(),
  clearCart: jest.fn(),
  getCart: jest.fn(),
}));

describe("Cart Store Logic", () => {
  const initialState = useCart.getState();

  beforeEach(() => {
    useCart.setState({
      ...initialState,
      items: [],
    });
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const product = {
    id: 1,
    name: "Test Product",
    price: 100,
  };

  test("addProduct rolls back on API failure", async () => {
    // Setup API failure; server still has empty cart
    (cartApi.addToCart as jest.Mock).mockRejectedValue(new Error("API Error"));
    (cartApi.getCart as jest.Mock).mockResolvedValue({ items: [], total: 0 });

    // Initial state: empty
    expect(useCart.getState().items).toHaveLength(0);

    // Action
    await useCart.getState().addProduct(product);

    // Expectation:
    // 1. Optimistic update happened (we can't easily check 'during' without async hacks,
    //    but we check that it TRIED to call API)
    expect(cartApi.addToCart).toHaveBeenCalledWith(1, 1, undefined);

    // 2. Final state should be empty (synced from server)
    expect(useCart.getState().items).toHaveLength(0);
  });

  test("removeProduct rolls back on API failure", async () => {
    // Setup initial state with one item
    useCart.setState({
      items: [{ product: product, quantity: 1 }],
    });

    // Setup API failure; server still has the item
    (cartApi.removeFromCart as jest.Mock).mockRejectedValue(
      new Error("API Error")
    );
    (cartApi.getCart as jest.Mock).mockResolvedValue({
      items: [
        {
          id: 1,
          product_id: 1,
          quantity: 1,
          created_at: "",
          product: { id: 1, name: "Test Product", price: 100, stock: 10 },
        },
      ],
      total: 100,
    });

    // Action
    await useCart.getState().removeProduct(product.id);

    // Expectation:
    expect(cartApi.removeFromCart).toHaveBeenCalledWith(1, undefined);

    // Final state should still have the item (synced from server)
    expect(useCart.getState().items).toHaveLength(1);
    expect(useCart.getState().items[0].product.id).toBe(1);
  });

  test("removeProduct keeps optimistic removal after successful DELETE", async () => {
    useCart.setState({
      items: [{ product: product, quantity: 1 }],
    });
    (cartApi.removeFromCart as jest.Mock).mockResolvedValue(undefined);

    await useCart.getState().removeProduct(product.id);

    expect(cartApi.removeFromCart).toHaveBeenCalledWith(1, undefined);
    expect(cartApi.getCart).not.toHaveBeenCalled();
    expect(useCart.getState().items).toHaveLength(0);
    expect(useCart.getState().error).toBeNull();
  });

  test("removeProduct sends separate DELETE requests for distinct product IDs", async () => {
    const secondProduct = { ...product, id: 2, name: "Second Product" };
    useCart.setState({
      items: [
        { product: product, quantity: 1 },
        { product: secondProduct, quantity: 1 },
      ],
    });
    (cartApi.removeFromCart as jest.Mock).mockResolvedValue(undefined);

    await Promise.all([
      useCart.getState().removeProduct(product.id),
      useCart.getState().removeProduct(secondProduct.id),
    ]);

    expect(cartApi.removeFromCart).toHaveBeenCalledTimes(2);
    expect(cartApi.removeFromCart).toHaveBeenCalledWith(1, undefined);
    expect(cartApi.removeFromCart).toHaveBeenCalledWith(2, undefined);
    expect(useCart.getState().items).toHaveLength(0);
  });

  test("removeProduct sends one DELETE while the same product ID is in flight", async () => {
    let resolveRemove: (() => void) | undefined;
    useCart.setState({
      items: [{ product: product, quantity: 1 }],
    });
    (cartApi.removeFromCart as jest.Mock).mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          resolveRemove = resolve;
        })
    );

    const firstRemove = useCart.getState().removeProduct(product.id);
    const duplicateRemove = useCart.getState().removeProduct(product.id);

    expect(cartApi.removeFromCart).toHaveBeenCalledTimes(1);
    resolveRemove?.();
    await Promise.all([firstRemove, duplicateRemove]);
  });

  test("decrementProduct rolls back (quantity > 1) on API failure", async () => {
    // Setup initial state with quantity 2
    useCart.setState({
      items: [{ product: product, quantity: 2 }],
    });

    // Setup API failure; server still has quantity 2
    (cartApi.updateCartItem as jest.Mock).mockRejectedValue(
      new Error("API Error")
    );
    (cartApi.getCart as jest.Mock).mockResolvedValue({
      items: [
        {
          id: 1,
          product_id: 1,
          quantity: 2,
          created_at: "",
          product: { id: 1, name: "Test Product", price: 100, stock: 10 },
        },
      ],
      total: 200,
    });

    // Action
    await useCart.getState().decrementProduct(product.id);

    // Expectation:
    expect(cartApi.updateCartItem).toHaveBeenCalledWith(1, 1, undefined);

    // Final state should still have quantity 2 (synced from server)
    expect(useCart.getState().items[0].quantity).toBe(2);
  });

  test("decrementProduct rolls back (quantity = 1, remove) on API failure", async () => {
    // Setup initial state with quantity 1
    useCart.setState({
      items: [{ product: product, quantity: 1 }],
    });

    // Setup API failure; server still has the item at quantity 1
    (cartApi.removeFromCart as jest.Mock).mockRejectedValue(
      new Error("API Error")
    );
    (cartApi.getCart as jest.Mock).mockResolvedValue({
      items: [
        {
          id: 1,
          product_id: 1,
          quantity: 1,
          created_at: "",
          product: { id: 1, name: "Test Product", price: 100, stock: 10 },
        },
      ],
      total: 100,
    });

    // Action
    await useCart.getState().decrementProduct(product.id);

    // Expectation:
    expect(cartApi.removeFromCart).toHaveBeenCalledWith(1, undefined);

    // Final state should still have item (synced from server)
    expect(useCart.getState().items).toHaveLength(1);
  });

  test("resetCart rolls back on API failure", async () => {
    // Setup initial state with items
    useCart.setState({
      items: [{ product: product, quantity: 1 }],
    });

    // Setup API failure
    (cartApi.clearCart as jest.Mock).mockRejectedValue(new Error("API Error"));

    // Action
    await useCart.getState().resetCart();

    // Expectation:
    expect(cartApi.clearCart).toHaveBeenCalledWith(undefined);

    // Final state should still have items (rolled back)
    expect(useCart.getState().items).toHaveLength(1);
  });
});
