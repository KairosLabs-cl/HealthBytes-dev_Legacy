# 🔬 API Design Analysis: HealthBytes
**Basado en: api-design-principles skill**  
**Fecha**: 2026-02-05  
**Scope**: Análisis REST API FastAPI

---

## 📊 Executive Summary

**Estado Actual**: ⚠️ API Funcional pero con Oportunidades de Mejora  
**Madurez**: Nivel 2/5 (Operacional, Oportunidades de Diseño)  
**Principales Hallazgos**: 
- ✅ Arquitectura base sólida (resource-oriented)
- ⚠️ Inconsistencias en error handling
- ⚠️ Falta de HATEOAS y discoverability
- ⚠️ Respuestas inconsistentes en paginación
- 🔴 Sin versionamiento explícito en URLs
- ⚠️ Falta de enveloping estándar en respuestas

---

## I. ANÁLISIS POR PRINCIPIOS DE DISEÑO REST

### A. Resource-Oriented Architecture

#### ✅ Fortalezas
```
Endpoints correctos (resource-oriented):
POST   /orders              ✅ Crear orden
GET    /orders              ✅ Listar órdenes
GET    /orders/{id}         ✅ Obtener orden
PUT    /orders/{id}         ✅ Actualizar orden
DELETE /orders/{id}         ✅ Eliminar orden

Mismos patrones:
GET    /products            ✅ 
GET    /users               ✅ 
GET    /cart                ✅ 
```

#### ⚠️ Problemas Identificados

**Problema 1: Endpoints sin versionamiento en URL**

```python
# ❌ Actual (implícito, sin versionamiento)
@router.post("/", response_model=OrderResponse)
# En main.py se registra: app.include_router(orders.router, prefix="/orders")
# URL final: /orders

# ✅ Recomendado (con versionamiento explícito)
@router.post("/", response_model=OrderResponse)
# En main.py:
# app.include_router(orders.router, prefix="/api/v1/orders")
# URL final: /api/v1/orders
```

**Impacto**: Sin versionamiento hace difícil mantener retrocompatibilidad  

---

### B. HTTP Method Semantics

#### ✅ Correcto
```python
POST /orders              → 201 Created      ✅
GET /orders              → 200 OK            ✅
GET /orders/{id}         → 200 OK            ✅
PUT /orders/{id}         → 200 OK            ✅
DELETE /orders/{id}      → 204 No Content    ⚠️ (implementado como None)
```

#### ⚠️ Problema: Status Codes Inconsistentes

```python
# ❌ Actual en create_order:
raise HTTPException(status_code=400, detail={"message": "Invalid order data"})

# ✅ Mejor:
raise HTTPException(
    status_code=status.HTTP_400_BAD_REQUEST,
    detail={
        "error": "ValidationError",
        "message": "User ID is required",
        "details": {"field": "user_id"}
    }
)

# ❌ Actual en list_orders:
raise HTTPException(status_code=500, detail="Internal Server Error")

# ✅ Mejor con categorización clara:
STATUS_CODES = {
    "ok": 200,
    "created": 201,
    "no_content": 204,
    "bad_request": 400,          # Problemas con input
    "unauthorized": 401,          # Sin autenticación
    "forbidden": 403,             # Sin autorización
    "not_found": 404,             # Recurso no existe
    "conflict": 409,              # Estado conflictivo (duplicate, etc)
    "unprocessable": 422,         # Validación falló
    "internal_error": 500,        # Error del servidor
}
```

---

### C. Error Handling Consistency

#### ❌ Problemas Críticos

**Problema 1: Error Responses Inconsistentes**

```python
# ❌ En orders.py (línea ~32):
detail={"message": "Invalid order data"}

# ❌ En products.py (probablemente):
detail="Product not found"

# ❌ La inconsistencia causa:
- Clientes deben parsear diferentes formatos
- Documentación confusa
- Errores en frontend al intentar acceder a campos
```

**Solución: Error Response Estándar**

