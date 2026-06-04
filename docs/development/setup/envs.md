# Environment Variables

Environment variable truth for local development, staging, and production.

Rules:

- Never commit real `.env` files.
- Keep examples in `.env.example` files only.
- Document what each variable does, where to obtain it, and whether it is required for local, staging, or production.
- Do not paste real credentials into docs.

## Files

| File | Purpose | Commit? |
| --- | --- | --- |
| `.env.example` | Root Docker Compose example | Yes |
| `backend/.env.example` | Backend local app example | Yes |
| `frontend/.env.example` | Expo client example | Yes |
| `.env` | Root Docker Compose runtime values | No |
| `backend/.env` | Backend runtime values | No |
| `frontend/.env` | Frontend runtime values | No |

## Backend

| Variable | Required local | Source | Notes |
| --- | --- | --- | --- |
| `DATABASE_URL` | Yes | Local Postgres or managed DB | Use `postgresql://...`; app converts to async driver internally. |
| `JWT_SECRET` | Yes | Generated locally | Generate with `python3 -c "import secrets; print(secrets.token_hex(32))"`. |
| `JWT_ALGORITHM` | Yes | Default local value | Use `HS256` unless auth architecture changes. |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | No | Local policy | Examples keep current long-lived local session behavior. |
| `CLERK_PUBLISHABLE_KEY` | Required for Clerk flows | Clerk Dashboard | Public client key, starts with `pk_`. |
| `CLERK_SECRET_KEY` | Required for Clerk server flows | Clerk Dashboard | Secret. Never paste into docs or logs. |
| `MERCADO_PAGO_ACCESS_TOKEN` | Payment testing only | Mercado Pago Developers | Not needed for catalog/frontend recon. |
| `MERCADO_PAGO_WEBHOOK_SECRET` | Webhook testing only | Mercado Pago Developers | Required for Mercado Pago webhook validation. |
| `RESEND_API_KEY` | Email testing only | Resend | If missing in dev, email service logs instead of sending. |
| `EMAIL_FROM_ADDRESS` | No | Resend/domain owner | Default is local-safe for dev. |
| `BACKEND_URL` | Payment callback testing | Local URL or deployment URL | Use `http://localhost:3001` locally. |
| `FRONTEND_URL` | CORS/payment callback testing | Expo/web URL | Use `http://localhost:8081` locally. |
| `ENVIRONMENT` | Yes | Local config | Use `dev` locally so `/docs` and `/redoc` are enabled. |
| `HOST` | No | Local config | `0.0.0.0` helps phone-to-laptop testing. |
| `PORT` | No | Local config | Default backend port is `3001`. |
| `REDIS_URL` | No | Local Redis | Optional in dev; recommended when testing cache/rate limiting. |
| `REDIS_CACHE_TTL_SECONDS` | No | Local config | Defaults to 300 seconds. |
| `SENTRY_DSN` | No | Sentry | Leave blank locally unless testing observability. |

## Frontend

| Variable | Required local | Source | Notes |
| --- | --- | --- | --- |
| `EXPO_PUBLIC_API_URL` | Yes | `frontend/setup-env.sh` or `.ps1` | Use `http://localhost:3001` for web; use `http://<local-ip>:3001` for Expo Go on a phone. |
| `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` | Yes | Clerk Dashboard/team lead | Must start with `pk_`; public client key but still kept out of committed scripts. |
| `EXPO_PUBLIC_EAS_PROJECT_ID` | Push notification testing only | Expo/EAS | Required for remote push registration, not for normal local UI recon. |
| `EXPO_PUBLIC_SENTRY_DSN` | No | Sentry | Leave blank locally unless testing error reporting. |

## Local Setup Link

Follow `local-setup.md` for exact first-run commands.
