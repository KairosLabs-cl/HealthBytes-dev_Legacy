# HealthBytes — Análisis de Staff Engineer

> **Fecha**: 2026-03-02
> **Contexto**: MVP en desarrollo activo, orientado a lanzamiento este mes. Backend FastAPI + React Native Expo.
> **Metodología**: 3 agentes analizaron simultáneamente backend, frontend, y DevOps/docs.

---

## 📈 Nivel de Madurez: **65 / 100**

| Dimensión                          | Score | Estado                                      |
| ----------------------------------- | ----- | ------------------------------------------- |
| Arquitectura del código            | 78    | Sólida, 3 capas respetadas                 |
| Seguridad (auth/headers)            | 72    | Hardening hecho, gaps en pipeline           |
| Testing (backend 87%, FE 126 tests) | 70    | Buena cobertura, paths críticos sin cubrir |
| DevOps / Observabilidad             | 32    | **El hueco más grande**              |
| Modelo de datos                     | 55    | Inconsistencia crítica de IDs              |
| Calidad frontend                    | 64    | Race conditions + token bugs                |
| Documentación                      | 58    | Extensa pero desactualizada                 |

Un 65 significa: código bien pensado para el estadio, fundamentos sólidos, pero **no está listo para producción hoy**. Necesita 2–3 semanas de trabajo focalizado, no un rewrite.

---

## 🔴 Riesgos Críticos (Bloqueantes de producción)

### 1. Inconsistencia de IDs en el modelo de datos

**Archivos**: `backend/db/schemas.py`, `backend/db/models/address.py`, `backend/app/api/v1/orders.py:55–70`

`User.id` es `Integer`. `Address.user_id` es `String` (espera Clerk ID). `Order.user_id` es `Integer`. El router en `api/v1/orders.py:55–70` filtra `Address.user_id == current_user.clerk_id` pero pasa `user_id=user_id` (Integer) al servicio. **Esto rompe la validación de domicilio en producción**: un usuario puede comprar a una dirección que no le pertenece, o los pedidos fallan silenciosamente al crear. Es el bug más peligroso del proyecto.

**Fix**: Estandarizar en Integer IDs como FK everywhere. `clerk_id` solo como campo de autenticación secundario.

---

### 2. Race condition en carrito

**Archivo**: `frontend/store/cartStore.ts:152–201`

Si el usuario agrega el mismo producto rápidamente (doble tap, red lenta), se disparan requests concurrentes sin serialización. El servidor puede quedar con qty=1 mientras el cliente muestra qty=3. El rollback solo restaura el estado previo al primer tap, no al estado del servidor. Resultado: checkout cobra mal o falla.

**Fix**: Mutex simple — chequear `addingProducts` Set antes de disparar la llamada al servidor. Serializar operaciones por producto.

---

### 3. Token sin prefijo Bearer en `api/cart.ts:34`

**Archivo**: `frontend/api/cart.ts:34`

Todos los módulos API usan `Authorization: Bearer ${token}`, excepto `cart.ts` que envía el token desnudo. El backend espera un formato consistente. Genera 401s intermitentes en operaciones de carrito — imposible de debuggear sin herramientas de observabilidad.

**Fix**: Cambiar línea 34 a `Authorization: Bearer ${token}`. 5 minutos.

---

### 4. Frontend Dockerfile ejecuta dev server en producción

**Archivo**: `frontend/Dockerfile`

El Dockerfile ejecuta `pnpm start` (Metro Bundler). Esto no es un build de producción: sin minificación, sin tree-shaking, Metro Bundler expuesto. Para una app mobile-first con Expo, el artefacto de producción debe construirse con **EAS Build**, no desplegarse como contenedor. El Dockerfile de frontend es esencialmente inútil para producción real.

**Fix**: El deploy móvil real debe usar EAS Build para generar `.ipa`/`.apk`. El Dockerfile puede servir para un web build con `expo export`.

---

### 5. Cero observabilidad

**Scope**: Todo el stack

No hay logging estructurado centralizado, no hay métricas, no hay alertas, no hay error tracking (Sentry). Si algo falla en producción — un payment webhook que falla, un pedido que queda en estado inconsistente, un spike de 500s — **no hay manera de saberlo**. Esto convierte cualquier bug en producción en una catástrofe sin diagnóstico.

**Fix (prioridad máxima)**:

1. Integrar Sentry en backend (`sentry-sdk`) y frontend (`@sentry/react-native`) — 2 horas
2. Structured JSON logging en FastAPI — 4 horas
3. Alertas básicas (Slack webhook en 500s) — 2 horas

---

