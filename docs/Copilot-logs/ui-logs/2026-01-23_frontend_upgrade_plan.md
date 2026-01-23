# Plan de Actualización y Mejora del Frontend HealthBytes

**Fecha:** 2026-01-23  
**Versión Actual:** Expo 53.0.20 + React Native 0.76.9  
**Objetivo:** Modernizar y optimizar el frontend siguiendo mejores prácticas

---

## 📊 Estado Actual

### Stack Tecnológico
- ✅ **Expo SDK:** 53.0.20 (actualizado recientemente)
- ✅ **React Native:** 0.76.9 (última versión)
- ✅ **React:** 18.3.1
- ✅ **TypeScript:** 5.8.3
- ✅ **Routing:** Expo Router 4.0.21
- ✅ **UI Library:** Gluestack UI + NativeWind (Tailwind)
- ✅ **State Management:** Zustand 5.0.10
- ✅ **Data Fetching:** React Query 5.90.19
- ✅ **Auth:** Clerk Expo 2.19.18

### Problemas Identificados

1. **SafeArea Management:** No hay uso consistente de SafeAreaView
2. **Performance:** Posibles re-renders innecesarios
3. **Error Boundaries:** Falta manejo global de errores
4. **Validación:** No hay runtime validation (Zod)
5. **Testing:** No hay tests implementados
6. **Accessibility:** No hay props de accesibilidad implementadas
7. **Dark Mode:** No implementado a pesar de tenerlo en config
8. **Image Optimization:** No se usa expo-image
9. **Code Splitting:** No hay lazy loading de componentes
10. **Internationalization:** No implementado

---

## 🎯 Plan de Mejoras Prioritarias

### Fase 1: Fundamentos y Seguridad (Alta Prioridad)

#### 1.1 Safe Area Management
**Archivos afectados:**
- `app/_layout.tsx`
- `components/Header.tsx`
- Todos los screens

**Cambios:**
```tsx
// Instalar si falta
pnpm add react-native-safe-area-context

// Envolver app con SafeAreaProvider
// Usar SafeAreaView en screens principales
```

#### 1.2 Error Boundaries
**Nuevo archivo:** `components/ErrorBoundary.tsx`

```tsx
import React from 'react';
import { View, Text, Pressable } from 'react-native';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to error reporting service (Sentry)
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <View className="flex-1 items-center justify-center p-4">
            <Text className="text-xl font-bold mb-2">Algo salió mal</Text>
            <Text className="text-gray-600 mb-4">
              Ocurrió un error inesperado
            </Text>
            <Pressable
              onPress={() => this.setState({ hasError: false })}
              className="bg-black px-6 py-3 rounded-lg"
            >
              <Text className="text-white">Reintentar</Text>
            </Pressable>
          </View>
        )
      );
    }

    return this.props.children;
  }
}
```

#### 1.3 Runtime Validation con Zod
**Instalar:**
```bash
pnpm add zod
```

**Nuevo archivo:** `types/schemas.ts`

```tsx
import { z } from 'zod';

export const ProductSchema = z.object({
  id: z.union([z.string(), z.number()]),
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.number().positive(),
  image: z.string().url(),
  allergens: z.array(z.string()).optional(),
  dietary_tags: z.array(z.string()).optional(),
});

export const OrderSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  total: z.number().positive(),
  status: z.enum(['pending', 'confirmed', 'delivered', 'cancelled']),
  created_at: z.string().datetime(),
});

export type Product = z.infer<typeof ProductSchema>;
export type Order = z.infer<typeof OrderSchema>;
```

### Fase 2: Performance Optimization (Media Prioridad)

#### 2.1 Image Optimization
**Instalar:**
```bash
pnpm add expo-image
```

**Actualizar:** `components/ProductListItem.tsx`
```tsx
import { Image } from 'expo-image';

// Usar con blurhash y placeholder
<Image
  source={{ uri: product.image }}
  placeholder="LEHV6nWB2yk8pyo0adR*.7kCMdnj"
  contentFit="contain"
  transition={200}
/>
```

