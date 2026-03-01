import { create } from 'zustand';

type CartAnimationStore = {
  pending: { x: number; y: number } | null;
  trigger: (x: number, y: number) => void;
  clear: () => void;
};

export const useCartAnimation = create<CartAnimationStore>((set) => ({
  pending: null,
  trigger: (x, y) => set({ pending: { x, y } }),
  clear: () => set({ pending: null }),
}));
