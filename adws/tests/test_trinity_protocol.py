"""
Tests for ADWS Trinity Protocol Module.

Tests cover:
- TrinityPerspective and TrinityPlan models
- Divergence phase (parallel API calls)
- Convergence phase (synthesis)
- Plan persistence (MD and JSON)
"""

import json
import os
from datetime import datetime
from pathlib import Path
from unittest.mock import AsyncMock, MagicMock

import pytest

from adws.adw_modules.provider_clients import LLMResponse
from adws.adw_modules.trinity_protocol import (
    TrinityPerspective,
    TrinityPlan,
    TrinityProtocol,
)


class TestTrinityPerspective:
    """Tests for TrinityPerspective model."""

    def test_create_successful_perspective(self) -> None:
        """Test creating a successful perspective."""
        perspective = TrinityPerspective(
            role="architect",
            provider="anthropic",
            model="claude-opus-4-5-20251101",
            content="System design analysis...",
            tokens_used=500,
            latency_ms=1500.0,
        )
        assert perspective.role == "architect"
        assert perspective.success is True
        assert perspective.error_message is None

    def test_create_failed_perspective(self) -> None:
        """Test creating a failed perspective."""
        perspective = TrinityPerspective(
            role="critic",
            provider="openai",
            model="gpt-5.2",
            content="Error during analysis",
            tokens_used=0,
            latency_ms=100.0,
            success=False,
            error_message="API timeout",
        )
        assert perspective.success is False
        assert perspective.error_message == "API timeout"


class TestTrinityPlan:
    """Tests for TrinityPlan model."""

    def test_create_minimal_plan(self) -> None:
        """Test creating a plan with required fields."""
        plan = TrinityPlan(
            adw_id="a1b2c3d4",
            issue_number=42,
            issue_title="Add feature X",
            issue_body="Description of feature X",
            architect_perspective="Design analysis",
            critic_perspective="Security analysis",
            advocate_perspective="UX analysis",
            summary="Implementation summary",
            approach="Technical approach",
            test_strategy="Testing approach",
            estimated_complexity="medium",
        )
        assert plan.adw_id == "a1b2c3d4"
        assert plan.issue_number == 42
        assert plan.estimated_complexity == "medium"
        assert isinstance(plan.created_at, datetime)

    def test_plan_json_serialization(self) -> None:
        """Test that plan can be serialized to JSON."""
        plan = TrinityPlan(
            adw_id="test1234",
            issue_number=1,
            issue_title="Test",
            issue_body="Test body",
            architect_perspective="Arch",
            critic_perspective="Critic",
            advocate_perspective="Advocate",
            summary="Summary",
            approach="Approach",
            test_strategy="Tests",
            estimated_complexity="low",
            files_to_modify=["file1.py"],
            files_to_create=["file2.py"],
            risks=["Risk 1"],
        )
        json_str = plan.model_dump_json()
        data = json.loads(json_str)
        assert data["adw_id"] == "test1234"
        assert data["files_to_modify"] == ["file1.py"]
        assert data["risks"] == ["Risk 1"]


