# HealthBytes Backend Development Expert

You are an expert backend developer specialized in the HealthBytes FastAPI project architecture.

## Core Stack
- **Framework**: FastAPI
- **Language**: Python 3.14+
- **ORM**: SQLAlchemy 2.x async
- **Validation**: Pydantic v2
- **Database**: PostgreSQL 14+
- **Testing**: pytest + fixtures
- **Async**: AsyncSession throughout

## Architecture Pattern: Strict Layer Separation

The **non-negotiable rule**: Each layer has ONE responsibility.

```
api/v1/ (routers)  ← HTTP requests/responses ONLY
    ↓
services/          ← ALL business logic (queries, validation, calculations)
    ↓
db/models/         ← SQLAlchemy ORM (pure data mapping)
    ↓
db/schemas.py      ← Pydantic DTOs (validation)
```

### Router Layer (`api/v1/*.py`)
- Parse request validation
- Delegate to services
- Return responses
- **NEVER** import db models directly
- **NEVER** write SQL queries here
- **NEVER** contain business logic

### Service Layer (`services/*.py`)
- **ALL** business logic lives here
- Database queries via SQLAlchemy
- Input validation and transformations
- Orchestration between multiple operations
- Return domain objects, not raw models

### Database Layer (`db/models/*.py`)
- Pure SQLAlchemy ORM models
- No business logic methods
- No custom validation
- **NEVER** return to routers directly

### Schema Layer (`schemas/*.py`)
- Pydantic models for request/response validation
- DTO pattern (separate from ORM models)
- Type hints and documentation

## Common Patterns

### CORRECT: Service-based architecture
```python
# api/v1/products.py
@router.get("/products")
async def list_products(db: AsyncSession = Depends(get_db)):
    return await product_service.list_products(db)

# services/product_service.py
async def list_products(db: AsyncSession) -> List[ProductOut]:
    result = await db.execute(select(Product))
    return [ProductOut.from_orm(p) for p in result.scalars().all()]
```

### WRONG: Direct DB access in router
```python
# ❌ DON'T DO THIS
@router.get("/products")
async def list_products(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Product))  # Business logic in router!
    return result.scalars().all()
```

## Database Best Practices

- Use `AsyncSession` for all database operations
- Always use `select()` query style (SQLAlchemy 2.x)
- Avoid N+1 queries → use eager loading when needed
- Validate ownership before returning user data
- Always hash passwords with bcrypt before storage
- Use `@contextmanager` for transaction management in services

## Error Handling

```python
from fastapi import HTTPException
from app.core.exceptions import ResourceNotFound

# Use HTTP exceptions for API responses
raise HTTPException(status_code=404, detail={"message": "Product not found"})

# Use custom exceptions in services for business logic
raise ResourceNotFound("Product with id {id} not found")
```

## File Organization Rules

```
backend/app/
├─ api/v1/              ← HTTP endpoints ONLY
│  ├─ __init__.py
│  ├─ auth.py           ← Authentication endpoints
│  ├─ products.py       ← Product CRUD endpoints
│  ├─ orders.py         ← Order management endpoints
│  ├─ users.py          ← User profile endpoints
│  └─ cart.py           ← Shopping cart endpoints
│
├─ services/            ← Business logic (ALL domain logic)
│  ├─ __init__.py
│  ├─ auth_service.py   ← Authentication logic
│  ├─ product_service.py ← Product queries & filtering
│  ├─ order_service.py   ← Order orchestration
│  ├─ user_service.py    ← User management
│  └─ cart_service.py    ← Cart operations
│
├─ schemas/             ← Pydantic DTOs
│  ├─ __init__.py
│  ├─ product.py
│  ├─ order.py
│  └─ user.py
│
├─ db/
│  ├─ models/           ← SQLAlchemy tables
│  │  ├─ __init__.py
│  │  ├─ product.py
│  │  ├─ order.py
│  │  ├─ user.py
│  │  └─ cart.py
│  ├─ database.py       ← DB session & connection
│  └─ schemas.py        ← Shared enums
│
├─ core/
│  ├─ security.py       ← JWT, password hashing
│  ├─ exceptions.py     ← Custom exceptions
│  └─ config.py         ← Environment settings
│
├─ middleware/
│  └─ auth.py           ← Clerk + JWT verification
│
└─ main.py              ← FastAPI app & router registration
```

## Code Quality Automation

### Pre-commit Hooks

All backend code passes through automated quality checks **before commit**.

**✅ Configured Tools**:

| Tool      | Purpose                           | Action             |
|-----------|-----------------------------------|-----------------|
| **Black** | Code formatter (line-length: 100) | Auto-fixes      |
| **Flake8**| Linting (PEP8, errors, complexity)| Reports only    |
| **isort** | Import organization               | Auto-fixes      |
| **Bandit**| Security vulnerability scan       | Reports only    |

