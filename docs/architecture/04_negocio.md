# 04 - Analisis de Logica de Negocio y Resiliencia Transaccional

> **Fecha:** 2026-04-02
> **Alcance:** Flujo critico Carrito -> Checkout -> MercadoPago -> Orden Final
> **Objetivo:** Identificar fallas de logica, race conditions, y debilidades en la consistencia de datos transaccionales.

---

## 1. Mapa del Flujo Critico Completo

```
Frontend (Zustand)                 Backend (FastAPI)                  MercadoPago
==================                 =================                  ===========

cartStore.addProduct()
  |-- optimistic update local
  |-- POST /api/v1/cart (si auth)
  |       |
  |       v
  |   cart_service.add_to_cart()
  |     |-- check_availability (sin lock)
  |     |-- INSERT/UPDATE cart_items
  |
checkout-v2.tsx :: handleNext()
  |-- POST /api/v1/orders
  |       |
  |       v
  |   order_service.create_order()         
  |     |-- SELECT products (sin lock)     
  |     |-- StockService.reserve_stock_batch()
  |     |     |-- SELECT FOR UPDATE (lock)
  |     |     |-- Validar stock
  |     |     |-- Decrementar stock
  |     |-- INSERT order + order_items
  |     |-- COMMIT (stock + orden atomico)
  |     |-- Enviar email confirmacion
  |     v
  |   return order_id
  |
  |-- POST /payments/mercadopago/create-preference
  |       |
  |       v
  |   mercadopago_service.create_preference()
  |     |-- INSERT payment (PENDING)
  |     |-- COMMIT
  |     |-- POST api.mercadopago.com/checkout/preferences
  |     |-- Guardar preference_id
  |     |-- COMMIT
  |     v
  |   return { init_point, sandbox_init_point }
  |
  |-- Linking.openURL(init_point) -------->  Usuario paga en MP
  |                                                |
  |                                                v
  |                                    POST /payments/mercadopago/webhook
  |                                          |
  |                                          v
  |                                    process_webhook()
  |                                      |-- Validar x-signature HMAC
  |                                      |-- GET payment info de MP API
  |                                      |-- Mapear status MP -> interno
  |                                      |-- Idempotency guard
  |                                      |-- Si COMPLETED: order.status = "processing"
  |                                      |-- Si FAILED/CANCELLED:
  |                                      |     |-- order.status = "cancelled"
  |                                      |     |-- release_stock_batch()
  |                                      |-- COMMIT
  |                                      |-- Background: enviar email pago exitoso
```

---

## 2. Analisis de Race Conditions en Stock

### 2.1 Lo que esta BIEN implementado

El `stock_service.py` usa **pessimistic locking** correctamente:

```python
# stock_service.py:87-91
result = await db.execute(
    select(Product)
    .where(Product.id == product_id)
    .with_for_update()  # CRITICAL: Pessimistic lock
)
```

**Fortalezas concretas:**

| Mecanismo | Ubicacion | Efecto |
|-----------|-----------|--------|
| `SELECT FOR UPDATE` | `reserve_stock_atomic()` L87-91 | Bloquea la fila hasta COMMIT, serializa escrituras concurrentes |
| Ordenamiento canonico `sorted(items, key=lambda x: x[0])` | `reserve_stock_batch()` L150 | **Previene deadlocks** entre transacciones que lockan productos en distinto orden |
| Two-pass validation (validar todo, luego mutar) | `reserve_stock_batch()` L172-198 | Garantiza atomicidad: o reserva todos o ninguno |
| Audit logging con old/new stock | Todas las operaciones | Trazabilidad completa |

**Escenario de 2 usuarios comprando el ultimo producto:**

```
T1: BEGIN; SELECT stock FROM products WHERE id=42 FOR UPDATE;  -- stock=1, fila LOCKED
T2: BEGIN; SELECT stock FROM products WHERE id=42 FOR UPDATE;  -- BLOQUEADO (espera T1)
T1: UPDATE stock = 0; COMMIT;                                  -- libera lock
T2: stock=0 < requested=1 -> HTTPException 400 "Insufficient stock"
```

Esto esta correcto. El `FOR UPDATE` serializa las transacciones a nivel de fila en PostgreSQL. **No hay overselling posible** en este path.

### 2.2 VULNERABILIDAD CRITICA: Ventana de Inconsistencia Cart -> Order

