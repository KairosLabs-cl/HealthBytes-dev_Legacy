# 🛠️ Task — chachoCL (Backend Mid) — Parte ECS Deploy

**Tarea colaborativa:** Staging Deploy AWS ECS  
**Tu parte:** Dockerfiles + CI/CD + Task Definitions + Smoke Tests  
**Branch:** `ops/staging-ecs-deploy`  
**ID:** `task-20260608-staging-ecs-deploy`  
**Colaborador:** nojustbenja (infraestructura AWS)

---

## Tu responsabilidad en esta tarea

Mientras nojustbenja configura la infraestructura AWS (VPC, ECS, RDS, Redis, ALB), vos te encargás de:

1. **Dockerfiles optimizados** para backend y frontend
2. **ECS Task Definitions** (JSON configs)
3. **CI/CD pipeline** con GitHub Actions
4. **Smoke tests** post-deploy
5. **Documentación** del proceso de deploy

---

## 1. Backend Dockerfile

**Archivo:** `backend/Dockerfile`

```dockerfile
FROM python:3.13.1-slim

WORKDIR /app

# Instalar dependencias del sistema (solo lo necesario)
RUN apt-get update && apt-get install -y \
    postgresql-client \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copiar y instalar requirements primero (cache layer)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar código de la aplicación
COPY . .

# Usuario no-root para seguridad
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

# Exponer puerto
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

# Comando de inicio
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "3001", "--workers", "2"]
```

**Criterios:**
- ✅ Multi-stage build NO necesario (Python slim es suficiente)
- ✅ Usuario no-root (`appuser`)
- ✅ Health check cada 30s
- ✅ Cache layers optimizados (requirements antes que código)
- ✅ Workers: 2 (suficiente para staging)

---

## 2. Frontend Dockerfile (Opción ECS)

**Si se decide deployar frontend en ECS también:**

**Archivo:** `frontend/Dockerfile`

```dockerfile
# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Instalar pnpm
RUN npm install -g pnpm

# Copiar package files (cache layer)
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Copiar código y buildear
COPY . .
RUN pnpm run build:web

# Stage 2: Production
FROM nginx:alpine

# Copiar build
COPY --from=builder /app/dist /usr/share/nginx/html

# Nginx config custom
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --quiet --tries=1 --spider http://localhost/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
```

**Archivo:** `frontend/nginx.conf`

```nginx
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    server {
        listen 80;
        server_name _;
        
        root /usr/share/nginx/html;
        index index.html;

        # SPA routing
        location / {
            try_files $uri $uri/ /index.html;
        }

        # Health check endpoint
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }

        # Compresión
        gzip on;
        gzip_types text/css application/javascript application/json image/svg+xml;
        gzip_comp_level 6;
    }
}
```

---

## 3. ECS Task Definition (Backend)

**Archivo:** `infra/aws/task-definition-backend.json`

```json
{
  "family": "healthbytes-backend-staging",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::ACCOUNT_ID:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::ACCOUNT_ID:role/healthbytesBackendTaskRole",
  "containerDefinitions": [
    {
      "name": "backend",
      "image": "ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/healthbytes-backend-staging:latest",
      "portMappings": [
        {
          "containerPort": 3001,
          "protocol": "tcp"
        }
      ],
      "essential": true,
      "environment": [
        {
          "name": "ENVIRONMENT",
          "value": "staging"
        },
        {
          "name": "PORT",
          "value": "3001"
        }
      ],
      "secrets": [
        {
          "name": "DATABASE_URL",
          "valueFrom": "/healthbytes/staging/backend/DATABASE_URL"
        },
        {
          "name": "JWT_SECRET",
          "valueFrom": "/healthbytes/staging/backend/JWT_SECRET"
        },
        {
          "name": "CLERK_SECRET_KEY",
          "valueFrom": "/healthbytes/staging/backend/CLERK_SECRET_KEY"
        },
        {
          "name": "REDIS_URL",
          "valueFrom": "/healthbytes/staging/backend/REDIS_URL"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/healthbytes-backend-staging",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "healthCheck": {
        "command": ["CMD-SHELL", "curl -f http://localhost:3001/health || exit 1"],
        "interval": 30,
        "timeout": 5,
        "retries": 3,
        "startPeriod": 60
      }
    }
  ]
}
```

**⚠️ nojustbenja te va a dar el `ACCOUNT_ID` y los ARNs de los roles.**

---

## 4. CI/CD Pipeline (GitHub Actions)

**Archivo:** `.github/workflows/staging-deploy.yml`

