#!/usr/bin/env python3
"""
ADWS Ship Phase Entry Point

Orchestrates the ship phase by:
1. Loading state and validating prerequisites (all phases complete)
2. Getting repository info from git remote
3. Pushing branch to remote origin
4. Creating Pull Request via GitHub API
5. Adding ADWS labels to PR
6. Optionally enabling auto-merge
7. Cleaning up worktree
8. Archiving state and artifacts
9. Recording ship_log.json

Usage:
    uv run python adws/scripts/adw_ship_iso.py <issue_number> <adw_id> [--auto-merge]

Prerequisites:
    - State file at agents/{adw_id}/adw_state.json
    - All previous phases completed (plan, build, test, review, document)
    - GITHUB_TOKEN environment variable set
    - Worktree at trees/{adw_id}/

Creates:
    - Pull Request on GitHub
    - agents/{adw_id}/ship_log.json
    - agents/{adw_id}/archived/ (state archive)
"""

from __future__ import annotations

import asyncio
import json
import os
import re
import shutil
import subprocess
import time
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

import httpx
import typer
from pydantic import BaseModel, Field
from rich.console import Console
from rich.panel import Panel

from adws.adw_modules.state import StateManager
from adws.adw_modules.worktree_ops import remove_worktree

console = Console()
app = typer.Typer(
    name="adw-ship",
    help="ADWS Ship Phase - Create PR and cleanup",
)


# =============================================================================
# Configuration
# =============================================================================

GITHUB_API_BASE = "https://api.github.com"
DEFAULT_BASE_BRANCH = "main"


# =============================================================================
# Models
# =============================================================================


class PullRequestInfo(BaseModel):
    """Information about the created Pull Request."""

    number: int
    url: str
    html_url: str
    state: str
    title: str
    head_branch: str
    base_branch: str
    created_at: datetime
    merged: bool = False
    merged_at: datetime | None = None


class ShipLog(BaseModel):
    """Log of the ship phase execution."""

    adw_id: str
    issue_number: int
    branch_name: str
    pull_request: PullRequestInfo | None = None
    auto_merge_requested: bool = False
    auto_merge_succeeded: bool = False
    worktree_removed: bool = False
    state_archived: bool = False
    error_message: str | None = None
    duration_seconds: float = 0.0
    completed_at: datetime = Field(default_factory=lambda: datetime.now(UTC))


# =============================================================================
# GitHub API Functions
# =============================================================================


async def get_repo_info(github_token: str) -> tuple[str, str]:
    """
    Get repository owner and name from git remote.

    Returns:
        Tuple of (owner, repo_name)

    Raises:
        ValueError: If remote URL cannot be parsed
    """
    result = subprocess.run(
        ["git", "remote", "get-url", "origin"],
        capture_output=True,
        text=True,
    )

    if result.returncode != 0:
        raise ValueError(f"Failed to get git remote: {result.stderr}")

    remote_url = result.stdout.strip()

    # Handle HTTPS format: https://github.com/owner/repo.git
    https_match = re.match(r"https://github\.com/([^/]+)/([^/]+?)(?:\.git)?$", remote_url)
    if https_match:
        return https_match.group(1), https_match.group(2)

    # Handle SSH format: git@github.com:owner/repo.git
    ssh_match = re.match(r"git@github\.com:([^/]+)/([^/]+?)(?:\.git)?$", remote_url)
    if ssh_match:
        return ssh_match.group(1), ssh_match.group(2)

    raise ValueError(f"Could not parse remote URL: {remote_url}")


async def push_branch(worktree_path: Path, branch_name: str) -> bool:
    """
    Push the branch to remote.

    Returns:
        True if push succeeded
    """
    result = subprocess.run(
        ["git", "push", "-u", "origin", branch_name],
        cwd=worktree_path,
        capture_output=True,
        text=True,
    )

    if result.returncode != 0:
        console.print(f"  [dim]Push stderr:[/] {result.stderr}")
        return False

    return True


