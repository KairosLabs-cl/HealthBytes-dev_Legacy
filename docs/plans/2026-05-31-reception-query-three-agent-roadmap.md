# Reception and Query Reliability: Three-Agent Roadmap

> **For Codex / Jules / OpenCode:** REQUIRED SKILLS: use `executing-plans`, `test-driven-development`, and `systematic-debugging`. Read `.cursorrules`, `.agents/router.json`, `.agents/agents/tasks.json`, and the assigned executable agent profile before editing.

**Goal:** Resolve the three traced end-to-end reception and query behaviors for orders, rapid cart removals, and repeated wishlist likes without broad refactors.

**Architecture:** Split work by user flow so each agent owns one observable behavior from React Native UI through Zustand, HTTP, FastAPI, SQLAlchemy, and PostgreSQL. Keep shared frontend transport ownership explicit: Agent B owns any required edit to `frontend/api/auth.ts`; Agent C must not edit that file concurrently. Merge Agent B before Agent C when Agent C depends on shared transport behavior.

**Tech Stack:** React Native, Expo, TypeScript, Zustand, FastAPI, SQLAlchemy 2.x async, PostgreSQL, pytest, Jest, pnpm.

**Source Trace:** `docs/development/inspections/2026-05-31-execution-tracing-orders-cart-wishlist.html`

---

## 1. Verified Starting Facts

These facts come from current code. They are investigation inputs, not assumptions about root cause.

| Flow | Current observable code path |
|---|---|
| Orders | `GET /orders` filters `orders.status`. UI exposes `unpaid`, `processing`, `shipped`, `delivered`, and `returns`. Current list path does not query `payments`. |
| Cart removal | `DELETE /cart/items/{product_id}` returns HTTP `204 No Content`. Shared `fetchWithAuth()` calls `res.json()` after successful responses. Store catches rejected removal promises and then calls `GET /cart`. |
| Wishlist toggle | POST adds favorite and DELETE removes favorite. DELETE returns HTTP `204 No Content`; shared `fetchWithAuth()` calls `res.json()`. Store performs optimistic Set updates. Repeated toggles have no per-product in-flight guard. |

Primary references:

- `frontend/api/auth.ts:67-152`
- `frontend/store/cartStore.ts:318-352`
- `frontend/store/favoritesStore.ts:29-53`
- `backend/app/api/v1/orders.py:120-182`
- `backend/app/services/order_service.py:172-198`
- `backend/app/api/v1/cart.py:61-72`
- `backend/app/services/cart_service.py:130-139`
- `backend/app/api/v1/favorites.py:19-65`
- `backend/app/services/favorite_service.py:15-80`

---

## 2. Mandatory Kanban Gate

Do not launch implementation agents until these entries exist in `.agents/agents/tasks.json` and appear in the `todo` or `in-progress` column:

```json
{
  "task-20260531-orders-payment-query-contract": {
    "id": "task-20260531-orders-payment-query-contract",
    "content": "Definir y corregir contrato end-to-end de consulta de órdenes pagadas y no pagadas con tests",
    "agent": "backend-dev"
  },
  "task-20260531-cart-delete-response-contract": {
    "id": "task-20260531-cart-delete-response-contract",
    "content": "Corregir contrato end-to-end de eliminación rápida y consecutiva de ítems del carrito con tests",
    "agent": "frontend-dev"
  },
  "task-20260531-wishlist-toggle-concurrency": {
    "id": "task-20260531-wishlist-toggle-concurrency",
    "content": "Corregir comportamiento end-to-end de likes repetidos en wishlist con tests",
    "agent": "frontend-dev"
  }
}
```

Todo:

- [ ] Add the three explicit Kanban tasks.
- [ ] Add IDs to `columns.todo.taskIds` or `columns.in-progress.taskIds`.
- [ ] Create one worktree and branch per task.
- [ ] Confirm existing user changes in `frontend/package.json` and `frontend/pnpm-lock.yaml` remain untouched unless separately approved.

Suggested branches:

```text
fix/orders-payment-query-contract
fix/cart-delete-response-contract
fix/wishlist-toggle-concurrency
```

---

## 3. Parallelization Map

| Wave | Agent | Domain | Parallel status | Shared-file rule |
|---|---|---|---|---|
| 1 | Agent A | Orders payment/query contract | Run immediately | No edit to `frontend/api/auth.ts` |
| 1 | Agent B | Cart DELETE response contract | Run immediately | Sole owner of `frontend/api/auth.ts` |
| 1 | Agent C | Wishlist toggle concurrency | Run immediately for tests and domain edits | Do not edit `frontend/api/auth.ts`; rebase after Agent B |
| 2 | Hermes verifier | Integration | Run after A, B, C merge | Resolve integration only; no unrelated refactor |

