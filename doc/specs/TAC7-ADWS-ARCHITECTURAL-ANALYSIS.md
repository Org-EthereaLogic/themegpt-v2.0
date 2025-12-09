# TAC-7 ADWS (AI Developer Workflow System) - Comprehensive Architectural Analysis

## Executive Summary

The TAC-7 ADWS is a sophisticated, modular automation system designed to orchestrate complete software development workflows using Claude Code and Git worktrees. The architecture prioritizes **isolated execution** through git worktrees, **persistent state management**, and **composable workflow orchestration**. Each workflow run is assigned a unique 8-character identifier (ADW-ID) that threads through all execution phases, enabling parallel, independent development across up to 15 concurrent instances with deterministically allocated port ranges. The system uses a clear separation of concerns between **workflow orchestration** (Python entry points), **LLM interaction** (Claude Code CLI bridge), **state persistence** (JSON-based state files), and **Git operations** (subprocess-based git commands).

**Key Architectural Decisions:**
1. **Isolated Worktree Model**: Every workflow runs in a separate git worktree (trees/{adw_id}/), preventing interference between parallel executions
2. **Persistent State Architecture**: Minimal state files (agents/{adw_id}/adw_state.json) enable workflow resumption and composition
3. **Composable Workflows**: Individual phases (plan, build, test, review, document, ship) can be chained together via state passing
4. **Model Selection Strategy**: Dynamic model routing (sonnet vs opus) based on workflow phase and ADW state configuration
5. **Hook-based Integration**: Claude Code hooks intercept tool use for telemetry and security validation

---

## Directory Structure Map

```
/Users/etherealogic/Dev/tac-7/
├── .claude/                              # Claude Code configuration
│   ├── commands/                         # Slash command definitions (35 commands)
│   │   ├── *.md                         # Individual command templates
│   │   └── e2e/                         # End-to-end test commands
│   ├── hooks/                           # Lifecycle hooks for Claude Code
│   │   ├── pre_tool_use.py             # Pre-execution validation/logging
│   │   ├── post_tool_use.py            # Post-execution tracking
│   │   ├── notification.py             # Event notifications
│   │   ├── pre_compact.py              # Context compaction hooks
│   │   ├── stop.py                     # Session termination hooks
│   │   ├── subagent_stop.py            # Sub-agent termination
│   │   ├── user_prompt_submit.py       # Prompt submission logging
│   │   └── utils/                      # Hook utilities
│   └── settings.json                   # Permissions and hook configuration
│
├── adws/                                # Core ADWS system
│   ├── adw_*_iso.py                    # Individual workflow scripts
│   │   ├── adw_plan_iso.py            # Planning phase (creates worktree)
│   │   ├── adw_build_iso.py           # Implementation phase
│   │   ├── adw_test_iso.py            # Testing phase
│   │   ├── adw_review_iso.py          # Review phase
│   │   ├── adw_document_iso.py        # Documentation phase
│   │   ├── adw_ship_iso.py            # Merge/ship phase
│   │   ├── adw_patch_iso.py           # Quick patch workflow
│   │   ├── adw_sdlc_iso.py            # Full SDLC orchestrator
│   │   └── adw_sdlc_zte_iso.py        # Zero-Touch Execution (auto-merge)
│   │
│   ├── adw_plan_build_iso.py          # Composable: plan + build
│   ├── adw_plan_build_test_iso.py     # Composable: plan + build + test
│   ├── adw_plan_build_test_review_iso.py  # Composable: plan + build + test + review
│   ├── adw_plan_build_review_iso.py   # Composable: plan + build + review
│   ├── adw_plan_build_document_iso.py # Composable: plan + build + document
│   │
│   ├── adw_modules/                   # Shared library modules
│   │   ├── __init__.py                # Package marker
│   │   ├── agent.py                   # Claude Code CLI bridge (561 lines)
│   │   ├── state.py                   # State persistence layer (172 lines)
│   │   ├── data_types.py              # Pydantic models (285 lines)
│   │   ├── workflow_ops.py            # Workflow orchestration (714 lines)
│   │   ├── git_ops.py                 # Git operations wrapper (316 lines)
│   │   ├── github.py                  # GitHub API integration (312 lines)
│   │   ├── worktree_ops.py            # Worktree/port management (242 lines)
│   │   ├── utils.py                   # Utility functions (241 lines)
│   │   └── r2_uploader.py             # Cloudflare R2 upload (125 lines)
│   │
│   ├── adw_triggers/                  # Event-based workflow triggers
│   │   ├── trigger_webhook.py         # GitHub webhook listener
│   │   └── trigger_cron.py            # Polling-based trigger
│   │
│   └── adw_tests/                     # Test utilities and health checks
│       ├── test_agents.py
│       ├── health_check.py
│       └── sandbox_poc.py
│
├── scripts/                            # Utility scripts
├── trees/                              # Git worktrees (created at runtime)
│   └── {adw_id}/                      # One worktree per workflow instance
├── agents/                             # Persistent state and artifacts (created at runtime)
│   └── {adw_id}/
│       ├── adw_state.json             # Persistent state file
│       ├── {agent_name}/
│       │   ├── prompts/               # Saved prompts for debugging
│       │   ├── raw_output.jsonl       # Claude Code raw output
│       │   └── raw_output.json        # Converted JSONL to JSON array
│       └── reviewer/
│           └── review_img/            # Review screenshots
│
├── .env.sample                         # Environment variable template
├── .mcp.json.sample                    # MCP configuration sample
├── .gitignore                          # Git ignore rules
└── README.md                           # Project documentation (23KB)
```

**Total Python Lines**: 7,150 lines across 19 files

---

## Core Workflow Analysis

### 1. Workflow Lifecycle Phases

All workflows follow this pattern, running in **isolated git worktrees** with **persistent state**:

