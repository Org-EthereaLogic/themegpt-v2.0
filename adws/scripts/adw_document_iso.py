#!/usr/bin/env python3
"""
ADWS Document Phase Entry Point

Orchestrates the documentation phase by:
1. Loading state and validating prerequisites (review phase complete)
2. Loading plan and build log for context
3. Generating Keep-a-Changelog style entry
4. Updating/creating CHANGELOG.md in worktree
5. Conditionally updating README if plan warrants
6. Committing documentation changes
7. Recording doc log at agents/{adw_id}/doc_log.json
8. Recording phase completion

Usage:
    uv run python adws/scripts/adw_document_iso.py <issue_number> <adw_id>

Prerequisites:
    - State file at agents/{adw_id}/adw_state.json
    - Review phase completed successfully
    - Build log at agents/{adw_id}/build_log.json
    - Plan at specs/{adw_id}/plan.json
    - Worktree at trees/{adw_id}/

Creates:
    - agents/{adw_id}/doc_log.json
    - CHANGELOG.md updates in worktree
    - Optional README.md updates in worktree
    - Git commit with documentation changes
"""

from __future__ import annotations

import asyncio
import json
import subprocess
import time
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

import typer
from pydantic import BaseModel, Field
from rich.console import Console
from rich.panel import Panel

from adws.adw_modules.provider_clients import ClaudeClient
from adws.adw_modules.state import StateManager
from adws.adw_modules.trinity_protocol import TrinityPlan

# Initialize Typer app and Rich console
app = typer.Typer(
    name="adw-document",
    help="ADWS Document Phase - Generate documentation updates",
)
console = Console()


class DocChange(BaseModel):
    """Record of a single documentation change."""

    file_path: str
    action: str  # "created", "updated", "unchanged"
    description: str
    tokens_used: int = 0
    latency_ms: float = 0.0


class DocLog(BaseModel):
    """Structured documentation log persisted to agents/{adw_id}/doc_log.json."""

    adw_id: str
    issue_number: int
    started_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    completed_at: datetime | None = None
    duration_seconds: float = 0.0
    changelog_entry: str = ""
    changes: list[DocChange] = Field(default_factory=list)
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
    """
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


def load_build_log(adw_id: str, agents_base: Path | None = None) -> dict[str, Any]:
    """
    Load build log from agents/{adw_id}/build_log.json.

    Args:
        adw_id: Workflow identifier
        agents_base: Base directory for agents (defaults to "agents")

    Returns:
        Build log as dictionary

    Raises:
        FileNotFoundError: If build_log.json does not exist
    """
    if agents_base is None:
        agents_base = Path("agents")

    log_path = agents_base / adw_id / "build_log.json"

    if not log_path.exists():
        raise FileNotFoundError(f"Build log not found at {log_path}")

    with open(log_path, encoding="utf-8") as f:
        data: dict[str, Any] = json.load(f)
        return data


async def generate_changelog_entry(
    client: ClaudeClient,
    plan: TrinityPlan,
    build_log: dict[str, Any],
) -> tuple[str, int, float]:
    """
    Generate a Keep-a-Changelog style entry.

    Args:
        client: ClaudeClient instance
        plan: The TrinityPlan providing context
        build_log: Build log with file changes

    Returns:
        Tuple of (changelog_entry, tokens_used, latency_ms)
    """
    files_created = [f["file_path"] for f in build_log.get("files_created", [])]
    files_modified = [f["file_path"] for f in build_log.get("files_modified", [])]

    prompt = f"""Generate a Keep-a-Changelog style entry for this change.

## Issue
#{plan.issue_number}: {plan.issue_title}

## Summary
{plan.summary}

## Files Created
{chr(10).join(f"- {f}" for f in files_created) if files_created else "None"}

## Files Modified
{chr(10).join(f"- {f}" for f in files_modified) if files_modified else "None"}

