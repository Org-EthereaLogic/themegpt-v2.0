"""
ADWS Worktree Operations Module

Provides git worktree management with deterministic port allocation.
Each workflow runs in an isolated worktree at trees/{adw_id}/ with
allocated backend/frontend ports.

Includes TTL-based auto-cleanup to remove stale worktrees older than
a configurable threshold (default 72 hours).
"""

from __future__ import annotations

import json
import logging
import secrets
import subprocess
import time
from datetime import UTC, datetime
from pathlib import Path

logger = logging.getLogger("adws-worktree")


def generate_adw_id() -> str:
    """
    Generate a unique 8-character hexadecimal ADW identifier.

    Returns:
        8-character lowercase hex string (e.g., "a1b2c3d4")
    """
    return secrets.token_hex(4)


def get_ports_for_adw(adw_id: str) -> tuple[int, int]:
    """
    Deterministically assign ports based on ADW ID.

    Uses base-36 conversion of the first 8 characters to compute
    a slot index, ensuring consistent port allocation for the same
    ADW ID across restarts.

    Args:
        adw_id: 8-character hexadecimal identifier

    Returns:
        Tuple of (backend_port, frontend_port)
        - Backend: 9100-9114 (15 slots)
        - Frontend: 9200-9214 (15 slots)

    Example:
        >>> get_ports_for_adw("a1b2c3d4")
        (9103, 9203)
    """
    index = int(adw_id[:8], 36) % 15
    return (9100 + index, 9200 + index)


def create_worktree(
    adw_id: str,
    issue_number: int,
    repo_path: Path | None = None,
    trees_base: Path | None = None,
) -> tuple[Path, str]:
    """
    Create an isolated git worktree for the workflow.

    Creates a new branch and worktree, providing a complete copy of the
    repository for isolated development. The worktree contains all files
    from the current HEAD.

    Args:
        adw_id: Unique workflow identifier
        issue_number: GitHub issue number
        repo_path: Path to the main repository (defaults to current directory)
        trees_base: Base directory for worktrees (defaults to "trees")

    Returns:
        Tuple of (worktree_path, branch_name)

    Raises:
        subprocess.CalledProcessError: If git commands fail
        FileExistsError: If worktree or branch already exists
    """
    if repo_path is None:
        repo_path = Path(".")
    if trees_base is None:
        trees_base = Path("trees")

    worktree_path = trees_base / adw_id
    branch_name = f"feat/issue-{issue_number}-{adw_id}"

    # Check if worktree already exists
    if worktree_path.exists():
        raise FileExistsError(
            f"Worktree already exists at {worktree_path}. "
            f"Use remove_worktree() first or choose a different adw_id."
        )

    # Check if branch already exists
    result = subprocess.run(
        ["git", "rev-parse", "--verify", f"refs/heads/{branch_name}"],
        cwd=repo_path,
        capture_output=True,
        text=True,
    )
    if result.returncode == 0:
        raise FileExistsError(
            f"Branch {branch_name} already exists. "
            f"Choose a different adw_id or delete the branch first."
        )

    # Ensure trees base directory exists
    trees_base.mkdir(parents=True, exist_ok=True)

    # Create worktree with new branch
    subprocess.run(
        [
            "git",
            "worktree",
            "add",
            str(worktree_path),
            "-b",
            branch_name,
        ],
        cwd=repo_path,
        capture_output=True,
        text=True,
        check=True,
    )

    return worktree_path, branch_name


