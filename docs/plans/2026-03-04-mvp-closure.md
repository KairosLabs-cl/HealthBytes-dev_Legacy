# HealthBytes MVP Closure — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Desplegar HealthBytes en producción con AWS (ECS Fargate + RDS), build móvil distribuible via EAS (APK/TestFlight), flujo completo de compra verificado end-to-end, y AuthGate funcional en todos los screens protegidos.

**Architecture:** Backend FastAPI en ECS Fargate (us-east-1), RDS PostgreSQL, S3 + CloudFront. Frontend React Native/Expo con EAS Build. CI/CD via GitHub Actions con gate de aprobación manual para producción. Secrets en AWS SSM Parameter Store.

**Tech Stack:** FastAPI 0.128+, SQLAlchemy 2.x async, PostgreSQL 16 (RDS), Redis (cache), React Native 0.81.5, Expo 54, EAS CLI ≥5.2, Zustand 5, TanStack Query 5, Clerk, Mercado Pago, Resend, Sentry.

---

## Gaps críticos identificados (a corregir antes del deploy)

| Gap | Archivo | Bloqueante | Estado (5 Mar 2026) |
|-----|---------|-----------|---------------------|
| `"name": "shop"` en package.json | `frontend/package.json:3` | Sí — App Store/Play Store | ✅ Corregido |
| `slug: "shop"` y `scheme: "safe_ecommerce"` | `frontend/app.json` | Sí — deep links rotos | ✅ Corregido |
| `app.config.js` extra block comentado | `frontend/app.config.js` | Sí — env vars no inyectadas | ✅ Corregido |
| Sin perfil iOS en eas.json | `frontend/eas.json` | Sí — no hay path a TestFlight | ✅ Corregido |
| Typo `aws-access-access-key-id` | `.github/workflows/deploy.yml:94` | Sí — deploy prod falla | ✅ Corregido |
| pnpm v10 local vs v9 en CI | `ci.yml` + `package.json` | Medio — divergencia de builds | ✅ Corregido — `deploy.yml:209` usa v10 |
| Sin infraestructura IaC | — | Sí — deploy no reproducible | ✅ Scripts en `infra/` (ECR, SSM, task def) |
| E2E tests no escritos | — | Sí — fixes no verificados | ✅ 10 tests en `backend/tests/e2e/` |
| `OnboardingModal` no cableado | `frontend/components/OnboardingModal.tsx` | No — P1 | ✅ Cableado a store + `_layout.tsx` |
| Redis declarado pero no conectado | `docker-compose.yml` | No — P1 | ✅ `get_products_cached()` implementado |
| `PRODUCTION_CHECKLIST.md` ausente | — | No — riesgo operacional | ✅ Creado y actualizado en `docs/plans/` |

---

## Estado General al 5 Marzo 2026

> Sprint de urgencias completado. Todos los gaps de código están resueltos.
> Lo que queda es **infra + ops**, no desarrollo.

### Tests

| Suite | Resultado | Notas |
|-------|-----------|-------|
| Backend (pytest) | ✅ 439 passed, 1 skipped | Coverage 87% — 1 performance test flaky con 100 órdenes |
| Frontend (jest) | ✅ 126 passed, 13 suites | Verde con `--forceExit` |
| E2E backend | ✅ 10 passed | Auth gate, checkout flow, email flow |
| Smoke tests | ✅ 8 checks | Health, docs, products, cart, orders, profile, addresses, favorites |

### Pendientes para producción (solo infra + ops)

| Tarea | Tipo | Semana estimada |
|-------|------|-----------------|
| Ejecutar `alembic upgrade head` en RDS prod | Ops | Semana 1 deploy |
| Configurar secrets en AWS SSM con `infra/secrets-setup.sh` | Ops | Semana 1 deploy |
| EAS Build preview — Android APK en device real | Build | Semana 2 |
| Flujo E2E manual completo (sección 6 del checklist) | QA | Semana 2 |
| Deploy a staging + smoke tests | Deploy | Semana 2 |
| PRODUCTION_CHECKLIST firmado | Sign-off | Semana 3 |
| Deploy a producción | Deploy | Semana 3 |

### Semanas de trabajo estimadas restantes

```
Semana 10–14 Mar 2026  → Infra AWS: SSM secrets, ECS cluster staging, primer deploy staging
Semana 17–21 Mar 2026  → EAS Build preview + device testing + flujo E2E manual
Semana 24–28 Mar 2026  → PRODUCTION_CHECKLIST firmado + deploy a producción
```

---

## Task 1: Fixes Pre-Deploy (Bloqueadores de Build)

**Files:**
- Modify: `frontend/package.json:3`
- Modify: `frontend/app.json`
- Modify: `frontend/app.config.js`
- Modify: `frontend/eas.json`
- Modify: `.github/workflows/deploy.yml` (~línea 94)
- Modify: `.github/workflows/ci.yml` (pnpm version)

---

### Step 1: Corregir `package.json` — name del paquete

En `frontend/package.json`, cambiar:
```json
"name": "shop",
```
Por:
```json
"name": "healthbytes",
```

### Step 2: Corregir `app.json` — slug y scheme

En `frontend/app.json`, cambiar:
```json
"slug": "shop",
"scheme": "safe_ecommerce",
```
Por:
```json
"slug": "healthbytes",
"scheme": "healthbytes",
```

### Step 3: Descomentar inyección de env vars en `app.config.js`

Reemplazar el contenido de `frontend/app.config.js` con:
```js
module.exports = ({ config }) => {
  return {
    ...config,
    extra: {
      ...(config.extra || {}),
      EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL,
      EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY,
    },
  };
};
```

