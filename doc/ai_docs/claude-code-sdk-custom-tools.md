# Custom Tools - Claude Agent SDK Documentation

## Overview

Custom tools extend Claude Code's capabilities through in-process MCP servers, enabling interaction with external services, APIs, and specialized operations.

## Creating Custom Tools

Define type-safe tools using `createSdkMcpServer` and `tool` helper functions.

**TypeScript approach:** Uses Zod schemas for runtime validation and type safety. The `tool` function accepts a name, description, schema object, and async handler.

**Python approach:** Decorators define tools with simple type mappings or JSON Schema formats. Functions receive arguments as dictionaries and return structured responses.

## Using Custom Tools

Pass custom servers to the `query` function via `mcpServers` option as objects/dictionaries.

**Critical requirement:** "Custom MCP tools require streaming input mode. You must use an async generator/iterable for the `prompt` parameter."

### Tool Naming Convention

MCP tools follow the pattern: `mcp__{server_name}__{tool_name}`

Example: A `get_weather` tool in `my-custom-tools` server becomes `mcp__my-custom-tools__get_weather`

### Controlling Tool Access

The `allowedTools` option restricts which tools Claude can access, enabling selective exposure of specific capabilities from multi-tool servers.

## Type Safety Approaches

**TypeScript:** Zod schemas provide both validation and TypeScript typing automatically.

**Python:** Supports simple type mappings (str, int, list) for straightforward cases and JSON Schema format for complex validation requirements with enums and constraints.

## Error Handling

Tools should catch exceptions and return error messages within the response structure rather than throwing unhandled errors, ensuring graceful failure feedback.

## Example Implementations

**Database queries:** Execute SQL with parameters and return formatted results.

**API gateway:** Make authenticated requests to multiple services (Stripe, GitHub, OpenAI, Slack) with dynamic routing.

**Calculator:** Perform mathematical operations and complex financial calculations like compound interest analysis.
