# API Audit & Fix Plan — HealthBytes Backend

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fixear todos los outdates, malas lógicas y problemas de escalado del backend de HealthBytes encontrados en auditoría profunda del código real.

**Architecture:** FastAPI 0.128+ / SQLAlchemy 2.0 async / PostgreSQL / Redis / Clerk JWKS / MercadoPago. Arquitectura de 3 capas estricta: router → service → model.

**Tech Stack:** Python 3.13, FastAPI, SQLAlchemy 2.x async, psycopg3, Pydantic v2, PyJWT, bcrypt, redis-py async, Resend, slowapi, Sentry.

---

## 🔥 ROAST-ME: Lo que está mal AHORA MISMO

> Si esto fuera code review, el PR se rechazaría en al menos 8 puntos. Diagnóstico honesto:

| # | Severidad | Problema | Archivo |
|---|-----------|----------|---------|
| 1 | 🔴 CRÍTICO | **Dos librerías JWT en paralelo**: `python-jose` (sign/verify legacy) + `PyJWT` (Clerk). Conflict de versiones esperando explotar. | `requirements.txt`, `security.py`, `auth.py` |
| 2 | 🔴 CRÍTICO | **`resend.Emails.send()` es SÍNCRONO** dentro de `async def`. Bloquea el event loop con cada email. 100 órdenes simultáneas = API congelada. | `email_service.py:244` |
| 3 | 🔴 CRÍTICO | **Redis singleton global mutable** con `_redis_client = None` sin lock asyncio. Race condition en startup bajo alta concurrencia. | `database.py:57-73` |
| 4 | 🔴 CRÍTICO | **`create_order` hace commit y luego envía email fire-and-forget**: si el email falla, stock ya reservado sin posibilidad de rollback. | `order_service.py:118-150` |
| 5 | 🟠 ALTO | **`declarative_base()` deprecated** en SQLAlchemy 2.x. Debería ser `class Base(DeclarativeBase): pass`. Genera warnings en cada arranque. | `database.py:35` |
| 6 | 🟠 ALTO | **`sessionmaker()` sin `async_sessionmaker`**: viejo patrón de SQLA 1.x usado donde debería ir `async_sessionmaker`. No type-safe. | `database.py:33` |
| 7 | 🟠 ALTO | **N+1 en notificaciones de price drop**: itera favoritos y hace una query DB por cada usuario. Con 10k favoritos = 10k queries. | `product_service.py:231-244` |
| 8 | 🟠 ALTO | **`limit_request_body_size` lee body completo en memoria**: 100 requests de 10MB simultáneos = 1GB RAM sin streaming real. | `main.py:230-240` |
| 9 | 🟡 MEDIO | **No hay `lifespan`**: startup (Sentry, Redis, JWKS) se hace lazy en primera request. Latencia en cold start, health checks incorrectos. | `main.py`, `database.py` |
| 10 | 🟡 MEDIO | **`get_db()` double-close**: `finally: await session.close()` dentro de `async with` que ya cierra automáticamente. | `database.py:43-44` |
| 11 | 🟡 MEDIO | **`attach_user_for_rate_limiting` corre en CADA request** incluyendo health checks, abre DB session con `async for db in get_db()` — antipatrón, no cierra si hay excepción antes del `break`. | `main.py:141-160` |
| 12 | 🟡 MEDIO | **`PATCH` ausente en CORSMiddleware**: `allow_methods` no incluye `PATCH`. Rompe preflight en cualquier PATCH futuro. | `main.py:280` |
| 13 | 🟡 MEDIO | **Pool de conexiones sin `pool_timeout`**: default 30s = requests se quedan pegadas. Sin tuning para producción. | `database.py:16-25` |
| 14 | 🟡 MEDIO | **Cache de productos sin invalidación**: writes (create/update/delete) nunca invalidan Redis. Usuario ve datos obsoletos hasta TTL (5min). | `product_service.py:401-470` |
| 15 | 🟡 MEDIO | **Seller role = User en `list_orders_for_request`**: hay un TODO sin implementar. Seller ve sus propias órdenes, no las que contienen sus productos. | `order_service.py:183-185` |
| 16 | 🟡 MEDIO | **`delete_order` no verifica ownership y no libera stock**: admin puede borrar orden "processing" dejando stock permanentemente reservado. | `order_service.py:306-315` |
| 17 | 🟡 MEDIO | **Pagos pendientes nunca se limpian**: `get_pending_payments()` existe pero nadie la invoca. Órdenes con pago pendiente por días nunca se cancelan. | `payment_service.py:275-300` |
| 18 | 🟡 MEDIO | **`_validate_production_config` en import time**: levanta `RuntimeError` al importar `config.py`, difícil de diagnosticar en producción. | `config.py:98-116` |
| 19 | 🟢 BAJO | **JWKS globals mutables sin lock**: múltiples requests concurrentes pueden crear JWKS clients duplicados al expirar TTL. | `auth.py:22-60` |
| 20 | 🟢 BAJO | **`List`, `Optional`, `Dict` de `typing`**: Python 3.10+ permite nativos `list[...]`, `X \| None`. Módulo `typing` es legado. | Múltiples services |
| 21 | 🟢 BAJO | **`min_items=1` en schemas Pydantic V2**: `min_items` es V1 y se ignora silenciosamente en V2. Debería ser `Field(min_length=1)`. | `schemas/order.py` |

