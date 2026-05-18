import React from "react";
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";
import ProductDetailsScreen from "../product/[id]";
import { getProductReviews } from "@/api/products";

jest.mock("@/api/products", () => ({
  fetchProductById: jest.fn(() => ({
    id: 7,
    name: "Granola sin gluten",
    price: 4990,
    stock: 8,
    image: "https://example.com/granola.png",
    dietary_tags: [],
  })),
  getProductRating: jest.fn(() => ({ avg_rating: 4.5, review_count: 8 })),
  getProductReviews: jest.fn(
    (_productId: number, _skip: number, limit: number) =>
      Array.from({ length: limit }, (_, index) => ({
        id: index + 1,
        user_name: `Usuario ${index + 1}`,
        rating: 5,
        comment: `Reseña ${index + 1}`,
        created_at: "2026-05-01T00:00:00Z",
      }))
  ),
  listProducts: jest.fn(() => []),
}));

jest.mock("@tanstack/react-query", () => ({
  useQuery: jest.fn((options) => ({
    data: options.queryFn(),
    isLoading: false,
    error: null,
    refetch: jest.fn(),
  })),
}));

jest.mock("@/components/DietaryBadge", () => ({
  DietaryBadgeList: () => null,
}));
jest.mock("@/components/FavoriteButton", () => () => null);
jest.mock("@/components/ProductCard", () => () => null);
jest.mock("@/components/ProductCardSkeleton", () => ({
  useShimmerStyle: () => ({}),
}));
jest.mock("@/components/RatingStars", () => ({
  RatingStars: () => null,
}));
jest.mock("@/components/ReviewCard", () => {
  const React = require("react");
  const { Text } = require("react-native");
  return {
    ReviewCard: ({ comment }: { comment: string }) =>
      React.createElement(Text, null, comment),
  };
});
jest.mock("@/components/ReviewModal", () => () => null);
jest.mock("@/components/StockBadge", () => () => null);
jest.mock("@/components/ui/ScreenHeader", () => ({
  ScreenHeader: () => null,
}));
jest.mock("@/components/ui/image", () => {
  const React = require("react");
  const { Image } = require("react-native");
  return {
    Image: (props: any) => React.createElement(Image, props),
  };
});
jest.mock("@/components/ui/text", () => {
  const React = require("react");
  const { Text } = require("react-native");
  return {
    Text: (props: any) => React.createElement(Text, props, props.children),
  };
});

jest.mock("@/store/cartStore", () => ({
  selectCartItemCount: () => 0,
  useCart: (selector: any) =>
    selector({
      addProduct: jest.fn(),
      decrementProduct: jest.fn(),
      items: [],
    }),
}));
jest.mock("@/store/recentlyViewedStore", () => ({
  useRecentlyViewed: (selector: any) => selector({ add: jest.fn() }),
}));

jest.mock("@clerk/clerk-expo", () => ({
  useAuth: () => ({ isSignedIn: true }),
}));
jest.mock("@shopify/flash-list", () => {
  const React = require("react");
  const { View } = require("react-native");
  return { FlashList: (props: any) => React.createElement(View, props) };
});
jest.mock("expo-router", () => ({
  Stack: { Screen: () => null },
  useLocalSearchParams: () => ({ id: "7" }),
  useRouter: () => ({ push: jest.fn() }),
}));
jest.mock("expo-status-bar", () => ({
  StatusBar: () => null,
}));
jest.mock("lucide-react-native", () => {
  const React = require("react");
  const { View } = require("react-native");
  const Icon = (props: any) => React.createElement(View, props);
  return {
    ChevronRight: Icon,
    Minus: Icon,
    Package: Icon,
    Plus: Icon,
    RefreshCw: Icon,
    ShoppingCart: Icon,
    Store: Icon,
  };
});
jest.mock("react-native-reanimated", () => {
  const { View } = require("react-native");
  return {
    __esModule: true,
    default: {
      View,
      createAnimatedComponent: (component: any) => component,
    },
    cancelAnimation: jest.fn(),
    Easing: {
      back: () => jest.fn(),
      bezier: () => jest.fn(),
      cubic: jest.fn(),
      ease: jest.fn(),
      in: (fn: any) => fn,
      inOut: (fn: any) => fn,
      linear: jest.fn(),
      out: (fn: any) => fn,
    },
    FadeIn: { duration: () => ({}) },
    FadeInUp: { delay: () => ({ duration: () => ({}) }) },
    useAnimatedStyle: () => ({}),
    useSharedValue: (value: any) => ({ value }),
    withDelay: (_delay: number, value: any) => value,
    withSequence: (...values: any[]) => values[values.length - 1],
    withTiming: (value: any) => value,
  };
});
jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }: any) => children,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

describe("Product detail accessibility", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("expands the reviews control instead of exposing a fake button", async () => {
    render(<ProductDetailsScreen />);

    const showReviews = screen.getByLabelText("Ver todas las 8 reseñas");
    expect(showReviews.props.accessibilityRole).toBe("button");
    expect(showReviews.props.accessibilityState).toEqual({ expanded: false });

    fireEvent.press(showReviews);

    await waitFor(() => {
      expect(getProductReviews).toHaveBeenLastCalledWith(7, 0, 8);
      expect(screen.getByText("Reseña 8")).toBeTruthy();
    });
    expect(screen.queryByLabelText("Ver todas las 8 reseñas")).toBeNull();
  });
});
