"""
ADWS Trinity Protocol Module

Implements the multi-LLM synthesis protocol with divergence and convergence phases.
Three models provide different perspectives which are synthesized into a unified plan.
"""

from __future__ import annotations

import asyncio
import json
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

from pydantic import BaseModel, ConfigDict, Field

from adws.adw_modules.provider_clients import (
    LLMResponse,
    ProviderClient,
    ProviderClientFactory,
)


class TrinityPerspective(BaseModel):
    """A single perspective from one Trinity role."""

    role: str  # architect, critic, advocate
    provider: str
    model: str
    content: str
    tokens_used: int
    latency_ms: float
    success: bool = True
    error_message: str | None = None

    model_config = ConfigDict(frozen=True)


class TrinityPlan(BaseModel):
    """
    Schema-validated output from Trinity convergence.

    This is the structured plan that drives subsequent phases.
    """

    adw_id: str
    issue_number: int
    issue_title: str
    issue_body: str

    # Perspectives (from divergence)
    architect_perspective: str
    critic_perspective: str
    advocate_perspective: str

    # Synthesized plan (from convergence)
    summary: str = Field(..., description="One-paragraph summary of the implementation")
    approach: str = Field(..., description="High-level technical approach")
    files_to_modify: list[str] = Field(default_factory=list)
    files_to_create: list[str] = Field(default_factory=list)
    test_strategy: str = Field(..., description="How the implementation will be tested")
    risks: list[str] = Field(
        default_factory=list, description="Identified risks and mitigations"
    )
    estimated_complexity: str = Field(..., description="low, medium, or high")

    # Metadata
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    total_tokens: int = 0
    total_latency_ms: float = 0

# Role-specific prompts for divergence phase
ARCHITECT_PROMPT = """You are The Architect — a senior systems designer analyzing a GitHub issue.

Issue: {issue_title}
Description: {issue_body}

{repo_context}

Provide your analysis covering:
1. System design approach
2. Component architecture
3. Integration points
4. Implementation sequence
5. Technical debt considerations

Focus on HOW to build this correctly."""

CRITIC_PROMPT = """You are The Critic — a security-focused code reviewer analyzing a GitHub issue.

Issue: {issue_title}
Description: {issue_body}

Provide your analysis covering:
1. Security implications
2. Edge cases and error scenarios
3. Performance concerns
4. Testing requirements
5. Potential vulnerabilities

Focus on WHAT could go wrong."""

ADVOCATE_PROMPT = """You are The Advocate — a UX and documentation specialist \
analyzing a GitHub issue.

Issue: {issue_title}
Description: {issue_body}

Provide your analysis covering:
1. User experience impact
2. Documentation requirements
3. API ergonomics
4. Error message clarity
5. Developer experience

Focus on WHO will use this and how."""

CONVERGENCE_PROMPT = """You are synthesizing perspectives from three experts \
into a unified implementation plan.

## Issue
Title: {issue_title}
Description: {issue_body}

## The Architect's Perspective (System Design)
{architect_perspective}

## The Critic's Perspective (Security & Edge Cases)
{critic_perspective}

## The Advocate's Perspective (UX & Documentation)
{advocate_perspective}

## Your Task
Synthesize these perspectives into a unified implementation plan.
You MUST respond with a JSON object containing these exact fields:

{{
    "summary": "A single paragraph summarizing the implementation approach",
    "approach": "The high-level technical approach to implement this feature",
    "files_to_modify": ["list", "of", "files", "to", "modify"],
    "files_to_create": ["list", "of", "new", "files"],
    "test_strategy": "How this implementation will be tested",
    "risks": ["Risk 1 and mitigation", "Risk 2 and mitigation"],
    "estimated_complexity": "low or medium or high"
}}

Respond ONLY with the JSON object, no additional text."""


