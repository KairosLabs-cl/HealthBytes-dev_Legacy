# Documentation Roadmap Reboot Design

**Goal:** reorganize HealthBytes documentation around product truth, technical truth, AI operations, executive reporting, and roadmap execution without losing legacy material.

**Approved direction:** build the new structure first, then audit and migrate existing docs against it.

**Task gate:** `.agents/agents/tasks.json` contains `task-1779486907706` ("Realizar una auditoria de docs personalizados tanto readmes como contextos") assigned to `hermes-verifier`.

---

## 1. Product Frame

HealthBytes is not a generic ecommerce. The first product core is a catalog and commerce layer for people with dietary needs tied to metabolic and cardiovascular conditions.

Pilot conditions:

- Diabetes
- Dislipidemia
- Hipertension arterial

Initial MVP value:

- Discovery: users can find relevant products.
- Trust: users understand why a product is recommended, compatible, uncertain, or risky.

Commercial model:

- Mixed: direct sale where HealthBytes controls checkout, plus external provider redirection where products live outside HealthBytes.

Responsibility model:

- HealthBytes gives recommendations based on available product data and declared user context.
- Final decision remains with the user.
- Docs and UI should avoid absolute claims such as "safe for diabetics".
- Preferred language: "recommended by criteria", "compatible according to available data", "requires review", "insufficient data".

---

## 2. Documentation Structure

Target structure:

```txt
docs/
├─ README.md
├─ legacy/
├─ product/
│  ├─ README.md
│  ├─ vision.md
│  ├─ market-and-users.md
│  ├─ health-rules/
│  │  ├─ README.md
│  │  ├─ diabetes.md
│  │  ├─ dyslipidemia.md
│  │  └─ hypertension.md
│  ├─ commerce-model.md
│  └─ features/
├─ roadmap/
│  ├─ README.md
│  ├─ mvp.md
│  ├─ release-readiness.md
│  ├─ backlog.md
│  └─ weekly-status.md
├─ development/
│  ├─ README.md
│  ├─ architecture/
│  │  ├─ README.md
│  │  ├─ system-overview.md
│  │  ├─ backend.md
│  │  ├─ frontend.md
│  │  ├─ infrastructure.md
│  │  └─ data-model.md
│  ├─ setup/
│  │  ├─ README.md
│  │  ├─ envs.md
│  │  ├─ backend-setup.md
│  │  ├─ frontend-setup.md
│  │  └─ deployment.md
│  ├─ testing.md
│  └─ decisions/
├─ ai/
│  ├─ README.md
│  ├─ inspections/
│  ├─ agents/
│  │  ├─ README.md
│  │  └─ subagent-ownership.md
│  ├─ prompts/
│  └─ skills/
│     └─ docs-maintainer/
├─ executive/
│  ├─ README.md
│  ├─ weekly-report-template.md
│  ├─ weekly-reports/
│  └─ meeting-briefs/
└─ operations/
   ├─ README.md
   ├─ qa.md
   ├─ security.md
   └─ release-process.md
```

Rules:

- Root `README.md` stays short: product, quick start, current source links.
- `docs/README.md` is navigation only.
- `docs/product/` owns business/product truth.
- `docs/roadmap/` owns delivery order and priorities.
- `docs/development/` owns technical implementation truth.
- `docs/ai/` owns AI-generated inspections, prompts, agent instructions, and skills.
- `docs/executive/` owns weekly reports and meeting briefs.
- `docs/legacy/` preserves old structure until each file is classified.

---

## 3. Single Source Of Truth Map

| Question | New SSOT | Current conflict |
| --- | --- | --- |
| What is HealthBytes? | `docs/product/vision.md` | Root `README.md`, `docs/backend/AI-README.md`, `ROADMAP.md` |
| What is the MVP? | `docs/roadmap/mvp.md` | `ROADMAP.md`, `docs/development/PROJECT_STATUS.md` |
| What is the current status? | `docs/roadmap/weekly-status.md` | `ROADMAP.md`, `docs/development/PROJECT_STATUS.md`, generated README table |
| How is backend built? | `docs/development/architecture/backend.md` | `docs/backend/README.md`, `docs/backend/AI-README.md`, `.cursorrules` |
| How is frontend built? | `docs/development/architecture/frontend.md` | `docs/frontend/README.md`, `docs/frontend/AI-README.md`, `.cursorrules` |
| How are envs managed? | `docs/development/setup/envs.md` | Root `README.md`, `docs/backend/README.md`, setup docs |
| How do agents work? | `docs/ai/agents/README.md` | `.agents/router.json`, `docs/ia-tools/agent-role-hive-prompts.md` |
| Where do AI inspections go? | `docs/ai/inspections/` | `docs/development/inspections/` |
| What gets reported weekly? | `docs/executive/weekly-report-template.md` | `docs/weekly-report-template.md`, `docs/product/reports/weekly/` |

