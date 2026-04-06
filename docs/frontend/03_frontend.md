# Auditoría Frontend — HealthBytes (React Native / Expo)

> **Rol**: Frontend Lead Engineer  
> **Fecha**: 2026-04-02  
> **Stack auditado**: React Native 0.81.5 · Expo 54 · Expo Router 6 · Zustand 5 · TanStack React Query 5 · Clerk Expo 2 · Gluestack UI (individual packages) · NativeWind 4

---

## 0. Checklist de cumplimiento de reglas obligatorias (AI-README.md)

| Regla | Estado | Detalle |
|---|---|---|
| Solo `pnpm` permitido | PASS | `packageManager: pnpm@10.26.0` en `package.json`. El Dockerfile usa `npm install -g pnpm` como bootstrap — correcto, no es una dependencia de proyecto. |
| No importar `@gluestack-ui/themed` | PASS | Zero matches en todo el codebase. Todos los imports usan paquetes individuales (`@gluestack-ui/button`, `@gluestack-ui/icon`, etc.). |
| No usar `any` en TypeScript | FAIL | 7 ocurrencias en código de producción (excluido tests y lib de gluestack generada). Ver sección 4. |
| No `console.log` en producción | PARCIAL | La mayoría correctamente envuelta en `if (__DEV__)`, pero hay 5 sin guardia. Ver sección 5. |
| No hardcodear URLs | FAIL | `api/mercadopago.ts` dobla el prefijo `/api/v1`. `useRecommendationsStore` tiene fallback hardcodeado. Ver sección 6. |
| No guardar tokens en localStorage | PASS | Usa `expo-secure-store` via `tokenCache` de Clerk. `authStore` usa `AsyncStorage` solo para datos no sensibles. |
| Validar entrada del usuario | PARCIAL | Ver sección 7. |
| Cleanup en `useEffect` | PARCIAL | 5 `useEffect` con dependencias incompletas o suprimidas. Ver sección 3. |

---

## 1. Arquitectura de State Management

### Mapa de fronteras: Estado Global vs. Server State

```
┌─────────────────────────────────────────────────────────────────┐
│  CLIENTE (Zustand — estado persistente, sin tiempo de expiración)│
│                                                                   │
│  authStore.ts          cartStore.ts           favoritesStore.ts  │
│  ─────────────         ────────────           ───────────────    │
│  · additionalUserData  · items[]              · favorites[]      │
│  · setAuth()           · isAuthenticated      · loadFavorites()  │
│  · clearAdditionalData · authToken (*)        · toggleFavorite() │
│                        · optimistic ops       · clearFavorites() │
│                        · loading sets         ·                  │
│                        · mergeAndSync()                          │
│                                                                   │
│  orderStore.ts         addressStore.ts        preferencesStore   │
│  ──────────────        ───────────────        useRecommendations │
│  · orders[]            · addresses[]          ─────────────────  │
│  · pagination          · defaultAddress       · dietary prefs    │
│  · fetchOrders()       · fetchAddresses()     · fetch() (manual) │
│  · loadMoreOrders()                                              │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  SERVER STATE (TanStack React Query — cache + invalidation)      │
│                                                                   │
│  Uso en screens / componentes:                                   │
│  · ["products", searchTerm]   → search.tsx                      │
│  · ["products", ...filters]   → index.tsx, all-products.tsx     │
│  · ["product", id]            → product/[id].tsx                 │
│  · ["product-rating", id]     → product/[id].tsx (x2 — BUG)    │
│  · ["vendor-products", id]    → product/[id].tsx                 │
│  · ["product-reviews", id]    → product/[id].tsx                 │
│  · ["favorites"]              → wishlist.tsx                     │
│  · ["order", id]              → orders/[id].tsx                  │
│                                                                   │
│  QueryClient config:                                             │
│  · staleTime: 5 min · gcTime: 10 min · retry: 1                 │
└─────────────────────────────────────────────────────────────────┘
```

### Problema estructural: `authToken` en Zustand

**Archivo**: `store/cartStore.ts:22-53`

`cartStore` guarda `authToken: string | null` en memoria Zustand. Esto duplica la fuente de verdad: Clerk ya gestiona el token y proporciona `getToken()` como método reactivo. El store lo recibe via `setAuth(isAuth, token)` desde `_layout.tsx:108`.

