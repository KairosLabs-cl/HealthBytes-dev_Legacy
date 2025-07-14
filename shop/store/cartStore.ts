//Definimos types para el carrito de compras, ya que Zustand no infiere el tipo de estado
type CartItem = {
    product: {
        name: string;
        price: number;

    };
    quantity: number;
};


type CartState = {
    items: CartItem[];
    addProduct: (product: any) => void;
    reserCart: () => void;
}





import { create } from "zustand";

export const useCart = create<CartState>((set) => ({ //Se hace el llamado al type y eso soluciona el problema
    items: [],

    addProduct: (product: any) => 
        // TODO: if already in cart, increase quantity, else add new item
        set((state) => ({
             items: [...state.items, {product, quantity: 1}],
        })),

    reserCart: () => set({ items: []})
}));

