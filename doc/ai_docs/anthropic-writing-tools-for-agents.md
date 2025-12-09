# Writing Effective Tools for AI Agents

**Published:** September 11, 2025

## Introduction

This guide explores how to create high-quality tools for LLM agents using the Model Context Protocol (MCP). The article emphasizes that "agents are only as effective as the tools we give them," highlighting an iterative, evaluation-driven approach to tool development.

## What is a Tool?

Tools represent a new contract between deterministic systems and non-deterministic agents. Unlike traditional software where `getWeather("NYC")` produces identical results, agents may choose to call weather tools, answer from memory, or ask clarifying questions. This unpredictability requires fundamentally rethinking software design patterns.

The goal is maximizing "the surface area over which agents can be effective in solving a wide range of tasks," where ergonomic tools for agents also prove intuitive for humans.

## How to Write Tools

### Building a Prototype

Start with quick prototypes using Claude Code. Provide documentation for dependencies in `llms.txt` format. Connect tools via:
- Local MCP servers: `claude mcp add <name> <command> [args...]`
- Claude Desktop: Settings > Developer or Settings > Extensions
- Direct API calls for programmatic testing

Test tools yourself and gather user feedback on expected use cases.

### Running an Evaluation

#### Generating Evaluation Tasks

Create realistic evaluation tasks requiring multiple tool calls. Strong examples include:
- "Schedule a meeting with Jane next week to discuss our latest Acme Corp project. Attach the notes from our last project planning meeting and reserve a conference room."
- "Customer ID 9182 reported three charges for one purchase. Find all relevant logs and determine if others were affected."

Weaker tasks are overly simple searches or individual operations.

#### Running the Evaluation

Recommend programmatic evaluation using simple agentic loops. Have agents output reasoning blocks before tool calls to trigger chain-of-thought behavior. Track metrics beyond accuracy: runtime, tool call count, token consumption, and errors.

#### Analyzing Results

Examine where agents struggle. Claude's evaluation agents may reveal issues through reasoning transcripts and raw tool call sequences. For instance, when launching web search, the team discovered Claude was unnecessarily appending "2025" to queries, biasing results.

### Collaborating with Agents

Use Claude Code to analyze evaluation transcripts and improve tools systematically. Anthropic's advice largely emerged from this iterative optimization process on internal workspace tools, validated against held-out test sets to prevent overfitting.

## Principles for Writing Effective Tools

### Choosing the Right Tools

More tools don't necessarily improve outcomes. Agents have different affordances than traditional software—limited context versus abundant memory. Rather than implementing `list_contacts`, prefer `search_contacts` or `message_contact`.

Tools can consolidate multiple operations:
- Instead of separate `list_users`, `list_events`, and `create_event` tools, implement `schedule_event`
- Rather than `read_logs`, implement `search_logs` returning only relevant entries
- Replace `get_customer_by_id`, `list_transactions`, `list_notes` with `get_customer_context`

### Namespacing Tools

Group related tools with consistent prefixes (e.g., `asana_search`, `asana_projects_search`, `jira_search`). This delineates boundaries and helps agents select appropriate tools while reducing context consumption.

### Returning Meaningful Context

Prioritize semantic clarity over technical precision. Instead of exposing `uuid`, `256px_image_url`, and `mime_type`, return `name`, `image_url`, and `file_type`. Natural language identifiers significantly reduce hallucinations.

Implement flexible response formats via enum parameters:

```
enum ResponseFormat {
   DETAILED = "detailed",
   CONCISE = "concise"
}
```

This allows agents to retrieve IDs when needed for downstream calls while conserving tokens for summary views.

### Optimizing Token Efficiency

Implement pagination, range selection, filtering, and truncation with sensible defaults. Claude Code restricts responses to 25,000 tokens by default. When truncating, guide agents toward efficient strategies with actionable error messages rather than opaque error codes.

Example guidance: "Only 20 results shown. Try filtering by date range or using more specific search terms."

### Prompt-Engineering Tool Descriptions

Clear descriptions are critical. Think of explaining the tool to a new team member—make implicit context explicit. Avoid ambiguity; use precise parameter names like `user_id` instead of `user`.

Small refinements dramatically improve performance. Claude Sonnet 3.5 achieved state-of-the-art on SWE-bench Verified through precise tool description adjustments.

## Looking Ahead

Effective tools are intentionally defined, use agent context judiciously, combine flexibly, and enable intuitive real-world problem solving. As agents and protocols evolve, systematic evaluation-driven improvement ensures tools advance alongside capabilities.

---

**Authors:** Ken Aizawa with contributions from Research, MCP, Product Engineering, Marketing, Design, and Applied AI teams.