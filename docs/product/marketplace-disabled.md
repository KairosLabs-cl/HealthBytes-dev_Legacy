# Marketplace Disabled

Marketplace checkout, payments, and order creation are temporarily disabled while
HealthBytes validates store discovery for healthy-food products.

Current frontend behavior:

- Cart purchase actions show "Encuentra dónde comprar" instead of payment copy.
- Store-discovery actions route users toward product store availability.
- Checkout does not create orders, create Mercado Pago preferences, or open payment URLs while `MARKETPLACE_ENABLED` is `false`.

Reactivation requirements:

- Backend marketplace flag enabled and order/payment endpoints verified.
- Frontend `FEATURES.MARKETPLACE_ENABLED` set to `true`.
- Store-discovery copy reviewed so users can distinguish checkout from physical-store availability.
