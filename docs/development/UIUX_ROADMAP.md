# 🗺️ Roadmap de Mejoras UI/UX - HealthBytes

> **Última actualización**: Marzo 5, 2026 (Post UI Redesign Sprint)  
> **Demo Target**: Febrero 15, 2026 (Listo para revisión)  
> **Basado en**: Análisis profundo UI/UX + screenshots del estado actual

---

## 📋 Resumen Ejecutivo

Este roadmap refleja el estado **actual** de la aplicación (Feb 10) y prioriza mejoras para las siguientes fases post-demo.

---

## ✅ Completado e Implementado

> ✨ **Estado Real de la App** (validado con código + screenshots)

### Backend Features
| Feature | Estado | Evidencia |
|---------|--------|-----------|
| ✅ Dietary Tags (many-to-many) | **FUNCIONANDO** | `DietaryTag` model + `product_dietary_tags` junction table |
| ✅ API de Productos | **FUNCIONANDO** | GET /products, GET /products/{id} con dietary_tags eager loading |
| ✅ API de Favoritos | **FUNCIONANDO** | GET /favorites/ids, POST /favorites, DELETE /favorites/{id} |
| ✅ API de Carrito | **FUNCIONANDO** | Carrito con sync backend + merge local/servidor |
| ✅ API de Órdenes | **FUNCIONANDO** | Order creation + tracking |
| ✅ Full-Text Search | **FUNCIONANDO** | PostgreSQL tsvector en Products |

### Frontend Features
| Feature | Estado | Evidencia |
|---------|--------|-----------|
| ✅ **Bottom Navigation Bar** | **FUNCIONANDO** | 3 tabs: Inicio, Carrito, Perfil (BottomNavBar.tsx) |
| ✅ **Wishlist/Favorites** | **FUNCIONANDO** | Corazones en product cards + favoritesStore (backend integrated) |
| ✅ **Dietary Filter Chips** | **FUNCIONANDO** | Chips interactivos en Home (productFiltersStore) |
| ✅ **Product Cards con Badges** | **FUNCIONANDO** | DietaryBadge component con colores backend-driven |
| ✅ **Recently Viewed** | **FUNCIONANDO** | Sección horizontal scroll (recentlyViewedStore) |
| ✅ **Product Categories** | **FUNCIONANDO** | Secciones como "Para veganos" con color coding |
| ✅ **Cart Management** | **FUNCIONANDO** | Add to cart, update qty, remove, merge auth/local |
| ✅ **Order Detail** | **FUNCIONANDO** | Timeline visual + productos de la orden |
| ✅ **Search Functionality** | **FUNCIONANDO** | /search screen con query params |
| ✅ **Authentication** | **FUNCIONANDO** | Clerk integration + token-based API calls |
| ✅ **Quick Win #1: Stock Badges** | **FUNCIONANDO** | Badge "Agotado" y "Últimas unidades" en cards |
| ✅ **Quick Win #2: Skeleton Loaders** | **FUNCIONANDO** | Skeletons animados en Home y Search |
| ✅ **Quick Win #3: Subtle Layering** | **FUNCIONANDO** | Sombras y bordes sutiles en cards |
| ✅ **Quick Win #4: Truncation** | **FUNCIONANDO** | Títulos limitados a 2 líneas |
| ✅ **Quick Win #5: Empty States** | **FUNCIONANDO** | Recently Viewed empty state amigable |
| ✅ **Quick Win #6: Nutritional Info** | **FUNCIONANDO** | Backend (JSON) + Frontend (Tabla nutricional) |
| ✅ **ProductCard Redesign** | **FUNCIONANDO** | aspectRatio 4/3, imagen con margin+borderRadius, jerarquía tipográfica, FavoriteButton negro, botón pill |
| ✅ **vendor_name end-to-end** | **FUNCIONANDO** | Migración Alembic + modelo + schema API + tipo TS + render en card |
| ✅ **DietaryFilterBar completo** | **FUNCIONANDO** | 6 chips (era 4), ScrollView horizontal, slugs sincronizados con DB |
| ✅ **RecentlyViewedBar self-contained** | **FUNCIONANDO** | Lee store internamente, sin props, visible en carrito |
| ✅ **System.md & Color World** | **FUNCIONANDO** | Identidad visual definida, semántica de colores y depth strategy |
| ✅ **Checkout v2 Redesign** | **FUNCIONANDO** | Fitts Law (48px targets), Semántica visual, Custom Keyboards |
| ✅ **Products Redesign** | **FUNCIONANDO** | Unificación con ProductCard core component, Layout grid adaptativo |

