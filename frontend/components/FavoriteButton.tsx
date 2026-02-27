import { Pressable, Platform, Alert } from 'react-native';
import { Heart } from 'lucide-react-native';
import { useAuth } from '@clerk/clerk-expo';
import { useFavoritesStore } from '@/store/favoritesStore';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSequence,
    withSpring,
} from 'react-native-reanimated';

interface FavoriteButtonProps {
    productId: number;
    size?: number;
}

export default function FavoriteButton({
    productId,
    size = 24,
}: FavoriteButtonProps) {
    const { getToken } = useAuth();
    const { isFavorite, toggleFavorite } = useFavoritesStore();
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const handlePress = async () => {
        const token = await getToken();
        if (!token) {
            Alert.alert(
                "Inicia sesion",
                "Necesitas iniciar sesion para agregar favoritos."
            );
            return;
        }

        scale.value = withSequence(
            withSpring(1.3, { damping: 10, stiffness: 400 }),
            withSpring(1, { damping: 10, stiffness: 400 })
        );

        await toggleFavorite(productId, token);
    };

    const favorited = isFavorite(productId);

    // For web, we use onClick directly on the element
    const webProps = Platform.OS === 'web' ? {
        onClick: (e: any) => {
            e.preventDefault();
            e.stopPropagation();
            handlePress();
        }
    } : {};

    return (
        <Pressable
            onPress={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handlePress();
            }}
            style={{
                padding: 10,
                borderRadius: 999,
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                minWidth: 44,
                minHeight: 44,
                alignItems: 'center',
                justifyContent: 'center',
            }}
            accessibilityRole="button"
            accessibilityLabel={favorited ? "Quitar de favoritos" : "Agregar a favoritos"}
            {...webProps}
        >
            <Animated.View style={animatedStyle}>
                <Heart
                    size={size}
                    color={favorited ? "#ef4444" : "#6b7280"}
                    fill={favorited ? "#ef4444" : "none"}
                    strokeWidth={2}
                />
            </Animated.View>
        </Pressable>
    );
}
