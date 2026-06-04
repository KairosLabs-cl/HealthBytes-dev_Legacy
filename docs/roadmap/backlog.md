# Backlog

Backlog source for post-MVP and future work.

Backlog items should include problem, user or business impact, owner, priority, and evidence needed before implementation.

## Categories

- Product trust and health criteria.
- Catalog and product data.
- Discovery and search.
- Commerce.
- Infrastructure and deployment.
- QA and accessibility.
- AI and future recommendations.

## P2 - Post-Launch

| Area | Item | Evidence needed |
| --- | --- | --- |
| Discovery | Autocomplete search suggestions | Validate backend query shape and frontend dropdown UX. |
| Media | Image CDN | Measure current image load pain and choose CDN or storage path. |
| Offline | Basic catalog cache | Define stale-while-revalidate behavior and invalidation rules. |
| Performance | Catalog performance audit | Profile list rendering, memoization, and bundle size. |
| Discovery | Advanced filters | Confirm user demand for price, rating, novelty, and multi-category filters. |
| Health profile | Expanded profile and minuta upload | Define privacy, consent, storage, and non-medical claim boundaries. |

## P3 - Product Vision

| Area | Item | Boundary |
| --- | --- | --- |
| AI | Nutrition assistant | Requires reviewed product data, retrieval strategy, and safety copy. |
| AI | Mini weekly plans | Not medical advice; needs explicit uncertainty and user responsibility language. |
| B2B | Minimarket back-office | Long-term inventory digitization path, not active MVP scope. |
| Computer vision | "Can I eat this?" product scan | Exploration only; no implementation date. |
| Expansion | Regional rollout | Needs localization, currency, provider, and compliance review. |

## Staging Options

| Option | Use when | Main caution |
| --- | --- | --- |
| AWS ECS | Production control matters more than setup speed. | Manual ECR, ECS, SSM, IAM, and baseline monthly cost. |
| Railway | Fast MVP staging matters most. | Less network control and platform lock-in. |
| Render | Simple web-service staging is enough. | Free tier cold starts and lower performance. |
| Fly.io | Regional container placement matters. | CLI-first operations and managed Postgres tradeoffs. |

Current recommendation: use Railway or Render for immediate staging unless AWS control is needed now. Keep AWS ECS path available for production scale.
