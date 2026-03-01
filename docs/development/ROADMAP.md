# 🗺️ HealthBytes - Roadmap Completo 2026

> **📅 Última actualización**: Marzo 1, 2026
> **🎯 Estado del Proyecto**: Production Hardening — Audit Trail + Webhooks + CI/CD verificados
> **🚀 Versión Target**: v1.0.0 (Marzo-Abril 2026)

---

## 📊 Resumen Ejecutivo

**HealthBytes** es una plataforma mobile-first de e-commerce para personas con restricciones alimentarias. Este roadmap consolida el estado actual y define las prioridades de desarrollo para los próximos 6 meses.

### 🎯 Objetivos Claves 2026

| Objetivo | Target | Status |
|----------|--------|--------|
| 🚢 **MVP Launch** | Marzo-Abril 2026 | 🟠 En progreso (~95% completo) |
| 👥 **Beta Users** | 100 usuarios | 🟡 Próximo sprint |
| 💳 **Payment Live** | Marzo 2026 | ✅ Mercado Pago completo + webhooks HMAC-SHA256 |
| 🐳 **Dockerized** | Marzo 2026 | ✅ Docker + CI/CD + deploy pipeline configurados |
| �️ **Security Hardened** | Febrero 2026 | ✅ Completado (minimatch HIGH resuelto) |
| �📱 **App Store** | Mayo 2026 | 📋 Planeado |

---

## ✅ Estado Actual - Features Implementadas

### 🛡️ Security & Dependencies (Febrero 2026)

| Vulnerability | Severity | Status | Solution |
|---|---|---|---|
| **minimatch ReDoS** | 🔴 HIGH | ✅ FIXED | glob 11.0.0 + minimatch 10.2.2 override |
| **tar** | 🔴 HIGH | ✅ SAFE | @expo/cli 54.0.23 ya sin vuln |
| **ajv ReDoS** | 🟠 MEDIUM | ⏳ DEFERRED | ESLint 9 (ecosystem pending, dev-only) |
| **bn.js infinite loop** | 🟠 MEDIUM | ⚠️ UNAVOIDABLE | Upstream max v5.2.3 (@solana/web3.js 1.98.4) |

**Validation**: ✅ `pnpm audit --prod` = "No known vulnerabilities found"  
**Clerk Update Impact**: 2.19.18 → 2.19.26 reduces transitive bn.js exposure  
**Next Step**: Monitor Dependabot after PR #71 merge for ecosystem updates

---

### Backend (FastAPI)

| Feature | Estado | Coverage | Endpoints |
|---------|--------|----------|-----------|
| **CRUD Productos** | ✅ Completo | 85% | 5 endpoints |
| **Full-Text Search** | ✅ Completo | 90% | PostgreSQL tsvector |
| **Autenticación** | ✅ Completo | 95% | Clerk + JWT fallback |
| **Carrito** | ✅ Completo | 85% | Sync backend + local |
| **Órdenes** | ✅ Completo | 80% | CRUD + tracking + estado |
| **Favoritos** | ✅ Completo | 85% | Many-to-many + Supabase |
| **Dietary Tags** | ✅ Completo | 85% | Many-to-many |
| **Nutritional Info** | ✅ Completo | 80% | JSON field |
| **Users CRUD** | ✅ Completo | 90% | Profile management |
| **Payment Integration** | ✅ Completo | 85% | Mercado Pago + webhooks + screens |
| **Audit Trail** | ✅ Completo | - | stock/order/payment (9 log points) |

### Frontend (React Native + Expo)

