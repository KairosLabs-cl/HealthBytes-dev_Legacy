# 🗺️ Roadmap de Mejoras UI/UX - HealthBytes

> **Última actualización**: Febrero 10, 2026 (Post-Quick Wins)  
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

> **Última actualización**: Febrero 10, 2026, 17:30 PM  
> **Próxima revisión**: Post-demo Feb 15
