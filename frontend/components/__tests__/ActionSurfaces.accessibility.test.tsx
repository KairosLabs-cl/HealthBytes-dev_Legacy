import React from "react";
import { fireEvent, render, screen } from "@testing-library/react-native";
import { Package } from "lucide-react-native";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { OrderListItem } from "../OrderListItem";
import WishlistTableRow from "../WishlistTableRow";
import type { Order } from "@/types/order";
import type { Product } from "@/types/product";

const mockPush = jest.fn();
const mockBack = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({ push: mockPush, back: mockBack }),
}));

jest.mock("@/store/cartStore", () => ({
  useCart: (selector: any) => selector({ addProduct: jest.fn() }),
}));

jest.mock("@/store/favoritesStore", () => ({
  useFavoritesStore: (selector: any) =>
    selector({ toggleFavorite: jest.fn().mockResolvedValue(undefined) }),
}));

jest.mock("@clerk/clerk-expo", () => ({
  useAuth: () => ({ getToken: jest.fn().mockResolvedValue("token") }),
}));

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

const order: Order = {
  id: 12,
  user_id: "user-1",
  created_at: "2026-05-10T14:30:00.000Z",
  status: "processing",
  items: [
    { id: 1, order_id: 12, product_id: 5, quantity: 2, price: 1500 },
    { id: 2, order_id: 12, product_id: 6, quantity: 1, price: 800 },
  ],
};

const product: Product = {
  id: 5,
  name: "Mix vegano",
  price: 3200,
  image: "https://example.com/mix.png",
  stock: 3,
};

describe("shared action surfaces accessibility", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("labels the shared screen header back button", () => {
    render(<ScreenHeader title="Detalle" icon={Package} showBackButton />);

    const back = screen.getByLabelText("Volver");
    expect(back.props.accessibilityRole).toBe("button");

    fireEvent.press(back);
    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it("labels order rows with status, item count, and total", () => {
    const onPress = jest.fn();

    render(<OrderListItem order={order} onPress={onPress} />);

    const row = screen.getByLabelText(
      "Ver orden 12, En proceso, 3 productos, total $3.800"
    );
    expect(row.props.accessibilityRole).toBe("button");
    expect(row.props.accessibilityHint).toBe("Abre el detalle de la orden");
  });

  it("labels wishlist row detail, cart, and remove controls", () => {
    render(<WishlistTableRow product={product} />);

    expect(screen.getAllByLabelText("Ver detalles de Mix vegano")).toHaveLength(
      2
    );

    const add = screen.getByLabelText("Agregar Mix vegano al carrito");
    expect(add.props.accessibilityRole).toBe("button");
    expect(add.props.accessibilityState).toEqual({ disabled: false });

    const remove = screen.getByLabelText(
      "Quitar Mix vegano de la lista de deseos"
    );
    expect(remove.props.accessibilityRole).toBe("button");
  });
});
