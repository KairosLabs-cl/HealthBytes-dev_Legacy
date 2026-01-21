# 📋 PLAN DE ACCIÓN - Próximos 7 Días

**Generado:** 21 de Enero 2026  
**Duración:** 5-7 días de trabajo  
**Prioridad:** 🔴 CRÍTICA (Servicios)  

---

## 🎯 META SEMANAL

**Crear y refactorizar servicios para tener arquitectura correcta**

```
ANTES:                  DESPUÉS:
routers → DB           routers → services → DB
❌ Violación           ✅ Correcto
```

---

## 📅 PLAN DETALLADO

### DÍA 1 (Lunes) - Setup de Servicios
**Tiempo Estimado: 3-4 horas**

#### Tarea 1.1: Crear estructura de archivos
- [ ] Crear `backend/app/services/product_service.py`
- [ ] Crear `backend/app/services/order_service.py`
- [ ] Crear `backend/app/services/auth_service.py`
- [ ] Crear `backend/app/services/user_service.py`
- [ ] Actualizar `backend/app/services/__init__.py` con imports

**Checklist:**
```python
# backend/app/services/product_service.py
"""Product service - All product business logic here."""

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from app.db.schemas import Product  # ✅ Import models
from app.schemas.product import ProductCreate, ProductUpdate, ProductResponse

# Funciones irán aquí
```

**Comando de verificación:**
```bash
cd backend
python -c "from app.services import product_service; print('✅ Services importables')"
```

---

#### Tarea 1.2: Implementar product_service.py
**Tiempo: 2-3 horas**

Funciones a implementar:
```python
async def list_products(db: AsyncSession) -> List[Product]:
    """Get all products"""
    
async def get_product(db: AsyncSession, product_id: int) -> Product | None:
    """Get product by ID"""
    
async def create_product(db: AsyncSession, product_in: ProductCreate) -> Product:
    """Create new product"""
    
async def update_product(db: AsyncSession, product_id: int, product_in: ProductUpdate) -> Product | None:
    """Update product"""
    
async def delete_product(db: AsyncSession, product_id: int) -> bool:
    """Delete product"""
```

**Fuentes:**
- Código actual en `backend/app/api/v1/products.py`
- Modelo en `backend/app/db/schemas.py`
- Schema en `backend/app/schemas/product.py`

---

### DÍA 2 (Martes) - Refactor Products Router
**Tiempo Estimado: 3-4 horas**

#### Tarea 2.1: Reescribir products.py router
- [ ] Importar functions de `product_service`
- [ ] Reemplazar queries por service calls
- [ ] Mantener la misma funcionalidad (no cambiar endpoints)

**Antes:**
```python
# ❌ EN: backend/app/api/v1/products.py
@router.get("/")
async def list_products(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Product))  # Query aquí
    products = result.scalars().all()
    return products
```

**Después:**
```python
# ✅ EN: backend/app/api/v1/products.py
@router.get("/")
async def list_products(db: AsyncSession = Depends(get_db)):
    return await product_service.list_products(db)  # Service aquí
```

**Testing:**
```bash
cd backend
pytest tests/test_api/test_products.py -v
# Debe pasar 100%
```

---

### DÍA 3 (Miércoles) - Services para Auth y Users
**Tiempo Estimado: 3-4 horas**

#### Tarea 3.1: auth_service.py
```python
async def register_user(db: AsyncSession, user_in: UserCreate) -> User:
    """Register new user with bcrypt password"""
    
async def login_user(db: AsyncSession, email: str, password: str) -> User | None:
    """Login user and verify password"""

async def verify_token(token: str) -> dict | None:
    """Verify JWT token and return payload"""
```

#### Tarea 3.2: user_service.py
```python
async def get_user(db: AsyncSession, user_id: str) -> User | None:
    """Get user by ID"""
    
async def update_user(db: AsyncSession, user_id: str, user_in: UserUpdate) -> User:
    """Update user info"""
    
async def delete_user(db: AsyncSession, user_id: str) -> bool:
    """Delete user"""
```

#### Tarea 3.3: Refactor auth.py y users.py routers
- [ ] Importar servicios
- [ ] Reemplazar queries
- [ ] Tests deben pasar

```bash
pytest tests/test_api/test_auth.py -v
pytest tests/test_api/test_users.py -v
```

---

### DÍA 4 (Jueves) - Orders Service
**Tiempo Estimado: 4-5 horas**

