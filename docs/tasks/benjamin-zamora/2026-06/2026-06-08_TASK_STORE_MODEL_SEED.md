# 🛠️ Task — Benjamin (Fullstack)

**Tarea:** Modelo Store + ProductAvailability + Seed 5 Tiendas Mock  
**Branch:** `feat/store-model-demo`  
**ID:** `task-20260608-benjamin-zamora-store-model-seed`  
**Deadline:** 2026-06-20 (2 semanas)  
**Tipo:** `feat` — PIVOTE P0

---

## Objetivo

Crear el modelo de datos para tiendas físicas y poblar la DB con 5 tiendas mock realistas en Santiago para la demo.

---

## Archivos a crear/modificar

| Archivo | Acción |
|---|---|
| `backend/app/db/models/store.py` | CREAR modelo Store |
| `backend/app/db/models/product_availability.py` | CREAR relación many-to-many |
| `backend/app/schemas/store.py` | CREAR Pydantic schemas |
| `backend/scripts/seed_stores_demo.py` | CREAR seed 5 tiendas |
| `backend/scripts/seed_product_availability_demo.py` | CREAR seed availability |
| `backend/alembic/versions/` | Migración autogenerada |

---

## 1. Modelo Store

```python
# backend/app/db/models/store.py
from sqlalchemy import Column, String, Float, UUID
from sqlalchemy.dialects.postgresql import UUID as PostgresUUID
from app.db.database import Base
import uuid

class Store(Base):
    """
    Modelo de tienda física.
    Para el pivote SoloTodo: muestra dónde conseguir productos.
    """
    __tablename__ = "stores"

    id = Column(PostgresUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(200), nullable=False)  # "NutriVida Providencia"
    address = Column(String(300), nullable=False)  # "Av. Providencia 2330, Providencia"
    lat = Column(Float, nullable=False)  # -33.4242
    lng = Column(Float, nullable=False)  # -70.6107
    store_chain = Column(String(100), nullable=True)  # "NutriVida"
    phone = Column(String(50), nullable=True)  # "+56 2 2345 6789"
    hours = Column(String(200), nullable=True)  # "Lun-Vie 9:00-21:00"
    
    def __repr__(self):
        return f"<Store {self.name}>"
```

---

## 2. Modelo ProductAvailability

```python
# backend/app/db/models/product_availability.py
from sqlalchemy import Column, ForeignKey, Boolean, Numeric, DateTime, UUID
from sqlalchemy.dialects.postgresql import UUID as PostgresUUID
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.database import Base
import uuid

class ProductAvailability(Base):
    """
    Relación many-to-many entre Product y Store.
    Indica en qué tiendas está disponible cada producto.
    """
    __tablename__ = "product_availability"

    id = Column(PostgresUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    product_id = Column(PostgresUUID(as_uuid=True), ForeignKey("products.id"), nullable=False)
    store_id = Column(PostgresUUID(as_uuid=True), ForeignKey("stores.id"), nullable=False)
    
    in_stock = Column(Boolean, default=True)  # Disponible o no
    price = Column(Numeric(10, 2), nullable=True)  # Precio en esta tienda (opcional)
    last_verified = Column(DateTime, default=datetime.utcnow)  # Última vez verificado
    
    # Relationships
    product = relationship("Product", backref="availability")
    store = relationship("Store", backref="products_available")
    
    def __repr__(self):
        return f"<ProductAvailability product={self.product_id} store={self.store_id}>"
```

---

## 3. Pydantic Schemas

