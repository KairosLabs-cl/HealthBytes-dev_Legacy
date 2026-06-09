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
    <SafeAreaView className="flex-1 bg-surface-warm" edges={["top"]}>
      {/* Header placeholder */}
      <View className="px-5 pt-5 pb-3 bg-surface-warm">
        <Animated.View style={shimmerStyle}>
          <View className="mb-[2px] h-4 w-24 rounded bg-surface-elevated" />
          <View className="mb-3.5 h-7 w-44 rounded-xl bg-surface-elevated" />
        </Animated.View>
        {/* Search bar placeholder */}
        <Animated.View style={shimmerStyle}>
          <View className="h-12 rounded-2xl bg-surface-muted" />
        </Animated.View>
      </View>

      {/* Filter chips placeholder */}
      <View className="bg-surface-warm pb-3">
        <View className="flex-row gap-2 pt-2 px-4">
          {[120, 100, 140, 110].map((width, i) => (
            <Animated.View key={i} style={[shimmerStyle, { width }]}>
              <View className="h-12 w-full rounded-2xl bg-surface-muted" />
            </Animated.View>
          ))}
        </View>
      </View>

      {/* HeroBanner placeholder */}
      <View className="px-4 mt-3 mb-1">
        <Animated.View style={shimmerStyle}>
          <View className="h-[170px] rounded-[28px] bg-surface-elevated" />
        </Animated.View>
      </View>

      {/* Product grid placeholder */}
      <View className="px-4 mt-4">
        <View className="flex-row gap-4 mb-4">
          <View className="flex-1">
            <ProductCardSkeleton shimmerStyle={shimmerStyle} />
          </View>
          <View className="flex-1">
            <ProductCardSkeleton shimmerStyle={shimmerStyle} />
          </View>
        </View>
        <View className="flex-row gap-4">
          <View className="flex-1">
            <ProductCardSkeleton shimmerStyle={shimmerStyle} />
          </View>
          <View className="flex-1">
            <ProductCardSkeleton shimmerStyle={shimmerStyle} />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

export default React.memo(HomeSkeleton);
