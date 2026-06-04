# 🎨 UI/UX Improvements

Conjunto de mejoras visuales y de experiencia de usuario implementadas para elevar la calidad de la aplicación.

## Características

### 1. Skeleton Loaders
**Componentes:** `ProductCardSkeleton`, `HomeSkeleton`
- Estado de carga visual simulando el contenido.
- Implementado en Home y Búsqueda.
- Mejora la percepción de velocidad.

### 2. Stock Badges
**Componente:** `StockBadge`
- Indicadores visuales de disponibilidad:
  - "Agotado" (Rojo)
  - "Últimas unidades" (Naranja, < 5)
  - "Disponible" (Opcional)
- Integrado en `ProductListItem`.

### 3. Empty States
**Componente:** `RecentlyViewedBar`
- Mensaje amigable cuando no hay productos vistos recientemente.
- Evita espacios en blanco confusos.
- "Aún no has visto productos. ¡Explora nuestro catálogo!"

### 4. Layering & Truncation
- **Sombra y Bordes:** Estilo sutil para diferenciar tarjetas del fondo.
- **Truncado de Texto:** Limita el nombre del producto a 2 líneas para mantener la consistencia del layout grid.

## Implementación Técnica
- **Frontend:** React Native, NativeWind (Tailwind).
- **Animaciones:** `useEffect` y `Animated` para skeletons.
