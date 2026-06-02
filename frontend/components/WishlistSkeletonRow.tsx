import React, { useEffect } from "react";
import { View, ViewStyle } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { useShimmerStyle } from "@/components/ProductCardSkeleton";
import { useAppTheme } from "@/hooks/useAppTheme";

type Props = {
  shimmerStyle?: ViewStyle;
};

function WishlistSkeletonRow({ shimmerStyle }: Props) {
  const localOpacity = useSharedValue(0.3);
  const { palette } = useAppTheme();

  useEffect(() => {
    if (shimmerStyle) return;
    localOpacity.value = withRepeat(
      withTiming(1, { duration: 800, easing: Easing.ease }),
      -1,
      true
    );
  }, [localOpacity, shimmerStyle]);

  const localAnimatedStyle = useAnimatedStyle(() => ({
    opacity: localOpacity.value,
  }));

  const style = shimmerStyle ?? localAnimatedStyle;

  return (
    <View
      style={{
        backgroundColor: palette.colors.surface.card,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: palette.colors.border.subtle,
        marginHorizontal: 16,
        marginBottom: 10,
        flexDirection: "row",
        alignItems: "center",
        padding: 12,
      }}
    >
      {/* Product image placeholder */}
      <Animated.View
        style={[
          {
            width: 80,
            height: 80,
            borderRadius: 18,
            backgroundColor: palette.colors.surface.elevated,
            flexShrink: 0,
          },
          style,
        ]}
      />

      {/* Info + actions placeholder */}
      <View style={{ flex: 1, paddingHorizontal: 12 }}>
        {/* Name placeholder (2 lines) */}
        <Animated.View style={style}>
          <View className="mb-1 h-3 w-full rounded bg-surface-elevated" />
          <View className="mb-3 h-3 w-2/3 rounded bg-surface-elevated" />
        </Animated.View>

        {/* Price placeholder */}
        <Animated.View style={style}>
          <View className="mb-3 h-4 w-16 rounded bg-surface-elevated" />
        </Animated.View>

        {/* Stock badge placeholder */}
        <Animated.View style={style}>
          <View className="mb-2 h-4 w-14 rounded-full bg-surface-muted" />
        </Animated.View>

        {/* Add to cart placeholder */}
        <Animated.View style={style}>
          <View className="h-11 w-full rounded-2xl bg-surface-elevated" />
        </Animated.View>
      </View>

      {/* Remove button placeholder */}
      <View
        style={{
          width: 44,
          height: 44,
          alignItems: "center",
          justifyContent: "flex-start",
          alignSelf: "flex-start",
        }}
      >
        <Animated.View style={style}>
          <View className="h-4 w-4 rounded bg-surface-elevated mt-2" />
        </Animated.View>
      </View>
    </View>
  );
}

export default React.memo(WishlistSkeletonRow);
