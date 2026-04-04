# Changelog

> Generado automáticamente por `docs/.automation/docsync.py`.
> Para revisión humana antes de cada release, editar esta sección si es necesario.

<!-- DOCSYNC:changelog-body -->
## [2026-04-04] — Snapshot automático

> Generado por `docsync.py` | 1 commits en los últimos 7 días
> Tests totales: **580** | Coverage backend: **40%** | Endpoints API: **48**

### Sin cambios convencionales registrados en este período

---

## [2026-03-18] — Snapshot automático

> Generado por `docsync.py` | 1 commit en los últimos 7 días
> Tests totales: **572** | Coverage backend: **41%** | Endpoints API: **45**

### Chore
  - chore: ignore macOS resource forks and sync env

---

## [2026-03-08] — Snapshot automático

> Generado por `docsync.py` | 1 commit en los últimos 7 días
> Tests totales: **572** | Coverage backend: **41%** | Endpoints API: **45**

### Sin cambios convencionales registrados en este período

---

## [2026-03-05] — Snapshot automático

> Generado por `docsync.py` | 97 commits en los últimos 7 días
> Tests totales: **571** | Coverage backend: **39%** | Endpoints API: **45**

### Features
  - feat(ui): update UI/UX roadmap and enhance component styling
  - feat(orders): server-side status filtering - filter chips now query backend
  - feat(orders): marketplace status flow unpaid->processing->shipped->delivered->returns
  - feat(orders): new status flow pending→confirmed→in_transit→shipped→delivered
  - feat(frontend): redesign ProductCard with vendor display and image polish
  - feat(backend): add vendor_name field to products
  - feat: connect Redis cache for products with graceful degradation
  - feat: add AuthGate, simplify login, improve error handling
  - feat: add AuthGate, fix infinite /addresses loop, auth checks on cart/checkout/orders/profile
  - feat: update product schema to use Decimal for price and adjust serialization

### Bug Fixes
  - fix(orders): actualizar status en timeline y pending.tsx al nuevo flujo
  - fix(orders): break useEffect infinite loop, read status param from profile nav
  - fix: redirect_slashes=False + route '' to stop 307 loops on bare paths
  - fix(ci): move module-level imports to top of file (flake8 E402)
  - fix(ci): fix isort import order in product_service and database
  - fix(ci): fix backend lint and frontend test suite failures
  - fix(frontend): add missing dietary filter chips and minor UI fixes
  - fix: restore missing except block in product_service.py
  - fix: align app slug/scheme/name and fix CI pnpm version for production
  - fix(ci): pin Black==25.1.0 to prevent version drift between local and CI

### Performance
  - perf(frontend): optimize navbar re-renders and component memoization

- Export selectCartItemCount selector from cartStore to eliminate
  duplicated inline reduce in _layout.tsx and BottomNavBar.tsx
- Rewrite FavoriteButton with granular Zustand selectors and memo
  to prevent cascading re-renders across all visible product cards
- Replace Dimensions.get('window') with useWindowDimensions() in
  CartFlyOverlay for reactive screen size handling
- Remove unused previousItems snapshot variables in cartStore

Closes re-render cascade issue causing perceived navbar slowness.
All 126 existing tests pass with zero regressions."
  - perf(orders): optimize get_order with eager loading
  - perf(orders): eliminate redundant db.refresh in order creation

### Refactor
  - refactor(frontend): make RecentlyViewedBar self-contained
  - refactor(frontend): extract shared ProductCard and DietaryFilterBar components
  - refactor: improve product dietary tag filtering, implement auth timing attack mitigation, and clean up temporary files and .gitignore entries.
  - refactor(frontend): fix any types and gate debug logs with __DEV__
  - refactor: optimize test imports and enhance profile layout with responsive design
  - refactor(api): products router delegates business logic to service layer

### Tests
  - test(orders): actualizar tests del store para el nuevo param status
  - test: add E2E tests for auth gate, checkout flow, and email delivery
  - test(logging): add JSON formatter tests and stabilize auth timing thresholds
  - test(backend): fix checkout_flow test fixtures to use integer user_id
  - test(frontend): update tests to match Bearer auth header and no-resetCart-on-redirect fixes
  - test(cart): update rollback tests to verify syncWithServer() behavior
  - test(backend): fix test_auth_timing comparing string with bytes for the mock hash
  - test(backend): restore dietary tags test deleted during merge conflict resolution
  - test(backend): add missing dietary tags filter reproduction test
  - test(frontend): add Zustand store tests for orders, addresses, favorites

