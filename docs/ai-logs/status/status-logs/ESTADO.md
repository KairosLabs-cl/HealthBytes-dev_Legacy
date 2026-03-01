# 🏗️ HealthBytes - Arquitectura Técnica

**Fecha**: Febrero 28, 2026
**Versión**: MVP v2.4.0 - UX Refinement + Navigation Polish
**Estado**: ✅ Minimatch HIGH resuelto + Payments + UX refinado + nuevas pantallas

---

## 🎯 Arquitectura General

```
┌─────────────────────────────────────────────────────────────┐
│                    HEALTHBYTES ARCHITECTURE                 │
├─────────────────────────────────────────────────────────────┤
│  📱 MOBILE APP (React Native + Expo)                        │
│  ├─ Screens: Home, Cart, Checkout, Auth                     │
│  ├─ State: Zustand (cart, auth, products)                   │
│  └─ API: Fetch client with TypeScript types                │
├─────────────────────────────────────────────────────────────┤
│  🌐 REST API (FastAPI)                                      │
│  ├─ Endpoints: /products, /cart, /orders, /auth, /users     │
│  ├─ Services: Business logic layer                          │
│  ├─ Models: SQLAlchemy ORM                                  │
│  └─ Auth: JWT + Clerk middleware                            │
├─────────────────────────────────────────────────────────────┤
│  🗄️ DATABASE (PostgreSQL)                                   │
│  ├─ Tables: users, products, orders, cart_items            │
│  ├─ Relations: FK constraints, indexes                      │
│  └─ Migrations: Alembic (active)                            │
└─────────────────────────────────────────────────────────────┘
```

---

## 📋 Estructura de Capas (Backend)

### Patrón Arquitectónico: Clean Architecture
```
api/v1/routers/     ← HTTP Layer (FastAPI routes)
    ↓
services/           ← Business Logic (validation, calculations)
    ↓
db/models/          ← Data Access (SQLAlchemy ORM)
    ↓
PostgreSQL          ← Persistence Layer
```

### Router Structure (HTTP Layer)
```python
# app/api/v1/cart.py
@router.get("/", response_model=CartResponse)
async def get_cart(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get user's cart with all items"""
    return await cart_service.get_cart(current_user.id, db)

@router.post("/items", response_model=CartItemResponse)
async def add_to_cart(
    item: CartItemCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Add item to cart"""
    return await cart_service.add_to_cart(
        current_user.id, item.product_id, item.quantity, db
    )
```

### Service Layer (Business Logic)
```python
# app/services/cart_service.py
async def get_cart(user_id: int, db: AsyncSession) -> CartResponse:
    """Get user's cart with calculated total"""
    result = await db.execute(
        select(CartItem)
        .where(CartItem.user_id == user_id)
        .options(joinedload(CartItem.product))
    )
    cart_items = result.scalars().all()

    total = sum(item.quantity * item.product.price for item in cart_items)

    return CartResponse(
        items=[CartItemResponse.model_validate(item) for item in cart_items],
        total=total
    )
```

---

## 🔒 Seguridad & Dependencias (Febrero 24, 2026)

### Vulnerabilidades Detectadas & Resueltas

| CVE/Issue | Severidad | Paquete | Estado | Solución |
|---|---|---|---|---|
| **ReDoS (minimatch)** | 🔴 HIGH | glob 7.2.3 → minimatch 3.1.3 | ✅ **FIXED** | Upgraded glob 11.0.0 + minimatch 10.2.2 override |
| **tar extraction** | 🔴 HIGH | @expo/cli 54.0.23 | ✅ **SAFE** | Ya sin vulnerabilidad conocida |
| **ajv ReDoS** | 🟠 MEDIUM | eslint (^9) | ⏳ **DEFERRED** | ESLint 10 ecosystem pending v2.0 (dev-only impact) |
| **bn.js infinite loop** | 🟠 MEDIUM | @solana/web3.js 1.98.4 | ⚠️ **UNAVOIDABLE** | Upstream max version 5.2.3 sin patch |

### Acciones Tomadas

1. ✅ **Dependency Analysis**: Trazado de cadenas completas (Dependabot → transitive → root cause)
2. ✅ **Clerk Update**: 2.19.18 → 2.19.26 (reduce transitive deps con vulnerabilidades)
3. ✅ **pnpm Overrides**:
   ```json
   "overrides": {
     "minimatch": "^10.2.2",  // ← Fuerza versión segura
     "glob": "^11.0.0"        // ← Trae minimatch 10.2.2
   }
   ```