**Archivo afectado:** `cart_service.py:19-31`

```python
async def _get_available_stock(db: AsyncSession, product: Product) -> int:
    """Calculate available stock by subtracting reserved stock from pending orders."""
    result = await db.execute(
        select(func.coalesce(func.sum(OrderItem.quantity), 0)).where(
            OrderItem.product_id == product.id,
            OrderItem.order_id == Order.id,
            Order.status.in_(["unpaid", "processing", "shipped"]),
        )
    )
    reserved = result.scalar()
    return max(0, product.stock - reserved)
```

**Problema:** Esta consulta calcula stock disponible como `product.stock - SUM(reserved_in_orders)`, pero `product.stock` ya fue decrementado por `reserve_stock_batch` al crear la orden. Esto produce un **doble conteo**: el stock fisico ya esta reducido Y el calculo resta las ordenes activas otra vez.

**Consecuencia:** Los usuarios ven stock artificialmente bajo (posiblemente negativo pre-`max(0, ...)`), lo que causa rechazos fantasma en `add_to_cart()` cuando hay stock real disponible.

**Severidad:** Media. No causa overselling, pero causa **underselling** -- productos que aparecen como agotados cuando no lo estan.

**Mitigacion propuesta:**
```python
# Opcion A: Usar product.stock directamente (ya refleja reservas)
async def _get_available_stock(db: AsyncSession, product: Product) -> int:
    return product.stock

# Opcion B: Si se quiere considerar carritos activos (no solo ordenes),
# necesitaria un campo "reserved_stock" separado del "physical_stock"
```

### 2.3 VULNERABILIDAD: update_stock Admin sin Lock

**Archivo:** `stock_service.py:319-363`

```python
@staticmethod
async def update_stock(db, product_id, new_stock, admin_user_id):
    result = await db.execute(select(Product).where(Product.id == product_id))  # SIN FOR UPDATE
    product = result.scalar_one_or_none()
    # ...
    product.stock = new_stock  # Sobreescritura absoluta
    await db.commit()
```

**Problema:** Si un admin actualiza stock a 50 mientras una transaccion de compra tiene un `FOR UPDATE` lock que decrementa stock de 10 a 9, el admin escribe 50 despues del commit de la compra, **eliminando el decremento**.

**Severidad:** Baja (requiere coincidencia temporal admin + compra simultanea), pero potencialmente causa overselling si el stock queda artificialmente inflado.

**Mitigacion:**
```python
# Usar FOR UPDATE tambien en update_stock, o usar incrementos relativos:
result = await db.execute(
    select(Product).where(Product.id == product_id).with_for_update()
)
```

---

## 3. Analisis de Resiliencia MercadoPago Webhooks

### 3.1 Escenarios de Fallo del Webhook

| Escenario | Comportamiento Actual | Riesgo |
|-----------|----------------------|--------|
| **Webhook llega tarde (>30 min)** | Orden queda en "unpaid" indefinidamente | Stock reservado bloqueado sin liberacion |
| **Webhook falla con 5xx** | MP reintenta automaticamente | OK, pero ver idempotencia |
| **Webhook duplicado** | Idempotency guard (`new_status == previous_status`) | OK - skip silencioso |
| **Webhook con firma invalida** | `PaymentError("Invalid webhook signature")` | Se retorna 200 al webhook (L130-132), MP no reintenta |
| **Red cae entre COMMIT y email** | Email falla, pago procesado correctamente | OK - fire-and-forget con background task |
| **MP envia status desconocido** | `status_map.get(status, PaymentStatus.PENDING)` | Riesgo: status real "charged_back" se mapea a PENDING incorrectamente |

### 3.2 VULNERABILIDAD CRITICA: Pagos Pendientes sin TTL/Cleanup Job

**Archivo:** `payment_service.py:276-300`

```python
@staticmethod
async def get_pending_payments(db, older_than_minutes=30):
    cutoff_time = datetime.now(timezone.utc) - timedelta(minutes=older_than_minutes)
    result = await db.execute(
        select(Payment).where(
            Payment.status == PaymentStatus.PENDING,
            Payment.created_at < cutoff_time,
        )
    )
    return result.scalars().all()
```

El metodo `get_pending_payments` **existe pero nadie lo llama**. No hay:
- Cron job / scheduled task que ejecute limpieza
- Background worker que libere stock de pagos huerfanos
- Ningun endpoint que lo invoque periodicamente

