# HealthBytes Project Governance

You are the guardian of HealthBytes project structure and consistency. Your role is enforcing project-wide rules and ensuring all work aligns with the architecture.

## What is HealthBytes?

**HealthBytes** is a mobile-first e-commerce platform for health-restricted individuals (celiac, diabetes, allergies). It allows users to quickly find products matching their dietary restrictions.

**Dual-stack**:
- **Backend**: FastAPI (Python) REST API
- **Frontend**: React Native (Expo) mobile app
- **Database**: PostgreSQL
- **Authentication**: Clerk OAuth + JWT fallback

**Target**: Fast, reliable product discovery for restricted diets.

---

## 🚫 ABSOLUTE PROHIBITIONS

### Technology Stack (LOCKED)
❌ **Cannot change without explicit approval**:
- Backend framework: **FastAPI** (not Django, not Flask)
- Backend language: **Python 3.14+**
- Backend ORM: **SQLAlchemy 2.x async** (not SQLAlchemy 1.x, not other ORMs)
- Frontend framework: **React Native (Expo)** (not Flutter, not native)
- Frontend language: **TypeScript** (enforced)
- Frontend state: **Zustand** (not Redux, not Recoil, not Context alone)
- Frontend styling: **Gluestack + TailwindCSS (NativeWind)**
- Frontend package manager: **pnpm** (not npm, not yarn)
- Database: **PostgreSQL 14+** (not MySQL, not MongoDB for core data)
- Auth: **Clerk OAuth** (primary), JWT (fallback only)
- Infrastructure: **Docker + docker-compose** (for deployment)
- **Testing**: pytest (backend), Jest (frontend) - NOT alternatives

### Folder Structure (IMMUTABLE)
❌ **Cannot restructure without explicit approval**:

```
HealthBytes-dev/
├─ backend/          ← ALL Python code here
├─ frontend/         ← ALL React Native code here
├─ docs/             ← Documentation
├─ Tools/            ← Scripts and utilities
├─ .github/          ← GitHub configs, skills (THIS FILE)
└─ docker-compose.yml
```

**No new root folders. Period.**

**Subfolder changes**: Cannot rename/move existing directories without approval.

### Critical Configuration Files
❌ **NEVER modify without understanding impact**:

**Backend**:
- `backend/requirements.txt` ← All Python dependencies
- `backend/app/config.py` ← Environment settings, Clerk config
- `backend/app/main.py` ← FastAPI app initialization
- `backend/app/middleware/auth.py` ← Authentication layer
- `.env` ← Secrets (NEVER commit)

**Frontend**:
- `frontend/package.json` ← All npm packages
- `frontend/app.json` ← Expo configuration
- `frontend/app/_layout.tsx` ← Root navigator, Clerk provider
- `frontend/.env` ← API URLs and keys (NEVER commit)

**Project**:
- `docker-compose.yml` ← Currently empty, RESERVED for future infrastructure
- `.cursorrules` ← Guard rails (reference only)
- `.github/skills/` ← Development guidelines (this skill set)

### Dependency Management
❌ **Strict rules**:

**Backend**:
- Use `requirements.txt` ONLY (not poetry, not conda, not pipenv)
- Pass a justification before installing new packages
- Major version upgrades need testing
- Avoid unmaintained packages

**Frontend**:
- Use `pnpm` ONLY (not npm or yarn!)
- Lockfile is managed automatically
- Each new dependency affects bundle size → justify first
- Development dependencies in `devDependencies`

### Testing Requirements
❌ **Must follow these patterns**:

**Backend**:
- All tests use pytest + fixtures (see `backend/tests/conftest.py`)
- ServiceLayer tests go in `test_services/`
- Router tests go in `test_api/`
- Mock AsyncSession for DB tests
- Minimum 70% coverage target

**Frontend**:
- All tests use Jest + React Native Testing Library
- Component tests in `__tests__/`
- Mirror src/ folder structure
- Mock API calls and storage
- Minimum 60% coverage target

### Security Prohibitions
❌ **CRITICAL - Never violate**:

