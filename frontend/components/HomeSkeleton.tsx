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
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      {/* Header placeholder — matches Header.tsx layout */}
      <View className="bg-white px-4 pt-6 pb-4">
        <Animated.View style={shimmerStyle}>
          <View className="h-6 w-40 bg-gray-200 rounded mb-3" />
        </Animated.View>
        {/* Search bar placeholder */}
        <Animated.View style={shimmerStyle}>
          <View className="h-11 bg-gray-100 rounded-full" />
        </Animated.View>
      </View>

      {/* Filter chips placeholder — matches 44px minHeight chips */}
      <View className="px-4 pb-1 bg-white">
        <View className="flex-row gap-2 mt-2">
          {[80, 70, 90, 100].map((width, i) => (
            <Animated.View key={i} style={[shimmerStyle, { width }]}>
              <View className="h-11 w-full bg-gray-100 rounded-full" />
            </Animated.View>
          ))}
        </View>
      </View>

      {/* Banner placeholder */}
      <View className="px-4 mt-4">
        <Animated.View style={shimmerStyle}>
          <View className="h-36 rounded-3xl bg-gray-200" />
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
