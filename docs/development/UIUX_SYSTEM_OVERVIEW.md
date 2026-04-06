# 🎨 Sistema de Auditoría UX/UI para HealthBytes

> ⚠️ **Documento Historico / Contexto**: Este documento es referencia para el diseno y auditoria del sistema. Para el estado y roadmap oficial del proyecto, por favor referirse a [PROJECT_STATUS.md](./PROJECT_STATUS.md).

> **Prompt especializado para mejorar la experiencia de usuario con asistencia de IA**

---

## 📊 ¿Qué Acabas de Recibir?

Un **sistema completo de auditoría UX/UI** diseñado específicamente para HealthBytes, que te permite usar IA (Claude, Copilot, ChatGPT) como experto en diseño mobile-first y e-commerce.

---

## 📁 Archivos Creados

### 1. **[UIUX_AUDIT_PROMPT.md](../../UIUX_AUDIT_PROMPT.md)** (Raíz del proyecto)
**El cerebro del sistema** - Prompt comprehensivo de 600+ líneas

**Contiene**:
- ✅ **10 áreas de auditoría** (Jerarquía Visual, Descubrimiento, PDP, Checkout, Navegación, Estados, Microinteracciones, Accesibilidad, Performance, Consistencia)
- ✅ **Framework de evaluación** (Problemas críticos P0, Mejoras P1, Optimizaciones P2, Fortalezas)
- ✅ **Archivos clave** del codebase a analizar (screens, components, stores)
- ✅ **Benchmarks** (Mercado Libre, Amazon, Rappi)
- ✅ **Principios de diseño** de HealthBytes
- ✅ **Métricas de éxito** (conversion rate, add-to-cart, bounce)
- ✅ **Herramientas** de análisis (contrast checker, VoiceOver, Flipper)

**Uso**: Prompt base para pegar en IA con contexto del proyecto

---

### 2. **[docs/development/UIUX_QUICK_START.md](./UIUX_QUICK_START.md)**
**La guía de acción rápida** - Comandos copy-paste

**Contiene**:
- ⚡ **Auditoría express** (15 min) - Top 3 críticos + 5 quick wins
- 🔍 **Auditorías específicas** (Home, PDP, Checkout, A11y, Performance, Design System)
- 🛠️ **Workflows** (Pre-release checklist, Feature review, Bug validation)
- 📊 **Comandos de análisis** (Jerarquía, Flujos, Estados, Contraste)
- 🎨 **Prompts de diseño** (Mockups, Paleta, Spacing)
- 📋 **Templates** de output (Issue report, Quick win, Checklists)

**Uso**: Copia comando → Pega en IA → Recibe análisis

---

### 3. **[docs/development/UIUX_AUDIT_EXAMPLES.md](./UIUX_AUDIT_EXAMPLES.md)**
**Los ejemplos prácticos** - Casos de uso detallados

**Contiene**:
- 📖 **5 casos completos** con prompts y respuestas esperadas:
  1. Auditoría Home Screen (con scores, issues, fixes)
  2. Análisis PDP (conversión)
  3. Validación Checkout (accesibilidad)
  4. Performance Audit (FPS, TTI)
  5. Design System Check (consistencia)
- ✅ **Templates de reporte** estructurados
- 📊 **Scorecards** por área
- 🔧 **Ejemplos de refactor** (código antes/después)
- ♿ **Checklist WCAG 2.1** con fixes

**Uso**: Aprende cómo se ve una auditoría completa con resultados reales

---

### 4. **Actualización en [docs/development/README.md](./README.md)**
Sección nueva "🎨 UX/UI Design & Auditoría" con referencias a los 3 documentos

---

## 🚀 Cómo Usar Este Sistema

### Opción 1: Auditoría Rápida (15 min)
```bash
1. Abre UIUX_QUICK_START.md
2. Ve a "Inicio Rápido → Auditoría Express"
3. Copia el prompt
4. Pégalo en Claude/Copilot con acceso al código
5. Recibe: Score 1-10, Top 3 críticos, Top 5 quick wins
```

---

