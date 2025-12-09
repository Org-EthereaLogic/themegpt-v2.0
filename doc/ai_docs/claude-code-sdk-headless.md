# Claude Code SDK Headless Mode - Complete Guide

Based on the official documentation at https://docs.claude.com/en/docs/claude-code/sdk/sdk-headless, here's a comprehensive overview:

## What is Headless Mode?

Headless mode enables you to **run Claude Code programmatically from command line scripts and automation tools without any interactive UI**. This is ideal for:
- CI/CD pipelines
- Automated agents
- Backend integrations
- SRE incident response
- Security audits
- Batch processing tasks

## Installation & Setup

No special installation required beyond the standard Claude Code CLI. Headless mode is activated using the `--print` (or `-p`) flag.

## Core API Usage

### Basic Syntax
```bash
claude -p "Your prompt here" \
  --allowedTools "Bash,Read" \
  --permission-mode acceptEdits
```

### Essential Configuration Flags

| Flag | Purpose | Example |
|------|---------|---------|
| `--print`, `-p` | Enable non-interactive mode | `claude -p "query"` |
| `--output-format` | Specify response format (text, json, stream-json) | `--output-format json` |
| `--resume` | Resume conversation by session ID | `--resume abc123` |
| `--continue` | Continue most recent conversation | `--continue` |
| `--allowedTools` | Restrict available tools | `--allowedTools "Bash,Read"` |
| `--mcp-config` | Load MCP servers from JSON | `--mcp-config servers.json` |
| `--append-system-prompt` | Add custom system instructions (only works with `--print`) | `--append-system-prompt "You are an expert..."` |

## Output Formats

### 1. Text Output (Default)
```bash
claude -p "Explain file src/components/Header.tsx"
```
Returns plain text response suitable for human reading.

### 2. JSON Output
```bash
claude -p "How does the data layer work?" --output-format json
```

**Response Structure:**
```json
{
  "type": "result",
  "subtype": "success",
  "total_cost_usd": 0.003,
  "is_error": false,
  "duration_ms": 1234,
  "num_turns": 6,
  "result": "The response text here...",
  "session_id": "abc123"
}
```

### 3. Streaming JSON Output
```bash
claude -p "Build an application" --output-format stream-json
```
Streams messages as received, beginning with `init` system message. Useful for long-running operations.

## Input Formats

### Text Input (Default)
```bash
# Direct
claude -p "Explain this code"

# Piped
echo "Explain this code" | claude -p
```

### Streaming JSON Input
```bash
echo '{"type":"user","message":{"role":"user","content":[{"type":"text","text":"Explain this code"}]}}' \
  | claude -p --output-format=stream-json --input-format=stream-json
```
Uses JSONL format for multiple conversational turns.

## Multi-Turn Conversations

Maintain context across multiple invocations:

```bash
# Continue most recent conversation
claude --continue "Now refactor this for better performance"

# Resume specific session by ID
claude --resume 550e8400-e29b-41d4-a716-446655440000 "Update the tests"

# Resume non-interactively
claude --resume SESSION_ID "Fix all linting issues" --no-interactive
```

## Real-World Integration Examples

### 1. SRE Incident Response
```bash
#!/bin/bash
investigate_incident() {
    local incident_description="$1"
    local severity="${2:-medium}"

    claude -p "Incident: $incident_description (Severity: $severity)" \
      --append-system-prompt "You are an SRE expert. Diagnose the issue..." \
      --output-format json \
      --allowedTools "Bash,Read,WebSearch,mcp__datadog" \
      --mcp-config monitoring-tools.json
}
```

### 2. Security PR Review
```bash
audit_pr() {
    local pr_number="$1"
    gh pr diff "$pr_number" | claude -p \
      --append-system-prompt "You are a security engineer..." \
      --output-format json \
      --allowedTools "Read,Grep,WebSearch"
}
audit_pr 123 > security-report.json
```

### 3. Multi-Turn Legal Assistant
```bash
# Capture session ID from first invocation
session_id=$(claude -p "Start legal review session" \
  --output-format json | jq -r '.session_id')

# Continue conversation with context
claude -p --resume "$session_id" "Review contract.pdf for liability clauses"
claude -p --resume "$session_id" "Check GDPR compliance"
claude -p --resume "$session_id" "Generate executive summary"
```

## Best Practices

1. **Parse JSON responses programmatically**: Use tools like `jq` for structured output handling
2. **Handle errors gracefully**: Monitor exit codes and stderr
3. **Leverage session management**: Maintain context across multiple turns using `--resume`
4. **Set timeouts**: Use `timeout 300` for long operations to prevent hangs
5. **Respect rate limits**: Add delays between multiple requests
6. **Use tool restrictions**: Limit available tools with `--allowedTools` for security
7. **Capture session IDs**: Store session IDs for multi-turn workflows

## Important Limitations & Notes

- The `--append-system-prompt` flag only works with `--print` mode
- Tool restrictions accept space-separated or comma-separated lists
- Exit codes indicate success/failure for proper error handling
- Session IDs persist conversations across invocations
- Use `--no-interactive` to ensure fully non-interactive execution
