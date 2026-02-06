# Feature: Stock Button Behavior

## Fecha
2026-01-29

## Cambios
- Quité la deshabilitación del botón + cuando quantity >= stock en CartItem.
- Ahora permite intentar agregar más, y el backend valida el stock.
- Removí temporalmente el botón de "Vaciar carrito" para enfocarnos en los botones de stock.

## Beneficios
- Los botones de stock funcionan siempre, con validación en backend.
- Mejor UX: permite intentar agregar, y muestra error si no hay stock.

## Archivos Modificados
- `frontend/components/CartItem.tsx`
- `frontend/app/cart.tsx`