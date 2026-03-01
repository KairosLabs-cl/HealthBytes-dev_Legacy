# ⚡ Guía Rápida: Auditoría UX/UI con IA

> **Comandos copy-paste para auditar HealthBytes con IA**

---

## 🚀 Inicio Rápido

### 1. Auditoría Express (15 min)
Copia y pega en tu AI assistant:

```
Lee el contexto en UIUX_AUDIT_PROMPT.md y realiza una auditoría express de HealthBytes.

Enfócate en:
1. Home Screen (/frontend/app/index.tsx)
2. Product Card (/frontend/components/ProductCard.tsx)
3. Checkout Flow (/frontend/app/checkout-v2.tsx)

Identifica:
- Top 3 problemas críticos (P0) con fix
- Top 5 quick wins (<2 días implementación)
- Score general 1-10

Estructura tu respuesta como:
## 🎯 Score: X/10
## 🔴 Top 3 Críticos
## ⚡ Top 5 Quick Wins
```

---

### 2. Auditoría Completa (1 hora)
```
Lee UIUX_AUDIT_PROMPT.md y ejecuta auditoría completa de HealthBytes.

Analiza todas las áreas:
1. Arquitectura Visual y Jerarquía
2. Descubrimiento de Productos (Home)
3. Product Detail Page
4. Carrito y Checkout
5. Navegación
6. Estados (loading, error, empty)
7. Microinteracciones
8. Accesibilidad
9. Performance
10. Consistencia Design System

Para cada área:
- Score 1-10
- Fortalezas ✅
- Problemas críticos 🔴 (con código)
- Mejoras significativas 🟡 (con código)
- Optimizaciones menores 🟢

Usa el template de reporte en UIUX_AUDIT_EXAMPLES.md
```

---

## 🎯 Auditorías Específicas

### Conversión en Home
```
Audita Home Screen (/frontend/app/index.tsx) enfocándote en DESCUBRIMIENTO.

Evalúa:
1. Hero Banner: ¿Headline atractivo? ¿CTA visible?
2. Filtros Dietary: ¿Fáciles de activar? ¿Feedback visual?
3. Product Grid: ¿Info suficiente para decidir? ¿CTA claro?
4. Recently Viewed: ¿Genera reengagement?
5. Performance: ¿Scroll fluido?

Benchmark: Compara contra Mercado Libre / Amazon móvil.

Entrega:
- Friction points (obstáculos para explorar productos)
- Quick wins para ↑ engagement
- Mockups o código de mejoras propuestas
```

---

### PDP (Product Detail Page)
```
Audita Product Detail (/frontend/app/product/[id].tsx) enfocándote en CONVERSIÓN.

Usuario llegó aquí con intención de compra. Objetivos:
1. ↑ Add-to-Cart rate
2. ↓ Bounce rate
3. ↑ Trust (badges, info nutricional)

Evalúa:
- Above the fold: ¿Qué ve sin scroll?
- Precio: ¿Prominencia?
- Stock: ¿Genera urgencia?
- CTA: ¿Sticky? ¿Contraste?
- Info nutricional: ¿Accesible?

Compara contra Amazon móvil PDP.

Identifica friction points y propón fixes con código.
```

---

### Checkout (Conversión)
```
Audita Checkout (/frontend/app/checkout-v2.tsx) enfocándote en REDUCIR ABANDONO.

Métricas clave:
- ↓ Cart abandonment
- ↑ Checkout completion rate

Evalúa:
1. Progress indicator: ¿Usuario sabe en qué paso está?
2. Address selection: ¿Fluido agregar nueva?
3. Payment methods: ¿Opciones claras? ¿Seguridad visible?
4. Order summary: ¿Precios desglosados?
5. Error handling: ¿Mensajes accionables?

Identifica friction points (cada campo extra = -10% conversión).

Propón simplificaciones con código.
```

---

