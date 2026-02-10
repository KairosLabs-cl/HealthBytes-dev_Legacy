import { TouchableOpacity, Platform } from 'react-native';
import { Heart } from 'lucide-react-native';
import { useAuth } from '@clerk/clerk-expo';
import { useFavoritesStore } from '@/store/favoritesStore';

interface FavoriteButtonProps {
    productId: number;
    size?: number;
    className?: string;
}

export default function FavoriteButton({
    productId,
    size = 24,
    className = ""
}: FavoriteButtonProps) {
    const { getToken } = useAuth();
    const { isFavorite, toggleFavorite } = useFavoritesStore();

    const handlePress = async () => {
        const token = await getToken();
        if (!token) {
            console.warn('[FavoriteButton] User not authenticated');
            return;
        }

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
        <TouchableOpacity
            onPress={handlePress}
            activeOpacity={0.7}
            style={{
                padding: 8,
                borderRadius: 999,
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
            }}
            {...webProps}
        >
            <Heart
                size={size}
                color={favorited ? "#ef4444" : "#6b7280"}
                fill={favorited ? "#ef4444" : "none"}
                strokeWidth={2}
            />
        </TouchableOpacity>
    );
}
