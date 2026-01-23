import React from 'react';
import { View, DimensionValue } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withRepeat, 
  withTiming,
  Easing
} from 'react-native-reanimated';

interface SkeletonProps {
  width?: DimensionValue;
  height?: number;
  borderRadius?: number;
  className?: string;
}

/**
 * Animated skeleton loader component
 * Provides visual feedback while content is loading
 */
export function SkeletonLoader({ 
  width = '100%', 
  height = 20, 
  borderRadius = 8,
  className = '' 
}: SkeletonProps) {
  const opacity = useSharedValue(0.3);

  React.useEffect(() => {
    opacity.value = withRepeat(
      withTiming(1, { 
        duration: 1000,
        easing: Easing.inOut(Easing.ease)
      }),
      -1,
      true
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        animatedStyle,
        {
          width,
          height,
          borderRadius,
          backgroundColor: '#E1E8ED',
        },
      ]}
      className={className}
    />
  );
}

/**
 * Product Card Skeleton
 * Mimics the ProductListItem layout
 */
export function ProductCardSkeleton() {
  return (
    <View className="p-5 rounded-lg flex-1 bg-white">
      <SkeletonLoader height={240} borderRadius={8} className="mb-6" />
      <SkeletonLoader height={16} width="80%" borderRadius={4} className="mb-2" />
      <View className="flex-row items-center justify-between">
        <SkeletonLoader height={24} width={80} borderRadius={4} />
        <SkeletonLoader height={40} width={40} borderRadius={20} />
      </View>
    </View>
  );
}

/**
 * Product List Skeleton
 * Shows multiple skeleton cards in a grid
 */
interface ProductListSkeletonProps {
  count?: number;
  numColumns?: number;
}

export function ProductListSkeleton({ count = 6, numColumns = 2 }: ProductListSkeletonProps) {
  return (
    <View className="flex-1 px-4">
      <View className="flex-row flex-wrap gap-4">
        {Array.from({ length: count }).map((_, index) => (
          <View 
            key={index} 
            style={{ width: `${(100 / numColumns) - 2}%` }}
          >
            <ProductCardSkeleton />
          </View>
        ))}
      </View>
    </View>
  );
}
