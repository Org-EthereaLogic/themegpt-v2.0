"""
Tests for ADWS Provider Clients Module.

Tests cover:
- LLMResponse model
- Client initialization
- API call structure (unit tests with mocks)
- Real API connectivity (integration tests)
"""

import os
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from adws.adw_modules.provider_clients import (
    ClaudeClient,
    GeminiClient,
    GPTClient,
    LLMResponse,
    ProviderClientFactory,
)


class TestLLMResponse:
    """Tests for LLMResponse model."""

    def test_create_response(self) -> None:
        """Test creating an LLM response."""
        response = LLMResponse(
            content="Hello, world!",
            model="test-model",
            provider="test",
            tokens_used=100,
            latency_ms=150.5,
        )
        assert response.content == "Hello, world!"
        assert response.model == "test-model"
        assert response.provider == "test"
        assert response.tokens_used == 100
        assert response.latency_ms == 150.5

    def test_response_is_frozen(self) -> None:
        """Test that response is immutable."""
        response = LLMResponse(
            content="test",
            model="test-model",
            provider="test",
            tokens_used=10,
            latency_ms=50.0,
        )
        # Frozen pydantic models raise ValidationError on modification attempts
        import pydantic
        with pytest.raises(pydantic.ValidationError):
            response.content = "modified"  # type: ignore[misc]


class TestClaudeClient:
    """Tests for ClaudeClient."""

    def test_init_requires_api_key(self) -> None:
        """Test that initialization fails without API key."""
        with patch.dict(os.environ, {}, clear=True), patch(
            "adws.adw_modules.provider_clients.load_dotenv"
        ), pytest.raises(ValueError, match="ANTHROPIC_API_KEY"):
            ClaudeClient()

    def test_init_with_explicit_key(self) -> None:
        """Test initialization with explicit API key."""
        with patch("anthropic.AsyncAnthropic"):
            client = ClaudeClient(api_key="test-key")
            assert client.api_key == "test-key"
            assert client.provider == "anthropic"

    @pytest.mark.asyncio
    async def test_complete_returns_response(self) -> None:
        """Test that complete returns standardized response."""
        with patch("anthropic.AsyncAnthropic") as mock_cls:
            mock_client = MagicMock()
            mock_cls.return_value = mock_client

            # Create mock response
            mock_response = MagicMock()
            mock_response.content = [MagicMock(text="Test response")]
            mock_response.usage.input_tokens = 10
            mock_response.usage.output_tokens = 5

            mock_client.messages.create = AsyncMock(return_value=mock_response)

            client = ClaudeClient(api_key="test-key")
            response = await client.complete("Hello")

            assert isinstance(response, LLMResponse)
            assert response.content == "Test response"
            assert response.provider == "anthropic"
            assert response.tokens_used == 15


class TestGPTClient:
    """Tests for GPTClient."""

    def test_init_requires_api_key(self) -> None:
        """Test that initialization fails without API key."""
        with patch.dict(os.environ, {}, clear=True), patch(
            "adws.adw_modules.provider_clients.load_dotenv"
        ), pytest.raises(ValueError, match="OPENAI_API_KEY"):
            GPTClient()

    def test_init_with_explicit_key(self) -> None:
        """Test initialization with explicit API key."""
        with patch("openai.AsyncOpenAI"):
            client = GPTClient(api_key="test-key")
            assert client.api_key == "test-key"
            assert client.provider == "openai"

    def test_fallback_chain_exists(self) -> None:
        """Test that fallback chain is defined."""
        assert len(GPTClient.FALLBACK_CHAIN) > 0
        assert "gpt-5.2" in GPTClient.FALLBACK_CHAIN

    @pytest.mark.asyncio
    async def test_complete_returns_response(self) -> None:
        """Test that complete returns standardized response."""
        with patch("openai.AsyncOpenAI") as mock_cls:
            mock_client = MagicMock()
            mock_cls.return_value = mock_client

            # Create mock response
            mock_response = MagicMock()
            mock_response.choices = [
                MagicMock(message=MagicMock(content="Test response"))
            ]
            mock_response.usage.prompt_tokens = 10
            mock_response.usage.completion_tokens = 5

            mock_client.chat.completions.create = AsyncMock(
                return_value=mock_response
            )

            client = GPTClient(api_key="test-key")
            response = await client.complete("Hello")

            assert isinstance(response, LLMResponse)
            assert response.content == "Test response"
            assert response.provider == "openai"
            assert response.tokens_used == 15

    @pytest.mark.asyncio
    async def test_fallback_on_not_found(self) -> None:
        """Test that client falls back when model not found."""
        import openai

        with patch("openai.AsyncOpenAI") as mock_cls:
            mock_client = MagicMock()
            mock_cls.return_value = mock_client

            # First call fails, second succeeds
            mock_success = MagicMock()
            mock_success.choices = [
                MagicMock(message=MagicMock(content="Fallback response"))
            ]
            mock_success.usage.prompt_tokens = 10
            mock_success.usage.completion_tokens = 5

            mock_error = openai.NotFoundError(
                message="Model not found",
                response=MagicMock(),
                body=None,
            )

            mock_client.chat.completions.create = AsyncMock(
                side_effect=[mock_error, mock_success]
            )

            client = GPTClient(api_key="test-key")
            response = await client.complete("Hello")

            assert response.content == "Fallback response"


