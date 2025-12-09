# Claude Code Hooks Reference

## Overview

Claude Code hooks are automated scripts that trigger during specific events in your development workflow. They enable validation, permission management, and custom logic at critical points in code execution.

## Configuration

Hooks are configured in settings files:
- `~/.claude/settings.json` (user level)
- `.claude/settings.json` (project level)
- `.claude/settings.local.json` (local, not committed)

### Basic Structure

```json
{
  "hooks": {
    "EventName": [
      {
        "matcher": "ToolPattern",
        "hooks": [
          {
            "type": "command",
            "command": "your-command-here"
          }
        ]
      }
    ]
  }
}
```

**Key components:**
- **matcher**: Pattern matching tool names (supports regex, case-sensitive)
- **type**: Either "command" for bash or "prompt" for LLM-based evaluation
- **timeout**: Optional execution limit in seconds

## Hook Types

### Bash Command Hooks
Execute shell scripts with JSON input via stdin. Return status through exit codes and stdout/stderr.

### Prompt-Based Hooks
Send decision-making tasks to a fast LLM (Haiku). Currently supported for `Stop` and `SubagentStop` events. The LLM responds with structured JSON containing approval/denial decisions.

## Supported Hook Events

| Event | Purpose |
|-------|---------|
| **PreToolUse** | After Claude creates tool parameters, before execution |
| **PermissionRequest** | When permission dialogs appear |
| **PostToolUse** | Immediately after successful tool completion |
| **Notification** | When Claude Code sends notifications |
| **UserPromptSubmit** | Before processing user prompts |
| **Stop** | When main agent finishes responding |
| **SubagentStop** | When subagents complete |
| **PreCompact** | Before context compaction operations |
| **SessionStart** | At session initialization |
| **SessionEnd** | When sessions terminate |

## Hook Input/Output

### Input Format
Hooks receive JSON via stdin containing:
```json
{
  "session_id": "string",
  "transcript_path": "string",
  "cwd": "string",
  "permission_mode": "default|plan|acceptEdits|bypassPermissions",
  "hook_event_name": "string"
}
```

### Output Handling

**Exit codes:**
- **0**: Success (stdout visible in verbose mode, except UserPromptSubmit/SessionStart where it adds context)
- **2**: Blocking error (only stderr used as error message)
- **Other**: Non-blocking error (stderr shown in verbose mode)

**JSON output** (exit code 0 only):
```json
{
  "decision": "approve|block|allow|deny",
  "reason": "explanation",
  "continue": true,
  "systemMessage": "optional warning"
}
```

## Common Use Cases

### File Protection
Prevent modifications to sensitive files using `PreToolUse` with Write/Edit matchers.

### Code Quality Validation
Run linters on `PostToolUse` for Write events to enforce style standards.

### Permission Automation
Use `PermissionRequest` hooks to auto-approve trusted operations based on patterns.

### Context Injection
Leverage `UserPromptSubmit` and `SessionStart` hooks to add project context automatically.

## Environment Variables

- `CLAUDE_PROJECT_DIR`: Absolute path to project root (available during hook execution)
- `CLAUDE_CODE_REMOTE`: "true" for web environments, empty for CLI
- `CLAUDE_ENV_FILE`: Path to persist variables (SessionStart only)

## Security Considerations

**Critical warning**: "Hooks execute arbitrary shell commands on your system automatically. You are solely responsible for reviewing and testing any configured commands."

Best practices:
- Validate and sanitize all inputs
- Use absolute paths for scripts
- Quote all shell variables
- Block path traversal patterns
- Avoid sensitive files (.env, .git, keys)
- Test thoroughly before production use

## MCP Tool Integration

MCP tools follow the naming pattern `mcp__<server>__<tool>`. You can match them using regex:

```json
{
  "matcher": "mcp__memory__.*",
  "hooks": [{"type": "command", "command": "script.sh"}]
}
```

## Debugging

Enable debugging with `claude --debug` to see detailed hook execution information. Hooks display execution progress in verbose mode (Ctrl+O).

**Check configuration** with `/hooks` command to verify hook registration.

---

*For practical examples and getting started guide, consult the Claude Code hooks guide documentation.*