| Feature | Estado | Evidencia |
|---------|--------|-----------|
| **Bottom Navigation** | ✅ Completo | BottomNavBar + Expo Router tabs |
| **Product Listing** | ✅ Completo | Grid + lista + infinite scroll (index.tsx, all-products.tsx) |
| **Product Detail** | ✅ Completo | Nutritional info + badges (product/[id].tsx) |
| **Search** | ✅ Completo | Full-text con filtros (search.tsx) |
| **Dietary Filter Chips** | ✅ Completo | DietaryFilterBar component + productFiltersStore |
| **Wishlist/Favorites** | ✅ Completo | wishlist.tsx + FavoritesBar + favoritesStore |
| **Cart Management** | ✅ Completo | cart.tsx + cartStore |
| **Checkout Flow** | ✅ Completo | checkout-v2.tsx con StepIndicator |
| **Orders List** | ✅ Completo | orders.tsx + orders/[id].tsx |
| **Authentication** | ✅ Completo | (auth)/login.tsx + Clerk OAuth |
| **Recently Viewed** | ✅ Completo | recently-viewed.tsx + recentlyViewedStore |
| **Stock Badges** | ✅ Completo | StockBadge component |
| **Skeleton Loaders** | ✅ Completo | HomeSkeleton + ProductCardSkeleton |
| **Address Management** | ✅ Completo | addresses.tsx + AddressCard + addressStore |
| **Payment Methods** | ✅ Completo | PaymentMethodSelector + payments.tsx |
| **Step Indicator** | ✅ Completo | StepIndicator component |
| **Payment Screens** | ✅ Completo | payment/success.tsx, failure.tsx, pending.tsx |
| **Profile** | ✅ Completo | profile.tsx + profile-settings.tsx |
| **Dietary Preferences** | 🟡 En progreso | dietary-preferences.tsx + preferencesStore |
| **Error Boundaries** | ✅ Completo | ErrorBoundary component |
| **Onboarding Modal** | 🟡 En progreso | OnboardingModal component |
| **Security Screen** | ✅ Completo | security.tsx |
| **Messages Screen** | 🟡 Básico | messages.tsx |
| **Support Screen** | 🟡 Básico | support.tsx |

### Infraestructura

| Componente | Estado | Detalle |
|------------|--------|---------|
| **Database** | ✅ PostgreSQL 14+ + Supabase | Migraciones manuales |
| **API** | ✅ FastAPI 0.104+ | Async SQLAlchemy 2.x |
| **Testing** | ✅ Robusto | Backend 174 tests, Frontend 126 tests (13 suites) |
| **CI/CD** | ✅ Configurado | ci.yml (5 jobs paralelos) + deploy.yml (AWS ECS) |
| **Docker** | ✅ Configurado | backend + frontend Dockerfiles + docker-compose (postgres+redis) |
| **Deploy** | 🟡 En progreso | AWS ECS pipeline listo, AWS RDS pendiente |

---

## 🔴 P0: Crítico para MVP (Febrero-Marzo 2026)

### 🎯 Milestone: MVP Launch-Ready

**Deadline**: Marzo 31, 2026  
**Bloqueador**: Estas funcionalidades son esenciales para lanzar

#### Backend P0

| Feature | Estimación | Dependencias | Owner |
|---------|-----------|--------------|-------|
| **Payment Integration (Mercado Pago)** | ✅ Completado | Integración completa | Backend |
| **Webhooks Payment Confirmation** | ✅ Completado | HMAC-SHA256 + idempotency + stock release | Backend |
| **Address CRUD** | ✅ Completado | Implementado jan | Backend |
| **Order Confirmation Emails** | ✅ 1 día | SendGrid/Mailgun (Resend implementado) | Backend |
| **Stock Management** | ✅ Implementado | Locking atómico funcional | Backend |

**Total Backend P0**: ~2.5 semanas

#### Frontend P0

| Feature | Estimación | Dependencias | Owner |
|---------|-----------|--------------|-------|
| **Checkout Flow Completo** | ✅ 80% | Backend Addresses + Payment | Frontend |
| **Address Selection UI** | ✅ Completado | AddressCard component | Frontend |
| **Payment Method Selection** | ✅ Completado | PaymentMethodSelector | Frontend |
| **Order Success Screen** | ✅ Completado | Payment screens (success/failure/pending) | Frontend |
| **Error Handling Mejorado** | ✅ Mejorado | Type safety + debug logs | Frontend |

**Total Frontend P0**: ~2.5 semanas