Agent A, B, and C can investigate and implement domain-specific work in parallel. Agent C must treat shared transport parsing as an external dependency owned by Agent B.

---

## 4. Global Todo List

### Preparation

- [ ] Review source trace HTML.
- [ ] Add Kanban entries.
- [ ] Create isolated worktrees.
- [ ] Record base commit used by all agents.

### Wave 1: Parallel agents

- [ ] Launch Agent A with prompt in section 5.
- [ ] Launch Agent B with prompt in section 6.
- [ ] Launch Agent C with prompt in section 7.
- [ ] Require each agent to return root cause evidence, changed files, exact commands, pass/fail counts, and unresolved blockers.

### Wave 2: Integration order

- [ ] Review Agent B first because it owns shared transport helper.
- [ ] Merge Agent B.
- [ ] Rebase Agent C on merged Agent B.
- [ ] Run Agent C focused tests after rebase.
- [ ] Merge Agent C.
- [ ] Review and merge Agent A after product-contract checkpoint is satisfied.

### Wave 3: Verification

- [ ] Run focused backend API and service tests for orders, cart, and favorites.
- [ ] Run focused frontend tests for auth transport, cart store, and favorites store.
- [ ] Run `pnpm run type-check`.
- [ ] Run repo lint commands for touched stacks.
- [ ] Run broad backend and frontend test suites.
- [ ] Ask `hermes-verifier` to review behavior, docs consistency, task evidence, and PR gate.

---

## 5. Agent A Prompt: Orders Payment and Query Contract

**Task ID:** `task-20260531-orders-payment-query-contract`

**Executable profile:** Load `.agents/agents/backend-dev.md`.

**Scope:** Orders list reception and query contract only.

```markdown
You are Agent A, backend owner for HealthBytes orders query contract.

Mandatory startup:
1. Read `.cursorrules`.
2. Read `.agents/router.json`.
3. Confirm `task-20260531-orders-payment-query-contract` exists in `.agents/agents/tasks.json`.
4. Load `.agents/agents/backend-dev.md`.
5. Read `docs/development/inspections/2026-05-31-execution-tracing-orders-cart-wishlist.html`.
6. Use `systematic-debugging` and `test-driven-development`.

Objective:
Determine and implement the smallest correct end-to-end contract for listing paid and unpaid orders. Current UI asks for paid/unpaid behavior, but current order list path filters only `orders.status`; it does not query `payments`. Do not invent payment semantics.

Required investigation:
1. Trace payment creation, payment status updates, Mercado Pago webhooks, order status transitions, and existing order tests.
2. Identify canonical source for payment state:
   - `orders.status`,
   - latest row in `payments`,
   - another reviewed source,
   - or no canonical source currently exists.
3. Report evidence with file:line references before implementation.
4. If no canonical rule maps payment records to paid/unpaid orders, stop and return a product-contract blocker. Ask for an explicit rule. Do not guess.

Allowed files after contract is proven:
- `backend/app/api/v1/orders.py`
- `backend/app/services/order_service.py`
- `backend/app/schemas/order.py`
- focused order/payment tests under `backend/tests/`
- frontend order API/store/screen only if request/response contract requires it:
  - `frontend/api/orders.ts`
  - `frontend/store/orderStore.ts`
  - `frontend/app/orders.tsx`
  - `frontend/types/order.ts`

Forbidden:
- Broad refactors.
- New dependencies.
- Changes to `frontend/api/auth.ts`.
- Schema migrations unless evidence proves they are required and user approves.
- Treating delivery status as payment status without an explicit source-backed rule.

TDD workflow:
1. Add failing backend tests for current required paid/unpaid query behavior.
2. Run focused tests and capture expected failure.
3. Implement minimal service/router contract.
4. Add or update frontend tests only if frontend contract changes.
5. Run focused backend tests.
6. Run frontend tests and `pnpm run type-check` if frontend changed.

Verification minimum:
cd backend
python -m pytest tests/test_api/test_orders.py tests/test_api/test_orders_pagination.py tests/test_services/test_order_service.py -q

Return:
- Canonical payment-state source and evidence.
- Root cause.
- Exact files changed.
- Exact commands and results.
- Any blocker requiring product decision.
- No PR until task gate and checks pass.
```

Acceptance criteria:

- [ ] Canonical paid/unpaid source documented with file references.
- [ ] No inferred mapping between fulfillment and payment state.
- [ ] Query tests cover paid, unpaid, absent payment data, auth ownership, pagination, and any new filter validation.
- [ ] Frontend request shape and backend accepted query shape match.

---

## 6. Agent B Prompt: Rapid Cart DELETE Reception Contract

**Task ID:** `task-20260531-cart-delete-response-contract`

**Executable profile:** Load `.agents/agents/frontend-dev.md`; use backend files only where tests require contract confirmation.

