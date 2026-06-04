# Codebase Structure

**Analysis Date:** 2026-04-13

## Directory Layout

```
HealthBytes-dev/
├── .agents/                    # Agent skills and configurations
├── .github/                    # GitHub workflows and copilot instructions
├── docs/                  # Planning artifacts (roadmaps, specs)
│   └── codebase/              # Codebase mapping documents (THIS DIRECTORY)
├── .claude/                   # Claude-specific configurations
│
├── 📱 frontend/                # React Native + Expo application
│   ├── app/                  # File-based routing (Expo Router)
│   ├── components/           # Reusable UI components
│   ├── hooks/               # Custom React hooks
│   ├── store/               # Zustand state stores
│   ├── api/                 # API client functions
│   ├── lib/                 # Utilities and helpers
│   ├── types/               # TypeScript type definitions
│   └── assets/              # Fonts, images, static assets
│
├── ⚙️ backend/                # FastAPI Python application
│   ├── app/                # Main application package
│   │   ├── api/           # API route handlers
│   │   │   └── v1/       # Versioned API routes
│   │   ├── services/      # Business logic layer
│   │   ├── db/           # Database models and connections
│   │   ├── schemas/      # Pydantic schemas
│   │   ├── core/         # Security, config, utilities
│   │   └── middleware/   # Request middleware
│   ├── tests/            # Backend tests
│   └── requirements.txt   # Python dependencies
│
├── 📚 docs/                  # Project documentation
│   ├── architecture/      # Architecture decisions
│   ├── backend/           # Backend docs
│   ├── frontend/          # Frontend docs
│   ├── development/       # Development guides, status
│   ├── features/          # Feature documentation
│   ├── security/          # Security documentation
│   └── setup/             # Setup guides
│
├── 🛠️ tools/                  # Development tools and scripts
│   ├── backend/           # Backend utilities
│   └── ops/              # Operations scripts
│
├── 📮 postman/             # Postman API collections
│
├── infra/                   # Infrastructure as code
│
└── [config files]          # Root-level configurations
```

## Frontend Structure (`frontend/`)

### Entry Points

| File | Purpose |
|------|---------|
| `frontend/package.json` | Dependencies, scripts (main: "expo-router/entry") |
| `frontend/app/_layout.tsx` | Root layout with providers |
| `frontend/app/index.tsx` | Home screen (/) |

### `frontend/app/` - Screen Routes

**File-based routing via Expo Router.** Each `.tsx` file is a route.

```
frontend/app/
├── _layout.tsx              # Root layout (Clerk, QueryClient, NavBar)
├── index.tsx                # Home (/)
├── (auth)/                  # Auth route group
│   └── _layout.tsx          # Auth screens layout
├── search.tsx               # Search (/search)
├── cart.tsx                # Cart (/cart)
├── checkout-v2.tsx          # Checkout (/checkout-v2)
├── orders.tsx               # Order history (/orders)
├── profile.tsx              # User profile (/profile)
├── addresses.tsx             # Address management (/addresses)
├── wishlist.tsx             # Wishlist (/wishlist)
├── recently-viewed.tsx      # Recently viewed (/recently-viewed)
├── dietary-preferences.tsx  # Diet preferences (/dietary-preferences)
├── messages.tsx              # Messages (/messages)
├── security.tsx             # Security settings (/security)
├── support.tsx              # Support (/support)
├── payments.tsx             # Payment methods (/payments)
├── all-products.tsx         # All products (/all-products)
├── product/                # Product detail route group
│   └── [id].tsx             # Product detail (/product/:id)
├── orders/                 # Order detail route group
│   └── [id].tsx             # Order detail (/orders/:id)
├── payment/                # Payment route group
│   └── success.tsx          # Payment success (/payment/success)
└── __tests__/              # App-level tests
```

### `frontend/components/` - UI Components

```
frontend/components/
├── AuthGate.tsx              # Route protection wrapper
├── CartFlyOverlay.tsx        # Animated cart fly-out
├── CartItem.tsx              # Cart item row
├── DietaryBadge.tsx          # Dietary tag badge
├── DietaryFilterBar.tsx      # Filter by dietary tags
├── ErrorBoundary.tsx         # React error boundary
├── FavoriteButton.tsx         # Heart/favorite toggle
├── FavoritesBar.tsx          # Favorites horizontal scroll
├── Header.tsx                # App header
├── HomeSkeleton.tsx          # Home loading skeleton
├── OnboardingModal.tsx       # First-time user onboarding
├── OrderItemRow.tsx          # Order item in list
├── OrderListItem.tsx         # Order card
├── PaymentMethodSelector.tsx # Payment method picker
├── ProductCard.tsx           # Product card component
├── ProductCardSkeleton.tsx   # Product loading skeleton
├── ProductListItem.tsx       # List variant of product
├── RatingStars.tsx           # Star rating display
├── RecentlyViewedBar.tsx     # Recently viewed horizontal
├── ReviewCard.tsx            # Product review card
├── ReviewModal.tsx          # Add review modal
├── StepIndicator.tsx        # Checkout progress indicator
├── StockBadge.tsx            # Stock availability badge
├── WishlistTableRow.tsx      # Wishlist table row
├── ui/                       # UI primitives (Gluestack-based)
│   ├── NavBar/              # Bottom navigation bar
│   ├── button/              # Button component
│   ├── input/               # Input component
│   ├── toast/               # Toast notifications
│   ├── gluestack-ui-provider/  # Gluestack theme provider
│   └── [more primitives]    # Other UI components
└── __tests__/               # Component tests
```