### 6. Sin escaneo de seguridad en CI

**Archivo**: `.github/workflows/ci.yml`

No hay SAST (Semgrep/Snyk), no hay secret scanning (TruffleHog/Gitleaks), no hay container scanning (Trivy). Un secret hardcodeado accidentalmente, una dependencia con CVE conocido, o una vulnerabilidad de inyección puede llegar a producción sin ninguna alerta.

**Fix**: Agregar como jobs paralelos en `ci.yml`. Snyk + TruffleHog tienen free tier suficiente para MVP.

---

### 7. Webhook de Mercado Pago sin transacción atómica

**Archivo**: `backend/app/services/mercadopago_service.py:326`

El `commit()` ocurre antes de que el email se envíe. Si el email falla, el estado del pago se actualizó pero el usuario no recibió confirmación. Más grave: si el cliente de Mercado Pago reintenta el webhook, el guard de idempotencia lo rechaza porque el estado ya cambió. **Resultado**: pagos confirmados sin email, estados inconsistentes, sin posibilidad de retry.

**Fix**: La transacción debe abarcar validate → update → email OR rollback all. Considerar background tasks para el email.

---

## 🟠 Mejoras Importantes (Próximo sprint)

### Backend

- **`mercadopago_service.py:372`**: Si `MERCADO_PAGO_WEBHOOK_SECRET` no está configurado, se saltea la validación HMAC. En producción debería fallar ruidosamente. Agregar: `if not self.webhook_secret and settings.ENVIRONMENT == "production": raise`.
- **`config.py:37–38`**: `BACKEND_URL`/`FRONTEND_URL` tienen defaults de localhost. En staging/ECS se usa el hostname del contenedor. URLs de redirect de Mercado Pago apuntan al host incorrecto. Remover defaults, requerir variables explícitas en prod.
- **`schemas/order.py:28`**: `price: float` en vez de `Decimal`. Float arithmetic errors en totales de órdenes. Para un e-commerce, esto es un bug de negocio.
- **`product_service.py:34`**: `ilike(f"%{search}%")` sin límite de longitud. Búsquedas con wildcards hacen full table scan. Agregar `max_length` al parámetro, considerar usar el índice `tsvector` ya configurado.
- **`db/schemas.py`**: Falta `Index("idx_order_status", Order.status)`. Las queries de filtro por estado son las más frecuentes en el sistema.
- **Tests**: Falta test unitario del HMAC de webhook de Mercado Pago. Si la implementación es incorrecta, no hay forma de saberlo. Crear `tests/test_services/test_mercadopago_webhook.py`.

### Frontend

- **`lib/cache.ts:9–26`**: Logging verbose de metadata de tokens activo en builds de producción. Envolver todo en `if (__DEV__)`.
- **`checkout-v2.tsx:96–104`**: Polling manual para refresh de token (`for attempt in 1..3`). Reemplazar con `getToken({ forcedRefresh: true })` de Clerk.
- **`checkout-v2.tsx:154–162`**: El carrito se resetea antes de confirmar el pago. Si el redirect a Mercado Pago falla, el usuario pierde el carrito sin haber pagado. Mover el `resetCart()` a post-confirmación via webhook.
- **Sin retry en API calls**: React Query tiene `retry: 3` built-in — solo falta habilitarlo. Crítico para redes móviles.
- **`process.env.EXPO_PUBLIC_API_URL`** sin validación en ningún módulo API. Si el env var no está, todas las requests van a `undefined/endpoint` silenciosamente.

### DevOps

- Sin smoke tests post-deploy. Un deploy roto puede estar en producción por horas.
- Sin rollback strategy en ECS. Si un deploy falla, no hay rollback automático. Habilitar `enable_rollback: true` en la tarea ECS.
- `alembic/versions/` tiene solo 2 migraciones recientes, sin migración inicial del schema. En un ambiente limpio (staging, nuevo dev), `alembic upgrade head` falla. Crear migración inicial con `alembic revision --autogenerate -m "initial_schema"`.
- Sin approval gate en GitHub para deploy a producción. Habilitar en GitHub Settings → Environments → `production` → Required reviewers.

---

## 🟢 Optimizaciones Estratégicas

### Para el lanzamiento inmediato (ROI máximo, esfuerzo mínimo)

