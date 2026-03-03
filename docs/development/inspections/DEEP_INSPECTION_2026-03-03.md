# HealthBytes — Inspección Profunda del Proyecto

> **Fecha**: 2026-03-03  
> **Contexto**: Follow-up del Staff Engineer Review (2026-03-02, score 65/100). Verificación de fixes aplicados + nuevos bugs críticos descubiertos en producción web.  
> **Metodología**: Análisis de código fuente, ejecución de test suites, revisión de CI, observación de comportamiento en browser.

---

## 📈 Nivel de Madurez: **73 / 100** (+8 vs review anterior)

| Dimensión | Score anterior | Score actual | Δ | Estado |
|---|---|---|---|---|
| Arquitectura del código | 78 | 80 | +2 | 3 capas respetadas, orders router limpiado |
| Seguridad (auth/headers) | 72 | 79 | +7 | Bearer centralizado, producción validated, Gitleaks + Bandit en CI |
| Testing (BE 422, FE passing) | 70 | 82 | +12 | **422 tests backend** (era 387), schemas Decimal |
| DevOps / Observabilidad | 32 | 58 | +26 | **Sentry integrado**, JSON logging, deploy gate |
| Modelo de datos | 55 | 76 | +21 | **Address FK corregido a Integer**, schemas Decimal |
| Calidad frontend | 64 | 48 | -16 | **⚠️ Regresión: infinite loop /addresses + checkout roto** |
| Documentación | 58 | 60 | +2 | Algunos updates, aún desactualizada |

### ¿Por qué subió +8 general pero el frontend bajó?

Se resolvieron correctamente 7 de los 7 riesgos críticos originales. Pero se introdujeron 2 bugs nuevos que son **bloqueantes para uso real**:
1. Loop infinito de requests `/addresses` que congela Chrome/Firefox
2. Flujo de compra inutilizable (combinación del loop + falta auth gate)

---

## ✅ Fixes Verificados desde Review Anterior (65→73)

| Issue Original | Estado | Evidencia |
|---|---|---|
| ID mismatch (Address.user_id String vs Integer) | ✅ **Resuelto** | `address.py:18` → `Column(Integer, ForeignKey("users.id"))` |
| Race condition en carrito | ✅ **Resuelto** | `cartStore.ts:42-44` → mutex `addingProducts`, `updatingProducts`, `removingProducts` Sets |
| Token sin Bearer en `cart.ts` | ✅ **Resuelto** | `authHeaders.ts` centralizado, todos los API modules usan `getAuthHeader()` |
| Frontend Dockerfile dev en prod | ⚠️ Sigue ahí | Pendiente pero no bloqueante (deploy real usa EAS) |
| Cero observabilidad | ✅ **Resuelto** | `main.py` → `init_sentry()`, `JSONLogFormatter`, structured logging |
| Sin escaneo de seguridad en CI | ✅ **Resuelto** | `ci.yml:139-163` → Gitleaks + Bandit (SAST) |
| Webhook sin transacción atómica | ✅ **Resuelto** | `mercadopago_service.py:339-345` → email en `background_tasks`, DB commit antes |
| BACKEND_URL/FRONTEND_URL defaults | ✅ **Resuelto** | `config.py:49-50` → `Optional[str] = None`, `_validate_production_config()` falla si missing |
| `price: float` en schemas | ✅ **Resuelto** | `order.py:72` → `price: Decimal` con `field_serializer` |
| Debug logging en cache.ts | ✅ **Resuelto** | `cache.ts:9` → `if (__DEV__) console.log(...)` |
| HMAC validation skip en prod | ✅ **Resuelto** | `mercadopago_service.py:419-420` → raise si prod sin secret |

---

## 🔴 Bugs Críticos NUEVOS — Bloqueantes

### 1. 🚨 Loop infinito de requests a `/addresses` (CONGELA EL BROWSER)

**Archivo**: `frontend/app/checkout-v2.tsx:48-62`

