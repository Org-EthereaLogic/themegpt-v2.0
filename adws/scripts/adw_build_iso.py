#!/usr/bin/env python3
"""
ADWS Build Phase Entry Point

Orchestrates the build phase by:
1. Loading state and validating prerequisites (plan phase complete)
2. Loading the plan from specs/{adw_id}/plan.json
3. Applying the plan inside the worktree:
   - Creating new files via Architect provider
   - Modifying existing files via Architect provider
4. Recording build log at agents/{adw_id}/build_log.json
5. Committing changes in the worktree branch
6. Recording phase completion

Usage:
    uv run python adws/scripts/adw_build_iso.py <issue_number> <adw_id>

Prerequisites:
    - State file at agents/{adw_id}/adw_state.json
    - Plan file at specs/{adw_id}/plan.json
    - Worktree at trees/{adw_id}/

Creates:
    - agents/{adw_id}/build_log.json
    - Files in trees/{adw_id}/ as specified in plan
    - Git commit with all changes
"""

from __future__ import annotations

import asyncio
import json
import subprocess
import sys
import time
from datetime import UTC, datetime
from pathlib import Path

import typer
from pydantic import BaseModel, Field
from rich.console import Console
from rich.panel import Panel

# Ensure `adws` package imports resolve when running from `cd adws`.
REPO_ROOT = Path(__file__).resolve().parents[2]
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from adws.adw_modules.provider_clients import ClaudeClient
from adws.adw_modules.state import StateManager
from adws.adw_modules.trinity_protocol import TrinityPlan

# Initialize Typer app and Rich console
app = typer.Typer(
    name="adw-build",
    help="ADWS Build Phase - Apply plan to worktree via Architect provider",
)
console = Console()


class FileChange(BaseModel):
    """Record of a single file change during build."""

    file_path: str
    action: str  # "created" or "modified"
    tokens_used: int
    latency_ms: float
    success: bool = True
    error_message: str | None = None


class BuildLog(BaseModel):
    """Structured build log persisted to agents/{adw_id}/build_log.json."""

    adw_id: str
    issue_number: int
    started_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    completed_at: datetime | None = None
    duration_seconds: float = 0.0
    files_created: list[FileChange] = Field(default_factory=list)
    files_modified: list[FileChange] = Field(default_factory=list)
    total_tokens: int = 0
    total_latency_ms: float = 0.0
    commit_sha: str | None = None
    success: bool = False
    error_message: str | None = None


def load_plan(adw_id: str, specs_base: Path | None = None) -> TrinityPlan:
    """
    Load plan from specs/{adw_id}/plan.json.

    Args:
        adw_id: Workflow identifier
        specs_base: Base directory for specs (defaults to "specs")

    Returns:
        Loaded TrinityPlan

    Raises:
        FileNotFoundError: If plan.json does not exist
        ValueError: If plan.json is invalid
    """
    if specs_base is None:
        specs_base = Path("specs")

    plan_path = specs_base / adw_id / "plan.json"

    if not plan_path.exists():
        raise FileNotFoundError(
            f"Plan not found at {plan_path}. Run adw_plan_iso.py first."
        )

    with open(plan_path, encoding="utf-8") as f:
        data = json.load(f)

    # Parse datetime strings
    if "created_at" in data and isinstance(data["created_at"], str):
        data["created_at"] = datetime.fromisoformat(data["created_at"])

    return TrinityPlan(**data)


