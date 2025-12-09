# MCP Servers API Reference

The OpenAI Agents SDK provides comprehensive support for Model Context Protocol (MCP) servers through multiple transport implementations.

## Base Architecture

The `MCPServer` abstract base class defines the core interface. According to the documentation, "Base class for Model Context Protocol servers." It requires implementations of `connect()`, `cleanup()`, `list_tools()`, `call_tool()`, `list_prompts()`, and `get_prompt()` methods.

Key initialization parameter: `use_structured_content` allows control over whether to use `tool_result.structured_content` when calling MCP tools, defaulting to `False` for backwards compatibility.

## Transport Implementations

**MCPServerStdio**: Implements the stdio transport. Configuration includes command, args, environment variables, working directory, and text encoding settings. The documentation notes "The executable to run to start the server. For example, `python` or `node`."

**MCPServerSse**: Uses HTTP with Server-Sent Events. Requires a URL and supports optional headers, HTTP timeout, and SSE read timeout parameters.

**MCPServerStreamableHttp**: Implements the Streamable HTTP transport with additional support for custom httpx client factories and terminate-on-close behavior.

## Common Features

All implementations support:
- **Tool caching**: The `cache_tools_list` parameter enables caching for improved latency
- **Tool filtering**: Optional `tool_filter` for selective tool availability
- **Retry logic**: Configurable `max_retry_attempts` with exponential backoff
- **Prompts**: Methods to list and retrieve prompts from servers
- **Session management**: Automatic connection handling and cleanup

The implementations follow a consistent pattern for managing server lifecycle through async context managers and exit stacks.
