#!/usr/bin/env python3
"""
ADWS Review Phase Entry Point

Orchestrates the review phase by:
1. Loading state and validating prerequisites (plan, build, test phases complete)
2. Gathering implementation context (diff, files, test summary)
3. Running parallel reviews via Trinity protocol:
   - Architect: correctness + integration
   - Critic: security + edge cases
   - Advocate: UX/API + docs
4. Computing consensus score and approval status
5. Recording artifacts:
   - agents/{adw_id}/review_report.json
   - agents/{adw_id}/review_summary.md
6. Recording phase completion

Usage:
    uv run python adws/scripts/adw_review_iso.py <issue_number> <adw_id>

Prerequisites:
    - State file at agents/{adw_id}/adw_state.json
    - Plan, build, and test phases completed successfully
    - Worktree at trees/{adw_id}/

Creates:
    - agents/{adw_id}/review_report.json
    - agents/{adw_id}/review_summary.md
"""

from __future__ import annotations

import asyncio
import json
import subprocess
import time
from datetime import UTC, datetime
from pathlib import Path

import typer
from pydantic import BaseModel, Field
from rich.console import Console
from rich.panel import Panel

from adws.adw_modules.provider_clients import (
    ClaudeClient,
    GeminiClient,
    GPTClient,
    LLMResponse,
)
from adws.adw_modules.state import StateManager
from adws.adw_modules.trinity_protocol import TrinityPlan

# Approval thresholds
APPROVAL_THRESHOLD = 0.7  # 70% consensus required for approval

# Initialize Typer app and Rich console
app = typer.Typer(
    name="adw-review",
    help="ADWS Review Phase - Trinity protocol code review",
)
console = Console()


class ReviewPerspective(BaseModel):
    """A single review perspective from one Trinity role."""

    role: str  # architect, critic, advocate
    provider: str
    model: str
    category: str  # correctness, security, ux
    rating: float  # 0.0 to 1.0
    issues: list[str] = Field(default_factory=list)
    suggestions: list[str] = Field(default_factory=list)
    raw_content: str = ""
    tokens_used: int = 0
    latency_ms: float = 0.0
    success: bool = True
    error_message: str | None = None


class ReviewReport(BaseModel):
    """Structured review report persisted to agents/{adw_id}/review_report.json."""

    adw_id: str
    issue_number: int
    started_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    completed_at: datetime | None = None
    duration_seconds: float = 0.0
    perspectives: list[ReviewPerspective] = Field(default_factory=list)
    consensus_score: float = 0.0
    approved: bool = False
    approval_threshold: float = APPROVAL_THRESHOLD
    total_tokens: int = 0
    total_latency_ms: float = 0.0
    files_reviewed: list[str] = Field(default_factory=list)
    test_summary: str = ""
    error_message: str | None = None


def load_plan(adw_id: str, specs_base: Path | None = None) -> TrinityPlan:
    """Load plan from specs/{adw_id}/plan.json."""
    if specs_base is None:
        specs_base = Path("specs")

    plan_path = specs_base / adw_id / "plan.json"

    if not plan_path.exists():
        raise FileNotFoundError(f"Plan not found at {plan_path}")

    with open(plan_path, encoding="utf-8") as f:
        data = json.load(f)

    if "created_at" in data and isinstance(data["created_at"], str):
        data["created_at"] = datetime.fromisoformat(data["created_at"])

    return TrinityPlan(**data)


def load_test_summary(adw_id: str, agents_base: Path | None = None) -> str:
    """Load test summary from agents/{adw_id}/test_report.json."""
    if agents_base is None:
        agents_base = Path("agents")

    report_path = agents_base / adw_id / "test_report.json"

    if not report_path.exists():
        return "Test report not available"

    with open(report_path, encoding="utf-8") as f:
        data = json.load(f)

    return (
        f"Tests: {data.get('final_passed', 0)} passed, "
        f"{data.get('final_failed', 0)} failed, "
        f"{data.get('final_errors', 0)} errors. "
        f"Attempts: {len(data.get('attempts', []))}. "
        f"Success: {data.get('success', False)}"
    )


