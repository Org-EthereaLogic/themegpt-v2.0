# ThemeGPT ADWS

**Autonomous Developer Workflow System** — Multi-LLM orchestration for automated software development on ThemeGPT v2.0.

ADWS processes GitHub issues end-to-end through six phases: **plan, build, test, review, document, and ship**. Each workflow runs in an isolated git worktree, uses three LLMs in parallel via the Trinity Protocol, and produces a tested, reviewed pull request.

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Architecture Overview](#architecture-overview)
3. [Setup & Configuration](#setup--configuration)
4. [The Six-Phase Pipeline](#the-six-phase-pipeline)
5. [Trinity Protocol](#trinity-protocol)
6. [Provider Clients & Fallback Chains](#provider-clients--fallback-chains)
7. [State Management](#state-management)
8. [Worktree Isolation](#worktree-isolation)
9. [Testing](#testing)
10. [Claude Slash Commands](#claude-slash-commands)
11. [Directory Structure](#directory-structure)
12. [Best Practices](#best-practices)
13. [Troubleshooting](#troubleshooting)

---

## Quick Start

```bash
# 1. Install dependencies
cd adws
uv sync

# 2. Copy .env and add your API keys
cp .env.example .env
# Edit .env with your ANTHROPIC_API_KEY, OPENAI_API_KEY, GEMINI_API_KEY, GITHUB_TOKEN

# 3. Run the full pipeline on a GitHub issue
uv run python -m scripts.adw_plan_iso 42 --title "Add dark mode toggle" --body "Users need a dark mode option in settings"
uv run python -m scripts.adw_build_iso 42 <adw_id>
uv run python -m scripts.adw_test_iso 42 <adw_id>
uv run python -m scripts.adw_review_iso 42 <adw_id>
uv run python -m scripts.adw_document_iso 42 <adw_id>
uv run python -m scripts.adw_ship_iso 42 <adw_id>
```

The `<adw_id>` is an 8-character hex identifier printed by the plan phase (e.g., `a1b2c3d4`). Use the same ID across all subsequent phases.

---

## Architecture Overview

```
GitHub Issue
    |
    v
[Plan Phase] ---- Trinity Protocol (3 LLMs in parallel) ----> plan.md + plan.json
    |
    v
[Build Phase] --- Claude generates/modifies files ----------> git commit in worktree
    |
    v
[Test Phase] ---- pytest + auto-fix loop (up to 4 tries) --> test_report.json
    |
    v
[Review Phase] -- Trinity reviews code (3 perspectives) ----> review_report.json
    |
    v
[Document Phase]  CHANGELOG + conditional README update ----> doc_log.json
    |
    v
[Ship Phase] ---- Push branch, create PR, cleanup ----------> Pull Request
```

Each workflow is fully isolated: its own git worktree, its own branch (`feat/issue-{N}-{adw_id}`), and its own state directory. Multiple workflows can run concurrently without interference.

---

## Setup & Configuration

### Prerequisites

- Python 3.12+
- [uv](https://docs.astral.sh/uv/) package manager
- Git (with access to your repository)
- API keys for Anthropic, OpenAI, and Google Gemini
- GitHub personal access token (for the ship phase)

### Environment Variables

Create a `.env` file in the `adws/` directory:

```env
# Required — LLM Provider API Keys
ANTHROPIC_API_KEY=sk-ant-api03-...
OPENAI_API_KEY=sk-proj-...
GEMINI_API_KEY=AIzaSy...

# Required for Ship Phase — GitHub
GITHUB_TOKEN=ghp_...

# Optional — Trinity Model Overrides (defaults shown)
TRINITY_ARCHITECT_MODEL=claude-opus-4-5-20251101
TRINITY_CRITIC_MODEL=gpt-5.2
TRINITY_ADVOCATE_MODEL=gemini-3.1-pro-preview

# Optional — Repository
GITHUB_REPO=Org-EthereaLogic/themegpt-v2.0
GITHUB_DEFAULT_BRANCH=main
```

All `load_dotenv()` calls use `override=True`, so `.env` values take precedence over any pre-existing environment variables.

### Install Dependencies

```bash
cd adws
uv sync          # Install runtime dependencies
uv sync --dev    # Include dev dependencies (pytest, pytest-asyncio, pytest-cov)
```

---

## The Six-Phase Pipeline

### Phase 1: Plan

Analyzes the issue using three LLMs in parallel, then synthesizes a unified implementation plan.

```bash
uv run python -m scripts.adw_plan_iso <issue_number> \
    --title "Issue Title" \
    --body "Issue description with acceptance criteria" \
    [--repo-url "https://github.com/org/repo"]
```

**What happens:**

1. Generates an ADW ID and allocates deterministic ports (9100-9114 / 9200-9214)
2. Creates an isolated git worktree with a dedicated branch
3. Runs the Trinity Protocol — three parallel LLM calls, each analyzing the issue from a different perspective
4. Claude synthesizes all perspectives into a structured plan
5. Saves `specs/{adw_id}/plan.md` (human-readable) and `plan.json` (structured)

**Output:** The ADW ID printed to stdout — pass it to all subsequent phases.

### Phase 2: Build

Claude generates or modifies files according to the plan.

```bash
uv run python -m scripts.adw_build_iso <issue_number> <adw_id>
```

**What happens:**

1. Loads the plan from `specs/{adw_id}/plan.json`
2. For each `files_to_create`: Claude generates complete file content (8192 token limit, 120s timeout)
3. For each `files_to_modify`: Claude reads the existing file and produces an updated version
4. Commits all changes to the worktree branch
5. Saves `agents/{adw_id}/build_log.json` with file-level detail and the commit SHA

### Phase 3: Test

Runs pytest and automatically fixes failures (up to 4 attempts).

```bash
uv run python -m scripts.adw_test_iso <issue_number> <adw_id>
```

**What happens:**

1. Runs `pytest -v --tb=short` in the worktree
2. If tests fail, Claude analyzes the failure output and generates a fix
3. The fix is applied only to implementation files — **test files are never modified** (TDD integrity)
4. Retries up to 4 times, committing each fix attempt
5. Saves `agents/{adw_id}/test_report.json` with per-attempt details

### Phase 4: Review

Three LLMs independently review the implementation and compute a consensus score.

```bash
uv run python -m scripts.adw_review_iso <issue_number> <adw_id>
```

**What happens:**

1. Gathers git diff, file contents, plan, and test results
2. Three parallel reviews: Architect (correctness), Critic (security), Advocate (UX)
3. Each role rates the code 0.0-1.0 and lists issues/suggestions
4. Consensus = mean of ratings; approved if >= 0.7
5. Saves `agents/{adw_id}/review_report.json` and `review_summary.md`

### Phase 5: Document

Generates changelog entries and conditionally updates the README.

```bash
uv run python -m scripts.adw_document_iso <issue_number> <adw_id>
```

**What happens:**

1. Claude generates a [Keep a Changelog](https://keepachangelog.com/) entry
2. Inserts it into `CHANGELOG.md` (creates the file if missing)
3. Asks Claude whether the README needs updating (only for new APIs, breaking changes, or significant features)
4. Commits documentation changes
5. Saves `agents/{adw_id}/doc_log.json`

### Phase 6: Ship

Pushes the branch, creates a pull request, and cleans up.

```bash
uv run python -m scripts.adw_ship_iso <issue_number> <adw_id> [--auto-merge]
```

**What happens:**

1. Pushes the worktree branch to the remote
2. Creates a GitHub PR with the plan summary, test results, and review consensus score
3. Labels the PR with `adws` and `ai-generated`
4. Optionally enables auto-merge (squash) with `--auto-merge`
5. Archives state and removes the worktree
6. Saves `agents/{adw_id}/ship_log.json`

---

## Trinity Protocol

The Trinity Protocol is a multi-LLM synthesis framework. Three models analyze every issue from complementary perspectives, then Claude synthesizes them into a single plan.

### Roles

| Role | Provider | Default Model | Focus |
|------|----------|---------------|-------|
| **Architect** | Anthropic (Claude) | `claude-opus-4-5-20251101` | System design, component architecture, integration, implementation sequence |
| **Critic** | OpenAI (GPT) | `gpt-5.2` | Security vulnerabilities, edge cases, error scenarios, performance, testing |
| **Advocate** | Google (Gemini) | `gemini-3.1-pro-preview` | User experience, documentation, API ergonomics, error messages, developer experience |

### How It Works

**Divergence:** All three models receive the same issue but different system prompts tuned to their role. They execute in parallel via `asyncio.gather()`.

**Convergence:** Claude receives all three perspectives and synthesizes a unified JSON plan containing: summary, technical approach, files to modify/create, test strategy, risks, and complexity estimate.

### ThemeGPT-Specific Context

Each role receives project-specific context from `prompts/themegpt_context.md`:

- **Architect** knows about the monorepo structure (`apps/extension`, `apps/web`, `packages/shared`), the 500-line complexity budget, and Plasmo/React 19/Next.js patterns
- **Critic** knows about extension security (local-first, no telemetry), Firebase auth, Stripe webhooks, WCAG 2.1 AA, and the six anti-patterns from the CONSTITUTION
- **Advocate** knows the Cream & Chocolate design system (colors, fonts), UX targets (< 100ms theme preview), and documentation conventions (Keep-a-Changelog, JSDoc/TSDoc)

---

## Provider Clients & Fallback Chains

Each provider client implements automatic model fallback. If the primary model is unavailable (404), the client tries the next model in the chain.

### Claude (Architect)

```
Fallback chain: claude-opus-4-5-20251101 -> claude-sonnet-4-5-20250929
```

Once a model succeeds, it is cached for subsequent calls in the same session. Override with `TRINITY_ARCHITECT_MODEL`.

### GPT (Critic)

```
Fallback chain: gpt-5.2 -> gpt-4o -> gpt-4o-mini
```

Same caching behavior. Override with `TRINITY_CRITIC_MODEL`.

### Gemini (Advocate)

```
Single model: gemini-3.1-pro-preview (no fallback chain)
```

Override with `TRINITY_ADVOCATE_MODEL`. Note: `gemini-3-flash-preview` was deprecated on March 9, 2026.

### Custom Models

Set a custom model via environment variable. If it differs from the default, it is prepended to the fallback chain:

```env
TRINITY_ARCHITECT_MODEL=claude-sonnet-4-5-20250929
# Chain becomes: claude-sonnet-4-5-20250929 -> claude-opus-4-5-20251101 -> claude-sonnet-4-5-20250929
```

---

## State Management

Every workflow has persistent state stored at `agents/{adw_id}/adw_state.json`.

### Features

- **Atomic writes** — temp file + rename prevents partial writes
- **File locking** — `fcntl.flock(LOCK_EX)` prevents concurrent corruption
- **Phase tracking** — each phase records success/failure, duration, and timestamp
- **Model snapshots** — which Trinity models were used (immutable per workflow)
- **Prerequisite validation** — each phase checks that required predecessors completed successfully
- **Snapshots** — `create_snapshot()` saves state to `.snapshots/` before destructive operations
- **Rollback** — `rollback_to_phase("plan")` restores to the last successful state of any prior phase

### State Fields

The `ADWState` model tracks: ADW ID, issue number, worktree path, allocated ports, branch name, current phase, plan file paths, Trinity model versions, test results, test coverage, timestamps, and the full phase history.

### Checking Workflow Status

```python
from adws.adw_modules.state import StateManager

sm = StateManager.load("a1b2c3d4")
state = sm.get_state()
print(f"Current phase: {state.current_phase}")
print(f"Models: {state.trinity_architect_model} / {state.trinity_critic_model} / {state.trinity_advocate_model}")
for record in state.all_adws:
    print(f"  {record.phase}: {'pass' if record.success else 'FAIL'} ({record.duration_seconds:.1f}s)")
```

---

## Worktree Isolation

Each workflow gets its own git worktree at `trees/{adw_id}/` with branch `feat/issue-{N}-{adw_id}`. This provides complete isolation — multiple ADWS workflows can run concurrently on different issues without any interference.

### Port Allocation

Ports are allocated deterministically from the ADW ID (base-36 hash mod 15):

- Backend: 9100-9114
- Frontend: 9200-9214

This means the same ADW ID always gets the same ports, which is useful for reproducibility.

### Auto-Cleanup

Worktrees older than 72 hours are automatically cleaned up:

```python
from adws.adw_modules.worktree_ops import cleanup_old_worktrees
cleaned = cleanup_old_worktrees(max_age_hours=72)
```

The ship phase also handles cleanup: it archives state, removes the worktree, and deletes the branch.

---

## Testing

### Running Tests

```bash
# From the adws/ directory
uv run pytest                          # All tests
uv run pytest -v --tb=short            # Verbose with short tracebacks (default config)
uv run pytest --cov=adw_modules        # With coverage report
uv run pytest tests/test_layer1_smoke.py   # Layer 1 only
uv run pytest tests/test_layer2_dryrun.py  # Layer 2 only
```

### Test Layers

**Layer 1 — Smoke Tests** (`test_layer1_smoke.py`): Unit tests that verify module imports, class instantiation, Pydantic models, state management, and worktree operations. No API calls. Fast and deterministic.

**Layer 2 — Dry Run Tests** (`test_layer2_dryrun.py`): Integration tests that exercise the full pipeline with mocked API responses. Verifies phase sequencing, state transitions, file I/O, and error handling. No API calls.

**Layer 3 — Live Tests** (`test_api_connectivity.py` and manual runs): Verifies actual API connectivity and model availability. Requires valid API keys. Run manually to validate provider configuration.

### Module-Level Tests

Each core module has its own test file: `test_provider_clients.py`, `test_trinity_protocol.py`, `test_state.py`, `test_worktree_ops.py`, plus individual phase script tests (`test_plan.py`, `test_build.py`, etc.).

---

## Claude Slash Commands

ADWS includes Claude Code slash commands in `.claude/commands/`:

| Command | Description |
|---------|-------------|
| `/adws-plan` | Plan phase — analyze a GitHub issue with Trinity Protocol |
| `/adws-build` | Build phase — generate code from the plan |
| `/adws-test` | Test phase — run tests with auto-fix |
| `/adws-ship` | Ship phase — review, document, create PR, and merge |

---

## Directory Structure

```
adws/
+-- adw_modules/                 # Core library
|   +-- __init__.py
|   +-- provider_clients.py      # Claude, GPT, Gemini clients with fallback chains
|   +-- trinity_protocol.py      # Multi-LLM diverge/converge protocol
|   +-- state.py                 # Persistent state with locking and snapshots
|   +-- worktree_ops.py          # Git worktree lifecycle and cleanup
|
+-- scripts/                     # Phase entry points (CLI)
|   +-- __init__.py
|   +-- adw_plan_iso.py          # Phase 1: Trinity planning
|   +-- adw_build_iso.py         # Phase 2: Code generation
|   +-- adw_test_iso.py          # Phase 3: Testing + auto-fix
|   +-- adw_review_iso.py        # Phase 4: Trinity code review
|   +-- adw_document_iso.py      # Phase 5: Changelog + README
|   +-- adw_ship_iso.py          # Phase 6: PR creation + cleanup
|
+-- prompts/
|   +-- themegpt_context.md      # ThemeGPT-specific Trinity role context
|
+-- tests/                       # Test suite (Layer 1, 2, 3 + per-module)
+-- specs/                       # Generated plans (specs/{adw_id}/)
+-- agents/                      # Generated state (agents/{adw_id}/)
+-- trees/                       # Generated worktrees (trees/{adw_id}/)
+-- pyproject.toml               # Project config (hatchling build, pytest)
+-- .env                         # API keys and model overrides
+-- README.md                    # This file
```

---

## Best Practices

### Writing Good Issues for ADWS

ADWS works best with well-structured GitHub issues. Include:

- A clear, specific title (the Trinity Protocol uses it as primary context)
- Acceptance criteria in the body — what "done" looks like
- File paths if you know which files need changes
- Constraints or non-goals to prevent scope creep

### Model Selection

- Use **Opus** (default Architect) for complex multi-file features
- Use **Sonnet** for simpler changes — faster and cheaper
- Override per-workflow via environment variables without changing code

### Monitoring Workflows

- Check `agents/{adw_id}/adw_state.json` for current phase and history
- Check phase-specific logs (`build_log.json`, `test_report.json`, etc.) for detailed output
- Use `state_manager.list_snapshots()` to see recovery points

### Handling Failures

- If a phase fails, fix the underlying issue and re-run that phase — state tracks what succeeded
- Use `state_manager.rollback_to_phase("plan")` to reset to a known good state
- The test phase auto-retries up to 4 times — check `test_report.json` for attempt details
- Stale worktrees (> 72h) are cleaned up automatically; run `cleanup_old_worktrees()` manually if needed

### Security Considerations

- API keys belong in `.env` only — never commit them to the repository
- The `.env` file is gitignored by default
- GITHUB_TOKEN needs `repo` scope for PR creation and `workflow` scope if you use auto-merge
- The review phase flags security issues, but always review AI-generated PRs before merging

### Complexity Budget

ThemeGPT enforces a 500-line file complexity budget. The Architect role is aware of this constraint and will design implementations that respect it. If the plan suggests files exceeding 500 lines, consider splitting the issue into smaller pieces.

---

## Troubleshooting

### API keys not loading

All `load_dotenv()` calls use `override=True`. If keys still aren't loading, verify:

```bash
# Check .env file is in the right location
cat adws/.env | head -5

# Test key loading directly
cd adws && uv run python -c "
from dotenv import load_dotenv, dotenv_values
import os
load_dotenv('.env', override=True)
print('Anthropic:', 'set' if os.getenv('ANTHROPIC_API_KEY') else 'MISSING')
print('OpenAI:', 'set' if os.getenv('OPENAI_API_KEY') else 'MISSING')
print('Gemini:', 'set' if os.getenv('GEMINI_API_KEY') else 'MISSING')
"
```

### Model not found errors

Provider clients automatically fall back to alternative models. If all models in the chain fail, check that your API key has access to the required models. Run the Layer 3 connectivity test:

```bash
uv run pytest tests/test_api_connectivity.py -v
```

### Import errors (`No module named 'adws'`)

When running scripts directly (not via pytest), set the Python path:

```bash
PYTHONPATH=/path/to/themegpt-v2.0 uv run python -m adws.scripts.adw_plan_iso ...
```

Pytest handles this automatically via `pythonpath = [".."]` in `pyproject.toml`.

### Stale lock files

If a process crashes mid-save, a `.adw_state.lock` file may be left behind. The cleanup functions remove these automatically, but you can also delete them manually:

```bash
rm agents/<adw_id>/.adw_state.lock
```

### Worktree conflicts

If `git worktree add` fails because the branch already exists:

```bash
git branch -D feat/issue-42-a1b2c3d4    # Delete the stale branch
git worktree prune                        # Clean up stale worktree refs
```

---

## License

This project is part of ThemeGPT v2.0 by EthereaLogic.
