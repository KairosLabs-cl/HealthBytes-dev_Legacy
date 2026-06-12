# 🛠️ Task — chachoCL (DevOps - Backend)

**Tarea:** Endpoints Store Locator  
**Branch:** `feat/store-locator-api`  
**ID:** `task-20260608-chachoCL-store-endpoints`  
**Deadline:** 2026-06-20  
**Tipo:** `feat` — PIVOTE P0

---

## Objetivo

Crear endpoints para que el frontend pueda obtener:
1. Todas las tiendas (para el mapa)
2. Tiendas donde está disponible un producto específico

---

## Archivos a crear/modificar

| Archivo | Acción |
|---|---|
| `backend/app/api/v1/stores.py` | CREAR nuevo router |
| `backend/app/services/store_service.py` | CREAR lógica de negocio |
| `backend/app/main.py` | Registrar router |
| `backend/tests/test_stores_api.py` | CREAR tests |

---

## 1. Service (lógica de negocio)

```python
# backend/app/services/store_service.py (NUEVO ARCHIVO)
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload
from app.db.models.store import Store
from app.db.models.product_availability import ProductAvailability
from uuid import UUID

async def get_all_stores(db: AsyncSession) -> list[Store]:
    """
    Obtiene todas las tiendas.
    Usado para mostrar el mapa completo.
    """
    result = await db.execute(select(Store))
    return result.scalars().all()

async def get_store_by_id(db: AsyncSession, store_id: UUID) -> Store | None:
    """Obtiene una tienda por ID."""
    result = await db.execute(
        select(Store).where(Store.id == store_id)
    )
    return result.scalar_one_or_none()

async def get_stores_for_product(db: AsyncSession, product_id: UUID) -> list[Store]:
    """
    Obtiene todas las tiendas donde está disponible un producto.
    
    Retorna solo tiendas donde in_stock = True.
    """
    result = await db.execute(
        select(Store)
        .join(ProductAvailability)
        .where(
            ProductAvailability.product_id == product_id,
            ProductAvailability.in_stock == True
        )
    )
    return result.scalars().all()
```

---

## 2. Router (endpoints)

```python
# backend/app/api/v1/stores.py (NUEVO ARCHIVO)
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from app.db.database import get_db
from app.schemas.store import StoreResponse
from app.services.store_service import (
    get_all_stores,
    get_store_by_id,
    get_stores_for_product
)

router = APIRouter(prefix="/stores", tags=["stores"])

@router.get("/", response_model=list[StoreResponse])
async def list_stores(db: AsyncSession = Depends(get_db)):
    """
    Lista todas las tiendas disponibles.
    
    Usado para:
    - Mostrar mapa con todas las tiendas
    - Vista general de tiendas
    """
    stores = await get_all_stores(db)
    return stores

@router.get("/{store_id}", response_model=StoreResponse)
async def get_store(
    store_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """
    Obtiene detalle de una tienda específica.
    """
    store = await get_store_by_id(db, store_id)
    if not store:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Store {store_id} not found"
        )
    return store

# Endpoint en products router
@router.get("/products/{product_id}/stores", response_model=list[StoreResponse])
async def get_product_stores(
    product_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """
    Obtiene todas las tiendas donde está disponible un producto.
    
    Retorna solo tiendas donde el producto está en stock.
    
    Usado para:
    - Botón "¿Dónde conseguir?" en detalle de producto
    - Mostrar mapa con tiendas que tienen este producto
    """
    stores = await get_stores_for_product(db, product_id)
    return stores
```

---

## 3. Registrar router en main

```python
# backend/app/main.py
from app.api.v1 import stores  # ← Agregar import

# En la sección de routers:
app.include_router(stores.router, prefix="/api/v1")
```

---

## 4. Tests

