# 🤖 Contexto para IA - Backend (HealthBytes)

**Este documento es solo para asistentes de IA (Copilot, Claude, etc.)**
**Para desarrolladores humanos, ver [README.md](README.md)**

Este archivo define reglas, patrones y principios que debes seguir cuando generes código para el backend de HealthBytes.

---

## 🎯 Propósito del Proyecto

**HealthBytes** es una API REST para un e-commerce especializado en productos para personas con restricciones de salud (celiaquía, diabetes, alergias). Mercado latinoamericano, idioma español.

**Características clave**:
- Catálogo de productos con filtros dietéticos (tags M2M) y búsqueda full-text (PostgreSQL `tsvector` + GIN index)
- Autenticación dual: JWT HS256 propio + verificación Clerk JWKS (producción)
- Carrito de compras persistido en servidor y órdenes con lifecycle completo
- Pagos con MercadoPago (intents + webhooks)
- Notificaciones push via Expo Push Notifications
- Emails transaccionales via Resend
- Wishlist, reseñas, direcciones de entrega, preferencias dietéticas por usuario
- Cache de productos en Redis (TTL 5 min)
- Rate limiting (slowapi), seguridad headers, body-size limit

---

## 🏗️ Arquitectura Obligatoria

### Stack Requerido

<!-- DOCSYNC:backend-stack -->
- **Framework**: FastAPI Traceback
- **Lenguaje**: Python 3.13.1
- **ORM**: SQLAlchemy Traceback (async)
- **Validación**: Pydantic vTraceback
- **Base de Datos**: PostgreSQL 14+
- **Testing**: pytest — 0 tests, 0% coverage
- **Autenticación**: JWT (HS256)
<!-- /DOCSYNC:backend-stack -->

**No cambiar sin aprobación explícita**.

### Estructura de Capas

```
api/v1/          ← HTTP requests (routers)
├─ services/     ← Business logic (DB queries, calculations)
├─ schemas/      ← Pydantic DTOs (request/response validation)
├─ db/
│  ├─ models/    ← SQLAlchemy ORM models
│  └─ database.py ← Connection & session management
├─ core/
│  ├─ security.py ← JWT, hashing
│  └─ exceptions.py ← Custom exceptions
└─ middleware/   ← Auth middleware
```

**Regla de oro**: Cada capa tiene responsabilidad clara. No mezclar.

---

## 🛡️ Principios Rectores (PRIORIDAD MÁXIMA)

### 1. Seguridad

**NUNCA**:
- ✋ Guardar contraseñas en plain text → siempre hash con bcrypt
- ✋ Exponer IDs internos sin validación → validar ownership
- ✋ Confiar en input del cliente → validar en backend siempre
- ✋ Retornar errores técnicos → mensajes genéricos al usuario
- ✋ Hacer queries N+1 → optimize selects

### 2. Validación

Todo endpoint debe validar:
- Autenticación (¿es usuario válido?)
- Autorización (¿tiene permiso para esta acción?)
- Input (¿datos en formato correcto?)
- Business logic (¿tiene sentido en el dominio?)

```python
# ✅ BIEN: Validación en capas
@router.post("/orders/")
async def create_order(
    order_in: OrderCreate,  # ← Pydantic valida input
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),  # ← Auth
):
    # Validar que user tiene balance
    if current_user.balance < order_in.total:
        raise HTTPException(status_code=400, detail="Insufficient balance")
    
    # Service hace el trabajo
    return await order_service.create_order(db, current_user, order_in)

# ❌ MAL: Sin validación
@router.post("/orders/")
async def create_order(order_data: dict):
    db.add(Order(**order_data))
    db.commit()
    return {"ok": True}
```

### 3. Consistencia de Datos

- Usar transactions para operaciones multi-tabla
- Validar integridad referencial
- Logging de cambios críticos

```python
# ✅ BIEN: Transaction
async def transfer_funds(db: AsyncSession, from_user: User, to_user: User, amount: float):
    async with db.begin():  # ← Transaction
        from_user.balance -= amount
        to_user.balance += amount
        db.add(from_user)
        db.add(to_user)
        await db.flush()
    
    logger.info(f"Transfer: {from_user.id} -> {to_user.id}: {amount}")
```

### 4. Performance

