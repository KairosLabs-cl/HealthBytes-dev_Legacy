# Changelog

> Generado automáticamente por `docs/.automation/docsync.py`.
> Para revisión humana antes de cada release, editar esta sección si es necesario.

<!-- DOCSYNC:changelog-body -->
## [2026-05-29] — Snapshot automático

> Generado por `docsync.py` | 17 commits en los últimos 7 días
> Tests totales: **636** | Coverage backend: **87%** | Endpoints API: **53**

### Features
  - feat: implement Jules agent management dashboard with status tracking and dynamic prompt creation, plus update Kanban task structure
  - feat: initialize Jules agent system prompts and remove Kanban dashboard restrictions from individual agent configurations
  - feat(security): implement Refresh Token Rotation and infrastructure hardening
  - feat(frontend): add theme preference, push notifications, and Sentry infra
  - feat: Mayo 2026 — Push Notifications, Reviews, Recommendations, Deep Linking, Dark Mode, A11y (#193)
  - feat(home): Agregar sección de descuentos visuales e insignias de pro… (#158)
  - feat(docs): update project status and audit details in README.md and docs/README.md
  - feat(docs): centralize project status and roadmap in PROJECT_STATUS.md, update references across documentation
  - feat(audit): add comprehensive frontend audit report for HealthBytes app, covering compliance, architecture, performance, and critical issues
  - feat: add reviews system for products and vendors (#128)

### Bug Fixes
  - fix: apply CodeRabbit auto-fixes
  - fix(frontend): align lockfile config and scoped js-cookie override
  - fix(a11y): label accessibility action surfaces (#223)
  - fix(repo): remediate hygiene issues (#206)
  - fix(backend): repair products, addresses, users, payments API
  - fix(frontend): restore grid layout and product detail image visibility
  - fix(frontend): add width 100% to BottomNavBar animated wrapper on mobile
  - fix(frontend): resolve frozen ref crash in BottomNavBar on Android
  - fix(ci): restore safety check with continue-on-error
  - fix(phase-3): TypeScript fixes and cleanup

### Performance
  - perf(repo): implement critical P0 performance optimizations across backend and frontend
  - perf(home): batch product filter selectors (#221)
  - perf(layout): batch zustand selectors with useShallow (#218)
  - perf(cart): batch Zustand selectors
  - perf(frontend): fix unnecessary re-renders in product detail screen
  - perf(frontend): migrate to FlashList, expo-image caching, and remove per-card rating queries
  - perf(frontend): prevent full-screen re-renders on favorite toggle
  - perf(frontend): prevent HomeScreen re-renders on favorite toggle
  - perf(frontend): optimize zustand selector in root layout
  - perf(layout): Use granular selectors for Zustand store in root layout

### Refactor
  - refactor(a11y): improve accessibility across UI and clean backend imports
  - refactor: standardize agent roles, formalize product safety protocols, and enforce task-based PR workflows across all AI agents
  - refactor: improve type safety in auth API, optimize token generation code, and disable rate limiting for test suite
  - refactor(root): reorganize misplaced scripts and extraction artifacts
  - refactor(frontend): extract shared ProductCard and DietaryFilterBar components
  - refactor: improve product dietary tag filtering, implement auth timing attack mitigation, and clean up temporary files and .gitignore entries.
  - refactor(frontend): fix any types and gate debug logs with __DEV__
  - refactor: optimize test imports and enhance profile layout with responsive design
  - refactor(api): products router delegates business logic to service layer

### Tests
  - test(backend): add legacy model schema coverage
  - test(products): cover discount listing
  - test(deprecations): fix check script to ignore its own mock test file
  - test(frontend): fix mocks for AuthGate and ScreenHeader to resolve CI failures
  - test(backend): fix test_auth_timing comparing string with bytes for the mock hash
  - test(backend): restore dietary tags test deleted during merge conflict resolution
  - test(backend): add missing dietary tags filter reproduction test
  - test(frontend): add Zustand store tests for orders, addresses, favorites
  - test(frontend): add API client and jest env setup for 67 new tests
  - test: add comprehensive router and schema tests to reach 85% coverage

### Docs
  - docs(ia): add weekly agent kanban for performance and de-overengineering
  - docs(status): update project status after cleanup and security hardening
  - docs(status): consolidate project state into PROJECT_STATUS.md
  - docs: initialize project architecture and maintenance guides
  - docs(ai): implement agent instructions and self-improvement skill
  - docs: track dependency CR in agent kanban
  - docs(ia): add role-based agent hive prompts (#219)
  - docs: finalize sync (#196)
  - docs(sync): auto-update metrics 2026-05-04
  - docs(sync): auto-update metrics 2026-04-27

### Chore
  - chore(deps): merge brace-expansion bump
  - chore(deps): merge postcss bump
  - chore(deps): merge ws bump
  - chore: update dependencies and regenerate node_modules lockfile
  - chore(structure): move root docker scripts to Tools/ops/ and update docs
  - chore(ai): unify AI context into .agents/ and remove legacy systems
  - chore(frontend): remove unused dependency bs58
  - chore(deps): bump ws from 8.18.3 to 8.20.1 in /frontend
  - chore(deps): bump postcss from 8.4.49 to 8.5.14 in /frontend
  - chore(deps): bump brace-expansion from 5.0.5 to 5.0.6 in /frontend

---

## [2026-05-29] — Snapshot automático

> Generado por `docsync.py` | 17 commits en los últimos 7 días
> Tests totales: **505** | Coverage backend: **87%** | Endpoints API: **53**

### Features
  - feat: implement Jules agent management dashboard with status tracking and dynamic prompt creation, plus update Kanban task structure
  - feat: initialize Jules agent system prompts and remove Kanban dashboard restrictions from individual agent configurations
  - feat(security): implement Refresh Token Rotation and infrastructure hardening
  - feat(frontend): add theme preference, push notifications, and Sentry infra
  - feat: Mayo 2026 — Push Notifications, Reviews, Recommendations, Deep Linking, Dark Mode, A11y (#193)
  - feat(home): Agregar sección de descuentos visuales e insignias de pro… (#158)
  - feat(docs): update project status and audit details in README.md and docs/README.md
  - feat(docs): centralize project status and roadmap in PROJECT_STATUS.md, update references across documentation
  - feat(audit): add comprehensive frontend audit report for HealthBytes app, covering compliance, architecture, performance, and critical issues
  - feat: add reviews system for products and vendors (#128)

### Bug Fixes
  - fix: apply CodeRabbit auto-fixes
  - fix(frontend): align lockfile config and scoped js-cookie override
  - fix(a11y): label accessibility action surfaces (#223)
  - fix(repo): remediate hygiene issues (#206)
  - fix(backend): repair products, addresses, users, payments API
  - fix(frontend): restore grid layout and product detail image visibility
  - fix(frontend): add width 100% to BottomNavBar animated wrapper on mobile
  - fix(frontend): resolve frozen ref crash in BottomNavBar on Android
  - fix(ci): restore safety check with continue-on-error
  - fix(phase-3): TypeScript fixes and cleanup

### Performance
  - perf(repo): implement critical P0 performance optimizations across backend and frontend
  - perf(home): batch product filter selectors (#221)
  - perf(layout): batch zustand selectors with useShallow (#218)
  - perf(cart): batch Zustand selectors
  - perf(frontend): fix unnecessary re-renders in product detail screen
  - perf(frontend): migrate to FlashList, expo-image caching, and remove per-card rating queries
  - perf(frontend): prevent full-screen re-renders on favorite toggle
  - perf(frontend): prevent HomeScreen re-renders on favorite toggle
  - perf(frontend): optimize zustand selector in root layout
  - perf(layout): Use granular selectors for Zustand store in root layout

### Refactor
  - refactor(a11y): improve accessibility across UI and clean backend imports
  - refactor: standardize agent roles, formalize product safety protocols, and enforce task-based PR workflows across all AI agents
  - refactor: improve type safety in auth API, optimize token generation code, and disable rate limiting for test suite
  - refactor(root): reorganize misplaced scripts and extraction artifacts
  - refactor(frontend): extract shared ProductCard and DietaryFilterBar components
  - refactor: improve product dietary tag filtering, implement auth timing attack mitigation, and clean up temporary files and .gitignore entries.
  - refactor(frontend): fix any types and gate debug logs with __DEV__
  - refactor: optimize test imports and enhance profile layout with responsive design
  - refactor(api): products router delegates business logic to service layer

### Tests
  - test(backend): add legacy model schema coverage
  - test(products): cover discount listing
  - test(deprecations): fix check script to ignore its own mock test file
  - test(frontend): fix mocks for AuthGate and ScreenHeader to resolve CI failures
  - test(backend): fix test_auth_timing comparing string with bytes for the mock hash
  - test(backend): restore dietary tags test deleted during merge conflict resolution
  - test(backend): add missing dietary tags filter reproduction test
  - test(frontend): add Zustand store tests for orders, addresses, favorites
  - test(frontend): add API client and jest env setup for 67 new tests
  - test: add comprehensive router and schema tests to reach 85% coverage

### Docs
  - docs(ia): add weekly agent kanban for performance and de-overengineering
  - docs(status): update project status after cleanup and security hardening
  - docs(status): consolidate project state into PROJECT_STATUS.md
  - docs: initialize project architecture and maintenance guides
  - docs(ai): implement agent instructions and self-improvement skill
  - docs: track dependency CR in agent kanban
  - docs(ia): add role-based agent hive prompts (#219)
  - docs: finalize sync (#196)
  - docs(sync): auto-update metrics 2026-05-04
  - docs(sync): auto-update metrics 2026-04-27

### Chore
  - chore(deps): merge brace-expansion bump
  - chore(deps): merge postcss bump
  - chore(deps): merge ws bump
  - chore: update dependencies and regenerate node_modules lockfile
  - chore(structure): move root docker scripts to Tools/ops/ and update docs
  - chore(ai): unify AI context into .agents/ and remove legacy systems
  - chore(frontend): remove unused dependency bs58
  - chore(deps): bump ws from 8.18.3 to 8.20.1 in /frontend
  - chore(deps): bump postcss from 8.4.49 to 8.5.14 in /frontend
  - chore(deps): bump brace-expansion from 5.0.5 to 5.0.6 in /frontend

---

## [2026-05-29] — Snapshot automático

> Generado por `docsync.py` | 17 commits en los últimos 7 días
> Tests totales: **636** | Coverage backend: **42%** | Endpoints API: **53**

### Features
  - feat: implement Jules agent management dashboard with status tracking and dynamic prompt creation, plus update Kanban task structure
  - feat: initialize Jules agent system prompts and remove Kanban dashboard restrictions from individual agent configurations
  - feat(security): implement Refresh Token Rotation and infrastructure hardening
  - feat(frontend): add theme preference, push notifications, and Sentry infra
  - feat: Mayo 2026 — Push Notifications, Reviews, Recommendations, Deep Linking, Dark Mode, A11y (#193)
  - feat(home): Agregar sección de descuentos visuales e insignias de pro… (#158)
  - feat(docs): update project status and audit details in README.md and docs/README.md
  - feat(docs): centralize project status and roadmap in PROJECT_STATUS.md, update references across documentation
  - feat(audit): add comprehensive frontend audit report for HealthBytes app, covering compliance, architecture, performance, and critical issues
  - feat: add reviews system for products and vendors (#128)

### Bug Fixes
  - fix: apply CodeRabbit auto-fixes
  - fix(frontend): align lockfile config and scoped js-cookie override
  - fix(a11y): label accessibility action surfaces (#223)
  - fix(repo): remediate hygiene issues (#206)
  - fix(backend): repair products, addresses, users, payments API
  - fix(frontend): restore grid layout and product detail image visibility
  - fix(frontend): add width 100% to BottomNavBar animated wrapper on mobile
  - fix(frontend): resolve frozen ref crash in BottomNavBar on Android
  - fix(ci): restore safety check with continue-on-error
  - fix(phase-3): TypeScript fixes and cleanup

### Performance
  - perf(repo): implement critical P0 performance optimizations across backend and frontend
  - perf(home): batch product filter selectors (#221)
  - perf(layout): batch zustand selectors with useShallow (#218)
  - perf(cart): batch Zustand selectors
  - perf(frontend): fix unnecessary re-renders in product detail screen
  - perf(frontend): migrate to FlashList, expo-image caching, and remove per-card rating queries
  - perf(frontend): prevent full-screen re-renders on favorite toggle
  - perf(frontend): prevent HomeScreen re-renders on favorite toggle
  - perf(frontend): optimize zustand selector in root layout
  - perf(layout): Use granular selectors for Zustand store in root layout

### Refactor
  - refactor(a11y): improve accessibility across UI and clean backend imports
  - refactor: standardize agent roles, formalize product safety protocols, and enforce task-based PR workflows across all AI agents
  - refactor: improve type safety in auth API, optimize token generation code, and disable rate limiting for test suite
  - refactor(root): reorganize misplaced scripts and extraction artifacts
  - refactor(frontend): extract shared ProductCard and DietaryFilterBar components
  - refactor: improve product dietary tag filtering, implement auth timing attack mitigation, and clean up temporary files and .gitignore entries.
  - refactor(frontend): fix any types and gate debug logs with __DEV__
  - refactor: optimize test imports and enhance profile layout with responsive design
  - refactor(api): products router delegates business logic to service layer

### Tests
  - test(backend): add legacy model schema coverage
  - test(products): cover discount listing
  - test(deprecations): fix check script to ignore its own mock test file
  - test(frontend): fix mocks for AuthGate and ScreenHeader to resolve CI failures
  - test(backend): fix test_auth_timing comparing string with bytes for the mock hash
  - test(backend): restore dietary tags test deleted during merge conflict resolution
  - test(backend): add missing dietary tags filter reproduction test
  - test(frontend): add Zustand store tests for orders, addresses, favorites
  - test(frontend): add API client and jest env setup for 67 new tests
  - test: add comprehensive router and schema tests to reach 85% coverage

### Docs
  - docs(ia): add weekly agent kanban for performance and de-overengineering
  - docs(status): update project status after cleanup and security hardening
  - docs(status): consolidate project state into PROJECT_STATUS.md
  - docs: initialize project architecture and maintenance guides
  - docs(ai): implement agent instructions and self-improvement skill
  - docs: track dependency CR in agent kanban
  - docs(ia): add role-based agent hive prompts (#219)
  - docs: finalize sync (#196)
  - docs(sync): auto-update metrics 2026-05-04
  - docs(sync): auto-update metrics 2026-04-27

### Chore
  - chore(deps): merge brace-expansion bump
  - chore(deps): merge postcss bump
  - chore(deps): merge ws bump
  - chore: update dependencies and regenerate node_modules lockfile
  - chore(structure): move root docker scripts to Tools/ops/ and update docs
  - chore(ai): unify AI context into .agents/ and remove legacy systems
  - chore(frontend): remove unused dependency bs58
  - chore(deps): bump ws from 8.18.3 to 8.20.1 in /frontend
  - chore(deps): bump postcss from 8.4.49 to 8.5.14 in /frontend
  - chore(deps): bump brace-expansion from 5.0.5 to 5.0.6 in /frontend

---

## [2026-05-06] — Snapshot automático

> Generado por `docsync.py` | 1 commits en los últimos 7 días
> Tests totales: **594** | Coverage backend: **40%** | Endpoints API: **52**

### Sin cambios convencionales registrados en este período

---

## [2026-05-04] — Snapshot automático

> Generado por `docsync.py` | 1 commits en los últimos 7 días
> Tests totales: **581** | Coverage backend: **40%** | Endpoints API: **48**

### Sin cambios convencionales registrados en este período

---

## [2026-04-27] — Snapshot automático

> Generado por `docsync.py` | 1 commits en los últimos 7 días
> Tests totales: **581** | Coverage backend: **40%** | Endpoints API: **48**

### Sin cambios convencionales registrados en este período

---

## [2026-04-23] — Snapshot automático

> Generado por `docsync.py` | 1 commits en los últimos 7 días
> Tests totales: **581** | Coverage backend: **40%** | Endpoints API: **48**

### Security
- Fix frontend dependency vulnerabilities (Sentinel)

---

## [2026-04-11] — Snapshot automático

> Generado por `docsync.py` | 1 commits en los últimos 7 días
> Tests totales: **580** | Coverage backend: **40%** | Endpoints API: **48**

### Docs
  - feat(docs): update project status and audit details in README.md and docs/README.md

---

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
