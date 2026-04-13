# Testing Patterns

**Analysis Date:** 2026-04-13

## Test Frameworks

### Backend (Python)

**Framework:** pytest 8.x
- Config: `backend/pyproject.toml` under `[tool.pytest.ini_options]`
- Coverage: pytest-cov (minimum 80% enforced in CI)
- Async support: pytest-asyncio

**Run Commands:**
```bash
cd backend

# Run all tests
pytest

# Run with coverage
pytest --cov=app --cov-report=html

# Run specific test file
pytest tests/test_api/test_auth.py

# Run with verbose output
pytest -v

# Run specific test
pytest tests/test_api/test_auth.py::test_register_user_success

# Watch mode (requires pytest-watch)
ptw
```

### Frontend (TypeScript)

**Framework:** Jest 29.x + jest-expo
- Config: `frontend/jest.config.js`
- Assertions: Jest built-in + @testing-library/jest-native
- Component testing: @testing-library/react-native

**Run Commands:**
```bash
cd frontend

# Run all tests
pnpm test

# Watch mode
pnpm test:watch

# Coverage report
pnpm test:coverage

# CI mode (no watch, force exit)
pnpm exec jest --ci --forceExit
```

## Test File Organization

### Backend Structure

```
backend/tests/
├── conftest.py              # Shared fixtures and configuration
├── pytest.ini               # pytest configuration
├── test_api/
│   ├── __init__.py
│   ├── test_auth.py         # Authentication tests
│   ├── test_products.py     # Product endpoints
│   ├── test_orders.py       # Order endpoints
│   ├── test_health.py      # Health check
│   └── ...                  # More endpoint tests
├── test_services/           # Business logic tests
└── test_e2e/               # End-to-end tests
```

### Frontend Structure

```
frontend/
├── __tests__/               # Co-located tests (app directory)
│   └── app/
│       ├── _layout.test.tsx
│       ├── index.test.tsx
│       └── checkout.test.tsx
├── components/__tests__/    # Component tests
│   └── OnboardingModal.test.tsx
├── store/__tests__/         # Zustand store tests
│   ├── cartStore.test.ts
│   ├── addressStore.test.ts
│   └── orderStore.test.ts
├── api/__tests__/           # API client tests
│   ├── products.test.ts
│   ├── orders.test.ts
│   └── addresses.test.ts
├── jest.setup.ts            # Global mocks
└── jest.setup.env.js        # Environment variables
```

### Naming Conventions

**Backend:**
- Files: `test_*.py`
- Classes: `Test*`
- Functions: `test_*`

**Frontend:**
- Files: `*.test.ts`, `*.test.tsx`, or `*.spec.ts`
- Directories: `__tests__/`
- Pattern: `name.test.tsx`

## Test Structure & Patterns

### Backend Test Structure

```python
"""Module docstring describing what these tests cover."""

import logging
from unittest.mock import patch

import pytest


@pytest.mark.unit
@pytest.mark.auth
def test_register_user_success(client):
    """Test POST /auth/register creates user and returns token."""
    data = {"email": "new@example.com", "password": "SecurePass123", "name": "New User"}
    response = client.post("/auth/register", json=data)
    
    assert response.status_code == 201
    body = response.json()
    assert "token" in body
    assert body["user"]["email"] == "new@example.com"
    assert body["user"]["role"] == "user"
```

**Pytest Markers (defined in `pyproject.toml`):**
- `@pytest.mark.slow` - Tests that take long time
- `@pytest.mark.auth` - Authentication-related tests
- `@pytest.mark.admin` - Tests requiring admin privileges
- `@pytest.mark.integration` - Tests requiring external services

### Frontend Test Structure

```typescript
import { useCart, selectCartItemCount } from "@/store/cartStore";
import { renderHook } from "@testing-library/react-native";

describe("Cart Store", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset Zustand store state
    useCart.setState({
      items: [],
      isAuthenticated: false,
      authToken: null,
      error: null,
    });
  });

  test("test_select_cart_item_count_selector_computes_correctly", () => {
    // Arrange: Set up cart with multiple items
    useCart.setState({
      items: [
        { product: { id: 1, name: "Item 1", price: 100 }, quantity: 2 },
      ],
    });

    // Act: Get the count using the selector
    const state = useCart.getState();
    const cartCount = selectCartItemCount(state);

    // Assert: Total quantity is 2
    expect(cartCount).toBe(2);
  });
});
```

