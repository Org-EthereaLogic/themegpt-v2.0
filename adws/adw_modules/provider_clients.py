"""
ADWS Provider Clients Module

Provides unified async interface to Claude, GPT, and Gemini providers
for the Trinity Protocol. Includes timeout handling, retry logic, and
GPT fallback chain support.

Adapted from ADWS-Greenfield template for themeGPT-v2.0
"""

from __future__ import annotations

import asyncio
import os
import time
from abc import ABC, abstractmethod
from pathlib import Path

import anthropic
import google.genai as genai
import openai
from dotenv import load_dotenv
from pydantic import BaseModel, ConfigDict


def _load_env() -> None:
    """Load environment variables from .env file."""
    # Check multiple possible locations
    env_paths = [
        Path(__file__).parent.parent.parent / ".env.local",
        Path(__file__).parent.parent.parent / ".env",
        Path.cwd() / ".env.local",
        Path.cwd() / ".env",
    ]
    for env_path in env_paths:
        if env_path.exists():
            load_dotenv(env_path)
            return
    load_dotenv()


class LLMResponse(BaseModel):
    """Standardized response from any LLM provider."""

    content: str
    model: str
    provider: str
    tokens_used: int
    latency_ms: float

    model_config = ConfigDict(frozen=True)


class ProviderClient(ABC):
    """Abstract base for LLM provider clients."""

    @abstractmethod
    async def complete(
        self,
        prompt: str,
        system: str | None = None,
        max_tokens: int = 4096,
        timeout: float = 60.0,
    ) -> LLMResponse:
        """
        Generate completion from the provider.

        Args:
            prompt: The user prompt
            system: Optional system message
            max_tokens: Maximum tokens in response
            timeout: Request timeout in seconds

        Returns:
            Standardized LLMResponse
        """
        ...


class ClaudeClient(ProviderClient):
    """
    Claude Opus 4.5 client (The Architect).

    Model: claude-opus-4-5-20251101 (configurable via env)
    """

    def __init__(self, api_key: str | None = None) -> None:
        _load_env()
        self.api_key = api_key or os.getenv("ANTHROPIC_API_KEY")
        if not self.api_key:
            raise ValueError("ANTHROPIC_API_KEY not set")
        self.client = anthropic.AsyncAnthropic(api_key=self.api_key)
        self.model = os.getenv("TRINITY_ARCHITECT_MODEL", "claude-opus-4-5-20251101")
        self.provider = "anthropic"

    async def complete(
        self,
        prompt: str,
        system: str | None = None,
        max_tokens: int = 4096,
        timeout: float = 60.0,
    ) -> LLMResponse:
        """Generate completion using Claude."""
        start_time = time.perf_counter()

        messages: list[anthropic.types.MessageParam] = [
            {"role": "user", "content": prompt}
        ]

        try:
            if system:
                response = await asyncio.wait_for(
                    self.client.messages.create(
                        model=self.model,
                        max_tokens=max_tokens,
                        system=system,
                        messages=messages,
                    ),
                    timeout=timeout,
                )
            else:
                response = await asyncio.wait_for(
                    self.client.messages.create(
                        model=self.model,
                        max_tokens=max_tokens,
                        messages=messages,
                    ),
                    timeout=timeout,
                )
        except TimeoutError as e:
            raise TimeoutError(
                f"Claude request timed out after {timeout}s"
            ) from e

        latency_ms = (time.perf_counter() - start_time) * 1000

        content = ""
        if response.content:
            for block in response.content:
                if hasattr(block, "text"):
                    content += block.text

        tokens_used = response.usage.input_tokens + response.usage.output_tokens

        return LLMResponse(
            content=content,
            model=self.model,
            provider=self.provider,
            tokens_used=tokens_used,
            latency_ms=latency_ms,
        )


