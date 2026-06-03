import {
  getPushRegistrationReadiness,
  notificationUrlToRoute,
} from "@/lib/pushNotifications";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

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
    expect(notificationUrlToRoute("healthbytes://orders/42")).toBe(
      "/orders/42"
    );
    expect(notificationUrlToRoute("/product/7")).toBe("/product/7");
  });

  it("does not leave production console logs in the push notification hook", () => {
    const hookSource = readFileSync(
      resolve(__dirname, "../../hooks/usePushNotifications.ts"),
      "utf8"
    );

    expect(hookSource).not.toContain("console.log");
  });

  it("does not leave production console warnings in the push notification hook", () => {
    const hookSource = readFileSync(
      resolve(__dirname, "../../hooks/usePushNotifications.ts"),
      "utf8"
    );

    expect(hookSource).not.toContain("console.warn");
  });
});