## Instructions
Generate ONLY the changelog entry text (no version header, no date).
Use these categories where applicable:
- Added (for new features)
- Changed (for changes in existing functionality)
- Fixed (for bug fixes)
- Removed (for removed features)
- Security (for security fixes)

Format as markdown bullet points. Be concise but informative.
Include a reference to the issue number."""

    response = await client.complete(
        prompt=prompt,
        system="You are a technical writer. Generate concise, informative changelog entries.",
        max_tokens=1024,
        timeout=60.0,
    )

    return response.content.strip(), response.tokens_used, response.latency_ms


def update_changelog(
    worktree_path: Path,
    entry: str,
    issue_number: int,
) -> tuple[str, str]:
    """
    Update or create CHANGELOG.md with the new entry.

    Args:
        worktree_path: Path to the worktree
        entry: Changelog entry to add
        issue_number: Issue number for the version tag

    Returns:
        Tuple of (action, description)
    """
    changelog_path = worktree_path / "CHANGELOG.md"
    today = datetime.now(UTC).strftime("%Y-%m-%d")

    # Build the new entry section
    version_header = f"## [Unreleased] - Issue #{issue_number} ({today})"
    new_section = f"{version_header}\n\n{entry}\n"

    if changelog_path.exists():
        existing = changelog_path.read_text(encoding="utf-8")

        # Check if there's already an Unreleased section
        if "## [Unreleased]" in existing:
            # Find the Unreleased section and append to it
            lines = existing.split("\n")
            new_lines = []
            found_unreleased = False
            inserted = False

            for line in lines:
                if line.startswith("## [Unreleased]") and not found_unreleased:
                    found_unreleased = True
                    new_lines.append(line)
                    # Insert entry after the header line
                    new_lines.append("")
                    new_lines.append(f"### Issue #{issue_number} ({today})")
                    new_lines.append("")
                    new_lines.append(entry)
                    inserted = True
                elif line.startswith("## ") and found_unreleased and not inserted:
                    # Insert before next version section
                    new_lines.append("")
                    new_lines.append(f"### Issue #{issue_number} ({today})")
                    new_lines.append("")
                    new_lines.append(entry)
                    new_lines.append("")
                    new_lines.append(line)
                    inserted = True
                else:
                    new_lines.append(line)

            content = "\n".join(new_lines)
        else:
            # Prepend new section after any header
            if existing.startswith("# "):
                # Find end of first header line
                first_newline = existing.index("\n") if "\n" in existing else len(existing)
                header = existing[:first_newline]
                rest = existing[first_newline:].lstrip("\n")
                content = f"{header}\n\n{new_section}\n{rest}"
            else:
                content = f"# Changelog\n\n{new_section}\n{existing}"

        changelog_path.write_text(content, encoding="utf-8")
        return "updated", f"Added entry for issue #{issue_number}"
    else:
        # Create new changelog
        content = f"""# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

{new_section}
"""
        changelog_path.write_text(content, encoding="utf-8")
        return "created", f"Created changelog with entry for issue #{issue_number}"


async def should_update_readme(
    client: ClaudeClient,
    plan: TrinityPlan,
    readme_content: str,
) -> tuple[bool, str, int, float]:
    """
    Determine if README should be updated based on plan changes.

    Args:
        client: ClaudeClient instance
        plan: The TrinityPlan providing context
        readme_content: Current README content

    Returns:
        Tuple of (should_update, reasoning, tokens_used, latency_ms)
    """
    prompt = f"""Analyze whether the README.md should be updated based on these changes.

## Issue
#{plan.issue_number}: {plan.issue_title}

## Summary
{plan.summary}

## Files Created
{chr(10).join(f"- {f}" for f in plan.files_to_create) if plan.files_to_create else "None"}

## Files Modified
{chr(10).join(f"- {f}" for f in plan.files_to_modify) if plan.files_to_modify else "None"}

## Current README (first 2000 chars)
```
{readme_content[:2000]}
```