4. ✅ **Validation**: `pnpm audit --prod` = "No known vulnerabilities found"
5. ✅ **ESLint Stability**: Revertido a 9.39.3 (ESLint 10 breaking changes en plugin ecosystem)

### Validación
- ✅ All 1319 packages install successfully
- ✅ pnpm lint (ESLint 9.39.3) without errors
- ✅ Zero production vulnerabilities

### Próximos Pasos
- Monitor Dependabot after PR #71 merge for ecosystem updates
- Plan ESLint 10 migration when eslint-plugin-react & eslint-plugin-react-native release v2.0
- Track bn.js patch availability from @solana team

---

---

## 🔄 Flujos de Datos

### Cart Persistence Flow
```
1. User adds item to cart (Frontend)
2. Optimistic update (local state)
3. API call to backend
4. Backend validation + DB update
5. Success: keep local state
6. Error: rollback local state + show error
```

### Authentication Flow
```
1. User login (Clerk)
2. Get JWT token
3. Store in AsyncStorage (encrypted)
4. Attach to API requests
5. Backend validates token (Clerk JWKS)
6. Fallback to legacy JWT if needed
```

### Checkout Flow
```
1. User clicks "Pay"
2. Validate authentication
3. Create payment (Mercado Pago)
4. Poll payment status (pending/success/failure)
5. Create order on success
6. Clear cart
7. Navigate to status screen and home
```

---

## 🗂️ Esquemas de Base de Datos

### Tablas Implementadas
```sql
-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255),
    role VARCHAR(50) DEFAULT 'customer',
    name VARCHAR(255),
    address TEXT,
    clerk_id VARCHAR(255) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    image VARCHAR(500),
    stock INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cart items table (NEW)
CREATE TABLE cart_items (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, product_id)
);

-- Orders table
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    total DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Order items table
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id),
    quantity INTEGER NOT NULL,
    price DECIMAL(10,2) NOT NULL
);
```

### Relaciones y Constraints
- **Cart Items**: User ↔ Product (many-to-many through cart_items)
- **Orders**: User → Order → OrderItems → Product
- **Indexes**: user_id, product_id, created_at en tablas relevantes
- **Constraints**: FK constraints, quantity > 0, price > 0

---

## 🔗 Endpoints API (REST)

### Cart Endpoints
```
GET    /api/v1/cart              # Get user's cart
POST   /api/v1/cart/items        # Add item to cart
PUT    /api/v1/cart/items        # Update item quantity
DELETE /api/v1/cart/items        # Remove item from cart
DELETE /api/v1/cart              # Clear entire cart
POST   /api/v1/cart/merge        # Merge local cart with server
```

### Product Endpoints
```
GET    /api/v1/products          # List products (paginated)
GET    /api/v1/products/:id      # Get product by ID
POST   /api/v1/products          # Create product (seller only)
PUT    /api/v1/products/:id      # Update product (seller only)
DELETE /api/v1/products/:id      # Delete product (seller only)
```

### Order Endpoints
```
GET    /api/v1/orders            # List user's orders
GET    /api/v1/orders/:id        # Get order details
POST   /api/v1/orders            # Create order from cart
```

### Auth Endpoints
```
POST   /api/v1/auth/login        # JWT login
POST   /api/v1/auth/register     # User registration
GET    /api/v1/auth/me           # Get current user
```

---

## 📱 Frontend Architecture