**Root cause**: El `useEffect` en checkout tiene `[getToken, fetchAddresses]` como dependencias. `fetchAddresses` viene de Zustand (`useAddress()`) y **genera una nueva referencia de función en cada render**. Cada vez que el efecto se ejecuta, llama a `fetchAddresses` → actualiza el store → re-render del componente → nueva referencia de `fetchAddresses` → el efecto se dispara de nuevo → **loop infinito**.

```typescript
// PROBLEMA — checkout-v2.tsx:48-62
useEffect(() => {
  const loadAddresses = async () => {
    const token = await getToken();
    if (token) await fetchAddresses(token);  // ← modifica store → re-render → repeat
  };
  loadAddresses();
}, [getToken, fetchAddresses]);  // ← fetchAddresses CAMBIA en cada render
```

**Impacto**: 
- El frontend dispara cientos de GET `/addresses` por minuto
- El rate limiter devuelve 429 (120/min) pero el frontend ignora el error y re-intenta
- Chrome/Firefox se congelan por la cascada de requests + re-renders
- El backend se inunda de logs WARNING de slowapi

**Nota**: `addresses.tsx:47-59` tiene el mismo patrón pero usa `[]` como dependencia (correcto). Solo `checkout-v2.tsx` tiene el bug.

**Fix**: Cambiar dependencias a `[]` (como hace `addresses.tsx`), o estabilizar la referencia.

---

### 2. 🚨 Flujo de compra (checkout) severamente roto

**Archivos**: `frontend/app/checkout-v2.tsx`, `frontend/app/cart.tsx`

**Problemas combinados**:

1. **El loop del punto 1** hace que la pantalla de checkout sea inutilizable — el usuario ve loading infinito o la app se congela antes de poder seleccionar dirección
2. **Sin validación de auth antes de llegar a checkout** — un usuario no logueado puede navegar hasta el checkout, y recién en el paso final (línea 97-103) se le pide login. Para ese momento ya eligió dirección y método de pago... que requieren estar logueado para funcionar
3. **Si el usuario no está logueado, `getToken()` retorna null** → `fetchAddresses` falla silenciosamente → no se muestran direcciones → UX rota

**Fix**: El checkout debe validar auth al entrar, no al final. Y el loop debe eliminarse.

---

### 3. 🟠 Sin auth gate para usuarios no registrados

**Scope**: Todas las pantallas excepto catálogo

**Problema**: Un usuario sin cuenta puede navegar libremente a:
- `/cart` → ve carrito vacío pero sin prompt de registro
- `/checkout-v2` → llega al checkout sin estar logueado
- `/addresses` → intenta cargar direcciones sin token (falla silenciosamente)
- `/orders` → ve lista vacía sin explicación
- `/profile` → pantalla sin datos sin contexto
- `/wishlist`, `/payments`, `/support`, etc.

**Lo esperado**: En cada pantalla que requiere autenticación, si el usuario **no está registrado**, debe ver un prompt/modal claro invitándolo a registrarse. Solo el catálogo (`/`, `/all-products`, `/product/[id]`, `/search`) debe ser accesible sin login.

---

## 📊 Métricas Actuales

| Métrica | Valor |
|---|---|
| Backend tests | **422 passed** (era 387 en review anterior) |
| Backend coverage threshold | 80% (CI `--cov-fail-under=80`) |
| Frontend tests | Passing (Jest) |
| CI Jobs | 7: backend-lint, backend-test, frontend-lint, frontend-test, secret-scan, sast, docker-build |
| Deploy gate | Production environment con required reviewers |
| API modules | 8 (addresses, auth, cart, favorites, mercadopago, orders, preferences, products) |
| Zustand stores | 9 (address, auth, cart, cartAnimation, favorites, order, preferences, productFilters, recentlyViewed) |
| Screens | 17 + 5 subdirectories (auth, orders, payment, product, tests) |

---

