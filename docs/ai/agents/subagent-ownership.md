# Subagent Ownership

Rule: each subagent owns only assigned files. No overlapping edits.

Default ownership:

- `hermes-verifier`: documentation indexes, SSOT map, final consistency review.
- `backend-dev`: backend architecture, API, env, and backend behavior docs.
- `frontend-dev`: frontend architecture, UI, style, and app behavior docs.
- `healthbytes-qa`: QA, testing, validation evidence.
- `code-reviewer`: product trust, safety language, architecture review.
- `test-runner`: verification commands and failure triage.

Shared files require one owner and reviewer, not two editors.