- **NEVER hardcode credentials**: No API keys, passwords, tokens in code
- **NEVER expose sensitive logs**: Don't log tokens, emails, SSNs, medical info
- **NEVER disable security**:
  - Don't bypass CORS without documented reason
  - Don't disable password validation
  - Don't expose health endpoints without auth
- **NEVER use insecure storage**:
  - Frontend: NEVER use `localStorage` for tokens → use `AsyncStorage`
  - Backend: NEVER store plain text passwords → use bcrypt
- **NEVER trust client input**: Always validate on backend
- **NEVER return internal errors**: Return generic messages to frontend
- **NEVER create unguarded endpoints**: Except `/health`, `/docs` (for dev)

---

## 📍 FILE PLACEMENT RULES

### Where Backend Code Goes

**All Python code lives in `backend/app/`**:

```
backend/app/
├─ api/v1/              ← ONLY routers (HTTP endpoints)
│  ├─ __init__.py
│  ├─ auth.py           ← POST /login, POST /register
│  ├─ products.py       ← GET /products, POST /products (admin)
│  ├─ orders.py         ← GET /orders, POST /orders
│  ├─ users.py          ← GET /users/me, PATCH /users/{id}
│  ├─ cart.py           ← GET /cart, POST /cart/items
│  └─ stripe.py         ← Payment webhook endpoints
│
├─ services/            ← ONLY business logic
│  ├─ __init__.py
│  ├─ auth_service.py   ← login(), register(), verify_token()
│  ├─ product_service.py ← search(), filter(), get_by_id()
│  ├─ order_service.py   ← create_order(), get_orders()
│  ├─ user_service.py    ← update_profile(), get_user()
│  └─ cart_service.py    ← add_item(), remove_item()
│
├─ schemas/             ← ONLY Pydantic validation models
│  ├─ __init__.py
│  ├─ product.py        ← ProductIn, ProductOut
│  ├─ order.py          ← OrderIn, OrderOut
│  ├─ user.py           ← UserIn, UserOut
│  └─ cart.py           ← CartItemIn, CartOut
│
├─ db/
│  ├─ models/           ← ONLY SQLAlchemy ORM models
│  │  ├─ __init__.py
│  │  ├─ product.py     ← Product table definition
│  │  ├─ order.py       ← Order table definition
│  │  ├─ user.py        ← User table definition
│  │  ├─ cart.py        ← Cart table definition
│  │  └─ __init__.py    ← Base model export
│  ├─ database.py       ← AsyncSession, engine setup
│  └─ schemas.py        ← Shared enums (OrderStatus, etc)
│
├─ core/
│  ├─ security.py       ← JWT encoding/decoding, bcrypt
│  ├─ exceptions.py     ← ResourceNotFound, UnauthorizedError
│  └─ config.py         ← Pydantic Settings (env vars)
│
├─ middleware/
│  ├─ auth.py           ← Clerk JWT verification, fallback
│  └─ __init__.py
│
├─ main.py              ← FastAPI app, router registration, CORS
└─ __init__.py
```

**Backend tests go in `backend/tests/`**:
```
backend/tests/
├─ conftest.py          ← Fixtures, MockAsyncSession
├─ test_api/            ← Test routers
│  ├─ test_products.py
│  ├─ test_orders.py
│  └─ test_auth.py
├─ test_services/       ← Test business logic
│  ├─ test_product_service.py
│  └─ test_order_service.py
└─ fixtures/            ← Test factories/data
   └─ factory.py
```

---

### Where Frontend Code Goes

**All React code lives in `frontend/`**:

