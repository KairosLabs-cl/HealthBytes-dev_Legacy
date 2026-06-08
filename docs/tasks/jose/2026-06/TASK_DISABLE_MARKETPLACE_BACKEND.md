# 🛠️ Task — José (DevOps - Backend)

**Tarea:** Deshabilitar Marketplace Backend  
**Branch:** `refactor/disable-marketplace-backend`  
**ID:** `task-20260608-jose-disable-marketplace-backend`  
**Deadline:** 2026-06-20  
**Tipo:** `refactor` — PIVOTE P0

---

## Objetivo

Deshabilitar endpoints de órdenes y pagos usando un decorator de feature flag. Nada se elimina, solo se desactiva con un flag configurable.

---

## Archivos a crear/modificar

| Archivo | Acción |
|---|---|
| `backend/app/config.py` | Agregar `MARKETPLACE_ENABLED = False` |
| `backend/app/core/feature_flags.py` | CREAR decorator `@require_marketplace` |
| `backend/app/api/v1/orders.py` | Aplicar decorator a todos los endpoints |
| `backend/app/api/v1/payments.py` | Aplicar decorator a todos los endpoints |
| `backend/tests/test_feature_flags.py` | CREAR tests |

---

## 1. Config (Feature Flag)

```python
# backend/app/config.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # ... campos existentes ...
    
    # Feature flags
    MARKETPLACE_ENABLED: bool = False  # Deshabilitado por defecto
    
    class Config:
        env_file = ".env"

settings = Settings()
```

---

## 2. Decorator

```python
# backend/app/core/feature_flags.py (NUEVO ARCHIVO)
from functools import wraps
from fastapi import HTTPException, status
from app.config import settings

def require_marketplace(func):
    """
    Decorator que verifica si el marketplace está habilitado.
    Si no, retorna 503 Service Unavailable.
    
    Uso:
        @router.post("/")
        @require_marketplace
        async def create_order(...):
            ...
    """
    @wraps(func)
    async def wrapper(*args, **kwargs):
        if not settings.MARKETPLACE_ENABLED:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail={
                    "error": "Marketplace features are currently disabled",
                    "message": "We're improving our service. Coming soon!",
                    "enabled": False
                }
            )
        return await func(*args, **kwargs)
    return wrapper
```

---

## 3. Aplicar a endpoints de órdenes

```python
# backend/app/api/v1/orders.py
from app.core.feature_flags import require_marketplace

@router.post("/", response_model=OrderResponse)
@require_marketplace  # ← Agregar este decorator
async def create_order(
    order_data: OrderCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Crear nueva orden (DESHABILITADO TEMPORALMENTE)."""
    order = await create_new_order(db, order_data, current_user.id)
    return order

@router.get("/", response_model=list[OrderResponse])
@require_marketplace  # ← Agregar
async def get_user_orders(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Obtener órdenes del usuario (DESHABILITADO TEMPORALMENTE)."""
    orders = await get_orders_by_user(db, current_user.id)
    return orders

@router.get("/{order_id}", response_model=OrderResponse)
@require_marketplace  # ← Agregar
async def get_order(
    order_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Obtener detalle de orden (DESHABILITADO TEMPORALMENTE)."""
    order = await get_order_by_id(db, order_id, current_user.id)
    return order
```

---

## 4. Aplicar a endpoints de pagos

```python
# backend/app/api/v1/payments.py
from app.core.feature_flags import require_marketplace

@router.post("/create-payment", response_model=PaymentResponse)
@require_marketplace  # ← Agregar
async def create_payment(
    payment_data: PaymentCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Crear pago (DESHABILITADO TEMPORALMENTE)."""
    payment = await process_payment(db, payment_data, current_user.id)
    return payment

# Agregar decorator a TODOS los endpoints de payments
```

---

## 5. Tests

```python
# backend/tests/test_feature_flags.py (NUEVO ARCHIVO)
import pytest
from httpx import AsyncClient
from app.config import settings

@pytest.mark.asyncio
async def test_orders_disabled_when_marketplace_off(client: AsyncClient, auth_headers):
    """Verifica que crear orden retorna 503 cuando marketplace está off."""
    original = settings.MARKETPLACE_ENABLED
    settings.MARKETPLACE_ENABLED = False
    
    response = await client.post(
        "/api/v1/orders",
        json={"items": []},
        headers=auth_headers
    )
    
    assert response.status_code == 503
    data = response.json()
    assert "disabled" in data["detail"]["error"].lower()
    assert data["detail"]["enabled"] is False
    
    settings.MARKETPLACE_ENABLED = original

@pytest.mark.asyncio
async def test_orders_enabled_when_marketplace_on(client: AsyncClient, auth_headers):
    """Verifica que endpoints funcionan cuando flag está ON."""
    original = settings.MARKETPLACE_ENABLED
    settings.MARKETPLACE_ENABLED = True
    
    # Este test puede fallar por otras razones (validación, etc.)
    # pero NO debe retornar 503
    response = await client.post(
        "/api/v1/orders",
        json={"items": []},
        headers=auth_headers
    )
    
    assert response.status_code != 503
    
    settings.MARKETPLACE_ENABLED = original

@pytest.mark.asyncio
async def test_payments_disabled_when_marketplace_off(client: AsyncClient, auth_headers):
    """Verifica que pagos retorna 503 cuando marketplace está off."""
    original = settings.MARKETPLACE_ENABLED
    settings.MARKETPLACE_ENABLED = False
    
    response = await client.post(
        "/api/v1/payments/create-payment",
        json={"amount": 1000},
        headers=auth_headers
    )
    
    assert response.status_code == 503
    
    settings.MARKETPLACE_ENABLED = original
```

---

## Criterios de aceptación

- [ ] `MARKETPLACE_ENABLED = False` en `config.py`
- [ ] Archivo `backend/app/core/feature_flags.py` creado
- [ ] Decorator `@require_marketplace` funcional
- [ ] TODOS los endpoints de `/api/v1/orders` tienen el decorator
- [ ] TODOS los endpoints de `/api/v1/payments` tienen el decorator
- [ ] Endpoints retornan 503 con JSON claro cuando disabled
- [ ] Tests en `test_feature_flags.py` pasan
- [ ] `pytest tests/test_feature_flags.py -v` OK
- [ ] Swagger docs actualizados (muestra que endpoints pueden retornar 503)

---

## Verificación

```bash
cd backend

# Tests
pytest tests/test_feature_flags.py -v

# Test manual con curl
curl -X POST http://localhost:3001/api/v1/orders \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"items": []}'

# Debe retornar:
# {
#   "detail": {
#     "error": "Marketplace features are currently disabled",
#     "message": "We're improving our service. Coming soon!",
#     "enabled": false
#   }
# }
```

---

## Commits esperados

```
refactor(marketplace): add MARKETPLACE_ENABLED feature flag to config
feat(flags): create @require_marketplace decorator
refactor(orders): disable all order endpoints with @require_marketplace
refactor(payments): disable all payment endpoints with @require_marketplace
test(flags): add tests for marketplace feature flag behavior
docs(api): update Swagger docs for disabled marketplace endpoints
```

---

## Coordinación con Benjamin

Benjamin está haciendo lo mismo en el frontend. Ambos deben mergear antes de que Bastian empiece con el mapa, para que la app muestre correctamente "Próximamente" en vez de checkout.

---

> [!IMPORTANT]
> **Nada se elimina** — solo se desactiva. Cuando reactiven marketplace, simplemente cambiar `MARKETPLACE_ENABLED = True` en config.