```
Entry Point (Creates Worktree)
    ↓
    adw_plan_iso.py (creates trees/{adw_id}/, allocates ports)
    ├─→ Classifies issue (/chore, /bug, /feature)
    ├─→ Generates implementation plan
    ├─→ Commits plan
    └─→ Creates/updates PR
    
Dependent Workflows (Require Existing Worktree)
    ↓
    adw_build_iso.py (loads state, finds plan)
    ├─→ Implements plan from file
    ├─→ Commits implementation
    └─→ Updates PR
    
    adw_test_iso.py (validates implementation)
    ├─→ Runs test suite
    ├─→ Reports test results
    └─→ Updates PR with test status
    
    adw_review_iso.py (validates against spec)
    ├─→ Reviews implementation against spec file
    ├─→ Uploads screenshots to R2
    ├─→ Creates patch plans for issues if needed
    └─→ Updates PR with review status
    
    adw_document_iso.py (generates docs)
    ├─→ Analyzes git diff
    ├─→ Generates feature documentation
    └─→ Commits documentation
    
    adw_ship_iso.py (final approval & merge)
    ├─→ Validates all state fields populated
    ├─→ Merges to main (manual git merge)
    └─→ Posts success to issue

Orchestrators (Chain Multiple Phases)
    ↓
    adw_sdlc_iso.py: plan → build → test → review → document
    adw_sdlc_zte_iso.py: plan → build → test → review → document → ship (AUTO-MERGE)
    adw_plan_build_iso.py: plan → build
    adw_plan_build_test_iso.py: plan → build → test
    adw_plan_build_test_review_iso.py: plan → build → test → review
    adw_plan_build_review_iso.py: plan → build → review
    adw_plan_build_document_iso.py: plan → build → document
```

### 2. Key Workflow Files

#### Entry Point Workflows (Create Worktrees)

| File | Lines | Purpose | Location |
|------|-------|---------|----------|
| `adw_plan_iso.py` | 337 | Creates isolated worktree, generates implementation plan | /Users/etherealogic/Dev/tac-7/adws/adw_plan_iso.py |
| `adw_patch_iso.py` | ~350 | Quick patch workflow triggered by issue keyword | /Users/etherealogic/Dev/tac-7/adws/adw_patch_iso.py |

**Key Functions in adw_plan_iso.py:**
- `main()` (line 66-335): Entry point orchestrator
  - Loads/creates ADW ID and state
  - Validates environment variables
  - Creates git worktree
  - Allocates ports (deterministic: backend 9100+idx, frontend 9200+idx)
  - Classifies issue using `/classify_issue` command
  - Builds implementation plan using issue classification command (`/feature`, `/bug`, `/chore`)
  - Commits plan and pushes PR

#### Dependent Workflows (Require State)

| File | Lines | Purpose | Location |
|------|-------|---------|----------|
| `adw_build_iso.py` | ~350 | Implements plan from existing worktree | /Users/etherealogic/Dev/tac-7/adws/adw_build_iso.py |
| `adw_test_iso.py` | 881 | Runs test suite, handles retries | /Users/etherealogic/Dev/tac-7/adws/adw_test_iso.py |
| `adw_review_iso.py` | 534 | Reviews implementation, uploads screenshots | /Users/etherealogic/Dev/tac-7/adws/adw_review_iso.py |
| `adw_document_iso.py` | ~300 | Generates documentation | /Users/etherealogic/Dev/tac-7/adws/adw_document_iso.py |
| `adw_ship_iso.py` | 316 | Final approval, merges to main | /Users/etherealogic/Dev/tac-7/adws/adw_ship_iso.py |

#### Orchestrator Workflows (Chain Phases)

| File | Lines | Purpose | Location |
|------|-------|---------|----------|
| `adw_sdlc_iso.py` | 151 | Chain: plan → build → test → review → document | /Users/etherealogic/Dev/tac-7/adws/adw_sdlc_iso.py |
| `adw_sdlc_zte_iso.py` | 238 | Chain: plan → build → test → review → document → ship (AUTO-MERGE) | /Users/etherealogic/Dev/tac-7/adws/adw_sdlc_zte_iso.py |
| `adw_plan_build_iso.py` | 82 | Chain: plan → build | /Users/etherealogic/Dev/tac-7/adws/adw_plan_build_iso.py |
| `adw_plan_build_test_iso.py` | 106 | Chain: plan → build → test | /Users/etherealogic/Dev/tac-7/adws/adw_plan_build_test_iso.py |
| `adw_plan_build_test_review_iso.py` | 131 | Chain: plan → build → test → review | /Users/etherealogic/Dev/tac-7/adws/adw_plan_build_test_review_iso.py |
| `adw_plan_build_review_iso.py` | 106 | Chain: plan → build → review | /Users/etherealogic/Dev/tac-7/adws/adw_plan_build_review_iso.py |
| `adw_plan_build_document_iso.py` | ~150 | Chain: plan → build → document | /Users/etherealogic/Dev/tac-7/adws/adw_plan_build_document_iso.py |

### 3. State Transition Diagram

```
START
  ↓
adw_plan_iso creates worktree and initializes:
  agents/{adw_id}/adw_state.json = {
    adw_id: "a1b2c3d4",
    issue_number: "123",
    branch_name: "feat/add-auth-system-a1b2c3d4",
    issue_class: "/feature",
    worktree_path: "trees/a1b2c3d4",
    backend_port: 9103,
    frontend_port: 9203,
    plan_file: "specs/issue-123-adw-a1b2c3d4-sdlc_planner-add-auth.md",
    model_set: "base",
    all_adws: ["adw_plan_iso"]
  }
  ↓
Each subsequent workflow:
  1. Loads state via ADWState.load(adw_id)
  2. Validates worktree exists in state
  3. Updates state with new fields (e.g., test_results)
  4. Appends workflow name to all_adws list
  5. Saves state back to agents/{adw_id}/adw_state.json
  6. Posts updates to GitHub issue with state JSON
  ↓
Final state after complete SDLC:
  agents/{adw_id}/adw_state.json contains complete execution history
  all_adws: ["adw_plan_iso", "adw_build_iso", "adw_test_iso", "adw_review_iso", "adw_document_iso", "adw_ship_iso"]
```

### 4. Input/Output Contracts

#### adw_plan_iso.py
- **Input**: `<issue-number> [adw-id]`
- **Output**: 
  - Creates: `trees/{adw_id}/` (git worktree)
  - Creates: `agents/{adw_id}/adw_state.json`
  - Creates: GitHub PR with feature branch
  - Posts: Issue comments with ADW-ID tracking
- **State Impact**: Initializes adw_id, branch_name, plan_file, worktree_path, ports, issue_class

