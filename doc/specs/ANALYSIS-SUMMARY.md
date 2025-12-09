# TAC-7 ADWS Architectural Analysis - Executive Summary

## Document Location
Full analysis: `/Users/etherealogic/Dev/tac-7/TAC7_ADWS_ARCHITECTURAL_ANALYSIS.md` (46KB, 1,204 lines)

## Quick Facts

- **Total Codebase**: 7,150 Python lines across 19 files
- **Architecture Style**: Modular orchestration with isolated git worktrees
- **Max Concurrency**: 15 simultaneous workflows (deterministic port allocation)
- **State Persistence**: JSON files in `agents/{adw_id}/adw_state.json`
- **LLM Integration**: Anthropic Claude via Claude Code CLI (subprocess-based)
- **Git Strategy**: Per-workflow isolation via git worktrees under `trees/{adw_id}/`

## Core Components Overview

### Workflow System (7 primary phases)

```
adw_plan_iso.py (337 lines)
├── Creates: Git worktree, allocates ports
├── Classifies issue: /chore, /bug, /feature
└── Output: Implementation plan spec file

adw_build_iso.py (~350 lines)
├── Loads: State from adw_plan_iso
├── Implements: Plan file in worktree
└── Updates: PR with code changes

adw_test_iso.py (881 lines)
├── Runs: Test suite with retry logic (max 4 attempts)
├── Reports: Test results with JSON detail
└── Updates: PR with test status

adw_review_iso.py (534 lines)
├── Reviews: Implementation vs spec
├── Uploads: Screenshots to Cloudflare R2
└── Creates: Auto-patch plans for issues

adw_document_iso.py (~300 lines)
├── Analyzes: Git diff in worktree
├── Generates: Feature documentation
└── Updates: Conditional docs

adw_ship_iso.py (316 lines)
├── Validates: All state fields populated
├── Merges: Feature branch to main
└── Posts: Success to GitHub issue

adw_sdlc_zte_iso.py (238 lines) - Zero-Touch Execution
└── Chains: plan → build → test → review → document → ship (AUTO-MERGE)
```

### Core Modules (9 supporting modules)

| Module | Lines | Key Responsibility |
|--------|-------|-------------------|
| **agent.py** | 561 | Claude Code CLI bridge, model selection, JSONL parsing |
| **state.py** | 172 | Persistent state file I/O, validation |
| **workflow_ops.py** | 714 | Shared workflow logic (classify, plan, build, etc.) |
| **git_ops.py** | 316 | Git operations: commit, branch, PR, merge |
| **github.py** | 312 | GitHub API via gh CLI: fetch issues, post comments |
| **worktree_ops.py** | 242 | Worktree creation, port allocation, cleanup |
| **data_types.py** | 285 | Pydantic models for type safety |
| **utils.py** | 241 | Logging, JSON parsing, environment validation |
| **r2_uploader.py** | 125 | Cloudflare R2 integration for screenshots |

## Key Architectural Patterns

### 1. Isolated Execution Model
- Every workflow runs in separate git worktree: `trees/{adw_id}/`
- Filesystem isolation prevents parallel execution conflicts
- Deterministic port allocation: backend 9100-9114, frontend 9200-9214
- Supports 15 concurrent instances without collisions

### 2. State-Driven Composition
- Persistent state: `agents/{adw_id}/adw_state.json`
- First phase (adw_plan_iso) creates state and worktree
- Dependent phases load state and continue execution
- Each workflow appends to `all_adws` list for execution history

### 3. Dynamic Model Selection
- Maps slash commands to model configurations
- Base set: Sonnet (fast) / Heavy set: Sonnet or Opus (complex)
- Model selection configurable via state `model_set` field
- Enables cost/speed/quality tradeoffs

### 4. Hook-Based Integration
- Claude Code hooks intercept tool execution
- Pre-execution: blocks dangerous commands (rm -rf, .env access)
- Post-execution: logs metrics and tool use
- Extensible via `.claude/settings.json`

### 5. Composable Workflow Orchestration
- Single phases: `adw_build_iso.py 123 abc12345`
- Chained workflows: `adw_plan_build_iso.py 123`
- Full SDLC: `adw_sdlc_iso.py 123`
- Zero-touch auto-merge: `adw_sdlc_zte_iso.py 123`

## Integration Points