1. **Sentry** (frontend + backend): 2 horas de setup. Primera línea de defensa en producción. Sin esto, cualquier bug en prod requiere análisis forense manual.
2. **Estandarizar IDs de dominio**: Decidir ahora — Integer IDs en FK everywhere, Clerk ID solo como campo de autenticación. Un día de trabajo, evita una categoría entera de bugs de producción.
3. **Queue de operaciones en cartStore**: Agregar un flag `isProcessing` por producto antes de llamadas al servidor en `addProduct` y `updateQuantity`. Previene el race condition sin cambiar la arquitectura.
4. **Validar `MERCADO_PAGO_WEBHOOK_SECRET` en startup**: Una línea en `config.py`: si el campo es None y `ENVIRONMENT == "production"`, raise error. Fail fast en lugar de fail silently.

### A mediano plazo (2–6 semanas)

5. **Migrar precios a Decimal**: Backend ya usa `Numeric(10,2)` en DB — la inconsistencia es solo en schemas Pydantic y tipos TypeScript. Cambio quirúrgico, evita errores contables con AFIP.
6. **Caché de productos con Redis**: Redis ya está en docker-compose pero no conectado al backend. `functools.lru_cache` o Redis para el endpoint de home page. Con 1,000 usuarios concurrentes, son 1,000 queries idénticas a Postgres hoy.
7. **CI: Snyk + TruffleHog**: Ambos tienen free tier suficiente para un MVP. Jobs paralelos en `ci.yml`. 3 horas de trabajo, elimina un vector de riesgo de seguridad permanente.
8. **E2E test del checkout**: El camino crítico (add→cart→checkout→payment redirect) no tiene prueba de integración. Un test con mocks del API de Mercado Pago que valide el flujo completo de estado.
9. **Mercado Pago webhook async**: Mover el procesamiento del webhook a un background task (Celery o `asyncio.create_task`). El endpoint actual es synchronous — con volumen, Resend lento hace que Mercado Pago haga timeout y reintente, generando estados inconsistentes.

---

## Análisis Específico por Área

### README como herramienta de onboarding: 7/10

El README tiene 1,060 líneas y cubre lo necesario para que un dev nuevo levante el proyecto. Los quick starts están bien. El troubleshooting de Expo Go (por qué no funciona localhost) es el tipo de detalle que ahorra 2 horas a un nuevo dev.

**Problemas concretos**:

- Docker figura como "📝 Planeado" cuando está implementado y funcional
- Coverage dice "70%, 179 tests" — la realidad es 87%, 387 tests
- "Payment Integration: Febrero 2026 - En proceso" — ya está implementado
- No hay una sección de **Production Deployment Checklist**
- `ESTADO.md` está mislabeled — contiene arquitectura técnica, no estado del proyecto

Un README desactualizado en un proyecto activo genera desconfianza. Si los números visibles están mal, ¿qué más está mal?

---

### Claridad arquitectónica y riesgos de escalabilidad

La separación en 3 capas (routers → services → models) es sólida y es el **mayor activo arquitectónico del proyecto**. La disciplina se mantuvo en ~95% de los archivos. Hay un leak en `api/v1/orders.py:55–70` donde el router hace queries directas a la DB, pero es aislado.

**Riesgos de escala que aparecen hoy pero explotan mañana**:

- **Sin caché de productos**: Cada request de home page hace query a Postgres. Con 1,000 usuarios concurrentes, hay 1,000 queries idénticas. Redis está en docker-compose pero no está conectado al backend.
- **Connection pool de 20+10=30 conexiones**: Razonable para MVP, pero si se migra a múltiples workers/containers sin PgBouncer, esto explota multiplicado por el número de instancias.
- **Mercado Pago webhook es synchronous**: El procesamiento (actualizar orden + liberar stock + enviar email) ocurre en el request-response cycle. Diseñado para background tasks.
- **Sin soft deletes en Products**: Si se desactiva un producto que tiene líneas en órdenes existentes, se pueden producir inconsistencias en histórico de órdenes.

---

### Inconsistencias internas

| Área          | Inconsistencia                                                             |
| -------------- | -------------------------------------------------------------------------- |
| Roadmap        | Payment Integration marcado "pendiente" pero implementado desde Feb        |
| README         | 179 tests / 70% coverage cuando son 387 / 87%                              |
| Docker status  | README dice "Planeado", docker-compose está completo                      |
| IDs            | `User.id` Integer, `Address.user_id` String, `Order.user_id` Integer |
| Token format   | `cart.ts` sin Bearer, resto de la app con Bearer                         |
| Precios        | DB Numeric(10,2), Pydantic float, TypeScript number                        |
| Python version | Local dev 3.14, CI usa 3.13 (mismatch documentado pero confuso)            |
| `ESTADO.md`  | Nombre dice "estado" pero contiene arquitectura                            |

---

### Qué eliminar para reducir complejidad innecesaria

