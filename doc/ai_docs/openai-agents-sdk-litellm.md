# Using any Model via LiteLLM - OpenAI Agents SDK

## Overview

The OpenAI Agents SDK includes a LiteLLM integration (currently in beta) that enables developers to leverage over 100 AI models through a unified interface. This feature expands compatibility beyond native OpenAI models.

## Setup Instructions

To use LiteLLM integration, install the optional dependency:

```
pip install "openai-agents[litellm]"
```

Once installed, you can utilize the `LitellmModel` class within agents.

## Implementation Example

The documentation provides a functional code sample demonstrating:

- A weather-checking tool decorated with `@function_tool`
- An Agent configured with `LitellmModel`
- Command-line argument handling for model selection and API credentials

The example accepts various model formats, such as `openai/gpt-4.1` or `anthropic/claude-3-5-sonnet-20240620`. A comprehensive list of supported models is available in the LiteLLM provider documentation.

## Usage Tracking

To enable usage metrics collection from LiteLLM responses, configure your agent with:

```python
model_settings=ModelSettings(include_usage=True)
```

This setting allows LiteLLM requests to report token counts and request statistics through `result.context_wrapper.usage`, mirroring the behavior of built-in OpenAI models.