def remove_worktree(
    adw_id: str,
    trees_base: Path | None = None,
    repo_path: Path | None = None,
    delete_branch: bool = False,
) -> None:
    """
    Remove a worktree after workflow completion.

    Prunes the worktree from git's tracking and optionally deletes
    the associated branch.

    Args:
        adw_id: Workflow identifier
        trees_base: Base directory for worktrees (defaults to "trees")
        repo_path: Path to the main repository (defaults to current directory)
        delete_branch: If True, also delete the associated branch
    """
    if trees_base is None:
        trees_base = Path("trees")
    if repo_path is None:
        repo_path = Path(".")

    worktree_path = trees_base / adw_id

    # Get branch name before removing worktree (for optional deletion)
    branch_name: str | None = None
    if delete_branch and worktree_path.exists():
        try:
            result = subprocess.run(
                ["git", "branch", "--show-current"],
                cwd=worktree_path,
                capture_output=True,
                text=True,
                check=True,
            )
            branch_name = result.stdout.strip()
        except subprocess.CalledProcessError:
            branch_name = None

    # Remove worktree (force to handle uncommitted changes)
    subprocess.run(
        ["git", "worktree", "remove", str(worktree_path), "--force"],
        cwd=repo_path,
        capture_output=True,
        text=True,
        check=False,  # Don't raise if already removed
    )

    # Prune any stale worktree entries
    subprocess.run(
        ["git", "worktree", "prune"],
        cwd=repo_path,
        capture_output=True,
        text=True,
        check=False,
    )

    # Delete branch if requested and found
    if delete_branch and branch_name:
        subprocess.run(
            ["git", "branch", "-D", branch_name],
            cwd=repo_path,
            capture_output=True,
            text=True,
            check=False,  # Don't raise if branch doesn't exist
        )


def list_active_worktrees(
    trees_base: Path | None = None,
    repo_path: Path | None = None,
) -> list[str]:
    """
    List all active ADW worktrees.

    Queries git for all worktrees and filters to those in the trees_base
    directory.

    Args:
        trees_base: Base directory for worktrees (defaults to "trees")
        repo_path: Path to the main repository (defaults to current directory)

    Returns:
        List of ADW IDs with active worktrees
    """
    if trees_base is None:
        trees_base = Path("trees")
    if repo_path is None:
        repo_path = Path(".")

    result = subprocess.run(
        ["git", "worktree", "list", "--porcelain"],
        cwd=repo_path,
        capture_output=True,
        text=True,
        check=False,
    )

    if result.returncode != 0:
        return []

    adw_ids: list[str] = []
    trees_base_abs = trees_base.resolve()

    for line in result.stdout.strip().split("\n"):
        if line.startswith("worktree "):
            path = Path(line[9:])  # Remove "worktree " prefix
            try:
                path_abs = path.resolve()
                if trees_base_abs in path_abs.parents or path_abs.parent == trees_base_abs:
                    adw_ids.append(path_abs.name)
            except (OSError, ValueError):
                continue

    return adw_ids


def get_worktree_info(
    adw_id: str,
    trees_base: Path | None = None,
) -> dict[str, str] | None:
    """
    Get information about a specific worktree.

    Args:
        adw_id: Workflow identifier
        trees_base: Base directory for worktrees (defaults to "trees")

    Returns:
        Dictionary with worktree info or None if not found.
        Keys: path, branch, commit
    """
    if trees_base is None:
        trees_base = Path("trees")

    worktree_path = trees_base / adw_id

    if not worktree_path.exists():
        return None

    info: dict[str, str] = {"path": str(worktree_path)}

    # Get current branch
    try:
        result = subprocess.run(
            ["git", "branch", "--show-current"],
            cwd=worktree_path,
            capture_output=True,
            text=True,
            check=True,
        )
        info["branch"] = result.stdout.strip()
    except subprocess.CalledProcessError:
        info["branch"] = "unknown"

    # Get current commit
    try:
        result = subprocess.run(
            ["git", "rev-parse", "--short", "HEAD"],
            cwd=worktree_path,
            capture_output=True,
            text=True,
            check=True,
        )
        info["commit"] = result.stdout.strip()
    except subprocess.CalledProcessError:
        info["commit"] = "unknown"

    return info


