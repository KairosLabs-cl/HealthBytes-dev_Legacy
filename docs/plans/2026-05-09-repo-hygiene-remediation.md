# Repo Hygiene Remediation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix the repository hygiene issues found in the May 9 audit in a safe, ordered sequence that restores reliable frontend checks, preserves backend standards, and separates local artifacts from versioned source.

**Architecture:** Start with tooling and generated-artifact boundaries so later checks are trustworthy. Then fix frontend/backend placement violations, remove production debug noise, reduce unsafe TypeScript usage, and clean repo structure without moving unrelated user work. Each task should be completed and verified before starting the next because later checks depend on earlier hygiene fixes.

**Tech Stack:** Frontend uses Expo, React Native, TypeScript, pnpm, ESLint, Prettier, Jest. Backend uses FastAPI, SQLAlchemy async, pytest, Black, isort, Flake8, Bandit.

---

## Current Audit Baseline

The audit found these verified states:

- `pnpm run format:check` fails with 40 Prettier warnings.
- `pnpm run lint` exits 0, but current ESLint flat config only checks JS/JSX.
- `pnpm run type-check` fails with `RangeError: Maximum call stack size exceeded`.
- `pnpm exec tsc --showConfig` includes `./dist/_expo/static/js/web/entry-*.js`.
- Shell runtime was Node `v25.8.1`; project docs require Node 20+ and CI uses Node 20.
- Backend `black`, `isort`, `flake8`, and `bandit -r app/ -ll` pass on `backend/app`.
- `git status --short --branch` shows tracked edits plus many untracked local artifacts.

Do not start by running automatic fixers across the whole repo. First make the checks reliable and decide which untracked files are source vs local artifacts.

## Task 1: Stabilize Frontend TypeScript Inputs

**Problem:** TypeScript reads generated Expo web output from `frontend/dist`, causing `RangeError: Maximum call stack size exceeded` before real type errors can be evaluated.

**Files:**
- Modify: `frontend/tsconfig.json`
- Verify: `frontend/package.json`, `frontend/.gitignore`

**Steps:**

1. Add explicit `exclude` entries to `frontend/tsconfig.json` for generated/native/dependency output:

```json
{
  "extends": "./node_modules/expo/tsconfig.base",
  "compilerOptions": {
    "baseUrl": ".",
    "strict": true,
    "jsx": "react-jsx",
    "paths": {
      "@/*": ["*"],
      "tailwind.config": ["tailwind.config.js"]
    }
  },
  "exclude": ["node_modules", "dist", ".expo", "android", "ios"]
}
```

2. Use Node 20 for frontend checks. If the shell is on Node 25, switch using the local project/runtime convention before validating.

3. Run:

```bash
cd frontend
node --version
pnpm exec tsc --showConfig
pnpm run type-check
```

**Expected:**
- `node --version` reports Node 20.x or another repo-approved Node 20+ runtime compatible with CI.
- `tsc --showConfig` no longer lists `./dist/_expo/...`.
- `pnpm run type-check` either passes or now reports real app-code TypeScript errors.

**Commit:**

```bash
git add frontend/tsconfig.json
git commit -m "fix(frontend): exclude generated output from typecheck"
```

## Task 2: Make ESLint Cover TypeScript Reality

**Problem:** `pnpm run lint` exits 0 because `frontend/eslint.config.js` only lints JS/JSX. The legacy `.eslintrc.js` contains TypeScript rules such as `@typescript-eslint/no-explicit-any`, but ESLint 9 uses the flat config.

**Files:**
- Modify: `frontend/eslint.config.js`
- Modify or remove after migration: `frontend/.eslintrc.js`
- Modify only with approval if dependencies are missing: `frontend/package.json`, `frontend/pnpm-lock.yaml`

**Steps:**

1. Check whether TypeScript ESLint packages are already installed:

```bash
cd frontend
pnpm list @typescript-eslint/parser @typescript-eslint/eslint-plugin typescript-eslint --depth 0
```

2. If missing, ask for explicit approval before installing dependencies. Preferred modern route is `typescript-eslint` with ESLint flat config.

3. Update `frontend/eslint.config.js` so it covers `**/*.{ts,tsx,js,jsx}` and enforces at minimum:

- no accidental `console.log` in production paths.
- no `debugger`.
- no explicit `any` except justified local exceptions.
- React/React Native/security rules already intended by the old config.

4. Remove or simplify `frontend/.eslintrc.js` only after the flat config carries the same intended rules. Do not leave contradictory lint configs.

5. Run:

```bash
cd frontend
pnpm run lint
```

