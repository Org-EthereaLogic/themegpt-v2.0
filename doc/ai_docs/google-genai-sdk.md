# Google Gen AI SDK Documentation

## Installation & Setup

The SDK can be installed via pip or uv:
```bash
pip install google-genai
# or
uv pip install google-genai
```

### Core Imports
```python
from google import genai
from google.genai import types
```

## Client Initialization

### Gemini Developer API
```python
client = genai.Client(api_key='GEMINI_API_KEY')
```

### Vertex AI
```python
client = genai.Client(
    vertexai=True,
    project='your-project-id',
    location='us-central1'
)
```

### Environment Variables
**Gemini Developer API:** Set `GEMINI_API_KEY` or `GOOGLE_API_KEY`

**Vertex AI:** Set `GOOGLE_GENAI_USE_VERTEXAI=true`, `GOOGLE_CLOUD_PROJECT`, and `GOOGLE_CLOUD_LOCATION`

## Client Lifecycle Management

### Explicit Closing
The documentation advises explicitly closing clients to "ensure that resources, such as the underlying HTTP connections, are properly cleaned up and closed."

### Context Managers
```python
# Sync
with Client() as client:
    response = client.models.generate_content(...)

# Async
async with Client().aio as aclient:
    response = await aclient.models.generate_content(...)
```

## Models Module

### Content Generation

**Text-to-Text:**
```python
response = client.models.generate_content(
    model='gemini-2.5-flash',
    contents='Why is the sky blue?'
)
print(response.text)
```

**Text-to-Image:**
```python
response = client.models.generate_content(
    model='gemini-2.5-flash-image',
    contents='A cartoon infographic for flying sneakers',
    config=types.GenerateContentConfig(
        response_modalities=["IMAGE"],
        image_config=types.ImageConfig(aspect_ratio="9:16"),
    ),
)
```

### Content Structure Flexibility

The SDK accepts multiple input formats:
- **Strings:** `contents='Why is the sky blue?'`
- **String lists:** `contents=['question1', 'question2']`
- **Content objects:** `types.Content` instances
- **Part objects:** Text, files, URIs, function calls

SDK automatically converts inputs to `list[types.Content]`.

### Configuration Options

Control model behavior through `GenerateContentConfig`:
- `system_instruction`: Modify model instructions
- `max_output_tokens`: Limit response length
- `temperature`: Control randomness (0-1)
- `top_p`, `top_k`: Nucleus and top-k sampling
- `presence_penalty`, `frequency_penalty`: Diversity controls
- `seed`: Reproducibility parameter

### Streaming

**Synchronous:**
```python
for chunk in client.models.generate_content_stream(
    model='gemini-2.5-flash',
    contents='Tell me a story'
):
    print(chunk.text, end='')
```

**Asynchronous:**
```python
async for chunk in await client.aio.models.generate_content_stream(...):
    print(chunk.text, end='')
```

### Token Management

**Count tokens:**
```python
response = client.models.count_tokens(
    model='gemini-2.5-flash',
    contents='why is the sky blue?',
)
```

**Local tokenization (no API call):**
```python
tokenizer = genai.LocalTokenizer(model_name='gemini-2.5-flash')
result = tokenizer.count_tokens("What is your name?")
```

**Compute tokens (Vertex AI only):**
```python
response = client.models.compute_tokens(
    model='gemini-2.5-flash',
    contents='why is the sky blue?',
)
```

### Embeddings

```python
response = client.models.embed_content(
    model='gemini-embedding-001',
    contents='why is the sky blue?',
)
```

### Model Listing

```python
for model in client.models.list():
    print(model)

# With pagination
pager = client.models.list(config={'page_size': 10})
print(pager[0])
pager.next_page()
```

## Safety Settings

Configure harm filtering by category:

```python
response = client.models.generate_content(
    model='gemini-2.5-flash',
    contents='Say something bad.',
    config=types.GenerateContentConfig(
        safety_settings=[
            types.SafetySetting(
                category='HARM_CATEGORY_HATE_SPEECH',
                threshold='BLOCK_ONLY_HIGH',
            )
        ]
    ),
)
```

## Function Calling

### Automatic Python Functions

Pass Python functions directly for automatic invocation:

```python
def get_current_weather(location: str) -> str:
    """Returns the current weather.

    Args:
        location: The city and state, e.g. San Francisco, CA
    """
    return 'sunny'

response = client.models.generate_content(
    model='gemini-2.5-flash',
    contents='What is the weather like in Boston?',
    config=types.GenerateContentConfig(
        tools=[get_current_weather],
    ),
)
```

### Disabling Automatic Calling

```python
config=types.GenerateContentConfig(
    tools=[get_current_weather],
    automatic_function_calling=types.AutomaticFunctionCallingConfig(
        disable=True
    ),
)
```

### Manual Function Declarations

```python
function = types.FunctionDeclaration(
    name='get_current_weather',
    description='Get the current weather in a given location',
    parameters_json_schema={
        'type': 'object',
        'properties': {
            'location': {
                'type': 'string',
                'description': 'The city and state',
            }
        },
        'required': ['location'],
    },
)

tool = types.Tool(function_declarations=[function])

response = client.models.generate_content(
    model='gemini-2.5-flash',
    contents='What is the weather like in Boston?',
    config=types.GenerateContentConfig(tools=[tool]),
)
```

