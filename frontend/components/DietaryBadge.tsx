import React from "react";
import { View, Text } from "react-native";
import type { DietaryTag } from "@/types/product";

/**
 * Color mapping for dietary tag badges
 * Maps tag colors from API to tailwind classes
 */
const TAG_COLORS: Record<string, { bg: string; text: string }> = {
  green: { bg: "bg-green-100", text: "text-green-700" },
  blue: { bg: "bg-blue-100", text: "text-blue-700" },
  orange: { bg: "bg-orange-100", text: "text-orange-700" },
  purple: { bg: "bg-purple-100", text: "text-purple-700" },
  red: { bg: "bg-red-100", text: "text-red-700" },
  emerald: { bg: "bg-emerald-100", text: "text-emerald-700" },
};

const DEFAULT_COLORS = { bg: "bg-gray-100", text: "text-gray-700" };

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
  tags?: DietaryTag[];
}

/**
 * DietaryBadgeList - Displays a list of dietary badges
 * Handles empty/undefined arrays gracefully
 */
export const DietaryBadgeList: React.FC<DietaryBadgeListProps> = React.memo(
  ({ tags }) => {
    if (!tags || tags.length === 0) return null;

    return (
      <View className="flex-row flex-wrap gap-2 mb-4">
        {tags.map((tag) => (
          <DietaryBadge key={tag.id} tag={tag} />
        ))}
      </View>
    );
  }
);

DietaryBadgeList.displayName = "DietaryBadgeList";