## 📈 Scoring por Dimensión Solicitada

### 1. Construcción — **75 / 100**

| Aspecto | Score | Justificación |
|---|---|---|
| Estructura de proyecto | 85 | Monorepo limpio: `/backend`, `/frontend`, `/docs`, CI/CD claro |
| Calidad del código backend | 88 | 3 capas respetadas, async/await, typing correcto, Decimal en schemas |
| Calidad del código frontend | 62 | Buenos patterns (Zustand stores, API separation) pero bugs de useEffect y falta de error handling en 429s |
| Manejo de errores | 70 | Backend tiene `ErrorResponse` estandarizado; frontend ignora 429s y no maneja auth failures gracefully |
| Tests | 82 | 422 backend tests excelente; frontend tests existen pero no cubren el infinite loop |

### 2. Arquitectura — **80 / 100**

| Aspecto | Score | Justificación |
|---|---|---|
| Separación de capas | 90 | Router → Service → Model consistente en ~95% del backend |
| State management (frontend) | 78 | Zustand stores bien diseñados con optimistic updates; falta estabilización de refs |
| Auth architecture | 72 | Clerk bien integrado pero falta auth gate en navegación |
| Payment flow | 68 | Mercado Pago funcional pero checkout UX rota por bugs |
| CI/CD pipeline | 85 | 7 jobs, security scanning, prod gate — bien diseñado |

### 3. Rapidez / Performance — **55 / 100**

| Aspecto | Score | Justificación |
|---|---|---|
| Tiempo de respuesta del backend | 75 | FastAPI async, queries con selectinload — razonable |
| FPS / fluidez del frontend | 25 | **Infinite loop destruye la performance, congela browsers** |
| Bundle / carga inicial | 70 | Expo standard, sin optimizaciones especiales pero aceptable |
| Uso de caché | 45 | Redis declarado pero no conectado, sin caché de productos, sin React Query retry |
| API efficiency | 40 | Sin caché HTTP, sin pagination en algunos endpoints, requests redundantes |

### 4. Resolución del Problema — **72 / 100**

| Aspecto | Score | Justificación |
|---|---|---|
| Funcionalidad core implementada | 80 | Catálogo, carrito, checkout, pagos, direcciones, órdenes — todo implementado |
| Flujo de compra end-to-end | 35 | **Roto por los bugs 1 y 2** — no se puede completar una compra |
| User experience | 50 | Diseño visual bueno pero interactividad rota; sin auth gates; sin feedback en errores |
| Problem-solving quality | 82 | Los fixes del review anterior se hicieron correctamente; patterns bien elegidos |
| Product readiness | 45 | No se puede usar en producción hasta resolver los 3 bugs críticos |

---

## 🎯 Prompts para Claude Agent Teams

### Prompt 1: Fix del Infinite Loop de `/addresses` + Checkout Roto