#### adw_build_iso.py
- **Input**: `<issue-number> <adw-id>` (REQUIRED - loads state)
- **Output**:
  - Modifies: Files in `trees/{adw_id}/` based on plan
  - Updates: GitHub PR with implementation
  - Updates: `agents/{adw_id}/adw_state.json`
- **State Impact**: Marks adw_build_iso in all_adws

#### adw_test_iso.py
- **Input**: `<issue-number> <adw-id> [--skip-e2e]`
- **Output**:
  - Executes tests in `trees/{adw_id}/`
  - Posts test results to issue
  - Updates: `agents/{adw_id}/adw_state.json`
- **State Impact**: (Optional) test_results field

#### adw_review_iso.py
- **Input**: `<issue-number> <adw-id> [--skip-resolution]`
- **Output**:
  - Reviews built code against spec
  - Uploads screenshots to R2
  - Creates patch plans if issues found
  - Updates: GitHub PR
- **State Impact**: Marks adw_review_iso in all_adws

#### adw_ship_iso.py
- **Input**: `<issue-number> <adw-id>`
- **Output**:
  - Validates all state fields are populated (NO None values)
  - Merges feature branch to main
  - Posts success to issue
  - Deletes worktree (optional cleanup)
- **State Impact**: Final state lock

---

## Core Module Architecture

### 1. State Management (adw_modules/state.py - 172 lines)

**Location**: `/Users/etherealogic/Dev/tac-7/adws/adw_modules/state.py`

**Key Class**: `ADWState`
- Constructor: `__init__(adw_id: str)` (line 20)
- Methods:
  - `update(**kwargs)` (line 34): Update state fields
  - `get(key, default=None)` (line 42): Retrieve value
  - `append_adw_id(adw_id)` (line 46): Track workflow execution history
  - `save(workflow_step=None)` (line 75): Persist to JSON file
  - `load(adw_id, logger=None)` (line 102): Load from JSON file
  - `from_stdin()` (line 137): Load from piped JSON
  - `to_stdout()` (line 158): Output as JSON for piping

**Core Fields** (from data_types.ADWStateData):
```python
adw_id: str                    # Required: unique workflow identifier
issue_number: Optional[str]    # GitHub issue being processed
branch_name: Optional[str]     # Git branch name
plan_file: Optional[str]       # Path to implementation plan (relative to worktree)
issue_class: Optional[str]     # Issue type: /chore, /bug, /feature
worktree_path: Optional[str]   # Absolute path to isolated worktree
backend_port: Optional[int]    # Allocated backend port (9100-9114)
frontend_port: Optional[int]   # Allocated frontend port (9200-9214)
model_set: Optional[str]       # Model selection: "base" (sonnet) or "heavy" (opus)
all_adws: List[str]            # Execution history: workflow names that have run
```

**State File Location**: `agents/{adw_id}/adw_state.json`

**Persistence Strategy**:
- File-based JSON storage
- Validated by Pydantic ADWStateData model
- Only core fields stored (no arbitrary data)
- Can be loaded/saved at any workflow phase
- Enables workflow resumption if failure occurs

### 2. LLM Integration (adw_modules/agent.py - 561 lines)

**Location**: `/Users/etherealogic/Dev/tac-7/adws/adw_modules/agent.py`

**Key Components**:

#### Model Selection Engine (lines 30-84)
```python
SLASH_COMMAND_MODEL_MAP = {
    "/classify_issue": {"base": "sonnet", "heavy": "sonnet"},
    "/implement": {"base": "sonnet", "heavy": "opus"},
    "/test": {"base": "sonnet", "heavy": "sonnet"},
    "/resolve_failed_test": {"base": "sonnet", "heavy": "opus"},
    "/review": {"base": "sonnet", "heavy": "sonnet"},
    "/document": {"base": "sonnet", "heavy": "opus"},
    "/chore": {"base": "sonnet", "heavy": "opus"},
    "/bug": {"base": "sonnet", "heavy": "opus"},
    "/feature": {"base": "sonnet", "heavy": "opus"},
    "/patch": {"base": "sonnet", "heavy": "opus"},
    # ... more commands
}

def get_model_for_slash_command(request, default="sonnet") -> str:
    # Loads ADW state to get model_set
    # Returns appropriate model (sonnet or opus)
```

**Key Functions**:
- `prompt_claude_code(request)` (line 304): Execute Claude Code CLI
- `prompt_claude_code_with_retry(request, max_retries=3)` (line 250): Retry logic for transient errors
- `execute_template(request)` (line 511): Execute slash command with args
- `parse_jsonl_output(output_file)` (line 162): Parse Claude Code JSONL output
- `get_model_for_slash_command(request)` (line 52): Dynamic model routing
- `save_prompt(prompt, adw_id, agent_name)` (line 225): Save prompts for debugging

**Claude Code CLI Integration** (lines 325-355):
```python
cmd = [CLAUDE_PATH, "-p", request.prompt]
cmd.extend(["--model", request.model])
cmd.extend(["--output-format", "stream-json"])
cmd.append("--verbose")

if request.working_dir:
    mcp_config_path = os.path.join(request.working_dir, ".mcp.json")
    if os.path.exists(mcp_config_path):
        cmd.extend(["--mcp-config", mcp_config_path])

result = subprocess.run(
    cmd,
    stdout=output_f,  # Stream to file
    stderr=subprocess.PIPE,
    text=True,
    env=env,
    cwd=request.working_dir,
)
```

**Output Processing**:
- Claude Code outputs JSONL format (stream-json)
- Each line is a JSON message: `{"type": "...", "message": {...}}`
- Result message structure: `{"type": "result", "is_error": bool, "result": str, "session_id": str}`
- Converted to JSON array for debugging: `agents/{adw_id}/{agent_name}/raw_output.json`

**Retry Strategy** (RetryCode enum):
- `CLAUDE_CODE_ERROR`: Transient CLI error
- `TIMEOUT_ERROR`: Command timeout
- `EXECUTION_ERROR`: Execution environment error
- `ERROR_DURING_EXECUTION`: Agent encountered error during execution
- `NONE`: Non-retryable error or success

### 3. Workflow Operations (adw_modules/workflow_ops.py - 714 lines)

**Location**: `/Users/etherealogic/Dev/tac-7/adws/adw_modules/workflow_ops.py`

**Key Functions**:

