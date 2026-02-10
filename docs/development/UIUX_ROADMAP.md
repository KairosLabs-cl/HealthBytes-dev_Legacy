# 🗺️ Roadmap de Mejoras UI/UX - HealthBytes

> **Última actualización**: Febrero 10, 2026  
> **Demo Target**: Febrero 15, 2026 (5 días)  
> **Basado en**: Análisis profundo UI/UX + screenshots del estado actual

---

## 📋 Resumen Ejecutivo

Este roadmap refleja el estado **actual** de la aplicación (Feb 10) y prioriza mejoras para la **demo del 15 de febrero**.

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

---

## 🎯 Quick Wins para Demo (Feb 15) - 5 días restantes

> **Objetivo**: Mejoras visibles de alto impacto que se pueden implementar rápido

| # | Feature | Impacto | Esfuerzo | Prioridad | Owner |
|---|---------|---------|----------|-----------|-------|
| 1 | **Stock Badges en Product Cards** | 🔥 Alto | 4 horas | **P0** | Frontend |
| 2 | **Skeleton Loaders** (Home + Search) | 🔥 Alto | 6 horas | **P0** | Frontend |
| 3 | **Subtle Layering** (card shadows) | ✨ Medio | 2 horas | **P1** | Frontend |
| 4 | **Product Name Truncation** | ✨ Medio | 1 hora | **P1** | Frontend |
| 5 | **Empty State para Recently Viewed** | ✨ Medio | 2 horas | **P2** | Frontend |
| 6 | **Nutritional Info Field** (backend) | 🔥 Alto | 4 horas | **P0** | Backend |

**Total estimado**: ~19 horas (~2-3 días de trabajo real)  
**Fecha límite**: Febrero 13 (2 días antes de demo para testing)

### Detalles de Implementación

#### 1. Stock Badges en Product Cards (P0)
**Por qué**: Screenshots muestran que no hay indicador de stock bajo/agotado, puede frustrar usuarios

**Cambios**:
- **File**: `frontend/components/ProductListItem.tsx`
- **Lógica**:
  ```tsx
  {product.stock === 0 && (
    <View className="absolute top-2 left-2 bg-red-500 px-2 py-1 rounded">
      <Text className="text-xs text-white font-bold">Agotado</Text>
    </View>
  )}
  {product.stock > 0 && product.stock <= 5 && (
    <Text className="text-xs text-orange-600 font-semibold mt-1">
      Últimas {product.stock} unidades
    </Text>
  )}
  ```

#### 2. Skeleton Loaders (P0)
**Por qué**: Loading actual es ActivityIndicator genérico, perceived performance baja

**Cambios**:
- **Files**: 
  - `frontend/components/ProductListSkeleton.tsx` (crear)
  - `frontend/app/index.tsx` (usar skeleton mientras isLoading)
  - `frontend/app/search.tsx` (usar skeleton mientras isLoading)

**Componente**:
```tsx
// ProductListSkeleton.tsx
export default function ProductListSkeleton() {
  return (
    <View className="flex-row flex-wrap gap-4">
      {[1,2,3,4].map(i => (
        <View key={i} className="w-[48%] bg-gray-100 rounded-lg p-5 animate-pulse">
          <View className="h-[200px] bg-gray-200 rounded mb-4" />
          <View className="h-4 bg-gray-200 rounded mb-2 w-3/4" />
          <View className="h-6 bg-gray-200 rounded w-1/2" />
        </View>
      ))}
    </View>
  );
}
```

#### 3. Subtle Layering (P1)
**Por qué**: Cards se ven planas en screenshots, falta profundidad (Interface Design principle)

**Cambios**:
- **File**: `frontend/components/ProductListItem.tsx`
- **Añadir**: `border border-gray-100` + shadow sutil

#### 4. Nutritional Info Field (Backend P0)
**Por qué**: ProductDetail muestra valores hardcoded, engañoso para usuarios con diabetes

**Cambios**:
- **Migration**: Añadir column `nutritional_info JSONB` a `products` table
- **Schema**: `backend/app/schemas/product.py` - añadir optional field
- **Seed**: Popular con data real para productos existentes

