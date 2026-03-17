import React from "react";
import { render, screen } from "@testing-library/react-native";
import HomeScreen from "../index";
import { useQuery } from "@tanstack/react-query";
import { useRecentlyViewed } from "@/store/recentlyViewedStore";

// Mocks
jest.mock("@tanstack/react-query", () => ({
  useQuery: jest.fn(),
}));

jest.mock("@/store/recentlyViewedStore", () => ({
  useRecentlyViewed: jest.fn(),
}));

jest.mock("@/api/products", () => ({
  listProducts: jest.fn(),
}));

// Mock child components
jest.mock("@/components/Header", () => {
  const React = require("react");
  const { View } = require("react-native");
  const Component = (props: any) =>
    React.createElement(View, { ...props, testID: "header" });
  Component.displayName = "Header";
  return { Header: Component };
});

jest.mock("@/components/ui/text", () => {
  const React = require("react");
  const { Text } = require("react-native");
  return {
    Text: (props: any) => React.createElement(Text, props, props.children),
  };
});

jest.mock("@/components/ProductListItem", () => {
  const React = require("react");
  const { View } = require("react-native");
  const Component = (props: any) =>
    React.createElement(View, { ...props, testID: "product-list-item" });
  Component.displayName = "ProductListItem";
  return Component;
});

jest.mock("@/components/FavoritesBar", () => {
  const React = require("react");
  const { View } = require("react-native");
  const Component = (props: any) =>
    React.createElement(View, props, "FavoritesBar");
  Component.displayName = "FavoritesBar";
  return Component;
});

jest.mock("@/components/RecentlyViewedBar", () => {
  const React = require("react");
  const { View } = require("react-native");
  const Component = (props: any) =>
    React.createElement(View, props, "RecentlyViewedBar");
  Component.displayName = "RecentlyViewedBar";
  return Component;
});

jest.mock("@/components/SectionHeader", () => {
  const React = require("react");
  const { View } = require("react-native");
  const Component = (props: any) =>
    React.createElement(View, props, "SectionHeader");
  Component.displayName = "SectionHeader";
  return Component;
});

const mockProductFiltersStore = {
  dietaryTags: [],
  toggleDietaryTag: jest.fn(),
  setDietaryTags: jest.fn(),
  clearFilters: jest.fn(),
};

jest.mock("@/store/productFiltersStore", () => ({
  useProductFilters: jest.fn().mockImplementation((selector) =>
    typeof selector === "function"
      ? selector(mockProductFiltersStore)
      : mockProductFiltersStore
  ),
}));

const mockPreferencesStore = {
  dietaryPreferences: [],
};

jest.mock("@/store/preferencesStore", () => ({
  usePreferencesStore: jest.fn().mockImplementation((selector) =>
    typeof selector === "function"
      ? selector(mockPreferencesStore)
      : mockPreferencesStore
  ),
}));

const mockFavoritesStore = {
  favoriteIds: new Set(),
  loadFavorites: jest.fn(),
  clearFavorites: jest.fn(),
};

jest.mock("@/store/favoritesStore", () => ({
  useFavoritesStore: jest.fn().mockImplementation((selector) =>
    typeof selector === "function"
      ? selector(mockFavoritesStore)
      : mockFavoritesStore
  ),
}));

jest.mock("@clerk/clerk-expo", () => ({
  useUser: jest.fn(() => ({
    user: { firstName: "Test", fullName: "Test User" },
  })),
  useAuth: jest.fn(() => ({
    isSignedIn: true,
    isLoaded: true,
    getToken: jest.fn().mockResolvedValue("test-token"),
  })),
}));

jest.mock("expo-status-bar", () => ({
  StatusBar: () => null,
}));

jest.mock("react-native-reanimated", () => {
  const { View } = require("react-native");
  return {
    __esModule: true,
    default: {
      View,
      createAnimatedComponent: (c: any) => c,
    },
    useSharedValue: (val: any) => ({ value: val }),
    useAnimatedStyle: () => ({}),
    withTiming: (val: any) => val,
    Easing: { out: (fn: any) => fn, ease: (t: any) => t },
  };
});

jest.mock("@/components/HomeSkeleton", () => () => null);

jest.mock("expo-router", () => ({
  Stack: { Screen: () => null },
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() }),
  useLocalSearchParams: () => ({}),
}));

jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }: any) => children,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock("@/components/ui/utils/use-break-point-value", () => ({
  useBreakpointValue: () => 2,
}));

describe("HomeScreen Structural Test", () => {
  beforeEach(() => {
    (useRecentlyViewed as unknown as jest.Mock).mockReturnValue({ items: [] });
  });

  it("renders a list of products", async () => {
    const mockData = [
      { id: 1, name: "Product 1", image: "url1" },
      { id: 2, name: "Product 2", image: "url2" },
    ];

    (useQuery as jest.Mock).mockReturnValue({
      data: mockData,
      isLoading: false,
      error: null,
      isFetching: false,
    });

    render(<HomeScreen />);

    // Check if products are rendered
    expect(await screen.findAllByTestId("product-list-item")).toHaveLength(2);

    // Check if Header is rendered
    expect(screen.getByTestId("header")).toBeTruthy();
  });
});
