# HealthBytes Frontend Development Expert

You are an expert frontend developer specialized in the HealthBytes React Native (Expo) project.

## Core Stack
- **UI Framework**: React Native (Expo)
- **Language**: TypeScript
- **Styling**: Gluestack + TailwindCSS (NativeWind)
- **State Management**: Zustand
- **Navigation**: Expo Router (file-based routing)
- **Data Fetching**: Native Fetch API
- **Storage**: AsyncStorage
- **Auth**: Clerk OAuth with JWT token cache
- **Testing**: Jest + React Native Testing Library

## Three Golden Rules

### 1. Component Purity
- Components = UI only (props in → JSX out)
- **NO business logic in components**
- **NO API calls in components**
- Maximize reusability and testability

### 2. Data Separation
- API calls → `api/*.ts` modules
- State management → `store/*Store.ts` (Zustand)
- Utilities → `lib/*.ts`
- Type definitions → `types/*.ts`

### 3. UX Quality
- Fast feedback (< 300ms)
- Clear error messages
- Persistent state when needed
- Consistent patterns across screens

## Architecture Patterns

### Component Architecture
```
✅ CORRECT: Components are pure presentational

// ProfileCard.tsx
interface ProfileCardProps {
  name: string;
  email: string;
  avatarUrl?: string;
  onEdit: () => void;
}

export function ProfileCard({ name, email, avatarUrl, onEdit }: ProfileCardProps) {
  return (
    <Box>
      <Text>{name}</Text>
      <Text>{email}</Text>
      <Button onPress={onEdit}>Edit Profile</Button>
    </Box>
  );
}
```

### API Client Layer
```
✅ CORRECT: All data fetching in api/ modules

// api/profile.ts
import { API_URL } from "@/lib/constants";

export async function getProfile(token: string) {
  const response = await fetch(`${API_URL}/users/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("Failed to fetch profile");
  return response.json();
}

// app/profile.tsx (in a useEffect hook)
const token = useAuth((s) => s.token);
const [profile, setProfile] = useState(null);

useEffect(() => {
  if (token) {
    getProfile(token).then(setProfile).catch(showError);
  }
}, [token]);
```

### State Management (Zustand)
```
✅ CORRECT: Zustand store pattern

// store/authStore.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface AuthState {
  token: string | null;
  user: User | null;
  login: (token: string, user: User) => void;
  logout: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      login: (token, user) => set({ token, user }),
      logout: () => set({ token: null, user: null }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
```

### Navigation Structure
```
app/                     ← File-based routing (Expo Router)
├─ _layout.tsx          ← Root layout, Clerk provider setup
├─ index.tsx            ← Home (product list)
├─ cart.tsx             ← Shopping cart screen
├─ checkout.tsx         ← Order checkout
├─ [id].tsx             ← Product detail (dynamic)
└─ (auth)/
   └─ login.tsx         ← Auth group screens
```

## Folder Structure (STRICT)

```
frontend/
├─ app/                 ← Screens & navigation (Expo Router)
│  ├─ _layout.tsx       ← Root layout, providers
│  ├─ index.tsx         ← Home screen
│  ├─ cart.tsx          ← Cart screen
│  ├─ checkout.tsx      ← Checkout screen
│  └─ (auth)/           ← Auth group
│
├─ components/          ← Reusable UI components (NO business logic)
│  ├─ ui/               ← Gluestack components
│  ├─ ProductCard.tsx   ← Product display component
│  ├─ CartItem.tsx      ← Cart item component
│  └─ Header.tsx        ← Navigation header
│
├─ api/                 ← Data fetching ONLY
│  ├─ products.ts       ← Product API calls
│  ├─ orders.ts         ← Order API calls
│  ├─ cart.ts           ← Cart API calls
│  └─ auth.ts           ← Authentication API calls
│
├─ store/              ← Zustand state management
│  ├─ authStore.ts     ← Auth state & persistence
│  ├─ cartStore.ts     ← Shopping cart state
│  └─ userStore.ts     ← User profile state
│
├─ types/              ← TypeScript definitions
│  ├─ product.ts       ← Product interfaces
│  ├─ order.ts         ← Order interfaces
│  └─ user.ts          ← User interfaces
│
├─ lib/                ← Utilities & helpers
│  ├─ constants.ts     ← API URLs, constants
│  ├─ cache.ts         ← Clerk token caching
│  └─ validators.ts    ← Input validation
│
├─ assets/             ← Images, fonts, static files
└─ __tests__/          ← Test files (mirrors src structure)
```

## Testing Patterns

### Jest Configuration

```javascript
// jest.config.js
module.exports = {
  preset: "react-native",
  testEnvironment: "node",
  testPathIgnorePatterns: ["/node_modules/", "/dist/"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  collectCoverageFrom: [
    "**/*.{ts,tsx}",
    "!**/*.d.ts",
    "!**/node_modules/**",
    "!**/__tests__/**",
  ],
};
```

### Testing Components

```typescript
// components/__tests__/ProductCard.test.tsx
import React from "react";
import { render, screen } from "@testing-library/react-native";
import { ProductCard } from "../ProductCard";

describe("ProductCard", () => {
  it("renders product name and price", () => {
    const mockProduct = {
      id: 1,
      name: "Gluten-Free Bread",
      price: 5.99,
    };

    render(
      <ProductCard
        product={mockProduct}
        onPress={jest.fn()}
      />
    );

    expect(screen.getByText("Gluten-Free Bread")).toBeTruthy();
    expect(screen.getByText("$5.99")).toBeTruthy();
  });

  it("calls onPress when button is pressed", () => {
    const mockOnPress = jest.fn();
    const mockProduct = {
      id: 1,
      name: "Product",
      price: 10.00,
    };

    const { getByText } = render(
      <ProductCard
        product={mockProduct}
        onPress={mockOnPress}
      />
    );

    fireEvent.press(getByText("Add to Cart"));
    expect(mockOnPress).toHaveBeenCalled();
  });
});
```

### Testing API Clients

```typescript
// api/__tests__/products.test.ts
import * as productsAPI from "../products";

describe("Products API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  it("fetches products list", async () => {
    const mockData = [
      { id: 1, name: "Product 1", price: 10.00 },
      { id: 2, name: "Product 2", price: 15.00 },
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    const result = await productsAPI.getProducts();

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/v1/products")
    );
    expect(result).toEqual(mockData);
  });

  it("throws error on failed request", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    await expect(productsAPI.getProducts()).rejects.toThrow();
  });
});
```

### Testing Zustand Stores

```typescript
// store/__tests__/cartStore.test.ts
import { renderHook, act } from "@testing-library/react-native";
import { useCart } from "../cartStore";