### Opción 2: Auditoría Completa (1 hora)
```bash
1. Abre UIUX_AUDIT_PROMPT.md
2. Lee el contexto del proyecto
3. Copia "Auditoría Completa" de UIUX_QUICK_START.md
4. Pégalo en IA con acceso al workspace
5. Recibe: Scorecard 10 áreas, issues priorizados, roadmap
```

---

### Opción 3: Auditoría Específica (e.g., Home Screen)
```bash
1. Abre UIUX_QUICK_START.md
2. Ve a "Auditorías Específicas → Conversión en Home"
3. Copia el prompt
4. Pégalo en IA
5. Recibe: Friction points, quick wins, mockups/código
```

---

### Opción 4: Workflow de Feature Review (Nueva Pantalla)
```bash
1. Acabas de crear nueva pantalla
2. Abre UIUX_QUICK_START.md → "Workflow 2: Feature Review"
3. Completa [Nombre pantalla] y [Ruta archivo]
4. Pégalo en IA
5. Recibe: Validación contra estándares del proyecto
```

---

## 🎯 Casos de Uso Reales

### Caso 1: "Quiero mejorar conversión en Product Detail"
```
→ Usa: UIUX_QUICK_START.md → "PDP (Product Detail Page)"
→ Resultado: Friction points + fixes con código
→ Tiempo: 10 min
```

### Caso 2: "Necesito validar accesibilidad antes de release"
```
→ Usa: UIUX_QUICK_START.md → "Accesibilidad (WCAG 2.1)"
→ Resultado: Checklist pass/fail + P0 issues con fixes
→ Tiempo: 20 min
```

### Caso 3: "Scroll está laggy en lista de productos"
```
→ Usa: UIUX_QUICK_START.md → "Performance (FPS + TTI)"
→ Resultado: Bottlenecks + optimizaciones con código
→ Tiempo: 15 min
```

### Caso 4: "Tengo 3 componentes ProductCard que hacen lo mismo"
```
→ Usa: UIUX_QUICK_START.md → "Design System Consistency"
→ Resultado: Refactor propuesto + componente unificado
→ Tiempo: 30 min
```

### Caso 5: "¿Mi nueva pantalla cumple estándares del proyecto?"
```
→ Usa: UIUX_QUICK_START.md → "Workflow 2: Feature Review"
→ Resultado: Validación contra checkpoints (A11y, Performance, Consistency)
→ Tiempo: 10 min
```

---

## 💡 Ventajas de Este Sistema

### ✅ **Para TI** (Developer/Designer)
- ⚡ **Rapidez**: Prompts copy-paste → análisis en minutos
- 🎯 **Específico**: Adaptado a HealthBytes (stack, audiencia, goals)
- 📊 **Accionable**: No solo "esto está mal" → código de fix incluido
- 🔄 **Iterativo**: Quick wins + roadmap faseado
- 📚 **Educativo**: Aprendes principios UX mientras auditas

### ✅ **Para la IA**
- 📖 **Contexto rico**: Sabe stack, audiencia, benchmarks, goals
- 🎯 **Framework estructurado**: Sabe qué buscar y cómo reportar
- 🗂️ **Archivos claros**: Referencias específicas a código existente
- 📏 **Criterios objetivos**: WCAG, touch targets, contrast ratios
- 🚀 **Output útil**: Templates pre-definidos (no respuestas genéricas)

### ✅ **Para el Proyecto**
- 📈 **Calidad consistente**: Todos usan mismos estándares
- 🐛 **Prevención de issues**: Validation pre-commit
- 🔍 **Transparency**: Decisiones de diseño documentadas
- 🎨 **Design System sólido**: Detección de inconsistencias
- ♿ **Accesibilidad garantizada**: Checklist WCAG en cada feature

---

## 📊 Estructura del Sistema