## Fixtures & Mocks

### Backend Fixtures (`backend/tests/conftest.py`)

**Database Setup:**
```python
@pytest.fixture(scope="session")
def engine():
    """Create test database engine using SQLite in-memory."""
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool
    )
    Base.metadata.create_all(bind=engine)
    yield engine
    Base.metadata.drop_all(bind=engine)
    engine.dispose()

@pytest.fixture(scope="function")
def db_session(engine):
    """Provide a database session for each test."""
    connection = engine.connect()
    transaction = connection.begin()
    session = sessionmaker(autocommit=False, autoflush=False, bind=connection)()
    yield session
    session.close()
    transaction.rollback()
    connection.close()

@pytest.fixture(scope="function")
def client(db_session):
    """Provide a FastAPI test client with mocked database."""
    async def get_db_override():
        mock_session = MockAsyncSession(db_session)
        yield mock_session
    
    app.dependency_overrides[get_db] = get_db_override
    test_client = TestClient(app)
    yield test_client
    app.dependency_overrides.clear()
```

**Sample Data Fixtures:**
```python
@pytest.fixture
def sample_product_data():
    """Sample product data for testing."""
    return {
        "name": "Test Product",
        "description": "A test product",
        "price": 9.99,
        "image": "https://example.com/image.jpg",
    }

@pytest.fixture
def sample_user_data():
    """Sample user data for testing."""
    return {
        "email": "test@example.com",
        "password": "short_pwd_1234",  # Max 72 bytes for bcrypt
        "name": "Test User",
    }
```

**MockAsyncSession Pattern:**
```python
class MockAsyncSession:
    """Mock AsyncSession that wraps sync Session for testing."""
    
    def __init__(self, sync_session: Session):
        self.sync_session = sync_session
    
    async def execute(self, statement):
        result = self.sync_session.execute(statement)
        return result
    
    async def commit(self):
        self.sync_session.commit()
```

### Frontend Mocks

**Global Mocks (`frontend/jest.setup.ts`):**
```typescript
// Mock @clerk/clerk-expo
jest.mock("@clerk/clerk-expo", () => ({
  useAuth: () => ({
    isSignedIn: true,
    isLoaded: true,
    userId: "test-user-id",
    getToken: jest.fn().mockResolvedValue("test-token"),
    signOut: jest.fn(),
  }),
  ClerkProvider: ({ children }) => children,
}));

// Mock expo-router
jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
}));
```

**Module Mocking Pattern:**
```typescript
jest.mock("@/api/addresses", () => ({
  fetchAddresses: jest.fn(),
  createAddress: jest.fn(),
  updateAddress: jest.fn(),
  deleteAddress: jest.fn(),
  setDefaultAddress: jest.fn(),
}));

// Usage in test
(addressApi.fetchAddresses as jest.Mock).mockResolvedValue({
  addresses: [mockAddress],
});
```

**Mock Factory Pattern:**
```typescript
const mockAddress = (overrides = {}) => ({
  id: 1,
  user_id: "user_test_1",
  street: "Av. Providencia 123",
  city: "Santiago",
  // ... other fields
  ...overrides,
});
```

**Environment Setup (`frontend/jest.setup.env.js`):**
```javascript
process.env.EXPO_PUBLIC_API_URL = "http://test-api";
```

## Coverage Requirements

### Backend

**Minimum Coverage:** 80% (enforced in CI with `--cov-fail-under=80`)

**Configuration:**
```toml
[tool.pytest.ini_options]
addopts = """
    -v
    --tb=short
    --strict-markers
    --cov=app
    --cov-report=html
    --cov-report=term-missing:skip-covered
    --cov-fail-under=80
"""
```

**Generate Report:**
```bash
pytest --cov=app --cov-report=html
# Open htmlcov/index.html in browser
```

### Frontend

**Coverage Collection (from `jest.config.js`):**
```javascript
collectCoverageFrom: [
  "**/*.{ts,tsx}",
  "!**/*.d.ts",
  "!**/coverage/**",
  "!**/node_modules/**",
  "!**/.expo/**",
  "!**/babel.config.js",
  "!**/jest.config.js",
  "!**/metro.config.js",
  "!**/tailwind.config.js",
]
```

## CI/CD Test Automation

### GitHub Actions (`.github/workflows/ci.yml`)

