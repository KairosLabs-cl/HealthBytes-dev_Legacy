# 🎯 Ejemplos de Auditoría UX/UI - HealthBytes

> **Casos de uso prácticos del [UIUX_AUDIT_PROMPT.md](../../UIUX_AUDIT_PROMPT.md)**

---

## 📋 Índice de Ejemplos

1. [Auditoría Completa de Home Screen](#1-auditoría-completa-de-home-screen)
2. [Análisis de Conversión en Product Detail](#2-análisis-de-conversión-en-product-detail)
3. [Validación de Accesibilidad en Checkout](#3-validación-de-accesibilidad-en-checkout)
4. [Performance Audit en Product Listing](#4-performance-audit-en-product-listing)
5. [Design System Consistency Check](#5-design-system-consistency-check)

---

## 1. Auditoría Completa de Home Screen

### Prompt a Usar
```
Como experto en UX/UI mobile-first y e-commerce, audita la Home Screen de HealthBytes 
(/frontend/app/index.tsx) siguiendo estos criterios:

**Contexto**: Primera pantalla que ve el usuario. Debe facilitar descubrimiento de productos 
para personas con restricciones alimentarias (celiaquía, diabetes, alergias).

**Evalúa**:
1. Jerarquía Visual (Hero, Filtros, Productos)
2. Efectividad de Filtros Dietary (clickeables, feedback, estado activo)
3. Product Cards (info visible, CTA claro, stock badge)
4. Recently Viewed + Favorites (posición, engagement)
5. Performance de scroll (FlatList optimization)

**Para cada punto**:
- ✅ Qué funciona bien (con evidencia del código)
- 🔴 Problemas críticos (bloquean conversión)
- 🟡 Mejoras significativas (impacto alto-medio)
- 🟢 Optimizaciones menores (polish)

**Entrega**:
- Score 1-10 por área
- Top 3 issues priorizados con fix sugerido (código)
- 3 quick wins implementables en <2 días
- Referencias específicas a archivos y líneas
```

### Ejemplo de Respuesta Esperada

<details>
<summary><strong>📊 Score por Área</strong></summary>

| Área | Score | Justificación |
|------|-------|---------------|
| Jerarquía Visual | 7/10 | Hero banner efectivo, pero filtros dietary se pierden visualmente |
| Filtros Dietary | 6/10 | Funcionales, pero feedback visual débil al activar |
| Product Cards | 8/10 | Bien diseñadas, pero truncation inconsistente |
| Recently Viewed | 9/10 | Excelente implementación, scroll horizontal fluido |
| Performance | 7/10 | FlatList optimizado, pero imágenes sin lazy loading |

</details>

<details>
<summary><strong>🔴 Problemas Críticos</strong></summary>

#### 1. Filtros Dietary: Estado Activo Poco Visible
**Problema**: Al activar un chip de filtro dietary (e.g., "Sin Gluten"), el feedback visual es mínimo (solo border color). Usuario puede no darse cuenta si el filtro está activo.

**Archivo**: `/frontend/components/DietaryFilterBar.tsx:45-60`

**Fix Sugerido**:
```tsx
// ACTUAL: Border + text color change
<Pressable
  className={`px-3 py-2 rounded-full border ${
    isActive ? 'border-green-600 bg-green-50' : 'border-gray-300 bg-white'
  }`}
>
  <Text className={isActive ? 'text-green-700' : 'text-gray-600'}>{label}</Text>
</Pressable>

// PROPUESTO: Background fill + icon + animation
<Pressable
  className={`px-4 py-2.5 rounded-full ${
    isActive ? 'bg-green-600' : 'bg-white border border-gray-300'
  }`}
  style={{ minHeight: 44 }} // Accesibilidad
>
  <HStack space="xs">
    {isActive && <CheckCircle size={16} color="white" />}
    <Text className={isActive ? 'text-white font-semibold' : 'text-gray-600'}>
      {label}
    </Text>
  </HStack>
</Pressable>
```

**Impacto**: ↑ 15-20% en uso de filtros (más obviedad = más engagement)

---

#### 2. Hero Banner: CTA "Ver colección" No Contrasta
**Problema**: Botón blanco sobre fondo negro del hero es correcto, pero al tener productos con imágenes blancas, pueden fusionarse visualmente.

**Archivo**: `/frontend/app/index.tsx:60-70`

**Fix Sugerido**: Agregar sombra o border al botón
```tsx
<Pressable
  onPress={onViewAll}
  className="mt-3 self-start bg-white rounded-full px-5 py-3"
  style={{ 
    minHeight: 44,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4, // Android
  }}
>
  <Text className="font-semibold text-black">Ver colección</Text>
</Pressable>
```

</details>

<details>
<summary><strong>🟡 Mejoras Significativas</strong></summary>

#### 1. Product Cards: Agregar "Add to Cart" Rápido
**Oportunidad**: Permitir agregar productos al carrito directamente desde la grid, sin entrar al PDP.

**Propuesta**: Botón "+" en corner inferior derecho del card
```tsx
// En ProductCard.tsx
<View style={{ position: 'absolute', bottom: 8, right: 8 }}>
  <Pressable
    onPress={handleAddToCart}
    className="bg-green-600 rounded-full w-10 h-10 items-center justify-center"
    disabled={isOutOfStock}
  >
    <Plus size={20} color="white" />
  </Pressable>
</View>
```

**Impacto**: ↑ 10-15% en add-to-cart rate (reduce fricción)

---

#### 2. Recently Viewed: Mostrar "Visto hace X"
**Oportunidad**: Agregar contexto temporal para ayudar al usuario a recordar.

```tsx
<View className="absolute top-2 left-2 bg-black/60 rounded px-2 py-1">
  <Text className="text-xs text-white">Hace 2h</Text>
</View>
```

</details>

<details>
<summary><strong>✅ Fortalezas</strong></summary>

1. **Hero Banner Dinámico**: Excelente implementación que cambia headline según filtro activo. Ver `/frontend/app/index.tsx:33-38`
2. **FlatList Optimization**: Uso correcto de `keyExtractor`, `getItemLayout`, y `windowSize`. Ver línea 25-30.
3. **Skeleton Loaders**: HomeSkeleton bien implementado, mantiene estructura real. Ver `components/HomeSkeleton.tsx`.

</details>

---

## 2. Análisis de Conversión en Product Detail

### Prompt a Usar
```
Audita la Product Detail Page (/frontend/app/product/[id].tsx) enfocándote en CONVERSIÓN.

**Objetivo**: Maximizar add-to-cart rate. Usuario llega aquí con intención de compra.

**Evalúa**:
1. Above the fold: ¿Qué ve sin scroll?
2. Precio: ¿Prominencia? ¿Descuentos visibles?
3. Stock badge: ¿Genera urgencia?
4. CTA Add to Cart: ¿Sticky? ¿Contraste? ¿Estado disabled claro?
5. Dietary badges: ¿Posición estratégica?
6. Info nutricional: ¿Accesible? ¿Formato legible?
7. Imágenes: ¿Zoom? ¿Galería?

**Benchmarks**: Compara contra Amazon Mobile PDP.

**Entrega**:
- Heatmap visual (qué captura atención primero)
- Friction points (obstáculos para add-to-cart)
- Quick wins para ↑ conversión inmediatamente
```

### Ejemplo de Issues a Identificar

<details>
<summary><strong>🔍 Friction Points Comunes</strong></summary>

1. **CTA Add to Cart no sticky**: Usuario debe scrollear arriba para agregar.
2. **Precio pequeño**: Tipografía no destaca vs nombre producto.
3. **Stock sin urgencia**: "Últimas 3 unidades" debe ser más prominente.
4. **Info nutricional colapsada**: Usuario puede no descubrirla.
5. **Sin relacionados**: Pierde oportunidad de cross-sell.

</details>

---

## 3. Validación de Accesibilidad en Checkout

### Prompt a Usar
```
Audita el flujo de Checkout (/frontend/app/checkout-v2.tsx) contra WCAG 2.1 AA.

**Checklist**:
- [ ] Touch targets ≥44x44 pts
- [ ] Contrast ratios ≥4.5:1 para texto
- [ ] Labels en inputs (accesibilityLabel)
- [ ] Navegación por teclado lógica
- [ ] Mensajes de error anuncian via screen reader
- [ ] Focus visible en campos activos
- [ ] Botones con estado disabled anunciados

**Método**: Ejecutar iOS VoiceOver o Android TalkBack. ¿Flujo completable sin ver?

**Entrega**:
- Checklist pass/fail por criterio WCAG
- Priority issues (bloquean a usuarios con discapacidad)
- Código de fix para top 3 issues
```

### Ejemplo de Issues de Accesibilidad

<details>
<summary><strong>♿ Problemas Comunes</strong></summary>

#### 1. Input sin Label para Screen Reader
```tsx
// ❌ MAL
<InputField placeholder="Nombre completo" />

// ✅ BIEN
<InputField 
  placeholder="Nombre completo"
  accessibilityLabel="Nombre completo"
  accessibilityHint="Ingresa tu nombre y apellido"
/>
```

#### 2. Botón Disabled Sin Feedback
```tsx
// ❌ MAL: VoiceOver no anuncia por qué está disabled
<Button disabled={!isValid}>Continuar</Button>

// ✅ BIEN
<Button 
  disabled={!isValid}
  accessibilityLabel="Continuar"
  accessibilityState={{ disabled: !isValid }}
  accessibilityHint={
    !isValid ? "Completa todos los campos requeridos" : "Ir al siguiente paso"
  }
>
  Continuar
</Button>
```

#### 3. Contraste Insuficiente
```tsx
// ❌ MAL: Gray-400 on white = 2.8:1 ratio (falla AA)
<Text className="text-gray-400">Subtotal: $15.990</Text>

// ✅ BIEN: Gray-700 = 4.6:1 ratio (pasa AA)
<Text className="text-gray-700">Subtotal: $15.990</Text>
```

</details>

---

## 4. Performance Audit en Product Listing

### Prompt a Usar
```
Audita performance de scroll en Home (/frontend/app/index.tsx) y All Products.

**Métricas**:
- FPS durante scroll (objetivo: 60fps)
- Time to Interactive (TTI <2s)
- Image loading time
- Re-renders innecesarios

**Herramientas**: Flipper + React DevTools Profiler

**Evalúa**:
- FlatList: keyExtractor, getItemLayout, windowSize, removeClippedSubviews
- Images: lazy loading, placeholders, resize caching
- Memoization: useMemo, React.memo en components
- Zustand subscriptions: selective re-renders

**Entrega**:
- Flame graph de renders durante scroll
- Bottlenecks identificados (componentes lentos)
- Optimizaciones sugeridas con código
```

### Optimizaciones Comunes

<details>
<summary><strong>⚡ Performance Quick Wins</strong></summary>

#### 1. Memoizar Product Card
```tsx
// ProductListItem.tsx
export default React.memo(ProductListItem, (prev, next) => {
  return prev.product.id === next.product.id &&
         prev.product.stock === next.product.stock;
});
```

#### 2. Lazy Load Images con Placeholder
```tsx
<Image
  source={{ uri: product.image }}
  placeholder={blurhash} // Si tienes blurhash del backend
  transition={200}
  contentFit="cover"
/>
```

#### 3. Limitar Zustand Re-renders
```tsx
// ❌ MAL: Se suscribe a todo el store
const cart = useCart();

// ✅ BIEN: Solo se suscribe a itemCount
const itemCount = useCart(state => state.itemCount);
```

#### 4. Virtualized List Settings
```tsx
<FlatList
  data={products}
  keyExtractor={(item) => item.id.toString()}
  getItemLayout={(data, index) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  })}
  windowSize={10} // Renderiza 10 items fuera de viewport
  maxToRenderPerBatch={5}
  removeClippedSubviews={true}
  updateCellsBatchingPeriod={50}
/>
```

</details>

---

## 5. Design System Consistency Check

### Prompt a Usar
```
Audita consistencia del design system de HealthBytes.

**Busca**:
1. Componentes duplicados (e.g., ProductCard vs ProductListItem vs HorizontalProductCard)
2. Props API inconsistentes (misma función, nombres diferentes)
3. Spacing inconsistente (uso arbitrario de px en vez de scale)
4. Colores hardcodeados (en vez de tokens)
5. Typography sin scale (font-size arbitrarios)

**Analiza archivos**:
- /frontend/components/*.tsx (buscar duplicación)
- /frontend/components/ui/gluestack-ui-provider/config.ts (tokens)
- /frontend/tailwind.config.js (scale)

**Entrega**:
- Lista de componentes a unificar con propuesta de refactor
- Design tokens faltantes (espaciado, sombras, border-radius)
- Estructura de carpetas mejorada (atomic design)
- Snippets de componentes refactorizados
```

### Ejemplo de Refactor

<details>
<summary><strong>🔧 Unificar Product Cards</strong></summary>

#### Problema Actual
```
ProductCard.tsx         → Shared core (layout, imagen, precio)
ProductListItem.tsx     → Wrapper para grid (agrega width: 50%)
HorizontalProductCard.tsx → Casi idéntico a ProductListItem
```

#### Propuesta: Single Source of Truth
```tsx
// components/ProductCard.tsx (único componente)
export type ProductCardVariant = 'grid' | 'horizontal' | 'list';

interface ProductCardProps {
  product: Product;
  variant?: ProductCardVariant; // default: 'grid'
  onAddToCart?: () => void;
}

export const ProductCard = ({ product, variant = 'grid', onAddToCart }: ProductCardProps) => {
  const styles = {
    grid: { flex: 1, maxWidth: '50%' },
    horizontal: { width: 280 },
    list: { width: '100%' },
  }[variant];

  return (
    <View style={styles}>
      {/* Shared UI logic */}
    </View>
  );
};

// Uso en screens
<FlatList
  data={products}
  renderItem={({ item }) => <ProductCard product={item} variant="grid" />}
  numColumns={2}
/>
```

**Beneficio**: 
- ✅ Cambio de diseño en 1 lugar se propaga a todos los usos
- ✅ Menos duplicación = menos bugs
- ✅ Props API consistente

</details>

<details>
<summary><strong>🎨 Design Tokens a Consolidar</strong></summary>

```ts
// components/ui/gluestack-ui-provider/tokens.ts
export const tokens = {
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    '2xl': 48,
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    full: 9999,
  },
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOpacity: 0.05,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOpacity: 0.15,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 8 },
      elevation: 8,
    },
  },
};

// Uso en componentes
<View style={{ borderRadius: tokens.borderRadius.lg, ...tokens.shadows.md }}>
```

</details>

---

## 📊 Template de Reporte de Auditoría

Usa este template al completar cualquier auditoría:

```markdown
# 🔍 Auditoría UX/UI: [Área/Screen]

**Fecha**: [DD/MM/YYYY]
**Auditor**: [Nombre]
**Scope**: [e.g., Home Screen, Checkout Flow, Design System]
**Archivos analizados**: [Lista]

---

## 📈 Score General: X/10

| Área | Score | Peso | Notas |
|------|-------|------|-------|
| [Área 1] | X/10 | 25% | [Comentario breve] |
| [Área 2] | X/10 | 25% | [Comentario breve] |
| [Área 3] | X/10 | 25% | [Comentario breve] |
| [Área 4] | X/10 | 25% | [Comentario breve] |

---

## ✅ Fortalezas

1. **[Fortaleza]**: [Descripción] ([archivo:línea])
2. **[Fortaleza]**: [Descripción] ([archivo:línea])
3. **[Fortaleza]**: [Descripción] ([archivo:línea])

---

## 🔴 Problemas Críticos (P0)

### 1. [Título del Problema]
- **Impacto**: [Alto/Crítico] - [Descripción del impacto]
- **Archivo**: [ruta/archivo.tsx:líneas]
- **Evidencia**: [Screenshot o snippet de código]
- **Fix Sugerido**: 
  ```tsx
  // Código propuesto
  ```
- **Esfuerzo**: [Horas/días]
- **Prioridad**: P0 (Bloquea X)

---

## 🟡 Mejoras Significativas (P1)

### 1. [Título de la Mejora]
- **Impacto**: [Medio/Alto] - [Descripción del beneficio]
- **Archivo**: [ruta/archivo.tsx:líneas]
- **Propuesta**:
  ```tsx
  // Código propuesto
  ```
- **Esfuerzo**: [Horas/días]
- **Prioridad**: P1 (Next sprint)

---

## 🟢 Optimizaciones Menores (P2)

1. [Mejora breve] ([archivo]) - [Esfuerzo]
2. [Mejora breve] ([archivo]) - [Esfuerzo]
3. [Mejora breve] ([archivo]) - [Esfuerzo]

---

## 🚀 Quick Wins (Implementables <2 días)

| # | Mejora | Impacto | Esfuerzo | Prioridad |
|---|--------|---------|----------|-----------|
| 1 | [Mejora] | Alto | 2h | 🔥 |
| 2 | [Mejora] | Medio | 4h | ✨ |
| 3 | [Mejora] | Medio | 6h | ✨ |

---

## 🗓️ Roadmap Sugerido

### Sprint Actual (P0 + Quick Wins)
- [ ] [Issue P0 #1]
- [ ] [Issue P0 #2]
- [ ] [Quick Win #1]
- [ ] [Quick Win #2]

### Sprint +1 (P1 Core)
- [ ] [Mejora P1 #1]
- [ ] [Mejora P1 #2]

### Backlog (P2)
- [ ] [Optimización #1]
- [ ] [Optimización #2]

---

## 📚 Referencias
- [Link a benchmark]
- [Link a guideline WCAG]
- [Link a Figma/diseños]
```

---

## 🎯 Checklist de Auditoría Completa

Usa este checklist para asegurarte de cubrir todo:

### Visual Design
- [ ] Jerarquía visual (tamaño, color, posición)
- [ ] Espaciado consistente (usa scale)
- [ ] Tipografía (legibilidad, escala, weights)
- [ ] Paleta de colores (contraste, consistencia)
- [ ] Iconografía (claridad, tamaño consistente)
- [ ] Imágenes (calidad, aspect ratio, placeholders)

### User Experience
- [ ] Primera impresión (qué se ve first)
- [ ] Call-to-actions (claridad, contraste, tamaño)
- [ ] Navegación (intuitiva, breadcrumbs, back)
- [ ] Feedback (loading, success, error)
- [ ] Microcopy (claro, accionable, amigable)
- [ ] Flujos (fricción mínima, pasos lógicos)

### Accessibility
- [ ] Touch targets ≥44pts
- [ ] Contraste ≥4.5:1 texto
- [ ] Labels para screen readers
- [ ] Navegación por teclado
- [ ] Focus visible
- [ ] Error messages accesibles

### Performance
- [ ] Scroll 60fps
- [ ] TTI <2s
- [ ] Images lazy loading
- [ ] Memoization adecuada
- [ ] Bundle size optimizado

### Consistency
- [ ] Design tokens usados (no hardcoded values)
- [ ] Componentes no duplicados
- [ ] Props API consistente
- [ ] Patrones repetibles

---

## 📞 Soporte

¿Dudas sobre cómo usar este prompt? Consulta:
- **Prompt base**: [UIUX_AUDIT_PROMPT.md](../../UIUX_AUDIT_PROMPT.md)
- **Roadmap actual**: [UIUX_ROADMAP.md](./UIUX_ROADMAP.md)
- **Skills UX**: [mobile-design skill](.claude/skills/mobile-design/SKILL.md)
