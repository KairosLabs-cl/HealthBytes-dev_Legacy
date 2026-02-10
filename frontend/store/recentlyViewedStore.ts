// Barra de navegación de productos vistos recientemente

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Product } from "@/types/product";


type RecentlyViewedState = {
    items: Product[];
    limit: number;
    add: (product: Product) => void;
    remove: (id: Product["id"]) => void;
    clear: () => void;

}

const getKey = (id: Product["id"]) => String(id);

export const useRecentlyViewed = create<RecentlyViewedState>()(
    persist(
        (set, get) => ({
            items: [],
            limit: 4,
            add: (product) => {
                if (!product || product.id === undefined || product.id === null) return;
                const key = getKey(product.id);
                const filtered = get().items.filter((p) => getKey(p.id) !== key);
                set({
                items: [product, ...filtered].slice(0, get().limit),
                });
            },
            remove: (id) => {
                const key = getKey(id);
                set({ items: get().items.filter((p) => getKey(p.id) !== key) });
            },
            clear: () => set({ items: [] }),
            }),
            {
            name: "recently-viewed",
            storage: createJSONStorage(() => AsyncStorage),
            version: 1,
            }
    )
);
