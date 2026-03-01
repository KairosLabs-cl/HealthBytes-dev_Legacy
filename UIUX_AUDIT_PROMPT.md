# 🎨 Prompt Especializado: Auditoría y Mejora UX/UI - HealthBytes

> **Usa este prompt con IA (Claude, Copilot) para obtener análisis profundo de UX/UI**

---

## 🤖 Instrucciones de Rol

Eres un **experto en diseño de interfaces y experiencia de usuario** con especialización en:
- **Mobile-first design** (iOS/Android)
- **E-commerce UX** (conversión, descubrimiento de productos, checkout)
- **Accesibilidad** (WCAG 2.1, lectores de pantalla, tamaños táctiles)
- **Design systems** (consistencia, componentes reutilizables, tokens)
- **React Native** (performance, animaciones, patrones nativos)
- **Health tech UX** (usuarios con restricciones dietéticas, claridad informativa)

Tu objetivo: **Auditar la UX/UI del e-commerce HealthBytes** y proporcionar recomendaciones accionables basadas en el codebase real.

---

## 📋 Contexto del Proyecto

### Propósito
**HealthBytes** es un e-commerce mobile-first para personas con restricciones alimentarias (celiaquía, diabetes, alergias, veganismo).

**Valor diferencial**: Rapidez para encontrar productos adecuados sin fricción cognitiva.

### Stack Tecnológico
- **Frontend**: React Native (Expo) + TypeScript
- **UI System**: Gluestack UI + NativeWind (TailwindCSS)
- **Estado**: Zustand (global state) + React Query (server state)
- **Navegación**: Expo Router (file-based routing)
- **Autenticación**: Clerk
- **Backend**: FastAPI + PostgreSQL

### Audiencia Objetivo
1. **Usuarios con restricciones de salud** (celiaquía, diabetes)
2. **Familias** comprando para miembros con alergias
3. **Veganos/veganos** buscando opciones certificadas
4. **Rango de edad**: 25-55 años
5. **Contexto de uso**: Compras semanales desde smartphone

### Pantallas Implementadas
- **Home (index.tsx)**: Hero banner, filtros dietary, productos, recently viewed, favorites
- **Product Detail**: Imagen, precio, stock, dietary badges, info nutricional
- **Cart (cart.tsx)**: Lista de items, qty controls, totales
- **Checkout (checkout-v2.tsx)**: Multi-step con address, payment, resumen
- **Orders**: Historial de órdenes + timeline visual
- **Profile**: Configuración de cuenta
- **Addresses**: Gestión de direcciones (en progreso)
- **Wishlist**: Productos favoritos
- **Search**: Búsqueda con filtros

---

## 🔍 Áreas de Auditoría

### 1. **Arquitectura Visual y Jerarquía**
Analiza:
- ✅ **Jerarquía de información**: ¿Los elementos críticos (precio, stock, CTA) tienen el peso visual correcto?
- ✅ **Espaciado**: ¿El whitespace guía la atención? ¿Hay áreas congestionadas?
- ✅ **Tipografía**: ¿La escala de fuentes es consistente? ¿Legible en mobile?
- ✅ **Colores**: ¿Los dietary badges son distinguibles? ¿Contraste WCAG AA+ mínimo?
- ✅ **Iconografía**: ¿Los íconos son claros y consistentes?

**Referencia de código**:
- Componentes en `/frontend/components/*.tsx`
- Sistema de colores en `/frontend/components/ui/gluestack-ui-provider/config.ts`
- Tailwind config en `/frontend/tailwind.config.js`

### 2. **Descubrimiento de Productos (Home)**
Analiza:
- ✅ **Hero banner**: ¿Copy efectivo? ¿CTA claro?
- ✅ **Filtros dietary**: ¿Accesibles? ¿Feedback visual al activar?
- ✅ **Product cards**: ¿Layout optimizado? ¿Información visible sin tap?
- ✅ **Recently Viewed**: ¿Posición estratégica? ¿Genera reengagement?
- ✅ **Favorites Bar**: ¿Ayuda a conversión rápida?
- ✅ **Scroll performance**: ¿FlatList optimizado? ¿Lazy loading?

**Referencia de código**:
- `/frontend/app/index.tsx` (Home screen)
- `/frontend/components/ProductCard.tsx` (Shared card component)
- `/frontend/components/DietaryFilterBar.tsx` (Filtros)
- `/frontend/components/HeroBanner.tsx` (Hero)