```
frontend/
├─ app/                  ← Screens (Expo Router file-based routing)
│  ├─ _layout.tsx        ← Root layout, Clerk provider, nav stack
│  ├─ index.tsx          ← Home screen (product list)
│  ├─ cart.tsx           ← Shopping cart screen
│  ├─ checkout.tsx       ← Order checkout screen
│  ├─ [id].tsx           ← Product detail (dynamic route)
│  └─ (auth)/            ← Auth group (folder layout)
│     └─ login.tsx       ← Login screen
│
├─ components/           ← Reusable UI components
│  ├─ ui/                ← Gluestack pre-built components
│  ├─ ProductCard.tsx    ← Product display
│  ├─ CartItem.tsx       ← Cart item
│  ├─ Header.tsx         ← Navigation header
│  └─ __tests__/         ← Component tests
│     └─ ProductCard.test.tsx
│
├─ api/                  ← API clients (data fetching)
│  ├─ products.ts        ← Product API calls
│  ├─ orders.ts          ← Order API calls
│  ├─ cart.ts            ← Cart API calls
│  ├─ auth.ts            ← Authentication API calls
│  └─ __tests__/         ← API tests
│     └─ products.test.ts
│
├─ store/               ← Zustand stores (state management)
│  ├─ authStore.ts      ← Auth state, persistence
│  ├─ cartStore.ts      ← Cart state, persistence
│  ├─ userStore.ts      ← User profile
│  └─ __tests__/        ← Store tests
│     └─ cartStore.test.ts
│
├─ types/               ← TypeScript interfaces
│  ├─ index.ts          ← Barrel exports
│  ├─ product.ts        ← Product interfaces
│  ├─ order.ts          ← Order interfaces
│  └─ user.ts           ← User interfaces
│
├─ lib/                 ← Utilities and helpers
│  ├─ constants.ts      ← API base URLs, constants
│  ├─ cache.ts          ← Clerk token caching (AsyncStorage)
│  ├─ validators.ts     ← Input validation
│  ├─ formatters.ts     ← Date, currency formatting
│  └─ __tests__/        ← Utility tests
│     └─ validators.test.ts
│
└─ assets/              ← Static files (images, fonts)
   ├─ images/
   └─ fonts/
```

---

## 🔐 Security Checklist

When implementing ANY feature, ensure:

✅ **Authentication**:
- [ ] User identity is verified (JWT or Clerk)
- [ ] Token expiration is enforced (30 days max)
- [ ] Passwords hashed with bcrypt (10+ rounds)
- [ ] NEVER return token in logs

✅ **Authorization**:
- [ ] Users can only access their own data
- [ ] Ownership validated before returning resources
- [ ] Admin functions gated with role checks
- [ ] API endpoints return 403, not 404 for unauthorized access

✅ **Input Validation**:
- [ ] All inputs validated on backend
- [ ] Pydantic schemas enforce types/ranges
- [ ] File uploads scanned for malware
- [ ] No SQL injection possible (use ORM)

✅ **Data Protection**:
- [ ] Sensitive data never in logs
- [ ] HTTPS enforced (in production)
- [ ] Database credentials in `.env` (never committed)
- [ ] API keys rotated regularly

✅ **Error Handling**:
- [ ] Generic error messages to users
- [ ] Detailed errors in backend logs only
- [ ] No stack traces exposed to frontend
- [ ] Graceful fallbacks for failures

✅ **Testing**:
- [ ] Auth flows tested (valid/invalid tokens)
- [ ] Authorization boundaries tested (403 for forbidden)
- [ ] Input validation tested (edge cases)
- [ ] Error handling tested

---

## 🔄 Decision-Making Framework

When you're unsure about something:

1. **Is it related to backend?** → Check `healthbytes-backend-patterns.md`
2. **Is it related to frontend?** → Check `healthbytes-frontend-patterns.md`
3. **Is it about security?** → Check `healthbytes-security-practices.md`
4. **Is it about project structure?** → Check this file
5. **Is it about dependencies?** → Ask for approval before installing

---

## 📚 Key Reference Files

| Question | File |
|----------|------|
| How should I structure a new service? | [backend/app/services/](../backend/app/services) |
| How should I structure a new component? | [frontend/components/](../frontend/components) |
| What are the Clerk settings? | [backend/app/config.py](../backend/app/config.py) |
| How is auth middleware implemented? | [backend/app/middleware/auth.py](../backend/app/middleware/auth.py) |
| How does Zustand store work? | [frontend/store/cartStore.ts](../frontend/store/cartStore.ts) |
| How do API calls work? | [frontend/api/products.ts](../frontend/api/products.ts) |
| How do I write backend tests? | [backend/tests/conftest.py](../backend/tests/conftest.py) |
| How do I test components? | [frontend/jest.config.js](../frontend/jest.config.js) |

