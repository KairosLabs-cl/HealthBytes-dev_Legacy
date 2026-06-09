import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/react-native";
import { Alert as RNAlert, Linking } from "react-native";
import CheckoutV2Screen from "../checkout-v2";
import { useCart } from "@/store/cartStore";
import { useAddress } from "@/store/addressStore";
import { createOrder } from "@/api/orders";
import { createMercadoPagoPreference } from "@/api/mercadopago";
import { useAuth } from "@clerk/clerk-expo";

let mockMarketplaceEnabled = true;

// --- Router ---

const mockPush = jest.fn();
const mockReplace = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace }),
  Stack: { Screen: () => null },
}));

// --- Auth ---

jest.mock("@clerk/clerk-expo", () => ({
  useAuth: jest.fn(),
}));

// --- Stores ---

jest.mock("@/store/cartStore", () => ({
  useCart: jest.fn(),
  selectCartSubtotal: jest.fn(),
}));

jest.mock("@/store/addressStore", () => ({
  useAddress: jest.fn(),
}));

// --- API ---

jest.mock("@/api/orders", () => ({
  createOrder: jest.fn(),
}));

jest.mock("@/api/mercadopago", () => ({
  createMercadoPagoPreference: jest.fn(),
}));

jest.mock("@/lib/config", () => ({
  FEATURES: {
    get MARKETPLACE_ENABLED() {
      return mockMarketplaceEnabled;
    },
    SEARCH_ENABLED: true,
    STORE_LOCATOR_ENABLED: true,
    WISHLIST_ENABLED: true,
  },
}));

// --- React Query ---

jest.mock("@tanstack/react-query", () => ({
  useMutation: () => ({ mutate: jest.fn(), isPending: false }),
}));

// --- UI components ---

jest.mock("@/components/StepIndicator", () => ({
  StepIndicator: () => null,
}));

jest.mock("@/components/PaymentMethodSelector", () => ({
  PaymentMethodSelector: ({ onSelect }: { onSelect: (m: string) => void }) => {
    const { Pressable, Text } = require("react-native");
    return (
      <Pressable
        testID="payment-selector"
        onPress={() => onSelect("mercado_pago")}
        accessibilityRole="radio"
        accessibilityLabel="Mercado Pago, Billetera digital de Mercado Pago"
        accessibilityState={{ selected: false }}
      >
        <Text>Seleccionar Mercado Pago</Text>
      </Pressable>
    );
  },
}));

jest.mock("@/components/ui/button", () => {
  const { TouchableOpacity, Text } = require("react-native");
  return {
    Button: ({ onPress, disabled, children, ...rest }: any) => (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled ?? false}
        {...rest}
      >
        {children}
      </TouchableOpacity>
    ),
    ButtonText: ({ children }: any) => <Text>{children}</Text>,
  };
});

jest.mock("@/components/ui/hstack", () => ({
  HStack: ({ children }: any) => <>{children}</>,
}));

jest.mock("@/components/ui/vstack", () => ({
  VStack: ({ children }: any) => <>{children}</>,
}));

jest.mock("@/lib/formatPrice", () => ({
  formatPrice: (price: number) => `$${price}`,
}));

jest.mock("lucide-react-native", () => ({
  CheckCircleIcon: () => null,
  MapPinIcon: () => null,
  PhoneIcon: () => null,
  Lock: () => null,
  ArrowLeft: () => null,
}));

jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
  useSafeAreaFrame: () => ({ x: 0, y: 0, width: 390, height: 844 }),
}));

// Mock Alert.alert — jest.spyOn fails on frozen RN modules; direct assignment works
const alertMock = jest.fn();
RNAlert.alert = alertMock;

// --- Fixtures ---

const mockAddress = {
  id: 1,
  user_id: "u1",
  street: "Calle Principal",
  street_number: "123",
  city: "Santiago",
  region: "Metropolitana",
  postal_code: "8320000",
  country: "CL",
  is_default: true,
  is_active: true,
};

const mockCartItems = [
  {
    product: { id: 1, name: "Producto Gluten Free", price: 1500 },
    quantity: 2,
  },
  { product: { id: 2, name: "Producto Vegano", price: 800 }, quantity: 1 },
];

const mockResetCart = jest.fn();
const mockGetToken = jest.fn().mockResolvedValue("test-token");

// --- Setup helpers ---

function setupAuth(isSignedIn = true) {
  (useAuth as jest.Mock).mockReturnValue({
    isSignedIn,
    isLoaded: true,
    getToken: mockGetToken,
  });
}

