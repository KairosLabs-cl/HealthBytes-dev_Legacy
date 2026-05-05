# HealthBytes — Mayo 2026 Feature Sprint

## TL;DR

> **Quick Summary**: Completar el wiring de Push Notifications (60% ya hecho), implementar Reviews frontend completo, endpoint de recomendaciones por restricciones dietéticas, deep linking verificado, coverage backend 40→50% + unbloquear CI, dark mode por system preference, audit WCAG 2.2, y preparar Google Play Store submission.
>
> **Deliverables**:
> - Push notifications funcionales end-to-end (4 eventos: confirmada/enviada/entregada/precio bajó)
> - Reviews & Ratings: router backend + UI frontend completa
> - GET /products/recommended basado en dietary_preferences
> - Deep linking `healthbytes://` verificado + Android intentFilters
> - CI desbloqueado: threshold 80→50%, coverage subido a 50%
> - Dark mode automático (system preference)
> - WCAG 2.2 audit report con fixes aplicados
> - Google Play Store: AAB generado + submission automatizada via EAS
> - Staging deploy funcionando via CI/CD
>
> **Estimated Effort**: XL (10 features, ~24 tareas)
> **Parallel Execution**: YES — 4 waves
> **Critical Path**: T1 (fix CI) → T2 (push token endpoint) → T8 (order trigger) → T16 (coverage 50%) → staging deploy

---

## Context

### Original Request
```
### Inmediato (Mayo 2026)
- Push Notifications (P1)
- Recomendaciones básicas (P1)
- Reviews y ratings frontend completo (P1)
- Deep linking (P1)
- Coverage backend — objetivo 50%

### Mayo 2026
- Deploy a staging
- EAS Build preview
- App Store submission
- Dark mode (P2)
- Accessibility audit WCAG 2.2 (P2)
```

### Interview Summary
**Key Discussions**:
- Recomendaciones: Basadas en `dietary_preferences` del usuario (filtra productos por dietary_tags)
- App Store: Solo Google Play Store (Android)
- Dark mode: Solo system preference — no toggle manual
- Staging deploy: CI/CD automático en merge a main (deploy.yml ya parcialmente implementado)
- Push notification events: orden confirmada + enviada + entregada + precio bajó en favorito

**Research Findings**:
- Push notifications: hook + service + migración DB existen PERO no están wired (no endpoint, no llamado desde order_service, no en _layout.tsx, expo-notifications no en plugins)
- Reviews: review_service.py + modelo DB existen, FALTA router api/v1/ y todo el frontend
- Recommendations: useRecommendationsStore.ts llama a `/products/recommended` que NO existe en backend
- CI BLOQUEADO: `--cov-fail-under=80` en pyproject.toml/ci.yml, coverage actual ~40%
- Dark mode: tailwind `darkMode: "class"` (debe ser `"media"`), global.css sin variables dark
- EAS: eas.json tiene profiles correctos, falta `projectId` en app.json y secrets en GitHub

---

## Work Objectives

### Core Objective
Completar las features P1 de engagement del MVP de HealthBytes (push, reviews, recomendaciones, deep linking) + infraestructura de calidad (coverage, dark mode, a11y, staging, Play Store).

### Concrete Deliverables
- `backend/app/api/v1/reviews.py` — router reviews completo
- `backend/app/api/v1/products.py` — endpoint `/recommended` agregado
- `backend/app/db/schemas.py` — `expo_push_token` en modelo User
- `backend/app/api/v1/users.py` — `PATCH /users/me/push-token`
- `backend/app/services/notification_service.py` — `send_price_drop_notification`
- `backend/app/services/order_service.py` — trigger de notificación en cambio de estado
- `backend/app/services/product_service.py` — trigger de notificación en price drop
- `frontend/app.json` — expo-notifications plugin + EAS projectId
- `frontend/app/_layout.tsx` — usePushNotifications wired
- `frontend/api/reviews.ts` — cliente API reviews
- `frontend/app/product/[id].tsx` — sección reviews + formulario create review
- `frontend/global.css` — variables CSS dark mode
- `backend/pyproject.toml` + `.github/workflows/ci.yml` — threshold 50%
- `backend/tests/` — nuevos tests para reviews + notifications + orders

### Definition of Done
- [ ] `pytest --cov=app -q` en backend → coverage ≥ 50%, 0 failures
- [ ] usePushNotifications registra token + lo envía al backend tras login
- [ ] Cambiar estado de orden a `processing/shipped/delivered` → push notification enviada
- [ ] GET /api/v1/products/recommended con auth token → devuelve productos filtrados por dietary_preferences
- [ ] Product detail screen muestra reviews existentes + formulario para crear review
- [ ] `npx expo start` → 0 errores de build
- [ ] Dark mode: al cambiar sistema a dark, app cambia de tema sin recargar
- [ ] EAS build Android producción completado sin errores
- [ ] deploy.yml staging job: push a main → deploy automático

### Must Have
- expo_push_token almacenado en DB por usuario autenticado
- Notificaciones disparadas al cambiar estado de orden
- Reviews solo para usuarios que compraron el producto
- Recomendaciones filtradas por dietary_preferences del usuario autenticado
- Coverage ≥ 50% (CI no falla)
- Dark mode via system preference (useColorScheme)

### Must NOT Have (Guardrails)
- NO implementar iOS App Store submission (solo Google Play)
- NO toggle manual de dark mode en settings
- NO sistema de recomendaciones con ML/embeddings — solo filtro SQL por dietary_tags
- NO breaking changes en endpoints existentes (`/users/me`, `/products/`, `/orders/`)
- NO subir coverage threshold más allá de 50% en este sprint
- NO modificar el esquema de autenticación Clerk/JWT
- NO agregar dependencias de frontend que rompan la arquitectura NativeWind/Gluestack
- NO reviews sin verificación de compra (el backend ya valida esto)
- NO eliminar el migration file existente de expo_push_token

---

## Verification Strategy

> **ZERO HUMAN INTERVENTION** — ALL verification is agent-executed.

### Test Decision
- **Infrastructure exists**: YES (pytest backend, Jest frontend)
- **Automated tests**: Tests after implementation
- **Framework backend**: pytest + pytest-cov
- **Framework frontend**: Jest + @testing-library/react-native

### QA Policy
Cada tarea incluye escenarios QA ejecutados por el agente.
Evidencia guardada en `.sisyphus/evidence/task-{N}-{slug}.{ext}`.

- **API/Backend**: Bash (curl) — requests, assert status + campos JSON
- **Frontend UI**: Playwright — navegar, interactuar, assert DOM, screenshot
- **CLI/Config**: Bash — ejecutar comandos, validar output

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately — foundation + unblocking):
├── T1:  Fix CI coverage threshold (80→50) + pyproject.toml   [quick]
├── T2:  expo_push_token en User model + PATCH endpoint        [quick]
├── T3:  Reviews API router (backend)                          [unspecified-high]
├── T4:  GET /products/recommended endpoint (backend)          [unspecified-high]
├── T5:  Fix dark mode: tailwind "media" + global.css dark vars [quick]
├── T6:  app.json: expo-notifications plugin + EAS projectId   [quick]
└── T7:  frontend/api/reviews.ts + useRecommendationsStore fix [quick]

Wave 2 (After Wave 1 — wiring + core features):
├── T8:  Notification trigger en order_service (estado → push) [unspecified-high]
├── T9:  Price drop notification (product_service + notif)     [unspecified-high]
├── T10: Wire usePushNotifications en _layout.tsx              [quick]
├── T11: Reviews UI: sección en product detail + crear review  [visual-engineering]
├── T12: Recommendations UI: sección en home screen            [visual-engineering]
└── T13: Android intentFilters para deep linking               [quick]

Wave 3 (After Wave 2 — coverage + deployment + a11y):
├── T14: Tests review_service + reviews API (+5% coverage)     [unspecified-high]
├── T15: Tests notification_service + order trigger (+3%)       [unspecified-high]
├── T16: Tests orders API edge cases (+5% → total ≥ 50%)       [unspecified-high]
├── T17: EAS Build preview + staging secrets docs              [quick]
├── T18: Google Play Store submission prep + EAS submit config [unspecified-high]
└── T19: Accessibility audit WCAG 2.2 + fixes críticos         [unspecified-high]

Wave FINAL (After ALL tasks — 4 parallel reviews):
├── F1: Plan compliance audit                                   [oracle]
├── F2: Code quality review (tsc, pytest, jest)                [unspecified-high]
├── F3: QA manual completo (push + reviews + recs + dark)      [unspecified-high]
└── F4: Scope fidelity check                                    [deep]
→ Present results → Get explicit user okay

