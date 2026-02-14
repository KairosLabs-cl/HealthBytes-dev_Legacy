import { fetchAddresses, fetchAddressById, createAddress, updateAddress, deleteAddress, setDefaultAddress } from "../addresses";

const mockFetch = jest.fn();
global.fetch = mockFetch;

beforeEach(() => {
  mockFetch.mockClear();
});

const TOKEN = "test-token";
const mockAddress = {
  id: 1,
  street: "Av. Providencia 123",
  city: "Santiago",
  region: "Metropolitana",
  postal_code: "7500000",
  is_default: true,
};

describe("fetchAddresses", () => {
  test("fetches all addresses with auth", async () => {
    const response = { addresses: [mockAddress] };
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(response),
    });

    const result = await fetchAddresses(TOKEN);
    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toContain("/addresses");
    expect(options.headers.Authorization).toBe(`Bearer ${TOKEN}`);
    expect(result).toEqual(response);
  });

  test("throws on error with detail message", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: () =>
        Promise.resolve({ detail: { message: "Not authenticated" } }),
    });

    await expect(fetchAddresses(TOKEN)).rejects.toThrow("Not authenticated");
  });

  test("throws default message when no detail", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({}),
    });

    await expect(fetchAddresses(TOKEN)).rejects.toThrow(
      "Error fetching addresses"
    );
  });
});

describe("fetchAddressById", () => {
  test("fetches single address", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockAddress),
    });

    const result = await fetchAddressById(1, TOKEN);
    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain("/addresses/1");
    expect(result).toEqual(mockAddress);
  });

  test("throws on not found", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({}),
    });

    await expect(fetchAddressById(999, TOKEN)).rejects.toThrow(
      "Error fetching address"
    );
  });
});

describe("createAddress", () => {
  const newAddress = {
    street: "Calle Nueva 456",
    city: "Valparaiso",
    region: "Valparaiso",
    postal_code: "2340000",
  };

  test("sends POST with address data", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: 2, ...newAddress }),
    });

    const result = await createAddress(newAddress, TOKEN);
    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toContain("/addresses");
    expect(options.method).toBe("POST");
    const body = JSON.parse(options.body);
    expect(body.street).toBe("Calle Nueva 456");
    expect(result.id).toBe(2);
  });

  test("throws on validation error", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: () =>
        Promise.resolve({ detail: { message: "Invalid postal code" } }),
    });

    await expect(createAddress(newAddress, TOKEN)).rejects.toThrow(
      "Invalid postal code"
    );
  });
});

describe("updateAddress", () => {
  test("sends PUT with updated data", async () => {
    const update = { street: "Calle Actualizada 789" };
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ ...mockAddress, ...update }),
    });

    const result = await updateAddress(1, update, TOKEN);
    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toContain("/addresses/1");
    expect(options.method).toBe("PUT");
    expect(result.street).toBe("Calle Actualizada 789");
  });

  test("throws on error", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({}),
    });

    await expect(updateAddress(1, {}, TOKEN)).rejects.toThrow(
      "Error updating address"
    );
  });
});

describe("deleteAddress", () => {
  test("sends DELETE request", async () => {
    mockFetch.mockResolvedValue({ ok: true });

    await deleteAddress(1, TOKEN);
    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toContain("/addresses/1");
    expect(options.method).toBe("DELETE");
  });

  test("throws on error", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({}),
    });

    await expect(deleteAddress(999, TOKEN)).rejects.toThrow(
      "Error deleting address"
    );
  });
});

describe("setDefaultAddress", () => {
  test("sends PATCH to set-default endpoint", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ ...mockAddress, is_default: true }),
    });

    const result = await setDefaultAddress(1, TOKEN);
    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain("/addresses/1/set-default");
    expect(result.is_default).toBe(true);
  });

  test("throws on error", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({}),
    });

    await expect(setDefaultAddress(999, TOKEN)).rejects.toThrow(
      "Error setting default address"
    );
  });
});
