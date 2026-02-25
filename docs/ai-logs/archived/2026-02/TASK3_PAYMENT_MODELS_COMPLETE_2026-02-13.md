# ARCHIVED - Task 3 Payment Models (Feb 13, 2026)

> Archived on Feb 23, 2026. Superseded by current payment integration docs.

# Task 3: Payment Models - COMPLETE ✅

**Date**: February 13, 2026  
**Time**: ~2 hours  
**Status**: ✅ Ready for payment provider integration

---

## 📋 Overview

Implemented complete payment data structure to support multiple payment providers (Venti, Mercado Pago, Stripe legacy). This is **Phase 1** of payment integration - database layer only, NO external API integrations yet.

---

## 🎯 Implementation Details

### 1. SQLAlchemy Model (`app/db/models/payment.py`)

**Features**:
- ✅ Multi-provider support (Venti, Mercado Pago, Stripe)
- ✅ Payment status lifecycle (PENDING → PROCESSING → COMPLETED/FAILED/REFUNDED)
- ✅ Currency support (CLP, USD)
- ✅ Provider payment ID tracking (for webhooks)
- ✅ Error message storage
- ✅ Timestamps (created_at, updated_at, completed_at)

**Enums**:
```python
PaymentProvider: VENTI, MERCADO_PAGO, STRIPE
PaymentStatus: PENDING, PROCESSING, COMPLETED, FAILED, REFUNDED, CANCELLED
PaymentCurrency: CLP, USD
```

**Key Fields**:
- `order_id` (FK to orders, CASCADE delete)
- `amount` (Numeric 10,2)
- `provider` (enum, indexed)
- `status` (enum, indexed)
- `provider_payment_id` (for webhook lookups, indexed)
- `provider_reference` (optional external reference)
- `error_message` (for failed payments)

---

### 2. Pydantic Schemas (`app/schemas/payment.py`)

**Request Schemas**:
- `PaymentCreate` - Create new payment with validation
- `PaymentUpdate` - Update status (webhooks, admin)
- `PaymentRefundRequest` - Request refund

**Response Schemas**:
- `PaymentResponse` - Full payment details
- `PaymentStatusCheckResponse` - Quick status check with retry flag
- `PaymentRefundResponse` - Refund confirmation

**Validation**:
- Amount max 2 decimal places
- All string fields have max lengths (prevent SQL injection)
- Required fields enforced

---

### 3. Payment Service (`app/services/payment_service.py`)

**Core Methods**:

#### Create & Retrieve
- `create_payment()` - Create payment in PENDING status
- `get_payment_by_id()` - Fetch by ID (with optional order eager load)
- `get_payments_by_order()` - Get all payments for order (retries)
- `get_payment_by_provider_id()` - Webhook lookup by provider ID

#### Status Updates
- `update_payment_status()` - Generic status update
- `mark_payment_completed()` - Complete payment with provider ID
- `mark_payment_failed()` - Fail payment with error message

#### Advanced Operations
- `refund_payment()` - Mark as refunded (validates COMPLETED status)
- `get_pending_payments()` - Find stale pending payments (for cleanup jobs)

**Business Rules**:
- Only COMPLETED payments can be refunded
- Status transitions validated
- All updates include timestamp refresh
- Atomic operations with commit/refresh

---

### 4. Database Migration (`migrations/create_payments_table.py`)

**Features**:
- ✅ Creates `payments` table with all constraints
- ✅ Foreign key to `orders` with CASCADE delete
- ✅ Indexes on: order_id, status, provider, provider_payment_id
- ✅ Column comments for documentation
- ✅ Default values (CLP currency, PENDING status)

**Run with**:
```bash
cd backend
python migrations/create_payments_table.py
```

---

### 5. Tests (`tests/test_services/test_payment_service.py`)

**Coverage**: 15 test cases

**Test Categories**:

✅ **CRUD Operations**
- `test_create_payment` - Basic creation
- `test_get_payment_by_id` - Retrieval
- `test_get_payment_by_id_with_order` - Eager loading
- `test_get_payments_by_order` - Multiple payments per order

