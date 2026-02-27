"""
Tests for ADWS State Hardening: file locking, snapshots, and rollback.

Tests cover:
- File locking prevents corruption during concurrent saves
- Snapshot creation and listing
- Rollback to snapshot restores state
- Rollback to phase trims history correctly
"""

import json
import threading
import time
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

import pytest

from adws.adw_modules.state import ADWState, StateManager


class TestFileLocking:
    """Tests for file locking during concurrent save operations."""

    def test_save_creates_lock_file(
        self,
        temp_workspace: Path,
        sample_adw_id: str,
        sample_state_kwargs: dict[str, Any],
    ) -> None:
        """Test that saving creates a lock file in the state directory."""
        manager = StateManager(sample_adw_id, base_path=temp_workspace)
        manager.initialize(**sample_state_kwargs)

        # Lock file should exist after save (created during save)
        lock_path = manager.state_dir / ".adw_state.lock"
        assert lock_path.exists()

    def test_concurrent_saves_no_corruption(
        self,
        temp_workspace: Path,
        sample_state_kwargs: dict[str, Any],
    ) -> None:
        """Test that concurrent saves don't corrupt the state file."""
        adw_id = "conctest1"
        manager = StateManager(adw_id, base_path=temp_workspace)
        manager.initialize(**sample_state_kwargs)

        errors: list[Exception] = []
        save_count = 20

        def save_with_update(iteration: int) -> None:
            try:
                loaded = StateManager.load(adw_id, base_path=temp_workspace)
                loaded.update(current_phase=f"phase_{iteration}")
                loaded.save()
            except Exception as e:
                errors.append(e)

        threads = [
            threading.Thread(target=save_with_update, args=(i,))
            for i in range(save_count)
        ]
        for t in threads:
            t.start()
        for t in threads:
            t.join(timeout=10)

        # No exceptions should have occurred
        assert len(errors) == 0, f"Concurrent save errors: {errors}"

        # State file should be valid JSON
        loaded = StateManager.load(adw_id, base_path=temp_workspace)
        state = loaded.get_state()
        assert state.adw_id == adw_id
        assert state.current_phase.startswith("phase_")

    def test_save_after_lock_released(
        self,
        temp_workspace: Path,
        sample_adw_id: str,
        sample_state_kwargs: dict[str, Any],
    ) -> None:
        """Test that saves work correctly after previous lock is released."""
        manager = StateManager(sample_adw_id, base_path=temp_workspace)
        manager.initialize(**sample_state_kwargs)

        # Save multiple times sequentially
        for i in range(5):
            manager.update(current_phase=f"phase_{i}")
            manager.save()

        loaded = StateManager.load(sample_adw_id, base_path=temp_workspace)
        assert loaded.get_state().current_phase == "phase_4"


class TestSnapshots:
    """Tests for snapshot creation and listing."""

    def test_create_snapshot(
        self,
        temp_workspace: Path,
        sample_adw_id: str,
        sample_state_kwargs: dict[str, Any],
    ) -> None:
        """Test creating a snapshot of current state."""
        manager = StateManager(sample_adw_id, base_path=temp_workspace)
        manager.initialize(**sample_state_kwargs)

        snapshot_path = manager.create_snapshot()
        assert snapshot_path.exists()
        assert snapshot_path.suffix == ".json"
        assert "snapshot_" in snapshot_path.name

        # Verify snapshot content matches current state
        with open(snapshot_path, encoding="utf-8") as f:
            snap_data = json.load(f)
        assert snap_data["adw_id"] == sample_adw_id
        assert snap_data["issue_number"] == 42

    def test_create_snapshot_with_label(
        self,
        temp_workspace: Path,
        sample_adw_id: str,
        sample_state_kwargs: dict[str, Any],
    ) -> None:
        """Test creating a labeled snapshot."""
        manager = StateManager(sample_adw_id, base_path=temp_workspace)
        manager.initialize(**sample_state_kwargs)

        snapshot_path = manager.create_snapshot(label="before_build")
        assert "before_build" in snapshot_path.name

    def test_create_snapshot_sanitizes_label(
        self,
        temp_workspace: Path,
        sample_adw_id: str,
        sample_state_kwargs: dict[str, Any],
    ) -> None:
        """Test that snapshot labels are sanitized for safe filenames."""
        manager = StateManager(sample_adw_id, base_path=temp_workspace)
        manager.initialize(**sample_state_kwargs)

        snapshot_path = manager.create_snapshot(label="bad/label with spaces!")
        # Should not contain slashes, spaces, or exclamation marks
        assert "/" not in snapshot_path.name
        assert " " not in snapshot_path.name
        assert "!" not in snapshot_path.name
        assert snapshot_path.exists()

    def test_list_snapshots_empty(
        self,
        temp_workspace: Path,
        sample_adw_id: str,
        sample_state_kwargs: dict[str, Any],
    ) -> None:
        """Test listing snapshots when none exist."""
        manager = StateManager(sample_adw_id, base_path=temp_workspace)
        manager.initialize(**sample_state_kwargs)

        assert manager.list_snapshots() == []

    def test_list_snapshots_ordered_newest_first(
        self,
        temp_workspace: Path,
        sample_adw_id: str,
        sample_state_kwargs: dict[str, Any],
    ) -> None:
        """Test that snapshots are listed newest first."""
        manager = StateManager(sample_adw_id, base_path=temp_workspace)
        manager.initialize(**sample_state_kwargs)

        snap1 = manager.create_snapshot(label="first")
        time.sleep(0.05)  # Ensure different timestamps
        snap2 = manager.create_snapshot(label="second")
        time.sleep(0.05)
        snap3 = manager.create_snapshot(label="third")

        snapshots = manager.list_snapshots()
        assert len(snapshots) == 3
        # Newest first
        assert snapshots[0] == snap3
        assert snapshots[2] == snap1

    def test_create_snapshot_raises_if_not_initialized(
        self,
        temp_workspace: Path,
        sample_adw_id: str,
    ) -> None:
        """Test that create_snapshot raises if state not initialized."""
        manager = StateManager(sample_adw_id, base_path=temp_workspace)
        with pytest.raises(ValueError):
            manager.create_snapshot()


