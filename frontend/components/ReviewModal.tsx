import React, { useState } from 'react';
import { Modal, View, Pressable, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { Text } from '@/components/ui/text';
import { Star } from 'lucide-react-native';
import { useAuth } from '@clerk/clerk-expo';
import { useToast, Toast, ToastTitle, ToastDescription } from '@/components/ui/toast';

interface ReviewModalProps {
  productId: number;
  visible: boolean;
  onClose: () => void;
  onReviewSubmitted: () => void;
}

export default function ReviewModal({ productId, visible, onClose, onReviewSubmitted }: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { getToken, isSignedIn } = useAuth();
  const toast = useToast();

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.show({
        placement: "top",
        duration: 3000,
        render: ({ id }) => (
          <Toast nativeID={"toast-" + id} action="warning" variant="accent">
            <ToastTitle>Atención</ToastTitle>
            <ToastDescription>Por favor selecciona una calificación</ToastDescription>
          </Toast>
        ),
      });
      return;
    }

    if (!isSignedIn) {
      // Debería estar logueado, pero por si acaso
      return;
    }

    setIsSubmitting(true);
    try {
      const token = await getToken();
      const API_BASE = process.env.EXPO_PUBLIC_API_URL;
      
      if (!token) {
        throw new Error('No estas autenticado');
      }
      
      const response = await fetch(`${API_BASE}/products/${productId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rating, comment }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al enviar reseña');
      }

      toast.show({
        placement: "top",
        duration: 3000,
        render: ({ id }) => (
          <Toast nativeID={"toast-" + id} action="success" variant="accent">
            <ToastTitle>¡Gracias!</ToastTitle>
            <ToastDescription>Tu reseña ha sido guardada.</ToastDescription>
          </Toast>
        ),
      });

      setRating(0);
      setComment('');
      onReviewSubmitted();
      onClose();

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      toast.show({
        placement: "top",
        duration: 3000,
        render: ({ id }) => (
          <Toast nativeID={"toast-" + id} action="error" variant="accent">
            <ToastTitle>Error</ToastTitle>
            <ToastDescription>{message}</ToastDescription>
          </Toast>
        ),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal 
      visible={visible} 
      transparent 
      animationType="slide" 
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 justify-end bg-black/50"
      >
        <Pressable 
          className="flex-1" 
          onPress={onClose}
          accessibilityLabel="Cerrar modal"
          accessibilityRole="button"
        />
        <View className="bg-surface-card rounded-t-3xl p-6 pb-12">
          <Text className="text-xl font-bold mb-4 text-center">Calificar Producto</Text>
          
          <View className="flex-row justify-center space-x-2 mb-6 gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Pressable 
                key={star} 
                onPress={() => setRating(star)}
                accessibilityLabel={`${star} de 5 estrellas`}
                accessibilityRole="button"
              >
                <Star 
                  size={32} 
                  color={star <= rating ? "#EAB308" : "#D1D5DB"} 
                  fill={star <= rating ? "#EAB308" : "transparent"} 
                />
              </Pressable>
            ))}
          </View>

          <View className="bg-surface-muted rounded-2xl border border-border-subtle p-4 mb-6">
            <TextInput
              placeholder="¿Qué te pareció el producto? (Opcional)"
              multiline
              numberOfLines={4}
              value={comment}
              onChangeText={setComment}
              className="text-base text-ink"
              style={{ minHeight: 100, textAlignVertical: 'top' }}
              accessibilityLabel="Tu reseña"
              accessibilityHint="Escribe tu opinión sobre el producto"
            />
          </View>

          <View className="flex-row gap-3">
            <Pressable 
              onPress={onClose}
              className="flex-1 bg-surface-muted py-4 rounded-full items-center"
              disabled={isSubmitting}
            >
              <Text className="font-semibold text-ink-muted">Cancelar</Text>
            </Pressable>
            <Pressable 
              onPress={handleSubmit}
              className={`flex-1 py-4 rounded-full items-center ${isSubmitting ? 'bg-green-400' : 'bg-green-600'}`}
              disabled={isSubmitting}
            >
              <Text className="font-bold text-white">
                {isSubmitting ? 'Enviando...' : 'Enviar'}
              </Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
