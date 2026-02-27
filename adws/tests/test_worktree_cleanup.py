"""
Tests for ADWS Worktree Auto-Cleanup.

Tests cover:
- TTL-based cleanup of old worktrees
- State annotation during cleanup
- Full workflow cleanup with archiving
"""

import json
import os
import time
from pathlib import Path
from unittest.mock import patch

import pytest

from adws.adw_modules.worktree_ops import (
    cleanup_old_worktrees,
    cleanup_worktree_and_state,
)


@pytest.fixture
def mock_trees(temp_workspace: Path) -> Path:
    """Create a mock trees directory with fake worktree dirs."""
    trees_dir = temp_workspace / "trees"
    trees_dir.mkdir()
    return trees_dir


@pytest.fixture
def mock_agents(temp_workspace: Path) -> Path:
    """Create a mock agents directory with state files."""
    agents_dir = temp_workspace / "agents"
    agents_dir.mkdir()
    return agents_dir


def _create_fake_worktree(
    trees_dir: Path,
    adw_id: str,
    age_hours: float = 0,
) -> Path:
    """Create a fake worktree directory with a specific age."""
    wt_path = trees_dir / adw_id
    wt_path.mkdir(parents=True, exist_ok=True)
    # Write a marker file so the directory has content
    (wt_path / ".git").write_text("gitdir: /fake/path")

    if age_hours > 0:
        # Set modification time to the past
        past_time = time.time() - (age_hours * 3600)
        os.utime(wt_path, (past_time, past_time))

    return wt_path


def _create_fake_state(agents_dir: Path, adw_id: str) -> Path:
    """Create a fake state file for an adw_id."""
    state_dir = agents_dir / adw_id
    state_dir.mkdir(parents=True, exist_ok=True)
    state_file = state_dir / "adw_state.json"
    state_data = {
        "adw_id": adw_id,
        "issue_number": 42,
        "current_phase": "build",
        "created_at": "2026-01-01T00:00:00+00:00",
        "updated_at": "2026-01-01T00:00:00+00:00",
    }
    with open(state_file, "w", encoding="utf-8") as f:
        json.dump(state_data, f)
    return state_file


class TestCleanupOldWorktrees:
    """Tests for TTL-based worktree cleanup."""

    @patch("adws.adw_modules.worktree_ops.remove_worktree")
    def test_removes_old_worktrees(
        self,
        mock_remove: object,
        temp_workspace: Path,
        mock_trees: Path,
    ) -> None:
        """Test that worktrees older than threshold are removed."""
        _create_fake_worktree(mock_trees, "old_one_1", age_hours=100)
        _create_fake_worktree(mock_trees, "old_one_2", age_hours=80)
        _create_fake_worktree(mock_trees, "fresh_one", age_hours=10)

        cleaned = cleanup_old_worktrees(
            max_age_hours=72,
            trees_base=mock_trees,
            repo_path=temp_workspace,
            agents_base=temp_workspace / "agents",
        )

        assert "old_one_1" in cleaned
        assert "old_one_2" in cleaned
        assert "fresh_one" not in cleaned
        assert len(cleaned) == 2

    @patch("adws.adw_modules.worktree_ops.remove_worktree")
    def test_no_worktrees_to_clean(
        self,
        mock_remove: object,
        temp_workspace: Path,
        mock_trees: Path,
    ) -> None:
        """Test when all worktrees are fresh."""
        _create_fake_worktree(mock_trees, "fresh1", age_hours=1)
        _create_fake_worktree(mock_trees, "fresh2", age_hours=24)

        cleaned = cleanup_old_worktrees(
            max_age_hours=72,
            trees_base=mock_trees,
            repo_path=temp_workspace,
        )

        assert cleaned == []

    @patch("adws.adw_modules.worktree_ops.remove_worktree")
    def test_empty_trees_directory(
        self,
        mock_remove: object,
        temp_workspace: Path,
        mock_trees: Path,
    ) -> None:
        """Test with empty trees directory."""
        cleaned = cleanup_old_worktrees(
            trees_base=mock_trees,
            repo_path=temp_workspace,
        )
        assert cleaned == []

    def test_nonexistent_trees_directory(
        self,
        temp_workspace: Path,
    ) -> None:
        """Test with trees directory that doesn't exist."""
        cleaned = cleanup_old_worktrees(
            trees_base=temp_workspace / "nonexistent",
            repo_path=temp_workspace,
        )
        assert cleaned == []

    @patch("adws.adw_modules.worktree_ops.remove_worktree")
    def test_annotates_state_file_on_cleanup(
        self,
        mock_remove: object,
        temp_workspace: Path,
        mock_trees: Path,
        mock_agents: Path,
    ) -> None:
        """Test that cleanup annotates the state file with reason."""
        adw_id = "annotate1"
        _create_fake_worktree(mock_trees, adw_id, age_hours=100)
        state_file = _create_fake_state(mock_agents, adw_id)

        cleanup_old_worktrees(
            max_age_hours=72,
            trees_base=mock_trees,
            repo_path=temp_workspace,
            agents_base=mock_agents,
        )

        with open(state_file, encoding="utf-8") as f:
            data = json.load(f)
        assert data["cleanup_reason"] == "ttl_expired"
        assert "cleanup_at" in data

    @patch("adws.adw_modules.worktree_ops.remove_worktree")
    def test_custom_max_age(
        self,
        mock_remove: object,
        temp_workspace: Path,
        mock_trees: Path,
    ) -> None:
        """Test with custom max age threshold."""
        _create_fake_worktree(mock_trees, "recent", age_hours=2)
        _create_fake_worktree(mock_trees, "old_enough", age_hours=5)

        cleaned = cleanup_old_worktrees(
            max_age_hours=4,
            trees_base=mock_trees,
            repo_path=temp_workspace,
        )

        assert "old_enough" in cleaned
        assert "recent" not in cleaned


