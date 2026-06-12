# 🛠️ Task — Bastián (Frontend Mid)

**Tarea:** Auditoría de Accesibilidad y UX del flujo de compra
**Branch:** `fix/ux-accessibility-audit`
**ID:** `task-1779486907707`
**Skill a usar:** `.agents/skills/accessibility/SKILL.md`

---

## Objetivo

Hacer el primer pase de auditoría de accesibilidad en las pantallas críticas del flujo de compra.
No es solo detectar — **hay que corregir** lo que se encuentre.

---

## Pantallas en scope (en este orden)

| Pantalla | Archivo |
|---|---|
| Home — catálogo | `frontend/app/(tabs)/index.tsx` |
| Detalle de producto | `frontend/app/product/` |
| Carrito | `frontend/app/(tabs)/cart.tsx` |
| Checkout | `frontend/app/checkout-v2.tsx` |

## Componentes en scope

| Componente | Archivo |
|---|---|
| ProductCard | `frontend/components/ProductCard.tsx` |
| FavoriteButton | `frontend/components/FavoriteButton.tsx` |
| DietaryBadge | `frontend/components/DietaryBadge.tsx` |
| CartItem | `frontend/components/CartItem.tsx` |
| PaymentMethodSelector | `frontend/components/PaymentMethodSelector.tsx` |

---

## Qué revisar y corregir

- `accessibilityLabel` faltante en botones e imágenes
- `accessibilityRole` en elementos interactivos (`button`, `image`, `header`)
- `accessibilityState` en botones toggle (ej: FavoriteButton activo/inactivo)
- Tamaño mínimo de touch targets: **44×44pt en iOS** (usar `minHeight`/`minWidth`)
- Contraste de texto — clases `text-gray-*` sobre fondos claros/oscuros
- Orden de foco para screen readers en formularios del checkout

---

## Criterios de aceptación

- [ ] `pnpm run type-check` pasa sin errores nuevos
- [ ] Cada cambio tiene un comentario inline explicando la decisión de accesibilidad
- [ ] PR con descripción clara de qué se corrigió y por qué
- [ ] No se rompieron tests existentes: `pnpm test --passWithNoTests`

---

## Commits esperados

```
fix(a11y): add accessibilityLabel to ProductCard buttons
fix(a11y): add accessibilityState to FavoriteButton
fix(a11y): fix touch target size on CartItem quantity controls
fix(a11y): label checkout form fields correctly
```

---

## Verificación

```bash
cd frontend
pnpm run type-check
pnpm test --passWithNoTests
```

> [!IMPORTANT]
> **No hagas cambios visuales** a menos que sean necesarios para el contraste.
> Si tienes dudas sobre si un cambio rompe algo, pregúntale a nojustbenja antes de mergear.