## Instructions
Answer ONLY with a JSON object:
{{"should_update": true/false, "reason": "brief explanation"}}

README should be updated if:
- New public API is added
- Significant new functionality is introduced
- Installation or usage instructions change
- Breaking changes are introduced

README should NOT be updated for:
- Internal refactoring
- Bug fixes
- Test additions
- Minor improvements"""

    response = await client.complete(
        prompt=prompt,
        system="You are a documentation specialist. Respond with JSON only.",
        max_tokens=256,
        timeout=30.0,
    )

    content = response.content.strip()
    if content.startswith("```"):
        lines = content.split("\n")
        content = "\n".join(lines[1:-1] if lines[-1].strip() == "```" else lines[1:])

    try:
        result = json.loads(content)
        return (
            result.get("should_update", False),
            result.get("reason", ""),
            response.tokens_used,
            response.latency_ms,
        )
    except json.JSONDecodeError:
        return False, "Could not parse response", response.tokens_used, response.latency_ms


async def generate_readme_update(
    client: ClaudeClient,
    plan: TrinityPlan,
    readme_content: str,
) -> tuple[str, int, float]:
    """
    Generate updated README content.

    Args:
        client: ClaudeClient instance
        plan: The TrinityPlan providing context
        readme_content: Current README content

    Returns:
        Tuple of (updated_content, tokens_used, latency_ms)
    """
    prompt = f"""Update the README.md to reflect these changes.

## Issue
#{plan.issue_number}: {plan.issue_title}

## Summary
{plan.summary}

## Approach
{plan.approach}

## Current README
```markdown
{readme_content}
```