**Expected:**
- Lint now checks TS/TSX.
- Existing `any` and `console.log` issues become visible unless fixed in later tasks.
- If lint fails, keep the failures as the known backlog for Tasks 5 and 6.

**Commit:**

```bash
git add frontend/eslint.config.js frontend/.eslintrc.js frontend/package.json frontend/pnpm-lock.yaml
git commit -m "fix(frontend): lint typescript sources"
```

## Task 3: Apply Prettier In Controlled Scope

**Problem:** `pnpm run format:check` reports 40 files. Some are tracked source; some are untracked local work. Formatting everything blindly may hide unrelated user changes.

**Files:**
- Modify: only source files intentionally included in the remediation branch.
- Do not format generated directories: `frontend/dist`, `frontend/.expo`, `healthbytes-ui-extraction`.

**Steps:**

1. Re-run the check and save the failing file list:

```bash
cd frontend
pnpm run format:check
```

2. Split the list into tracked and untracked files:

```bash
git ls-files -- frontend
git status --short frontend
```

3. Format only files that are either already tracked source or intentionally accepted as part of the work:

```bash
cd frontend
pnpm exec prettier --write <file-list>
```

4. Re-run:

```bash
cd frontend
pnpm run format:check
```

**Expected:**
- `format:check` exits 0 for source files.
- No generated screenshots, Expo output, or unrelated local artifacts are formatted.

**Commit:**

```bash
git add <formatted-source-files>
git commit -m "style(frontend): apply prettier formatting"
```

## Task 4: Move Direct Frontend API Calls Into `frontend/api`

**Problem:** Project rules require API calls in `frontend/api`. Audit found `fetch` in components, hooks, and stores.

**Files:**
- Modify: `frontend/api/products.ts`
- Modify: `frontend/api/reviews.ts`
- Modify: `frontend/api/users.ts` or existing nearest API client if push-token belongs elsewhere.
- Modify: `frontend/components/RecommendationsBar.tsx`
- Modify: `frontend/components/ReviewModal.tsx`
- Modify: `frontend/store/useRecommendationsStore.ts`
- Modify: `frontend/hooks/usePushNotifications.ts`

**Steps:**

1. Add or reuse API-client functions:

```ts
export async function getRecommendedProducts(token: string, limit = 12): Promise<Product[]> {
  // fetch `${API_URL}/products/recommended?limit=${limit}`
}

export async function createProductReview(
  productId: number,
  payload: { rating: number; comment: string },
  token: string
): Promise<void> {
  // POST review through api client
}

export async function updatePushToken(token: string, expoPushToken: string | null): Promise<void> {
  // PATCH /users/me/push-token through api client
}
```

2. Replace component/hook/store `fetch` calls with these API functions.

3. Keep React Query logic in components/hooks, but keep HTTP details in `frontend/api`.

4. Add focused tests for API-client behavior where practical:

```bash
cd frontend
pnpm test -- api/__tests__/products.test.ts api/__tests__/reviews.test.ts
```

5. Run:

```bash
cd frontend
pnpm run lint
pnpm run type-check
```

**Expected:**
- `rg -n "\\bfetch\\s*\\(" frontend/app frontend/components frontend/hooks frontend/store frontend/lib` returns no API boundary violations, except comments or explicitly justified low-level utilities.

**Commit:**

```bash
git add frontend/api frontend/components frontend/hooks frontend/store
git commit -m "refactor(frontend): centralize api requests"
```

## Task 5: Remove Production Debug Output

**Problem:** PR rules require no `console.log`, `debugger`, or production prints. Audit found logs in API and checkout paths.

**Files:**
- Modify: `frontend/api/orders.ts`
- Modify: `frontend/api/mercadopago.ts`
- Modify: `frontend/app/checkout-v2.tsx`
- Modify: `frontend/hooks/usePushNotifications.ts`
- Modify: `frontend/lib/cache.ts`

**Steps:**

1. Remove token-length and token-presence logs from API clients. Do not log authentication metadata.

2. Replace needed diagnostics with non-sensitive error surfaces or dev-only structured helpers if the repo already has one. Otherwise remove them.

3. Re-run:

```bash
rg -n "console\\.log|debugger" frontend/app frontend/components frontend/hooks frontend/store frontend/lib frontend/api
cd frontend
pnpm run lint
```

**Expected:**
- No production `console.log` or `debugger` remains.
- `console.warn`/`console.error` remain only if intentional and allowed by lint policy.

**Commit:**

```bash
git add frontend/api frontend/app frontend/hooks frontend/lib
git commit -m "fix(frontend): remove debug logging"
```

## Task 6: Reduce Unsafe TypeScript `any`