#### Testing P0

| Task | Estimación | Objetivo | Owner |
|------|-----------|----------|-------|
| **Backend Coverage 85%+** | ✅ Alcanzado | Subido a 85% | QA + Backend |
| **Frontend Tests 67+** | ✅ Completado | Zustand stores + API clients | QA |
| **Frontend Tests 126** | ✅ Completado | 126 tests / 13 suites — 0 fallos | QA |
| **E2E Checkout Tests** | 🟡 En progreso | Happy path + errores | QA |

**Total Testing P0**: ~2 semanas

#### DevOps P0

| Task | Estimación | Objetivo | Owner |
|------|-----------|----------|-------|
| **Docker Configuration** | ✅ Completado | Dockerfiles x2 + docker-compose (4 servicios) | DevOps |
| **CI/CD Pipeline** | ✅ Completado | ci.yml (5 jobs) + deploy.yml (ECS + EAS) | DevOps |
| **Security: Dependency Hardening** | ✅ COMPLETADO | Minimatch HIGH resuelto, Clerk actualizado | DevOps |

**Total DevOps P0**: ~3 días

---

## 🟠 P1: Alta Prioridad Post-MVP (Abril 2026)

### 🎯 Milestone: User Engagement & Retention

**Deadline**: Abril 30, 2026  
**Objetivo**: Mejorar experiencia de usuario y aumentar conversión

#### Features P1

| Feature | Estimación | Impacto | Owner |
|---------|-----------|---------|-------|
| **Onboarding Dietary Preferences** | 1-2 días | 🔥 Alto - Pre-filtrar correctamente | Frontend + Backend | 🟡 En progreso (dietary-preferences.tsx + preferencesStore creados) |
| **Push Notifications (Orders)** | 1.5 semanas | 🔥 Alto - Engagement | Backend + Frontend |
| **Product Recommendations** | 1 semana | 🔥 Alto - Aumenta ventas | Backend |
| **Order History Enhanced** | 3 días | 🔥 Alto - Re-compra fácil | Frontend |
| **Reviews & Ratings (Basic)** | 1 semana | ✨ Medio - Social proof | Backend + Frontend |
| **Filter Persistence** | ✅ Completado | ✨ Medio - UX | Frontend | productFiltersStore implementado |
| **Deep Linking** | 4 días | ✨ Medio - Compartir productos | Frontend |

**Total P1**: ~4-5 semanas

---

## 🟡 P2: Mejoras UI/UX (Mayo 2026)

### 🎯 Milestone: Polish & Accessibility

**Deadline**: Mayo 31, 2026  
**Objetivo**: App lista para app stores

#### UI/UX P2

| Feature | Estimación | Impacto | Owner |
|---------|-----------|---------|-------|
| **Dark Mode** | 4 días | ✨ Medio - Accesibilidad | Frontend |
| **A11y Audit & Fixes** | 1 semana | 🔥 Alto - WCAG 2.1 AA | Frontend |
| **Micro-interactions** | 3 días | ✨ Medio - Polish | Frontend |
| **Image Lazy Loading** | 2 días | 🔥 Alto - Performance | Frontend |
| **Offline Mode (Basic)** | 1 semana | ✨ Medio - Resilience | Frontend |
| **Loading States Consistency** | 2 días | ✨ Medio - UX | Frontend |

**Total P2**: ~3 semanas

#### Performance P2

| Task | Estimación | Objetivo | Owner |
|------|-----------|----------|-------|
| **Bundle Size Optimization** | 3 días | Reducir 30% | Frontend |
| **API Response Caching** | 2 días | Redis cache layer | Backend |
| **Image Optimization Pipeline** | 3 días | CDN + compression | DevOps |
| **Database Query Optimization** | 3 días | Índices + N+1 queries | Backend |

**Total Performance P2**: ~2 semanas

---

## 🟢 P3: Advanced Features (Junio+ 2026)

### 🎯 Milestone: Competitive Differentiation

