import { useOrders } from "../orderStore";
import * as ordersApi from "@/api/orders";

jest.mock("@/api/orders", () => ({
  getOrders: jest.fn(),
  getOrderById: jest.fn(),
}));

describe("Order Store", () => {
  const initialState = useOrders.getState();

  beforeEach(() => {
    useOrders.setState({ ...initialState, orders: [], error: null, isLoading: false });
    jest.clearAllMocks();
  });

  describe("fetchOrders", () => {
    test("fetches and sets orders", async () => {
      const orders = [
        { id: 1, status: "pending" },
        { id: 2, status: "completed" },
      ];
      (ordersApi.getOrders as jest.Mock).mockResolvedValue(orders);

      await useOrders.getState().fetchOrders("token");

      expect(ordersApi.getOrders).toHaveBeenCalledWith("token", 0, 50);
      expect(useOrders.getState().orders).toEqual(orders);
      expect(useOrders.getState().isLoading).toBe(false);
      expect(useOrders.getState().error).toBeNull();
    });

    test("passes skip and limit params", async () => {
      (ordersApi.getOrders as jest.Mock).mockResolvedValue([]);

      await useOrders.getState().fetchOrders("token", 10, 20);
      expect(ordersApi.getOrders).toHaveBeenCalledWith("token", 10, 20);
    });

    test("sets error on failure", async () => {
      (ordersApi.getOrders as jest.Mock).mockRejectedValue(
        new Error("Network error")
      );

      await useOrders.getState().fetchOrders("token");

      expect(useOrders.getState().error).toBe("Network error");
      expect(useOrders.getState().isLoading).toBe(false);
      expect(useOrders.getState().orders).toEqual([]);
    });

    test("sets loading state during fetch", async () => {
      let resolvePromise: Function;
      (ordersApi.getOrders as jest.Mock).mockReturnValue(
        new Promise((resolve) => {
          resolvePromise = resolve;
        })
      );

      const fetchPromise = useOrders.getState().fetchOrders("token");
      expect(useOrders.getState().isLoading).toBe(true);

      resolvePromise!([]);
      await fetchPromise;
      expect(useOrders.getState().isLoading).toBe(false);
    });
  });

  describe("fetchOrderById", () => {
    test("returns order on success", async () => {
      const order = { id: 5, status: "completed" };
      (ordersApi.getOrderById as jest.Mock).mockResolvedValue(order);

      const result = await useOrders.getState().fetchOrderById(5, "token");

      expect(ordersApi.getOrderById).toHaveBeenCalledWith(5, "token");
      expect(result).toEqual(order);
    });

    test("returns null and sets error on failure", async () => {
      (ordersApi.getOrderById as jest.Mock).mockRejectedValue(
        new Error("Not found")
      );

      const result = await useOrders.getState().fetchOrderById(999, "token");

      expect(result).toBeNull();
      expect(useOrders.getState().error).toBe("Not found");
    });
  });

  describe("clearOrders", () => {
    test("clears orders and error", () => {
      useOrders.setState({
        orders: [{ id: 1 }] as any,
        error: "some error",
      });

      useOrders.getState().clearOrders();

      expect(useOrders.getState().orders).toEqual([]);
      expect(useOrders.getState().error).toBeNull();
    });
  });

  describe("setError / clearError", () => {
    test("setError sets error message", () => {
      useOrders.getState().setError("Test error");
      expect(useOrders.getState().error).toBe("Test error");
    });

    test("clearError clears error", () => {
      useOrders.setState({ error: "existing error" });
      useOrders.getState().clearError();
      expect(useOrders.getState().error).toBeNull();
    });
  });
});