function setupStores(overrides?: { addresses?: any[]; defaultAddress?: any }) {
  const { selectCartSubtotal } = require("@/store/cartStore");
  (selectCartSubtotal as jest.Mock).mockImplementation((state) =>
    state.items.reduce(
      (acc: number, item: any) => acc + item.product.price * item.quantity,
      0
    )
  );

  (useCart as unknown as jest.Mock).mockImplementation((selector) => {
    if (selector === selectCartSubtotal) return 3800;
    const mockStore = {
      items: mockCartItems,
      resetCart: mockResetCart,
    };
    return selector ? selector(mockStore) : mockStore;
  });
  (useAddress as unknown as jest.Mock).mockImplementation((selector) => {
    const mockStore = {
      addresses: overrides?.addresses ?? [mockAddress],
      defaultAddress:
        overrides?.defaultAddress !== undefined
          ? overrides.defaultAddress
          : mockAddress,
      fetchAddresses: jest.fn().mockResolvedValue(undefined),
    };
    return selector ? selector(mockStore) : mockStore;
  });
}

/** Renderiza el screen y navega hasta el paso indicado. */
async function renderAtStep(step: "address" | "payment" | "summary") {
  render(<CheckoutV2Screen />);
  if (step === "address") return;

  fireEvent.press(screen.getByText("Continuar"));
  await waitFor(() => screen.getByTestId("payment-selector"));
  if (step === "payment") return;

  fireEvent.press(screen.getByTestId("payment-selector"));
  fireEvent.press(screen.getByText("Revisar Orden"));
  await waitFor(() => screen.getByText("Confirmar Orden"));
}

// =============================================================================
// Tests
// =============================================================================

