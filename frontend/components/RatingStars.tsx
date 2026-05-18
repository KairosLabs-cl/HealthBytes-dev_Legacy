import { useState } from "react";
import { View, Pressable } from "react-native";
import { Star } from "lucide-react-native";
import { Text } from "@/components/ui/text";

interface RatingStarsProps {
  rating: number;
  maxStars?: number;
  size?: number;
  interactive?: boolean;
  onChange?: (rating: number) => void;
  showCount?: number;
  showFraction?: boolean;
}

export function RatingStars({
  rating,
  maxStars = 5,
  size = 16,
  interactive = false,
  onChange,
  showCount,
  showFraction = false,
}: RatingStarsProps) {
  const [hoverRating, setHoverRating] = useState(0);
  const displayRating = interactive && hoverRating > 0 ? hoverRating : rating;

  const renderStar = (index: number) => {
    const filled = index < Math.floor(displayRating);
    const halfFilled = !filled && index < displayRating;

    if (interactive) {
      return (
        <Pressable
          key={index}
          onPress={() => onChange?.(index + 1)}
          onPressIn={() => setHoverRating(index + 1)}
          onPressOut={() => setHoverRating(0)}
          accessibilityLabel={`${index + 1} de ${maxStars} estrellas`}
          accessibilityRole="button"
        >
          <Star
            size={size}
            fill={filled || halfFilled ? "#FBBF24" : "transparent"}
            color={filled || halfFilled ? "#FBBF24" : "#9CA3AF"}
          />
        </Pressable>
      );
    }

    return (
      <Star
        key={index}
        size={size}
        fill={filled || halfFilled ? "#FBBF24" : "transparent"}
        color={filled || halfFilled ? "#FBBF24" : "#9CA3AF"}
        accessible={false}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      />
    );
  };

  return (
    <View
      className="flex-row items-center gap-1"
      accessible={!interactive}
      accessibilityLabel={
        interactive
          ? undefined
          : `Calificación ${rating.toFixed(1)} de ${maxStars} estrellas`
      }
    >
      {Array.from({ length: maxStars }, (_, i) => renderStar(i))}
      {showFraction && (
        <Text className="text-sm font-bold text-ink-muted ml-1">
          {rating.toFixed(1)}/{maxStars}
        </Text>
      )}
      {showCount !== undefined && !showFraction && (
        <Text className="text-sm text-ink-subtle ml-1">({showCount})</Text>
      )}
    </View>
  );
}
