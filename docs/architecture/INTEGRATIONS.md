# External Integrations

**Analysis Date:** 2026-04-13

## APIs & External Services

**Authentication:**
- **Clerk** - User authentication and management
  - Frontend SDK: `@clerk/clerk-expo` 2.19.26
  - Backend validation: `python-jose` for JWT verification
  - Auth method: JWT tokens (HS256)
  - Environment vars: `CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`

**Payment Processing:**
- **Mercado Pago** - Primary payment provider (Chile market)
  - SDK: REST API via `httpx`
  - Features: Checkout, webhooks, payment confirmation
  - Environment vars: `MERCADO_PAGO_ACCESS_TOKEN`, `MERCADO_PAGO_WEBHOOK_SECRET`
  - Backend endpoint: Webhook handler at `/api/v1/payments/webhook`

**Email:**
- **Resend** - Transactional email service
  - SDK: `resend` Python package
  - Features: Order confirmation emails, password reset
  - Environment var: `RESEND_API_KEY`
  - Sender: Configured via `EMAIL_FROM_ADDRESS`

**Error Tracking:**
- **Sentry** - Application monitoring
  - Frontend SDK: `@sentry/react-native` 7.2.0
  - Backend SDK: `sentry-sdk[fastapi]` 2.0.0
  - Features: Error tracking, performance monitoring
  - Environment var: `SENTRY_DSN`

## Data Storage

**Primary Database:**
- **PostgreSQL** 16
  - Driver: `psycopg[binary]` async
  - ORM: SQLAlchemy 2.0+ async
  - Migrations: Alembic
  - Connection: Configured via `DATABASE_URL`
  - Location: AWS RDS (production), Docker (development)

**Caching:**
- **Redis** 7
  - Client: `redis[asyncio]`
  - Features: Product caching with TTL
  - Functions: `get_products_cached()` with 5-minute TTL
  - Connection: `REDIS_URL` (production) / Docker container (development)

**Local Storage:**
- **AsyncStorage** - React Native persistent storage
  - Package: `@react-native-async-storage/async-storage`
  - Uses: Auth token persistence, offline data

**Secure Storage:**
- **expo-secure-store** - Sensitive credential storage
  - Platform: iOS Keychain / Android Keystore
  - Uses: JWT token storage, API keys

## Authentication & Identity

**Auth Provider:**
- **Clerk** (primary)
  - Implementation: JWT-based with `@clerk/clerk-expo`
  - Flow: OAuth + email/password
  - Token storage: expo-secure-store
  - Middleware: Clerk middleware for protected routes

**Custom JWT:**
- Backend issues JWT tokens via `python-jose`
- Algorithm: HS256
- Expiry: 43200 minutes (30 days dev)
- Verification: Clerk's `clerk-server-sdk` or custom JWT validation

## Monitoring & Observability

**Error Tracking:**
- **Sentry** (both frontend and backend)
  - Frontend: React Native SDK
  - Backend: FastAPI integration
  - DSN configured per environment

**Logs:**
- **CloudWatch Logs** (production)
  - ECS container logs via awslogs driver
  - Log group: `/ecs/healthbytes-backend`
  - Region: us-east-1

**CI/CD Logs:**
- **GitHub Actions** - Build and deployment logs
- **pytest-cov** - Test coverage reports (40% backend target)

## CI/CD & Deployment

**Hosting:**
- **AWS ECS Fargate** - Backend container hosting
  - Task definition: `infra/ecs-task-definition.json`
  - CPU: 512 units, Memory: 1024 MB
  - Region: us-east-1
  - ECR repository: `healthbytes-backend`

**Mobile Builds:**
- **EAS (Expo Application Services)** - Mobile app builds
  - Service: Expo Build
  - Profiles: development, preview, production
  - Artifacts: APK (dev/preview), AAB (production)

**Play Store:**
- **Google Play Console** - Android distribution
  - Submission via EAS Submit
  - Service account authentication

**CI Pipeline:**
- **GitHub Actions** - Automated testing and deployment
  - Linting: Black, isort, flake8, ESLint, TypeScript
  - Testing: pytest, Jest
  - Security: Bandit (SAST), Gitleaks (secrets), pnpm audit
  - Docker: Build and push to ECR
  - Deploy: ECS task definition updates

## Environment Configuration

**Required Environment Variables:**

| Variable | Description | Location |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection | AWS SSM / Docker env |
| `JWT_SECRET` | Token signing key | AWS SSM / .env |
| `CLERK_PUBLISHABLE_KEY` | Clerk public key | AWS SSM / .env |
| `CLERK_SECRET_KEY` | Clerk secret key | AWS SSM / .env |
| `MERCADO_PAGO_ACCESS_TOKEN` | Payment API key | AWS SSM / .env |
| `MERCADO_PAGO_WEBHOOK_SECRET` | Webhook verification | AWS SSM / .env |
| `RESEND_API_KEY` | Email API key | AWS SSM / .env |
| `EMAIL_FROM_ADDRESS` | Sender email | AWS SSM / .env |
| `BACKEND_URL` | API base URL | AWS SSM / .env |
| `FRONTEND_URL` | App URL | AWS SSM / .env |
| `SENTRY_DSN` | Error tracking | AWS SSM / .env |
| `ENVIRONMENT` | dev/staging/production | AWS SSM / .env |

**Secrets Management:**
- **Development:** `.env` files (not committed to git)
- **Production:** AWS Systems Manager (SSM) Parameter Store
  - Path: `/healthbytes/prod/*`
  - Type: SecureString
  - Setup script: `infra/secrets-setup.sh`

**Frontend Secrets:**
- `EXPO_PUBLIC_API_URL` - Runtime variable (expo-secrets)
- `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` - Runtime variable

## Webhooks & Callbacks

**Incoming Webhooks:**
- **Mercado Pago Payment Webhook**
  - Endpoint: `POST /api/v1/payments/webhook`
  - Secret: `MERCADO_PAGO_WEBHOOK_SECRET`
  - Events: Payment confirmation, status updates

**Outgoing Webhooks:**
- None configured (outbound notifications via email only)

## Infrastructure Summary

```
┌─────────────────────────────────────────────────────────────┐
│                    AWS Cloud (us-east-1)                   │
├─────────────────────────────────────────────────────────────┤
│  ECS Fargate (Backend)     │  RDS PostgreSQL 16 (Database) │
│  - healthbytes-backend     │  - healthbytes-prod          │
│  - 512 CPU / 1024 MB       │  - Multi-AZ                  │
├─────────────────────────────────────────────────────────────┤
│  ElastiCache Redis         │  CloudWatch Logs             │
│  - healthbytes-cache       │  - /ecs/healthbytes-backend  │
└─────────────────────────────────────────────────────────────┘
```

---

*Integration audit: 2026-04-13*
