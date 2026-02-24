# ARCHIVED - P0 Critical Plan (Feb 13, 2026)

> Archived on Feb 23, 2026. Superseded by current status docs in docs/ai-logs/status/.

# 🚨 P0 Critical - Plan de Acción Inmediato

> **Fecha inicio**: Febrero 13, 2026  
> **Target MVP**: Marzo 31, 2026  
> **Días disponibles**: 46 días

## 🎯 Objetivo
Completar los **bloqueadores críticos** para el MVP Launch en orden de dependencias.

---

## 📋 Secuencia de Implementación

### **Semana 1-2: Backend Foundation** (Feb 13-27)

#### 🔴 Task 1: Address CRUD (5 días) - **EMPEZAR HOY**
**Por qué primero**: Checkout depende de esto, frontend puede empezar después

**Subtareas**:
- [ ] Crear modelo `Address` en `backend/app/db/models/address.py`
- [ ] Crear schema Pydantic `AddressCreate`, `AddressUpdate`, `AddressResponse`
- [ ] Implementar service `address_service.py` con CRUD
- [ ] Crear endpoints en `backend/app/api/v1/addresses.py`
- [ ] Escribir tests para Address CRUD (coverage >80%)
- [ ] Agregar migration para tabla `addresses`

**Entregable**: 
```
POST   /api/v1/addresses
GET    /api/v1/addresses
GET    /api/v1/addresses/{id}
PUT    /api/v1/addresses/{id}
DELETE /api/v1/addresses/{id}
PATCH  /api/v1/addresses/{id}/set-default
```

**Owner**: Backend Dev  
**Bloqueador de**: Checkout UI, Payment flow

---

#### 🔴 Task 2: Stock Management (4 días)
**Por qué**: Prevenir overselling, validación de órdenes

**Subtareas**:
- [ ] Agregar `stock_quantity` a modelo `Product` (si no existe)
- [ ] Crear lógica de reserva de stock en `order_service.py`
- [ ] Implementar validación "low stock" (< 5 unidades)
- [ ] Agregar transacciones atómicas para stock updates
- [ ] Tests de race conditions (concurrent orders)
- [ ] Endpoint `/products/{id}/stock` para actualizar stock

**Casos críticos a testear**:
```python
# Caso 1: Orden cuando stock = 0
# Caso 2: Dos órdenes simultáneas por el mismo producto
# Caso 3: Cancelar orden → restaurar stock
```

**Owner**: Backend Dev  
**Bloqueador de**: Order creation, Payment processing

---

#### 🔴 Task 3: Payment Models Preparation (3 días)
**Por qué**: Estructura de datos para integraciones Venti/MP

**Subtareas**:
- [ ] Crear modelo `Payment` en `backend/app/db/models/payment.py`
  - `id, order_id, amount, currency, status, provider, provider_reference, created_at`
- [ ] Crear enums `PaymentProvider` (VENTI, MERCADO_PAGO)
- [ ] Crear enums `PaymentStatus` (PENDING, COMPLETED, FAILED, REFUNDED)
- [ ] Schema Pydantic `PaymentCreate`, `PaymentResponse`
- [ ] Service básico `payment_service.py` (solo DB operations por ahora)
- [ ] Migration para tabla `payments`

**Nota**: NO implementar integración externa aún, solo estructura

**Owner**: Backend Dev  
**Bloqueador de**: Payment Integration (Task 7)

---

### **Semana 2-3: Frontend Core** (Feb 20 - Mar 6)

#### 🔴 Task 4: Address Selection UI (3 días)
**Depende de**: Task 1 (Address API)

**Subtareas**:
- [ ] Crear API client en `frontend/api/addresses.ts`
- [ ] Crear Zustand store `addressStore.ts`
- [ ] Componente `AddressCard.tsx` (mostrar dirección)
- [ ] Screen `frontend/app/addresses.tsx` (lista de direcciones)
- [ ] Modal/Screen `AddNewAddress.tsx` (formulario)
- [ ] Botón "Set as default" en AddressCard
- [ ] Validación de formulario (street, city, postal_code)

**UI Flow**:
```
Profile → Addresses → [Lista de address cards]
                    → [+ Agregar dirección]
                    → [Editar] [Eliminar] [Default]
```

**Owner**: Frontend Dev  
**Bloqueador de**: Checkout Flow

---

#### 🔴 Task 5: Checkout Flow Complete (1 semana)
**Depende de**: Task 1 (Address API), Task 4 (Address UI)