class TestCleanupWorktreeAndState:
    """Tests for full single-workflow cleanup."""

    @patch("adws.adw_modules.worktree_ops.remove_worktree")
    def test_archives_state_directory(
        self,
        mock_remove: object,
        temp_workspace: Path,
        mock_trees: Path,
        mock_agents: Path,
    ) -> None:
        """Test that cleanup archives the state directory."""
        adw_id = "archive1"
        _create_fake_worktree(mock_trees, adw_id)
        _create_fake_state(mock_agents, adw_id)

        cleanup_worktree_and_state(
            adw_id=adw_id,
            trees_base=mock_trees,
            repo_path=temp_workspace,
            agents_base=mock_agents,
            archive=True,
        )

        # Original state dir should be renamed
        assert not (mock_agents / adw_id).exists()
        assert (mock_agents / f"{adw_id}.archived").exists()

    @patch("adws.adw_modules.worktree_ops.remove_worktree")
    def test_no_archive_leaves_state(
        self,
        mock_remove: object,
        temp_workspace: Path,
        mock_trees: Path,
        mock_agents: Path,
    ) -> None:
        """Test that cleanup without archive leaves state directory."""
        adw_id = "noarch1"
        _create_fake_worktree(mock_trees, adw_id)
        _create_fake_state(mock_agents, adw_id)

        cleanup_worktree_and_state(
            adw_id=adw_id,
            trees_base=mock_trees,
            repo_path=temp_workspace,
            agents_base=mock_agents,
            archive=False,
        )

        # State dir should still exist
        assert (mock_agents / adw_id).exists()

    @patch("adws.adw_modules.worktree_ops.remove_worktree")
    def test_archive_collision_appends_timestamp(
        self,
        mock_remove: object,
        temp_workspace: Path,
        mock_trees: Path,
        mock_agents: Path,
    ) -> None:
        """Test that archive handles name collision."""
        adw_id = "collide1"
        _create_fake_worktree(mock_trees, adw_id)
        _create_fake_state(mock_agents, adw_id)

        # Create existing archive to cause collision
        (mock_agents / f"{adw_id}.archived").mkdir()

        cleanup_worktree_and_state(
            adw_id=adw_id,
            trees_base=mock_trees,
            repo_path=temp_workspace,
            agents_base=mock_agents,
            archive=True,
        )

        # Should have created a timestamped archive
        archives = list(mock_agents.glob(f"{adw_id}.archived*"))
        assert len(archives) >= 2