### ANY Mode Function Calling

Force model to return function calls via `FunctionCallingConfig(mode='ANY')`.

### Model Context Protocol (MCP) Support

Experimental feature allowing local MCP servers as tools:

```python
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

server_params = StdioServerParameters(
    command="npx",
    args=["-y", "@philschmid/weather-mcp"],
)

async with stdio_client(server_params) as (read, write):
    async with ClientSession(read, write) as session:
        response = await client.aio.models.generate_content(
            model="gemini-2.5-flash",
            contents="What is the weather?",
            config=genai.types.GenerateContentConfig(
                tools=[session],
            ),
        )
```

## JSON Response Schemas

### JSON Schema Support

```python
user_profile = {
    'properties': {
        'username': {'type': 'string'},
        'age': {'type': 'integer'},
    },
    'required': ['username', 'age'],
    'type': 'object',
}

response = client.models.generate_content(
    model='gemini-2.5-flash',
    contents='Give me a random user profile.',
    config={
        'response_mime_type': 'application/json',
        'response_json_schema': user_profile
    },
)
```

### Pydantic Models

```python
from pydantic import BaseModel

class CountryInfo(BaseModel):
    name: str
    population: int
    capital: str
    continent: str
    gdp: int

response = client.models.generate_content(
    model='gemini-2.5-flash',
    contents='Give me information for the United States.',
    config=types.GenerateContentConfig(
        response_mime_type='application/json',
        response_schema=CountryInfo,
    ),
)
```

## Enum Responses

```python
from enum import Enum

class InstrumentEnum(Enum):
    PERCUSSION = 'Percussion'
    STRING = 'String'
    WOODWIND = 'Woodwind'
    BRASS = 'Brass'

response = client.models.generate_content(
    model='gemini-2.5-flash',
    contents='What instrument plays multiple notes at once?',
    config={
        'response_mime_type': 'text/x.enum',
        'response_schema': InstrumentEnum,
    },
)
```

## Image Generation (Imagen)

### Generate Images

Allowlist required for Gemini Developer API:

```python
response = client.models.generate_images(
    model='imagen-3.0-generate-002',
    prompt='An umbrella in the foreground, rainy night sky',
    config=types.GenerateImagesConfig(
        number_of_images=1,
        include_rai_reason=True,
        output_mime_type='image/jpeg',
    ),
)
response.generated_images[0].image.show()
```

### Upscale (Vertex AI only)

```python
response = client.models.upscale_image(
    model='imagen-3.0-generate-002',
    image=response.generated_images[0].image,
    upscale_factor='x2',
)
```

### Edit Image (Vertex AI only)

```python
from google.genai.types import RawReferenceImage, MaskReferenceImage

raw_ref = RawReferenceImage(
    reference_id=1,
    reference_image=response.generated_images[0].image,
)

mask_ref = MaskReferenceImage(
    reference_id=2,
    config=types.MaskReferenceConfig(
        mask_mode='MASK_MODE_BACKGROUND',
    ),
)

response = client.models.edit_image(
    model='imagen-3.0-capability-001',
    prompt='Sunlight and clear sky',
    reference_images=[raw_ref, mask_ref],
    config=types.EditImageConfig(
        edit_mode='EDIT_MODE_INPAINT_INSERTION',
    ),
)
```

## Video Generation (Veo)

Public preview feature for video generation.

### Text-to-Video

```python
operation = client.models.generate_videos(
    model='veo-2.0-generate-001',
    prompt='A neon hologram of a cat driving at top speed',
    config=types.GenerateVideosConfig(
        number_of_videos=1,
        duration_seconds=5,
        enhance_prompt=True,
    ),
)

while not operation.done:
    time.sleep(20)
    operation = client.operations.get(operation)

video = operation.response.generated_videos[0].video
video.show()
```

### Image-to-Video

```python
image = types.Image.from_file("local/path/file.png")

operation = client.models.generate_videos(
    model='veo-2.0-generate-001',
    prompt='Night sky',
    image=image,
    config=types.GenerateVideosConfig(
        number_of_videos=1,
        duration_seconds=5,
    ),
)
```

### Video-to-Video (Vertex AI only)

```python
operation = client.models.generate_videos(
    model='veo-2.0-generate-001',
    prompt='Night sky',
    video=types.Video(uri="gs://bucket/video.mp4"),
    config=types.GenerateVideosConfig(
        duration_seconds=5,
    ),
)
```

## Chats Module

Create multi-turn conversations maintaining context:

```python
chat = client.chats.create(model='gemini-2.5-flash')
response = chat.send_message('tell me a story')
print(response.text)
response = chat.send_message('summarize in 1 sentence')
print(response.text)
```

### Streaming

```python
for chunk in chat.send_message_stream('tell me a story'):
    print(chunk.text)
```

### Async

```python
chat = client.aio.chats.create(model='gemini-2.5-flash')
response = await chat.send_message('tell me a story')
```

## Files Module

Gemini Developer API only.

