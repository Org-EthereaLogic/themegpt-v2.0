# Claude Code Slash Commands

## Overview

Slash commands control Claude's behavior during interactive sessions. They're formatted as `/<command-name> [arguments]` and include both built-in commands and custom user-defined options.

## Built-in Commands

Key built-in commands include:

- **Session Management**: `/clear`, `/exit`, `/resume`, `/rewind`
- **Configuration**: `/config`, `/settings`, `/model`, `/permissions`
- **Development**: `/review`, `/security-review`, `/doctor`
- **Information**: `/help`, `/status`, `/context`, `/cost`, `/usage`
- **Integration**: `/mcp`, `/plugin`, `/ide`, `/install-github-app`
- **File Operations**: `/add-dir`, `/export`, `/memory`

## Custom Slash Commands

Users can define frequently-used prompts as Markdown files in two locations:

**Project-level** (`.claude/commands/`): Shared with team members
**Personal** (`~/.claude/commands/`): Available across all projects

### Features

**Namespacing**: Organize commands in subdirectories for better structure without affecting the command name itself.

**Arguments**: Support dynamic values using `$ARGUMENTS` for all args or `$1`, `$2` for specific positions—similar to shell scripts.

**Bash Integration**: Execute commands with the `!` prefix; output includes in context. Requires "allowed-tools" frontmatter specification.

**File References**: Use `@` prefix to include file contents in commands.

## Frontmatter Options

Commands support metadata via frontmatter:

- `allowed-tools`: Specify permitted tools
- `description`: Brief command description
- `argument-hint`: Expected arguments for auto-completion
- `model`: Override conversation model
- `disable-model-invocation`: Prevent Claude from calling this command

## Plugin Commands

Plugins distribute custom slash commands through marketplaces. They support namespacing via `/ plugin-name:command-name` format and integrate all standard features (arguments, bash execution, file references).

## MCP Slash Commands

MCP servers expose prompts as slash commands following the pattern `/mcp__<server-name>__<prompt-name>`. Commands are dynamically discovered and support arguments defined by the server. Use `/mcp` to manage MCP connections and authentication.

## SlashCommand Tool

The `SlashCommand` tool allows Claude to programmatically invoke custom commands. It requires command descriptions and respects permission rules supporting exact and prefix matching (e.g., `SlashCommand:/review-pr:*`).

The tool includes a 15,000-character budget (customizable via environment variables) to manage context when many commands are available.

## Skills vs. Slash Commands

**Slash Commands**: Simple, single-file prompts for frequent quick use cases.

**Skills**: Complex, multi-file capabilities with scripts, templates, and organized reference material that Claude discovers automatically.

Choose slash commands for explicit invocation; choose skills for automatic capability discovery and comprehensive workflows.
