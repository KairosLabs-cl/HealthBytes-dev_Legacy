# 🗺️ HealthBytes - Roadmap Completo 2026

> **📅 Última actualización**: Febrero 16, 2026  
> **🎯 Estado del Proyecto**: MVP en Estadio Final - Payment Integration Activo  
> **🚀 Versión Target**: v1.0.0 (Marzo-Abril 2026)

---

## 📊 Resumen Ejecutivo

**HealthBytes** es una plataforma mobile-first de e-commerce para personas con restricciones alimentarias. Este roadmap consolida el estado actual y define las prioridades de desarrollo para los próximos 6 meses.

### 🎯 Objetivos Claves 2026

| Objetivo | Target | Status |
|----------|--------|--------|
| 🚢 **MVP Launch** | Marzo-Abril 2026 | 🟠 En progreso (80% completo) |
| 👥 **Beta Users** | 100 usuarios | 🟡 Próximo sprint |
| 💳 **Payment Live** | Marzo 2026 | 🟡 Integración Mercado Pago 80% |
| 🐳 **Dockerized** | Marzo 2026 | 🟡 Docker paths corregidas |
| 📱 **App Store** | Mayo 2026 | 📋 Planeado |

---

## ✅ Estado Actual - Features Implementadas

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
| **Payment Integration** | 🟡 En progreso | 60% | Mercado Pago + screens |

### Frontend (React Native + Expo)

| Feature | Estado | Evidencia |
|---------|--------|-----------|
| **Bottom Navigation** | ✅ Completo | 3 tabs (Home, Cart, Profile) |
| **Product Listing** | ✅ Completo | Grid con infinite scroll |
| **Product Detail** | ✅ Completo | Nutritional info + badges |
| **Search** | ✅ Completo | Full-text con filtros |
| **Dietary Filter Chips** | ✅ Completo | Filtros interactivos |
| **Wishlist/Favorites** | ✅ Completo | Corazones + backend sync |
| **Cart Management** | ✅ Completo | Add/Remove/Update qty |
| **Orders List** | ✅ Completo | Estado con timeline + filtros |
| **Authentication** | ✅ Completo | Clerk OAuth |
| **Recently Viewed** | ✅ Completo | AsyncStorage + horizontal scroll |
| **Stock Badges** | ✅ Completo | "Agotado", "Últimas unidades" |
| **Skeleton Loaders** | ✅ Completo | Shimmer effect |
| **Empty States** | ✅ Completo | Ilustraciones amigables |
| **Address Management** | ✅ Completo | AddressCard + addressStore |
| **Payment Methods** | ✅ Completo | PaymentMethodSelector |
| **Step Indicator** | ✅ Completo | Checkout steps visualization |
| **Payment Screens** | ✅ Completo | Success, failure, pending screens |

### Infraestructura

| Componente | Estado | Detalle |
|------------|--------|---------|
| **Database** | ✅ PostgreSQL 14+ + Supabase | Migraciones manuales |
| **API** | ✅ FastAPI 0.104+ | Async SQLAlchemy 2.x |
| **Testing** | 🟡 Mejorado | Backend 85%, Frontend 67+ tests |
| **CI/CD** | 🟡 En progreso | GitHub Actions workflow básico |
| **Docker** | 🟡 En revisión | Frontend paths corregidas |
| **Deploy** | ❌ Pendiente | AWS target |

---

## 🔴 P0: Crítico para MVP (Febrero-Marzo 2026)

### 🎯 Milestone: MVP Launch-Ready

**Deadline**: Marzo 31, 2026  
**Bloqueador**: Estas funcionalidades son esenciales para lanzar

#### Backend P0

| Feature | Estimación | Dependencias | Owner |
|---------|-----------|--------------|-------|
| **Payment Integration (Mercado Pago)** | 3-4 días | ✅ 80% completado | Backend |
| **Webhooks Payment Confirmation** | 2 días | En progreso | Backend |
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
| **E2E Checkout Tests** | 🟡 En progreso | Happy path + errores | QA |

**Total Testing P0**: ~2 semanas

#### DevOps P0

| Task | Estimación | Objetivo | Owner |
|------|-----------|----------|-------|
| **Docker Configuration** | 🟡 En revisión | Frontend paths corregidas | DevOps |
| **CI/CD Pipeline** | 🟡 En progreso | GitHub Actions workflow | DevOps |

**Total DevOps P0**: ~3 días

---

