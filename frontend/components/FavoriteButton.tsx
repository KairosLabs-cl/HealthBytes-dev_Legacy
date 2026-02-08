import { Pressable } from 'react-native';
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

    const handlePress = async (e: any) => {
        console.log('[FavoriteButton] Button pressed!', productId);
        // Prevent the click from triggering the parent Link
        e?.preventDefault?.();
        e?.stopPropagation?.();

        const token = await getToken();
        if (!token) {
            console.warn('[FavoriteButton] User not authenticated');
            return;
        }

        console.log('[FavoriteButton] Calling toggleFavorite');
        await toggleFavorite(productId, token);
    };

    const favorited = isFavorite(productId);
    console.log('[FavoriteButton] Render - Product:', productId, 'Is favorite:', favorited);

    return (
        <Pressable
            onPress={handlePress}
            className={`p-2 rounded-full bg-white/80 backdrop-blur ${className}`}
            hitSlop={8}
        >
            <Heart
                size={size}
                color={favorited ? "#ef4444" : "#6b7280"}
                fill={favorited ? "#ef4444" : "none"}
                strokeWidth={2}
            />
        </Pressable>
    );
}