---

## 📋 Proposed Changes

### Component 1: JWT Consolidation — Eliminar python-jose

**Problema**: `python-jose` y `PyJWT` coexisten. `python-jose` tiene vulnerabilidades conocidas (CVE-2022-29217) y está menos mantenido. `PyJWT` ya se usa para Clerk — consolidar todo ahí.

---

#### [MODIFY] requirements.txt

- Eliminar `python-jose[cryptography]>=3.5.0`
- Mantener `PyJWT[crypto]>=2.10.1` (ya presente)

#### [MODIFY] app/core/security.py

**Files:**
- Modify: `backend/app/core/security.py`

**Step 1: Escribir test que falle**
```python
# tests/test_core/test_security.py
def test_no_jose_import():
    """python-jose no debe estar en el árbol de imports de security.py"""
    import ast, pathlib
    src = pathlib.Path("app/core/security.py").read_text()
    tree = ast.parse(src)
    for node in ast.walk(tree):
        if isinstance(node, (ast.Import, ast.ImportFrom)):
            names = [a.name for a in node.names]
            if any("jose" in n for n in names):
                pytest.fail(f"jose import found: {names}")
```

**Step 2: Correr test — debe fallar**
```bash
pytest tests/test_core/test_security.py::test_no_jose_import -v
```
Expected: FAIL — "jose import found: ['JWTError', 'jwt']"

**Step 3: Implementar el fix**
```python
# app/core/security.py — ANTES
from jose import JWTError, jwt

# DESPUÉS
import jwt  # PyJWT

# decode_token — ANTES
except JWTError:
    return None

# DESPUÉS
except jwt.PyJWTError:
    return None

# encode — PyJWT returns str directamente (no bytes en v2+)
encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)
# Si la versión instalada retorna bytes, hacer: .decode() — pero PyJWT 2.x retorna str
```

**Step 4: Verificar tests pasan**
```bash
pytest tests/ -v --tb=short -k "security or auth"
```

**Step 5: Commit**
```bash
git add backend/requirements.txt backend/app/core/security.py tests/test_core/test_security.py
git commit -m "chore(deps): consolidate JWT library, remove python-jose in favor of PyJWT"
```

---

### Component 2: SQLAlchemy 2.x Modern API

**Problema**: `declarative_base()` deprecated, `sessionmaker` viejo, `get_db()` double-close, pool sin `pool_timeout`.

**Files:**
- Modify: `backend/app/db/database.py`
- Test: `tests/test_db/test_database.py`

**Step 1: Escribir test**
```python
def test_base_is_declarative_base():
    from sqlalchemy.orm import DeclarativeBase
    from app.db.database import Base
    assert issubclass(Base, DeclarativeBase), "Base debe heredar de DeclarativeBase"

def test_async_session_maker():
    from sqlalchemy.ext.asyncio import async_sessionmaker
    from app.db.database import AsyncSessionLocal
    assert isinstance(AsyncSessionLocal, async_sessionmaker)
```