### Component Structure
```
app/                         # Screens (Expo Router file-based)
├── _layout.tsx             # Root layout + Clerk provider
├── index.tsx               # Home (products + filters)
├── cart.tsx                # Shopping cart
├── checkout-v2.tsx         # Payment flow (StepIndicator)
├── product/[id].tsx        # Product details
├── orders.tsx              # Orders list
├── orders/[id].tsx         # Order detail
├── wishlist.tsx            # Wishlist/Favorites
├── addresses.tsx           # Address management CRUD
├── profile.tsx             # User profile
├── profile-settings.tsx    # Profile settings
├── search.tsx              # Full-text search
├── recently-viewed.tsx     # Recently viewed products
├── dietary-preferences.tsx # Dietary prefs (en progreso)
├── security.tsx            # Security settings
├── messages.tsx            # Messages (básico)
├── support.tsx             # Support (básico)
├── all-products.tsx        # All products listing
├── payments.tsx            # Payment methods
├── payment/                # Payment status screens
│   ├── success.tsx
│   ├── failure.tsx
│   └── pending.tsx
└── (auth)/login.tsx        # Auth screen

components/                  # Reusable UI
├── ui/                     # Gluestack components + BottomNavBar
├── ProductCard.tsx          # Product card (shared)
├── DietaryFilterBar.tsx     # Dietary filter chips (shared)
├── AddressCard.tsx          # Address display
├── CartItem.tsx             # Cart item row
├── DietaryBadge.tsx         # Dietary tag badge
├── ErrorBoundary.tsx        # Error boundary
├── FavoriteButton.tsx       # Favorite toggle
├── FavoritesBar.tsx         # Horizontal favorites list
├── HomeSkeleton.tsx         # Home skeleton loader
├── HorizontalProductCard.tsx # Product card horizontal
├── OnboardingModal.tsx      # Onboarding (en progreso)
├── OrderListItem.tsx        # Order list row
├── PaymentMethodSelector.tsx # Payment method UI
├── ProductCardSkeleton.tsx   # Product skeleton
├── ProductListItem.tsx      # Product list row
├── ProductListRow.tsx       # Product grid row
├── RecentlyViewedBar.tsx    # Recently viewed bar
├── RecentOrders.tsx         # Recent orders component
├── SectionHeader.tsx        # Section header
├── StepIndicator.tsx        # Checkout step indicator
├── StockBadge.tsx           # Stock status badge
└── WishlistTableRow.tsx     # Wishlist row

store/                       # Zustand state management
├── cartStore.ts             # Cart state + API sync
├── authStore.ts             # Auth state
├── addressStore.ts          # Addresses CRUD
├── favoritesStore.ts        # Favorites/wishlist
├── orderStore.ts            # Orders state
├── productFiltersStore.ts   # Filter persistence
├── preferencesStore.ts      # Dietary preferences
└── recentlyViewedStore.ts   # Recently viewed

api/                         # HTTP clients
├── products.ts              # Product API calls
├── cart.ts                  # Cart API calls
└── orders.ts                # Order API calls
```

### State Management (Zustand)
```typescript
// store/cartStore.ts
interface CartState {
  items: CartItem[];
  isAuthenticated: boolean;
  authToken: string | null;

  // Actions
  addProduct: (product: Product) => Promise<void>;
  updateQuantity: (productId: number, quantity: number) => Promise<void>;
  removeProduct: (productId: number) => Promise<void>;
  clearCart: () => Promise<void>;

  // Sync
  syncWithServer: () => Promise<void>;
  mergeAndSync: () => Promise<void>;
}
```

---

## 🔐 Seguridad

### Authentication Strategy
- **Primary**: Clerk OAuth (RS256 tokens)
- **Fallback**: Legacy JWT (HS256, 30 days)
- **Storage**: AsyncStorage (encrypted) - React Native
- **Validation**: JWKS endpoint for Clerk tokens

### Authorization
- **Role-based**: customer, seller, admin
- **Middleware**: `get_current_user`, `verify_seller`, `verify_admin`
- **Ownership**: Users can only access their own data

### Data Validation
- **Input**: Pydantic schemas (request validation)
- **Output**: Response models (data serialization)
- **Business Rules**: Service layer validations

---

## 🧪 Testing Strategy

### Backend Tests
```python
# tests/test_services/test_cart_service.py
@pytest.mark.asyncio
async def test_add_to_cart_new(db_session, product_a):
    """Test adding new item to cart"""
    mock_db = MockAsyncSession(db_session)
    user_id = 1

    item = await add_to_cart(user_id, product_a.id, 2, mock_db)

    assert item.product_id == product_a.id
    assert item.quantity == 2
```

### Coverage Goals
- **Services**: 90%+ (business logic)
- **API**: 80%+ (endpoints)
- **Models**: 70%+ (data access)

### Test Types
- **Unit**: Service functions with mocked DB
- **Integration**: API endpoints with test DB
- **E2E**: Frontend flows (planned)

---

## 🚀 Deployment Architecture

### Current (Development)
```
Local Development
├── Backend: uvicorn (port 3001)
├── Frontend: Expo dev server (port 8081)
├── Database: PostgreSQL local
└── Auth: Clerk sandbox
```

### Target (Production)
```
AWS Infrastructure (Planned)
├── ECS Fargate: Containerized backend
├── RDS PostgreSQL: Managed database
├── S3: Static assets + images
├── CloudFront: CDN
└── API Gateway: Request routing
```

---

## 📊 Performance Considerations

### Database Optimization
- **Indexes**: user_id, product_id, created_at
- **Eager Loading**: joinedload for relationships
- **Pagination**: LIMIT/OFFSET for large result sets
- **Connection Pooling**: SQLAlchemy async sessions