**Consecuencias**:
- Si el token expira (Clerk lo rota silenciosamente), `cartStore` tiene un token stale hasta que el usuario se desloguee y reloguee.
- `mergeAndSync()` y `syncWithServer()` usan `state.authToken` directamente, sin re-validar con Clerk.

**Recomendación**: Las acciones del carrito deben recibir `getToken` como argumento (igual que hace `mercadopago.ts`) o el store debe llamar `getToken()` en cada operación autenticada en lugar de confiar en el token cacheado internamente.

---

## 2. Análisis de Re-renders Innecesarios

### 2.1 `listHeader` en `orders.tsx:160` — JSX variable no memoizada

**Archivo**: `app/orders.tsx:160`

```typescript
// MAL: Esta expresión JSX se recalcula en CADA render del componente
const listHeader = (
  <View className="px-4 pt-4">
    ...{filters.map(...)}
    ...{selectedFilter}
    ...{error && ...}
    ...{isLoading && ...}
  </View>
);
```

`listHeader` se pasa como `ListHeaderComponent` a `FlatList`. Cada vez que cualquier estado del componente cambia (incluido `refreshing`, `pollCount`, o cualquier render padre), React recrea el nodo JSX y `FlatList` lo desmonta y remonta. La variable no es `useMemo`.

**Fix**:
```typescript
const listHeader = useMemo(() => (
  <View className="px-4 pt-4">...</View>
), [filters, selectedFilter, error, isLoading, filteredOrders.length, handleFilterPress, clearError]);
```

O, preferiblemente, extraer como componente separado `OrderListHeader` para que React pueda reconciliar internamente sin desmontar.

### 2.2 `useQuery` duplicado para rating en `product/[id].tsx:250-268`

**Archivo**: `app/product/[id].tsx:250-268`

```typescript
// Query 1: con datos
const { data: rating } = useQuery({
  queryKey: ["product-rating", id],
  queryFn: () => getProductRating(id),
  enabled: !!id,
});

// Query 2: IDÉNTICA, solo para extraer `refetchRating`
const { refetch: refetchRating } = useQuery({
  queryKey: ["product-rating", id],
  queryFn: () => getProductRating(id),
  enabled: false,  // <- nunca fetcha
});
```

Aunque TanStack Query deduplicará las requests por `queryKey` idéntico, esto registra **dos observers** en el mismo cache entry. Si el cache se invalida, ambos observers disparan re-renders. La segunda instancia es completamente innecesaria.

**Fix**:
```typescript
const { data: rating, refetch: refetchRating } = useQuery({
  queryKey: ["product-rating", id],
  queryFn: () => getProductRating(id),
  enabled: !!id,
});
```

### 2.3 Selectores Zustand: correctos en general

La mayoría de pantallas usa selectores granulares:
```typescript
const items = useCart((state) => state.items);      // correcto
const subtotal = useCart(selectCartSubtotal);        // memoizado con selector
```

`orders.tsx` usa `useShallow` correctamente para el selector de múltiples campos. `_layout.tsx` hace 4 llamadas `useCart` individuales en lugar de una con `useShallow`, lo que es subóptimo pero no crítico.

---

## 3. Expo Router — Rutas y Protección con Clerk

### 3.1 Estructura de rutas

```
app/
  _layout.tsx          ← Root layout (ClerkProvider, QueryClient, ErrorBoundary)
  (auth)/
    login.tsx          ← Pantalla pública de OAuth
  index.tsx            ← Home (pública)
  product/[id].tsx     ← Producto (pública)
  search.tsx           ← Búsqueda (pública)
  cart.tsx             ← Carrito (pública, pero operaciones requieren auth)
  checkout-v2.tsx      ← Checkout (protegida via AuthGate)
  orders.tsx           ← Pedidos (protegida via AuthGate)
  orders/[id].tsx      ← Detalle pedido (protegida via AuthGate)
  payment/
    pending.tsx        ← Estado pago (protegida via AuthGate)
    success.tsx        ← Éxito (protegida)
    failure.tsx        ← Fallo (protegida)
  profile.tsx          ← Perfil (protegida via AuthGate)
  addresses.tsx        ← Direcciones (protegida via AuthGate)
  wishlist.tsx         ← Favoritos (protegida via AuthGate)
```

### 3.2 Patrón de protección — `AuthGate` component