**Deadline**: Post-Mayo 2026 (evaluar ROI primero)  
**Objetivo**: Features que nos diferencian de competidores

#### Features P3

| Feature | Estimación | Validación Requerida | Owner |
|---------|-----------|----------------------|-------|
| **Cupones & Promociones** | 1.5 semanas | ⚠️ Requiere estrategia marketing | Backend + Frontend |
| **Wishlist Lists (Multiple)** | 1 semana | ⚠️ Evaluar engagement actual | Backend + Frontend |
| **Sistema de Reviews Avanzado** | 2 semanas | ⚠️ Empezar con ratings simple | Backend + Frontend |
| **Programa de Lealtad** | 2 semanas | ⚠️ Business model primero | Backend + Frontend |
| **Subscripciones Recurrentes** | 3 semanas | ⚠️ Demand validation | Backend + Frontend |
| **Chat de Soporte** | 1.5 semanas | ⚠️ Zendesk vs custom | Frontend |
| **Compartir en RRSS** | 3 días | ✅ Quick win | Frontend |

**Total P3**: ~10-12 semanas (priorizar según feedback de usuarios)

---

## 🔧 Tech Debt & Mejoras Continuas

### Backend Tech Debt

| Tarea | Prioridad | Estimación | Impacto |
|-------|-----------|-----------|---------|
| **Implementar Database Migrations** | 🔥 Alta | 1 semana | Facilita cambios de schema |
| **Separar config.py por entornos** | ✨ Media | 2 días | Dev/Staging/Prod |
| **Logging estructurado (JSON)** | 🟡 Parcial | 1 día | Audit trail añadido, falta JSON format |
| **API Rate Limiting** | 🔥 Alta | 2 días | Protección DDoS |
| **API Versioning Strategy** | ✨ Media | 1 día | v1 → v2 plan |
| **Deprecate JWT Fallback** | 🔵 Baja | 1 día | Solo Clerk en prod |

### Frontend Tech Debt

| Tarea | Prioridad | Estimación | Impacto |
|-------|-----------|-----------|---------|
| **Jest Test Coverage 60%+** | ✅ Completado | - | 126 tests / 13 suites — 0 fallos |
| **Component Documentation (Storybook)** | ✨ Media | 1 semana | Acelera desarrollo |
| **Error Boundary Implementation** | 🔥 Alta | 2 días | UX en errores inesperados |
| **Analytics Integration** | 🔥 Alta | 3 días | Mixpanel/Amplitude |
| **Type Safety Improvements** | ✨ Media | 3 días | Strict TypeScript |

### DevOps Tech Debt

| Tarea | Prioridad | Estimación | Impacto |
|-------|-----------|-----------|---------|
| **CI/CD Pipeline** | ✅ Completado | - | ci.yml + deploy.yml configurados |
| **Automated E2E Tests** | 🔥 Alta | 1 semana | Detox/Appium |
| **Monitoring & Alerting** | 🔥 Alta | 3 días | Sentry + Datadog |
| **Database Backups Automated** | 🔥 Alta | 2 días | Daily backups en S3 |
| **SSL Certificates Management** | 🔥 Alta | 1 día | Let's Encrypt |
| **Staging Environment** | ✨ Media | 2 días | Espejo de producción |

---

## 📅 Timeline Consolidado

```
Febrero 2026
├─ Semana 1-2 (3-9 feb): P0 Backend (Payment integration 80%) ✅
├─ Semana 3-4 (10-14): P0 Frontend (Checkout, Address, Payment screens) ✅ + Testing P0 (Backend 85%, Frontend 67 tests) ✅
├─ Semana 4-5 (17-23): Security hardening ✅, UX/nav refinement ✅, new screens ✅
└─ Semana 5 (24-28): UX polish (home spacing, mobile fixes), ProductCard/DietaryFilterBar refactor ✅

Marzo 2026
├─ Semana 1 (Mar 1): ✅ Audit trail + Webhooks MP + Docker/CI-CD verificados
├─ Semana 2-3: AWS RDS setup + E2E tests + UAT
├─ Semana 4: MVP Freeze + Bug fixes
└─ Semana 5 (fin): **MVP Launch** 🚀

Abril 2026
├─ **MVP Live & Monitoring**
├─ P1 Features: Onboarding (User dietary prefs), Push notifications, Recommendations
├─ Beta testing & user feedback
└─ Bug fixes + hot releases

Mayo 2026
├─ P2 UI/UX: Dark mode, A11y audit, Performance optimization
├─ App Store submission (iOS + Android)
├─ Beta program expansion
└─ Monitoring & analytics

Junio 2026+
├─ P3 Features (evaluar ROI)
├─ Advanced features según feedback
├─ Scale optimization
└─ Post-launch iterations
```

