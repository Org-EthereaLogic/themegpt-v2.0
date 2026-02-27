"""
Tests for ADWS State Management Module.

Tests cover:
- State initialization and persistence
- Atomic save/load roundtrip
- Phase completion recording
- Prerequisite validation
"""

import json
from datetime import UTC, datetime
from pathlib import Path

import pytest

from adws.adw_modules.state import ADWPhaseRecord, ADWState, StateManager


class TestADWPhaseRecord:
    """Tests for ADWPhaseRecord model."""

    def test_create_successful_record(self) -> None:
        """Test creating a successful phase record."""
        record = ADWPhaseRecord(
            phase="plan",
            completed_at=datetime.now(UTC),
            duration_seconds=45.2,
            success=True,
        )
        assert record.phase == "plan"
        assert record.success is True
        assert record.error_message is None
        assert record.duration_seconds == 45.2

    def test_create_failed_record(self) -> None:
        """Test creating a failed phase record with error message."""
        record = ADWPhaseRecord(
            phase="build",
            completed_at=datetime.now(UTC),
            duration_seconds=12.5,
            success=False,
            error_message="Compilation failed",
        )
        assert record.phase == "build"
        assert record.success is False
        assert record.error_message == "Compilation failed"


class TestADWState:
    """Tests for ADWState model."""

    def test_create_minimal_state(self) -> None:
        """Test creating state with required fields only."""
        state = ADWState(
            adw_id="a1b2c3d4",
            issue_number=42,
            worktree_path="/tmp/trees/a1b2c3d4",
            backend_port=9103,
            frontend_port=9203,
            branch_name="feat/issue-42-a1b2c3d4",
        )
        assert state.adw_id == "a1b2c3d4"
        assert state.issue_number == 42
        assert state.current_phase == "initialized"
        assert state.plan_file is None
        assert state.plan_json is None
        assert len(state.all_adws) == 0

    def test_port_validation(self) -> None:
        """Test that port validation enforces ranges."""
        with pytest.raises(ValueError):
            ADWState(
                adw_id="a1b2c3d4",
                issue_number=42,
                worktree_path="/tmp/trees/a1b2c3d4",
                backend_port=9099,  # Invalid: below 9100
                frontend_port=9203,
                branch_name="feat/issue-42-a1b2c3d4",
            )

        with pytest.raises(ValueError):
            ADWState(
                adw_id="a1b2c3d4",
                issue_number=42,
                worktree_path="/tmp/trees/a1b2c3d4",
                backend_port=9103,
                frontend_port=9215,  # Invalid: above 9214
                branch_name="feat/issue-42-a1b2c3d4",
            )

    def test_timestamps_are_utc(self) -> None:
        """Test that timestamps default to UTC."""
        state = ADWState(
            adw_id="a1b2c3d4",
            issue_number=42,
            worktree_path="/tmp/trees/a1b2c3d4",
            backend_port=9103,
            frontend_port=9203,
            branch_name="feat/issue-42-a1b2c3d4",
        )
        assert state.created_at.tzinfo is not None
        assert state.updated_at.tzinfo is not None

    def test_json_serialization(self) -> None:
        """Test that state can be serialized to JSON."""
        state = ADWState(
            adw_id="a1b2c3d4",
            issue_number=42,
            worktree_path="/tmp/trees/a1b2c3d4",
            backend_port=9103,
            frontend_port=9203,
            branch_name="feat/issue-42-a1b2c3d4",
        )
        json_str = state.model_dump_json()
        data = json.loads(json_str)
        assert data["adw_id"] == "a1b2c3d4"
        assert "created_at" in data


