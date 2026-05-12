import React from "react";
import { render, screen } from "@testing-library/react-native";
import { Header } from "../Header";

describe("Header accessibility", () => {
  it("labels the search input and explains expected input", () => {
    render(<Header userName="Benja" />);

    const input = screen.getByLabelText("Buscar productos");
    expect(input.props.accessibilityHint).toBe(
      "Ingresa el nombre del producto que buscas"
    );
  });

  it("labels icon-only search controls", () => {
    render(<Header userName="Benja" initialSearchTerm="granola" />);

    expect(screen.getByLabelText("Buscar").props.accessibilityRole).toBe(
      "button"
    );
    expect(
      screen.getByLabelText("Limpiar búsqueda").props.accessibilityRole
    ).toBe("button");
  });
});