def cleanup_old_worktrees(
    max_age_hours: float = 72.0,
    trees_base: Path | None = None,
    repo_path: Path | None = None,
    agents_base: Path | None = None,
) -> list[str]:
    """
    Remove worktrees older than max_age_hours.

    Scans the trees_base directory for worktree directories whose last
    modification time exceeds the threshold. Removes both the git worktree
    and the associated branch. Optionally archives the agent state directory
    before cleanup.

    Args:
        max_age_hours: Maximum age in hours before a worktree is cleaned up.
                       Defaults to 72 hours (3 days).
        trees_base: Base directory for worktrees (defaults to "trees")
        repo_path: Path to the main repository (defaults to current directory)
        agents_base: Base directory for agent state (defaults to "agents").
                     State directories are NOT deleted — only worktrees.

    Returns:
        List of ADW IDs that were cleaned up
    """
    if trees_base is None:
        trees_base = Path("trees")
    if repo_path is None:
        repo_path = Path(".")
    if agents_base is None:
        agents_base = Path("agents")

    if not trees_base.exists():
        return []

    max_age_seconds = max_age_hours * 3600
    now = time.time()
    cleaned: list[str] = []

    for entry in trees_base.iterdir():
        if not entry.is_dir():
            continue

        adw_id = entry.name

        # Check modification time of the worktree directory
        try:
            mtime = entry.stat().st_mtime
        except OSError:
            logger.warning(f"Cannot stat worktree directory: {entry}")
            continue

        age_seconds = now - mtime
        if age_seconds < max_age_seconds:
            continue

        age_hours = age_seconds / 3600
        logger.info(
            f"Worktree {adw_id} is {age_hours:.1f} hours old "
            f"(threshold: {max_age_hours:.1f}h). Cleaning up."
        )

        # Check if there's a state file — mark it as cleaned
        state_file = agents_base / adw_id / "adw_state.json"
        if state_file.exists():
            try:
                with open(state_file, encoding="utf-8") as f:
                    state_data = json.load(f)
                state_data["cleanup_reason"] = "ttl_expired"
                state_data["cleanup_at"] = datetime.now(UTC).isoformat()
                with open(state_file, "w", encoding="utf-8") as f:
                    json.dump(state_data, f, indent=2, default=str)
            except (json.JSONDecodeError, OSError) as e:
                logger.warning(f"Could not update state for {adw_id}: {e}")

        # Remove the git worktree and branch
        remove_worktree(
            adw_id=adw_id,
            trees_base=trees_base,
            repo_path=repo_path,
            delete_branch=True,
        )

        cleaned.append(adw_id)
        logger.info(f"Cleaned up worktree {adw_id}")

    if cleaned:
        logger.info(f"Cleaned up {len(cleaned)} stale worktrees: {cleaned}")
    else:
        logger.info("No stale worktrees found")

    return cleaned


def cleanup_worktree_and_state(
    adw_id: str,
    trees_base: Path | None = None,
    repo_path: Path | None = None,
    agents_base: Path | None = None,
    archive: bool = True,
) -> None:
    """
    Full cleanup of a single workflow: worktree, branch, and optionally
    archive the state directory.

    Args:
        adw_id: Workflow identifier to clean up
        trees_base: Base directory for worktrees (defaults to "trees")
        repo_path: Path to the main repository (defaults to current directory)
        agents_base: Base directory for agent state (defaults to "agents")
        archive: If True, rename state dir to {adw_id}.archived instead of
                 deleting. Defaults to True for safety.
    """
    if trees_base is None:
        trees_base = Path("trees")
    if repo_path is None:
        repo_path = Path(".")
    if agents_base is None:
        agents_base = Path("agents")

    # Remove git worktree and branch
    remove_worktree(
        adw_id=adw_id,
        trees_base=trees_base,
        repo_path=repo_path,
        delete_branch=True,
    )

    # Archive or leave state directory
    state_dir = agents_base / adw_id
    if state_dir.exists() and archive:
        archive_dir = agents_base / f"{adw_id}.archived"
        if archive_dir.exists():
            # Append timestamp to avoid collision
            timestamp = int(time.time())
            archive_dir = agents_base / f"{adw_id}.archived.{timestamp}"
        try:
            state_dir.rename(archive_dir)
            logger.info(f"Archived state for {adw_id} to {archive_dir}")
        except OSError as e:
            logger.error(f"Failed to archive state for {adw_id}: {e}")