| Function | Lines | Purpose |
|----------|-------|---------|
| `format_issue_message()` | 50-57 | Format GitHub comments with ADW-ID tracking |
| `classify_issue()` | 107-155 | Classify issue type using /classify_issue command |
| `build_plan()` | 158-189 | Generate implementation plan |
| `implement_plan()` | 192-250 | Implement plan using /implement command |
| `find_spec_file()` | 300+ | Locate specification file in worktree |
| `generate_branch_name()` | 250+ | Generate descriptive branch names |
| `create_commit()` | 350+ | Create detailed commit messages |
| `ensure_adw_id()` | 400+ | Create or retrieve ADW ID with initial state |

**Agent Name Constants**:
```python
AGENT_PLANNER = "sdlc_planner"
AGENT_IMPLEMENTOR = "sdlc_implementor"
AGENT_CLASSIFIER = "issue_classifier"
AGENT_BRANCH_GENERATOR = "branch_generator"
AGENT_PR_CREATOR = "pr_creator"
```

**Available ADW Workflows** (line 31-46):
```python
AVAILABLE_ADW_WORKFLOWS = [
    "adw_plan_iso",
    "adw_patch_iso",
    "adw_build_iso",
    "adw_test_iso",
    "adw_review_iso",
    "adw_document_iso",
    "adw_ship_iso",
    "adw_sdlc_ZTE_iso",
    "adw_plan_build_iso",
    # ... more workflows
]
```

### 4. Git Operations (adw_modules/git_ops.py - 316 lines)

**Location**: `/Users/etherealogic/Dev/tac-7/adws/adw_modules/git_ops.py`

**Key Functions**:
| Function | Purpose | Lines |
|----------|---------|-------|
| `get_current_branch(cwd)` | Get current git branch | 15 |
| `push_branch(branch_name, cwd)` | Push to remote | 26 |
| `check_pr_exists(branch_name)` | Check if PR already exists | 41 |
| `create_branch(branch_name, cwd)` | Create/checkout branch | 72 |
| `commit_changes(message, cwd)` | Stage and commit all changes | 97 |
| `get_pr_number(branch_name)` | Get PR number for branch | 124 |
| `approve_pr(pr_number, logger)` | Approve PR via gh CLI | 157 |
| `merge_pr(pr_number, logger, merge_method)` | Merge PR (squash/merge/rebase) | 187 |
| `finalize_git_operations(state, logger, cwd)` | Complete workflow: push, create PR, post comments | 220+ |

**Working Directory Pattern**: All git operations accept optional `cwd` parameter
- Allows commands to run in worktree instead of main repo
- Example: `commit_changes(msg, cwd=worktree_path)`

### 5. Worktree & Port Management (adw_modules/worktree_ops.py - 242 lines)

**Location**: `/Users/etherealogic/Dev/tac-7/adws/adw_modules/worktree_ops.py`

**Key Functions**:
| Function | Purpose | Lines |
|----------|---------|-------|
| `create_worktree(adw_id, branch_name, logger)` | Create git worktree at trees/{adw_id} | 15 |
| `validate_worktree(adw_id, state)` | Verify worktree exists and is registered | 75 |
| `get_worktree_path(adw_id)` | Get absolute path to worktree | 107 |
| `remove_worktree(adw_id, logger)` | Delete worktree | 122 |
| `setup_worktree_environment()` | Create .ports.env file | 151 |
| `get_ports_for_adw(adw_id)` | Deterministically allocate ports | 176 |
| `is_port_available(port)` | Check if port is free | 200+ |
| `find_next_available_ports(adw_id)` | Find alternative ports if deterministic ones in use | 210+ |

**Port Allocation Strategy** (lines 176-198):
```python
def get_ports_for_adw(adw_id: str) -> Tuple[int, int]:
    # Convert first 8 chars of ADW ID to index (0-14)
    index = int(id_chars, 36) % 15
    backend_port = 9100 + index      # Range: 9100-9114
    frontend_port = 9200 + index     # Range: 9200-9214
    return backend_port, frontend_port
```

Supports up to 15 concurrent worktrees with deterministic, collision-free port assignment.

### 6. GitHub Integration (adw_modules/github.py - 312 lines)

**Location**: `/Users/etherealogic/Dev/tac-7/adws/adw_modules/github.py`

**Key Functions**:
| Function | Purpose | Lines |
|----------|---------|-------|
| `get_github_env()` | Get environment with GitHub token | 27 |
| `get_repo_url()` | Get repo from git remote origin | 55 |
| `extract_repo_path(github_url)` | Extract owner/repo from URL | 73 |
| `fetch_issue(issue_number, repo_path)` | Fetch issue details via gh CLI | 79 |
| `make_issue_comment(issue_id, comment)` | Post comment to issue | 126 |

**Data Models** (via Pydantic):
- `GitHubIssue`: Complete issue with title, body, author, labels, comments, dates
- `GitHubComment`: Comment with author, body, timestamps
- `GitHubUser`: User model with login and bot flag
- `GitHubLabel`: Label model
- `GitHubMilestone`: Milestone model

**Bot Identifier**: 
```python
ADW_BOT_IDENTIFIER = "[ADW-AGENTS]"  # Prevents webhook loops
```

---

## Integration Architecture

### 1. Claude Code Command Integration

**How Workflows Trigger Commands**:
```python
# Example from adw_plan_iso.py (line 233)
plan_response = build_plan(issue, issue_command, adw_id, logger, working_dir=worktree_path)

# Which calls (adw_modules/workflow_ops.py, line 158-189)
def build_plan(...) -> AgentPromptResponse:
    request = AgentTemplateRequest(
        agent_name=AGENT_PLANNER,
        slash_command=command,  # e.g., "/feature"
        args=[str(issue.number), adw_id, minimal_issue_json],
        adw_id=adw_id,
        working_dir=working_dir,  # Executes in worktree!
    )
    return execute_template(request)

# Which calls (adw_modules/agent.py, line 511-561)
def execute_template(request: AgentTemplateRequest) -> AgentPromptResponse:
    mapped_model = get_model_for_slash_command(request)  # Dynamic routing
    prompt = f"{request.slash_command} {' '.join(request.args)}"
    
    # Execute via Claude Code CLI
    subprocess.run(
        [CLAUDE_PATH, "-p", prompt, "--model", mapped_model, ...],
        cwd=request.working_dir,
    )
```

