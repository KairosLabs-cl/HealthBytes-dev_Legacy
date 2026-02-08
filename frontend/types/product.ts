// Tipos para productos
export type Product = {
  id: string | number;
  name: string;
  price: number;
  image?: string;
  description?: string;
  stock?: number;
  category?: string;
  dietary_tags?: string[];
};