### Step 4: Agregar perfil iOS a `eas.json`

Reemplazar el contenido de `frontend/eas.json` con:
```json
{
  "cli": { "version": ">= 5.2.0" },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "android": { "buildType": "apk" },
      "ios": { "simulator": false }
    },
    "preview": {
      "distribution": "internal",
      "android": { "buildType": "apk" },
      "ios": {
        "distribution": "internal",
        "buildConfiguration": "Release"
      }
    },
    "production": {
      "android": { "buildType": "aab" },
      "ios": {
        "distribution": "store",
        "buildConfiguration": "Release"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

### Step 5: Corregir typo en `deploy.yml`

En `.github/workflows/deploy.yml`, en el job `deploy-production-backend`, cambiar:
```yaml
aws-access-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
```
Por:
```yaml
aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
```

### Step 6: Alinear versión de pnpm entre local y CI

Opción A (recomendada): Actualizar CI para usar pnpm v10.

En `.github/workflows/ci.yml`, en todos los jobs que tienen:
```yaml
- uses: pnpm/action-setup@v4
  with:
    version: 9
```
Cambiar a:
```yaml
- uses: pnpm/action-setup@v4
  with:
    version: 10
```

Opción B: Bajar `packageManager` en `package.json` a `pnpm@9.15.0`.

### Step 7: Verificar

```bash
cd frontend && pnpm type-check
```
Esperado: sin errores TypeScript.

```bash
cd frontend && pnpm lint
```
Esperado: sin errores ESLint.

### Step 8: Commit

```bash
git add frontend/package.json frontend/app.json frontend/app.config.js \
        frontend/eas.json .github/workflows/deploy.yml .github/workflows/ci.yml
git commit -m "fix: align app slug/scheme/name and fix CI/deploy config for production"
```

---

## Task 2: Infraestructura AWS (Scripts + SSM)

**Files:**
- Create: `infra/README.md`
- Create: `infra/ecr-setup.sh`
- Create: `infra/ecs-task-definition.json`
- Create: `infra/secrets-setup.sh`
- Create: `infra/smoke-check-infra.sh`

**Prerequisito:** AWS CLI instalado y configurado con credenciales de un IAM user con permisos en ECS, ECR, RDS, SSM, CloudWatch Logs.

---

### Step 1: Crear `infra/ecr-setup.sh`

```bash
#!/usr/bin/env bash
# Creates the ECR repository for the backend image.
# Usage: AWS_REGION=us-east-1 ./infra/ecr-setup.sh
set -euo pipefail
AWS_REGION="${AWS_REGION:-us-east-1}"
REPO_NAME="healthbytes-backend"

aws ecr create-repository \
  --repository-name "$REPO_NAME" \
  --region "$AWS_REGION" \
  --image-scanning-configuration scanOnPush=true \
  --encryption-configuration encryptionType=AES256

echo "ECR repository created: $REPO_NAME in $AWS_REGION"
echo "URI: $(aws ecr describe-repositories \
  --repository-names $REPO_NAME \
  --region $AWS_REGION \
  --query 'repositories[0].repositoryUri' \
  --output text)"