### API Optimization
- **Async/Await**: All I/O operations async
- **Response Caching**: Planned for product catalog
- **Rate Limiting**: Implemented for auth endpoints
- **Compression**: Gzip for responses

### Mobile Optimization
- **Lazy Loading**: Images and components
- **Optimistic Updates**: Immediate UI feedback
- **Background Sync**: Cart persistence
- **Offline Support**: Local storage fallback

---

## 🔄 Migration Path

### From Current to Production
1. **Database**: Local PostgreSQL → AWS RDS
2. **Auth**: Clerk sandbox → Production keys
3. **Assets**: Local files → S3 + CloudFront
4. **API**: Local → API Gateway + Lambda
5. **Monitoring**: Add CloudWatch + X-Ray
6. **Security**: Add WAF + API keys

### Breaking Changes (None Planned)
- API contracts stable
- Database schema backward compatible
- Mobile app updates non-breaking

---

## 📈 Scalability Roadmap

### Phase 1 (Current): MVP
- ✅ Basic CRUD operations
- ✅ Single user cart persistence
- ✅ Product catalog with search
- ✅ Basic authentication

### Phase 2 (Next): Enhanced Features
- 🔄 Advanced product filters (allergens, dietary)
- 🔄 User profiles and preferences
- 🔄 Order history and reordering
- 🔄 Push notifications

### Phase 3 (Future): Scale
- 📊 Analytics and recommendations
- 🤖 AI-powered product matching
- 🌐 Multi-language support
- 📱 PWA capabilities

---

## 🛠️ Development Workflow

### Branch Strategy
```
main (production-ready)
├── feat/cart-persistence (current)
├── feat/product-filters (planned)
└── fix/auth-validation (planned)
```

### Code Quality
- **Linting**: Black (Python), ESLint (TypeScript)
- **Type Checking**: mypy (Python), tsc (TypeScript)
- **Testing**: pytest (Python), Jest (React Native — 126 tests passing, 13 suites ✅)
- **Documentation**: Inline docstrings + READMEs

### CI/CD Pipeline (Planned)
```yaml
# .github/workflows/ci.yml
- Lint & Type Check
- Run Tests (80% coverage required)
- Build Docker Images
- Deploy to Staging
- Integration Tests
- Deploy to Production
```

---

## 🎯 Technical Decisions

### Why FastAPI?
- **Async First**: Better performance for I/O operations
- **Auto Documentation**: OpenAPI/Swagger included
- **Type Safety**: Pydantic integration
- **Modern Python**: 3.8+ features support

### Why Zustand?
- **Lightweight**: Minimal boilerplate
- **TypeScript**: Full type safety
- **React Native**: Better mobile performance than Redux
- **Simple API**: Easy to learn and maintain

### Why PostgreSQL?
- **ACID Compliance**: Data integrity for orders/cart
- **JSON Support**: Flexible product metadata
- **Extensions**: Full-text search, GIS (future)
- **Production Ready**: AWS RDS support

### Why Clerk?
- **Developer Experience**: Easy OAuth integration
- **Security**: Handles token refresh/rotation
- **Multi-Platform**: Works with React Native
- **Scalable**: Enterprise-ready auth solution

---

## 🚨 Known Issues & Technical Debt

### High Priority
- **Database Migrations**: Alembic activo pero migraciones manuales en algunos cambios
- **Webhooks Mercado Pago**: Confirmación de pagos pendiente
- **Pydantic V2 warnings**: 67 deprecation warnings (`class Config` → `model_config`)

### Medium Priority
- **Performance**: Revisar N+1 restantes (orders ya resuelto)
- **Security**: bcrypt 72-byte truncation (ya implementado workaround)
- **E2E Tests**: Checkout flow sin tests end-to-end

### Low Priority
- **Documentation**: API docs incompletos
- **Monitoring**: Sin logging/metrics en producción
- **Docker**: Paths corregidas pero no completamente funcional

### Low Priority
- **Documentation**: API docs incomplete
- **Monitoring**: No logging/metrics in production
- **Docker**: Containerization not implemented

---

## 📚 References

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [SQLAlchemy 2.0](https://docs.sqlalchemy.org/en/20/)
- [React Native](https://reactnative.dev/)
- [Zustand](https://zustand-demo.pmnd.rs/)
- [Clerk Auth](https://clerk.com/docs)
- [PostgreSQL](https://www.postgresql.org/docs/)</content>
<parameter name="filePath">c:\Users\benja\Proyects\Code\Work\HealthBytes-dev\docs\copilot-logs\status-logs\ARQUITECTURA.md