---

## 🎯 Estado de Quick Wins (Demo Feb 15)

> **Estado**: ✅ **TODOS COMPLETADOS** (Feb 10)

| # | Feature | Impacto | Estado | Owner |
|---|---------|---------|--------|-------|
| 1 | **Stock Badges** | 🔥 Alto | ✅ **Listo** | Frontend |
| 2 | **Skeleton Loaders** | 🔥 Alto | ✅ **Listo** | Frontend |
| 3 | **Subtle Layering** | ✨ Medio | ✅ **Listo** | Frontend |
| 4 | **Product Truncation** | ✨ Medio | ✅ **Listo** | Frontend |
| 5 | **Empty State Recents** | ✨ Medio | ✅ **Listo** | Frontend |
| 6 | **Nutritional Info** | 🔥 Alto | ✅ **Listo** | Backend |

**Hito alcanzado**: Todas las mejoras visuales críticas para la demo están implementadas y verificadas.

---

## 🔄 En Progreso (Siguiente sprint)

> Pendiente del branch `feat/ui-animation-header-polish` — base del nuevo sistema visual ya está lista en `ProductCard`.

| Feature | Pantalla | Descripción | Prioridad |
|---------|----------|-------------|-----------|
| 🔄 **Sección/mensajes de vendedor** | `app/products.tsx` + `app/product/[id].tsx` | Mostrar `vendor_name` en pantalla de listado y detalle. Considerar filtro por vendor o sección "Productos de [marca]" | 🔥 Alta |
| ✅ **Onboarding Dietary Restrictions** | Nuevo Modal/Screen | Primer uso: "¿Qué restricciones tienes?". Guardar en state/backend y pre-filtrar catálogo. Es el Signature Visual de la app. | ✅ Completado |
| 🔄 **Address CRUD & Checkout API** | Backend + Frontend | Conectar la UI de direcciones del checkout-v2 con el backend de Addresses | 🔥 Alta |

### Detalle técnico por tarea

#### Mensajes de vendedor
- En `ProductCard` ya aparece `vendor_name` debajo del nombre ✅
- En `/product/[id].tsx`: agregar fila "Proveedor: [vendor_name]" en la sección de detalles
- Evaluar si agregar chip/badge de vendor en el listado de productos

#### Onboarding Dietary Restrictions
- ✅ Construido un flujo inmersivo con `react-native-reanimated` (Full Screen Modal).
- ✅ Mapeadas selecciones al backend y visualización instantánea (Zustand `useProductFilters`).
- ✅ Color World implementado (Fondo off-white, contrastes verde oscuro).

#### Address CRUD & Checkout API
- Crear modelo en Backend (SQLAlchemy) + Endpoints.
- Mapear peticiones desde el frontend a `/addresses`.
- Integrar la validación y UX final en el Checkout.

---

## 🔄 En Progreso (No bloquea demo)

| Feature | Estado | Blocker para Demo? | Próximos Pasos |
|---------|--------|-------------------|----------------|
| Checkout con Address Selection | 🔄 Diseñando | ❌ No | Esperar backend Addresses API |
| Backend Addresses CRUD | 🔄 Pendiente | ❌ No | Fase 2 post-demo |
| Dark Mode | 🔄 Investigando | ❌ No | Gluestack theming config |

---

## 📅 Roadmap Post-Demo (Fases 2-4)

### 🚀 Fase 2: Features Core + Accesibilidad Móvil (Semanas 1-5 post-demo)

#### Backend Prioritario
- [ ] **Backend Addresses CRUD** (4-5 días)
  - Modelo: Address con user_id, street, city, region, postal_code, is_default
  - Endpoints: GET, POST, PUT, DELETE /addresses