---

## 4. Current Audit Snapshot

Observed documentation scale:

- 13,344 markdown lines under `docs/`.
- Duplicate or stale indexes in `docs/README.md`, `docs/development/README.md`, and root `README.md`.
- Competing roadmap/status claims between `ROADMAP.md` and `docs/development/PROJECT_STATUS.md`.
- Very long backend/frontend docs that mix setup, architecture, tests, troubleshooting, API catalog, and AI rules.
- AI content split between `.agents/`, `docs/ia-tools/`, `docs/development/qa/`, and `docs/development/inspections/`.
- Weekly reporting split between `docs/weekly-report-template.md`, `docs/scripts/export_weekly_report.py`, and `docs/product/reports/weekly/`.

Initial classification:

| Current path | Proposed action | Destination |
| --- | --- | --- |
| `ROADMAP.md` | rewrite as short pointer or move content | `docs/roadmap/` |
| `docs/development/PROJECT_STATUS.md` | merge into roadmap status, then legacy | `docs/roadmap/weekly-status.md` |
| `docs/README.md` | rewrite navigation | `docs/README.md` |
| `docs/architecture/*` | split current truth vs legacy audits | `docs/development/architecture/` or `docs/legacy/architecture/` |
| `docs/backend/README.md` | shrink and merge technical truth | `docs/development/architecture/backend.md` |
| `docs/backend/AI-README.md` | convert into AI backend context | `docs/ai/agents/backend-context.md` |
| `docs/frontend/README.md` | shrink and merge technical truth | `docs/development/architecture/frontend.md` |
| `docs/frontend/AI-README.md` | convert into AI frontend context | `docs/ai/agents/frontend-context.md` |
| `docs/development/setup/*` | keep but normalize names | `docs/development/setup/` |
| `docs/development/inspections/*` | move AI inspection outputs | `docs/ai/inspections/` |
| `docs/development/qa/*` | evaluate: qa docs vs executable test fixtures | `docs/operations/qa.md` or `docs/legacy/development/qa/` |
| `docs/ia-tools/*` | migrate agent prompts | `docs/ai/prompts/` |
| `docs/product/features/*` | keep, but classify as implemented feature docs | `docs/product/features/` |
| `docs/product/phases/*` | legacy unless actively referenced | `docs/legacy/product/phases/` |
| `docs/product/reports/weekly/*` | keep reports, move template/report archive | `docs/executive/weekly-reports/` |
| `docs/weekly-report-template.md` | rewrite shorter executive template | `docs/executive/weekly-report-template.md` |

---

## 5. Roadmap Cores

### Core 1: Health Criteria And Trust

Define criteria for diabetes, dyslipidemia, and hypertension.

Minimum docs:

- `docs/product/health-rules/diabetes.md`
- `docs/product/health-rules/dyslipidemia.md`
- `docs/product/health-rules/hypertension.md`

Each doc must state:

- What product data is needed.
- What qualifies as recommended, compatible, review, or insufficient data.
- What claims are forbidden.
- What user-facing explanation is acceptable.

### Core 2: Catalog

Define product data needed for trustworthy discovery.

Minimum fields:

- Product identity, brand, provider, category.
- Ingredients.
- Nutrition facts.
- Dietary tags and claims.
- Evidence source and review state.
- Stock, price, and sales mode: direct or external.

### Core 3: Discovery

Define search/filter experience for users.

Minimum flows:

- Search by product, brand, ingredient, condition, or dietary need.
- Filter by diabetes, dyslipidemia, hypertension.
- Show reason codes and uncertainty.
- Do not hide missing data.