✅ **Status Transitions**
- `test_update_payment_status` - Generic update
- `test_mark_payment_completed` - Completion flow
- `test_mark_payment_failed` - Failure handling

✅ **Provider Integration**
- `test_get_payment_by_provider_id` - Webhook lookup

✅ **Refunds**
- `test_refund_payment_success` - Valid refund
- `test_refund_payment_not_completed` - Validation error

✅ **Maintenance**
- `test_get_pending_payments` - Stale payment cleanup

**Run tests**:
```bash
pytest tests/test_services/test_payment_service.py -v --cov=app/services/payment_service
```

---

## 📂 Files Created/Modified

### Created Files (5)
1. `backend/app/db/models/payment.py` (~115 lines)
2. `backend/app/schemas/payment.py` (~100 lines)
3. `backend/app/services/payment_service.py` (~280 lines)
4. `Tools/backend/database/migrations/create_payments_table.py` (~80 lines)
5. `backend/tests/test_services/test_payment_service.py` (~200 lines)

### Modified Files (2)
1. `backend/app/db/models/__init__.py` - Exported Payment model + enums
2. `backend/tests/conftest.py` - Added fixtures: test_user, test_product, test_order, test_payment

**Total**: ~775 lines of production code + tests

---

## 🔄 Next Steps (Task 7: Venti Integration)

### Phase 2: Venti Provider Implementation

1. **Get Credentials**
   - Sandbox API keys
   - Production API keys
   - Webhook secret

2. **Create Venti Client** (`app/payment_providers/venti.py`)
   ```python
   class VentiClient:
       async def create_payment_intent(amount, currency, order_ref)
       async def get_payment_status(payment_id)
       async def create_refund(payment_id, amount)
   ```

3. **Webhook Handler** (`app/api/v1/webhooks/venti.py`)
   - Verify signature
   - Handle payment.completed
   - Handle payment.failed
   - Update Payment status via PaymentService

4. **API Endpoints** (`app/api/v1/payments.py`)
   - POST `/payments/venti/create` - Initiate payment
   - GET `/payments/{id}/status` - Check status
   - POST `/payments/{id}/refund` - Request refund

5. **Integration with Order Service**
   - Update `order_service.create_order()` to create Payment
   - Update order status based on payment status

6. **Testing**
   - Mock Venti API responses
   - Test webhook signature validation
   - Test error handling (timeout, insufficient funds, etc.)

---

## 🎉 Success Criteria

✅ Payment model supports multi-provider architecture  
✅ Status transitions properly validated  
✅ Webhook lookup via provider_payment_id works  
✅ Refund logic validates payment status  
✅ Migration creates table with proper indexes  
✅ Tests cover all CRUD operations  
✅ Tests cover edge cases (refund validation, stale payments)  

---

## 💡 Design Decisions

### Why separate Payment from Order?
- **Flexibility**: Support multiple payment attempts per order (retries)
- **Audit trail**: Complete payment history
- **Multi-provider**: Easy to add new providers without touching Order model
- **Refunds**: Track refunds independently

### Why store provider_payment_id separately?
- **Webhook lookups**: Fast query by provider ID
- **Idempotency**: Prevent duplicate payments
- **Debugging**: Easy to trace in provider dashboards

### Why PENDING status by default?
- **Safe**: Payment doesn't exist in provider yet
- **Async ready**: Handles async payment creation
- **Webhook driven**: Status updated when provider confirms

---

## 🔗 Related Documentation

- [P0 Action Plan (Archived)](../P0_ACTION_PLAN_2026-02-13.md) - Full roadmap
- [Backend Patterns](../../../.github/skills/healthbytes-backend-patterns.md) - Service layer guide
- [Security Practices](../../../.github/skills/healthbytes-security-practices.md) - Payment security

---

**Next Task**: Task 4 - Frontend Address Selection UI (depends on Task 1)  
**Next Backend Task**: Task 7 - Venti Payment Integration (depends on Task 3 ✅)
