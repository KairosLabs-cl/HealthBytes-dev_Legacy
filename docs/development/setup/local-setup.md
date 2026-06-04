# Local Development Setup

Guide for new HealthBytes developers to run backend and frontend locally in under 30 minutes.

## Goal

By the end:

- Backend runs at `http://localhost:3001`.
- Swagger opens at `http://localhost:3001/docs`.
- Frontend runs in Expo Go or web through Expo on port `8081`.
- Frontend can call backend through `EXPO_PUBLIC_API_URL`.

## Prerequisites

Install these before starting:

| Tool | Required | Check |
| --- | --- | --- |
| GitHub CLI | Repo clone access | `gh --version` |
| Docker Desktop | Postgres and Redis local services | `docker --version` |
| Python | `backend/.python-version` currently requires `3.13.1` | `python3 --version` |
| Node.js | `>=20.18.0` | `node --version` |
| pnpm | Frontend package manager | `pnpm --version` |
| Expo Go | Physical phone testing | Install from App Store or Google Play |

Recommended version managers:

- Python: `pyenv` or `mise`.
- Node.js: `fnm` or `nvm`.

## 1. Clone

```bash
gh repo clone nojustbenja/HealthBytes-dev
cd HealthBytes-dev
```

## 2. Start Local Services

Use Docker for Postgres. Redis is optional for local product cache and rate-limit storage, but running it keeps local behavior closer to production.

```bash
read -r -s -p "Postgres password for local dev: " HB_DB_PASSWORD
echo

docker run --name healthbytes-postgres \
  -e POSTGRES_USER=healthbytes \
  -e POSTGRES_PASSWORD="$HB_DB_PASSWORD" \
  -e POSTGRES_DB=healthbytes \
  -p 5432:5432 \
  -d postgres:16
```

Optional Redis:

```bash
read -r -s -p "Redis password for local dev: " HB_REDIS_PASSWORD
echo

docker run --name healthbytes-redis \
  -p 6379:6379 \
  -d redis:7-alpine \
  redis-server --requirepass "$HB_REDIS_PASSWORD"
```

If containers already exist:

```bash
docker start healthbytes-postgres
docker start healthbytes-redis
```

## 3. Setup Backend

Create `backend/.env` from the example:

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env`:

```env
DATABASE_URL=postgresql://healthbytes:<HB_DB_PASSWORD>@localhost:5432/healthbytes
JWT_SECRET=<generate-with-python-secrets-token-hex-32>
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=43200
ENVIRONMENT=dev
HOST=0.0.0.0
PORT=3001

# Required for Clerk-authenticated flows.
CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Optional for local cache/rate-limit parity.
REDIS_URL=redis://:<HB_REDIS_PASSWORD>@localhost:6379/0
```

Generate a local JWT secret:

```bash
python3 -c "import secrets; print(secrets.token_hex(32))"
```

Install dependencies, apply migrations, and start the backend:

```bash
cd backend
./start.sh
```

`backend/start.sh` creates `.venv`, installs `requirements.txt`, runs `alembic upgrade head`, and starts `python run_server.py`.

Backend success check:

```bash
curl http://localhost:3001/health
```

Expected:

```json
{"status":"healthy","service":"HealthBytes API"}
```

Open Swagger:

```text
http://localhost:3001/docs
```

## 4. Setup Frontend

Install dependencies:

```bash
cd frontend
pnpm install
```

Create `frontend/.env`:

```bash
./setup-env.sh
```

Choose:

- `1` for browser-only development.
- `2` for Expo Go on a physical phone.
- `3` for both web and Expo Go. This is recommended for Andres.

When prompted, paste `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` from the team Clerk project. It must start with `pk_`.

Start Expo:

```bash
pnpm start
```

Expo Go phone check:

- Phone and laptop must be on the same WiFi.
- Android: scan the QR code with Expo Go.
- iOS: scan the QR code with the Camera app.
- Home screen should load and API-backed UI should not show network errors.

Web check:

```bash
pnpm web
```

Then open the URL printed by Expo, usually `http://localhost:8081`.

## 5. Windows Notes

Use the PowerShell scripts:

```powershell
cd backend
.\start.ps1

cd ..\frontend
.\setup-env.ps1
pnpm start
```

If PowerShell blocks script execution:

```powershell
powershell -ExecutionPolicy Bypass -File .\setup-env.ps1
```

## Troubleshooting

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| `Missing Clerk Publishable Key` | `frontend/.env` missing or key does not start with `pk_` | Run `cd frontend && ./setup-env.sh` |
| Expo Go cannot reach backend | `EXPO_PUBLIC_API_URL` uses `localhost` from phone | Rerun `./setup-env.sh` and choose option `2` or `3` |
| Backend cannot connect to Postgres | Docker container stopped or `DATABASE_URL` password mismatch | Run `docker start healthbytes-postgres` and verify `backend/.env` |
| `alembic upgrade head` cannot import settings | Backend virtualenv not active or `.env` missing | Run `cd backend && ./start.sh`, then activate `.venv` |
| Port `5432`, `3001`, or `8081` busy | Another service is already running | Stop old service or change local port and matching `.env` |
| Physical phone still cannot connect | WiFi isolation or firewall blocks laptop | Use same network, disable VPN temporarily, or test with Expo web |

## Secret Handling

- Never commit `.env`.
- Never paste real Clerk secret keys, Mercado Pago tokens, Resend keys, or passwords into docs.
- Clerk publishable keys are public client keys, but keep project-specific values in local `.env`, not scripts.
- Ask the team lead for Clerk/Mercado Pago/Resend access instead of copying values from another developer's machine.

## Done Checklist

- Backend health returns `healthy`.
- Swagger opens at `http://localhost:3001/docs`.
- Frontend starts with `pnpm start`.
- Expo Go opens the app by QR on the same WiFi.
- `frontend/.env` points to `http://<your-local-ip>:3001` when testing on a phone.