**Problem:** Project rules say explicit TypeScript types, never `any` unless justified. Audit found `any` in app/components/store plus tests.

**Files:**
- Modify: `frontend/app/addresses.tsx`
- Modify: `frontend/app/product/[id].tsx`
- Modify: `frontend/app/recently-viewed.tsx`
- Modify: `frontend/components/FavoriteButton.tsx`
- Modify: `frontend/components/ProductCard.tsx`
- Modify: `frontend/components/OnboardingModal.tsx`
- Modify: `frontend/components/ui/ScreenHeader.tsx`
- Modify: `frontend/store/authStore.ts`
- Modify tests only after source types are stable.

**Steps:**

1. Prioritize production source before tests.

2. Replace `catch (err: any)` with `catch (err: unknown)` and safe narrowing.

3. Replace product/review item `any` with existing shared types from `frontend/types`.

4. Replace icon/ref/event `any` with local precise React Native or component-library types. If a third-party ref cannot be typed cleanly, add a narrow local type alias and a short justification.

5. Re-run:

```bash
rg -n "\\bany\\b|as any|: any" frontend/app frontend/components frontend/hooks frontend/store frontend/lib frontend/api frontend/types
cd frontend
pnpm run type-check
pnpm run lint
```

**Expected:**
- No unhandled production `any`.
- Test-only `any` either removed or explicitly allowed by ESLint override for test files.

**Commit:**

```bash
git add frontend/app frontend/components frontend/store frontend/hooks frontend/lib frontend/api frontend/types
git commit -m "fix(frontend): tighten types"
```

## Task 7: Move Backend Router Logic Into Services

**Problem:** Backend routers contain direct SQLAlchemy queries and DB model imports. Rules say routers call services only; business logic and queries belong in services.

**Files:**
- Modify: `backend/app/api/v1/orders.py`
- Modify: `backend/app/api/v1/users.py`
- Modify: `backend/app/api/v1/auth.py`
- Modify: `backend/app/services/order_service.py`
- Modify: `backend/app/services/user_service.py`
- Modify: `backend/app/services/auth_service.py`
- Add or update tests under `backend/tests/test_services/` and `backend/tests/test_api/`.

**Steps:**

1. Move address ownership validation from `orders.py` into `order_service` or `address_service`.

2. Move order list/detail/status query logic from `orders.py` into `order_service`.

3. Move user CRUD query logic from `users.py` into `user_service`.

4. Move auth user lookup/creation query logic from `auth.py` into `auth_service`.

5. Keep routers responsible only for:

- request parsing.
- dependency injection.
- calling service functions.
- mapping service exceptions to HTTP responses.

6. Run focused backend checks:

```bash
cd backend
.venv/bin/python -m black --check --line-length 100 app/
.venv/bin/python -m isort --check-only --profile black app/
.venv/bin/python -m flake8 app/ --max-line-length 100 --extend-ignore E203,W503
.venv/bin/python -m pytest tests/test_api/test_orders.py tests/test_api/test_users.py tests/test_api/test_auth.py tests/test_services/test_order_service.py tests/test_services/test_user_service.py tests/test_services/test_auth_service.py --tb=short
```

**Expected:**
- `rg -n "from sqlalchemy|select\\(|db\\.execute|from app\\.db\\.models" backend/app/api/v1` shows no router query/business-logic violations, except `AsyncSession` dependency imports if still needed.
- Focused tests pass.

**Commit:**

```bash
git add backend/app/api/v1 backend/app/services backend/tests
git commit -m "refactor(backend): move router queries into services"
```

## Task 8: Clean Repo Artifact Boundaries

**Problem:** Local/untracked artifacts include `.auth/healthbytes-auth.json`, `healthbytes-ui-extraction/`, generated screenshots, capture scripts, and untracked docs. `.auth` is not ignored.

**Files:**
- Modify: `.gitignore`
- Decide whether to track or ignore: `healthbytes-ui-extraction/`
- Decide whether to track or ignore: `capture-auth.mjs`, `capture.mjs`
- Do not commit: `.env`, `.auth/healthbytes-auth.json`, generated output.

**Steps:**

1. Add local sensitive/runtime artifacts to `.gitignore`:

```gitignore
.auth/
healthbytes-ui-extraction/
capture-auth.mjs
capture.mjs
```

Only include `healthbytes-ui-extraction/` and capture scripts if they are intended as local audit artifacts. If they are deliverables, move them under an approved docs category and document ownership.

2. Confirm ignore behavior:

```bash
git check-ignore -v .auth/healthbytes-auth.json healthbytes-ui-extraction/metadata/routes.md capture-auth.mjs capture.mjs
```

