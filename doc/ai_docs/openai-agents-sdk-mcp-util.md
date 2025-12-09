# MCP Util - OpenAI Agents SDK Documentation

## Overview

The MCP Util module provides utilities for interoperability between Model Context Protocol (MCP) and the Agents SDK tool systems.

## Type Definitions

### ToolFilterCallable

A function type that determines tool availability:

```python
ToolFilterCallable = Callable[
    ["ToolFilterContext", "MCPTool"],
    MaybeAwaitable[bool]
]
```

**Purpose**: Evaluates whether a specific tool should be accessible based on context and tool information.

### ToolFilter

A union type supporting multiple filtering approaches:

```python
ToolFilter = Union[
    ToolFilterCallable,
    ToolFilterStatic,
    None
]
```

Allows flexible filtering through custom functions, static configurations, or no filtering.

### HttpClientFactory

Protocol for HTTP client factory functions compatible with the MCP SDK's client patterns. Accepts optional headers, timeout, and authentication parameters, returning an async HTTP client.

## Data Classes

### ToolFilterContext

Dataclass providing context information to filter functions:

| Attribute | Type | Description |
|-----------|------|-------------|
| `run_context` | RunContextWrapper | Current execution context |
| `agent` | AgentBase | Requesting agent instance |
| `server_name` | str | MCP server identifier |

### ToolFilterStatic

TypedDict configuration using allowlists and blocklists:

| Field | Type | Description |
|-------|------|-------------|
| `allowed_tool_names` | NotRequired[list[str]] | Whitelist of available tools |
| `blocked_tool_names` | NotRequired[list[str]] | Blacklist of excluded tools |

## MCPUtil Class

Core utility class for MCP-Agents SDK integration.

### Key Methods

**get_all_function_tools()**
- Async classmethod
- Aggregates tools from multiple MCP servers
- Returns list of Function tools
- Raises error on duplicate tool names across servers

**get_function_tools()**
- Async classmethod
- Retrieves tools from single MCP server
- Includes tracing span for monitoring
- Converts MCP tools to SDK format

**to_function_tool()**
- Classmethod
- Converts MCP tool to FunctionTool
- Handles schema normalization (adds empty properties if missing)
- Optionally converts schemas to strict JSON mode for OpenAI compatibility

**invoke_mcp_tool()**
- Async classmethod
- Executes MCP tool with JSON input
- Returns result as JSON string
- Handles structured content and fallback text processing
- Records output in tracing spans

## Utility Functions

### create_static_tool_filter()

Factory function for generating static tool filters:

```python
create_static_tool_filter(
    allowed_tool_names: Optional[list[str]] = None,
    blocked_tool_names: Optional[list[str]] = None
) -> Optional[ToolFilterStatic]
```

**Returns**: ToolFilterStatic configuration or None if no filtering specified.

## Error Handling

The module includes robust error management:
- `UserError`: Raised for duplicate tool names across servers
- `ModelBehaviorError`: Invalid JSON input handling
- `AgentsException`: MCP tool invocation failures

Logging respects debug flags to control sensitive data exposure in logs.