#### Tarea 4.1: order_service.py - COMPLEJO
```python
async def create_order(
    db: AsyncSession, 
    user_id: str, 
    order_in: OrderCreate
) -> Order:
    """Create order with validation and price verification"""
    # ✅ Validar items existen
    # ✅ Validar precios desde DB (no cliente)
    # ✅ Validar stock
    # ✅ Crear order y items en transaction
    
async def get_user_orders(
    db: AsyncSession, 
    user_id: str,
    skip: int = 0,
    limit: int = 10
) -> List[Order]:
    """Get orders for user with pagination"""
    
async def get_order(db: AsyncSession, order_id: str, user_id: str) -> Order | None:
    """Get order and verify ownership"""
    
async def update_order_status(
    db: AsyncSession, 
    order_id: str, 
    status: str
) -> Order:
    """Update order status (pending → processing → shipped)"""
```

#### Tarea 4.2: Refactor orders.py router
- [ ] Importar order_service
- [ ] Reemplazar queries
- [ ] Tests deben pasar

```bash
pytest tests/test_api/test_orders.py -v
pytest tests/test_api/test_orders_validation.py -v
```

---

### DÍA 5 (Viernes) - Testing y Validación
**Tiempo Estimado: 4-5 horas**

#### Tarea 5.1: Ejecutar todos los tests
```bash
cd backend
pytest tests/ -v --tb=short

# Esperado: 8/8 PASSED
```

#### Tarea 5.2: Verificar que servicios se usan
```bash
# Grep para asegurar que routers NO tienen queries directas
grep -r "db.execute(select" app/api/v1/  # ← Debe estar vacío
grep -r "select(" app/api/v1/             # ← Debe estar vacío
```

#### Tarea 5.3: Code review checklist
- [ ] ¿Todos los routers usan servicios?
- [ ] ¿Servicios contienen toda la lógica?
- [ ] ¿Routers solo orquestan HTTP?
- [ ] ¿Tests pasan 100%?
- [ ] ¿No hay SQL directo en routers?

---

## 📦 ENTREGABLES ESPERADOS

Al final de semana debes tener:

```
backend/app/services/
├── __init__.py
├── product_service.py    ✅ Nuevo
├── order_service.py      ✅ Nuevo
├── auth_service.py       ✅ Nuevo
└── user_service.py       ✅ Nuevo

backend/app/api/v1/
├── products.py           🔄 Refactorizado
├── orders.py             🔄 Refactorizado
├── auth.py               🔄 Refactorizado
└── users.py              🔄 Refactorizado

Tests:
├── Todos pasan ✅
└── Sin queries directas en routers ✅
```

---

## 🧪 TESTING DURANTE PROCESO

**Ejecuta cada día al final:**
```bash
cd backend
pytest tests/ -v

# Esperado: 8/8 PASSED
# Si falla algo, arreglalo ese día
```

---

## ⚠️ TRAMPAS COMUNES

### ❌ Trampa 1: Importar models directamente en routers
```python
# MALO:
from app.db.schemas import Product
@router.get("/")
async def list_products(db):
    return await db.execute(select(Product)).scalars().all()

# BIEN:
from app.services import product_service
@router.get("/")
async def list_products(db):
    return await product_service.list_products(db)
```

### ❌ Trampa 2: Dejar lógica en router
```python
# MALO:
@router.post("/")
async def create_product(product_in: ProductCreate, db: AsyncSession):
    # Validación aquí
    if not product_in.name:
        raise ValueError("Name required")
    db.add(Product(**product_in.dict()))  # Creation aquí
    await db.commit()
    return product_in

# BIEN:
@router.post("/")
async def create_product(product_in: ProductCreate, db: AsyncSession):
    return await product_service.create_product(db, product_in)
```

### ❌ Trampa 3: No actualizar imports
```python
# Si cambias el nombre de una función, actualiza TODOS los imports
# Usa buscar y reemplazar para evitar errores
```

---

## 📞 CHECKLIST FINAL (Viernes 17:00)

- [ ] ✅ 4 servicios creados y funcionando
- [ ] ✅ 4 routers refactorizados
- [ ] ✅ 8 tests pasan
- [ ] ✅ Sin queries SQL en routers
- [ ] ✅ Documentación actualizada (comentarios en código)
- [ ] ✅ Commit con mensaje: `refactor(services): Extract business logic to services layer`

---

## 🎉 DESPUÉS

Si completas esto correctamente:
- ✅ Arquitectura correcta
- ✅ Base sólida para features
- ✅ Más fácil de testear
- ✅ Siguiente: Crear tests para servicios (70% coverage)

---

**Estimado Total:** 5-7 días de trabajo concentrado  
**Resultado:** Arquitectura MVP correcta  
**Valor:** Ahorra 2-3 semanas después

¡Adelante! 🚀