def get_git_diff(worktree_path: Path) -> str:
    """Get git diff for the worktree branch."""
    result = subprocess.run(
        ["git", "diff", "main...HEAD", "--stat"],
        cwd=worktree_path,
        capture_output=True,
        text=True,
    )
    return result.stdout[:5000] if result.returncode == 0 else "Diff not available"


def get_file_contents(worktree_path: Path, file_paths: list[str]) -> dict[str, str]:
    """Get contents of specified files (truncated for large files)."""
    contents: dict[str, str] = {}
    max_size = 3000  # chars per file

    for file_path in file_paths[:10]:  # Limit to 10 files
        full_path = worktree_path / file_path
        if full_path.exists():
            try:
                content = full_path.read_text(encoding="utf-8")
                if len(content) > max_size:
                    content = content[:max_size] + "\n... [truncated]"
                contents[file_path] = content
            except (UnicodeDecodeError, OSError):
                contents[file_path] = "[Could not read file]"

    return contents


def parse_review_response(content: str, role: str) -> tuple[float, list[str], list[str]]:
    """
    Parse review response to extract rating, issues, and suggestions.

    Handles both JSON and free-form text responses.

    Returns:
        Tuple of (rating, issues, suggestions)
    """
    # Try JSON parsing first
    text = content.strip()
    if text.startswith("```"):
        text = text.split("\n", 1)[1]
    if text.endswith("```"):
        text = text.rsplit("```", 1)[0]
    text = text.strip()

    try:
        data = json.loads(text)
        rating = float(data.get("rating", 0.7))
        rating = max(0.0, min(1.0, rating))  # Clamp to 0-1
        json_issues: list[str] = data.get("issues", [])
        json_suggestions: list[str] = data.get("suggestions", [])
        return rating, json_issues, json_suggestions
    except (json.JSONDecodeError, ValueError, TypeError):
        text = content  # JSON parsing failed, proceed to heuristic parsing

    # Fall back to heuristic parsing
    fallback_issues: list[str] = []
    fallback_suggestions: list[str] = []

    # Look for common patterns
    lines = content.split("\n")
    current_section: str | None = None

    for line in lines:
        line_lower = line.lower().strip()
        if "issue" in line_lower or "problem" in line_lower or "concern" in line_lower:
            current_section = "issues"
        elif "suggest" in line_lower or "recommend" in line_lower:
            current_section = "suggestions"
        elif line.startswith("- ") or line.startswith("* "):
            item = line[2:].strip()
            if current_section == "issues":
                fallback_issues.append(item)
            elif current_section == "suggestions":
                fallback_suggestions.append(item)

    # Estimate rating based on sentiment
    positive_words = ["good", "excellent", "well", "correct", "clean", "proper"]
    negative_words = ["bad", "issue", "problem", "bug", "error", "missing", "wrong"]

    content_lower = content.lower()
    pos_count = sum(1 for word in positive_words if word in content_lower)
    neg_count = sum(1 for word in negative_words if word in content_lower)

    # Use sentiment-based rating or default to 0.7 (neutral)
    fallback_rating = (
        (pos_count + 1) / (pos_count + neg_count + 2)
        if pos_count + neg_count > 0
        else 0.7
    )

    return fallback_rating, fallback_issues[:10], fallback_suggestions[:10]


