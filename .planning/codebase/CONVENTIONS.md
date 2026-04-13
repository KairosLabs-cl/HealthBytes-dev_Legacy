# Coding Conventions

**Analysis Date:** 2026-04-13

## Languages

**Primary:**
- TypeScript 5.9 (React Native/Expo frontend)
- Python 3.13 (FastAPI backend)

## Code Style

### TypeScript/JavaScript

**Tool:** ESLint + Prettier

**Files:**
- `frontend/eslint.config.js` - ESLint flat config (TypeScript-aware)
- `frontend/.eslintrc.js` - ESLint legacy config
- `frontend/.prettierrc` - Prettier configuration

**Key Settings (Prettier):**
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": false,
  "printWidth": 80,
  "tabWidth": 2,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

**Key ESLint Rules:**
- `no-console`: warn (allows `warn` and `error`)
- `react/react-in-jsx-scope`: off (not needed in React 18)
- `@typescript-eslint/no-explicit-any`: error
- `@typescript-eslint/no-unused-vars`: warn (ignore `_` prefixed)
- `react-native/no-inline-styles`: warn
- `security/detect-object-injection`: off

**EditorConfig (`.editorconfig`):**
- UTF-8 charset
- LF line endings
- Trim trailing whitespace
- Python: 4-space indent, 100 max line length
- TypeScript/JSON: 2-space indent, 80 max line length
- YAML: 2-space indent

### Python

**Tools:** Black + isort + Flake8 + Bandit

**Configuration (`backend/pyproject.toml`):**
- **Black:** 100 character line length, target Python 3.12
- **isort:** black profile, 100 character line length
- **Flake8:** `--max-line-length=100 --extend-ignore=E203,W503`

**Pre-commit Hooks (`backend/.pre-commit-config.yaml`):**
```yaml
repos:
  - repo: https://github.com/pre-commit/pre-commit-hooks
    hooks:
      - id: check-merge-conflict
      - id: detect-private-key
      - id: check-added-large-files
        args: [--maxkb=1000]
      - id: check-yaml
      - id: check-json
```

## Naming Conventions

### TypeScript

**Files:**
- Components: `PascalCase.tsx` (e.g., `ProductCard.tsx`)
- Utilities/Hooks: `camelCase.ts` (e.g., `useAuth.ts`)
- Stores: `camelCase.ts` (e.g., `cartStore.ts`)
- API modules: `camelCase.ts` (e.g., `products.ts`)
- Tests: `name.test.ts` or `name.spec.ts` or `__tests__/name.test.tsx`

**Functions/Variables:**
- camelCase: functions, variables, hooks
- PascalCase: components, types, interfaces
- UPPER_SNAKE_CASE: constants

**Example:**
```typescript
// Hooks
const useAuth = () => { ... }

// Components
const ProductCard = () => { ... }

// Constants
const MAX_RETRY_COUNT = 3;

// Types
interface UserProfile { ... }
```

### Python

**Files:**
- snake_case.py for all modules
- test files: `test_*.py`
- conftest.py for fixtures

**Functions/Classes:**
- snake_case for functions and variables
- PascalCase for classes
- UPPER_SNAKE_CASE for constants

**Example:**
```python
# Functions
def get_user_by_id(user_id: int) -> User:
    pass

# Classes
class ProductService:
    pass

# Constants
MAX_RETRY_COUNT = 3
```

## Import Organization

### TypeScript

**Order (enforced by path aliases):**
1. React/Framework imports (`react`, `react-native`)
2. Third-party imports (`@clerk`, `zustand`)
3. Internal path aliases (`@/components`, `@/api`)
4. Relative imports (`./utils`)

**Path Aliases (configured in `tsconfig.json`):**
```json
{
  "paths": {
    "@/*": ["./*"]
  }
}
```

**Example:**
```typescript
import React from "react";
import { useRouter } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import { useCart } from "@/store/cartStore";
import { listProducts } from "@/api/products";
import { ProductCard } from "./ProductCard";
```

### Python

**Order (enforced by isort):**
1. FUTURE imports
2. STDLIB imports
3. THIRDPARTY imports
4. FIRSTPARTY imports (`app`)
5. LOCALFOLDER imports

**Example:**
```python
from __future__ import annotations

import logging
from typing import Generator

import pytest
from fastapi import APIRouter

from app.core.security import get_password_hash
from app.db.models import Product
from app.services.product_service import ProductService
```

## Documentation Standards

### TypeScript/JSDoc

**When to Comment:**
- Complex business logic
- Non-obvious workarounds
- Public API functions
- Edge cases

**Pattern:**
```typescript
/**
 * Calculate total price including tax and discounts.
 * 
 * @param items - Array of cart items
 * @param taxRate - Tax rate as decimal (e.g., 0.19 for 19%)
 * @returns Total price with tax applied
 */
function calculateTotal(items: CartItem[], taxRate: number): number {
  // Implementation
}
```

### Python/Docstrings

**Pattern:**
```python
def get_user_by_id(user_id: int) -> User | None:
    """
    Retrieve a user by their ID.

    Args:
        user_id: The unique identifier of the user

    Returns:
        User instance if found, None otherwise

    Raises:
        ValueError: If user_id is not a positive integer
    """
    if user_id <= 0:
        raise ValueError("user_id must be positive")
    return User.get(user_id)
```

## Git Conventions

### Branch Naming

**Format:** `type/description-short`

**Types:**
| Type | Description | Example |
|------|-------------|---------|
| `feat/` | New feature | `feat/product-filters` |
| `fix/` | Bug fix | `fix/price-validation` |
| `docs/` | Documentation | `docs/update-readme` |
| `refactor/` | Code improvement | `refactor/cart-store` |
| `test/` | Adding tests | `test/add-auth-tests` |
| `chore/` | Maintenance | `chore/update-deps` |
| `perf/` | Optimization | `perf/optimize-images` |

**Rules:**
- Lowercase only
- Words separated by hyphens
- Descriptive but concise
- No special characters

### Commit Messages

**Format:** `type(scope): description`

**Follows:** [Conventional Commits](https://www.conventionalcommits.org/)

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting (no code change)
- `refactor`: Code restructuring
- `test`: Adding/modifying tests
- `chore`: Maintenance tasks
- `perf`: Performance improvement

**Examples:**
```bash
feat(products): add filtering by allergens
fix(orders): validate prices from database, not client
docs(readme): update branch naming convention
test(auth): add JWT validation tests
refactor(store): improve zustand cart structure
```

**Rules:**
- Use imperative mood ("add" not "added")
- First line ≤ 72 characters
- Body explains WHAT and WHY, not HOW
- Reference issues: `Closes #123`

## Security Conventions

**NEVER:**
- Hardcode credentials, tokens, API keys
- Use `localStorage` for tokens in frontend
- Log sensitive information (passwords, tokens, emails)
- Disable security validations without documented reason
- Expose endpoints without authentication (except `/health`, `/docs`)

**ALWAYS:**
- Use environment variables for secrets
- Hash passwords with bcrypt
- Validate all inputs with Pydantic/Zod schemas
- Use parameterized queries (no SQL injection)
- Enable CORS only for trusted origins

---

*Convention analysis: 2026-04-13*
