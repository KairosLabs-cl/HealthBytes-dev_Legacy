---
name: HealthBytes-contributors
description: Automatically generates and updates the CONTRIBUTORS.md file by analyzing git merge history, identifying authors who have merged at least 2 branches, and formatting the output beautifully.
---

# Contributors Generator

This skill automates the creation and maintenance of the `CONTRIBUTORS.md` file in the repository root. It ensures that developers who contribute significantly to the codebase are properly recognized, while keeping the documentation up-to-date without manual tracking.

## When to Use This Skill

- When a developer or team member requests an update to the contributors list.
- After successful merges of feature or fix branches.
- Before preparing a major release or version bump.
- When audit/verification workflows require validating current repository contributions.

## What This Skill Does

1. **Analyzes Git History**: Scans all git merge commits to identify the original authors of the branches that were merged.
2. **Consolidates Developer Identities**: Maps various git email/name strings to single consolidated profiles (e.g. mapping `Basty001` and `basty200` to the same developer).
3. **Applies Threshold Filtering**: Only includes contributors (humans or bots) who have successfully merged **at least 2 branches**.
4. **Highlights Human & AI/Automation Contributors**: Groups human developers separately from AI agents and bots (like Jules, Dependabot, CodeRabbit).
5. **Generates Premium Markdown**: Rewrites `CONTRIBUTORS.md` with beautiful typography, badges, clean tables, and clear membership criteria.

## How to Use

Simply execute the script associated with this skill:

```bash
python3 .agents/skills/contributors-generator/generate_contributors.py
```

Or ask the agent:
```
Update the contributors list
```
```
Generar la lista de colaboradores
```

## Membership Policy

- To be added to the human contributors list, a developer must have **at least 2 branches merged** into the main branch (`master`).
- Bots, automation agents, and AI helpers are classified separately to maintain complete transparency about the human/AI collaboration in this project.
