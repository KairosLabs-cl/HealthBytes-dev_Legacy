<!-- generated-by: gsd-doc-writer -->
# Deployment Guide

This document covers deployment targets, build pipelines, environment configuration, rollback procedures, and monitoring for HealthBytes.

---

## Deployment Targets

HealthBytes supports multiple deployment targets for different environments:

| Target | Type | Config File | Description |
|--------|------|------------|-------------|
| **Local Development** | Docker Compose | `docker-compose.yml` | Full stack (PostgreSQL, Redis, Backend, Frontend) for local dev |
| **Staging** | AWS ECS | GitHub Secrets | Production-like environment for QA and testing |
| **Production** | AWS ECS + Play Store | GitHub Secrets | Live environment for end users |
| **Play Store** | EAS Build | `app.config.js` | Android AAB builds submitted to Google Play |

### Docker Compose (Local Development)

The project includes a full Docker-based development environment:

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

**Services defined:**
- `postgres` — PostgreSQL 16 database
- `redis` — Redis 7 cache
- `backend` — FastAPI application (port 3001)
- `frontend` — Expo dev server (port 8081)

See [`docker-compose.yml`](../../docker-compose.yml) for full configuration.

### AWS ECS (Backend)

The backend deploys to AWS ECS Fargate:

- **Staging**: `staging.healthbytes.com`
- **Production**: `api.healthbytes.com`

Docker images are built and pushed to Amazon ECR, then deployed via ECS task definitions.

### EAS / Play Store (Mobile)

Android builds are created with EAS Build and submitted via EAS Submit:

- **Staging builds**: Internal testing track
- **Production builds**: Production track on Google Play

---

## Build Pipeline

HealthBytes uses GitHub Actions for CI/CD. Two workflows handle testing and deployment:

### CI Workflow (`.github/workflows/ci.yml`)

Runs on every push to any branch:

1. **Backend Lint** — Black, isort, Flake8
2. **Backend Test** — pytest with coverage threshold (80%)
3. **Frontend Lint** — TypeScript check, ESLint
4. **Frontend Test** — Jest tests
5. **Frontend Audit** — pnpm audit
6. **Secret Scan** — Gitleaks
7. **SAST** — Bandit (high/medium severity)
8. **Docker Build** — Verify both images build successfully

### Deploy Workflow (`.github/workflows/deploy.yml`)

Triggers:
- Push to `main` or `master` — automatic staging deploy
- Manual workflow dispatch — select staging or production

**Pipeline steps:**

```
1. CI Gate (calls ci.yml)
      ↓
2. Build & Push Backend (ECR)
      ↓
   ┌─────────────────────────────────────────────┐
   │  STAGING (auto on push to main)              │
   │  - Run DB migrations                       │
   │  - Deploy to ECS                          │
   │  - Run smoke tests                        │
   └─────────────────────────────────────────────┘
      ↓
   ┌─────────────────────────────────────────────┐
   │  PRODUCTION (manual dispatch only)          │
   │  - Run DB migrations                       │
   │  - Deploy to ECS                          │
   │  - Build Android AAB (EAS)                 │
   │  - Submit to Play Store                 │
   └─────────────────────────────���───────────────┘
```

---

## Environment Setup

### Required Environment Variables

#### Backend (All Environments)

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `JWT_SECRET` | Yes | Secret key for JWT signing |
| `CLERK_PUBLISHABLE_KEY` | Yes | Clerk publishable key |
| `CLERK_SECRET_KEY` | Yes | Clerk secret key |
| `ENVIRONMENT` | Yes | `development`, `staging`, or `production` |
| `LOG_LEVEL` | No | Logging level (default: `info`) |
| `REDIS_URL` | No | Redis connection (default: `redis://redis:6379/0`) |

#### Frontend (All Environments)

| Variable | Required | Description |
|----------|----------|-------------|
| `EXPO_PUBLIC_API_URL` | Yes | Backend API base URL |
| `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` | Yes | Clerk publishable key |