**Consecuencia:** Si un usuario crea una orden (stock reservado, decrementado), inicia el pago en MercadoPago, y **abandona sin pagar**, el stock queda reservado para siempre. Con suficientes ordenes abandonadas, productos con stock real aparecen como agotados.

**Severidad:** ALTA. Es un vector de denegacion de servicio no intencional (o intencional).

**Mitigacion requerida:**
```python
# Opcion 1: Cron job con APScheduler o Celery Beat
@app.on_event("startup")
async def schedule_stale_payment_cleanup():
    # Cada 15 minutos:
    # 1. get_pending_payments(older_than_minutes=30)
    # 2. Para cada payment: cancel order + release_stock_batch()

# Opcion 2: FastAPI BackgroundTask al crear preference con timeout
# Opcion 3: MercadoPago expiration_date_from/to en la preference
```

### 3.3 VULNERABILIDAD: Webhook Retorna 200 en Error

**Archivo:** `mercadopago.py:129-132`

```python
except PaymentError as e:
    logger.error("Webhook processing error: %s", e)
    # Return 200 to MP so it doesn't retry indefinitely
    return {"status": "error", "message": str(e)}
```

Retornar 200 ante un error de procesamiento evita que MercadoPago reintente. Esto es un tradeoff razonable para errores de negocio (firma invalida, payment not found), pero peligroso para errores transitorios (DB timeout, connection reset).

**Problema concreto:** Si la base de datos esta temporalmente caida y el webhook falla con una excepcion de conexion que se envuelve en `PaymentError`, MP recibe 200 y no reintenta. El pago queda aprobado en MP pero la orden queda en "unpaid" sin stock release.

**Mitigacion:**
```python
except PaymentError as e:
    # Errores de negocio -> 200 (no reintentar)
    return {"status": "error", "message": str(e)}
except Exception as e:
    # Errores transitorios -> 500 (MP reintentara)
    logger.exception("Transient webhook error")
    raise HTTPException(status_code=500, detail="Internal error, please retry")
```

### 3.4 Atomicidad del Webhook: Correcto pero Fragil

El `process_webhook` modifica Payment y Order en la misma sesion y hace un solo `COMMIT` (L333). Esto es correcto. Pero el `release_stock_batch` en caso de fallo del pago tiene un `try/except` silencioso:

```python
# mercadopago_service.py:320-331
try:
    items_to_release = [(item.product_id, item.quantity) for item in order.items]
    await StockService.release_stock_batch(db=db, items=items_to_release, ...)
except Exception:
    logger.exception("Failed to release stock for order %s", order_id)
```

**Problema:** Si `release_stock_batch` falla (e.g., deadlock, producto eliminado), se loguea pero la orden ya paso a "cancelled" y el `COMMIT` en L333 persiste ese estado. El stock queda bloqueado permanentemente sin que nadie lo sepa fuera de los logs.

**Severidad:** Media-Alta. La orden aparece cancelada pero el stock no se libero.

**Mitigacion:** Mover el commit despues del release, o hacer rollback si el release falla:
```python
if release fails:
    # Marcar orden para revision manual en lugar de silenciar
    order.status = "requires_review"
    # O: no commitear y retornar 500 para que MP reintente
```

---

## 4. Consistencia Transaccional: Order Creation

### 4.1 VULNERABILIDAD: Doble Fetch de Productos

**Archivo:** `order_service.py:40-72`

```python
# Fetch 1: SELECT products sin lock (L47)
result = await db.execute(select(Product).where(Product.id.in_(product_ids)))
products = result.scalars().all()

# ... validaciones ...

# Fetch 2: SELECT FOR UPDATE con lock (dentro de reserve_stock_batch)
await StockService.reserve_stock_batch(db=db, items=stock_items)
```

Entre el Fetch 1 (sin lock) y el Fetch 2 (con lock), el precio del producto podria cambiar si un admin ejecuta `update_product` concurrentemente. El total de la orden se calcularia con el precio viejo (L77: `product.price * item.quantity`), porque usa los objetos del Fetch 1.

**Matiz importante:** SQLAlchemy con `expire_on_commit=False` (configurado en `database.py:33`) mantiene los objetos en la identity map. Dado que `reserve_stock_batch` opera sobre la misma sesion, los productos del Fetch 1 **podrian** estar stale si el admin modifico el precio entre ambos fetches.

