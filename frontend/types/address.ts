// Types for Address management

export type Address = {
  id: number;
  user_id: string;
  street: string;
  street_number?: string;
  city: string;
  region: string;
  postal_code: string;
  country: string;
  is_default: boolean;
  is_active: boolean;
  label?: string;
  recipient_name?: string;
  phone?: string;
  created_at?: string;
  updated_at?: string;
};

export type AddressCreate = {
  street: string;
  street_number?: string;
  city: string;
  region: string;
  postal_code: string;
  country?: string; // Default: "CL" (ISO 3166-1 alpha-2)
  label?: string;
  recipient_name?: string;
  phone?: string;
  is_default?: boolean;
};

export type AddressListResponse = {
  addresses: Address[];
  total: number;
  default_address_id: number | null;
};

export type AddressUpdate = Partial<AddressCreate>;

// Chile regions for validation/dropdown
export const CHILE_REGIONS = [
  "Arica y Parinacota",
  "Tarapacá",
  "Antofagasta",
  "Atacama",
  "Coquimbo",
  "Valparaíso",
  "Metropolitana de Santiago",
  "O'Higgins",
  "Maule",
  "Ñuble",
  "Biobío",
  "Araucanía",
  "Los Ríos",
  "Los Lagos",
  "Aysén",
  "Magallanes y Antártica Chilena",
] as const;

export type ChileRegion = (typeof CHILE_REGIONS)[number];
