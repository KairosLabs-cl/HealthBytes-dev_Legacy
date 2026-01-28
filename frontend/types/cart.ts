export type Product = {
  id: string | number;
  name: string;
  price: number;
  description?: string;
  image?: string;
  stock?: number;
};

export type CartItem = {
  product: Product;
  quantity: number;
};
