import React, { useEffect } from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
  withDelay,
  SharedValue,
} from "react-native-reanimated";

type LoadingDotsProps = {
  size?: number;
  color?: string;
  style?: ViewStyle;
};

const Dot = ({
  size,
  color,
  index,
  progress,
}: {
  size: number;
  color: string;
  index: number;
  progress: SharedValue<number>;
}) => {
  // Each dot has its own offset in the 0-1 progress cycle
  const animatedStyle = useAnimatedStyle(() => {
    // Offset progress based on dot index (0, 1, 2)
    // Progress goes from 0 to 1 over 1.2s.
    // We want a dot to glow when its specific phase hits.
    const offset = index * 0.15; // 15% offset per dot
    let shiftedProgress = progress.value - offset;
    if (shiftedProgress < 0) shiftedProgress += 1;

    // Pulse function: peaks around 0.15, baseline 0.3
    let opacity = 0.3;
    if (shiftedProgress < 0.25) {
      // Glow up
      opacity = 0.3 + (shiftedProgress / 0.25) * 0.7;
    } else if (shiftedProgress < 0.5) {
      // Fade down
      opacity = 1 - ((shiftedProgress - 0.25) / 0.25) * 0.7;
    }

    return {
      opacity,
    };
  });

  return (
    <Animated.View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        },
        animatedStyle,
      ]}
    />
  );
};

export function LoadingDots({
  size = 6,
  color = "#ffffff",
  style,
}: LoadingDotsProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration: 1200, easing: Easing.linear }),
      -1,
      false
    );
  }, [progress]);

  return (
    <View style={[styles.container, style]}>
      <Dot size={size} color={color} index={0} progress={progress} />
      <Dot size={size} color={color} index={1} progress={progress} />
      <Dot size={size} color={color} index={2} progress={progress} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
});
