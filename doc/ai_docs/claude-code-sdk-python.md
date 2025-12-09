# Python Agent SDK Reference - Complete Markdown

## Installation

```bash
pip install claude-agent-sdk
```

## Core Concepts

### query() vs ClaudeSDKClient

The SDK offers two interaction patterns:

| Feature | query() | ClaudeSDKClient |
|---------|---------|-----------------|
| Session | New each time | Persistent |
| Conversation | Single exchange | Multiple exchanges |
| Streaming Input | ✅ Yes | ✅ Yes |
| Interrupts | ❌ No | ✅ Yes |
| Custom Tools | ❌ No | ✅ Yes |
| Use Case | One-off tasks | Continuous dialogue |

**query()** creates fresh sessions ideal for independent tasks. **ClaudeSDKClient** maintains context across exchanges, supporting follow-up questions and interactive applications.

---

## Functions

### query()

Launches a new session yielding messages asynchronously:

```python
async def query(
    *,
    prompt: str | AsyncIterable[dict[str, Any]],
    options: ClaudeAgentOptions | None = None
) -> AsyncIterator[Message]
```

**Parameters:**
- `prompt`: Input string or async stream
- `options`: Configuration object

**Example:**
```python
import asyncio
from claude_agent_sdk import query, ClaudeAgentOptions

async def main():
    options = ClaudeAgentOptions(
        system_prompt="Expert Python developer",
        permission_mode='acceptEdits',
        cwd="/home/user/project"
    )
    async for message in query(
        prompt="Create web server",
        options=options
    ):
        print(message)

asyncio.run(main())
```

### tool()

Decorator for creating MCP tools with type safety:

```python
def tool(
    name: str,
    description: str,
    input_schema: type | dict[str, Any]
) -> Callable
```

**Input Schema Options:**
- Simple mapping: `{"text": str, "count": int}`
- JSON Schema: `{"type": "object", "properties": {...}}`

**Example:**
```python
from claude_agent_sdk import tool
from typing import Any

@tool("greet", "Greet a user", {"name": str})
async def greet(args: dict[str, Any]) -> dict[str, Any]:
    return {
        "content": [{
            "type": "text",
            "text": f"Hello, {args['name']}!"
        }]
    }
```

### create_sdk_mcp_server()

Builds in-process MCP servers:

```python
def create_sdk_mcp_server(
    name: str,
    version: str = "1.0.0",
    tools: list[SdkMcpTool[Any]] | None = None
) -> McpSdkServerConfig
```

**Example:**
```python
from claude_agent_sdk import tool, create_sdk_mcp_server

@tool("add", "Add numbers", {"a": float, "b": float})
async def add(args):
    return {
        "content": [{
            "type": "text",
            "text": f"Sum: {args['a'] + args['b']}"
        }]
    }

calc_server = create_sdk_mcp_server(
    name="calculator",
    version="2.0.0",
    tools=[add]
)

options = ClaudeAgentOptions(
    mcp_servers={"calc": calc_server},
    allowed_tools=["mcp__calc__add"]
)
```

---

## ClaudeSDKClient Class

Maintains persistent conversation context across multiple queries.

**Key Methods:**
- `connect(prompt)` - Initialize connection
- `query(prompt, session_id)` - Send request
- `receive_messages()` - Retrieve all messages
- `receive_response()` - Get messages until completion
- `interrupt()` - Stop current execution
- `disconnect()` - Close session

**Context Manager Support:**
```python
async with ClaudeSDKClient() as client:
    await client.query("Hello Claude")
    async for message in client.receive_response():
        print(message)
```

### Multi-turn Conversation Example

```python
import asyncio
from claude_agent_sdk import (
    ClaudeSDKClient,
    AssistantMessage,
    TextBlock
)

async def main():
    async with ClaudeSDKClient() as client:
        # First exchange
        await client.query("France's capital?")
        async for message in client.receive_response():
            if isinstance(message, AssistantMessage):
                for block in message.content:
                    if isinstance(block, TextBlock):
                        print(f"Claude: {block.text}")

        # Follow-up (context preserved)
        await client.query("That city's population?")
        async for message in client.receive_response():
            if isinstance(message, AssistantMessage):
                for block in message.content:
                    if isinstance(block, TextBlock):
                        print(f"Claude: {block.text}")

asyncio.run(main())
```

### Interrupt Example

```python
async def interruptible_task():
    options = ClaudeAgentOptions(
        allowed_tools=["Bash"],
        permission_mode="acceptEdits"
    )

    async with ClaudeSDKClient(options=options) as client:
        await client.query("Count 1 to 100 slowly")
        await asyncio.sleep(2)
        await client.interrupt()
        print("Interrupted!")
        await client.query("Just say hello")
        async for message in client.receive_response():
            pass

asyncio.run(interruptible_task())
```

### Custom Permission Handler