async def create_pull_request(
    github_token: str,
    owner: str,
    repo: str,
    title: str,
    body: str,
    head_branch: str,
    base_branch: str = DEFAULT_BASE_BRANCH,
) -> PullRequestInfo:
    """
    Create a Pull Request via GitHub API.

    Args:
        github_token: GitHub API token
        owner: Repository owner
        repo: Repository name
        title: PR title
        body: PR body/description
        head_branch: Source branch
        base_branch: Target branch (default: main)

    Returns:
        PullRequestInfo with PR details

    Raises:
        httpx.HTTPStatusError: If API request fails
    """
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{GITHUB_API_BASE}/repos/{owner}/{repo}/pulls",
            headers={
                "Authorization": f"Bearer {github_token}",
                "Accept": "application/vnd.github+json",
                "X-GitHub-Api-Version": "2022-11-28",
            },
            json={
                "title": title,
                "body": body,
                "head": head_branch,
                "base": base_branch,
            },
            timeout=30.0,
        )

        if response.status_code == 422:
            # PR might already exist or no commits
            error_data = response.json()
            errors = error_data.get("errors", [])
            for error in errors:
                if "already exists" in error.get("message", "").lower():
                    raise ValueError(f"Pull request already exists for {head_branch}")
            raise ValueError(f"GitHub API error: {error_data}")

        response.raise_for_status()
        data = response.json()

        return PullRequestInfo(
            number=data["number"],
            url=data["url"],
            html_url=data["html_url"],
            state=data["state"],
            title=data["title"],
            head_branch=data["head"]["ref"],
            base_branch=data["base"]["ref"],
            created_at=datetime.fromisoformat(data["created_at"].replace("Z", "+00:00")),
        )


async def enable_auto_merge(
    github_token: str,
    owner: str,
    repo: str,
    pr_number: int,
) -> bool:
    """
    Enable auto-merge on a Pull Request (requires repo setting).

    Uses GraphQL API as REST API doesn't support auto-merge.

    Returns:
        True if auto-merge was enabled
    """
    # First get the PR node ID via REST
    async with httpx.AsyncClient() as client:
        pr_response = await client.get(
            f"{GITHUB_API_BASE}/repos/{owner}/{repo}/pulls/{pr_number}",
            headers={
                "Authorization": f"Bearer {github_token}",
                "Accept": "application/vnd.github+json",
            },
            timeout=30.0,
        )

        if pr_response.status_code != 200:
            return False

        pr_data = pr_response.json()
        node_id = pr_data.get("node_id")

        if not node_id:
            return False

        # Enable auto-merge via GraphQL
        mutation = """
        mutation EnableAutoMerge($pullRequestId: ID!) {
            enablePullRequestAutoMerge(
                input: {pullRequestId: $pullRequestId, mergeMethod: SQUASH}
            ) {
                pullRequest {
                    autoMergeRequest {
                        enabledAt
                    }
                }
            }
        }
        """

        graphql_response = await client.post(
            "https://api.github.com/graphql",
            headers={
                "Authorization": f"Bearer {github_token}",
                "Accept": "application/vnd.github+json",
            },
            json={
                "query": mutation,
                "variables": {"pullRequestId": node_id},
            },
            timeout=30.0,
        )

        if graphql_response.status_code != 200:
            return False

        graphql_data = graphql_response.json()

        # Check for errors (e.g., auto-merge not enabled on repo)
        return "errors" not in graphql_data


async def add_labels_to_pr(
    github_token: str,
    owner: str,
    repo: str,
    pr_number: int,
    labels: list[str],
) -> bool:
    """
    Add labels to a Pull Request.

    Returns:
        True if labels were added
    """
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{GITHUB_API_BASE}/repos/{owner}/{repo}/issues/{pr_number}/labels",
            headers={
                "Authorization": f"Bearer {github_token}",
                "Accept": "application/vnd.github+json",
                "X-GitHub-Api-Version": "2022-11-28",
            },
            json={"labels": labels},
            timeout=30.0,
        )

        # 200 or 201 indicates success; 404 might mean labels don't exist
        return response.status_code in (200, 201)


async def link_pr_to_issue(
    github_token: str,
    owner: str,
    repo: str,
    pr_number: int,
    issue_number: int,
) -> bool:
    """
    Link PR to the original issue (closes issue when merged).

    This is typically handled via PR body with "Closes #N" syntax,
    which is already included in generate_pr_body.

    Returns:
        True (linking is handled via PR body)
    """
    # Linking is handled via "Closes #N" in the PR body
    # No additional API call needed
    return True


# =============================================================================
# Cleanup Functions
# =============================================================================


