# ADWS Build Phase

Apply an approved plan to the worktree, generating and modifying files.

## Usage

```
/adws-build <adw_id>
```

## What This Does

1. Loads the workflow state and plan from `agents/{adw_id}/`
2. Validates that the plan phase completed successfully
3. For each file in the plan:
   - **Files to create**: Prompts Architect to generate complete content, writes atomically
   - **Files to modify**: Prompts Architect with current file + plan context, applies changes
4. Commits all changes with a semantic commit message
5. Saves build log to `agents/{adw_id}/build_log.json`
6. Updates workflow state to `built`

## Example

```
/adws-build a1b2c3d4
```

Applies the plan for workflow `a1b2c3d4` to its worktree.

## Prerequisites

- Plan phase must have completed successfully
- Worktree must exist at `trees/{adw_id}/`

## Script

```bash
cd adws && uv run python scripts/adw_build_iso.py $ARGUMENTS
```