class GPTClient(ProviderClient):
    """
    GPT client with fallback chain (The Critic).

    Primary: gpt-5.2 (configurable via env)
    Fallback chain: gpt-4o → gpt-4o-mini → gpt-4-turbo
    """

    FALLBACK_CHAIN = [
        "gpt-5.2",
        "gpt-4o",
        "gpt-4o-mini",
        "gpt-4-turbo",
    ]

    def __init__(self, api_key: str | None = None) -> None:
        _load_env()
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")
        if not self.api_key:
            raise ValueError("OPENAI_API_KEY not set")
        self.client = openai.AsyncOpenAI(api_key=self.api_key)
        self._cached_model: str | None = None
        self.provider = "openai"

        # Get primary model from env, use first in fallback chain as default
        env_model = os.getenv("TRINITY_CRITIC_MODEL", "gpt-4o")
        if env_model not in self.FALLBACK_CHAIN:
            self._fallback_models = [env_model] + self.FALLBACK_CHAIN
        else:
            self._fallback_models = self.FALLBACK_CHAIN.copy()

    @property
    def model(self) -> str:
        """Return the current or cached working model."""
        return self._cached_model or self._fallback_models[0]

    async def complete(
        self,
        prompt: str,
        system: str | None = None,
        max_tokens: int = 4096,
        timeout: float = 60.0,
    ) -> LLMResponse:
        """
        Generate completion using GPT with fallback chain.

        Tries each model in the fallback chain until one succeeds.
        Caches the successful model for subsequent calls.
        """
        start_time = time.perf_counter()

        messages: list[dict[str, str]] = []
        if system:
            messages.append({"role": "system", "content": system})
        messages.append({"role": "user", "content": prompt})

        # If we have a cached working model, try it first
        models_to_try = (
            [self._cached_model] if self._cached_model else self._fallback_models
        )

        last_error: Exception | None = None

        for model in models_to_try:
            try:
                response = await asyncio.wait_for(
                    self.client.chat.completions.create(
                        model=model,
                        max_completion_tokens=max_tokens,
                        messages=messages,  # type: ignore[arg-type]
                    ),
                    timeout=timeout,
                )

                latency_ms = (time.perf_counter() - start_time) * 1000

                content = ""
                if response.choices:
                    content = response.choices[0].message.content or ""

                tokens_used = 0
                if response.usage:
                    tokens_used = (
                        response.usage.prompt_tokens + response.usage.completion_tokens
                    )

                # Cache the working model
                self._cached_model = model

                return LLMResponse(
                    content=content,
                    model=model,
                    provider=self.provider,
                    tokens_used=tokens_used,
                    latency_ms=latency_ms,
                )

            except openai.NotFoundError as e:
                # Model not found, try next in chain
                last_error = e
                if self._cached_model:
                    # Cached model failed, reset and try fallback chain
                    self._cached_model = None
                    models_to_try = self._fallback_models
                continue

            except TimeoutError as e:
                raise TimeoutError(
                    f"GPT request timed out after {timeout}s"
                ) from e

        # All models failed
        raise RuntimeError(
            f"All GPT models in fallback chain failed. Last error: {last_error}"
        )


class GeminiClient(ProviderClient):
    """
    Gemini client (The Advocate).

    Model: gemini-2.0-flash-exp (configurable via env)
    Uses the new google.genai package.
    """

    def __init__(self, api_key: str | None = None) -> None:
        _load_env()
        self.api_key = api_key or os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY or GOOGLE_API_KEY not set")
        self.model_name = os.getenv("TRINITY_ADVOCATE_MODEL", "gemini-2.0-flash-exp")
        self._client = genai.Client(api_key=self.api_key)
        self.provider = "gemini"

    @property
    def model(self) -> str:
        """Return the model name."""
        return self.model_name

    async def complete(
        self,
        prompt: str,
        system: str | None = None,
        max_tokens: int = 4096,
        timeout: float = 60.0,
    ) -> LLMResponse:
        """Generate completion using Gemini."""
        start_time = time.perf_counter()

        # Combine system prompt if provided
        full_prompt = prompt
        if system:
            full_prompt = f"{system}\n\n{prompt}"

        try:
            response = await asyncio.wait_for(
                self._client.aio.models.generate_content(
                    model=self.model_name,
                    contents=full_prompt,
                    config=genai.types.GenerateContentConfig(
                        max_output_tokens=max_tokens
                    ),
                ),
                timeout=timeout,
            )
        except TimeoutError as e:
            raise TimeoutError(
                f"Gemini request timed out after {timeout}s"
            ) from e

        latency_ms = (time.perf_counter() - start_time) * 1000

        # Parse response content
        content = ""
        if response.candidates and len(response.candidates) > 0:
            candidate = response.candidates[0]
            if candidate.content and candidate.content.parts:
                for part in candidate.content.parts:
                    if hasattr(part, "text") and part.text is not None:
                        content += part.text

        # Get token count from usage metadata
        tokens_used = 0
        if hasattr(response, "usage_metadata") and response.usage_metadata:
            usage = response.usage_metadata
            if hasattr(usage, "prompt_token_count"):
                tokens_used += usage.prompt_token_count or 0
            if hasattr(usage, "candidates_token_count"):
                tokens_used += usage.candidates_token_count or 0
            if hasattr(usage, "total_token_count") and usage.total_token_count:
                tokens_used = usage.total_token_count

        return LLMResponse(
            content=content,
            model=self.model_name,
            provider=self.provider,
            tokens_used=tokens_used,
            latency_ms=latency_ms,
        )


class ProviderClientFactory:
    """Factory for creating provider clients with configuration."""

    @staticmethod
    def create_claude() -> ClaudeClient:
        """Create a Claude client."""
        return ClaudeClient()

    @staticmethod
    def create_gpt() -> GPTClient:
        """Create a GPT client with fallback chain."""
        return GPTClient()

    @staticmethod
    def create_gemini() -> GeminiClient:
        """Create a Gemini client."""
        return GeminiClient()

    @staticmethod
    def create_trinity_clients() -> dict[str, ProviderClient]:
        """
        Create all three Trinity protocol clients.

        Returns:
            Dict with keys: architect, critic, advocate
        """
        return {
            "architect": ClaudeClient(),
            "critic": GPTClient(),
            "advocate": GeminiClient(),
        }
