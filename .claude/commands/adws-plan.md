# ADWS Plan Phase

Trigger the ADWS planning phase for a GitHub issue.

## Usage

```
/adws-plan <issue_number>
```

## What This Does

1. Fetches the GitHub issue details (title, body, labels)
2. Creates an isolated git worktree for the workflow
3. Runs the Trinity Protocol divergence phase:
   - **Architect** (Claude Opus 4.6): Analyzes architecture and implementation approach
   - **Critic** (GPT-5.3-Codex): Reviews for security, edge cases, and anti-patterns
   - **Advocate** (Gemini 3.1 Pro): Evaluates UX impact and documentation needs
4. Synthesizes perspectives into a unified plan
5. Saves plan to `agents/{adw_id}/plan.md` and `agents/{adw_id}/plan.json`
6. Updates workflow state to `planned`

## Example

```
/adws-plan 42
```

Plans implementation for GitHub issue #42, creating a worktree and generating
a Trinity-reviewed implementation plan.

## Prerequisites

- `.env` file with API keys configured (see `adws/.env.example`)
- GitHub CLI (`gh`) authenticated
- Git repository with remote configured

## Script

```bash
cd adws && uv run python scripts/adw_plan_iso.py $ARGUMENTS
```
