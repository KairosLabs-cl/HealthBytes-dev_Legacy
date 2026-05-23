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

type Props = {
  shimmerStyle?: ViewStyle;
};

function WishlistSkeletonRow({ shimmerStyle }: Props) {
  const localOpacity = useSharedValue(0.3);

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
        backgroundColor: "white",
        borderRadius: 24,
        borderWidth: 1,
        borderColor: "rgba(226,232,240,0.7)",
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
            backgroundColor: "#e2e8f0",
            flexShrink: 0,
          },
          style,
        ]}
      />

      {/* Info + actions placeholder */}
      <View style={{ flex: 1, paddingHorizontal: 12 }}>
        {/* Name placeholder (2 lines) */}
        <Animated.View style={style}>
          <View className="mb-1 h-3 w-full rounded bg-slate-200" />
          <View className="mb-3 h-3 w-2/3 rounded bg-slate-200" />
        </Animated.View>

        {/* Price placeholder */}
        <Animated.View style={style}>
          <View className="mb-3 h-4 w-16 rounded bg-slate-200" />
        </Animated.View>

        {/* Stock badge placeholder */}
        <Animated.View style={style}>
          <View className="mb-2 h-4 w-14 rounded-full bg-slate-100" />
        </Animated.View>

        {/* Add to cart placeholder */}
        <Animated.View style={style}>
          <View className="h-11 w-full rounded-2xl bg-slate-200" />
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
          <View className="h-4 w-4 rounded bg-slate-200 mt-2" />
        </Animated.View>
      </View>
    </View>
  );
}

export default React.memo(WishlistSkeletonRow);