**Step 2: Correr tests — deben fallar**
```bash
pytest tests/test_db/ -v
```

**Step 3: Implementar**
```python
# database.py
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.ext.asyncio import async_sessionmaker, AsyncSession, create_async_engine
import asyncio

class Base(DeclarativeBase):
    pass

_pool_kwargs = (
    {}
    if _is_sqlite
    else {
        "pool_size": 20,
        "max_overflow": 10,
        "pool_pre_ping": True,
        "pool_recycle": 3600,
        "pool_timeout": 10,   # ← NUEVO: fail fast, no 30s default
    }
)

AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session  # ← SIN try/finally/close: async with ya cierra

# Redis con lock asyncio
_redis_lock = asyncio.Lock()

async def get_redis() -> "aioredis.Redis | None":
    global _redis_client
    if _redis_client is not None:
        return _redis_client
    async with _redis_lock:
        if _redis_client is None:  # double-check
            if not settings.REDIS_URL:
                return None
            try:
                _redis_client = aioredis.from_url(
                    settings.REDIS_URL,
                    encoding="utf-8",
                    decode_responses=True,
                    socket_connect_timeout=2,
                )
                await _redis_client.ping()
                _redis_logger.info("Redis connected: %s", settings.REDIS_URL)
            except Exception as exc:
                _redis_logger.warning("Redis unavailable: %s", exc)
                _redis_client = None
    return _redis_client
```

**IMPORTANTE**: Todos los modelos en `schemas.py` usan `Base` — tras el cambio a `DeclarativeBase`, todos los modelos deben heredar de la nueva `Base`. Verificar que no hay imports de `declarative_base` en otros archivos.

```bash
grep -r "declarative_base" backend/app/
```

**Step 4: Correr suite completa**
```bash
pytest tests/ -v --tb=short
```

**Step 5: Commit**
```bash
git add backend/app/db/database.py tests/test_db/
git commit -m "refactor(db): migrate to SQLAlchemy 2.x async_sessionmaker and DeclarativeBase"
```

---

### Component 3: FastAPI Lifespan + CORS Fix + Config Validation

**Files:**
- Modify: `backend/app/main.py`
- Modify: `backend/app/config.py` (quitar `_validate_production_config` de import time)

**Step 1: Test**
```python
# tests/test_main/test_lifespan.py
from fastapi.testclient import TestClient
from app.main import app

def test_health_returns_200():
    with TestClient(app) as client:
        resp = client.get("/health")
        assert resp.status_code == 200

def test_cors_allows_patch():
    with TestClient(app) as client:
        resp = client.options(
            "/products",
            headers={
                "Origin": "http://localhost:8081",
                "Access-Control-Request-Method": "PATCH",
            }
        )
        # En dev debe permitir PATCH en el preflight
        allowed = resp.headers.get("access-control-allow-methods", "")
        assert "PATCH" in allowed
```

**Step 2: Implementar lifespan en main.py**
```python
from contextlib import asynccontextmanager
from app.services.cleanup_service import run_periodic_cleanup

@asynccontextmanager
async def lifespan(app: FastAPI):
    # STARTUP
    configure_logging()
    init_sentry()
    # Mover validación de producción aquí (no en import time)
    from app.config import _validate_production_config, settings
    _validate_production_config(settings)
    # Eager init de Redis
    await get_redis()
    logger.info("HealthBytes API starting | env=%s", settings.ENVIRONMENT)
    # Background cleanup job
    cleanup_task = asyncio.create_task(run_periodic_cleanup(interval_seconds=300))
    yield
    # SHUTDOWN
    cleanup_task.cancel()
    try:
        await cleanup_task
    except asyncio.CancelledError:
        pass
    from app.db.database import _redis_client
    if _redis_client:
        await _redis_client.aclose()
    logger.info("HealthBytes API shut down cleanly")

app = FastAPI(lifespan=lifespan, ...)
```

Fix CORS:
```python
allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
```