```
UIUX_AUDIT_PROMPT.md (Raíz)
    ↓
    [Prompt base con 10 áreas + framework + contexto]
    ↓
    ├─→ UIUX_QUICK_START.md (docs/development/)
    │       ↓
    │       [Comandos copy-paste para ejecutar]
    │       ↓
    │       ├─→ Auditoría Express (15 min)
    │       ├─→ Auditorías Específicas (Home, PDP, Checkout, etc.)
    │       ├─→ Workflows (Pre-release, Feature review, Bug validation)
    │       ├─→ Análisis (Jerarquía, Flujos, Estados, Contraste)
    │       └─→ Templates (Issue report, Quick win, Checklists)
    │
    └─→ UIUX_AUDIT_EXAMPLES.md (docs/development/)
            ↓
            [Ejemplos completos con respuestas esperadas]
            ↓
            ├─→ Home Screen Audit (Score + Issues + Fixes)
            ├─→ PDP Conversión Analysis
            ├─→ Checkout A11y Validation
            ├─→ Performance Bottlenecks
            └─→ Design System Consistency
```

---

## 🎨 Áreas de Auditoría Cubiertas

### 1. **Arquitectura Visual y Jerarquía**
- Jerarquía de información (peso visual correcto)
- Espaciado (whitespace guide attention)
- Tipografía (scale consistente, legibilidad)
- Colores (contraste WCAG AA, distinguibilidad)
- Iconografía (claridad, consistencia)

### 2. **Descubrimiento de Productos (Home)**
- Hero banner (copy, CTA visibility)
- Filtros dietary (accesibilidad, feedback)
- Product cards (info surfaced, layout)
- Recently Viewed (reengagement)
- Scroll performance (FlatList optimization)

### 3. **Product Detail Page (PDP)**
- Galería (zoom, swipe)
- Stock indicators (urgencia)
- Precio (prominencia, descuentos)
- CTA Add to Cart (sticky, contraste, accesibilidad)
- Info nutricional (accesibilidad)

### 4. **Carrito y Checkout**
- Cart line items (qty controls, edición)
- Totales (breakdown claro)
- Checkout steps (progress indicator)
- Address selection (UX fluida)
- Payment methods (seguridad visible)
- Error handling (mensajes accionables)

### 5. **Navegación**
- Bottom tab navigation (íconos + labels, active state)
- Back buttons (consistencia, safe areas)
- Header (contexto, badges)
- Deep linking (funcionalidad)
- Search (accesibilidad, autocomplete)

### 6. **Estados de la Aplicación**
- Loading (skeletons, optimistic updates)
- Error (ilustraciones, retry CTAs)
- Empty (copy amigable, fill CTAs)
- Success (toasts, animaciones)
- Offline (banner, funcionalidad degradada)

### 7. **Microinteracciones**
- Add to cart (feedback inmediato)
- Favorite toggle (animación)
- Filter chips (transición)
- Pull to refresh
- Layout shifts (minimizados)
- Performance (60fps)

### 8. **Accesibilidad**
- Touch targets (≥44x44 pts)
- Contrast ratios (≥4.5:1 WCAG AA)
- Screen reader (accessibilityLabel)
- Focus order (keyboard navigation)
- Font scaling (Dynamic Type/SP)
- Color blindness (distinguibilidad sin color)

### 9. **Performance Percibido**
- Time to Interactive (TTI <2s)
- Image optimization (lazy load, placeholders)
- Code splitting (routes)
- API caching (React Query staleTime)
- Debouncing (search input)

### 10. **Consistencia Design System**
- Componentes duplicados (unificación)
- Spacing scale (uso consistente)
- Button variants (tipología)
- Input styles (componente base)
- Border radius (escala definida)

---

## 📚 Recursos Incluidos

### Benchmarks de Referencia
- **Mercado Libre** (Chile): Búsqueda, filtros, product cards
- **Amazon Mobile**: PDP, checkout, loading states
- **Rappi**: Hero banners, categorías, favoritos
- **Cornershop**: Dietary filters, stock badges
- **iHerb**: Nutritional info, health-focused design

