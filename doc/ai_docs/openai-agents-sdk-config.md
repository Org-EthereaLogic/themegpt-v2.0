# Configuring the SDK - OpenAI Agents SDK

## API Keys and Clients

The SDK automatically searches for the `OPENAI_API_KEY` environment variable upon import. If you cannot set this before your application starts, use `set_default_openai_key()` to configure it programmatically:

```python
from agents import set_default_openai_key

set_default_openai_key("sk-...")
```

You can also provide a custom OpenAI client using `set_default_openai_client()`:

```python
from openai import AsyncOpenAI
from agents import set_default_openai_client

custom_client = AsyncOpenAI(base_url="...", api_key="...")
set_default_openai_client(custom_client)
```

By default, the SDK uses the OpenAI Responses API. To switch to Chat Completions API, call `set_default_openai_api()`:

```python
from agents import set_default_openai_api

set_default_openai_api("chat_completions")
```

## Tracing

Tracing is enabled by default and uses credentials from the configuration above. To set a specific API key for tracing:

```python
from agents import set_tracing_export_api_key

set_tracing_export_api_key("sk-...")
```

Disable tracing entirely with:

```python
from agents import set_tracing_disabled

set_tracing_disabled(True)
```

## Debug Logging

Enable verbose logging using `enable_verbose_stdout_logging()`:

```python
from agents import enable_verbose_stdout_logging

enable_verbose_stdout_logging()
```

Alternatively, configure logging manually:

```python
import logging

logger = logging.getLogger("openai.agents")
logger.setLevel(logging.DEBUG)
logger.addHandler(logging.StreamHandler())
```

### Sensitive Data in Logs

Prevent logging of sensitive information by setting environment variables:

- `OPENAI_AGENTS_DONT_LOG_MODEL_DATA=1` — disables LLM input/output logging
- `OPENAI_AGENTS_DONT_LOG_TOOL_DATA=1` — disables tool input/output logging