async def generate_file_content(
    client: ClaudeClient,
    file_path: str,
    plan: TrinityPlan,
    existing_content: str | None = None,
) -> tuple[str, int, float]:
    """
    Generate file content using the Architect provider.

    Args:
        client: ClaudeClient instance
        file_path: Path of the file to generate
        plan: The TrinityPlan providing context
        existing_content: Existing file content for modifications (None for new files)

    Returns:
        Tuple of (generated_content, tokens_used, latency_ms)
    """
    issue_header = f"issue #{plan.issue_number}: {plan.issue_title}"
    if existing_content:
        prompt = f"""You are implementing code changes for {issue_header}

## Plan Summary
{plan.summary}

## Technical Approach
{plan.approach}

## Test Strategy
{plan.test_strategy}

## Current Task
Modify the file `{file_path}` according to the plan.

## Current File Content
```
{existing_content}
```

## Instructions
Generate the complete updated file content that implements the required changes.
Do NOT include markdown code fences in your response - output only the raw file content.
Ensure the code is complete, working, and follows best practices."""
    else:
        prompt = f"""You are implementing code changes for {issue_header}

## Plan Summary
{plan.summary}

## Technical Approach
{plan.approach}

## Test Strategy
{plan.test_strategy}

## Current Task
Create a new file at `{file_path}` according to the plan.

## Instructions
Generate the complete file content for this new file.
Do NOT include markdown code fences in your response - output only the raw file content.
Ensure the code is complete, working, and follows best practices.
Include appropriate docstrings, type hints, and comments where needed."""

    response = await client.complete(
        prompt=prompt,
        system="You are a senior software engineer. Output ONLY the file content, no explanations.",
        max_tokens=8192,
        timeout=120.0,
    )

    content = response.content.strip()

    # Remove code fences if present
    if content.startswith("```"):
        lines = content.split("\n")
        if lines[0].startswith("```"):
            lines = lines[1:]
        if lines and lines[-1].strip() == "```":
            lines = lines[:-1]
        content = "\n".join(lines)

    return content, response.tokens_used, response.latency_ms


def git_add_commit(
    worktree_path: Path,
    message: str,
) -> str:
    """
    Add all changes and commit in the worktree.

    Args:
        worktree_path: Path to the git worktree
        message: Commit message

    Returns:
        Commit SHA

    Raises:
        subprocess.CalledProcessError: If git commands fail
    """
    # Add all changes
    subprocess.run(
        ["git", "add", "-A"],
        cwd=worktree_path,
        capture_output=True,
        text=True,
        check=True,
    )

    # Commit
    subprocess.run(
        ["git", "commit", "-m", message],
        cwd=worktree_path,
        capture_output=True,
        text=True,
        check=True,
    )

    # Get commit SHA
    result = subprocess.run(
        ["git", "rev-parse", "--short", "HEAD"],
        cwd=worktree_path,
        capture_output=True,
        text=True,
        check=True,
    )

    return result.stdout.strip()


def save_build_log(
    build_log: BuildLog,
    agents_base: Path | None = None,
) -> Path:
    """
    Save build log to agents/{adw_id}/build_log.json.

    Args:
        build_log: BuildLog to save
        agents_base: Base directory for agents (defaults to "agents")

    Returns:
        Path to saved build log
    """
    if agents_base is None:
        agents_base = Path("agents")

    log_dir = agents_base / build_log.adw_id
    log_dir.mkdir(parents=True, exist_ok=True)

    log_path = log_dir / "build_log.json"
    log_path.write_text(build_log.model_dump_json(indent=2), encoding="utf-8")

    return log_path