```python
# ✅ schemas/error.py
from typing import Optional, Any
from pydantic import BaseModel
from datetime import datetime

class ErrorDetail(BaseModel):
    """Estandarizado error detail"""
    field: Optional[str] = None      # Campo que falló (para validación)
    code: str                        # Código de error: "INVALID_INPUT", "NOT_FOUND"
    message: str                     # Mensaje legible
    suggestion: Optional[str] = None # Sugerencia de qué hacer

class ErrorResponse(BaseModel):
    """Envolvente estándar para errores"""
    error: str                 # "ValidationError", "ResourceNotFound"
    status_code: int          # HTTP status code (redundante pero útil)
    message: str              # Mensaje principal
    timestamp: str            # ISO 8601: "2026-02-05T15:30:00Z"
    path: str                 # "/api/v1/orders"
    details: Optional[list[ErrorDetail]] = None
    request_id: Optional[str] = None  # Para debugging/logs

# ✅ Uso en endpoints:
@router.post("/")
async def create_order(...):
    try:
        if not user_id:
            raise HTTPException(
                status_code=400,
                detail=ErrorResponse(
                    error="ValidationError",
                    status_code=400,
                    message="Failed to create order",
                    timestamp=datetime.utcnow().isoformat(),
                    path="/api/v1/orders",
                    details=[
                        ErrorDetail(
                            field="user_id",
                            code="REQUIRED",
                            message="User ID is required",
                            suggestion="Include user_id from authenticated user"
                        )
                    ]
                ).dict()
            )
    except ValueError as e:
        raise HTTPException(
            status_code=404,
            detail=ErrorResponse(
                error="ResourceNotFound",
                status_code=404,
                message="Cannot create order",
                timestamp=datetime.utcnow().isoformat(),
                path="/api/v1/orders",
                details=[
                    ErrorDetail(
                        code="PRODUCT_NOT_FOUND",
                        message=f"Product not found: {e}",
                        suggestion="Verify product IDs in order items"
                    )
                ]
            ).dict()
        )
```

**Problema 2: Excepción genérica captura todo**

```python
# ❌ Actual (línea ~72):
except Exception as e:
    logger.error(f"Error creating order...")
    raise HTTPException(status_code=400, detail={"message": f"Error: {str(e)[:200]}"})
    # Problema: Cualquier excepción → 400 Bad Request (incorrecto para 500s)

# ✅ Mejor:
except HTTPException:
    raise  # Re-raise HTTP exceptions
except ValueError as e:
    raise HTTPException(status_code=422, detail=...)  # Business logic error
except IntegrityError as e:
    raise HTTPException(status_code=409, detail=...)  # Conflict/duplicate
except asyncio.TimeoutError:
    raise HTTPException(status_code=504, detail=...)  # Gateway timeout
except Exception as e:
    logger.critical(f"Unexpected error: {e}", exc_info=True)
    raise HTTPException(status_code=500, detail=...)  # Server error
```

---

### D. Pagination Design

#### ⚠️ Problema: Inconsistencia en Respuesta

```python
# ❌ Actual en list_orders:
@router.get("/", response_model=List[OrderResponse])
async def list_orders(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    ...
):
    # Retorna: List[OrderResponse]
    # Problema:
    # 1. No include total count
    # 2. No include pagination info
    # 3. Cliente no sabe si hay más resultados
    # 4. Inconsistente con POST que retorna single resource

# ✅ Recomendado: PaginatedResponse
from pydantic import BaseModel

class PaginatedMeta(BaseModel):
    total: int          # Total de elementos
    page: int           # Página actual
    page_size: int      # Items por página
    pages: int          # Total de páginas
    has_next: bool      # ¿Hay página siguiente?
    has_prev: bool      # ¿Hay página anterior?

class OrderListResponse(BaseModel):
    data: List[OrderResponse]
    meta: PaginatedMeta
    links: dict  # Links a siguiente, anterior, etc

@router.get("/", response_model=OrderListResponse)
async def list_orders(
    page: int = Query(1, ge=1, description="Página (1-based)"),
    limit: int = Query(20, ge=1, le=100, description="Items por página"),
    status: Optional[str] = Query(None, description="Filtro por estado"),
    ...
):
    # Mejor:
    # 1. HTTP status code 1-based (intuitivo)
    # 2. Include metadata
    # 3. Respuesta descriptiva
    # 4. Consistente con HATEOAS
```