**Slash Commands Used**:
```
/classify_issue      → Determine issue type
/classify_adw        → Extract ADW workflow from text
/feature, /bug, /chore → Plan issue based on classification
/implement           → Build from plan
/test                → Run test suite
/resolve_failed_test → Fix failing tests
/test_e2e            → Run E2E browser tests
/resolve_failed_e2e_test → Fix E2E failures
/review              → Review spec vs implementation
/document            → Generate documentation
/commit              → Create commit messages
/pull_request        → Create PR descriptions
/patch               → Create quick patches
/install_worktree    → Setup isolated environment
/track_agentic_kpis  → Track KPIs
```

### 2. Hook Mechanisms (Claude Code Integration)

**Location**: `/Users/etherealogic/Dev/tac-7/.claude/hooks/`

**Hook Configuration** (settings.json, lines 23-100):
```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "uv run $CLAUDE_PROJECT_DIR/.claude/hooks/pre_tool_use.py || true"
          }
        ]
      }
    ],
    "PostToolUse": [...],
    "Notification": [...],
    "Stop": [...],
    "SubagentStop": [...],
    "PreCompact": [...],
    "UserPromptSubmit": [...]
  }
}
```

**Pre Tool Use Hook** (pre_tool_use.py, 144 lines):
- Runs before each tool execution
- Blocks dangerous commands:
  - `rm -rf` patterns
  - Access to `.env` files (allows `.env.sample`)
- Logs tool use events to session directory
- Exit codes: 0 = allow, 2 = block

### 3. Configuration Management

**Environment Variables** (.env.sample):
```bash
# REQUIRED
ANTHROPIC_API_KEY=sk-ant-...

# OPTIONAL
GITHUB_PAT=ghp_...                    # Override default gh login
CLAUDE_CODE_PATH=claude               # Path to Claude Code CLI
E2B_API_KEY=...                       # Agent Cloud Sandbox
CLOUDFLARE_ACCOUNT_ID=...             # R2 screenshot uploads
CLOUDFLARE_R2_ACCESS_KEY_ID=...
CLOUDFLARE_R2_SECRET_ACCESS_KEY=...
CLOUDFLARE_R2_BUCKET_NAME=...
CLOUDFLARE_R2_PUBLIC_DOMAIN=...
CLOUDFLARED_TUNNEL_TOKEN=...          # Cloudflare tunnel for webhooks
```

**Settings Configuration** (.claude/settings.json):
- Permissions: Allow/deny specific bash commands and operations
- Hooks: Pre/post tool use, notifications, context compaction
- Model selection defaults

### 4. Trigger Mechanisms

**Webhook Trigger** (adws/adw_triggers/trigger_webhook.py):
- Listens for GitHub webhook events
- Exposes webhook endpoint for GitHub push/issue events
- Launches ADW workflows based on event payload
- Requires: Cloudflare tunnel + webhook configuration

**Cron Trigger** (adws/adw_triggers/trigger_cron.py):
- Polls for workflow triggers
- Runs every 20 seconds (configurable)
- Non-blocking: multiple instances can run simultaneously

---

## Key Architectural Patterns

### 1. Separation of Concerns

| Component | Responsibility | Location |
|-----------|-----------------|----------|
| **Workflow Scripts** | Orchestration, state management, issue communication | adw_*_iso.py files |
| **Agent Module** | Claude Code CLI bridge, JSONL parsing, model selection | adw_modules/agent.py |
| **State Module** | Persistent state file I/O, validation | adw_modules/state.py |
| **Git Operations** | Git subprocess wrappers, branch/PR management | adw_modules/git_ops.py |
| **GitHub Integration** | GitHub API via gh CLI, issue/comment operations | adw_modules/github.py |
| **Worktree Management** | Worktree creation/cleanup, port allocation | adw_modules/worktree_ops.py |
| **Workflow Operations** | Shared workflow logic (plan, build, etc.) | adw_modules/workflow_ops.py |

### 2. Modularity & Composability

**Composable Unit**: Each workflow phase is independent and chainable
- Can run individually: `adw_build_iso.py 123 abc12345`
- Can be chained: `adw_plan_build_iso.py 123`
- Can be orchestrated: `adw_sdlc_zte_iso.py 123`

**Composition via State**:
- Worktree created by first workflow (adw_plan_iso)
- Subsequent workflows load state and reuse worktree
- Each workflow appends its name to all_adws
- Final state contains complete execution history

### 3. Error Handling & Resilience

**Retry Strategy** (agent.py):
- Transient errors: auto-retry with exponential backoff
- Non-retryable: immediate failure
- Max 3 retries by default, configurable

**Workflow-Level Error Handling**:
- Each phase validates preconditions
- Failed phase halts workflow, posts error to issue
- State saved at each step for recovery
- Worktree preserved for debugging

**Zero-Touch Execution Safety**:
- Test failures abort ZTE (prevent auto-merge)
- Ship phase validates ALL state fields populated
- Manual approval step before merge (optional)

### 4. Extensibility Mechanisms

**New Workflow Addition**:
1. Create `adw_new_phase_iso.py`
2. Load state from previous phase
3. Call workflow operations from `workflow_ops.py`
4. Update state and save
5. Return appropriate exit code

**New Command Integration**:
1. Add to `.claude/commands/` as `.md` file
2. Add model mapping in `agent.py` SLASH_COMMAND_MODEL_MAP
3. Call via `execute_template(AgentTemplateRequest(...))`

**New Integration Point**:
1. Add hook to `.claude/settings.json`
2. Implement hook handler in `.claude/hooks/`
3. Use exit codes for control flow (0=allow, 2=block)

### 5. Logging & Observability

**Logger Setup** (utils.py, lines 20-73):
```python
log_dir = agents/{adw_id}/{trigger_type}/
log_file = agents/{adw_id}/{trigger_type}/execution.log
```

**Multi-Level Output**:
- File logging: DEBUG and above
- Console logging: INFO and above
- GitHub comments: High-level status with ADW-ID
- State JSON: Complete workflow state snapshots

**Debugging Artifacts**:
- Prompts saved to: `agents/{adw_id}/{agent_name}/prompts/`
- Raw output: `agents/{adw_id}/{agent_name}/raw_output.jsonl`
- Converted JSON: `agents/{adw_id}/{agent_name}/raw_output.json`

---

## LLM Integration Patterns

### 1. Provider Abstraction

