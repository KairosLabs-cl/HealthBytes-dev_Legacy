import type { Product } from './product';

export { Product };

export type CartItem = {
  product: Product;
  quantity: number;
};
