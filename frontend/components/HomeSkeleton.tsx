import React from "react";
import { View } from "react-native";
import Animated from "react-native-reanimated";
import ProductCardSkeleton, { useShimmerStyle } from "@/components/ProductCardSkeleton";

/**
 * HomeSkeleton - Full Home screen skeleton layout
 * Uses a single shared shimmer animation for all placeholder elements.
 */
function HomeSkeleton() {
  const shimmerStyle = useShimmerStyle();

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header placeholder */}
      <View className="bg-white px-4 pt-4 pb-3">
        <View className="flex-row items-center justify-between mb-3">
          <View>
            <Animated.View className="h-4 w-24 bg-gray-200 rounded mb-2" style={shimmerStyle} />
            <Animated.View className="h-6 w-40 bg-gray-200 rounded" style={shimmerStyle} />
          </View>
          <Animated.View className="w-10 h-10 rounded-full bg-gray-200" style={shimmerStyle} />
        </View>
        {/* Search bar placeholder */}
        <Animated.View className="h-11 bg-gray-100 rounded-full" style={shimmerStyle} />
      </View>

      {/* Filter chips placeholder */}
      <View className="px-4 pb-1 bg-white">
        <View className="flex-row gap-2 mt-2">
          {[80, 70, 90, 100].map((width, i) => (
            <Animated.View
              key={i}
              className="h-8 bg-gray-100 rounded-full"
              style={[shimmerStyle, { width }]}
            />
          ))}
        </View>
      </View>

      {/* Banner placeholder */}
      <View className="px-4 mt-2">
        <Animated.View
          className="h-36 rounded-3xl bg-gray-200"
          style={shimmerStyle}
        />
      </View>

      {/* Product grid placeholder */}
      <View className="px-3 mt-4">
        <View className="flex-row gap-2 mb-2">
          <ProductCardSkeleton shimmerStyle={shimmerStyle} />
          <ProductCardSkeleton shimmerStyle={shimmerStyle} />
        </View>
        <View className="flex-row gap-2">
          <ProductCardSkeleton shimmerStyle={shimmerStyle} />
          <ProductCardSkeleton shimmerStyle={shimmerStyle} />
        </View>
      </View>
    </View>
  );
}

export default React.memo(HomeSkeleton);
