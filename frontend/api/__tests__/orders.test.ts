import { createOrder, getOrders, getOrderById } from "../orders";

const mockFetch = jest.fn();
global.fetch = mockFetch;

beforeEach(() => {
  mockFetch.mockClear();
});

const TOKEN = "test-token";
const mockGetToken = jest.fn().mockResolvedValue(TOKEN);

describe("createOrder", () => {
  const items = [{ productId: 1, quantity: 2, price: 1000 }];

  test("creates order with address and payment method", async () => {
    const order = { id: 1, status: "pending" };
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(order),
    });

    const result = await createOrder(items, 10, "mercado_pago", mockGetToken);
    expect(mockGetToken).toHaveBeenCalled();

    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toContain("/orders");
    expect(options.method).toBe("POST");
    expect(options.headers.Authorization).toBe(`Bearer ${TOKEN}`);

    const body = JSON.parse(options.body);
    expect(body.order.address_id).toBe(10);
    expect(body.order.payment_method).toBe("mercado_pago");
    expect(body.items).toEqual(items);
    expect(result).toEqual(order);
  });

  test("throws when no token available", async () => {
    const noToken = jest.fn().mockResolvedValue(null);
    await expect(createOrder(items, 1, "venti", noToken)).rejects.toThrow(
      "No se pudo obtener el token"
    );
  });

  test("extracts error message from detail string", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 400,
      json: () => Promise.resolve({ detail: "Stock insuficiente" }),
    });

    await expect(createOrder(items, 1, "venti", mockGetToken)).rejects.toThrow(
      "Stock insuficiente"
    );
  });

  test("extracts error message from detail object", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 422,
      json: () => Promise.resolve({ detail: { message: "Validation failed" } }),
    });

    await expect(createOrder(items, 1, "venti", mockGetToken)).rejects.toThrow(
      "Validation failed"
    );
  });

  test("extracts error from message field", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ message: "Internal error" }),
    });

    await expect(createOrder(items, 1, "venti", mockGetToken)).rejects.toThrow(
      "Internal error"
    );
  });

  test("extracts error from error field", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ error: "Something went wrong" }),
    });

    await expect(createOrder(items, 1, "venti", mockGetToken)).rejects.toThrow(
      "Something went wrong"
    );
  });

  test("falls back to status code error", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 503,
      json: () => Promise.resolve({}),
    });

    await expect(createOrder(items, 1, "venti", mockGetToken)).rejects.toThrow(
      "Error 503"
    );
  });
});

describe("getOrders", () => {
  test("fetches orders with pagination", async () => {
    const orders = [{ id: 1 }, { id: 2 }];
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(orders),
    });

    const result = await getOrders(TOKEN, 0, 10);
    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toContain("/orders?skip=0&limit=10");
    expect(options.headers.Authorization).toBe(`Bearer ${TOKEN}`);
    expect(result).toEqual(orders);
  });

  test("returns empty array for non-array response", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: "not an array" }),
    });

    const result = await getOrders(TOKEN);
    expect(result).toEqual([]);
  });

  test("throws when no token", async () => {
    await expect(getOrders("")).rejects.toThrow("No se pudo obtener el token");
  });

  test("throws on API error with detail", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 401,
      json: () => Promise.resolve({ detail: "Unauthorized" }),
    });

    await expect(getOrders(TOKEN)).rejects.toThrow("Unauthorized");
  });
});

describe("getOrderById", () => {
  test("fetches single order", async () => {
    const order = { id: 5, status: "completed" };
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(order),
    });

    const result = await getOrderById(5, TOKEN);
    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toContain("/orders/5");
    expect(options.method).toBe("GET");
    expect(options.headers.Authorization).toBe(`Bearer ${TOKEN}`);
    expect(result).toEqual(order);
  });

  test("throws when no token", async () => {
    await expect(getOrderById(1, "")).rejects.toThrow(
      "No se pudo obtener el token"
    );
  });

  test("throws on not found", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 404,
      json: () => Promise.resolve({ detail: "Order not found" }),
    });

    await expect(getOrderById(999, TOKEN)).rejects.toThrow("Order not found");
  });
});
