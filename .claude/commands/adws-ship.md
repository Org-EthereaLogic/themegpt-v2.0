# ADWS Ship Phase

Run the full ship pipeline: review, document, create PR, and merge.

## Usage

```
/adws-ship <adw_id>
```

## What This Does

1. **Review** (`adw_review_iso.py`):
   - Parallel Trinity review via asyncio.gather()
   - Architect reviews correctness, Critic reviews security, Advocate reviews UX
   - Each role rates 0.0-1.0; consensus = mean of 3 ratings
   - Approved if consensus >= 0.7
2. **Document** (`adw_document_iso.py`):
   - Generates CHANGELOG.md entry from git diff + plan
   - Updates README.md with feature documentation (surgical updates)
3. **Ship** (`adw_ship_iso.py`):
   - Pushes branch to remote
   - Creates PR via GitHub API (title: `Fix #{issue}: {title}`)
   - PR body includes plan summary, test results, review consensus
   - Enables auto-merge if CI passes
   - Cleans up worktree and archives state

## Example

```
/adws-ship a1b2c3d4
```

Ships workflow `a1b2c3d4` through review, documentation, and PR creation.

## Prerequisites

- Test phase must have completed successfully
- GitHub CLI (`gh`) authenticated with push access
- CI/CD pipeline configured

## Script

```bash
cd adws && uv run python scripts/adw_review_iso.py $ARGUMENTS && uv run python scripts/adw_document_iso.py $ARGUMENTS && uv run python scripts/adw_ship_iso.py $ARGUMENTS
```