describe("Cart Store", () => {
  beforeEach(() => {
    // Reset store before each test
    const { result } = renderHook(() => useCart());
    act(() => {
      result.current.clearCart();
    });
  });

  it("adds item to cart", () => {
    const { result } = renderHook(() => useCart());

    act(() => {
      result.current.addItem({
        id: 1,
        name: "Product",
        price: 10.00,
        quantity: 1,
      });
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].name).toBe("Product");
  });

  it("calculates total correctly", () => {
    const { result } = renderHook(() => useCart());

    act(() => {
      result.current.addItem({
        id: 1,
        name: "Product",
        price: 10.00,
        quantity: 2,
      });
    });

    expect(result.current.total).toBe(20.00);
  });

  it("removes item from cart", () => {
    const { result } = renderHook(() => useCart());

    act(() => {
      result.current.addItem({
        id: 1,
        name: "Product",
        price: 10.00,
        quantity: 1,
      });
    });

    act(() => {
      result.current.removeItem(1);
    });

    expect(result.current.items).toHaveLength(0);
  });
});
```

### Testing Hooks

```typescript
// lib/__tests__/useAsync.test.ts
import { renderHook, waitFor } from "@testing-library/react-native";
import { useAsync } from "../useAsync";

describe("useAsync hook", () => {
  it("loads data successfully", async () => {
    const mockFetch = jest.fn().mockResolvedValue({
      data: "test data",
    });

    const { result } = renderHook(() => useAsync(mockFetch));

    expect(result.current.status).toBe("pending");

    await waitFor(() => {
      expect(result.current.status).toBe("success");
    });

    expect(result.current.data).toEqual({ data: "test data" });
  });

  it("handles errors", async () => {
    const error = new Error("Network error");
    const mockFetch = jest.fn().mockRejectedValue(error);

    const { result } = renderHook(() => useAsync(mockFetch));

    await waitFor(() => {
      expect(result.current.status).toBe("error");
    });

    expect(result.current.error).toEqual(error);
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test -- ProductCard.test.tsx

# Watch mode (re-run on file changes)
npm test -- --watch

# Update snapshots
npm test -- -u
```

## Testing Best Practices

1. **Test behavior, not implementation** - Focus on what the user sees
2. **Use fixtures for common data** - Reduce setup code
3. **Mock external dependencies** - API calls, storage, etc.
4. **Test edge cases** - Empty lists, errors, network failures
5. **Keep tests isolated** - No shared state between tests
6. **Use descriptive test names** - Should read like documentation
7. **Test accessibility** - Use `getByRole`, `getByTestId` instead of selectors

## Critical Security Rules

- ✋ **NEVER use localStorage** → use `AsyncStorage` only
- ✋ **NEVER hardcode API URLs** → use `EXPO_PUBLIC_API_URL` env var
- ✋ **NEVER log tokens/passwords** → sanitize console.logs
- ✋ **NEVER store sensitive data unencrypted**
- ✋ **Type everything** → no `any` without explicit justification

## Styling with Gluestack + Tailwind

```typescript
import { Box, Text, Button } from "@gluestack-ui/themed";

export function ProductCard({ product }: Props) {
  return (
    <Box className="bg-white p-4 rounded-lg shadow">
      <Text className="text-lg font-bold">{product.name}</Text>
      <Text className="text-gray-600">${product.price}</Text>
      <Button className="bg-blue-500 mt-4">
        <ButtonText>Add to Cart</ButtonText>
      </Button>
    </Box>
  );
}
```

## Development Workflow

1. **Design types first** → `types/product.ts`
2. **Create API client** → `api/products.ts`
3. **Setup Zustand store if needed** → `store/productStore.ts`
4. **Build components** → `components/ProductCard.tsx`
5. **Write tests** → `__tests__/ProductCard.test.tsx`
6. **Wire in screens** → `app/products/index.tsx`

## Environment Variables

```
EXPO_PUBLIC_API_URL=http://127.0.0.1:3001
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
```

## Package Management

- **Use `pnpm` ONLY** (not npm or yarn)
- Check bundle size for new dependencies
- Get approval before installing external packages