```
## Contexto del Proyecto
HealthBytes es una app de e-commerce mobile-first construida con React Native (Expo) + FastAPI.
El frontend usa Zustand para state management y Clerk para autenticación.

## Problema Crítico a Resolver
Hay un infinite loop de requests GET a `/addresses` que:
1. Congela Chrome y Firefox cuando se usa la app web
2. Devuelve 429 Too Many Requests (rate limit 120/min) continuamente
3. Hace el checkout completamente inutilizable

### Root Cause
En `frontend/app/checkout-v2.tsx` línea 48-62, el `useEffect` tiene `[getToken, fetchAddresses]` como dependencias. `fetchAddresses` viene de `useAddress()` (Zustand store) y genera una NUEVA referencia de función en cada render. Esto crea un ciclo:
- useEffect se ejecuta → llama fetchAddresses → modifica el store → re-render → nueva referencia de fetchAddresses → useEffect detecta cambio → se ejecuta de nuevo → LOOP INFINITO

El mismo patrón en `addresses.tsx:47-59` usa `[]` como dependencia y NO tiene el bug.

### Archivos Relevantes
- `frontend/app/checkout-v2.tsx` (archivo principal con el bug, LEER COMPLETO)
- `frontend/store/addressStore.ts` (store de direcciones)
- `frontend/api/addresses.ts` (API client)
- `frontend/app/addresses.tsx` (referencia de implementación correcta, usa `[]`)

### Cambios Requeridos
1. **checkout-v2.tsx**: Cambiar las dependencias del useEffect de `[getToken, fetchAddresses]` a `[]`. Esto es lo que hace `addresses.tsx` y funciona correctamente.
2. **Todos los screens que llaman fetchAddresses en useEffect**: Verificar que NINGUNO tenga `fetchAddresses` en las dependencias del useEffect. Buscar el pattern en TODOS los archivos .tsx del proyecto.
3. **Agregar manejo de error 429**: En `frontend/api/addresses.ts`, si res.status === 429, no hacer throw sino retornar un resultado vacío o reintentar con backoff. Esto previene cascadas si el bug se repite.
4. **Validación de auth al entrar a checkout**: El checkout debe validar `isSignedIn` al montar el componente (no al final del flujo en línea 97). Si no está logueado, redirigir inmediatamente a login con un mensaje claro.

### Verificación
- Abrir la app en Chrome/Firefox en http://localhost:8081
- Navegar al checkout (agregar producto al carrito → ir al carrito → checkout)
- Verificar que NO hay requests infinitas a `/addresses` en la consola de red
- Verificar que el backend NO muestra logs de rate limit para /addresses
- Verificar que el checkout funciona end-to-end (seleccionar dirección → pago → resumen → confirmar)

### Reglas
- NO cambiar la lógica de negocio del checkout, solo fijar el loop y agregar validación de auth
- Mantener el pattern de optimistic updates existente
- Usar `if (__DEV__)` para cualquier console.log nuevo
- No instalar dependencias nuevas
```

### Prompt 2: Auth Gate para Usuarios No Registrados