- Índices en campos que se filtran (user_id, product_id, created_at)
- Eager loading para relaciones necesarias
- Paginación en endpoints de lista
- Cache cuando apropriado

```python
# ✅ BIEN: Eager load + pagination
async def get_user_orders(
    db: AsyncSession,
    user_id: str,
    skip: int = 0,
    limit: int = 10
):
    stmt = select(Order).where(
        Order.user_id == user_id
    ).options(
        selectinload(Order.items)  # ← Eager load
    ).offset(skip).limit(limit)
    
    return await db.execute(stmt)

# ❌ MAL: N+1 problem
orders = db.query(Order).filter(Order.user_id == user_id).all()
for order in orders:
    print(order.items)  # ← Query por cada orden
```

---

## 📋 Patrones Obligatorios

### Router Structure

```python
# app/api/v1/products.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.product import ProductCreate, ProductOut
from app.services import product_service
from app.core.security import get_current_user
from app.db.database import get_db

router = APIRouter(prefix="/products", tags=["products"])

@router.get("/", response_model=list[ProductOut])
async def list_products(
    skip: int = 0,
    limit: int = 10,
    db: AsyncSession = Depends(get_db)
):
    """List all products with pagination"""
    return await product_service.list_products(db, skip, limit)

@router.get("/{product_id}", response_model=ProductOut)
async def get_product(
    product_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Get product by ID"""
    product = await product_service.get_product(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.post("/", response_model=ProductOut, status_code=status.HTTP_201_CREATED)
async def create_product(
    product_in: ProductCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create new product (requires seller role)"""
    if current_user.role != "seller":
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    return await product_service.create_product(db, product_in)
```

### Pydantic Schemas

```python
# app/schemas/product.py
from pydantic import BaseModel, Field
from datetime import datetime

class ProductBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: str = Field(..., max_length=2000)
    price: float = Field(..., gt=0)
    stock: int = Field(default=0, ge=0)

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    price: float | None = None
    stock: int | None = None

class ProductOut(ProductBase):
    id: str
    created_at: datetime
    updated_at: datetime
    
    model_config = {
        "from_attributes": True  # ← SQLAlchemy model compatibility
    }
```

### Service Layer

```python
# app/services/product_service.py
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.models import Product
from app.schemas.product import ProductCreate

async def list_products(
    db: AsyncSession,
    skip: int = 0,
    limit: int = 10
) -> list[Product]:
    """List products with pagination"""
    stmt = select(Product).offset(skip).limit(limit)
    result = await db.execute(stmt)
    return result.scalars().all()

async def get_product(db: AsyncSession, product_id: str) -> Product | None:
    """Get product by ID"""
    stmt = select(Product).where(Product.id == product_id)
    result = await db.execute(stmt)
    return result.scalar_one_or_none()

async def create_product(
    db: AsyncSession,
    product_in: ProductCreate
) -> Product:
    """Create new product"""
    db_product = Product(**product_in.model_dump())
    db.add(db_product)
    await db.commit()
    await db.refresh(db_product)
    return db_product
```

### SQLAlchemy Models

```python
# app/db/models/product.py
from datetime import datetime
from sqlalchemy import Column, String, Float, Integer, DateTime
from app.db.database import Base

class Product(Base):
    __tablename__ = "products"
    
    id = Column(String, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    description = Column(String(2000), nullable=True)
    price = Column(Float, nullable=False)
    stock = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f"<Product {self.id}: {self.name}>"
```

### Error Handling

```python
# ✅ BIEN: Custom exceptions + consistent responses
from fastapi import HTTPException, status

class ProductNotFoundError(Exception):
    pass

async def get_product(db: AsyncSession, product_id: str) -> Product:
    product = await db.query(Product).filter(...).first()
    if not product:
        raise ProductNotFoundError(f"Product {product_id} not found")
    return product

# En router
@router.get("/{product_id}")
async def get_product(product_id: str, db: AsyncSession = Depends(get_db)):
    try:
        return await product_service.get_product(db, product_id)
    except ProductNotFoundError:
        raise HTTPException(status_code=404, detail="Product not found")
```

---

## 🔐 Autenticación y Autorización

### Flujo de autenticación en producción (Clerk JWKS)