### `frontend/store/` - Zustand Stores

| Store | File | Purpose |
|-------|------|---------|
| Cart | `cartStore.ts` | Cart items, totals, sync with server |
| Auth | `authStore.ts` | Authentication state |
| Favorites | `favoritesStore.ts` | Wishlist items |
| Orders | `orderStore.ts` | Order history and current order |
| Preferences | `preferencesStore.ts` | User dietary preferences, onboarding |
| Address | `addressStore.ts` | User addresses |
| Product Filters | `productFiltersStore.ts` | Active product filters |
| Recently Viewed | `recentlyViewedStore.ts` | Recently viewed products |
| Cart Animation | `cartAnimationStore.ts` | Cart fly animation state |
| Recommendations | `useRecommendationsStore.ts` | Product recommendations |

### `frontend/api/` - API Client Functions

| File | Endpoints | Purpose |
|------|-----------|---------|
| `products.ts` | GET /products, /products/featured, /products/:id | Product queries |
| `orders.ts` | GET/POST /orders, GET /orders/:id | Order management |
| `cart.ts` | GET/POST/PUT /cart | Cart operations |
| `addresses.ts` | GET/POST/PUT/DELETE /addresses | Address CRUD |
| `favorites.ts` | GET/POST/DELETE /favorites | Wishlist operations |
| `auth.ts` | POST /auth/login, /auth/register | Auth endpoints |
| `mercadopago.ts` | POST /mercadopago/preference, /webhook | Payment |
| `preferences.ts` | GET/PUT /users/me/preferences | User preferences |

### `frontend/lib/` - Utilities

| File | Purpose |
|------|---------|
| `authHeaders.ts` | Build auth headers for requests |
| `apiError.ts` | API error parsing and formatting |
| `cache.ts` | Token caching for Clerk |
| `fonts.ts` | Font loading hook |
| `theme.ts` | Theme configuration |
| `formatPrice.ts` | Price formatting utility |

### `frontend/hooks/` - Custom Hooks

| File | Purpose |
|------|---------|
| `useOrderProductDetails.ts` | Fetch product details for orders |
| `usePushNotifications.ts` | Push notification setup |
| `useReducedMotion.ts` | Accessibility: reduced motion preference |

### `frontend/assets/` - Static Assets

```
frontend/assets/
└── fonts/                  # Custom fonts (Inter, etc.)
```

## Backend Structure (`backend/`)

### Entry Points

| File | Purpose |
|------|---------|
| `backend/app/main.py` | FastAPI application factory |
| `backend/app/config.py` | Pydantic Settings |
| `backend/requirements.txt` | Python dependencies |
| `backend/run_server.py` | Server startup script |

### `backend/app/api/v1/` - API Routes

| Route | File | Endpoints |
|-------|------|-----------|
| Products | `products.py` | GET /products, GET /products/:id, POST/PUT/DELETE |
| Orders | `orders.py` | GET/POST /orders, GET/PUT /orders/:id |
| Cart | `cart.py` | GET/POST/PUT /cart |
| Users | `users.py` | GET/PUT /users/me, /users/me/preferences |
| Auth | `auth.py` | POST /auth/login, /auth/register, /auth/refresh |
| Addresses | `addresses.py` | CRUD /addresses |
| Favorites | `favorites.py` | GET/POST/DELETE /favorites |
| Mercado Pago | `mercadopago.py` | POST /preference, POST /webhook |
| Stock | `stock.py` | GET /stock/:product_id |

### `backend/app/services/` - Business Logic

| Service | File | Purpose |
|---------|------|---------|
| Products | `product_service.py` | Product CRUD, caching, search |
| Orders | `order_service.py` | Order creation, status updates |
| Cart | `cart_service.py` | Cart item management |
| Payments | `payment_service.py` | Payment processing |
| Mercado Pago | `mercadopago_service.py` | Payment preference, webhooks |
| Email | `email_service.py` | Transactional emails (Resend) |
| Auth | `auth_service.py` | JWT, Clerk integration |
| Stock | `stock_service.py` | Stock checking with atomic locking |
| Users | `user_service.py` | User profile management |
| Addresses | `address_service.py` | Address CRUD |
| Favorites | `favorite_service.py` | Wishlist management |
| Reviews | `review_service.py` | Product reviews |
| Notifications | `notification_service.py` | Push notifications |

### `backend/app/db/` - Database Layer

