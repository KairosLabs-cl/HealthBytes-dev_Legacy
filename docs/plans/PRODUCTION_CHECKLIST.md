# HealthBytes — Production Checklist

Completar cada ítem antes de ejecutar el deploy manual de producción.
Firmar con fecha y nombre cuando se verifique cada sección.

---

## Estado de Auditoría Técnica — 11 Marzo 2026

Auditoría de estado real del proyecto. Verificado contra el código fuente, tests ejecutados localmente.

**Última actualización:** 11 Marzo 2026 — auditoría completa post-sprint

### Auditoría 5 Marzo (baseline)

| Área | Estado | Detalle |
|------|--------|---------|
| CI pnpm version | ✅ Corregido | `deploy.yml:209` actualizado a v10, alineado con `ci.yml` y `package.json` |
| pytest-cov | ✅ Corregido | `pytest-cov>=4.1.0` en `requirements-dev.txt` |
| mangum (Lambda) | ✅ Eliminado | Removido de `requirements.txt` y `main.py` |
| Infra scripts | ✅ Listos | `infra/ecr-setup.sh`, `infra/ecs-task-definition.json`, `infra/secrets-setup.sh` |
| app.json slug/scheme | ✅ Corregido | `"slug": "healthbytes"`, `"scheme": "healthbytes"` |
| package.json name | ✅ Corregido | `"name": "healthbytes"` |
| Typo deploy.yml | ✅ Corregido | `aws-access-key-id` correcto |
| Redis cache | ✅ Implementado | `get_products_cached()` en `product_service.py` con graceful degradation |
| OnboardingModal | ✅ Cableado | Conectado al store + `_layout.tsx`, test suite en `components/__tests__/` |
| E2E tests | ✅ Implementado | 10 tests en `backend/tests/e2e/` (auth gate, checkout flow, email) |
| Smoke tests extendidos | ✅ Implementado | 8/8 checks incluyendo `/addresses` y `/favorites` |

### Auditoría 11 Marzo (actualización)

| Área | Estado | Detalle |
|------|--------|---------|
| Backend tests | ✅ 442 passed, 1 skipped | Coverage 87% — Python 3.14.3 |
| Frontend tests | ✅ 130 passed, 14 suites | Todos en verde |
| checkout-v2 infinite loop | ✅ Verificado | Ya corregido — `useEffect` con `[]` deps en `checkout-v2.tsx:71` |
| AuthGate payment screens | ✅ Corregido | `payment/pending`, `payment/success`, `payment/failure` ahora protegidos con `<AuthGate>` |
| ORM/DB index drift | ✅ Corregido | `product_dietary_tags` — Index declarations en `schemas.py` sincronizados con SQL migrations |
| MVP progress | ✅ ~90% | 8/8 features implementadas, UI polish sprint completo |

### Advertencias no-bloqueantes (low priority)

| Advertencia | Detalle | Acción sugerida |
|-------------|---------|-----------------|
| `datetime.utcnow()` deprecation | Python 3.12+ depreca `utcnow()` — aparece en tests y fixtures | Migrar a `datetime.now(UTC)` en próximo sprint |
| `HTTP_422_UNPROCESSABLE_ENTITY` deprecation | Starlette depreca esta constante | Cambiar a `status.HTTP_422_UNPROCESSABLE_ENTITY` de FastAPI o usar int `422` |
| `asyncio.iscoroutinefunction` deprecation | Python 3.14 lo marca como deprecated | Usar `inspect.iscoroutinefunction` en su lugar |

**Pendientes antes de producción (infra + ops, no código):**
1. Ejecutar `alembic upgrade head` contra RDS prod
2. Configurar secrets en AWS SSM con `infra/secrets-setup.sh`
3. EAS Build preview en device Android real
4. Flujo E2E manual completo (ver sección 6 del checklist)

---

## 1. Backend — Variables de Entorno (AWS SSM)

