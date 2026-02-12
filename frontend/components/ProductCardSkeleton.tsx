import React from "react";
import { View, ViewStyle } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { useEffect } from "react";

type Props = {
  /** Pass a shared animated style to avoid duplicate animation timers */
  shimmerStyle?: ViewStyle;
};

/**
 * ProductCardSkeleton - Animated placeholder matching the redesigned product card
 */
function ProductCardSkeleton({ shimmerStyle }: Props) {
  const localOpacity = useSharedValue(0.3);

  useEffect(() => {
    if (shimmerStyle) return;
    localOpacity.value = withRepeat(
      withTiming(1, { duration: 800, easing: Easing.ease }),
      -1,
      true
    );
  }, [shimmerStyle]);

  const localAnimatedStyle = useAnimatedStyle(() => ({
    opacity: localOpacity.value,
  }));

  const style = shimmerStyle ?? localAnimatedStyle;

  return (
    <View className="flex-1 rounded-2xl border border-gray-100 bg-white overflow-hidden">
      {/* Image placeholder */}
      <Animated.View
        className="w-full bg-gray-200"
        style={[{ aspectRatio: 4 / 3 }, style]}
      />
      {/* Content area */}
      <View className="px-3 pt-2.5 pb-3">
        {/* Rating placeholder */}
        <Animated.View
          className="h-3 bg-gray-200 rounded w-10 mb-1"
          style={style}
        />
        {/* Name placeholder */}
        <Animated.View
          className="h-4 bg-gray-200 rounded w-4/5 mb-1"
          style={style}
        />
        <Animated.View
          className="h-4 bg-gray-200 rounded w-3/5 mb-1.5"
          style={style}
        />
        {/* Tag placeholder */}
        <Animated.View
          className="h-5 bg-gray-100 rounded-full w-20 mb-2"
          style={style}
        />
        {/* Price placeholder */}
        <Animated.View
          className="h-5 bg-gray-200 rounded w-1/3 mb-2.5"
          style={style}
        />
        {/* Button placeholder */}
        <Animated.View
          className="h-10 bg-gray-200 rounded-xl w-full"
          style={style}
        />
      </View>
    </View>
  );
}

export default React.memo(ProductCardSkeleton);

/**
 * Hook to create a shared shimmer animation.
 * Use in parent components that render multiple skeletons.
 */
export function useShimmerStyle() {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(1, { duration: 800, easing: Easing.ease }),
      -1,
      true
    );
  }, []);

  const shimmerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return shimmerStyle;
}