### Docs
  - docs: update roadmap with MVP closure progress (90% complete)
  - docs: cleanup and update all project documentation
  - docs: update README files with accurate info
  - docs: reorganize documentation structure, remove ai-logs
  - docs: add deep project inspection report 2026-03-03 (73/100)
  - Merge docs(db): Order indexes + README updates (Team 9)
  - docs(db): add Order status/created_at indexes; update READMEs
  - docs: README table formatting and add staff engineer review log
  - docs: add UI/UX audit system and development guidelines
  - docs: add comprehensive project roadmap document outlining current status and future development milestones.

### Chore
  - chore(frontend): update vendor names and finalize card typography
  - chore(ai-config): consolidate AI agent configs and remove vendor-specific skill files
  - chore: clean up Claude config files
  - chore: eliminar archivos CLAUDE.md y AGENT.md para optimizar el rendimiento de la IA
  - chore: trigger CI checks
  - chore: add Alembic migration fixing address user_id FK and syncing DB schema
  - chore(ci): upgrade Python to 3.13, add frontend Docker build validation
  - chore(claude): update agents with new superpowers skills references
  - chore(claude): add custom agents and superpowers skills
  - chore(deps): update pnpm-lock.yaml

---

## [2026-03-05] — Snapshot automático

> Generado por `docsync.py` | 97 commits en los últimos 7 días
> Tests totales: **571** | Coverage backend: **39%** | Endpoints API: **45**

### Features
  - feat(ui): update UI/UX roadmap and enhance component styling
  - feat(orders): server-side status filtering - filter chips now query backend
  - feat(orders): marketplace status flow unpaid->processing->shipped->delivered->returns
  - feat(orders): new status flow pending→confirmed→in_transit→shipped→delivered
  - feat(frontend): redesign ProductCard with vendor display and image polish
  - feat(backend): add vendor_name field to products
  - feat: connect Redis cache for products with graceful degradation
  - feat: add AuthGate, simplify login, improve error handling
  - feat: add AuthGate, fix infinite /addresses loop, auth checks on cart/checkout/orders/profile
  - feat: update product schema to use Decimal for price and adjust serialization

### Bug Fixes
  - fix(orders): actualizar status en timeline y pending.tsx al nuevo flujo
  - fix(orders): break useEffect infinite loop, read status param from profile nav
  - fix: redirect_slashes=False + route '' to stop 307 loops on bare paths
  - fix(ci): move module-level imports to top of file (flake8 E402)
  - fix(ci): fix isort import order in product_service and database
  - fix(ci): fix backend lint and frontend test suite failures
  - fix(frontend): add missing dietary filter chips and minor UI fixes
  - fix: restore missing except block in product_service.py
  - fix: align app slug/scheme/name and fix CI pnpm version for production
  - fix(ci): pin Black==25.1.0 to prevent version drift between local and CI

### Performance
  - perf(frontend): optimize navbar re-renders and component memoization

- Export selectCartItemCount selector from cartStore to eliminate
  duplicated inline reduce in _layout.tsx and BottomNavBar.tsx
- Rewrite FavoriteButton with granular Zustand selectors and memo
  to prevent cascading re-renders across all visible product cards
- Replace Dimensions.get('window') with useWindowDimensions() in
  CartFlyOverlay for reactive screen size handling
- Remove unused previousItems snapshot variables in cartStore

Closes re-render cascade issue causing perceived navbar slowness.
All 126 existing tests pass with zero regressions."
  - perf(orders): optimize get_order with eager loading
  - perf(orders): eliminate redundant db.refresh in order creation

### Refactor
  - refactor(frontend): make RecentlyViewedBar self-contained
  - refactor(frontend): extract shared ProductCard and DietaryFilterBar components
  - refactor: improve product dietary tag filtering, implement auth timing attack mitigation, and clean up temporary files and .gitignore entries.
  - refactor(frontend): fix any types and gate debug logs with __DEV__
  - refactor: optimize test imports and enhance profile layout with responsive design
  - refactor(api): products router delegates business logic to service layer