**Subtareas**:
- [ ] Screen `frontend/app/checkout-v2.tsx` (reemplazar actual)
- [ ] Step 1: Selección de dirección (usar addressStore)
- [ ] Step 2: Método de pago (placeholder por ahora)
- [ ] Step 3: Resumen de orden (con address + items)
- [ ] Integración con `cartStore` para crear orden
- [ ] Loading states + error handling
- [ ] Navegación a Order Success screen

**Flujo**:
```
Cart → Checkout
       ├─ Select Address (o agregar nueva)
       ├─ Select Payment Method (mock por ahora)
       ├─ Order Summary
       └─ [Confirmar Orden] → Success Screen
```

**Owner**: Frontend Dev  
**Bloqueador de**: Payment UI (Task 8)

---

### **Semana 3-4: Payments & DevOps** (Mar 6-20)

#### 🟠 Task 6: Order Confirmation Email (2 días)
**Subtareas**:
- [ ] Configurar SendGrid/Mailgun API
- [ ] Crear template HTML de email de confirmación
- [ ] Service `email_service.py` con método `send_order_confirmation()`
- [ ] Llamar en `order_service.create_order()` después de pago exitoso
- [ ] Tests con mock SMTP

**Owner**: Backend Dev

---

#### 🔴 Task 7: Payment Integration - Venti (1.5 semanas)
**Depende de**: Task 3 (Payment Models), credenciales Venti API

**Subtareas**:
- [ ] Obtener credenciales Venti (Sandbox + Prod)
- [ ] Crear `payment_providers/venti.py` con cliente HTTP
- [ ] Implementar `create_payment_intent(amount, currency)`
- [ ] Implementar webhook handler en `/api/v1/webhooks/venti`
- [ ] Actualizar `payment_service.py` con lógica Venti
- [ ] Tests con mock de Venti API
- [ ] Documentar flujo en `docs/features/payment-venti.md`

**Owner**: Backend Dev  
**Bloqueador de**: Production launch

---

#### 🔴 Task 8: Payment Integration - Mercado Pago (1 semana)
**Depende de**: Task 7 (Venti completado)

**Subtareas**:
- [ ] Obtener credenciales MP Chile (Sandbox + Prod)
- [ ] Crear `payment_providers/mercadopago.py`
- [ ] Implementar SDK de MP o HTTP client
- [ ] Webhook handler en `/api/v1/webhooks/mercadopago`
- [ ] Actualizar frontend para soportar ambos providers
- [ ] Tests con mock de MP API

**Owner**: Backend Dev

---

#### 🔴 Task 9: Frontend Payment UI (3 días)
**Depende de**: Task 7 (Venti), Task 5 (Checkout)

**Subtareas**:
- [ ] Crear `PaymentMethodSelector.tsx` component
- [ ] Radio buttons: Venti / Mercado Pago
- [ ] Integrar con checkout flow (Step 2)
- [ ] Mostrar loading durante payment processing
- [ ] Error handling (payment failed, timeout)
- [ ] Success state con confirmación visual

**Owner**: Frontend Dev

---

#### 🔴 Task 10: Docker Configuration (2 días)
**Subtareas**:
- [ ] `backend/Dockerfile` para FastAPI
- [ ] `frontend/Dockerfile` para Expo (si es necesario)
- [ ] `docker-compose.yml` actualizado:
  - PostgreSQL service
  - Backend service
  - Frontend service (or just dev mode)
  - Redis service (para cache, future)
- [ ] `.dockerignore` files
- [ ] README de Docker en `docs/setup/docker-setup.md`
- [ ] Testing local con `docker-compose up`

**Owner**: DevOps

---

#### 🔴 Task 11: CI/CD Pipeline (1 semana)
**Subtareas**:
- [ ] `.github/workflows/backend-tests.yml`
  - Run pytest on PR
  - Check coverage >80%
- [ ] `.github/workflows/frontend-tests.yml`
  - Run jest tests
- [ ] `.github/workflows/deploy-staging.yml`
  - Deploy to staging on merge to `develop`
- [ ] `.github/workflows/deploy-prod.yml`
  - Deploy to prod on merge to `main`
- [ ] Setup GitHub secrets (API keys, DB URLs)

**Owner**: DevOps

---

### **Semana 4+: Testing & Polish** (Mar 20-31)

#### 🟡 Task 12: E2E Testing (3 días)
**Subtareas**:
- [ ] Setup Detox or Appium for React Native
- [ ] E2E test: Full checkout flow (address → payment → success)
- [ ] E2E test: Add product to cart → checkout
- [ ] E2E test: Payment failure handling
- [ ] Integrar en CI/CD

**Owner**: QA

---

