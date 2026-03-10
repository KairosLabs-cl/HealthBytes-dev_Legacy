# Interface System: HealthBytes

## Intent
HealthBytes is an e-commerce platform for people with dietary restrictions.
**Who is this human?** Someone who needs absolute certainty about their food choices. They might be managing a strict diet for health reasons.
**What must they accomplish?** Quickly identify safe foods, filter by stringent dietary needs, and check out with confidence.
**What should this feel like?** Organic, safe, clear, and reassuring. Not clinical, and definitely not generic dark/gray tech-dashboard.

## Domain Exploration
- **Concepts:** Nutrition, Care, Transparency, Safety, Organic.
- **Color World:** 
  - `--surface-warm`: Soft beige/off-white (`#FCFAF8`) instead of clinical white or default gray.
  - `--surface-card`: Slightly elevated warm surface (`#FFFFFF`).
  - `--text-ink`: Deep brown/charcoal (`#2D2926`) instead of generic black (`#111827`).
  - `--brand-green`: Accessible, organic sage/forest green (`#2E5C3A` or similar) replacing default vibrant blues/greens.
  - `--border-subtle`: Very faint warm border (`#EAE5E0`).
- **Signature Element:** The `DietaryFilterBar` — Tags are the core of discovery and safety. They must be tactile, visually distinct elements that feel satisfying to interact with, not just secondary gray chips.

## Depth Strategy
**Subtle Shadows (Soft Lift)**
We use subtle shadows to elevate cards and modals, making the interface feel approachable and tactile. This avoids harsh borders that can make a tool feel too technical or clinical. Cards will have a soft shadow paired with a very faint border to frame content gently.

## Touch & Platform Rules
- **Touch Targets:** Minimum 48px height for ALL interactive elements (Apple/Google accessibility baseline).
- **Forms:** Inputs must trigger context-aware keyboards (`email-address`, `numeric`) globally.