### Tests
  - test(orders): actualizar tests del store para el nuevo param status
  - test: add E2E tests for auth gate, checkout flow, and email delivery
  - test(logging): add JSON formatter tests and stabilize auth timing thresholds
  - test(backend): fix checkout_flow test fixtures to use integer user_id
  - test(frontend): update tests to match Bearer auth header and no-resetCart-on-redirect fixes
  - test(cart): update rollback tests to verify syncWithServer() behavior
  - test(backend): fix test_auth_timing comparing string with bytes for the mock hash
  - test(backend): restore dietary tags test deleted during merge conflict resolution
  - test(backend): add missing dietary tags filter reproduction test
  - test(frontend): add Zustand store tests for orders, addresses, favorites

### Docs
  - docs: update roadmap with MVP closure progress (90% complete)
  - docs: cleanup and update all project documentation
  - docs: update README files with accurate info
  - docs: reorganize documentation structure, remove ai-logs
  - docs: add deep project inspection report 2026-03-03 (73/100)
  - Merge docs(db): Order indexes + README updates (Team 9)
  - docs(db): add Order status/created_at indexes; update READMEs
  - docs: README table formatting and add staff engineer review log
  - docs: add UI/UX audit system and development guidelines
  - docs: add comprehensive project roadmap document outlining current status and future development milestones.

### Chore
  - chore(frontend): update vendor names and finalize card typography
  - chore(ai-config): consolidate AI agent configs and remove vendor-specific skill files
  - chore: clean up Claude config files
  - chore: eliminar archivos CLAUDE.md y AGENT.md para optimizar el rendimiento de la IA
  - chore: trigger CI checks
  - chore: add Alembic migration fixing address user_id FK and syncing DB schema
  - chore(ci): upgrade Python to 3.13, add frontend Docker build validation
  - chore(claude): update agents with new superpowers skills references
  - chore(claude): add custom agents and superpowers skills
  - chore(deps): update pnpm-lock.yaml

---

## [2026-03-05] — Snapshot automático

> Generado por `docsync.py` | 97 commits en los últimos 7 días
> Tests totales: **571** | Coverage backend: **39%** | Endpoints API: **45**

### Sin cambios convencionales registrados en este período

---

## [2026-03-05] — Snapshot automático

> Generado por `docsync.py` | 97 commits en los últimos 7 días
> Tests totales: **571** | Coverage backend: **39%** | Endpoints API: **45**

### Features
  - feat(ui): update UI/UX roadmap and enhance component styling
  - feat(orders): server-side status filtering - filter chips now query backend
  - feat(orders): marketplace status flow unpaid->processing->shipped->delivered->returns
  - feat(orders): new status flow pending→confirmed→in_transit→shipped→delivered
  - feat(frontend): redesign ProductCard with vendor display and image polish
  - feat(backend): add vendor_name field to products
  - feat: connect Redis cache for products with graceful degradation

### Bug Fixes
  - fix(orders): actualizar status en timeline y pending.tsx al nuevo flujo
  - fix(orders): break useEffect infinite loop, read status param from profile nav
  - fix: redirect_slashes=False + route '' to stop 307 loops on bare paths
  - fix(ci): move module-level imports to top of file (flake8 E402)
  - fix(ci): fix isort import order in product_service and database
  - fix(ci): fix backend lint and frontend test suite failures
  - fix(frontend): add missing dietary filter chips and minor UI fixes
  - fix: restore missing except block in product_service.py
  - fix: align app slug/scheme/name and fix CI pnpm version for production

### Performance
  - perf(frontend): optimize navbar re-renders and component memoization

### Tests
  - test(orders): actualizar tests del store para el nuevo param status
  - test: add E2E tests for auth gate, checkout flow, and email delivery

### Docs
  - docs: update roadmap with MVP closure progress (90% complete)
  - docs: cleanup and update all project documentation

---

## [2026-03-04] — Sprint MVP Closure

> Todos los gaps de código del plan MVP resueltos.

### Features
  - feat: connect Redis cache for products with graceful degradation
  - feat(backend): add vendor_name field to products
  - feat(frontend): redesign ProductCard with vendor display and image polish
  - feat(orders): new status flow pending→confirmed→in_transit→shipped→delivered

### Infrastructure
  - infra: add AWS ECS task definition, ECR and SSM secrets scripts

### Chore
  - chore(ai-config): consolidate AI agent configs and remove vendor-specific skill files
  - chore(frontend): update vendor names and finalize card typography

---

<!-- /DOCSYNC:changelog-body -->
