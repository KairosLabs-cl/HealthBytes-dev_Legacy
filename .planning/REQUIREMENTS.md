# Requirements

**Version:** 1.0
**Milestone:** Quality & Security Hardening
**Updated:** 2026-04-13

## Requirements Overview

Based on user priorities:
1. Accept open PRs in the repo
2. Fix security issues that are open
3. Security & hardening, Bug fixes & polish
4. No timeline - quality over speed

---

## Category: PR Acceptance

### PR-01: Timing Attack Fixes

**Status:** OPEN (Multiple PRs)

**Description:** Fix timing attack vulnerabilities in authentication

**Related PRs:**
- #142: CRITICAL - Registration timing attack
- #141: HIGH - User enumeration in registration  
- #139: HIGH - Registration enumeration
- #149: HIGH - Login user enumeration
- #148: MEDIUM - User enumeration timing

**Requirements:**

- PR-01a: Fix timing attack in user registration endpoint
- PR-01b: Fix timing attack in user login endpoint
- PR-01c: Ensure constant-time comparison for credential validation

---

### PR-02: Performance Optimizations

**Status:** OPEN (Multiple PRs)

**Description:** Fix unnecessary re-renders in React Native components

**Related PRs:**
- #147: Prevent HomeScreen re-renders on favorite toggle
- #137: Prevent full app re-renders from layout store
- #135: Fix full layout re-renders
- #138: Optimize Zustand selector in root layout
- #145: Optimize cart selector in Product Details

**Requirements:**

- PR-02a: Fix favorite toggle causing full screen re-renders
- PR-02b: Prevent layout store causing full app re-renders
- PR-02c: Optimize cart selectors

---

### PR-03: Documentation Updates

**Status:** OPEN

**Description:** Auto-update metrics documentation

**Requirements:**

- PR-03a: Merge documentation sync PRs

---

## Category: Security Hardening

### SEC-01: Rate Limiter Storage

**Issue:** I-10 (HIGH)

**Description:** Rate limiter uses memory storage instead of Redis, bypassable in multi-instance deployment

**Files:**
- `backend/app/core/limiter.py`

**Requirements:**

- SEC-01a: Update rate limiter to use Redis in production
- SEC-01b: Add validation requiring REDIS_URL in production config

---

### SEC-02: CI Safety Check

**Issue:** I-05 (HIGH)

**Description:** Safety check passes CI with `continue-on-error: true`, critical CVEs don't block merge

**Files:**
- `.github/workflows/ci.yml`

**Requirements:**

- SEC-02a: Remove `--continue-on-error` from safety check
- SEC-02b: Use `--severity critical,high`

---

### SEC-03: HTTP Status Codes

**Issue:** I-12 (MEDIUM)

**Description:** Role authorization returns 401 (Unauthorized) instead of 403 (Forbidden)

**Files:**
- `backend/app/middleware/auth.py` (lines 239, 249)

**Requirements:**

- SEC-03a: Change verify_seller to return 403
- SEC-03b: Change verify_admin to return 403

---

### SEC-04: JWT Token Expiration

**Issue:** I-13 (MEDIUM)

**Description:** JWT tokens expire in 30 days (43200 minutes), no refresh mechanism

**Files:**
- `backend/app/config.py` (line 22)

**Requirements:**

- SEC-04a: Implement short-lived access tokens (1 hour)
- SEC-04b: Implement refresh token mechanism

---

### SEC-05: Duplicate Database Queries

**Issue:** I-11 (MEDIUM)

**Description:** User lookup happens twice per authenticated request

**Files:**
- `backend/app/main.py`
- `backend/app/middleware/auth.py`

**Requirements:**

- SEC-05a: Cache user in request.state from middleware
- SEC-05b: Reuse cached user in get_current_user

---

## Category: Bug Fixes & Polish

### BUG-01: TypeScript Errors

**Description:** Icon component has @ts-expect-error annotations

**Files:**
- `frontend/components/ui/icon/index.web.tsx`

**Requirements:**

- BUG-01a: Resolve gluestack-ui type compatibility issues
- BUG-01b: Remove technical debt from type workarounds

---

### BUG-02: Backend TODO Comments

**Description:** Pending TODO items in code

**Files:**
- `backend/app/api/v1/orders.py` (seller filtering)
- `backend/tests/test_api/test_orders_crud.py`

**Requirements:**

- BUG-02a: Implement seller_id filtering in Product schema
- BUG-02b: Add tests for seller order filtering

---

### BUG-03: Error Handling

**Description:** Widespread bare exception handling (78 matches)

**Requirements:**

- BUG-03a: Add specific error type handling
- BUG-03b: Fix silent failures in error paths

---

### BUG-04: Console Logs in Production

**Description:** Console.log statements in production code

**Files:**
- `frontend/api/mercadopago.ts`
- `frontend/app/checkout-v2.tsx`

**Requirements:**

- BUG-04a: Remove or wrap with __DEV__ check
- BUG-04b: Verify no PII exposure

---

## Requirements Summary

| Category | Requirements | Priority |
|----------|---------------|----------|
| PR Acceptance | 10 | P0 |
| Security | 9 | P0 |
| Bug Fixes | 8 | P1 |

---

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| PR-01a-c | Phase 1 | Pending |
| PR-02a-c | Phase 1 | Pending |
| PR-03a | Phase 1 | Pending |
| SEC-01a-b | Phase 2 | Pending |
| SEC-02a-b | Phase 2 | Pending |
| SEC-03a-b | Phase 2 | Pending |
| SEC-04a-b | Phase 2 | Pending |
| SEC-05a-b | Phase 2 | Pending |
| BUG-01a-b | Phase 3 | Pending |
| BUG-02a-b | Phase 3 | Pending |
| BUG-03a-b | Phase 3 | Pending |
| BUG-04a-b | Phase 3 | Pending |

---

*Generated by GSD workflow - 2026-04-13*