"""Multi-provider LLM functions for ADW workflows.

DESIGN: NO abstract classes, NO adapters, NO registries.
Just simple async functions that make API calls.
"""

import asyncio
import os
from typing import Dict, Callable, Awaitable

from anthropic import AsyncAnthropic
from openai import AsyncOpenAI
import google.generativeai as genai


# Default models per provider
DEFAULT_MODELS = {
    "anthropic": "claude-sonnet-4-5-20250929",
    "openai": "gpt-4o",
    "gemini": "gemini-2.0-flash-exp",
}


async def call_anthropic(prompt: str, model: str = None) -> str:
    """Call Anthropic Claude API.
    
    Args:
        prompt: The prompt to send
        model: Model to use (default: claude-sonnet-4-5-20250929)
        
    Returns:
        Response text from Claude
    """
    model = model or DEFAULT_MODELS["anthropic"]
    client = AsyncAnthropic()
    
    response = await client.messages.create(
        model=model,
        max_tokens=4000,
        messages=[{"role": "user", "content": prompt}]
    )
    
    return response.content[0].text


async def call_openai(prompt: str, model: str = None) -> str:
    """Call OpenAI API.
    
    Args:
        prompt: The prompt to send
        model: Model to use (default: gpt-4o)
        
    Returns:
        Response text from GPT
    """
    model = model or DEFAULT_MODELS["openai"]
    client = AsyncOpenAI()
    
    response = await client.chat.completions.create(
        model=model,
        max_tokens=4000,
        messages=[{"role": "user", "content": prompt}]
    )
    
    return response.choices[0].message.content


async def call_gemini(prompt: str, model: str = None) -> str:
    """Call Google Gemini API.
    
    Args:
        prompt: The prompt to send
        model: Model to use (default: gemini-2.0-flash-exp)
        
    Returns:
        Response text from Gemini
    """
    model = model or DEFAULT_MODELS["gemini"]
    
    # Configure API key
    api_key = os.environ.get("GOOGLE_API_KEY")
    if not api_key:
        raise ValueError("GOOGLE_API_KEY environment variable required")
    
    genai.configure(api_key=api_key)
    gemini_model = genai.GenerativeModel(model)
    
    # Run in executor since google.generativeai is sync
    loop = asyncio.get_event_loop()
    response = await loop.run_in_executor(
        None,
        lambda: gemini_model.generate_content(prompt)
    )
    
    return response.text


# Provider dispatch - simple dict lookup, NO registry pattern
PROVIDERS: Dict[str, Callable[[str, str], Awaitable[str]]] = {
    "anthropic": call_anthropic,
    "openai": call_openai,
    "gemini": call_gemini,
}


async def call_llm(provider: str, prompt: str, model: str = None) -> str:
    """Call any supported LLM provider.
    
    Args:
        provider: One of "anthropic", "openai", "gemini"
        prompt: The prompt to send
        model: Optional model override
        
    Returns:
        Response text from the LLM
        
    Raises:
        ValueError: If provider not supported
    """
    if provider not in PROVIDERS:
        raise ValueError(f"Unknown provider: {provider}. Supported: {list(PROVIDERS.keys())}")
    
    return await PROVIDERS[provider](prompt, model)
