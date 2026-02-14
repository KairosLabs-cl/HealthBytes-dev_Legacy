# Docker Setup Documentation

## Overview

HealthBytes uses Docker Compose for containerized development and deployment. The setup includes:

- **PostgreSQL 16** - Primary database
- **FastAPI** - Backend API server
- **React Native/Expo** - Frontend dev server
- **Redis** - Optional caching layer

## Prerequisites

- Docker & Docker Compose (v2.0+)
- `.env` file configured (see [Environment Setup](#environment-setup))

## Quick Start

### Development Environment

```bash
# Clone .env.example to .env
cp .env.example .env

# Edit .env with your credentials
nano .env

# Start all services
docker compose up -d

# View logs
docker compose logs -f

# Stop services
docker compose down
```

### First-Time Setup (Migrations)

```bash
# Run database migrations
docker compose exec backend python run_migration.py

# (Optional) Seed test data
docker compose exec backend python -m scripts.seed_products
```

## Service Details

### PostgreSQL (postgres)

- **Image**: postgres:16-alpine
- **Port**: 5432 (localhost)
- **Credentials**: See `.env` (DB_USER, DB_PASSWORD)
- **Database**: healthbytes (default)
- **Health Check**: Automatic restart on failure
- **Volume**: `postgres_data` (persistent)

**Connect from host**:
```bash
psql -h localhost -U healthbytes -d healthbytes
```

### FastAPI Backend

- **Image**: Built from `backend/Dockerfile`
- **Port**: 3001 (localhost → 3001 container)
- **Environment**: Reads from `.env`
- **Health Check**: HTTP GET `/health` every 30s
- **Volumes**: `backend/app` and `backend/migrations` (hot reload in dev)
- **Dependencies**: Waits for PostgreSQL to be healthy

**Access**:
- API: http://localhost:3001
- Docs: http://localhost:3001/docs
- ReDoc: http://localhost:3001/redoc

### React Native Frontend

- **Image**: Built from `frontend/Dockerfile`
- **Port**: 8081 (localhost)
- **Environment**: EXPO_PUBLIC_API_URL=http://backend:3001
- **Volumes**: App code mounted for hot reload
- **Note**: Primarily for development; Expo is designed for native platforms (iOS/Android)

**Access**:
- Dev Server: http://localhost:8081
- Metro Bundler: Press `i` for iOS simulator or `a` for Android

### Redis Cache

- **Image**: redis:7-alpine
- **Port**: 6379 (localhost)
- **Volume**: `redis_data` (persistent)
- **Status**: Enabled but optional (not required for basic operation)

## Environment Configuration

### `.env.example`

```env
# Database
DB_USER=healthbytes
DB_PASSWORD=healthbytes_dev
DB_NAME=healthbytes

# Auth & Security
JWT_SECRET=your-secret-key-change-in-production
CLERK_PUBLISHABLE_KEY=pk_test_...
***REDACTED_CLERK_SECRET_KEY***

# App
ENVIRONMENT=development
LOG_LEVEL=info

# Redis
REDIS_PASSWORD=redis_dev

# Frontend
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
```

**Create `.env` from template**:
```bash
cp .env.example .env
# Edit with your actual keys
```

## Common Commands

### View Status
```bash
docker compose ps
```

### View Logs
```bash
docker compose logs -f backend      # Backend logs
docker compose logs -f postgres     # Database logs
docker compose logs -f frontend     # Frontend logs
docker compose logs -f              # All services
```

### Execute Commands in Container

```bash
# Backend shell
docker compose exec backend bash

# Run migrations
docker compose exec backend python run_migration.py

# Run tests
docker compose exec backend pytest --cov=app

# Database shell
docker compose exec postgres psql -U healthbytes -d healthbytes

# Frontend shell
docker compose exec frontend sh
```

### Rebuild Images

```bash
# Rebuild all images
docker compose build

# Rebuild specific service
docker compose build backend

# Force rebuild (no cache)
docker compose build --no-cache backend
```

### Clean Up

```bash
# Stop and remove containers
docker compose down

# Remove volumes (⚠️ deletes data)
docker compose down -v

# Remove images
docker compose down --rmi all
```

## Development Workflow

### 1. Start Services
```bash
docker compose up -d
```

### 2. Check Logs
```bash
docker compose logs -f
```

### 3. Run Migrations (if first time)
```bash
docker compose exec backend python run_migration.py
```

### 4. Access Services

| Service | URL |
|---------|-----|
| Backend | http://localhost:3001 |
| Swagger | http://localhost:3001/docs |
| Frontend | http://localhost:8081 |
| DB | localhost:5432 |
| Redis | localhost:6379 |

### 5. Code Changes

- **Backend**: Changes in `backend/app/` auto-reload (uvicorn)
- **Frontend**: Changes in `frontend/app/`, `frontend/components/` auto-reload (Metro)
- **Schema changes**: Stop and restart with `docker compose restart backend`

## Troubleshooting

### Port Already in Use

```bash
# Find process using port
lsof -i :3001    # Backend
lsof -i :5432    # Database
lsof -i :8081    # Frontend

# Kill process
kill -9 <PID>
```

### Database Connection Errors

```bash
# Check PostgreSQL health
docker compose exec postgres pg_isready

# View PostgreSQL logs
docker compose logs postgres

# Restart database
docker compose restart postgres
```

### Backend Won't Start

```bash
# Check backend logs
docker compose logs backend

# Run migrations
docker compose exec backend python run_migration.py

# Rebuild and restart
docker compose build --no-cache backend
docker compose up backend
```

### Frontend Hot Reload Not Working

```bash
# Restart frontend
docker compose restart frontend

# Rebuild frontend
docker compose build --no-cache frontend
docker compose up frontend
```

## Production Deployment

For production use:

1. **Remove volume mounts** (code hot reload)
2. **Use environment images**, not build from source
3. **Enable HTTPS** (nginx reverse proxy)
4. **Set strong JWT_SECRET**
5. **Use managed PostgreSQL** (AWS RDS, Cloud SQL, etc.)
6. **Use managed Redis** (AWS ElastiCache, etc.)
7. **Set LOG_LEVEL=warning**
8. **Enable CORS properly** (specific origins, not `*`)

Example production docker-compose (future):
```yaml
# See docs/deployment/ for full production setup
```

## Health Checks

All services include health checks:

```bash
# View health status
docker compose ps

# Manual health checks
curl http://localhost:3001/health        # Backend
psql -h localhost -U healthbytes -c "SELECT 1"  # PostgreSQL
redis-cli -h localhost PING              # Redis
```

## Networking

Services communicate via Docker network `healthbytes_network`:

- `postgres:5432` (internal)
- `backend:3001` (internal)
- `frontend:8081` (internal)
- `redis:6379` (internal)

Frontend API calls:
```typescript
// Inside container
EXPO_PUBLIC_API_URL=http://backend:3001

// From host
http://localhost:3001
```

## Next Steps

- [Backend Documentation](../backend/README.md)
- [Frontend Documentation](../frontend/README.md)
- [Security Guidelines](../docs/security/README.md)
- [Deployment Guide](../docs/deployment/) (future)
