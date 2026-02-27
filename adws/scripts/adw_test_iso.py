#!/usr/bin/env python3
"""
ADWS Test Phase Entry Point

Orchestrates the test phase by:
1. Loading state and validating prerequisites (build phase complete)
2. Running pytest in the worktree with retry loop
3. On failure: analyzing errors and fixing IMPLEMENTATION files only
4. NEVER modifying test files (TDD integrity)
5. Recording test report at agents/{adw_id}/test_report.json
6. Recording phase completion

Usage:
    uv run python adws/scripts/adw_test_iso.py <issue_number> <adw_id>

Prerequisites:
    - State file at agents/{adw_id}/adw_state.json
    - Build phase completed successfully
    - Worktree at trees/{adw_id}/

Creates:
    - agents/{adw_id}/test_report.json

CRITICAL: This script NEVER modifies files under `adws/tests/` or any test files.
All fixes are applied to implementation files only.
"""

from __future__ import annotations

import asyncio
import json
import re
import subprocess
import time
from datetime import UTC, datetime
from pathlib import Path

import typer
from pydantic import BaseModel, Field
from rich.console import Console
from rich.panel import Panel

from adws.adw_modules.provider_clients import ClaudeClient
from adws.adw_modules.state import StateManager

# Configuration
MAX_RETRY_ATTEMPTS = 4

# Initialize Typer app and Rich console
app = typer.Typer(
    name="adw-test",
    help="ADWS Test Phase - Run tests with automated fix attempts",
)
console = Console()


class TestAttempt(BaseModel):
    """Record of a single test attempt."""

    attempt_number: int
    started_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    duration_seconds: float = 0.0
    passed: int = 0
    failed: int = 0
    errors: int = 0
    skipped: int = 0
    success: bool = False
    stdout: str = ""
    stderr: str = ""
    fix_applied: bool = False
    fix_file: str | None = None
    fix_commit: str | None = None


class TestReport(BaseModel):
    """Structured test report persisted to agents/{adw_id}/test_report.json."""

    adw_id: str
    issue_number: int
    max_attempts: int = MAX_RETRY_ATTEMPTS
    started_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    completed_at: datetime | None = None
    duration_seconds: float = 0.0
    attempts: list[TestAttempt] = Field(default_factory=list)
    final_passed: int = 0
    final_failed: int = 0
    final_errors: int = 0
    success: bool = False
    error_message: str | None = None


def parse_pytest_output(output: str) -> tuple[int, int, int, int]:
    """
    Parse pytest output to extract test counts.

    Args:
        output: Combined stdout/stderr from pytest

    Returns:
        Tuple of (passed, failed, errors, skipped)
    """
    passed = failed = errors = skipped = 0

    # Look for summary line like "5 passed, 2 failed, 1 error in 1.23s"
    summary_pattern = r"(\d+)\s+(passed|failed|error|errors|skipped)"
    matches = re.findall(summary_pattern, output.lower())

    for count_str, status in matches:
        count = int(count_str)
        if status == "passed":
            passed = count
        elif status == "failed":
            failed = count
        elif status in ("error", "errors"):
            errors = count
        elif status == "skipped":
            skipped = count

    return passed, failed, errors, skipped


def run_pytest(worktree_path: Path) -> tuple[int, str, str, float]:
    """
    Run pytest in the worktree.

    Args:
        worktree_path: Path to the worktree

    Returns:
        Tuple of (exit_code, stdout, stderr, duration_seconds)
    """
    start_time = time.perf_counter()

    result = subprocess.run(
        ["uv", "run", "pytest", "-v", "--tb=short"],
        cwd=worktree_path,
        capture_output=True,
        text=True,
    )

    duration = time.perf_counter() - start_time

    return result.returncode, result.stdout, result.stderr, duration


