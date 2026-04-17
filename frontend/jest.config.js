module.exports = {
  preset: "jest-expo",
  setupFiles: ["./jest.setup.env.js"],
  transformIgnorePatterns: [
    "node_modules/(?!.pnpm|((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|@clerk/clerk-expo|@gluestack-ui|lucide-react-native|nativewind|react-native-css-interop|@shopify/flash-list)",
  ],
  collectCoverageFrom: [
    "**/*.{ts,tsx}",
    "!**/*.d.ts",
    "!**/coverage/**",
    "!**/node_modules/**",
    "!**/.expo/**",
    "!**/babel.config.js",
    "!**/jest.config.js",
    "!**/metro.config.js",
    "!**/tailwind.config.js",
  ],
  setupFilesAfterEnv: [
    "@testing-library/jest-native/extend-expect",
    "./jest.setup.ts",
  ],
  testMatch: ["**/__tests__/**/*.{ts,tsx}", "**/?(*.)+(spec|test).{ts,tsx}"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
    "^@react-native-async-storage/async-storage$":
      require.resolve("@react-native-async-storage/async-storage/jest/async-storage-mock"),
  },
};