```
backend/app/db/
├── database.py           # Connection, session, get_db dependency
├── schemas.py            # SQLAlchemy ORM models (Product, User, Order, etc.)
└── models/              # Additional Pydantic models
    ├── __init__.py      # Empty (prevents circular imports)
    ├── address.py       # Address Pydantic models
    ├── order.py         # Order Pydantic models
    ├── payment.py       # Payment Pydantic models
    ├── product.py       # Product Pydantic models
    └── user.py          # User Pydantic models
```

### `backend/app/core/` - Core Utilities

| File | Purpose |
|------|---------|
| `security.py` | Password hashing, JWT creation/validation |
| `auth.py` | Auth utilities |

### `backend/app/middleware/` - Middleware

| File | Purpose |
|------|---------|
| `auth.py` | `get_current_user()`, `verify_seller()` |
| (limiter) | Rate limiting via slowapi |

### `backend/app/schemas/` - Pydantic Schemas

Request/response validation models:
- `product.py`, `user.py`, `order.py`, `address.py`, `review.py`, etc.

## Key File Locations

### Configuration

| Purpose | File |
|---------|------|
| Frontend dependencies | `frontend/package.json` |
| Backend dependencies | `backend/requirements.txt` |
| TypeScript config | `frontend/tsconfig.json` |
| ESLint config | `frontend/.eslintrc.js` |
| Prettier config | `frontend/.prettierrc` |
| Babel config | `frontend/babel.config.js` |
| Expo config | `frontend/app.json` / `frontend/芭樂.config.ts` |

### Testing

| Purpose | Location |
|---------|----------|
| Backend tests | `backend/tests/` |
| Frontend tests | `frontend/__tests__/`, `frontend/app/__tests__/` |
| Jest config | `frontend/jest.config.js` |
| Pytest config | `backend/pyproject.toml` |

## Naming Conventions

### Files

**Backend (Python):**
- Routes: `snake_case.py` (e.g., `user_preferences.py`)
- Services: `snake_case_service.py`
- Models: `snake_case.py`
- Schemas: `snake_case.py`

**Frontend (TypeScript/React):**
- Components: `PascalCase.tsx`
- Stores: `camelCaseStore.ts`
- Hooks: `useCamelCase.ts`
- Utils: `camelCase.ts`
- API clients: `camelCase.ts`

### Directories

- Use `kebab-case` for directory names
- Test directories: `__tests__` or `__tests__`

### Database

- Tables: `snake_case` (e.g., `product_dietary_tags`)
- Columns: `snake_case`
- Indexes: `idx_<table>_<column>`

## Where to Add New Code

### New Feature (Full Stack)

**Backend:**
1. Add route: `backend/app/api/v1/<feature>.py`
2. Add service: `backend/app/services/<feature>_service.py`
3. Add schemas: `backend/app/schemas/<feature>.py`
4. Register route in `backend/app/main.py`
5. Add tests: `backend/tests/test_api/test_<feature>.py`

**Frontend:**
1. Add screen: `frontend/app/<feature>.tsx`
2. Add store: `frontend/store/<feature>Store.ts`
3. Add API client: `frontend/api/<feature>.ts`
4. Add components: `frontend/components/<Feature>.tsx`
5. Update navigation in `frontend/app/_layout.tsx`

### New API Endpoint

1. Add route handler in `backend/app/api/v1/<resource>.py`
2. Implement in `backend/app/services/<resource>_service.py`
3. Add request/response schemas in `backend/app/schemas/`
4. Add frontend API client in `frontend/api/`
5. Add tests

### New UI Component

1. Create in `frontend/components/` (or `frontend/components/ui/`)
2. Add tests in `frontend/components/__tests__/`
3. Export from `frontend/components/index.ts` (if barrel file exists)

### New Store (Zustand)

1. Create `frontend/store/<name>Store.ts`
2. Follow existing patterns (interfaces, create export)
3. Add tests in `frontend/store/__tests__/`

### Utilities

**Frontend:**
- Shared utilities: `frontend/lib/`
- Custom hooks: `frontend/hooks/`

**Backend:**
- Services: `backend/app/services/`
- Core utilities: `backend/app/core/`

## Special Directories

### `docs/` - GSD Planning

**Purpose:** Phase plans, roadmap, specs
**Generated:** By GSD workflow
**Committed:** Yes

### `docs/` - Project Documentation

**Purpose:** Human-readable and AI-readable documentation
**Key files:**
- `docs/README.md` - Documentation index
- `docs/development/PROJECT_STATUS.md` - Status and roadmap
- `backend/AI-README.md` - Backend patterns for AI
- `frontend/AI-README.md` - Frontend patterns for AI

### `tools/` - Development Utilities

**Purpose:** Scripts and helpers for development
**Structure:**
- `tools/backend/` - Backend utilities (migrations, seeding)
- `tools/ops/` - Operations scripts

### `postman/` - API Testing

**Purpose:** Postman collections for API testing
**Structure:**
- `collections/` - API endpoint collections
- `environments/` - Environment variables
- `globals/` - Global variables

### `infra/` - Infrastructure

**Purpose:** Infrastructure as Code
**Contains:** AWS scripts, Docker configs

---

*Structure analysis: 2026-04-13*
