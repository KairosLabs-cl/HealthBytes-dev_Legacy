import { useFavoritesStore } from "@/store/favoritesStore";
import { useAuth } from "@clerk/clerk-expo";
import { Heart } from "lucide-react-native";
import { memo, useCallback, type MouseEvent } from "react";
import { Alert, Platform, Pressable } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from "react-native-reanimated";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface FavoriteButtonProps {
  productId: number;
  size?: number;
}

function FavoriteButton({ productId, size = 24 }: FavoriteButtonProps) {
  const { getToken } = useAuth();
  const reducedMotion = useReducedMotion();
  const favorited = useFavoritesStore((s) => s.favoriteIds.has(productId));
  const toggleFavorite = useFavoritesStore((s) => s.toggleFavorite);
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = useCallback(async () => {
    const token = await getToken();
    if (!token) {
      Alert.alert(
        "Inicia sesion",
        "Necesitas iniciar sesion para agregar favoritos."
      );
      return;
    }

    if (!reducedMotion) {
      scale.value = withSequence(
        withSpring(1.3, { damping: 10, stiffness: 400 }),
        withSpring(1, { damping: 10, stiffness: 400 })
      );
    }

    await toggleFavorite(productId, token);
  }, [getToken, toggleFavorite, productId, scale, reducedMotion]);

  // For web, we use onClick directly on the element
  const webProps =
    Platform.OS === "web"
      ? {
          onClick: (e: MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
            handlePress();
          },
        }
      : {};

  return (
    <Pressable
      onPress={(e) => {
        e.preventDefault();
        e.stopPropagation();
        handlePress();
      }}
      style={{
        padding: 6,
        borderRadius: 999,
        backgroundColor: "rgba(0, 0, 0, 0.65)",
        minWidth: 32,
        minHeight: 32,
        alignItems: "center",
        justifyContent: "center",
      }}
      accessibilityRole="button"
      accessibilityLabel={
        favorited ? "Quitar de favoritos" : "Agregar a favoritos"
      }
      {...webProps}
    >
      <Animated.View style={animatedStyle}>
        <Heart
          size={size}
          color={favorited ? "#ef4444" : "#FFFFFF"}
          fill={favorited ? "#ef4444" : "none"}
          strokeWidth={2}
        />
      </Animated.View>
    </Pressable>
  );
}

export default memo(FavoriteButton);