```python
async def custom_permission_handler(tool_name: str, input_data: dict, context: dict):
    if tool_name == "Write" and "/system/" in input_data.get("file_path", ""):
        return {
            "behavior": "deny",
            "message": "System directory write blocked",
            "interrupt": True
        }
    return {"behavior": "allow", "updatedInput": input_data}

options = ClaudeAgentOptions(
    can_use_tool=custom_permission_handler,
    allowed_tools=["Read", "Write", "Edit"]
)

async with ClaudeSDKClient(options=options) as client:
    await client.query("Update system config")
    async for message in client.receive_response():
        print(message)
```

---

## Key Types

### ClaudeAgentOptions

Configuration dataclass with critical fields:

```python
@dataclass
class ClaudeAgentOptions:
    allowed_tools: list[str] = field(default_factory=list)
    system_prompt: str | SystemPromptPreset | None = None
    mcp_servers: dict[str, McpServerConfig] | str | Path = field(default_factory=dict)
    permission_mode: PermissionMode | None = None
    continue_conversation: bool = False
    resume: str | None = None
    max_turns: int | None = None
    cwd: str | Path | None = None
    model: str | None = None
    output_format: OutputFormat | None = None
    can_use_tool: CanUseTool | None = None
    hooks: dict[HookEvent, list[HookMatcher]] | None = None
    setting_sources: list[SettingSource] | None = None
```

**setting_sources** controls which filesystem configs load:
- `"user"` - `~/.claude/settings.json`
- `"project"` - `.claude/settings.json`
- `"local"` - `.claude/settings.local.json`

When omitted (default), no filesystem settings load.

### PermissionMode

```python
PermissionMode = Literal[
    "default",           # Standard behavior
    "acceptEdits",       # Auto-accept file edits
    "plan",              # Planning mode only
    "bypassPermissions"  # All checks bypassed
]
```

### SystemPromptPreset

```python
class SystemPromptPreset(TypedDict):
    type: Literal["preset"]
    preset: Literal["claude_code"]
    append: NotRequired[str]  # Additional instructions
```

### OutputFormat

```python
class OutputFormat(TypedDict):
    type: Literal["json_schema"]
    schema: dict[str, Any]  # JSON Schema validation
```

### Message Types

```python
Message = UserMessage | AssistantMessage | SystemMessage | ResultMessage

@dataclass
class AssistantMessage:
    content: list[ContentBlock]
    model: str

@dataclass
class ResultMessage:
    subtype: str
    duration_ms: int
    is_error: bool
    num_turns: int
    session_id: str
    total_cost_usd: float | None = None
```

### Content Blocks

```python
ContentBlock = TextBlock | ThinkingBlock | ToolUseBlock | ToolResultBlock

@dataclass
class TextBlock:
    text: str

@dataclass
class ToolUseBlock:
    id: str
    name: str
    input: dict[str, Any]

@dataclass
class ToolResultBlock:
    tool_use_id: str
    content: str | list[dict[str, Any]] | None = None
    is_error: bool | None = None
```

---

## Hooks

### HookEvent Types

```python
HookEvent = Literal[
    "PreToolUse",      # Before tool execution
    "PostToolUse",     # After tool execution
    "UserPromptSubmit", # User submits prompt
    "Stop",            # Stopping execution
    "SubagentStop",    # Subagent stops
    "PreCompact"       # Before message compaction
]
```

### Hook Usage Example

```python
from claude_agent_sdk import query, ClaudeAgentOptions, HookMatcher, HookContext
from typing import Any

async def validate_bash(input_data: dict[str, Any], tool_use_id: str | None, context: HookContext) -> dict[str, Any]:
    if input_data['tool_name'] == 'Bash':
        command = input_data['tool_input'].get('command', '')
        if 'rm -rf /' in command:
            return {
                'hookSpecificOutput': {
                    'hookEventName': 'PreToolUse',
                    'permissionDecision': 'deny',
                    'permissionDecisionReason': 'Dangerous command'
                }
            }
    return {}

options = ClaudeAgentOptions(
    hooks={
        'PreToolUse': [
            HookMatcher(matcher='Bash', hooks=[validate_bash], timeout=120)
        ]
    }
)

async for message in query(prompt="Analyze code", options=options):
    print(message)
```

---

## Built-in Tools Reference

### Bash
```python
{
    "command": str,              # Command to execute
    "timeout": int | None,       # Timeout in milliseconds
    "description": str | None,   # 5-10 word description
    "run_in_background": bool    # Background execution
}
```

### Read
```python
{
    "file_path": str,      # Absolute path
    "offset": int | None,  # Starting line
    "limit": int | None    # Lines to read
}
```

### Write
```python
{
    "file_path": str,  # Absolute path
    "content": str     # File contents
}
```

### Edit
```python
{
    "file_path": str,           # File to modify
    "old_string": str,          # Text to replace
    "new_string": str,          # Replacement text
    "replace_all": bool | None  # Replace all occurrences
}
```

### Glob
```python
{
    "pattern": str,       # Glob pattern
    "path": str | None    # Search directory
}
```