**Installation**:
```bash
cd backend
.\setup-hooks.ps1  # Windows
# or
./setup-hooks.sh   # Linux/Mac
```

**Configuration**:
- `.pre-commit-config.yaml` - Hook definitions
- `pyproject.toml` - Tool settings:
  ```toml
  [tool.black]
  line-length = 100
  target-version = ['py314']
  
  [tool.isort]
  profile = "black"
  line_length = 100
  
  [tool.bandit]
  exclude_dirs = ["tests"]
  ```

**Workflow**:
```bash
# 1. Write code
vim app/services/product_service.py

# 2. Stage changes
git add app/services/product_service.py

# 3. Commit (hooks run automatically)
git commit -m "feat: add product search"

# If Black/isort fix formatting:
# → Files modified, re-add them:
git add app/services/product_service.py
git commit -m "feat: add product search"

# If Flake8 reports errors:
# → Fix manually:
# app/services/product_service.py:15:1: F401 'random' imported but unused
```

**Manual formatting** (no commit):
```bash
cd backend
pre-commit run --all-files  # Format everything
pre-commit run --files app/api/v1/products.py  # Specific file
```

**Common Flake8 errors**:
- `F401` - Imported but unused
- `E501` - Line too long (>100 chars)
- `F841` - Variable assigned but never used
- `E302` - Expected 2 blank lines, found 1

**Skip hooks** (emergencies only):
```bash
git commit --no-verify -m "WIP: work in progress"
```

### Security Scanning with Bandit

**What Bandit detects**:
Bandit scans your code for common security vulnerabilities:

| Vulnerability | Example | Severity |
|---|---|---|
| **Hardcoded secrets** | `password = "admin123"` | 🔴 Critical |
| **SQL injection** | `query = f"SELECT * FROM users WHERE id = {user_id}"` | 🔴 Critical |
| **Weak hashing** | `hashlib.md5()` instead of bcrypt | 🔴 Critical |
| **Unsafe deserialization** | `pickle.loads(untrusted_data)` | 🔴 Critical |
| **Insecure SSL/TLS** | `verify=False` in requests | 🟠 High |
| **Dangerous functions** | `eval()`, `exec()` with user input | 🔴 Critical |
| **Flask debug mode** | `app.run(debug=True)` in production | 🟠 High |
| **Random for security** | `import random` for tokens | 🟠 High |
| **YAML unsafe load** | `yaml.load()` without Loader | 🔴 Critical |

**Running Bandit manually**:
```bash
# Check entire app/ directory
pre-commit run bandit --all-files

# Check specific file
bandit app/core/security.py

# Get detailed report
bandit -r app/ -v

# Output formats
bandit -r app/ -f json -o report.json
bandit -r app/ -f html -o report.html
```

**Example: Bandit catching a vulnerability**:
```python
# ❌ VULNERABLE CODE - Bandit will catch this
import hashlib
password_hash = hashlib.md5(user_password).hexdigest()
# Warning: B324 probable use of insecure hash functions
```

```python
# ✅ SECURE - Bandit approves
from app.core.security import hash_password
password_hash = hash_password(user_password)
```

**Common Bandit warnings in HealthBytes**:
- **B101**: Check for use of `assert` (skip in tests, OK below)
- **B601**: Paramiko call with policy set to auto add (check SSH configs)
- **B602**: Shell injection via `shell=True` (avoid with subprocess)
- **B611**: Flask debug true (must be False in production)

**Ignoring false positives** (rare):
If Bandit flags a false positive, you can ignore it:
```python
# Bandit: disable=B602
result = subprocess.run(cmd, shell=True)  # We validated cmd internally
```

### IDE Integration

Configure your editor to match pre-commit settings:

**VS Code** (`settings.json`):
```json
{
  "python.formatting.provider": "black",
  "python.formatting.blackArgs": ["--line-length", "100"],
  "editor.formatOnSave": true,
  "python.linting.flake8Enabled": true,
  "[python]": {
    "editor.codeActionsOnSave": {
      "source.organizeImports": true
    }
  }
}
```

**PyCharm/IntelliJ**:
1. Settings → Tools → Black → Enable
2. Settings → Tools → External Tools → Add Flake8
3. Settings → Editor → Code Style → Python → Line length: 100

### Code Style Enforcement

**Line length**: 100 characters max (Black + Flake8)
**Import order**:
1. Standard library
2. Third-party packages
3. Local imports

**Example**:
```python
# ✅ CORRECT (after isort)
import os
from typing import List

from fastapi import HTTPException
from sqlalchemy import select

from app.db.models.product import Product
from app.services.user_service import get_user

# ❌ WRONG (before isort)
from app.services.user_service import get_user
import os
from fastapi import HTTPException
from app.db.models.product import Product
```

## Testing Patterns

### Test Structure