La app NO usa un grupo de rutas `(protected)/` con guard a nivel de layout. En su lugar usa el componente `<AuthGate>` como wrapper dentro de cada pantalla protegida. Este es un patrón válido pero tiene un trade-off:

**Ventaja**: Granularidad — cada pantalla controla su propio mensaje de redirección.

**Desventaja**: Requiere que cada desarrollador recuerde envolver su pantalla. Es fácil olvidarlo. Un layout guard (con `useAuth` en `_layout`) es más difícil de saltarse accidentalmente.

**Uso correcto de Clerk**: El proyecto usa `useAuth()` y `useOAuth()` de `@clerk/clerk-expo` correctamente. NO hay manipulación manual de tokens JWT. El flujo de login usa `startOAuthFlow()` → `setActive({ session: createdSessionId })`.

### 3.3 Busy-wait loop en login — RIESGO UX

**Archivo**: `app/(auth)/login.tsx:37-48`

```typescript
while (Date.now() - startTime < TIMEOUT_MS) {
  try {
    const token = await getToken?.();
    if (token) {
      router.replace("/");
      return;
    }
  } catch { /* continuar */ }
  await new Promise((r) => setTimeout(r, 150));
}
```

Después de `setActive()`, el código hace polling de `getToken()` cada 150ms hasta 8 segundos para detectar cuándo Clerk propaga el token. Esto es un antipatrón porque:

1. **Desperdicia ciclos de CPU/JS** en el hilo principal durante hasta 8s.
2. **Ignora el estado reactivo de Clerk**: `useAuth().isSignedIn` ya reactualizará cuando la sesión esté activa, y `_layout.tsx` ya escucha `isSignedIn` con `useEffect` para sincronizar el carrito y redirigir.
3. La doble lógica (polling manual en login + `useEffect` en layout) puede causar una navegación doble.

**Recomendación**: Extraer a `useGoogleOAuth()` y confiar en el efecto reactivo del layout:

```typescript
// hooks/useGoogleOAuth.ts
export function useGoogleOAuth() {
  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { createdSessionId, setActive } = await startOAuthFlow({
        redirectUrl: Linking.createURL("/(auth)/login", { scheme: "myapp" }),
      });
      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
        // Clerk propagará isSignedIn reactivamente.
        // _layout.tsx syncCart() se ejecutará automáticamente.
        router.replace("/");
      } else {
        setError("No se pudo completar el inicio de sesión. Intenta de nuevo.");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setIsLoading(false);
    }
  };

  return { handleGoogleLogin, isLoading, error };
}
```

### 3.4 `getToken()` doblado en checkout — defensive but noisy

**Archivo**: `app/checkout-v2.tsx:103-117`

```typescript
let token = await getToken();
if (!token) {
  // Retry token retrieval - Clerk may need to re-authenticate
  token = await getToken();
}
```

Doble llamada a `getToken()` sin delay. Si la primera falla por red, la segunda fallará igual. No es perjudicial pero es código muerto. Mejor: una sola llamada y si falla, redirigir.

---

## 4. Usos de `any` en código de producción

| Archivo | Línea | Contexto | Fix sugerido |
|---|---|---|---|
| `store/authStore.ts` | 11 | `Record<string, any>` para `additionalUserData` | Definir interfaz `AdditionalUserData` con los campos reales del usuario |
| `app/product/[id].tsx` | 272 | `(p: any)` en filter de vendor products | Usar el tipo `Product` de `@/types/product` |
| `app/product/[id].tsx` | 620 | `(review: any)` en map de reviews | Definir `Review` type o usar el de `api/products.ts` |
| `components/FavoriteButton.tsx` | 54 | `(e: any)` en web onClick | `(e: React.MouseEvent) => void` |
| `components/ui/ScreenHeader.tsx` | 11 | `icon?: any` | `icon?: LucideIcon` de `lucide-react-native` |
| `hooks/usePushNotifications.ts` | 105 | `router.push(path as any)` | Usar `Href` type de `expo-router` |
| `app/recently-viewed.tsx` | 25 | `{ item }: { item: any }` en renderItem | Usar `Product` type |

---

## 5. `console` sin guardia `__DEV__`

