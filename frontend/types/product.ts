// Tipos para productos

export type DietaryTag = {
  id: number;
  name: string;
  display_name: string;
  color?: string;
};

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