class TestStateManager:
    """Tests for StateManager class."""

    def test_initialize_creates_state(
        self,
        temp_workspace: Path,
        sample_adw_id: str,
        sample_state_kwargs: dict,
    ) -> None:
        """Test that initialize() creates state file on disk."""
        manager = StateManager(sample_adw_id, base_path=temp_workspace)
        state = manager.initialize(**sample_state_kwargs)

        assert state.adw_id == sample_adw_id
        assert state.issue_number == 42
        assert manager.state_file.exists()

    def test_initialize_raises_if_exists(
        self,
        temp_workspace: Path,
        sample_adw_id: str,
        sample_state_kwargs: dict,
    ) -> None:
        """Test that initialize() raises if state already exists."""
        manager = StateManager(sample_adw_id, base_path=temp_workspace)
        manager.initialize(**sample_state_kwargs)

        with pytest.raises(FileExistsError):
            manager.initialize(**sample_state_kwargs)

    def test_load_existing_state(
        self,
        temp_workspace: Path,
        sample_adw_id: str,
        sample_state_kwargs: dict,
    ) -> None:
        """Test loading existing state from disk."""
        # Create state
        manager1 = StateManager(sample_adw_id, base_path=temp_workspace)
        original_state = manager1.initialize(**sample_state_kwargs)

        # Load in new manager
        manager2 = StateManager.load(sample_adw_id, base_path=temp_workspace)
        loaded_state = manager2.get_state()

        assert loaded_state.adw_id == original_state.adw_id
        assert loaded_state.issue_number == original_state.issue_number
        assert loaded_state.worktree_path == original_state.worktree_path

    def test_load_raises_if_not_found(
        self,
        temp_workspace: Path,
    ) -> None:
        """Test that load() raises if state file doesn't exist."""
        with pytest.raises(FileNotFoundError):
            StateManager.load("nonexistent", base_path=temp_workspace)

    def test_save_updates_timestamp(
        self,
        temp_workspace: Path,
        sample_adw_id: str,
        sample_state_kwargs: dict,
    ) -> None:
        """Test that save() updates the updated_at timestamp."""
        manager = StateManager(sample_adw_id, base_path=temp_workspace)
        state = manager.initialize(**sample_state_kwargs)
        original_updated_at = state.updated_at

        # Modify and save
        manager.update(plan_file="/tmp/plan.md")
        manager.save()

        assert manager.state is not None
        assert manager.state.updated_at > original_updated_at

    def test_save_raises_if_not_initialized(
        self,
        temp_workspace: Path,
        sample_adw_id: str,
    ) -> None:
        """Test that save() raises if state not initialized."""
        manager = StateManager(sample_adw_id, base_path=temp_workspace)
        with pytest.raises(ValueError):
            manager.save()

    def test_atomic_save_roundtrip(
        self,
        temp_workspace: Path,
        sample_adw_id: str,
        sample_state_kwargs: dict,
    ) -> None:
        """Test that save/load preserves all data."""
        manager1 = StateManager(sample_adw_id, base_path=temp_workspace)
        manager1.initialize(**sample_state_kwargs)

        # Record a phase completion
        manager1.record_phase_completion(
            phase="plan",
            duration=45.2,
            success=True,
        )
        manager1.update(plan_file="/tmp/plan.md", plan_json="/tmp/plan.json")
        manager1.save()

        # Load in new manager and verify
        manager2 = StateManager.load(sample_adw_id, base_path=temp_workspace)
        state = manager2.get_state()

        assert state.plan_file == "/tmp/plan.md"
        assert state.plan_json == "/tmp/plan.json"
        assert len(state.all_adws) == 1
        assert state.all_adws[0].phase == "plan"
        assert state.all_adws[0].success is True

    def test_record_phase_completion(
        self,
        temp_workspace: Path,
        sample_adw_id: str,
        sample_state_kwargs: dict,
    ) -> None:
        """Test recording phase completions."""
        manager = StateManager(sample_adw_id, base_path=temp_workspace)
        manager.initialize(**sample_state_kwargs)

        # Record successful phase
        manager.record_phase_completion(
            phase="plan",
            duration=45.2,
            success=True,
        )

        assert manager.state is not None
        assert len(manager.state.all_adws) == 1
        assert manager.state.current_phase == "plan"

        # Record failed phase
        manager.record_phase_completion(
            phase="build",
            duration=12.5,
            success=False,
            error_message="Compilation failed",
        )

        assert len(manager.state.all_adws) == 2
        assert manager.state.current_phase == "build_failed"
        assert manager.state.all_adws[1].error_message == "Compilation failed"

    def test_validate_prerequisites_success(
        self,
        temp_workspace: Path,
        sample_adw_id: str,
        sample_state_kwargs: dict,
    ) -> None:
        """Test prerequisite validation when all phases complete."""
        manager = StateManager(sample_adw_id, base_path=temp_workspace)
        manager.initialize(**sample_state_kwargs)

        manager.record_phase_completion("plan", 45.2, True)
        manager.record_phase_completion("build", 120.5, True)

        assert manager.validate_prerequisites(["plan"]) is True
        assert manager.validate_prerequisites(["plan", "build"]) is True

    def test_validate_prerequisites_failure(
        self,
        temp_workspace: Path,
        sample_adw_id: str,
        sample_state_kwargs: dict,
    ) -> None:
        """Test prerequisite validation when phases missing or failed."""
        manager = StateManager(sample_adw_id, base_path=temp_workspace)
        manager.initialize(**sample_state_kwargs)

        manager.record_phase_completion("plan", 45.2, True)
        manager.record_phase_completion("build", 12.5, False)

        # Missing phase
        assert manager.validate_prerequisites(["test"]) is False
        # Failed phase
        assert manager.validate_prerequisites(["build"]) is False
        # Mix of success and failure
        assert manager.validate_prerequisites(["plan", "build"]) is False

    def test_update_state_fields(
        self,
        temp_workspace: Path,
        sample_adw_id: str,
        sample_state_kwargs: dict,
    ) -> None:
        """Test updating state fields."""
        manager = StateManager(sample_adw_id, base_path=temp_workspace)
        manager.initialize(**sample_state_kwargs)

        manager.update(
            plan_file="/tmp/plan.md",
            current_phase="planning",
        )

        assert manager.state is not None
        assert manager.state.plan_file == "/tmp/plan.md"
        assert manager.state.current_phase == "planning"

    def test_update_invalid_field_raises(
        self,
        temp_workspace: Path,
        sample_adw_id: str,
        sample_state_kwargs: dict,
    ) -> None:
        """Test that updating invalid field raises AttributeError."""
        manager = StateManager(sample_adw_id, base_path=temp_workspace)
        manager.initialize(**sample_state_kwargs)

        with pytest.raises(AttributeError):
            manager.update(invalid_field="value")

    def test_get_state_raises_if_not_initialized(
        self,
        temp_workspace: Path,
        sample_adw_id: str,
    ) -> None:
        """Test that get_state() raises if not initialized."""
        manager = StateManager(sample_adw_id, base_path=temp_workspace)
        with pytest.raises(ValueError):
            manager.get_state()


class TestStateManagerIntegration:
    """Integration tests for full state workflow."""

    def test_full_workflow(
        self,
        temp_workspace: Path,
    ) -> None:
        """Test complete workflow: init -> record phases -> load -> validate."""
        adw_id = "test1234"

        # Initialize
        manager = StateManager(adw_id, base_path=temp_workspace)
        manager.initialize(
            issue_number=123,
            worktree_path="/tmp/trees/test1234",
            backend_port=9100,
            frontend_port=9200,
            branch_name="feat/issue-123-test1234",
        )

        # Record phases
        manager.record_phase_completion("plan", 30.0, True)
        manager.update(plan_file="/specs/test1234/plan.md")
        manager.save()

        manager.record_phase_completion("build", 90.0, True)
        manager.save()

        # Load fresh and validate
        loaded = StateManager.load(adw_id, base_path=temp_workspace)
        assert loaded.validate_prerequisites(["plan", "build"]) is True
        assert loaded.get_state().plan_file == "/specs/test1234/plan.md"
        assert len(loaded.get_state().all_adws) == 2
