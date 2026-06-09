import React from "react";
import { View, Text } from "react-native";
import type { DietaryTag } from "@/types/product";
import { normalizeDietaryTag } from "@/types/product";

/**
 * Color mapping for dietary tag badges
 * Maps tag colors from API to tailwind classes
 */
const TAG_COLORS: Record<string, { bg: string; text: string }> = {
  green: { bg: "bg-green-100 dark:bg-green-900", text: "text-green-700 dark:text-green-300" },
  blue: { bg: "bg-blue-100 dark:bg-blue-900", text: "text-blue-700 dark:text-blue-300" },
  orange: { bg: "bg-orange-100 dark:bg-orange-900", text: "text-orange-700 dark:text-orange-300" },
  purple: { bg: "bg-purple-100 dark:bg-purple-900", text: "text-purple-700 dark:text-purple-300" },
  red: { bg: "bg-red-100 dark:bg-red-900", text: "text-red-700 dark:text-red-300" },
  emerald: { bg: "bg-emerald-100 dark:bg-emerald-900", text: "text-emerald-700 dark:text-emerald-300" },
  black: { bg: "bg-zinc-900 dark:bg-zinc-700", text: "text-white dark:text-zinc-200" },
  white: { bg: "bg-white dark:bg-zinc-200", text: "text-zinc-900 dark:text-zinc-900" },
};

const DEFAULT_COLORS = { bg: "bg-surface-muted dark:bg-zinc-800", text: "text-ink-muted dark:text-zinc-300" };

interface DietaryBadgeProps {
  tag: DietaryTag;
}

/**
 * DietaryBadge - Displays a dietary restriction badge
 * Uses the color from API or defaults to gray
 */
export const DietaryBadge: React.FC<DietaryBadgeProps> = React.memo(
  ({ tag }) => {
    const colors = TAG_COLORS[tag.color || ""] || DEFAULT_COLORS;

    return (
      <View className={`px-3 py-1 rounded-full ${colors.bg}`}>
        <Text className={`text-xs font-medium ${colors.text}`}>
          {tag.display_name}
        </Text>
      </View>
    );
  }
);

DietaryBadge.displayName = "DietaryBadge";

interface DietaryBadgeListProps {
  tags?: (DietaryTag | string)[];
}

/**
 * DietaryBadgeList - Displays a list of dietary badges
 * Handles string tags, DietaryTag objects, and empty/undefined arrays
 */
export const DietaryBadgeList: React.FC<DietaryBadgeListProps> = React.memo(
  ({ tags }) => {
    if (!tags || tags.length === 0) return null;

    return (
      <View className="flex-row flex-wrap gap-2">
        {tags.map((raw, index) => {
          const tag = normalizeDietaryTag(raw);
          return <DietaryBadge key={tag.id || index} tag={tag} />;
        })}
      </View>
    );
  }
);

DietaryBadgeList.displayName = "DietaryBadgeList";