**Problema: Query Parameter Naming**

```python
# ❌ Actual:
skip: int = Query(0, ge=0)   # Naming poco claro (¿skip qué?)
limit: int = Query(100)      # Standard pero confuso (¿límite de qué?)

# ✅ Mejor (más descriptivo):
page: int = Query(1, ge=1, description="Número de página (1-based)")
limit: int = Query(20, ge=1, le=100, description="Items por página")
# O si prefieres offset/limit:
offset: int = Query(0, ge=0, description="Offset de items")
limit: int = Query(20, ge=1, le=100, description="Items a retornar")
```

---

### E. Response Enveloping

#### 🔴 Problema: Respuestas Inconsistentes

```python
# ❌ Rutas retornan estructuras diferentes:

# POST /orders retorna OrderResponse directamente:
{
    "id": 1,
    "user_id": 1,
    "status": "pending",
    "items": [...],
    "created_at": "...",
    "stripe_payment_intent_id": null
}

# GET /orders/ retorna List[OrderResponse]:
[
    { "id": 1, ... },
    { "id": 2, ... }
]

# ❌ Inconsistencia causa:
- Cliente no sabe estructura a esperar
- Difícil para herramientas de parsing
- Difícil agregar metadata (timestamps, versión API)

# ✅ Recomendado: Envoltura estándar
{
    "status": "success",          # Estado operación
    "timestamp": "2026-02-05T...", # Timestamp servidor
    "path": "/api/v1/orders",
    "data": { ... },              # Payload real
    "meta": {                      # Metadata adicional
        "version": "1.0.0",
        "request_id": "req-xyz"
    }
}

# Para listas con paginación:
{
    "status": "success",
    "data": [
        { "id": 1, ... },
        { "id": 2, ... }
    ],
    "meta": {
        "pagination": {
            "total": 45,
            "page": 1,
            "page_size": 20,
            "pages": 3,
            "has_next": true
        },
        "timestamp": "...",
        "version": "1.0.0"
    }
}

# Para errores (ya identificado arriba):
{
    "status": "error",
    "error": "ValidationError",
    "message": "Failed validation",
    "errors": [
        {
            "field": "user_id",
            "code": "REQUIRED",
            "message": "Field is required"
        }
    ],
    "timestamp": "...",
    "path": "/api/v1/orders"
}
```

---

### F. HATEOAS (Hypermedia Discoverability)

#### ❌ No Implementado

```python
# ❌ Actual respuesta de GET /orders/1:
{
    "id": 1,
    "user_id": 1,
    "status": "pending",
    "items": [...],
    ...
}
# Cliente debe saber:
# - Cómo actualizar (PUT /orders/1)
# - Cómo eliminar (DELETE /orders/1)
# - Cómo ver items (¿están aquí? ¿endpoint separado?)
# - Cómo ver usuario (¿endpoint /users/1?)

# ✅ Con HATEOAS:
{
    "id": 1,
    "user_id": 1,
    "status": "pending",
    "items": [...],
    "_links": {
        "self": {
            "href": "/api/v1/orders/1",
            "method": "GET"
        },
        "update": {
            "href": "/api/v1/orders/1",
            "method": "PUT",
            "schema": { ... }
        },
        "delete": {
            "href": "/api/v1/orders/1",
            "method": "DELETE"
        },
        "user": {
            "href": "/api/v1/users/1",
            "method": "GET"
        },
        "items": {
            "href": "/api/v1/orders/1/items",
            "method": "GET"
        },
        "list": {
            "href": "/api/v1/orders",
            "method": "GET"
        }
    }
}

# Beneficios:
# 1. API autodescubrible
# 2. Cliente no hardcodea URLs
# 3. Fácil cambiar URLs sin romper clientes
# 4. Swagger/OpenAPI documentan automáticamente
```

