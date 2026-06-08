# 🛠️ Task — Benjamin + José (Colaborativa)

**Tarea:** Staging Deploy — AWS ECS  
**Branch:** `ops/staging-ecs-deploy`  
**ID:** `task-20260608-staging-ecs-deploy`  
**Tipo:** `ops` — infraestructura release readiness P1  
**Assignees:** Benjamin (CTO) + José (Backend Mid)

---

## Objetivo

Desplegar backend y frontend a **AWS ECS staging** usando la arquitectura roadmapeada. Esto desbloquea testing en ambiente real previo a producción.

**⚠️ Esta es una tarea colaborativa — requiere trabajo en conjunto de ambos desarrolladores.**

---

## 📊 División de responsabilidades

### Benjamin (Infraestructura AWS)
- Crear/configurar VPC, subnets, security groups
- Configurar ECS Cluster (Fargate)
- Provisionar RDS PostgreSQL staging
- Provisionar ElastiCache Redis staging
- Crear ALB + Target Groups
- Configurar IAM roles y policies
- Configurar SSM Parameter Store con secrets
- Configurar Route53 (si aplica)
- **Documentar costos baseline mensuales**

### José (Aplicación y CI/CD)
- Crear `backend/Dockerfile` optimizado
- Crear `frontend/Dockerfile` o config S3+CloudFront
- Crear ECS Task Definitions
- Implementar CI/CD pipeline (`.github/workflows/staging-deploy.yml`)
- Configurar health checks y auto-scaling
- Escribir smoke tests post-deploy
- Documentar proceso de deploy en `docs/operations/aws-ecs-staging.md`

### Ambos (Revisión y validación)
- Code review cruzado de los PRs
- Validación de smoke tests
- Documentación final
- Aprobación antes de mergear

---

## Archivos a crear/modificar

| Responsable | Acción | Archivo |
|---|---|---|
| **José** | Crear | `backend/Dockerfile` |
| **José** | Crear | `frontend/Dockerfile` o config S3 |
| **José** | Crear | `.github/workflows/staging-deploy.yml` (CI/CD) |
| **José** | Crear | `backend/tests/test_smoke_staging.py` (smoke tests) |
| **Benjamin** | Crear/revisar | Scripts en `infra/aws/` (Terraform o CLI) |
| **Benjamin** | Documentar | Variables en AWS SSM Parameter Store |
| **Ambos** | Crear | `docs/operations/aws-ecs-staging.md` (guía completa) |
| **Ambos** | Revisar | ECS Task Definitions JSON |

---

## Arquitectura esperada

### Backend (ECS Fargate + ALB)
```
Internet
   ↓
Application Load Balancer (ALB)
   ↓
ECS Service (Fargate)
   ├─ Task Definition: healthbytes-backend-staging
   ├─ Container: backend (puerto 3001)
   ├─ Health check: /health
   └─ Auto-scaling: min 1, max 2

Database: RDS PostgreSQL (staging instance)
Cache: ElastiCache Redis (staging instance)
Secrets: SSM Parameter Store
```

### Frontend (Opción 1: S3 + CloudFront)
```
S3 Bucket: healthbytes-frontend-staging
CloudFront Distribution
   ↓
Custom domain (opcional): staging.healthbytes.app
```

### Frontend (Opción 2: ECS)
```
ALB → ECS Service (Expo web build estático servido por nginx)
```

---

## Variables de entorno (SSM Parameter Store)

**Estructura en AWS Systems Manager:**
```
/healthbytes/staging/backend/DATABASE_URL
/healthbytes/staging/backend/JWT_SECRET
/healthbytes/staging/backend/CLERK_PUBLISHABLE_KEY
/healthbytes/staging/backend/CLERK_SECRET_KEY
/healthbytes/staging/backend/REDIS_URL
/healthbytes/staging/backend/SENTRY_DSN
/healthbytes/staging/backend/ENVIRONMENT = "staging"

/healthbytes/staging/frontend/EXPO_PUBLIC_API_URL
/healthbytes/staging/frontend/EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY
/healthbytes/staging/frontend/EXPO_PUBLIC_SENTRY_DSN
```

**⚠️ NUNCA commitear estos valores — solo en AWS.**

---

## Pasos de implementación

### 1. Preparar Dockerfiles

**Backend:**
```dockerfile
# backend/Dockerfile
FROM python:3.13.1-slim

WORKDIR /app

# Instalar dependencias del sistema
RUN apt-get update && apt-get install -y \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copiar requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar código
COPY . .

# Exponer puerto
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
  CMD curl -f http://localhost:3001/health || exit 1

# Comando de inicio
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "3001"]
```

**Frontend (si usas ECS):**
```dockerfile
# frontend/Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

COPY . .
RUN pnpm run build:web

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

### 2. Infraestructura AWS (Terraform o scripts)

Si tenés scripts en `infra/aws/`, revisarlos y actualizarlos.

Si no, documentar comandos manuales en `docs/operations/aws-ecs-staging.md`:

#### Crear VPC y Subnets (si no existen)
#### Crear Security Groups
#### Crear RDS PostgreSQL staging
#### Crear ElastiCache Redis staging
#### Crear ECR repositories
```bash
aws ecr create-repository --repository-name healthbytes-backend-staging
aws ecr create-repository --repository-name healthbytes-frontend-staging
```

#### Crear ECS Cluster
```bash
aws ecs create-cluster --cluster-name healthbytes-staging
```

#### Crear Task Definitions
#### Crear ECS Services
#### Crear ALB + Target Groups
#### Configurar Route53 (opcional)

---

### 3. CI/CD con GitHub Actions

```yaml
# .github/workflows/staging-deploy.yml
name: Deploy to Staging (ECS)