```python
# backend/app/schemas/store.py
from pydantic import BaseModel, Field
from uuid import UUID
from typing import Optional

class StoreBase(BaseModel):
    name: str = Field(..., example="NutriVida Providencia")
    address: str = Field(..., example="Av. Providencia 2330, Providencia")
    lat: float = Field(..., example=-33.4242)
    lng: float = Field(..., example=-70.6107)
    store_chain: Optional[str] = Field(None, example="NutriVida")
    phone: Optional[str] = Field(None, example="+56 2 2345 6789")
    hours: Optional[str] = Field(None, example="Lun-Vie 9:00-21:00")

class StoreResponse(StoreBase):
    id: UUID
    
    class Config:
        from_attributes = True

class ProductAvailabilityResponse(BaseModel):
    store: StoreResponse
    in_stock: bool
    price: Optional[float] = None
    last_verified: str  # ISO8601 datetime
    
    class Config:
        from_attributes = True
```

---

## 4. Seed 5 Tiendas Mock

```python
# backend/scripts/seed_stores_demo.py
"""
Seed 5 tiendas demo para el pivote SoloTodo.
Tiendas inventadas pero realistas en Santiago.
"""
import asyncio
from app.db.models.store import Store
from app.db.database import AsyncSessionLocal

async def seed_demo_stores():
    """Poblar DB con 5 tiendas mock en Santiago."""
    async with AsyncSessionLocal() as db:
        stores_data = [
            {
                "name": "NutriVida Providencia",
                "address": "Av. Providencia 2330, Providencia",
                "lat": -33.4242,
                "lng": -70.6107,
                "store_chain": "NutriVida",
                "phone": "+56 2 2345 6789",
                "hours": "Lun-Vie 9:00-21:00, Sáb-Dom 10:00-20:00"
            },
            {
                "name": "BioMarket Las Condes",
                "address": "Av. Apoquindo 4900, Las Condes",
                "lat": -33.4100,
                "lng": -70.5750,
                "store_chain": "BioMarket",
                "phone": "+56 2 2987 6543",
                "hours": "Lun-Dom 8:30-22:00"
            },
            {
                "name": "Salud&Vida Ñuñoa",
                "address": "Av. Irarrázaval 3820, Ñuñoa",
                "lat": -33.4570,
                "lng": -70.5989,
                "store_chain": "Salud&Vida",
                "phone": "+56 2 2876 5432",
                "hours": "Lun-Sáb 9:00-20:00, Dom cerrado"
            },
            {
                "name": "Orgánico Express Vitacura",
                "address": "Av. Vitacura 5250, Vitacura",
                "lat": -33.3890,
                "lng": -70.5620,
                "store_chain": "Orgánico Express",
                "phone": "+56 2 2765 4321",
                "hours": "Lun-Dom 9:00-21:00"
            },
            {
                "name": "FreshLife Santiago Centro",
                "address": "Av. Libertador Bernardo O'Higgins 1234, Santiago",
                "lat": -33.4450,
                "lng": -70.6550,
                "store_chain": "FreshLife",
                "phone": "+56 2 2654 3210",
                "hours": "Lun-Vie 8:00-20:00, Sáb 9:00-19:00"
            },
        ]
        
        for store_data in stores_data:
            store = Store(**store_data)
            db.add(store)
        
        await db.commit()
        print(f"✅ Seeded {len(stores_data)} demo stores in Santiago")
        
        # Mostrar IDs para el próximo script
        from sqlalchemy import select
        result = await db.execute(select(Store))
        stores = result.scalars().all()
        print("\n📍 Store IDs:")
        for s in stores:
            print(f"  {s.name}: {s.id}")

if __name__ == "__main__":
    asyncio.run(seed_demo_stores())
```

---

## 5. Seed ProductAvailability (Distribución Realista)