3. Confirm no secrets are staged:

```bash
git status --short
git diff --cached --name-only
```

**Expected:**
- `.auth/healthbytes-auth.json` cannot be accidentally staged.
- Local screenshots/generated artifacts do not pollute repo status unless explicitly accepted as docs.

**Commit:**

```bash
git add .gitignore
git commit -m "chore(repo): ignore local audit artifacts"
```

## Task 9: Remove Or Reclassify Stray Tracked Files

**Problem:** `backend/tests/test_api/test_orders_validation.py.bak` is tracked. Backend utility scripts also exist both under `backend/scripts` and `Tools/backend`, which blurs ownership.

**Files:**
- Remove or convert: `backend/tests/test_api/test_orders_validation.py.bak`
- Review: `backend/scripts/*.py`
- Review: `Tools/backend/**`

**Steps:**

1. Compare the `.bak` file against the real test file:

```bash
git diff --no-index backend/tests/test_api/test_orders_validation.py backend/tests/test_api/test_orders_validation.py.bak
```

2. If it is stale backup content, remove it. If it contains unique valid tests, migrate those tests into the real test file.

3. Classify each `backend/scripts/*.py`:

- startup entrypoint stays near backend only if documented.
- database utilities belong in `Tools/backend/database`.
- seed utilities belong in `Tools/backend/seeding`.
- smoke/manual tests belong in `Tools/backend/testing` or `backend/tests`.

4. Run:

```bash
git ls-files | rg '\\.(bak|orig|tmp|log)$'
cd backend
.venv/bin/python -m pytest tests/test_api/test_orders_validation.py --tb=short
```

**Expected:**
- No tracked `.bak` files remain.
- Script locations match `.cursorrules`.

**Commit:**

```bash
git add backend/tests backend/scripts Tools/backend
git commit -m "chore(repo): clean backend utility files"
```

## Task 10: Reconcile Documentation Structure

**Problem:** Several top-level docs are currently untracked under `docs/`. `.cursorrules` says docs should use the existing category structure.

**Files:**
- Review: `docs/ARCHITECTURE.md`
- Review: `docs/CONFIGURATION.md`
- Review: `docs/DEPLOYMENT.md`
- Review: `docs/DEVELOPMENT.md`
- Review: `docs/TESTING.md`
- Review: `docs/development/GEMINI_EXECUTION_PLAN_2026-04-06.md`
- Review: `docs/plans/2026-05-06-authenticated-ui-extraction.md`

**Steps:**

1. Decide which untracked docs are intended project docs vs temporary generated artifacts.

2. Place docs according to existing structure:

- setup docs under `docs/setup`.
- architecture docs under `docs/architecture`.
- developer process docs under `docs/development`.
- implementation plans under `docs/plans/YYYY-MM-DD-name.md`.

3. Update `docs/README.md` if a new permanent doc is added.

4. Run:

```bash
find docs -maxdepth 2 -type f -name '*.md' | sort
git status --short docs
```

**Expected:**
- No duplicate top-level docs unless `docs/README.md` intentionally indexes them.
- Plan files remain under `docs/plans`.

**Commit:**

```bash
git add docs
git commit -m "docs: organize repository hygiene documentation"
```

## Final Verification Gate

Run full local verification after all tasks:

```bash
git status --short --branch

cd frontend
node --version
pnpm run format:check
pnpm run lint
pnpm run type-check
pnpm test -- --ci --forceExit

cd ../backend
.venv/bin/python -m black --check --line-length 100 app/
.venv/bin/python -m isort --check-only --profile black app/
.venv/bin/python -m flake8 app/ --max-line-length 100 --extend-ignore E203,W503
.venv/bin/python -m bandit -r app/ -ll
.venv/bin/python -m pytest --tb=short --cov=app --cov-fail-under=80 -q
```

Expected final state:

- Frontend format, lint, type-check, and tests pass.
- Backend format, import sorting, lint, Bandit, and tests pass.
- No `.env`, `.auth`, secrets, generated Expo output, or screenshots are staged.
- `rg -n "\\bfetch\\s*\\(" frontend/app frontend/components frontend/hooks frontend/store frontend/lib` has no boundary violations.
- `rg -n "from sqlalchemy|select\\(|db\\.execute|from app\\.db\\.models" backend/app/api/v1` has no router business-logic violations.
- `rg -n "console\\.log|debugger" frontend/app frontend/components frontend/hooks frontend/store frontend/lib frontend/api` returns no production debug output.
- Remaining `any` uses are either gone or limited to test mocks with an explicit lint override.