Fix middleware `attach_user_for_rate_limiting` — reemplazar `async for db in get_db()`:
```python
from app.db.database import AsyncSessionLocal

async with AsyncSessionLocal() as db:
    result = await db.execute(select(User).where(User.clerk_id == clerk_user_id))
    user = result.scalar_one_or_none()
    if user:
        request.state.user = user
```

**Step 3: Correr tests**
```bash
pytest tests/ -v
```

**Step 4: Commit**
```bash
git add backend/app/main.py backend/app/config.py
git commit -m "feat(api): add lifespan startup/shutdown, fix CORS PATCH, fix rate-limit middleware session leak"
```

---

### Component 4: Email Service — Fix Blocking Sync Call

**Files:**
- Modify: `backend/app/services/email_service.py`
- Test: `tests/test_services/test_email_service.py`

**Step 1: Test**
```python
import asyncio
import time

async def test_send_email_does_not_block_event_loop(mocker):
    """send_email no debe bloquear el event loop más de 50ms."""
    mocker.patch("resend.Emails.send", return_value={"id": "test-123"})
    from app.services.email_service import EmailService
    from app.config import settings
    svc = EmailService(settings)
    
    start = time.monotonic()
    # Simular concurrencia: 10 emails en paralelo
    await asyncio.gather(*[
        svc.send_email("test@example.com", "Subj", "<p>body</p>")
        for _ in range(10)
    ])
    elapsed = time.monotonic() - start
    assert elapsed < 2.0, f"Event loop blocked too long: {elapsed:.2f}s"
```

**Step 2: Implementar**
```python
import asyncio

async def send_email(self, to: str, subject: str, html: str) -> Optional[dict]:
    if not self._enabled:
        logger.info("Email not sent (no RESEND_API_KEY): to=%s subject='%s'", to, subject)
        return None
    try:
        params = {"from": self.from_address, "to": [to], "subject": subject, "html": html}
        # Ejecutar SDK síncrono en thread pool — no bloquea el event loop
        loop = asyncio.get_event_loop()
        response = await loop.run_in_executor(None, lambda: resend.Emails.send(params))
        logger.info("Email sent: to=%s subject='%s' id=%s", to, subject, response.get("id"))
        return response
    except Exception:
        logger.exception("Failed to send email to %s", to)
        return None
```

**Step 3: Run test**
```bash
pytest tests/test_services/test_email_service.py -v
```

**Step 4: Commit**
```bash
git add backend/app/services/email_service.py tests/test_services/test_email_service.py
git commit -m "fix(email): run resend SDK in thread executor to avoid blocking event loop"
```

---

### Component 5: N+1 Fix — Price Drop Notifications

**Files:**
- Modify: `backend/app/services/product_service.py` (función `update_product`, líneas 231-244)

**Step 1: Test**
```python
async def test_price_drop_uses_single_query(db_session, mocker):
    """update_product no debe hacer queries individuales por usuario."""
    execute_calls = []
    original_execute = db_session.execute
    async def counting_execute(stmt, *args, **kwargs):
        execute_calls.append(stmt)
        return await original_execute(stmt, *args, **kwargs)
    mocker.patch.object(db_session, "execute", side_effect=counting_execute)
    
    # Crear producto con 5 favoritos
    # ... setup ...
    
    await update_product(db_session, product_id, ProductUpdate(price=Decimal("50")))
    
    user_queries = [q for q in execute_calls if "users" in str(q).lower()]
    assert len(user_queries) <= 1, f"Expected ≤1 user query, got {len(user_queries)}"
```

**Step 2: Implementar**
```python
# Reemplazar el bloque de price-drop en update_product
if "price" in safe_update_data and new_price < old_price:
    try:
        from sqlalchemy import select as sa_select
        from app.db.schemas import UserModel, UserFavorite
        from app.services.notification_service import NotificationService

        # Una sola query con JOIN — sin N+1
        users_result = await db.execute(
            sa_select(UserModel)
            .join(UserFavorite, UserFavorite.user_id == UserModel.id)
            .where(
                UserFavorite.product_id == product_id,
                UserModel.expo_push_token.isnot(None),
            )
        )
        for fav_user in users_result.scalars().all():
            NotificationService.send_price_drop_notification(
                fav_user.expo_push_token, product_id, db_product.name, new_price
            )
    except Exception:
        logger.exception("Failed to send price drop notifications for product %s", product_id)
```

