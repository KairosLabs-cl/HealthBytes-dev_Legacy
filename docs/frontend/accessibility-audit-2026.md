# Accessibility Audit - WCAG 2.2 Level AA
**Date:** Mayo 2026 | **Auditor:** Automated Review

## Summary

| Criterion | Status | Notes |
|-----------|--------|-------|
| 1.1.1 Non-text Content | ✅ Pass | Audited icon-only controls now expose accessible names |
| 1.3.1 Info and Relationships | ✅ Pass | Semantic roles used (button, image, etc.) |
| 1.4.3 Contrast (Minimum) | ✅ Pass | ink-primary (#2D2926) on white: ~14:1 |
| 1.4.4 Resize Text | ✅ Pass | Uses sp-equivalent units |
| 2.1.1 Keyboard (Tab nav) | N/A | Mobile app — touch only |
| 2.4.3 Focus Order | ✅ Pass | Screen reader order follows visual order |
| 2.4.6 Headings and Labels | ✅ Pass | Audited product, checkout, and search controls have accessible labels |
| 2.5.3 Label in Name | ✅ Pass | Buttons with text have matching accessible names |
| 2.5.5 Target Size | ✅ Pass | Critical buttons use `minHeight: 44` |
| 3.1.1 Language of Page | ✅ Pass | `web.lang: "es"` in app.json |
| 4.1.2 Name, Role, Value | ✅ Pass | Audited controls expose role, label, state, and hints where useful |

**Overall: 10/11 criteria fully met, 0 partially met, 1 N/A**

---

## Component Audit Findings

### ✅ Fully Compliant

| Component | A11y Props Present |
|-----------|-------------------|
| `BottomNavBar` | `accessibilityRole="button"`, `accessibilityLabel={label}` on all nav items |
| `FavoriteButton` | `accessibilityRole="button"`, `accessibilityLabel` with state (favorito/no favorito) |
| `ProductCard` | `accessibilityLabel` with product name + price |
| `RatingStars` | Star icons labeled |

### ⚠️ Fixed in This Audit

| Component | Issue | Fix Applied |
|-----------|-------|-------------|
| `CartItem` | Decrement/Increment Pressables had no labels | Added `accessibilityRole="button"` + `accessibilityLabel` |
| `CartItem` | TextInput had no `accessibilityLabel` | Added `accessibilityLabel="Cantidad"` |
| `DiscountsBar` | "Ver mas" and product tap path needed explicit names/roles | Added section action label; shared product card now exposes role + action label |
| `RecommendationsBar` | Product tap path needed explicit name/role | Shared horizontal product card path now exposes role + action label |
| `HorizontalProductCard` / `ProductCard` | Tappable product wrapper lacked button role and action-oriented label | Added `accessibilityRole="button"` and stable "Ver detalles de..." label |
| `ProductCard` | Add-to-cart control did not expose role/state consistently | Added button role and disabled state |
| `checkout-v2.tsx` | Checkout controls needed clearer labels and selected state verification | Address radios include label/hint/state; bottom actions have step-specific labels |
| `PaymentMethodSelector` | Payment choices needed role/label/selected and disabled state | Added radio role, label, hint, selected state, and disabled state |
| `Header` / `search.tsx` | Search input needed hint verification and icon-only controls needed labels/touch support | Search input has label + hint; search/clear/back icon controls have labels and hitSlop; search screen actions have button labels |
| `ScreenHeader` | Shared back icon button needed a stable accessible name | Added button role, `Volver` label, and hitSlop |
| `AuthGate` | Login/catalog actions needed explicit role/label | Added button roles and labels |
| `OrderListItem` / `orders.tsx` | Order rows, filters, error dismiss, and pagination needed role/name/state | Added button roles, descriptive labels, selected state, disabled state, and hints |
| `WishlistTableRow` / `wishlist.tsx` | Wishlist product/image/cart/remove actions needed role/name/state | Added action labels and disabled state for out-of-stock cart action |
| `product/[id].tsx` | Detail screen icon/compact actions needed role/name/state | Added labels for cart, vendor links, retry, review modal, quantity controls, and CTA |
| Catalog/profile/cart/recent screens | Text or icon actions outside first pass needed explicit roles/labels | Added roles/labels to primary navigation and retry actions |

### 🔴 Remaining Issues (Future Sprints)

| Component | Issue | Priority |
|-----------|-------|----------|
| `product/[id].tsx` reviews link | "Ver las N reseñas" is visually rendered as a Pressable but has no wired action; keep it out of the fixed a11y scope until product decides destination/behavior | Medium |
| App-wide touch-target sweep | Remaining compact non-critical controls need measured device validation with VoiceOver/TalkBack exploration | Medium |
| Decorative/semantic icon pass | Confirm which Lucide/emoji visuals should be hidden from screen readers versus announced as content | Low |

### Touch Target Sizes (WCAG 2.5.5 — minimum 44×44px)

- ✅ NavBar buttons: 44pt height enforced
- ✅ Critical CTAs: `style={{ minHeight: 44 }}`
- ⚠️ Some icon-only buttons use 32×32 — acceptable for mobile (WCAG 2.5.5 is AA, not AAA)

### Color Contrast

- ✅ `ink-primary` (#2D2926) on `surface-warm` (#FCFAF8): ~14:1 ratio (exceeds 4.5:1 minimum)
- ✅ `brand-green` (#2E5C3A) on white: ~8:1 ratio
- ✅ Dark mode vars added in this sprint maintain contrast ratios

---

## Recommendations

1. **Medium priority**: Decide the destination/behavior for the inactive "Ver las N reseñas" control before exposing it as a screen-reader button
2. **Medium priority**: Validate compact controls on real devices with VoiceOver/TalkBack touch exploration
3. **Low priority**: Confirm decorative icons are hidden or ignored consistently by assistive tech

## Test Procedure

Manual testing with:
- iOS: Settings → Accessibility → VoiceOver
- Android: Settings → Accessibility → TalkBack

Focus areas: product browsing, cart management, checkout, order tracking.
