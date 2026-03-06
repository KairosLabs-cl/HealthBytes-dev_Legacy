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
| 🔄 **Rediseño pantalla `/products`** | `app/products.tsx` | Aplicar el mismo sistema visual del ProductCard rediseñado: grid layout, sombras, borderRadius 12, imagen con margin + borderRadius 8, jerarquía tipográfica | 🔥 Alta |
| 🔄 **Sección/mensajes de vendedor** | `app/products.tsx` + `app/product/[id].tsx` | Mostrar `vendor_name` en pantalla de listado y detalle. Considerar filtro por vendor o sección "Productos de [marca]" | 🔥 Alta |
| 🔄 **Tokens estéticos `/checkout-v2`** | `app/checkout-v2.tsx` | Alinear colores (`#111827`, `#F3F4F6`), tipografía (fontWeight 700/800), espaciado y botones pill `borderRadius 999` con el nuevo sistema visual | ✨ Media |

### Detalle técnico por tarea

#### `/products` — Rediseño visual
- Verificar que usa `ProductCard` directamente (si no, refactorizar para reutilizarlo)
- Revisar el layout del grid: `numColumns`, gap entre cards, padding lateral
- Asegurar que `DietaryFilterBar` está visible y funcional en esta pantalla

#### Mensajes de vendedor
- En `ProductCard` ya aparece `vendor_name` debajo del nombre ✅
- En `/product/[id].tsx`: agregar fila "Proveedor: [vendor_name]" en la sección de detalles
- Evaluar si agregar chip/badge de vendor en el listado de productos

#### `/checkout-v2` — Token estéticos
- Botones: reemplazar colores hardcoded por `#111827` (primario) y `#F3F4F6` (secundario)
- Tipografía: unificar `fontWeight` a escala 400/500/700/800
- Spacing: padding consistente de 16px en secciones, 12px entre elementos
- Inputs: `borderRadius 12`, border `rgba(0,0,0,0.1)`

---

## 🔄 En Progreso (No bloquea demo)

| Feature | Estado | Blocker para Demo? | Próximos Pasos |
|---------|--------|-------------------|----------------|
| Checkout con Address Selection | 🔄 Diseñando | ❌ No | Esperar backend Addresses API |
| Backend Addresses CRUD | 🔄 Pendiente | ❌ No | Fase 2 post-demo |
| Dark Mode | 🔄 Investigando | ❌ No | Gluestack theming config |

---

## 📅 Roadmap Post-Demo (Fases 2-4)

### 🚀 Fase 2: Features Core (Semanas 1-4 post-demo)

#### Backend Prioritario
- [ ] **Backend Addresses CRUD** (4-5 días)
  - Modelo: Address con user_id, street, city, region, postal_code, is_default
  - Endpoints: GET, POST, PUT, DELETE /addresses
- [ ] **Backend Payment Methods (Venti + Mercado Pago)** (1.5 semanas)
  - Integración Venti payment gateway
  - Integración Mercado Pago (Chile)
  - Webhook para order confirmation
- [ ] **Notificaciones Push (solo órdenes)** (1.5 semanas)
  - Expo notifications
  - Backend: orden status change → push notification

#### Frontend Prioritario
- [ ] **Onboarding Dietary Restrictions** (2-3 días)
  - First-time user: "¿Qué restricciones tienes?"
  - Guardar en authStore → pre-filtrar productos
- [ ] **Checkout con Address Selection** (3 días)
  - Depende de Backend Addresses
  - UI: Address cards + "Agregar nueva"
- [ ] **Product Alternatives/Suggestions** (1 semana)
  - "Productos similares" en ProductDetail
  - Backend: simple category + dietary_tags match

**Total Fase 2**: ~4-5 semanas

---

### 🎨 Fase 3: Polish UX/UI (Semanas 5-7 post-demo)

- [ ] **Dark Mode** (3-4 días)
  - Gluestack UI theming
  - Toggle en Profile settings
- [ ] **Micro-interactions mejoradas** (3 días)
  - Hover states consistentes
  - Press animations (scale 0.95)
- [ ] **Deep Linking** (4 días)
  - Compartir productos vía link
  - Open app desde notification
- [ ] **Filter Persistence** (1 día) ⚡ Podría ser Quick Win también
  - Guardar productFiltersStore en AsyncStorage
  - Zustand persist middleware

**Total Fase 3**: ~2 semanas

---

### 🔮 Fase 4: Advanced + Performance (Semanas 8-12 post-demo)

#### Accesibilidad (PROMOVIDO de Fase 4 original)
- [ ] **A11y Audit + Fixes** (1 semana)
  - WCAG 2.1 AA compliance
  - Screen reader labels
  - Contrast ratio validation (Tool: Lighthouse)
  - Touch target sizes (mínimo 44x44)

#### Performance
- [ ] **Lazy Loading optimizado** (3 días)
  - React Native Image progressive loading
  - Blur placeholder mientras carga
- [ ] **Modo Offline básico** (1 semana)
  - Cache browsed products (AsyncStorage)
  - Offline banner cuando no hay conexión

#### Features Avanzadas (Evaluar ROI primero)
- [ ] **Sistema de Reviews** (2 semanas)
  - Empezar con ratings ⭐ simples
  - Luego agregar comments
- [ ] **Cupones y Promociones** (1 semana)
  - Solo si hay marketing strategy
- [ ] **Wishlist Lists** (1 semana)
  - Escalar de boolean favorites a listas múltiples
  - Evaluar engagement actual primero

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