En producción el frontend envía tokens Clerk JWT. El backend los verifica contra el endpoint JWKS de Clerk:

```python
# Middleware: attach_user_for_rate_limiting extrae el token del header
# Authorization: Bearer <clerk_jwt>
# El middleware verifica vía JWKS y adjunta el usuario a request.state
```

### JWT HS256 propio (auth legacy / dev)

```python
# app/core/security.py
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthCredentials
import jwt

security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthCredentials = Depends(security),
    db: AsyncSession = Depends(get_db)
) -> User:
    token = credentials.credentials
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user = await db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    
    return user
```

### Ownership Check

```python
# ✅ BIEN: Verificar que user es dueño del recurso
async def get_user_order(
    db: AsyncSession,
    order_id: str,
    current_user: User
) -> Order:
    order = await db.query(Order).filter(Order.id == order_id).first()
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Crítico: verificar ownership
    if order.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden")
    
    return order
```

### DEV_BYPASS_AUTH

`DEV_BYPASS_AUTH=true` es **solo para desarrollo local**. Nunca en staging ni producción.

---

## 📝 Convenciones de Código

| Tipo | Patrón | Ejemplo |
|------|--------|---------|
| Archivos | `snake_case.py` | `product_service.py` |
| Funciones | `async` cuando acceso DB | `async def get_products()` |
| Variables | `snake_case` | `current_user`, `db_session` |
| Constantes | `UPPER_CASE` | `JWT_ALGORITHM`, `MAX_ITEMS` |
| Clases | `PascalCase` | `ProductCreate`, `HTTPException` |
| Type hints | Obligatorio en funciones públicas | `def get(id: str) -> Product:` |
| Docstrings | Brief description | `"""Get product by ID"""` |

---

## ✅ Checklist para Nuevo Código (Backend)

Antes de generar código, verifica:

- [ ] ¿Está en la capa correcta (router/service/model)?
- [ ] ¿Valida input con Pydantic?
- [ ] ¿Valida autenticación y autorización?
- [ ] ¿Maneja errores con HTTPException apropiado?
- [ ] ¿Tiene type hints?
- [ ] ¿Usa async/await si accede DB?
- [ ] ¿Evita N+1 queries?
- [ ] ¿Tiene test en tests/?
- [ ] ¿Loguea información crítica?
- [ ] ¿Respeta la estructura de carpetas?

---

## 🚫 Reglas Obligatorias (NO violar)

1. **Nunca confiar en input del cliente** → validar siempre
2. **Nunca exponer errores técnicos** → mensajes genéricos
3. **Nunca hacer queries N+1** → eager load o batch
4. **Nunca mezclar capas** → router ≠ service ≠ model
5. **Nunca sin type hints** → explícito > implícito
6. **Nunca passwords en plain text** → siempre bcrypt
7. **Nunca operations sin transactions** → multi-table = transaction
8. **Nunca sin logging** de cambios críticos
9. **Nunca crear endpoint sin test**
10. **Nunca ignorar SQLAlchemy warnings**

---

## 🧪 Testing

<!-- DOCSYNC:test-status -->
**Suite green | 0% coverage | 0 failures**

| Suite | Tests | Estado |
|-------|-------|--------|
| `test_api/` | ~180 | ✅ Todos pasan |
| `test_services/` | ~90 | ✅ Todos pasan |
| `test_middleware/` | ~30 | ✅ Todos pasan |
| `test_schemas/` | ~20 | ✅ Todos pasan |
| `e2e/` | 10 | ✅ Todos pasan |
| **Total** | **0** | ✅ |

Coverage mínimo CI: **80%**
<!-- /DOCSYNC:test-status -->

### Test Structure

```python
# tests/test_api/test_products.py
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

@pytest.fixture
def product_data():
    return {
        "name": "Test Product",
        "description": "Test description",
        "price": 99.99,
        "stock": 10
    }

def test_get_products():
    response = client.get("/api/v1/products")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_create_product(product_data, user_token):
    response = client.post(
        "/api/v1/products",
        json=product_data,
        headers={"Authorization": f"Bearer {user_token}"}
    )
    assert response.status_code == 201
    assert response.json()["name"] == product_data["name"]

def test_create_product_unauthorized(product_data):
    response = client.post(
        "/api/v1/products",
        json=product_data
    )
    assert response.status_code == 401
```