```yaml
name: Deploy to Staging (ECS)

on:
  push:
    branches:
      - staging
  workflow_dispatch:

env:
  AWS_REGION: us-east-1
  ECR_BACKEND_REPO: healthbytes-backend-staging
  ECR_FRONTEND_REPO: healthbytes-frontend-staging
  ECS_CLUSTER: healthbytes-staging
  ECS_SERVICE_BACKEND: healthbytes-backend-staging
  ECS_SERVICE_FRONTEND: healthbytes-frontend-staging

jobs:
  deploy-backend:
    name: Deploy Backend to ECS
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}

      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v1

      - name: Build, tag, and push backend image
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          IMAGE_TAG: ${{ github.sha }}
        run: |
          cd backend
          docker build -t $ECR_REGISTRY/$ECR_BACKEND_REPO:$IMAGE_TAG .
          docker tag $ECR_REGISTRY/$ECR_BACKEND_REPO:$IMAGE_TAG $ECR_REGISTRY/$ECR_BACKEND_REPO:latest
          docker push $ECR_REGISTRY/$ECR_BACKEND_REPO:$IMAGE_TAG
          docker push $ECR_REGISTRY/$ECR_BACKEND_REPO:latest

      - name: Update ECS service
        run: |
          aws ecs update-service \
            --cluster ${{ env.ECS_CLUSTER }} \
            --service ${{ env.ECS_SERVICE_BACKEND }} \
            --force-new-deployment \
            --region ${{ env.AWS_REGION }}

      - name: Wait for service stability
        run: |
          aws ecs wait services-stable \
            --cluster ${{ env.ECS_CLUSTER }} \
            --services ${{ env.ECS_SERVICE_BACKEND }} \
            --region ${{ env.AWS_REGION }}

  smoke-tests:
    name: Run Smoke Tests
    needs: deploy-backend
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.13'

      - name: Install dependencies
        run: |
          pip install httpx pytest

      - name: Run smoke tests
        env:
          STAGING_API_URL: https://api-staging.healthbytes.app
        run: |
          pytest backend/tests/test_smoke_staging.py -v
```

---

## 5. Smoke Tests

**Archivo:** `backend/tests/test_smoke_staging.py`

```python
"""
Smoke tests para staging deployment.
Valida que los endpoints críticos estén respondiendo.
"""
import os
import pytest
import httpx

STAGING_API_URL = os.getenv("STAGING_API_URL", "https://api-staging.healthbytes.app")

@pytest.mark.asyncio
async def test_health_endpoint():
    """Verifica que el health check responda."""
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{STAGING_API_URL}/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"

@pytest.mark.asyncio
async def test_swagger_docs():
    """Verifica que Swagger esté accesible."""
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{STAGING_API_URL}/docs")
        assert response.status_code == 200
        assert b"Swagger UI" in response.content

@pytest.mark.asyncio
async def test_products_endpoint():
    """Verifica que el endpoint de productos responda (sin auth)."""
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{STAGING_API_URL}/api/v1/products")
        # Puede ser 200 (si permite sin auth) o 401 (si requiere auth)
        assert response.status_code in [200, 401]

@pytest.mark.asyncio
async def test_login_endpoint_exists():
    """Verifica que el endpoint de login exista."""
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{STAGING_API_URL}/api/v1/auth/login",
            json={"email": "test@example.com", "password": "wrongpassword"}
        )
        # Debe retornar 400/401 (credenciales incorrectas), no 404
        assert response.status_code in [400, 401, 422]
```

---

## Criterios de aceptación (tu parte)

- [ ] `backend/Dockerfile` creado y optimizado
- [ ] `frontend/Dockerfile` creado (si aplica ECS)
- [ ] Task Definition JSON creado para backend
- [ ] CI/CD pipeline `.github/workflows/staging-deploy.yml` funcional
- [ ] Smoke tests escritos y pasando localmente
- [ ] Build de Docker localmente exitoso: `docker build -t test-backend backend/`
- [ ] **nojustbenja revisó y aprobó tus Dockerfiles**
- [ ] **Vos revisaste y aprobaste la infra de nojustbenja**

---

## Verificación local (antes de pushear)

```bash
# Build backend
cd backend
docker build -t healthbytes-backend-staging .

# Test local
docker run -p 3001:3001 \
  -e DATABASE_URL="postgresql://..." \
  -e JWT_SECRET="test" \
  healthbytes-backend-staging

# En otra terminal:
curl http://localhost:3001/health
# Debe retornar: {"status": "healthy"}
```

---

## Coordinación con nojustbenja

**Antes de empezar:**
- Esperar a que nojustbenja confirme que la infra base está lista (VPC, ECS cluster, RDS, Redis)
- Pedirle los ARNs de IAM roles para el task definition
- Confirmar el `ACCOUNT_ID` de AWS para ECR

**Durante el desarrollo:**
- Push frequent de tus cambios a una branch `feat/ecs-deploy-chachoCL`
- nojustbenja hace lo mismo en `feat/ecs-deploy-nojustbenja`
- Ambos revisan los PRs del otro

**Al final:**
- Merge ambas branches a `ops/staging-ecs-deploy`
- Deploy conjunto
- Validar smoke tests juntos

---

## Commits esperados (tuyos)

```
ops(docker): add optimized Dockerfile for backend staging
ops(docker): add frontend Dockerfile for ECS deployment
ops(ecs): create task definition for backend service
ops(ci): add GitHub Actions workflow for ECS staging deploy
test(smoke): add post-deploy smoke tests for staging
docs(ops): document deployment process in aws-ecs-staging.md
```

---

> [!IMPORTANT]
> Esta es una tarea **colaborativa**. No trabajes aislado — coordina frecuentemente con nojustbenja. Ambos revisan y aprueban antes de mergear.
