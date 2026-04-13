# Technology Stack

**Analysis Date:** 2026-04-13

## Languages

**Primary:**
- **TypeScript** 5.9.x - Frontend development
- **Python** 3.13.1 - Backend development

**Secondary:**
- JavaScript (JSX/TSX) - React Native components

## Runtime

**Frontend Environment:**
- **React Native** 0.81.5 (Hermes engine)
- **Node.js** 20.x (for build tooling)
- **Package Manager:** pnpm 10.26.0

**Backend Environment:**
- **Python** 3.13.1 (async, production)
- **uvicorn** with standard extras (ASGI server)

## Frameworks

**Frontend (Mobile):**
- **Expo** 54.0.33 - Development tooling and build system
- **Expo Router** 6.0.23 - File-based routing
- **React** 19.1.0 - UI framework
- **React Native Web** 0.21.0 - Web platform support

**Backend:**
- **FastAPI** 0.128.0+ - REST API framework
- **Pydantic** 2.12.5+ - Data validation
- **SQLAlchemy** 2.0.46+ - Async ORM

**Testing:**
- **Frontend:** Jest 29.7.0 + jest-expo 54.0.17 + Testing Library 12.9.0
- **Backend:** pytest with async support

**Build/Dev:**
- **TypeScript** 5.9.2 (strict mode enabled)
- **ESLint** 9.39.2 (flat config)
- **Prettier** 3.8.0
- **Black** 25.1.0 (Python formatter, 100-char lines)
- **isort** (import sorting)
- **Babel** with expo preset

## Key Dependencies

**Frontend - State & Data:**
- `zustand` 5.0.10 - Lightweight state management
- `@tanstack/react-query` 5.90.19 - Server state management

**Frontend - UI Components:**
- `@gluestack-ui/*` (button, input, form-control, icon, image, overlay, toast) - Component library
- `nativewind` 4.2.1 - Tailwind CSS for React Native
- `react-native-reanimated` 4.1.1 - Animations
- `react-native-screens` 4.16.0 - Native navigation primitives
- `react-native-svg` 15.12.1 - SVG rendering
- `lucide-react-native` 0.562.0 - Icons

**Frontend - Authentication:**
- `@clerk/clerk-expo` 2.19.26 - Authentication provider

**Frontend - Native Features:**
- `expo-auth-session` 7.0.10 - OAuth flows
- `expo-secure-store` 15.0.8 - Secure storage
- `expo-notifications` 0.32.16 - Push notifications
- `expo-linking` 8.0.11 - Deep linking
- `@react-native-async-storage/async-storage` 2.2.0 - Local storage

**Frontend - Observability:**
- `@sentry/react-native` 7.2.0 - Error tracking

**Backend - Database:**
- `psycopg[binary]` 3.3.2+ - PostgreSQL async driver
- `alembic` 1.14.0+ - Database migrations
- `greenlet` 3.1.1+ - Green threads

**Backend - Auth & Security:**
- `python-jose[cryptography]` 3.5.0+ - JWT handling
- `bcrypt` 4.1.0+ - Password hashing
- `PyJWT[crypto]` 2.10.1+ - JWT encoding/decoding
- `slowapi` 0.1.9+ - Rate limiting

**Backend - External Services:**
- `resend` 2.0.0+ - Email sending (via Resend API)
- `redis[asyncio]` 5.0.0+ - Caching layer

**Backend - Observability:**
- `sentry-sdk[fastapi]` 2.0.0+ - Error tracking

## Configuration

**Environment Variables (Frontend):**
- `EXPO_PUBLIC_API_URL` - Backend API endpoint
- `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk public key

**Environment Variables (Backend):**
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Token signing secret
- `CLERK_PUBLISHABLE_KEY` / `CLERK_SECRET_KEY` - Clerk credentials
- `MERCADO_PAGO_ACCESS_TOKEN` / `MERCADO_PAGO_WEBHOOK_SECRET` - Payment provider
- `RESEND_API_KEY` - Email service
- `SENTRY_DSN` - Error tracking
- `ENVIRONMENT` - dev/staging/production
- `BACKEND_URL` / `FRONTEND_URL` - Application URLs

**Build Configuration:**
- `frontend/tsconfig.json` - Extends expo/tsconfig.base, strict mode
- `frontend/app.config.js` - Expo app configuration
- `frontend/eas.json` - EAS Build profiles (dev/preview/production)
- `frontend/babel.config.js` - NativeWind + reanimated plugins
- `backend/pyproject.toml` - Black/isort/pytest configuration

## Platform Requirements

**Development:**
- Node.js 20.x (LTS)
- Python 3.13.1+
- pnpm 10.26.0+
- PostgreSQL 14+
- Redis 7+ (optional, for caching)

**Production:**
- AWS ECS Fargate (backend container)
- PostgreSQL 16 (AWS RDS compatible)
- Redis 7+ (AWS ElastiCache compatible)
- CloudWatch Logs

**Mobile Targets:**
- iOS 14+ (Expo managed workflow)
- Android API 24+ (Android 7.0+)
- Web (modern browsers, ES2020+)

---

*Stack analysis: 2026-04-13*
