# Codex IDE Instructions - HealthBytes

## Startup

- Read `.cursorrules` before planning substantial work.
- Inspect `.agents/skills/` and load the skill that matches the task before coding.
- Use existing repo scripts and documented flows before ad hoc commands.
- After planning, use `/caveman` style for concise working updates unless the user asks for normal mode.

## AI Agents And Roles

- `.agents/router.json` is the machine-readable registry for repo skills, executable agents, and role labels.
- `.agents/agents/tasks.json` is the Kanban gate. Before an agent starts implementation, review, or PR work, the work must map to an explicit task entry.
- `.agents/agents/*.md` are executable agent profiles. Jules/OpenCode/Codex prompts must load the matching file instead of copying stale instructions.
- `docs/ia-tools/agent-role-hive-prompts.md` defines conceptual review roles and labels such as `agent:security`, `agent:architecture`, and `agent:qa`.
- When a task uses a conceptual role label, resolve it through `.agents/router.json` to one or more executable agent profiles before acting.
- When adding a new agent profile, add its `.agents/agents/<name>.md` file, its optional `.agents/agents/jules/<name>-prompt.md` loader, and its `.agents/router.json` registry entry in the same change.

## Skill Naming Convention

Any skill created specifically for this project must use the `HealthBytes-{action}` prefix. Generic skills (reusable across any project) keep their original name.

- HealthBytes-specific: `HealthBytes-sprint`, `HealthBytes-docs`, `HealthBytes-version`, `HealthBytes-contributors`, `HealthBytes-changelog`
- Generic: `systematic-debugging`, `test-driven-development`, `writing-plans`

**Rule of thumb:** If the skill description mentions HealthBytes, the team, or repo-specific workflows → prefix `HealthBytes-`.

When creating a new HealthBytes skill: name the folder `.agents/skills/HealthBytes-{action}/`, set `name: HealthBytes-{action}` in the SKILL.md frontmatter, and register it in `.agents/router.json`.

## Product And Food Safety

HealthBytes is an e-commerce product for people with dietary restrictions, restrictive-food needs, minutas, and meal-planning support. Agents must treat these flows as trust-sensitive product work, not generic catalog UI.

- Treat allergies, intolerances, chronic-condition diets, pregnancy, medication interactions, and strict exclusions as high-risk context.
- Do not present product matches, substitutes, minutas, or plans as medical diagnosis or guaranteed safe nutrition advice.
- Dietary claims must be traceable to product data, labels, nutrition facts, ingredients, or an explicit reviewed source.
- Never infer "safe for X" from weak data. If data is missing, show uncertainty or require review.
- Keep restriction signals visible in catalog, product detail, cart, checkout, and recommendations.
- Prefer clear user-facing explanations: why a product matches, why it is excluded, and what data supports the decision.
- Protect health-related user data as sensitive personal data. Do not log or expose restrictions, diagnoses, meal plans, or profile notes unnecessarily.

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

- There is an explicit task entry in `.agents/agents/tasks.json` for this work.
- If no task exists, do not create, suggest, or leave behind a PR/branch; report the missing task instead.
- The branch contains material changes against its base. Empty PRs, validation-failure PRs, or PRs that only report missing work must be closed instead of opened.
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
