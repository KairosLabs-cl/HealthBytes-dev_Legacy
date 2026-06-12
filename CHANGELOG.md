# Changelog

> Generado automáticamente por `docs/.automation/docsync.py`.
> Para revisión humana antes de cada release, editar esta sección manualmente.

<!-- DOCSYNC:changelog-body -->
## [2026-05] — Mayo 2026

### Features
  - feat: implement Jules agent management dashboard with status tracking and dynamic prompt creation, plus update Kanban task structure (por **nojustbenja**)
  - feat: initialize Jules agent system prompts and remove Kanban dashboard restrictions from individual agent configurations (por **nojustbenja**)
  - feat(security): implement Refresh Token Rotation and infrastructure hardening (por **nojustbenja**)
  - tool: implement UI extraction and state capture automation (por **nojustbenja**)
  - feat(frontend): add theme preference, push notifications, and Sentry infra (por **nojustbenja**)
  - feat: Mayo 2026 — Push Notifications, Reviews, Recommendations, Deep Linking, Dark Mode, A11y (#193) (por **nojustbenja**)
  - feat(home): Agregar sección de descuentos visuales e insignias de pro… (#158) (por **basty200**)

### Bug Fixes
  - fix: apply CodeRabbit auto-fixes (por **coderabbitai[bot]**)
  - fix(frontend): align lockfile config and scoped js-cookie override (por **nojustbenja**)
  - fix(a11y): label accessibility action surfaces (#223) (por **nojustbenja**)
  - fix(repo): remediate hygiene issues (#206) (por **nojustbenja**)
  - Push token validation, Mercado Pago webhook hardening, eager-load dietary tags, and push-notifications fixes (#203) (por **nojustbenja**)
  - fix(backend): repair products, addresses, users, payments API (por **nojustbenja**)

### Performance
  - perf(repo): implement critical P0 performance optimizations across backend and frontend (por **nojustbenja**)
  - perf(home): batch product filter selectors (#221) (por **nojustbenja**)
  - perf(layout): batch zustand selectors with useShallow (#218) (por **nojustbenja**)
  - perf(cart): batch Zustand selectors (por **nojustbenja**)

### Refactor
  - refactor: standardize agent roles, formalize product safety protocols, and enforce task-based PR workflows across all AI agents (por **nojustbenja**)
  - refactor: improve type safety in auth API, optimize token generation code, and disable rate limiting for test suite (por **nojustbenja**)
  - refactor(root): reorganize misplaced scripts and extraction artifacts (por **nojustbenja**)

### Tests
  - test(backend): add legacy model schema coverage (por **nojustbenja**)
  - CodeRabbit Generated Unit Tests: Add unit tests (por **coderabbitai[bot]**)
  - test(products): cover discount listing (por **nojustbenja**)

### Docs
  - docs(ia): add weekly agent kanban for performance and de-overengineering (por **nojustbenja**)
  - docs(status): update project status after cleanup and security hardening (por **nojustbenja**)
  - docs(status): consolidate project state into PROJECT_STATUS.md (por **nojustbenja**)
  - docs: initialize project architecture and maintenance guides (por **nojustbenja**)
  - docs(ai): implement agent instructions and self-improvement skill (por **nojustbenja**)
  - docs: track dependency CR in agent kanban (por **nojustbenja**)
  - docs(ia): add role-based agent hive prompts (#219) (por **nojustbenja**)
  - docs: finalize sync (#196) (por **nojustbenja**)
  - docs(sync): auto-update metrics 2026-05-04 (por **nojustbenja**)

### Chore
  - Merge pull request #226 from coderabbitai (por **nojustbenja**)
  - Merge pull request #224 (por **nojustbenja**)
  - Merge pull request #229 from codex/review-javascript-cookie-vulnerability (por **nojustbenja**)
  - chore(deps): merge brace-expansion bump (por **nojustbenja**)
  - chore(deps): merge postcss bump (por **nojustbenja**)
  - chore(deps): merge ws bump (por **nojustbenja**)
  - chore: update dependencies and regenerate node_modules lockfile (por **nojustbenja**)
  - chore(structure): move root docker scripts to Tools/ops/ and update docs (por **nojustbenja**)
  - chore(ai): unify AI context into .ai/ and remove legacy systems (por **nojustbenja**)
  - chore(frontend): remove unused dependency bs58 (por **nojustbenja**)
  - chore(deps): bump ws from 8.18.3 to 8.20.1 in /frontend (por **dependabot[bot]**)
  - chore(deps): bump postcss from 8.4.49 to 8.5.14 in /frontend (por **dependabot[bot]**)
  - chore(deps): bump brace-expansion from 5.0.5 to 5.0.6 in /frontend (por **dependabot[bot]**)
  - chore(deps): bump @clerk/clerk-expo from 2.19.26 to 2.19.36 in /frontend (#186) (por **dependabot[bot]**)

### Otros
  - style(backend): apply autoflake, isort, and black formatting (por **nojustbenja**)
  - ⚡ Bolt: [performance] Prevent unnecessary re-renders in Home and Cart screens (#195) (por **nojustbenja**)
  - 🛡️ Sentinel: [MEDIUM] Add global exception handler to prevent info leakage (#185) (por **nojustbenja**)
  - ⚡ Bolt: Use route parameter for cart item selector (#190) (por **nojustbenja**)

---

## [2026-04] — Abril 2026

### Features
  - feat(docs): update project status and audit details in README.md and docs/README.md (por **nojustbenja**)
  - feat(docs): centralize project status and roadmap in PROJECT_STATUS.md, update references across documentation (por **nojustbenja**)
  - feat(audit): add comprehensive frontend audit report for HealthBytes app, covering compliance, architecture, performance, and critical issues (por **nojustbenja**)

### Bug Fixes
  - Merge pull request #180 from nojustbenja/perf-optimize-product-selector-fix-6009234678633696653 (por **nojustbenja**)
  - Merge pull request #181 from nojustbenja/sentinel/fix-cors-production-18433196559188634409 (por **nojustbenja**)
  - 🛡️ Sentinel: [HIGH] Fix overly permissive CORS in production (por **google-labs-jules[bot]**)
  - 🛡️ Sentinel: [security improvement] Fix swallowed exceptions (por **google-labs-jules[bot]**)
  - fix(frontend): restore grid layout and product detail image visibility (por **nojustbenja**)
  - fix(frontend): add width 100% to BottomNavBar animated wrapper on mobile (por **nojustbenja**)
  - fix(frontend): resolve frozen ref crash in BottomNavBar on Android (por **nojustbenja**)
  - Merge pull request #152 from nojustbenja/fix/ci-safety-check (por **nojustbenja**)
  - fix(ci): restore safety check with continue-on-error (por **nojustbenja**)
  - fix(phase-3): TypeScript fixes and cleanup (por **nojustbenja**)
  - security: Phase 2 hardening fixes (por **nojustbenja**)
  - Merge pull request #141 from nojustbenja/sentinel-fix-user-enumeration-5250532672455615239 (por **nojustbenja**)
  - 🛡️ Sentinel: [HIGH] Fix CI baseline file and user enumeration issue (por **google-labs-jules[bot]**)
  - 🛡️ Sentinel: [HIGH] Fix user enumeration in registration via timing attacks (por **google-labs-jules[bot]**)
  - Merge pull request #137 from nojustbenja/bolt/fix-layout-store-re-renders-5783082319457597131 (por **nojustbenja**)
  - ⚡ Bolt: [performance improvement] fix full layout re-renders (por **google-labs-jules[bot]**)
  - Merge pull request #140 from nojustbenja/bolt/fix-root-layout-re-renders-12885122936603061784 (por **nojustbenja**)
  - ⚡ Bolt: [performance improvement] fix CI deprecation failures (por **google-labs-jules[bot]**)

### Performance
  - perf(frontend): fix unnecessary re-renders in product detail screen (por **google-labs-jules[bot]**)
  - perf(frontend): migrate to FlashList, expo-image caching, and remove per-card rating queries (por **nojustbenja**)
  - perf(frontend): prevent full-screen re-renders on favorite toggle (por **google-labs-jules[bot]**)
  - perf(frontend): prevent HomeScreen re-renders on favorite toggle (por **google-labs-jules[bot]**)
  - perf(frontend): optimize zustand selector in root layout (por **google-labs-jules[bot]**)
  - perf(layout): Use granular selectors for Zustand store in root layout (por **google-labs-jules[bot]**)
  - perf(frontend): optimize cart selector in Product Details (por **google-labs-jules[bot]**)
  - perf(cart): remove redundant database queries after commit (por **google-labs-jules[bot]**)
  - perf(cart): remove redundant database queries after commit (por **google-labs-jules[bot]**)
  - perf(cart): remove redundant database queries after commit (por **google-labs-jules[bot]**)
  - perf: remove unused cart items subscription in root layout (por **google-labs-jules[bot]**)

### Tests
  - test(deprecations): fix check script to ignore its own mock test file (por **google-labs-jules[bot]**)

### Docs
  - docs(sync): auto-update metrics 2026-04-27 (por **google-labs-jules[bot]**)
  - docs(sync): auto-update metrics 2026-04-23 (por **google-labs-jules[bot]**)
  - docs(phase-1): add PR review summary and close phase (por **nojustbenja**)
  - docs: add codebase map via gsd-codebase-mapper agents (por **nojustbenja**)
  - docs: restore missing baseline file for CI (por **google-labs-jules[bot]**)
  - docs(sync): auto-update metrics 2026-04-11 (por **google-labs-jules[bot]**)
  - docs(sync): auto-update metrics 2026-04-09 (por **google-labs-jules[bot]**)
  - docs(sync): auto-update metrics 2026-04-04 (por **google-labs-jules[bot]**)

### Chore
  - Merge pull request #179 from nojustbenja/juanito-docs-sync-5461448108620457975 (por **nojustbenja**)
  - Merge pull request #178 from nojustbenja/jules-9275165521448548953-c63dd1e9 (por **nojustbenja**)
  - Merge pull request #168 from nojustbenja/juanito-docs-sync-7678814345473343788 (por **nojustbenja**)
  - Merge pull request #167 from nojustbenja/jules-17785781460630581273-c32cbb84 (por **nojustbenja**)
  - chore(deps): patch critical and high severity vulnerabilities via pnpm overrides (por **google-labs-jules[bot]**)
  - Merge pull request #151 from nojustbenja/security/phase-2-hardening (por **nojustbenja**)
  - Merge pull request #150 from nojustbenja/bolt-optimize-homescreen-renders-415246467967511243 (por **nojustbenja**)
  - Merge pull request #147 from nojustbenja/bolt-prevent-homescreen-rerenders-11582485267747728029 (por **nojustbenja**)
  - Merge pull request #145 from nojustbenja/bolt-perf-product-details-15184023250121591183 (por **nojustbenja**)
  - Merge pull request #138 from nojustbenja/bolt/layout-selector-optimization-17066685429008677263 (por **nojustbenja**)
  - Merge pull request #135 from nojustbenja/bolt-perf-layout-re-renders-4207890279840064207 (por **nojustbenja**)
  - Merge pull request #146 from nojustbenja/juanito-docsync-2026-04-11-7697139363135177052 (por **nojustbenja**)
  - Merge pull request #143 from nojustbenja/juanito-docs-sync-4257271242954444189 (por **nojustbenja**)
  - chore(postman): remove unused resources.yaml file (por **nojustbenja**)
  - Merge pull request #136 from nojustbenja/docs/sync-metrics-2026-04-04-13172982831718951524 (por **nojustbenja**)
  - Merge pull request #134 from nojustbenja/bolt/optimize-cart-service-8088860547893749377 (por **nojustbenja**)
  - Merge master into PR #134 (por **nojustbenja**)
  - Merge remote-tracking branch 'origin/master' into bolt/optimize-cart-service-8088860547893749377 (por **nojustbenja**)
  - chore: execute lane P2 deprecations and weekly roadmap scorecard (#133) (por **nojustbenja**)
  - Merge pull request #130 from nojustbenja/perf-remove-unused-cart-subscription-15137265361143519252 (por **nojustbenja**)

### Otros
  - init: GSD project initialization (por **nojustbenja**)
  - ⚡ Bolt: [performance improvement] optimize root layout zustand selectors (por **google-labs-jules[bot]**)

---

## [2026-03] — Marzo 2026

### Features
  - feat: add reviews system for products and vendors (#128) (por **nojustbenja**)
  - feat: Implement product review functionality and add push notification support. (por **nojustbenja**)
  - Merge pull request #99 from nojustbenja/docs/roadmap-uiux-update (por **nojustbenja**)
  - feat(ui): add random greetings in Header (por **nojustbenja**)
  - Merge branch 'bolt/zustand-granular-selectors-11602566720000025396' of https://github.com/nojustbenja/HealthBytes-dev into docs/roadmap-uiux-update (por **nojustbenja**)
  - feat(orders): interactive product detail with images, navigation, and unified ScreenHeader (por **nojustbenja**)
  - feat: Implement comprehensive e-commerce frontend including checkout, product pages, user profile management, and order handling. (por **nojustbenja**)
  - feat(security): add X-XSS-Protection header (por **google-labs-jules[bot]**)
  - feat(ui): complete ui redesign sprint including onboarding, product cards, and remaining layout polish (por **nojustbenja**)
  - feat(ui): implement vendor info and more from vendor carousel in product detail (por **nojustbenja**)
  - feat: UI redesign - ProductCard, vendor_name, dietary filters & CI fixes (#87) (por **nojustbenja**)
  - feat: Implement animated bottom navigation, product detail page, and backend services for users, favorites, and orders. (por **nojustbenja**)
  - feat(frontend): conversion-optimized PDP + fly-to-cart animations (por **nojustbenja**)
  - feat: add order, payment, and stock management services with associated documentation. (por **nojustbenja**)

### Bug Fixes
  - Merge sentinel-fix-timing-attack (resolve conflicts) (por **nojustbenja**)
  - Merge: Sentinel Mass Assignment fix (por **nojustbenja**)
  - Merge: Fix CI types + Zustand optimization (resolve conflict in usePushNotifications) (por **nojustbenja**)
  - fix: resolve backend flake8 lint and frontend Jest failure (por **google-labs-jules[bot]**)
  - fix: resolve backend linting and frontend type errors causing CI failure (por **google-labs-jules[bot]**)
  - 🛡️ Sentinel: [HIGH] Fix timing attack and AttributeError in auth_service (por **google-labs-jules[bot]**)
  - Fix CI failures: Format backend files and remove unused variables (por **google-labs-jules[bot]**)
  - fix(ci): Resolve backend import sorting errors (por **google-labs-jules[bot]**)
  - Fix CI failures: Resolve type issues and missing modules in frontend hooks/components (por **google-labs-jules[bot]**)
  - fix(ci): Resolve frontend type errors and format backend code (por **google-labs-jules[bot]**)
  - 🛡️ Sentinel: [CRITICAL] Fix user enumeration via OAuth 500 errors (por **google-labs-jules[bot]**)
  - fix: audit cleanup — sandbox URL gate, type safety, Sentry integration, orphan removal (por **nojustbenja**)
  - 🛡️ Sentinel: [HIGH] Fix user enumeration via OAuth user 500 error (por **google-labs-jules[bot]**)
  - 🛡️ Sentinel: [HIGH] Fix mass assignment vulnerability in AddressUpdate (por **google-labs-jules[bot]**)
  - style(perf): fix formatting in email_service.py (por **google-labs-jules[bot]**)
  - fix(security): patch tar vulnerability CVE via pnpm override (por **nojustbenja**)
  - fix(security): add AuthGate to payment screens and sync ORM indexes (por **nojustbenja**)
  - fix(tests): use AdminUserUpdate in service tests for privileged fields

The UserUpdate schema no longer exposes email/role fields after the
mass-assignment security fix. Service-level tests that update
privileged fields now use AdminUserUpdate instead.

Fixes CI backend test failures. (por **nojustbenja**)
  - Merge PR #94: perf(cart): fix N+1 query issue in merge_cart_items (por **nojustbenja**)
  - fix(security): add max_length=128 to password fields to prevent DoS

Add max_length=128 constraint to password fields in UserCreate and
UserUpdate schemas. Excessively long passwords can cause resource
exhaustion during bcrypt hashing.

Subsumes PRs #88, #90, #93, #95 (all identical fixes). (por **nojustbenja**)
  - fix(security): replace mass-assignment denylist with allowlist in user update

- Remove `role` and `email` from `UserUpdate` schema (non-admin users
  cannot send these fields through Pydantic validation)
- Add `AdminUserUpdate` schema extending `UserUpdate` with `email` and
  `role` for admin-only updates
- Replace `pop('role')` denylist with `ALLOWED_USER_FIELDS` /
  `ALLOWED_ADMIN_FIELDS` allowlist sets in `update_user` endpoint
- Defense-in-depth: any field not in the allowlist is silently dropped,
  preventing future schema additions from accidentally exposing
  privileged fields

Addresses PR #86 review feedback. (por **nojustbenja**)
  - 🛡️ Sentinel: [CRITICAL] Fix Mass Assignment Privilege Escalation in User Update (#86) (por **nojustbenja**)
  - Merge pull request #84 from nojustbenja/fix/unified-security-perf (por **nojustbenja**)
  - fix(security): HTML injection fix + email eager loading + orders FlatList (por **nojustbenja**)
  - fix(deps): bump minimatch to 10.2.3 to resolve ReDoS CVEs (#45, #46) (por **nojustbenja**)
  - fix(frontend): minor fixes in products API, home screen, StockBadge and cartStore (por **nojustbenja**)
  - fix(security): harden auth, CORS, logging and increase test coverage (por **nojustbenja**)

### Performance
  - perf: remove unused cart items subscription in root layout (por **google-labs-jules[bot]**)
  - perf: optimize Zustand selectors in CartItem (por **google-labs-jules[bot]**)
  - perf(frontend): optimize RecentlyViewedBar rendering by using granular selector (#109) (por **nojustbenja**)
  - perf(stock): implement batch stock release to fix N+1 queries during order cancellation (#108) (por **nojustbenja**)
  - perf: use granular zustand selectors to prevent full-screen re-renders (por **google-labs-jules[bot]**)
  - perf(frontend): Optimize `useFavoritesStore` subscriptions using selectors (por **google-labs-jules[bot]**)
  - perf: batch fetch products in email service to prevent N+1 (por **google-labs-jules[bot]**)
  - perf(cart): fix N+1 query issue in merge_cart_items (por **google-labs-jules[bot]**)
  - perf(frontend): memoize zustand selectors for cart calculations (por **google-labs-jules[bot]**)
  - perf(frontend): prevent unnecessary re-renders in Checkout and Addresses (por **google-labs-jules[bot]**)

### Tests
  - test(frontend): fix mocks for AuthGate and ScreenHeader to resolve CI failures (por **nojustbenja**)

### Docs
  - docs(sync): auto-update metrics 2026-03-18 (#107) (por **nojustbenja**)
  - docs: update production checklist with March 11 audit findings (por **nojustbenja**)
  - docs: update roadmap marking onboarding signature visual as completed (por **nojustbenja**)
  - docs: update UIUX_ROADMAP.md with mobile and interface design analysis (por **nojustbenja**)
  - docs: Add bi-weekly project progress report for Feb 24 - Mar 9, 2026 and backend .gitignore file. (por **nojustbenja**)
  - docs(sync): auto-update metrics 2026-03-08 (por **google-labs-jules[bot]**)
  - docs: add UI/UX audit system and development guidelines (por **nojustbenja**)
  - docs: add comprehensive project roadmap document outlining current status and future development milestones. (por **nojustbenja**)

### Chore
  - chore: clean up project structure and documentation (#129) (por **nojustbenja**)
  - chore: ignore macOS resource forks and sync env (por **nojustbenja**)
  - ci: fix backend lint, frontend type check, and add gitleaksignore (por **nojustbenja**)
  - chore: ignore macOS resource fork files (._*) (por **nojustbenja**)
  - chore: align mac startup scripts and fix backend product/CORS startup issues (por **nojustbenja**)
  - Merge branch 'pr-104' into pr-99 (por **nojustbenja**)
  - Merge branch 'pr-103' into pr-99 (Resolving conflicts in journal) (por **nojustbenja**)
  - Merge branch 'pr-102' into pr-99 (por **nojustbenja**)
  - Merge branch 'pr-101' into pr-99 (por **nojustbenja**)
  - Merge PR #98: Optimize multiple dietary tags filtering (por **nojustbenja**)
  - Merge PR #97: Add X-XSS-Protection security header (por **nojustbenja**)
  - chore: remove outdated interface system documentation (por **nojustbenja**)
  - chore: remove file (por **nojustbenja**)
  - Merge PR #92: perf(frontend): memoize zustand selectors for cart calculations (por **nojustbenja**)
  - Merge PR #91: docs(sync): auto-update metrics 2026-03-08 (por **nojustbenja**)
  - Merge PR #89: perf(frontend): prevent unnecessary re-renders in Checkout and Addresses (por **nojustbenja**)
  - Merge branch 'master' of https://github.com/nojustbenja/HealthBytes-dev (por **nojustbenja**)

### Otros
  - ⚡ Bolt: [performance improvement] (#114) (por **nojustbenja**)
  - 🛡️ Sentinel: [MEDIUM] Prevent Mass Assignment Vulnerability in Service Layers (#110) (por **nojustbenja**)
  - 🛡️ Sentinel: [MEDIUM] Prevent Mass Assignment Vulnerability in Service Layers (por **google-labs-jules[bot]**)
  - ⚡ Bolt: [performance] Optimize multiple dietary tags filtering (por **google-labs-jules[bot]**)

---

## [2026-02] — Febrero 2026

### Features
  - feat: merge feat/refine-nav-and-ux into master (por **nojustbenja**)
  - feat(frontend): complete dietary-preferences screen and onboarding wizard (por **nojustbenja**)
  - feat(frontend): refine home UX, unify spacing system, fix mobile issues (por **nojustbenja**)
  - feat: add user addresses management screen with CRUD functionality and form validation. (por **nojustbenja**)
  - feat: Add product detail page, address management, and skeleton loading components along with generated Android build and autolinking files. (por **nojustbenja**)
  - feat(ui): refine nav, UX and performance across frontend screens (por **nojustbenja**)
  - feat(ui): refine product navigation, interaction fixes and profile cleanup (por **Basty001**)
  - feat: Implement user registration and login endpoints with password hashing, JWT token generation, and timing attack mitigation. (por **nojustbenja**)
  - feat: Implement Mercado Pago payment integration, new frontend profile and dietary preference features, and CI/CD workflows. (por **nojustbenja**)
  - feat(perf): batch stock reservation in order creation (por **google-labs-jules[bot]**)
  - Merge pull request #71 from nojustbenja/feat/ux-ui-improvements (por **nojustbenja**)
  - feat(docs): update README and documentation for improved clarity and coverage metrics (por **nojustbenja**)
  - feat(payment): add reopen button on pending screen when MP popup closes (por **nojustbenja**)
  - feat(p1): dietary restrictions onboarding + Docker + TS fixes (por **nojustbenja**)
  - feat: Error Boundaries, Alembic migrations, API rate limiting (por **nojustbenja**)
  - feat(payment): complete Mercado Pago checkout flow integration (por **nojustbenja**)
  - feat(payment): implement real payment status polling on pending screen (por **nojustbenja**)
  - feat(email): add transactional emails with Resend for orders lifecycle (por **nojustbenja**)
  - feat(payment): fix Mercado Pago integration and connect frontend checkout (por **nojustbenja**)
  - feat(payment): add payment success, failure, and pending screens with navigation feat(address): implement AddressCard component for address management feat(payment): create PaymentMethodSelector for selecting payment methods feat(step): add StepIndicator component for visualizing steps in a process chore(eas): configure eas.json for build settings feat(store): implement addressStore for managing addresses with Zustand feat(types): define address types for address management (por **nojustbenja**)
  - feat: Initialize project with new React Native frontend, Python backend, and AI agent skill definitions. (por **nojustbenja**)
  - feat: Introduce AI agent skills for mobile development and implement core product and cart management features. (por **nojustbenja**)
  - feat: Implementar aplicación de comercio electrónico inicial con listado de productos, detalles, favoritos y autenticación. (por **chachoCL**)
  - feat: implementar mejores prácticas Supabase PostgreSQL (por **chachoCL**)
  - feat: implementar página de búsqueda dedicada con navegación por URL y mejoras de accesibilidad (por **Basty001**)
  - feat: implementar sistema completo de órdenes con filtros y colores por estado (por **nojustbenja**)
  - feat: update Bandit configuration for enhanced security scanning (por **nojustbenja**)
  - feat: Add HealthBytes security practices documentation and implement pre-commit hooks for backend (por **nojustbenja**)
  - feat(profile): enhance profile screen with order statuses and options navigation feat(messages): add messages screen for vendor communication feat(orders): implement orders screen with status handling feat(payments): create payments screen for managing payment methods feat(profile-settings): add profile settings screen for user data management feat(security): introduce security screen for password and session management feat(support): add support screen for user assistance feat(wishlist): implement wishlist screen for saving products (por **nojustbenja**)
  - feat(security,search): Add content-length validation, full-text search, and fix auth infinite loop (por **nojustbenja**)
  - feat(security): enhance security headers and limit request body size to prevent attacks (por **nojustbenja**)
  - feat(migration): add fulltext search migration script with verification steps (por **nojustbenja**)
  - feat(config): increase default max request body size to 10 MB and add diagnostic endpoint toggle feat(main): update request body size handling and conditionally enable health check endpoints test(products): add comprehensive tests for product search, creation, and updates (por **nojustbenja**)
  - feat(health-check): add health summary function to display package, warning, and error counts (por **nojustbenja**)
  - feat(backend): add compact health check summary to startup script (por **nojustbenja**)
  - feat(security): implement hardened security headers, request size limiting, and Python 3.14.2 enforcement (por **nojustbenja**)
  - feat(products): implement PostgreSQL full-text search with Spanish support (por **nojustbenja**)
  - feat(docs): Add B2B product insertion flow Mermaid diagram (por **copilot-swe-agent[bot]**)
  - feat: agregar búsqueda de productos, eliminar boton de para ti (por **Basty001**)

### Bug Fixes
  - fix(tests): add useRouter mock to index.test.tsx (por **nojustbenja**)
  - fix(tests): fix Alert mock in checkout tests — use jest.fn() direct assignment (por **nojustbenja**)
  - fix(tests): align checkout tests with Alert.alert (title + message) API (por **nojustbenja**)
  - fix(frontend): add skip/limit params to fetchOrders to fix TS2554 (por **nojustbenja**)
  - fix(ci): resolve backend lint E501 and frontend TS type errors (por **nojustbenja**)
  - Merge pull request #76 from nojustbenja/fix-product-dietary-filtering-clean (por **nojustbenja**)
  - fix(backend): remove lingering git merge markers from security.py (por **nojustbenja**)
  - Merge branch 'master' into fix-product-dietary-filtering-clean (por **nojustbenja**)
  - fix(backend): align verify_password_mock signature with master (por **nojustbenja**)
  - fix(backend): resolve merge conflicts and linting errors (por **google-labs-jules[bot]**)
  - Merge pull request #74 from nojustbenja/fix/auth-timing-attack-15259610013706666787 (por **nojustbenja**)
  - Merge branch 'master' into fix/auth-timing-attack-15259610013706666787 (por **nojustbenja**)
  - Merge pull request #73 from nojustbenja/sentinel/fix-user-enumeration-11195672562256748235 (por **nojustbenja**)
  - Merge branch 'master' into sentinel/fix-user-enumeration-11195672562256748235 (por **nojustbenja**)
  - fix(frontend/tests): fix TS type assertion errors in checkout-v2.test.tsx (por **nojustbenja**)
  - fix(mercadopago): include request-id in webhook signature manifest per MP docs (por **nojustbenja**)
  - fix(backend): remove unused sqlalchemy.text import (por **google-labs-jules[bot]**)
  - fix(backend): optimize and fix dietary tag filtering (por **google-labs-jules[bot]**)
  - Fix timing attack vulnerability in login endpoint by implementing verify_password_mock (por **google-labs-jules[bot]**)
  - 🛡️ Sentinel: Fix User Enumeration via Timing Attack (por **google-labs-jules[bot]**)
  - fix(frontend/tests): fix 3 failing test suites (por **nojustbenja**)
  - fix(frontend/tests): fix 3 failing test suites (por **nojustbenja**)
  - fix(frontend/tests): fix 3 failing test suites (por **nojustbenja**)
  - fix(frontend): pin babel-plugin-module-resolver glob to ^8 (por **nojustbenja**)
  - fix(ci): fix all Flake8 errors — remove unused imports, fix E501/E712/F841 (por **nojustbenja**)
  - fix: improve SQLite detection in database.py, update skills with formatting commands, update vulnerable deps (minimatch, tar, ajv) (por **nojustbenja**)
  - fix(ci): fix isort, aiosqlite and pnpm test command (por **nojustbenja**)
  - fix(ci): resolve all CI failures — SQLite pool, ESLint v9, Black formatting (por **nojustbenja**)
  - fix(docker): correct frontend Dockerfile paths and environment (por **nojustbenja**)
  - fix(backend): remove duplicate dietary_tags field in Product schema (por **nojustbenja**)
  - fix(post-merge): se arreglan problemas de compilacion y uso de api (por **nojustbenja**)
  - fix: arreglo del boton de favoritos al darle al home (por **nojustbenja**)
  - fix: Remove emojis from start.ps1 to fix PowerShell parsing errors (por **nojustbenja**)
  - Standardize order API errors and auth (por **nojustbenja**)
  - Implement feature X to enhance user experience and fix bug Y in module Z (por **nojustbenja**)

### Refactor
  - refactor(frontend): extract shared ProductCard and DietaryFilterBar components (por **nojustbenja**)
  - refactor: improve product dietary tag filtering, implement auth timing attack mitigation, and clean up temporary files and .gitignore entries. (por **nojustbenja**)
  - refactor(frontend): fix any types and gate debug logs with __DEV__ (por **nojustbenja**)

### Tests
  - test(backend): fix test_auth_timing comparing string with bytes for the mock hash (por **nojustbenja**)
  - test(backend): restore dietary tags test deleted during merge conflict resolution (por **nojustbenja**)
  - test(backend): add missing dietary tags filter reproduction test (por **nojustbenja**)
  - style(backend): apply Black formatting to test files (por **nojustbenja**)
  - test(frontend): add Zustand store tests for orders, addresses, favorites (por **nojustbenja**)
  - test(frontend): add API client and jest env setup for 67 new tests (por **nojustbenja**)
  - test: add comprehensive router and schema tests to reach 85% coverage (por **nojustbenja**)
  - test(products): add unit and integration tests for product search (por **nojustbenja**)

### Docs
  - docs: Add comprehensive project documentation covering technical architecture, security, data flows, database schemas, API endpoints, frontend structure, and development roadmap. (por **nojustbenja**)
  - docs(security): document timing attack fix maintenance risks and strengthen test coverage (por **nojustbenja**)
  - docs: update README, ROADMAP, and status docs with security vulnerability resolution (por **nojustbenja**)
  - docs: hacemos un roadmap para ux/ui y actualizacion de cuales seran los portales de pago que estremos manejando (por **nojustbenja**)
  - docs: actualizar skills con workspace y hooks (por **nojustbenja**)
  - docs(structure): reorganize documentation for clarity and accessibility (por **nojustbenja**)
  - docs(ai-logs): add reorganization completion report (por **nojustbenja**)
  - docs(reorganization): restructure docs/ with intuitive category-based organization (por **nojustbenja**)
  - docs(comprehensive): update all main documentation files (por **nojustbenja**)
  - docs(update): refresh documentation with current project structure (por **nojustbenja**)

### Chore
  - chore(ci): upgrade Python to 3.13, add frontend Docker build validation (por **nojustbenja**)
  - Merge branch 'Mobile' into feat/refine-nav-and-ux (por **nojustbenja**)
  - chore(claude): update agents with new superpowers skills references (por **nojustbenja**)
  - chore(claude): add custom agents and superpowers skills (por **nojustbenja**)
  - Merge branch 'master' of https://github.com/nojustbenja/HealthBytes-dev into feat/refine-nav-and-ux (por **nojustbenja**)
  - Merge pull request #72 from nojustbenja/bolt-stock-reservation-batch-17686955862631931662 (por **nojustbenja**)
  - chore(deps): update pnpm-lock.yaml (por **nojustbenja**)
  - ci: fix Python version, add frontend tests job, raise coverage threshold (por **nojustbenja**)
  - Merge pull request #68 from nojustbenja/feat/profile-actions (por **nojustbenja**)
  - chore: normalize line endings to LF and add .gitattributes (por **nojustbenja**)
  - Merge branch 'master' into feat/profile-actions (por **nojustbenja**)
  - Merge pull request #70 from nojustbenja/supabase-y-favoritos (por **nojustbenja**)
  - Merge branch 'master' into supabase-y-favoritos (por **nojustbenja**)
  - Merge pull request #69 from nojustbenja/feature/search-page-accessibility (por **nojustbenja**)
  - chore: simplify pre-commit hooks for MVP development (por **nojustbenja**)
  - Merge branch 'master' into feature/search-page-accessibility (por **nojustbenja**)
  - Merge pull request #64 from nojustbenja/copilot/create-b2b-product-insertion-flow (por **nojustbenja**)
  - Merge pull request #63 from nojustbenja/feat/busqueda-productos (por **nojustbenja**)
  - Merge branch 'master' into copilot/create-b2b-product-insertion-flow (por **chachoCL**)
  - chore: reorganizar documentación y testing según estructura del proyecto (por **nojustbenja**)
  - chore: Update pre-commit configuration for flake8 arguments (por **nojustbenja**)
  - chore(cleanup): remove old documentation folders (por **nojustbenja**)
  - chore(cleanup): move frontend SETUP.md to docs/frontend/ (por **nojustbenja**)
  - chore(org): move documentation to docs/ and seed script to Tools/ (por **nojustbenja**)
  - chore(tools): organize backend scripts into structured Tools folder (por **nojustbenja**)
  - chore(docs): reorganize documentation into organized folder structure (por **nojustbenja**)
  - Merge branch 'master' into feat/busqueda-productos (por **nojustbenja**)
  - Merge pull request #65 from nojustbenja/feat/product-text-search-indexing (por **nojustbenja**)

### Otros
  - Funcionamiento en mobile (por **Benja Garces**)
  - Reformat the workspace file, reorder its folders, and add new Claude local settings and stock service files. (por **nojustbenja**)
  - security: resolve all npm vulnerabilities and enforce pnpm (por **nojustbenja**)
  - camino a hacer funcionar el boton favoritos (por **chachoCL**)
  - Revise README for improved documentation structure (por **chachoCL**)
  - Add HealthBytes project skills documentation for installation, governance, and security practices (por **nojustbenja**)
  - Add request size limits and HSTS header (por **nojustbenja**)
  - Initial plan (por **copilot-swe-agent[bot]**)

---

## [2026-01] — Enero 2026

### Features
  - feat: Initialize FastAPI backend with core configuration and API routes, and set up frontend project dependencies. (por **Basty001**)
  - feat: Add initial API services for authentication, cart, orders, and products, frontend environment configuration, and backend application entry point. (por **nojustbenja**)
  - feat(cart): improve cart item removal and merging logic with loading states (por **nojustbenja**)
  - feat(cart): simulate payment processing before creating an order (por **nojustbenja**)
  - feat: enhance cart functionality with error handling and toast notifications (por **nojustbenja**)
  - feat(cart): enhance cart functionality with error handling and unit tests (por **nojustbenja**)
  - feat(cart): implement rollback mechanism for cart operations on API failure (por **nojustbenja**)
  - feat: Implement home and cart screens, add TypeScript configuration, and optimize FlatList `keyExtractor` for performance. (por **nojustbenja**)
  - feat: Implement product listing with search functionality and a shopping cart with item management. (por **nojustbenja**)
  - feat(tests): add performance benchmarks for get_user_orders with user_id index optimization (por **nojustbenja**)
  - feat(cart): refactor cart footer into a separate component and add CartItem type definition (por **nojustbenja**)
  - feat(cart): implement cart persistence frontend integration

- Create cart API client with TypeScript types
- Rewrite cartStore for backend sync with optimistic updates
- Add auto-sync with Clerk authentication in _layout
- Implement merge logic for local + server carts on login
- Maintain backward compatibility with existing cart UI (por **nojustbenja**)
  - feat(cart): implement cart persistence backend with postgres

- Add CartItem model with user/product relationships
- Create cart schemas for validation
- Implement cart service with CRUD + merge logic
- Add 6 REST endpoints (get, add, update, delete, clear, merge)
- Create migration script for cart_items table
- Add comprehensive test suite (15 tests, all passing)
- Fix router prefix duplication issue (por **nojustbenja**)
  - feat: optimize rendering of FavoritesBar and RecentlyViewedBar with initialNumToRender and batching settings (por **nojustbenja**)
  - feat: enhance layout and styling in HomeScreen, ProfileScreen, and BottomNavBar for improved user experience (por **nojustbenja**)
  - feat: enhance UI components with SafeAreaView and responsive design adjustments (por **nojustbenja**)
  - feat: update Expo API URL for mobile development and enhance user profile display (por **nojustbenja**)
  - feat: Establish initial frontend and backend application setup, including core files, testing configuration, and AI agent development guidelines. (por **nojustbenja**)
  - feat: add performance benchmarks for order creation to verify N+1 query optimization (por **nojustbenja**)
  - feat: enhance frontend setup with automatic IP detection and CORS configuration (por **nojustbenja**)
  - feat: enhance development setup with automatic IP detection and update CORS configuration (por **nojustbenja**)
  - Merge pull request #57 from nojustbenja/perf/frontend-upgrade-requirements (por **nojustbenja**)
  - feat: remove outdated price validation tests and documentation (por **nojustbenja**)
  - feat: Update HealthBytes development guidelines and configurations (por **nojustbenja**)
  - feat(user): add optional fields to UserUpdate schema (por **nojustbenja**)
  - feat(checkout): complete checkout flow implementation and fix database (por **nojustbenja**)
  - feat(docs): add comprehensive reports on test incompatibilities and final merge summary (por **nojustbenja**)
  - feat(orders,test-infrastructure): upgrade to Python 3.14 and fix N+1 queries with complete test infrastructure (por **nojustbenja**)
  - feat: Add pagination to list_users endpoint (por **google-labs-jules[bot]**)
  - feat(frontend): CLP price formatting, direct add-to-cart, cart controls, and UI improvements (por **nojustbenja**)
  - Merge pull request #40 from nojustbenja/Guille-Front (por **nojustbenja**)
  - feat(services): create business logic layer (por **nojustbenja**)
  - feat(tests): Implement price validation tests for orders (por **nojustbenja**)
  - feat: Add guard rails document for AI assistants and update architecture documentation (por **nojustbenja**)
  - feat: Enhance documentation for frontend and backend of HealthBytes (por **nojustbenja**)
  - feat: add Zustand stores for auth, cart, and recently viewed products (por **nojustbenja**)
  - Remove deprecated backend files and configurations, including environment variables, database schemas, and API routes, to streamline the project structure and prepare for a new implementation. (por **nojustbenja**)
  - Remove deprecated backend files and configurations, including environment variables, database schemas, and API routes, to streamline the project structure and prepare for a new implementation. (por **nojustbenja**)
  - Implementacion de Clerk UI con OAuth (Google, Facebook) y login por email (por **chachoCL**)

### Bug Fixes
  - Merge pull request #62 from nojustbenja/Fix/inicio-Backend (por **nojustbenja**)
  - fix: add padding to ScrollView content container in ProductDetailsScreen (por **nojustbenja**)
  - fix: update .gitignore to include .env and enhance IP detection in setup script (por **nojustbenja**)
  - fix(start.ps1): remove Python 3.14 requirement to align with .python-version (3.12.10) (por **copilot-swe-agent[bot]**)
  - fix(security): truncate passwords to 72 bytes for bcrypt compatibility fix(start.ps1): specify Python 3.14 for virtual environment creation fix(tests): update order validation tests to include missing Order schema add: initial test results file for tracking pytest outcomes (por **nojustbenja**)
  - Merge pull request #52 from nojustbenja/sentinel/fix-hardcoded-jwt-secret-215331851763608380 (por **nojustbenja**)
  - Merge branch 'master' into sentinel/fix-hardcoded-jwt-secret-215331851763608380 (por **nojustbenja**)
  - fix(.gitignore): add .venv314 to ignore list (por **nojustbenja**)
  - 🛡️ Sentinel: Fix hardcoded JWT secret (por **google-labs-jules[bot]**)
  - fix(checkout): resolve order creation and improve error logging (por **nojustbenja**)
  - fix(auth): add token availability wait logic to mitigate timing issues (por **nojustbenja**)
  - fix(auth): add comprehensive logging for token cache debugging (por **nojustbenja**)
  - Merge pull request #44 from nojustbenja/jules-nplusone-fix-13701794538008883027 (por **nojustbenja**)
  - Merge branch 'master' into jules-nplusone-fix-13701794538008883027 (por **nojustbenja**)
  - Implement feature X to enhance user experience and fix bug Y in module Z (por **nojustbenja**)
  - fix(products): resolve database schema mismatch and query parameter casting (por **nojustbenja**)
  - Optimize create_order: Fix N+1 queries, concurrency issues, and schema aliases (por **google-labs-jules[bot]**)
  - Optimize create_order: Fix N+1 queries, concurrency issues, and schema aliases (por **google-labs-jules[bot]**)
  - Merge pull request #43 from nojustbenja/sentinel/fix-info-leakage-products-8974427137115063385 (por **nojustbenja**)
  - Fix N+1 query issue and refactor order service (por **google-labs-jules[bot]**)
  - Address feedback: Fix leakage in users/orders and verify (por **google-labs-jules[bot]**)
  - Fix N+1 query issue in order creation (por **google-labs-jules[bot]**)
  - Fix info leakage in users and orders API (por **google-labs-jules[bot]**)
  - Optimize create_order: Fix N+1 queries and update schemas (por **google-labs-jules[bot]**)
  - Fix N+1 query issue in order creation (por **google-labs-jules[bot]**)
  - Fix information leakage in products API (por **google-labs-jules[bot]**)
  - Optimize create_order: Fix N+1 queries and update schemas (por **google-labs-jules[bot]**)
  - Fix N+1 query issue in order creation (por **google-labs-jules[bot]**)
  - Fix information leakage in products API (por **google-labs-jules[bot]**)
  - fix(frontend): resolve web warnings and checkout crash (por **nojustbenja**)
  - fix(docs): update issue and discussion links in README (por **nojustbenja**)

### Performance
  - perf(orders): optimize get_order with eager loading (por **nojustbenja**)
  - perf(orders): eliminate redundant db.refresh in order creation (por **nojustbenja**)

### Refactor
  - refactor: optimize test imports and enhance profile layout with responsive design (por **nojustbenja**)
  - Refactor code structure for improved readability and maintainability (por **nojustbenja**)
  - refactor(api): products router delegates business logic to service layer (por **nojustbenja**)
  - Refactor code structure for improved readability and maintainability (por **nojustbenja**)
  - Refactor code structure for improved readability and maintainability (por **nojustbenja**)
  - Refactor code structure for improved readability and maintainability (por **nojustbenja**)

### Tests
  - test(users): add comprehensive tests for Query parameter validation (por **nojustbenja**)

### Docs
  - docs: Update executive summary with cart system completion (por **nojustbenja**)
  - docs: update executive summary for January 2026 milestone (por **nojustbenja**)
  - docs(frontend): finalize environment setup automation and documentation (por **nojustbenja**)
  - docs(README): update Python version to 3.14 and improve formatting (por **nojustbenja**)
  - docs(README): update Python version to 3.14.2 for improved performance deps(requirements): update dependencies for compatibility with Python 3.14 (por **nojustbenja**)
  - docs(auth): add session summary and action items (por **nojustbenja**)
  - docs: Add comprehensive project analysis and sprint planning (por **nojustbenja**)
  - docs: update canonical status docs and cursorrules guidelines (por **nojustbenja**)
  - docs(env): update DATABASE_URL comment for clarity (por **nojustbenja**)
  - docs(status-logs): consolidate canonical files (por **nojustbenja**)
  - docs(status): add comprehensive analysis and refactoring plan (por **nojustbenja**)
  - docs: add copilot instructions for project architecture and workflows (por **nojustbenja**)
  - docs: add comprehensive PR rules and branch naming conventions to .cursorrules (por **nojustbenja**)
  - docs: consolidate documentation, update branch naming convention, and improve contributing guidelines (por **nojustbenja**)
  - docs: add section for obtaining keys and credentials in README (por **nojustbenja**)
  - docs: Add AI guidelines and improve technology stack table formatting in README files (por **nojustbenja**)
  - docs: update README files for clarity and structure; add new documentation index (por **nojustbenja**)

### Chore
  - Merge pull request #60 from nojustbenja/feat/cart-persistence (por **nojustbenja**)
  - Merge pull request #58 from nojustbenja/perf/initial-test-and-opt-task (por **nojustbenja**)
  - chore(frontend): remove .env from tracking and improve setup automation (por **nojustbenja**)
  - Merge pull request #59 from nojustbenja/copilot/sub-pr-58 (por **nojustbenja**)
  - Merge pull request #53 from nojustbenja/bolt-pagination-orders-912576508160657989 (por **nojustbenja**)
  - Merge pull request #49 from nojustbenja/perf/optimize-users-list-limit-6185953504244063733 (por **nojustbenja**)
  - chore: merge master into perf/optimize-users-list-limit branch (por **nojustbenja**)
  - Merge pull request #46 from nojustbenja/optimize-order-creation-n-plus-one-16942017886126460758 (por **nojustbenja**)
  - Merge branch 'optimize-order-creation-n-plus-one-16942017886126460758' of https://github.com/nojustbenja/HealthBytes-dev into optimize-order-creation-n-plus-one-16942017886126460758 (por **nojustbenja**)
  - Refactor products endpoint and update security tests (por **google-labs-jules[bot]**)
  - Merge pull request #45 from nojustbenja/feature-add-pagination-to-list-users-14538347090499136108 (por **nojustbenja**)
  - Merge pull request #41 from nojustbenja/refactor/create-services-layer (por **nojustbenja**)
  - Merge pull request #39 from nojustbenja/refactor/create-services-layer (por **nojustbenja**)
  - Merge pull request #37 from nojustbenja/chore/update-dependencies (por **nojustbenja**)
  - chore(deps): update @types/react, cross-env, eslint, and eslint-plugin versions (por **nojustbenja**)
  - chore(deps): update backend and frontend dependencies (por **nojustbenja**)
  - chore(deps): bump tar from 7.4.3 to 7.5.3 (Security Fix) (por **dependabot[bot]**)
  - chore(deps): bump undici from 6.21.3 to 6.23.0 (Security Fix CVE-2026-22036) (por **dependabot[bot]**)
  - Merge pull request #34 from nojustbenja/chachoCL-clerck (por **nojustbenja**)

### Otros
  - Initial plan (por **copilot-swe-agent[bot]**)
  - ⚡ Bolt: Add pagination and sorting to list_orders endpoint (por **google-labs-jules[bot]**)
  - Add pagination to list users endpoint (por **nojustbenja**)
  - ⚡ optimize user list query with limit/offset validation (por **google-labs-jules[bot]**)
  - Address PR feedback regarding Copilot suggestions (por **google-labs-jules[bot]**)
  - Fuentes de letra de barra recientes y alineacion (por **GuillermoSerrano132**)
  - Se soluciona barra de recien vistos para que al clickear se dirija al producto respectivo, aun tengo que ver para que se vea bien en celular (por **GuillermoSerrano132**)
  - Delete code conventions section from README (por **nojustbenja**)
  - Remove 'Relacionado con' section from README (por **nojustbenja**)
  - Remove unnecessary pass statement in clerk_jwks_url method (por **nojustbenja**)
  - Import of 'AsyncSession' is not used. Import of 'create_async_engine' is not used. Import of 'async_sessionmaker' is not used. (por **nojustbenja**)
  - Import of 'os' is not used. (por **nojustbenja**)
  - Import of 'httpx' is not used. (por **nojustbenja**)
  - Unused import Platform. (por **nojustbenja**)
  - removed Unused imports SignedIn, SignedOut. (por **nojustbenja**)
  - ahora si funka supabase y clerck (por **chachoCL**)

---

## [2025-12] — Diciembre 2025

### Features
  - feat: Implement frontend ESLint with security plugins and add backend server host/port configuration. (por **nojustbenja**)
  - feat: Implement user management endpoints with role-based access control and add admin-only order deletion. (por **nojustbenja**)
  - feat: integrate dotenv for environment variable management and update project dependencies. (por **nojustbenja**)

### Chore
  - Merge pull request #23 from nojustbenja/feat/busqueda-productos (por **nojustbenja**)

### Otros
  - T2.3 Pantalla de checkout sin pasarela real (por **Basty001**)
  - Indexacion de los flujos/diagramas de drawio + actualizacion del organigrama + flujo CRUD (por **nojustbenja**)

---

## [2025-11] — Noviembre 2025

### Features
  - feat: Update FastAPI service and scripts for improved setup and user experience - Modify root endpoint message for better user engagement - Change server port to 3001 for consistency with Node.js - Enhance Windows and Unix startup scripts for virtual environment management - Update README with new setup instructions and API details - Remove unused FastAPI main.py file (por **nojustbenja**)
  - feat: Migrar API de Node.js a FastAPI (por **nojustbenja**)

### Chore
  - Merge pull request #22 from nojustbenja/feat/busqueda-productos (por **GuillermoSerrano132**)
  - Merge pull request #21 from nojustbenja/benja_za (por **nojustbenja**)

### Otros
  - Barra de conectada al backend (por **Basty001**)

---

## [2025-10] — Octubre 2025

### Otros
  - Primera inicializacion de fastapi antes de la construccion con el sistema CRUD (por **nojustbenja**)

---

## [2025-09] — Septiembre 2025

### Features
  - Merge pull request #20 from nojustbenja/GuillermoSerrano132 (por **nojustbenja**)
  - Merge pull request #19 from nojustbenja/GuillermoSerrano132 (por **nojustbenja**)
  - Merge branch 'GuillermoSerrano132' of https://github.com/nojustbenja/HealthBytes-dev into GuillermoSerrano132 (por **GuillermoSerrano132**)
  - Se agregar barra de recientes para pagina principal funcional, se crea su ts en store, su componente en carpeta components, y se agrega en el app (por **GuillermoSerrano132**)

### Otros
  - Cosas solo visuales respecto a figma, añadir con el backend se esta haciendo complejo para que funcione realmente (por **GuillermoSerrano132**)
  - barra favoritos muy fea pero en proceso (por **GuillermoSerrano132**)
  - Cambios menores (por **GuillermoSerrano132**)
  - Se realiza el saludo creando componente header.tsx, se importa en ell app y muestra saludo con barra de busqueda, obviamente todo visual por ahora (por **GuillermoSerrano132**)
  - Se realiza un type para un mejor orden en barra de recientes, para trabajar con typescipt (por **GuillermoSerrano132**)

---

## [2025-08] — Agosto 2025

### Features
  - Merge pull request #17 from nojustbenja/GuillermoSerrano132 (por **nojustbenja**)
  - Merge branch 'master' into GuillermoSerrano132 (por **GuillermoSerrano132**)

### Bug Fixes
  - Merge pull request #15 from nojustbenja/fix-db (por **nojustbenja**)
  - Merge pull request #13 from nojustbenja/copilot/fix-6af8e749-6a76-4730-8a4f-22a75eccd43d (por **nojustbenja**)
  - Merge pull request #12 from nojustbenja/codex/fix-detected-error-in-codebase (por **nojustbenja**)
  - fix(auth): handle bearer tokens (por **nojustbenja**)

### Chore
  - Merge branch 'master' of https://github.com/nojustbenja/HealthBytes-dev (por **GuillermoSerrano132**)
  - Merge pull request #16 from nojustbenja/chachoCL-patch-1 (por **nojustbenja**)
  - Update README with example PostgreSQL URL (por **chachoCL**)
  - Merge pull request #14 from nojustbenja/nojustbenja-patch-2 (por **nojustbenja**)
  - Update README.md (por **nojustbenja**)

### Otros
  - Arreglo de titulos a travez de paginas (por **GuillermoSerrano132**)
  - arreglo db correcto (por **GuillermoSerrano132**)
  - gcc (por **GuillermoSerrano132**)
  - url postgresql agregado y se removio de index.ts el uso forzado de db anterios (por **chachoCL**)
  - Add initial documentation/Context for HealthBytes  Frontend AI context (por **nojustbenja**)
  - Initial plan (por **copilot-swe-agent[bot]**)
  - Actualizacion de ficheros y leves modificaciones en el redame. (por **nojustbenja**)

---

## [2025-07] — Julio 2025

### Features
  - Merge pull request #11 from nojustbenja/GuillermoSerrano132 (por **nojustbenja**)
  - Merge pull request #10 from nojustbenja/GuillermoSerrano132 (por **nojustbenja**)
  - Login-Pt.1 (por **Simón Aspée**)

### Chore
  - Merge pull request #9 from nojustbenja/simon (por **nojustbenja**)
  - Update package-lock.json (por **Simón Aspée**)

### Otros
  - Se remueve la opcion de comprar cosas a menos que el usuario este registrado (por **nojustbenja**)
  - Se agrega conexiones: - Back end para el registro de usuarios de manera permanente - inicio y registro de seccion de usuarios (por **nojustbenja**)
  - Se usa la rama de chachoCL, con la cual resolvio el problema de la base de datos; (por **nojustbenja**)
  - Barra de Navegación para facilitar manejo entre secciones (por **GuillermoSerrano132**)
  - Se realiza cambios minimos pero importantes; Cambio en el carrito que se agrege cantidad +1 cuando se agregan mas del mismo, se movio un poco el icono para que se vea mas centrado, y ahora el icono del carrito muestra la cantidad de productos que hay en el carrito actualizada segun total diferentes productos y del mismo. (por **GuillermoSerrano132**)
  - Se crea los types de state, ya que zustand no infiere el tipo por si solo cuando se trabaja en TSX (por **GuillermoSerrano132**)
  - Se actualiza en .json problema del JSX (por **GuillermoSerrano132**)

---

## [2025-06] — Junio 2025

### Features
  - Merge pull request #7 from nojustbenja/GuillermoSerrano132 (por **nojustbenja**)
  - Carrito Funcional (add to cart - removeFromcart (por **GuillermoSerrano132**)

### Bug Fixes
  - Se ha añadido el carrito basado en Zustand, como se presenta en el video del E-Commerce. Esta todo al pie de la letra y funcional, me he saltado la seccionn del video del backend e ido enseguida al carrito pero no afecta funcionalidad, es cosa de añadirlo solamente, los errores que marca el vs code son de un state que no se ha definido su type aun, pero funciona correctamente. (por **GuillermoSerrano132**)
  - Se arregla error no encontraba carpeta expo (por **GuillermoSerrano132**)

---

## [2025-05] — Mayo 2025

### Chore
  - Update README.md (por **nojustbenja**)
  - Merge pull request #5 from nojustbenja/chachoCL-patch-1 (por **nojustbenja**)
  - Update README.md (por **chachoCL**)
  - Update README.md (por **nojustbenja**)
  - Update README.md (por **nojustbenja**)

---

## [2025-04] — Abril 2025

### Features
  - UI de los productos con gluestack (por **nojustbenja**)
  - UI de los productos con gluestack (por **nojustbenja**)
  - Creacion de la carpeta componentes, en donde se guarda la lista de productos y la insercion de una base de datos de test de productos (por **nojustbenja**)

### Bug Fixes
  - se realiza una correcion de error para el uso del css de tailwind (por **nojustbenja**)
  - Se genera una restructuracion de las dependencias debido a un error de la dependencia babel (por **nojustbenja**)

### Chore
  - Se realiza un parche para los componentes de css que no funcionaban por la configuracion de la libreria (por **nojustbenja**)

### Otros
  - se modifica el diagrama de flujo del personal (por **nojustbenja**)
  - Cambio de main -> a master & las componentes inciales de react (por **nojustbenja**)

---
<!-- /DOCSYNC:changelog-body -->
