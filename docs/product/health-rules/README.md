# Health Rules

This folder defines product recommendation criteria for the initial HealthBytes pilot conditions.

Conditions:

- `diabetes.md`
- `dyslipidemia.md`
- `hypertension.md`

Each condition doc must define:

- Required product data.
- Recommendation states.
- Forbidden claims.
- User-facing explanation rules.
- Data gaps that must show uncertainty.

Shared recommendation states:

- `recommended`: product fits current criteria from available data.
- `compatible`: no conflict detected, but not actively recommended.
- `review`: user should inspect details before deciding.
- `insufficient_data`: product data is incomplete.
- `excluded`: clear conflict with the user's declared criteria.

