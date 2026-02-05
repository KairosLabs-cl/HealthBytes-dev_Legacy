# HealthBytes AI Agent Instructions

> **📚 Documentation Map**: This file provides the "big picture" architecture and workflows. For detailed rules:
> - **Backend patterns & security**: [backend/AI-README.md](../backend/AI-README.md)
> - **Frontend patterns & UX**: [frontend/AI-README.md](../frontend/AI-README.md)  
> - **Strict prohibitions & file placement**: [.cursorrules](../.cursorrules)

## Project Overview
HealthBytes is a mobile-first e-commerce platform for health-restricted individuals. **Dual-stack architecture**: FastAPI backend + React Native (Expo) frontend, targeting people with dietary restrictions (celiac, diabetes, allergies).

## Project Structure

```
HealthBytes-dev/
├── backend/               # FastAPI REST API
│   ├── app/
│   │   ├── api/v1/       # HTTP routers (endpoints only, no business logic)
│   │   │   ├── auth.py   # Login, register
│   │   │   ├── products.py  # Product CRUD with search
│   │   │   ├── orders.py    # Order management
│   │   │   ├── users.py     # User endpoints
│   │   │   └── cart.py      # Shopping cart endpoints
│   │   ├── services/     # Business logic layer
│   │   │   ├── product_service.py
│   │   │   ├── order_service.py
│   │   │   ├── user_service.py
│   │   │   ├── auth_service.py
│   │   │   └── cart_service.py
│   │   ├── schemas/      # Pydantic request/response models
│   │   │   ├── product.py
│   │   │   ├── order.py
│   │   │   └── user.py
│   │   ├── db/
│   │   │   ├── models/   # SQLAlchemy ORM
│   │   │   ├── database.py  # DB connection & session
│   │   │   └── schemas.py   # Shared enums
│   │   ├── core/
│   │   │   ├── security.py   # JWT, bcrypt hashing
│   │   │   └── exceptions.py # Custom exceptions
│   │   ├── middleware/
│   │   │   └── auth.py       # Clerk + JWT verification
│   │   ├── config.py     # Settings from .env
│   │   └── main.py       # FastAPI app entry point
│   ├── tests/
│   │   ├── conftest.py   # Fixtures, MockAsyncSession
│   │   ├── test_api/     # Endpoint tests
│   │   └── test_services/  # Business logic tests
│   ├── migrations/       # Database migrations
│   ├── start.ps1         # Windows dev server launcher
│   ├── start.sh          # Unix dev server launcher
│   ├── run_server.py     # FastAPI server runner
│   ├── README.md         # Backend documentation
│   ├── AI-README.md      # IA developer guidelines
│   └── requirements.txt  # Python dependencies
│
├── frontend/              # React Native (Expo) mobile app
│   ├── app/              # Screens (Expo Router file-based routing)
│   │   ├── _layout.tsx   # Root layout, Clerk provider
│   │   ├── index.tsx     # Home/product list
│   │   ├── cart.tsx      # Shopping cart
│   │   ├── checkout.tsx  # Order checkout
│   │   ├── (auth)/login.tsx  # Auth group
│   │   └── product/[id].tsx  # Dynamic product detail
│   ├── components/       # Reusable UI components
│   │   ├── ui/           # Gluestack UI pre-built components
│   │   ├── ProductListItem.tsx
│   │   └── Header.tsx
│   ├── api/              # HTTP client functions (fetch wrappers)
│   │   ├── products.ts
│   │   ├── orders.ts
│   │   ├── cart.ts
│   │   └── auth.ts
│   ├── store/            # Zustand state management
│   │   ├── cartStore.ts
│   │   └── authStore.ts
│   ├── lib/
│   │   └── cache.ts      # Clerk token caching (AsyncStorage)
│   ├── types/
│   │   └── product.ts    # TypeScript interfaces
│   ├── README.md         # Frontend documentation
│   ├── AI-README.md      # IA developer guidelines
│   ├── setup-env.ps1     # Environment setup script
│   └── package.json      # pnpm dependencies
│
├── docs/
│   ├── README.md         # Documentation index
│   ├── IMPLEMENTATION_SUMMARY.md     # Full-text search implementation
│   ├── SECURITY.md       # Security improvements & headers
│   ├── copilot-logs/     # AI session documentation
│   │   ├── README.md     # Copilot logs index
│   │   ├── status-logs/  # Project state tracking
│   │   ├── auth-logs/    # Authentication debugging
│   │   ├── security-improvements-logs/
│   │   └── ...
│   ├── frontend/
│   │   └── SETUP.md      # Frontend setup guide
│   ├── search-logs/      # Full-text search documentation
│   └── diagramas/        # Architecture diagrams
│
├── Tools/
│   ├── README.md         # Tools index
│   ├── backend/
│   │   ├── setup/        # Server startup documentation
│   │   ├── database/     # DB migrations & management
│   │   │   ├── run_migration.py
│   │   │   ├── recreate_db.py
│   │   │   └── create_cart_table.py
│   │   ├── seeding/      # Database population
│   │   │   ├── seed_products.py
│   │   │   ├── seed_simple.sql
│   │   │   └── README.md
│   │   └── testing/      # Test utilities (reserved)
│   └── frontend/
│       └── testing/      # Frontend test utilities (reserved)
│
├── .cursorrules          # Strict rules & prohibitions
├── .github/
│   └── copilot-instructions.md  # This file
├── README.md             # Project overview
└── docker-compose.yml    # Docker orchestration (empty, reserved for future)

## Critical Architecture Patterns

### Backend: Strict Layer Separation
```
api/v1/routers → services → db/models
     ↓              ↓           ↓
  HTTP only    Business logic  DB entities
