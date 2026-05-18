import React from "react";
import { render, screen } from "@testing-library/react-native";
import ProductCard from "../ProductCard";
import type { Product } from "@/types/product";

jest.mock("@/components/FavoriteButton", () => () => null);
jest.mock("@/components/RatingStars", () => ({
  RatingStars: () => null,
}));
jest.mock("@/components/StockBadge", () => () => null);
jest.mock("expo-image", () => {
  const { Image } = require("react-native");
  return { Image };
});
jest.mock("@/store/cartStore", () => ({
  useCart: (selector: any) => selector({ addProduct: jest.fn() }),
}));
jest.mock("@/store/cartAnimationStore", () => ({
  useCartAnimation: (selector: any) => selector({ trigger: jest.fn() }),
}));

const product: Product = {
  id: 7,
  name: "Granola sin gluten",
  price: 4990,
  stock: 5,
  image: "https://example.com/granola.png",
};

describe("ProductCard accessibility", () => {
  it("labels the tappable product card with product name and action", () => {
    render(<ProductCard product={product} width={210} />);

    const card = screen.getByLabelText(
      "Ver detalles de Granola sin gluten, $4.990"
    );
    expect(card.props.accessibilityRole).toBe("button");
    expect(card.props.accessibilityHint).toBe(
      "Toca para ver detalles del producto"
    );
  });

  it("labels the add-to-cart control as a button", () => {
    render(<ProductCard product={product} width={210} />);

    const addToCart = screen.getByLabelText(
      "Agregar Granola sin gluten al carrito"
    );
    expect(addToCart.props.accessibilityRole).toBe("button");
    expect(addToCart.props.accessibilityState).toEqual({ disabled: false });
  });
});