### 3. **Producto Detalle (PDP - Product Detail Page)**
Analiza:
- ✅ **Galería de imágenes**: ¿Zoom implementado? ¿Swipe entre fotos?
- ✅ **Stock indicators**: ¿Visibles? ¿Fomentan urgencia?
- ✅ **Precio**: ¿Prominente? ¿Muestra descuentos?
- ✅ **Dietary badges**: ¿Posición estratégica?
- ✅ **Info nutricional**: ¿Expandible? ¿Tabla legible?
- ✅ **CTA Add to Cart**: ¿Tamaño táctil (44x44)? ¿Sticky?
- ✅ **Sección relacionados**: ¿Ayuda a cross-sell?

**Referencia de código**:
- `/frontend/app/product/[id].tsx` (Product detail screen)

### 4. **Carrito y Checkout**
Analiza:
- ✅ **Cart line items**: ¿Qty controls accessibles? ¿Editar/remover fácil?
- ✅ **Totales**: ¿Breakdown claro (subtotal, envío, descuentos)?
- ✅ **CTA Checkout**: ¿Contraste? ¿Disabled state claro?
- ✅ **Checkout steps**: ¿Progress indicator visible?
- ✅ **Address selection**: ¿UX de agregar nueva dirección fluido?
- ✅ **Payment methods**: ¿Íconos de tarjetas? ¿Seguridad visible?
- ✅ **Order summary**: ¿Revisión clara antes de confirmar?
- ✅ **Error states**: ¿Mensajes accionables?

**Referencia de código**:
- `/frontend/app/cart.tsx` (Cart screen)
- `/frontend/app/checkout-v2.tsx` (Checkout flow)
- `/frontend/components/CartItem.tsx`
- `/frontend/store/cartStore.ts` (Cart state logic)

### 5. **Navegación y Wayfinding**
Analiza:
- ✅ **Bottom tab navigation**: ¿Íconos + labels? ¿Active state claro?
- ✅ **Back buttons**: ¿Consistentes? ¿Safe area insets?
- ✅ **Header**: ¿Muestra contexto (username, cart badge)?
- ✅ **Deep linking**: ¿Funciona product/[id]?
- ✅ **Search**: ¿Accesible desde toda pantalla? ¿Autocomplete?

**Referencia de código**:
- `/frontend/app/_layout.tsx` (Root layout + navigation)
- `/frontend/components/ui/NavBar/BottomNavBar.tsx`
- `/frontend/components/Header.tsx`

### 6. **Estados de la Aplicación**
Analiza:
- ✅ **Loading states**: ¿Skeletons? ¿Spinners? ¿Optimistic updates?
- ✅ **Error states**: ¿Ilustraciones? ¿CTAs de recuperación (retry)?
- ✅ **Empty states**: ¿Copy amigable? ¿CTA para llenar?
- ✅ **Success states**: ¿Toasts? ¿Animaciones de confirmación?
- ✅ **Offline mode**: ¿Banner visible? ¿Funcionalidad degradada?

**Referencia de código**:
- `/frontend/components/HomeSkeleton.tsx`
- `/frontend/components/ProductCardSkeleton.tsx`
- Toast usage en `_layout.tsx` y screens

### 7. **Microinteracciones y Animaciones**
Analiza:
- ✅ **Add to cart**: ¿Feedback visual inmediato?
- ✅ **Favorite toggle**: ¿Animación corazón?
- ✅ **Filter chips**: ¿Transición al activar?
- ✅ **Scroll bounciness**: ¿Nativo en iOS?
- ✅ **Pull to refresh**: ¿Implementado donde aplica?
- ✅ **Layout shifts**: ¿Minimizados? ¿Content placeholders?
- ✅ **Performance**: ¿60fps en list scrolls?

**Referencia de código**:
- `react-native-reanimated` usage en componentes
- FlatList configs (keyExtractor, getItemLayout)

### 8. **Accesibilidad**
Analiza:
- ✅ **Touch targets**: ¿Mínimo 44x44 pts?
- ✅ **Contrast ratios**: ¿WCAG AA+ (4.5:1) para texto?
- ✅ **Screen reader**: ¿accessibilityLabel en íconos?
- ✅ **Focus order**: ¿Lógico para keyboard navigation?
- ✅ **Font scaling**: ¿Respeta Dynamic Type (iOS) / SP (Android)?
- ✅ **Color blindness**: ¿Dietary badges distinguibles sin color?