**Estructura JSON**:
```json
{
  "calories": 120,
  "protein_g": 5,
  "carbs_g": 20,
  "fat_g": 3,
  "fiber_g": 2,
  "sodium_mg": 150
}
```

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
- [ ] **Nutritional Info completa** (ya empezado en Quick Win #6)
  - Seed data para catálogo existente
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

## ❌ Features ELIMINADAS del Roadmap Original

> Decisiones basadas en **pensamiento crítico** y ROI

| Feature Eliminada | Razón | Alternativa |
|-------------------|-------|-------------|
| ❌ Historial de Búsquedas | Low impact, backend search ya funciona bien | Mantener search simple |
| ❌ Typeahead de Búsqueda | Premature optimization, 4 días vs bajo ROI | Search actual es suficiente para MVP |
| ❌ 2FA / Seguridad Avanzada | No es MVP, auth básico Clerk es suficiente | Fase 5+ (solo si users lo piden) |
| ❌ Feedback Háptico | iOS-only?, validación de value unclear | Mantener en backlog |
| ❌ Indicadores de Ahorro | Solo tiene sentido si hay cupones reales | Depende de marketing strategy |
| ❌ Backend Soporte custom | 1 semana dev vs email/WhatsApp = 0 días | Link a email o WhatsApp Business |

---

## 📊 Métricas de Éxito (Actualizado)

### Demo Feb 15 - Baseline Metrics
| Métrica | Método de Medición | Objetivo Demo |
|---------|-------------------|---------------|
| **Dietary Filter Usage** | Analytics event on chip click | Demostrar funcionalidad |
| **Wishlist Engagement** | Count favorite toggles | Mostrar corazones funcionando |
| **Perceived Load Time** | Manual testing con skeleton | \<2s con skeleton visible |
| **Stock Badge Visibility** | Visual inspection | 100% productos con stock info |

### Post-Demo (Marzo-Abril 2026)
| Métrica | Baseline (Feb 15) | Objetivo 3 Meses | Cómo Medir |
|---------|-------------------|------------------|------------|
| Uso de filtros dietéticos | TBD | 60%+ usuarios | Analytics |
| Cart→Checkout conversion | TBD | +20% vs baseline | Funnel analytics |
| Wishlist→Purchase | TBD | 15%+ | Favorites que se compran |
| Stock-out frustration | TBD | -50% intentos add agotado | Error events |
| Nutritional info views | 0% | 40%+ en product detail | Analytics |

---

## 🎯 Estrategia para Demo Feb 15

### Preparación (Feb 11-13)
1. **Feb 11 AM**: Implementar Quick Wins #1, #2, #6 (stock badges, skeleton, nutritional backend)
2. **Feb 11 PM**: Implementar Quick Wins #3, #4 (subtle layering, truncation)
3. **Feb 12**: Testing manual + fixes
4. **Feb 13**: Buffer day para ajustes

### Durante la Demo
**Flujo a demostrar**:
1. Home → Mostrar skeleton loading → Products con dietary badges
2. Click filtro "Sin gluten" → Productos filtrados
3. Click producto → Ver dietary badges + nutritional info (ya no hardcoded)
4. Click corazón → Wishlist toggle (optimistic update)
5. Add to cart → Ver badge count en bottom nav
6. Cart → Checkout (aunque no esté completo address, mostrar UI)
7. Profile → Ver favoritos

**Talking Points**:
- ✅ Wishlist funcionando (backend + optimistic updates)
- ✅ Bottom nav accesible desde cualquier pantalla
- ✅ Dietary tags como signature feature
- ✅ Stock badges para prevenir frustración
- ✅ Skeleton loaders para perceived performance

---

## 🔗 Referencias

- [Implementation Plan Completo](../../.gemini/antigravity/brain/b3661f87-02d4-4be7-8f08-c25fc4f408a7/implementation_plan.md)
- [Task Breakdown](../../.gemini/antigravity/brain/b3661f87-02d4-4be7-8f08-c25fc4f408a7/task.md)
- [Frontend README](../../frontend/README.md)
- [Backend README](../../backend/README.md)

---

## 📝 Notas de Decisión

### ✅ Mantener del Roadmap Original
- Filtros dietéticos (core value) → YA IMPLEMENTADO
- Badges dinámicos → YA IMPLEMENTADO
- **Wishlist** → ⚠️ **YA IMPLEMENTADO** (roadmap viejo decía "en branch", pero ya está en producción)
- Dark mode (Fase 3)
- Payment backend (Fase 2)

### ⬆️ Promovido a Mayor Prioridad
- Nutritional info dinámica (hardcoded → backend field) - **QUICK WIN**
- Skeleton loaders (perceived performance) - **QUICK WIN**
- Accesibilidad audit (Fase 4 → Fase 2)

### ⬇️ Reducido o Simplificado
- Reviews (full system → simple ratings ⭐ primero)
- Wishlist (boolean favorites OK, escalará a listas si hay engagement)
- Offline mode (full cache → solo browsed products)

### 🆕 Agregado (no estaba en roadmap)
- Onboarding dietary restrictions (first-time UX)
- Filter persistencia (AsyncStorage)
- Stock badges (prevenir frustración)
- Product alternatives (discovery)

---

> **Última actualización**: Febrero 10, 2026, 11:30 AM  
> **Próxima revisión**: Post-demo Feb 15