---

## 📊 Logging

**Loguear**: cambios críticos, errores, autenticación
**NO loguear**: passwords, tokens, datos sensibles

```python
import logging

logger = logging.getLogger(__name__)

async def create_order(db, user, order_data):
    # ... logic ...
    
    logger.info(f"Order created: {order.id} by user {user.id}")
    
    if error:
        logger.error(f"Failed to create order for user {user.id}: {error}")
    
    return order
```

---

## 🔧 Migraciones (Alembic)

Cuando cambies modelos:

```bash
# Generar migración automática
alembic revision --autogenerate -m "Add user_role field"

# Ver el archivo generado en migrations/versions/
# Editar si es necesario

# Aplicar
alembic upgrade head
```

**Regla**: Nunca modificar archivo de migración ya aplicada. Crear nueva.

---

## 📚 Ejemplo Completo

```python
# app/schemas/order.py
from pydantic import BaseModel, Field
from datetime import datetime

class OrderItemCreate(BaseModel):
    product_id: str
    quantity: int = Field(..., gt=0)

class OrderCreate(BaseModel):
    items: list[OrderItemCreate] = Field(..., min_items=1)

class OrderOut(BaseModel):
    id: str
    user_id: str
    total: float
    status: str
    created_at: datetime
    
    model_config = {"from_attributes": True}

# app/db/models/order.py
from sqlalchemy import Column, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.db.database import Base

class Order(Base):
    __tablename__ = "orders"
    
    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    total = Column(Float, nullable=False)
    status = Column(String, default="pending")
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="orders")

# app/services/order_service.py
async def create_order(
    db: AsyncSession,
    current_user: User,
    order_in: OrderCreate
) -> Order:
    """Create order with validation"""
    # Validate product existence & calculate total
    total = 0
    for item in order_in.items:
        product = await db.query(Product).filter(Product.id == item.product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail=f"Product {item.product_id} not found")
        if product.stock < item.quantity:
            raise HTTPException(status_code=400, detail=f"Insufficient stock for {product.name}")
        total += product.price * item.quantity
    
    # Create order in transaction
    async with db.begin():
        order = Order(
            id=str(uuid.uuid4()),
            user_id=current_user.id,
            total=total,
            status="pending"
        )
        db.add(order)
        await db.flush()
        
        # Reduce stock
        for item in order_in.items:
            product = await db.query(Product).filter(Product.id == item.product_id).first()
            product.stock -= item.quantity
            db.add(product)
    
    logger.info(f"Order created: {order.id} for user {current_user.id}, total: {total}")
    return order

# app/api/v1/orders.py
@router.post("/", response_model=OrderOut, status_code=status.HTTP_201_CREATED)
async def create_order(
    order_in: OrderCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create new order"""
    try:
        return await order_service.create_order(db, current_user, order_in)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
```

---

## ⚠️ Notas Especiales

### Precios en Órdenes
- **NUNCA confiar en precio del cliente**
- Siempre obtener precio actual del producto en backend
- Validar que cantidad es válida

### Seguridad de Datos
- Nunca retornar hashed passwords
- Nunca loguear tokens
- Validar CORS apropiadamente

### Testing en CI/CD
- Todos los tests deben pasar antes de merge
- Coverage mínimo **80%** (definido en `pyproject.toml`, enforced en GitHub Actions)
- Slow tests marcar con `@pytest.mark.slow`

---

## 📝 Template Obligatorio de PR y Commits

**⚠️ IMPORTANTE**: Al crear PRs o commits, seguir los templates definidos en `.cursorrules` (sección "PULL REQUEST RULES").

**Commit format (Conventional Commits)**:
```bash
tipo(scope): descripción en presente

[body opcional]
Closes #123
```

**Tipos**: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `perf`

**PR Description**: Ver template completo en `.cursorrules` → sección "Estructura Obligatoria de Pull Request".

---

## 📞 Dudas

Si algo no está claro:
1. Revisa `.cursorrules` (reglas globales del proyecto)
2. Busca ejemplos en `app/api/v1/`
3. Mira los tests en `tests/`
4. Revisa `docs/backend/README.md` (documentación para devs)
5. Pregunta en el contexto
