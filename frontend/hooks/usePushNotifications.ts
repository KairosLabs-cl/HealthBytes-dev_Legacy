import { useState, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import Constants from 'expo-constants';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

// Configura cómo se comportan las notificaciones en primer plano
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export function usePushNotifications() {
  const router = useRouter();
  const { getToken, isSignedIn } = useAuth();
  const [expoPushToken, setExpoPushToken] = useState<string | undefined>();
  const [notification, setNotification] = useState<Notifications.Notification | undefined>();
  const notificationListener = useRef<Notifications.EventSubscription | null>(null);
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  async function registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        console.warn('Failed to get push token for push notification!');
        return;
      }
      // Se requiere el ID del proyecto en el EAS Build (Expo > 50)
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;

      token = (
        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data;
      setExpoPushToken(token);
    } else {
      console.log('Must use physical device for Push Notifications');
    }

    return token;
  }

  useEffect(() => {
    // 1. Configurar y obtener token si el usuario está logueado
    if (isSignedIn) {
      registerForPushNotificationsAsync().then(async (token) => {
        if (token) {
          try {
            const jwt = await getToken();
            await fetch(`${API_URL}/users/me/push-token`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${jwt}`,
              },
              body: JSON.stringify({ token }),
            });
          } catch (error) {
            console.error('Error enviando push token al backend', error);
          }
        }
      });
    }

    // 2. Escuchar notificaciones entrantes cuando la app está en primer plano
    notificationListener.current = Notifications.addNotificationReceivedListener((notification: Notifications.Notification) => {
      setNotification(notification);
    });

    // 3. Manejar interacciones del usuario con las notificaciones (ej. Deep linking)
    responseListener.current = Notifications.addNotificationResponseReceivedListener((response: Notifications.NotificationResponse) => {
      const data = response.notification.request.content.data;
      // Si el payload contiene una url via el backend...
      if (data?.url && typeof data.url === 'string') {
        // Asume esquema de la app (ej: healthbytes://orders/1) -> /orders/1
        const path = data.url.replace(/^healthbytes:\/\//, '/');
        // Redirige
        router.push(path as any);
      }
    });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, [isSignedIn]);

  return {
    expoPushToken,
    notification,
  };
}