## 🟠 P1: Alta Prioridad Post-MVP (Abril 2026)

### 🎯 Milestone: User Engagement & Retention

**Deadline**: Abril 30, 2026  
**Objetivo**: Mejorar experiencia de usuario y aumentar conversión

#### Features P1

| Feature | Estimación | Impacto | Owner |
|---------|-----------|---------|-------|
| **Onboarding Dietary Preferences** | 3 días | 🔥 Alto - Pre-filtrar correctamente | Frontend + Backend |
| **Push Notifications (Orders)** | 1.5 semanas | 🔥 Alto - Engagement | Backend + Frontend |
| **Product Recommendations** | 1 semana | 🔥 Alto - Aumenta ventas | Backend |
| **Order History Enhanced** | 3 días | 🔥 Alto - Re-compra fácil | Frontend |
| **Reviews & Ratings (Basic)** | 1 semana | ✨ Medio - Social proof | Backend + Frontend |
| **Filter Persistence** | 1 día | ✨ Medio - UX | Frontend |
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
| **Logging estructurado (JSON)** | ✨ Media | 2 días | Debugging + monitoring |
| **API Rate Limiting** | 🔥 Alta | 2 días | Protección DDoS |
| **API Versioning Strategy** | ✨ Media | 1 día | v1 → v2 plan |
| **Deprecate JWT Fallback** | 🔵 Baja | 1 día | Solo Clerk en prod |

### Frontend Tech Debt

| Tarea | Prioridad | Estimación | Impacto |
|-------|-----------|-----------|---------|
| **Jest Test Coverage 60%+** | 🔥 Alta | 1.5 semanas | Confidence en deploys |
| **Component Documentation (Storybook)** | ✨ Media | 1 semana | Acelera desarrollo |
| **Error Boundary Implementation** | 🔥 Alta | 2 días | UX en errores inesperados |
| **Analytics Integration** | 🔥 Alta | 3 días | Mixpanel/Amplitude |
| **Type Safety Improvements** | ✨ Media | 3 días | Strict TypeScript |

### DevOps Tech Debt

| Tarea | Prioridad | Estimación | Impacto |
|-------|-----------|-----------|---------|
| **CI/CD Pipeline** | 🔥 Alta | 1 semana | GitHub Actions |
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
├─ Semana 4-5 (17-23): Finalizar P0, Docker fixes, CI/CD
└─ Semana 5 (24+): Email integration (Resend ✅), webhooks payment

Marzo 2026
├─ Semana 1-2: P0 Backend completion + E2E tests
├─ Semana 3: DevOps P0 (Docker, CI/CD finales, AWS setup)
├─ Semana 4: MVP Freeze + Bug fixes + UAT
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
🟡 Payment Integration (Mercado Pago 80%)
    ↓
🟡 Order Confirmation (Webhooks + Emails)
    ↓
🟢 E2E Testing + UAT
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

**Próxima revisión**: Febrero 20, 2026

---

## 📋 Cambios Recientes (10-16 feb 2026)

### ✅ Completado Esta Semana

**Frontend**:
- Payment status polling en pending screen
- Payment screens (success, failure, pending) con navegación
- Address management (AddressCard + addressStore Zustand)
- Payment method selector + Step indicator
- 67+ nuevos tests (Zustand stores, API clients, Jest setup)
- Refactor: eliminación de `any` types, debug logs gateados con `__DEV__`
- CI/CD: Frontend tests job, coverage threshold aumentado

**Backend**:
- Integración Mercado Pago conectada a frontend (80% completo)
- Router y schema tests comprehensivos (85% coverage)
- Email transaccional con Resend integrado
- Docker paths corregidas

### 🟡 En Progreso

- Webhooks de payment confirmation (Mercado Pago)
- E2E tests para checkout flow
- AWS deployment setup

### 📊 Métricas Actualizado

- Backend Coverage: 70% → **85%** ✅
- Frontend Tests: 0 → **67+** tests ✅
- Payment Integration: 0% → **80%** 🟡
- MVP Status: 70% → **80%** ✅

---

> **💡 Nota**: Este roadmap es un documento vivo. Las prioridades pueden cambiar según feedback de usuarios, restricciones técnicas, o decisiones de negocio.
> 
> **📞 Contacto**: Para proponer cambios al roadmap, abrir un issue en GitHub con label `roadmap`.

---

**Última actualización**: Febrero 16, 2026  
**Versión**: 1.1.0
