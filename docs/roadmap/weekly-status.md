# Weekly Status

Project-level status source for HealthBytes.

Last updated: 2026-06-04.

## Status

Yellow.

Reason: core backend, frontend, database, authentication, tests, and CI exist, but release readiness still depends on push-token registration, accessibility audit, staging execution, and store-prep work.

## Current Baseline

| Area | Status |
| --- | --- |
| Frontend mobile | Functional - React Native + Expo |
| Backend API | Functional - FastAPI async |
| Database | Functional - PostgreSQL + Redis |
| Authentication | Implemented - JWT + Clerk |
| Tests | 600+ backend and frontend tests reported in legacy roadmap |
| CI/CD and infra | GitHub Actions, Docker, and AWS scripts documented |

## Progress

- Documentation reboot structure exists and old docs are preserved in `docs/legacy/`.
- Product SSOT now starts in `docs/product/` with health-rules framing for diabetes, dyslipidemia, and hypertension.
- Roadmap SSOT now lives in `docs/roadmap/` instead of root roadmap/status files.

## Risks

- Legacy status claims need validation before being treated as current release evidence.
- Docs QA scripts under legacy expected old paths and need rewrite before reuse.
- Health-related recommendation language must avoid absolute medical safety claims.

## Decisions Needed

| Decision | Owner | Deadline |
| --- | --- | --- |
| Choose staging path: Railway, Render, Fly.io, or AWS ECS | Product/Tech lead | Before beta smoke |
| Confirm store-submission path for Android and iOS | Product/Tech lead | Before public beta |
| Decide next legacy extraction target from `docs/legacy/AUDIT.md` | Docs owner | Next docs pass |

## Next Week

- Validate release-readiness items in `release-readiness.md`.
- Extract setup/env truth into `docs/development/setup/`.
- Rewrite docs QA checks for the new docs structure.