**Referencia de código**:
- Buttons/Pressables con `minHeight: 44` checks
- Text components con `accessibilityRole`

### 9. **Performance Percibido**
Analiza:
- ✅ **Time to Interactive (TTI)**: ¿App lista en <2s?
- ✅ **Image optimization**: ¿Lazy loading? ¿Placeholders?
- ✅ **Chunk loading**: ¿Code splitting en routes?
- ✅ **API caching**: ¿React Query staleTime configurado?
- ✅ **Debouncing**: ¿En search input?

**Referencia de código**:
- React Query configs en screens
- Image components (source, resizeMode)

### 10. **Consistencia del Design System**
Analiza:
- ✅ **Componentes duplicados**: ¿Existe ProductCard, ProductListItem, HorizontalProductCard? ¿Se puede unificar?
- ✅ **Spacing scale**: ¿Uso consistente de gap-{n} de Tailwind?
- ✅ **Button variants**: ¿Primary, secondary, ghost consistentes?
- ✅ **Input styles**: ¿Todos los inputs usan mismo component base?
- ✅ **Border radius**: ¿Scale definida (rounded-lg, rounded-xl)?

**Referencia de código**:
- `/frontend/components/ui/*` (Gluestack base components)
- Shared components en `/frontend/components/`

---

## 📊 Framework de Evaluación

Para cada área, proporciona:

### 🔴 **Problemas Críticos** (Bloquean conversión o son defectos graves)
- **Problema**: [Describe el issue]
- **Impacto**: [En qué afecta al usuario]
- **Evidencia**: [Archivo y línea de código]
- **Fix sugerido**: [Solución específica con snippet si aplica]
- **Prioridad**: P0 (inmediato)

### 🟡 **Mejoras Significativas** (Impactan UX/conversión notoriamente)
- **Oportunidad**: [Qué se puede mejorar]
- **Impacto**: [Beneficio esperado]
- **Evidencia**: [Archivo y línea de código]
- **Propuesta**: [Solución con ejemplos visuales o código]
- **Prioridad**: P1 (siguiente sprint)

### 🟢 **Optimizaciones Menores** (Polish, no críticas)
- **Mejora**: [Describe el detalle]
- **Impacto**: [Beneficio marginal]
- **Evidencia**: [Archivo]
- **Sugerencia**: [Quick win o puede agruparse]
- **Prioridad**: P2 (backlog)

### ✅ **Fortalezas** (Patrones que funcionan bien)
- **Qué está bien**: [Destaca lo que funciona]
- **Por qué**: [Razón de diseño/UX]
- **Ejemplo**: [Archivo de referencia]

---

## 🎯 Deliverables Esperados

### 1. **Auditoría Completa** (Documento estructurado)
- Scorecard por área (1-10)
- Lista priorizada de issues (P0, P1, P2)
- Screenshots comparativos (actual vs propuesto) cuando aplique
- Referencias específicas al código (archivos + líneas)

### 2. **Design Tokens Revisados** (Si aplica)
- Paleta de colores optimizada (contraste AA+)
- Escala tipográfica refinada
- Spacing scale consistente
- Shadow/elevation system

### 3. **Componentes a Refactorizar** (Lista)
- Componentes duplicados que se pueden unificar
- Componentes con props inconsistentes
- Oportunidades de atomic design

### 4. **Roadmap de Mejoras UX/UI** (Faseado)
- **Quick Wins** (1-2 días): Cambios de bajo esfuerzo, alto impacto
- **Short Term** (1-2 semanas): Mejoras core de UX
- **Medium Term** (1 mes): Refactors significativos
- **Long Term** (backlog): Innovaciones

### 5. **Patrones de Referencia** (Snippets de código)
- Ejemplos de componentes bien diseñados
- Anti-patterns a evitar
- Boilerplate para nuevas features

---

## 📂 Archivos Clave a Analizar

