# Reception and Query Reliability Verification

Fecha: 2026-05-31
Roadmap: `docs/plans/2026-05-31-reception-query-three-agent-roadmap.md`

## Estado ejecutivo

| Flujo | Estado | Resultado |
|---|---|---|
| Órdenes paid/unpaid | Bloqueado | No existe contrato canónico para colapsar múltiples pagos por orden a paid/unpaid. No se implementó semántica inferida. |
| DELETE carrito | Implementado y verificado frontend | HTTP `204 No Content` resuelve sin `json()`. Remociones de IDs distintos siguen independientes y mismo ID conserva guard in-flight. |
| Wishlist repetida | Implementado y verificado frontend | Taps del mismo producto se serializan. Rollbacks obsoletos no pisan intención posterior. `POST 409` y `DELETE 404` convergen al estado esperado. |
| Backend pytest | Bloqueado por entorno | El runner local no tiene `pytest`: `/usr/bin/python: No module named pytest`. |
| PR readiness global | Bloqueado | Falta decisión de producto para órdenes y no se pudo ejecutar backend pytest. No se abrió PR. |

## Gate Kanban

| Task ID | Agente | Columna final |
|---|---|---|
| `task-20260531-orders-payment-query-contract` | `backend-dev` | `in-progress` por bloqueo contractual |
| `task-20260531-cart-delete-response-contract` | `frontend-dev` | `done` |
| `task-20260531-wishlist-toggle-concurrency` | `frontend-dev` | `done` |

## Branches y commits

Base compartida:

```text
a22e5221c3f985d8713837f40f7f1631069d8021 chore(agents): register reception query roadmap
```

| Branch | Commit de tarea | Commit integrado | Estado |
|---|---|---|---|
| `fix/orders-payment-query-contract` | Sin commit material | No integrado | Bloqueado por contrato paid/unpaid |
| `fix/cart-delete-response-contract` | `b4c31d45e83ebf9fdd9d4d01297146fbceeb9932` | `89ffadb8fa028789746f2460c448cc9c736cad20` | Integrado primero |
| `fix/wishlist-toggle-concurrency` | `108b95b199b02d55e8ddb9de9107286e2fe0582d` | `d40e99274ba50933a12a4ff29a3e8b01650fa3fa` | Rebaseado sobre B, verificado e integrado |

## Archivos modificados

Implementación integrada:

```text
frontend/api/auth.ts
frontend/api/__tests__/cart.test.ts
frontend/app/__tests__/cartStore.test.ts
frontend/api/__tests__/favorites.test.ts
frontend/store/favoritesStore.ts
frontend/store/__tests__/favoritesStore.test.ts
```

Registro de coordinación:

```text
.agents/agents/tasks.json
docs/development/inspections/2026-05-31-reception-query-three-agent-verification.md
```

Se preservaron sin incluir los cambios ajenos existentes:

```text
frontend/package.json
frontend/pnpm-lock.yaml
```

## Causa raíz por flujo

### Órdenes

`backend/app/services/order_service.py` filtra `orders.status`, mientras pagos tienen lifecycle separado. Mercado Pago puede mover pago aprobado a `COMPLETED` y orden a `processing`. Existen múltiples pagos por orden para reintentos, sin constraint único ni regla revisada para elegir intento vigente.

Decisión de producto requerida:

1. Qué intento manda: último pago, cualquier pago completado u otra regla.
2. Cómo clasificar órdenes sin fila `payments`.
3. Tratamiento de `REFUNDED`, `FAILED`, `CANCELLED`, `PENDING` y `PROCESSING`.
4. Si una orden enviada o entregada conserva clasificación paid tras refund.

### Carrito

`frontend/api/auth.ts` validaba HTTP exitoso y luego llamaba siempre `res.json()`. Backend retorna `204 No Content` al eliminar. El parseo vacío rechazaba la promesa y activaba sincronización fallback más mensaje de error aunque el DELETE hubiera sido exitoso.

