# Fix: Cart Quantity and Sync Issues

## Fecha
2026-01-29

## Problema Reportado
El usuario reportó comportamientos extraños en el carrito:
- Cuando hay solo 1 item y hace decrement, no funciona bien, pero cuando pone 0 "vuelve".
- A veces aparecen items de repente con cantidades altas (ej: chocolate con 57 en carrito).
- Comportamiento inconsistente en sincronización.

## Análisis del Bug
- **Loading states faltantes**: Los botones de add/decrement/remove no tenían estados de loading, permitiendo clicks múltiples que causaban race conditions.
- **Rollback en decrement**: Cuando decrementaba a 0, llamaba remove, pero si fallaba, hacía rollback y el item reaparecía.
- **Sincronización problemática**: El merge entre local y server tomaba el máximo, trayendo cantidades altas de sesiones anteriores.
- **Clicks múltiples**: Sin loading, el usuario podía hacer múltiples adds, acumulando cantidades.

## Solución Implementada

### Frontend Changes
1. **Loading states en `frontend/store/cartStore.ts`**:
   - Agregué `addingProducts`, `updatingProducts`, `removingProducts` sets.
   - Modifiqué `addProduct`, `decrementProduct`, `removeProduct` para usar loading states y prevenir operaciones simultáneas.

2. **UI feedback en `frontend/components/CartItem.tsx`**:
   - Deshabilito botones cuando están en loading.
   - Cambio colores para indicar estado deshabilitado.

### Backend Changes
1. **Merge logic en `backend/app/services/cart_service.py`**:
   - Cambié de sumar cantidades (server + local) a usar cantidad local (current session takes priority).
   - Evita traer cantidades altas de sesiones anteriores.

2. **Test updates en `backend/tests/test_api/test_cart.py`**:
   - Actualicé test para esperar cantidad local en lugar de suma.

## Beneficios
- **Prevención de race conditions**: Loading states evitan clicks múltiples.
- **Mejor UX**: Feedback visual claro cuando operaciones están en progreso.
- **Consistencia**: Rollbacks solo ocurren en errores reales, no en operaciones simultáneas.
- **Sincronización mejorada**: Session actual tiene prioridad sobre datos viejos del server.
- **No más cantidades fantasma**: Evita items con cantidades inexplicables.

## Tests
- ✅ Todos los tests de cart pasan.
- ✅ TypeScript compila sin errores.
- ✅ Cobertura mantenida.

## Archivos Modificados
- `frontend/store/cartStore.ts`
- `frontend/components/CartItem.tsx`
- `backend/app/services/cart_service.py`
- `backend/tests/test_api/test_cart.py`

## Próximos Pasos
- Monitorear si persisten items con cantidades altas.
- Considerar límites máximos por producto en carrito.
- Evaluar cambiar lógica de merge (max vs sum vs local priority).