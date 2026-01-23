import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { listProducts, fetchProductById } from '@/api/products';
import type { Product } from '@/types/product';

/**
 * Custom hook for fetching products list
 * Implements caching and automatic refetching
 * 
 * @param searchTerm - Optional search term to filter products
 * @returns Query result with products data, loading, and error states
 */
export function useProducts(searchTerm?: string): UseQueryResult<Product[], Error> {
  return useQuery({
    queryKey: ['products', searchTerm],
    queryFn: () => listProducts(searchTerm),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    retry: 2,
    refetchOnWindowFocus: false,
  });
}

/**
 * Custom hook for fetching a single product by ID
 * 
 * @param id - Product ID
 * @returns Query result with product data, loading, and error states
 */
export function useProduct(id: number): UseQueryResult<Product, Error> {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => fetchProductById(id),
    staleTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!id, // Only run query if ID exists
  });
}

/**
 * Custom hook for optimistic product updates
 * Useful for cart operations
 */
export function useProductMutations() {
  // TODO: Implement mutations for create/update/delete operations
  // This will be useful when implementing seller features
  return {};
}
