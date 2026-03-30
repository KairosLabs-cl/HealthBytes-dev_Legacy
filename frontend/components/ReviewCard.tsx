import { View, Text, Image } from 'react-native';
import { RatingStars } from './RatingStars';

interface ReviewCardProps {
  userName: string;
  rating: number;
  comment?: string;
  createdAt: string;
  userImage?: string | null;
}

const COLORS = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6'];

const getAvatarColor = (name: string): string => {
  const index = name.charCodeAt(0) % COLORS.length;
  return COLORS[index];
};

const getInitial = (name: string): string => {
  return name.charAt(0).toUpperCase();
};

export function ReviewCard({ userName, rating, comment, createdAt, userImage }: ReviewCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semana${Math.floor(diffDays / 7) > 1 ? 's' : ''}`;
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <View className="bg-white p-4 rounded-2xl mb-3 border border-gray-100 shadow-sm">
      <View className="flex-row gap-3">
        {/* Avatar */}
        {userImage ? (
          <Image
            source={{ uri: userImage }}
            className="w-12 h-12 rounded-full"
          />
        ) : (
          <View 
            className="w-12 h-12 rounded-full items-center justify-center"
            style={{ backgroundColor: getAvatarColor(userName) }}
          >
            <Text className="text-white text-lg font-bold">
              {getInitial(userName)}
            </Text>
          </View>
        )}

        {/* Content */}
        <View className="flex-1">
          {/* Header: Name + Rating */}
          <View className="flex-row items-center justify-between mb-1">
            <Text className="font-bold text-gray-900" numberOfLines={1}>
              {userName}
            </Text>
            <RatingStars rating={rating} size={14} showFraction />
          </View>

          {/* Date */}
          <Text className="text-xs text-ink-subtle mb-2">
            {formatDate(createdAt)}
          </Text>

          {/* Comment */}
          {comment && (
            <Text className="text-sm text-ink-muted leading-snug">
              {comment}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}