async def execute_build(
    issue_number: int,
    adw_id: str,
) -> int:
    """
    Execute the complete build phase.

    Args:
        issue_number: GitHub issue number
        adw_id: ADW workflow identifier

    Returns:
        Exit code (0 = success, non-zero = failure)
    """
    start_time = time.perf_counter()

    build_log = BuildLog(adw_id=adw_id, issue_number=issue_number)

    console.print(
        Panel.fit(
            f"[bold cyan]ADW ID:[/] {adw_id}\n"
            f"[bold cyan]Issue:[/] #{issue_number}",
            title="[bold green]ADWS Build Phase[/]",
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
        build_log.error_message = str(e)
        save_build_log(build_log)
        return 1

    # Validate issue number matches
    if state.issue_number != issue_number:
        error_msg = (
            f"Issue number mismatch: expected {state.issue_number}, got {issue_number}"
        )
        console.print(f"  [red]Error:[/] {error_msg}")
        build_log.error_message = error_msg
        save_build_log(build_log)
        return 1

    # 2. Validate prerequisites
    console.print("\n[bold yellow]Validating prerequisites...[/]")
    if not state_manager.validate_prerequisites(["plan"]):
        error_msg = "Prerequisites not met: plan phase must complete successfully first"
        console.print(f"  [red]Error:[/] {error_msg}")
        build_log.error_message = error_msg
        save_build_log(build_log)
        return 1
    console.print("  [green]Prerequisites validated:[/] plan phase complete")

    # 3. Verify worktree exists
    worktree_path = Path(state.worktree_path)
    if not worktree_path.exists():
        error_msg = f"Worktree not found at {worktree_path}"
        console.print(f"  [red]Error:[/] {error_msg}")
        build_log.error_message = error_msg
        save_build_log(build_log)
        return 1
    console.print(f"  [green]Worktree exists:[/] {worktree_path}")

    # 4. Load plan
    console.print("\n[bold yellow]Loading plan...[/]")
    try:
        plan = load_plan(adw_id)
        console.print(f"  [green]Plan loaded:[/] specs/{adw_id}/plan.json")
        console.print(f"  [dim]Files to create:[/] {len(plan.files_to_create)}")
        console.print(f"  [dim]Files to modify:[/] {len(plan.files_to_modify)}")
    except FileNotFoundError as e:
        console.print(f"  [red]Error:[/] {e}")
        build_log.error_message = str(e)
        save_build_log(build_log)
        return 1

    # 5. Initialize Architect client
    console.print("\n[bold yellow]Initializing Architect provider...[/]")
    try:
        architect = ClaudeClient()
        console.print(f"  [green]Provider ready:[/] {architect.model}")
    except ValueError as e:
        console.print(f"  [red]Error:[/] {e}")
        build_log.error_message = str(e)
        save_build_log(build_log)
        return 1

    # 6. Create new files
    if plan.files_to_create:
        console.print("\n[bold yellow]Creating new files...[/]")
        for file_path in plan.files_to_create:
            console.print(f"  [dim]Generating:[/] {file_path}")
            try:
                content, tokens, latency = await generate_file_content(
                    client=architect,
                    file_path=file_path,
                    plan=plan,
                    existing_content=None,
                )

                # Write file to worktree
                full_path = worktree_path / file_path
                full_path.parent.mkdir(parents=True, exist_ok=True)
                full_path.write_text(content, encoding="utf-8")

                change = FileChange(
                    file_path=file_path,
                    action="created",
                    tokens_used=tokens,
                    latency_ms=latency,
                )
                build_log.files_created.append(change)
                build_log.total_tokens += tokens
                build_log.total_latency_ms += latency

                console.print(f"    [green]Created:[/] {file_path} ({tokens} tokens)")

            except Exception as e:
                change = FileChange(
                    file_path=file_path,
                    action="created",
                    tokens_used=0,
                    latency_ms=0,
                    success=False,
                    error_message=str(e),
                )
                build_log.files_created.append(change)
                console.print(f"    [red]Failed:[/] {file_path} - {e}")

    # 7. Modify existing files
    if plan.files_to_modify:
        console.print("\n[bold yellow]Modifying existing files...[/]")
        for file_path in plan.files_to_modify:
            console.print(f"  [dim]Modifying:[/] {file_path}")
            try:
                full_path = worktree_path / file_path
                if not full_path.exists():
                    console.print("    [yellow]Warning:[/] File not found, creating")
                    existing_content = None
                else:
                    existing_content = full_path.read_text(encoding="utf-8")

                content, tokens, latency = await generate_file_content(
                    client=architect,
                    file_path=file_path,
                    plan=plan,
                    existing_content=existing_content,
                )

                # Write file to worktree
                full_path.parent.mkdir(parents=True, exist_ok=True)
                full_path.write_text(content, encoding="utf-8")

                change = FileChange(
                    file_path=file_path,
                    action="modified",
                    tokens_used=tokens,
                    latency_ms=latency,
                )
                build_log.files_modified.append(change)
                build_log.total_tokens += tokens
                build_log.total_latency_ms += latency

                console.print(f"    [green]Modified:[/] {file_path} ({tokens} tokens)")

            except Exception as e:
                change = FileChange(
                    file_path=file_path,
                    action="modified",
                    tokens_used=0,
                    latency_ms=0,
                    success=False,
                    error_message=str(e),
                )
                build_log.files_modified.append(change)
                console.print(f"    [red]Failed:[/] {file_path} - {e}")

    # 8. Check for any file changes
    successful_changes = sum(
        1 for f in build_log.files_created if f.success
    ) + sum(
        1 for f in build_log.files_modified if f.success
    )

    if successful_changes == 0:
        error_msg = "No files were successfully generated"
        console.print(f"\n[red]Error:[/] {error_msg}")
        build_log.error_message = error_msg
        build_log.completed_at = datetime.now(UTC)
        build_log.duration_seconds = time.perf_counter() - start_time
        save_build_log(build_log)
        state_manager.record_phase_completion(
            phase="build",
            duration=build_log.duration_seconds,
            success=False,
            error_message=error_msg,
        )
        state_manager.save()
        return 1

    # 9. Commit changes
    console.print("\n[bold yellow]Committing changes...[/]")
    try:
        commit_sha = git_add_commit(
            worktree_path=worktree_path,
            message=f"feat(#{issue_number}): implement plan {adw_id}\n\n"
            f"Files created: {len(build_log.files_created)}\n"
            f"Files modified: {len(build_log.files_modified)}\n\n"
            f"Generated via ADWS Build Phase",
        )
        build_log.commit_sha = commit_sha
        console.print(f"  [green]Committed:[/] {commit_sha}")
    except subprocess.CalledProcessError as e:
        # Check if it's "nothing to commit"
        if "nothing to commit" in (e.stderr or ""):
            console.print("  [yellow]Warning:[/] Nothing to commit")
            build_log.commit_sha = "no-changes"
        else:
            error_msg = f"Git commit failed: {e.stderr}"
            console.print(f"  [red]Error:[/] {error_msg}")
            build_log.error_message = error_msg

    # 10. Finalize build log
    build_log.completed_at = datetime.now(UTC)
    build_log.duration_seconds = time.perf_counter() - start_time
    build_log.success = True

    log_path = save_build_log(build_log)
    console.print(f"\n[bold yellow]Build log saved:[/] {log_path}")

    # 11. Record phase completion
    state_manager.record_phase_completion(
        phase="build",
        duration=build_log.duration_seconds,
        success=True,
    )
    state_manager.update(current_phase="built")
    state_manager.save()

    # 12. Report success
    console.print(
        Panel.fit(
            f"[bold green]Duration:[/] {build_log.duration_seconds:.2f}s\n"
            f"[bold green]Files Created:[/] {len(build_log.files_created)}\n"
            f"[bold green]Files Modified:[/] {len(build_log.files_modified)}\n"
            f"[bold green]Total Tokens:[/] {build_log.total_tokens}\n"
            f"[bold green]Commit:[/] {build_log.commit_sha}",
            title="[bold green]Build Phase Complete[/]",
            border_style="green",
        )
    )

    console.print(
        f"\n[bold cyan]Next step:[/] Run adw_test_iso.py {issue_number} {adw_id}"
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
    Execute the ADWS Build Phase.

    Applies the plan from the planning phase by generating file content
    via the Architect provider and committing changes to the worktree.

    Example:
        uv run python adws/scripts/adw_build_iso.py 42 abc12345
    """
    exit_code = asyncio.run(
        execute_build(
            issue_number=issue_number,
            adw_id=adw_id,
        )
    )
    raise typer.Exit(code=exit_code)


if __name__ == "__main__":
    app()