**Single Provider**: Anthropic Claude via Claude Code CLI
- No multi-provider abstraction layer currently
- Model selection via `agent.py` SLASH_COMMAND_MODEL_MAP
- Supports Claude Sonnet and Claude Opus

**Future Multi-LLM Considerations**:
- Add provider enum to ADWStateData
- Extend SLASH_COMMAND_MODEL_MAP to include provider
- Wrapper function in `agent.py` to route to correct provider

### 2. Prompt Management

**Prompt Structure**:
```python
prompt = f"{slash_command} {' '.join(args)}"
# Example: "/feature 123 abc12345 {\"number\": 123, \"title\": \"...\", \"body\": \"...\"}"
```

**Prompt Storage**:
- Saved before execution: `agents/{adw_id}/{agent_name}/prompts/{command_name}.txt`
- Enables debugging and auditing
- Timestamp available via parent directory modification time

**Command Templates** (Claude Code):
- Defined in `.claude/commands/` as Markdown files
- Support variable substitution: `$1`, `$2`, `$ARGUMENTS`
- Support: `/feature`, `/bug`, `/chore`, `/implement`, `/test`, etc.

### 3. Response Processing

**Output Format**: JSONL (JSON Lines) from Claude Code
```
{"type": "user", "message": {...}}
{"type": "assistant", "message": {...}}
{"type": "tool_call", "tool": "Bash", "input": {...}}
{"type": "tool_result", "content": "..."}
...
{"type": "result", "result": "Final output", "is_error": false, "session_id": "..."}
```

**Processing Pipeline** (agent.py):
1. Execute Claude Code CLI → outputs JSONL to file
2. Parse JSONL via `parse_jsonl_output()` → extract result message
3. Convert JSONL to JSON array for debugging
4. Extract result field or error message
5. Return `AgentPromptResponse` with success flag and retry code

**Result Validation**:
- JSON parsing: Pydantic models where applicable
- Markdown unwrapping: Handles ```json...``` blocks
- Type validation: List[TestResult], ReviewResult, etc.

### 4. Model Selection Strategy

**Current Mapping** (agent.py lines 30-49):
```python
SLASH_COMMAND_MODEL_MAP = {
    # Most commands: Sonnet for base, Opus for heavy (complex tasks)
    "/implement": {"base": "sonnet", "heavy": "opus"},
    "/resolve_failed_test": {"base": "sonnet", "heavy": "opus"},
    "/review": {"base": "sonnet", "heavy": "sonnet"},
    "/document": {"base": "sonnet", "heavy": "opus"},
    "/chore": {"base": "sonnet", "heavy": "opus"},
    "/bug": {"base": "sonnet", "heavy": "opus"},
    "/feature": {"base": "sonnet", "heavy": "opus"},
    "/patch": {"base": "sonnet", "heavy": "opus"},
    # Classification: always Sonnet
    "/classify_issue": {"base": "sonnet", "heavy": "sonnet"},
    "/classify_adw": {"base": "sonnet", "heavy": "sonnet"},
}
```

**Model Set Selection**:
- Default: "base" (Sonnet for fast execution)
- Can override: Set `model_set: "heavy"` in state
- Loaded at command execution time

---

## State Management & Persistence

### 1. State File Structure

**Location**: `agents/{adw_id}/adw_state.json`

**Example Full State**:
```json
{
  "adw_id": "a1b2c3d4",
  "issue_number": "123",
  "branch_name": "feat/add-auth-system-a1b2c3d4",
  "plan_file": "specs/issue-123-adw-a1b2c3d4-sdlc_planner-add-auth.md",
  "issue_class": "/feature",
  "worktree_path": "/Users/etherealogic/Dev/tac-7/trees/a1b2c3d4",
  "backend_port": 9103,
  "frontend_port": 9203,
  "model_set": "base",
  "all_adws": [
    "adw_plan_iso",
    "adw_build_iso",
    "adw_test_iso",
    "adw_review_iso"
  ]
}
```

### 2. State Lifecycle

```
CREATE (adw_plan_iso)
  ↓
ADWState.__init__(adw_id)
  → data = {"adw_id": adw_id}
  
UPDATE (each workflow)
  ↓
state.update(branch_name=x, worktree_path=y, ...)
  → Updates in-memory dict
  
SAVE (periodic + at phase end)
  ↓
state.save(workflow_step="adw_plan_iso")
  → Creates agents/{adw_id}/ directory
  → Writes validated ADWStateData JSON
  
LOAD (dependent workflows)
  ↓
ADWState.load(adw_id, logger)
  → Reads agents/{adw_id}/adw_state.json
  → Validates with Pydantic
  → Returns ADWState instance or None
  
APPEND (track execution)
  ↓
state.append_adw_id("adw_build_iso")
  → Adds to all_adws list if not present
  → Prevents duplicates
```

### 3. Worktree Isolation Strategy

**Key Isolation Aspects**:

| Aspect | Isolation Mechanism |
|--------|-------------------|
| **Filesystem** | Separate git worktree at `trees/{adw_id}/` |
| **Git Branch** | Separate feature branch per workflow |
| **Ports** | Deterministic allocation: backend 9100+idx, frontend 9200+idx |
| **Environment** | `.ports.env` file in worktree root |
| **State** | Separate `agents/{adw_id}/adw_state.json` |
| **Logs** | Separate `agents/{adw_id}/{trigger_type}/execution.log` |
| **Concurrency** | Up to 15 simultaneous instances without port conflicts |

**Recovery/Resume Capability**:
- ADW-ID can be reused to resume interrupted workflow
- State file contains all previous progress
- Worktree preserved until cleanup
- Can manually inspect worktree contents

---

## Configuration Management

### 1. Environment Variable Usage

**Required**:
- `ANTHROPIC_API_KEY`: Claude API access

**Optional but Recommended**:
- `GITHUB_PAT`: Use different GitHub account
- `CLAUDE_CODE_PATH`: Path to Claude CLI if not in PATH
- `E2B_API_KEY`: Cloud sandbox for E2E tests

**Optional for Features**:
- R2 Upload: CLOUDFLARE_* variables
- Webhooks: CLOUDFLARED_TUNNEL_TOKEN

### 2. Default vs Custom Configuration