### Grep
```python
{
    "pattern": str,           # Regex pattern
    "path": str | None,       # File/directory
    "glob": str | None,       # File filter
    "-i": bool | None,        # Case insensitive
    "-n": bool | None,        # Show line numbers
    "head_limit": int | None  # Limit results
}
```

### WebSearch
```python
{
    "query": str,                        # Search query
    "allowed_domains": list[str] | None, # Whitelist domains
    "blocked_domains": list[str] | None  # Blacklist domains
}
```

### WebFetch
```python
{
    "url": str,     # URL to fetch
    "prompt": str   # Analysis prompt
}
```

---

## Error Types

```python
class ClaudeSDKError(Exception):
    """Base exception class"""

class CLINotFoundError(CLIConnectionError):
    def __init__(self, message: str = "Claude Code not found", cli_path: str | None = None):
        pass

class CLIConnectionError(ClaudeSDKError):
    """Connection failed"""

class ProcessError(ClaudeSDKError):
    def __init__(self, message: str, exit_code: int | None = None, stderr: str | None = None):
        self.exit_code = exit_code
        self.stderr = stderr

class CLIJSONDecodeError(ClaudeSDKError):
    def __init__(self, line: str, original_error: Exception):
        self.line = line
        self.original_error = original_error
```

### Error Handling

```python
from claude_agent_sdk import query, CLINotFoundError, ProcessError

try:
    async for message in query(prompt="Hello"):
        print(message)
except CLINotFoundError:
    print("Install Claude Code: npm install -g @anthropic-ai/claude-code")
except ProcessError as e:
    print(f"Process failed: exit code {e.exit_code}")
```

---

## Advanced Patterns

### Interactive Conversation Session

```python
from claude_agent_sdk import ClaudeSDKClient, AssistantMessage, TextBlock
import asyncio

class ConversationSession:
    def __init__(self, options=None):
        self.client = ClaudeSDKClient(options)
        self.turn_count = 0

    async def start(self):
        await self.client.connect()
        print("Starting conversation. Type 'exit' to quit, 'interrupt' to stop, 'new' for fresh session")

        while True:
            user_input = input(f"\n[Turn {self.turn_count + 1}] You: ")

            if user_input.lower() == 'exit':
                break
            elif user_input.lower() == 'interrupt':
                await self.client.interrupt()
                continue
            elif user_input.lower() == 'new':
                await self.client.disconnect()
                await self.client.connect()
                self.turn_count = 0
                continue

            await self.client.query(user_input)
            self.turn_count += 1

            print(f"[Turn {self.turn_count}] Claude: ", end="")
            async for message in self.client.receive_response():
                if isinstance(message, AssistantMessage):
                    for block in message.content:
                        if isinstance(block, TextBlock):
                            print(block.text, end="")
            print()

        await self.client.disconnect()
        print(f"Conversation ended after {self.turn_count} turns.")

async def main():
    session = ConversationSession()
    await session.start()

asyncio.run(main())
```

### Real-time Progress Monitoring

```python
from claude_agent_sdk import (
    ClaudeSDKClient,
    ClaudeAgentOptions,
    AssistantMessage,
    ToolUseBlock,
    TextBlock
)
import asyncio

async def monitor_progress():
    options = ClaudeAgentOptions(
        allowed_tools=["Write", "Bash"],
        permission_mode="acceptEdits"
    )

    async with ClaudeSDKClient(options=options) as client:
        await client.query("Create 5 Python files with sorting algorithms")

        async for message in client.receive_messages():
            if isinstance(message, AssistantMessage):
                for block in message.content:
                    if isinstance(block, ToolUseBlock):
                        if block.name == "Write":
                            print(f"Creating: {block.input.get('file_path', '')}")
                    elif isinstance(block, TextBlock):
                        print(f"Thinking: {block.text[:100]}...")

            if hasattr(message, 'subtype') and message.subtype in ['success', 'error']:
                print("Task completed!")
                break

asyncio.run(monitor_progress())
```

### Streaming Input with ClaudeSDKClient

```python
import asyncio
from claude_agent_sdk import ClaudeSDKClient

async def message_stream():
    """Generate messages dynamically."""
    yield {"type": "text", "text": "Analyze data:"}
    await asyncio.sleep(0.5)
    yield {"type": "text", "text": "Temperature: 25C"}
    await asyncio.sleep(0.5)
    yield {"type": "text", "text": "Humidity: 60%"}

async def main():
    async with ClaudeSDKClient() as client:
        await client.query(message_stream())
        async for message in client.receive_response():
            print(message)

        await client.query("Should we be concerned?")
        async for message in client.receive_response():
            print(message)

asyncio.run(main())
```

---

## See Also

- Python SDK guide - Tutorial and examples
- SDK overview - General SDK concepts
- TypeScript SDK reference - Alternative implementation
- CLI reference - Command-line interface
- Common workflows - Step-by-step guides
