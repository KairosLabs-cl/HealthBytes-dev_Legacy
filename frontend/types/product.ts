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
  dietary_tags?: (DietaryTag | string)[];
  nutritional_info?: string;
};

/** Map of known tag names to display info for when API returns plain strings */
const KNOWN_TAGS: Record<string, { display_name: string; color: string }> = {
  "sin-gluten": { display_name: "Sin gluten", color: "green" },
  "vegano": { display_name: "Vegano", color: "emerald" },
  "sin-lactosa": { display_name: "Sin lactosa", color: "blue" },
  "bajo-en-azucar": { display_name: "Bajo en azúcar", color: "orange" },
  "alto-en-proteina": { display_name: "Alto en proteína", color: "purple" },
  "para-diabeticos": { display_name: "Para diabéticos", color: "red" },
  "para-veganos": { display_name: "Para veganos", color: "emerald" },
};

/** Normalize a raw tag (string or object) into a DietaryTag object */
export function normalizeDietaryTag(raw: DietaryTag | string): DietaryTag {
  if (typeof raw === "string") {
    const known = KNOWN_TAGS[raw];
    return {
      id: 0,
      name: raw,
      display_name: known?.display_name ?? raw,
      color: known?.color ?? undefined,
    };
  }
  // If the backend returned an object with null/missing color, fill from KNOWN_TAGS
  if (!raw.color) {
    const known = KNOWN_TAGS[raw.name];
    return { ...raw, color: known?.color };
  }
  return raw;
}

/** Get the first normalized dietary tag from a product, or null */
export function getFirstTag(product: Product): DietaryTag | null {
  const tags = product.dietary_tags;
  if (!tags || tags.length === 0) return null;
  return normalizeDietaryTag(tags[0]);
}