**Defaults**:
- Model set: "base" (Sonnet)
- Port range: 9100-9114 (backend), 9200-9214 (frontend)
- Max test retries: 4
- Max review retries: 3
- Merge method: squash

**Customization Points**:
- `model_set` in ADW state → changes model routing
- Command templates in `.claude/commands/` → customize behavior
- Hook configuration in `.claude/settings.json` → customize integration
- Environment variables → configure credentials and paths

### 3. Profile Support

**Currently**: No explicit profile system
**Could Be Added**:
- Add `profile: str` field to ADWStateData
- Load profile-specific config from config directory
- Override defaults per profile

---

## Integration Points Summary

### 1. Entry Point: GitHub Issues

**Trigger Path**:
```
GitHub Issue Created/Updated
  ↓ (Webhook or Manual)
adw_*_iso.py entry point
  ↓
Creates ADW-ID and state
  ↓
Fetches issue details via `gh` CLI
  ↓
Posts comments with ADW-ID tracking
  ↓
Updates PR status in real-time
```

### 2. Claude Code Integration

**Execution Path**:
```
execute_template(AgentTemplateRequest)
  ↓
Loads ADW state to get model_set
  ↓
Routes to correct model via SLASH_COMMAND_MODEL_MAP
  ↓
Executes: claude -p "slash_command args" --model MODEL
  ↓
Parses JSONL output
  ↓
Returns AgentPromptResponse with success/retry code
```

### 3. Git Workflow Integration

**Per-Worktree Execution**:
```
all git operations accept working_dir parameter
  ↓
"cd trees/{adw_id}/" context preserved
  ↓
All changes isolated to worktree
  ↓
Final merge happens in main repo (adw_ship_iso)
```

### 4. State Propagation

**Between Phases**:
```
Phase N:
  1. Loads agents/{adw_id}/adw_state.json
  2. Validates worktree from state
  3. Performs work in worktree
  4. Updates state fields
  5. Saves agents/{adw_id}/adw_state.json
  ↓
Phase N+1:
  1. Loads updated state
  2. Continues from where N left off
  3. Append to all_adws
  4. Repeat...
```

---

## Enhancement Opportunities for Multi-LLM & TDD

### 1. Multi-LLM Orchestration Integration Points

**Opportunity 1**: Extended Provider Support
- Add `provider: str` field to ADWStateData
- Extend `agent.py` with provider abstraction
- Possible locations:
  - `/Users/etherealogic/Dev/tac-7/adws/adw_modules/llm_providers.py` (new)
  - Route based on provider in `execute_template()`
  - Support: Anthropic Claude, OpenAI GPT, Gemini, etc.

**Opportunity 2**: Multi-Model Orchestration
- Complex tasks could use ensemble approach
- Route `/implement` to multiple models for comparison
- Select best result based on test outcomes
- Location: New `adw_modules/orchestration.py`

**Opportunity 3**: Fallback Chain
- Primary: Claude Opus
- Secondary: Claude Sonnet
- Tertiary: Alternative provider
- Location: Enhanced `agent.py` retry logic

### 2. TDD Workflow Integration Points

**Opportunity 1**: Test-First Phase
- New workflow: `adw_test_first_iso.py`
- Generates test specs before implementation
- Routes through existing `/test` command
- Location: Insert between plan and build phases

**Opportunity 2**: Continuous Test Validation
- Run tests after every implementation micro-step
- Fail fast on test regression
- Location: Hook into `adw_build_iso.py` step-by-step execution

**Opportunity 3**: Coverage-Driven Planning
- Plan phase generates test cases
- Implementation must satisfy test coverage threshold
- Location: Extend `adw_modules/workflow_ops.py` with coverage tracking

**Opportunity 4**: Test Result Feedback Loop
- Failed tests → automatic patch generation
- Patches tested immediately
- Location: Enhanced `adw_test_iso.py` with auto-patch trigger

### 3. State Management Improvements

**Opportunity 1**: Test Results Persistence
- Current: Test results not persisted to state
- Improvement: Add `test_results: List[TestResult]` to state
- Benefits: Resume testing, track regressions
- Location: `adw_modules/data_types.py` ADWStateData

**Opportunity 2**: Coverage Tracking
- Add `coverage_percentage: float` to state
- Track coverage improvements over time
- Location: ADWStateData + `adw_test_iso.py`

**Opportunity 3**: Decision History
- Add `decisions: List[Dict]` to state
- Track what was tried, what worked, why chosen
- Benefits: Learning, audit trail
- Location: ADWStateData + workflow scripts

### 4. Extensibility Enhancements

**Opportunity 1**: Plugin System
- Define interface for custom phases
- Load dynamically: `workflows/{custom_phase}.py`
- Register in `workflow_ops.AVAILABLE_ADW_WORKFLOWS`
- Location: New `adw_modules/plugin_loader.py`

**Opportunity 2**: Conditional Workflow Routing
- Based on issue complexity, route to different models
- Based on test results, run different phases
- Location: Enhanced decision logic in orchestrators

**Opportunity 3**: Custom Commands Framework
- Generate slash commands dynamically
- Domain-specific commands for specific projects
- Location: `.claude/commands/` with templating

---

## Identified Gaps & Unclear Areas

### 1. Documentation Gaps

**What's Missing**:
- How to add new slash commands (process + template)
- How to customize model routing per project
- How webhook trigger works end-to-end (file references vague)
- E2E test infrastructure setup (E2B_API_KEY usage unclear)
- R2 uploader credential setup (detailed steps missing)

**What's Ambiguous**:
- When to use "base" vs "heavy" model set (no guidance)
- How to debug failed Claude Code executions (JSONL format assumed knowledge)
- What happens if worktree cleanup fails (partial state cleanup)
- How to handle concurrent access to state files (no locking mechanism)

### 2. Architectural Ambiguities

**State Locking**: No mention of file locking for concurrent state access
- Risk: Two workflows writing state simultaneously
- Mitigation: ADW-ID uniqueness should prevent this, but not enforced

**Worktree Cleanup**: When is worktree deleted?
- adw_ship_iso mentions "optional cleanup"
- No automatic cleanup mechanism found
- Could accumulate trees/ directory

**Error Recovery**: What to do if workflow fails mid-execution?
- State is left in partial state
- Worktree exists but may be in inconsistent state
- Documentation doesn't address recovery procedure

### 3. Missing Features

