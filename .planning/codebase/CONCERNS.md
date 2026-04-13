# Codebase Concerns

**Analysis Date:** 2026-04-13

## Tech Debt

### TODO Comments Pending

**Frontend Icon TypeScript Errors:**
- Files: `frontend/components/ui/icon/index.web.tsx` (lines 37, 50, 59, 92)
- Issue: Multiple `@ts-expect-error` annotations with "TODO: fix this" comments
- Impact: Type safety compromised, technical debt accumulates
- Fix approach: Resolve gluestack-ui type compatibility issues or document known incompatibilities

**Backend TODO:**
- File: `backend/app/api/v1/orders.py` (lines 141, 148)
- Issue: Seller order filtering not implemented - TODO comment for seller_id in Product schema
- Impact: Sellers cannot see their specific product orders
- Fix approach: Add seller_id field to Product model and implement filtering

**Backend Test TODO:**
- File: `backend/tests/test_api/test_orders_crud.py` (line 144)
- Issue: TODO comment indicating seller filtering not yet implemented
- Fix approach: Implement seller_id filtering in Product schema

### Unresolved Type Safety Issues

**Icon Component Type Errors:**
- File: `frontend/components/ui/icon/index.web.tsx`
- Pattern: `@ts-expect-error` used as workaround for ref type mismatches
- Impact: TypeScript cannot validate component props correctly

## Security Considerations

### High Priority Security Issues

**Rate Limiter Using Memory Storage (I-10):**
- File: `backend/app/core/limiter.py` (line 56)
- Issue: `storage_uri="memory://"` instead of Redis
- Impact: Rate limiting bypassable in multi-instance deployments (ECS Fargate)
- Current mitigation: Single instance in dev environment
- Recommendations:
  - Use Redis for distributed rate limiting in production
  - Add validation requiring REDIS_URL in production config

**Safety Check Not Failing Pipeline (I-05):**
- File: `.github/workflows/ci.yml` (line 90)
- Issue: `safety check --continue-on-error: true`
- Impact: Critical CVEs pass CI without blocking merge
- Recommendations: Remove continue-on-error, use `--severity critical,high`

**Verify_Seller/Verify_Admin Return 401 Instead of 403 (I-12):**
- File: `backend/app/middleware/auth.py` (lines 239, 249)
- Issue: Role authorization failures return 401 (Unauthorized) instead of 403 (Forbidden)
- Impact: Client receives incorrect error semantics
- Security risk: Could confuse client auth logic
- Fix approach: Change to 403 Forbidden with descriptive message

**JWT Token Expiration (I-13):**
- File: `backend/app/config.py` (line 22)
- Issue: `ACCESS_TOKEN_EXPIRE_MINUTES = 43200` (30 days)
- Impact: Long-lived tokens without refresh mechanism
- Recommendations: Implement short-lived access tokens (1 hour) with refresh tokens

### Medium Priority Security Issues

**Duplicate Database Queries in Middleware:**
- Files: `backend/app/main.py` (lines 125-131), `backend/app/middleware/auth.py`
- Issue: User lookup happens twice per authenticated request (once in rate limit middleware, once in get_current_user)
- Impact: Performance overhead, unnecessary DB load
- Recommendations: Cache user in request.state from middleware, reuse in get_current_user

## Performance Bottlenecks

### Database Query Optimization

**Duplicate User Lookups:**
- Files: `backend/app/main.py`, `backend/app/middleware/auth.py`
- Pattern: Both middleware and handler query User table for same user
- Impact: 2x DB queries per authenticated request
- Fix approach: Implement request.state caching pattern

**Middleware Order Suboptimal (I-11):**
- File: `backend/app/main.py`
- Issue: Rate limiting runs before body size check, allowing oversized payloads to hit rate limiter
- Impact: Unnecessary processing of rejected requests
- Fix approach: Reorder middleware stack using explicit Middleware list

## Dependency Vulnerabilities

### Known Unpatched Vulnerabilities

**ajv MEDIUM (Deferred):**
- Package: `ajv`
- Severity: MEDIUM
- Reason: ESLint 9 ecosystem pending v2.0 plugins
- Status: Deferred - only affects dev dependencies

**bn.js MEDIUM:**
- Package: `bn.js` (via @solana/web3.js)
- Severity: MEDIUM
- Status: No upstream patch available
- Mitigation: @clerk/clerk-expo updated to 2.19.26 to reduce exposure

**Validation:** `pnpm audit --prod` returns "No known vulnerabilities found"

## Error Handling Patterns

### Bare Exception Handling

**Widespread Pattern:**
- Files: Multiple service and API files across backend
- Pattern: `except Exception as e:` without specific error type handling
- Count: 78 matches across 24 files
- Impact: Harder to debug, may swallow specific error types
- Examples:
  - `backend/app/main.py` (line 145): Silent pass on auth failures
  - `backend/app/services/product_service.py` (line 296): Fallback on FTS failure
  - `backend/app/api/v1/orders.py` (lines 116, 198, etc.): Generic exception catching

**Silent Failures:**
- File: `backend/app/main.py` (line 145)
- Pattern: `except Exception: pass` in rate limiting middleware
- Impact: Auth failures silently fall back to IP-based rate limiting
- Risk: Security-relevant errors may go unnoticed

### Error Recovery Patterns

**Good Pattern - Fallback with Logging:**
- File: `backend/app/services/product_service.py` (lines 296-320)
- Pattern: FTS failure falls back to LIKE search with warning log
- Impact: Graceful degradation maintained

