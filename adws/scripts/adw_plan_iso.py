#!/usr/bin/env python3
"""
ADWS Planning Phase Entry Point

Orchestrates the planning phase by:
1. Generating unique ADW ID and allocating ports
2. Creating isolated git worktree
3. Initializing persistent workflow state
4. Executing Trinity Protocol (Architect/Critic/Advocate)
5. Saving synthesized plan (MD + JSON)
6. Recording phase completion

Usage:
    uv run python adws/scripts/adw_plan_iso.py <issue_number> \\
        --title "Issue Title" --body "Issue body"
    uv run python adws/scripts/adw_plan_iso.py 42 \\
        --title "Add authentication" --body "Implement JWT auth"

Creates:
    - trees/{adw_id}/         Git worktree
    - agents/{adw_id}/        State directory with adw_state.json
    - specs/{adw_id}/         Plan outputs (plan.md, plan.json)
"""

from __future__ import annotations

import asyncio
import time
from pathlib import Path

import typer
from rich.console import Console
from rich.panel import Panel

from adws.adw_modules.state import StateManager
from adws.adw_modules.trinity_protocol import TrinityProtocol
from adws.adw_modules.worktree_ops import (
    create_worktree,
    generate_adw_id,
    get_ports_for_adw,
)

# Initialize Typer app and Rich console
app = typer.Typer(
    name="adw-plan",
    help="ADWS Planning Phase - Execute Trinity Protocol for issue analysis",
)
console = Console()


async def execute_planning(
    issue_number: int,
    issue_title: str,
    issue_body: str,
    repo_url: str | None = None,
) -> int:
    """
    Execute the complete planning phase.

    Args:
        issue_number: GitHub issue number
        issue_title: Issue title
        issue_body: Issue description/body
        repo_url: Optional source repository URL

    Returns:
        Exit code (0 = success, non-zero = failure)
    """
    start_time = time.perf_counter()

    # 1. Generate ADW ID and allocate ports
    adw_id = generate_adw_id()
    backend_port, frontend_port = get_ports_for_adw(adw_id)

    console.print(
        Panel.fit(
            f"[bold cyan]ADW ID:[/] {adw_id}\n"
            f"[bold cyan]Issue:[/] #{issue_number}\n"
            f"[bold cyan]Title:[/] {issue_title}\n"
            f"[bold cyan]Ports:[/] {backend_port} (backend), {frontend_port} (frontend)",
            title="[bold green]ADWS Planning Phase[/]",
            border_style="green",
        )
    )

    # 2. Create worktree
    console.print("\n[bold yellow]Creating worktree...[/]")
    try:
        worktree_path, branch_name = create_worktree(
            adw_id=adw_id,
            issue_number=issue_number,
        )
        console.print(f"  [green]Created:[/] {worktree_path}")
        console.print(f"  [green]Branch:[/] {branch_name}")
    except RuntimeError as e:
        console.print(f"  [red]Error creating worktree:[/] {e}")
        return 1

    # 3. Initialize state
    console.print("\n[bold yellow]Initializing state...[/]")
    state_manager = StateManager(adw_id)
    state_manager.initialize(
        issue_number=issue_number,
        worktree_path=str(worktree_path),
        backend_port=backend_port,
        frontend_port=frontend_port,
        branch_name=branch_name,
        repo_url=repo_url,
    )
    console.print(f"  [green]State:[/] agents/{adw_id}/adw_state.json")

    # 4. Execute Trinity Protocol
    console.print("\n[bold yellow]Executing Trinity Protocol...[/]")
    console.print("  [dim]Phase 1: Divergence (parallel API calls to Claude/GPT/Gemini)...[/]")

    trinity = TrinityProtocol()

    try:
        plan = await trinity.execute(
            issue_number=issue_number,
            issue_title=issue_title,
            issue_body=issue_body,
            adw_id=adw_id,
        )
        console.print("  [dim]Phase 2: Convergence (synthesizing perspectives)...[/]")
        console.print(f"  [green]Complexity:[/] {plan.estimated_complexity}")
        console.print(f"  [green]Tokens used:[/] {plan.total_tokens}")
        console.print(f"  [green]Latency:[/] {plan.total_latency_ms:.0f}ms")
    except Exception as e:
        console.print(f"  [red]Trinity Protocol failed:[/] {e}")
        # Record failure and save state
        duration = time.perf_counter() - start_time
        state_manager.record_phase_completion(
            phase="plan",
            duration=duration,
            success=False,
            error_message=str(e),
        )
        state_manager.save()
        return 1

    # 5. Save plan
    console.print("\n[bold yellow]Saving plan...[/]")
    plan_md, plan_json = trinity.save_plan(plan)
    console.print(f"  [green]Markdown:[/] {plan_md}")
    console.print(f"  [green]JSON:[/] {plan_json}")

    # 6. Update state with plan paths
    state_manager.update(
        plan_file=str(plan_md),
        plan_json=str(plan_json),
        current_phase="planned",
    )

    # 7. Record phase completion
    duration = time.perf_counter() - start_time
    state_manager.record_phase_completion(
        phase="plan",
        duration=duration,
        success=True,
    )
    state_manager.save()

    # 8. Report success
    console.print(
        Panel.fit(
            f"[bold green]Duration:[/] {duration:.2f}s\n"
            f"[bold green]Worktree:[/] trees/{adw_id}/\n"
            f"[bold green]State:[/] agents/{adw_id}/adw_state.json\n"
            f"[bold green]Plan MD:[/] {plan_md}\n"
            f"[bold green]Plan JSON:[/] {plan_json}",
            title="[bold green]Planning Phase Complete[/]",
            border_style="green",
        )
    )

    console.print(
        f"\n[bold cyan]Next step:[/] Review the plan at {plan_md}"
    )

    return 0


@app.command()
def main(
    issue_number: int = typer.Argument(
        ...,
        help="GitHub issue number to analyze",
    ),
    title: str = typer.Option(
        ...,
        "--title",
        "-t",
        help="Issue title (required)",
    ),
    body: str = typer.Option(
        ...,
        "--body",
        "-b",
        help="Issue body/description (required)",
    ),
    repo_url: str | None = typer.Option(
        None,
        "--repo-url",
        "-r",
        help="Repository URL (optional)",
    ),
) -> None:
    """
    Execute the ADWS Planning Phase.

    Runs the Trinity Protocol (Claude/GPT/Gemini) to generate a synthesized
    implementation plan for the specified GitHub issue.

    Example:
        uv run python adws/scripts/adw_plan_iso.py 42 \\
            --title "Add user authentication" \\
            --body "Implement JWT-based authentication for the API"
    """
    exit_code = asyncio.run(
        execute_planning(
            issue_number=issue_number,
            issue_title=title,
            issue_body=body,
            repo_url=repo_url,
        )
    )
    raise typer.Exit(code=exit_code)


if __name__ == "__main__":
    app()
