# 🛠️ Task — Benjamin (Fullstack)

**Tarea:** Deshabilitar Features de Marketplace  
**Branch:** `refactor/disable-marketplace-features`  
**ID:** `task-20260608-benjamin-zamora-disable-marketplace-frontend`  
**Tipo:** `refactor` — PIVOTE DEL PRODUCTO (P0)

---

## 🚨 Contexto

**Problema:** No tienen capital ni convenios de transporte para cumplir entregas. Gastar en logística es prematuro sin validación.

**Solución:** Pivotar a modelo SoloTodo (discovery sin transacciones).
- Usuario busca producto apto → app muestra dónde conseguirlo físicamente
- NO checkout/pagos por ahora

**Esta tarea:** Deshabilitar (NO eliminar) features de marketplace usando feature flags.

---

## Archivos a modificar

| Archivo | Acción |
|---|---|
| `backend/app/config.py` | Agregar `MARKETPLACE_ENABLED = False` |
| `backend/app/api/v1/orders.py` | Agregar guard que retorna 503 si disabled |
| `backend/app/api/v1/payments.py` | Agregar guard que retorna 503 si disabled |
| `backend/app/middleware/feature_flags.py` | Crear middleware (opcional) |
| `frontend/app/(tabs)/cart.tsx` | Deshabilitar botón checkout |
| `frontend/app/checkout*.tsx` | Mostrar banner "Próximamente" |
| `backend/tests/test_feature_flags.py` | Tests de feature flags |

---

## Implementación Backend

### 1. Config (Feature Flag)

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

### 2. Decorator para endpoints

```python
# backend/app/core/feature_flags.py (NUEVO)
from functools import wraps
from fastapi import HTTPException, status
from app.config import settings

def require_marketplace(func):
    """
    Decorator que verifica si el marketplace está habilitado.
    Si no, retorna 503 Service Unavailable.
    """
    @wraps(func)
    async def wrapper(*args, **kwargs):
        if not settings.MARKETPLACE_ENABLED:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Marketplace features are currently disabled. Coming soon!"
            )
        return await func(*args, **kwargs)
    return wrapper
```

### 3. Aplicar a endpoints de órdenes

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
    """Crear nueva orden (DESHABILITADO POR AHORA)."""
    order = await create_new_order(db, order_data, current_user.id)
    return order

