# Testing

<!-- generated-by: gsd-doc-writer -->

This document describes the testing infrastructure, procedures, and conventions for the HealthBytes project.

## Test Framework and Setup

### Backend

The backend uses **pytest** as its primary testing framework with the following dependencies:

- **pytest**: ^8.0.0 - Core testing framework
- **pytest-asyncio**: For async test support
- **pytest-cov**: For coverage reporting
- **aiosqlite**: For in-memory SQLite testing

**Test Configuration**: Tests are configured in `backend/pyproject.toml` and use an in-memory SQLite database for isolated testing.

### Frontend

The frontend uses **Jest** with **jest-expo** preset and React Native Testing Library:

- **jest**: ^29.7.0
- **jest-expo**: ~54.0.17
- **@testing-library/react-native**: ^12.9.0
- **@testing-library/jest-native**: ^5.4.3

**Jest Configuration**: Located at `frontend/jest.config.js` with setup files:
- `frontend/jest.setup.env.js` - Environment variables
- `frontend/jest.setup.ts` - Extended expect matchers

## Running Tests

### Backend Tests

```bash
# Run all tests
cd backend && pytest

# Run with coverage
cd backend && pytest --cov=app --cov-report=html

# Run specific test file
cd backend && pytest tests/test_api/test_products.py

# Run tests in specific directory
cd backend && pytest tests/test_services/

# Run in verbose mode
cd backend && pytest -v
```

### Frontend Tests

```bash
# Run all tests
cd frontend && pnpm test

# Run in watch mode
cd frontend && pnpm test --watch

# Run with coverage
cd frontend && pnpm test --coverage
```

## Test Structure

### Backend Tests

```
backend/tests/
├── __init__.py
├── conftest.py              # Shared fixtures
├── test_api/                # API endpoint tests
│   ├── test_products.py
│   ├── test_orders.py
│   └── ...
├── test_services/          # Service layer tests
├── test_models/             # Model tests
└── e2e/                     # End-to-end tests
```

### Frontend Tests

Tests are co-located with source files in `__tests__` directories:

```
frontend/
├── app/__tests__/
│   ├── index.test.tsx
│   ├── cart.test.tsx
│   └── ...
├── components/__tests__/
│   └── OnboardingModal.test.tsx
├── store/__tests__/
│   ├── cartStore.test.ts
│   ├── addressStore.test.ts
│   └── ...
└── api/__tests__/
    ├── products.test.ts
    └── ...
```

## Writing New Tests

### Backend Conventions

- Use descriptive test names: `test_feature_behavior`
- Use fixtures from `conftest.py` for common setup
- Test both success and failure cases
- Use parametrize for multiple input scenarios

### Frontend Conventions

- Test files use `.test.tsx` or `.test.ts` extension
- Use React Native Testing Library for component testing
- Mock async storage and other native modules in setup files
- Follow the pattern: Arrange → Act → Assert

## Coverage Requirements

### Backend

- Minimum coverage threshold: **80%**
- CI enforces this with: `pytest --cov-fail-under=80`

### Frontend

Coverage is tracked in CI but no strict threshold is enforced currently. Coverage configuration is in `frontend/jest.config.js`.

## CI Integration

Tests run automatically on every push and pull request via GitHub Actions (`.github/workflows/ci.yml`):

| Job | Trigger | Command |
|-----|---------|---------|
| Backend Tests | Push/PR to any branch | `pytest --tb=short --cov=app --cov-fail-under=80 -q` |
| Frontend Tests | Push/PR (after lint) | `pnpm exec jest --ci --forceExit` |

## Related Documentation

- [Backend Tests README](backend/tests/README.md)
- [Frontend README](frontend/README.md)
- [CI Workflow](.github/workflows/ci.yml)