#### 2.2 Memoización de Componentes
**Archivos a optimizar:**
- `components/ProductListItem.tsx`
- `components/QuickFilters.tsx`
- `components/FavoritesBar.tsx`

```tsx
import { memo, useMemo, useCallback } from 'react';

const ProductListItem = memo(({ product }: Props) => {
  const handlePress = useCallback(() => {
    // navigation logic
  }, [product.id]);
  
  const formattedPrice = useMemo(
    () => formatPrice(product.price),
    [product.price]
  );
  
  return (/* ... */);
});

ProductListItem.displayName = 'ProductListItem';
```

#### 2.3 Code Splitting y Lazy Loading
**Actualizar:** `app/_layout.tsx`

```tsx
import { lazy, Suspense } from 'react';
import { ActivityIndicator } from 'react-native';

const BottomNavBar = lazy(() => import('@/components/ui/NavBarr/BottomNavBar'));

// En render:
<Suspense fallback={<ActivityIndicator />}>
  <BottomNavBar />
</Suspense>
```

### Fase 3: UX/UI Improvements (Media Prioridad)

#### 3.1 Dark Mode Support
**Nuevo archivo:** `lib/useColorScheme.ts`

```tsx
import { useColorScheme as useRNColorScheme } from 'react-native';

export function useColorScheme() {
  return useRNColorScheme() ?? 'light';
}
```

**Actualizar:** `tailwind.config.js`
```js
module.exports = {
  darkMode: 'class',
  // ...
}
```

#### 3.2 Accessibility
**Actualizar componentes con a11y props:**

```tsx
<Pressable
  accessible={true}
  accessibilityRole="button"
  accessibilityLabel={`Añadir ${product.name} al carrito`}
  accessibilityHint="Doble tap para añadir al carrito"
  onPress={handleAddToCart}
>
  <ShoppingCart />
</Pressable>
```

#### 3.3 Loading States Mejorados
**Nuevo componente:** `components/SkeletonLoader.tsx`

```tsx
import { View } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withRepeat, 
  withTiming 
} from 'react-native-reanimated';

interface Props {
  width?: number | string;
  height?: number;
  borderRadius?: number;
}

export function SkeletonLoader({ width = '100%', height = 20, borderRadius = 4 }: Props) {
  const opacity = useSharedValue(0.3);

  React.useEffect(() => {
    opacity.value = withRepeat(
      withTiming(1, { duration: 1000 }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        animatedStyle,
        {
          width,
          height,
          borderRadius,
          backgroundColor: '#E1E8ED',
        },
      ]}
    />
  );
}
```

### Fase 4: Testing (Baja Prioridad)

#### 4.1 Setup Testing Infrastructure
**Instalar:**
```bash
pnpm add -D jest @testing-library/react-native @testing-library/jest-native
```

**Crear:** `jest.config.js`
```js
module.exports = {
  preset: 'jest-expo',
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)'
  ],
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
};
```

#### 4.2 Unit Tests Ejemplo
**Crear:** `__tests__/components/ProductListItem.test.tsx`

```tsx
import { render, fireEvent } from '@testing-library/react-native';
import ProductListItem from '@/components/ProductListItem';

describe('ProductListItem', () => {
  const mockProduct = {
    id: '1',
    name: 'Test Product',
    price: 10.99,
    image: 'https://example.com/image.jpg',
  };

  it('renders product name and price', () => {
    const { getByText } = render(<ProductListItem product={mockProduct} />);
    
    expect(getByText('Test Product')).toBeTruthy();
    expect(getByText('$10.99')).toBeTruthy();
  });

  it('calls addToCart when cart button pressed', () => {
    const { getByRole } = render(<ProductListItem product={mockProduct} />);
    const cartButton = getByRole('button');
    
    fireEvent.press(cartButton);
    // Assert cart state changed
  });
});
```

---

## 📦 Dependencias a Actualizar/Agregar

### Agregar (Nuevas)
```bash
pnpm add expo-image zod react-native-reanimated
pnpm add -D jest @testing-library/react-native @testing-library/jest-native
```