class TrinityProtocol:
    """
    Execute the Trinity multi-model planning protocol.

    Divergence Phase:
        - Claude (Architect): System design and implementation approach
        - GPT (Critic): Security analysis and edge cases
        - Gemini (Advocate): UX and documentation requirements

    Convergence Phase:
        - Claude synthesizes all perspectives into unified plan
        - Output is schema-validated TrinityPlan
    """

    def __init__(
        self,
        clients: dict[str, ProviderClient] | None = None,
    ) -> None:
        """
        Initialize Trinity Protocol.

        Args:
            clients: Optional dict of clients (for testing). If not provided,
                    creates clients using ProviderClientFactory.
        """
        self.clients = clients or ProviderClientFactory.create_trinity_clients()

    async def execute(
        self,
        issue_number: int,
        issue_title: str,
        issue_body: str,
        adw_id: str,
        repo_context: str | None = None,
    ) -> TrinityPlan:
        """
        Execute full Trinity protocol.

        Args:
            issue_number: GitHub issue number
            issue_title: Issue title
            issue_body: Issue description/body
            adw_id: Workflow identifier
            repo_context: Optional repository context (README, structure, etc.)

        Returns:
            Schema-validated TrinityPlan
        """
        # Phase 1: Divergence (parallel)
        perspectives = await self._diverge(issue_title, issue_body, repo_context)

        # Phase 2: Convergence (synthesis)
        plan = await self._converge(
            adw_id=adw_id,
            issue_number=issue_number,
            issue_title=issue_title,
            issue_body=issue_body,
            perspectives=perspectives,
        )

        return plan

    async def _diverge(
        self,
        issue_title: str,
        issue_body: str,
        repo_context: str | None,
    ) -> list[TrinityPerspective]:
        """
        Execute divergence phase with parallel API calls.

        Returns perspectives from all three models.
        """
        context_section = (
            f"Repository Context:\n{repo_context}"
            if repo_context
            else "Repository Context: Not provided"
        )

        # Create role-specific prompts
        architect_prompt = ARCHITECT_PROMPT.format(
            issue_title=issue_title,
            issue_body=issue_body,
            repo_context=context_section,
        )

        critic_prompt = CRITIC_PROMPT.format(
            issue_title=issue_title,
            issue_body=issue_body,
        )

        advocate_prompt = ADVOCATE_PROMPT.format(
            issue_title=issue_title,
            issue_body=issue_body,
        )

        # Execute all three calls in parallel
        tasks = [
            self._call_provider("architect", architect_prompt),
            self._call_provider("critic", critic_prompt),
            self._call_provider("advocate", advocate_prompt),
        ]

        results = await asyncio.gather(*tasks, return_exceptions=True)

        perspectives: list[TrinityPerspective] = []

        role_names = ["architect", "critic", "advocate"]
        for role, result in zip(role_names, results, strict=True):
            if isinstance(result, BaseException):
                # Handle failed perspective
                perspectives.append(
                    TrinityPerspective(
                        role=role,
                        provider="unknown",
                        model="unknown",
                        content=f"Error during {role} analysis: {result}",
                        tokens_used=0,
                        latency_ms=0,
                        success=False,
                        error_message=str(result),
                    )
                )
            elif isinstance(result, TrinityPerspective):
                perspectives.append(result)

        return perspectives

    async def _call_provider(
        self,
        role: str,
        prompt: str,
    ) -> TrinityPerspective:
        """
        Call a single provider and return a perspective.

        Args:
            role: The Trinity role (architect, critic, advocate)
            prompt: The prompt to send

        Returns:
            TrinityPerspective with the response
        """
        client = self.clients[role]
        response: LLMResponse = await client.complete(
            prompt=prompt,
            max_tokens=2048,
            timeout=60.0,
        )

        return TrinityPerspective(
            role=role,
            provider=response.provider,
            model=response.model,
            content=response.content,
            tokens_used=response.tokens_used,
            latency_ms=response.latency_ms,
        )

    async def _converge(
        self,
        adw_id: str,
        issue_number: int,
        issue_title: str,
        issue_body: str,
        perspectives: list[TrinityPerspective],
    ) -> TrinityPlan:
        """
        Execute convergence phase with Claude as synthesizer.

        Returns schema-validated TrinityPlan.
        """
        # Extract perspectives by role
        perspective_map = {p.role: p for p in perspectives}

        architect_content = perspective_map.get("architect")
        critic_content = perspective_map.get("critic")
        advocate_content = perspective_map.get("advocate")

        architect_text = (
            architect_content.content if architect_content else "Not available"
        )
        critic_text = critic_content.content if critic_content else "Not available"
        advocate_text = advocate_content.content if advocate_content else "Not available"

        # Create convergence prompt
        convergence_prompt = CONVERGENCE_PROMPT.format(
            issue_title=issue_title,
            issue_body=issue_body,
            architect_perspective=architect_text,
            critic_perspective=critic_text,
            advocate_perspective=advocate_text,
        )

        # Call Claude for synthesis
        architect_client = self.clients["architect"]
        response = await architect_client.complete(
            prompt=convergence_prompt,
            system="You are a synthesis engine. Respond only with valid JSON.",
            max_tokens=2048,
            timeout=60.0,
        )

        # Parse JSON response
        plan_data = self._parse_plan_response(response.content)

        # Calculate totals
        total_tokens = sum(p.tokens_used for p in perspectives) + response.tokens_used
        total_latency = sum(p.latency_ms for p in perspectives) + response.latency_ms

        # Create TrinityPlan
        return TrinityPlan(
            adw_id=adw_id,
            issue_number=issue_number,
            issue_title=issue_title,
            issue_body=issue_body,
            architect_perspective=architect_text,
            critic_perspective=critic_text,
            advocate_perspective=advocate_text,
            summary=plan_data.get("summary", ""),
            approach=plan_data.get("approach", ""),
            files_to_modify=plan_data.get("files_to_modify", []),
            files_to_create=plan_data.get("files_to_create", []),
            test_strategy=plan_data.get("test_strategy", ""),
            risks=plan_data.get("risks", []),
            estimated_complexity=plan_data.get("estimated_complexity", "medium"),
            total_tokens=total_tokens,
            total_latency_ms=total_latency,
        )

    def _parse_plan_response(self, content: str) -> dict[str, Any]:
        """
        Parse the convergence response as JSON.

        Args:
            content: Raw response content

        Returns:
            Parsed dictionary

        Raises:
            ValueError: If response cannot be parsed as valid JSON
        """
        # Try to extract JSON from response
        content = content.strip()

        # Handle markdown code blocks
        if content.startswith("```json"):
            content = content[7:]
        elif content.startswith("```"):
            content = content[3:]
        if content.endswith("```"):
            content = content[:-3]

        content = content.strip()

        try:
            return json.loads(content)  # type: ignore[no-any-return]
        except json.JSONDecodeError as e:
            raise ValueError(
                f"Failed to parse convergence response as JSON: {e}\n"
                f"Content: {content[:500]}"
            ) from e

    def save_plan(
        self,
        plan: TrinityPlan,
        specs_base: Path | None = None,
    ) -> tuple[Path, Path]:
        """
        Save plan as both Markdown and JSON.

        Args:
            plan: The TrinityPlan to save
            specs_base: Base directory for specs (defaults to "specs")

        Returns:
            Tuple of (plan_md_path, plan_json_path)
        """
        if specs_base is None:
            specs_base = Path("specs")

        spec_dir = specs_base / plan.adw_id
        spec_dir.mkdir(parents=True, exist_ok=True)

        plan_md_path = spec_dir / "plan.md"
        plan_json_path = spec_dir / "plan.json"

        # Generate Markdown content
        md_content = self._generate_markdown(plan)
        plan_md_path.write_text(md_content, encoding="utf-8")

        # Write JSON
        plan_json_path.write_text(
            plan.model_dump_json(indent=2), encoding="utf-8"
        )

        return plan_md_path, plan_json_path

    def _generate_markdown(self, plan: TrinityPlan) -> str:
        """Generate human-readable Markdown from a TrinityPlan."""
        files_to_modify = "\n".join(f"- `{f}`" for f in plan.files_to_modify) or "None"
        files_to_create = "\n".join(f"- `{f}`" for f in plan.files_to_create) or "None"
        risks = "\n".join(f"- {r}" for r in plan.risks) or "None identified"

        return f"""# Implementation Plan: Issue #{plan.issue_number}

**ADW ID:** {plan.adw_id}
**Issue Title:** {plan.issue_title}
**Created:** {plan.created_at.isoformat()}
**Complexity:** {plan.estimated_complexity}

---

## Summary

{plan.summary}

## Technical Approach

{plan.approach}

## Files to Modify

{files_to_modify}

## Files to Create

{files_to_create}

## Test Strategy

{plan.test_strategy}

## Risks and Mitigations

{risks}

---

## Trinity Protocol Perspectives

### The Architect (System Design)

{plan.architect_perspective}

### The Critic (Security & Edge Cases)

{plan.critic_perspective}

### The Advocate (UX & Documentation)

{plan.advocate_perspective}

---

## Metadata

- **Total Tokens:** {plan.total_tokens}
- **Total Latency:** {plan.total_latency_ms:.2f}ms
"""