### Upload

```python
file = client.files.upload(file='document.pdf')
```

### Usage in Requests

```python
response = client.models.generate_content(
    model='gemini-2.5-flash',
    contents=['Summarize this file?', file]
)
```

### Get, List, Delete

```python
file_info = client.files.get(name=file.name)
client.files.delete(name=file.name)
```

## Caches Module

Optimize API usage with prompt caching.

### Create Cache

```python
cached_content = client.caches.create(
    model='gemini-2.5-flash',
    config=types.CreateCachedContentConfig(
        contents=[
            types.Content(
                role='user',
                parts=[
                    types.Part.from_uri(
                        file_uri='gs://bucket/file.pdf',
                        mime_type='application/pdf'
                    ),
                ],
            )
        ],
        system_instruction='What is the sum of the PDFs?',
        ttl='3600s',
    ),
)
```

### Use Cache

```python
response = client.models.generate_content(
    model='gemini-2.5-flash',
    contents='Summarize the PDFs',
    config=types.GenerateContentConfig(
        cached_content=cached_content.name,
    ),
)
```

## Tunings Module

Supervised fine-tuning (Vertex AI only).

### Create Tuning Job

```python
training_dataset = types.TuningDataset(
    gcs_uri='gs://bucket/tuning-data.jsonl',
)

tuning_job = client.tunings.tune(
    base_model='gemini-2.5-flash',
    training_dataset=training_dataset,
    config=types.CreateTuningJobConfig(
        epoch_count=1,
        tuned_model_display_name='my_tuned_model',
    ),
)
```

### Monitor Job

```python
while tuning_job.state not in ['JOB_STATE_SUCCEEDED', 'JOB_STATE_FAILED']:
    tuning_job = client.tunings.get(name=tuning_job.name)
    time.sleep(10)
```

### Use Tuned Model

```python
response = client.models.generate_content(
    model=tuning_job.tuned_model.endpoint,
    contents='why is the sky blue?',
)
```

### List Tuned Models

```python
for model in client.models.list(
    config={'page_size': 10, 'query_base': False}
):
    print(model)
```

## Batch Prediction

### Create Batch Job

**Vertex AI (BigQuery or GCS source):**
```python
job = client.batches.create(
    model='gemini-2.5-flash',
    src='bq://project.dataset.table',
)
```

**Gemini Developer API (inlined requests):**
```python
batch_job = client.batches.create(
    model="gemini-2.5-flash",
    src=[{
        "contents": [{
            "parts": [{"text": "Hello!"}],
            "role": "user",
        }],
        "config": {"response_modalities": ["text"]},
    }],
)
```

### Monitor & Retrieve Results

```python
while job.state not in ['JOB_STATE_SUCCEEDED', 'JOB_STATE_FAILED']:
    job = client.batches.get(name=job.name)
    time.sleep(30)
```

### List Batch Jobs

```python
for job in client.batches.list(
    config=types.ListBatchJobsConfig(page_size=10)
):
    print(job)
```

## HTTP Configuration

### API Version Selection

```python
client = genai.Client(
    vertexai=True,
    project='your-project-id',
    http_options=types.HttpOptions(api_version='v1')
)
```

### Custom Base URL

```python
client = Client(
    vertexai=True,
    http_options={
        'base_url': 'https://proxy.example.com',
        'headers': {'Authorization': 'Bearer token'},
    },
)
```

### Proxy Configuration

```bash
export HTTPS_PROXY='http://user:pass@proxy:port'
export SSL_CERT_FILE='client.pem'
```

### Aiohttp for Async (Optional)

Install with `google-genai[aiohttp]` for faster async performance.

```python
http_options = types.HttpOptions(
    async_client_args={'cookies': ..., 'ssl': ...},
)
client = Client(..., http_options=http_options)
```

## Error Handling

```python
from google.genai import errors

try:
    client.models.generate_content(
        model="invalid-model",
        contents="What is your name?",
    )
except errors.APIError as e:
    print(e.code)  # HTTP status code
    print(e.message)
```

## Extra Request Body

Access experimental features via `extra_body`:

```python
response = client.models.generate_content(
    model="gemini-2.5-pro",
    contents="What is the weather?",
    config=types.GenerateContentConfig(
        tools=[get_weather],
        http_options=types.HttpOptions(
            extra_body={
                'tool_config': {
                    'function_calling_config': {
                        'mode': 'COMPOSITIONAL'
                    }
                }
            }
        ),
    ),
)
```

## Reference Documentation

The SDK provides comprehensive type definitions through `google.genai.types` covering:

- **Core types:** `Content`, `Part`, `Candidate`, `GenerateContentConfig`
- **Request/response:** `GenerateContentRequest`, `CountTokensResponse`
- **Configuration:** `SafetySetting`, `ToolConfig`, `ImageConfig`
- **Tools:** `FunctionDeclaration`, `Tool`, `FunctionCall`
- **Schema:** Pydantic models for type safety
- **Enums:** Status constants, categories, modes

---

**Documentation Source:** Google Gen AI SDK official documentation
**Package:** `google-genai` (PyPI)
**GitHub:** googleapis/python-genai
