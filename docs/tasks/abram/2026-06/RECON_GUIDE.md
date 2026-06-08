# 🔍 Recon Guide — Abram (Backend)

> **Esta semana no escribes código.** Exploras, lees, y escribes tu reporte.
> Tu entregable al final de la semana es `docs/recon/RECON_ABRAM_2026-06-04.md`.

---

## Tu misión esta semana

Entender cómo está estructurado el backend de HealthBytes: cómo están modelados
los datos, cómo se procesan las órdenes y pagos, y cómo se protegen los endpoints.

---

## 🗂️ Archivos que DEBES leer (en este orden)

### Día 1 — Configuración y estructura

| Archivo | Qué buscar |
|---|---|
| `backend/app/config.py` | Variables de entorno y settings del proyecto |
| `backend/app/main.py` | Cómo arranca la app, middlewares registrados, routers incluidos |
| `backend/app/db/database.py` | Cómo se conecta a PostgreSQL (async SQLAlchemy) |
| `backend/app/db/models/__init__.py` | Qué modelos existen |

### Día 2 — Modelos y datos

| Archivo | Qué buscar |
|---|---|
| `backend/app/db/models/user.py` | Qué datos guarda un usuario |
| `backend/app/db/models/product.py` | Qué campos tiene un producto |
| `backend/app/db/models/order.py` | Cómo se modela una orden |
| `backend/app/db/models/payment.py` | Qué datos de pago se guardan |
| `backend/app/db/schemas.py` | Esquemas Pydantic — cómo se validan los datos |

### Día 3 — Servicios y rutas

| Archivo | Qué buscar |
|---|---|
| `backend/app/api/v1/auth.py` | Cómo funciona el login/registro |
| `backend/app/services/auth_service.py` | Lógica de autenticación |
| `backend/app/api/v1/products.py` | Endpoints de productos |
| `backend/app/services/product_service.py` | Lógica de catálogo |
| `backend/app/api/v1/orders.py` | Endpoints de órdenes |

---

## Preguntas guía para tu reporte

1. ¿Qué base de datos usa el proyecto y cómo se conecta? ¿Hay caché?
2. ¿Cuántos modelos de base de datos existen? ¿Cuál es el más complejo?
3. ¿Cómo se protegen los endpoints que requieren login? ¿Qué verifica el backend?
4. ¿Cómo llega un producto desde la DB hasta la respuesta JSON de la API?
5. ¿Qué pasa cuando se crea una orden? ¿Qué pasos sigue en el backend?

---

## Tu entregable

Copia `docs/tasks/RECON_TEMPLATE.md` → guárdalo como `docs/tasks/RECON_ABRAM_2026-06-04.md`
y completa las 6 secciones con lo que encontraste.

**No hay respuestas incorrectas.** El reporte es para ti y para el equipo.