### Accesibilidad (WCAG 2.1)
```
Audita accesibilidad de HealthBytes contra WCAG 2.1 AA.

Prioriza:
1. Home (/frontend/app/index.tsx)
2. Product Detail (/frontend/app/product/[id].tsx)
3. Checkout (/frontend/app/checkout-v2.tsx)

Checklist:
- [ ] Touch targets ≥44x44 pts
- [ ] Contraste ≥4.5:1 para texto
- [ ] accessibilityLabel en iconos
- [ ] Navegación por teclado lógica
- [ ] Screen reader (VoiceOver/TalkBack)
- [ ] Dynamic Type support

Para cada fail:
- Archivo:línea
- Criterio WCAG fallado
- Fix con código

Prioriza P0 (bloquea a usuarios con discapacidad).
```

---

### Performance (FPS + TTI)
```
Audita performance de product listing.

Archivos:
- /frontend/app/index.tsx (Home)
- /frontend/app/all-products.tsx
- /frontend/components/ProductCard.tsx

Métricas objetivo:
- Scroll 60fps ✅
- TTI <2s ✅
- Image load <500ms ✅

Evalúa:
- FlatList optimization (keyExtractor, getItemLayout, windowSize)
- Image lazy loading + placeholders
- Memoization (React.memo, useMemo, useCallback)
- Zustand selective subscriptions
- Re-renders innecesarios

Identifica bottlenecks y propón optimizaciones con código.
```

---

### Design System Consistency
```
Audita consistencia del design system.

Busca:
1. Componentes duplicados a unificar
   (e.g., ProductCard vs ProductListItem vs HorizontalProductCard)
2. Props API inconsistentes
3. Colores hardcodeados (no tokens)
4. Spacing arbitrario (no usa scale)
5. Typography sin scale

Analiza:
- /frontend/components/*.tsx
- /frontend/components/ui/gluestack-ui-provider/config.ts
- /frontend/tailwind.config.js

Propón:
- Refactor de componentes duplicados (código)
- Design tokens faltantes
- Estructura de carpetas atomic design
```

---

## 🛠️ Workflows de Auditoría

### Workflow 1: Pre-Release Checklist
```
Ejecuta auditoría pre-release de HealthBytes.

Valida que:
✅ No hay P0 bloqueantes
✅ Accesibilidad WCAG AA cumplida
✅ Performance 60fps en scroll
✅ Todos los CTAs tienen minHeight: 44
✅ Textos tienen contraste ≥4.5:1
✅ Loading states implementados
✅ Error states con recovery CTAs
✅ Empty states amigables

Para cada fail:
- Prioridad (P0/P1/P2)
- Bloqueante para release? (Sí/No)
- Fix sugerido

Genera checklist de release.
```

---

### Workflow 2: Feature Review (Nueva Pantalla)
```
Nueva feature: [Nombre de la pantalla]
Archivo: [Ruta del archivo]

Audita contra estándares de HealthBytes:

1. **Visual Consistency**
   - ¿Usa componentes de /components/ui/?
   - ¿Respeta spacing scale (gap-{n})?
   - ¿Colores son tokens, no hardcoded?

2. **UX Patterns**
   - ¿Loading state con skeleton?
   - ¿Error state con retry CTA?
   - ¿Empty state amigable?

3. **Accesibilidad**
   - ¿Touch targets ≥44pts?
   - ¿Contraste WCAG AA?
   - ¿Labels para screen reader?

4. **Performance**
   - ¿Componentes memo'd?
   - ¿Images lazy loaded?
   - ¿API calls con React Query?

Identifica desviaciones de estándares del proyecto.
```

---

### Workflow 3: Bug Fix Validation
```
Bug reportado: [Descripción del bug]
Fix aplicado en: [Archivo:líneas]

Valida que el fix:
1. ✅ Resuelve el issue original
2. ✅ No rompe accesibilidad
3. ✅ No degrada performance
4. ✅ Mantiene consistencia visual
5. ✅ Tiene tests (si aplica)

Además, busca:
- ¿Este bug existe en otros lugares? (code search)
- ¿El fix se puede generalizar en un component?
- ¿Hay oportunidad de prevenir con types/lint?

Propón improvements preventivos.
```

---

## 📊 Comandos de Análisis Específicos

