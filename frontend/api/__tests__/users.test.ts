import { updatePushToken } from "../users";

const mockFetch = jest.fn();
global.fetch = mockFetch;

beforeEach(() => {
  mockFetch.mockClear();
});

describe("updatePushToken", () => {
  test("patches the authenticated user's push token", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ ok: true }),
    });

    await updatePushToken("jwt-token", "ExpoPushToken[value]");

    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toContain("/users/me/push-token");
    expect(options.method).toBe("PATCH");
    expect(options.headers.Authorization).toBe("Bearer jwt-token");
    expect(JSON.parse(options.body)).toEqual({ token: "ExpoPushToken[value]" });
  });

  test("allows clearing the push token", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ ok: true }),
    });

    await updatePushToken("jwt-token", null);

    const [, options] = mockFetch.mock.calls[0];
    expect(JSON.parse(options.body)).toEqual({ token: null });
  });
});
