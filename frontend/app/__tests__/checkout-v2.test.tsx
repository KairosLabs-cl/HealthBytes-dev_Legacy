import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert as RNAlert, Linking } from 'react-native';
import CheckoutV2Screen from '../checkout-v2';
import { useCart } from '@/store/cartStore';
import { useAddress } from '@/store/addressStore';
import { createOrder } from '@/api/orders';
import { createMercadoPagoPreference } from '@/api/mercadopago';
import { useAuth } from '@clerk/clerk-expo';

// --- Router ---

const mockPush = jest.fn();
const mockReplace = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace }),
  Stack: { Screen: () => null },
}));

// --- Auth ---

jest.mock('@clerk/clerk-expo', () => ({
  useAuth: jest.fn(),
}));

// --- Stores ---

jest.mock('@/store/cartStore', () => ({
  useCart: jest.fn(),
}));

jest.mock('@/store/addressStore', () => ({
  useAddress: jest.fn(),
}));

// --- API ---

jest.mock('@/api/orders', () => ({
  createOrder: jest.fn(),
}));

jest.mock('@/api/mercadopago', () => ({
  createMercadoPagoPreference: jest.fn(),
}));

// --- React Query ---

jest.mock('@tanstack/react-query', () => ({
  useMutation: () => ({ mutate: jest.fn(), isPending: false }),
}));

// --- UI components ---

jest.mock('@/components/StepIndicator', () => ({
  StepIndicator: () => null,
}));

jest.mock('@/components/PaymentMethodSelector', () => ({
  PaymentMethodSelector: ({ onSelect }: { onSelect: (m: string) => void }) => {
    const { Pressable, Text } = require('react-native');
    return (
      <Pressable testID="payment-selector" onPress={() => onSelect('mercado_pago')}>
        <Text>Seleccionar Mercado Pago</Text>
      </Pressable>
    );
  },
}));

jest.mock('@/components/ui/button', () => {
  const { TouchableOpacity, Text } = require('react-native');
  return {
    Button: ({ onPress, disabled, children }: any) => (
      <TouchableOpacity onPress={onPress} disabled={disabled ?? false}>
        {children}
      </TouchableOpacity>
    ),
    ButtonText: ({ children }: any) => <Text>{children}</Text>,
  };
});

jest.mock('@/components/ui/hstack', () => ({
  HStack: ({ children }: any) => <>{children}</>,
}));

jest.mock('@/components/ui/vstack', () => ({
  VStack: ({ children }: any) => <>{children}</>,
}));

jest.mock('@/lib/formatPrice', () => ({
  formatPrice: (price: number) => `$${price}`,
}));

jest.mock('lucide-react-native', () => ({
  CheckCircleIcon: () => null,
  MapPinIcon: () => null,
  PhoneIcon: () => null,
}));

// Mock Alert.alert — jest.spyOn fails on frozen RN modules; direct assignment works
const alertMock = jest.fn();
RNAlert.alert = alertMock;

// --- Fixtures ---

const mockAddress = {
  id: 1,
  user_id: 'u1',
  street: 'Calle Principal',
  street_number: '123',
  city: 'Santiago',
  region: 'Metropolitana',
  postal_code: '8320000',
  country: 'CL',
  is_default: true,
  is_active: true,
};

const mockCartItems = [
  { product: { id: 1, name: 'Producto Gluten Free', price: 1500 }, quantity: 2 },
  { product: { id: 2, name: 'Producto Vegano', price: 800 }, quantity: 1 },
];

const mockResetCart = jest.fn();
const mockGetToken = jest.fn().mockResolvedValue('test-token');

// --- Setup helpers ---

function setupAuth(isSignedIn = true) {
  (useAuth as jest.Mock).mockReturnValue({ isSignedIn, getToken: mockGetToken });
}

