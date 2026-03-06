# HealthBytes Infrastructure

Scripts y configuración para desplegar HealthBytes en AWS.

## Requisitos

- AWS CLI configurado (`aws configure`)
- Permisos IAM: ECS, ECR, SSM, CloudWatch Logs, VPC
- Bash o Git Bash (Windows)

## Archivos

| Archivo | Descripción |
|---------|-------------|
| `ecr-setup.sh` | Crea el repositorio ECR para la imagen del backend |
| `ecs-task-definition.json` | Task definition para ECS Fargate |
| `secrets-setup.sh` | Pobl parameter store en SSM con secrets de producción |
| `README.md` | Este archivo |

## Uso

### 1. ECR Setup

```bash
chmod +x ecr-setup.sh
./ecr-setup.sh
```

Esto crea el repositorio `healthbytes-backend` en ECR.

### 2. Secrets Setup

```bash
chmod +x secrets-setup.sh
./secrets-setup.sh
```

El script pide interactivamente cada secret. Los valores se almacenan en SSM Parameter Store como `SecureString`.

### 3. ECS Task Definition

Antes de registrar, reemplazar `ACCOUNT_ID` en `ecs-task-definition.json` con el ID de tu cuenta AWS:

```bash
sed -i 's/ACCOUNT_ID/123456789012/g' ecs-task-definition.json
aws ecs register-task-definition \
  --cli-input-json file://ecs-task-definition.json \
  --region us-east-1
```

### 4. Deploy con GitHub Actions

El workflow `deploy.yml` en `.github/workflows/` hace deploy automático a staging en push a main, y a producción con approval manual.

## Estructura de Secrets en SSM

```
/healthbytes/prod/DATABASE_URL
/healthbytes/prod/JWT_SECRET
/healthbytes/prod/CLERK_PUBLISHABLE_KEY
/healthbytes/prod/CLERK_SECRET_KEY
/healthbytes/prod/MERCADO_PAGO_ACCESS_TOKEN
/healthbytes/prod/MERCADO_PAGO_WEBHOOK_SECRET
/healthbytes/prod/RESEND_API_KEY
/healthbytes/prod/EMAIL_FROM_ADDRESS
/healthbytes/prod/BACKEND_URL
/healthbytes/prod/FRONTEND_URL
/healthbytes/prod/ENVIRONMENT
/healthbytes/prod/SENTRY_DSN
```

## Notas

- Todos los scripts asumen `us-east-1`. Cambiar `AWS_REGION` si se usa otra región.
- El ECS service usa la VPC por defecto. Para producción, crear una VPC dedicada.
- Los logs van a CloudWatch `/ecs/healthbytes-backend`.
