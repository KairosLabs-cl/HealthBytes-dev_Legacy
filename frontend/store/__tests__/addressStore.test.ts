import { useAddress } from "../addressStore";
import * as addressApi from "@/api/addresses";

jest.mock("@/api/addresses", () => ({
  fetchAddresses: jest.fn(),
  createAddress: jest.fn(),
  updateAddress: jest.fn(),
  deleteAddress: jest.fn(),
  setDefaultAddress: jest.fn(),
}));

const TOKEN = "test-token";

const mockAddress = (overrides = {}) => ({
  id: 1,
  user_id: "user_test_1",
  street: "Av. Providencia 123",
  city: "Santiago",
  region: "Metropolitana",
  postal_code: "7500000",
  country: "CL",
  phone: "+56912345678",
  is_default: false,
  is_active: true,
  ...overrides,
});

describe("Address Store", () => {
  const initialState = useAddress.getState();

  beforeEach(() => {
    useAddress.setState({
      ...initialState,
      addresses: [],
      defaultAddress: null,
      error: null,
      isLoading: false,
    });
    jest.clearAllMocks();
  });

  describe("fetchAddresses", () => {
    test("fetches and sets addresses with default", async () => {
      const addr1 = mockAddress({ id: 1, is_default: false });
      const addr2 = mockAddress({ id: 2, is_default: true });
      (addressApi.fetchAddresses as jest.Mock).mockResolvedValue({
        addresses: [addr1, addr2],
      });

      await useAddress.getState().fetchAddresses(TOKEN);

      expect(useAddress.getState().addresses).toHaveLength(2);
      expect(useAddress.getState().defaultAddress).toEqual(addr2);
      expect(useAddress.getState().isLoading).toBe(false);
    });

    test("sets defaultAddress to null when none is default", async () => {
      (addressApi.fetchAddresses as jest.Mock).mockResolvedValue({
        addresses: [mockAddress({ is_default: false })],
      });

      await useAddress.getState().fetchAddresses(TOKEN);
      expect(useAddress.getState().defaultAddress).toBeNull();
    });

    test("sets error on failure and re-throws", async () => {
      (addressApi.fetchAddresses as jest.Mock).mockRejectedValue(
        new Error("Network error")
      );

      await expect(useAddress.getState().fetchAddresses(TOKEN)).rejects.toThrow(
        "Network error"
      );
      expect(useAddress.getState().error).toBe("Network error");
      expect(useAddress.getState().isLoading).toBe(false);
    });
  });

  describe("createAddress", () => {
    test("adds new address to list", async () => {
      const newAddr = mockAddress({ id: 5, street: "Nueva 456" });
      (addressApi.createAddress as jest.Mock).mockResolvedValue(newAddr);

      const result = await useAddress
        .getState()
        .createAddress({ street: "Nueva 456" } as any, TOKEN);

      expect(result).toEqual(newAddr);
      expect(useAddress.getState().addresses).toHaveLength(1);
      expect(useAddress.getState().addresses[0]).toEqual(newAddr);
    });

    test("first address becomes default", async () => {
      const firstAddr = mockAddress({ id: 1 });
      (addressApi.createAddress as jest.Mock).mockResolvedValue(firstAddr);

      await useAddress.getState().createAddress({} as any, TOKEN);

      expect(useAddress.getState().defaultAddress).toEqual(firstAddr);
    });

    test("second address does not change default", async () => {
      const existingDefault = mockAddress({ id: 1, is_default: true });
      useAddress.setState({
        addresses: [existingDefault],
        defaultAddress: existingDefault,
      });

      const secondAddr = mockAddress({ id: 2 });
      (addressApi.createAddress as jest.Mock).mockResolvedValue(secondAddr);

      await useAddress.getState().createAddress({} as any, TOKEN);

      expect(useAddress.getState().defaultAddress).toEqual(existingDefault);
      expect(useAddress.getState().addresses).toHaveLength(2);
    });

    test("sets error on failure", async () => {
      (addressApi.createAddress as jest.Mock).mockRejectedValue(
        new Error("Validation error")
      );

      await expect(
        useAddress.getState().createAddress({} as any, TOKEN)
      ).rejects.toThrow("Validation error");
      expect(useAddress.getState().error).toBe("Validation error");
    });
  });

  describe("updateAddress", () => {
    test("updates address in list", async () => {
      const addr = mockAddress({ id: 1, street: "Old Street" });
      useAddress.setState({ addresses: [addr] });

      const updated = { ...addr, street: "New Street" };
      (addressApi.updateAddress as jest.Mock).mockResolvedValue(updated);

      const result = await useAddress
        .getState()
        .updateAddress(1, { street: "New Street" } as any, TOKEN);

      expect(result.street).toBe("New Street");
      expect(useAddress.getState().addresses[0].street).toBe("New Street");
    });

    test("updates defaultAddress if updated address is default", async () => {
      const addr = mockAddress({ id: 1, is_default: true });
      useAddress.setState({ addresses: [addr], defaultAddress: addr });

      const updated = { ...addr, street: "Updated", is_default: true };
      (addressApi.updateAddress as jest.Mock).mockResolvedValue(updated);

      await useAddress
        .getState()
        .updateAddress(1, { street: "Updated" } as any, TOKEN);

      expect(useAddress.getState().defaultAddress?.street).toBe("Updated");
    });
  });

  describe("deleteAddress", () => {
    test("removes address from list", async () => {
      const addr1 = mockAddress({ id: 1 });
      const addr2 = mockAddress({ id: 2 });
      useAddress.setState({ addresses: [addr1, addr2] });
      (addressApi.deleteAddress as jest.Mock).mockResolvedValue(undefined);

      await useAddress.getState().deleteAddress(1, TOKEN);

      expect(useAddress.getState().addresses).toHaveLength(1);
      expect(useAddress.getState().addresses[0].id).toBe(2);
    });

    test("clears defaultAddress if deleted", async () => {
      const addr = mockAddress({ id: 1, is_default: true });
      useAddress.setState({ addresses: [addr], defaultAddress: addr });
      (addressApi.deleteAddress as jest.Mock).mockResolvedValue(undefined);

      await useAddress.getState().deleteAddress(1, TOKEN);

      expect(useAddress.getState().defaultAddress).toBeNull();
      expect(useAddress.getState().addresses).toHaveLength(0);
    });

    test("keeps defaultAddress if different address deleted", async () => {
      const defaultAddr = mockAddress({ id: 1, is_default: true });
      const otherAddr = mockAddress({ id: 2 });
      useAddress.setState({
        addresses: [defaultAddr, otherAddr],
        defaultAddress: defaultAddr,
      });
      (addressApi.deleteAddress as jest.Mock).mockResolvedValue(undefined);

      await useAddress.getState().deleteAddress(2, TOKEN);

      expect(useAddress.getState().defaultAddress).toEqual(defaultAddr);
    });
  });

  describe("setDefaultAddress", () => {
    test("updates all addresses and sets new default", async () => {
      const addr1 = mockAddress({ id: 1, is_default: true });
      const addr2 = mockAddress({ id: 2, is_default: false });
      useAddress.setState({
        addresses: [addr1, addr2],
        defaultAddress: addr1,
      });

      const updatedAddr2 = { ...addr2, is_default: true };
      (addressApi.setDefaultAddress as jest.Mock).mockResolvedValue(
        updatedAddr2
      );

      await useAddress.getState().setDefaultAddress(2, TOKEN);

      const addresses = useAddress.getState().addresses;
      expect(addresses.find((a) => a.id === 1)?.is_default).toBe(false);
      expect(addresses.find((a) => a.id === 2)?.is_default).toBe(true);
      expect(useAddress.getState().defaultAddress).toEqual(updatedAddr2);
    });
  });

  describe("helpers", () => {
    test("getDefaultAddress returns default", () => {
      const addr = mockAddress({ id: 1, is_default: true });
      useAddress.setState({ defaultAddress: addr });
      expect(useAddress.getState().getDefaultAddress()).toEqual(addr);
    });

    test("clearAddresses resets state", () => {
      useAddress.setState({
        addresses: [mockAddress()],
        defaultAddress: mockAddress(),
        error: "some error",
      });

      useAddress.getState().clearAddresses();

      expect(useAddress.getState().addresses).toEqual([]);
      expect(useAddress.getState().defaultAddress).toBeNull();
      expect(useAddress.getState().error).toBeNull();
    });

    test("setError and clearError work", () => {
      useAddress.getState().setError("test error");
      expect(useAddress.getState().error).toBe("test error");

      useAddress.getState().clearError();
      expect(useAddress.getState().error).toBeNull();
    });
  });
});
