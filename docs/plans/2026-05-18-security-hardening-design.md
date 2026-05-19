# Security Hardening Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement Refresh Token Rotation, correct authorization status codes, and harden CI/CD and infrastructure security.

**Architecture:**
- **Backend:** Add a `RefreshToken` model to track active sessions. Implement rotation logic in `auth_service.py`. Access token life reduced to 1 hour.
- **Frontend:** Update `authStore.ts` to manage refresh tokens. Implement silent refresh logic in `fetchWithAuth`.
- **DevOps:** Update CI/CD to block on security vulnerabilities and enforce Redis in production.

**Tech Stack:** FastAPI, SQLAlchemy, JWT (JOSE), React Native, Zustand, GitHub Actions.

---

### Task 1: Backend - Refresh Token Model and Security Core

**Goal:** Set up the database and core logic for long-lived refresh tokens.

**Files:**
- Create: `backend/app/db/models/refresh_token.py`
- Modify: `backend/app/db/schemas.py` (Import new model)
- Modify: `backend/app/core/security.py`
- Modify: `backend/app/config.py`

**Step 1: Create RefreshToken Model**
Create `backend/app/db/models/refresh_token.py` with `id`, `user_id`, `token` (hashed), `expires_at`, `created_at`, and `revoked`.

**Step 2: Update Config**
Reduce `ACCESS_TOKEN_EXPIRE_MINUTES` to 60. Add `REFRESH_TOKEN_EXPIRE_DAYS = 30`.

**Step 3: Update Security Core**
Add `create_refresh_token` and `verify_refresh_token` to `security.py`.

---

### Task 2: Backend - Auth Service and Rotation Logic

**Goal:** Implement the logic to issue and rotate tokens.

**Files:**
- Modify: `backend/app/services/auth_service.py`
- Create: `backend/app/schemas/token.py`

**Step 1: Update Auth Response Schema**
Add `refresh_token` to the response payload.

**Step 2: Implement Rotation in Service**
Update `login_with_token` to generate both tokens and save the refresh token to DB.
Implement `refresh_access_token` service that validates the old refresh token, revokes it, and issues a new pair.

---

### Task 3: Backend - Auth Endpoints and Role Status Codes

**Goal:** Expose the refresh endpoint and fix authorization semantics.

**Files:**
- Modify: `backend/app/api/v1/auth.py`
- Modify: `backend/app/middleware/auth.py`

**Step 1: Add Refresh Endpoint**
Add `POST /auth/refresh` that takes a refresh token and returns a new token pair.

**Step 2: Fix 401 to 403**
Update `verify_seller` and `verify_admin` in `middleware/auth.py` to return 403 Forbidden instead of 401 Unauthorized for role mismatches.

---

### Task 4: Frontend - Token Management and Silent Refresh

**Goal:** Ensure the app handles short-lived tokens and rotates them automatically.

**Files:**
- Modify: `frontend/store/authStore.ts`
- Modify: `frontend/api/auth.ts`

**Step 1: Update AuthStore**
Add `refreshToken` to the state and persistence.

**Step 2: Update fetchWithAuth Interceptor**
Add logic to `fetchWithAuth` to detect 401 errors, call `/auth/refresh`, update the store, and retry the original request once.

---

### Task 5: DevOps - CI/CD and Infrastructure Hardening

**Goal:** Enforce security gates and production constraints.

**Files:**
- Modify: `.github/workflows/ci.yml`
- Modify: `backend/app/core/limiter.py`
- Modify: `docker-compose.yml`

**Step 1: Harden CI Safety Check**
Remove `continue-on-error: true` from the `safety check` step in `ci.yml`.

**Step 2: Enforce Redis Rate Limiting**
Update `limiter.py` to raise an error if `ENVIRONMENT == "production"` and `REDIS_URL` is missing.

**Step 3: Redis Auth in Docker**
Update `docker-compose.yml` to use a password for Redis and update the backend service to use it.
