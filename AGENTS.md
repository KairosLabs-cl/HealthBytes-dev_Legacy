# Codex IDE Instructions - HealthBytes

## Startup

- Read `.cursorrules` before planning substantial work.
- Inspect `.ai/skills/` and load the skill that matches the task before coding.
- Use existing repo scripts and documented flows before ad hoc commands.
- After planning, use `/caveman` style for concise working updates unless the user asks for normal mode.

## Project Boundaries

- Backend stack: FastAPI, SQLAlchemy 2.x async, PostgreSQL, JWT.
- Frontend stack: React Native, Expo, TypeScript, Zustand, TailwindCSS.
- Package managers: backend uses `requirements.txt`; frontend uses `pnpm`.
- Do not create new root folders, change stack, install dependencies, or modify critical config without explicit user approval.
- Never commit `.env`, credentials, tokens, passwords, sensitive logs, or hardcoded secrets.
- Preserve unrelated user changes in the worktree.

## Code Placement

- Backend routers in `backend/app/api/v1/` call services only.
- Backend business logic belongs in `backend/app/services/`.
- Backend schemas belong in `backend/app/schemas/`; DB models belong in `backend/app/db/`.
- Frontend screens belong in `frontend/app/`.
- Reusable UI belongs in `frontend/components/`.
- API clients belong in `frontend/api/`.
- Zustand stores belong in `frontend/store/`.
- Shared TypeScript types belong in `frontend/types/`.
- Docs belong under `docs/` using the existing category structure.

## PR Conventions

- Branch format: `type/short-description`.
- Allowed branch types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `perf`.
- Branch names use lowercase, hyphen-separated words, no special characters except `-`, max 50 chars.
- Commit format: `type(scope): present-tense description`.
- Allowed commit types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `perf`.
- PR title should match the first commit intent and use Conventional Commits style.
- PR description must follow `.github/PULL_REQUEST_TEMPLATE.md`.

## Before Suggesting Or Creating A PR

Verify:

- Branch name follows `type/description`.
- Commits use Conventional Commits.
- Relevant local checks pass.
- No `.env` or secrets are staged.
- No `console.log`, `debugger`, or production prints remain.
- No new TypeScript `any` types were introduced unless justified.
- Documentation was updated when behavior, setup, or architecture changed.

## Verification Defaults

- Backend: run focused `pytest` when backend code changes.
- Frontend: run `pnpm run type-check` and focused tests when frontend code changes.
- For broad changes, run the repo-documented checks from `docs/DEVELOPMENT.md`.
- Report exact commands run and exact blockers if verification cannot complete.