```

**Enforce these rules**:
- Routers (`api/v1/*.py`) ONLY handle HTTP: parse requests, call services, return responses
- Services (`services/*`) contain ALL business logic (queries, validations, calculations)
- Models (`db/models/*`) are pure SQLAlchemy ORM (no business methods)
- NEVER import `db.models` in routers—use services as the interface

**Example violation**:
```python
# ❌ WRONG: Direct DB query in router
@router.get("/products")
async def list_products(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Product))  # Business logic in router!
    return result.scalars().all()
```

**Correct pattern**:
```python
# ✅ Router delegates to service
@router.get("/products")
async def list_products(db: AsyncSession = Depends(get_db)):
    return await product_service.list_products(db)

# services/product_service.py
async def list_products(db: AsyncSession) -> List[Product]:
    result = await db.execute(select(Product))
    return result.scalars().all()
```

### Frontend: Clean Component Architecture
- Components (`components/*`) are presentational—props in, JSX out
- API calls ONLY in `api/*.ts` modules (never in components)
- State management via Zustand stores (`store/*Store.ts`)
- Use `AsyncStorage` for persistence, NEVER `localStorage`

**Example**: Cart logic lives in `store/cartStore.ts`, components call `useCart()` hook

### Authentication: Dual System in Transition
- **Legacy**: JWT with `your-secret` key (HS256), 30-day expiration
- **Current**: Clerk OAuth with JWKS verification (RS256)
- Middleware (`middleware/auth.py`) tries Clerk first, falls back to JWT in dev mode
- Frontend uses `@clerk/clerk-expo` with `tokenCache` in `lib/cache.ts`

## Developer Workflows

### Start Backend (Windows)
```powershell
cd backend
.\start.ps1          # Creates venv, installs deps, runs uvicorn
.\start.ps1 -NoInstall  # Skip pip install (faster restarts)
```
**Critical**: Uses PowerShell script to manage virtual environment and hot reload. Do NOT use `python run_server.py` directly—it lacks dependency checks.

### Start Frontend
```bash
cd frontend
pnpm install  # MUST use pnpm, NOT npm/yarn
pnpm start
```
Expo dev server runs on port 8081, connects to backend at `http://127.0.0.1:3001`

### Running Tests
```bash
cd backend
pytest                    # Run all tests with coverage
pytest tests/test_api/    # Specific test folder
pytest -m auth            # Run tests marked with @pytest.mark.auth
```
**Note**: Tests use SQLite in-memory DB (see `conftest.py`), not PostgreSQL. Mock async sessions with `MockAsyncSession` wrapper.

### Environment Setup
Backend requires `.env` in `backend/` with:
```
***REDACTED_DATABASE_URL***
JWT_SECRET=your-secret
CLERK_PUBLISHABLE_KEY=pk_test_...
***REDACTED_CLERK_SECRET_KEY***
```
Frontend requires `.env` in `frontend/` with:
```
EXPO_PUBLIC_API_URL=http://127.0.0.1:3001
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
```

## Project-Specific Conventions

### Naming
- Python: `snake_case` for functions/variables, `PascalCase` for classes
- TypeScript: `camelCase` for variables/functions, `PascalCase` for components/types
- Files: `snake_case.py` backend, `PascalCase.tsx` components, `camelCase.ts` utilities

### Error Handling
Backend uses custom exceptions (`core/exceptions.py`) + FastAPI `HTTPException`:
```python
# Return 400 for validation errors, 404 for not found, 500 for unexpected
raise HTTPException(status_code=404, detail={"message": "Product not found"})
```
Frontend shows errors via `@gluestack-ui/toast` (already configured in `_layout.tsx`)

### Database Patterns
- SQLAlchemy 2.x async style with `AsyncSession`
- Migrations are **planned but not implemented**—manual schema changes for now
- Models inherit from `Base` in `db/database.py`
- Use `select(Model)` not `Model.query` (SQLAlchemy 2.x pattern)

### Styling (Frontend)
- Gluestack UI components from `components/ui/*` (pre-built with NativeWind)
- Use `className` prop for Tailwind: `className="bg-blue-500 p-4"`
- Global styles in `global.css`, theme config in `gluestack-ui.config.json`

## Integration Points

### API Communication
- Backend exposes REST endpoints at `/api/v1/*` (see `main.py` router includes)
- CORS allows `localhost:8081` (Expo dev server) + local network IPs
- Frontend uses environment variable `EXPO_PUBLIC_API_URL` for base URL
- No GraphQL, no WebSockets—simple REST with JSON

### External Dependencies
- **Clerk**: OAuth provider, JWKS endpoint at `https://{frontend-api}/.well-known/jwks.json`
- **Stripe**: Payment processing (routes in `api/v1/stripe.py`, not fully implemented)
- **PostgreSQL**: Production database (SQLite for tests)

## Key Files to Reference

### Backend
- [backend/app/main.py](../backend/app/main.py): FastAPI app, middleware, router registration
- [backend/app/config.py](../backend/app/config.py): Environment settings, Clerk JWKS URL generation
- [backend/app/middleware/auth.py](../backend/app/middleware/auth.py): Authentication logic (Clerk + JWT)
- [backend/tests/conftest.py](../backend/tests/conftest.py): Test fixtures, MockAsyncSession

### Frontend  
- [frontend/app/_layout.tsx](../frontend/app/_layout.tsx): Root layout, Clerk provider, navigation
- [frontend/store/cartStore.ts](../frontend/store/cartStore.ts): Cart state management pattern
- [frontend/api/products.ts](../frontend/api/products.ts): API client pattern
- [frontend/lib/cache.ts](../frontend/lib/cache.ts): Token caching for Clerk

## What NOT to Do
- Don't add dependencies without asking (check bundle size, necessity)
- Don't modify `docker-compose.yml` (currently empty, reserved for future use)
- Don't use `localStorage` in React Native (use `AsyncStorage`)
- Don't mix authentication systems (respect Clerk-first, JWT-fallback order)
- Don't create services folder without populating it (currently empty—add when extracting logic from routers)
- Don't use `npm` or `yarn` for frontend (pnpm enforced via lockfile)

## Common Gotchas
- **Port conflicts**: Backend is 3001, frontend is 8081—don't change without updating CORS
- **Virtual environment**: Backend `start.ps1` manages it; manual activation can break paths
- **Clerk keys**: `CLERK_PUBLISHABLE_KEY` has embedded frontend API (base64 encoded after last `_`)
- **Type mismatches**: Backend uses `int` for IDs, frontend sometimes expects `string`—coerce carefully
- **Async patterns**: Backend is fully async (`async def`, `await`), don't mix sync DB calls

## Status & Roadmap
- ✅ Core CRUD endpoints (products, orders, users)
- ✅ Authentication (Clerk + JWT fallback)
- ⚠️ Testing at ~40% coverage (see `docs/copilot-logs/test-logs/`)
- ⚠️ Services layer empty—business logic currently in routers (tech debt)
- 📝 Planned: Docker containerization, AWS deployment, payment flow completion

## Where to Find What

| Need to know... | Check file... |
|---|---|
| How to structure backend code | [backend/AI-README.md](../backend/AI-README.md) |
| Frontend UX patterns | [frontend/AI-README.md](../frontend/AI-README.md) |
| What's absolutely forbidden | [.cursorrules](../.cursorrules) |
| Where to place new files | [.cursorrules](../.cursorrules) (lines 25-150) |
| Authentication flow | [backend/app/middleware/auth.py](../backend/app/middleware/auth.py) |
| API client patterns | [frontend/api/products.ts](../frontend/api/products.ts) |
| State management examples | [frontend/store/cartStore.ts](../frontend/store/cartStore.ts) |
| Test setup & fixtures | [backend/tests/conftest.py](../backend/tests/conftest.py) |
| Environment variables | [backend/app/config.py](../backend/app/config.py) |
