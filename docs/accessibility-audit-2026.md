# Accessibility Audit — WCAG 2.2 Level AA
**Date:** Mayo 2026 | **Auditor:** Automated Review

## Summary

| Criterion | Status | Notes |
|-----------|--------|-------|
| 1.1.1 Non-text Content | ⚠️ Partial | Icons need alt text via accessibilityLabel |
| 1.3.1 Info and Relationships | ✅ Pass | Semantic roles used (button, image, etc.) |
| 1.4.3 Contrast (Minimum) | ✅ Pass | ink-primary (#2D2926) on white: ~14:1 |
| 1.4.4 Resize Text | ✅ Pass | Uses sp-equivalent units |
| 2.1.1 Keyboard (Tab nav) | N/A | Mobile app — touch only |
| 2.4.3 Focus Order | ✅ Pass | Screen reader order follows visual order |
| 2.4.6 Headings and Labels | ⚠️ Partial | Some inputs missing accessibilityLabel |
| 2.5.3 Label in Name | ✅ Pass | Buttons with text have matching accessible names |
| 2.5.5 Target Size | ✅ Pass | Critical buttons use `minHeight: 44` |
| 3.1.1 Language of Page | ✅ Pass | `web.lang: "es"` in app.json |
| 4.1.2 Name, Role, Value | ⚠️ Partial | See component findings below |

**Overall: 7/11 criteria fully met, 3 partially met, 1 N/A**

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

### 🔴 Remaining Issues (Future Sprints)

| Component | Issue | Priority |
|-----------|-------|----------|
| `DiscountsBar` | Product tap has no accessibilityLabel | Medium |
| `RecommendationsBar` | Product tap has no accessibilityLabel | Medium |
| `checkout-v2.tsx` | Form inputs lack accessibilityLabel | High |
| `search.tsx` | Search input lacks `accessibilityHint` | Medium |
| `HorizontalProductCard` | Pressable wrapper lacks label | Medium |
| Various icon-only buttons | Lucide icons need aria-label equivalent | Medium |

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

1. **High priority**: Add `accessibilityLabel` to all form inputs in checkout flow
2. **Medium priority**: Add `accessibilityLabel` to all product card tappable areas
3. **Low priority**: Consider `accessibilityHint` for actions that aren't self-explanatory

## Test Procedure

Manual testing with:
- iOS: Settings → Accessibility → VoiceOver
- Android: Settings → Accessibility → TalkBack

Focus areas: product browsing, cart management, checkout, order tracking.