```python
# backend/scripts/seed_product_availability_demo.py
"""
Seed distribución realista de productos en tiendas.
No todos los productos están en todas las tiendas.
"""
import asyncio
from sqlalchemy import select
from app.db.models.product import Product
from app.db.models.store import Store
from app.db.models.product_availability import ProductAvailability
from app.db.database import AsyncSessionLocal
import random

async def seed_product_availability():
    """
    Distribución realista:
    - Productos orgánicos → BioMarket, Orgánico Express
    - Productos sin azúcar → todas las tiendas
    - Productos veganos → NutriVida, Salud&Vida, BioMarket
    - etc.
    """
    async with AsyncSessionLocal() as db:
        # Obtener todas las tiendas
        stores_result = await db.execute(select(Store))
        stores = {s.name: s for s in stores_result.scalars().all()}
        
        # Obtener todos los productos (mock actuales)
        products_result = await db.execute(select(Product).limit(50))  # Primeros 50
        products = products_result.scalars().all()
        
        availability_count = 0
        
        for product in products:
            # Lógica de distribución según tipo de producto
            # (Ajustar según tu modelo real de productos)
            
            # Productos orgánicos/sin gluten → tiendas especializadas
            specialized_stores = ["BioMarket Las Condes", "Orgánico Express Vitacura", "NutriVida Providencia"]
            
            # Productos comunes → todas las tiendas
            common_stores = list(stores.keys())
            
            # 70% de probabilidad de estar en tienda especializada
            # 30% de estar en todas
            if random.random() < 0.7:
                selected_stores = specialized_stores
            else:
                selected_stores = common_stores
            
            for store_name in selected_stores:
                if store_name in stores:
                    availability = ProductAvailability(
                        product_id=product.id,
                        store_id=stores[store_name].id,
                        in_stock=random.choice([True, True, True, False]),  # 75% disponible
                        price=float(product.price) * random.uniform(0.95, 1.05) if hasattr(product, 'price') else None
                    )
                    db.add(availability)
                    availability_count += 1
        
        await db.commit()
        print(f"✅ Seeded {availability_count} product-store availability relationships")

if __name__ == "__main__":
    asyncio.run(seed_product_availability())
```

---

## 6. Migración

```bash
# Generar migración automática
cd backend
alembic revision --autogenerate -m "add store and product_availability models"

# Aplicar migración
alembic upgrade head

# Ejecutar seeds
python scripts/seed_stores_demo.py
python scripts/seed_product_availability_demo.py
```

---

## Criterios de aceptación

- [ ] Modelo `Store` creado con todos los campos (lat/lng, phone, hours)
- [ ] Modelo `ProductAvailability` creado con FKs correctas
- [ ] Schemas Pydantic para responses
- [ ] Migración generada y aplicada sin errores
- [ ] Script seed crea exactamente 5 tiendas en Santiago
- [ ] Script availability distribuye productos de forma realista
- [ ] **Productos mock se mantienen** (NO tocar tabla products)
- [ ] Se pueden consultar: `select * from stores` retorna 5 filas

---

## Verificación

```bash
cd backend

# Tests de modelo
python -c "from app.db.models.store import Store; print('✅ Store model OK')"
python -c "from app.db.models.product_availability import ProductAvailability; print('✅ ProductAvailability model OK')"

# Migración
alembic upgrade head

# Seeds
python scripts/seed_stores_demo.py
python scripts/seed_product_availability_demo.py

# Verificar en DB
psql -d healthbytes -c "SELECT COUNT(*) FROM stores;"
# Debe retornar: 5

psql -d healthbytes -c "SELECT name, address FROM stores;"
# Debe mostrar las 5 tiendas

psql -d healthbytes -c "SELECT COUNT(*) FROM product_availability;"
# Debe retornar > 100 (depende de cuántos productos mock tengas)
```

---

## Commits esperados

```
feat(store): add Store model with geolocation fields
feat(store): add ProductAvailability many-to-many relationship
feat(store): add Pydantic schemas for Store responses
feat(store): add seed script for 5 demo stores in Santiago
feat(store): add seed script for realistic product availability distribution
docs(store): document store model and seeding process
```

---

## Notas

- Las coordenadas (lat/lng) son reales de Santiago
- Los nombres de tiendas son inventados pero suenan creíbles
- Los teléfonos son formato chileno válido (fake)
- Los horarios son realistas para retail
- **NO tocar productos mock** — se mantienen como están

---

> [!IMPORTANT]
> Esta es la **base del pivote**. Sin este modelo, no hay mapa ni "dónde conseguir".