```python
# backend/tests/test_stores_api.py (NUEVO ARCHIVO)
import pytest
from httpx import AsyncClient
from uuid import uuid4

@pytest.mark.asyncio
async def test_list_all_stores(client: AsyncClient):
    """Verifica que endpoint retorna todas las tiendas."""
    response = await client.get("/api/v1/stores")
    
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 5  # Las 5 tiendas mock
    
    # Verificar estructura
    store = data[0]
    assert "id" in store
    assert "name" in store
    assert "address" in store
    assert "lat" in store
    assert "lng" in store

@pytest.mark.asyncio
async def test_get_store_by_id(client: AsyncClient, db_session):
    """Verifica que endpoint retorna detalle de tienda."""
    # Obtener una tienda existente
    from app.db.models.store import Store
    from sqlalchemy import select
    
    result = await db_session.execute(select(Store).limit(1))
    store = result.scalar_one()
    
    response = await client.get(f"/api/v1/stores/{store.id}")
    
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == str(store.id)
    assert data["name"] == store.name

@pytest.mark.asyncio
async def test_get_store_not_found(client: AsyncClient):
    """Verifica que endpoint retorna 404 si tienda no existe."""
    fake_id = uuid4()
    response = await client.get(f"/api/v1/stores/{fake_id}")
    
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()

@pytest.mark.asyncio
async def test_get_stores_for_product(client: AsyncClient, db_session):
    """Verifica que endpoint retorna tiendas donde hay un producto."""
    # Obtener un producto que tenga availability
    from app.db.models.product import Product
    from app.db.models.product_availability import ProductAvailability
    from sqlalchemy import select
    
    result = await db_session.execute(
        select(Product)
        .join(ProductAvailability)
        .where(ProductAvailability.in_stock == True)
        .limit(1)
    )
    product = result.scalar_one()
    
    response = await client.get(f"/api/v1/products/{product.id}/stores")
    
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0  # Al menos una tienda
    
    # Verificar estructura
    store = data[0]
    assert "id" in store
    assert "name" in store
    assert "lat" in store
    assert "lng" in store

@pytest.mark.asyncio
async def test_get_stores_for_nonexistent_product(client: AsyncClient):
    """Verifica que endpoint retorna lista vacía si producto no existe."""
    fake_id = uuid4()
    response = await client.get(f"/api/v1/products/{fake_id}/stores")
    
    assert response.status_code == 200
    data = response.json()
    assert data == []  # Lista vacía, no 404
```

---

## Criterios de aceptación

- [ ] Archivo `store_service.py` creado con 3 funciones
- [ ] Router `stores.py` creado con 3 endpoints
- [ ] Router registrado en `main.py`
- [ ] `GET /api/v1/stores` retorna las 5 tiendas mock
- [ ] `GET /api/v1/stores/{id}` retorna detalle de tienda
- [ ] `GET /api/v1/stores/{id}` retorna 404 si no existe
- [ ] `GET /api/v1/products/{id}/stores` retorna tiendas con el producto
- [ ] Endpoints retornan solo tiendas donde `in_stock = True`
- [ ] Tests pasan: `pytest tests/test_stores_api.py -v`
- [ ] Swagger docs actualizados

---

## Verificación

```bash
cd backend

# Asegurar que seeds corrieron
python scripts/seed_stores_demo.py
python scripts/seed_product_availability_demo.py

# Iniciar servidor
uvicorn app.main:app --reload

# Test manual
curl http://localhost:3001/api/v1/stores | jq

# Debe retornar 5 tiendas con estructura correcta

# Test con producto
# (reemplazar PRODUCT_ID con un UUID real de tu DB)
curl http://localhost:3001/api/v1/products/PRODUCT_ID/stores | jq

# Tests
pytest tests/test_stores_api.py -v
```

---

## Commits esperados

```
feat(stores): add store service with get_all and get_by_product
feat(stores): add stores API router with 3 endpoints
feat(stores): register stores router in main app
test(stores): add comprehensive API tests for store endpoints
docs(api): update Swagger with store locator endpoints
```

---

## Coordinación con Basty001

Basty001 necesita que estos endpoints estén funcionando para poder mostrar el mapa. Coordiná con él para darle la estructura exacta del JSON que retornan.

**Ejemplo de response esperado:**
```json
[
  {
    "id": "uuid-aqui",
    "name": "NutriVida Providencia",
    "address": "Av. Providencia 2330, Providencia",
    "lat": -33.4242,
    "lng": -70.6107,
    "store_chain": "NutriVida",
    "phone": "+56 2 2345 6789",
    "hours": "Lun-Vie 9:00-21:00"
  }
]
```

---

> [!IMPORTANT]
> Estos endpoints son **críticos** para el demo. Sin ellos, el mapa de Basty001 está vacío.
