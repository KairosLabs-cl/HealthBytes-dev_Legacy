// Barra de navegación de productos vistos recientemente

import { create } from "zustand"; 

export const useRecentlyViewed = create<{
    products: any[];
    addProduct: (product: any) => void;
}>((set, get) => ({
    products: [],
    addProduct: (product) => {
        const products = get().products;
        // Evitar duplicados
        const filtered = products.filter((p) => p.id !== product.id);
        set({ products: [product, ...filtered].slice(0, 4) }); // Mantener solo los últimos 10
    }
}))