- [ ] **Backend Payment Methods (Venti + Mercado Pago)** (1.5 semanas)
  - Integraciones de pago seguras

#### Frontend Prioritario
- ✅ **Onboarding Dietary Restrictions (Signature Visual)** (Completado)
  - Full screen modal con React Native Reanimated
  - Guardado asíncrono y precarga síncrona visual en Home
- [ ] **Checkout con Address Selection** (3 días)
  - Depende de Backend Addresses
  - UI: Diseñada aplicando MFRI (Mobile Feasibility Risk Index) y asegurando *Touch Targets*.
- [ ] **Auditoría Básica A11y & Touch Targets** (3 días)
  - Promovido: Asegurar botones de 44x44px min.
  - Screen reader labels iniciales. Contrast ratio check.
- [ ] **Product Alternatives/Suggestions** (1 semana)
  - "Productos similares" en ProductDetail (Backend matching temporal)

**Total Fase 2**: ~5 semanas

---

### 🎨 Fase 3: Polish UX/UI & Mobile Realities (Semanas 6-8 post-demo)

#### Estabilidad Móvil y Performance Percibida
- [ ] **Modo Offline Resiliente** (1 semana)
  - Promovido: Cache browsed products y cart (`AsyncStorage`).
  - Implementar componente `OfflineBanner` global no intrusivo y elegante.
- [ ] **Lazy Loading Optimizado (Progressive Image)** (3-4 días)
  - Blur placeholders y transiciones fluidas de imágenes basadas en el estado real (online vs offline).
- [ ] **Dark Mode** (3-4 días)
  - Basado en el `Color World` (no solo gris oscuro, sino colores intencionales).

#### Micro-interacciones
- [ ] **Micro-interactions mejoradas** (3 días)
  - Hover states (web), Press animations consistentes con la Ley de Fitts.
- [ ] **Deep Linking** (4 días)
- [ ] **Filter Persistence** (1 día)

**Total Fase 3**: ~3 semanas

---

### 🔮 Fase 4: Advanced Features (Semanas 9+ post-demo)

#### Accesibilidad Avanzada
- [ ] **Screen Readers Total Support** (A11y completo)

#### Features Avanzadas (Evaluar ROI)
- [ ] **Notificaciones Push (solo órdenes)**
  - Evaluar permisos y fatiga del usuario en setup.
- [ ] **Sistema de Reviews** (2 semanas)
- [ ] **Cupones y Promociones** (1 semana)
- [ ] **Wishlist Lists Múltiples** (1 semana)

---

## 📊 Métricas de Éxito (Actualizado)

### Demo Feb 15 - Baseline Metrics
| Métrica | Método de Medición | Objetivo Demo |
|---------|-------------------|---------------|
| **Dietary Filter Usage** | Analytics event on chip click | Demostrar funcionalidad |
| **Wishlist Engagement** | Count favorite toggles | Mostrar corazones funcionando |
| **Perceived Load Time** | Manual testing con skeleton | \<2s con skeleton visible |
| **Stock Badge Visibility** | Visual inspection | 100% productos con stock info |

---

## 🎯 Estrategia para Demo Feb 15 (COMPLETADA)

### Hitos Logrados
1. ✅ **Feb 11**: Implementado Quick Wins #1, #2, #6 (stock badges, skeleton, nutritional backend)
2. ✅ **Feb 11**: Implementado Quick Wins #3, #4 (subtle layering, truncation)
3. ✅ **Feb 10**: Testing manual completado

### Talking Points para Demo
- ✅ Wishlist funcionando (backend + optimistic updates)
- ✅ Bottom nav accesible desde cualquier pantalla
- ✅ Dietary tags como signature feature
- ✅ Stock badges para prevenir frustración
- ✅ Skeleton loaders para perceived performance
- ✅ Información nutricional detallada en DB y UI

---

## 🔗 Referencias

- [Frontend README](../../frontend/README.md)
- [Backend README](../../backend/README.md)

---

> **Última actualización**: Marzo 5, 2026 — Sprint UI Redesign (ProductCard, vendor_name, DietaryFilters, CI fixes)  
> **Próxima revisión**: Al cerrar `/products` rediseño + checkout tokens
