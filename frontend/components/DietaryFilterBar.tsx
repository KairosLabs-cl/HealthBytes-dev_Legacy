import { Text } from "@/components/ui/text";
import { DietaryTag } from "@/store/productFiltersStore";
import React from "react";
import { Pressable, ScrollView, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { DIETARY_OPTIONS, DIETARY_ICON_BY_SLUG } from "@/lib/dietaryOptions";
import { useAppTheme } from "@/hooks/useAppTheme";

export const DIET_FILTERS = DIETARY_OPTIONS.map(({ label, slug }) => ({
  label,
  tag: slug,
}));

function AnimatedFilterChip({
  label,
  tag,
  isActive,
  onPress,
}: {
  label: string;
  tag: string;
  isActive: boolean;
  onPress: () => void;
}) {
  const { palette, isDark } = useAppTheme();
  const { colors } = palette;
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withTiming(
      0.97,
      { duration: 80, easing: Easing.out(Easing.ease) },
      () => {
        scale.value = withTiming(1, {
          duration: 150,
          easing: Easing.out(Easing.ease),
        });
      }
    );
    onPress();
  };

  const TagIcon = DIETARY_ICON_BY_SLUG[tag as keyof typeof DIETARY_ICON_BY_SLUG];

  const getDietaryColors = (slug: string, isDark: boolean) => {
    const map: Record<string, any> = {
      "sin-gluten": isDark ? { bg: "#7C2D12", text: "#FB923C", border: "#9A3412" } : { bg: "#FFF7ED", text: "#C2410C", border: "#FDBA74" },
      vegano: isDark ? { bg: "#064E3B", text: "#34D399", border: "#065F46" } : { bg: "#ECFDF5", text: "#059669", border: "#6EE7B7" },
      "sin-lactosa": isDark ? { bg: "#1E3A8A", text: "#60A5FA", border: "#1E40AF" } : { bg: "#EFF6FF", text: "#1D4ED8", border: "#93C5FD" },
      "bajo-en-azucar": isDark ? { bg: "#4C1D95", text: "#A78BFA", border: "#5B21B6" } : { bg: "#FAF5FF", text: "#7E22CE", border: "#D8B4FE" },
      "alto-en-proteina": isDark ? { bg: "#7F1D1D", text: "#F87171", border: "#991B1B" } : { bg: "#FEF2F2", text: "#DC2626", border: "#FCA5A5" },
      "para-diabeticos": isDark ? { bg: "#064E3B", text: "#34D399", border: "#065F46" } : { bg: "#F0FDF4", text: "#16A34A", border: "#86EFAC" },
    };
    return map[slug] || (isDark ? { bg: "#27272A", text: "#E4E4E7", border: "#3F3F46" } : { bg: "#FFFFFF", text: "#18181B", border: "#E4E4E7" });
  };

  const c = getDietaryColors(tag, isDark);

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPress={handlePress}
        className="rounded-2xl border px-4 py-3 flex-row items-center gap-2"
        style={{
          minHeight: 48,
          justifyContent: "center",
          backgroundColor: isActive ? c.bg : colors.surface.card,
          borderColor: isActive ? c.border : colors.border.subtle,
          boxShadow: isActive
            ? "0 4px 12px -4px rgba(0,0,0,0.1)"
            : "0 1px 2px rgba(15,23,42,0.03)",
        }}
        accessibilityRole="button"
        accessibilityState={{ selected: isActive }}
      >
        {TagIcon && (
          <TagIcon size={16} color={isActive ? c.text : colors.icon.primary} />
        )}
        <Text
          className="text-sm font-bold"
          style={{ color: isActive ? c.text : colors.ink.primary }}
        >
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

interface DietaryFilterBarProps {
  dietaryTags: DietaryTag[];
  toggleDietaryTag: (tag: DietaryTag) => void;
}

export default React.memo(function DietaryFilterBar({
  dietaryTags,
  toggleDietaryTag,
}: DietaryFilterBarProps) {
  return (
    <View className="bg-surface-warm pb-3">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, gap: 8 }}
      >
        {DIET_FILTERS.map(({ label, tag }) => (
          <AnimatedFilterChip
            key={label}
            label={label}
            tag={tag}
            isActive={dietaryTags.includes(tag)}
            onPress={() => toggleDietaryTag(tag)}
          />
        ))}
      </ScrollView>
    </View>
  );
});