| Archivo | Línea | Tipo | Fix |
|---|---|---|---|
| `store/useRecommendationsStore.ts` | 36 | `console.error` | Envolver en `if (__DEV__)` |
| `hooks/usePushNotifications.ts` | 50 | `console.warn` | Envolver en `if (__DEV__)` |
| `hooks/usePushNotifications.ts` | 64 | `console.log` | Envolver en `if (__DEV__)` |
| `hooks/usePushNotifications.ts` | 86 | `console.error` | Envolver en `if (__DEV__)` |
| `api/orders.ts` | 29-30 | `console.log` con token info | **Eliminar inmediatamente** — loguea presencia/longitud de token, viola regla "no loguear datos sensibles" |
| `api/mercadopago.ts` | 71, 110 | `console.log` | Envolver en `if (__DEV__)` (ya tienen lógica pero sin guardia) |
| `app/checkout-v2.tsx` | 148 | `console.log("✅ Preference creada:", preference.preference_id)` | Envolver en `if (__DEV__)` (el resto en este archivo sí tiene guardia) |

**Crítico**: `api/orders.ts:29-30` loguea información de autenticación. Aunque no loguea el token completo, es una violación directa de la regla de privacidad del AI-README.

---

## 6. URLs hardcodeadas / doble prefijo `/api/v1`

### Bug crítico: `api/mercadopago.ts:55,95`

```typescript
// EXPO_PUBLIC_API_URL ya incluye /api/v1 (ej: "https://api.healthbytes.com/api/v1")
const API_URL = process.env.EXPO_PUBLIC_API_URL;

// Resultado real: ".../api/v1/api/v1/payments/..."  ← 404 en producción
fetch(`${API_URL}/api/v1/payments/mercadopago/create-preference`, ...)
```

Todos los demás módulos en `api/` usan `${API_URL}/recurso` directamente. Solo `mercadopago.ts` añade manualmente `/api/v1/`. Si `EXPO_PUBLIC_API_URL` es `https://api.healthbytes.com/api/v1`, las URLs de Mercado Pago son 404 garantizados en producción.

**Fix**:
```typescript
// api/mercadopago.ts — líneas 54-55 y 94-95
fetch(`${API_URL}/payments/mercadopago/create-preference`, ...)
fetch(`${API_URL}/payments/mercadopago/payment/${paymentId}`, ...)
```

### Fallback hardcodeado: `store/useRecommendationsStore.ts:26`

```typescript
const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
```

Único lugar del codebase con una URL de localhost como fallback. En producción, si la variable de entorno no está definida, todos los usuarios recibirán requests a `localhost` que fallarán silenciosamente.

**Fix**: Eliminar el fallback. La app debe fallar ruidosamente si la variable de entorno no está configurada (como hace `_layout.tsx` con `publishableKey`).

---

## 7. Bug real: `return` faltante en `search.tsx`

**Archivo**: `app/search.tsx:97-117`

```typescript
if (isLoading) {
  // Esta expresión JSX se evalúa pero NUNCA se retorna.
  // React no la renderiza. La función cae al `return` principal.
  <View className="flex-1 bg-gray-50">
    ...skeleton...
  </View>
  // ← falta `return`
}
```

El skeleton de carga en `SearchScreen` **nunca se muestra**. El usuario ve la lista vacía mientras carga. No hay error en runtime porque JSX sin retorno es JavaScript válido — simplemente se descarta.

**Fix**:
```typescript
if (isLoading) {
  return (
    <View className="flex-1 bg-gray-50">
      ...skeleton...
    </View>
  );
}
```

---

## 8. Bug de tipos: `normalizeStatus` retorna valor fuera del union

**Archivo**: `types/order.ts:72`

```typescript
export type OrderStatus = "unpaid" | "processing" | "shipped" | "delivered" | "returns" | "cancelled";

export function normalizeStatus(status?: string | null): OrderStatus {
  const key = (status ?? "").toString().trim().toLowerCase();
  return STATUS_ALIASES[key] ?? "pending";  // ← "pending" NO está en OrderStatus
}
```

El fallback `"pending"` no es miembro del union `OrderStatus`. TypeScript no detecta esto en la definición porque `STATUS_ALIASES` es `Record<string, OrderStatus>` y el `??` operator retorna el tipo de la derecha como `string`. En runtime, cualquier status no reconocido retornará `"pending"` que no matcheará ninguna entrada de `STATUS_LABELS`, `STATUS_COLORS` o `STATUS_BADGE_COLORS` — causando `undefined` en los lookups.

**Fix**:
```typescript
return STATUS_ALIASES[key] ?? "unpaid";  // "unpaid" es el estado inicial real
```

