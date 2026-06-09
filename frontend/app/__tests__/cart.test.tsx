import React from "react";
import { fireEvent, render, screen } from "@testing-library/react-native";
import CartScreen from "../(tabs)/cart";
import { useCart } from "@/store/cartStore";

const mockPush = jest.fn();

// Mocks
jest.mock("@/store/cartStore", () => ({
  useCart: jest.fn(),
  selectCartItemCount: jest.fn(),
  selectCartSubtotal: jest.fn(),
}));

jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
  }),
  Stack: {
    Screen: () => null,
  },
}));

jest.mock("@clerk/clerk-expo", () => ({
  useAuth: jest.fn(() => ({
    isSignedIn: true,
    isLoaded: true,
  })),
}));

jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }: any) => children,
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

jest.mock("@/lib/formatPrice", () => ({
  formatPrice: (price: number) => `$${price}`,
}));

jest.mock("@/components/CartItem", () => {
  const { View } = require("react-native");
  return (props: any) => <View testID="cart-item" {...props} />;
});

describe("CartScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders empty state when cart is empty", () => {
    const {
      selectCartItemCount,
      selectCartSubtotal,
    } = require("@/store/cartStore");
    (selectCartItemCount as jest.Mock).mockImplementation(() => 0);
    (selectCartSubtotal as jest.Mock).mockImplementation(() => 0);

    (useCart as unknown as jest.Mock).mockImplementation((selector) => {
      const {
        selectCartItemCount,
        selectCartSubtotal,
      } = require("@/store/cartStore");
      if (selector === selectCartItemCount) return 0;
      if (selector === selectCartSubtotal) return 0;
      const state = {
        items: [],
        addProduct: jest.fn(),
        decrementProduct: jest.fn(),
        removeProduct: jest.fn(),
      };
      return typeof selector === "function" ? selector(state) : state;
    });

    render(<CartScreen />);

    expect(screen.getByText("Tu carrito está vacío")).toBeTruthy();
  });

  it("renders cart items and footer when items exist", () => {
    const mockItems = [
      { product: { id: 1, name: "Prod 1", price: 10 }, quantity: 2 },
      { product: { id: 2, name: "Prod 2", price: 20 }, quantity: 1 },
    ];

    const {
      selectCartItemCount,
      selectCartSubtotal,
    } = require("@/store/cartStore");
    (selectCartItemCount as jest.Mock).mockImplementation((state) =>
      state.items.reduce((acc: number, item: any) => acc + item.quantity, 0)
    );
    (selectCartSubtotal as jest.Mock).mockImplementation((state) =>
      state.items.reduce(
        (acc: number, item: any) => acc + item.product.price * item.quantity,
        0
      )
    );

    (useCart as unknown as jest.Mock).mockImplementation((selector) => {
      if (selector === selectCartItemCount) return 3;
      if (selector === selectCartSubtotal) return 40;

      const state = {
        items: mockItems,
        addProduct: jest.fn(),
        decrementProduct: jest.fn(),
        removeProduct: jest.fn(),
      };
      return typeof selector === "function" ? selector(state) : state;
    });

    render(<CartScreen />);

    // Check items rendered
    expect(screen.getAllByTestId("cart-item")).toHaveLength(2);

    // Check footer rendered (checks for text in footer)
    expect(screen.getByText("Resumen de compra")).toBeTruthy();
    expect(screen.getByText("Total")).toBeTruthy();
  });

  it("replaces checkout with a store-finder action when marketplace is disabled", () => {
    const mockItems = [
      { product: { id: 7, name: "Prod 1", price: 10 }, quantity: 1 },
    ];

    const {
      selectCartItemCount,
      selectCartSubtotal,
    } = require("@/store/cartStore");
    (selectCartItemCount as jest.Mock).mockImplementation(() => 1);
    (selectCartSubtotal as jest.Mock).mockImplementation(() => 10);

    (useCart as unknown as jest.Mock).mockImplementation((selector) => {
      if (selector === selectCartItemCount) return 1;
      if (selector === selectCartSubtotal) return 10;

      const state = {
        items: mockItems,
        addProduct: jest.fn(),
        decrementProduct: jest.fn(),
        removeProduct: jest.fn(),
      };
      return typeof selector === "function" ? selector(state) : state;
    });

    render(<CartScreen />);

    expect(screen.queryByText("Proceder al pago")).toBeNull();
    expect(screen.getByText("Encuentra dónde comprar")).toBeTruthy();
    fireEvent.press(screen.getByText("Encontrar tiendas"));
    expect(mockPush).toHaveBeenCalledWith("/product/7/stores");
  });
});