@router.get("/", response_model=list[OrderResponse])
@require_marketplace  # ← Agregar este decorator
async def get_user_orders(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Obtener órdenes del usuario (DESHABILITADO POR AHORA)."""
    orders = await get_orders_by_user(db, current_user.id)
    return orders
```

### 4. Aplicar a endpoints de pagos

```python
# backend/app/api/v1/payments.py
from app.core.feature_flags import require_marketplace

@router.post("/create-payment", response_model=PaymentResponse)
@require_marketplace  # ← Agregar este decorator
async def create_payment(
    payment_data: PaymentCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Crear pago (DESHABILITADO POR AHORA)."""
    # ... código existente ...
```

---

## Implementación Frontend

### 1. Feature flag en config

```typescript
// frontend/lib/config.ts
export const FEATURES = {
  MARKETPLACE_ENABLED: false, // Deshabilitar marketplace
  WISHLIST_ENABLED: true,
  SEARCH_ENABLED: true,
  STORE_LOCATOR_ENABLED: true, // Nueva feature
};
```

### 2. Deshabilitar botón checkout en carrito

```typescript
// frontend/app/(tabs)/cart.tsx
import { FEATURES } from '@/lib/config';

export default function CartScreen() {
  // ... código existente ...
  
  return (
    <View>
      {/* ... lista de items del carrito ... */}
      
      {FEATURES.MARKETPLACE_ENABLED ? (
        <Button onPress={handleCheckout}>
          Ir a Checkout
        </Button>
      ) : (
        <View className="p-4 bg-yellow-50 rounded-lg">
          <Text className="text-sm text-yellow-800 font-medium">
            🚧 Próximamente: Compra directa
          </Text>
          <Text className="text-xs text-yellow-700 mt-1">
            Por ahora, usa "Dónde conseguir" para encontrar estos productos en tiendas cercanas.
          </Text>
        </View>
      )}
    </View>
  );
}
```

### 3. Pantalla checkout con banner

```typescript
// frontend/app/checkout.tsx (o checkout-v2.tsx)
import { FEATURES } from '@/lib/config';
import { router } from 'expo-router';
import { useEffect } from 'react';

export default function CheckoutScreen() {
  useEffect(() => {
    // Si marketplace está disabled, redirigir al carrito con mensaje
    if (!FEATURES.MARKETPLACE_ENABLED) {
      router.replace('/(tabs)/cart');
    }
  }, []);
  
  if (!FEATURES.MARKETPLACE_ENABLED) {
    return (
      <View className="flex-1 items-center justify-center p-6">
        <Text className="text-2xl font-bold mb-4">🚧 Próximamente</Text>
        <Text className="text-center text-gray-600">
          La compra directa estará disponible pronto.
        </Text>
        <Text className="text-center text-gray-600 mt-2">
          Por ahora, usa "Dónde conseguir" para encontrar productos en tiendas cercanas.
        </Text>
        <Button onPress={() => router.back()} className="mt-6">
          Volver
        </Button>
      </View>
    );
  }
  
  // Código original de checkout (nunca se ejecuta por ahora)
  return <View>...</View>;
}
```

---

## Tests

```python
# backend/tests/test_feature_flags.py
import pytest
from httpx import AsyncClient
from app.config import settings

@pytest.mark.asyncio
async def test_orders_disabled_when_marketplace_off(client: AsyncClient, auth_headers):
    """Verifica que endpoints de órdenes retornan 503 cuando marketplace está off."""
    # Asegurar que flag está off
    original_value = settings.MARKETPLACE_ENABLED
    settings.MARKETPLACE_ENABLED = False
    
    response = await client.post(
        "/api/v1/orders",
        json={"items": []},
        headers=auth_headers
    )
    
    assert response.status_code == 503
    assert "disabled" in response.json()["detail"].lower()
    
    # Restaurar valor original
    settings.MARKETPLACE_ENABLED = original_value

@pytest.mark.asyncio
async def test_payments_disabled_when_marketplace_off(client: AsyncClient, auth_headers):
    """Verifica que endpoints de pagos retornan 503 cuando marketplace está off."""
    original_value = settings.MARKETPLACE_ENABLED
    settings.MARKETPLACE_ENABLED = False
    
    response = await client.post(
        "/api/v1/payments/create-payment",
        json={"amount": 100},
        headers=auth_headers
    )
    
    assert response.status_code == 503
    
    settings.MARKETPLACE_ENABLED = original_value
```

---

## Criterios de aceptación

### Backend:
- [ ] `MARKETPLACE_ENABLED = False` en `config.py`
- [ ] Decorator `@require_marketplace` creado en `core/feature_flags.py`
- [ ] Todos los endpoints de `/orders` protegidos con decorator
- [ ] Todos los endpoints de `/payments` protegidos con decorator
- [ ] Endpoints retornan 503 con mensaje claro cuando disabled
- [ ] Tests de feature flags pasan

### Frontend:
- [x] `FEATURES.MARKETPLACE_ENABLED = false` en config
- [x] Botón "Ir a Checkout" en carrito reemplazado por banner informativo
- [x] Pantalla checkout muestra mensaje "Próximamente" y redirige
- [x] Banner explica que deben usar "Dónde conseguir"
- [x] `pnpm run type-check` pasa sin errores

### General:
- [ ] **NADA se eliminó** — solo se deshabilitó
- [ ] Código comentado con `// TODO: Reactivar cuando marketplace esté listo`
- [ ] Documentado en `docs/product/marketplace-disabled.md`

---

## Verificación

```bash
# Backend
cd backend
pytest tests/test_feature_flags.py -v

# Intentar crear orden (debe fallar con 503)
curl -X POST http://localhost:3001/api/v1/orders \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"items": []}'

# Frontend
cd frontend
pnpm run type-check
pnpm start

# Probar en app:
# 1. Agregar productos al carrito
# 2. Ir a carrito → debe mostrar banner "Próximamente"
# 3. Botón "Checkout" NO debe existir
```

---

## Commits esperados

```
refactor(marketplace): add feature flag system for marketplace features
refactor(orders): disable order endpoints with @require_marketplace decorator
refactor(payments): disable payment endpoints with @require_marketplace decorator
refactor(cart): replace checkout button with "coming soon" banner
docs(product): document marketplace disabled state and future activation
test(features): add tests for disabled marketplace endpoints
```

---

## Documentación

Crear `docs/product/marketplace-disabled.md`:

```markdown
# Marketplace Disabled

## Estado actual

El marketplace (checkout, pagos, órdenes) está **temporalmente deshabilitado** mientras validamos el modelo de negocio.

## Por qué

- No tenemos capital para logística
- No tenemos convenios con transportistas
- No podemos cumplir entregas
- Necesitamos validar interés de usuarios primero

## Modelo actual

**SoloTodo para comida saludable:**
- Usuario busca producto apto para su condición
- App muestra dónde conseguirlo físicamente (mapa + tiendas)
- NO hay transacciones por ahora

## Cómo reactivar

Cuando estemos listos para marketplace:

1. Cambiar en `backend/app/config.py`:
   ```python
   MARKETPLACE_ENABLED: bool = True
   ```

2. Cambiar en `frontend/lib/config.ts`:
   ```typescript
   MARKETPLACE_ENABLED: true
   ```

3. Verificar que todos los tests pasen
4. Deployar
```

---

> [!IMPORTANT]
> Esta tarea es **P0** del pivote. Sin esto, seguimos prometiendo entregas que no podemos cumplir.