---

## 9. Componentes con lógica de negocio acoplada — Hooks a extraer

### 9.1 `useCheckout` — extraer de `checkout-v2.tsx`

`app/checkout-v2.tsx` mezcla:
- UI de pasos (step machine)
- Fetch de direcciones en `useEffect`
- Creación de orden (`createOrder`)
- Creación de preferencia MercadoPago (`createMercadoPagoPreference`)
- Manejo de errores
- Apertura de URL externa (`Linking.openURL`)
- Limpieza del carrito post-pago

El componente tiene ~500 líneas. La lógica de orquestación del checkout debería vivir en un hook:

```typescript
// hooks/useCheckout.ts
export function useCheckout() {
  const { getToken } = useAuth();
  const items = useCart((s) => s.items);
  const resetCart = useCart((s) => s.resetCart);
  const subtotal = useCart(selectCartSubtotal);

  const [currentStep, setCurrentStep] = useState<CheckoutStep>("address");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const confirmOrder = async (address: Address, payment: PaymentMethod) => {
    setIsProcessing(true);
    setError(null);
    try {
      const token = await getToken();
      if (!token) throw new Error("Sin sesión");
      
      const order = await createOrder(
        items.map(i => ({ productId: Number(i.product.id), quantity: i.quantity, price: i.product.price })),
        address.id,
        payment
      );
      const preference = await createMercadoPagoPreference(
        { order_id: Number(order.id) },
        getToken
      );
      await resetCart();
      return { orderId: order.id, checkoutUrl: preference.init_point };
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  return { currentStep, setCurrentStep, isProcessing, error, confirmOrder, subtotal };
}
```

**Trade-off de la arquitectura actual**: El componente monolítico es fácil de leer de corrido (todo el flujo visible), pero imposible de testear unitariamente sin renderizar toda la pantalla. El hook extrae la lógica a algo testeable con un simple mock de `useAuth` y `useCart`.

### 9.2 `useOrderStatusPoller` — extraer de `payment/pending.tsx`

`payment/pending.tsx` implementa un poller con `setInterval`, contador de reintentos y cleanup. Es lógica pura sin dependencia de render:

```typescript
// hooks/useOrderStatusPoller.ts
export function useOrderStatusPoller(orderId: string | undefined) {
  const { getToken } = useAuth();
  const router = useRouter();
  const [pollCount, setPollCount] = useState(0);
  const [maxRetriesReached, setMaxRetriesReached] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const checkStatus = useCallback(async () => { ... }, [orderId, getToken, router]);

  useEffect(() => { /* setInterval logic */ }, [checkStatus, maxRetriesReached]);

  return { isChecking, pollCount, maxRetriesReached, checkStatus };
}
```

**Trade-off**: La pantalla actual es un componente de ~156 líneas con lógica bien comentada. La extracción añade un nivel de indirección. El beneficio principal es testabilidad y reutilización (podría usarse también en `orders/[id].tsx`).

### 9.3 `useGoogleOAuth` — extraer de `login.tsx`

Ya detallado en sección 3.3. El componente actual tiene 122 líneas con el busy-wait loop.

### 9.4 `useCartFlyAnimation` — extraer de `product/[id].tsx`

`app/product/[id].tsx` tiene ~80 líneas de lógica de animación fly-to-cart con `Animated`, `useRef` y coordenadas de pantalla. El componente tiene ~680 líneas total y la animación es una feature completamente independiente del renderizado del producto.

---

## 10. Falla silenciosa en `OnboardingModal`

**Archivo**: `components/OnboardingModal.tsx:100`

```typescript
updateDietaryPreferences(...).catch(() => {});
```

Si la actualización de preferencias dietéticas falla, el usuario recibe feedback cero. Las preferencias son el dato más crítico del onboarding en una app de salud. Esta falla silenciosa puede resultar en un usuario con celiaquía o diabetes que ve recomendaciones genéricas porque su perfil no se guardó.

**Fix**:
```typescript
try {
  await updateDietaryPreferences(...);
} catch {
  // Mostrar error inline o toast, y NO llamar onComplete()
  setError("No se pudieron guardar tus preferencias. Intenta de nuevo.");
  return;
}
```

---

## 11. `useEffect` con dependencias suprimidas