async def analyze_and_fix_failure(
    client: ClaudeClient,
    worktree_path: Path,
    test_output: str,
    attempt_number: int,
) -> tuple[str | None, str | None]:
    """
    Analyze test failure and apply fix to implementation file.

    CRITICAL: Never modifies files under `tests/` directories.

    Args:
        client: ClaudeClient for code generation
        worktree_path: Path to the worktree
        test_output: Combined test output showing failures
        attempt_number: Current attempt number

    Returns:
        Tuple of (fixed_file_path, commit_sha) or (None, None) if no fix applied
    """
    # Identify failing test and related implementation file
    prompt = f"""Analyze this test failure and identify the implementation file that needs fixing.

## Test Output
```
{test_output[-10000:]}
```

## Instructions
1. Identify the implementation file causing the failure (NOT a test file)
2. Determine the fix needed
3. Return a JSON object with these fields:
   - "file_path": path to the implementation file to fix (NEVER a test file)
   - "analysis": brief explanation of the issue
   - "fix_description": what needs to be changed

CRITICAL: Never suggest fixing test files. Only fix implementation files.

Respond ONLY with the JSON object."""

    try:
        system_prompt = (
            "You are a debugging assistant. Analyze failures and suggest "
            "implementation fixes only."
        )
        response = await client.complete(
            prompt=prompt,
            system=system_prompt,
            max_tokens=2048,
            timeout=60.0,
        )

        # Parse response
        content = response.content.strip()
        if content.startswith("```"):
            content = content.split("\n", 1)[1]
        if content.endswith("```"):
            content = content.rsplit("```", 1)[0]
        content = content.strip()

        analysis = json.loads(content)
        file_path = analysis.get("file_path", "")

        # CRITICAL: Reject any test file paths
        if "test" in file_path.lower() or file_path.startswith("tests/"):
            console.print(
                f"    [yellow]Skipped:[/] Refusing to modify test file {file_path}"
            )
            return None, None

        # Read the file
        full_path = worktree_path / file_path
        if not full_path.exists():
            console.print(f"    [yellow]Warning:[/] File not found: {file_path}")
            return None, None

        existing_content = full_path.read_text(encoding="utf-8")

        # Generate fixed content
        fix_prompt = f"""Fix this implementation file to resolve the test failure.

## File: {file_path}
```
{existing_content}
```

## Test Failure Analysis
{analysis.get('analysis', '')}

## Required Fix
{analysis.get('fix_description', '')}

## Instructions
Generate the complete fixed file content.
Do NOT include markdown code fences - output only the raw file content.
Ensure the fix addresses the test failure without breaking other functionality."""

        fix_response = await client.complete(
            prompt=fix_prompt,
            system="You are a senior software engineer. Output ONLY the fixed file content.",
            max_tokens=8192,
            timeout=120.0,
        )

        fixed_content = fix_response.content.strip()

        # Remove code fences if present
        if fixed_content.startswith("```"):
            lines = fixed_content.split("\n")
            if lines[0].startswith("```"):
                lines = lines[1:]
            if lines and lines[-1].strip() == "```":
                lines = lines[:-1]
            fixed_content = "\n".join(lines)

        # Write fixed file
        full_path.write_text(fixed_content, encoding="utf-8")
        console.print(f"    [green]Fixed:[/] {file_path}")

        # Commit fix
        subprocess.run(
            ["git", "add", file_path],
            cwd=worktree_path,
            capture_output=True,
            check=True,
        )

        subprocess.run(
            [
                "git", "commit", "-m",
                f"fix: resolve test failure (attempt {attempt_number})\n\n"
                f"File: {file_path}\n"
                f"Analysis: {analysis.get('analysis', 'automated fix')}"
            ],
            cwd=worktree_path,
            capture_output=True,
            text=True,
            check=True,
        )

        sha_result = subprocess.run(
            ["git", "rev-parse", "--short", "HEAD"],
            cwd=worktree_path,
            capture_output=True,
            text=True,
            check=True,
        )

        return file_path, sha_result.stdout.strip()

    except (json.JSONDecodeError, KeyError, subprocess.CalledProcessError) as e:
        console.print(f"    [yellow]Warning:[/] Could not apply fix: {e}")
        return None, None


def save_test_report(
    report: TestReport,
    agents_base: Path | None = None,
) -> Path:
    """
    Save test report to agents/{adw_id}/test_report.json.

    Args:
        report: TestReport to save
        agents_base: Base directory for agents (defaults to "agents")

    Returns:
        Path to saved report
    """
    if agents_base is None:
        agents_base = Path("agents")

    report_dir = agents_base / report.adw_id
    report_dir.mkdir(parents=True, exist_ok=True)

    report_path = report_dir / "test_report.json"
    report_path.write_text(report.model_dump_json(indent=2), encoding="utf-8")

    return report_path


