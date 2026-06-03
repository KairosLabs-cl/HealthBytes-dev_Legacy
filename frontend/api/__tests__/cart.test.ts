import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  mergeCart,
} from "../cart";

const mockFetch = jest.fn();
global.fetch = mockFetch;

beforeEach(() => {
  mockFetch.mockClear();
});

const TOKEN = "test-token";
const getToken = jest.fn(async () => TOKEN);

describe("getCart", () => {
  test("fetches cart with auth header", async () => {
    const cart = { items: [], total: 0 };
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(cart),
    });

    const result = await getCart(getToken);
    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toContain("/cart");
    expect(options.headers.Authorization).toBe(`Bearer ${TOKEN}`);
    expect(result).toEqual(cart);
  });

  test("throws on error", async () => {
    mockFetch.mockResolvedValue({ ok: false });
    await expect(getCart(getToken)).rejects.toThrow("API request failed");
  });
});

describe("addToCart", () => {
  test("sends POST with product and quantity", async () => {
    const item = { id: 1, product_id: 5, quantity: 2 };
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(item),
    });

    const result = await addToCart(5, 2, getToken);
    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toContain("/cart/items");
    expect(options.method).toBe("POST");
    expect(options.headers.Authorization).toBe(`Bearer ${TOKEN}`);
    const body = JSON.parse(options.body);
    expect(body.product_id).toBe(5);
    expect(body.quantity).toBe(2);
    expect(result).toEqual(item);
  });

  test("defaults quantity to 1", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    });

    await addToCart(3, undefined, getToken);
    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.quantity).toBe(1);
  });

  test("throws on error", async () => {
    mockFetch.mockResolvedValue({ ok: false });
    await expect(addToCart(1, 1, getToken)).rejects.toThrow("API request failed");
  });
});

describe("updateCartItem", () => {
  test("sends PUT with new quantity", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ quantity: 3 }),
    });

    await updateCartItem(5, 3, getToken);
    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toContain("/cart/items/5");
    expect(options.method).toBe("PUT");
    const body = JSON.parse(options.body);
    expect(body.quantity).toBe(3);
  });

  test("throws on error", async () => {
    mockFetch.mockResolvedValue({ ok: false });
    await expect(updateCartItem(1, 2, getToken)).rejects.toThrow("API request failed");
  });
});

describe("removeFromCart", () => {
  test("sends DELETE for product without parsing a 204 response body", async () => {
    const json = jest.fn();
    mockFetch.mockResolvedValue({ ok: true, status: 204, json });

    await expect(removeFromCart(5, getToken)).resolves.toBeUndefined();
    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toContain("/cart/items/5");
    expect(options.method).toBe("DELETE");
    expect(json).not.toHaveBeenCalled();
  });

  test("throws on error", async () => {
    mockFetch.mockResolvedValue({ ok: false });
    await expect(removeFromCart(1, getToken)).rejects.toThrow("API request failed");
  });
});

describe("clearCart", () => {
  test("sends DELETE to cart endpoint", async () => {
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({}) });

    await clearCart(getToken);
    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toContain("/cart");
    expect(options.method).toBe("DELETE");
  });

  test("throws on error", async () => {
    mockFetch.mockResolvedValue({ ok: false });
    await expect(clearCart(getToken)).rejects.toThrow("API request failed");
  });
});

describe("mergeCart", () => {
  test("sends POST with local items", async () => {
    const localItems = [{ product_id: 1, quantity: 2 }];
    const mergedCart = { items: [], total: 0 };
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mergedCart),
    });

    const result = await mergeCart(localItems, getToken);
    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toContain("/cart/merge");
    expect(options.method).toBe("POST");
    const body = JSON.parse(options.body);
    expect(body.items).toEqual(localItems);
    expect(result).toEqual(mergedCart);
  });

  test("throws on error", async () => {
    mockFetch.mockResolvedValue({ ok: false });
    await expect(mergeCart([], getToken)).rejects.toThrow("API request failed");
  });
});