Critical Path: T1 → T2 → T8 → T16 → T17 → staging deploy
Parallel Speedup: ~65% más rápido que secuencial
Max Concurrent: 7 (Wave 1)
```

### Dependency Matrix

| Task | Depends On | Blocks |
|------|-----------|--------|
| T1 | — | T16, T17 |
| T2 | — | T8, T10 |
| T3 | — | T7, T11, T14 |
| T4 | — | T7, T12 |
| T5 | — | F3 |
| T6 | — | T10, T17 |
| T7 | T3, T4 | T11, T12 |
| T8 | T2 | T15 |
| T9 | T2 | T15 |
| T10 | T2, T6 | F3 |
| T11 | T7 | F3 |
| T12 | T7 | F3 |
| T13 | — | F3 |
| T14 | T3 | T16 |
| T15 | T8, T9 | T16 |
| T16 | T14, T15 | T17 |
| T17 | T1, T6, T16 | F1 |
| T18 | T17 | F1 |
| T19 | — | F3 |

### Agent Dispatch Summary

- **Wave 1**: 7 tasks — T1,T5,T6,T7 → `quick` | T2 → `quick` | T3,T4 → `unspecified-high`
- **Wave 2**: 6 tasks — T10,T13 → `quick` | T8,T9 → `unspecified-high` | T11,T12 → `visual-engineering`
- **Wave 3**: 6 tasks — T17 → `quick` | T14,T15,T16,T18,T19 → `unspecified-high`
- **Wave FINAL**: 4 tasks — F1 → `oracle` | F2,F3 → `unspecified-high` | F4 → `deep`

---

## TODOs

> EVERY task MUST have: Recommended Agent Profile + Parallelization + QA Scenarios.

- [ ] T1. Fix CI Coverage Threshold (80 → 50)

  **What to do**:
  - En `backend/pyproject.toml`: cambiar `--cov-fail-under=80` a `--cov-fail-under=50` en `[tool.pytest.ini_options].addopts`
  - En `.github/workflows/ci.yml`: cambiar el flag `--cov-fail-under=80` a `--cov-fail-under=50` en el paso `backend-test`
  - Verificar que `backend/pytest.ini` no tenga su propio `--cov-fail-under` que override
  - Confirmar que el cambio es solo en el threshold, sin tocar otros flags ni jobs

  **Must NOT do**:
  - NO cambiar otros parámetros del pipeline de CI
  - NO eliminar el flag completamente — el objetivo es 50%, no sin límite
  - NO subir a más de 50% (eso vendrá con los tests en T14-T16)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Cambio de 2 líneas en 2 archivos, sin lógica compleja
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (con T2, T3, T4, T5, T6, T7)
  - **Blocks**: T16, T17 (deploy staging requiere CI passing)
  - **Blocked By**: None

  **References**:
  - `backend/pyproject.toml:addopts` — línea con `--cov-fail-under=80`
  - `.github/workflows/ci.yml` → job `backend-test` → step `pytest` — buscar `--cov-fail-under`

  **Acceptance Criteria**:
  - [ ] `backend/pyproject.toml` contiene `--cov-fail-under=50` (no 80)
  - [ ] `.github/workflows/ci.yml` contiene `--cov-fail-under=50` (no 80)

  **QA Scenarios**:
  ```
  Scenario: Threshold actualizado en ambos archivos
    Tool: Bash
    Steps:
      1. grep -n "cov-fail-under" backend/pyproject.toml
      2. grep -n "cov-fail-under" .github/workflows/ci.yml
    Expected Result: Ambos muestran "50", ninguno muestra "80"
    Evidence: .sisyphus/evidence/task-T1-threshold-check.txt
  ```

  **Commit**: YES
  - Message: `fix(ci): lower coverage threshold from 80 to 50`
  - Files: `backend/pyproject.toml`, `.github/workflows/ci.yml`

- [ ] T2. expo_push_token en User Model + PATCH Endpoint

  **What to do**:
  - En `backend/app/db/schemas.py`: agregar campo `expo_push_token = Column(String(255), nullable=True)` al modelo `User` (la migración alembic ya lo agrega a la DB, solo falta en el modelo Python)
  - En `backend/app/schemas/`: crear o editar archivo de schemas para agregar `PushTokenUpdate(BaseModel)` con campo `token: str`
  - En `backend/app/api/v1/users.py`: agregar endpoint `PATCH /users/me/push-token` que:
    - Requiere autenticación JWT/Clerk
    - Recibe `{ "token": "ExponentPushToken[xxx]" }` en body
    - Actualiza `current_user.expo_push_token` en DB
    - Retorna `{"ok": true}`
  - Seguir el patrón de otros endpoints en users.py para autenticación y DB session

  **Must NOT do**:
  - NO crear nueva migración alembic (la migración `20260317_c4800640e2d3` ya existe)
  - NO cambiar la estructura de otros campos del User
  - NO exponer expo_push_token en el response del perfil de usuario (es dato interno)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Cambio localizado en 2-3 archivos, patrón claro de los endpoints existentes
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1
  - **Blocks**: T8, T9, T10 (necesitan que el token se guarde)
  - **Blocked By**: None

  **References**:
  - `backend/app/db/schemas.py:107-124` — modelo User actual (agregar campo aquí)
  - `backend/app/api/v1/users.py` — patrón de endpoints con auth, para seguir la misma estructura
  - `backend/alembic/versions/20260317_c4800640e2d3_add_expo_push_token_to_users_and_create_.py:81` — confirma que la columna YA existe en DB
  - `frontend/hooks/usePushNotifications.ts:77-84` — el frontend ya llama a `PATCH /users/me/push-token`

  **Acceptance Criteria**:
  - [ ] `User.expo_push_token` existe en `schemas.py`
  - [ ] `PATCH /api/v1/users/me/push-token` retorna 200 con token válido
  - [ ] `PATCH /api/v1/users/me/push-token` retorna 401 sin auth

  **QA Scenarios**:
  ```
  Scenario: Token guardado exitosamente
    Tool: Bash (curl)
    Preconditions: Backend corriendo, usuario autenticado con JWT_TOKEN
    Steps:
      1. curl -X PATCH http://localhost:3001/api/v1/users/me/push-token \
           -H "Authorization: Bearer $JWT_TOKEN" \
           -H "Content-Type: application/json" \
           -d '{"token": "ExponentPushToken[test123]"}' -v
      2. Verificar HTTP 200
      3. Verificar body contiene {"ok": true} o similar
    Expected Result: 200 OK, token guardado en DB
    Evidence: .sisyphus/evidence/task-T2-push-token-save.txt

  Scenario: Sin autenticación rechazado
    Tool: Bash (curl)
    Steps:
      1. curl -X PATCH http://localhost:3001/api/v1/users/me/push-token \
           -H "Content-Type: application/json" \
           -d '{"token": "ExponentPushToken[test123]"}' -v
      2. Verificar HTTP 401 o 403
    Expected Result: 401/403, no se guarda token
    Evidence: .sisyphus/evidence/task-T2-push-token-unauth.txt
  ```

  **Commit**: YES
  - Message: `feat(notifications): add expo_push_token to User model and PATCH endpoint`
  - Files: `backend/app/db/schemas.py`, `backend/app/api/v1/users.py`, `backend/app/schemas/user.py`

- [ ] T3. Reviews API Router (Backend)

  **What to do**:
  - Crear `backend/app/api/v1/reviews.py` con los siguientes endpoints:
    - `POST /reviews/product/{product_id}` — crear review (requiere auth, valida compra via review_service)
    - `GET /reviews/product/{product_id}` — listar reviews de un producto (público, con paginación `skip/limit`)
    - Manejo de errores: 404 si producto no existe, 409 si ya revieweó, 403 si no compró
  - Registrar el router en `backend/app/main.py` bajo `/api/v1/reviews`
  - Verificar que `backend/app/schemas/review.py` tiene `ReviewCreate` (rating: int 1-5, comment: Optional[str]) y `ReviewResponse` (id, rating, comment, user_name, created_at)
  - Usar `review_service.create_review` y `review_service.get_product_reviews` existentes

  **Must NOT do**:
  - NO cambiar la lógica de review_service.py (ya valida compra y duplicados)
  - NO agregar endpoints de admin (update/delete review) en este sprint
  - NO modificar el modelo Review en DB

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Requiere crear router completo, schemas de response, manejo de errores, registro en main
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1
  - **Blocks**: T7, T11, T14
  - **Blocked By**: None

  **References**:
  - `backend/app/services/review_service.py` — funciones `create_review` y `get_product_reviews` (úsalas directamente)
  - `backend/app/api/v1/orders.py` — patrón de router con auth y error handling
  - `backend/app/api/v1/favorites.py` — patrón similar de resource con auth
  - `backend/app/schemas/review.py` — schemas ya existentes (verificar qué hay)
  - `backend/app/main.py` — donde se registran los routers (patrón `app.include_router`)

  **Acceptance Criteria**:
  - [ ] `GET /api/v1/reviews/product/1` retorna 200 con array (puede estar vacío)
  - [ ] `POST /api/v1/reviews/product/1` sin auth retorna 401
  - [ ] Router registrado en main.py

  **QA Scenarios**:
  ```
  Scenario: Listar reviews de producto (público)
    Tool: Bash (curl)
    Steps:
      1. curl http://localhost:3001/api/v1/reviews/product/1
      2. Verificar HTTP 200
      3. Verificar body es array JSON (puede ser vacío [])
    Expected Result: 200, JSON array
    Evidence: .sisyphus/evidence/task-T3-reviews-list.txt

  Scenario: Crear review sin autenticación
    Tool: Bash (curl)
    Steps:
      1. curl -X POST http://localhost:3001/api/v1/reviews/product/1 \
           -H "Content-Type: application/json" \
           -d '{"rating": 5, "comment": "Excelente"}' -v
      2. Verificar HTTP 401 o 403
    Expected Result: 401/403 sin token
    Evidence: .sisyphus/evidence/task-T3-reviews-unauth.txt
  ```

  **Commit**: YES
  - Message: `feat(reviews): add reviews API router with create and list endpoints`
  - Files: `backend/app/api/v1/reviews.py`, `backend/app/main.py`, `backend/app/schemas/review.py`

- [ ] T4. GET /products/recommended Endpoint (Backend)

  **What to do**:
  - En `backend/app/api/v1/products.py`: agregar endpoint `GET /products/recommended`
    - Requiere autenticación (necesita dietary_preferences del usuario)
    - Obtiene `current_user.dietary_preferences` (lista de strings como `["sin-gluten", "vegano"]`)
    - Si el usuario no tiene dietary_preferences → retornar productos populares (por ejemplo, los primeros 10 por nombre o los que tienen mayor stock)
    - Si tiene preferences → filtrar productos por `dietary_tags.name` que matcheen con las preferences del usuario
    - Retornar máximo 10-15 productos
  - En `backend/app/services/product_service.py`: agregar función `get_recommended_products(db, user_dietary_preferences: list[str], limit: int = 10)`
    - Query con JOIN a `product_dietary_tags` y `dietary_tags` donde `dietary_tags.name IN user_preferences`
    - Si preferences vacías: fallback a `SELECT * FROM products ORDER BY id LIMIT limit`

  **Must NOT do**:
  - NO implementar ML, embeddings, o collaborative filtering
  - NO agregar campos nuevos a productos
  - NO modificar endpoint `/products/` existente

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Requiere lógica de query con JOIN, manejo de fallback, servicio + endpoint
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1
  - **Blocks**: T7, T12
  - **Blocked By**: None

  **References**:
  - `backend/app/db/schemas.py:32-64` — modelo Product con dietary_tags relationship
  - `backend/app/db/schemas.py:107-124` — User.dietary_preferences (JSON column, lista de strings)
  - `backend/app/db/schemas.py:88-104` — DietaryTag model (name, display_name)
  - `backend/app/services/product_service.py` — funciones existentes como `get_products_cached` (patrón a seguir)
  - `backend/app/api/v1/products.py` — endpoint existente para seguir patrón de auth y DB session
  - `frontend/store/useRecommendationsStore.ts` — llama a `/products/recommended` (confirma la ruta exacta)

  **Acceptance Criteria**:
  - [ ] `GET /api/v1/products/recommended` con auth retorna 200 + array de productos
  - [ ] Con dietary_preferences `["sin-gluten"]` retorna solo productos con ese tag
  - [ ] Sin preferences retorna productos (fallback)
  - [ ] Sin auth retorna 401

  **QA Scenarios**:
  ```
  Scenario: Recomendaciones con dietary_preferences configuradas
    Tool: Bash (curl)
    Preconditions: Usuario autenticado con dietary_preferences: ["sin-gluten"]
    Steps:
      1. curl http://localhost:3001/api/v1/products/recommended \
           -H "Authorization: Bearer $JWT_TOKEN"
      2. Verificar HTTP 200
      3. Verificar que todos los productos en el array tienen tag "sin-gluten"
      4. Verificar que el array tiene entre 1 y 15 elementos
    Expected Result: 200, array de productos filtrados
    Evidence: .sisyphus/evidence/task-T4-recommendations-filtered.txt

  Scenario: Sin autenticación rechazado
    Tool: Bash (curl)
    Steps:
      1. curl http://localhost:3001/api/v1/products/recommended
      2. Verificar HTTP 401
    Expected Result: 401
    Evidence: .sisyphus/evidence/task-T4-recommendations-unauth.txt
  ```

  **Commit**: YES
  - Message: `feat(products): add /recommended endpoint based on dietary_preferences`
  - Files: `backend/app/api/v1/products.py`, `backend/app/services/product_service.py`

- [ ] T5. Fix Dark Mode: tailwind "media" + CSS Variables Dark

  **What to do**:
  - En `frontend/tailwind.config.js`: cambiar `darkMode: "class"` a `darkMode: "media"`
  - En `frontend/global.css`: agregar bloque `@media (prefers-color-scheme: dark)` con todas las variables CSS en sus valores oscuros:
    ```css
    @media (prefers-color-scheme: dark) {
      :root {
        --surface-warm: #1A1A1A;
        --surface-card: #242424;
        --ink: #F5F0EB;
        --brand-green: #4CAF72;
        --border-subtle: #2E2E2E;
      }
    }
    ```
  - Los valores dark deben ser coherentes con la paleta Warm Earth del proyecto (ver tailwind.config.js: `ink-primary: #2D2926`, `background.dark: #181719`)
  - Verificar que `app.json` ya tiene `"userInterfaceStyle": "automatic"` (ya está ✅)

  **Must NOT do**:
  - NO agregar `useColorScheme` hook en componentes individuales (dark mode vía CSS media query es suficiente)
  - NO cambiar colores semánticos definidos en tailwind.config.js
  - NO agregar toggle manual en settings

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Cambio de 1 línea + agregar bloque CSS
  - **Skills**: [`tailwind-css-patterns`]
    - `tailwind-css-patterns`: NativeWind dark mode config patterns

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1
  - **Blocks**: F3 (QA visual)
  - **Blocked By**: None

  **References**:
  - `frontend/tailwind.config.js:5` — línea `darkMode: "class"` a cambiar
  - `frontend/global.css` — agregar bloque `@media (prefers-color-scheme: dark)`
  - `frontend/tailwind.config.js:168-200` — paleta de colores para derivar los valores dark
  - NativeWind docs dark mode: https://www.nativewind.dev/docs/guides/dark-mode

  **Acceptance Criteria**:
  - [ ] `tailwind.config.js` tiene `darkMode: "media"`
  - [ ] `global.css` tiene bloque `@media (prefers-color-scheme: dark)` con al menos 5 variables

  **QA Scenarios**:
  ```
  Scenario: Variables dark mode definidas
    Tool: Bash (grep)
    Steps:
      1. grep "darkMode" frontend/tailwind.config.js → debe mostrar "media"
      2. grep "prefers-color-scheme: dark" frontend/global.css → debe existir el bloque
    Expected Result: Ambos checks pasan
    Evidence: .sisyphus/evidence/task-T5-darkmode-config.txt
  ```

  **Commit**: YES
  - Message: `feat(ui): implement system-preference dark mode via CSS media query`
  - Files: `frontend/tailwind.config.js`, `frontend/global.css`