Verificar que todos los parámetros existen en SSM:
```bash
aws ssm get-parameters-by-path \
  --path /healthbytes/prod \
  --region us-east-1 \
  --query 'Parameters[*].Name'
```

- [ ] `ENVIRONMENT` = `production` (exactamente este valor — activa las validaciones de startup)
- [ ] `***REDACTED_DATABASE_URL***
- [ ] `JWT_SECRET` tiene al menos 32 caracteres
- [ ] `CLERK_PUBLISHABLE_KEY` es clave de producción (empieza con `pk_live_`)
- [ ] `***REDACTED_CLERK_SECRET_KEY***
- [ ] `***REDACTED_MERCADOPAGO_TOKEN***
- [ ] `MERCADO_PAGO_WEBHOOK_SECRET` está configurado
- [ ] `***REDACTED_RESEND_KEY***
- [ ] `EMAIL_FROM_ADDRESS` usa un dominio verificado en Resend (no `onboarding@resend.dev`)
- [ ] `BACKEND_URL` = `https://api.healthbytes.cl` (sin trailing slash)
- [ ] `FRONTEND_URL` = `https://healthbytes.cl` (sin trailing slash)
- [ ] `SENTRY_DSN` está configurado

**Variables que NO deben estar seteadas en producción (usar defaults seguros):**
- [ ] `DEV_BYPASS_AUTH` = NO configurado (default: `false`) — CRÍTICO
- [ ] `ENABLE_DIAGNOSTIC_ENDPOINTS` = NO configurado (default: `false`)

**Verificación de startup:** Al arrancar con `ENVIRONMENT=production`, el backend ejecuta
`_validate_production_config()` en `backend/app/config.py:94`. Si falta algún secret requerido,
el proceso falla en startup con `RuntimeError`. Esto es intencional — verificar los logs de ECS.

---

## 2. Base de Datos (RDS)

- [ ] Migrations aplicadas: `alembic upgrade head` corrió sin error en RDS prod
- [ ] Migración más reciente confirmada: `20260302_35d20be20a0a_fix_address_user_id_integer_fk`
- [ ] Conexión verificada desde el entorno de deploy:
  ```bash
  psql $PROD_***REDACTED_DATABASE_URL***
  ```
- [ ] Security group de RDS permite tráfico en puerto 5432 desde el security group del ECS task
- [ ] RDS tiene backups automáticos habilitados (retention ≥ 7 días)

---

## 3. CI/CD — GitHub Actions

- [ ] Todos los GitHub Secrets configurados (ver lista completa en `docs/plans/2026-03-04-mvp-closure.md`, Task 2)
- [ ] Typo fix confirmado en `deploy.yml`: buscar `aws-access-key-id` (no `aws-access-access-key-id`) en el job `deploy-production-backend`
- [ ] Versión de pnpm alineada entre CI (`ci.yml`) y `frontend/package.json` (`packageManager`)
- [ ] CI verde en el último commit de `main`: jobs `backend-lint`, `backend-test`, `frontend-lint`, `frontend-test`, `sast`, `secret-scan`, `docker-build` todos en verde
- [ ] Manual approval gate configurado: GitHub → Settings → Environments → `production` → Required reviewers
- [ ] IAM role `ecsTaskExecutionRole` tiene policy `ssm:GetParameter` para el path `/healthbytes/prod/*`

---

## 4. Frontend — Build

- [ ] `frontend/app.json` tiene `slug: "healthbytes"` (no `"shop"`)
- [ ] `frontend/app.json` tiene `scheme: "healthbytes"` (no `"safe_ecommerce"`)
- [ ] `frontend/package.json` tiene `name: "healthbytes"` (no `"shop"`)
- [ ] `frontend/app.config.js` inyecta `EXPO_PUBLIC_API_URL` y `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` (bloque `extra` descomentado)
- [ ] `EXPO_PUBLIC_API_URL` en el build apunta a `https://api.healthbytes.cl` (no localhost)
- [ ] `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` en el build usa la clave de producción