class TestRollback:
    """Tests for state rollback functionality."""

    def test_rollback_to_snapshot(
        self,
        temp_workspace: Path,
        sample_adw_id: str,
        sample_state_kwargs: dict[str, Any],
    ) -> None:
        """Test restoring state from a specific snapshot."""
        manager = StateManager(sample_adw_id, base_path=temp_workspace)
        manager.initialize(**sample_state_kwargs)

        # Record a phase and snapshot
        manager.record_phase_completion("plan", 30.0, True)
        manager.save()
        snap_after_plan = manager.create_snapshot(label="after_plan")

        # Progress further
        manager.record_phase_completion("build", 90.0, True)
        manager.save()

        # Verify we're at build
        assert manager.get_state().current_phase == "build"
        assert len(manager.get_state().all_adws) == 2

        # Rollback to plan snapshot
        restored = manager.rollback_to_snapshot(snap_after_plan)
        assert restored.current_phase == "plan"
        assert len(restored.all_adws) == 1

    def test_rollback_creates_safety_backup(
        self,
        temp_workspace: Path,
        sample_adw_id: str,
        sample_state_kwargs: dict[str, Any],
    ) -> None:
        """Test that rollback creates a pre_rollback snapshot."""
        manager = StateManager(sample_adw_id, base_path=temp_workspace)
        manager.initialize(**sample_state_kwargs)

        manager.record_phase_completion("plan", 30.0, True)
        manager.save()
        snap = manager.create_snapshot(label="checkpoint")

        # Progress and rollback
        manager.record_phase_completion("build", 90.0, True)
        manager.save()

        manager.rollback_to_snapshot(snap)

        # Should have created a pre_rollback snapshot
        snapshots = manager.list_snapshots()
        pre_rollback = [s for s in snapshots if "pre_rollback" in s.name]
        assert len(pre_rollback) >= 1

    def test_rollback_to_snapshot_not_found(
        self,
        temp_workspace: Path,
        sample_adw_id: str,
        sample_state_kwargs: dict[str, Any],
    ) -> None:
        """Test that rollback raises if snapshot doesn't exist."""
        manager = StateManager(sample_adw_id, base_path=temp_workspace)
        manager.initialize(**sample_state_kwargs)

        with pytest.raises(FileNotFoundError):
            manager.rollback_to_snapshot(Path("/nonexistent/snapshot.json"))

    def test_rollback_to_phase(
        self,
        temp_workspace: Path,
        sample_adw_id: str,
        sample_state_kwargs: dict[str, Any],
    ) -> None:
        """Test rolling back to a named phase."""
        manager = StateManager(sample_adw_id, base_path=temp_workspace)
        manager.initialize(**sample_state_kwargs)

        # Record multiple phases
        manager.record_phase_completion("plan", 30.0, True)
        manager.save()
        manager.record_phase_completion("build", 90.0, True)
        manager.save()
        manager.record_phase_completion("test", 60.0, True)
        manager.save()

        # Rollback to build phase
        restored = manager.rollback_to_phase("build")
        assert restored.current_phase == "build"
        assert len(restored.all_adws) == 2
        assert restored.all_adws[-1].phase == "build"

    def test_rollback_to_phase_not_completed(
        self,
        temp_workspace: Path,
        sample_adw_id: str,
        sample_state_kwargs: dict[str, Any],
    ) -> None:
        """Test that rollback raises for a phase that never succeeded."""
        manager = StateManager(sample_adw_id, base_path=temp_workspace)
        manager.initialize(**sample_state_kwargs)

        manager.record_phase_completion("plan", 30.0, True)
        manager.save()

        with pytest.raises(ValueError, match="never successfully completed"):
            manager.rollback_to_phase("build")

    def test_rollback_to_phase_with_matching_snapshot(
        self,
        temp_workspace: Path,
        sample_adw_id: str,
        sample_state_kwargs: dict[str, Any],
    ) -> None:
        """Test rollback_to_phase uses snapshot when available."""
        manager = StateManager(sample_adw_id, base_path=temp_workspace)
        manager.initialize(**sample_state_kwargs)

        manager.record_phase_completion("plan", 30.0, True)
        manager.update(current_phase="plan")
        manager.save()
        manager.create_snapshot(label="after_plan")

        # Progress further with extra data
        manager.record_phase_completion("build", 90.0, True)
        manager.update(plan_file="/modified/plan.md")
        manager.save()

        # Rollback to plan — should use snapshot since current_phase == "plan"
        restored = manager.rollback_to_phase("plan")
        assert restored.current_phase == "plan"

    def test_rollback_persists_to_disk(
        self,
        temp_workspace: Path,
        sample_adw_id: str,
        sample_state_kwargs: dict[str, Any],
    ) -> None:
        """Test that rollback saves state to disk."""
        manager = StateManager(sample_adw_id, base_path=temp_workspace)
        manager.initialize(**sample_state_kwargs)

        manager.record_phase_completion("plan", 30.0, True)
        manager.save()
        manager.record_phase_completion("build", 90.0, True)
        manager.save()

        manager.rollback_to_phase("plan")

        # Load fresh and verify
        loaded = StateManager.load(sample_adw_id, base_path=temp_workspace)
        assert loaded.get_state().current_phase == "plan"
        assert len(loaded.get_state().all_adws) == 1