### Herramientas de Validación
- **Contrast Checker**: [webaim.org/resources/contrastchecker/](https://webaim.org/resources/contrastchecker/)
- **Touch Target Guide**: [Android 48dp, iOS 44pt](https://developer.android.com/guide/topics/ui/accessibility/principles)
- **Performance**: Flipper + React DevTools Profiler
- **A11y Testing**: iOS VoiceOver / Android TalkBack
- **Design Tokens**: [tokens.studio](https://tokens.studio)

### Métricas de Éxito UX
- **Conversion Rate**: % usuarios que completan compra
- **Add-to-Cart Rate**: % usuarios que agregan producto
- **Time to First Interaction**: Cuánto tarda en tocar algo
- **Search Success Rate**: % búsquedas → producto visto
- **Cart Abandonment**: % usuarios que salen sin comprar
- **Bounce Rate**: % usuarios que salen tras <2 pantallas

---

## 🎯 Próximos Pasos Sugeridos

### Paso 1: Familiarízate (5 min)
```
1. Lee este README
2. Abre UIUX_QUICK_START.md
3. Ve las secciones principales
```

### Paso 2: Prueba una Auditoría Rápida (15 min)
```
1. Copia "Auditoría Express" de UIUX_QUICK_START.md
2. Pégalo en Claude/Copilot con acceso al workspace
3. Revisa el resultado (score, issues, quick wins)
```

### Paso 3: Implementa un Quick Win (1 hora)
```
1. Toma uno de los quick wins sugeridos
2. Implementa el fix (código ya viene en la respuesta)
3. Valida visualmente
4. Commit
```

### Paso 4: Auditoría Completa (1 hora)
```
1. Usa "Auditoría Completa" de UIUX_QUICK_START.md
2. Recibe scorecard + roadmap faseado
3. Prioriza issues (P0 → P1 → P2)
4. Crea tickets en backlog
```

### Paso 5: Integra en Workflow (continuo)
```
1. Pre-commit: Usa checklist de UIUX_QUICK_START.md
2. Feature review: Valida nueva pantalla contra estándares
3. Pre-release: Ejecuta checklist de bloqueos
4. Post-release: Analiza métricas (conversion, bounce)
```

---

## 💬 Ejemplos de Prompts de Inicio

### Para Empezar
```
Lee el contexto en UIUX_AUDIT_PROMPT.md y dame un overview del sistema de auditoría UX/UI de HealthBytes.

Lista las 10 áreas que cubre y explica qué tipo de issues detecta en cada una.
```

### Para Auditar Rápido
```
Ejecuta auditoría express de HealthBytes (15 min).

Analiza:
- Home Screen (index.tsx)
- Product Card (ProductCard.tsx)
- Checkout (checkout-v2.tsx)

Entrega:
- Score 1-10
- Top 3 críticos con fix
- Top 5 quick wins (<2 días)
```

### Para Feature Nueva
```
Validar nueva feature: [Pantalla de Direcciones]
Archivo: /frontend/app/addresses.tsx

Valida contra estándares de HealthBytes:
1. Visual consistency (componentes, spacing, colores)
2. UX patterns (loading, error, empty states)
3. Accesibilidad (touch targets, contraste, labels)
4. Performance (memo, lazy load, React Query)

Identifica desviaciones de estándares.
```

---

## 🔗 Enlaces Rápidos

- **Prompt completo**: [UIUX_AUDIT_PROMPT.md](../../UIUX_AUDIT_PROMPT.md)
- **Guía rápida**: [UIUX_QUICK_START.md](./UIUX_QUICK_START.md)
- **Ejemplos**: [UIUX_AUDIT_EXAMPLES.md](./UIUX_AUDIT_EXAMPLES.md)
- **Roadmap UX actual**: [UIUX_ROADMAP.md](./UIUX_ROADMAP.md)
- **Skills mobile**: [.claude/skills/mobile-design/SKILL.md](../../.claude/skills/mobile-design/SKILL.md)

---

## ✨ Resumen

Has recibido un **sistema de auditoría UX/UI de nivel profesional** que:

✅ Está **especializado** en HealthBytes (e-commerce mobile salud)  
✅ Cubre **10 áreas clave** (Visual → A11y → Performance)  
✅ Usa **IA como experto** (prompts optimizados)  
✅ Es **accionable** (código de fix incluido)  
✅ Es **rápido** (express 15 min, completo 1h)  
✅ Es **educativo** (aprendes principios UX)  
✅ Está **listo para usar** (copy-paste y go)

---

**¿Listo para mejorar la UX/UI de HealthBytes?**

👉 **Empieza aquí**: [UIUX_QUICK_START.md](./UIUX_QUICK_START.md) → Sección "Inicio Rápido"
