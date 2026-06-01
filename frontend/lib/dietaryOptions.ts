import {
  Dumbbell,
  Gauge,
  HeartPulse,
  MilkOff,
  Vegan,
  WheatOff,
  type LucideIcon,
} from "lucide-react-native";

export type DietaryOption = {
  slug:
    | "sin-gluten"
    | "vegano"
    | "sin-lactosa"
    | "bajo-en-azucar"
    | "alto-en-proteina"
    | "para-diabeticos";
  label: string;
  description: string;
  icon: LucideIcon;
  testID?: string;
};

export const DIETARY_OPTIONS: DietaryOption[] = [
  {
    slug: "sin-gluten",
    label: "Sin gluten",
    description: "Apto para celíacos",
    icon: WheatOff,
    testID: "tag-celiac",
  },
  {
    slug: "vegano",
    label: "Vegano",
    description: "Sin productos de origen animal",
    icon: Vegan,
    testID: "tag-vegan",
  },
  {
    slug: "sin-lactosa",
    label: "Sin lactosa",
    description: "Apto para intolerantes",
    icon: MilkOff,
  },
  {
    slug: "bajo-en-azucar",
    label: "Bajo en azúcar",
    description: "Reducido en azúcares",
    icon: Gauge,
  },
  {
    slug: "alto-en-proteina",
    label: "Alto en proteína",
    description: "Ideal para deportistas",
    icon: Dumbbell,
  },
  {
    slug: "para-diabeticos",
    label: "Para diabéticos",
    description: "Bajo índice glucémico",
    icon: HeartPulse,
    testID: "tag-diabetic",
  },
];

export const DIETARY_ICON_BY_SLUG = Object.fromEntries(
  DIETARY_OPTIONS.map(({ slug, icon }) => [slug, icon])
) as Record<DietaryOption["slug"], LucideIcon>;

export const VALID_DIETARY_TAGS = new Set<string>(
  DIETARY_OPTIONS.map(({ slug }) => slug)
);
