# Tablero Kanban de Agentes IA — Asignaciones Semanales (2 Semanas)

Este tablero centraliza la asignación de tareas a los agentes especializados de **HealthBytes** para las próximas 2 semanas a partir de hoy (26 de Mayo, 2026). El foco estratégico absoluto es la **Optimización de Performance** y la **Des-sobreingenierización (Legibilidad y Simplificación de Código)**.

---

## 📊 Vista General del Tablero

```
┌──────────────────────────────────────────────────────────────┐
│                           INBOX                              │
│  - [ ] CR-PERF-05: Webhook Over-silencing & DB 500s          │
└──────────────────────────────┬───────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────┐
│                        ROLE REVIEW                           │
│  - [ ] CR-PERF-01: Stock Double Counting (Underselling)      │
│  - [ ] CR-PERF-02: Pending Payments Cleanup Job             │
│  - [ ] CR-PERF-03: FlatList & useQuery Re-render Overheads   │
│  - [ ] CR-PERF-04: Login Busy-wait Loop Refactor             │
│  - [ ] CR-DEC-01:  Monolithic Checkout-v2 De-overengineering  │
│  - [ ] CR-DEC-02:  TS 'any', Token Leak Logs, mp-url Prefix   │
└──────────────────────────────┬───────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────┐
│                   VALUABLE (READY FOR DEV)                   │
│  (Listas para que los agentes ejecuten su análisis y patch)   │
└──────────────────────────────┬───────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────┐
│                         IN PROGRESS                          │
└──────────────────────────────┬───────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────┐
│                       READY TO MERGE                         │
└──────────────────────────────┬───────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────┐
│                        MERGED / DONE                         │
└──────────────────────────────────────────────────────────────┘
```

---

## 📋 Detalle de Items y Asignación por Agente

A continuación se detallan los ítems activos en el tablero, mapeados a partir de los hallazgos críticos de auditoría (`03_frontend.md` y `04_negocio.md`), asignando roles a los perfiles de agentes correspondientes.

### 1. `CR-PERF-01`: Stock Double Counting (Underselling)
* **Columna:** `Role Review`
* **Prioridad:** Alta (Crítica para el Negocio)
* **Agentes Asignados:** `agent:architecture`, `agent:qa`
* **Origen:** `backend/app/services/cart_service.py` (L19-31)
* **Descripción:** 
  La lógica de cálculo de stock disponible en `_get_available_stock` resta los productos reservados en órdenes pendientes, pero el stock físico (`product.stock`) ya fue previamente decrementado por `reserve_stock_batch`. Esto duplica la deducción (Double Counting), causando que productos con stock real aparezcan agotados ("Underselling").
* **Objetivo:** 
  Simplificar el método utilizando `product.stock` directamente o diseñar un mecanismo coherente de control, evitando sobreingeniería, y escribir una suite de tests en `pytest` que valide transacciones concurrentes.

### 2. `CR-PERF-02`: Pending Payments Cleanup Job (Abandoned Carts)
* **Columna:** `Role Review`
* **Prioridad:** Alta
* **Agentes Asignados:** `agent:architecture`, `agent:security`, `agent:qa`
* **Origen:** `backend/app/services/payment_service.py` (L276-300)
* **Descripción:** 
  El método `get_pending_payments` para encontrar transacciones expiradas existe, pero ningún proceso del sistema lo invoca. Los carritos y el stock físico reservados por checkout abandonados quedan bloqueados indefinidamente, disminuyendo el inventario real.
* **Objetivo:** 
  Implementar un scheduler ligero (ej. FastAPI BackgroundTasks con timeout, cron en app startup con APScheduler o similar) que corra cada 15 minutos, busque pagos pendientes de más de 30 minutos, libere el stock atómicamente y marque la orden como cancelada. Evitar dependencias pesadas innecesarias.

### 3. `CR-PERF-03`: FlatList & useQuery Re-render Overheads
* **Columna:** `Role Review`
* **Prioridad:** Media
* **Agentes Asignados:** `agent:ui`, `agent:architecture`, `agent:qa`
* **Origen:** `frontend/app/orders.tsx` (L160) y `frontend/app/product/[id].tsx` (L250-268)
* **Descripción:** 
  * En `orders.tsx`, la variable `listHeader` que contiene JSX no está memoizada ni extraída, lo que fuerza a `FlatList` a desmontar y montar el header completo en cada render.
  * En `product/[id].tsx`, se definen dos observadores `useQuery` idénticos con el mismo `queryKey` para obtener ratings, provocando re-renders dobles innecesarios cuando se invalida la caché.
* **Objetivo:** 
  1. Memoizar con `useMemo` o extraer `listHeader` a un componente separado.
  2. Unificar las llamadas de `useQuery` para ratings en un solo observador reactivo.
  3. Ejecutar pruebas unitarias de render en frontend.

### 4. `CR-PERF-04`: Login Busy-wait Loop Refactor
* **Columna:** `Role Review`
* **Prioridad:** Media
* **Agentes Asignados:** `agent:ux`, `agent:architecture`
* **Origen:** `frontend/app/(auth)/login.tsx` (L37-48)
* **Descripción:** 
  Tras activar la sesión de Clerk, el login ejecuta un bucle `while` de busy-wait que consulta `getToken()` cada 150ms hasta por 8 segundos. Esto consume recursos del hilo principal de JS e ignora el estado reactivo nativo de Clerk (`useAuth().isSignedIn`), duplicando lógica con el layout.