on:
  push:
    branches:
      - staging
  workflow_dispatch:

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      
      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v1
      
      - name: Build and push backend image
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          ECR_REPOSITORY: healthbytes-backend-staging
          IMAGE_TAG: ${{ github.sha }}
        run: |
          cd backend
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
      
      - name: Update ECS service
        run: |
          aws ecs update-service \
            --cluster healthbytes-staging \
            --service healthbytes-backend-staging \
            --force-new-deployment
  
  deploy-frontend:
    runs-on: ubuntu-latest
    needs: deploy-backend
    steps:
      # Similar para frontend (S3 o ECS según tu elección)
```

---

## 4. Smoke Tests

Después del deploy, verificar:

```bash
# Backend health
curl https://api-staging.healthbytes.app/health
# Debe retornar: {"status": "healthy"}

# Swagger
curl https://api-staging.healthbytes.app/docs
# Debe retornar HTML

# Login flow
curl -X POST https://api-staging.healthbytes.app/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
# Debe retornar token JWT
```

---

## Criterios de aceptación

### Infraestructura (Benjamin):
- [ ] ECS Cluster creado y funcional
- [ ] RDS PostgreSQL staging provisionado y accesible
- [ ] ElastiCache Redis staging provisionado
- [ ] ALB + Target Groups configurados correctamente
- [ ] Security groups permiten tráfico necesario
- [ ] IAM roles creados con permisos correctos
- [ ] SSM Parameter Store poblado con secrets
- [ ] **Costos baseline mensuales documentados** (~$75-100)

### Aplicación (José):
- [ ] `backend/Dockerfile` optimizado y funcional
- [ ] `frontend/Dockerfile` o S3 config funcional
- [ ] ECS Task Definitions creadas y válidas
- [ ] CI/CD pipeline en GitHub Actions funcional
- [ ] Health checks configurados en tasks
- [ ] Smoke tests escritos y pasando

### Validación conjunta:
- [ ] Backend accesible vía ALB: `https://api-staging.healthbytes.app/health`
- [ ] Frontend accesible: `https://staging.healthbytes.app`
- [ ] Login flow funciona end-to-end en staging
- [ ] Logs ECS visibles y sin errores críticos
- [ ] Documentación completa en `docs/operations/aws-ecs-staging.md`
- [ ] **Ambos revisaron y aprobaron los PRs del otro**

---

## Costos estimados (documentar)

| Servicio | Configuración | Costo mensual estimado |
|---|---|---|
| ECS Fargate (backend) | 1 tarea, 0.5 vCPU, 1GB RAM | ~$15-20 |
| ECS Fargate (frontend) | 1 tarea, 0.25 vCPU, 0.5GB RAM | ~$8-10 |
| RDS PostgreSQL | db.t3.micro, 20GB storage | ~$15-20 |
| ElastiCache Redis | cache.t3.micro | ~$12-15 |
| ALB | 1 ALB + data transfer | ~$20-25 |
| S3 + CloudFront | Static hosting | ~$5-10 |
| **Total estimado** | | **~$75-100/mes** |

---

## Commits esperados

### José:
```
ops(docker): add optimized Dockerfile for backend staging
ops(docker): add frontend Dockerfile for ECS deployment
ops(ci): add GitHub Actions workflow for ECS staging deploy
test(smoke): add post-deploy smoke tests for staging
```

### Benjamin:
```
ops(aws): configure ECS cluster and Fargate services
ops(aws): provision RDS PostgreSQL and ElastiCache Redis staging
ops(aws): configure ALB, target groups, and security groups
ops(aws): document baseline monthly costs (~$75-100)
```

### Ambos:
```
docs(ops): add complete AWS ECS staging deployment guide
ops(ecs): final staging deployment validation and approval
```

---

## Verificación

```bash
# Después del deploy:
curl https://api-staging.healthbytes.app/health
curl https://staging.healthbytes.app  # frontend

# Logs ECS:
aws logs tail /ecs/healthbytes-backend-staging --follow

# Status del servicio:
aws ecs describe-services \
  --cluster healthbytes-staging \
  --services healthbytes-backend-staging
```

---

## Impacto

Staging en AWS ECS permite:
- Testing en ambiente real antes de producción
- Validación de migraciones DB en staging
- Smoke tests automatizados previos a release
- Debugging de issues específicos de ambiente cloud
- Path claro a producción (misma arquitectura)

**Desbloquea:** beta testing, QA en ambiente real, onboarding de testers externos.

---

> [!IMPORTANT]
> Este es P1 de release readiness. Sin staging funcional, no podemos validar la app previo a producción.

---

## Referencias

- AWS ECS Fargate docs: https://docs.aws.amazon.com/AmazonECS/latest/developerguide/AWS_Fargate.html
- SSM Parameter Store: https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-parameter-store.html
- GitHub Actions AWS: https://github.com/aws-actions
