import { useEffect, useRef, useState } from "react";
import { Platform } from "react-native";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { useRouter, type Href } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import { updatePushToken } from "@/api/users";
import Constants from "expo-constants";
import { getPushRegistrationReadiness } from "@/lib/pushNotifications";

const PLACEHOLDER_PROJECT_ID = "REPLACE_WITH_YOUR_EAS_PROJECT_ID";
const EXPO_PUSH_TOKEN_PATTERN = /^(ExponentPushToken|ExpoPushToken)\[[^\]]+\]$/;
const ALLOWED_DEEP_LINK_PATTERNS = [/^\/orders\/\d+$/, /^\/product\/\d+$/];

// Configura cómo se comportan las notificaciones en primer plano
// SDK 53+: shouldShowAlert fue eliminado; usar shouldShowBanner y shouldShowList
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

function getEasProjectId(): string | undefined {
  const projectId =
    Constants?.expoConfig?.extra?.eas?.projectId ??
    Constants?.easConfig?.projectId;

  if (!projectId || projectId === PLACEHOLDER_PROJECT_ID) {
    return undefined;
  }

  return projectId;
}

function notificationUrlToSafePath(url: unknown): Href | null {
  if (typeof url !== "string") return null;

  const path = url.replace(/^healthbytes:\/\//, "/");
  if (!ALLOWED_DEEP_LINK_PATTERNS.some((pattern) => pattern.test(path))) {
    return null;
  }

  return path as Href;
}

export function usePushNotifications() {
  const router = useRouter();
  const { getToken, isSignedIn } = useAuth();
  const [expoPushToken, setExpoPushToken] = useState<string | undefined>();
  const [notification, setNotification] = useState<
    Notifications.Notification | undefined
  >();
  const notificationListener = useRef<Notifications.EventSubscription | null>(
    null
  );
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  async function registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }

    const projectId = getEasProjectId();
    const readiness = getPushRegistrationReadiness({
      platform: Platform.OS,
      isDevice: Device.isDevice,
      projectId,
      appOwnership: Constants.appOwnership,
    });

    if (!readiness.ready) {
      return;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      return;
    }

    try {
      const pushTokenString = (
        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data;

      if (EXPO_PUSH_TOKEN_PATTERN.test(pushTokenString)) {
        token = pushTokenString;
        setExpoPushToken(token);
      }
    } catch {
      return;
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
            if (!jwt) return;

            await updatePushToken(jwt, token);
          } catch {
            // Push token sync is best-effort.
          }
        }
      });
    }

    // 2. Escuchar notificaciones entrantes cuando la app está en primer plano
    notificationListener.current =
      Notifications.addNotificationReceivedListener(
        (notification: Notifications.Notification) => {
          setNotification(notification);
        }
      );

    // 3. Manejar interacciones del usuario con las notificaciones (ej. Deep linking)
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener(
        (response: Notifications.NotificationResponse) => {
          const path = notificationUrlToSafePath(
            response.notification.request.content.data?.url
          );
          if (path) {
            router.push(path);
          }
        }
      );

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, [getToken, isSignedIn, router]);

  return {
    expoPushToken,
    notification,
  };
}