- [ ] T6. app.json: expo-notifications Plugin + EAS projectId

  **What to do**:
  - En `frontend/app.json`, en el array `"plugins"`: agregar `"expo-notifications"` con configuración básica:
    ```json
    ["expo-notifications", {
      "icon": "./assets/icon.png",
      "color": "#2E5C3A",
      "sounds": [],
      "mode": "production"
    }]
    ```
  - En `frontend/app.json`, agregar `"extra"` con `"eas": { "projectId": "REPLACE_WITH_EAS_PROJECT_ID" }` — el executor debe rellenar el projectId real desde `npx eas whoami` o del dashboard de EAS
  - En `frontend/app.json`, agregar `"android"."googleServicesFile"` solo si existe el archivo `google-services.json` en el proyecto — si no existe, documentar que es necesario para FCM
  - Verificar que la sección `"ios"` tiene al menos `"bundleIdentifier": "com.healthbytes.app"` (aunque no se submita a App Store, es requerido por EAS builds)

  **Must NOT do**:
  - NO agregar `"expo-notifications"` al plugin si ya está (verificar primero)
  - NO modificar otros plugins existentes (expo-router, expo-secure-store, expo-web-browser)
  - NO cambiar el scheme ni el slug del app

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Edición de JSON de configuración con valores documentados
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1
  - **Blocks**: T10, T17 (EAS build necesita projectId)
  - **Blocked By**: None

  **References**:
  - `frontend/app.json` — archivo completo a modificar
  - `frontend/hooks/usePushNotifications.ts:54-56` — accede a `Constants.expoConfig.extra.eas.projectId` (por eso necesitamos el campo `extra.eas.projectId`)
  - Expo notifications plugin docs: https://docs.expo.dev/versions/latest/sdk/notifications/#configuring-push-notifications

  **Acceptance Criteria**:
  - [ ] `app.json` tiene `"expo-notifications"` en el array `plugins`
  - [ ] `app.json` tiene `extra.eas.projectId` (aunque sea placeholder)
  - [ ] `app.json` tiene `ios.bundleIdentifier`

  **QA Scenarios**:
  ```
  Scenario: Configuración correcta en app.json
    Tool: Bash
    Steps:
      1. node -e "const c = require('./frontend/app.json'); console.log(JSON.stringify({plugins: c.expo.plugins, extra: c.expo.extra, iosBundleId: c.expo.ios?.bundleIdentifier}, null, 2))"
      2. Verificar que plugins incluye "expo-notifications"
      3. Verificar que extra.eas.projectId existe
      4. Verificar que ios.bundleIdentifier existe
    Expected Result: Los 3 campos presentes
    Evidence: .sisyphus/evidence/task-T6-appjson-config.txt
  ```

  **Commit**: YES
  - Message: `feat(config): add expo-notifications plugin and EAS projectId to app.json`
  - Files: `frontend/app.json`

