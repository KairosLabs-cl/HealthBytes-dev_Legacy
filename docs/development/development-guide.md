<!-- generated-by: gsd-doc-writer -->
# Development Guide

This guide covers setting up the project for development, build commands, code style conventions, and the contribution workflow.

## Project Overview

HealthBytes is a monorepo containing:
- **Frontend**: React Native + Expo (TypeScript, pnpm)
- **Backend**: FastAPI + Python (SQLAlchemy async, PostgreSQL)

Both components run independently and communicate over HTTP.

---

## Local Setup

### Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| Git | Latest | Version control |
| Python | 3.13.1 | Backend runtime |
| Node.js | 20+ | Frontend runtime |
| pnpm | 8+ | Frontend package manager |
| PostgreSQL | 14+ | Database |

### Backend Setup

```bash
cd backend

# Windows PowerShell (recommended)
.\start.ps1

# Or manual setup
python -m venv venv
# Linux/Mac: source venv/bin/activate
# Windows: venv\Scripts\activate
pip install -r requirements.txt
python run_server.py
```

The backend runs at `http://localhost:3001` with Swagger docs at `/docs`.

### Frontend Setup

```bash
cd frontend
pnpm install

# Configure environment (detects your IP automatically)
.\setup-env.ps1   # Windows
# or: ./setup-env.sh  # Linux/Mac

# Start development server
pnpm start
```

The frontend supports three modes:
- **Web**: `pnpm web -- --port 8083` (use localhost)
- **Expo Go**: `pnpm start` (uses your local IP)
- **Both**: Recommended for testing on multiple devices

The package scripts run through `frontend/start.sh`, which validates Node and
creates a local `.env` if the Clerk publishable key is missing. Running
`pnpm exec expo start` directly bypasses that startup guard.

### Database

Create a PostgreSQL database and add to `backend/.env`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/healthbytes"
```

Or use Docker:

```bash
docker run --name healthbytes-postgres \
  -e POSTGRES_USER=healthbytes_user \
  -e POSTGRES_PASSWORD=your_password \
  -e POSTGRES_DB=healthbytes \
  -p 5432:5432 -d postgres:14
```

---

## Build Commands

### Frontend (pnpm)

| Command | Description |
|---------|-------------|
| `pnpm start` | Start Expo dev server |
| `pnpm web -- --port 8083` | Start for web platform |
| `pnpm start --android` | Start for Android |
| `pnpm start --ios` | Start for iOS |
| `pnpm type-check` | Run TypeScript type checking |
| `pnpm lint` | Run ESLint |
| `pnpm lint:fix` | Fix ESLint issues |
| `pnpm format` | Format with Prettier |
| `pnpm format:check` | Check Prettier formatting |
| `pnpm test` | Run Jest tests |
| `pnpm test:watch` | Run tests in watch mode |
| `pnpm test:coverage` | Run tests with coverage |
| `pnpm prebuild` | Run type-check then prebuild |
| `pnpm build:android:preview` | Build Android preview with EAS |
| `pnpm build:android:production` | Build Android production |

### Backend (Python)

| Command | Description |
|---------|-------------|
| `python run_server.py` | Start FastAPI server |
| `pytest` | Run all tests |
| `pytest --cov=app` | Run with coverage |
| `pytest -v` | Verbose output |
| `black --check app/` | Check formatting |
| `isort --check-only app/` | Check import order |
| `flake8 app/` | Lint code |
| `bandit -r app/` | Security scan |

---

## Code Style

### Frontend

**ESLint** (`.eslintrc.js`):
- Extends: expo, eslint:recommended, react, react-native, security
- TypeScript rules enabled
- No console.log (warn/error allowed)
- No `any` type allowed
- React Native: inline styles warned, color literals allowed

**Prettier** (`.prettierrc`):
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": false,
  "printWidth": 80,
  "tabWidth": 2,
  "arrowParens": "always"
}
```

Run linting: `pnpm lint` and `pnpm format`

### Backend

**Tools** (configured in `pyproject.toml`):
- **Black**: Line length 100, Python 3.12+
- **isort**: Profile black, line length 100
- **Flake8**: Max line 100, ignore E203, W503
- **Bandit**: Security scanning (skip B101 for tests)

**Coverage requirement**: 80% minimum (configured in pytest)

Run checks:
```bash
cd backend
black --check app/
isort --check-only app/
flake8 app/ --max-line-length 100
bandit -r app/
```

---

## Branch Conventions

The project uses **Conventional Branch Names**:

```
type/description
```

| Type | Purpose | Example |
|------|---------|---------|
| `feat/` | New feature | `feat/product-filters` |
| `fix/` | Bug fix | `fix/price-validation` |
| `docs/` | Documentation | `docs/update-readme` |
| `refactor/` | Code improvement | `refactor/cart-store` |
| `test/` | Add tests | `test/add-auth-tests` |
| `chore/` | Maintenance | `chore/update-deps` |
| `perf/` | Optimization | `perf/optimize-images` |

**Rules**:
- Use lowercase
- Separate words with hyphens
- Be descriptive but concise
- No special characters

---

## PR Process

### 1. Create Branch

```bash
git checkout master
git pull origin master
git checkout -b feat/your-feature
```

### 2. Development

- Make changes following code style conventions
- Run tests: `pytest` (backend) and `pnpm test` (frontend)
- Format code: `pnpm format` / `black app/`

### 3. Commit

Follow **Conventional Commits**:

```bash
git commit -m "feat(products): add filtering by allergens"
git commit -m "fix(orders): validate prices from database"
git commit -m "docs(readme): update branch naming convention"
```

**Format**: `type(scope): description`

### 4. Push and Create PR

```bash
git push origin feat/your-feature
```

Create PR with this template:

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] New feature
- [ ] Bug fix
- [ ] Breaking change
- [ ] Documentation

## Checklist
- [ ] Tests pass
- [ ] Code follows conventions
- [ ] Documentation updated
- [ ] Branch name follows convention
```

### 5. CI Pipeline

The CI workflow (`.github/workflows/ci.yml`) runs:
- **Backend**: Black, isort, Flake8, Bandit, pytest with coverage
- **Frontend**: ESLint, TypeScript check, Jest tests

All checks must pass before merge.

---

## Related Documentation

- [README.md](../README.md) - Project overview and quick start
- [ARCHITECTURE](../architecture/architecture.md) - System architecture
- [CONFIGURATION](../setup/configuration.md) - Environment variables
- [Testing Guide](./testing/README.md) - Test strategy and patterns

---

## Common Issues

**Frontend won't start**: Ensure your IP is configured in `.env` (run `setup-env.ps1` again if you changed networks)

**Backend connection fails**: Verify PostgreSQL is running and `DATABASE_URL` is correct in `.env`

**Tests failing**: Ensure dependencies are installed and the database is accessible