function setupStores(overrides?: { addresses?: any[]; defaultAddress?: any }) {
  (useCart as unknown as jest.Mock).mockReturnValue({
    items: mockCartItems,
    resetCart: mockResetCart,
  });
  (useAddress as unknown as jest.Mock).mockReturnValue({
    addresses: overrides?.addresses ?? [mockAddress],
    defaultAddress:
      overrides?.defaultAddress !== undefined ? overrides.defaultAddress : mockAddress,
    fetchAddresses: jest.fn().mockResolvedValue(undefined),
  });
}

/** Renderiza el screen y navega hasta el paso indicado. */
async function renderAtStep(step: 'address' | 'payment' | 'summary') {
  render(<CheckoutV2Screen />);
  if (step === 'address') return;

  fireEvent.press(screen.getByText('Continuar'));
  await waitFor(() => screen.getByTestId('payment-selector'));
  if (step === 'payment') return;

  fireEvent.press(screen.getByTestId('payment-selector'));
  fireEvent.press(screen.getByText('Revisar Orden'));
  await waitFor(() => screen.getByText('Confirmar Orden'));
}

// =============================================================================
// Tests
// =============================================================================

describe('CheckoutV2Screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Linking, 'canOpenURL').mockResolvedValue(true);
    jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined);
    setupAuth();
    setupStores();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // =========================================================================
  // Paso 1: Dirección
  // =========================================================================
  describe('Paso 1 — Dirección', () => {
    it('muestra el paso inicial con la pregunta de dirección', () => {
      render(<CheckoutV2Screen />);
      expect(screen.getByText('¿A dónde lo llevamos?')).toBeTruthy();
      expect(screen.getByText('Continuar')).toBeTruthy();
    });

    it('renderiza las direcciones guardadas', () => {
      render(<CheckoutV2Screen />);
      expect(screen.getByText('Calle Principal')).toBeTruthy();
      expect(screen.getByText('Santiago, Metropolitana')).toBeTruthy();
    });

    it('muestra estado vacío cuando no hay direcciones', () => {
      setupStores({ addresses: [], defaultAddress: null });
      render(<CheckoutV2Screen />);
      expect(screen.getByText('No tienes direcciones guardadas aún')).toBeTruthy();
    });

    it('lanza alerta si se intenta continuar sin seleccionar dirección', () => {
      setupStores({ addresses: [mockAddress], defaultAddress: null });
      render(<CheckoutV2Screen />);
      fireEvent.press(screen.getByText('Continuar'));
      expect(alertMock).toHaveBeenCalledWith(
        'Dirección requerida',
        'Por favor selecciona una dirección de envío'
      );
    });
  });

  // =========================================================================
  // Paso 2: Método de pago
  // =========================================================================
  describe('Paso 2 — Método de pago', () => {
    it('avanza al paso de pago con dirección pre-seleccionada', async () => {
      await renderAtStep('payment');
      expect(screen.getByTestId('payment-selector')).toBeTruthy();
      expect(screen.getByText('Atrás')).toBeTruthy();
    });

    it('regresa al paso de dirección al presionar Atrás', async () => {
      await renderAtStep('payment');
      fireEvent.press(screen.getByText('Atrás'));
      await waitFor(() => {
        expect(screen.getByText('¿A dónde lo llevamos?')).toBeTruthy();
      });
    });

    it('lanza alerta si se intenta continuar sin método de pago', async () => {
      await renderAtStep('payment');
      fireEvent.press(screen.getByText('Revisar Orden'));
      expect(alertMock).toHaveBeenCalledWith(
        'Método de pago requerido',
        'Por favor selecciona un método de pago'
      );
    });
  });

  // =========================================================================
  // Paso 3: Resumen
  // =========================================================================
  describe('Paso 3 — Resumen', () => {
    it('muestra dirección, método de pago y productos', async () => {
      await renderAtStep('summary');
      expect(screen.getByText('Dirección de Envío')).toBeTruthy();
      expect(screen.getByText('Método de Pago')).toBeTruthy();
      expect(screen.getByText('Producto Gluten Free')).toBeTruthy();
      expect(screen.getByText('Producto Vegano')).toBeTruthy();
    });

    it('muestra totales calculados correctamente', async () => {
      await renderAtStep('summary');
      // 1500*2 + 800*1 = 3800; subtotal y total coinciden porque envío es gratis
      expect(screen.getAllByText('$3800').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('Total')).toBeTruthy();
    });

    it('regresa al paso de pago al presionar Atrás', async () => {
      await renderAtStep('summary');
      fireEvent.press(screen.getByText('Atrás'));
      await waitFor(() => {
        expect(screen.getByTestId('payment-selector')).toBeTruthy();
      });
    });
  });

  // =========================================================================
  // Happy path
  // =========================================================================
  describe('Happy path — confirmación exitosa', () => {
    beforeEach(() => {
      (createOrder as jest.Mock).mockResolvedValue({ id: 42 });
      (createMercadoPagoPreference as jest.Mock).mockResolvedValue({
        payment_id: 100,
        preference_id: 'pref_abc',
        init_point: 'https://mp.com/pay',
        sandbox_init_point: 'https://sandbox.mp.com/pay',
      });
    });

    it('crea la orden con los ítems y la dirección correctos', async () => {
      await renderAtStep('summary');
      fireEvent.press(screen.getByText('Confirmar Orden'));
      await waitFor(() => {
        expect(createOrder).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({ productId: 1, quantity: 2, price: 1500 }),
            expect.objectContaining({ productId: 2, quantity: 1, price: 800 }),
          ]),
          mockAddress.id,
          'mercado_pago',
          expect.any(Function)
        );
      });
    });

    it('crea la preferencia de MercadoPago con el ID de orden', async () => {
      await renderAtStep('summary');
      fireEvent.press(screen.getByText('Confirmar Orden'));
      await waitFor(() => {
        expect(createMercadoPagoPreference).toHaveBeenCalledWith(
          expect.objectContaining({ order_id: 42 }),
          mockGetToken
        );
      });
    });

    it('abre la URL de pago (carrito se limpia en success/failure, no aquí)', async () => {
      await renderAtStep('summary');
      fireEvent.press(screen.getByText('Confirmar Orden'));
      await waitFor(() => {
        expect(Linking.openURL).toHaveBeenCalled();
        // resetCart is intentionally NOT called here: cart is reset by
        // /payment/success and /payment/failure to avoid losing cart on cancel.
        expect(mockResetCart).not.toHaveBeenCalled();
      });
    });

    it('redirige a /payment/pending con orderId y paymentId', async () => {
      await renderAtStep('summary');
      fireEvent.press(screen.getByText('Confirmar Orden'));
      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith(
          expect.objectContaining({
            pathname: '/payment/pending',
            params: expect.objectContaining({ orderId: '42' }),
          })
        );
      });
    });
  });

  // =========================================================================
  // Error paths
  // =========================================================================
  describe('Error paths', () => {
    it('muestra alerta cuando createOrder falla', async () => {
      (createOrder as jest.Mock).mockRejectedValue(new Error('Stock insuficiente'));
      await renderAtStep('summary');
      fireEvent.press(screen.getByText('Confirmar Orden'));
      await waitFor(() => {
        expect(alertMock).toHaveBeenCalledWith('Error', 'Stock insuficiente');
      });
    });

    it('muestra alerta cuando createMercadoPagoPreference falla', async () => {
      (createOrder as jest.Mock).mockResolvedValue({ id: 1 });
      (createMercadoPagoPreference as jest.Mock).mockRejectedValue(
        new Error('Error al crear preferencia')
      );
      await renderAtStep('summary');
      fireEvent.press(screen.getByText('Confirmar Orden'));
      await waitFor(() => {
        expect(alertMock).toHaveBeenCalledWith('Error', 'Error al crear preferencia');
      });
    });

    it('redirige a login si el usuario no está autenticado', async () => {
      setupAuth(false);
      await renderAtStep('summary');
      fireEvent.press(screen.getByText('Confirmar Orden'));
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/(auth)/login');
      });
    });
  });
});
