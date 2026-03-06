/* Global mocks for test environment */

// Mock @clerk/clerk-expo — tests that need custom behavior can override with jest.mock()
jest.mock("@clerk/clerk-expo", () => ({
  useAuth: () => ({
    isSignedIn: true,
    isLoaded: true,
    userId: "test-user-id",
    getToken: jest.fn().mockResolvedValue("test-token"),
    signOut: jest.fn(),
  }),
  useUser: () => ({
    isLoaded: true,
    isSignedIn: true,
    user: { firstName: "Test", fullName: "Test User" },
  }),
  ClerkProvider: ({ children }: { children: React.ReactNode }) => children,
  ClerkLoaded: ({ children }: { children: React.ReactNode }) => children,
  useSignIn: () => ({ signIn: null, setActive: jest.fn(), isLoaded: true }),
  useSignUp: () => ({ signUp: null, setActive: jest.fn(), isLoaded: true }),
  useOAuth: () => ({ startOAuthFlow: jest.fn() }),
}));

// Mock expo-router (default — tests can override)
jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  useLocalSearchParams: () => ({}),
  useSegments: () => [],
  Link: ({ children }: { children: React.ReactNode }) => children,
  Stack: { Screen: () => null },
  router: { push: jest.fn(), replace: jest.fn() },
}));
