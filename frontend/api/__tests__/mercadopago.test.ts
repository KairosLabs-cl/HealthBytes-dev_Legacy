import {
  createMercadoPagoPreference,
  getMercadoPagoPaymentStatus,
} from "../mercadopago";

const mockFetch = jest.fn();
global.fetch = mockFetch;

beforeEach(() => {
  mockFetch.mockClear();
});

const TOKEN = "test-token";
const mockGetToken = jest.fn().mockResolvedValue(TOKEN);

describe("createMercadoPagoPreference", () => {
  const request = { order_id: 1, description: "Test order" };

  test("creates preference with auth", async () => {
    const response = {
      payment_id: 100,
      preference_id: "pref_123",
      init_point: "https://mp.com/pay",
    };
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(response),
    });

    const result = await createMercadoPagoPreference(request, mockGetToken);
    expect(mockGetToken).toHaveBeenCalled();
    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toContain("/payments/mercadopago/create-preference");
    expect(options.method).toBe("POST");
    expect(options.headers.Authorization).toBe(`Bearer ${TOKEN}`);
    expect(result).toEqual(response);
  });

  test("throws when no token", async () => {
    const noToken = jest.fn().mockResolvedValue(null);
    await expect(createMercadoPagoPreference(request, noToken)).rejects.toThrow(
      "No authentication token available"
    );
  });

  test("extracts error from detail string", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 400,
      json: () => Promise.resolve({ detail: "Order not found" }),
    });

    await expect(
      createMercadoPagoPreference(request, mockGetToken)
    ).rejects.toThrow("Order not found");
  });

  test("extracts error from detail object", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 422,
      json: () => Promise.resolve({ detail: { message: "Invalid order" } }),
    });

    await expect(
      createMercadoPagoPreference(request, mockGetToken)
    ).rejects.toThrow("Invalid order");
  });

  test("falls back to status code error", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.resolve({}),
    });

    await expect(
      createMercadoPagoPreference(request, mockGetToken)
    ).rejects.toThrow("Error 500");
  });
});

describe("getMercadoPagoPaymentStatus", () => {
  test("fetches payment status", async () => {
    const status = { payment_id: "123", status: "approved" };
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(status),
    });

    const result = await getMercadoPagoPaymentStatus("123", mockGetToken);
    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain("/payments/mercadopago/payment/123");
    expect(result).toEqual(status);
  });

  test("throws when no token", async () => {
    const noToken = jest.fn().mockResolvedValue(null);
    await expect(getMercadoPagoPaymentStatus("123", noToken)).rejects.toThrow(
      "No authentication token available"
    );
  });

  test("throws on error with detail", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ detail: "Payment not found" }),
    });

    await expect(
      getMercadoPagoPaymentStatus("999", mockGetToken)
    ).rejects.toThrow("Payment not found");
  });
});
