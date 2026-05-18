---
name: repo-self-improvement
description: Use when repeated project mistakes, review feedback, failed commands, onboarding friction, or team workflow lessons should become reusable AI development behavior for this repo.
---

# Repo Self Improvement

## Purpose

Turn repeated development lessons into reviewed, reusable project skills without letting agents rewrite shared behavior blindly.

## When to Use

Use this skill after tasks that reveal:

- A repeated setup, build, test, or runtime failure.
- A reviewer correction that should become default behavior.
- A project convention missing from `AGENTS.md`, `.cursorrules`, docs, or `.ai/skills/`.
- Onboarding friction that caused avoidable confusion.
- A tool-specific lesson from Hermes Agent, Codex, Cursor, VS Code, OpenCode, or another IDE.

Do not use it for one-off mistakes, personal preferences, or rules that can be enforced mechanically by lint, tests, or CI.

## Core Rule

Agents may propose repo behavior improvements, but they must not silently overwrite shared team behavior. Proposals go through `.ai/skill-proposals/` first unless the user explicitly asks to edit an existing skill.

## Workflow

1. Identify the lesson.
   - Name the concrete failure, correction, or repeated friction.
   - Include evidence: command, error, file path, PR comment, or user correction.

2. Classify the destination.
   - `AGENTS.md`: strict repo-wide operating rule.
   - `.cursorrules`: guard rail for all AI assistants.
   - `.ai/skills/<name>/SKILL.md`: reusable workflow or judgment pattern.
   - `docs/`: human-facing setup, architecture, or contribution guidance.
   - CI/lint/test: deterministic enforcement.

3. Draft a proposal under `.ai/skill-proposals/`.
   - Use filename format `YYYY-MM-DD-short-topic.md`.
   - Keep it short and reviewable.
   - Include the proposed target file and exact behavior change.

4. Validate before promotion.
   - Check for conflict with `AGENTS.md`, `.cursorrules`, and existing matching skills.
   - Prefer updating an existing skill over creating a duplicate.
   - Run relevant local checks if the proposal changes executable behavior.

5. Promote only after approval.
   - Move accepted behavior into the target skill or doc.
   - Keep the final skill concise.
   - Remove stale or contradictory text when replacing old guidance.

## Proposal Template

```markdown
# Skill Proposal: <topic>

Date: YYYY-MM-DD
Target: <AGENTS.md | .cursorrules | .ai/skills/name/SKILL.md | docs/path.md | CI>

## Trigger

What happened, with concrete evidence.

## Proposed Behavior

What future agents or developers should do.

## Why It Belongs Here

Why this should be remembered instead of handled as a one-off.

## Validation

How to confirm the proposal is correct and non-conflicting.
```

## Quality Bar

- Keep proposals small enough to review in one pass.
- Use repo-specific evidence, not generic best practices.
- Preserve tool neutrality unless a tool-specific behavior matters.
- Mention Hermes Agent when it improves learning or feedback loops, but do not make it mandatory for contribution.
- Favor commands and files the team already uses.