Corrección mínima: después de `throwIfNotOk`, `status === 204` retorna `undefined`; respuestas `200/201` conservan parseo JSON.

### Wishlist

`frontend/store/favoritesStore.ts` ejecutaba cada toggle concurrentemente y, ante error, restauraba un snapshot capturado al inicio. Taps rápidos podían intercalar POST/DELETE y aplicar rollbacks obsoletos.

Corrección mínima: cola por `productId`, versión por tap, UI optimista inmediata, HTTP serializado por producto y convergencia explícita para `POST 409` y `DELETE 404`.

## Evidencia TDD

| Ciclo | Comando | Resultado |
|---|---|---|
| Carrito RED | `pnpm exec jest --runInBand api/__tests__/cart.test.ts app/__tests__/cartStore.test.ts` | `1` fallo esperado, `20` pass: 204 invocaba `json()` |
| Carrito GREEN | mismo comando | `2/2` suites, `21/21` tests pass |
| Wishlist RED | `pnpm exec jest --runInBand store/__tests__/favoritesStore.test.ts` | `4` fallos esperados, `9` pass |
| Wishlist GREEN inicial | mismo comando | `1/1` suite, `13/13` tests pass |
| Wishlist stale rollback mutation RED | `pnpm exec jest --runInBand store/__tests__/favoritesStore.test.ts -t "does not apply a stale rollback"` con guarda temporalmente desactivada | `1` fallo esperado: final `false`, esperado `true` |
| Wishlist GREEN final | suite API/store enfocada | `12/12` suites, `120/120` tests pass |

## Verificación ejecutada

| Comando | Resultado |
|---|---|
| `cd backend && python -m pytest tests/test_api/test_orders.py tests/test_api/test_orders_pagination.py tests/test_services/test_order_service.py tests/test_api/test_cart.py tests/test_services/test_cart_service.py tests/test_api/test_favorites_crud.py tests/test_services/test_favorite_service.py -q` | Bloqueado antes de colección: `No module named pytest` |
| `cd backend && python -m pytest --cov=app --cov-report=term-missing --tb=short -q` | Bloqueado antes de colección: `No module named pytest` |
| `cd frontend && pnpm run type-check` | Pass |
| `cd frontend && pnpm lint` | Exit `0`: `0` errors, `196` warnings preexistentes |
| `cd frontend && pnpm test -- --runInBand` | Falla de comando documentada: Jest interpreta `--runInBand` como patrón y encuentra `0` tests |
| `cd frontend && pnpm exec jest --runInBand` | Pass: `26/26` suites, `173/173` tests |
| `git diff --check a22e5221c3f985d8713837f40f7f1631069d8021..HEAD` | Pass |
| Escaneo diff de `console.log`, `debugger`, TypeScript `any`, secretos y archivos de dependencias | Sin nuevos hallazgos |

La suite amplia frontend conserva warnings `act(...)` preexistentes desde `app/__tests__/cart.test.tsx`. No fueron ocultados ni modificados fuera de alcance.

## Veredicto Hermes

`FAIL / NO PR`.

Hermes revisó el diff real `a22e5221..HEAD`, confirmó que Agent B fue el único editor intencional de `frontend/api/auth.ts`, que cart y wishlist pasan, y que órdenes paid/unpaid sigue bloqueado por falta de contrato canónico. Su verificación enfocada frontend reportó `4/4` suites y `46/46` tests pass.

## PR readiness

No abrir PR global todavía.

Bloqueos:

1. Producto debe definir contrato canónico paid/unpaid para órdenes.
2. Entorno backend debe disponer de `pytest` para ejecutar suites enfocadas y amplias.
3. El comando frontend documentado `pnpm test -- --runInBand` debe ejecutarse como `pnpm exec jest --runInBand` o corregirse en un cambio separado.
4. El branch coordinador heredado `codex/feat-ui-redesign-pr` no cumple la convención `type/description`; las branches de tarea sí cumplen.