---

## 📊 Métricas de Éxito

### MVP Launch (Abril 2026)

| Métrica | Objetivo | Método |
|---------|----------|--------|
| **Checkout Completion Rate** | >60% | Analytics |
| **Payment Success Rate** | >95% | Backend logs |
| **Crash-free Sessions** | >99.5% | Sentry |
| **API Response Time (p95)** | <500ms | Datadog |
| **App Load Time** | <3s | React Native Perf |

### Post-Launch (Mayo-Junio 2026)

| Métrica | Objetivo | Método |
|---------|----------|--------|
| **DAU/MAU Ratio** | >30% | Analytics |
| **Retention Day 7** | >40% | Mixpanel |
| **NPS Score** | >40 | In-app survey |
| **Cart Abandonment Rate** | <70% | Analytics |
| **Search-to-Purchase** | >15% | Analytics |

---

## ❌ Features DESCARTADAS

> Decisiones basadas en **ROI vs esfuerzo**

| Feature | Razón | Alternativa |
|---------|-------|-------------|
| ❌ **Historial de Búsquedas** | Bajo impacto, search actual suficiente | Search simple OK |
| ❌ **Typeahead Búsqueda** | Premature optimization (4 días vs ROI bajo) | Current search funciona |
| ❌ **2FA / Seguridad Avanzada** | No es MVP, Clerk es suficiente | Fase 5+ si usuarios piden |
| ❌ **Feedback Háptico** | iOS-only, valor unclear | Backlog indefinido |
| ❌ **Modo Kiosko B2B** | Pivot mayor, fuera de scope | Evaluar post-v1.0 |

---

## 🚧 Dependencias Críticas

### Externas (Bloqueadores)

- **Mercado Pago Credentials** → 🟢 Confirmadas, integración en progreso
- **SMTP Service** → ✅ Resend implementado
- **AWS Account Setup** → Blocker DevOps P0 (próximas 2 semanas)
- **Apple Developer Account** → Blocker App Store (Mayo)
- **Google Play Console** → Blocker Play Store (Mayo)

### Internas (Secuenciales)

```
✅ Backend Addresses API
    ↓
✅ Frontend Address Selection UI  
    ↓
✅ Checkout Flow 80%
    ↓
✅ Payment Integration (Mercado Pago completo)
    ↓
✅ Order Confirmation (Webhooks HMAC-SHA256 + Emails)
    ↓
🟡 E2E Testing + UAT
```

---

## 🔒 Riesgos & Mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| **Payment Integration Delays** | Media | 🔴 Alto | Empezar early, sandbox testing |
| **Apple Review Rejection** | Media | 🔴 Alto | Pre-review compliance check |
| **Performance Issues en Prod** | Baja | 🟠 Medio | Load testing pre-launch |
| **Stock Management Race Conditions** | Media | 🟠 Medio | Pessimistic locking |
| **Data Migration Failures** | Baja | 🔴 Alto | Backups antes de migrations |

---

## 🤝 Team & Roles

| Role | Responsable | Focus |
|------|-------------|-------|
| **Backend Lead** | TBD | API + DB + Integrations |
| **Frontend Lead** | TBD | React Native + UX |
| **DevOps** | TBD | CI/CD + Deploy + Monitoring |
| **QA** | TBD | Testing + Coverage |
| **Product Owner** | TBD | Roadmap + Priorización |

