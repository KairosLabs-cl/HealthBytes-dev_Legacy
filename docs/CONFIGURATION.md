# Configuration

Configuration documentation for HealthBytes, covering environment variables, configuration files, and deployment setup.

## Environment Variables

### Root Environment Variables

The project root `.env.example` defines shared variables used across services and Docker Compose:

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DB_USER` | Yes | `healthbytes` | PostgreSQL database username |
| `DB_PASSWORD` | Yes | `healthbytes_dev` | PostgreSQL database password |
| `DB_NAME` | Yes | `healthbytes` | PostgreSQL database name |
| `JWT_SECRET` | Yes | — | Secret key for JWT token signing (min 32 chars) |
| `ENVIRONMENT` | No | `development` | Runtime environment: `development`, `staging`, `production` |
| `LOG_LEVEL` | No | `info` | Logging verbosity: `debug`, `info`, `warning`, `error` |
| `CLERK_PUBLISHABLE_KEY` | Yes | — | Clerk authentication publishable key (`pk_test_...` or `pk_live_...`) |
| `CLERK_SECRET_KEY` | Yes | — | Clerk authentication secret key (`sk_test_...` or `sk_live_...`) |
| `BACKEND_URL` | Yes (prod) | — | Production backend URL for payment callbacks (e.g., `https://api.healthbytes.cl`) |
| `FRONTEND_URL` | Yes (prod) | — | Production frontend URL for redirects (e.g., `https://healthbytes.cl`) |

### Backend Environment Variables

The backend uses `pydantic-settings` with `backend/app/config.py` as the configuration source. All variables are loaded from the `.env` file:

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | **Yes** | — | PostgreSQL connection string (e.g., `postgresql://user:pass@host:5432/db`) |
| `JWT_SECRET` | **Yes** | — | Secret key for JWT signing (minimum 32 random characters) |
| `JWT_ALGORITHM` | No | `HS256` | JWT signing algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | No | `43200` | Token expiration time (30 days) |
| `CLERK_PUBLISHABLE_KEY` | No | `None` | Clerk publishable key for Clerk-based auth |
| `CLERK_SECRET_KEY` | No | `None` | Clerk secret key |
| `MERCADO_PAGO_ACCESS_TOKEN` | No | `None` | Mercado Pago API access token for Chile payments |
| `MERCADO_PAGO_WEBHOOK_SECRET` | No | `None` | Mercado Pago webhook verification secret |
| `RESEND_API_KEY` | No | `None` | Resend API key for transactional emails |
| `EMAIL_FROM_ADDRESS` | No | `HealthBytes <onboarding@resend.dev>` | Sender email address for outgoing emails |
| `BACKEND_URL` | No | `None` | Backend URL for payment provider callbacks |
| `FRONTEND_URL` | No | `None` | Frontend URL for payment redirects |
| `ENVIRONMENT` | No | `dev` | Runtime environment (`dev`, `staging`, `production`) |
| `HOST` | No | `127.0.0.1` | Server bind host |
| `PORT` | No | `3001` | Server port |
| `MAX_REQUEST_BODY_SIZE` | No | `10485760` (10 MB) | Maximum request body size in bytes |
| `ENABLE_DIAGNOSTIC_ENDPOINTS` | No | `False` | Enable diagnostic/health endpoints |
| `DEV_BYPASS_AUTH` | No | `False` | Bypass authentication in development mode |
| `SENTRY_DSN` | No | `None` | Sentry error tracking DSN (required in production) |
| `REDIS_URL` | No | `None` | Redis connection URL for caching (e.g., `redis://localhost:6379/0`) |
| `REDIS_CACHE_TTL_SECONDS` | No | `300` | Cache TTL for Redis product cache (5 minutes) |

### Frontend Environment Variables

Frontend variables are exposed via `app.config.js` and must be prefixed with `EXPO_PUBLIC_` to be accessible at runtime:

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `EXPO_PUBLIC_API_URL` | **Yes** | `http://localhost:3001` | Backend API base URL |
| `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` | **Yes** | — | Clerk publishable key for authentication |
| `EXPO_PUBLIC_SENTRY_DSN` | No | — | Sentry DSN for frontend error tracking |

### Production Validation

The backend enforces production readiness by validating required secrets when `ENVIRONMENT=production`:

```python
# backend/app/config.py
required_production_secrets = [
    "DATABASE_URL",
    "MERCADO_PAGO_WEBHOOK_SECRET",
    "CLERK_SECRET_KEY",
    "BACKEND_URL",
    "FRONTEND_URL",
]
```

If any are missing, the application raises `RuntimeError` at startup.

---

## Configuration Files

### Docker Compose (`docker-compose.yml`)

The project uses Docker Compose for local development with four services:

| Service | Image | Purpose | Ports |
|---------|-------|---------|-------|
| `postgres` | `postgres:16-alpine` | PostgreSQL database | `5432:5432` |
| `backend` | `./backend/Dockerfile` | FastAPI application | `3001:3001` |
| `frontend` | `./frontend/Dockerfile` | Expo development server | `8081:8081` |
| `redis` | `redis:7-alpine` | Product caching | `6379:6379` |

Environment variables are injected from the root `.env` file using `${VAR:-default}` syntax.

### Backend Configuration (`backend/app/config.py`)

The backend uses Pydantic's `BaseSettings` for type-safe configuration:

```python
class Settings(BaseSettings):
    DATABASE_URL: str
    JWT_SECRET: str
    # ... other fields with defaults
```

### Frontend App Config (`frontend/app.config.js`)

Exposes environment variables to Expo at build time:

```javascript
module.exports = ({ config }) => ({
  ...config,
  extra: {
    EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL,
    EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY,
  },
});
```

### EAS Build Config (`frontend/eas.json`)

Defines Expo Application Services build profiles:

| Profile | Platform | Output | Use Case |
|---------|----------|--------|----------|
| `development` | Android/iOS | APK | Local development with dev client |
| `preview` | Android/iOS | Internal APK | Testing before release |
| `production` | Android/iOS | AAB | Google Play Store submission |

---

## Required vs Optional Settings

### Required on Startup

These settings **must** be set or the application will fail to start:

**Backend:**
- `DATABASE_URL` — PostgreSQL connection string
- `JWT_SECRET` — JWT signing key (validated for production)

**Frontend:**
- `EXPO_PUBLIC_API_URL` — Backend API URL
- `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` — Clerk authentication key

### Required for Production

These settings are optional for development but **required** for production (`ENVIRONMENT=production`):

- `MERCADO_PAGO_WEBHOOK_SECRET` — Payment webhook verification
- `CLERK_SECRET_KEY` — Clerk server-side operations
- `BACKEND_URL` — For payment provider callbacks
- `FRONTEND_URL` — For payment redirects
- `SENTRY_DSN` — Error tracking

### Optional Settings

These have sensible defaults and are not required:

| Variable | Default | Description |
|----------|---------|-------------|
| `JWT_ALGORITHM` | `HS256` | JWT algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `43200` | Token expiry (30 days) |
| `REDIS_CACHE_TTL_SECONDS` | `300` | Product cache TTL |
| `MAX_REQUEST_BODY_SIZE` | `10MB` | Request size limit |
| `ENVIRONMENT` | `dev` | Runtime mode |

---

## Defaults

Default values defined in `backend/app/config.py`:

```python
# Authentication
JWT_ALGORITHM: str = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES: int = 43200  # 30 days

# Server
HOST: str = "127.0.0.1"
PORT: int = 3001
MAX_REQUEST_BODY_SIZE: int = 10 * 1024 * 1024  # 10 MB

# Environment
ENVIRONMENT: str = "dev"

# Caching
REDIS_CACHE_TTL_SECONDS: int = 300  # 5 minutes

# Email
EMAIL_FROM_ADDRESS: str = "HealthBytes <onboarding@resend.dev>"
```

---

## Per-Environment Overrides

### Development

```bash
ENVIRONMENT=dev
DATABASE_URL=postgresql://healthbytes:healthbytes_dev@localhost:5432/healthbytes
DEBUG=True
```

### Staging (AWS ECS)

Secrets are stored in AWS SSM Parameter Store under `/healthbytes/prod/`:

| SSM Path | Description |
|----------|-------------|
| `/healthbytes/prod/DATABASE_URL` | PostgreSQL connection |
| `/healthbytes/prod/JWT_SECRET` | JWT signing key |
| `/healthbytes/prod/CLERK_PUBLISHABLE_KEY` | Clerk publishable key |
| `/healthbytes/prod/CLERK_SECRET_KEY` | Clerk secret key |
| `/healthbytes/prod/MERCADO_PAGO_ACCESS_TOKEN` | Payment API token |
| `/healthbytes/prod/MERCADO_PAGO_WEBHOOK_SECRET` | Webhook secret |
| `/healthbytes/prod/RESEND_API_KEY` | Email API key |
| `/healthbytes/prod/BACKEND_URL` | Backend URL |
| `/healthbytes/prod/FRONTEND_URL` | Frontend URL |
| `/healthbytes/prod/SENTRY_DSN` | Error tracking DSN |