**Multi-Branch Workflows**: 
- No support for dependent branches or subworkflows
- All workflows operate on single feature branch

**Rollback Capability**:
- No mechanism to revert merged changes
- No rollback command in ADWS

**Approval Gates**:
- adw_ship_iso validates state but no human approval
- Zero-Touch Execution (ZTE) skips all approval

**Resource Limits**:
- No timeout enforcement on individual phases
- No memory/CPU limits for Claude Code execution

---

## File Reference Index

### Core Workflow Scripts

| File | Lines | Key Functions | Location |
|------|-------|----------------|----------|
| adw_plan_iso.py | 337 | main() | /Users/etherealogic/Dev/tac-7/adws/adw_plan_iso.py:66 |
| adw_build_iso.py | ~350 | main() | /Users/etherealogic/Dev/tac-7/adws/adw_build_iso.py:47 |
| adw_test_iso.py | 881 | run_tests(), parse_test_results() | /Users/etherealogic/Dev/tac-7/adws/adw_test_iso.py:68 |
| adw_review_iso.py | 534 | run_review(), upload_review_screenshots() | /Users/etherealogic/Dev/tac-7/adws/adw_review_iso.py:71 |
| adw_document_iso.py | ~300 | generate_documentation() | /Users/etherealogic/Dev/tac-7/adws/adw_document_iso.py:99 |
| adw_ship_iso.py | 316 | main(), manual_merge_to_main() | /Users/etherealogic/Dev/tac-7/adws/adw_ship_iso.py:36 |
| adw_sdlc_iso.py | 151 | main() | /Users/etherealogic/Dev/tac-7/adws/adw_sdlc_iso.py:36 |
| adw_sdlc_zte_iso.py | 238 | main() | /Users/etherealogic/Dev/tac-7/adws/adw_sdlc_zte_iso.py:36 |

### Core Modules

| File | Lines | Key Classes/Functions | Location |
|------|-------|---------------------|----------|
| agent.py | 561 | execute_template(), prompt_claude_code(), get_model_for_slash_command() | /Users/etherealogic/Dev/tac-7/adws/adw_modules/agent.py:511 |
| state.py | 172 | ADWState class, save(), load() | /Users/etherealogic/Dev/tac-7/adws/adw_modules/state.py:15 |
| data_types.py | 285 | ADWStateData, AgentTemplateRequest, ReviewResult | /Users/etherealogic/Dev/tac-7/adws/adw_modules/data_types.py:1 |
| workflow_ops.py | 714 | classify_issue(), build_plan(), implement_plan() | /Users/etherealogic/Dev/tac-7/adws/adw_modules/workflow_ops.py:50 |
| git_ops.py | 316 | commit_changes(), finalize_git_operations(), merge_pr() | /Users/etherealogic/Dev/tac-7/adws/adw_modules/git_ops.py:15 |
| github.py | 312 | fetch_issue(), make_issue_comment() | /Users/etherealogic/Dev/tac-7/adws/adw_modules/github.py:79 |
| worktree_ops.py | 242 | create_worktree(), get_ports_for_adw() | /Users/etherealogic/Dev/tac-7/adws/adw_modules/worktree_ops.py:15 |
| utils.py | 241 | setup_logger(), parse_json(), check_env_vars() | /Users/etherealogic/Dev/tac-7/adws/adw_modules/utils.py:20 |

### Configuration Files

| File | Purpose | Location |
|------|---------|----------|
| .env.sample | Environment variable template | /Users/etherealogic/Dev/tac-7/.env.sample |
| .claude/settings.json | Permissions and hook configuration | /Users/etherealogic/Dev/tac-7/.claude/settings.json:1 |
| .mcp.json.sample | MCP configuration sample | /Users/etherealogic/Dev/tac-7/.mcp.json.sample |

### Slash Commands

| Command | File | Purpose | Lines |
|---------|------|---------|-------|
| /feature | /Users/etherealogic/Dev/tac-7/.claude/commands/feature.md | Plan feature implementation | 100+ |
| /bug | /Users/etherealogic/Dev/tac-7/.claude/commands/bug.md | Plan bug fix | 150+ |
| /chore | /Users/etherealogic/Dev/tac-7/.claude/commands/chore.md | Plan chore task | 100+ |
| /implement | /Users/etherealogic/Dev/tac-7/.claude/commands/implement.md | Implement from plan | 12 |
| /test | /Users/etherealogic/Dev/tac-7/.claude/commands/test.md | Run test suite | 50+ |
| /review | /Users/etherealogic/Dev/tac-7/.claude/commands/review.md | Review implementation | 80+ |
| /document | /Users/etherealogic/Dev/tac-7/.claude/commands/document.md | Generate documentation | 100+ |

### Hooks

| Hook | File | Type | Purpose |
|------|------|------|---------|
| PreToolUse | /Users/etherealogic/Dev/tac-7/.claude/hooks/pre_tool_use.py | Python | Validates dangerous commands, logs tool use |
| PostToolUse | /Users/etherealogic/Dev/tac-7/.claude/hooks/post_tool_use.py | Python | Tracks tool execution metrics |
| UserPromptSubmit | /Users/etherealogic/Dev/tac-7/.claude/hooks/user_prompt_submit.py | Python | Logs user prompts |

---

## Questions & Items Requiring Human Review

1. **Webhook Implementation Details**: The trigger_webhook.py file is mentioned but code not examined. How does it map GitHub events to ADW workflows?

2. **Concurrent State Access**: What prevents race conditions when multiple workflows try to access/write the same state file?

3. **Worktree Cleanup**: Is there an automated cleanup mechanism, or must users manually clean up trees/ directory?

4. **Error Recovery**: What's the recommended procedure if a workflow fails mid-execution? Can you safely resume?

5. **Model Set Selection UX**: Users must manually set model_set in state. Should there be a command-line flag or automatic detection based on complexity?

6. **Test Result Persistence**: Test results are reported to GitHub but not persisted to state. Should they be for tracking regressions?

7. **Alternative Providers**: Is the architecture intended to eventually support multi-provider LLM selection?

8. **Custom Commands**: What's the process for adding new slash commands to .claude/commands/ for project-specific workflows?

9. **Security**: Should there be additional validation on state fields before critical operations like adw_ship_iso merge?

10. **Documentation Generation**: How does conditional_docs.md work? Is it automatic or manual trigger?