### Entry: GitHub Issues
- Manual: `adw_plan_iso.py <issue-number>`
- Webhook: GitHub push/issue events → trigger_webhook.py
- Polling: Cron trigger every 20 seconds

### Claude Code Interaction
- Executes slash commands from `.claude/commands/` directory
- 35 commands available (classify, plan, implement, test, review, etc.)
- Output format: JSONL streams parsed to AgentPromptResponse
- Retry logic: auto-retries transient errors (up to 3 times)

### Git Workflow
- Per-worktree execution: all git commands accept `cwd` parameter
- Branch strategy: feature branch per workflow with ADW-ID in name
- PR management: Create, update, approve, merge via gh CLI
- Final merge: Manual merge in main repo (not in worktree)

### State Propagation
- Phase N: Load state → Execute work → Update fields → Save state
- Phase N+1: Load updated state → Continue
- All workflows visible in GitHub comments via ADW-ID tracking

## Configuration & Environment

### Required
- `ANTHROPIC_API_KEY`: Claude API access

### Optional (Recommended)
- `GITHUB_PAT`: Different GitHub account
- `CLAUDE_CODE_PATH`: Path to Claude CLI
- `E2B_API_KEY`: Cloud sandbox for E2E tests

### Optional (Features)
- `CLOUDFLARE_*`: R2 screenshot uploads
- `CLOUDFLARED_TUNNEL_TOKEN`: GitHub webhook exposure

## Enhancement Opportunities

### Multi-LLM Orchestration
1. Add `provider: str` field to ADWStateData
2. Extend agent.py with provider abstraction layer
3. New module: `adw_modules/llm_providers.py`
4. Support: Anthropic Claude, OpenAI, Gemini, etc.

### TDD Workflow Integration
1. New phase: `adw_test_first_iso.py` (before implementation)
2. Coverage tracking: Add to ADWStateData
3. Auto-patch on test failures: Enhanced retry loop
4. Continuous validation: Run tests after micro-steps

### State Management Improvements
1. Test results persistence: Add to ADWStateData
2. Coverage tracking: Coverage percentage and trends
3. Decision history: Track what was tried and why
4. Concurrent access: Add file locking mechanism

### Extensibility
1. Plugin system: Dynamic workflow loading
2. Conditional routing: Route based on complexity/metrics
3. Custom commands: Domain-specific slash commands
4. Profile support: Project-specific configurations

## Identified Gaps

### Documentation
- How to add new slash commands (process unclear)
- Model set selection guidance ("base" vs "heavy")
- Webhook trigger end-to-end flow (detailed steps missing)
- Error recovery procedures (partial state cleanup)

### Architecture
- No file locking for concurrent state access
- Worktree cleanup is "optional" (could accumulate)
- No rollback mechanism for merged changes
- No resource limits (timeouts/memory/CPU)

### Features
- No approval gates before auto-merge (ZTE is risky)
- No rollback capability for merged code
- No support for dependent branches
- Test results not persisted to state

## Success Criteria Met

✅ **Comprehensive understanding of architecture**: All workflow phases, modules, and integration points documented

✅ **Clear integration point documentation**: Claude Code commands, hooks, git operations, and state propagation fully analyzed

✅ **Identified enhancement opportunities**: Multi-LLM, TDD, state improvements, and extensibility options clearly defined

✅ **Complete file reference index**: All files with paths and key function locations documented

✅ **Execution flow clarity**: State transitions, input/output contracts, and composition patterns explained

## Next Steps for Implementation

1. **For Multi-LLM ADWS**:
   - Review `agent.py` model mapping strategy (lines 30-84)
   - Create provider abstraction in new module
   - Extend ADWStateData with provider field
   - Implement fallback chain logic

2. **For TDD Enhancement**:
   - Study `adw_test_iso.py` test orchestration (lines 68-150)
   - Add test result persistence to ADWStateData
   - Implement test-first phase before adw_build_iso
   - Create coverage tracking in state

3. **For Cookiecutter Integration**:
   - Use this architecture as template
   - Adapt worktree isolation for target project
   - Customize slash commands in `.claude/commands/`
   - Configure hooks for project-specific needs

---

**Analysis Date**: 2025-11-07  
**Codebase Size**: 7,150 Python lines  
**Analysis Coverage**: Complete (all 19 Python files examined)  
**Documentation**: Full architectural analysis, file references, and enhancement roadmap

---

**NOTE** Use --ultrathink mode for further deep analysis or specific implementation guidance.
