import { useAuthStore } from "../authStore";

describe("authStore persistence", () => {
  it("does not persist access or refresh tokens to AsyncStorage", () => {
    const storeOptions = useAuthStore.persist.getOptions();
    const partializedState = storeOptions.partialize?.({
      accessToken: "access-token",
      refreshToken: "refresh-token",
      setTokens: jest.fn(),
      logout: jest.fn(),
      additionalUserData: { theme: "dark" },
      setAdditionalUserData: jest.fn(),
      clearAdditionalData: jest.fn(),
    });

    expect(partializedState).toEqual({
      additionalUserData: { theme: "dark" },
    });
    expect(JSON.stringify(partializedState)).not.toContain("access-token");
    expect(JSON.stringify(partializedState)).not.toContain("refresh-token");
  });
});