**Severidad:** Baja. Requiere que un admin cambie precios durante el checkout de un usuario. En la practica, los precios no cambian tan frecuentemente.

**Mitigacion optima:** Usar los objetos retornados por `reserve_stock_batch` (que tienen lock) para calcular el total:
```python
locked_products = await StockService.reserve_stock_batch(db=db, items=stock_items)
locked_map = {p.id: p for p in locked_products}
# Usar locked_map[item.product_id].price para calcular total
```

### 4.2 El Commit dentro del Service es Correcto

```python
# order_service.py:105
await db.commit()
```

Esto garantiza que stock decrement + order creation + order items son **atomicos**. Si cualquier paso falla antes del commit, todo hace rollback automaticamente. Bien implementado.

### 4.3 RIESGO: Carrito No Se Limpia Atomicamente

El flujo en `checkout-v2.tsx` es:
1. `createOrder()` -> orden creada, stock reservado
2. `createMercadoPagoPreference()` -> payment creado
3. `Linking.openURL()` -> redirige a MP
4. Cart reset solo en `payment/success.tsx`

**Problema:** Si el paso 2 falla (MP API down), la orden ya esta creada con stock reservado pero el usuario vuelve al carrito. Puede reintentar checkout, creando **multiples ordenes duplicadas** para los mismos items, cada una reservando stock.

**Severidad:** Alta. Puede agotar stock con ordenes fantasma.

**Mitigacion:**
- Verificar si existe una orden "unpaid" reciente para el mismo carrito antes de crear una nueva
- O: crear la orden solo despues de confirmar el preference (invertir el orden)
- O: implementar un endpoint de cancelacion automatica de la orden si `create-preference` falla

---

## 5. Analisis de Dietary Preferences Matching

### 5.1 Arquitectura Actual

```
User.dietary_preferences = JSON ["sin-gluten", "vegano"]   (schemas.py:119)
Product <-> DietaryTag = M:N via product_dietary_tags       (schemas.py:67-85)
DietaryTag.name = String(50) ["gluten_free", "vegan"]       (schemas.py:94)
```

### 5.2 Flujo de Matching: Backend (SQL)

**Archivo:** `product_service.py:19-51`

```python
def _apply_product_filters(query, dietary_tags=None, ...):
    if dietary_tags:
        unique_tags = list(set(dietary_tags))
        subq = (
            select(product_dietary_tags.c.product_id)
            .join(DietaryTag, DietaryTag.id == product_dietary_tags.c.dietary_tag_id)
            .where(DietaryTag.name.in_(unique_tags))
            .group_by(product_dietary_tags.c.product_id)
            .having(func.count(DietaryTag.id) == len(unique_tags))
        )
        query = query.where(Product.id.in_(subq))
    return query
```

**Complejidad:** Esto genera el siguiente SQL:

```sql
SELECT products.* FROM products
WHERE products.id IN (
    SELECT pdt.product_id
    FROM product_dietary_tags pdt
    JOIN dietary_tags dt ON dt.id = pdt.dietary_tag_id
    WHERE dt.name IN ('vegano', 'sin-gluten')
    GROUP BY pdt.product_id
    HAVING COUNT(dt.id) = 2
)
```

**Analisis de complejidad:**
- **Subquery:** `O(T)` donde T = filas en `product_dietary_tags` (tipicamente pequeno, <10K)
- **GROUP BY + HAVING:** PostgreSQL usa HashAggregate, `O(T)`
- **IN subquery:** PostgreSQL lo optimiza como semi-join, `O(P)` donde P = productos
- **Indices existentes:** `idx_pdt_product` y `idx_pdt_tag` en la tabla asociativa

**Conclusion: NO es O(N^2).** Es `O(P + T)` en el peor caso, que es lineal. Con los indices GIN/B-tree existentes, la subquery usa Index Scan y el HAVING filtra en memoria. Para catalogos de hasta ~100K productos con ~10 tags por producto, esto es eficiente.

### 5.3 PROBLEMA: Naming Mismatch entre User y Product Tags

```
User.dietary_preferences = ["sin-gluten", "vegano"]     # Slugs en espanol (kebab-case)
DietaryTag.name = ["gluten_free", "vegan"]               # Slugs en ingles (snake_case)
```

