import {
  addFavorite,
  removeFavorite,
  getUserFavorites,
  checkFavorite,
  getFavoriteIds,
} from "../favorites";

const mockFetch = jest.fn();
global.fetch = mockFetch;

beforeEach(() => {
  mockFetch.mockClear();
});

const TOKEN = "test-token";

describe("addFavorite", () => {
  test("sends POST with product_id", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: 1, product_id: 5 }),
    });

    const result = await addFavorite(5, TOKEN);
    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toContain("/favorites");
    expect(options.method).toBe("POST");
    expect(options.headers.Authorization).toBe(`Bearer ${TOKEN}`);
    expect(result).toEqual({ id: 1, product_id: 5 });
  });

  test("throws on error", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ detail: "Already favorited" }),
    });

    await expect(addFavorite(5, TOKEN)).rejects.toThrow("Already favorited");
  });
});

describe("removeFavorite", () => {
  test("sends DELETE for product", async () => {
    mockFetch.mockResolvedValue({ ok: true });

    await removeFavorite(5, TOKEN);
    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toContain("/favorites/5");
    expect(options.method).toBe("DELETE");
  });

  test("does not throw on 404", async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 404 });
    await expect(removeFavorite(5, TOKEN)).resolves.toBeUndefined();
  });

  test("throws on other errors", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ detail: "Server error" }),
    });

    await expect(removeFavorite(5, TOKEN)).rejects.toThrow("Server error");
  });
});

describe("getUserFavorites", () => {
  test("fetches favorites with auth", async () => {
    const favorites = [{ id: 1, product_id: 5 }];
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(favorites),
    });

    const result = await getUserFavorites(TOKEN);
    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain("/favorites");
    expect(result).toEqual(favorites);
  });

  test("throws on error", async () => {
    mockFetch.mockResolvedValue({ ok: false });
    await expect(getUserFavorites(TOKEN)).rejects.toThrow(
      "Error fetching favorites"
    );
  });
});

describe("checkFavorite", () => {
  test("checks if product is favorited", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ is_favorite: true }),
    });

    const result = await checkFavorite(5, TOKEN);
    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain("/favorites/check/5");
    expect(result.is_favorite).toBe(true);
  });

  test("throws on error", async () => {
    mockFetch.mockResolvedValue({ ok: false });
    await expect(checkFavorite(5, TOKEN)).rejects.toThrow(
      "Error checking favorite"
    );
  });
});

describe("getFavoriteIds", () => {
  test("fetches favorite product IDs", async () => {
    const ids = [1, 5, 10];
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(ids),
    });

    const result = await getFavoriteIds(TOKEN);
    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain("/favorites/ids");
    expect(result).toEqual(ids);
  });

  test("throws on error", async () => {
    mockFetch.mockResolvedValue({ ok: false });
    await expect(getFavoriteIds(TOKEN)).rejects.toThrow(
      "Error fetching favorite IDs"
    );
  });
});
