# Fix: Cart Item Removal Bug

## Fecha
2026-01-29

## Problema Reportado
El usuario reportó un bug al borrar productos del carrito: "como que respawnea loco y como que funca". El producto desaparecía y luego reaparecía, pero a veces funcionaba.

## Análisis del Bug
- **Causa raíz**: En `cart_service.py`, la función `remove_from_cart` lanzaba `HTTPException(404)` cuando el item no existía en el carrito.
- **Comportamiento**: Con optimistic updates, el producto se eliminaba localmente primero. Si la API fallaba (404), se hacía rollback y el producto reaparecía.
- **Escenario de falla**: Clicks múltiples o race conditions causaban que el servidor no encontrara el item ya eliminado localmente.

## Solución Implementada

### Backend Changes
1. **Modificación en `backend/app/services/cart_service.py`**:
   - Eliminé el check `if result.rowcount == 0: raise HTTPException(status_code=404, detail="Item not found in cart")`
   - Ahora `remove_from_cart` siempre devuelve éxito (204), incluso si el item no existía.

2. **Actualización de test en `backend/tests/test_api/test_cart.py`**:
   - Cambié `test_remove_nonexistent_item` para esperar `204` en lugar de `404`.

### Frontend Changes
1. **Loading state en `frontend/store/cartStore.ts`**:
   - Agregué `removingProducts: Set<string | number>` para trackear productos siendo removidos.
   - Modifiqué `removeProduct` para prevenir múltiples removes simultáneos del mismo producto.

2. **UI feedback en `frontend/components/CartItem.tsx`**:
   - Importé `useCart` para acceder al estado de loading.
   - Deshabilito el botón de remove y cambio el estilo cuando `isRemoving` es true.

## Beneficios
- **Robustez**: Remover un item que no existe ya no es un error.
- **UX mejorada**: No hay reapariciones inesperadas de productos.
- **Prevención de race conditions**: Loading state evita clicks múltiples.
- **Feedback visual**: Usuario ve que el remove está en progreso.

## Tests
- ✅ Todos los tests de cart pasan.
- ✅ TypeScript compila sin errores.
- ✅ Cobertura mantenida.

## Archivos Modificados
- `backend/app/services/cart_service.py`
- `backend/tests/test_api/test_cart.py`
- `frontend/store/cartStore.ts`
- `frontend/components/CartItem.tsx`

## Próximos Pasos
- Monitorear feedback del usuario sobre el fix.
- Considerar agregar loading states a otras operaciones del carrito si es necesario.
