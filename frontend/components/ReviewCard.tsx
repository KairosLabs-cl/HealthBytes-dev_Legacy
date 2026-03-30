import { View, Text } from 'react-native';
import { RatingStars } from './RatingStars';

interface ReviewCardProps {
  userName: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

export function ReviewCard({ userName, rating, comment, createdAt }: ReviewCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  };

  return (
    <View className="border-b border-gray-100 py-3">
      <View className="flex-row items-center justify-between mb-2">
        <Text className="font-semibold text-gray-900">{userName}</Text>
        <Text className="text-xs text-gray-400">{formatDate(createdAt)}</Text>
      </View>
      <RatingStars rating={rating} size={14} />
      {comment && (
        <Text className="text-sm text-gray-600 mt-2">{comment}</Text>
      )}
    </View>
  );
}
