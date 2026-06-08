# 🛠️ Task — José (Backend Mid)

**Tarea:** Contrato end-to-end de consulta de órdenes pagadas y no pagadas
**Branch:** `fix/orders-payment-query-contract`
**ID:** `task-20260531-orders-payment-query-contract`
**Skill a usar:** `.agents/skills/systematic-debugging/SKILL.md`

---

## Objetivo

Definir y corregir el contrato del endpoint de órdenes para que el frontend pueda
distinguir correctamente entre órdenes pagadas y no pagadas. Incluir tests que
validen el comportamiento esperado.

---

## Archivos a tocar

| Acción | Archivo |
|---|---|
| **Modificar** | `backend/app/api/v1/orders.py` |
| **Modificar** | `backend/app/services/order_service.py` |
| **Revisar/modificar** | `backend/app/db/models/order.py` |
| **Revisar** | `backend/app/schemas/` (schema de orden) |
| **Crear/modificar** | `backend/tests/test_orders.py` |

---

## Comportamiento esperado

### Endpoint actual
```
GET /api/v1/orders
```

### Endpoint corregido — debe soportar filtro por estado:
```
GET /api/v1/orders              → todas las órdenes del usuario
GET /api/v1/orders?status=paid  → solo órdenes pagadas
GET /api/v1/orders?status=pending → solo órdenes sin pagar
```

### Schema de respuesta mínimo:
```json
{
  "id": "uuid",
  "status": "paid" | "pending" | "cancelled",
  "total": 0.00,
  "created_at": "ISO8601",
  "items": []
}
```

---

## Criterios de aceptación

- [ ] El endpoint acepta `?status=` como query param opcional
- [ ] Sin filtro: retorna todas las órdenes del usuario autenticado
- [ ] Con `?status=paid`: retorna solo órdenes con pago confirmado
- [ ] Con `?status=pending`: retorna solo órdenes sin pago
- [ ] Usuario sin órdenes retorna `[]` (no error 404)
- [ ] Los estados están definidos como `Enum` en el modelo, no como strings sueltos
- [ ] Tests cubren los 4 casos anteriores
- [ ] `pytest backend/tests/test_orders.py -v` pasa

---

## Tests que deben existir

```python
# test_orders.py
def test_get_all_orders_authenticated()
def test_get_paid_orders_filter()
def test_get_pending_orders_filter()
def test_get_orders_empty_user()
def test_get_orders_unauthenticated_returns_401()
```

---

## Verificación

```bash
cd backend
pytest tests/test_orders.py -v
```

---

## Commits esperados

```
refactor(orders): define OrderStatus enum in model
feat(orders): add status filter query param to GET /orders
test(orders): add contract tests for paid/pending order filtering
```

> [!IMPORTANT]
> Antes de tocar el endpoint, lee el archivo `frontend/app/orders.tsx` para entender
> qué espera el frontend exactamente. El contrato tiene que ser compatible de ambos lados.