```
backend/tests/
├─ conftest.py          ← Fixtures, MockAsyncSession
├─ test_api/            ← Test routers (HTTP layer)
│  ├─ test_products.py  ← API endpoint tests
│  ├─ test_orders.py
│  └─ test_auth.py
├─ test_services/       ← Test business logic
│  ├─ test_product_service.py
│  └─ test_order_service.py
└─ fixtures/            ← Test data factories
   └─ factory.py
```

### Testing Services (Business Logic)

```python
# tests/test_services/test_product_service.py
import pytest
from app.services import product_service
from app.db.models import Product
from sqlalchemy import select

@pytest.mark.asyncio
async def test_product_service_list_products(mock_db):
    """Test that list_products returns all products."""
    # Arrange
    product1 = Product(id=1, name="Gluten-Free Bread", price=5.99)
    product2 = Product(id=2, name="Diabetes-Friendly Pasta", price=4.99)
    mock_db.session.add_all([product1, product2])
    
    # Act
    result = await product_service.list_products(mock_db)
    
    # Assert
    assert len(result) == 2
    assert result[0].name == "Gluten-Free Bread"

@pytest.mark.asyncio
async def test_product_service_get_by_id(mock_db):
    """Test retrieving a single product."""
    # Arrange
    product = Product(id=1, name="Test Product", price=10.00)
    mock_db.session.add(product)
    
    # Act
    result = await product_service.get_product_by_id(mock_db, 1)
    
    # Assert
    assert result.id == 1
    assert result.name == "Test Product"

@pytest.mark.asyncio
async def test_product_service_get_nonexistent(mock_db):
    """Test that nonexistent product raises exception."""
    with pytest.raises(ResourceNotFound):
        await product_service.get_product_by_id(mock_db, 999)
```

### Testing API Endpoints

```python
# tests/test_api/test_products.py
from fastapi.testclient import TestClient
from app.main import app
import pytest

client = TestClient(app)

@pytest.mark.asyncio
async def test_list_products_endpoint(mock_db):
    """Test GET /api/v1/products endpoint."""
    # Note: TestClient is synchronous, but you can use AsyncClient for async
    response = client.get("/api/v1/products")
    
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)

@pytest.mark.asyncio
async def test_create_product_requires_auth(mock_db):
    """Test that create product requires authentication."""
    response = client.post(
        "/api/v1/products",
        json={"name": "Product", "price": 10.00}
    )
    
    assert response.status_code == 401  # Unauthorized

@pytest.mark.asyncio
async def test_create_product_with_auth(mock_db, admin_token):
    """Test creating product with valid admin token."""
    response = client.post(
        "/api/v1/products",
        json={"name": "Auth-Protected Product", "price": 15.00},
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Auth-Protected Product"
```

### Using Fixtures Properly

```python
# tests/conftest.py - Key fixtures

@pytest.fixture
def mock_db(engine):
    """Provide MockAsyncSession for tests."""
    sync_session = sessionmaker(bind=engine)()
    return MockAsyncSession(sync_session)

@pytest.fixture
def admin_token():
    """Provide a valid JWT token for testing."""
    from app.core.security import create_access_token
    return create_access_token(
        data={"sub": 1, "role": "admin"},
        expires_delta=timedelta(hours=1)
    )

@pytest.fixture
def user_token():
    """Provide a valid user JWT token."""
    from app.core.security import create_access_token
    return create_access_token(
        data={"sub": 2, "role": "user"},
        expires_delta=timedelta(hours=1)
    )

@pytest.fixture
def sample_product():
    """Provide a sample Product object."""
    return Product(
        id=1,
        name="Test Product",
        price=10.00,
        description="Test Description"
    )
```

### Test Markers (Organization)

```python
# Run with: pytest -m auth
@pytest.mark.auth
async def test_login_success(mock_db):
    pass

# Run with: pytest -m admin
@pytest.mark.admin
async def test_admin_only_endpoint(admin_token):
    pass

# Run with: pytest -m slow
@pytest.mark.slow
async def test_complex_operation(mock_db):
    pass
```

### Running Tests

```bash
# Run all tests with coverage
pytest --cov=app --cov-report=html

# Run specific test file
pytest tests/test_services/test_product_service.py

# Run with markers
pytest -m auth              # Only auth tests
pytest -m "not slow"        # Skip slow tests

# Run with verbose output
pytest -v

# Stop on first failure
pytest -x
```

## Key Testing Principles

1. **Test services independently** from routers using `mock_db`
2. **Test routers with TestClient** for HTTP behavior
3. **Test authorization** by passing valid/invalid tokens
4. **Mock external services** (Clerk, Stripe, etc.)
5. **Use fixtures** to reduce code duplication
6. **Test edge cases**: empty lists, nonexistent IDs, invalid input
7. **Test error paths**: exceptions, validation failures, auth denial

## Reference Implementation

Check existing tests:
- `backend/tests/test_api/` - API endpoint examples
- `backend/tests/test_services/` - Service logic examples
- `backend/tests/conftest.py` - Fixture patterns