| Archivo | Línea | Dependencias faltantes | Riesgo |
|---|---|---|---|
| `app/_layout.tsx` | 123 | `mergeAndSync`, `setAuth`, `loadFavorites`, `clearFavorites` | Bajo — funciones de Zustand y Clerk son estables por referencia |
| `app/checkout-v2.tsx` | 64 | `getToken`, `fetchAddresses` | Bajo — `getToken` de Clerk es estable |
| `app/orders.tsx` | 98 | `selectedFilter` (sí se usa dentro del effect, línea 93) | **Alto** — al cambiar el filtro inicial, el effect no re-ejecuta porque `selectedFilter` no está en deps. El filtro inicial del URL param puede no cargarse correctamente. |
| `app/index.tsx` | 237 | Depende del efecto | Medio |
| `hooks/usePushNotifications.ts` | 117 | `getToken` | Bajo — Clerk garantiza estabilidad |

El caso crítico es `orders.tsx`: `selectedFilter` se usa dentro del effect pero no está en el array de dependencias. Si el usuario llega con un `?filter=shipped` en la URL, el estado inicial se setea correctamente, pero si después cambia y el efecto se re-dispara por otra razón, usará el filtro incorrecto (stale closure).

---

## 12. Inconsistencias en la capa API

| Problema | Archivos afectados |
|---|---|
| Fetch directo sin pasar por capa `api/` | `components/ReviewModal.tsx` (debería usar `getProductReviews` de `api/products.ts`), `hooks/usePushNotifications.ts` (debería usar `api/auth.ts`) |
| URL con doble `/api/v1` | `api/mercadopago.ts:55,95` |
| Fallback localhost hardcodeado | `store/useRecommendationsStore.ts:26` |
| `getAuthHeader` no usado consistentemente | `api/cart.ts` lo usa; otros módulos inline `Authorization: Bearer` |

---

## 13. Resumen de hallazgos por severidad

### CRÍTICO (impacta funcionalidad en producción)
1. **`api/mercadopago.ts`**: doble `/api/v1` — payments son 404 en producción
2. **`app/search.tsx:97`**: `return` faltante — skeleton nunca renderiza
3. **`types/order.ts:72`**: fallback `"pending"` fuera del `OrderStatus` union
4. **`components/OnboardingModal.tsx:100`**: falla silenciosa en guardado de preferencias dietéticas

### ALTO (calidad del código / seguridad)
5. **`api/orders.ts:29-30`**: `console.log` con información de token sin `__DEV__` guard
6. **`store/cartStore.ts:22`**: token cacheado en Zustand puede quedar stale
7. **`app/(auth)/login.tsx:37`**: busy-wait loop de 8s en JS thread principal

### MEDIO (deuda técnica / mantenibilidad)
8. **`app/product/[id].tsx:262`**: `useQuery` duplicado para rating
9. **`app/orders.tsx:160`**: `listHeader` JSX sin `useMemo`
10. **`app/orders.tsx:98`**: `selectedFilter` faltante en `useEffect` deps
11. **`store/useRecommendationsStore.ts:26`**: fallback localhost en producción
12. 4 componentes con lógica de negocio acoplada (ver sección 9)

### BAJO (convenciones)
13. 7 usos de `any` en código de producción (sección 4)
14. 5 `console` sin guard `__DEV__` (sección 5)
15. Inconsistencias en capa `api/` (sección 12)

---

## 14. Lo que funciona bien

- **pnpm exclusivo**: cero uso de npm/yarn en scripts de proyecto
- **Cero imports de `@gluestack-ui/themed`**: migración a paquetes individuales completa
- **Selectores Zustand granulares**: la mayoría de pantallas evita re-renders via selectores atómicos y `useShallow`
- **Optimistic updates con rollback**: `cartStore` implementa el patrón correcto — actualiza UI inmediatamente y hace `syncWithServer()` en caso de error del servidor
- **`throwIfNotOk` centralizado**: manejo de errores HTTP consistente en la capa API
- **`ApiError` class**: errores tipados con status code
- **`tokenCache` via `expo-secure-store`**: tokens de Clerk en almacenamiento seguro
- **`ErrorBoundary`** envuelve toda la app
- **TanStack Query bien configurado**: `staleTime`, `gcTime`, `retry`, `retryDelay` con backoff exponencial
- **`selectCartSubtotal` / `selectCartItemCount`**: selectores exportados y documentados para prevenir re-renders en derivados del carrito
- **Suite de tests verde**: 130/130 tests, 14 suites