def archive_state(adw_id: str, agents_base: Path | None = None) -> Path:
    """
    Archive the workflow state and artifacts.

    Moves artifact files into agents/{adw_id}/archived/{timestamp}/
    while keeping state.json at root level for reference.

    Returns:
        Path to archive directory
    """
    if agents_base is None:
        agents_base = Path("agents")

    state_dir = agents_base / adw_id
    if not state_dir.exists():
        state_dir.mkdir(parents=True, exist_ok=True)
        return state_dir

    # Create timestamped archive directory
    timestamp = datetime.now(UTC).strftime("%Y%m%d_%H%M%S")
    archive_dir = state_dir / "archived" / timestamp
    archive_dir.mkdir(parents=True, exist_ok=True)

    # List of artifact files to archive (excluding state file)
    artifact_patterns = [
        "build_log.json",
        "test_report.json",
        "review_report.json",
        "review_summary.md",
        "doc_log.json",
        "ship_log.json",
    ]

    # Move artifacts to archive
    for pattern in artifact_patterns:
        artifact_path = state_dir / pattern
        if artifact_path.exists():
            shutil.copy2(artifact_path, archive_dir / pattern)

    return archive_dir


def cleanup_worktree(adw_id: str, trees_base: Path | None = None) -> bool:
    """
    Remove the worktree after shipping.

    Returns:
        True if worktree was removed
    """
    if trees_base is None:
        trees_base = Path("trees")

    worktree_path = trees_base / adw_id

    if not worktree_path.exists():
        return True  # Already cleaned up

    try:
        remove_worktree(adw_id, trees_base=trees_base, delete_branch=False)
        return True
    except Exception:
        return False


# =============================================================================
# PR Body Generation
# =============================================================================


def load_plan_summary(adw_id: str, specs_base: Path | None = None) -> dict[str, Any]:
    """Load plan from specs/{adw_id}/plan.json."""
    if specs_base is None:
        specs_base = Path("specs")

    plan_path = specs_base / adw_id / "plan.json"

    if not plan_path.exists():
        return {}

    with open(plan_path, encoding="utf-8") as f:
        data: dict[str, Any] = json.load(f)
        return data


def load_build_log(adw_id: str, agents_base: Path | None = None) -> dict[str, Any]:
    """Load build log from agents/{adw_id}/build_log.json."""
    if agents_base is None:
        agents_base = Path("agents")

    log_path = agents_base / adw_id / "build_log.json"

    if not log_path.exists():
        return {}

    with open(log_path, encoding="utf-8") as f:
        data: dict[str, Any] = json.load(f)
        return data


def load_test_report(adw_id: str, agents_base: Path | None = None) -> dict[str, Any]:
    """Load test report from agents/{adw_id}/test_report.json."""
    if agents_base is None:
        agents_base = Path("agents")

    report_path = agents_base / adw_id / "test_report.json"

    if not report_path.exists():
        return {}

    with open(report_path, encoding="utf-8") as f:
        data: dict[str, Any] = json.load(f)
        return data


def load_review_summary(adw_id: str, agents_base: Path | None = None) -> str:
    """Load review summary from agents/{adw_id}/review_summary.md."""
    if agents_base is None:
        agents_base = Path("agents")

    summary_path = agents_base / adw_id / "review_summary.md"

    if not summary_path.exists():
        return ""

    return summary_path.read_text(encoding="utf-8")


def generate_pr_body(
    state_manager: StateManager,
    agents_base: Path | None = None,
) -> str:
    """
    Generate a comprehensive PR body from workflow artifacts.

    Includes:
    - Issue reference (Closes #N)
    - Plan summary
    - Files changed
    - Test results
    - Review summary
    """
    state = state_manager.get_state()
    adw_id = state.adw_id
    issue_number = state.issue_number

    # Load artifacts
    plan_data = load_plan_summary(adw_id)
    build_log = load_build_log(adw_id, agents_base)
    test_report = load_test_report(adw_id, agents_base)
    review_summary = load_review_summary(adw_id, agents_base)

    # Build sections
    summary_text = plan_data.get("summary", "No summary available")
    approach_text = plan_data.get("approach", "No approach documented")

    # Files section
    files_created = build_log.get("files_created", [])
    files_modified = build_log.get("files_modified", [])

    files_section = "### Files Created\n"
    if files_created:
        for f in files_created[:10]:
            file_path = f.get("file_path", f) if isinstance(f, dict) else f
            files_section += f"- `{file_path}`\n"
    else:
        files_section += "None\n"

    files_section += "\n### Files Modified\n"
    if files_modified:
        for f in files_modified[:10]:
            file_path = f.get("file_path", f) if isinstance(f, dict) else f
            files_section += f"- `{file_path}`\n"
    else:
        files_section += "None\n"

    # Test section
    tests_passed = test_report.get("final_passed", 0)
    tests_failed = test_report.get("final_failed", 0)
    tests_errors = test_report.get("final_errors", 0)
    test_success = test_report.get("success", False)

    test_status = "PASSED" if test_success else "FAILED"
    test_section = (
        f"**Status:** {test_status}\n"
        f"- Passed: {tests_passed}\n"
        f"- Failed: {tests_failed}\n"
        f"- Errors: {tests_errors}\n"
    )

    # Review excerpt (first 500 chars)
    review_excerpt = ""
    if review_summary:
        # Extract just the key info
        lines = review_summary.split("\n")
        excerpt_lines = []
        for line in lines:
            if line.startswith("**Status:**") or line.startswith("**Consensus"):
                excerpt_lines.append(line)
        if excerpt_lines:
            review_excerpt = "\n".join(excerpt_lines)
        else:
            review_excerpt = review_summary[:500]
            if len(review_summary) > 500:
                review_excerpt += "..."

    body = f"""## Summary

{summary_text}

## Approach

{approach_text}

---

## Changes

{files_section}

---

## Test Results

{test_section}

---

## Code Review

{review_excerpt if review_excerpt else "Review summary not available"}

---

Closes #{issue_number}

---

**Generated by ADWS (AI Developer Workflow System)**
ADW ID: `{adw_id}`
"""

    return body