## Instructions
Generate the complete updated README.md content.
Only add or modify sections that are necessary to document the new functionality.
Do NOT remove existing content unless it's directly contradicted by the changes.
Do NOT include markdown code fences in your response - output only the raw markdown."""

    response = await client.complete(
        prompt=prompt,
        system="You are a technical documentation writer. Output only the updated README content.",
        max_tokens=4096,
        timeout=90.0,
    )

    content = response.content.strip()
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
) -> str | None:
    """
    Add all changes and commit in the worktree.

    Args:
        worktree_path: Path to the git worktree
        message: Commit message

    Returns:
        Commit SHA or None if nothing to commit
    """
    # Add all changes
    subprocess.run(
        ["git", "add", "-A"],
        cwd=worktree_path,
        capture_output=True,
        text=True,
        check=True,
    )

    # Check if there are changes to commit
    status_result = subprocess.run(
        ["git", "status", "--porcelain"],
        cwd=worktree_path,
        capture_output=True,
        text=True,
        check=True,
    )

    if not status_result.stdout.strip():
        return None

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


def save_doc_log(
    doc_log: DocLog,
    agents_base: Path | None = None,
) -> Path:
    """
    Save documentation log to agents/{adw_id}/doc_log.json.

    Args:
        doc_log: DocLog to save
        agents_base: Base directory for agents (defaults to "agents")

    Returns:
        Path to saved log
    """
    if agents_base is None:
        agents_base = Path("agents")

    log_dir = agents_base / doc_log.adw_id
    log_dir.mkdir(parents=True, exist_ok=True)

    log_path = log_dir / "doc_log.json"
    log_path.write_text(doc_log.model_dump_json(indent=2), encoding="utf-8")

    return log_path


async def execute_document_phase(
    issue_number: int,
    adw_id: str,
) -> int:
    """
    Execute the complete documentation phase.

    Args:
        issue_number: GitHub issue number
        adw_id: ADW workflow identifier

    Returns:
        Exit code (0 = success, non-zero = failure)
    """
    start_time = time.perf_counter()

    doc_log = DocLog(adw_id=adw_id, issue_number=issue_number)

    console.print(
        Panel.fit(
            f"[bold cyan]ADW ID:[/] {adw_id}\n"
            f"[bold cyan]Issue:[/] #{issue_number}",
            title="[bold green]ADWS Document Phase[/]",
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
        doc_log.error_message = str(e)
        save_doc_log(doc_log)
        return 1

    # Validate issue number matches
    if state.issue_number != issue_number:
        error_msg = (
            f"Issue number mismatch: expected {state.issue_number}, got {issue_number}"
        )
        console.print(f"  [red]Error:[/] {error_msg}")
        doc_log.error_message = error_msg
        save_doc_log(doc_log)
        return 1

    # 2. Validate prerequisites
    console.print("\n[bold yellow]Validating prerequisites...[/]")
    if not state_manager.validate_prerequisites(["plan", "build", "test", "review"]):
        error_msg = "Prerequisites not met: plan, build, test, and review phases must complete"
        console.print(f"  [red]Error:[/] {error_msg}")
        doc_log.error_message = error_msg
        save_doc_log(doc_log)
        return 1
    console.print("  [green]Prerequisites validated:[/] all prior phases complete")

    # 3. Verify worktree exists
    worktree_path = Path(state.worktree_path)
    if not worktree_path.exists():
        error_msg = f"Worktree not found at {worktree_path}"
        console.print(f"  [red]Error:[/] {error_msg}")
        doc_log.error_message = error_msg
        save_doc_log(doc_log)
        return 1
    console.print(f"  [green]Worktree exists:[/] {worktree_path}")

    # 4. Load plan and build log
    console.print("\n[bold yellow]Loading artifacts...[/]")
    try:
        plan = load_plan(adw_id)
        console.print(f"  [green]Plan loaded:[/] specs/{adw_id}/plan.json")
    except FileNotFoundError as e:
        console.print(f"  [red]Error:[/] {e}")
        doc_log.error_message = str(e)
        save_doc_log(doc_log)
        return 1

    try:
        build_log_data = load_build_log(adw_id)
        console.print(f"  [green]Build log loaded:[/] agents/{adw_id}/build_log.json")
    except FileNotFoundError as e:
        console.print(f"  [red]Error:[/] {e}")
        doc_log.error_message = str(e)
        save_doc_log(doc_log)
        return 1

    # 5. Initialize provider
    console.print("\n[bold yellow]Initializing provider...[/]")
    try:
        architect = ClaudeClient()
        console.print(f"  [green]Provider ready:[/] {architect.model}")
    except ValueError as e:
        console.print(f"  [red]Error:[/] {e}")
        doc_log.error_message = str(e)
        save_doc_log(doc_log)
        return 1

    # 6. Generate changelog entry
    console.print("\n[bold yellow]Generating changelog entry...[/]")
    try:
        entry, tokens, latency = await generate_changelog_entry(
            client=architect,
            plan=plan,
            build_log=build_log_data,
        )
        doc_log.changelog_entry = entry
        doc_log.total_tokens += tokens
        doc_log.total_latency_ms += latency
        console.print(f"  [green]Entry generated:[/] {tokens} tokens")
    except Exception as e:
        console.print(f"  [red]Error generating entry:[/] {e}")
        doc_log.error_message = str(e)
        save_doc_log(doc_log)
        return 1

    # 7. Update CHANGELOG.md
    console.print("\n[bold yellow]Updating CHANGELOG.md...[/]")
    action, description = update_changelog(
        worktree_path=worktree_path,
        entry=entry,
        issue_number=issue_number,
    )
    doc_log.changes.append(
        DocChange(
            file_path="CHANGELOG.md",
            action=action,
            description=description,
        )
    )
    console.print(f"  [green]{action.capitalize()}:[/] {description}")

    # 8. Check if README needs updating
    console.print("\n[bold yellow]Checking README.md...[/]")
    readme_path = worktree_path / "README.md"

    if readme_path.exists():
        readme_content = readme_path.read_text(encoding="utf-8")
        should_update, reason, tokens, latency = await should_update_readme(
            client=architect,
            plan=plan,
            readme_content=readme_content,
        )
        doc_log.total_tokens += tokens
        doc_log.total_latency_ms += latency

        if should_update:
            console.print(f"  [dim]Reason:[/] {reason}")
            console.print("  [dim]Generating README update...[/]")

            try:
                updated_content, tokens, latency = await generate_readme_update(
                    client=architect,
                    plan=plan,
                    readme_content=readme_content,
                )
                doc_log.total_tokens += tokens
                doc_log.total_latency_ms += latency

                readme_path.write_text(updated_content, encoding="utf-8")
                doc_log.changes.append(
                    DocChange(
                        file_path="README.md",
                        action="updated",
                        description=reason,
                        tokens_used=tokens,
                        latency_ms=latency,
                    )
                )
                console.print(f"  [green]Updated:[/] README.md ({tokens} tokens)")
            except Exception as e:
                console.print(f"  [yellow]Warning:[/] Could not update README: {e}")
                doc_log.changes.append(
                    DocChange(
                        file_path="README.md",
                        action="unchanged",
                        description=f"Update failed: {e}",
                    )
                )
        else:
            console.print(f"  [dim]No update needed:[/] {reason}")
            doc_log.changes.append(
                DocChange(
                    file_path="README.md",
                    action="unchanged",
                    description=reason,
                )
            )
    else:
        console.print("  [dim]No README.md found in worktree[/]")

    # 9. Commit documentation changes
    console.print("\n[bold yellow]Committing changes...[/]")
    try:
        commit_sha = git_add_commit(
            worktree_path=worktree_path,
            message=f"docs(#{issue_number}): update documentation\n\n"
            f"- Updated CHANGELOG.md\n"
            f"- Issue: #{issue_number}\n\n"
            f"Generated via ADWS Document Phase",
        )
        if commit_sha:
            doc_log.commit_sha = commit_sha
            console.print(f"  [green]Committed:[/] {commit_sha}")
        else:
            console.print("  [yellow]No changes to commit[/]")
            doc_log.commit_sha = "no-changes"
    except subprocess.CalledProcessError as e:
        error_msg = f"Git commit failed: {e.stderr}"
        console.print(f"  [red]Error:[/] {error_msg}")
        doc_log.error_message = error_msg

    # 10. Finalize documentation log
    doc_log.completed_at = datetime.now(UTC)
    doc_log.duration_seconds = time.perf_counter() - start_time
    doc_log.success = True

    log_path = save_doc_log(doc_log)
    console.print(f"\n[bold yellow]Doc log saved:[/] {log_path}")

    # 11. Record phase completion
    state_manager.record_phase_completion(
        phase="document",
        duration=doc_log.duration_seconds,
        success=True,
    )
    state_manager.update(current_phase="documented")
    state_manager.save()

    # 12. Report success
    console.print(
        Panel.fit(
            f"[bold green]Duration:[/] {doc_log.duration_seconds:.2f}s\n"
            f"[bold green]Changes:[/] {len(doc_log.changes)}\n"
            f"[bold green]Total Tokens:[/] {doc_log.total_tokens}\n"
            f"[bold green]Commit:[/] {doc_log.commit_sha}",
            title="[bold green]Document Phase Complete[/]",
            border_style="green",
        )
    )

    console.print(
        f"\n[bold cyan]Next step:[/] Run adw_ship_iso.py {issue_number} {adw_id}"
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
    Execute the ADWS Document Phase.

    Generates documentation updates including CHANGELOG.md entries
    and optional README.md updates based on the implementation.

    Example:
        uv run python adws/scripts/adw_document_iso.py 42 abc12345
    """
    exit_code = asyncio.run(
        execute_document_phase(
            issue_number=issue_number,
            adw_id=adw_id,
        )
    )
    raise typer.Exit(code=exit_code)


if __name__ == "__main__":
    app()
