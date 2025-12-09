# OpenAI Chat Completions Model Documentation

## Overview

The `OpenAIChatCompletionsModel` class provides integration with OpenAI's Chat Completions API within the OpenAI Agents SDK framework.

## Class Definition

**Base Class:** `Model` (from `agents.models.interface`)

**Location:** `src/agents/models/openai_chatcompletions.py`

### Constructor

```python
def __init__(
    self,
    model: str | ChatModel,
    openai_client: AsyncOpenAI,
) -> None
```

**Parameters:**
- `model`: The model identifier (string) or ChatModel instance to use
- `openai_client`: An AsyncOpenAI client for API communication

## Core Methods

### get_response()

Retrieves a non-streaming response from the model. Returns a `ModelResponse` containing:
- Output items converted from the model's message
- Usage statistics (input/output tokens, cached tokens, reasoning tokens)
- Response ID (None for this implementation)

### stream_response()

**Signature:** `async def stream_response(...) -> AsyncIterator[TResponseStreamEvent]`

"Yields a partial message as it is generated, as well as the usage information." This method streams responses incrementally, yielding chunks as they arrive from the API.

**Parameters include:**
- `system_instructions`: System-level guidance for the model
- `input`: User message(s) as string or list of response items
- `model_settings`: Configuration controlling temperature, top_p, penalties, and other parameters
- `tools`: List of tools available to the model
- `output_schema`: Optional structured output schema
- `handoffs`: List of handoff destinations
- `tracing`: Tracing configuration for monitoring

## Key Features

- **Parallel tool calls support**: Configurable via `model_settings.parallel_tool_calls`
- **Tool choice control**: Converts user-specified tool selection strategies
- **Response formatting**: Supports structured output schemas
- **Streaming support**: Full async streaming capabilities
- **Reasoning support**: Compatible with reasoning effort configuration
- **Prompt caching**: Retention settings for cached prompts
- **Additional headers/metadata**: Custom headers and metadata support

## Configuration Options

The model respects settings from `ModelSettings` including:
- Temperature and top-p sampling parameters
- Frequency and presence penalties
- Max token limits
- Tool calling preferences
- Response format specifications
- Reasoning configuration
- Prompt cache retention