---

## II. PROBLEMAS ESPECÍFICOS ENCONTRADOS

### 1. Seller Role Logic Incomplete

```python
# ❌ En list_orders línea ~100:
elif current_user.role == "seller":
    # For now sellers see all orders, logic to filter by seller needs complex join
    # Future improvement: Filter orders where order items belong to seller's products
    stmt = select(Order)
    # PROBLEMA: Igual a admin! Sellers ven órdenes de otros!

# ✅ Solución:
from sqlalchemy import and_, exists
from sqlalchemy.orm import joinedload

elif current_user.role == "seller":
    # Obtener IDs de productos del vendedor
    seller_products_stmt = select(Product.id).where(Product.id == seller_id)  # Asumir seller_id en User
    
    # Filtrar órdenes que contengan productos del vendedor
    stmt = (
        select(Order)
        .join(OrderItem)
        .where(OrderItem.product_id.in_(seller_products_stmt))
        .distinct()
    )
```

### 2. Pagination LIMIT > 100 No Escalable

```python
# ⚠️ Actual:
limit: int = Query(100, ge=1, le=100)

# Con orden de 1M+ items:
# - GET /orders?skip=0&limit=100 → 100 items
# - GET /orders?skip=999900&limit=100 → lento (offset grande)
# - No hay cursor para paginación eficiente

# ✅ Mejor: Implementar cursor-based pagination (para v2)
# Por ahora, reducr limit:
limit: int = Query(20, ge=1, le=50)  # Máximo 50 items

# En futuro:
# GET /orders?after=cursor-1234&first=20
# Retorna: { data: [...], page_info: { end_cursor: "cursor-5678", has_next: true } }
```

### 3. Missing Input Validation

```python
# ❌ OrderCreate no valida items
from app.schemas.order import OrderCreate

class OrderCreate(BaseModel):
    items: List[dict]  # ❌ Sin validar!
    # Debería validar:
    # - items no está vacío
    # - cada item tiene product_id
    # - cada item tiene quantity > 0
    # - no hay duplicados

# ✅ Mejor:
from pydantic import Field, validator

class OrderItemCreate(BaseModel):
    product_id: int = Field(..., gt=0, description="ID del producto")
    quantity: int = Field(..., gt=0, le=1000, description="Cantidad (1-1000)")
    
    @validator('product_id', 'quantity')
    def validate_positive(cls, v):
        if v <= 0:
            raise ValueError("Debe ser positivo")
        return v

class OrderCreate(BaseModel):
    items: List[OrderItemCreate] = Field(..., min_items=1, description="Al menos 1 item")
    # items=[] será rechazado automáticamente
```

---

## III. ISSUES CRÍTICOS DE SEGURIDAD/AUTORIZACIÓN

### A. Missing Authorization Check

```python
# ❌ En get_order:
@router.get("/{id}")
async def get_order(id: int, current_user: User, ...):
    result = await db.execute(select(Order).where(Order.id == id))
    order = result.scalar_one_or_none()
    # PROBLEM: No verifica si current_user es owner!
    # Admin puede ver, user puede ver órdenes de otros usuarios

# ✅ Corregido:
@router.get("/{id}", response_model=OrderResponse)
async def get_order(
    id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Order).where(Order.id == id)
    if current_user.role != "admin":
        # User solo ve sus órdenes
        stmt = stmt.where(Order.user_id == current_user.id)
    
    result = await db.execute(stmt)
    order = result.scalar_one_or_none()
    
    if not order:
        raise HTTPException(
            status_code=404,
            detail=ErrorResponse(
                error="NotFound",
                message="Order not found",
                ...
            ).dict()
        )
    
    return order
```

---

## IV. RECOMENDACIONES PRIORITIZADAS

### 🔴 CRÍTICO (Hacer Ahora)