async def execute_test_phase(
    issue_number: int,
    adw_id: str,
) -> int:
    """
    Execute the complete test phase with retry loop.

    Args:
        issue_number: GitHub issue number
        adw_id: ADW workflow identifier

    Returns:
        Exit code (0 = success, non-zero = failure)
    """
    start_time = time.perf_counter()

    report = TestReport(adw_id=adw_id, issue_number=issue_number)

    console.print(
        Panel.fit(
            f"[bold cyan]ADW ID:[/] {adw_id}\n"
            f"[bold cyan]Issue:[/] #{issue_number}\n"
            f"[bold cyan]Max Attempts:[/] {MAX_RETRY_ATTEMPTS}",
            title="[bold green]ADWS Test Phase[/]",
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
        save_test_report(report)
        return 1

    # Validate issue number matches
    if state.issue_number != issue_number:
        error_msg = (
            f"Issue number mismatch: expected {state.issue_number}, got {issue_number}"
        )
        console.print(f"  [red]Error:[/] {error_msg}")
        report.error_message = error_msg
        save_test_report(report)
        return 1

    # 2. Validate prerequisites
    console.print("\n[bold yellow]Validating prerequisites...[/]")
    if not state_manager.validate_prerequisites(["plan", "build"]):
        error_msg = "Prerequisites not met: plan and build phases must complete first"
        console.print(f"  [red]Error:[/] {error_msg}")
        report.error_message = error_msg
        save_test_report(report)
        return 1
    console.print("  [green]Prerequisites validated:[/] plan + build phases complete")

    # 3. Verify worktree exists
    worktree_path = Path(state.worktree_path)
    if not worktree_path.exists():
        error_msg = f"Worktree not found at {worktree_path}"
        console.print(f"  [red]Error:[/] {error_msg}")
        report.error_message = error_msg
        save_test_report(report)
        return 1
    console.print(f"  [green]Worktree exists:[/] {worktree_path}")

    # 4. Initialize Architect client for fix generation
    console.print("\n[bold yellow]Initializing Architect provider...[/]")
    try:
        architect = ClaudeClient()
        console.print(f"  [green]Provider ready:[/] {architect.model}")
    except ValueError as e:
        console.print(f"  [red]Error:[/] {e}")
        report.error_message = str(e)
        save_test_report(report)
        return 1

    # 5. Test loop with retry
    console.print("\n[bold yellow]Running test loop...[/]")

    for attempt_num in range(1, MAX_RETRY_ATTEMPTS + 1):
        console.print(f"\n  [bold]Attempt {attempt_num}/{MAX_RETRY_ATTEMPTS}[/]")

        attempt = TestAttempt(attempt_number=attempt_num)

        # Run pytest
        console.print("    Running pytest...")
        exit_code, stdout, stderr, duration = run_pytest(worktree_path)
        combined_output = stdout + stderr

        attempt.duration_seconds = duration
        attempt.stdout = stdout
        attempt.stderr = stderr

        # Parse results
        passed, failed, errors, skipped = parse_pytest_output(combined_output)
        attempt.passed = passed
        attempt.failed = failed
        attempt.errors = errors
        attempt.skipped = skipped
        attempt.success = (exit_code == 0)

        console.print(
            f"    Results: {passed} passed, {failed} failed, "
            f"{errors} errors, {skipped} skipped ({duration:.1f}s)"
        )

        report.attempts.append(attempt)

        if exit_code == 0:
            # Tests passed!
            console.print("    [green]Tests passed![/]")
            report.success = True
            report.final_passed = passed
            report.final_failed = failed
            report.final_errors = errors
            break

        # Tests failed - try to fix if attempts remaining
        if attempt_num < MAX_RETRY_ATTEMPTS:
            console.print("    [yellow]Tests failed, attempting fix...[/]")
            fix_file, fix_commit = await analyze_and_fix_failure(
                client=architect,
                worktree_path=worktree_path,
                test_output=combined_output,
                attempt_number=attempt_num,
            )
            attempt.fix_applied = fix_file is not None
            attempt.fix_file = fix_file
            attempt.fix_commit = fix_commit

            if not fix_file:
                console.print("    [yellow]No fix could be applied[/]")
        else:
            console.print("    [red]Max attempts reached[/]")
            report.final_passed = passed
            report.final_failed = failed
            report.final_errors = errors

    # 6. Finalize report
    report.completed_at = datetime.now(UTC)
    report.duration_seconds = time.perf_counter() - start_time

    report_path = save_test_report(report)
    console.print(f"\n[bold yellow]Test report saved:[/] {report_path}")

    # 7. Record phase completion
    state_manager.record_phase_completion(
        phase="test",
        duration=report.duration_seconds,
        success=report.success,
        error_message=None if report.success else "Tests failed after max attempts",
    )
    state_manager.update(
        current_phase="tested" if report.success else "test_failed"
    )
    state_manager.save()

    # 8. Report results
    if report.success:
        console.print(
            Panel.fit(
                f"[bold green]Duration:[/] {report.duration_seconds:.2f}s\n"
                f"[bold green]Attempts:[/] {len(report.attempts)}\n"
                f"[bold green]Passed:[/] {report.final_passed}\n"
                f"[bold green]Failed:[/] {report.final_failed}\n"
                f"[bold green]Errors:[/] {report.final_errors}",
                title="[bold green]Test Phase Complete[/]",
                border_style="green",
            )
        )
        console.print(
            f"\n[bold cyan]Next step:[/] Run adw_review_iso.py {issue_number} {adw_id}"
        )
        return 0
    else:
        console.print(
            Panel.fit(
                f"[bold red]Duration:[/] {report.duration_seconds:.2f}s\n"
                f"[bold red]Attempts:[/] {len(report.attempts)}\n"
                f"[bold red]Passed:[/] {report.final_passed}\n"
                f"[bold red]Failed:[/] {report.final_failed}\n"
                f"[bold red]Errors:[/] {report.final_errors}",
                title="[bold red]Test Phase Failed[/]",
                border_style="red",
            )
        )
        return 1


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
    Execute the ADWS Test Phase.

    Runs pytest in the worktree with automated fix attempts.
    NEVER modifies test files - only fixes implementation code.

    Example:
        uv run python adws/scripts/adw_test_iso.py 42 abc12345
    """
    exit_code = asyncio.run(
        execute_test_phase(
            issue_number=issue_number,
            adw_id=adw_id,
        )
    )
    raise typer.Exit(code=exit_code)


if __name__ == "__main__":
    app()
