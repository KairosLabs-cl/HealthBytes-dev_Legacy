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
import { DIETARY_OPTIONS } from "@/lib/dietaryOptions";
import { useAppTheme } from "@/hooks/useAppTheme";

export const DIET_FILTERS = DIETARY_OPTIONS.map(({ label, slug }) => ({
  label,
  tag: slug,
}));

function AnimatedFilterChip({
  label,
  isActive,
  onPress,
}: {
  label: string;
  isActive: boolean;
  onPress: () => void;
}) {
  const { palette } = useAppTheme();
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

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPress={handlePress}
        className="rounded-2xl border px-4 py-3"
        style={{
          minHeight: 48,
          justifyContent: "center",
          backgroundColor: isActive ? colors.ink.primary : colors.surface.card,
          borderColor: isActive ? colors.ink.primary : colors.border.subtle,
          boxShadow: isActive
            ? "0 14px 30px -18px rgba(9,9,11,0.5)"
            : "0 1px 2px rgba(15,23,42,0.03)",
        }}
        accessibilityRole="button"
        accessibilityState={{ selected: isActive }}
      >
        <Text
          className="text-sm font-bold"
          style={{ color: isActive ? colors.ink.inverse : colors.ink.primary }}
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
            isActive={dietaryTags.includes(tag)}
            onPress={() => toggleDietaryTag(tag)}
          />
        ))}
      </ScrollView>
    </View>
  );
});