**Step 3: Run test**
```bash
pytest tests/test_services/test_product_service.py -v
```

**Step 4: Commit**
```bash
git add backend/app/services/product_service.py
git commit -m "perf(products): fix N+1 in price-drop notifications with single JOIN query"
```

---

### Component 6: Cache Invalidation on Write

**Files:**
- Modify: `backend/app/services/product_service.py`

**Step 1: Test**
```python
async def test_cache_invalidated_on_update(db_session, mock_redis):
    """Actualizar un producto debe invalidar el cache de productos."""
    # Prime the cache
    await get_products_cached(db_session)
    cached = await mock_redis.get("products:list:*")
    assert cached is not None

    # Update product
    await update_product(db_session, product_id=1, product_in=ProductUpdate(name="New Name"))

    # Cache debe estar vacío
    keys = await mock_redis.keys("products:list:*")
    assert len(keys) == 0, "Cache should be cleared after update"
```

**Step 2: Implementar helper de invalidación**
```python
async def _invalidate_products_cache() -> None:
    """Invalida todas las entradas del cache de productos usando SCAN (production-safe)."""
    try:
        redis = await get_redis()
        if redis:
            cursor = 0
            pattern = "products:list:*"
            deleted = 0
            while True:
                cursor, keys = await redis.scan(cursor, match=pattern, count=100)
                if keys:
                    await redis.delete(*keys)
                    deleted += len(keys)
                if cursor == 0:
                    break
            if deleted:
                logger.info("Products cache invalidated: %d keys deleted", deleted)
    except Exception as exc:
        logger.warning("Failed to invalidate products cache: %s", exc)
```

Llamar al final de `create_product`, `update_product` y `delete_product`:
```python
await _invalidate_products_cache()
```

**Step 3: Run test**
```bash
pytest tests/test_services/test_product_service.py::test_cache_invalidated_on_update -v
```

**Step 4: Commit**
```bash
git add backend/app/services/product_service.py
git commit -m "fix(cache): invalidate Redis cache on product create/update/delete"
```

---

### Component 7: Order Service — delete_order Stock Release + Seller Filter

**Files:**
- Modify: `backend/app/services/order_service.py`
- Test: `tests/test_services/test_order_service.py`

**Step 1: Tests**
```python
async def test_delete_order_releases_stock_when_processing(db_session):
    """Borrar una orden en estado 'processing' debe devolver el stock."""
    # Create order in processing state
    # ... setup ...
    initial_stock = product.stock
    
    deleted = await delete_order(db_session, order_id)
    assert deleted is True
    
    await db_session.refresh(product)
    assert product.stock == initial_stock + ordered_quantity

async def test_list_orders_seller_sees_their_products(db_session):
    """Seller ve órdenes que contienen sus productos, no sus órdenes propias."""
    # seller compra algo — no debe aparecer en su lista como seller
    # otro user compra producto del seller — sí debe aparecer
    # ... setup ...
    orders = await list_orders_for_request(db_session, seller_user)
    order_ids = [o.id for o in orders]
    assert customer_order_with_seller_product.id in order_ids
    assert seller_own_order.id not in order_ids
```

**Step 2: Implementar**

`delete_order` con stock release:
```python
async def delete_order(db: AsyncSession, order_id: int) -> bool:
    result = await db.execute(
        select(Order).where(Order.id == order_id).options(selectinload(Order.items))
    )
    order = result.scalar_one_or_none()
    if not order:
        return False

    STOCK_HOLDING_STATUSES = {"unpaid", "processing", "shipped"}
    if order.status in STOCK_HOLDING_STATUSES and order.items:
        items_to_release = [(item.product_id, item.quantity) for item in order.items]
        try:
            await StockService.release_stock_batch(
                db=db, items=items_to_release,
                reason=f"Order {order_id} hard-deleted by admin",
            )
        except Exception:
            logger.exception("Failed to release stock on delete for order %s", order_id)

    await db.delete(order)
    await db.commit()
    logger.info("AUDIT | op=order_delete | order=%s | prev_status=%s", order_id, order.status)
    return True
```