### Core 4: Commerce

Define mixed commercial model.

Minimum flows:

- Direct checkout where HealthBytes owns order/payment.
- External redirection where provider owns purchase.
- Clear distinction between both modes.
- Cart warning if product has health-data uncertainty.

### Core 5: Operating System

Define docs, agents, reports, and weekly delivery rhythm.

Minimum flows:

- AI inspections only in `docs/ai/inspections/`.
- Weekly report template for 30-minute meeting.
- Subagent ownership by folder/file.
- Docs maintainer skill.

---

## 6. Docs Maintainer Skill Design

Create `.agents/skills/docs-maintainer/SKILL.md` or `docs/ai/skills/docs-maintainer/SKILL.md` plus router entry after approval.

Trigger:

- User asks to update docs, roadmap, README, architecture, setup, envs, agents, weekly report, or project status.
- Any code change modifies behavior, setup, architecture, env vars, API contracts, product claims, or agent workflows.

Required workflow:

1. Read `.cursorrules`.
2. Read `.agents/router.json`.
3. Check `.agents/agents/tasks.json` for an explicit docs task.
4. Identify affected SSOT from the map above.
5. Update only the SSOT first.
6. Update indexes/pointers second.
7. Move stale content to `docs/legacy/` only when migration is approved.
8. Never create docs in root except root `README.md` or approved root files.
9. Run docs QA checks if present.
10. Report exact files changed and remaining stale references.

Forbidden:

- No new root docs without explicit approval.
- No duplicate roadmap/status documents.
- No medical-safety absolute claims.
- No deletion before legacy migration review.

---

## 7. Subagent Plan

Use existing agents from `.agents/router.json`. Each subagent owns exclusive files.

| Subagent | Ownership | Output |
| --- | --- | --- |
| `hermes-verifier` | `docs/README.md`, `docs/roadmap/`, docs SSOT map | consistency report and final verification |
| `backend-dev` | backend architecture/env/API docs only | backend architecture and env truth |
| `frontend-dev` | frontend architecture/style/UI docs only | frontend architecture and style truth |
| `healthbytes-qa` | `docs/operations/qa.md`, testing docs | QA/test evidence and commands |
| `code-reviewer` | product trust, safety language, claims | product-risk review |
| `test-runner` | docs QA checks only | command evidence |

No overlap rule:

- One subagent writes only assigned files.
- Shared indexes are handled only by `hermes-verifier`.
- Product safety wording is reviewed by `code-reviewer` before final status.

---

## 8. Executive Weekly Report

Meeting target: 30 minutes max.

Template should be shorter than current `docs/weekly-report-template.md`.

Recommended sections:

1. Status: green/yellow/red and one-sentence reason.
2. This week: 3 bullets max.
3. Evidence: PRs/checks/docs/demo links.
4. Risks/blockers: 3 bullets max.
5. Decisions needed: explicit owner and deadline.
6. Next week: 3 priorities max.

Rule:

- Executive report is not a technical changelog.
- Technical appendix allowed only when needed.

---

## 9. Migration Phases

### Phase 0: Freeze

- Do not add new docs outside target structure.
- Treat this design as temporary migration source.

### Phase 1: Create Structure

- Create target folders and README placeholders.
- Keep current docs in place.
- Add SSOT map and classification table.

### Phase 2: Audit

- Classify every current doc: keep, rewrite, merge, legacy.
- Record reason and destination.
- Detect stale links.

### Phase 3: Migrate

- Move stale content into `docs/legacy/` preserving old structure.
- Write new concise docs.
- Update indexes and root README.

### Phase 4: Verify

- Run docs QA.
- Run link checks if available.
- Verify no root doc sprawl.
- Verify no duplicate roadmap/status SSOT.

---

## 10. Open Decisions

1. Whether target AI folder is `docs/ai/` or the existing `docs/ia-tools/`.
2. Whether root `ROADMAP.md` remains as a pointer or moves fully into `docs/roadmap/`.
3. Whether docs maintainer skill lives under `.agents/skills/` as executable repo skill or under `docs/ai/skills/` as documentation-only spec.
4. Whether old reports remain as historical executive artifacts or move to legacy.
5. Whether weekly reports should be generated by script or written manually from a template.

