import { createProductReview } from "../reviews";

const mockFetch = jest.fn();
global.fetch = mockFetch;

beforeEach(() => {
  mockFetch.mockClear();
});

describe("createProductReview", () => {
  test("posts a review with auth token", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: 1 }),
    });

    await createProductReview(
      7,
      { rating: 5, comment: "Muy bueno" },
      "jwt-token"
    );

    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toContain("/products/7/reviews");
    expect(options.method).toBe("POST");
    expect(options.headers.Authorization).toBe("Bearer jwt-token");
    expect(JSON.parse(options.body)).toEqual({
      rating: 5,
      comment: "Muy bueno",
    });
  });

  test("throws when unauthenticated", async () => {
    await expect(
      createProductReview(7, { rating: 5, comment: "" }, "")
    ).rejects.toThrow("Se requiere autenticación");
  });
});