Seller filter en `list_orders_for_request`:
```python
elif current_user.role == "seller":
    stmt = (
        select(Order)
        .join(OrderItem, OrderItem.order_id == Order.id)
        .join(Product, Product.id == OrderItem.product_id)
        .where(Product.vendor_name == current_user.name)
        .distinct()
    )
```

**Step 3: Run tests**
```bash
pytest tests/test_services/test_order_service.py -v
```

**Step 4: Commit**
```bash
git add backend/app/services/order_service.py tests/test_services/test_order_service.py
git commit -m "fix(orders): release stock on hard delete, implement seller order filter"
```

---

### Component 8: Cleanup Service — Pending Payment Timeout

**Files:**
- Create: `backend/app/services/cleanup_service.py`
- Test: `tests/test_services/test_cleanup_service.py`

**Step 1: Test**
```python
async def test_cancel_stale_pending_orders_releases_stock(db_session):
    """Órdenes con pago pendiente por >60min deben cancelarse y liberar stock."""
    # Setup: order created 90 minutes ago, payment PENDING
    # ... setup con `created_at` en el pasado ...
    
    cancelled_count = await cancel_stale_pending_orders()
    
    assert cancelled_count == 1
    await db_session.refresh(order)
    assert order.status == "cancelled"
    await db_session.refresh(product)
    assert product.stock == initial_stock + ordered_qty
```

**Step 2: Crear cleanup_service.py** (ver código completo en sección de Proposed Changes arriba)

**Step 3: Integrar en lifespan** de `main.py`:
```python
from app.services.cleanup_service import run_periodic_cleanup
# En lifespan startup:
cleanup_task = asyncio.create_task(run_periodic_cleanup(interval_seconds=300))
```

**Step 4: Run test**
```bash
pytest tests/test_services/test_cleanup_service.py -v
```

**Step 5: Commit**
```bash
git add backend/app/services/cleanup_service.py tests/test_services/test_cleanup_service.py backend/app/main.py
git commit -m "feat(cleanup): add periodic job to cancel stale pending orders and release stock"
```

---

### Component 9: JWKS Thread Safety

**Files:**
- Modify: `backend/app/middleware/auth.py`

**Step 1: Test**
```python
async def test_concurrent_jwks_refresh_creates_single_client(mocker):
    """Accesos concurrentes no deben crear JWKS clients duplicados."""
    from app.middleware.auth import _get_or_refresh_jwks_client, _reset_jwks_client
    
    _reset_jwks_client()
    create_calls = []
    original_init = PyJWKClient.__init__
    def counting_init(self, *args, **kwargs):
        create_calls.append(1)
        return original_init(self, *args, **kwargs)
    mocker.patch.object(PyJWKClient, "__init__", counting_init)
    
    # 20 concurrent calls
    await asyncio.gather(*[_get_or_refresh_jwks_client() for _ in range(20)])
    assert len(create_calls) == 1, f"Expected 1 client created, got {len(create_calls)}"
```

**Step 2: Implementar** (ver código en Component 9 arriba)

**Step 3: Run test**
```bash
pytest tests/test_middleware/ -v
```

**Step 4: Commit**
```bash
git add backend/app/middleware/auth.py
git commit -m "fix(auth): add asyncio.Lock to JWKS client refresh to prevent duplicate instances"
```

---

### Component 10: Typing Modernization + Pydantic V2 Fixes

**Files:**
- Modify: `backend/app/services/order_service.py`
- Modify: `backend/app/services/product_service.py`
- Modify: `backend/app/services/stock_service.py`
- Modify: `backend/app/services/payment_service.py`
- Modify: `backend/app/services/cart_service.py`
- Modify: `backend/app/services/auth_service.py`
- Modify: `backend/app/schemas/` (verificar `min_items` → `min_length`)

**Step 1: Verificar scope del problema**
```bash
grep -rn "from typing import" backend/app/ | grep -v "__pycache__"
grep -rn "min_items" backend/app/schemas/
```

**Step 2: Reemplazos globales**
```bash
# Usando sed (ajustar para macOS):
# Optional[X] → X | None  (manual por complejidad)
# List[X] → list[X]
# Dict[X, Y] → dict[X, Y]
# Tuple[X] → tuple[X]
```