**Scope:** Shared HTTP success parsing and cart removal flow. Agent B exclusively owns `frontend/api/auth.ts`.

```markdown
You are Agent B, end-to-end owner for HealthBytes cart DELETE response contract.

Mandatory startup:
1. Read `.cursorrules`.
2. Read `.agents/router.json`.
3. Confirm `task-20260531-cart-delete-response-contract` exists in `.agents/agents/tasks.json`.
4. Load `.agents/agents/frontend-dev.md`.
5. Read `docs/development/inspections/2026-05-31-execution-tracing-orders-cart-wishlist.html`.
6. Use `systematic-debugging`, `test-driven-development`, and `native-data-fetching`.

Objective:
Fix cart item removal reception so successful HTTP 204 responses are processed as successful removals. Preserve rapid consecutive removal behavior for distinct product IDs and existing duplicate-remove guard for the same product ID.

Verified starting path:
- UI: `frontend/components/CartItem.tsx`
- Store: `frontend/store/cartStore.ts:318-352`
- API: `frontend/api/cart.ts:67-77`
- Shared transport: `frontend/api/auth.ts:67-152`
- Backend router: `backend/app/api/v1/cart.py:61-72`
- Backend service: `backend/app/services/cart_service.py:130-139`

Allowed files:
- `frontend/api/auth.ts`
- existing frontend API tests or a new focused test file under `frontend/api/__tests__/`
- `frontend/store/__tests__/` cart tests
- `frontend/store/cartStore.ts` only if tests prove a domain-level correction is required
- focused backend cart tests only if backend contract coverage is missing

Forbidden:
- Changing backend 204 to a JSON body merely to avoid handling no-content responses.
- Editing wishlist domain files; Agent C owns them.
- Broad auth refactor.
- Dependency changes.

TDD workflow:
1. Write failing transport test proving successful 204 does not call JSON parsing and resolves without payload.
2. Write failing cart-store test proving successful DELETE does not trigger fallback `GET /cart` or error message.
3. Add test for rapid removals of two distinct product IDs: two DELETE calls, optimistic removal retained.
4. Add test for repeated same-ID removal while in flight: one DELETE call.
5. Implement minimal shared transport correction.
6. Run focused tests and type check.

Verification minimum:
cd frontend
pnpm test -- --runInBand api/__tests__ store/__tests__
pnpm run type-check

cd ../backend
python -m pytest tests/test_api/test_cart.py tests/test_services/test_cart_service.py -q

Return:
- Root cause with file:line evidence.
- Exact behavior of 200/201 JSON and 204 no-content responses after change.
- Exact files changed.
- Exact commands and results.
- Any conflict risk for Agent C.
```

Acceptance criteria:

- [ ] `fetchWithAuth()` resolves successful 204 without parsing JSON.
- [ ] Existing JSON responses still parse.
- [ ] Different cart IDs can be removed consecutively.
- [ ] Same cart ID does not issue duplicate in-flight DELETE.
- [ ] Backend DELETE remains scoped by authenticated user and product ID.

---

## 7. Agent C Prompt: Repeated Wishlist Toggle Contract

**Task ID:** `task-20260531-wishlist-toggle-concurrency`

**Executable profile:** Load `.agents/agents/frontend-dev.md`.

**Scope:** Wishlist repeated-like behavior and focused backend semantics. Do not edit shared transport concurrently.

```markdown
You are Agent C, end-to-end owner for HealthBytes repeated wishlist toggle behavior.

Mandatory startup:
1. Read `.cursorrules`.
2. Read `.agents/router.json`.
3. Confirm `task-20260531-wishlist-toggle-concurrency` exists in `.agents/agents/tasks.json`.
4. Load `.agents/agents/frontend-dev.md`.
5. Read `docs/development/inspections/2026-05-31-execution-tracing-orders-cart-wishlist.html`.
6. Use `systematic-debugging`, `test-driven-development`, and `native-data-fetching`.

Objective:
Define through tests and implement deterministic wishlist state when a user presses Like repeatedly on one product. Preserve optimistic UI only if tests prove final client state reconciles with accepted server operations.

Verified starting path:
- UI: `frontend/components/FavoriteButton.tsx`
- Store: `frontend/store/favoritesStore.ts:29-53`
- API: `frontend/api/favorites.ts:11-22`
- Shared transport: `frontend/api/auth.ts:67-152`
- Backend router: `backend/app/api/v1/favorites.py:19-65`
- Backend service: `backend/app/services/favorite_service.py:15-80`

Coordination rule:
- Do not edit `frontend/api/auth.ts`. Agent B owns 204 parsing.
- Build tests against expected transport behavior after Agent B merge.
- If shared transport blocks tests, report dependency and continue with domain tests or a suggested patch description only.

Allowed files:
- `frontend/store/favoritesStore.ts`
- `frontend/store/__tests__/favoritesStore.test.ts`
- `frontend/components/FavoriteButton.tsx` and focused component tests only if UI guarding is required by proven behavior
- `backend/app/api/v1/favorites.py`
- `backend/app/services/favorite_service.py`
- `backend/tests/test_api/test_favorites_crud.py`
- `backend/tests/test_services/test_favorite_service.py`

Required investigation:
1. Reproduce sequences for rapid presses on same product:
   - add → add before first response,
   - add → remove,
   - remove → add,
   - DELETE 204,
   - POST 409 duplicate,
   - DELETE 404 absent favorite.
2. Decide minimal deterministic contract based on existing UI intent and backend semantics.
3. Keep router/service ownership boundaries intact.

TDD workflow:
1. Add failing store tests for repeated same-product presses.
2. Add failing API/service tests only if backend idempotency semantics must change.
3. Implement minimal domain correction.
4. Rebase on Agent B before final verification.
5. Run focused tests and type check.

Verification minimum:
cd frontend
pnpm test -- --runInBand store/__tests__/favoritesStore.test.ts
pnpm run type-check

cd ../backend
python -m pytest tests/test_api/test_favorites_crud.py tests/test_services/test_favorite_service.py -q

Return:
- Root cause with file:line evidence.
- Chosen deterministic toggle contract.
- Exact files changed.
- Exact commands and results before and after Agent B rebase.
- Any unresolved dependency.
```