1. **El Dockerfile de frontend** — para una app Expo, el artifact es un binario `.ipa`/`.apk`. El Dockerfile existe pero no sirve para producción móvil. Confunde a nuevos devs.
2. **Redis en docker-compose sin integración backend** — declarado pero no conectado. O se conecta (caché de productos) o se quita para no confundir.
3. ~~**La mayoría de los archivos en `docs/ai-logs/`**~~ — ✅ **ELIMINADO** (2026-03-03). Consolidado en `docs/development/`. Mantener solo `ESTADO.md`, `ROADMAP.md` y `inspections/`.
4. **`verify_password_mock()` en `core/security.py`** — si está activo en algún path de producción, es un riesgo. Si es solo para tests, debería vivir en `conftest.py`.
5. **`python-jose` y `PyJWT` simultáneos** — se puede consolidar en uno. Deuda que confunde.

---

### ¿Está sobre-ingenierizado para su etapa?

**No, pero tiene sobre-complejidad en documentación e infra declarativa.**

La arquitectura de código es apropiada para el estadio. Three-layer backend, React Query, Zustand stores con optimistic updates — estos no son over-engineering, son patrones que pagan dividendos desde el día 1 en producción. La alternativa (useState + fetch en componentes) hubiera sido deuda técnica inmediata.

Donde sí hay sobre-complejidad:

- 40+ archivos de AI logs que son historia de desarrollo, no documentación técnica
- docker-compose con Redis y frontend container que no se usan en el flujo real de deploy
- CI con 5 jobs paralelos bien diseñados, pero sin las validaciones críticas de seguridad que realmente importan
- HMAC-SHA256 completo en webhooks (excelente) pero sin tests que lo validen (la complejidad no tiene la cobertura que merece)

---

## 🧨 Decisiones que podrían salir mal en 6 meses

1. **El ID mismatch (int vs string) no resuelto** → A medida que crezca el dataset, las órdenes mal vinculadas a domicilios generarán surface de fraude: un usuario podría recibir pedidos en domicilios de otros usuarios.
2. **Sin observabilidad → blind flying** → Cuando (no si) haya un outage, el tiempo de diagnóstico se va a medir en horas. Los primeros usuarios de producción van a ser los que paguen el costo de discovery.
3. **Float prices acumulados** → Con volumen, los errores de redondeo en totales de órdenes generan discrepancias contables. Mercado Pago cobra centavos de más o de menos, lo cual escala a problemas con AFIP.
4. **El carrito desincronizado** → En una promoción viral, la tasa de double-taps sube. El race condition se manifiesta justo cuando más importa. Los usuarios ven inconsistencias en sus carritos y pierden confianza.
5. **Sin caché de productos** → El primer pico de tráfico hace full table scan en Postgres en cada request de home. El backend se cae exactamente cuando importa que esté arriba.
6. **Mercado Pago webhook síncrono** → Con volumen, los emails lentos de Resend hacen que el endpoint demore, Mercado Pago reintenta, el idempotency guard rechaza el retry, y el estado del pago queda inconsistente. Cada orden problemática requiere intervención manual.
7. **Sin staging gate en CI** → Un bug que rompe checkout llega a producción en el próximo push. Sin smoke tests post-deploy, puede estar roto por horas antes de que un usuario lo reporte.

---

## Plan de Acción Recomendado (2 semanas a producción)

```
Semana 1 — Blockers
  Día 1-2: Fix ID mismatch (Address.user_id → Integer FK a User.id)
  Día 2:   Standardizar Bearer token en cart.ts, remover debug logging de cache.ts
  Día 3:   Integrar Sentry (backend + frontend), JSON structured logging en main.py
  Día 4:   Fix cart race condition (mutex), fix webhook transaction scope
  Día 5:   Approval gate en GitHub, smoke tests post-deploy en CI

Semana 2 — Quality gates
  Día 1-2: Secret scanning en CI (Snyk + TruffleHog), fix BACKEND_URL defaults
  Día 3:   Migrar price fields a Decimal (backend schemas + frontend types)
  Día 4:   Fix token polling → forcedRefresh, fix cart reset timing en checkout
  Día 5:   Actualizar README, crear PRODUCTION_CHECKLIST.md, crear migración inicial Alembic
```

---

## Conclusión

El proyecto tiene fundamentos reales. La arquitectura está bien. El testing coverage es por encima del promedio de startups en esta etapa. Pero sin los fixes de la Semana 1 — especialmente observabilidad y el ID mismatch — lanzar a producción es asumir riesgos que se van a materializar en las primeras 48 horas de tráfico real.

**El mayor riesgo no es el código — es no saber qué pasa cuando el código corre en producción.**