**Backend Test Job:**
```yaml
backend-test:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-python@v5
      with:
        python-version: "3.13"
    - name: Install dependencies
      run: |
        pip install -r requirements.txt
        pip install pytest pytest-asyncio pytest-cov aiosqlite
    - name: Create test .env
      run: |
        echo "DATABASE_URL=sqlite+aiosqlite:///:memory:" > .env
        echo "JWT_SECRET=ci-test-secret-key-min-32-characters-long" >> .env
    - name: Run tests
      run: pytest --tb=short --cov=app --cov-fail-under=80 -q
```

**Frontend Test Job:**
```yaml
frontend-test:
  runs-on: ubuntu-latest
  needs: [frontend-lint]
  steps:
    - uses: pnpm/action-setup@v4
      with:
        version: 10
    - uses: actions/setup-node@v4
      with:
        node-version: 20
        cache: pnpm
    - name: Install dependencies
      run: pnpm install --frozen-lockfile
    - name: Run tests
      run: pnpm exec jest --ci --forceExit
```

**Pipeline Order:**
1. `backend-lint` → Black, isort, Flake8
2. `backend-test` → pytest with coverage
3. `frontend-lint` → ESLint, TypeScript check
4. `frontend-test` → Jest tests (after lint)
5. `frontend-audit` → pnpm audit
6. `secret-scan` → Gitleaks
7. `sast` → Bandit (security)
8. `docker-build` → Build test
9. `deploy-production` → Requires all above (manual approval)

## Test Types

### Unit Tests

**Backend:** Tests for individual functions/services
```python
@pytest.mark.unit
def test_calculate_total():
    """Test price calculation logic."""
    items = [{"price": 100, "quantity": 2}, {"price": 50, "quantity": 1}]
    total = calculate_order_total(items)
    assert total == 250
```

**Frontend:** Tests for individual functions/hooks
```typescript
test("test_select_cart_item_count_selector_computes_correctly", () => {
  const state = { items: [{ quantity: 2 }, { quantity: 3 }] };
  expect(selectCartItemCount(state)).toBe(5);
});
```

### Integration Tests

**Backend:** Tests for API endpoints with database
```python
@pytest.mark.integration
def test_create_order_updates_inventory(client, db_session):
    """Test that creating an order decrements inventory."""
    product = create_product(db_session, stock=10)
    response = client.post("/orders", json={"items": [{"product_id": product.id, "quantity": 1}]})
    assert response.status_code == 201
    assert get_product_stock(product.id) == 9
```

### E2E Tests

**Backend:** Full checkout flow tests in `backend/tests/test_api/test_e2e_checkout.py`

**Coverage includes:**
- User registration → login → checkout → payment
- Inventory management
- Order confirmation emails

## Mocking Guidelines

### What to Mock

**Backend:**
- External APIs (MercadoPago, Resend)
- Email services
- Third-party authentication

**Frontend:**
- API calls (`fetch`)
- External services (Clerk, AsyncStorage)
- Platform-specific modules

### What NOT to Mock

**Backend:**
- Database queries (use test database)
- Core business logic (test directly)

**Frontend:**
- React Native components (test with @testing-library)
- Zustand stores (test actual behavior)
- Simple utility functions (test directly)

## Best Practices

### Test Naming

**Backend:** `test_<what_is_being_tested>_<scenario>`
```python
def test_register_user_duplicate_email(client, db_session):
    """Test POST /auth/register with duplicate email returns 400."""
```

**Frontend:** `test_<what_is_being_tested>_<scenario>`
```typescript
test("fetches and sets addresses with default", async () => {
```

### Arrange-Act-Assert Pattern

```python
# Arrange: Set up test data
create_test_user(db_session, email="test@example.com")
data = {"email": "test@example.com", "password": "pass123"}

# Act: Perform the action
response = client.post("/auth/login", json=data)

# Assert: Verify the outcome
assert response.status_code == 401
```

### Test Independence

- Each test should be able to run independently
- Use `beforeEach` to reset state
- Don't rely on execution order
- Clean up after tests (especially global mocks)

### Error Handling Tests

```python
def test_login_user_not_found(client):
    """Test POST /auth/login with non-existent user returns 401."""
    response = client.post(
        "/auth/login",
        json={"email": "nonexistent@example.com", "password": "password"},
    )
    assert response.status_code == 401
    assert response.json() == {"detail": {"error": "Authentication failed"}}
```

---

*Testing analysis: 2026-04-13*
