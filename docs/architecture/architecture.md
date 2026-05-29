# Architecture

**Analysis Date:** 2026-04-13

## Pattern Overview

**Overall:** Multi-tier Client-Server with API-First Design

**Key Characteristics:**
- **Backend:** FastAPI monolithic API with service layer separation
- **Frontend:** Expo/React Native with file-based routing (Expo Router)
- **Database:** PostgreSQL with SQLAlchemy ORM (async)
- **Authentication:** Dual auth system (Clerk + JWT for backwards compatibility)
- **State Management:** Zustand (frontend stores) + TanStack Query (server state)

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    📱 React Native App                          │
│                      (Expo SDK 54)                               │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐│
│  │   Screens   │  │ Components  │  │     Providers           ││
│  │ (app/*.tsx) │  │  (shared)   │  │ (Clerk, QueryClient)    ││
│  └──────┬──────┘  └──────┬──────┘  └───────────┬─────────────┘│
│         │                 │                      │              │
│  ┌──────▼─────────────────▼──────────────────────▼─────────────┐│
│  │                  State Management Layer                      ││
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────┐ ││
│  │  │ Zustand  │  │ TanStack │  │  Clerk   │  │  Expo      │ ││
│  │  │ Stores   │  │  Query   │  │  Auth    │  │  Storage   │ ││
│  │  └──────────┘  └──────────┘  └──────────┘  └────────────┘ ││
│  └───────────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────────┤
│                         API Layer (REST)                        │
│                    http://localhost:3001/api/v1/*              │
└─────────────────────────────┬───────────────────────────────────┘
                              │ HTTP/JSON
┌─────────────────────────────▼───────────────────────────────────┐
│                     ⚙️ FastAPI Backend                          │
│                      (Python 3.14+)                             │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                    API Routes Layer                         ││
│  │  /auth  /products  /orders  /cart  /users  /mercadopago    ││
│  └──────────────────────────┬──────────────────────────────────┘│
│  ┌──────────────────────────▼──────────────────────────────────┐│
│  │                   Service Layer                              ││
│  │  product_service.py  order_service.py  payment_service.py   ││
│  │  auth_service.py     email_service.py  mercadopago_service  ││
│  └──────────────────────────┬──────────────────────────────────┘│
│  ┌──────────────────────────▼──────────────────────────────────┐│
│  │                    Data Layer                               ││
│  │  SQLAlchemy ORM  •  Pydantic Schemas  •  Alembic Migrations ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────┬───────────────────────────────────┘
                              │ SQL
┌─────────────────────────────▼───────────────────────────────────┐
│                    🗄️ PostgreSQL Database                       │
│  products  │  users  │  orders  │  cart_items  │  dietary_tags  │
└─────────────────────────────────────────────────────────────────┘
```

## Layers

### Frontend (Expo/React Native)

**Entry Point:** `frontend/app/_layout.tsx`
- Wraps entire app with providers
- Sets up Clerk auth, TanStack QueryClient, GluestackUIProvider
- Handles onboarding modal and bottom navigation

**Screens Layer:** `frontend/app/`
- File-based routing via Expo Router
- Route groups for auth (app/(auth)/*) and main (app/*)
- Screen components are React Native components

**Key Files:**
- `frontend/app/_layout.tsx` - Root layout with providers
- `frontend/app/index.tsx` - Home screen
- `frontend/app/cart.tsx` - Cart screen
- `frontend/app/checkout-v2.tsx` - Checkout flow
- `frontend/app/orders.tsx` - Order history

**Components Layer:** `frontend/components/`
- Reusable UI components
- Shared business logic components
- Custom hooks for specific functionality

**State Layer:** `frontend/store/`
- Zustand stores for client-side state
- `cartStore.ts` - Cart management (items, totals, sync)
- `authStore.ts` - Auth state
- `favoritesStore.ts` - Wishlist management
- `orderStore.ts` - Order state
- `preferencesStore.ts` - User preferences

**API Layer:** `frontend/api/`
- HTTP client functions using fetch
- Endpoints match backend routes
- Returns typed responses

### Backend (FastAPI)

**Entry Point:** `backend/app/main.py`
- FastAPI app initialization
- CORS configuration
- Middleware setup (rate limiting, Sentry, logging)
- Route registration

**API Routes Layer:** `backend/app/api/v1/`
- `products.py` - Product CRUD, search, filtering
- `orders.py` - Order management
- `users.py` - User profile
- `auth.py` - Authentication endpoints
- `cart.py` - Cart operations
- `favorites.py` - Wishlist
- `addresses.py` - Address CRUD
- `mercadopago.py` - Payment integration
- `stock.py` - Stock queries

**Service Layer:** `backend/app/services/`
- Business logic isolation
- `product_service.py` - Product operations with Redis caching
- `order_service.py` - Order processing
- `payment_service.py` - Payment handling
- `mercadopago_service.py` - Mercado Pago integration
- `email_service.py` - Resend email integration
- `auth_service.py` - JWT and Clerk auth
- `stock_service.py` - Stock management with atomic locking
- `address_service.py` - Address operations
- `favorite_service.py` - Wishlist operations
- `review_service.py` - Product reviews

**Data Layer:** `backend/app/db/`
- `schemas.py` - SQLAlchemy ORM models
- `models/` - Additional Pydantic models
- `database.py` - Database connection and session management

**Core Layer:** `backend/app/core/`
- Security utilities
- Authentication middleware
- Rate limiting configuration
- JWT handling

**Middleware Layer:** `backend/app/middleware/`
- `auth.py` - JWT verification, user extraction
- Rate limiting middleware

## Data Flow

### Request Flow: Product Listing

```
1. User opens Home screen
   ↓
2. useEffect triggers API call via fetch
   ↓
3. TanStack Query manages request lifecycle
   ↓ (optional: check cache)
4. HTTP GET /api/v1/products?search=...&dietary=...
   ↓
5. FastAPI router receives request
   ↓
6. Auth middleware validates JWT (if protected)
   ↓
7. Route handler calls product_service.get_products_cached()
   ↓
8. Service checks Redis cache (TTL: 5 min)
   ↓ (cache miss)
9. Service queries database via SQLAlchemy
   ↓
10. Pydantic schema validates response
   ↓
11. JSON response sent to client
   ↓
12. TanStack Query updates cache and UI state
```

### Checkout Flow

```
1. User taps "Checkout" in cart
   ↓
2. Navigate to checkout-v2.tsx
   ↓
3. User selects address, payment method
   ↓
4. Create order: POST /api/v1/orders
   ↓
5. Create Mercado Pago preference: POST /api/v1/mercadopago/preference
   ↓
6. Return payment URL to frontend
   ↓
7. User completes payment on Mercado Pago
   ↓
8. Webhook: POST /api/v1/mercadopago/webhook
   ↓
9. Update order status, send email via Resend
   ↓
10. Frontend receives payment success
```

### Authentication Flow

```
1. User opens app
   ↓
2. ClerkProvider wraps app (in _layout.tsx)
   ↓
3. useAuth() hook provides sign-in state
   ↓
4. AuthGate component protects routes
   ↓
5. JWT stored in secure storage (expo-secure-store)
   ↓
6. Backend validates JWT on protected routes
```

## Key Abstractions

### Backend Services Pattern

Each service file follows a consistent pattern:

```python
# Pattern: Service encapsulates all business logic for a domain
# File: backend/app/services/product_service.py

async def get_products_cached(db, search, filters...):
    """Products with Redis caching"""
    ...

async def get_product_by_id(db, product_id):
    """Single product retrieval"""
    ...
```

### Frontend Store Pattern (Zustand)

```typescript
// Pattern: Zustand store for domain state
// File: frontend/store/cartStore.ts

interface CartStore {
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: number) => void;
  // ...
}

export const useCartStore = create<CartStore>((set) => ({
  items: [],
  addItem: (product) => set((state) => ...),
  // ...
}));
```

### API Client Pattern (Frontend)

```typescript
// Pattern: Fetch wrapper with typed responses
// File: frontend/api/products.ts

export const getProducts = async (filters: ProductFilters) => {
  const params = new URLSearchParams();
  // Build query params
  const response = await fetch(`/api/v1/products?${params}`);
  return response.json() as Promise<Product[]>;
};
```

### Database Model Pattern

```python
# Pattern: SQLAlchemy model with relationships
# File: backend/app/db/schemas.py

class Product(Base):
    __tablename__ = "products"
    
    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False)
    
    # Relationships
    reviews = relationship("Review", back_populates="product")
    dietary_tags = relationship("DietaryTag", secondary="...")
```

## Entry Points

### Frontend

| Entry Point | File | Purpose |
|-------------|------|---------|
| Root Layout | `frontend/app/_layout.tsx` | App shell with providers |
| Auth Layout | `frontend/app/(auth)/_layout.tsx` | Auth screens layout |
| Web Entry | `frontend/app/web/_layout.tsx` | Web-specific layout |
| Native Entry | `frontend/app/native/_layout.tsx` | Native app layout |

### Backend

| Entry Point | File | Purpose |
|-------------|------|---------|
| Main App | `backend/app/main.py` | FastAPI app factory |
| Config | `backend/app/config.py` | Settings via Pydantic |
| API Prefix | `/api/v1` | Versioned API routes |

## Error Handling

### Backend

**Strategy:** Centralized error handling with custom exceptions

```python
# FastAPI exception handling in main.py
@app.exception_handler(...)
async def custom_exception_handler(request, exc):
    return JSONResponse(status_code=..., content=...)

# Service-level error raising
raise HTTPException(status_code=404, detail="Product not found")
```

**Rate Limiting:**
- slowapi middleware on sensitive endpoints
- Per-user limiting when authenticated
- IP-based limiting for anonymous users

### Frontend

**Strategy:** Error boundaries + API error helpers

```typescript
// ErrorBoundary.tsx - React error boundary
// lib/apiError.ts - API error parsing and formatting
```

## Cross-Cutting Concerns

### Logging

**Backend:**
- Structured JSON logging in production
- Plain text in development
- Sentry integration for error tracking

**Frontend:**
- Sentry for crash reporting
- Console logging in development

### Validation

**Backend:**
- Pydantic models for request/response validation
- SQLAlchemy for database constraints
- FastAPI Query parameter validation

**Frontend:**
- TypeScript types for compile-time safety
- Form validation via Gluestack UI FormControl

### Authentication

**Dual System:**
1. **Clerk (Primary):** User management, OAuth, session handling
2. **JWT (Secondary):** Stateless API authentication for backwards compatibility

**Middleware:** `backend/app/middleware/auth.py`
- `get_current_user()` - Extract and validate JWT
- `verify_seller()` - Role verification
- Optional authentication with fallback

### Caching

**Redis (Optional):**
- Product listings cached (5 min TTL)
- `backend/app/services/product_service.py:get_products_cached()`

## Scalability Considerations

### Current Architecture

- **Monolithic API:** All routes in single FastAPI app
- **Synchronous Service Layer:** Each service handles one domain
- **Database Connection Pooling:** SQLAlchemy async sessions
- **Horizontal Scaling:** Ready for containerization (Docker + ECS)

### Scaling Path

1. **Read Optimization:** Redis cache expansion
2. **Write Scaling:** Background job queues (Celery/BullMQ)
3. **Microservices Extraction:** Products, Orders, Payments as separate services
4. **CDN:** Static assets via CDN
5. **Image Optimization:** Dedicated image service (Cloudinary/S3)

### Current Limits

- Database: PostgreSQL on single instance
- Cache: Optional Redis (not required)
- File Storage: Local filesystem (future: S3)
- Search: PostgreSQL full-text search (future: Elasticsearch)

---

*Architecture analysis: 2026-04-13*