describe("CheckoutV2Screen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockMarketplaceEnabled = true;
    jest.spyOn(Linking, "canOpenURL").mockResolvedValue(true);
    jest.spyOn(Linking, "openURL").mockResolvedValue(undefined);
    setupAuth();
    setupStores();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("Marketplace deshabilitado", () => {
    it("muestra CTA de tiendas y no llama APIs de checkout", () => {
      mockMarketplaceEnabled = false;

      render(<CheckoutV2Screen />);

      expect(screen.getByText("Encuentra dónde comprar")).toBeTruthy();
      expect(screen.getByText("Ver tiendas del producto")).toBeTruthy();
      expect(createOrder).not.toHaveBeenCalled();
      expect(createMercadoPagoPreference).not.toHaveBeenCalled();
      expect(Linking.openURL).not.toHaveBeenCalled();
    });

    it("navega al mapa de tiendas del primer producto del carrito", () => {
      mockMarketplaceEnabled = false;

      render(<CheckoutV2Screen />);
      fireEvent.press(screen.getByText("Ver tiendas del producto"));

      expect(mockReplace).toHaveBeenCalledWith("/product/1/stores");
    });
  });

  // =========================================================================
  // Paso 1: Dirección
  // =========================================================================
  describe("Paso 1 — Dirección", () => {
    it("muestra el paso inicial con la pregunta de dirección", () => {
      render(<CheckoutV2Screen />);
      expect(screen.getByText("¿A dónde lo llevamos?")).toBeTruthy();
      expect(screen.getByText("Continuar")).toBeTruthy();
    });

    it("renderiza las direcciones guardadas", () => {
      render(<CheckoutV2Screen />);
      expect(screen.getByText("Calle Principal")).toBeTruthy();
      expect(screen.getByText("Santiago, Metropolitana")).toBeTruthy();
    });

    it("expone dirección seleccionada como radio con label estable", () => {
      render(<CheckoutV2Screen />);
      const address = screen.getByLabelText(
        "Dirección: Calle Principal, Santiago"
      );
      expect(address.props.accessibilityRole).toBe("radio");
      expect(address.props.accessibilityState).toMatchObject({ checked: true });
    });

    it("muestra estado vacío cuando no hay direcciones", () => {
      setupStores({ addresses: [], defaultAddress: null });
      render(<CheckoutV2Screen />);
      expect(
        screen.getByText("No tienes direcciones guardadas aún")
      ).toBeTruthy();
    });

    it("muestra error inline si se intenta continuar sin seleccionar dirección", async () => {
      setupStores({ addresses: [mockAddress], defaultAddress: null });
      render(<CheckoutV2Screen />);
      fireEvent.press(screen.getByText("Continuar"));
      await waitFor(() => {
        expect(
          screen.getByText("Selecciona una dirección de envío para continuar.")
        ).toBeTruthy();
      });
    });
  });

  // =========================================================================
  // Paso 2: Método de pago
  // =========================================================================
  describe("Paso 2 — Método de pago", () => {
    it("avanza al paso de pago con dirección pre-seleccionada", async () => {
      await renderAtStep("payment");
      expect(screen.getByTestId("payment-selector")).toBeTruthy();
      expect(screen.getByText("Atrás")).toBeTruthy();
      expect(screen.getByLabelText("Revisar orden")).toBeTruthy();
    });

    it("regresa al paso de dirección al presionar Atrás", async () => {
      await renderAtStep("payment");
      fireEvent.press(screen.getByText("Atrás"));
      await waitFor(() => {
        expect(screen.getByText("¿A dónde lo llevamos?")).toBeTruthy();
      });
    });

    it("muestra error inline si se intenta continuar sin método de pago", async () => {
      await renderAtStep("payment");
      fireEvent.press(screen.getByText("Revisar Orden"));
      await waitFor(() => {
        expect(
          screen.getByText("Selecciona un método de pago para continuar.")
        ).toBeTruthy();
      });
    });
  });

  // =========================================================================
  // Paso 3: Resumen
  // =========================================================================
  describe("Paso 3 — Resumen", () => {
    it("muestra dirección, método de pago y productos", async () => {
      await renderAtStep("summary");
      expect(screen.getByText("Dirección de Envío")).toBeTruthy();
      expect(screen.getByText("Método de Pago")).toBeTruthy();
      expect(screen.getByText("Producto Gluten Free")).toBeTruthy();
      expect(screen.getByText("Producto Vegano")).toBeTruthy();
    });

    it("muestra totales calculados correctamente", async () => {
      await renderAtStep("summary");
      // 1500*2 + 800*1 = 3800; subtotal y total coinciden porque envío es gratis
      expect(screen.getAllByText("$3800").length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText("Total")).toBeTruthy();
    });

    it("regresa al paso de pago al presionar Atrás", async () => {
      await renderAtStep("summary");
      fireEvent.press(screen.getByText("Atrás"));
      await waitFor(() => {
        expect(screen.getByTestId("payment-selector")).toBeTruthy();
      });
    });
  });

  // =========================================================================
  // Happy path
  // =========================================================================
  describe("Happy path — confirmación exitosa", () => {
    beforeEach(() => {
      (createOrder as jest.Mock).mockResolvedValue({ id: 42 });
      (createMercadoPagoPreference as jest.Mock).mockResolvedValue({
        payment_id: 100,
        preference_id: "pref_abc",
        init_point: "https://mp.com/pay",
        sandbox_init_point: "https://sandbox.mp.com/pay",
      });
    });

    it("crea la orden con los ítems y la dirección correctos", async () => {
      await renderAtStep("summary");
      fireEvent.press(screen.getByText("Confirmar Orden"));
      await waitFor(() => {
        expect(createOrder).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({ productId: 1, quantity: 2, price: 1500 }),
            expect.objectContaining({ productId: 2, quantity: 1, price: 800 }),
          ]),
          mockAddress.id,
          "mercado_pago",
          expect.any(Function)
        );
      });
    });

    it("crea la preferencia de MercadoPago con el ID de orden", async () => {
      await renderAtStep("summary");
      fireEvent.press(screen.getByText("Confirmar Orden"));
      await waitFor(() => {
        expect(createMercadoPagoPreference).toHaveBeenCalledWith(
          expect.objectContaining({ order_id: 42 }),
          mockGetToken
        );
      });
    });

    it("abre la URL de pago (carrito se limpia en success/failure, no aquí)", async () => {
      await renderAtStep("summary");
      fireEvent.press(screen.getByText("Confirmar Orden"));
      await waitFor(() => {
        expect(Linking.openURL).toHaveBeenCalled();
        // resetCart is intentionally NOT called here: cart is reset by
        // /payment/success and /payment/failure to avoid losing cart on cancel.
        expect(mockResetCart).not.toHaveBeenCalled();
      });
    });

    it("redirige a /payment/pending con orderId y paymentId", async () => {
      await renderAtStep("summary");
      fireEvent.press(screen.getByText("Confirmar Orden"));
      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith(
          expect.objectContaining({
            pathname: "/payment/pending",
            params: expect.objectContaining({ orderId: "42" }),
          })
        );
      });
    });
  });

  // =========================================================================
  // Error paths
  // =========================================================================
  describe("Error paths", () => {
    it("muestra error inline cuando createOrder falla", async () => {
      (createOrder as jest.Mock).mockRejectedValue(
        new Error("Stock insuficiente")
      );
      await renderAtStep("summary");
      fireEvent.press(screen.getByText("Confirmar Orden"));
      await waitFor(() => {
        expect(screen.getByText("Stock insuficiente")).toBeTruthy();
      });
    });

    it("muestra error inline cuando createMercadoPagoPreference falla", async () => {
      (createOrder as jest.Mock).mockResolvedValue({ id: 1 });
      (createMercadoPagoPreference as jest.Mock).mockRejectedValue(
        new Error("Error al crear preferencia")
      );
      await renderAtStep("summary");
      fireEvent.press(screen.getByText("Confirmar Orden"));
      await waitFor(() => {
        expect(screen.getByText("Error al crear preferencia")).toBeTruthy();
      });
    });

    it("muestra AuthGate si el usuario no está autenticado", () => {
      setupAuth(false);
      render(<CheckoutV2Screen />);
      expect(screen.getByText("Inicia sesion para completar tu compra.")).toBeTruthy();
    });
  });
});
