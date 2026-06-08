# 🔍 Recon Guide — Andrés (Frontend)

> **Esta semana no escribes código.** Exploras, lees, y escribes tu reporte.
> Tu entregable al final de la semana es `docs/recon/RECON_ANDRES_SILVA_2026-06-04.md`.

---

## Tu misión esta semana

Entender cómo funciona el frontend de HealthBytes: cómo se muestra el catálogo,
cómo funciona el carrito, y cómo viajan los datos entre la app y la API.

---

## 🗂️ Archivos que DEBES leer (en este orden)

### Día 1 — Estructura general

| Archivo | Qué buscar |
|---|---|
| `frontend/app/_layout.tsx` | Cómo está organizada la navegación raíz |
| `frontend/app/(tabs)/_layout.tsx` | Qué tabs existen y cómo están nombradas |
| `frontend/app/(tabs)/index.tsx` | La pantalla Home — ¿qué carga? ¿cómo? |
| `frontend/components/Header.tsx` | El header global — props que recibe |

### Día 2 — Estado y datos

| Archivo | Qué buscar |
|---|---|
| `frontend/store/cartStore.ts` | Cómo se maneja el carrito (Zustand) |
| `frontend/store/authStore.ts` | Qué guarda la sesión del usuario |
| `frontend/store/favoritesStore.ts` | Cómo funciona wishlist |
| `frontend/api/` | ¿Qué archivos hay? ¿Cómo se llama a la API? |

### Día 3 — Componentes clave

| Archivo | Qué buscar |
|---|---|
| `frontend/components/ProductCard.tsx` | El componente más importante — ¿qué props tiene? |
| `frontend/components/DietaryBadge.tsx` | ¿Cómo se muestra que algo es apto/no apto? |
| `frontend/components/CartItem.tsx` | Cómo se renderiza un ítem del carrito |
| `frontend/app/(tabs)/cart.tsx` | La pantalla de carrito completa |

---

## Preguntas guía para tu reporte

1. ¿Cómo sabe la app si un usuario está logueado? ¿Dónde guarda ese estado?
2. Cuando entras al Home, ¿qué API se llama? ¿Cómo llegan los productos a la pantalla?
3. ¿Qué pasa cuando agregas un producto al carrito? Sigue el flujo completo.
4. ¿Qué es `DietaryBadge` y cuándo aparece en la app?
5. ¿Qué patrón de navegación usa la app (stack, tabs, modals)?

---

## Tu entregable

Copia `docs/tasks/RECON_TEMPLATE.md` → guárdalo como `docs/tasks/RECON_ANDRES_SILVA_2026-06-04.md`
y completa las 6 secciones con lo que encontraste.

**No hay respuestas incorrectas.** El reporte es para ti y para el equipo.