**Problema critico:** Los valores guardados en `User.dietary_preferences` (JSON) **no coinciden** con `DietaryTag.name`. No hay logica de traduccion/mapeo documentada.

**Archivo afectado:** `user_service.py:60-83` -- Simplemente guarda los tags que llegan del frontend sin validar contra `DietaryTag.name`:

```python
async def update_dietary_preferences(db, user_id, tags):
    user.dietary_preferences = tags  # Guarda lo que sea que llegue
```

**Archivo afectado:** `api/v1/products.py:37` -- Los filtros de producto usan `DietaryTag.name`:

```python
dietary_tags = [t.strip() for t in dietary.split(",") if t.strip()]
# Estos deben matchear DietaryTag.name, que usa snake_case ingles
```

**Consecuencia:** Si el frontend envia las preferencias del usuario como filtro de productos, **nunca matchearan** porque los namespaces son distintos. Esto significa que la funcionalidad de "mostrar productos segun tus preferencias dietarias" esta **rota silenciosamente** o requiere un mapeo en el frontend que no esta documentado.

**Severidad:** Alta para la experiencia de usuario. Las recomendaciones basadas en preferencias no funcionan.

**Evidencia adicional:** El endpoint `/products/recommended` referenciado en `useRecommendationsStore.ts:27` **no existe** en ninguno de los routers del backend. Es un 404.

**Mitigacion:**
1. Normalizar los nombres: que `DietaryTag.name` use los mismos slugs que el frontend
2. O crear una tabla de mapeo `slug_display -> slug_internal`
3. Validar tags contra `DietaryTag.name` en `update_dietary_preferences()`
4. Implementar el endpoint `/products/recommended`

### 5.4 Frontend: Matching Local (preferencesStore)

```typescript
// preferencesStore.ts:30-32
updateDietaryPreferences: async (tags) => {
    set({ dietaryPreferences: tags });
    // Simular llamada a API si fuera necesario  <-- COMENTARIO REVELADOR
},
```

El store de preferencias locales NO sincroniza con el backend en `updateDietaryPreferences`. Solo `api/preferences.ts` tiene la llamada real, pero el store no la usa. Hay dos fuentes de verdad desincronizadas.

---

## 6. Escenarios de Fallo Compuestos

### 6.1 Escenario: "Storm de Carritos Abandonados"

```
1. 100 usuarios agregan el ultimo producto (stock=100) a su carrito
2. 100 usuarios llegan a checkout y crean ordenes (stock=0)
3. 50 usuarios abandonan en la pantalla de MercadoPago
4. Resultado: 50 ordenes "unpaid" con stock reservado indefinidamente
5. Los 50 productos son invendibles para otros clientes
```

**Estado actual:** Sin cleanup job, este escenario bloquea stock permanentemente.

### 6.2 Escenario: "Double Checkout Race"

```
1. Usuario crea orden #1 (stock reservado)
2. create-preference falla (MP API timeout)
3. Usuario presiona "reintentar"
4. Frontend crea orden #2 (mas stock reservado)
5. El stock se decrementa dos veces para los mismos items
```

**Estado actual:** No hay deduplicacion de ordenes. Cada retry crea una nueva.

### 6.3 Escenario: "Webhook Tardio + Cancelacion Admin"

```
1. Usuario paga, webhook se retrasa
2. Admin ve orden "unpaid" despues de 1 hora, la cancela manualmente
3. release_stock_batch() devuelve stock
4. Webhook llega tarde: order.status = "processing" (sobreescribe "cancelled")
5. Stock no se re-reserva (ya fue liberado)
6. Orden en "processing" sin stock reservado -> overselling
```

**Mitigacion:** El `update_order_status` tiene validacion de transiciones (`cancelled -> []`), lo cual previene que una orden cancelada vuelva a processing. **Sin embargo**, el webhook en `process_webhook()` (L307-310) NO usa `update_order_status()`, sino que modifica `order.status` directamente:

```python
if order:
    order.status = "processing"  # Bypass de la FSM de transiciones!
```

**Severidad:** ALTA. El webhook bypasses la maquina de estados de ordenes.

---

## 7. Matriz de Severidad y Priorizacion

