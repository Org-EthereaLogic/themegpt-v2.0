---
allowed-tools: Bash, Read, Glob, Grep
description: Automated workspace maintenance with temporary file removal, orphaned file management, and archival
argument-hint: [--execute flag for actual changes (default: dry-run)]
model: claude-haiku-4-5-20251001
---

# cleanup_workspace

Perform automated workspace maintenance to keep the ThemeGPT codebase clean and organized. This command delegates to the specialized workspace cleanup agent for comprehensive maintenance operations.

## Agent Delegation

This command invokes the workspace cleanup agent located at:
`.claude/agents/cleanup_workspace.md`

## Usage

```bash
/cleanup_workspace [--execute]
```

## Arguments

- `--execute`: Execute actual cleanup operations (default: dry-run mode)
- No arguments: Run in dry-run mode to preview changes

## Agent Capabilities

The workspace cleanup agent provides:

- **Build Cache Removal**: Plasmo cache, Next.js cache, TypeScript output
- **Coverage Cleanup**: Test coverage reports from all workspaces
- **Temporary File Management**: VS Code history, log files, build artifacts
- **Safety Verification**: Protect git-tracked files and source directories
- **Size Reporting**: Calculate and display space savings

## Cleanup Targets

| Target | Description |
|--------|-------------|
| `.plasmo/` | Plasmo build cache (~91 MB) |
| `.next/`, `apps/web/.next/` | Next.js build caches |
| `apps/extension/build/` | Extension build outputs |
| `packages/shared/dist/` | TypeScript compiled output |
| `coverage/` | Test coverage reports |
| `.history/` | VS Code local history |
| `.turbo/` | Turbo cache |
| `*.log` | Root-level log files |

## Execution Flow

1. Parse command arguments to determine execution mode
2. Verify working directory is ThemeGPT project root
3. Scan for existing cleanup targets with size calculation
4. In dry-run: Report what would be removed
5. In execute: Remove targets and report results
6. Return comprehensive report to user

## Safety Features

- Dry-run by default (no changes without explicit --execute flag)
- All git-tracked files automatically protected
- Protected directories excluded: `.git`, `node_modules`, `src/`, `app/`, `assets/`
- Source code directories never touched
- Full verification before and after operations

## Example Output

### Dry-Run Mode
```
=== ThemeGPT Workspace Cleanup Report ===
Mode: DRY-RUN (no changes made)

Would remove:
  .plasmo/                    91.2 MB
  apps/extension/coverage/     2.1 MB

Total space to recover: 93.3 MB

To execute these changes, run:
  /cleanup_workspace --execute
```

### Execute Mode
```
=== ThemeGPT Workspace Cleanup Results ===
Mode: EXECUTE (changes applied)

Removed:
  .plasmo/                    91.2 MB [REMOVED]
  apps/extension/coverage/     2.1 MB [REMOVED]

Total space recovered: 93.3 MB

Workspace cleanup completed successfully.
To regenerate caches, run: pnpm dev
```

## Notes

- Respects ThemeGPT complexity budget principles
- Alternative full reset: `pnpm clean && pnpm install`
- Caches regenerate automatically on next `pnpm dev` or `pnpm dev:web`

For agent implementation details, see:
`.claude/agents/cleanup_workspace.md`