```
## Contexto del Proyecto
HealthBytes es una app de e-commerce mobile-first construida con React Native (Expo) + FastAPI.
Usa Clerk (@clerk/clerk-expo) para autenticación con `useAuth()` y `useUser()`.
La navegación usa expo-router con file-based routing en `frontend/app/`.

## Problema a Resolver
Un usuario NO registrado puede navegar libremente a TODAS las pantallas de la app sin ningún prompt para registrarse. Solo debería poder ver el catálogo de productos. El resto de pantallas debe mostrar un prompt/modal claro pidiendo que se registre o inicie sesión.

### Pantallas que DEBEN ser accesibles sin login (catálogo)
- `/` (index.tsx) — Home con productos
- `/all-products.tsx` — Lista completa de productos
- `/product/[id].tsx` — Detalle de producto
- `/search.tsx` — Búsqueda de productos

### Pantallas que REQUIEREN login (mostrar auth gate si no está logueado)
- `/cart.tsx` — Carrito
- `/checkout-v2.tsx` — Checkout
- `/addresses.tsx` — Direcciones
- `/orders.tsx` — Historial de órdenes
- `/orders/[id].tsx` — Detalle de orden
- `/profile.tsx` — Perfil
- `/profile-settings.tsx` — Configuración de perfil
- `/wishlist.tsx` — Lista de deseos
- `/payments.tsx` — Historial de pagos
- `/support.tsx` — Soporte
- `/messages.tsx` — Mensajes
- `/security.tsx` — Seguridad
- `/dietary-preferences.tsx` — Preferencias dietéticas
- `/recently-viewed.tsx` — Vistos recientemente

### Archivos Relevantes
- `frontend/app/_layout.tsx` — Layout principal de la app (LEER COMPLETO)
- `frontend/app/(auth)/` — Directorio de auth screens
- Cada archivo de pantalla listado arriba
- `frontend/components/` — Componentes reutilizables

### Implementación Requerida

1. **Crear componente `AuthGate`** en `frontend/components/AuthGate.tsx`:
   - Recibe `children` como prop
   - Usa `useAuth()` de Clerk para verificar `isSignedIn`
   - Si NO está autenticado: muestra un componente visual atractivo con:
     - Icono/ilustración
     - Título: "Inicia sesión para continuar"
     - Subtítulo contextual: "Necesitas una cuenta para [ver tu carrito / gestionar direcciones / etc.]"
     - Botón primario: "Crear cuenta" → navega a registro
     - Botón secundario: "Ya tengo cuenta" → navega a login
     - Link: "Volver al catálogo" → navega a home
   - Si SÍ está autenticado: renderiza `children` normalmente
   - El diseño debe ser consistente con el estilo de la app (fondo blanco, tipografía Inter/system, botones negros redondeados, estilo premium)

2. **Envolver cada pantalla protegida** con `<AuthGate>`:
   - En cada archivo de pantalla que requiere login, envolver el contenido con AuthGate
   - El AuthGate debe recibir un `message` prop para personalizar el subtítulo según la pantalla

3. **Caso especial: catálogo con hints**:
   - En las pantallas de catálogo (home, all-products, product detail), el botón "Agregar al carrito" y "Añadir a favoritos" deben mostrar un Alert pidiendo login si el usuario NO está autenticado, en lugar de fallar silenciosamente
   - Implementar esto en `ProductCard.tsx` y en la pantalla de detalle de producto

### Estilo Visual del AuthGate
- SafeAreaView con fondo blanco
- Centrado vertical y horizontal
- Icono grande (usar lucide-react-native, por ejemplo `UserPlus` o `Lock`)
- Texto centrado con el message contextual
- Botones con estilo consistente: primario negro rounded-full, secundario outline
- Animación sutil de entrada (usar `Animated` de react-native-reanimated si ya está importado)

### Verificación
- Sin login: navegar a cada pantalla protegida → debe mostrar el AuthGate, NO la pantalla normal
- Sin login: navegar al catálogo → debe funcionar normalmente
- Sin login: intentar agregar al carrito → debe mostrar Alert de login
- Con login: todas las pantallas deben funcionar normalmente
- AuthGate debe verse premium y consistente con el diseño de la app

### Reglas
- Usar los hooks de Clerk existentes (`useAuth`, `useUser`)
- No modificar el sistema de navegación/routing de expo-router
- Reutilizar componentes UI existentes de `components/ui/` cuando sea posible
- Mantener el estilo visual consistente con el resto de la app
- No instalar dependencias nuevas
```

---

## Plan de Acción Recomendado

```
Prioridad 1 — HOY (bloqueantes de uso)
  1. Fix infinite loop checkout-v2.tsx (30 min)
  2. Agregar auth gate en screens protegidos (2-3 horas)

Prioridad 2 — Esta semana
  3. Conectar Redis caché de productos (2 horas)
  4. Agregar React Query retry (1 hora)
  5. Validar EXPO_PUBLIC_API_URL en startup (30 min)

Prioridad 3 — Pre-producción
  6. E2E test del checkout flow
  7. Actualizar README con métricas reales
  8. Crear PRODUCTION_CHECKLIST.md
```

---

## Conclusión

El proyecto mejoró sustancialmente desde el review anterior (65→73). La mayoría de los fixes críticos se aplicaron correctamente y con buena calidad — especialmente la integración de Sentry, la centralización de Bearer tokens, el fix del ID mismatch, y el webhook con background tasks.

Sin embargo, **el flujo de compra está roto por un bug de useEffect** que debió detectarse con testing manual. El infinite loop de `/addresses` congela el browser y hace la app inutilizable. Combinado con la falta de auth gates, un usuario nuevo no puede completar una compra.

**Los 2 prompts de Claude incluidos arriba son self-contained y están listos para ejecutar en agent teams.**