async def run_review(
    client: ClaudeClient | GPTClient | GeminiClient,
    role: str,
    category: str,
    context: str,
) -> ReviewPerspective:
    """
    Run a single review with the specified client.

    Args:
        client: LLM client to use
        role: Trinity role (architect, critic, advocate)
        category: Review category (correctness, security, ux)
        context: Implementation context to review

    Returns:
        ReviewPerspective with results
    """
    prompts = {
        "architect": f"""You are The Architect reviewing code for correctness and integration.

{context}

## Review Focus
1. Code correctness and logic
2. Integration with existing codebase
3. Architecture alignment
4. Error handling completeness

## Instructions
Provide a JSON response with:
- "rating": 0.0 to 1.0 (1.0 = perfect)
- "issues": list of identified issues
- "suggestions": list of improvement suggestions

Respond ONLY with the JSON object.""",

        "critic": f"""You are The Critic reviewing code for security and edge cases.

{context}

## Review Focus
1. Security vulnerabilities
2. Edge cases and error scenarios
3. Input validation
4. Resource management

## Instructions
Provide a JSON response with:
- "rating": 0.0 to 1.0 (1.0 = perfect)
- "issues": list of identified issues
- "suggestions": list of improvement suggestions

Respond ONLY with the JSON object.""",

        "advocate": f"""You are The Advocate reviewing code for UX and documentation.

{context}

## Review Focus
1. API ergonomics
2. Error message clarity
3. Documentation completeness
4. Developer experience

## Instructions
Provide a JSON response with:
- "rating": 0.0 to 1.0 (1.0 = perfect)
- "issues": list of identified issues
- "suggestions": list of improvement suggestions

Respond ONLY with the JSON object.""",
    }

    prompt = prompts[role]

    try:
        response: LLMResponse = await client.complete(
            prompt=prompt,
            system="You are a code reviewer. Respond with structured JSON feedback.",
            max_tokens=2048,
            timeout=60.0,
        )

        rating, issues, suggestions = parse_review_response(response.content, role)

        return ReviewPerspective(
            role=role,
            provider=response.provider,
            model=response.model,
            category=category,
            rating=rating,
            issues=issues,
            suggestions=suggestions,
            raw_content=response.content,
            tokens_used=response.tokens_used,
            latency_ms=response.latency_ms,
        )

    except Exception as e:
        return ReviewPerspective(
            role=role,
            provider="unknown",
            model="unknown",
            category=category,
            rating=0.0,
            success=False,
            error_message=str(e),
        )


def compute_consensus(perspectives: list[ReviewPerspective]) -> float:
    """
    Compute consensus score from all perspectives.

    Returns weighted average of successful reviews.
    """
    successful = [p for p in perspectives if p.success]
    if not successful:
        return 0.0

    total_rating = sum(p.rating for p in successful)
    return total_rating / len(successful)


def generate_review_summary(report: ReviewReport, plan: TrinityPlan) -> str:
    """Generate human-readable review summary."""
    status = "APPROVED" if report.approved else "NEEDS ATTENTION"

    perspectives_text = ""
    for p in report.perspectives:
        if p.success:
            issues_text = "\n".join(f"  - {i}" for i in p.issues) if p.issues else "  None"
            suggestions_text = (
                "\n".join(f"  - {s}" for s in p.suggestions)
                if p.suggestions else "  None"
            )
            perspectives_text += f"""
### {p.role.title()} ({p.category})

**Rating:** {p.rating:.0%}

**Issues:**
{issues_text}

**Suggestions:**
{suggestions_text}
"""
        else:
            perspectives_text += f"""
### {p.role.title()} ({p.category})

**Error:** {p.error_message}
"""

    return f"""# Code Review Summary: Issue #{report.issue_number}

**ADW ID:** {report.adw_id}
**Status:** {status}
**Consensus Score:** {report.consensus_score:.0%}
**Approval Threshold:** {report.approval_threshold:.0%}
**Duration:** {report.duration_seconds:.2f}s

---

## Test Results

{report.test_summary}

## Files Reviewed

{chr(10).join(f'- `{f}`' for f in report.files_reviewed) or 'None'}

---

## Review Perspectives
{perspectives_text}

---

## Metadata

- **Total Tokens:** {report.total_tokens}
- **Total Latency:** {report.total_latency_ms:.0f}ms
- **Completed:** {report.completed_at.isoformat() if report.completed_at else 'N/A'}
"""


def save_review_artifacts(
    report: ReviewReport,
    summary: str,
    agents_base: Path | None = None,
) -> tuple[Path, Path]:
    """
    Save review artifacts to agents/{adw_id}/.

    Returns:
        Tuple of (report_path, summary_path)
    """
    if agents_base is None:
        agents_base = Path("agents")

    report_dir = agents_base / report.adw_id
    report_dir.mkdir(parents=True, exist_ok=True)

    report_path = report_dir / "review_report.json"
    report_path.write_text(report.model_dump_json(indent=2), encoding="utf-8")

    summary_path = report_dir / "review_summary.md"
    summary_path.write_text(summary, encoding="utf-8")

    return report_path, summary_path