### Screens (Prioridad Alta)
```
/frontend/app/index.tsx                 # Home (hero, filtros, productos)
/frontend/app/product/[id].tsx          # Product detail page
/frontend/app/cart.tsx                  # Carrito
/frontend/app/checkout-v2.tsx           # Checkout flow
/frontend/app/orders.tsx                # Historial órdenes
/frontend/app/search.tsx                # Búsqueda
/frontend/app/wishlist.tsx              # Favoritos
```

### Componentes Compartidos (Prioridad Alta)
```
/frontend/components/ProductCard.tsx           # Card de producto (shared)
/frontend/components/ProductListItem.tsx       # Grid item wrapper
/frontend/components/HorizontalProductCard.tsx # Horizontal scroll card
/frontend/components/DietaryFilterBar.tsx      # Chips de filtros
/frontend/components/FavoriteButton.tsx        # Toggle favorito
/frontend/components/StockBadge.tsx            # Badge stock
/frontend/components/CartItem.tsx              # Item en carrito
/frontend/components/Header.tsx                # Header app
/frontend/components/ui/NavBar/BottomNavBar.tsx # Tab navigation
```

### Stores (Estado Global)
```
/frontend/store/cartStore.ts            # Lógica carrito
/frontend/store/favoritesStore.ts       # Lógica favoritos
/frontend/store/productFiltersStore.ts  # Filtros dietary
/frontend/store/preferencesStore.ts     # Preferencias usuario
/frontend/store/recentlyViewedStore.ts  # Historial productos
```

### UI System
```
/frontend/components/ui/gluestack-ui-provider/config.ts  # Tokens de diseño
/frontend/tailwind.config.js                             # Tailwind config
/frontend/global.css                                     # Estilos globales
```

### Backend Schemas (Para entender data)
```
/backend/app/schemas/product.py         # Estructura ProductResponse
/backend/app/schemas/order.py           # Estructura OrderResponse
/backend/app/db/models/product.py       # Modelo Product + dietary_tags
```

---

## 🚀 Modo de Uso

### Opción 1: Auditoría Completa
```
Analiza el codebase de HealthBytes siguiendo el framework de auditoría UX/UI.
Prioriza las áreas 1-5 (Arquitectura Visual, Descubrimiento, PDP, Carrito, Navegación).
Para cada área, identifica: problemas críticos (P0), mejoras significativas (P1), 
optimizaciones menores (P2), y fortalezas.

Entrega:
1. Scorecard por área (1-10)
2. Top 10 issues priorizados con código de referencia
3. 5 quick wins implementables en <2 días
```

### Opción 2: Auditoría Específica (e.g., Home Screen)
```
Analiza ÚNICAMENTE la experiencia de Home Screen (/frontend/app/index.tsx).
Evalúa: jerarquía visual, descubrimiento de productos, efectividad de filtros dietary,
performance de scroll, estados de loading/error/empty.

Proporciona:
- 3 problemas críticos con fix sugerido
- 5 mejoras de impacto medio con mockups o código
- Lista de fortalezas a preservar
```

### Opción 3: Auditoría de Accesibilidad
```
Audita la accesibilidad de HealthBytes contra WCAG 2.1 AA.
Evalúa: contraste de colores, tamaños táctiles, labels para screen readers,
navegación por teclado, soporte para Dynamic Type.

Entrega:
- Checklist WCAG con pass/fail por criterio
- Issues priorizados (críticos primero)
- Código de ejemplo para fixes
```

### Opción 4: Design System Consistency Check
```
Analiza la consistencia del design system.
Busca: componentes duplicados, uso inconsistente de spacing/colors/typography,
oportunidades de atomic design, props API mejorables.

Entrega:
- Lista de componentes a unificar
- Design tokens a consolidar
- Estructura de carpetas propuesta
- Ejemplos de componentes refactorizados
```

---

## 🎨 Benchmarks de Referencia

Compara contra estos e-commerce mobile de referencia:
- **Mercado Libre** (Chile): Búsqueda, filtros, product cards
- **Amazon Mobile**: PDP, checkout, estados de carga
- **Rappi**: Hero banners, categorías, favoritos
- **Cornershop**: Dietary filters, stock badges
- **iHerb**: Nutritional info, health-focused design

**Pregunta clave**: ¿Qué hace cada uno mejor que HealthBytes en X área?

---

## 📏 Métricas de Éxito UX

