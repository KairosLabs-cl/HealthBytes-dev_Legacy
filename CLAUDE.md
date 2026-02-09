# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

HealthBytes is a mobile-first e-commerce platform for health-restricted individuals (celiac disease, diabetes, allergies). Dual-stack monorepo: FastAPI backend + React Native (Expo) frontend.

## Commands

### Backend (from `backend/`)
```bash
# Dev server (Windows) - manages venv and deps automatically
.\start.ps1
.\start.ps1 -NoInstall     # Skip pip install for faster restarts

# Dev server (Unix)
./start.sh

# Tests
pytest                              # All tests with coverage (min 70%)
pytest tests/test_api/              # API endpoint tests only
pytest tests/test_services/         # Service logic tests only
pytest tests/test_api/test_products.py  # Single test file
pytest -v -m "not slow"            # Skip slow tests
pytest -m auth                     # Only auth-related tests

# Linting & formatting
pre-commit run --all-files          # All hooks (Black, isort, Flake8, Bandit)
black app/ --line-length 100        # Format
isort app/                          # Sort imports (profile=black)
flake8 app/                         # Lint
bandit -r app/                      # Security scan
```

### Frontend (from `frontend/`)
```bash
# MUST use pnpm, never npm or yarn
pnpm install
pnpm start                 # Expo dev server (port 8081)
pnpm start --clear         # Clear cache & restart
pnpm ios / pnpm android / pnpm web

# Tests & quality
pnpm test                  # Jest
pnpm test:watch            # Watch mode
pnpm test:coverage         # Coverage report
pnpm type-check            # TypeScript (tsc --noEmit)
pnpm lint                  # ESLint
pnpm lint:fix              # Auto-fix
pnpm format                # Prettier
```

## Architecture

### Backend (`backend/app/`)

Strict three-layer separation — never mix responsibilities:

```
api/v1/ (routers)  →  services/  →  db/models/
  HTTP only            ALL logic      ORM only
```

- **Routers** (`api/v1/*.py`): Parse requests, call services, return responses. NEVER contain business logic or import db/models directly.
- **Services** (`services/*_service.py`): ALL business logic — queries, validations, calculations. Only layer that touches the DB.
- **Schemas** (`schemas/*.py`): Pydantic v2 request/response DTOs with `model_config = {"from_attributes": True}`.
- **Models** (`db/models/*.py`): Pure SQLAlchemy 2.x async ORM. No business methods.
- **Core** (`core/`): `security.py` (JWT/bcrypt), `exceptions.py` (custom exceptions).
- **Middleware** (`middleware/auth.py`): Clerk JWKS verification first, JWT fallback in dev.
- **Config** (`config.py`): Pydantic BaseSettings loading from `.env`.
- **Entry point**: `main.py` — do not modify without reason.

Database: PostgreSQL 14+ via async SQLAlchemy 2.x (`AsyncSession`). Use `select(Model)` style, not `Model.query`. Tests use SQLite in-memory (see `tests/conftest.py` for `MockAsyncSession`).

Backend runs on port **3001**. Swagger UI at `/docs`.

### Frontend (`frontend/`)

```
app/         → Screens (Expo Router file-based routing)
components/  → Presentational UI (props in, JSX out)
api/         → HTTP client functions (fetch wrappers, NEVER in components)
store/       → Zustand state management (*Store.ts)
types/       → TypeScript interfaces
lib/         → Utilities (token caching, formatters)
```

- **Auth**: Clerk (`@clerk/clerk-expo`) with `tokenCache` in `lib/cache.ts`. Tokens stored via `expo-secure-store` / AsyncStorage — NEVER localStorage.
- **UI**: Gluestack UI + NativeWind (TailwindCSS) via `className` prop.
- **State**: Zustand for global state (auth, cart). Use `useState` only for local UI state (modals, loaders).
- **API calls**: ONLY in `api/*.ts` modules. Components never call `fetch` directly.
- **Data fetching**: React Query (`@tanstack/react-query`) for server state caching.

Frontend Expo dev server on port **8081**, connects to backend via `EXPO_PUBLIC_API_URL`.

### Tools Utilities (`Tools/`)

Scripts organized by target: `Tools/backend/{category}/` and `Tools/frontend/{category}/`. Entry-point scripts (start.ps1, setup-env.ps1) stay in their respective root dirs (`backend/`, `frontend/`).

## Key Conventions

### Code Style
- **Python**: snake_case, async/await for all I/O, type hints required, Black line-length 100, use `logging` not `print()`
- **TypeScript**: No `any` types ever. PascalCase for components/interfaces, camelCase for functions/variables. `async/await` not `.then()`. Named exports preferred.
- **Commits**: Conventional Commits format — `tipo(scope): description` (types: feat, fix, docs, refactor, test, chore, perf)
- **Branches**: `tipo/descripcion-corta` (e.g., `feat/product-filters`, `fix/price-validation`)

### Prohibitions
- Never put business logic in routers (backend) or components (frontend)
- Never import `db.models` in `api/v1/` — use services
- Never hardcode API URLs, credentials, or tokens
- Never use `npm` or `yarn` for frontend — pnpm only
- Never modify `main.py`, `config.py`, `requirements.txt`, `package.json`, or `docker-compose.yml` without justification
- Never create new root-level folders (keep: backend, frontend, docs, Tools)
- Never trust client-provided prices — always fetch from DB
- Never install new dependencies without justification

### Environment Variables
Backend `.env` (from `.env.example`): `DATABASE_URL`, `JWT_SECRET`, `CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`
Frontend `.env` (from `.env.example`): `EXPO_PUBLIC_API_URL`, `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`

### Adding New Features

**Backend flow**: Schema (schemas/) → Model (db/models/) → Service (services/) → Router (api/v1/) → Tests (tests/)

**Frontend flow**: Types (types/) → API client (api/) → Store if needed (store/) → Component (components/) → Screen (app/)

### Testing Notes
- Backend tests use SQLite in-memory, not PostgreSQL. Test markers: `slow`, `auth`, `admin`, `integration`.
- Frontend uses Jest + React Native Testing Library.
- Coverage minimum: 70% (enforced in pyproject.toml).

### Gotchas
- Backend port 3001, frontend port 8081 — changing either requires CORS update in `main.py`
- Backend is fully async — never mix sync DB calls
- Type ID mismatch: backend uses `int` IDs, frontend sometimes expects `string` — coerce carefully
- `start.ps1` manages the venv — using `python run_server.py` directly skips dependency checks
- Clerk publishable key contains the frontend API URL (base64 after last `_`)

## Documentation Structure

Documentation lives in `docs/` organized by category: `setup/`, `architecture/`, `features/`, `security/`, `development/`, `ai-logs/`. Canonical project status files are in `docs/ai-logs/status/` (ARQUITECTURA.md, ESTADO.md, PLAN_DE_ACCION.md, RESUMEN_EJECUTIVO.md). Do not create documentation files without explicit request.
