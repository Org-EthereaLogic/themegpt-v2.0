# Claude Agent SDK Migration Guide

## Overview

The Claude Code SDK has been rebranded as the "Claude Agent SDK" to reflect its expanded capabilities beyond coding tasks. This documentation consolidates the migration process for TypeScript/JavaScript and Python developers.

## Key Changes

The package names have been updated across both platforms:

- **TypeScript/JavaScript**: `@anthropic-ai/claude-code` → `@anthropic-ai/claude-agent-sdk`
- **Python**: `claude-code-sdk` → `claude-agent-sdk`

Documentation has relocated to "the API Guide under a dedicated Agent SDK section."

## Migration Instructions

### TypeScript/JavaScript Steps

1. Uninstall the legacy package via npm
2. Install the new package: `@anthropic-ai/claude-agent-sdk`
3. Update all import statements to reference the new package name
4. Modify `package.json` dependencies accordingly

### Python Steps

1. Remove the old package using pip
2. Install the replacement: `claude-agent-sdk`
3. Change import statements from `claude_code_sdk` to `claude_agent_sdk`
4. Rename `ClaudeCodeOptions` to `ClaudeAgentOptions`
5. Address breaking changes as needed

## Major Breaking Changes

**System prompt behavior**: "The SDK no longer uses Claude Code's system prompt by default," requiring explicit configuration if the previous behavior is desired.

**Settings loading**: The SDK "no longer reads from filesystem settings" automatically, ensuring predictable behavior in CI/CD and production environments.

**Type renaming**: Python developers must update `ClaudeCodeOptions` references to the new `ClaudeAgentOptions` class.

## Rationale

The rename reflects the framework's evolution into "a powerful framework for building all types of AI agents" across various domains beyond just coding.
