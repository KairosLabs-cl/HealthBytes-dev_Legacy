# Changelog

> Generado automáticamente por `docs/.automation/docsync.py`.
> Para revisión humana antes de cada release, editar esta sección manualmente.

<!-- DOCSYNC:changelog-body -->
## [2026-05] — Mayo 2026

### Features
  - feat: implement Jules agent management dashboard with status tracking and dynamic prompt creation, plus update Kanban task structure (por **Benjamin Zamora**)
  - feat: initialize Jules agent system prompts and remove Kanban dashboard restrictions from individual agent configurations (por **Benjamin Zamora**)
  - feat(security): implement Refresh Token Rotation and infrastructure hardening (por **Benjamin Zamora**)
  - tool: implement UI extraction and state capture automation (por **Benjamin Zamora**)
  - feat(frontend): add theme preference, push notifications, and Sentry infra (por **Benjamin Zamora**)
  - feat: Mayo 2026 — Push Notifications, Reviews, Recommendations, Deep Linking, Dark Mode, A11y (#193) (por **Benjamin Zamora**)
  - feat(home): Agregar sección de descuentos visuales e insignias de pro… (#158) (por **basty200**)

### Bug Fixes
  - fix: apply CodeRabbit auto-fixes (por **coderabbitai[bot]**)
  - fix(frontend): align lockfile config and scoped js-cookie override (por **Benjamin Zamora**)
  - fix(a11y): label accessibility action surfaces (#223) (por **Benjamin Zamora**)
  - fix(repo): remediate hygiene issues (#206) (por **Benjamin Zamora**)
  - Push token validation, Mercado Pago webhook hardening, eager-load dietary tags, and push-notifications fixes (#203) (por **Benjamin Zamora**)
  - fix(backend): repair products, addresses, users, payments API (por **Benjamin Zamora**)

### Performance
  - perf(repo): implement critical P0 performance optimizations across backend and frontend (por **Benjamin Zamora**)
  - perf(home): batch product filter selectors (#221) (por **Benjamin Zamora**)
  - perf(layout): batch zustand selectors with useShallow (#218) (por **Benjamin Zamora**)
  - perf(cart): batch Zustand selectors (por **Benjamin Zamora**)

### Refactor
  - refactor: standardize agent roles, formalize product safety protocols, and enforce task-based PR workflows across all AI agents (por **Benjamin Zamora**)
  - refactor: improve type safety in auth API, optimize token generation code, and disable rate limiting for test suite (por **Benjamin Zamora**)
  - refactor(root): reorganize misplaced scripts and extraction artifacts (por **Benjamin Zamora**)

### Tests
  - test(backend): add legacy model schema coverage (por **Benjamin Zamora**)
  - CodeRabbit Generated Unit Tests: Add unit tests (por **coderabbitai[bot]**)
  - test(products): cover discount listing (por **Benjamin Zamora**)

### Docs
  - docs(ia): add weekly agent kanban for performance and de-overengineering (por **Benjamin Zamora**)
  - docs(status): update project status after cleanup and security hardening (por **Benjamin Zamora**)
  - docs(status): consolidate project state into PROJECT_STATUS.md (por **Benjamin Zamora**)
  - docs: initialize project architecture and maintenance guides (por **Benjamin Zamora**)
  - docs(ai): implement agent instructions and self-improvement skill (por **Benjamin Zamora**)
  - docs: track dependency CR in agent kanban (por **Benjamin Zamora**)
  - docs(ia): add role-based agent hive prompts (#219) (por **Benjamin Zamora**)
  - docs: finalize sync (#196) (por **Benjamin Zamora**)
  - docs(sync): auto-update metrics 2026-05-04 (por **Benjamin Zamora**)

### Chore
  - Merge pull request #226 from coderabbitai (por **Benjamin Zamora**)
  - Merge pull request #224 (por **Benjamin Zamora**)
  - Merge pull request #229 from codex/review-javascript-cookie-vulnerability (por **Benjamin Zamora**)
  - chore(deps): merge brace-expansion bump (por **Benjamin Zamora**)
  - chore(deps): merge postcss bump (por **Benjamin Zamora**)
  - chore(deps): merge ws bump (por **Benjamin Zamora**)
  - chore: update dependencies and regenerate node_modules lockfile (por **Benjamin Zamora**)
  - chore(structure): move root docker scripts to Tools/ops/ and update docs (por **Benjamin Zamora**)
  - chore(ai): unify AI context into .ai/ and remove legacy systems (por **Benjamin Zamora**)
  - chore(frontend): remove unused dependency bs58 (por **Benjamin Zamora**)
  - chore(deps): bump ws from 8.18.3 to 8.20.1 in /frontend (por **dependabot[bot]**)
  - chore(deps): bump postcss from 8.4.49 to 8.5.14 in /frontend (por **dependabot[bot]**)
  - chore(deps): bump brace-expansion from 5.0.5 to 5.0.6 in /frontend (por **dependabot[bot]**)
  - chore(deps): bump @clerk/clerk-expo from 2.19.26 to 2.19.36 in /frontend (#186) (por **dependabot[bot]**)

### Otros
  - style(backend): apply autoflake, isort, and black formatting (por **Benjamin Zamora**)
  - ⚡ Bolt: [performance] Prevent unnecessary re-renders in Home and Cart screens (#195) (por **Benjamin Zamora**)
  - 🛡️ Sentinel: [MEDIUM] Add global exception handler to prevent info leakage (#185) (por **Benjamin Zamora**)
  - ⚡ Bolt: Use route parameter for cart item selector (#190) (por **Benjamin Zamora**)

---

## [2026-04] — Abril 2026

### Features
  - feat(docs): update project status and audit details in README.md and docs/README.md (por **Benjamin Zamora**)
  - feat(docs): centralize project status and roadmap in PROJECT_STATUS.md, update references across documentation (por **Benjamin Zamora**)
  - feat(audit): add comprehensive frontend audit report for HealthBytes app, covering compliance, architecture, performance, and critical issues (por **Benjamin Zamora**)

### Bug Fixes
  - Merge pull request #180 from nojustbenja/perf-optimize-product-selector-fix-6009234678633696653 (por **Benjamin Zamora**)
  - Merge pull request #181 from nojustbenja/sentinel/fix-cors-production-18433196559188634409 (por **Benjamin Zamora**)
  - 🛡️ Sentinel: [HIGH] Fix overly permissive CORS in production (por **google-labs-jules[bot]**)
  - 🛡️ Sentinel: [security improvement] Fix swallowed exceptions (por **google-labs-jules[bot]**)
  - fix(frontend): restore grid layout and product detail image visibility (por **Benjamin Zamora**)
  - fix(frontend): add width 100% to BottomNavBar animated wrapper on mobile (por **Benjamin Zamora**)
  - fix(frontend): resolve frozen ref crash in BottomNavBar on Android (por **Benjamin Zamora**)
  - Merge pull request #152 from nojustbenja/fix/ci-safety-check (por **Benjamin Zamora**)
  - fix(ci): restore safety check with continue-on-error (por **Benjamin Zamora**)
  - fix(phase-3): TypeScript fixes and cleanup (por **Benjamin Zamora**)
  - security: Phase 2 hardening fixes (por **Benjamin Zamora**)
  - Merge pull request #141 from nojustbenja/sentinel-fix-user-enumeration-5250532672455615239 (por **Benjamin Zamora**)
  - 🛡️ Sentinel: [HIGH] Fix CI baseline file and user enumeration issue (por **google-labs-jules[bot]**)
  - 🛡️ Sentinel: [HIGH] Fix user enumeration in registration via timing attacks (por **google-labs-jules[bot]**)
  - Merge pull request #137 from nojustbenja/bolt/fix-layout-store-re-renders-5783082319457597131 (por **Benjamin Zamora**)
  - ⚡ Bolt: [performance improvement] fix full layout re-renders (por **google-labs-jules[bot]**)
  - Merge pull request #140 from nojustbenja/bolt/fix-root-layout-re-renders-12885122936603061784 (por **Benjamin Zamora**)
  - ⚡ Bolt: [performance improvement] fix CI deprecation failures (por **google-labs-jules[bot]**)

### Performance
  - perf(frontend): fix unnecessary re-renders in product detail screen (por **google-labs-jules[bot]**)
  - perf(frontend): migrate to FlashList, expo-image caching, and remove per-card rating queries (por **Benjamin Zamora**)
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
  - docs(phase-1): add PR review summary and close phase (por **Benjamin Zamora**)
  - docs: add codebase map via gsd-codebase-mapper agents (por **Benjamin Zamora**)
  - docs: restore missing baseline file for CI (por **google-labs-jules[bot]**)
  - docs(sync): auto-update metrics 2026-04-11 (por **google-labs-jules[bot]**)
  - docs(sync): auto-update metrics 2026-04-09 (por **google-labs-jules[bot]**)
  - docs(sync): auto-update metrics 2026-04-04 (por **google-labs-jules[bot]**)

### Chore
  - Merge pull request #179 from nojustbenja/juanito-docs-sync-5461448108620457975 (por **Benjamin Zamora**)
  - Merge pull request #178 from nojustbenja/jules-9275165521448548953-c63dd1e9 (por **Benjamin Zamora**)
  - Merge pull request #168 from nojustbenja/juanito-docs-sync-7678814345473343788 (por **Benjamin Zamora**)
  - Merge pull request #167 from nojustbenja/jules-17785781460630581273-c32cbb84 (por **Benjamin Zamora**)
  - chore(deps): patch critical and high severity vulnerabilities via pnpm overrides (por **google-labs-jules[bot]**)
  - Merge pull request #151 from nojustbenja/security/phase-2-hardening (por **Benjamin Zamora**)
  - Merge pull request #150 from nojustbenja/bolt-optimize-homescreen-renders-415246467967511243 (por **Benjamin Zamora**)
  - Merge pull request #147 from nojustbenja/bolt-prevent-homescreen-rerenders-11582485267747728029 (por **Benjamin Zamora**)
  - Merge pull request #145 from nojustbenja/bolt-perf-product-details-15184023250121591183 (por **Benjamin Zamora**)
  - Merge pull request #138 from nojustbenja/bolt/layout-selector-optimization-17066685429008677263 (por **Benjamin Zamora**)
  - Merge pull request #135 from nojustbenja/bolt-perf-layout-re-renders-4207890279840064207 (por **Benjamin Zamora**)
  - Merge pull request #146 from nojustbenja/juanito-docsync-2026-04-11-7697139363135177052 (por **Benjamin Zamora**)
  - Merge pull request #143 from nojustbenja/juanito-docs-sync-4257271242954444189 (por **Benjamin Zamora**)
  - chore(postman): remove unused resources.yaml file (por **Benjamin Zamora**)
  - Merge pull request #136 from nojustbenja/docs/sync-metrics-2026-04-04-13172982831718951524 (por **Benjamin Zamora**)
  - Merge pull request #134 from nojustbenja/bolt/optimize-cart-service-8088860547893749377 (por **Benjamin Zamora**)
  - Merge master into PR #134 (por **Benjamin Zamora**)
  - Merge remote-tracking branch 'origin/master' into bolt/optimize-cart-service-8088860547893749377 (por **Benjamin Zamora**)
  - chore: execute lane P2 deprecations and weekly roadmap scorecard (#133) (por **Benjamin Zamora**)
  - Merge pull request #130 from nojustbenja/perf-remove-unused-cart-subscription-15137265361143519252 (por **Benjamin Zamora**)

### Otros
  - init: GSD project initialization (por **Benjamin Zamora**)
  - ⚡ Bolt: [performance improvement] optimize root layout zustand selectors (por **google-labs-jules[bot]**)

---

## [2026-03] — Marzo 2026

### Features
  - feat: add reviews system for products and vendors (#128) (por **Benjamin Zamora**)
  - feat: Implement product review functionality and add push notification support. (por **Benjamin Zamora**)
  - Merge pull request #99 from nojustbenja/docs/roadmap-uiux-update (por **Benjamin Zamora**)
  - feat(ui): add random greetings in Header (por **Benjamín Zamora**)
  - Merge branch 'bolt/zustand-granular-selectors-11602566720000025396' of https://github.com/nojustbenja/HealthBytes-dev into docs/roadmap-uiux-update (por **Benjamin Zamora**)
  - feat(orders): interactive product detail with images, navigation, and unified ScreenHeader (por **Benjamin Zamora**)
  - feat: Implement comprehensive e-commerce frontend including checkout, product pages, user profile management, and order handling. (por **Benjamin Zamora**)
  - feat(security): add X-XSS-Protection header (por **google-labs-jules[bot]**)
  - feat(ui): complete ui redesign sprint including onboarding, product cards, and remaining layout polish (por **Benjamin Zamora**)
  - feat(ui): implement vendor info and more from vendor carousel in product detail (por **Benjamin Zamora**)
  - feat: UI redesign - ProductCard, vendor_name, dietary filters & CI fixes (#87) (por **Benjamin Zamora**)
  - feat: Implement animated bottom navigation, product detail page, and backend services for users, favorites, and orders. (por **Benjamin Zamora**)
  - feat(frontend): conversion-optimized PDP + fly-to-cart animations (por **Benjamin Zamora**)
  - feat: add order, payment, and stock management services with associated documentation. (por **Benjamin Zamora**)

### Bug Fixes
  - Merge sentinel-fix-timing-attack (resolve conflicts) (por **Benjamin Zamora**)
  - Merge: Sentinel Mass Assignment fix (por **Benjamin Zamora**)
  - Merge: Fix CI types + Zustand optimization (resolve conflict in usePushNotifications) (por **Benjamin Zamora**)
  - fix: resolve backend flake8 lint and frontend Jest failure (por **google-labs-jules[bot]**)
  - fix: resolve backend linting and frontend type errors causing CI failure (por **google-labs-jules[bot]**)
  - 🛡️ Sentinel: [HIGH] Fix timing attack and AttributeError in auth_service (por **google-labs-jules[bot]**)
  - Fix CI failures: Format backend files and remove unused variables (por **google-labs-jules[bot]**)
  - fix(ci): Resolve backend import sorting errors (por **google-labs-jules[bot]**)
  - Fix CI failures: Resolve type issues and missing modules in frontend hooks/components (por **google-labs-jules[bot]**)
  - fix(ci): Resolve frontend type errors and format backend code (por **google-labs-jules[bot]**)
  - 🛡️ Sentinel: [CRITICAL] Fix user enumeration via OAuth 500 errors (por **google-labs-jules[bot]**)
  - fix: audit cleanup — sandbox URL gate, type safety, Sentry integration, orphan removal (por **Benjamin Zamora**)
  - 🛡️ Sentinel: [HIGH] Fix user enumeration via OAuth user 500 error (por **google-labs-jules[bot]**)
  - 🛡️ Sentinel: [HIGH] Fix mass assignment vulnerability in AddressUpdate (por **google-labs-jules[bot]**)
  - style(perf): fix formatting in email_service.py (por **google-labs-jules[bot]**)
  - fix(security): patch tar vulnerability CVE via pnpm override (por **Benjamin Zamora**)
  - fix(security): add AuthGate to payment screens and sync ORM indexes (por **Benjamin Zamora**)
  - fix(tests): use AdminUserUpdate in service tests for privileged fields

The UserUpdate schema no longer exposes email/role fields after the
mass-assignment security fix. Service-level tests that update
privileged fields now use AdminUserUpdate instead.

Fixes CI backend test failures. (por **Benjamin Zamora**)
  - Merge PR #94: perf(cart): fix N+1 query issue in merge_cart_items (por **Benjamin Zamora**)
  - fix(security): add max_length=128 to password fields to prevent DoS

Add max_length=128 constraint to password fields in UserCreate and
UserUpdate schemas. Excessively long passwords can cause resource
exhaustion during bcrypt hashing.

Subsumes PRs #88, #90, #93, #95 (all identical fixes). (por **Benjamin Zamora**)
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

Addresses PR #86 review feedback. (por **Benjamin Zamora**)
  - 🛡️ Sentinel: [CRITICAL] Fix Mass Assignment Privilege Escalation in User Update (#86) (por **Benjamin Zamora**)
  - Merge pull request #84 from nojustbenja/fix/unified-security-perf (por **Benjamin Zamora**)
  - fix(security): HTML injection fix + email eager loading + orders FlatList (por **Benjamin Zamora**)
  - fix(deps): bump minimatch to 10.2.3 to resolve ReDoS CVEs (#45, #46) (por **Benjamin Zamora**)
  - fix(frontend): minor fixes in products API, home screen, StockBadge and cartStore (por **Benjamin Zamora**)
  - fix(security): harden auth, CORS, logging and increase test coverage (por **Benjamin Zamora**)

### Performance
  - perf: remove unused cart items subscription in root layout (por **google-labs-jules[bot]**)
  - perf: optimize Zustand selectors in CartItem (por **google-labs-jules[bot]**)
  - perf(frontend): optimize RecentlyViewedBar rendering by using granular selector (#109) (por **Benjamin Zamora**)
  - perf(stock): implement batch stock release to fix N+1 queries during order cancellation (#108) (por **Benjamin Zamora**)
  - perf: use granular zustand selectors to prevent full-screen re-renders (por **google-labs-jules[bot]**)
  - perf(frontend): Optimize `useFavoritesStore` subscriptions using selectors (por **google-labs-jules[bot]**)
  - perf: batch fetch products in email service to prevent N+1 (por **google-labs-jules[bot]**)
  - perf(cart): fix N+1 query issue in merge_cart_items (por **google-labs-jules[bot]**)
  - perf(frontend): memoize zustand selectors for cart calculations (por **google-labs-jules[bot]**)
  - perf(frontend): prevent unnecessary re-renders in Checkout and Addresses (por **google-labs-jules[bot]**)

### Tests
  - test(frontend): fix mocks for AuthGate and ScreenHeader to resolve CI failures (por **Benjamin Zamora**)

### Docs
  - docs(sync): auto-update metrics 2026-03-18 (#107) (por **Benjamin Zamora**)
  - docs: update production checklist with March 11 audit findings (por **Benjamin Zamora**)
  - docs: update roadmap marking onboarding signature visual as completed (por **Benjamin Zamora**)
  - docs: update UIUX_ROADMAP.md with mobile and interface design analysis (por **Benjamin Zamora**)
  - docs: Add bi-weekly project progress report for Feb 24 - Mar 9, 2026 and backend .gitignore file. (por **Benjamin Zamora**)
  - docs(sync): auto-update metrics 2026-03-08 (por **google-labs-jules[bot]**)
  - docs: add UI/UX audit system and development guidelines (por **Benjamin Zamora**)
  - docs: add comprehensive project roadmap document outlining current status and future development milestones. (por **Benjamin Zamora**)

### Chore
  - chore: clean up project structure and documentation (#129) (por **Benjamin Zamora**)
  - chore: ignore macOS resource forks and sync env (por **Benjamín Zamora**)
  - ci: fix backend lint, frontend type check, and add gitleaksignore (por **Benjamín Zamora**)
  - chore: ignore macOS resource fork files (._*) (por **Benjamín Zamora**)
  - chore: align mac startup scripts and fix backend product/CORS startup issues (por **Benjamín Zamora**)
  - Merge branch 'pr-104' into pr-99 (por **Benjamin Zamora**)
  - Merge branch 'pr-103' into pr-99 (Resolving conflicts in journal) (por **Benjamin Zamora**)
  - Merge branch 'pr-102' into pr-99 (por **Benjamin Zamora**)
  - Merge branch 'pr-101' into pr-99 (por **Benjamin Zamora**)
  - Merge PR #98: Optimize multiple dietary tags filtering (por **Benjamin Zamora**)
  - Merge PR #97: Add X-XSS-Protection security header (por **Benjamin Zamora**)
  - chore: remove outdated interface system documentation (por **Benjamin Zamora**)
  - chore: remove file (por **Benjamin Zamora**)
  - Merge PR #92: perf(frontend): memoize zustand selectors for cart calculations (por **Benjamin Zamora**)
  - Merge PR #91: docs(sync): auto-update metrics 2026-03-08 (por **Benjamin Zamora**)
  - Merge PR #89: perf(frontend): prevent unnecessary re-renders in Checkout and Addresses (por **Benjamin Zamora**)
  - Merge branch 'master' of https://github.com/nojustbenja/HealthBytes-dev (por **Benjamin Zamora**)

### Otros
  - ⚡ Bolt: [performance improvement] (#114) (por **Benjamin Zamora**)
  - 🛡️ Sentinel: [MEDIUM] Prevent Mass Assignment Vulnerability in Service Layers (#110) (por **Benjamin Zamora**)
  - 🛡️ Sentinel: [MEDIUM] Prevent Mass Assignment Vulnerability in Service Layers (por **google-labs-jules[bot]**)
  - ⚡ Bolt: [performance] Optimize multiple dietary tags filtering (por **google-labs-jules[bot]**)

---

## [2026-02] — Febrero 2026

### Features
  - feat: merge feat/refine-nav-and-ux into master (por **Benjamin Zamora**)
  - feat(frontend): complete dietary-preferences screen and onboarding wizard (por **Benjamin Zamora**)
  - feat(frontend): refine home UX, unify spacing system, fix mobile issues (por **Benjamin Zamora**)
  - feat: add user addresses management screen with CRUD functionality and form validation. (por **Benjamin Zamora**)
  - feat: Add product detail page, address management, and skeleton loading components along with generated Android build and autolinking files. (por **Benjamin Zamora**)
  - feat(ui): refine nav, UX and performance across frontend screens (por **Benjamin Zamora**)
  - feat(ui): refine product navigation, interaction fixes and profile cleanup (por **Basty001**)
  - feat: Implement user registration and login endpoints with password hashing, JWT token generation, and timing attack mitigation. (por **Benjamin Zamora**)
  - feat: Implement Mercado Pago payment integration, new frontend profile and dietary preference features, and CI/CD workflows. (por **Benjamin Zamora**)
  - feat(perf): batch stock reservation in order creation (por **google-labs-jules[bot]**)
  - Merge pull request #71 from nojustbenja/feat/ux-ui-improvements (por **Benjamin Zamora**)
  - feat(docs): update README and documentation for improved clarity and coverage metrics (por **Benjamin Zamora**)
  - feat(payment): add reopen button on pending screen when MP popup closes (por **Benjamin Zamora**)
  - feat(p1): dietary restrictions onboarding + Docker + TS fixes (por **Benjamin Zamora**)
  - feat: Error Boundaries, Alembic migrations, API rate limiting (por **Benjamin Zamora**)
  - feat(payment): complete Mercado Pago checkout flow integration (por **Benjamin Zamora**)
  - feat(payment): implement real payment status polling on pending screen (por **Benjamin Zamora**)
  - feat(email): add transactional emails with Resend for orders lifecycle (por **Benjamin Zamora**)
  - feat(payment): fix Mercado Pago integration and connect frontend checkout (por **Benjamin Zamora**)
  - feat(payment): add payment success, failure, and pending screens with navigation feat(address): implement AddressCard component for address management feat(payment): create PaymentMethodSelector for selecting payment methods feat(step): add StepIndicator component for visualizing steps in a process chore(eas): configure eas.json for build settings feat(store): implement addressStore for managing addresses with Zustand feat(types): define address types for address management (por **Benjamin Zamora**)
  - feat: Initialize project with new React Native frontend, Python backend, and AI agent skill definitions. (por **Benjamin Zamora**)
  - feat: Introduce AI agent skills for mobile development and implement core product and cart management features. (por **Benjamin Zamora**)
  - feat: Implementar aplicación de comercio electrónico inicial con listado de productos, detalles, favoritos y autenticación. (por **jose**)
  - feat: implementar mejores prácticas Supabase PostgreSQL (por **jose**)
  - feat: implementar página de búsqueda dedicada con navegación por URL y mejoras de accesibilidad (por **Basty001**)
  - feat: implementar sistema completo de órdenes con filtros y colores por estado (por **Benjamin Zamora**)
  - feat: update Bandit configuration for enhanced security scanning (por **Benjamin Zamora**)
  - feat: Add HealthBytes security practices documentation and implement pre-commit hooks for backend (por **Benjamin Zamora**)
  - feat(profile): enhance profile screen with order statuses and options navigation feat(messages): add messages screen for vendor communication feat(orders): implement orders screen with status handling feat(payments): create payments screen for managing payment methods feat(profile-settings): add profile settings screen for user data management feat(security): introduce security screen for password and session management feat(support): add support screen for user assistance feat(wishlist): implement wishlist screen for saving products (por **Benjamin Zamora**)
  - feat(security,search): Add content-length validation, full-text search, and fix auth infinite loop (por **Benjamin Zamora**)
  - feat(security): enhance security headers and limit request body size to prevent attacks (por **Benjamin Zamora**)
  - feat(migration): add fulltext search migration script with verification steps (por **Benjamin Zamora**)
  - feat(config): increase default max request body size to 10 MB and add diagnostic endpoint toggle feat(main): update request body size handling and conditionally enable health check endpoints test(products): add comprehensive tests for product search, creation, and updates (por **Benjamin Zamora**)
  - feat(health-check): add health summary function to display package, warning, and error counts (por **Benjamin Zamora**)
  - feat(backend): add compact health check summary to startup script (por **Benjamin Zamora**)
  - feat(security): implement hardened security headers, request size limiting, and Python 3.14.2 enforcement (por **Benjamin Zamora**)
  - feat(products): implement PostgreSQL full-text search with Spanish support (por **Benjamin Zamora**)
  - feat(docs): Add B2B product insertion flow Mermaid diagram (por **copilot-swe-agent[bot]**)
  - feat: agregar búsqueda de productos, eliminar boton de para ti (por **Basty001**)

### Bug Fixes
  - fix(tests): add useRouter mock to index.test.tsx (por **Benjamin Zamora**)
  - fix(tests): fix Alert mock in checkout tests — use jest.fn() direct assignment (por **Benjamin Zamora**)
  - fix(tests): align checkout tests with Alert.alert (title + message) API (por **Benjamin Zamora**)
  - fix(frontend): add skip/limit params to fetchOrders to fix TS2554 (por **Benjamin Zamora**)
  - fix(ci): resolve backend lint E501 and frontend TS type errors (por **Benjamin Zamora**)
  - Merge pull request #76 from nojustbenja/fix-product-dietary-filtering-clean (por **Benjamin Zamora**)
  - fix(backend): remove lingering git merge markers from security.py (por **Benjamin Zamora**)
  - Merge branch 'master' into fix-product-dietary-filtering-clean (por **Benjamin Zamora**)
  - fix(backend): align verify_password_mock signature with master (por **Benjamin Zamora**)
  - fix(backend): resolve merge conflicts and linting errors (por **google-labs-jules[bot]**)
  - Merge pull request #74 from nojustbenja/fix/auth-timing-attack-15259610013706666787 (por **Benjamin Zamora**)
  - Merge branch 'master' into fix/auth-timing-attack-15259610013706666787 (por **Benjamin Zamora**)
  - Merge pull request #73 from nojustbenja/sentinel/fix-user-enumeration-11195672562256748235 (por **Benjamin Zamora**)
  - Merge branch 'master' into sentinel/fix-user-enumeration-11195672562256748235 (por **Benjamin Zamora**)
  - fix(frontend/tests): fix TS type assertion errors in checkout-v2.test.tsx (por **Benjamin Zamora**)
  - fix(mercadopago): include request-id in webhook signature manifest per MP docs (por **Benjamin Zamora**)
  - fix(backend): remove unused sqlalchemy.text import (por **google-labs-jules[bot]**)
  - fix(backend): optimize and fix dietary tag filtering (por **google-labs-jules[bot]**)
  - Fix timing attack vulnerability in login endpoint by implementing verify_password_mock (por **google-labs-jules[bot]**)
  - 🛡️ Sentinel: Fix User Enumeration via Timing Attack (por **google-labs-jules[bot]**)
  - fix(frontend/tests): fix 3 failing test suites (por **Benjamin Zamora**)
  - fix(frontend/tests): fix 3 failing test suites (por **Benjamin Zamora**)
  - fix(frontend/tests): fix 3 failing test suites (por **Benjamin Zamora**)
  - fix(frontend): pin babel-plugin-module-resolver glob to ^8 (por **Benjamin Zamora**)
  - fix(ci): fix all Flake8 errors — remove unused imports, fix E501/E712/F841 (por **Benjamin Zamora**)
  - fix: improve SQLite detection in database.py, update skills with formatting commands, update vulnerable deps (minimatch, tar, ajv) (por **Benjamin Zamora**)
  - fix(ci): fix isort, aiosqlite and pnpm test command (por **Benjamin Zamora**)
  - fix(ci): resolve all CI failures — SQLite pool, ESLint v9, Black formatting (por **Benjamin Zamora**)
  - fix(docker): correct frontend Dockerfile paths and environment (por **Benjamin Zamora**)
  - fix(backend): remove duplicate dietary_tags field in Product schema (por **Benjamin Zamora**)
  - fix(post-merge): se arreglan problemas de compilacion y uso de api (por **Benjamin Zamora**)
  - fix: arreglo del boton de favoritos al darle al home (por **Benjamin Zamora**)
  - fix: Remove emojis from start.ps1 to fix PowerShell parsing errors (por **Benjamin Zamora**)
  - Standardize order API errors and auth (por **Benjamin Zamora**)
  - Implement feature X to enhance user experience and fix bug Y in module Z (por **Benjamin Zamora**)

### Refactor
  - refactor(frontend): extract shared ProductCard and DietaryFilterBar components (por **Benjamin Zamora**)
  - refactor: improve product dietary tag filtering, implement auth timing attack mitigation, and clean up temporary files and .gitignore entries. (por **Benjamin Zamora**)
  - refactor(frontend): fix any types and gate debug logs with __DEV__ (por **Benjamin Zamora**)

### Tests
  - test(backend): fix test_auth_timing comparing string with bytes for the mock hash (por **Benjamin Zamora**)
  - test(backend): restore dietary tags test deleted during merge conflict resolution (por **Benjamin Zamora**)
  - test(backend): add missing dietary tags filter reproduction test (por **Benjamin Zamora**)
  - style(backend): apply Black formatting to test files (por **Benjamin Zamora**)
  - test(frontend): add Zustand store tests for orders, addresses, favorites (por **Benjamin Zamora**)
  - test(frontend): add API client and jest env setup for 67 new tests (por **Benjamin Zamora**)
  - test: add comprehensive router and schema tests to reach 85% coverage (por **Benjamin Zamora**)
  - test(products): add unit and integration tests for product search (por **Benjamin Zamora**)

### Docs
  - docs: Add comprehensive project documentation covering technical architecture, security, data flows, database schemas, API endpoints, frontend structure, and development roadmap. (por **Benjamin Zamora**)
  - docs(security): document timing attack fix maintenance risks and strengthen test coverage (por **Benjamin Zamora**)
  - docs: update README, ROADMAP, and status docs with security vulnerability resolution (por **Benjamin Zamora**)
  - docs: hacemos un roadmap para ux/ui y actualizacion de cuales seran los portales de pago que estremos manejando (por **Benjamin Zamora**)
  - docs: actualizar skills con workspace y hooks (por **Benjamin Zamora**)
  - docs(structure): reorganize documentation for clarity and accessibility (por **Benjamin Zamora**)
  - docs(ai-logs): add reorganization completion report (por **Benjamin Zamora**)
  - docs(reorganization): restructure docs/ with intuitive category-based organization (por **Benjamin Zamora**)
  - docs(comprehensive): update all main documentation files (por **Benjamin Zamora**)
  - docs(update): refresh documentation with current project structure (por **Benjamin Zamora**)

### Chore
  - chore(ci): upgrade Python to 3.13, add frontend Docker build validation (por **Benjamin Zamora**)
  - Merge branch 'Mobile' into feat/refine-nav-and-ux (por **Benjamin Zamora**)
  - chore(claude): update agents with new superpowers skills references (por **Benjamin Zamora**)
  - chore(claude): add custom agents and superpowers skills (por **Benjamin Zamora**)
  - Merge branch 'master' of https://github.com/nojustbenja/HealthBytes-dev into feat/refine-nav-and-ux (por **Benjamin Zamora**)
  - Merge pull request #72 from nojustbenja/bolt-stock-reservation-batch-17686955862631931662 (por **Benjamin Zamora**)
  - chore(deps): update pnpm-lock.yaml (por **Benjamin Zamora**)
  - ci: fix Python version, add frontend tests job, raise coverage threshold (por **Benjamin Zamora**)
  - Merge pull request #68 from nojustbenja/feat/profile-actions (por **Benjamin Zamora**)
  - chore: normalize line endings to LF and add .gitattributes (por **Benjamin Zamora**)
  - Merge branch 'master' into feat/profile-actions (por **Benjamin Zamora**)
  - Merge pull request #70 from nojustbenja/supabase-y-favoritos (por **Benjamin Zamora**)
  - Merge branch 'master' into supabase-y-favoritos (por **Benjamin Zamora**)
  - Merge pull request #69 from nojustbenja/feature/search-page-accessibility (por **Benjamin Zamora**)
  - chore: simplify pre-commit hooks for MVP development (por **Benjamin Zamora**)
  - Merge branch 'master' into feature/search-page-accessibility (por **Benjamin Zamora**)
  - Merge pull request #64 from nojustbenja/copilot/create-b2b-product-insertion-flow (por **Benjamin Zamora**)
  - Merge pull request #63 from nojustbenja/feat/busqueda-productos (por **Benjamin Zamora**)
  - Merge branch 'master' into copilot/create-b2b-product-insertion-flow (por **José**)
  - chore: reorganizar documentación y testing según estructura del proyecto (por **Benjamin Zamora**)
  - chore: Update pre-commit configuration for flake8 arguments (por **Benjamin Zamora**)
  - chore(cleanup): remove old documentation folders (por **Benjamin Zamora**)
  - chore(cleanup): move frontend SETUP.md to docs/frontend/ (por **Benjamin Zamora**)
  - chore(org): move documentation to docs/ and seed script to Tools/ (por **Benjamin Zamora**)
  - chore(tools): organize backend scripts into structured Tools folder (por **Benjamin Zamora**)
  - chore(docs): reorganize documentation into organized folder structure (por **Benjamin Zamora**)
  - Merge branch 'master' into feat/busqueda-productos (por **Benjamin Zamora**)
  - Merge pull request #65 from nojustbenja/feat/product-text-search-indexing (por **Benjamin Zamora**)

### Otros
  - Funcionamiento en mobile (por **Benja Garces**)
  - Reformat the workspace file, reorder its folders, and add new Claude local settings and stock service files. (por **Benjamin Zamora**)
  - security: resolve all npm vulnerabilities and enforce pnpm (por **Benjamin Zamora**)
  - camino a hacer funcionar el boton favoritos (por **jose**)
  - Revise README for improved documentation structure (por **José**)
  - Add HealthBytes project skills documentation for installation, governance, and security practices (por **Benjamin Zamora**)
  - Add request size limits and HSTS header (por **Benjamin Zamora**)
  - Initial plan (por **copilot-swe-agent[bot]**)

---

## [2026-01] — Enero 2026

### Features
  - feat: Initialize FastAPI backend with core configuration and API routes, and set up frontend project dependencies. (por **Basty001**)
  - feat: Add initial API services for authentication, cart, orders, and products, frontend environment configuration, and backend application entry point. (por **Benjamin Zamora**)
  - feat(cart): improve cart item removal and merging logic with loading states (por **Benjamin Zamora**)
  - feat(cart): simulate payment processing before creating an order (por **Benjamin Zamora**)
  - feat: enhance cart functionality with error handling and toast notifications (por **Benjamin Zamora**)
  - feat(cart): enhance cart functionality with error handling and unit tests (por **Benjamin Zamora**)
  - feat(cart): implement rollback mechanism for cart operations on API failure (por **Benjamin Zamora**)
  - feat: Implement home and cart screens, add TypeScript configuration, and optimize FlatList `keyExtractor` for performance. (por **Benjamin Zamora**)
  - feat: Implement product listing with search functionality and a shopping cart with item management. (por **Benjamin Zamora**)
  - feat(tests): add performance benchmarks for get_user_orders with user_id index optimization (por **Benjamin Zamora**)
  - feat(cart): refactor cart footer into a separate component and add CartItem type definition (por **Benjamin Zamora**)
  - feat(cart): implement cart persistence frontend integration

- Create cart API client with TypeScript types
- Rewrite cartStore for backend sync with optimistic updates
- Add auto-sync with Clerk authentication in _layout
- Implement merge logic for local + server carts on login
- Maintain backward compatibility with existing cart UI (por **Benjamin Zamora**)
  - feat(cart): implement cart persistence backend with postgres

- Add CartItem model with user/product relationships
- Create cart schemas for validation
- Implement cart service with CRUD + merge logic
- Add 6 REST endpoints (get, add, update, delete, clear, merge)
- Create migration script for cart_items table
- Add comprehensive test suite (15 tests, all passing)
- Fix router prefix duplication issue (por **Benjamin Zamora**)
  - feat: optimize rendering of FavoritesBar and RecentlyViewedBar with initialNumToRender and batching settings (por **Benjamin Zamora**)
  - feat: enhance layout and styling in HomeScreen, ProfileScreen, and BottomNavBar for improved user experience (por **Benjamin Zamora**)
  - feat: enhance UI components with SafeAreaView and responsive design adjustments (por **Benjamin Zamora**)
  - feat: update Expo API URL for mobile development and enhance user profile display (por **Benjamin Zamora**)
  - feat: Establish initial frontend and backend application setup, including core files, testing configuration, and AI agent development guidelines. (por **Benjamin Zamora**)
  - feat: add performance benchmarks for order creation to verify N+1 query optimization (por **Benjamin Zamora**)
  - feat: enhance frontend setup with automatic IP detection and CORS configuration (por **Benjamin Zamora**)
  - feat: enhance development setup with automatic IP detection and update CORS configuration (por **Benjamin Zamora**)
  - Merge pull request #57 from nojustbenja/perf/frontend-upgrade-requirements (por **Benjamin Zamora**)
  - feat: remove outdated price validation tests and documentation (por **Benjamin Zamora**)
  - feat: Update HealthBytes development guidelines and configurations (por **Benjamin Zamora**)
  - feat(user): add optional fields to UserUpdate schema (por **Benjamin Zamora**)
  - feat(checkout): complete checkout flow implementation and fix database (por **Benjamin Zamora**)
  - feat(docs): add comprehensive reports on test incompatibilities and final merge summary (por **Benjamin Zamora**)
  - feat(orders,test-infrastructure): upgrade to Python 3.14 and fix N+1 queries with complete test infrastructure (por **Benjamin Zamora**)
  - feat: Add pagination to list_users endpoint (por **google-labs-jules[bot]**)
  - feat(frontend): CLP price formatting, direct add-to-cart, cart controls, and UI improvements (por **Benjamin Zamora**)
  - Merge pull request #40 from nojustbenja/Guille-Front (por **Benjamin Zamora**)
  - feat(services): create business logic layer (por **Benjamin Zamora**)
  - feat(tests): Implement price validation tests for orders (por **nojustbenja**)
  - feat: Add guard rails document for AI assistants and update architecture documentation (por **nojustbenja**)
  - feat: Enhance documentation for frontend and backend of HealthBytes (por **nojustbenja**)
  - feat: add Zustand stores for auth, cart, and recently viewed products (por **nojustbenja**)
  - Remove deprecated backend files and configurations, including environment variables, database schemas, and API routes, to streamline the project structure and prepare for a new implementation. (por **nojustbenja**)
  - Remove deprecated backend files and configurations, including environment variables, database schemas, and API routes, to streamline the project structure and prepare for a new implementation. (por **nojustbenja**)
  - Implementacion de Clerk UI con OAuth (Google, Facebook) y login por email (por **jose**)

### Bug Fixes
  - Merge pull request #62 from nojustbenja/Fix/inicio-Backend (por **Benjamin Zamora**)
  - fix: add padding to ScrollView content container in ProductDetailsScreen (por **Benjamin Zamora**)
  - fix: update .gitignore to include .env and enhance IP detection in setup script (por **Benjamin Zamora**)
  - fix(start.ps1): remove Python 3.14 requirement to align with .python-version (3.12.10) (por **copilot-swe-agent[bot]**)
  - fix(security): truncate passwords to 72 bytes for bcrypt compatibility fix(start.ps1): specify Python 3.14 for virtual environment creation fix(tests): update order validation tests to include missing Order schema add: initial test results file for tracking pytest outcomes (por **Benjamin Zamora**)
  - Merge pull request #52 from nojustbenja/sentinel/fix-hardcoded-jwt-secret-215331851763608380 (por **Benjamin Zamora**)
  - Merge branch 'master' into sentinel/fix-hardcoded-jwt-secret-215331851763608380 (por **Benjamin Zamora**)
  - fix(.gitignore): add .venv314 to ignore list (por **Benjamin Zamora**)
  - 🛡️ Sentinel: Fix hardcoded JWT secret (por **google-labs-jules[bot]**)
  - fix(checkout): resolve order creation and improve error logging (por **Benjamin Zamora**)
  - fix(auth): add token availability wait logic to mitigate timing issues (por **Benjamin Zamora**)
  - fix(auth): add comprehensive logging for token cache debugging (por **Benjamin Zamora**)
  - Merge pull request #44 from nojustbenja/jules-nplusone-fix-13701794538008883027 (por **Benjamin Zamora**)
  - Merge branch 'master' into jules-nplusone-fix-13701794538008883027 (por **Benjamin Zamora**)
  - Implement feature X to enhance user experience and fix bug Y in module Z (por **Benjamin Zamora**)
  - fix(products): resolve database schema mismatch and query parameter casting (por **Benjamin Zamora**)
  - Optimize create_order: Fix N+1 queries, concurrency issues, and schema aliases (por **google-labs-jules[bot]**)
  - Optimize create_order: Fix N+1 queries, concurrency issues, and schema aliases (por **google-labs-jules[bot]**)
  - Merge pull request #43 from nojustbenja/sentinel/fix-info-leakage-products-8974427137115063385 (por **Benjamin Zamora**)
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
  - fix(frontend): resolve web warnings and checkout crash (por **Benjamin Zamora**)
  - fix(docs): update issue and discussion links in README (por **nojustbenja**)

### Performance
  - perf(orders): optimize get_order with eager loading (por **Benjamin Zamora**)
  - perf(orders): eliminate redundant db.refresh in order creation (por **Benjamin Zamora**)

### Refactor
  - refactor: optimize test imports and enhance profile layout with responsive design (por **Benjamin Zamora**)
  - Refactor code structure for improved readability and maintainability (por **Benjamin Zamora**)
  - refactor(api): products router delegates business logic to service layer (por **Benjamin Zamora**)
  - Refactor code structure for improved readability and maintainability (por **nojustbenja**)
  - Refactor code structure for improved readability and maintainability (por **nojustbenja**)
  - Refactor code structure for improved readability and maintainability (por **nojustbenja**)

### Tests
  - test(users): add comprehensive tests for Query parameter validation (por **Benjamin Zamora**)

### Docs
  - docs: Update executive summary with cart system completion (por **Benjamin Zamora**)
  - docs: update executive summary for January 2026 milestone (por **Benjamin Zamora**)
  - docs(frontend): finalize environment setup automation and documentation (por **Benjamin Zamora**)
  - docs(README): update Python version to 3.14 and improve formatting (por **Benjamin Zamora**)
  - docs(README): update Python version to 3.14.2 for improved performance deps(requirements): update dependencies for compatibility with Python 3.14 (por **Benjamin Zamora**)
  - docs(auth): add session summary and action items (por **Benjamin Zamora**)
  - docs: Add comprehensive project analysis and sprint planning (por **Benjamin Zamora**)
  - docs: update canonical status docs and cursorrules guidelines (por **Benjamin Zamora**)
  - docs(env): update DATABASE_URL comment for clarity (por **Benjamin Zamora**)
  - docs(status-logs): consolidate canonical files (por **Benjamin Zamora**)
  - docs(status): add comprehensive analysis and refactoring plan (por **Benjamin Zamora**)
  - docs: add copilot instructions for project architecture and workflows (por **Benjamin Zamora**)
  - docs: add comprehensive PR rules and branch naming conventions to .cursorrules (por **nojustbenja**)
  - docs: consolidate documentation, update branch naming convention, and improve contributing guidelines (por **nojustbenja**)
  - docs: add section for obtaining keys and credentials in README (por **nojustbenja**)
  - docs: Add AI guidelines and improve technology stack table formatting in README files (por **nojustbenja**)
  - docs: update README files for clarity and structure; add new documentation index (por **nojustbenja**)

### Chore
  - Merge pull request #60 from nojustbenja/feat/cart-persistence (por **Benjamin Zamora**)
  - Merge pull request #58 from nojustbenja/perf/initial-test-and-opt-task (por **Benjamin Zamora**)
  - chore(frontend): remove .env from tracking and improve setup automation (por **Benjamin Zamora**)
  - Merge pull request #59 from nojustbenja/copilot/sub-pr-58 (por **Benjamin Zamora**)
  - Merge pull request #53 from nojustbenja/bolt-pagination-orders-912576508160657989 (por **Benjamin Zamora**)
  - Merge pull request #49 from nojustbenja/perf/optimize-users-list-limit-6185953504244063733 (por **Benjamin Zamora**)
  - chore: merge master into perf/optimize-users-list-limit branch (por **Benjamin Zamora**)
  - Merge pull request #46 from nojustbenja/optimize-order-creation-n-plus-one-16942017886126460758 (por **Benjamin Zamora**)
  - Merge branch 'optimize-order-creation-n-plus-one-16942017886126460758' of https://github.com/nojustbenja/HealthBytes-dev into optimize-order-creation-n-plus-one-16942017886126460758 (por **Benjamin Zamora**)
  - Refactor products endpoint and update security tests (por **google-labs-jules[bot]**)
  - Merge pull request #45 from nojustbenja/feature-add-pagination-to-list-users-14538347090499136108 (por **Benjamin Zamora**)
  - Merge pull request #41 from nojustbenja/refactor/create-services-layer (por **Benjamin Zamora**)
  - Merge pull request #39 from nojustbenja/refactor/create-services-layer (por **Benjamin Zamora**)
  - Merge pull request #37 from nojustbenja/chore/update-dependencies (por **Benjamin Zamora**)
  - chore(deps): update @types/react, cross-env, eslint, and eslint-plugin versions (por **nojustbenja**)
  - chore(deps): update backend and frontend dependencies (por **nojustbenja**)
  - chore(deps): bump tar from 7.4.3 to 7.5.3 (Security Fix) (por **dependabot[bot]**)
  - chore(deps): bump undici from 6.21.3 to 6.23.0 (Security Fix CVE-2026-22036) (por **dependabot[bot]**)
  - Merge pull request #34 from nojustbenja/jose-clerck (por **Benjamin Zamora**)

### Otros
  - Initial plan (por **copilot-swe-agent[bot]**)
  - ⚡ Bolt: Add pagination and sorting to list_orders endpoint (por **google-labs-jules[bot]**)
  - Add pagination to list users endpoint (por **Benjamin Zamora**)
  - ⚡ optimize user list query with limit/offset validation (por **google-labs-jules[bot]**)
  - Address PR feedback regarding Copilot suggestions (por **google-labs-jules[bot]**)
  - Fuentes de letra de barra recientes y alineacion (por **Guillermo**)
  - Se soluciona barra de recien vistos para que al clickear se dirija al producto respectivo, aun tengo que ver para que se vea bien en celular (por **Guillermo**)
  - Delete code conventions section from README (por **Benjamin Zamora**)
  - Remove 'Relacionado con' section from README (por **Benjamin Zamora**)
  - Remove unnecessary pass statement in clerk_jwks_url method (por **nojustbenja**)
  - Import of 'AsyncSession' is not used. Import of 'create_async_engine' is not used. Import of 'async_sessionmaker' is not used. (por **nojustbenja**)
  - Import of 'os' is not used. (por **nojustbenja**)
  - Import of 'httpx' is not used. (por **nojustbenja**)
  - Unused import Platform. (por **nojustbenja**)
  - removed Unused imports SignedIn, SignedOut. (por **nojustbenja**)
  - ahora si funka supabase y clerck (por **jose**)

---

## [2025-12] — Diciembre 2025

### Features
  - feat: Implement frontend ESLint with security plugins and add backend server host/port configuration. (por **Benjamin Zamora**)
  - feat: Implement user management endpoints with role-based access control and add admin-only order deletion. (por **Benjamin Zamora**)
  - feat: integrate dotenv for environment variable management and update project dependencies. (por **Benjamin Zamora**)

### Chore
  - Merge pull request #23 from nojustbenja/feat/busqueda-productos (por **Benjamin Zamora**)

### Otros
  - T2.3 Pantalla de checkout sin pasarela real (por **Basty001**)
  - Indexacion de los flujos/diagramas de drawio + actualizacion del organigrama + flujo CRUD (por **Benjamin Zamora**)

---

## [2025-11] — Noviembre 2025

### Features
  - feat: Update FastAPI service and scripts for improved setup and user experience - Modify root endpoint message for better user engagement - Change server port to 3001 for consistency with Node.js - Enhance Windows and Unix startup scripts for virtual environment management - Update README with new setup instructions and API details - Remove unused FastAPI main.py file (por **Benjamin Zamora**)
  - feat: Migrar API de Node.js a FastAPI (por **Benjamin Zamora**)

### Chore
  - Merge pull request #22 from nojustbenja/feat/busqueda-productos (por **GuillermoSerrano132**)
  - Merge pull request #21 from nojustbenja/benja_za (por **Benjamin Zamora**)

### Otros
  - Barra de conectada al backend (por **Basty001**)

---

## [2025-10] — Octubre 2025

### Otros
  - Primera inicializacion de fastapi antes de la construccion con el sistema CRUD (por **Benjamin Zamora**)

---

## [2025-09] — Septiembre 2025

### Features
  - Merge pull request #20 from WindB3NJA/Guillermo (por **Benjamin Zamora**)
  - Merge pull request #19 from WindB3NJA/Guillermo (por **Benjamin Zamora**)
  - Merge branch 'Guillermo' of https://github.com/WindB3NJA/HealthBytes-dev into Guillermo (por **Guillermo**)
  - Se agregar barra de recientes para pagina principal funcional, se crea su ts en store, su componente en carpeta components, y se agrega en el app (por **Guillermo**)

### Otros
  - Cosas solo visuales respecto a figma, añadir con el backend se esta haciendo complejo para que funcione realmente (por **Guillermo**)
  - barra favoritos muy fea pero en proceso (por **Guillermo**)
  - Cambios menores (por **Guillermo**)
  - Se realiza el saludo creando componente header.tsx, se importa en ell app y muestra saludo con barra de busqueda, obviamente todo visual por ahora (por **Guillermo**)
  - Se realiza un type para un mejor orden en barra de recientes, para trabajar con typescipt (por **Guillermo**)

---

## [2025-08] — Agosto 2025

### Features
  - Merge pull request #17 from WindB3NJA/Guillermo (por **Benjamin Zamora**)
  - Merge branch 'master' into Guillermo (por **Guillermo**)

### Bug Fixes
  - Merge pull request #15 from WindB3NJA/fix-db (por **Benjamin Zamora**)
  - Merge pull request #13 from WindB3NJA/copilot/fix-6af8e749-6a76-4730-8a4f-22a75eccd43d (por **Benjamin Zamora**)
  - Merge pull request #12 from WindB3NJA/codex/fix-detected-error-in-codebase (por **Benjamin Zamora**)
  - fix(auth): handle bearer tokens (por **Benjamin Zamora**)

### Chore
  - Merge branch 'master' of https://github.com/WindB3NJA/HealthBytes-dev (por **Guillermo**)
  - Merge pull request #16 from WindB3NJA/chachoCL-patch-1 (por **Benjamin Zamora**)
  - Update README with example PostgreSQL URL (por **José**)
  - Merge pull request #14 from WindB3NJA/WindB3NJA-patch-2 (por **Benjamin Zamora**)
  - Update README.md (por **Benjamin Zamora**)

### Otros
  - Arreglo de titulos a travez de paginas (por **Guillermo**)
  - arreglo db correcto (por **Guillermo**)
  - gcc (por **Guillermo**)
  - url postgresql agregado y se removio de index.ts el uso forzado de db anterios (por **Jose**)
  - Add initial documentation/Context for HealthBytes  Frontend AI context (por **Benjamin Zamora**)
  - Initial plan (por **copilot-swe-agent[bot]**)
  - Actualizacion de ficheros y leves modificaciones en el redame. (por **Benjamin Zamora**)

---

## [2025-07] — Julio 2025

### Features
  - Merge pull request #11 from WindB3NJA/Guillermo (por **Benjamin Zamora**)
  - Merge pull request #10 from WindB3NJA/Guillermo (por **Benjamin Zamora**)
  - Login-Pt.1 (por **Simón Aspée**)

### Chore
  - Merge pull request #9 from WindB3NJA/simon (por **Benjamin Zamora**)
  - Update package-lock.json (por **Simón Aspée**)

### Otros
  - Se remueve la opcion de comprar cosas a menos que el usuario este registrado (por **Benjamin Zamora**)
  - Se agrega conexiones: - Back end para el registro de usuarios de manera permanente - inicio y registro de seccion de usuarios (por **Benjamin Zamora**)
  - Se usa la rama de Jose, con la cual resolvio el problema de la base de datos; (por **Benjamin Zamora**)
  - Barra de Navegación para facilitar manejo entre secciones (por **Guillermo**)
  - Se realiza cambios minimos pero importantes; Cambio en el carrito que se agrege cantidad +1 cuando se agregan mas del mismo, se movio un poco el icono para que se vea mas centrado, y ahora el icono del carrito muestra la cantidad de productos que hay en el carrito actualizada segun total diferentes productos y del mismo. (por **Guillermo**)
  - Se crea los types de state, ya que zustand no infiere el tipo por si solo cuando se trabaja en TSX (por **Guillermo**)
  - Se actualiza en .json problema del JSX (por **Guillermo**)

---

## [2025-06] — Junio 2025

### Features
  - Merge pull request #7 from WindB3NJA/Guillermo (por **Benjamin Zamora**)
  - Carrito Funcional (add to cart - removeFromcart (por **Guillermo**)

### Bug Fixes
  - Se ha añadido el carrito basado en Zustand, como se presenta en el video del E-Commerce. Esta todo al pie de la letra y funcional, me he saltado la seccionn del video del backend e ido enseguida al carrito pero no afecta funcionalidad, es cosa de añadirlo solamente, los errores que marca el vs code son de un state que no se ha definido su type aun, pero funciona correctamente. (por **Guillermo**)
  - Se arregla error no encontraba carpeta expo (por **Guillermo**)

---

## [2025-05] — Mayo 2025

### Chore
  - Update README.md (por **Benjamin Zamora**)
  - Merge pull request #5 from WindB3NJA/chachoCL-patch-1 (por **Benjamin Zamora**)
  - Update README.md (por **José**)
  - Update README.md (por **Benjamin Zamora**)
  - Update README.md (por **Benjamin Zamora**)

---

## [2025-04] — Abril 2025

### Features
  - UI de los productos con gluestack (por **Benjamin Zamora**)
  - UI de los productos con gluestack (por **Benjamin Zamora**)
  - Creacion de la carpeta componentes, en donde se guarda la lista de productos y la insercion de una base de datos de test de productos (por **Benjamin Zamora**)

### Bug Fixes
  - se realiza una correcion de error para el uso del css de tailwind (por **Benjamin Zamora**)
  - Se genera una restructuracion de las dependencias debido a un error de la dependencia babel (por **Benjamin Zamora**)

### Chore
  - Se realiza un parche para los componentes de css que no funcionaban por la configuracion de la libreria (por **Benjamin Zamora**)

### Otros
  - se modifica el diagrama de flujo del personal (por **Benjamin Zamora**)
  - Cambio de main -> a master & las componentes inciales de react (por **Benjamin Zamora**)

---
<!-- /DOCSYNC:changelog-body -->