#### 🟡 Task 13: MVP Bug Bash (1 semana)
**Subtareas**:
- [ ] Manual testing de todos los flujos
- [ ] Fix bugs críticos encontrados
- [ ] Performance testing (load time, API response)
- [ ] Cross-device testing (iOS + Android)
- [ ] Final security audit

**Owner**: Todos

---

## 🚧 Bloqueadores Externos

| Dependencia | Owner | Fecha límite | Status |
|-------------|-------|--------------|--------|
| **Venti API Credentials** | Product/Business | Feb 20 | ⚠️ Pendiente |
| **Mercado Pago Credentials (Chile)** | Product/Business | Feb 27 | ⚠️ Pendiente |
| **SendGrid API Key** | DevOps | Feb 20 | ⚠️ Pendiente |
| **AWS Account Setup** | DevOps | Mar 1 | ⚠️ Pendiente |
| **Domain & SSL Certificate** | DevOps | Mar 15 | ⚠️ Pendiente |

**⚠️ ACCIÓN REQUERIDA**: Contactar stakeholders para obtener credenciales ASAP

---

## 📊 Progress Tracking

### Semana 1 (Feb 13-19)
- [ ] Task 1: Address CRUD (Backend)
- [ ] Task 2: Stock Management (Backend)
- [ ] Task 3: Payment Models (Backend)

### Semana 2 (Feb 20-26)
- [ ] Task 4: Address UI (Frontend)
- [ ] Task 5: Checkout Flow (Frontend) - START

### Semana 3 (Feb 27 - Mar 5)
- [ ] Task 5: Checkout Flow (Frontend) - COMPLETE
- [ ] Task 6: Order Emails (Backend)
- [ ] Task 7: Venti Integration (Backend) - START

### Semana 4 (Mar 6-12)
- [ ] Task 7: Venti Integration (Backend) - COMPLETE
- [ ] Task 8: Mercado Pago (Backend)
- [ ] Task 10: Docker (DevOps)

### Semana 5 (Mar 13-19)
- [ ] Task 9: Payment UI (Frontend)
- [ ] Task 11: CI/CD (DevOps)

### Semana 6 (Mar 20-26)
- [ ] Task 12: E2E Testing
- [ ] Task 13: Bug Bash - START

### Semana 7 (Mar 27-31)
- [ ] Task 13: Bug Bash - COMPLETE
- [ ] 🚀 MVP FREEZE
- [ ] 🎉 MVP LAUNCH (April 1)

---

## 🎯 Success Criteria (MVP Launch)

| Criterio | Target | Método de Validación |
|----------|--------|----------------------|
| ✅ User puede registrarse | 100% | Manual test |
| ✅ User puede agregar direcciones | 100% | Manual test |
| ✅ User puede agregar productos al carrito | 100% | Manual test |
| ✅ User puede completar checkout con Venti | >95% success rate | Sandbox testing |
| ✅ User puede completar checkout con Mercado Pago | >95% success rate | Sandbox testing |
| ✅ User recibe email de confirmación | 100% | SMTP logs |
| ✅ Stock se actualiza correctamente | 100% | Unit tests |
| ✅ Backend tests coverage | >80% | pytest --cov |
| ✅ API response time (p95) | <500ms | Load testing |
| ✅ Zero critical bugs | 0 | Bug tracker |

---

## 🔥 Quick Start - HOY

### Para Backend Dev:
```bash
cd backend

# 1. Crear rama
git checkout -b feat/address-crud-api

# 2. Crear archivos
# - app/db/models/address.py
# - app/schemas/address.py
# - app/services/address_service.py
# - app/api/v1/addresses.py
# - tests/test_api/test_addresses.py

# 3. Implementar (ver skeleton code abajo)
```

### Para Frontend Dev:
**ESPERAR** hasta que Task 1 (Address API) esté completo.
Mientras tanto:
- Revisar diseño de UI de direcciones
- Preparar componentes base
- Refactorizar checkout actual

### Para DevOps:
- Empezar con Docker local setup
- Preparar GitHub Actions workflows

---

## 📝 Notas Importantes

1. **Task 1 (Address CRUD) es el BOTTLENECK** - toda la cadena depende de esto
2. **Payment integration es SLOWEST** - empezar credenciales process YA
3. **Testing es NO NEGOCIABLE** - coverage >80% antes de merge
4. **Docker debe estar listo para Mar 1** - facilita staging deployment

---

## 🆘 Escalación

**Si hay bloqueadores**:
1. Avisar en daily standup
2. Documentar en GitHub Issues con label `P0-blocker`
3. Escalar a Product Owner si es dependency externa

---

**Última actualización**: Feb 13, 2026  
**Próxima revisión**: Feb 20, 2026 (fin de Semana 1)
````