**Needs Improvement - Silent Swallow:**
- File: `backend/app/api/v1/favorites.py` (multiple locations)
- Pattern: `except Exception as e:` with only logging
- Impact: Errors silently ignored

## Testing Coverage Gaps

### Backend Coverage

**Current State:** 40% coverage (below 80% threshold in some areas)

**Coverage Gaps:**
- Services: Some business logic paths untested
- API endpoints: Edge cases may not be covered
- Error paths: Exception handling not comprehensively tested

### Frontend Coverage

**Missing Coverage Enforcement (I-06):**
- File: `.github/workflows/ci.yml` (line 146)
- Issue: Jest runs without `--coverage` or minimum threshold
- Impact: Tests can pass with 0% coverage
- Fix approach: Add `--coverage --coverageThreshold='{"global":{"lines":70}}'`

### Integration Tests

**Missing Areas:**
- Webhook handling: MercadoPago webhook validation not fully tested
- Email service: Error paths in Resend integration
- Rate limiting: End-to-end testing with multiple requests

## Build/Deployment Concerns

### CI/CD Issues (from Infrastructure Audit)

**Critical Issues:**
1. **I-01**: Docker compose has hardcoded fallback secrets
   - File: `docker-compose.yml`
   - Impact: Default credentials if env vars missing

2. **I-08**: ECS task definition stored as GitHub Secret JSON
   - Impact: Infrastructure not versioned, no code review possible
   - Fix: Move to `infra/ecs/*.json` in repo

3. **I-02**: Redis exposed without authentication
   - File: `docker-compose.yml`
   - Impact: Unauthorized access to rate limiter store

**Medium Priority:**
- **I-04**: Containers run as root user
- **I-07**: Long-lived AWS credentials instead of OIDC
- **I-09**: No migration rollback gate in deploy

## Code Quality Issues

### Console Statements in Production Code

**Frontend console.log Statements:**
- Files:
  - `frontend/api/mercadopago.ts` (lines 71, 110): Payment debugging logs
  - `frontend/api/orders.ts` (lines 29-30): Token debugging logs
  - `frontend/app/checkout-v2.tsx` (lines 122, 135, 137, 148, 153): Checkout flow logs
  - `frontend/hooks/usePushNotifications.ts` (line 64): Device requirement warning
  - `frontend/lib/cache.ts` (line 9): Cache debugging

- Impact: Information leakage in production, potential PII exposure
- Most wrapped with `__DEV__` check, but some production logs remain

**Backend print() Statements:**
- Files: Multiple scripts in `backend/scripts/`, `backend/tests/performance/`
- Impact: Development tooling only, not in API code
- Note: Acceptable for CLI scripts

### Hardcoded Values

**Magic Numbers:**
- File: `backend/app/config.py` (line 22): `ACCESS_TOKEN_EXPIRE_MINUTES = 43200` with inline comment
- Pattern: Configuration values documented inline
- Assessment: Acceptable with documentation

**Test Data:**
- File: `backend/app/core/security.py` (line 17): Dummy password hash for timing attack mitigation
- Assessment: Intentionally documented security pattern

## Scalability Limitations

### Current Constraints

**Rate Limiting:**
- Current: In-memory (`memory://`) storage
- Limit: Single instance only
- Fix: Requires Redis for horizontal scaling

**Database Connection:**
- Async SQLAlchemy configured correctly
- No connection pooling issues detected

**Session/Cache:**
- Redis configured for product cache (5 minute TTL)
- Session storage not implemented (stateless JWT)

## Missing Documentation

### Type Definitions

**Frontend Type Gaps:**
- File: `frontend/components/ui/icon/index.web.tsx`
- Issue: `@ts-expect-error` annotations indicate missing type definitions
- Impact: IDE autocomplete may not work correctly

### Inline Documentation

**Missing Docstrings:**
- Most API endpoints have good documentation
- Some service methods lack parameter documentation
- Assessment: Generally well-documented

## Security Anti-Patterns

### None Currently Detected

**Positive Findings:**
- No hardcoded secrets in source code
- SQLAlchemy ORM used (prevents SQL injection)
- JWT tokens cryptographically verified
- Clerk JWKS verification implemented
- Password hashing with bcrypt (72-byte truncation for compatibility)
- Timing attack mitigation in login flow
- CORS properly configured (no wildcard with credentials)

### Areas Requiring Vigilance

**Auth Middleware:**
- File: `backend/app/middleware/auth.py`
- Pattern: `DEV_BYPASS_AUTH=true` bypasses authentication
- Risk: Must never be enabled in production
- Current mitigation: Only enabled when ENVIRONMENT="dev"

## Summary Matrix

| Category | Severity | Items | Top Priority |
|----------|----------|-------|--------------|
| Security | HIGH | 4 | Rate limiter memory, CI safety check, 401/403, JWT expiry |
| Performance | MEDIUM | 2 | Duplicate queries, middleware order |
| Tech Debt | MEDIUM | 3 | TODO comments, TypeScript errors, seller filter |
| Testing | MEDIUM | 2 | Frontend coverage, webhook tests |
| Build/Deploy | HIGH | 3 | Secrets defaults, ECS task def, Redis auth |
| Error Handling | LOW | 2 | Bare exceptions, silent failures |
| Code Quality | LOW | 2 | Console logs, magic numbers |

---

*Concerns audit: 2026-04-13*