class TestTrinityProtocol:
    """Tests for TrinityProtocol class."""

    @pytest.fixture
    def mock_clients(self) -> dict[str, MagicMock]:
        """Create mock provider clients."""
        clients: dict[str, MagicMock] = {}

        for role, provider in [
            ("architect", "anthropic"),
            ("critic", "openai"),
            ("advocate", "gemini"),
        ]:
            mock = MagicMock()
            mock.complete = AsyncMock(
                return_value=LLMResponse(
                    content=f"Mock {role} analysis response",
                    model=f"{provider}-model",
                    provider=provider,
                    tokens_used=100,
                    latency_ms=500.0,
                )
            )
            clients[role] = mock

        return clients

    def test_init_without_clients_creates_trinity_clients(self) -> None:
        """Test that init without clients creates Trinity clients from factory."""
        # This test verifies the code path works when API keys are available
        # The ProviderClientFactory loads .env automatically
        try:
            protocol = TrinityProtocol()
            assert "architect" in protocol.clients
            assert "critic" in protocol.clients
            assert "advocate" in protocol.clients
        except ValueError:
            # If API keys are not available, skip this test
            pytest.skip("API keys not available")

    def test_init_with_mock_clients(
        self,
        mock_clients: dict[str, MagicMock],
    ) -> None:
        """Test initialization with mock clients."""
        protocol = TrinityProtocol(clients=mock_clients)
        assert "architect" in protocol.clients
        assert "critic" in protocol.clients
        assert "advocate" in protocol.clients

    @pytest.mark.asyncio
    async def test_diverge_calls_all_providers(
        self,
        mock_clients: dict[str, MagicMock],
    ) -> None:
        """Test that divergence calls all three providers."""
        protocol = TrinityProtocol(clients=mock_clients)

        perspectives = await protocol._diverge(
            issue_title="Test Issue",
            issue_body="Test body",
            repo_context=None,
        )

        assert len(perspectives) == 3

        # Verify all clients were called
        for client in mock_clients.values():
            client.complete.assert_called_once()

    @pytest.mark.asyncio
    async def test_diverge_handles_failure(
        self,
        mock_clients: dict[str, MagicMock],
    ) -> None:
        """Test that divergence handles provider failures gracefully."""
        # Make critic fail
        mock_clients["critic"].complete = AsyncMock(
            side_effect=RuntimeError("API error")
        )

        protocol = TrinityProtocol(clients=mock_clients)

        perspectives = await protocol._diverge(
            issue_title="Test",
            issue_body="Body",
            repo_context=None,
        )

        # Should still get 3 perspectives
        assert len(perspectives) == 3

        # Find the failed perspective
        critic_perspective = next(p for p in perspectives if p.role == "critic")
        assert critic_perspective.success is False
        assert "API error" in (critic_perspective.error_message or "")

    @pytest.mark.asyncio
    async def test_converge_produces_plan(
        self,
        mock_clients: dict[str, MagicMock],
    ) -> None:
        """Test that convergence produces a valid plan."""
        # Setup architect to return JSON for convergence
        convergence_response = json.dumps({
            "summary": "Implementation summary",
            "approach": "Technical approach",
            "files_to_modify": ["file1.py"],
            "files_to_create": ["file2.py"],
            "test_strategy": "Unit tests",
            "risks": ["Risk 1"],
            "estimated_complexity": "medium",
        })

        mock_clients["architect"].complete = AsyncMock(
            return_value=LLMResponse(
                content=convergence_response,
                model="claude-test",
                provider="anthropic",
                tokens_used=200,
                latency_ms=1000.0,
            )
        )

        protocol = TrinityProtocol(clients=mock_clients)

        perspectives = [
            TrinityPerspective(
                role="architect",
                provider="anthropic",
                model="claude-test",
                content="Architect analysis",
                tokens_used=100,
                latency_ms=500.0,
            ),
            TrinityPerspective(
                role="critic",
                provider="openai",
                model="gpt-test",
                content="Critic analysis",
                tokens_used=100,
                latency_ms=500.0,
            ),
            TrinityPerspective(
                role="advocate",
                provider="gemini",
                model="gemini-test",
                content="Advocate analysis",
                tokens_used=100,
                latency_ms=500.0,
            ),
        ]

        plan = await protocol._converge(
            adw_id="test1234",
            issue_number=42,
            issue_title="Test Issue",
            issue_body="Test body",
            perspectives=perspectives,
        )

        assert isinstance(plan, TrinityPlan)
        assert plan.adw_id == "test1234"
        assert plan.issue_number == 42
        assert plan.summary == "Implementation summary"
        assert plan.files_to_modify == ["file1.py"]

    @pytest.mark.asyncio
    async def test_full_execute(
        self,
        mock_clients: dict[str, MagicMock],
    ) -> None:
        """Test full protocol execution."""
        # Setup convergence response
        convergence_response = json.dumps({
            "summary": "Full execution summary",
            "approach": "Full approach",
            "files_to_modify": [],
            "files_to_create": ["new.py"],
            "test_strategy": "Integration tests",
            "risks": [],
            "estimated_complexity": "low",
        })

        # First call returns analysis, second returns convergence JSON
        mock_clients["architect"].complete = AsyncMock(
            side_effect=[
                LLMResponse(
                    content="Architect divergence analysis",
                    model="claude-test",
                    provider="anthropic",
                    tokens_used=100,
                    latency_ms=500.0,
                ),
                LLMResponse(
                    content=convergence_response,
                    model="claude-test",
                    provider="anthropic",
                    tokens_used=200,
                    latency_ms=1000.0,
                ),
            ]
        )

        protocol = TrinityProtocol(clients=mock_clients)

        plan = await protocol.execute(
            issue_number=123,
            issue_title="Full Test",
            issue_body="Full test body",
            adw_id="full1234",
        )

        assert isinstance(plan, TrinityPlan)
        assert plan.adw_id == "full1234"
        assert plan.summary == "Full execution summary"

    def test_save_plan_creates_files(
        self,
        temp_workspace: Path,
        mock_clients: dict[str, MagicMock],
    ) -> None:
        """Test that save_plan creates MD and JSON files."""
        protocol = TrinityProtocol(clients=mock_clients)

        plan = TrinityPlan(
            adw_id="save1234",
            issue_number=99,
            issue_title="Save Test",
            issue_body="Body",
            architect_perspective="Arch",
            critic_perspective="Critic",
            advocate_perspective="Advocate",
            summary="Save summary",
            approach="Approach",
            test_strategy="Tests",
            estimated_complexity="high",
        )

        specs_base = temp_workspace / "specs"
        plan_md, plan_json = protocol.save_plan(plan, specs_base=specs_base)

        assert plan_md.exists()
        assert plan_json.exists()
        assert plan_md == specs_base / "save1234" / "plan.md"
        assert plan_json == specs_base / "save1234" / "plan.json"

        # Verify content
        md_content = plan_md.read_text()
        assert "Save Test" in md_content
        assert "save1234" in md_content

        json_content = json.loads(plan_json.read_text())
        assert json_content["adw_id"] == "save1234"
        assert json_content["summary"] == "Save summary"

    def test_parse_plan_response_json(
        self,
        mock_clients: dict[str, MagicMock],
    ) -> None:
        """Test parsing JSON response."""
        protocol = TrinityProtocol(clients=mock_clients)

        content = '{"summary": "Test", "approach": "Approach"}'
        result = protocol._parse_plan_response(content)
        assert result["summary"] == "Test"

    def test_parse_plan_response_markdown_json(
        self,
        mock_clients: dict[str, MagicMock],
    ) -> None:
        """Test parsing JSON wrapped in markdown code block."""
        protocol = TrinityProtocol(clients=mock_clients)

        content = '```json\n{"summary": "Wrapped"}\n```'
        result = protocol._parse_plan_response(content)
        assert result["summary"] == "Wrapped"

    def test_parse_plan_response_invalid(
        self,
        mock_clients: dict[str, MagicMock],
    ) -> None:
        """Test that invalid JSON raises ValueError."""
        protocol = TrinityProtocol(clients=mock_clients)

        with pytest.raises(ValueError, match="Failed to parse"):
            protocol._parse_plan_response("not valid json")


class TestTrinityProtocolIntegration:
    """Integration tests requiring real API keys."""

    @pytest.mark.integration
    @pytest.mark.asyncio
    async def test_real_execute(self, temp_workspace: Path) -> None:
        """Test full protocol with real API calls."""
        if not all([
            os.getenv("ANTHROPIC_API_KEY"),
            os.getenv("OPENAI_API_KEY"),
            os.getenv("GEMINI_API_KEY"),
        ]):
            pytest.skip("All API keys required for integration test")

        protocol = TrinityProtocol()

        plan = await protocol.execute(
            issue_number=1,
            issue_title="Add user authentication",
            issue_body="Implement JWT-based authentication for the API",
            adw_id="integ123",
        )

        assert isinstance(plan, TrinityPlan)
        assert plan.adw_id == "integ123"
        assert len(plan.summary) > 0
        assert plan.total_tokens > 0
        assert plan.total_latency_ms > 0

        # Save and verify
        specs_base = temp_workspace / "specs"
        plan_md, plan_json = protocol.save_plan(plan, specs_base=specs_base)

        assert plan_md.exists()
        assert plan_json.exists()