async def execute_review_phase(
    issue_number: int,
    adw_id: str,
) -> int:
    """
    Execute the complete review phase.

    Args:
        issue_number: GitHub issue number
        adw_id: ADW workflow identifier

    Returns:
        Exit code (0 = success, non-zero = failure)
    """
    start_time = time.perf_counter()

    report = ReviewReport(adw_id=adw_id, issue_number=issue_number)

    console.print(
        Panel.fit(
            f"[bold cyan]ADW ID:[/] {adw_id}\n"
            f"[bold cyan]Issue:[/] #{issue_number}\n"
            f"[bold cyan]Approval Threshold:[/] {APPROVAL_THRESHOLD:.0%}",
            title="[bold green]ADWS Review Phase[/]",
            border_style="green",
        )
    )

    # 1. Load and validate state
    console.print("\n[bold yellow]Loading state...[/]")
    try:
        state_manager = StateManager.load(adw_id)
        state = state_manager.get_state()
        console.print(f"  [green]State loaded:[/] agents/{adw_id}/adw_state.json")
    except FileNotFoundError as e:
        console.print(f"  [red]Error:[/] {e}")
        report.error_message = str(e)
        save_review_artifacts(report, "", None)
        return 1

    # Validate issue number
    if state.issue_number != issue_number:
        error_msg = (
            f"Issue number mismatch: expected {state.issue_number}, got {issue_number}"
        )
        console.print(f"  [red]Error:[/] {error_msg}")
        report.error_message = error_msg
        save_review_artifacts(report, "", None)
        return 1

    # 2. Validate prerequisites
    console.print("\n[bold yellow]Validating prerequisites...[/]")
    if not state_manager.validate_prerequisites(["plan", "build", "test"]):
        error_msg = "Prerequisites not met: plan, build, test phases must complete first"
        console.print(f"  [red]Error:[/] {error_msg}")
        report.error_message = error_msg
        save_review_artifacts(report, "", None)
        return 1
    console.print("  [green]Prerequisites validated:[/] plan + build + test complete")

    # 3. Verify worktree exists
    worktree_path = Path(state.worktree_path)
    if not worktree_path.exists():
        error_msg = f"Worktree not found at {worktree_path}"
        console.print(f"  [red]Error:[/] {error_msg}")
        report.error_message = error_msg
        save_review_artifacts(report, "", None)
        return 1

    # 4. Load plan and gather context
    console.print("\n[bold yellow]Gathering context...[/]")
    try:
        plan = load_plan(adw_id)
        console.print(f"  [green]Plan loaded:[/] specs/{adw_id}/plan.json")
    except FileNotFoundError as e:
        console.print(f"  [red]Error:[/] {e}")
        report.error_message = str(e)
        save_review_artifacts(report, "", None)
        return 1

    # Load test summary
    test_summary = load_test_summary(adw_id)
    report.test_summary = test_summary
    console.print(f"  [dim]Test summary:[/] {test_summary}")

    # Get git diff
    git_diff = get_git_diff(worktree_path)
    console.print(f"  [dim]Git diff:[/] {len(git_diff)} chars")

    # Get file contents
    all_files = plan.files_to_create + plan.files_to_modify
    file_contents = get_file_contents(worktree_path, all_files)
    report.files_reviewed = list(file_contents.keys())
    console.print(f"  [dim]Files to review:[/] {len(file_contents)}")

    # Build context string
    files_context = "\n\n".join(
        f"### {path}\n```\n{content}\n```"
        for path, content in file_contents.items()
    )

    context = f"""## Issue #{issue_number}: {plan.issue_title}

## Plan Summary
{plan.summary}

## Technical Approach
{plan.approach}

## Test Summary
{test_summary}

## Git Diff Summary
```
{git_diff}
```

## Changed Files
{files_context}
"""

    # 5. Initialize Trinity clients
    console.print("\n[bold yellow]Initializing Trinity providers...[/]")
    try:
        architect = ClaudeClient()
        critic = GPTClient()
        advocate = GeminiClient()
        console.print(f"  [green]Architect:[/] {architect.model}")
        console.print(f"  [green]Critic:[/] {critic.model}")
        console.print(f"  [green]Advocate:[/] {advocate.model}")
    except ValueError as e:
        console.print(f"  [red]Error:[/] {e}")
        report.error_message = str(e)
        save_review_artifacts(report, "", None)
        return 1

    # 6. Run parallel reviews
    console.print("\n[bold yellow]Running parallel reviews...[/]")

    tasks = [
        run_review(architect, "architect", "correctness", context),
        run_review(critic, "critic", "security", context),
        run_review(advocate, "advocate", "ux", context),
    ]

    perspectives = await asyncio.gather(*tasks)
    report.perspectives = list(perspectives)

    # Calculate totals
    report.total_tokens = sum(p.tokens_used for p in perspectives)
    report.total_latency_ms = sum(p.latency_ms for p in perspectives)

    for p in perspectives:
        status = "[green]" if p.success else "[red]"
        console.print(
            f"  {status}{p.role.title()}:[/] {p.rating:.0%} "
            f"({len(p.issues)} issues, {len(p.suggestions)} suggestions)"
        )

    # 7. Compute consensus and approval
    console.print("\n[bold yellow]Computing consensus...[/]")
    report.consensus_score = compute_consensus(perspectives)
    report.approved = report.consensus_score >= APPROVAL_THRESHOLD

    status_color = "green" if report.approved else "yellow"
    console.print(
        f"  [{status_color}]Consensus score:[/] {report.consensus_score:.0%}"
    )
    console.print(
        f"  [{status_color}]Approved:[/] {report.approved}"
    )

    # 8. Finalize and save
    report.completed_at = datetime.now(UTC)
    report.duration_seconds = time.perf_counter() - start_time

    summary = generate_review_summary(report, plan)
    report_path, summary_path = save_review_artifacts(report, summary)

    console.print("\n[bold yellow]Artifacts saved:[/]")
    console.print(f"  [dim]Report:[/] {report_path}")
    console.print(f"  [dim]Summary:[/] {summary_path}")

    # 9. Record phase completion
    state_manager.record_phase_completion(
        phase="review",
        duration=report.duration_seconds,
        success=True,
        error_message=None,
    )
    state_manager.update(current_phase="reviewed")
    state_manager.save()

    # 10. Report results
    console.print(
        Panel.fit(
            f"[bold green]Duration:[/] {report.duration_seconds:.2f}s\n"
            f"[bold green]Consensus:[/] {report.consensus_score:.0%}\n"
            f"[bold green]Approved:[/] {report.approved}\n"
            f"[bold green]Files Reviewed:[/] {len(report.files_reviewed)}\n"
            f"[bold green]Total Tokens:[/] {report.total_tokens}",
            title="[bold green]Review Phase Complete[/]",
            border_style="green",
        )
    )

    console.print(
        f"\n[bold cyan]Next step:[/] Run adw_document_iso.py {issue_number} {adw_id}"
    )

    return 0


@app.command()
def main(
    issue_number: int = typer.Argument(
        ...,
        help="GitHub issue number",
    ),
    adw_id: str = typer.Argument(
        ...,
        help="ADW workflow identifier (8-char hex)",
    ),
) -> None:
    """
    Execute the ADWS Review Phase.

    Runs parallel code reviews via Trinity protocol (Architect/Critic/Advocate)
    and computes consensus approval status.

    Example:
        uv run python adws/scripts/adw_review_iso.py 42 abc12345
    """
    exit_code = asyncio.run(
        execute_review_phase(
            issue_number=issue_number,
            adw_id=adw_id,
        )
    )
    raise typer.Exit(code=exit_code)


if __name__ == "__main__":
    app()
