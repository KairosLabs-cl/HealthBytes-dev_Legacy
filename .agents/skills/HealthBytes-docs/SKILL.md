---
name: HealthBytes-docs
description: Use when updating HealthBytes docs, README files, roadmap, setup/env docs, architecture docs, AI inspections, agent prompts, weekly reports, or documentation structure.
---

# Docs Maintainer

## Purpose

Keep HealthBytes docs current without creating duplicate sources of truth or root-folder clutter.

## Required First Reads

Before editing docs:

1. Read `.cursorrules`.
2. Read `.agents/router.json`.
3. Check `.agents/agents/tasks.json` for an explicit docs task.
4. Read `docs/README.md`.
5. Read `docs/plans/2026-06-04-documentation-roadmap-reboot-design.md` if the work touches the documentation reboot.

## Source Of Truth Rules

Use the right owner:

| Question | Source |
| --- | --- |
| Product vision | `docs/product/vision.md` |
| Users and market | `docs/product/market-and-users.md` |
| Health criteria | `docs/product/health-rules/` |
| MVP | `docs/roadmap/mvp.md` |
| Roadmap status | `docs/roadmap/weekly-status.md` |
| Backend architecture | `docs/development/architecture/backend.md` |
| Frontend architecture | `docs/development/architecture/frontend.md` |
| Infrastructure | `docs/development/architecture/infrastructure.md` |
| Envs | `docs/development/setup/envs.md` |
| AI agents | `docs/ai/agents/` |
| AI inspections | `docs/ai/inspections/` |
| Executive reports | `docs/executive/` |
| QA/security/release process | `docs/operations/` |
| Historical docs | `docs/legacy/` |

Update the source of truth first. Update indexes and pointers second.

## Placement Rules

- Do not create new docs in repo root without explicit user approval.
- Put AI-generated audits and investigation outputs in `docs/ai/inspections/`.
- Put executive meeting material in `docs/executive/`.
- Put old docs in `docs/legacy/` preserving old folder structure.
- Keep root `README.md` concise.
- Keep `docs/README.md` as navigation, not a long status document.

## Product Safety Language

HealthBytes gives recommendations, not medical guarantees.

Allowed:

- "Recommended according to available criteria."
- "Compatible according to available data."
- "Requires review."
- "Insufficient data."

Avoid:

- "Safe for diabetics."
- "Treats cholesterol."
- "Lowers blood pressure."
- Any absolute medical suitability claim.

## Migration Workflow

When moving or rewriting docs:

1. Classify each legacy doc as `keep`, `rewrite`, `merge`, `reference`, or `delete_later`.
2. Preserve old content in `docs/legacy/`.
3. Write the new concise source of truth.
4. Update links.
5. Search for stale paths.
6. Report unresolved references.

## Verification

Minimum checks:

- `git status --short`
- `jq empty .agents/router.json`
- Run the active docs reboot stale-path search against root docs, `docs/`, `.agents/router.json`, and this skill.

If docs QA scripts are restored from legacy, run them only after updating their expected paths.