Acceptance criteria:

- [ ] Repeated likes on same product have tested deterministic final state.
- [ ] DELETE 204 path is verified after Agent B merge.
- [ ] POST 409 and DELETE 404 semantics are explicitly tested or intentionally changed with evidence.
- [ ] No concurrent edit to `frontend/api/auth.ts`.

---

## 8. Hermes Integration Prompt

Run only after Agent A, Agent B, and rebased Agent C report focused checks.

```markdown
You are Hermes verifier for HealthBytes reception/query reliability integration.

Mandatory startup:
1. Read `.cursorrules`.
2. Read `.agents/router.json`.
3. Confirm all three task IDs exist in `.agents/agents/tasks.json`.
4. Load `.agents/agents/hermes-verifier.md`.
5. Read `docs/plans/2026-05-31-reception-query-three-agent-roadmap.md`.
6. Read each agent summary and inspect actual diffs. Do not trust summaries alone.

Verification duties:
1. Confirm Agent B is sole intentional editor of `frontend/api/auth.ts`.
2. Confirm 204 no-content responses resolve without JSON parsing while JSON responses still parse.
3. Confirm rapid cart removals for distinct IDs and same-ID guard tests.
4. Confirm repeated wishlist toggles have deterministic tested final state after Agent B merge.
5. Confirm orders paid/unpaid source is explicit and source-backed. Fail verification if fulfillment status was silently treated as payment status.
6. Confirm no unrelated changes, dependency changes, secrets, console.log, debugger, or new TypeScript any.
7. Run focused checks, then broad checks.

Commands:
cd backend
python -m pytest tests/test_api/test_orders.py tests/test_api/test_orders_pagination.py tests/test_services/test_order_service.py tests/test_api/test_cart.py tests/test_services/test_cart_service.py tests/test_api/test_favorites_crud.py tests/test_services/test_favorite_service.py -q
python -m pytest --cov=app --cov-report=term-missing --tb=short -q

cd ../frontend
pnpm run type-check
pnpm lint
pnpm test -- --runInBand

Return:
- Pass/fail table by flow.
- Exact commands and counts.
- Diff review findings with file:line.
- Task-gate status.
- PR readiness verdict.
```

---

## 9. Merge and PR Gate

Merge only when:

- [ ] Three task IDs exist in Kanban.
- [ ] Branch names follow `fix/<short-description>`.
- [ ] Agent B merged before final Agent C verification.
- [ ] Agent A product-contract checkpoint is resolved.
- [ ] Focused checks pass.
- [ ] Broad checks pass or exact blockers are documented.
- [ ] No `.env`, credentials, tokens, passwords, sensitive logs, `console.log`, or `debugger` are staged.
- [ ] No unrelated user changes are included.
- [ ] PR descriptions follow `.github/PULL_REQUEST_TEMPLATE.md`.

Recommended PR order:

1. `fix/cart-delete-response-contract`
2. `fix/wishlist-toggle-concurrency`
3. `fix/orders-payment-query-contract`

Orders PR may proceed earlier if its contract is proven and its diff does not overlap the other agents.

---

## 10. Completion Record

After verification, create:

```text
docs/development/inspections/2026-05-31-reception-query-three-agent-verification.md
```

Record:

- Base commit and final commits.
- Kanban task IDs.
- Agent summaries.
- Exact focused and broad verification commands.
- Pass/fail counts.
- Remaining blockers.
- PR URLs or reason PR creation was blocked.
