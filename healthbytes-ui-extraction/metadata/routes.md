# Routes Inventory

| Route | Source File | Captured | Discovered From | Notes |
|-------|-------------|----------|-----------------|-------|
| `/` | `frontend/app/index.tsx` | Yes | Code | Public Home |
| `/login` | `frontend/app/(auth)/login.tsx` | Yes | Code | Auth flow |
| `/addresses` | `frontend/app/addresses.tsx` | Yes | Code | Requires auth/mock |
| `/all-products` | `frontend/app/all-products.tsx` | Yes | Code | Public |
| `/cart` | `frontend/app/cart.tsx` | Yes | Code | Public / Local state |
| `/checkout-v2` | `frontend/app/checkout-v2.tsx` | Yes | Code | Requires auth/cart |
| `/dietary-preferences` | `frontend/app/dietary-preferences.tsx` | Yes | Code | Requires auth/mock |
| `/messages` | `frontend/app/messages.tsx` | Yes | Code | Requires auth/mock |
| `/recently-viewed` | `frontend/app/recently-viewed.tsx` | Yes | Code | Local state |
| `/search` | `frontend/app/search.tsx` | Yes | Code | Public |
| `/security` | `frontend/app/security.tsx` | Yes | Code | Requires auth |
| `/support` | `frontend/app/support.tsx` | Yes | Code | Public/Auth |
| `/wishlist` | `frontend/app/wishlist.tsx` | Yes | Code | Requires auth/mock |
| `/profile` | `frontend/app/profile.tsx` | Yes | Code | Requires auth |
| `/profile-settings` | `frontend/app/profile-settings.tsx` | Yes | Code | Requires auth |
| `/orders` | `frontend/app/orders.tsx` | Yes | Code | Requires auth |
| `/orders/1` | `frontend/app/orders/[id].tsx` | Yes | Code | Requires auth |
| `/payment/failure` | `frontend/app/payment/failure.tsx` | Yes | Code | Checkout flow |
| `/payment/pending` | `frontend/app/payment/pending.tsx` | Yes | Code | Checkout flow |
| `/payment/success` | `frontend/app/payment/success.tsx` | Yes | Code | Checkout flow |
| `/product/1` | `frontend/app/product/[id].tsx` | Yes | Code | Public |
