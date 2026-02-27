# Layer 3: Live Single-Issue Test Runbook

This runbook walks through a real end-to-end ADWS workflow using a low-risk
GitHub issue against the ThemeGPT v2.0 repository.

---

## Prerequisites

1. **API Keys** — Create `adws/.env` from `adws/.env.example` with real keys:
   ```
   ANTHROPIC_API_KEY=sk-ant-...
   OPENAI_API_KEY=sk-...
   GEMINI_API_KEY=...
   GITHUB_TOKEN=ghp_...
   ```

2. **GitHub CLI** — Authenticated: `gh auth status`

3. **Git remote** — Verify: `git remote -v` shows `Org-EthereaLogic/themegpt-v2.0`

4. **Dependencies installed** — `cd adws && uv sync --all-extras`

---

## Step 1: Create a Low-Risk Test Issue

Create a documentation-only issue that touches a single file with no
functional risk. This is the safest possible first test.

```bash
gh issue create \
  --title "[ADWS-TEST] Add JSDoc comment to ThemeSelectorProps" \
  --body "## Feature Description

Add a JSDoc comment above the \`ThemeSelectorProps\` type in
\`apps/extension/src/components/ThemeSelector.tsx\`.

## Acceptance Criteria

- [ ] JSDoc comment added above ThemeSelectorProps
- [ ] Comment explains purpose and usage
- [ ] No functional changes

## Complexity Estimate

Small (single file, < 10 lines)" \
  --label "adws,documentation"
```

Note the issue number (e.g., `#150`).

---

## Step 2: Run the Plan Phase

```bash
cd adws
uv run python scripts/adw_plan_iso.py <ISSUE_NUMBER>
```

**Expected output:**
- ADW ID assigned (8-char hex)
- Worktree created at `trees/<adw_id>/`
- State file at `agents/<adw_id>/adw_state.json`
- Plan files at `agents/<adw_id>/plan.md` and `plan.json`
- Trinity Protocol divergence (3 parallel API calls) + convergence

**Verify:**
```bash
# Check state
cat agents/<ADW_ID>/adw_state.json | python -m json.tool

# Read the plan
cat agents/<ADW_ID>/plan.md

# Verify worktree
ls trees/<ADW_ID>/
```

**STOP and review the plan** before proceeding. This is your gate.

---

## Step 3: Run the Build Phase

```bash
uv run python scripts/adw_build_iso.py <ADW_ID>
```

**Expected output:**
- Files modified in the worktree
- Git commit created on the feature branch
- Build log at `agents/<adw_id>/build_log.json`

**Verify:**
```bash
# Check what changed
cd trees/<ADW_ID> && git log --oneline -1 && git diff HEAD~1 --stat
cd ../..
```

---

## Step 4: Run the Test Phase

```bash
uv run python scripts/adw_test_iso.py <ADW_ID>
```

**Expected output:**
- Tests run with coverage
- State updated with test results
- Up to 4 auto-fix attempts if tests fail

**Verify:**
```bash
cat agents/<ADW_ID>/adw_state.json | python -c "
import json,sys
s=json.load(sys.stdin)
print(f'Test results: {s.get(\"test_results\")}')
print(f'Coverage: {s.get(\"test_coverage\")}%')
"
```

---

## Step 5: Run Ship (Review + Document + Ship)

```bash
# Review
uv run python scripts/adw_review_iso.py <ADW_ID>

# Document (changelog + README)
uv run python scripts/adw_document_iso.py <ADW_ID>

# Ship (push + PR)
uv run python scripts/adw_ship_iso.py <ADW_ID>
```

**Or use the slash command:**
```
/adws-ship <ADW_ID>
```

**Expected output:**
- Trinity review with consensus score >= 0.7
- CHANGELOG.md entry generated
- Branch pushed, PR created
- Auto-merge enabled if CI passes

**Verify:**
```bash
gh pr list --head feat/issue-<ISSUE_NUMBER>-<ADW_ID>
```

---

## Step 6: Verify and Clean Up

```bash
# Check final state
cat agents/<ADW_ID>/adw_state.json | python -c "
import json,sys
s=json.load(sys.stdin)
print(f'Current phase: {s[\"current_phase\"]}')
print(f'Phases completed: {len(s[\"all_adws\"])}')
for p in s['all_adws']:
    print(f'  {p[\"phase\"]}: {\"OK\" if p[\"success\"] else \"FAIL\"} ({p[\"duration_seconds\"]:.1f}s)')
"

# If you want to close without merging:
gh pr close <PR_NUMBER>

# Clean up worktree
cd adws
uv run python -c "
from adws.adw_modules.worktree_ops import cleanup_worktree_and_state
cleanup_worktree_and_state('<ADW_ID>')
print('Cleanup complete')
"
```

---

## Success Criteria

| Phase    | Pass Condition                                    |
|----------|---------------------------------------------------|
| Plan     | Trinity plan generated with all 3 perspectives    |
| Build    | Files modified, commit created in worktree        |
| Test     | Tests pass (or auto-fix succeeds within 4 tries)  |
| Review   | Consensus score >= 0.7                            |
| Document | CHANGELOG entry generated                         |
| Ship     | PR created on GitHub, CI passes                   |

---

## Troubleshooting

**"ANTHROPIC_API_KEY not set"** — Check `.env` file exists in `adws/` directory.

**"Worktree already exists"** — A previous run didn't clean up.
Run: `git worktree remove trees/<ADW_ID> --force && git worktree prune`

**Trinity consensus < 0.7** — Review the individual ratings in
`agents/<adw_id>/adw_state.json`. Consider simplifying the issue scope.

**Tests fail repeatedly** — Check `agents/<adw_id>/test_report.json` for
details. The auto-fix only modifies implementation, never tests.
