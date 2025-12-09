# OpenAI Agents SDK - Models Documentation

## Overview

The Agents SDK provides built-in support for OpenAI models through two implementations:

1. **OpenAIResponsesModel** (Recommended) - Uses the new Responses API
2. **OpenAIChatCompletionsModel** - Uses the Chat Completions API

## Default OpenAI Model

The default model is currently `gpt-4.1`, selected for its balance between predictability in agentic workflows and low latency.

### Setting a Global Default

Configure a default model across all agents via environment variable:

```bash
export OPENAI_DEFAULT_MODEL=gpt-5
python3 my_awesome_agent.py
```

## GPT-5 Models

When using GPT-5 variants (`gpt-5`, `gpt-5-mini`, or `gpt-5-nano`), the SDK automatically applies sensible defaults: both `reasoning.effort` and `verbosity` are set to `"low"`.

### Custom Model Settings

Override default settings by passing `ModelSettings`:

```python
from openai.types.shared import Reasoning
from agents import Agent, ModelSettings

my_agent = Agent(
    name="My Agent",
    instructions="You're a helpful agent.",
    model_settings=ModelSettings(
        reasoning=Reasoning(effort="minimal"),
        verbosity="low"
    )
)
```

**Note:** Models like `gpt-5-mini` with `"minimal"` reasoning effort offer faster response times, though some built-in tools don't support this setting, which is why the SDK defaults to `"low"`.

## Non-OpenAI Models

### LiteLLM Integration

Install the LiteLLM dependency group:

```bash
pip install "openai-agents[litellm]"
```

Use any [supported model](https://docs.litellm.ai/docs/providers) with the `litellm/` prefix:

```python
claude_agent = Agent(model="litellm/anthropic/claude-3-5-sonnet-20240620", ...)
gemini_agent = Agent(model="litellm/gemini/gemini-2.5-flash-preview-04-17", ...)
```

### Alternative Integration Methods

Three additional approaches exist for non-OpenAI providers:

1. **Global Client Setup** - Use `set_default_openai_client()` with an `AsyncOpenAI` instance configured with custom `base_url` and `api_key`
2. **Provider-Level Configuration** - Pass a `ModelProvider` to `Runner.run()` to apply across all agents
3. **Agent-Level Specification** - Set the model directly on individual `Agent` instances for mixed provider workflows

## Mixing and Matching Models

Deploy different models for different agents within a single workflow:

```python
from agents import Agent, Runner, AsyncOpenAI, OpenAIChatCompletionsModel
import asyncio

spanish_agent = Agent(
    name="Spanish agent",
    instructions="You only speak Spanish.",
    model="gpt-5-mini"
)

english_agent = Agent(
    name="English agent",
    instructions="You only speak English",
    model=OpenAIChatCompletionsModel(
        model="gpt-5-nano",
        openai_client=AsyncOpenAI()
    )
)

triage_agent = Agent(
    name="Triage agent",
    instructions="Handoff to appropriate agent based on request language.",
    handoffs=[spanish_agent, english_agent],
    model="gpt-5"
)
```

### Model Configuration Parameters

Use `ModelSettings` for optional configuration like temperature:

```python
english_agent = Agent(
    name="English agent",
    instructions="You only speak English",
    model="gpt-4.1",
    model_settings=ModelSettings(temperature=0.1)
)
```

### Responses API Extra Parameters

Pass additional parameters to the Responses API via `extra_args`:

```python
agent = Agent(
    name="Agent",
    instructions="Instructions here",
    model="gpt-4.1",
    model_settings=ModelSettings(
        temperature=0.1,
        extra_args={"service_tier": "flex", "user": "user_12345"}
    )
)
```

## Common Issues and Solutions

### Tracing Client Error 401

When using non-OpenAI models without an OpenAI API key:

- **Option 1:** Disable tracing: `set_tracing_disabled(True)`
- **Option 2:** Provide OpenAI key for tracing only: `set_tracing_export_api_key(...)`
- **Option 3:** Implement a non-OpenAI trace processor

### Responses API Support

Most non-OpenAI providers don't support the Responses API. Solutions:

```python
# Global fallback to Chat Completions API
set_default_openai_api("chat_completions")

# Or use Chat Completions model directly
model=OpenAIChatCompletionsModel(...)
```

### Structured Outputs Support

Some providers lack structured output support, potentially causing JSON formatting errors. Prefer providers with full JSON schema support to avoid runtime failures.

## Cross-Provider Considerations

When mixing providers, account for feature differences:

- Some models lack structured output support
- Multimodal inputs may not be universally supported
- Advanced tools (file search, web search) are provider-specific
- Filter incompatible tools and inputs before sending to providers with limitations
