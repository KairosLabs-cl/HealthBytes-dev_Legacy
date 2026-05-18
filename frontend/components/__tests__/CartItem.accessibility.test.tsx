import React from "react";
import { render, screen } from "@testing-library/react-native";
import CartItem from "../CartItem";

const mockStore = {
  addingProducts: new Set(),
  updatingProducts: new Set(),
  removingProducts: new Set(),
  updateQuantity: jest.fn(),
};

jest.mock("@/store/cartStore", () => ({
  useCart: Object.assign((selector: any) => selector(mockStore), {
    getState: () => mockStore,
  }),
}));

const item = {
  product: {
    id: 42,
    name: "Barra proteica",
    price: 1200,
    image: "https://example.com/barra.png",
  },
  quantity: 2,
};

describe("CartItem accessibility", () => {
  it("labels quantity and remove controls with product context", () => {
    render(
      <CartItem
        item={item}
        onIncrement={jest.fn()}
        onDecrement={jest.fn()}
        onRemove={jest.fn()}
      />
    );

    const decrement = screen.getByLabelText(
      "Disminuir cantidad de Barra proteica"
    );
    expect(decrement.props.accessibilityRole).toBe("button");
    expect(decrement.props.accessibilityState).toEqual({ disabled: false });

    const increment = screen.getByLabelText(
      "Aumentar cantidad de Barra proteica"
    );
    expect(increment.props.accessibilityRole).toBe("button");
    expect(increment.props.accessibilityState).toEqual({ disabled: false });

    const remove = screen.getByLabelText("Eliminar Barra proteica del carrito");
    expect(remove.props.accessibilityRole).toBe("button");
    expect(remove.props.accessibilityState).toEqual({ disabled: false });
  });
});
