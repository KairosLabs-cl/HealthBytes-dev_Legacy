import { useQueries } from "@tanstack/react-query";
import { fetchProductById } from "@/api/products";
import { Product } from "@/types/product";
import { OrderItem } from "@/types/order";
import { useMemo } from "react";

/**
 * Fetches product details for all items in an order.
 * Leverages react-query cache so previously viewed products resolve instantly.
 * Returns a Map for O(1) lookups by product_id.
 */
export function useOrderProductDetails(items: OrderItem[] | undefined) {
  const queries = useQueries({
    queries: (items ?? []).map((item) => ({
      queryKey: ["product", Number(item.product_id)],
      queryFn: () => fetchProductById(Number(item.product_id)),
      staleTime: 5 * 60 * 1000, // 5 minutes
      enabled: !!item.product_id,
    })),
  });

  const productMap = useMemo(() => {
    const map = new Map<number, Product>();
    (items ?? []).forEach((item, index) => {
      const query = queries[index];
      if (query?.data) {
        map.set(Number(item.product_id), query.data);
      }
    });
    return map;
  }, [items, queries]);

  const isLoading = queries.some((q) => q.isLoading);

  return { productMap, isLoading };
}
