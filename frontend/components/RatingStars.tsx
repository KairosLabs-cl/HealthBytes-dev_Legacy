import React from 'react';
import { View, Pressable } from 'react-native';
import { Star } from 'lucide-react-native';
import { Text } from '@/components/ui/text';

interface RatingStarsProps {
  rating: number;
  maxStars?: number;
  size?: number;
  interactive?: boolean;
  onChange?: (rating: number) => void;
  showCount?: number;
}

export function RatingStars({
  rating,
  maxStars = 5,
  size = 16,
  interactive = false,
  onChange,
  showCount,
}: RatingStarsProps) {
  const [hoverRating, setHoverRating] = React.useState(0);
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
        >
          <Star
            size={size}
            fill={filled || halfFilled ? '#FBBF24' : 'transparent'}
            color={filled || halfFilled ? '#FBBF24' : '#9CA3AF'}
          />
        </Pressable>
      );
    }

    return (
      <Star
        key={index}
        size={size}
        fill={filled || halfFilled ? '#FBBF24' : 'transparent'}
        color={filled || halfFilled ? '#FBBF24' : '#9CA3AF'}
      />
    );
  };

  return (
    <View className="flex-row items-center gap-1">
      {Array.from({ length: maxStars }, (_, i) => renderStar(i))}
      {showCount !== undefined && (
        <Text className="text-sm text-gray-500 ml-1">({showCount})</Text>
      )}
    </View>
  );
}
