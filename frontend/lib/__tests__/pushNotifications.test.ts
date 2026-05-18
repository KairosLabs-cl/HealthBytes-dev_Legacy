import {
  getPushRegistrationReadiness,
  notificationUrlToRoute,
} from "@/lib/pushNotifications";

describe("push notification helpers", () => {
  it("blocks remote push registration on web", () => {
    expect(
      getPushRegistrationReadiness({
        platform: "web",
        isDevice: true,
        projectId: "project-id",
        appOwnership: "standalone",
      })
    ).toEqual({ ready: false, reason: "unsupported-platform" });
  });

  it("blocks remote push registration in Expo Go", () => {
    expect(
      getPushRegistrationReadiness({
        platform: "android",
        isDevice: true,
        projectId: "project-id",
        appOwnership: "expo",
      })
    ).toEqual({ ready: false, reason: "expo-go" });
  });

  it("requires a real EAS project id", () => {
    expect(
      getPushRegistrationReadiness({
        platform: "android",
        isDevice: true,
        projectId: "REPLACE_WITH_YOUR_EAS_PROJECT_ID",
        appOwnership: "standalone",
      })
    ).toEqual({ ready: false, reason: "missing-project-id" });
  });

  it("allows Android device registration in a development build", () => {
    expect(
      getPushRegistrationReadiness({
        platform: "android",
        isDevice: true,
        projectId: "real-project-id",
        appOwnership: "standalone",
      })
    ).toEqual({ ready: true });
  });

  it("converts app notification urls into Expo Router paths", () => {
    expect(notificationUrlToRoute("healthbytes://orders/42")).toBe("/orders/42");
    expect(notificationUrlToRoute("/product/7")).toBe("/product/7");
  });
});