See `infra/ecs-task-definition.json` for ECS task definition referencing these secrets.

### Production

Production uses the same SSM structure as staging with `prod` environment variables. The GitHub Actions workflow (`deploy.yml`) handles deployment:

- **Backend**: ECS Fargate with Docker image from ECR
- **Frontend**: EAS build → Google Play Store submission

### GitHub Actions Secrets

Required secrets for CI/CD (`Settings → Secrets → Actions`):

| Secret | Used In | Purpose |
|--------|---------|---------|
| `AWS_ACCESS_KEY_ID` | `deploy.yml` | AWS authentication |
| `AWS_SECRET_ACCESS_KEY` | `deploy.yml` | AWS authentication |
| `STAGING_DATABASE_URL` | `deploy.yml` | Staging DB migrations |
| `STAGING_BACKEND_TASK_DEFINITION` | `deploy.yml` | ECS task definition |
| `STAGING_ECS_SERVICE` | `deploy.yml` | ECS service name |
| `STAGING_ECS_CLUSTER` | `deploy.yml` | ECS cluster name |
| `STAGING_URL` | `deploy.yml` | Staging deployment URL |
| `PROD_DATABASE_URL` | `deploy.yml` | Production DB migrations |
| `PROD_BACKEND_TASK_DEFINITION` | `deploy.yml` | Production ECS task definition |
| `PROD_ECS_SERVICE` | `deploy.yml` | Production ECS service |
| `PROD_ECS_CLUSTER` | `deploy.yml` | Production ECS cluster |
| `PROD_URL` | `deploy.yml` | Production deployment URL |
| `EXPO_TOKEN` | `deploy.yml` | EAS authentication |
| `GOOGLE_SERVICE_ACCOUNT_KEY_JSON` | `deploy.yml` | Play Console API access |

<!-- VERIFY: Staging and Production URLs are stored in GitHub Secrets, not in repository -->

---

## Quick Setup

### 1. Copy Environment Files

```bash
# Backend
cp backend/.env.example backend/.env

# Frontend
cp frontend/.env.example frontend/.env
```

### 2. Configure Backend

Edit `backend/.env` with your values:

```bash
# Database
DATABASE_URL=postgresql://healthbytes:your_password@localhost:5432/healthbytes

# JWT (generate with: python -c "import secrets; print(secrets.token_hex(32))")
JWT_SECRET=your_generated_secret_here

# Clerk (get from https://dashboard.clerk.com)
CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Environment
ENVIRONMENT=dev
```

### 3. Configure Frontend

The `frontend/setup-env.ps1` script handles this automatically:

```powershell
cd frontend
.\setup-env.ps1
```

Or manually edit `frontend/.env`:

```bash
EXPO_PUBLIC_API_URL=http://localhost:3001
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
```

### 4. Docker Setup (Optional)

```bash
docker-compose up -d
```

---

## Obtaining Credentials

| Service | Where to Get | Documentation |
|---------|--------------|---------------|
| PostgreSQL | Local install or AWS RDS | [postgresql.org](https://www.postgresql.org/download/) |
| Clerk | [dashboard.clerk.com](https://dashboard.clerk.com) | [docs.clerk.dev](https://clerk.com/docs) |
| Mercado Pago | [mercadopago.cl/developers](https://www.mercadopago.cl/developers) | [mercadopago.com/dev](https://www.mercadopago.com/developers) |
| Resend | [resend.com/api-keys](https://resend.com/api-keys) | [resend.com/docs](https://resend.com/docs) |
| Sentry | [sentry.io](https://sentry.io) | [docs.sentry.io](https://docs.sentry.io/) |
| AWS | [console.aws.amazon.com](https://console.aws.amazon.com) | [docs.aws.amazon.com](https://docs.aws.amazon.com/) |

<!-- VERIFY: Mercado Pago Chile developer portal URL is correct and current -->
<!-- VERIFY: Clerk dashboard URL is correct and current -->
