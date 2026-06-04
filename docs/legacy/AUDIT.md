# Legacy Documentation Audit

Status: initial classification after the documentation reboot structure was created.

Classification keys:

- `keep`: useful as-is, can be moved back or linked after path update.
- `rewrite`: useful content, but too long, stale, or mixed with other concerns.
- `merge`: extract useful parts into a new source-of-truth doc.
- `reference`: historical evidence only.
- `delete_later`: safe to remove only after migration review and approval.

## High-Level Folders

| Legacy path | Classification | Target | Notes |
| --- | --- | --- | --- |
| `docs/legacy/architecture/` | `merge` | `docs/development/architecture/` | Contains useful stack, structure, integrations, testing, and security notes, but current docs are too broad and sometimes stale. |
| `docs/legacy/backend/` | `rewrite` | `docs/development/architecture/backend.md`, `docs/ai/agents/backend-context.md` | Backend docs mix setup, API catalog, AI rules, troubleshooting, and repeated sections. |
| `docs/legacy/frontend/` | `rewrite` | `docs/development/architecture/frontend.md`, `docs/ai/agents/frontend-context.md` | Frontend docs mix setup, UI rules, AI rules, tests, and accessibility audit. |
| `docs/legacy/development/` | `merge` | `docs/development/`, `docs/operations/`, `docs/roadmap/` | Development status, testing, setup, QA, and inspections must be split by purpose. |
| `docs/legacy/ia-tools/` | `merge` | `docs/ai/prompts/`, `docs/ai/agents/` | Prompt and role material should become AI docs or remain in `.agents/`. |
| `docs/legacy/product/` | `merge` | `docs/product/`, `docs/executive/` | Feature docs, reports, old phases, and prototypes need separate treatment. |
| `docs/legacy/scripts/` | `reference` | `docs/executive/` or `tools/` after review | Weekly report export script needs review before reuse. |

## File-Level Matrix

| Legacy file | Classification | Target | Reason |
| --- | --- | --- | --- |
| `docs-README.md` | `reference` | `docs/README.md` | Old index; keep only until new links are stable. |
| `weekly-report-template.md` | `rewrite` | `docs/executive/weekly-report-template.md` | Old template is too long for a 30-minute meeting. |
| `architecture/README.md` | `merge` | `docs/development/architecture/README.md` | Useful navigation and decisions, but stale paths. |
| `architecture/architecture.md` | `merge` | `docs/development/architecture/system-overview.md` | Extract current system overview only. |
| `architecture/STACK.md` | `merge` | `docs/development/architecture/system-overview.md` | Extract actual stack and versions. |
| `architecture/STRUCTURE.md` | `merge` | `docs/development/architecture/backend.md`, `docs/development/architecture/frontend.md` | Split by implementation area. |
| `architecture/INTEGRATIONS.md` | `merge` | `docs/development/architecture/infrastructure.md`, `docs/development/setup/envs.md` | Integrations and envs belong in separate docs. |
| `architecture/TESTING.md` | `merge` | `docs/operations/qa.md` | Testing process should be operational. |
| `architecture/CONVENTIONS.md` | `merge` | `docs/development/architecture/` | Extract current conventions only. |
| `architecture/CONCERNS.md` | `reference` | `docs/roadmap/backlog.md` | Useful debt signal, but must be validated before becoming backlog. |
| `architecture/HealthBytes_Architecture_Review.md` | `reference` | `docs/ai/inspections/` | Treat as historical architecture inspection. |
| `architecture/security/README.md` | `merge` | `docs/operations/security.md` | Security process belongs in operations. |
| `architecture/security/security-improvements.md` | `reference` | `docs/operations/security.md` | Historical improvements; validate before claiming current state. |
| `architecture/diagrams/b2b-product-insertion-flow.md` | `keep` | `docs/product/commerce-model.md` or `docs/development/architecture/` | Useful B2B vision diagram; not MVP-critical. |
| `backend/README.md` | `rewrite` | `docs/development/architecture/backend.md`, `docs/development/setup/` | Too long and duplicated; extract current commands and architecture. |
| `backend/AI-README.md` | `rewrite` | `docs/ai/agents/backend-context.md` | Useful AI context, but should not be backend dev README. |
| `frontend/README.md` | `rewrite` | `docs/development/architecture/frontend.md`, `docs/development/setup/` | Too long and duplicated; extract current commands and architecture. |
| `frontend/AI-README.md` | `rewrite` | `docs/ai/agents/frontend-context.md` | Useful AI context, but should live under AI operations. |
| `frontend/accessibility-audit-2026.md` | `reference` | `docs/ai/inspections/` or `docs/operations/qa.md` | Historical audit; validate before turning into current QA status. |
| `development/PROJECT_STATUS.md` | `merge` | `docs/roadmap/weekly-status.md` | Old SSOT conflicts with new roadmap files. |
| `development/README.md` | `reference` | `docs/development/README.md` | Old index replaced. |
| `development/development-guide.md` | `merge` | `docs/development/setup/`, `docs/operations/release-process.md` | Extract setup/workflow only. |
| `development/testing.md` | `merge` | `docs/operations/qa.md` | Testing should be one operational source. |
| `development/setup/*` | `merge` | `docs/development/setup/` | Reuse after env/setup audit. |
| `development/inspections/*` | `reference` | `docs/ai/inspections/` | Historical AI/code inspections. |
| `development/debug/*` | `reference` | `docs/ai/inspections/` | Historical debugging record. |
| `development/qa/*` | `rewrite` | `docs/operations/qa.md`, future docs QA scripts | Existing tests expect old paths and need rewrite. |
| `ia-tools/agent-role-hive-prompts.md` | `merge` | `docs/ai/prompts/`, `docs/ai/agents/` | Keep useful role prompts, remove stale references. |
| `product/features/*` | `merge` | `docs/product/features/` | Keep implemented feature context after validating current behavior. |
| `product/phases/*` | `reference` | `docs/legacy/product/phases/` | Historical plan artifacts. |
| `product/prototypes/healthbytes-all-screens.html` | `reference` | `docs/legacy/product/prototypes/` | Historical prototype. |
| `product/reports/weekly/*` | `reference` | `docs/executive/weekly-reports/` | Historical weekly report archive; can move after approval. |
| `scripts/export_weekly_report.py` | `reference` | `docs/executive/` or tooling after review | Script may be useful, but current paths are stale. |

## Immediate Follow-Up

1. Rewrite root `README.md` to point to the new docs structure.
2. Decide whether root `ROADMAP.md` remains as a pointer or moves into `docs/roadmap/`.
3. Rewrite docs QA tests before running them because old tests require `docs/ia-tools/`.
4. Extract validated setup/env details into `docs/development/setup/envs.md`.
5. Extract validated backend/frontend architecture into `docs/development/architecture/`.

