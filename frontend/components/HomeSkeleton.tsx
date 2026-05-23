import React from "react";
import { View } from "react-native";
import Animated from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import ProductCardSkeleton, {
  useShimmerStyle,
} from "@/components/ProductCardSkeleton";

/**
 * HomeSkeleton - Full Home screen skeleton layout
 * Uses a single shared shimmer animation for all placeholder elements.
 */
function HomeSkeleton() {
  const shimmerStyle = useShimmerStyle();

  return (
    <SafeAreaView className="flex-1 bg-[#fafafa]" edges={["top"]}>
      {/* Header placeholder — matches Header.tsx layout */}
      <View className="bg-[#fafafa] px-4 pt-6 pb-4">
        <Animated.View style={shimmerStyle}>
          <View className="mb-3 h-7 w-44 rounded-xl bg-slate-200" />
        </Animated.View>
        {/* Search bar placeholder */}
        <Animated.View style={shimmerStyle}>
          <View className="h-12 rounded-2xl bg-slate-100" />
        </Animated.View>
      </View>

      {/* Filter chips placeholder — matches 44px minHeight chips */}
      <View className="bg-[#fafafa] px-4 pb-1">
        <View className="flex-row gap-2 mt-2">
          {[80, 70, 90, 100].map((width, i) => (
            <Animated.View key={i} style={[shimmerStyle, { width }]}>
              <View className="h-12 w-full rounded-2xl bg-slate-100" />
            </Animated.View>
          ))}
        </View>
      </View>

      {/* Banner placeholder */}
      <View className="px-4 mt-4">
        <Animated.View style={shimmerStyle}>
          <View className="h-40 rounded-[28px] bg-slate-200" />
        </Animated.View>
      </View>

      {/* Product grid placeholder */}
      <View className="px-4 mt-4">
        <View className="flex-row gap-2 mb-2">
          <ProductCardSkeleton shimmerStyle={shimmerStyle} />
          <ProductCardSkeleton shimmerStyle={shimmerStyle} />
        </View>
        <View className="flex-row gap-2">
          <ProductCardSkeleton shimmerStyle={shimmerStyle} />
          <ProductCardSkeleton shimmerStyle={shimmerStyle} />
        </View>
      </View>
    </SafeAreaView>
  );
}

export default React.memo(HomeSkeleton);