### GitHub Secrets Configuration

For staging and production deployments, configure these secrets in GitHub repository settings:

**Common (both environments):**
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION` (default: `us-east-1`)

**Staging:**
- `STAGING_DATABASE_URL`
- `STAGING_URL`
- `STAGING_BACKEND_TASK_DEFINITION` (JSON string)
- `STAGING_ECS_SERVICE`
- `STAGING_ECS_CLUSTER`

**Production:**
- `PROD_DATABASE_URL`
- `PROD_URL`
- `PROD_BACKEND_TASK_DEFINITION`
- `PROD_ECS_SERVICE`
- `PROD_ECS_CLUSTER`

**EAS / Play Store (production only):**
- `EXPO_TOKEN` — Expo access token
- `GOOGLE_SERVICE_ACCOUNT_KEY_JSON` — Google Play service account

See [`deploy.yml`](../../.github/workflows/deploy.yml) for the complete secret list.

<!-- VERIFY: Production URLs, staging/production dashboard links, ECS cluster names -->

---

## Rollback Procedure

### Backend (ECS)

To rollback a backend deployment:

**Option 1: Re-deploy previous image tag**
```bash
# Find the previous image tag
aws ecs describe-services \
  --cluster <cluster> \
  --service <service> \
  --query 'services[0].taskSets[0].scale'

# Update the service to the previous image
aws ecs update-service \
  --cluster <cluster> \
  --service <service> \
  --task-definition <previous-task-def-arn>
```

**Option 2: Use GitHub Actions**
1. Go to the GitHub Actions workflow run
2. Click "Re-run all jobs"
3. Select the previous commit SHA

### Frontend (Play Store)

Android rollbacks are handled through Google Play Console:

1. Go to [Google Play Console](https://play.google.com/console)
2. Navigate to your app → Release → Production
3. Use "Roll back to previous release"

---

## Monitoring

### Error Tracking (Sentry)

HealthBytes uses Sentry for error tracking in the backend:

- **Configuration**: [`backend/app/main.py`](../../backend/app/main.py)
- **SDK**: `sentry-sdk[fastapi]`
- **Integrations**: FastAPI, SQLAlchemy

<!-- VERIFY: Sentry dashboard URL for staging and production -->

### Health Checks

| Endpoint | Purpose |
|----------|---------|
| `GET /health` | Basic health check (returns `{"status": "ok"}) |
| `GET /health/db` | Database connectivity |
| `GET /health/redis` | Redis connectivity |

**Local:**
```bash
curl http://localhost:3001/health
```

**Staging:**
<!-- VERIFY: staging health endpoint URL -->
```bash
curl https://staging.healthbytes.com/health
```

**Production:**
<!-- VERIFY: production health endpoint URL -->
```bash
curl https://api.healthbytes.com/health
```

### Smoke Tests

The deploy workflow runs smoke tests after deployment:

- **Script**: `backend/scripts/smoke_tests.py`
- **Checks**: Health endpoint, database connectivity, basic API response

---

## Deployment Checklist

Before deploying to any environment:

- [ ] All CI jobs pass
- [ ] Tests pass locally (`pytest` and `pnpm test`)
- [ ] No new security vulnerabilities detected
- [ ] Environment variables configured in target environment
- [ ] Database migrations tested
- [ ] Rollback procedure verified

### Pre-Production Checklist

- [ ] Smoke tests pass on staging
- [ ] QA team has approved the release
- [ ] Release notes prepared
- [ ] Rollback plan in place

---

## Related Documentation

- [Architecture Overview](../architecture/overview.md)
- [Configuration Overview](../configuration/overview.md)
- [Security Improvements](../security/security-improvements.md)
- [Docker Setup](../setup/DOCKER_SETUP.md)
- [Frontend Setup](../setup/frontend-setup.md)