# =============================================================================
# Main Execution
# =============================================================================


async def execute_ship_phase(
    issue_number: int,
    adw_id: str,
    auto_merge: bool = False,
) -> int:
    """
    Execute the complete ship phase.

    Args:
        issue_number: GitHub issue number
        adw_id: ADW workflow identifier
        auto_merge: Whether to enable auto-merge

    Returns:
        Exit code (0 = success, non-zero = failure)
    """
    start_time = time.perf_counter()

    ship_log = ShipLog(
        adw_id=adw_id,
        issue_number=issue_number,
        branch_name="",  # Will be set from state
        auto_merge_requested=auto_merge,
    )

    console.print(
        Panel.fit(
            f"[bold cyan]ADW ID:[/] {adw_id}\n"
            f"[bold cyan]Issue:[/] #{issue_number}\n"
            f"[bold cyan]Auto-Merge:[/] {'Enabled' if auto_merge else 'Disabled'}",
            title="[bold green]ADWS Ship Phase[/]",
            border_style="green",
        )
    )

    # 1. Load and validate state
    console.print("\n[bold yellow]Loading state...[/]")
    try:
        state_manager = StateManager.load(adw_id)
        state = state_manager.get_state()
        ship_log.branch_name = state.branch_name
        console.print(f"  [green]State loaded:[/] agents/{adw_id}/adw_state.json")
    except FileNotFoundError as e:
        console.print(f"  [red]Error:[/] {e}")
        ship_log.error_message = str(e)
        save_ship_log(ship_log)
        return 1

    # Validate issue number matches
    if state.issue_number != issue_number:
        error_msg = (
            f"Issue number mismatch: expected {state.issue_number}, got {issue_number}"
        )
        console.print(f"  [red]Error:[/] {error_msg}")
        ship_log.error_message = error_msg
        save_ship_log(ship_log)
        return 1

    # 2. Validate all phases completed
    console.print("\n[bold yellow]Validating prerequisites...[/]")
    required_phases = ["plan", "build", "test", "review", "document"]
    if not state_manager.validate_prerequisites(required_phases):
        error_msg = f"Prerequisites not met: all phases {required_phases} must complete"
        console.print(f"  [red]Error:[/] {error_msg}")
        ship_log.error_message = error_msg
        save_ship_log(ship_log)
        return 1
    console.print("  [green]All phases completed[/]")

    # 3. Get GitHub token
    github_token = os.getenv("GITHUB_TOKEN")
    if not github_token:
        error_msg = "GITHUB_TOKEN environment variable not set"
        console.print(f"  [red]Error:[/] {error_msg}")
        ship_log.error_message = error_msg
        save_ship_log(ship_log)
        return 1

    # 4. Get repo info
    console.print("\n[bold yellow]Getting repository info...[/]")
    try:
        owner, repo = await get_repo_info(github_token)
        console.print(f"  [green]Repository:[/] {owner}/{repo}")
    except ValueError as e:
        error_msg = str(e)
        console.print(f"  [red]Error:[/] {error_msg}")
        ship_log.error_message = error_msg
        save_ship_log(ship_log)
        return 1

    # 5. Push branch
    console.print("\n[bold yellow]Pushing branch...[/]")
    worktree_path = Path(state.worktree_path)
    if not await push_branch(worktree_path, state.branch_name):
        error_msg = "Failed to push branch"
        console.print(f"  [red]Error:[/] {error_msg}")
        ship_log.error_message = error_msg
        save_ship_log(ship_log)
        return 1
    console.print(f"  [green]Pushed:[/] {state.branch_name}")

    # 6. Create Pull Request
    console.print("\n[bold yellow]Creating Pull Request...[/]")
    pr_title = f"feat: Implement issue #{issue_number}"
    pr_body = generate_pr_body(state_manager)

    try:
        pr_info = await create_pull_request(
            github_token=github_token,
            owner=owner,
            repo=repo,
            title=pr_title,
            body=pr_body,
            head_branch=state.branch_name,
        )
        ship_log.pull_request = pr_info
        console.print(f"  [green]PR Created:[/] {pr_info.html_url}")
    except Exception as e:
        error_msg = f"Failed to create PR: {e}"
        console.print(f"  [red]Error:[/] {error_msg}")
        ship_log.error_message = error_msg
        save_ship_log(ship_log)
        return 1

    # 7. Add labels
    console.print("\n[bold yellow]Adding labels...[/]")
    labels_added = await add_labels_to_pr(
        github_token=github_token,
        owner=owner,
        repo=repo,
        pr_number=pr_info.number,
        labels=["adws", "automated"],
    )
    if labels_added:
        console.print("  [green]Labels added[/]")
    else:
        console.print("  [yellow]Labels could not be added (may not exist)[/]")

    # 8. Enable auto-merge if requested
    if auto_merge:
        console.print("\n[bold yellow]Enabling auto-merge...[/]")
        if await enable_auto_merge(github_token, owner, repo, pr_info.number):
            ship_log.auto_merge_succeeded = True
            console.print("  [green]Auto-merge enabled[/]")
        else:
            console.print("  [yellow]Auto-merge not available for this repo[/]")

    # 9. Cleanup worktree
    console.print("\n[bold yellow]Cleaning up worktree...[/]")
    if cleanup_worktree(adw_id):
        ship_log.worktree_removed = True
        console.print("  [green]Worktree removed[/]")
    else:
        console.print("  [yellow]Worktree cleanup skipped[/]")

    # 10. Archive state
    console.print("\n[bold yellow]Archiving state...[/]")
    archive_path = archive_state(adw_id)
    ship_log.state_archived = True
    console.print(f"  [green]Archived to:[/] {archive_path}")

    # 11. Update state and save ship log
    duration = time.perf_counter() - start_time
    ship_log.duration_seconds = duration

    state_manager.record_phase_completion(
        phase="ship",
        duration=duration,
        success=True,
    )
    state = state_manager.get_state()
    state.current_phase = "shipped"
    state_manager.save()

    # Save ship log
    save_ship_log(ship_log)

    # 12. Summary
    console.print("\n")
    auto_merge_status = "Enabled" if ship_log.auto_merge_succeeded else "Disabled"
    console.print(
        Panel.fit(
            f"[bold green]Pull Request:[/] {pr_info.html_url}\n"
            f"[bold green]Duration:[/] {duration:.2f}s\n"
            f"[bold green]Auto-Merge:[/] {auto_merge_status}",
            title="[bold green]Ship Phase Complete[/]",
            border_style="green",
        )
    )

    return 0


def save_ship_log(ship_log: ShipLog, agents_base: Path | None = None) -> Path:
    """Save ship log to agents/{adw_id}/ship_log.json."""
    if agents_base is None:
        agents_base = Path("agents")

    log_dir = agents_base / ship_log.adw_id
    log_dir.mkdir(parents=True, exist_ok=True)

    log_path = log_dir / "ship_log.json"
    log_path.write_text(ship_log.model_dump_json(indent=2), encoding="utf-8")

    return log_path


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
    auto_merge: bool = typer.Option(
        False,
        "--auto-merge",
        "-a",
        help="Enable auto-merge on the PR",
    ),
) -> None:
    """
    Execute the ADWS Ship Phase.

    Creates a Pull Request from the worktree branch, optionally enables
    auto-merge, cleans up the worktree, and archives state.

    Example:
        uv run python adws/scripts/adw_ship_iso.py 42 abc12345
        uv run python adws/scripts/adw_ship_iso.py 42 abc12345 --auto-merge
    """
    exit_code = asyncio.run(
        execute_ship_phase(issue_number, adw_id, auto_merge)
    )
    raise typer.Exit(code=exit_code)


if __name__ == "__main__":
    app()
