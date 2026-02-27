# ADWS Test Phase

Run tests in the worktree with automatic failure analysis and fix attempts.

## Usage

```
/adws-test <adw_id>
```

## What This Does

1. Loads workflow state from `agents/{adw_id}/`
2. Validates that the build phase completed successfully
3. Runs pytest in the worktree with coverage
4. If tests fail (up to 4 retry attempts):
   - Parses failure output to extract error details
   - Prompts Architect with failure + implementation file
   - Applies fix to **implementation files only** (never modifies tests)
   - Re-runs tests
5. Saves test report to `agents/{adw_id}/test_report.json`
6. Updates workflow state with test results and coverage

## Example

```
/adws-test a1b2c3d4
```

Runs tests for workflow `a1b2c3d4` with up to 4 auto-fix attempts.

## Prerequisites

- Build phase must have completed successfully
- Worktree must contain runnable tests

## Script

```bash
cd adws && uv run python scripts/adw_test_iso.py $ARGUMENTS
```
