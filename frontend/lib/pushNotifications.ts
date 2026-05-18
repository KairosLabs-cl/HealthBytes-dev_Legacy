import type { PlatformOSType } from "react-native";

type AppOwnership = "expo" | "standalone" | "guest" | null | undefined;

export type PushRegistrationBlockedReason =
  | "unsupported-platform"
  | "expo-go"
  | "physical-device-required"
  | "missing-project-id";

export type PushRegistrationReadiness =
  | { ready: true }
  | { ready: false; reason: PushRegistrationBlockedReason };

export function getPushRegistrationReadiness({
  platform,
  isDevice,
  projectId,
  appOwnership,
}: {
  platform: PlatformOSType;
  isDevice: boolean;
  projectId?: string | null;
  appOwnership?: AppOwnership;
}): PushRegistrationReadiness {
  if (platform === "web") {
    return { ready: false, reason: "unsupported-platform" };
  }

  if (appOwnership === "expo") {
    return { ready: false, reason: "expo-go" };
  }

  if (!isDevice) {
    return { ready: false, reason: "physical-device-required" };
  }

  if (!projectId || projectId === "REPLACE_WITH_YOUR_EAS_PROJECT_ID") {
    return { ready: false, reason: "missing-project-id" };
  }

  return { ready: true };
}

export function notificationUrlToRoute(url: unknown): string | null {
  if (typeof url !== "string" || url.length === 0) {
    return null;
  }

  if (url.startsWith("/")) {
    return url;
  }

  if (url.startsWith("healthbytes://")) {
    return url.replace(/^healthbytes:\/\//, "/");
  }

  return null;
}