- [ ] T7. frontend/api/reviews.ts + Verificar useRecommendationsStore

  **What to do**:
  - Crear `frontend/api/reviews.ts` con las siguientes funciones siguiendo el patrón de `frontend/api/orders.ts` o `frontend/api/favorites.ts`:
    - `getProductReviews(productId: number, skip?: number, limit?: number)` — GET /reviews/product/{id}
    - `createReview(productId: number, data: { rating: number; comment?: string }, token: string)` — POST /reviews/product/{id}
  - Definir types `Review` y `ReviewCreate` en `frontend/types/` o inline en el archivo
  - En `frontend/store/useRecommendationsStore.ts`: verificar que la URL base usa `EXPO_PUBLIC_API_URL` correctamente (ya lo hace, pero confirmar que construye `/api/v1/products/recommended` correctamente — actualmente usa `process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000/api/v1'` que puede quedar mal si EXPO_PUBLIC_API_URL ya incluye `/api/v1`)

  **Must NOT do**:
  - NO cambiar la lógica del store de recomendaciones más allá de corregir la URL si está mal
  - NO crear un reviews store en Zustand (usar TanStack Query en el componente)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Crear archivo de API siguiendo patrón existente exacto
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES — depende de T3 y T4 que deben existir para que funcione, pero el archivo se puede crear en paralelo
  - **Parallel Group**: Wave 1 (crear archivo), se verifica funcionalidad en Wave 2
  - **Blocks**: T11, T12
  - **Blocked By**: T3 (conceptualmente, pero el archivo puede crearse antes)

  **References**:
  - `frontend/api/orders.ts` — patrón exacto a seguir (auth header, error handling, tipos)
  - `frontend/api/favorites.ts` — patrón alternativo (más simple)
  - `frontend/store/useRecommendationsStore.ts` — verificar construcción de URL
  - `frontend/types/` — directorio donde agregar tipos nuevos

  **Acceptance Criteria**:
  - [ ] `frontend/api/reviews.ts` existe con `getProductReviews` y `createReview`
  - [ ] Tipos `Review` definidos
  - [ ] `useRecommendationsStore.ts` construye URL correctamente

  **QA Scenarios**:
  ```
  Scenario: Archivo reviews.ts tiene las funciones requeridas
    Tool: Bash
    Steps:
      1. grep -n "getProductReviews\|createReview" frontend/api/reviews.ts
    Expected Result: Ambas funciones encontradas
    Evidence: .sisyphus/evidence/task-T7-reviews-api-file.txt

  Scenario: Store URL correcta
    Tool: Bash
    Steps:
      1. grep "EXPO_PUBLIC_API_URL\|products/recommended" frontend/store/useRecommendationsStore.ts
    Expected Result: URL construida correctamente con /api/v1/products/recommended
    Evidence: .sisyphus/evidence/task-T7-recommendations-url.txt
  ```

  **Commit**: YES
  - Message: `feat(api): add reviews API client and fix recommendations store URL`
  - Files: `frontend/api/reviews.ts`, `frontend/store/useRecommendationsStore.ts`, `frontend/types/`

- [ ] T8. Notification Trigger en order_service (Estado → Push)

  **What to do**:
  - En `backend/app/services/order_service.py`: encontrar la función que actualiza el estado de una orden (probablemente `update_order_status` o similar en el endpoint de orders)
  - Después de hacer commit del cambio de estado en DB, llamar a `NotificationService.send_order_status_update(expo_token, order_id, new_status)` si el usuario tiene `expo_push_token`
  - Mapeo de estados:
    - `"processing"` → "Tu orden fue confirmada 🎉"
    - `"shipped"` → usa el mensaje del notification_service existente
    - `"delivered"` → usa el mensaje existente
  - En `backend/app/services/notification_service.py`: actualizar el mensaje para `"processing"`:
    ```python
    if new_status == "processing":
        title = "¡Orden confirmada! 🎉"
        body = f"Tu orden #{order_id} ha sido confirmada y está siendo procesada."
    ```
  - El `expo_token` se obtiene del User relacionado con la orden: `order.user.expo_push_token`
  - Importar `NotificationService` en order_service sin crear dependencia circular

  **Must NOT do**:
  - NO bloquear el cambio de estado si la notificación falla (la notificación es best-effort)
  - NO modificar el endpoint HTTP de orders (solo el service)
  - NO crear nuevos endpoints de notificaciones

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Requiere entender el flujo de orden existente, evitar dependencias circulares, manejo de errores
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (con T9, T10, T11, T12, T13 en Wave 2)
  - **Parallel Group**: Wave 2
  - **Blocks**: T15
  - **Blocked By**: T2 (necesita expo_push_token en User model)

  **References**:
  - `backend/app/services/notification_service.py` — `NotificationService.send_order_status_update` (llamar aquí)
  - `backend/app/api/v1/orders.py` — ver cómo se llama al servicio para entender el flujo
  - `backend/app/db/schemas.py:150-173` — modelo Order con relación `user`
  - `backend/app/db/schemas.py:107-124` — User tiene `expo_push_token` (después de T2)

  **Acceptance Criteria**:
  - [ ] Al actualizar estado de orden a `"processing"`, se llama a `NotificationService`
  - [ ] Si `expo_push_token` es None, no falla (no exception)
  - [ ] Los 3 eventos (processing/shipped/delivered) están mapeados

  **QA Scenarios**:
  ```
  Scenario: Cambio de estado dispara notificación (smoke test)
    Tool: Bash (grep)
    Steps:
      1. grep -n "NotificationService\|send_order_status" backend/app/services/order_service.py
    Expected Result: NotificationService importado y llamado en al menos 3 puntos (processing, shipped, delivered)
    Evidence: .sisyphus/evidence/task-T8-notification-trigger.txt

  Scenario: Notificación falla gracefully sin expo_token
    Tool: Bash (python snippet)
    Steps:
      1. python3 -c "from backend.app.services.notification_service import NotificationService; NotificationService.send_order_status_update('', 1, 'processing')" 2>&1
    Expected Result: No exception, retorna silenciosamente
    Evidence: .sisyphus/evidence/task-T8-no-token-graceful.txt
  ```

  **Commit**: YES
  - Message: `feat(notifications): trigger push on order status change (processing/shipped/delivered)`
  - Files: `backend/app/services/order_service.py`, `backend/app/services/notification_service.py`