**Android (APK/AAB):**
- [ ] EAS Build `preview` ejecutado exitosamente: `eas build --platform android --profile preview`
- [ ] APK instalado en al menos un device Android real (no emulador)
- [ ] `versionCode: 1` en `app.json` — incrementar en cada release

**iOS (TestFlight):**
- [ ] EAS Build `preview` ejecutado exitosamente: `eas build --platform ios --profile preview`
- [ ] Build distribuido via TestFlight a testers internos
- [ ] Perfil de distribución y certificado válidos en Apple Developer account

---

## 5. Seguridad

```bash
# Ejecutar todos antes del deploy:
cd backend && bandit -r app/ -ll
cd frontend && pnpm audit --prod
```

- [ ] `bandit -r backend/app/ -ll` — sin resultados de severidad HIGH ni CRITICAL
- [ ] `pnpm audit --prod` — sin vulnerabilidades, o con justificación documentada para cada excepción
- [ ] CI job `secret-scan` (Gitleaks) verde en el último commit
- [ ] CORS en backend: solo los dominios de producción están en la allowlist (no `*`)
- [x] `mangum` en `requirements.txt` auditado: eliminado — no se usa Lambda (resuelto 5 Mar)

---

## 6. Verificación Funcional — Orden de Prueba E2E

Realizar UNA orden completa en el entorno de **producción** antes de anunciar el lanzamiento.
Usar una cuenta real (no de prueba) y una tarjeta de prueba oficial de Mercado Pago.

- [ ] Abrir la app en device real (Android o iOS)
- [ ] Completar el onboarding de preferencias dietéticas (primera vez)
- [ ] Verificar que el onboarding NO vuelve a aparecer al reabrir la app
- [ ] Buscar un producto usando el filtro dietético
- [ ] Agregar el producto al carrito
- [ ] Navegar a checkout — confirmar que **no hay bucle infinito** en la pantalla de addresses
- [ ] Confirmar que usuario autenticado llega a checkout sin bloqueo de AuthGate
- [ ] Completar el pago con tarjeta de prueba de Mercado Pago
- [ ] Verificar que las pantallas de resultado de pago (pending/success/failure) muestran AuthGate si no hay sesión
- [ ] Verificar email de confirmación recibido en la bandeja real (no spam)
- [ ] Ver la orden con estado correcto en la pantalla de órdenes de la app
- [ ] Probar el flujo como usuario NO autenticado: verificar que cart/checkout/orders/payment-results muestran el gate de login

---

## 7. Smoke Tests Post-Deploy

```bash
python backend/scripts/smoke_tests.py https://api.healthbytes.cl
```
Esperado: `8/8 checks passed` (6 originales + 2 agregados en Task 3: `/addresses` y `/favorites`)

---

## 8. Rollback Plan

Si el deploy de producción falla después del approval:

1. Identificar el task definition de la versión anterior:
   ```bash
   aws ecs describe-task-definition \
     --task-definition healthbytes-backend \
     --region us-east-1
   ```
2. Actualizar el service para usar la revisión anterior:
   ```bash
   aws ecs update-service \
     --cluster healthbytes-prod \
     --service healthbytes-backend-prod \
     --task-definition healthbytes-backend:REVISION_ANTERIOR \
     --region us-east-1
   ```
3. Verificar con smoke tests que el rollback funcionó.

---

## 9. Firmado de Cierre

| Sección | Responsable | Fecha | Observaciones |
|---------|-------------|-------|---------------|
| Backend env vars | | | |
| Base de datos | | | |
| CI/CD | | | |
| Frontend build | | | |
| Seguridad | | | |
| Orden de prueba E2E | | | |
| Smoke tests | | | |

**MVP aprobado para lanzamiento:** _______________________ (firma) / _______ (fecha)