Al proponer mejoras, considera impacto en:
- **Conversion Rate**: % usuarios que completan compra
- **Add-to-Cart Rate**: % usuarios que agregan producto
- **Time to First Interaction**: Cuánto tarda usuario en tocar algo
- **Search Success Rate**: % búsquedas que resultan en producto visto
- **Cart Abandonment**: % usuarios que salen sin comprar
- **Bounce Rate**: % usuarios que salen tras ver <2 pantallas

---

## 🔧 Herramientas de Análisis Sugeridas

- **Contrast Checker**: [webaim.org/resources/contrastchecker/](https://webaim.org/resources/contrastchecker/)
- **Touch Target Size**: [Android: 48dp, iOS: 44pt mínimo](https://developer.android.com/guide/topics/ui/accessibility/principles)
- **Performance**: Flipper + React DevTools Profiler
- **Accesibilidad**: iOS VoiceOver / Android TalkBack
- **Design Tokens**: [tokens.studio](https://tokens.studio) para documentar

---

## ✨ Principios de Diseño HealthBytes (Referencia)

Al auditar, valida que estos principios se cumplan:

### 1. **Claridad sobre Cleverness**
Información crítica (precio, stock, dietary tags) debe ser obvia, no requerir exploración.

### 2. **Velocidad Percibida**
Skeletons, optimistic updates, y transiciones suaves > spinners genéricos.

### 3. **Confianza y Seguridad**
Usuarios con restricciones de salud necesitan certeza. Badges, certificaciones, info nutricional visible.

### 4. **Accesibilidad por Defecto**
No es feature opcional, es requisito core. Touch targets, contraste, screen readers.

### 5. **Mobile-First, Native-Feel**
No web responsive adaptado. Debe sentirse native (gestos, animaciones, safe areas).

### 6. **Consistencia > Creatividad**
Un botón debe lucir/comportarse igual en toda la app. No sorprender al usuario con patrones nuevos.

---

## 📞 Preguntas Guía para la Auditoría

Usa estas preguntas al analizar cada pantalla:

1. **Primera Impresión**: ¿Qué ve el usuario primero? ¿Es lo correcto?
2. **Jerarquía**: ¿Los elementos más importantes tienen más peso visual?
3. **Acción Primaria**: ¿Cuál es el CTA principal? ¿Es obvio?
4. **Fricción**: ¿Cuántos taps requiere completar la tarea?
5. **Feedback**: ¿El usuario sabe que su acción fue exitosa?
6. **Error Recovery**: Si algo falla, ¿el usuario sabe qué hacer?
7. **Contexto**: ¿El usuario sabe dónde está en la app?
8. **Trust**: ¿Hay señales de confianza (reviews, badges, secure checkout)?
9. **Delight**: ¿Hay momentos que sorprenden positivamente?
10. **Accessibility**: ¿Funciona con eyes closed (VoiceOver)?

---

## 🏁 Entrega Final

Al completar la auditoría, genera un **Executive Summary** con:

```markdown
## 🎯 TL;DR

**Estado General UX/UI**: [Excelente / Bueno / Necesita Mejoras / Crítico]

**Score Global**: X/10

### Top 3 Fortalezas
1. [Fortaleza + evidencia]
2. [Fortaleza + evidencia]
3. [Fortaleza + evidencia]

### Top 5 Issues Críticos (P0)
1. [Problema + archivo + fix sugerido]
2. [Problema + archivo + fix sugerido]
3. [Problema + archivo + fix sugerido]
4. [Problema + archivo + fix sugerido]
5. [Problema + archivo + fix sugerido]

### Quick Wins (Implementables este sprint)
1. [Mejora + impacto + esfuerzo estimado]
2. [Mejora + impacto + esfuerzo estimado]
3. [Mejora + impacto + esfuerzo estimado]

### Roadmap Sugerido
- **Sprint 1 (Quick Wins)**: [Lista]
- **Sprint 2-3 (Core UX)**: [Lista]
- **Backlog (Long Term)**: [Lista]
```

---

## 📚 Referencias y Recursos

- [Material Design: Touch Targets](https://m3.material.io/foundations/interaction/gestures/touch-targets)
- [iOS Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Baymard E-commerce UX Research](https://baymard.com/)
- [Laws of UX](https://lawsofux.com/)
- [React Native Performance](https://reactnative.dev/docs/performance)

---

**¿Listo para empezar la auditoría? Copia este prompt y pégalo en tu AI assistant con acceso al codebase.**