### Analizar Jerarquía Visual
```
Analiza jerarquía visual en [Pantalla].

Usuario debe ver en este orden:
1. [Elemento más importante]
2. [Elemento secundario]
3. [Elemento terciario]

¿El peso visual (tamaño, color, posición) refleja esto?

Identifica:
- Elementos que compiten por atención
- CTAs que no destacan
- Información crítica escondida

Propón ajustes (font-size, font-weight, color, spacing).
```

---

### Analizar Flujo de Usuario
```
Mapea el flujo de usuario para [Tarea].

Ejemplo: "Usuario quiere comprar producto sin gluten"

Flujo actual:
1. [Paso 1 - pantalla/acción]
2. [Paso 2 - pantalla/acción]
3. [...]

Para cada paso:
- ¿Es necesario?
- ¿Se puede simplificar?
- ¿Hay friction (formularios, validaciones)?

Propón flujo optimizado y identifica quick wins.
```

---

### Analizar Estados (Loading/Error/Empty)
```
Audita manejo de estados en [Pantalla].

Para cada estado:

**Loading**:
- ¿Skeleton o spinner?
- ¿Mantiene estructura de layout?
- ¿Duración aceptable?

**Error**:
- ¿Mensaje accionable?
- ¿CTA de retry/recovery?
- ¿Ilustración amigable?

**Empty**:
- ¿Copy motivador?
- ¿CTA para llenar?
- ¿Ilustración?

**Success**:
- ¿Feedback inmediato?
- ¿Animación sutil?
- ¿Toast o modal?

Identifica estados faltantes o mal implementados.
```

---

### Analizar Contraste (Accesibilidad)
```
Audita contraste de colores en [Pantalla].

Para cada combinación de texto/background:
- Calcula contrast ratio
- Valida contra WCAG AA (4.5:1 texto, 3:1 UI)
- Identifica fails

Archivos a revisar:
- [Pantalla].tsx
- /components/ui/gluestack-ui-provider/config.ts

Propón colores alternativos que pasen AA manteniendo brand.
```

---

## 🎨 Prompts de Diseño Visual

### Generate Mockup Comparativo
```
Genera mockup comparativo (Actual vs Propuesto) para [Mejora].

Actual:
[Describe estado actual o pega snippet de código]

Propuesta:
[Describe mejora]

Genera:
1. Pseudo-código del componente propuesto
2. Breakdown de cambios (tipografía, colores, spacing)
3. Justificación UX (por qué mejora)
4. Implementación en React Native (código)

Formato: Side-by-side comparison
```

---

### Sugerir Paleta de Colores
```
Revisa paleta de colores de HealthBytes.

Actual: /frontend/components/ui/gluestack-ui-provider/config.ts

Evalúa:
- ¿Contraste suficiente para accesibilidad?
- ¿Colores semánticos claros (success, warning, error)?
- ¿Dietary tags distinguibles?
- ¿Scale consistente (50-900)?

Propón mejoras manteniendo brand (salud, confianza, frescura).

Genera:
- Paleta optimizada (RGB/Hex)
- Validación WCAG
- Código para config.ts
```

---

### Optimizar Spacing Scale
```
Audita uso de spacing en [Pantalla].

Busca:
- Valores hardcoded (paddingHorizontal: 17) → debe ser gap-{n}
- Inconsistencias (gap-3 en un lugar, gap-5 en otro similar)
- Falta de respiro (elementos pegados)

Scale recomendado (Tailwind):
- xs: 4px  | sm: 8px  | md: 16px
- lg: 24px | xl: 32px | 2xl: 48px

Propón refactor para usar scale consistentemente.
```

---

## 🔍 Análisis Comparativo

### Benchmark contra Competencia
```
Compara [Feature de HealthBytes] contra [Competencia].

Competencia: [e.g., Mercado Libre, Amazon, Rappi]
Feature: [e.g., Product Cards, Checkout, Search]

Analiza:
1. ¿Qué hace la competencia mejor?
2. ¿Qué hace HealthBytes mejor?
3. ¿Qué se puede adaptar sin copiar?

Propón mejoras inspiradas en best practices.
```

---

## 📋 Templates de Output

