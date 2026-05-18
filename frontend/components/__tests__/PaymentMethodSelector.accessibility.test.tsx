import React from "react";
import { fireEvent, render, screen } from "@testing-library/react-native";
import { PaymentMethodSelector } from "../PaymentMethodSelector";

describe("PaymentMethodSelector accessibility", () => {
  it("exposes payment methods as radios with selected and disabled state", () => {
    const onSelect = jest.fn();

    render(
      <PaymentMethodSelector selected="mercado_pago" onSelect={onSelect} />
    );

    const mercadoPago = screen.getByLabelText(
      "Mercado Pago, Billetera digital de Mercado Pago"
    );
    expect(mercadoPago.props.accessibilityRole).toBe("radio");
    expect(mercadoPago.props.accessibilityState).toEqual({
      selected: true,
      disabled: undefined,
    });

    const venti = screen.getByLabelText(
      "Venti, Transferencia bancaria segura, Próximamente"
    );
    expect(venti.props.accessibilityRole).toBe("radio");
    expect(venti.props.accessibilityState).toEqual({
      selected: false,
      disabled: true,
    });

    fireEvent.press(mercadoPago);
    fireEvent.press(venti);

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith("mercado_pago");
  });
});