### Actualizar (Si hay versiones nuevas)
```bash
# Verificar actualizaciones
pnpm outdated

# Actualizar selectivamente
pnpm update @clerk/clerk-expo@latest
pnpm update @tanstack/react-query@latest
```

---

## 🗂️ Nueva Estructura de Carpetas Propuesta

```
frontend/
├── app/
│   ├── _layout.tsx
│   ├── index.tsx
│   ├── (auth)/
│   ├── product/
│   └── (tabs)/              # Nuevo: para navegación por tabs
├── components/
│   ├── ui/                  # Componentes base reutilizables
│   │   ├── button/
│   │   ├── card/
│   │   ├── input/
│   │   └── ...
│   ├── features/            # Nuevo: componentes de dominio
│   │   ├── product/
│   │   ├── cart/
│   │   └── auth/
│   ├── layout/              # Nuevo: componentes de layout
│   │   ├── SafeAreaWrapper.tsx
│   │   ├── ErrorBoundary.tsx
│   │   └── SkeletonLoader.tsx
│   └── [feature]*.tsx       # Componentes existentes
├── hooks/                   # Nuevo: custom hooks
│   ├── useProducts.ts
│   ├── useColorScheme.ts
│   └── useAuth.ts
├── lib/
│   ├── cache.ts
│   ├── formatPrice.ts
│   └── validators.ts        # Nuevo: Zod schemas
├── store/
│   ├── cartStore.ts
│   ├── authStore.ts
│   └── recentlyViewedStore.ts
├── types/
│   ├── product.ts
│   ├── schemas.ts           # Nuevo: Zod types
│   └── navigation.ts        # Nuevo: tipos de navegación
├── api/
│   ├── client.ts            # Nuevo: configuración base de fetch
│   ├── products.ts
│   └── orders.ts
└── __tests__/               # Nuevo: tests
    ├── components/
    ├── hooks/
    └── utils/
```

---

## 🚀 Orden de Implementación

### Sprint 1 (Fundamentos - 3 días)
1. ✅ Safe Area Management
2. ✅ Error Boundaries
3. ✅ Runtime Validation (Zod)
4. ✅ Actualizar configuración TypeScript (strict mode)

### Sprint 2 (Performance - 2 días)
5. ✅ Image Optimization (expo-image)
6. ✅ Memoización de componentes
7. ✅ Code splitting básico

### Sprint 3 (UX/UI - 3 días)
8. ✅ Dark mode support
9. ✅ Accessibility props
10. ✅ Loading states mejorados
11. ✅ Skeleton loaders

### Sprint 4 (Testing - 2 días)
12. ✅ Setup testing infrastructure
13. ✅ Unit tests para componentes críticos
14. ✅ Integration tests básicos

---

## ✅ Checklist de Verificación

### Pre-Deploy
- [ ] Todos los componentes tienen tipos TypeScript estrictos (no `any`)
- [ ] Safe areas implementadas en todas las pantallas
- [ ] Error boundaries envuelven rutas principales
- [ ] Images usan expo-image con placeholders
- [ ] Componentes costosos están memoizados
- [ ] Props de accesibilidad en elementos interactivos
- [ ] Tests unitarios pasan (coverage > 70%)
- [ ] No hay console.logs en producción
- [ ] Dark mode funciona correctamente
- [ ] Performance auditado (React DevTools Profiler)

### Post-Deploy
- [ ] Verificar en iOS y Android físicos
- [ ] Probar con screen readers
- [ ] Verificar performance en dispositivos de gama baja
- [ ] Revisar bundle size
- [ ] Monitoring de errores activo (Sentry/similar)

---

## 📚 Referencias

- [Expo SDK 53 Docs](https://docs.expo.dev/)
- [React Native Performance](https://reactnative.dev/docs/performance)
- [Accessibility Best Practices](https://reactnative.dev/docs/accessibility)
- [React Query Best Practices](https://tanstack.com/query/latest/docs/react/guides/optimistic-updates)
- [Zustand Best Practices](https://docs.pmnd.rs/zustand/getting-started/introduction)

---

**Próximos pasos:** Comenzar con Sprint 1 - Implementar Safe Area Management y Error Boundaries.