---

## 📚 Referencias

- [Frontend README](../../frontend/README.md)
- [Backend README](../../backend/README.md)
- [UI/UX Roadmap Detallado](UIUX_ROADMAP.md)
- [Architecture Docs](../architecture/README.md)
- [Testing Report](TESTING_REPORT.md)
- [Roadmap Visual](ROADMAP_VISUAL.md)

---

## 🔄 Actualización del Roadmap

Este documento debe revisarse:
- **Semanalmente**: Durante fase P0 (MVP)
- **Quincenalmente**: Durante fase P1-P2
- **Mensualmente**: Durante fase P3

**Próxima revisión**: Marzo 7, 2026

---

## 📋 Cambios Recientes (17-28 feb 2026)

### ✅ Completado (semana 4-5)

**Frontend**:
- Refinamiento UX home: spacing unificado, fixes mobile (db1a8f6)
- Extracción componentes compartidos: `ProductCard`, `DietaryFilterBar` (0069e29)
- Pantalla de gestión de direcciones con CRUD completo y validación (dd71526)
- Página de detalle de producto, skeleton loading, AddressCard (35ebdfd)
- Nav refinement: `BottomNavBar`, mejoras de interacción (70a2da1, 74072fd)
- Nuevas pantallas: `dietary-preferences.tsx`, `security.tsx`, `messages.tsx`, `support.tsx`, `all-products.tsx`, `profile-settings.tsx`
- Nuevos stores: `productFiltersStore`, `preferencesStore`, `recentlyViewedStore`

**Backend**:
- Fix: dietary tag filtering corregido (3080e41, 868b648)
- Fix: auth timing attack mitigation
- Tests: restauración de tests de dietary tags post-merge

### ✅ Post-Merge (28 Feb — commits tras 7949235)

- CI: Upgrade Python 3.14 → 3.13 en GitHub Actions + frontend Docker build validation (197cf80)
- Fix: Skip/limit params en fetchOrders para TS2554 (c92ab7e)
- Fix tests: alinear mocks de Alert, useRouter (88686f4, b9dd11c, b029752)

### ✅ Completado (Mar 1, 2026)

- ~~Webhooks de payment confirmation (Mercado Pago)~~ → ✅ **COMPLETADO** (HMAC-SHA256, idempotency, stock release)
- ~~Pydantic V2 migration~~ → ✅ **YA ESTABA MIGRADO** (0 warnings activos)
- ~~Docker + CI/CD~~ → ✅ **YA CONFIGURADO** (Dockerfiles, docker-compose, ci.yml, deploy.yml)
- Audit trail añadido → ✅ stock/order/payment (9 puntos AUDIT|)
- ~~Merge de rama `feat/refine-nav-and-ux` a master~~ → ✅ **COMPLETADO** (commit 7949235, Feb 28)

### 🟡 En Progreso (al Mar 1)

- E2E tests para checkout flow
- AWS RDS setup (staging environment)
- Integración Venti (portal de pagos alternativo)

### 📊 Métricas al Mar 1, 2026

- Backend Tests: **174 tests passing** ✅ (0 fallos)
- Backend Coverage: ~85% (objetivo 80% superado)
- Frontend Tests: **126 tests passing** (13 suites) ✅ (0 fallos)
- Payment Integration: **Completo** ✅ (Mercado Pago + webhooks HMAC-SHA256)
- Audit Trail: **Implementado** ✅ (9 log points — stock/order/payment)
- Docker + CI/CD: **Configurado** ✅ (Dockerfiles, docker-compose, ci.yml, deploy.yml)
- MVP Status: 90% → **~95%** ✅

---

> **💡 Nota**: Este roadmap es un documento vivo. Las prioridades pueden cambiar según feedback de usuarios, restricciones técnicas, o decisiones de negocio.
> 
> **📞 Contacto**: Para proponer cambios al roadmap, abrir un issue en GitHub con label `roadmap`.

---

**Última actualización**: Marzo 1, 2026
**Versión**: 1.3.0