* **Objetivo:** 
  Eliminar el bucle de polling y reestructurar a través de un hook limpio (ej. `useGoogleOAuth`) que reaccione al estado de Clerk de manera asíncrona, mejorando la fluidez visual y previniendo saltos de navegación dobles.

### 5. `CR-DEC-01`: Monolithic Checkout-v2 De-overengineering
* **Columna:** `Role Review`
* **Prioridad:** Alta (Foco en Código Legible)
* **Agentes Asignados:** `agent:architecture`, `agent:ux`
* **Origen:** `frontend/app/checkout-v2.tsx`
* **Descripción:** 
  El archivo `checkout-v2.tsx` es un componente monolítico de más de 500 líneas que mezcla la máquina de estados de UI de los pasos del checkout, fetching en `useEffect` de direcciones, orquestación de creación de órdenes y de preferencias de MercadoPago, limpieza del carrito local y lógica de navegación externa (`Linking`).
* **Objetivo:** 
  Extraer toda la lógica de orquestación, asincronismo e interacción con las APIs del checkout hacia un hook de react limpio y testeable `useCheckout()`. Mantener el componente de UI estrictamente enfocado en la presentación y transiciones visuales de los pasos.

### 6. `CR-DEC-02`: Clean TS 'any', Sensitive Log Leak & MercadoPago URL Prefix
* **Columna:** `Role Review`
* **Prioridad:** Alta (Seguridad e Higiene)
* **Agentes Asignados:** `agent:security`, `agent:docs`, `agent:architecture`
* **Origen:** `store/authStore.ts`, `api/orders.ts` (L29-30), `api/mercadopago.ts` (L55, 95) y `types/order.ts` (L72)
* **Descripción:** 
  * `api/orders.ts` expone información de logs con fragmentos de tokens sin envolver en guardias `__DEV__` (Vulnerabilidad de fuga).
  * `api/mercadopago.ts` concatena manualmente `/api/v1` sobre la variable `EXPO_PUBLIC_API_URL` que ya lo contiene, rompiendo peticiones con 404s en producción (`/api/v1/api/v1/...`).
  * `store/authStore.ts` y otros usan tipados `any` innecesarios en producción.
  * `types/order.ts` retorna un fallback de texto `"pending"` fuera del tipo de unión `OrderStatus`, provocando bugs silenciosos de lookup `undefined` en componentes visuales.
* **Objetivo:** 
  1. Eliminar inmediatamente el console.log con datos sensibles del token y envolver logs normales en `__DEV__`.
  2. Corregir la concatenación duplicada de la API de Mercado Pago.
  3. Eliminar el uso de `any` en los archivos indicados (`authStore.ts`, `recently-viewed.tsx`, etc.), definiendo las interfaces correspondientes.
  4. Modificar el fallback de `normalizeStatus` a `"unpaid"` para alinearse con `OrderStatus`.

### 7. `CR-PERF-05`: Webhook Over-silencing & DB Transient Errors 500s
* **Columna:** `Inbox`
* **Prioridad:** Media/Alta
* **Agentes Asignados:** `agent:security`, `agent:qa`
* **Origen:** `backend/app/api/v1/payments/mercadopago.py` (L129-132) y `mercadopago_service.py` (L320-331)
* **Descripción:** 
  * El webhook captura cualquier excepción (`PaymentError`) y retorna 200 a MercadoPago para evitar que reintente. Esto previene reintentos en errores de negocio, pero silencia y detiene reintentos legítimos en fallos transitorios (ej. caídas de red, timeouts de base de datos), dejando órdenes pagadas como "unpaid".
  * El método `release_stock_batch` dentro del webhook silencia fallos en el bloque `try/except`. Si el release de stock falla, la orden se cancela pero el stock queda bloqueado para siempre de manera invisible.
* **Objetivo:** 
  Distinguir errores de negocio (retornar 200) de errores transitorios de infraestructura (retornar 500 para forzar reintento de MercadoPago). Evitar que fallos silenciosos en la liberación de stock completen la cancelación de la orden sin alerta ni fallback.

---

## ⚙️ Directrices de Ejecución para Jules / Codex / Agentes IA

Cuando un agente trabaje en su respectivo ítem, debe seguir rigurosamente las pautas establecidas en el ecosistema de HealthBytes:

1. **Evidencia Primero:** Ninguna decisión o recomendación es válida sin evidencia contrastable. El agente debe llenar y entregar el **Agent Review Canvas** documentado en `docs/ia-tools/agent-role-hive-prompts.md`.
2. **Cierre Rápido y Rescate:** Las PRs o propuestas con ruido, validate failed, diff vacío o micro-optimizaciones sin impacto observable serán cerradas de inmediato (`decision:close`). Si una automatización tiene una buena idea pero mala ejecución, se propone un rescate limpio (`decision:rescue`).
3. **Master Protegido:** Estas asignaciones se implementan directamente en la rama `master`. Al realizar refactorizaciones o correcciones, asegurarse de ejecutar las suites locales de tests (`pytest` para backend y `pnpm run type-check` / `Jest` para frontend) para garantizar regresiones cero.
4. **Simplificación en vez de Abstracción:** En línea con el objetivo de des-sobreingenierización, preferir código plano, directo y fácil de leer por encima de patrones complejos de diseño que añadan capas de abstracción innecesarias.