- [ ] T9. Price Drop Notification (product_service + notification_service)

  **What to do**:
  - En `backend/app/services/notification_service.py`: agregar método estático `send_price_drop_notification(expo_token: str, product_id: int, product_name: str, old_price: float, new_price: float)` siguiendo el mismo patrón del método existente
    - Deep link: `healthbytes://product/{product_id}`
    - Mensaje: "¡Bajó de precio! {product_name} ahora cuesta ${new_price}"
  - En `backend/app/services/product_service.py` o en `backend/app/api/v1/products.py`: en la función/endpoint que actualiza el precio de un producto:
    - Si `new_price < old_price`: obtener todos los UserFavorite donde `product_id == producto` y cuyo User tiene `expo_push_token`
    - Llamar `NotificationService.send_price_drop_notification` para cada usuario
    - Ejecutar las notificaciones de forma asíncrona/best-effort (no bloquear el update)
  - Si no existe un endpoint/función de actualizar precio de producto, agregar la lógica en el lugar donde se actualizaría (documentar en el commit message)

  **Must NOT do**:
  - NO crear una tarea cron o background job complejo — el trigger es sincrónico al update de precio
  - NO enviar la notificación si el precio sube (solo baja)
  - NO modificar la estructura de UserFavorite

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Requiere entender el flujo de actualización de producto, query de favoritos, nuevo método de notificación
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2
  - **Blocks**: T15
  - **Blocked By**: T2

  **References**:
  - `backend/app/services/notification_service.py` — patrón del método existente
  - `backend/app/db/schemas.py:126-147` — modelo UserFavorite (user_id, product_id)
  - `backend/app/db/schemas.py:107-124` — User.expo_push_token (después de T2)
  - `backend/app/db/schemas.py:32-56` — Product.price (campo a monitorear)
  - `backend/app/api/v1/products.py` o `backend/app/services/product_service.py` — buscar función de update de producto

  **Acceptance Criteria**:
  - [ ] `NotificationService.send_price_drop_notification` existe
  - [ ] Se llama cuando el precio baja en product update
  - [ ] No se llama cuando el precio sube

  **QA Scenarios**:
  ```
  Scenario: Método price drop existe en notification_service
    Tool: Bash
    Steps:
      1. grep -n "send_price_drop_notification" backend/app/services/notification_service.py
      2. grep -n "send_price_drop_notification" backend/app/services/product_service.py
    Expected Result: Método definido en notification_service, llamado en product_service
    Evidence: .sisyphus/evidence/task-T9-price-drop-method.txt
  ```

  **Commit**: YES
  - Message: `feat(notifications): add price drop notification on product price update`
  - Files: `backend/app/services/notification_service.py`, `backend/app/services/product_service.py`

- [ ] T10. Wire usePushNotifications en _layout.tsx

  **What to do**:
  - En `frontend/app/_layout.tsx`: importar y usar el hook `usePushNotifications` del archivo `hooks/usePushNotifications.ts`
  - El hook se debe llamar dentro del componente que tiene acceso a `ClerkProvider` y `isSignedIn` (ya en scope)
  - Agregar `usePushNotifications()` dentro del componente principal de layout (después del ClerkLoaded check)
  - Verificar que `eas.json` tiene `"projectId"` en la config de EAS (viene de T6)
  - Asegurarse que no se llama el hook en contextos sin auth (el hook ya maneja `isSignedIn`)

  **Must NOT do**:
  - NO modificar la lógica interna del hook `usePushNotifications.ts`
  - NO agregar lógica de notificaciones adicional en el layout
  - NO romper la estructura existente del layout

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Agregar 2 líneas al layout (import + hook call)
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2
  - **Blocks**: F3
  - **Blocked By**: T2 (endpoint debe existir), T6 (projectId en app.json)

  **References**:
  - `frontend/app/_layout.tsx` — archivo completo (leer antes de editar)
  - `frontend/hooks/usePushNotifications.ts` — el hook a importar
  - `frontend/app/_layout.tsx:14-26` — zona de imports y hooks existentes

  **Acceptance Criteria**:
  - [ ] `usePushNotifications` importado en `_layout.tsx`
  - [ ] `usePushNotifications()` llamado en el componente correcto
  - [ ] `pnpm run type-check` pasa sin errores nuevos

  **QA Scenarios**:
  ```
  Scenario: Hook wired en layout
    Tool: Bash
    Steps:
      1. grep -n "usePushNotifications" frontend/app/_layout.tsx
    Expected Result: Import y uso del hook presentes
    Evidence: .sisyphus/evidence/task-T10-hook-wired.txt
  ```

  **Commit**: YES
  - Message: `feat(notifications): wire usePushNotifications hook in root layout`
  - Files: `frontend/app/_layout.tsx`

- [ ] T11. Reviews UI: Sección en Product Detail + Formulario Crear Review

  **What to do**:
  - En `frontend/app/product/[id].tsx` (o el archivo del detalle de producto): agregar sección de reviews:
    - **Lista de reviews**: usar `useQuery` de TanStack Query + `getProductReviews` para mostrar reviews existentes. Cada review muestra: nombre de usuario, rating (estrellas 1-5), comentario, fecha
    - **Formulario crear review**: mostrar solo si el usuario está autenticado. Campos: rating (selector de estrellas), comentario (TextInput opcional). Submit llama a `createReview`
    - Manejo de error 409 (ya revieweó) → mensaje "Ya revisaste este producto"
    - Manejo de error 403 (no compró) → mensaje "Debes comprar el producto para dejar una review"
  - Usar componentes NativeWind/Gluestack existentes (no instalar librerías nuevas)
  - Para las estrellas de rating: usar íconos Lucide (`Star` de lucide-react-native)

  **Must NOT do**:
  - NO instalar react-native-ratings o librerías de estrellas externas
  - NO crear una pantalla separada para reviews (va en el detalle del producto)
  - NO permitir crear review sin auth (mostrar solo si isSignedIn)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: UI de reviews con estrellas, lista y formulario
  - **Skills**: [`building-native-ui`]
    - `building-native-ui`: Patrones de UI para Expo Router con NativeWind

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2
  - **Blocks**: F3
  - **Blocked By**: T7 (frontend/api/reviews.ts)

  **References**:
  - `frontend/app/product/` — directorio del product detail (encontrar el archivo correcto)
  - `frontend/api/reviews.ts` — funciones a usar (de T7)
  - `frontend/components/` — componentes existentes para seguir el estilo
  - `frontend/app/orders.tsx` — patrón de useQuery + lista con TanStack Query
  - Lucide Star icon: `import { Star } from 'lucide-react-native'`

  **Acceptance Criteria**:
  - [ ] Product detail muestra lista de reviews (puede estar vacía)
  - [ ] Formulario de review visible para usuarios autenticados
  - [ ] `pnpm run type-check` pasa

  **QA Scenarios**:
  ```
  Scenario: Reviews visible en product detail
    Tool: Playwright
    Preconditions: App corriendo, navegar a product detail
    Steps:
      1. Navegar a una pantalla de producto
      2. Hacer scroll hasta el final de la pantalla
      3. Verificar que existe sección con texto "Reseñas" o "Reviews"
      4. Screenshot
    Expected Result: Sección de reviews visible
    Evidence: .sisyphus/evidence/task-T11-reviews-section.png
  ```

  **Commit**: YES
  - Message: `feat(ui): add reviews section with list and create form in product detail`
  - Files: `frontend/app/product/[id].tsx` (o equivalente)

