import React from "react";
import { View, Pressable } from "react-native";
import { Text } from "@/components/ui/text";
import { DietaryTag } from "@/store/productFiltersStore";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";

export const DIET_FILTERS = [
  { label: "Celiacos", tag: "sin-gluten" },
  { label: "Veganos", tag: "vegano" },
  { label: "Sin lactosa", tag: "sin-lactosa" },
  { label: "Bajo en azucar", tag: "bajo-en-azucar" },
] as const;

function AnimatedFilterChip({
  label,
  isActive,
  onPress,
}: {
  label: string;
  isActive: boolean;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withTiming(0.97, { duration: 80, easing: Easing.out(Easing.ease) }, () => {
      scale.value = withTiming(1, { duration: 150, easing: Easing.out(Easing.ease) });
    });
    onPress();
  };

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPress={handlePress}
        className={`px-4 py-3 rounded-full border ${isActive ? "bg-green-500 border-green-600" : "bg-gray-100 border-gray-200"}`}
        style={{ minHeight: 44 }}
      >
        <Text className={`text-sm font-medium ${isActive ? "text-white" : "text-gray-700"}`}>
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
    <View className="px-4 pb-3 bg-white">
      <View className="flex-row flex-wrap gap-2 mt-2">
        {DIET_FILTERS.map(({ label, tag }) => (
          <AnimatedFilterChip
            key={label}
            label={label}
            isActive={dietaryTags.includes(tag)}
            onPress={() => toggleDietaryTag(tag)}
          />
        ))}
      </View>
    </View>
  );
});