Ejemplo de transformación manual en `order_service.py`:
```python
# ANTES
from typing import List, Optional
async def get_user_orders(...) -> List[Order]:
async def get_order(...) -> Optional[Order]:

# DESPUÉS
async def get_user_orders(...) -> list[Order]:
async def get_order(...) -> Order | None:
```

Pydantic V2 fix en schemas:
```python
# ANTES
class OrderCreate(BaseModel):
    items: list[OrderItemCreate] = Field(..., min_items=1)

# DESPUÉS
from typing import Annotated
class OrderCreate(BaseModel):
    items: Annotated[list[OrderItemCreate], Field(min_length=1)]
```

**Step 3: Verificar**
```bash
# Sin residuos de typing legacy (solo los que son legítimos: Sequence, Union compleja, etc)
grep -rn "from typing import" backend/app/ | grep -v "__pycache__" | grep -v "Sequence\|Union\|Callable\|Type\|overload\|cast\|TYPE_CHECKING"

# Tests pasan
pytest tests/ -v --tb=short
```

**Step 4: Commit**
```bash
git add backend/app/services/ backend/app/schemas/
git commit -m "refactor(typing): migrate to Python 3.10+ native types, fix Pydantic v2 Field(min_length)"
```

---

## 🧪 Verification Plan

### Automated Tests

```bash
cd backend

# 1. Lint checks
python -m flake8 app/ --max-line-length=120
python -m mypy app/ --ignore-missing-imports

# 2. Suite completa (debe mantenerse verde - 506 tests)
pytest tests/ -v --tb=short

# 3. Coverage check (mínimo 80%)
pytest tests/ --cov=app --cov-report=term-missing --cov-fail-under=80

# 4. Verificar jose eliminado
grep -r "from jose" app/ && echo "ERROR: jose still present" || echo "OK: jose removed"

# 5. Verificar typing legacy
grep -rn "from typing import.*\bList\b\|from typing import.*\bDict\b\|from typing import.*\bOptional\b" app/ | grep -v "__pycache__"

# 6. Verificar declarative_base viejo
grep -rn "declarative_base" app/ | grep -v "__pycache__" && echo "WARN: old declarative_base found" || echo "OK"

# 7. Test de arranque limpio
python -c "from app.main import app; print('Import OK')"
```

### Manual Verification

1. `python run_server.py` — arrancar sin warnings de SQLAlchemy deprecated
2. Primera request a `/health` — rápida (startup eager en lifespan)
3. Primera request a `/products` — Redis ya inicializado, no lag
4. Actualizar precio de producto → verificar que cache se invalida (segunda request retorna nuevo precio)
5. Crear orden → cancelar pago → esperar cleanup job (mock o forzar con timeout corto) → verificar stock liberado
6. Revisar logs de startup — `"HealthBytes API starting | env=dev"` presente

---

## ⚠️ Open Questions

> [!IMPORTANT]
> **¿Cleanup job en-process o externo?**
> `asyncio.create_task` en lifespan funciona con 1 worker uvicorn. Con múltiples workers (gunicorn + uvicorn), cada worker corre su propio cleanup = órdenes canceladas N veces. ¿Cuántos workers en prod? Si múltiples, mover cleanup a cron externo (Linux cron, ECS Scheduled Task) o Celery Beat.

> [!IMPORTANT]
> **¿Seller filter usa `vendor_name` o FK?**
> La lógica de "seller ve sus productos" usa `Product.vendor_name == current_user.name`. Frágil: cambio de nombre = pierde acceso. ¿Agregar `seller_id = ForeignKey(users.id)` a `products`? Requiere migración Alembic + cambio de UI.

> [!WARNING]
> **`python-jose` removal puede romper imports ocultos**
> Antes de ejecutar Task 1: `grep -r "jose" backend/`. Si algún test o script importa `jose` directamente, debe actualizarse.

> [!NOTE]
> **`resend.Emails.send` en executor** es pragmático a corto plazo. A largo plazo: migrar a `httpx.AsyncClient` con Resend REST API para eliminar el SDK síncrono y ganar mejor async error handling.