| # | Vulnerabilidad | Severidad | Impacto | Esfuerzo Fix |
|---|---------------|-----------|---------|--------------|
| 1 | Sin cleanup job para pagos pendientes (Sec 3.2) | **CRITICA** | Stock bloqueado permanentemente | Medio |
| 2 | Webhook bypasses FSM de ordenes (Sec 6.3) | **ALTA** | Posible overselling post-cancelacion | Bajo |
| 3 | Double checkout sin deduplicacion (Sec 6.2) | **ALTA** | Stock doblemente reservado | Medio |
| 4 | Naming mismatch dietary preferences (Sec 5.3) | **ALTA** | Feature rota silenciosamente | Bajo |
| 5 | Endpoint /products/recommended no existe (Sec 5.3) | **ALTA** | 404 en produccion | Medio |
| 6 | Webhook retorna 200 en errores transitorios (Sec 3.3) | **MEDIA-ALTA** | Pagos perdidos en caidas de DB | Bajo |
| 7 | Stock release silenciado en webhook (Sec 3.4) | **MEDIA-ALTA** | Stock fantasma | Bajo |
| 8 | Doble conteo de stock en cart_service (Sec 2.2) | **MEDIA** | Underselling (falso agotado) | Bajo |
| 9 | update_stock admin sin FOR UPDATE (Sec 2.3) | **BAJA** | Race condition improbable | Trivial |
| 10 | Doble fetch de productos en create_order (Sec 4.1) | **BAJA** | Precio stale en edge case | Bajo |

---

## 8. Recomendaciones Priorizadas

### P0 - Hacer antes de produccion

1. **Implementar stale payment cleanup job**
   - Ejecutar cada 15 minutos
   - Cancelar ordenes con pagos PENDING > 30 min
   - Liberar stock con `release_stock_batch()`
   - Archivos: nuevo `app/tasks/cleanup_stale_payments.py`

2. **Webhook debe usar la FSM de transiciones**
   - Reemplazar `order.status = "processing"` por `update_order_status(db, order_id, "processing")`
   - Esto respeta las transiciones validas y previene estados inconsistentes
   - Archivo: `mercadopago_service.py:306-310`

3. **Normalizar dietary tag naming**
   - Migrar `DietaryTag.name` a usar los mismos slugs que el frontend, o crear mapeo explicito
   - Validar tags en `update_dietary_preferences()` contra la tabla
   - Archivos: `user_service.py`, migracion de datos

### P1 - Sprint siguiente

4. **Prevenir double checkout**
   - Antes de crear orden: verificar si existe una "unpaid" reciente (<30min) con los mismos items
   - O: reusar la orden existente para crear nueva preference
   - Archivo: `order_service.py:create_order()`

5. **Discriminar errores en webhook**
   - `PaymentError` -> 200 (no reintentar)
   - `Exception` generico -> 500 (MP reintentara)
   - Archivo: `mercadopago.py:129-132`

6. **Implementar endpoint /products/recommended**
   - Query: productos con dietary_tags que matcheen user.dietary_preferences
   - Requiere resolver el naming mismatch primero
   - Archivos: `api/v1/products.py`, `product_service.py`

### P2 - Mejora continua

7. **Corregir _get_available_stock en cart_service**
   - Usar `product.stock` directamente (ya refleja reservas)
   - Archivo: `cart_service.py:19-31`

8. **Agregar FOR UPDATE en update_stock admin**
   - Archivo: `stock_service.py:340`

9. **Usar productos locked para calcular total**
   - Archivo: `order_service.py:75-78`

---

## 9. Lo que esta Bien Hecho

No todo es negativo. El sistema tiene buenas bases:

- **Pessimistic locking con canonical ordering** en `reserve_stock_batch()` es una implementacion correcta de prevencion de deadlocks. Muchos sistemas de e-commerce no hacen esto.
- **Two-pass validation** (validar todo antes de mutar) es un patron solido.
- **Idempotency guard** en el webhook previene procesamiento duplicado.
- **Precios desde DB** (nunca del cliente) en `create_order()` es la practica correcta.
- **Audit logging** extenso con old/new values en todas las operaciones de stock.
- **Background email** desacoplado del webhook response.
- **HMAC signature validation** del webhook con timing-safe comparison (`hmac.compare_digest`).
- **Rate limiting** en `create-preference` (20/min).
- **Session management** con `expire_on_commit=False` y pool sizing adecuado.