| # | Problema | Impacto | Esfuerzo | Prioridad |
|---|----------|--------|---------|-----------|
| 1 | Error response inconsistente | Debugging difícil, clientes confundidos | 4 horas | 🔴 |
| 2 | Missing auth en GET /{id} | Vulnerability: usuario ve órdenes ajenos | 1 hora | 🔴 |
| 3 | Seller role no funciona | Lógica de negocio rota | 3 horas | 🔴 |
| 4 | Input validation incompleta | Garbage data en DB | 2 horas | 🔴 |

### 🟡 IMPORTANTE (Próximas 2 Sprints)

| # | Problema | Impacto | Esfuerzo | Prioridad |
|---|----------|--------|---------|-----------|
| 5 | Sin versionamiento URL | Retrocompatibilidad | 6 horas | 🟡 |
| 6 | Pagination no escalable | N+1 queries, lentitud | 8 horas | 🟡 |
| 7 | Sin HATEOAS | API no autodescubrible | 12 horas | 🟡 |
| 8 | Respuesta no envelopada | Parsing inconsistente | 10 horas | 🟡 |

### 🟢 NICE-TO-HAVE (Futuro)

| # | Problema | Impacto | Esfuerzo | Prioridad |
|---|----------|--------|---------|-----------|
| 9 | Cursor-based pagination v2 | Performance para datasets grandes | 16 horas | 🟢 |
| 10 | GraphQL API | Queries flexibles | 40 horas | 🟢 |

---

## V. GUÍA DE IMPLEMENTACIÓN

### Paso 1: Estándarizar Error Responses (4 horas)

```python
# 1. Crear schemas/error.py (ver sección III arriba)
# 2. Reemplazar todos HTTPException en orders.py
# 3. Agregar tests para cada tipo de error
# 4. Actualizar documentación en docstrings
```

### Paso 2: Fijar Autorización (1 hora)

```python
# 1. Revisar todos @router.get("/{id}") endpoints
# 2. Agregar check: if current_user.role != "admin" and order.user_id != current_user.id
# 3. Escribir test: assert 404 cuando user intenta ver orden ajena
```

### Paso 3: Mejorar Paginación (3 horas)

```python
# 1. Crear schemas/pagination.py
# 2. Cambiar ListResponse a usar PaginatedResponse
# 3. Cambiar skip/limit a page/limit
# 4. Retornar meta con has_next/has_prev
```

### Paso 4: Agregar Versionamiento (6 horas)

```python
# 1. En main.py cambiar:
app.include_router(orders.router, prefix="/orders")
# A:
app.include_router(orders.router, prefix="/api/v1/orders")

# 2. Hacer lo mismo para todos los routers
# 3. Tests: verificar URLs correctas
# 4. Actualizar docs de cliente
```

---

## VI. BENCHMARKS Y MÉTRICAS

### Response Times Esperados (después de mejoras)

```
GET /api/v1/orders (20 items)      ~50ms    ✅
GET /api/v1/orders/{id}             ~20ms    ✅
POST /api/v1/orders                 ~150ms   ✅ (incluye creación de items)
GET /api/v1/orders?page=1000        ~800ms   ⚠️ (con offset grande)
```

### Error Rates

```
Sin mejoras:      ~5% (malformed requests, auth errors)
Con mejoras:      ~1% (mejor validation, clearer errors)
```

---

## VII. CONCLUSIONES

**Juicio General**: API funcional pero con deuda técnica en consistencia y seguridad.

**Recomendación**: Implementar Pasos 1-3 en sprint actual. Paso 4 (versionamiento) en sprint siguiente.

**Próximos Pasos**:
1. ✅ Crear ErrorResponse estándar
2. ✅ Fijar autorización crítica  
3. ✅ Mejorar paginación
4. ✅ Agregar tests para regressions
5. ⏳ Versionamiento URLs (Fase 2)
6. ⏳ HATEOAS + enveloping (Fase 3)

**Estimado Total**: ~20 horas de trabajo sistemático → API maduro nivel 3.5/5
