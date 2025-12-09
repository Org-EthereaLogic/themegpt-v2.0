# Subagents - Claude Code Documentation

## Overview

Subagents are specialized AI assistants that Claude Code can delegate tasks to. Each subagent operates with its own context window, custom system prompt, and configurable tool access, enabling more efficient task-specific problem-solving.

## Key Benefits

**Context Preservation**: Each subagent maintains a separate context, preventing conversation pollution and keeping focus on high-level objectives.

**Specialized Expertise**: Fine-tuned instructions for specific domains lead to higher success rates on designated tasks.

**Reusability**: Once created, subagents work across projects and teams for consistent workflows.

**Flexible Permissions**: Different tool access levels allow limiting powerful tools to specific subagent types.

## Quick Start

1. **Open subagents interface**: Run `/agents`
2. **Create new agent**: Choose project-level or user-level scope
3. **Define the subagent**: Describe purpose, select tools, customize system prompt
4. **Save and use**: Claude invokes automatically or explicitly

## File Structure

Subagents are Markdown files with YAML frontmatter stored in:
- **Project level**: `.claude/agents/` (highest priority)
- **User level**: `~/.claude/agents/` (lower priority)

## Configuration Format

```markdown
---
name: agent-name
description: When to invoke this agent
tools: tool1, tool2, tool3  # Optional
model: sonnet  # Optional - sonnet, opus, haiku, or inherit
permissionMode: default  # Optional
skills: skill1, skill2  # Optional
---

System prompt content here...
```

## Configuration Fields

| Field | Required | Purpose |
|-------|----------|---------|
| `name` | Yes | Unique lowercase identifier with hyphens |
| `description` | Yes | Natural language purpose statement |
| `tools` | No | Comma-separated list; omit to inherit all |
| `model` | No | Model alias or 'inherit'; defaults to sonnet |
| `permissionMode` | No | default, acceptEdits, bypassPermissions, plan, ignore |
| `skills` | No | Auto-loaded skills for the subagent |

## Built-in Subagents

### General-Purpose Agent
- Model: Sonnet
- Capabilities: Exploration and modification
- Use for: Complex multi-step tasks requiring code changes

### Plan Agent
- Model: Sonnet
- Tools: Read, Glob, Grep, Bash (research-focused)
- Use in: Plan mode for codebase analysis

### Explore Agent
- Model: Haiku (fast, low-latency)
- Mode: Strictly read-only
- Use for: Quick codebase searching without modifications

## Managing Subagents

### Via `/agents` Command (Recommended)
Interactive interface for viewing, creating, editing, and deleting subagents with tool permission management.

### Direct File Management
Create files manually in `.claude/agents/` or `~/.claude/agents/` directories.

### CLI Configuration
Pass subagent definitions via `--agents` flag with JSON:

```bash
claude --agents '{
  "code-reviewer": {
    "description": "Expert code reviewer",
    "prompt": "You are a senior code reviewer...",
    "tools": ["Read", "Grep", "Glob", "Bash"],
    "model": "sonnet"
  }
}'
```

## Using Subagents

**Automatic Delegation**: Claude proactively delegates based on task descriptions matching subagent expertise.

**Explicit Invocation**: Request specific subagents directly—"Use the code-reviewer subagent to check my changes."

## Example Subagents

### Code Reviewer
Specialized for quality, security, and maintainability review with read-only tools.

### Debugger
Root cause analysis for errors and test failures with edit capabilities.

### Data Scientist
SQL and BigQuery analysis with bash and file tools.

## Best Practices

- Start with Claude-generated agents, then customize
- Design focused single-responsibility subagents
- Write detailed, specific system prompts
- Limit tool access to necessary permissions only
- Version control project subagents for team collaboration

## Advanced Features

**Chaining**: Sequence multiple subagents for complex workflows.

**Dynamic Selection**: Claude intelligently selects subagents based on context.

**Resumable Agents**: Continue previous conversations using agent IDs for long-running tasks.

## Performance Considerations

- Agents preserve main conversation context efficiently
- Subagents start fresh each invocation, potentially adding latency
- Beneficial for longer overall sessions by maintaining main context
