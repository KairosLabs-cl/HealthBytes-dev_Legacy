import {
  fetchProductById,
  getRecommendedProducts,
  listProducts,
} from "../products";

const mockFetch = jest.fn();
global.fetch = mockFetch;

beforeEach(() => {
  mockFetch.mockClear();
});

describe("listProducts", () => {
  test("fetches products without filters", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([{ id: 1, name: "Product 1" }]),
    });

    const result = await listProducts();
    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain("/products");
    expect(url).not.toContain("?");
    expect(result).toEqual([{ id: 1, name: "Product 1" }]);
  });

  test("builds query string with search filter", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    });

    await listProducts({ search: "avena" });
    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain("search=avena");
  });

  test("builds query string with dietary filters", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    });

    await listProducts({ dietary: ["vegano", "sin-gluten"] });
    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain("dietary=");
    expect(url).toContain("vegano");
    expect(url).toContain("sin-gluten");
  });

  test("builds query string with price range", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    });

    await listProducts({ minPrice: 1000, maxPrice: 5000 });
    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain("min_price=1000");
    expect(url).toContain("max_price=5000");
  });

  test("builds query string with category filter", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    });

    await listProducts({ category: "snacks" });
    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain("category=snacks");
  });

  test("throws on API error", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ detail: "Server error" }),
    });

    await expect(listProducts()).rejects.toThrow("Server error");
  });
});

describe("fetchProductById", () => {
  test("fetches product by id", async () => {
    const product = { id: 5, name: "Test Product", price: 2990 };
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(product),
    });

    const result = await fetchProductById(5);
    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain("/products/5");
    expect(result).toEqual(product);
  });

  test("throws on not found", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ detail: "Not found" }),
    });

    await expect(fetchProductById(999)).rejects.toThrow("Not found");
  });
});

describe("getRecommendedProducts", () => {
  test("fetches recommended products with auth and limit", async () => {
    const products = [{ id: 1, name: "Avena", price: 1990 }];
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(products),
    });

    const result = await getRecommendedProducts("jwt-token", 12);
    const [url, options] = mockFetch.mock.calls[0];

    expect(url).toContain("/products/recommended?limit=12");
    expect(options.headers.Authorization).toBe("Bearer jwt-token");
    expect(result).toEqual(products);
  });

  test("returns empty array for non-array recommended response", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ products: [] }),
    });

    await expect(getRecommendedProducts("jwt-token")).resolves.toEqual([]);
  });
});