class TestGeminiClient:
    """Tests for GeminiClient."""

    def test_init_requires_api_key(self) -> None:
        """Test that initialization fails without API key."""
        with patch.dict(os.environ, {}, clear=True), patch(
            "adws.adw_modules.provider_clients.load_dotenv"
        ), pytest.raises(ValueError, match="GEMINI_API_KEY"):
            GeminiClient()

    def test_init_with_explicit_key(self) -> None:
        """Test initialization with explicit API key."""
        with (
            patch("adws.adw_modules.provider_clients.genai.Client"),
        ):
            client = GeminiClient(api_key="test-key")
            assert client.api_key == "test-key"
            assert client.provider == "gemini"

    @pytest.mark.asyncio
    async def test_complete_returns_response(self) -> None:
        """Test that complete returns standardized response."""
        with (
            patch("adws.adw_modules.provider_clients.genai.Client") as mock_client_cls,
        ):
            # Create mock response
            mock_part = MagicMock()
            mock_part.text = "Test response"
            mock_content = MagicMock()
            mock_content.parts = [mock_part]
            mock_candidate = MagicMock()
            mock_candidate.content = mock_content
            mock_response = MagicMock()
            mock_response.candidates = [mock_candidate]
            mock_response.usage_metadata = MagicMock()
            mock_response.usage_metadata.prompt_token_count = 10
            mock_response.usage_metadata.candidates_token_count = 5
            mock_response.usage_metadata.total_token_count = None

            mock_client = MagicMock()
            mock_async_models = MagicMock()
            mock_async_models.generate_content = AsyncMock(return_value=mock_response)
            mock_client.aio.models = mock_async_models
            mock_client_cls.return_value = mock_client

            client = GeminiClient(api_key="test-key")
            response = await client.complete("Hello")

            assert isinstance(response, LLMResponse)
            assert response.content == "Test response"
            assert response.provider == "gemini"


class TestProviderClientFactory:
    """Tests for ProviderClientFactory."""

    def test_create_trinity_clients(self) -> None:
        """Test that factory creates all three clients."""
        with (
            patch("anthropic.AsyncAnthropic"),
            patch("openai.AsyncOpenAI"),
            patch("adws.adw_modules.provider_clients.genai.Client"),
            patch.dict(
                os.environ,
                {
                    "ANTHROPIC_API_KEY": "test",
                    "OPENAI_API_KEY": "test",
                    "GEMINI_API_KEY": "test",
                },
            ),
        ):
            clients = ProviderClientFactory.create_trinity_clients()

            assert "architect" in clients
            assert "critic" in clients
            assert "advocate" in clients

            assert isinstance(clients["architect"], ClaudeClient)
            assert isinstance(clients["critic"], GPTClient)
            assert isinstance(clients["advocate"], GeminiClient)


# Integration tests - require real API keys
class TestIntegrationClaudeClient:
    """Integration tests for ClaudeClient with real API."""

    @pytest.mark.integration
    @pytest.mark.asyncio
    async def test_real_api_call(self) -> None:
        """Test real API call to Claude."""
        if not os.getenv("ANTHROPIC_API_KEY"):
            pytest.skip("ANTHROPIC_API_KEY not set")

        client = ClaudeClient()
        response = await client.complete(
            prompt="Reply with only: OK",
            max_tokens=10,
            timeout=30.0,
        )

        assert isinstance(response, LLMResponse)
        assert response.provider == "anthropic"
        assert response.tokens_used > 0
        assert response.latency_ms > 0


class TestIntegrationGPTClient:
    """Integration tests for GPTClient with real API."""

    @pytest.mark.integration
    @pytest.mark.asyncio
    async def test_real_api_call(self) -> None:
        """Test real API call to GPT."""
        if not os.getenv("OPENAI_API_KEY"):
            pytest.skip("OPENAI_API_KEY not set")

        client = GPTClient()
        response = await client.complete(
            prompt="Reply with only: OK",
            max_tokens=10,
            timeout=30.0,
        )

        assert isinstance(response, LLMResponse)
        assert response.provider == "openai"
        assert response.tokens_used > 0
        assert response.latency_ms > 0


class TestIntegrationGeminiClient:
    """Integration tests for GeminiClient with real API."""

    @pytest.mark.integration
    @pytest.mark.asyncio
    async def test_real_api_call(self) -> None:
        """Test real API call to Gemini."""
        if not os.getenv("GEMINI_API_KEY"):
            pytest.skip("GEMINI_API_KEY not set")

        client = GeminiClient()
        response = await client.complete(
            prompt="Reply with only: OK",
            max_tokens=10,
            timeout=30.0,
        )

        assert isinstance(response, LLMResponse)
        assert response.provider == "gemini"
        assert response.latency_ms > 0