- [ ] T12. Recommendations UI: Sección en Home Screen

  **What to do**:
  - En `frontend/app/index.tsx` (home screen): agregar sección "Para ti" o "Recomendados" que muestre productos del endpoint `/products/recommended`
  - Usar `useRecommendationsStore` existente: llamar `fetchRecommendations(token)` en un `useEffect` cuando el usuario está autenticado
  - Mostrar la sección solo si `recommendedProducts.length > 0`
  - Diseño: horizontal scroll list (FlashList o FlatList horizontal) con las mismas tarjetas de producto que el home ya usa
  - Si `isLoading`: mostrar skeleton/loading state usando patrón del proyecto
  - Si el usuario no está autenticado: no mostrar la sección (o mostrar variante sin auth)

  **Must NOT do**:
  - NO crear una pantalla separada de recomendaciones
  - NO mostrar la sección vacía si no hay recomendaciones
  - NO re-implementar el store — usar `useRecommendationsStore` existente

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: UI de sección de recomendaciones con scroll horizontal
  - **Skills**: [`building-native-ui`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2
  - **Blocks**: F3
  - **Blocked By**: T7 (store URL fix)

  **References**:
  - `frontend/app/index.tsx` — home screen donde agregar la sección
  - `frontend/store/useRecommendationsStore.ts` — store a usar
  - `frontend/components/` — componentes de tarjeta de producto existentes (buscar ProductCard o similar)
  - `frontend/app/index.tsx` — estructuras de FlatList/FlashList ya existentes en home

  **Acceptance Criteria**:
  - [ ] Sección "Para ti" visible en home cuando hay recomendaciones
  - [ ] No visible cuando array está vacío
  - [ ] Tap en producto navega al detail

  **QA Scenarios**:
  ```
  Scenario: Sección recomendaciones visible con usuario autenticado
    Tool: Playwright
    Preconditions: App corriendo, usuario con dietary_preferences configuradas
    Steps:
      1. Abrir home screen con usuario autenticado
      2. Verificar que existe sección con "Para ti" o "Recomendados"
      3. Screenshot de la sección
    Expected Result: Sección visible con al menos 1 producto
    Evidence: .sisyphus/evidence/task-T12-recommendations-ui.png
  ```

  **Commit**: YES
  - Message: `feat(ui): add recommendations section in home screen`
  - Files: `frontend/app/index.tsx`

- [ ] T13. Android intentFilters para Deep Linking

  **What to do**:
  - En `frontend/app.json`, dentro de la sección `"android"`: agregar `"intentFilters"` para manejar deep links desde fuera de la app:
    ```json
    "intentFilters": [
      {
        "action": "VIEW",
        "autoVerify": true,
        "data": [
          {
            "scheme": "healthbytes"
          }
        ],
        "category": ["BROWSABLE", "DEFAULT"]
      }
    ]
    ```
  - Verificar que las rutas `/orders/[id]` y `/product/[id]` existen en el router de Expo (ya deben existir)
  - El handling del deep link desde notificaciones ya está en `usePushNotifications.ts` (convierte `healthbytes://orders/1` → `/orders/1`)
  - Documentar en un comentario en el código las rutas soportadas: `healthbytes://orders/{id}`, `healthbytes://product/{id}`

  **Must NOT do**:
  - NO agregar universal links (HTTPS) — scope demasiado amplio para este sprint
  - NO modificar `usePushNotifications.ts` (ya maneja el redirect correctamente)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Edición de JSON de configuración
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2
  - **Blocks**: F3
  - **Blocked By**: None (independiente de los otros)

  **References**:
  - `frontend/app.json:19-27` — sección android donde agregar intentFilters
  - `frontend/hooks/usePushNotifications.ts:101-106` — deep link handling existente
  - `frontend/app/` — verificar que rutas orders/ y product/ existen

  **Acceptance Criteria**:
  - [ ] `app.json` tiene `android.intentFilters` con scheme `healthbytes`
  - [ ] node -e para validar JSON → 0 errores de syntax

  **QA Scenarios**:
  ```
  Scenario: intentFilters configurados correctamente
    Tool: Bash
    Steps:
      1. node -e "const c = require('./frontend/app.json'); console.log(JSON.stringify(c.expo.android.intentFilters, null, 2))"
    Expected Result: Array con al menos 1 intent filter con scheme "healthbytes"
    Evidence: .sisyphus/evidence/task-T13-intentfilters.txt
  ```

  **Commit**: YES
  - Message: `feat(config): add Android intentFilters for healthbytes:// deep linking`
  - Files: `frontend/app.json`

- [ ] T14. Tests review_service + Reviews API (+5% coverage)

  **What to do**:
  - Crear `backend/tests/test_services/test_review_service.py` con tests para `review_service.py`:
    - `test_create_review_product_not_found`: producto no existe → retorna None
    - `test_create_review_duplicate`: usuario ya revieweó → raise ValueError
    - `test_create_review_no_purchase`: usuario no compró → raise ValueError
    - `test_create_review_success`: happy path, retorna Review creada
    - `test_get_product_reviews_empty`: producto sin reviews → lista vacía
    - `test_get_product_reviews_with_data`: producto con reviews → lista correcta
  - Crear `backend/tests/test_api/test_reviews.py` con tests para el endpoint (de T3):
    - `test_get_reviews_public`: GET /reviews/product/1 sin auth → 200
    - `test_create_review_unauthorized`: POST /reviews/product/1 sin auth → 401
    - `test_create_review_product_not_found`: POST con producto inexistente → 404
  - Usar los fixtures existentes en `backend/tests/conftest.py` (db_session, sample_user, sample_product, sample_order)

  **Must NOT do**:
  - NO modificar los fixtures existentes en conftest.py
  - NO testear lógica de negocio que ya está en review_service (solo testear la API layer en test_reviews.py)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Requiere entender los fixtures existentes, los modelos de DB y el patrón de tests del proyecto
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (con T15)
  - **Parallel Group**: Wave 3
  - **Blocks**: T16
  - **Blocked By**: T3 (router debe existir para API tests)

  **References**:
  - `backend/tests/conftest.py` — fixtures disponibles (leer completo antes de escribir tests)
  - `backend/app/services/review_service.py` — código a testear
  - `backend/tests/test_services/test_order_service.py` — patrón de tests de servicios a seguir
  - `backend/tests/test_api/test_orders.py` — patrón de tests de API a seguir
  - `backend/app/db/schemas.py` — modelos para crear instancias de test

  **Acceptance Criteria**:
  - [ ] `pytest backend/tests/test_services/test_review_service.py` → todos pasan
  - [ ] `pytest backend/tests/test_api/test_reviews.py` → todos pasan
  - [ ] Coverage de `review_service.py` ≥ 70%

  **QA Scenarios**:
  ```
  Scenario: Tests de review service pasan
    Tool: Bash
    Steps:
      1. cd backend && python -m pytest tests/test_services/test_review_service.py -v 2>&1
    Expected Result: Todos los tests PASSED, 0 FAILED
    Evidence: .sisyphus/evidence/task-T14-review-service-tests.txt

  Scenario: Tests de reviews API pasan
    Tool: Bash
    Steps:
      1. cd backend && python -m pytest tests/test_api/test_reviews.py -v 2>&1
    Expected Result: Todos los tests PASSED, 0 FAILED
    Evidence: .sisyphus/evidence/task-T14-reviews-api-tests.txt
  ```

  **Commit**: YES
  - Message: `test(reviews): add unit and API tests for review_service and reviews router`
  - Files: `backend/tests/test_services/test_review_service.py`, `backend/tests/test_api/test_reviews.py`

- [ ] T15. Tests notification_service + Order Trigger (+3% coverage)

  **What to do**:
  - Crear `backend/tests/test_services/test_notification_service.py`:
    - `test_send_notification_empty_token`: expo_token vacío → retorna None sin exception
    - `test_send_notification_server_error`: PushClient lanza PushServerError → loguea error, no re-raise
    - `test_send_notification_device_unregistered`: DeviceNotRegisteredError → loguea, no re-raise
    - `test_send_notification_success`: mock PushClient.publish → se llama con token, body y data payload correctos
    - `test_send_price_drop_notification_success`: nuevo método de T9, verificar payload
  - Crear `backend/tests/test_services/test_notification_trigger.py` (o agregar a test_order_service.py):
    - `test_order_status_change_triggers_notification`: al cambiar estado, se llama NotificationService
    - `test_order_status_change_no_token_no_exception`: usuario sin token → no falla
  - Usar `unittest.mock.patch` para mockear `PushClient.publish`

  **Must NOT do**:
  - NO hacer calls reales a la API de Expo Push Notifications en tests
  - NO modificar notification_service.py para los tests (mockear externamente)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Requiere entender el patrón de mocking del proyecto y el SDK de expo-server-sdk
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (con T14)
  - **Parallel Group**: Wave 3
  - **Blocks**: T16
  - **Blocked By**: T8, T9

  **References**:
  - `backend/app/services/notification_service.py` — código a testear
  - `backend/tests/test_services/test_payment_service.py` — patrón de mocking de servicios externos
  - `backend/tests/conftest.py` — fixtures disponibles
  - `exponent_server_sdk` — `PushClient`, `PushServerError`, `DeviceNotRegisteredError` (para mocking)

  **Acceptance Criteria**:
  - [ ] `pytest backend/tests/test_services/test_notification_service.py` → todos pasan
  - [ ] Coverage de `notification_service.py` ≥ 80%
  - [ ] Tests no hacen HTTP calls reales (mock verificado con `assert mock_push.called`)

  **QA Scenarios**:
  ```
  Scenario: Tests notification service pasan con mocks
    Tool: Bash
    Steps:
      1. cd backend && python -m pytest tests/test_services/test_notification_service.py -v 2>&1
    Expected Result: Todos PASSED, sin HTTP real calls
    Evidence: .sisyphus/evidence/task-T15-notification-tests.txt
  ```

  **Commit**: YES
  - Message: `test(notifications): add unit tests for notification_service with mocked PushClient`
  - Files: `backend/tests/test_services/test_notification_service.py`

- [ ] T16. Tests Orders API Edge Cases (+5% → Total ≥ 50%)

  **What to do**:
  - En `backend/tests/test_api/test_orders.py` (ya existe con 19% coverage): agregar tests para los paths no cubiertos:
    - `test_create_order_invalid_product`: producto inexistente → 404 o 422
    - `test_create_order_out_of_stock`: producto sin stock → 400 o 422
    - `test_get_orders_pagination`: skip y limit params funcionan correctamente
    - `test_get_order_not_found`: orden inexistente → 404
    - `test_get_order_wrong_user`: orden de otro usuario → 403 o 404
    - `test_update_order_status_invalid`: estado inválido → 422
    - `test_update_order_status_valid`: estado válido → 200 + status actualizado
  - Primero: leer el archivo test_orders.py existente para NO duplicar tests existentes
  - Target: subir orders API de 19% a ≥ 40%, lo que contribuye al total pasando 50%

  **Must NOT do**:
  - NO reescribir tests que ya existen
  - NO agregar tests que requieran MercadoPago real

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Requiere análisis de coverage actual para identificar paths sin cubrir
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO (después de T14 y T15 para asegurar que la suma de todos alcanza 50%)
  - **Parallel Group**: Wave 3 (al final de Wave 3, depende de T14 y T15)
  - **Blocks**: T17
  - **Blocked By**: T1 (threshold fix), T14, T15

  **References**:
  - `backend/tests/test_api/test_orders.py` — archivo existente (leer completo antes de agregar)
  - `backend/app/api/v1/orders.py` — código a cubrir (identificar branches sin tests)
  - `backend/tests/conftest.py` — fixtures disponibles (sample_order, etc.)
  - Coverage report: `cd backend && python -m pytest --cov=app --cov-report=term-missing -q` para ver qué falta

  **Acceptance Criteria**:
  - [ ] `pytest backend/tests/test_api/test_orders.py` → todos pasan
  - [ ] `pytest --cov=app -q` → coverage ≥ 50%
  - [ ] Sin regresiones en tests existentes

  **QA Scenarios**:
  ```
  Scenario: Coverage total ≥ 50% después de todos los tests
    Tool: Bash
    Steps:
      1. cd backend && python -m pytest --cov=app --cov-report=term-missing -q 2>&1 | tail -5
    Expected Result: TOTAL coverage ≥ 50%, 0 failures
    Evidence: .sisyphus/evidence/task-T16-coverage-report.txt
  ```

  **Commit**: YES
  - Message: `test(orders): add edge case tests for orders API to reach 50% coverage`
  - Files: `backend/tests/test_api/test_orders.py`

- [ ] T17. EAS Build Preview + Staging Secrets Documentation

  **What to do**:
  - **EAS Build Preview**: Verificar que `eas.json` profile `preview` está listo para Android:
    - Confirmar `distribution: "internal"` y `android.buildType: "apk"` en preview profile
    - Documentar el comando: `npx eas build --platform android --profile preview`
  - **Staging GitHub Secrets**: Crear archivo `infra/staging-setup.md` con las instrucciones exactas para configurar los secrets de staging en GitHub:
    - `STAGING_DATABASE_URL` — URL de la DB de staging
    - `STAGING_BACKEND_TASK_DEFINITION` — JSON de la task definition de ECS staging (template en infra/)
    - `STAGING_ECS_CLUSTER` — nombre del cluster ECS de staging
    - `STAGING_ECS_SERVICE` — nombre del servicio ECS de staging
    - `STAGING_URL` — URL base del backend de staging
    - `EXPO_TOKEN` — token de EAS para build automation
    - `GOOGLE_SERVICE_ACCOUNT_KEY_JSON` — service account de Google Play
  - Adaptar `infra/ecs-task-definition.json` para crear `infra/ecs-task-definition-staging.json` con los paths de secrets staging (`/healthbytes/staging/*` en lugar de `/healthbytes/prod/*`)
  - Verificar que `backend/scripts/smoke_tests.py` existe (es llamado en deploy.yml staging job)

  **Must NOT do**:
  - NO crear los recursos AWS reales (solo documentar los pasos)
  - NO committing secrets reales
  - NO modificar el pipeline de deploy.yml (ya está correcto)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Crear/editar archivos de configuración e infra sin lógica compleja
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO (depende de que T1 esté completo para que CI pase)
  - **Parallel Group**: Wave 3 (después de T1)
  - **Blocks**: F1
  - **Blocked By**: T1, T6, T16

  **References**:
  - `frontend/eas.json` — profiles actuales (development, preview, production)
  - `.github/workflows/deploy.yml` — leer completo para entender qué secrets requiere el staging job
  - `infra/ecs-task-definition.json` — template de production a adaptar para staging
  - `infra/secrets-setup.sh` — referencia para entender el path de secrets (`/healthbytes/prod/*`)
  - `infra/README.md` — documentación de infra existente

  **Acceptance Criteria**:
  - [ ] `infra/staging-setup.md` existe con lista completa de GitHub secrets necesarios
  - [ ] `infra/ecs-task-definition-staging.json` existe con paths `/healthbytes/staging/*`
  - [ ] `backend/scripts/smoke_tests.py` existe (si no, crearlo con checks básicos)

  **QA Scenarios**:
  ```
  Scenario: Archivos de staging documentados
    Tool: Bash
    Steps:
      1. ls -la infra/staging-setup.md infra/ecs-task-definition-staging.json
      2. grep "/healthbytes/staging" infra/ecs-task-definition-staging.json | wc -l
    Expected Result: Ambos archivos existen; staging task def tiene paths staging
    Evidence: .sisyphus/evidence/task-T17-staging-docs.txt
  ```

  **Commit**: YES
  - Message: `feat(infra): add staging task definition and deployment secrets documentation`
  - Files: `infra/staging-setup.md`, `infra/ecs-task-definition-staging.json`

- [ ] T18. Google Play Store Submission Prep + EAS Submit Config

  **What to do**:
  - Verificar que `frontend/app.json` tiene todo lo necesario para Android AAB:
    - `android.package: "com.healthbytes.app"` ✅
    - `android.versionCode: 1` ✅ (incrementar si es re-submit)
    - `version: "1.0.0"` ✅
  - En `frontend/eas.json`: verificar/agregar configuración de `submit` para Android en el profile `production`:
    ```json
    "submit": {
      "production": {
        "android": {
          "serviceAccountKeyPath": "./google-service-account.json",
          "track": "internal"
        }
      }
    }
    ```
  - Crear `frontend/store/submission-checklist.md` con el checklist de pre-submission a Google Play:
    - Screenshots requeridos (teléfono)
    - Descripción corta y larga de la app
    - Categoría (Shopping / Health & Fitness)
    - Privacy Policy URL (obligatorio)
    - Content rating questionnaire
    - google-service-account.json (descargarlo de Google Play Console)
  - Documentar el comando de submission: `npx eas build --platform android --profile production && npx eas submit --platform android --profile production`

  **Must NOT do**:
  - NO committing google-service-account.json (es un secret)
  - NO modificar el versionCode sin confirmación del equipo
  - NO cambiar el track de "internal" a "production" sin aprobación manual

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Requiere revisar configuración EAS, crear checklist detallado, verificar todos los requisitos de Play Store
  - **Skills**: [`expo-deployment`]
    - `expo-deployment`: Guía específica de EAS y Play Store submission

  **Parallelization**:
  - **Can Run In Parallel**: YES (con T14-T16)
  - **Parallel Group**: Wave 3
  - **Blocks**: F1
  - **Blocked By**: T17 (conceptualmente, pero puede correr en paralelo)

  **References**:
  - `frontend/eas.json` — configuración EAS actual
  - `frontend/app.json` — android package, version, versionCode
  - `.github/workflows/deploy.yml:deploy-production-android` — el job de submit ya existe (ver exactamente qué hace)
  - EAS Submit docs: https://docs.expo.dev/submit/android/

  **Acceptance Criteria**:
  - [ ] `eas.json` tiene sección `submit.production.android` con `track: "internal"`
  - [ ] `infra/play-store-submission-checklist.md` (o similar) existe con todos los campos requeridos
  - [ ] `eas.json` JSON es válido: `node -e "require('./frontend/eas.json')"`

  **QA Scenarios**:
  ```
  Scenario: EAS submit config válida
    Tool: Bash
    Steps:
      1. node -e "const c = require('./frontend/eas.json'); console.log(JSON.stringify(c.submit, null, 2))"
    Expected Result: submit.production.android existe con track
    Evidence: .sisyphus/evidence/task-T18-eas-submit-config.txt
  ```

  **Commit**: YES
  - Message: `feat(deploy): add EAS submit config for Google Play and submission checklist`
  - Files: `frontend/eas.json`, `infra/play-store-submission-checklist.md`

- [ ] T19. Accessibility Audit WCAG 2.2 + Fixes Críticos

  **What to do**:
  - **Fase 1 — Audit**: Revisar todos los componentes en `frontend/components/` y pantallas en `frontend/app/` buscando problemas de accesibilidad:
    - Falta de `accessibilityLabel` en botones e íconos sin texto visible
    - Falta de `accessibilityRole` en botones interactivos (`accessibilityRole="button"`)
    - Falta de `accessibilityHint` en acciones no obvias
    - Tamaño de touch target < 44×44 pts (WCAG 2.5.5)
    - Contraste de color insuficiente (colores de texto sobre fondos)
    - Falta de `accessible={true}` en componentes interactivos de Gluestack
  - **Fase 2 — Fixes**: Aplicar fixes a los componentes con problemas P0 (críticos):
    - Todos los Pressable/TouchableOpacity/Button sin label → agregar `accessibilityLabel`
    - Íconos de navegación sin texto → agregar `accessibilityLabel` descriptivo
    - Formularios: agregar `accessibilityLabel` a cada Input
    - Mínimo 5 componentes del flujo principal corregidos
  - **Fase 3 — Report**: Crear `docs/accessibility-audit-2026.md` con:
    - Checklist de WCAG 2.2 Level AA items verificados
    - Tabla de componentes con issues encontrados y si fueron fixed o quedan pendientes
    - Prioridad de fixes restantes

  **Must NOT do**:
  - NO refactorizar componentes para el audit — solo agregar props de a11y
  - NO instalar librerías de testing de a11y (jest-axe no aplica bien a RN)
  - NO cambiar el diseño visual por el audit

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Requiere revisar sistemáticamente todos los componentes y pantallas
  - **Skills**: [`accessibility`]
    - `accessibility`: WCAG 2.2 guidelines y patrones para React Native

  **Parallelization**:
  - **Can Run In Parallel**: YES — completamente independiente de T14-T18
  - **Parallel Group**: Wave 3
  - **Blocks**: F3
  - **Blocked By**: None

  **References**:
  - `frontend/components/` — todos los componentes UI a auditar
  - `frontend/app/` — pantallas principales del flujo (index, product/[id], cart, checkout-v2, orders)
  - WCAG 2.2 Quick Reference: https://www.w3.org/WAI/WCAG22/quickref/
  - React Native Accessibility: https://reactnative.dev/docs/accessibility

  **Acceptance Criteria**:
  - [ ] `docs/accessibility-audit-2026.md` existe con ≥ 20 items checkeados
  - [ ] Al menos 5 componentes del flujo principal tienen `accessibilityLabel` y `accessibilityRole` correctos
  - [ ] Todos los Pressable e íconos de navegación tienen `accessibilityLabel`

  **QA Scenarios**:
  ```
  Scenario: Componentes de navegación tienen accessibilityLabel
    Tool: Bash
    Steps:
      1. grep -rn "accessibilityLabel" frontend/components/ui/NavBar/ 2>/dev/null | wc -l
    Expected Result: ≥ 3 referencias a accessibilityLabel en la NavBar
    Evidence: .sisyphus/evidence/task-T19-a11y-navbar.txt

  Scenario: Audit report generado
    Tool: Bash
    Steps:
      1. ls -la docs/accessibility-audit-2026.md
      2. wc -l docs/accessibility-audit-2026.md
    Expected Result: Archivo existe con ≥ 50 líneas
    Evidence: .sisyphus/evidence/task-T19-a11y-report.txt
  ```

  **Commit**: YES
  - Message: `feat(a11y): add WCAG 2.2 audit report and fix critical accessibility issues`
  - Files: `frontend/components/**/*.tsx`, `frontend/app/**/*.tsx`, `docs/accessibility-audit-2026.md`

---

## Final Verification Wave

> 4 review agents run in PARALLEL. ALL must APPROVE. Present consolidated results to user and get explicit "okay" before completing.

- [ ] F1. **Plan Compliance Audit** — `oracle`
  Leer el plan end-to-end. Para cada "Must Have": verificar que la implementación existe (leer archivo, curl endpoint). Para cada "Must NOT Have": buscar en codebase por patrones prohibidos (toggle manual, iOS submit, ML recommendations). Verificar que evidencia existe en .sisyphus/evidence/.
  Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [ ] F2. **Code Quality Review** — `unspecified-high`
  Ejecutar `cd backend && python -m pytest --tb=short -q` + `cd frontend && pnpm run type-check` + `pnpm run lint`. Revisar todos los archivos modificados: sin `as any` no justificado, sin `@ts-ignore`, sin `console.log` en prod, sin imports no usados, sin `except: pass` en Python.
  Output: `Backend tests [PASS/FAIL] | Coverage [X%] | Frontend types [PASS/FAIL] | Lint [PASS/FAIL] | VERDICT`

- [ ] F3. **Real QA End-to-End** — `unspecified-high` (+ `playwright` skill)
  Desde estado limpio. Ejecutar TODOS los escenarios QA de CADA tarea. Guardar evidencia en `.sisyphus/evidence/final-qa/`.
  Output: `Scenarios [N/N pass] | Integration [N/N] | Edge Cases [N tested] | VERDICT`

- [ ] F4. **Scope Fidelity Check** — `deep`
  Para cada tarea: leer "What to do", leer git diff actual. Verificar 1:1 — todo lo que el spec dice fue construido, nada más. Verificar "Must NOT do" compliance.
  Output: `Tasks [N/N compliant] | Creep [CLEAN/N issues] | Unaccounted [CLEAN/N files] | VERDICT`

---

## Commit Strategy

- Wave 1: commits atómicos por tarea (T1-T7)
- Wave 2: commits atómicos por tarea (T8-T13)  
- Wave 3: commits atómicos por tarea (T14-T18)
- Convención: `feat(scope): desc` / `fix(scope): desc` / `test(scope): desc`

---

## Success Criteria

### Verification Commands
```bash
# Backend: coverage ≥ 50%, 0 failures
cd backend && python -m pytest --cov=app --cov-report=term-missing -q
# Expected: coverage 50%+, PASSED

# Frontend: tipos OK
cd frontend && pnpm run type-check
# Expected: no errors

# Push token endpoint
curl -X PATCH http://localhost:3001/api/v1/users/me/push-token \
  -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json" \
  -d '{"token": "ExponentPushToken[xxx]"}'
# Expected: 200 OK

# Recommendations
curl http://localhost:3001/api/v1/products/recommended \
  -H "Authorization: Bearer $JWT"
# Expected: 200, array de productos filtrados

# Reviews
curl http://localhost:3001/api/v1/reviews/product/1
# Expected: 200, array de reviews
```

### Final Checklist
- [ ] coverage ≥ 50% (pytest)
- [ ] 0 TypeScript errors (tsc --noEmit)
- [ ] push notifications: token guardado + notificación al cambiar estado de orden
- [ ] reviews: crear + listar en product detail
- [ ] recomendaciones: sección visible en home con productos filtrados
- [ ] dark mode: switch sistema → app responde
- [ ] EAS Android build exitoso
- [ ] staging deploy: push a main → ECS actualizado
