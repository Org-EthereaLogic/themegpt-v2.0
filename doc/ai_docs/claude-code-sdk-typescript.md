# Claude Code SDK for TypeScript - Complete Reference

## Installation

Install the SDK via npm:

```bash
npm install @anthropic-ai/claude-agent-sdk
```

## Core Functions

### `query()`

The primary interface for interacting with Claude Code, returning an async generator that streams messages.

```typescript
function query({
  prompt,
  options
}: {
  prompt: string | AsyncIterable<SDKUserMessage>;
  options?: Options;
}): Query
```

**Parameters:**
- `prompt`: Input text or async iterable for streaming mode
- `options`: Configuration object (optional)

**Returns:** A `Query` object extending `AsyncGenerator<SDKMessage, void>` with methods for interruption and permission management.

### `tool()`

Creates type-safe MCP tool definitions with Zod schema validation.

```typescript
function tool<Schema extends ZodRawShape>(
  name: string,
  description: string,
  inputSchema: Schema,
  handler: (args: z.infer<ZodObject<Schema>>, extra: unknown) =>
    Promise<CallToolResult>
): SdkMcpToolDefinition<Schema>
```

### `createSdkMcpServer()`

Instantiates an in-process MCP server for your application.

```typescript
function createSdkMcpServer(options: {
  name: string;
  version?: string;
  tools?: Array<SdkMcpToolDefinition<any>>;
}): McpSdkServerConfigWithInstance
```

## Configuration Options

The `Options` type provides extensive configuration:

| Option | Type | Default | Purpose |
|--------|------|---------|---------|
| `model` | string | CLI default | Claude model selection |
| `cwd` | string | `process.cwd()` | Working directory |
| `env` | Dict<string> | `process.env` | Environment variables |
| `continue` | boolean | false | Resume conversation |
| `maxTurns` | number | undefined | Turn limit |
| `maxThinkingTokens` | number | undefined | Thinking token budget |
| `permissionMode` | PermissionMode | 'default' | Permission behavior |
| `agents` | Record<string, AgentDefinition> | undefined | Subagent definitions |
| `mcpServers` | Record<string, McpServerConfig> | {} | MCP server setup |
| `allowedTools` | string[] | All tools | Tool restrictions |
| `settingSources` | SettingSource[] | [] | Settings file sources |
| `systemPrompt` | string or preset object | undefined | System instructions |
| `outputFormat` | JSONSchema config | undefined | Structured outputs |

## Setting Sources Management

The SDK defaults to loading **no filesystem settings** for isolation. Explicitly configure sources:

```typescript
// Load all setting sources
settingSources: ['user', 'project', 'local']

// Load only project settings
settingSources: ['project']

// Load CLAUDE.md files
systemPrompt: { type: 'preset', preset: 'claude_code' },
settingSources: ['project']
```

**Source locations:**
- `'user'`: `~/.claude/settings.json`
- `'project'`: `.claude/settings.json`
- `'local'`: `.claude/settings.local.json`

## Message Types

All messages returned from queries implement `SDKMessage`:

### `SDKAssistantMessage`
Assistant responses with optional tool use parent reference.

### `SDKUserMessage`
User input with conversation context.

### `SDKSystemMessage`
Initialization data including available tools, MCP servers, and permissions.

### `SDKResultMessage`
Final outcome with duration, token usage, costs, and permission denials.

### `SDKPartialAssistantMessage`
Streaming events (when `includePartialMessages: true`).

### `SDKCompactBoundaryMessage`
Conversation compaction markers with token statistics.

## Permission Control

### `PermissionMode` Values

- `'default'`: Standard permission behavior
- `'acceptEdits'`: Auto-approve file modifications
- `'bypassPermissions'`: Skip all checks
- `'plan'`: Planning mode without execution

### `CanUseTool` Custom Function

Implement custom tool permission logic:

```typescript
type CanUseTool = (
  toolName: string,
  input: ToolInput,
  options: { signal: AbortSignal; suggestions?: PermissionUpdate[] }
) => Promise<PermissionResult>;
```

### `PermissionResult` Outcomes

```typescript
type PermissionResult =
  | { behavior: 'allow'; updatedInput?: ToolInput }
  | { behavior: 'deny'; message: string }
```

## Hook System

Register callbacks for key lifecycle events:

```typescript
type HookEvent =
  | 'PreToolUse'
  | 'PostToolUse'
  | 'Notification'
  | 'UserPromptSubmit'
  | 'SessionStart'
  | 'SessionEnd'
  | 'Stop'
  | 'SubagentStop'
  | 'PreCompact';
```

Hook callbacks receive event-specific input and return decision outputs.

## Built-in Tools

### File Operations

**Read** - Access text, images, PDFs, notebooks
**Write** - Create/overwrite files
**Edit** - Perform precise string replacements
**Glob** - Fast pattern-based file discovery
**Grep** - Ripgrep-powered regex search

### Code Execution

**Bash** - Execute shell commands with optional timeout
**BashOutput** - Retrieve background shell results
**KillBash** - Terminate background processes

### Specialized Tools

**Task** - Delegate to specialized subagents
**NotebookEdit** - Modify Jupyter notebook cells
**WebFetch** - Retrieve and analyze web content
**WebSearch** - Query the web with domain filtering
**TodoWrite** - Manage structured task lists

### MCP Integration

**ListMcpResources** - Enumerate available MCP resources
**ReadMcpResource** - Access specific resource content

## Subagent Definition

Configure specialized agents programmatically:

```typescript
type AgentDefinition = {
  description: string;      // When to use
  tools?: string[];        // Allowed tools
  prompt: string;          // System instructions
  model?: 'sonnet' | 'opus' | 'haiku' | 'inherit';
}
```

## MCP Server Configuration

Support multiple server types:

- **stdio**: Command-based servers with arguments
- **sse**: Server-Sent Events endpoints
- **http**: HTTP protocol servers
- **sdk**: In-process SDK servers

## Plugin System

Load custom plugins from local directories:

```typescript
plugins: [
  { type: 'local', path: './my-plugin' },
  { type: 'local', path: '/absolute/path/to/plugin' }
]
```

## Query Interface Methods

```typescript
interface Query extends AsyncGenerator<SDKMessage, void> {
  interrupt(): Promise<void>;
  setPermissionMode(mode: PermissionMode): Promise<void>;
}
```

- `interrupt()`: Stop execution in streaming mode
- `setPermissionMode()`: Change permissions dynamically

## Common Patterns

**SDK-only application with no filesystem dependencies:**
```typescript
const result = query({
  prompt: "Your task here",
  options: {
    agents: { /* definitions */ },
    mcpServers: { /* configs */ },
    allowedTools: ['Read', 'Write']
    // settingSources defaults to []
  }
});
```

**CI/CD environment with strict settings control:**
```typescript
const result = query({
  prompt: "Run tests",
  options: {
    settingSources: ['project'],
    permissionMode: 'bypassPermissions'
  }
});
```

## See Also

- [SDK Overview](/docs/en/agent-sdk/overview)
- [Python SDK Reference](/docs/en/agent-sdk/python)
- [CLI Reference](https://code.claude.com/docs/en/cli-reference)
- [Common Workflows](https://code.claude.com/docs/en/common-workflows)