### Template: Issue Report
```markdown
## 🔴 [Título del Issue]

**Archivo**: [ruta:líneas]
**Categoría**: [Visual/UX/Accessibility/Performance]
**Prioridad**: [P0/P1/P2]

### Problema
[Descripción clara del issue]

### Impacto
- **Usuario**: [Cómo afecta la experiencia]
- **Negocio**: [Impacto en conversión/engagement]
- **Métrica**: [e.g., -15% add-to-cart rate]

### Código Actual
```tsx
[Snippet del código problemático]
```

### Fix Propuesto
```tsx
[Snippet del código corregido]
```

### Validación
- [ ] Mantiene accesibilidad
- [ ] No degrada performance
- [ ] Consistente con design system

**Esfuerzo estimado**: [Horas]
```

---

### Template: Quick Win
```markdown
## ⚡ [Título del Quick Win]

**Impacto**: [Alto/Medio] - [Descripción]
**Esfuerzo**: [<2h / 2-4h / 4-8h]
**ROI**: [Alto/Medio/Bajo]

### Cambio
[Descripción breve del cambio]

### Implementación
```tsx
[Código listo para copy-paste]
```

### Antes/Después
- **Antes**: [Comportamiento actual]
- **Después**: [Comportamiento mejorado]

### Testing
- [ ] Visual: [Qué validar]
- [ ] Funcional: [Qué probar]
- [ ] A11y: [Qué verificar]
```

---

## 🎯 Checklists

### Pre-Commit Checklist (Frontend)
```markdown
Antes de commit, valida:

**Visual**
- [ ] Respeta spacing scale (gap-{n})
- [ ] Usa tokens de color (no hardcoded)
- [ ] Tipografía consistente (text-{size}-{weight})

**UX**
- [ ] Loading state implementado
- [ ] Error state con retry
- [ ] Empty state amigable

**A11y**
- [ ] Touch targets ≥44x44
- [ ] Contraste ≥4.5:1
- [ ] accessibilityLabel en iconos

**Performance**
- [ ] Componentes memo'd si aplica
- [ ] Images con lazy load
- [ ] No console.logs

**Code Quality**
- [ ] No TypeScript `any`
- [ ] Props tipadas
- [ ] No imports no usados
```

---

## 📞 Comandos de Soporte

### Explicar Decisión de Diseño
```
¿Por qué [Decisión de diseño] en HealthBytes?

Ejemplo: "¿Por qué hero banner es negro en vez de blanco?"

Analiza:
1. Contexto del proyecto (e-commerce salud)
2. Audiencia (personas con restricciones)
3. Jerarquía visual (destacar CTA)
4. Benchmark (qué hace competencia)

Proporciona justificación basada en principios UX.
```

---

### Sugerir Alternativas
```
Propón 3 alternativas de diseño para [Componente/Pantalla].

Para cada alternativa:
1. Mockup (pseudo-código o descripción)
2. Pros/Cons
3. Impacto en UX
4. Esfuerzo de implementación

Recomienda la mejor opción con justificación.
```

---

## 🚀 Uso con Copilot/Claude

### En VS Code con Copilot
1. Abre el archivo a auditar
2. Selecciona código relevante
3. Abre Copilot Chat
4. Pega prompt de esta guía
5. Referencia: `@workspace UIUX_AUDIT_PROMPT.md`

### En Claude.ai
1. Sube archivos relevantes (screens, components)
2. Pega contexto de `UIUX_AUDIT_PROMPT.md`
3. Usa prompts de esta guía
4. Itera sobre feedback

### En Cursor
1. Cmd/Ctrl+K en archivo
2. Pega prompt
3. Referencia `UIUX_AUDIT_PROMPT.md`

---

## 📚 Recursos Adicionales

- **Prompt completo**: [UIUX_AUDIT_PROMPT.md](../../UIUX_AUDIT_PROMPT.md)
- **Ejemplos detallados**: [UIUX_AUDIT_EXAMPLES.md](./UIUX_AUDIT_EXAMPLES.md)
- **Roadmap actual**: [UIUX_ROADMAP.md](./UIUX_ROADMAP.md)
- **Mobile design skill**: [.claude/skills/mobile-design/SKILL.md](../../.claude/skills/mobile-design/SKILL.md)

---

**¿Listo para auditar? Copia cualquier prompt de esta guía y pégalo en tu AI assistant.**
