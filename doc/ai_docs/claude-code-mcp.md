# Connect Claude Code to Tools via MCP

Claude Code integrates with external tools and data sources through the **Model Context Protocol (MCP)**, an open standard for AI-tool connections. This enables access to hundreds of integrations.

## Capabilities

With MCP servers connected, Claude Code can:

- Implement features from issue trackers
- Analyze monitoring and usage data
- Query databases directly
- Integrate design systems
- Automate workflow tasks like email drafting

## Installation Methods

### HTTP Servers (Recommended)
Best for remote, cloud-based services:
```
claude mcp add --transport http <name> <url>
```

### SSE Servers (Deprecated)
Server-Sent Events transport—HTTP preferred:
```
claude mcp add --transport sse <name> <url>
```

### Local Stdio Servers
Run processes on your machine:
```
claude mcp add --transport stdio <name> -- <command>
```

## Management Commands

- `claude mcp list` — View all configured servers
- `claude mcp get <name>` — Details for specific server
- `claude mcp remove <name>` — Delete configuration
- `/mcp` — Check status within Claude Code

## Configuration Scopes

**Local** (default): Personal use in current project only

**Project**: Shared via `.mcp.json` in version control

**User**: Available across all projects on your machine

## Authentication

Many cloud services use OAuth 2.0. Use `/mcp` within Claude Code to authenticate securely—tokens refresh automatically.

## Enterprise Management

Administrators can deploy `managed-mcp.json` to standardize server access across organizations, with allowlist/denylist controls for security.

## Key Features

- Environment variable expansion in configurations
- Resource referencing via `@` mentions
- MCP prompts as slash commands
- Output limits with configurable `MAX_MCP_OUTPUT_TOKENS`