```

Ejecutar:
```bash
chmod +x infra/ecr-setup.sh && ./infra/ecr-setup.sh
```
Esperado: ECR repository creado, URI impresa.

---

### Step 2: Crear `infra/ecs-task-definition.json`

> Reemplazar `ACCOUNT_ID` con el ID real de la cuenta AWS antes de registrar.

```json
{
  "family": "healthbytes-backend",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::ACCOUNT_ID:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::ACCOUNT_ID:role/ecsTaskRole",
  "containerDefinitions": [
    {
      "name": "backend",
      "image": "ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/healthbytes-backend:latest",
      "portMappings": [
        { "containerPort": 3001, "protocol": "tcp" }
      ],
      "essential": true,
      "environment": [
        { "name": "PORT", "value": "3001" },
        { "name": "HOST", "value": "0.0.0.0" }
      ],
      "secrets": [
        { "name": "***REDACTED_DATABASE_URL***
        { "name": "JWT_SECRET",                    "valueFrom": "/healthbytes/prod/JWT_SECRET" },
        { "name": "CLERK_PUBLISHABLE_KEY",         "valueFrom": "/healthbytes/prod/CLERK_PUBLISHABLE_KEY" },
        { "name": "***REDACTED_CLERK_SECRET_KEY***
        { "name": "***REDACTED_MERCADOPAGO_TOKEN***
        { "name": "MERCADO_PAGO_WEBHOOK_SECRET",   "valueFrom": "/healthbytes/prod/MERCADO_PAGO_WEBHOOK_SECRET" },
        { "name": "***REDACTED_RESEND_KEY***
        { "name": "EMAIL_FROM_ADDRESS",            "valueFrom": "/healthbytes/prod/EMAIL_FROM_ADDRESS" },
        { "name": "BACKEND_URL",                   "valueFrom": "/healthbytes/prod/BACKEND_URL" },
        { "name": "FRONTEND_URL",                  "valueFrom": "/healthbytes/prod/FRONTEND_URL" },
        { "name": "ENVIRONMENT",                   "valueFrom": "/healthbytes/prod/ENVIRONMENT" },
        { "name": "SENTRY_DSN",                    "valueFrom": "/healthbytes/prod/SENTRY_DSN" }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/healthbytes-backend",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "healthCheck": {
        "command": ["CMD-SHELL", "curl -f http://localhost:3001/health || exit 1"],
        "interval": 30,
        "timeout": 10,
        "retries": 3,
        "startPeriod": 60
      }
    }
  ]
}
```

Registrar la task definition:
```bash
aws ecs register-task-definition \
  --cli-input-json file://infra/ecs-task-definition.json \
  --region us-east-1
```
Esperado: JSON con `taskDefinitionArn` impreso.

---

### Step 3: Crear `infra/secrets-setup.sh`

```bash
#!/usr/bin/env bash
# Populates AWS SSM Parameter Store with all production secrets.
# Usage: AWS_PROFILE=healthbytes ./infra/secrets-setup.sh
# Prompts for each secret interactively — never hardcodes values.
set -euo pipefail
REGION="${AWS_REGION:-us-east-1}"
PREFIX="/healthbytes/prod"

put_secret() {
  local name="$1"
  local description="$2"
  read -r -s -p "Enter value for $name ($description): " value
  echo ""
  VERSION=$(aws ssm put-parameter \
    --name "$PREFIX/$name" \
    --value "$value" \
    --type "SecureString" \
    --overwrite \
    --region "$REGION" \
    --description "$description" \
    --output text --query "Version")
  echo "  OK  $PREFIX/$name (version $VERSION)"
}

echo "=== HealthBytes Production Secrets Setup ==="
echo "Region: $REGION | Prefix: $PREFIX"
echo ""

put_secret "***REDACTED_DATABASE_URL***
put_secret "JWT_SECRET"                  "JWT signing secret — min 32 chars"
put_secret "CLERK_PUBLISHABLE_KEY"       "Clerk prod publishable key (pk_live_...)"
put_secret "***REDACTED_CLERK_SECRET_KEY***
put_secret "***REDACTED_MERCADOPAGO_TOKEN***
put_secret "MERCADO_PAGO_WEBHOOK_SECRET" "Mercado Pago webhook HMAC secret"
put_secret "***REDACTED_RESEND_KEY***
put_secret "EMAIL_FROM_ADDRESS"          "From address e.g. HealthBytes <no-reply@healthbytes.cl>"
put_secret "BACKEND_URL"                 "e.g. https://api.healthbytes.cl (no trailing slash)"
put_secret "FRONTEND_URL"               "e.g. https://healthbytes.cl (no trailing slash)"
put_secret "ENVIRONMENT"                 "Must be exactly: production"
put_secret "SENTRY_DSN"                  "Sentry DSN for error tracking"

echo ""
echo "=== All secrets stored. Verify with: ==="
echo "aws ssm get-parameters-by-path --path $PREFIX --with-decryption --region $REGION --query 'Parameters[*].Name'"
```

Ejecutar:
```bash
chmod +x infra/secrets-setup.sh && ./infra/secrets-setup.sh
```
Verificar:
```bash
aws ssm get-parameters-by-path \
  --path /healthbytes/prod \
  --region us-east-1 \
  --query 'Parameters[*].Name'
```
Esperado: lista de 12 nombres de parámetros.

---

### Step 4: Configurar GitHub Secrets

En GitHub → Settings → Secrets and variables → Actions → New repository secret, agregar:

```
AWS_ACCESS_KEY_ID           IAM access key con permisos ECS/ECR/SSM
AWS_SECRET_ACCESS_KEY       IAM secret key
STAGING_***REDACTED_DATABASE_URL***
STAGING_URL                 https://staging.healthbytes.cl
STAGING_BACKEND_TASK_DEFINITION  healthbytes-backend
STAGING_ECS_SERVICE         healthbytes-backend-staging
STAGING_ECS_CLUSTER         healthbytes-staging
PROD_***REDACTED_DATABASE_URL***
PROD_URL                    https://api.healthbytes.cl
PROD_BACKEND_TASK_DEFINITION     healthbytes-backend
PROD_ECS_SERVICE            healthbytes-backend-prod
PROD_ECS_CLUSTER            healthbytes-prod
EXPO_TOKEN                  Token de cuenta Expo (eas.expo.dev → Access Tokens)
```

---

### Step 5: Crear ECS Cluster y CloudWatch log group (staging)

```bash
# Cluster de staging
aws ecs create-cluster \
  --cluster-name healthbytes-staging \
  --region us-east-1

# Log group
aws logs create-log-group \
  --log-group-name /ecs/healthbytes-backend \
  --region us-east-1

# Configurar retención de logs a 30 días
aws logs put-retention-policy \
  --log-group-name /ecs/healthbytes-backend \
  --retention-in-days 30 \
  --region us-east-1
```

Para crear el ECS Service se necesitan `SUBNET_ID` y `SG_ID` de la VPC.
Obtenerlos:
```bash
# Listar subnets de la VPC por defecto
aws ec2 describe-subnets \
  --filters "Name=default-for-az,Values=true" \
  --query 'Subnets[0].SubnetId' \
  --output text \
  --region us-east-1

# Obtener default security group
aws ec2 describe-security-groups \
  --filters "Name=group-name,Values=default" \
  --query 'SecurityGroups[0].GroupId' \
  --output text \
  --region us-east-1
```

Crear service con los IDs obtenidos:
```bash
aws ecs create-service \
  --cluster healthbytes-staging \
  --service-name healthbytes-backend-staging \
  --task-definition healthbytes-backend \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[SUBNET_ID],securityGroups=[SG_ID],assignPublicIp=ENABLED}" \
  --region us-east-1
```

---

### Step 6: Aplicar migraciones en staging

```bash
***REDACTED_DATABASE_URL***
JWT_SECRET="placeholder-min-32-chars-for-migration" \
  python -m alembic upgrade head
```
Esperado: `Running upgrade -> 0001, ... -> 20260302_35d20be20a0a OK`

---

### Step 7: Trigger deploy a staging y verificar smoke tests

```bash
gh workflow run deploy.yml \
  -f environment=staging \
  --ref main
```

Esperar a que el workflow termine (~5-10 min), luego:
```bash
python backend/scripts/smoke_tests.py https://staging.healthbytes.cl
```
Esperado: `6/6 checks passed`

### Step 8: Commit

```bash
git add infra/
git commit -m "infra: add ECS task definition, ECR/SSM setup scripts for production"
```

---

## Task 3: E2E Tests del Flujo Crítico

**Files:**
- Create: `backend/tests/e2e/__init__.py`
- Create: `backend/tests/e2e/test_auth_gate.py`
- Create: `backend/tests/e2e/test_checkout_flow.py`
- Create: `backend/tests/e2e/test_email_flow.py`
- Modify: `backend/scripts/smoke_tests.py`

**Prerequisito:** Leer `backend/app/api/v1/addresses.py`, `backend/app/api/v1/cart.py`, `backend/app/api/v1/orders.py` y `backend/app/services/order_service.py` antes de escribir los mocks para verificar firmas reales.

---

### Step 1: Escribir tests de AuthGate (escribir ANTES de verificar que pasan)

Crear `backend/tests/e2e/__init__.py` (vacío).

Crear `backend/tests/e2e/test_auth_gate.py`:

```python
"""
E2E tests — AuthGate regression suite.
All protected endpoints must return 401 without a valid token.
This suite is the canonical verification that the infinite-loop fix
in checkout-v2.tsx did not break backend auth, and that the AuthGate
middleware is applied consistently.
"""
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.fixture
async def client():
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as ac:
        yield ac


@pytest.mark.asyncio
async def test_cart_requires_auth(client):
    response = await client.get("/api/v1/cart")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_addresses_requires_auth(client):
    """
    Regression: the infinite /addresses loop fix — endpoint must
    return 401 before executing any DB logic.
    """
    response = await client.get("/api/v1/addresses")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_orders_requires_auth(client):
    response = await client.get("/api/v1/orders")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_profile_requires_auth(client):
    response = await client.get("/api/v1/auth/profile")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_favorites_requires_auth(client):
    response = await client.get("/api/v1/favorites")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_products_is_public(client):
    """Catalog must be accessible without auth — this must never regress."""
    response = await client.get("/api/v1/products")
    assert response.status_code == 200


@pytest.mark.asyncio
async def test_health_is_public(client):
    response = await client.get("/health")
    assert response.status_code == 200
```

**Step 2: Ejecutar para verificar que pasan**

```bash
cd backend && pytest tests/e2e/test_auth_gate.py -v --tb=short
```
Esperado: `7 passed`. Si alguno falla, el bug original sigue presente — usar `systematic-debugging` antes de continuar.

---

### Step 3: Escribir test del flujo de checkout

Crear `backend/tests/e2e/test_checkout_flow.py`:

```python
"""
E2E test — Checkout flow: cart → order → MP webhook → order status updated.
Mocks external dependencies (Mercado Pago) but uses real service layer.
"""
import pytest
import json
import hmac
import hashlib
from unittest.mock import patch, AsyncMock
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.fixture
async def client():
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as ac:
        yield ac


@pytest.mark.asyncio
async def test_unauthenticated_checkout_is_blocked(client):
    """Checkout must be blocked — no order should be creatable without auth."""
    response = await client.post(
        "/api/v1/orders",
        json={"payment_method": "mercadopago"},
    )
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_mercadopago_webhook_accepts_valid_signature(client, monkeypatch):
    """
    Webhook endpoint must accept requests with valid HMAC signature
    and reject invalid ones. This is a regression test for the
    webhook atomicity fix.
    """
    monkeypatch.setattr("app.config.settings.MERCADO_PAGO_WEBHOOK_SECRET", "test-secret-key")

    payload = json.dumps({"type": "payment", "data": {"id": "123"}}, separators=(",", ":"))
    body = payload.encode()
    sig = hmac.new(b"test-secret-key", body, hashlib.sha256).hexdigest()

    with patch("app.services.mercadopago_service.get_payment_info", new_callable=AsyncMock) as mock_info:
        mock_info.return_value = {
            "id": "123",
            "status": "approved",
            "external_reference": "999",
        }
        with patch("app.services.order_service.mark_order_paid", new_callable=AsyncMock):
            response = await client.post(
                "/api/v1/mercadopago/webhook",
                content=body,
                headers={
                    "content-type": "application/json",
                    "x-signature": f"ts=1234,v1={sig}",
                },
            )
    # 200 or 404 (order not found) are both acceptable — what matters is NOT 400/401/500
    assert response.status_code in (200, 404)


@pytest.mark.asyncio
async def test_mercadopago_webhook_rejects_invalid_signature(client, monkeypatch):
    """Webhook with invalid HMAC must be rejected with 400."""
    monkeypatch.setattr("app.config.settings.MERCADO_PAGO_WEBHOOK_SECRET", "test-secret-key")

    body = b'{"type":"payment","data":{"id":"123"}}'
    response = await client.post(
        "/api/v1/mercadopago/webhook",
        content=body,
        headers={
            "content-type": "application/json",
            "x-signature": "ts=1234,v1=invalidsignature",
        },
    )
    assert response.status_code in (400, 401, 403)
```

**Step 4: Ejecutar**

```bash
cd backend && pytest tests/e2e/test_checkout_flow.py -v --tb=short
```
Esperado: `3 passed`. Si el webhook test falla por la firma, leer `backend/app/api/v1/mercadopago.py` para verificar el formato exacto del header `x-signature` que espera el endpoint y ajustar el test.

---

### Step 5: Escribir test del flujo de email

Crear `backend/tests/e2e/test_email_flow.py`:

```python
"""
E2E test — Email service: graceful degradation when ***REDACTED_RESEND_KEY***
"""
import pytest


@pytest.mark.asyncio
async def test_send_email_does_not_raise_when_api_key_missing(monkeypatch):
    """
    When ***REDACTED_RESEND_KEY***
    email_service.send_email must log a warning instead of raising.
    This prevents a missing env var from crashing the order flow.
    """
    monkeypatch.setattr("app.config.settings.***REDACTED_RESEND_KEY***
    from app.services.email_service import send_email
    # Must complete without raising any exception
    await send_email(
        to="test@example.com",
        subject="Test order confirmation",
        html="<p>Your order has been confirmed.</p>",
    )


@pytest.mark.asyncio
async def test_send_email_calls_resend_when_key_present(monkeypatch):
    """When ***REDACTED_RESEND_KEY***
    monkeypatch.setattr("app.config.settings.***REDACTED_RESEND_KEY***
    from unittest.mock import patch, MagicMock
    with patch("resend.Emails.send") as mock_send:
        mock_send.return_value = {"id": "email_123"}
        from app.services.email_service import send_email
        await send_email(
            to="customer@example.com",
            subject="Order confirmed",
            html="<p>Thanks for your order!</p>",
        )
        mock_send.assert_called_once()
        call_kwargs = mock_send.call_args[0][0]
        assert call_kwargs["to"] == ["customer@example.com"]
        assert call_kwargs["subject"] == "Order confirmed"
```

**Step 6: Ejecutar**

```bash
cd backend && pytest tests/e2e/test_email_flow.py -v --tb=short
```
Esperado: `2 passed`. Si falla el segundo test, leer `backend/app/services/email_service.py` para verificar la firma exacta de la llamada a `resend` y ajustar el assert.

---

### Step 7: Extender smoke tests

En `backend/scripts/smoke_tests.py`, agregar a la lista `tests` (dentro de `main()`):

```python
(f"{base}/api/v1/addresses",    401, "Addresses (requires auth → 401)"),
(f"{base}/api/v1/favorites",    401, "Favorites (requires auth → 401)"),
```
Y actualizar el mensaje final para reflejar el nuevo total:
```python
print(f"\n{passed}/{total} checks passed")
```
(El total se calcula automáticamente desde `len(results)` — no hardcodear.)

**Step 8: Ejecutar suite completa y verificar cobertura**

```bash
cd backend && pytest tests/e2e/ -v --tb=short
cd backend && pytest --tb=short --cov=app --cov-fail-under=80 -q
```
Ambos deben pasar. Si la cobertura cae del 80%, agregar tests unitarios a los módulos con menor cobertura.

**Step 9: Commit**

```bash
git add backend/tests/e2e/ backend/scripts/smoke_tests.py
git commit -m "test: add E2E tests for auth gate, checkout flow, and email delivery"
```

---

## Task 4: Redis — Conectar + Cachear Products

**Files:**
- Modify: `docker-compose.yml`
- Modify: `backend/app/config.py`
- Modify: `backend/app/db/database.py`
- Modify: `backend/app/services/product_service.py`
- Modify: `backend/requirements.txt`
- Modify: `frontend/api/products.ts`

**Prerequisito:** Leer `backend/app/services/product_service.py` y `backend/app/db/database.py` completos antes de editar para no romper la firma existente.

---

### Step 1: Escribir tests de cache (TDD — fallarán antes de la implementación)

Crear `backend/tests/unit/test_product_cache.py`:

```python
"""
Unit tests — Redis cache layer for products.
"""
import pytest
import json
from unittest.mock import AsyncMock, patch, MagicMock


@pytest.mark.asyncio
async def test_products_served_from_cache_on_second_call():
    """Second call must read from Redis, not DB."""
    fake_products = [{"id": 1, "name": "Pan sin gluten", "price": 1500}]

    with patch("app.db.database.get_redis") as mock_get_redis:
        mock_redis = AsyncMock()
        mock_redis.get = AsyncMock(return_value=None)          # cache miss
        mock_redis.setex = AsyncMock()
        mock_get_redis.return_value = mock_redis

        with patch("app.services.product_service._fetch_products_from_db",
                   new_callable=AsyncMock) as mock_db:
            mock_db.return_value = fake_products
            from app.services.product_service import get_products_cached
            await get_products_cached(db=MagicMock(), skip=0, limit=20)
            assert mock_db.call_count == 1
            mock_redis.setex.assert_called_once()

        # Second call: cache hit
        mock_redis.get = AsyncMock(return_value=json.dumps(fake_products))
        with patch("app.services.product_service._fetch_products_from_db",
                   new_callable=AsyncMock) as mock_db2:
            mock_db2.return_value = []
            from app.services.product_service import get_products_cached
            result = await get_products_cached(db=MagicMock(), skip=0, limit=20)
            assert mock_db2.call_count == 0   # DB NOT called
            assert result == fake_products


@pytest.mark.asyncio
async def test_cache_disabled_when_redis_unavailable():
    """If Redis is down, products must still be served from DB."""
    with patch("app.db.database.get_redis", side_effect=Exception("Redis down")):
        with patch("app.services.product_service._fetch_products_from_db",
                   new_callable=AsyncMock) as mock_db:
            mock_db.return_value = [{"id": 1}]
            from app.services.product_service import get_products_cached
            result = await get_products_cached(db=MagicMock(), skip=0, limit=20)
            assert result == [{"id": 1}]
            assert mock_db.call_count == 1
```

**Step 2: Ejecutar — verificar que falla**

```bash
cd backend && pytest tests/unit/test_product_cache.py -v --tb=short
```
Esperado: `FAIL — ImportError: cannot import name 'get_products_cached'`

---

### Step 3: Agregar `redis[asyncio]` a `requirements.txt`

```
redis[asyncio]>=5.0.0
```

### Step 4: Agregar `REDIS_URL` y `REDIS_CACHE_TTL_SECONDS` a `config.py`

En `backend/app/config.py`, dentro de la clase `Settings`, agregar:
```python
# Redis (optional — product cache)
REDIS_URL: Optional[str] = None
REDIS_CACHE_TTL_SECONDS: int = 300  # 5 minutes
```

### Step 5: Agregar `get_redis()` a `database.py`

Al final de `backend/app/db/database.py`, agregar:

```python
import redis.asyncio as aioredis
import logging as _logging

_redis_logger = _logging.getLogger(__name__)
_redis_client: "aioredis.Redis | None" = None


async def get_redis() -> "aioredis.Redis | None":
    """
    Returns a connected Redis client if REDIS_URL is configured.
    Returns None if Redis is unavailable — callers must handle this gracefully.
    """
    from app.config import settings
    global _redis_client
    if not settings.REDIS_URL:
        return None
    if _redis_client is None:
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
            _redis_logger.warning("Redis unavailable — cache disabled: %s", exc)
            _redis_client = None
    return _redis_client
```

### Step 6: Agregar `get_products_cached()` a `product_service.py`

Leer el archivo antes de editar. Luego agregar la función wrapper (no reemplazar la función existente — wrappearla):

```python
import json
from app.db.database import get_redis
from app.config import settings

_PRODUCTS_CACHE_KEY = "products:skip={skip}:limit={limit}"


async def _fetch_products_from_db(db, skip: int, limit: int, **kwargs):
    """Internal — calls the existing get_products logic. Rename existing function to this."""
    # Este cuerpo debe ser el contenido actual de la función get_products.
    # Ver el archivo para copiar el cuerpo exacto.
    pass


async def get_products_cached(db, skip: int = 0, limit: int = 20, **kwargs):
    """
    Public entry point for listing products.
    Wraps _fetch_products_from_db with Redis cache (TTL from settings).
    Gracefully degrades to DB-only if Redis is unavailable.
    """
    cache_key = _PRODUCTS_CACHE_KEY.format(skip=skip, limit=limit)
    try:
        redis = await get_redis()
        if redis:
            cached = await redis.get(cache_key)
            if cached:
                return json.loads(cached)
    except Exception:
        pass  # Graceful degradation

    results = await _fetch_products_from_db(db=db, skip=skip, limit=limit, **kwargs)

    try:
        redis = await get_redis()
        if redis:
            await redis.setex(
                cache_key,
                settings.REDIS_CACHE_TTL_SECONDS,
                json.dumps(results, default=str),
            )
    except Exception:
        pass  # Graceful degradation

    return results
```

> IMPORTANTE: En el router `backend/app/api/v1/products.py`, actualizar la llamada para usar `get_products_cached` en lugar de la función anterior. Leer el router antes de editar.

### Step 7: Habilitar Redis en `docker-compose.yml`

En `docker-compose.yml`:

1. Descomentar o agregar el servicio Redis:
```yaml
redis:
  image: redis:7-alpine
  container_name: healthbytes-redis
  restart: unless-stopped
  ports:
    - "6379:6379"
  networks:
    - healthbytes_network
  healthcheck:
    test: ["CMD", "redis-cli", "ping"]
    interval: 10s
    timeout: 5s
    retries: 3
  logging:
    driver: "json-file"
    options:
      max-size: "5m"
      max-file: "2"
```

2. En el servicio `backend`, bajo `environment`, agregar:
```yaml
REDIS_URL: redis://redis:6379/0
```

3. En el servicio `backend`, bajo `depends_on`, agregar:
```yaml
redis:
  condition: service_healthy
```

### Step 8: Configurar React Query en el frontend

En `frontend/api/products.ts`, verificar que los hooks de productos usan:

```typescript
const PRODUCTS_STALE_TIME = 5 * 60 * 1000 // 5 min — aligned with backend Redis TTL

// En el useQuery o useSuspenseQuery:
{
  queryKey: ['products', filters],
  queryFn: () => fetchProducts(filters),
  staleTime: PRODUCTS_STALE_TIME,
  retry: 2,
  retryDelay: (attempt: number) => Math.min(1000 * 2 ** attempt, 10_000),
}
```

### Step 9: Ejecutar tests

```bash
cd backend && pytest tests/unit/test_product_cache.py -v --tb=short
```
Esperado: `2 passed`

```bash
cd backend && pytest --tb=short --cov=app --cov-fail-under=80 -q
```
Esperado: CI verde.

### Step 10: Commit

```bash
git add backend/app/db/database.py backend/app/services/product_service.py \
        backend/app/config.py backend/requirements.txt \
        docker-compose.yml frontend/api/products.ts \
        backend/tests/unit/test_product_cache.py
git commit -m "feat: connect Redis cache for products with graceful degradation"
```

---

## Task 5: OnboardingModal — Cableado a Store y API

**Files:**
- Modify: `frontend/store/preferencesStore.ts`
- Modify: `frontend/components/OnboardingModal.tsx`
- Modify: `frontend/app/_layout.tsx`
- Read first: `frontend/api/preferences.ts`
- Create: `frontend/components/__tests__/OnboardingModal.test.tsx`

**Prerequisito:** Leer `frontend/api/preferences.ts`, `frontend/store/preferencesStore.ts`, y `frontend/components/OnboardingModal.tsx` completos antes de editar.

---

### Step 1: Escribir test del OnboardingModal (TDD)

Crear `frontend/components/__tests__/OnboardingModal.test.tsx`:

```typescript
import React from 'react'
import { render, fireEvent, waitFor } from '@testing-library/react-native'
import { OnboardingModal } from '../OnboardingModal'
import * as preferencesApi from '../../api/preferences'

jest.mock('../../api/preferences')
const mockUpdatePreferences = preferencesApi.updatePreferences as jest.MockedFunction<
  typeof preferencesApi.updatePreferences
>

describe('OnboardingModal', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUpdatePreferences.mockResolvedValue({ success: true })
  })

  it('calls updatePreferences with selected dietary tags on submit', async () => {
    const { getByTestId } = render(
      <OnboardingModal visible={true} onComplete={jest.fn()} />
    )
    fireEvent.press(getByTestId('tag-celiac'))
    fireEvent.press(getByTestId('submit-btn'))
    await waitFor(() => {
      expect(mockUpdatePreferences).toHaveBeenCalledWith(
        expect.arrayContaining(['celiac'])
      )
    })
  })

  it('calls onComplete after successful submission', async () => {
    const onComplete = jest.fn()
    const { getByTestId } = render(
      <OnboardingModal visible={true} onComplete={onComplete} />
    )
    fireEvent.press(getByTestId('submit-btn'))
    await waitFor(() => {
      expect(onComplete).toHaveBeenCalledTimes(1)
    })
  })

  it('allows skipping onboarding without calling the API', () => {
    const onComplete = jest.fn()
    const { getByTestId } = render(
      <OnboardingModal visible={true} onComplete={onComplete} />
    )
    fireEvent.press(getByTestId('skip-btn'))
    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(mockUpdatePreferences).not.toHaveBeenCalled()
  })

  it('does not render when visible=false', () => {
    const { queryByTestId } = render(
      <OnboardingModal visible={false} onComplete={jest.fn()} />
    )
    expect(queryByTestId('submit-btn')).toBeNull()
  })
})
```

**Step 2: Ejecutar — verificar que falla**

```bash
cd frontend && pnpm exec jest components/__tests__/OnboardingModal.test.tsx --no-coverage
```
Esperado: `FAIL — testID 'tag-celiac' not found` (el modal existe pero no está cableado)

---

### Step 3: Agregar `hasCompletedOnboarding` a `preferencesStore.ts`

Leer el archivo actual. Agregar al estado del store:
- Campo: `hasCompletedOnboarding: boolean` con valor inicial `false`
- Acción: `setOnboardingComplete: () => void` que hace `set({ hasCompletedOnboarding: true })`

Si el store usa `persist` de Zustand, asegurarse de que `hasCompletedOnboarding` esté incluido en la clave de persistencia para que sobreviva cierres de app.

---

### Step 4: Cablear `OnboardingModal.tsx`

Leer el archivo actual. Asegurarse de que el componente:

1. Acepta props: `visible: boolean` y `onComplete: () => void`
2. Tiene estado local `selectedTags: string[]`
3. Los botones de tags tienen `testID={\`tag-${tagName}\`}` (e.g. `testID="tag-celiac"`, `testID="tag-diabetic"`, `testID="tag-vegan"`)
4. El botón principal tiene `testID="submit-btn"`
5. El botón de skip tiene `testID="skip-btn"`
6. Al presionar submit:
   ```typescript
   await updatePreferences(selectedTags)
   onComplete()
   ```
7. Al presionar skip:
   ```typescript
   onComplete()
   ```
8. El componente no renderiza nada cuando `visible=false`

---

### Step 5: Mostrar OnboardingModal en `_layout.tsx`

En `frontend/app/_layout.tsx`, agregar:

```typescript
import { usePreferencesStore } from '../store/preferencesStore'
import { OnboardingModal } from '../components/OnboardingModal'
import { useAuth } from '@clerk/clerk-expo'

// Dentro del componente root layout:
const { hasCompletedOnboarding, setOnboardingComplete } = usePreferencesStore()
const { isSignedIn } = useAuth()

const showOnboarding = Boolean(isSignedIn && !hasCompletedOnboarding)

// En el JSX, fuera de cualquier Navigator pero dentro del provider de Clerk:
<OnboardingModal
  visible={showOnboarding}
  onComplete={setOnboardingComplete}
/>
```

---

### Step 6: Ejecutar tests

```bash
cd frontend && pnpm exec jest components/__tests__/OnboardingModal.test.tsx --no-coverage
```
Esperado: `4 passed`

```bash
cd frontend && pnpm exec jest --ci --forceExit
```
Esperado: suite completa verde.

### Step 7: Commit

```bash
git add frontend/store/preferencesStore.ts frontend/components/OnboardingModal.tsx \
        frontend/app/_layout.tsx \
        frontend/components/__tests__/OnboardingModal.test.tsx
git commit -m "feat: wire OnboardingModal to preferences store and API"
```

---

## Task 6: PRODUCTION_CHECKLIST + Verificación Final

**Files:**
- Create: `docs/plans/PRODUCTION_CHECKLIST.md`

### Step 1: Crear el checklist

Ver contenido en la sección de abajo.

### Step 2: Ejecutar verificación completa antes de deploy a producción

```bash
# Backend
cd backend && bandit -r app/ -ll
cd backend && safety check -r requirements.txt
cd backend && pytest --tb=short --cov=app --cov-fail-under=80 -q

# Frontend
cd frontend && pnpm audit --prod
cd frontend && pnpm type-check
cd frontend && pnpm exec jest --ci --forceExit

# Smoke tests contra staging
python backend/scripts/smoke_tests.py https://staging.healthbytes.cl
```
Todo debe pasar antes de disparar el deploy a producción.

### Step 3: Deploy a producción

```bash
gh workflow run deploy.yml \
  -f environment=production \
  --ref main
```
El workflow requiere aprobación manual — aprobar en GitHub Actions UI.

### Step 4: Orden de prueba real E2E

1. Instalar APK de preview en device Android real
2. Completar onboarding
3. Buscar producto con filtro "celíaco"
4. Agregar al carrito
5. Ir a checkout (confirmar que AuthGate no bloquea)
6. Completar con tarjeta de prueba de Mercado Pago
7. Verificar email de confirmación en bandeja real
8. Ver orden en pantalla de órdenes de la app

### Step 5: Commit checklist firmado

```bash
git add docs/plans/PRODUCTION_CHECKLIST.md
git commit -m "docs: add PRODUCTION_CHECKLIST — MVP launch verified"
```

---

## Distribución por Semanas

```
Semana 1 (3–7 mar 2026)
  Task 1 — Fixes pre-deploy                       1 día
  Task 2 — Scripts AWS: ECR, SSM, task definition 4 días

Semana 2 (10–14 mar 2026)
  Task 2 — ECS staging deploy + smoke tests       2 días
  Task 3 — E2E tests (auth gate + checkout)       3 días   ← paralelo con Redis
  Task 4 — Redis conectado + cache products       3 días   ← paralelo con E2E

Semana 3 (17–21 mar 2026)
  Task 5 — OnboardingModal cableado               2 días
  EAS Build preview: APK Android                  1 día
  EAS Build preview: iOS (TestFlight)             1 día
  Instalación en device real + flujo manual       1 día

Semana 4 (24–28 mar 2026)
  Task 6 — PRODUCTION_CHECKLIST firmado           1 día
  Orden de prueba real E2E                        1 día
  Deploy a producción (workflow_dispatch)         1 día
  Buffer para bugs encontrados en beta            2 días

Semana 5 (buffer — 3–7 abr 2026)
  Bugs de beta → systematic-debugging skill
  CHANGELOG.md v1.0.0 → changelog-generator skill
```

---

## Skills a invocar por semana

| Semana | Skill | Para qué |
|--------|-------|----------|
| 1 | `using-git-worktrees` | Crear worktrees antes de empezar trabajo paralelo |
| 1–2 | `executing-plans` | Ejecutar Tasks 1 y 2 |
| 2 | `dispatching-parallel-agents` | Tasks 3 y 4 en paralelo |
| 2 | `test-driven-development` | Tasks 3 y 4 usan TDD estricto |
| 2 | `error-handling-patterns` | Redis graceful degradation (Task 4) |
| 2 | `postgresql-skill` | Revisar RDS config en staging |
| 2–3 | `requesting-code-review` | PR de infra y E2E tests |
| 2–3 | `receiving-code-review` | Evaluar feedback — respetar stack frozen |
| 3 | `react-native-best-practices` | Revisar Hermes y bundle antes del EAS Build |
| 3 | `subagent-driven-development` | EAS Build execution |
| 4 | `verification-before-completion` | Firmar PRODUCTION_CHECKLIST |
| 4 | `finishing-a-development-branch` | Merge final a main |
| 5 | `systematic-debugging` | Bugs encontrados en beta |
| 5 | `changelog-generator` | CHANGELOG.md v1.0.0 |

---

## Riesgos activos

| Riesgo | Impacto | Mitigación |
|--------|---------|-----------|
| ECS execution role sin permiso `ssm:GetParameter` | Task definition falla al arrancar | Agregar policy `ssm:GetParameter` para `/healthbytes/prod/*` al rol `ecsTaskExecutionRole` antes del primer deploy |
| RDS security group no permite tráfico desde ECS | Backend no puede conectar a DB | SG de RDS debe incluir el SG del ECS task en ingress en puerto 5432 |
| `mangum` en requirements.txt sugiere Lambda pero no hay Lambda infra | Dependencia muerta, aumenta attack surface | Eliminar `mangum` si no se usa — verificar primero que `main.py` no lo importe |
| React 19.1 + RN 0.81.5 con New Architecture habilitada → bugs en device real | App crashea en producción | Testear en device real en Semana 3 con build de preview ANTES del build de producción |
| Clerk prod keys distintas a dev → tokens inválidos en primer deploy | Login falla en producción | Testear un login completo en staging con las prod keys de Clerk antes del deploy final |
| `pnpm audit` en CI usa `--audit-level=moderate` con `continue-on-error: true` → vulnerabilidades ignoradas | Riesgo de seguridad silencioso | Revisar el output del job `frontend-audit` manualmente antes del deploy de producción |
| `deploy.yml` job `deploy-production-backend` tenía typo en `aws-access-access-key-id` | Deploy a producción falla | Corregido en Task 1 — verificar que el fix está en el branch antes del deploy |
