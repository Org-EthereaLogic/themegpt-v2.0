"""
ADWS State Management Module

Provides persistent state management for workflow instances. State is stored
in JSON files at agents/{adw_id}/adw_state.json and supports atomic writes
to prevent corruption on crashes.

Features:
- Atomic writes (temp file + rename) prevent partial writes
- File locking (fcntl.flock) prevents concurrent access corruption
- Snapshot/rollback for safe recovery from failed phases
"""

from __future__ import annotations

import fcntl
import json
import os
import shutil
import tempfile
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

from pydantic import BaseModel, Field


class ADWPhaseRecord(BaseModel):
    """Record of a completed workflow phase."""

    phase: str
    completed_at: datetime
    duration_seconds: float
    success: bool
    error_message: str | None = None

class ADWState(BaseModel):
    """
    Persistent workflow state stored in agents/{adw_id}/adw_state.json

    All fields are required except where Optional is specified.
    """

    adw_id: str = Field(..., description="Unique workflow identifier (8-char hex)")
    issue_number: int = Field(..., description="GitHub issue being resolved")
    worktree_path: str = Field(..., description="Path to git worktree")
    backend_port: int = Field(
        ..., ge=9100, le=9114, description="Allocated backend port"
    )
    frontend_port: int = Field(
        ..., ge=9200, le=9214, description="Allocated frontend port"
    )
    branch_name: str = Field(..., description="Git branch name")
    plan_file: str | None = Field(None, description="Path to plan.md")
    plan_json: str | None = Field(None, description="Path to plan.json")
    repo_url: str | None = Field(None, description="Source repository URL")
    trinity_architect_model: str | None = Field(
        None, description="Claude model used for Architect role (immutable per workflow)"
    )
    trinity_critic_model: str | None = Field(
        None, description="GPT model used for Critic role (immutable per workflow)"
    )
    trinity_advocate_model: str | None = Field(
        None, description="Gemini model used for Advocate role (immutable per workflow)"
    )
    test_results: dict[str, object] | None = Field(
        None, description="Latest test run results (phase, pass/fail counts, output)"
    )
    test_coverage: float | None = Field(
        None, ge=0.0, le=100.0, description="Test coverage percentage"
    )
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(UTC),
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(UTC),
    )
    current_phase: str = Field(default="initialized")
    all_adws: list[ADWPhaseRecord] = Field(default_factory=list)

class StateManager:
    """
    Manages persistent state for a workflow instance.

    Usage:
        manager = StateManager(adw_id="abc12345")
        manager.initialize(issue_number=42, worktree_path="trees/abc12345", ...)
        manager.save()

        # Later...
        manager = StateManager.load(adw_id="abc12345")
        manager.record_phase_completion("plan", duration=45.2, success=True)
        manager.save()
    """

    def __init__(self, adw_id: str, base_path: Path | None = None) -> None:
        """
        Initialize StateManager for a specific workflow.

        Args:
            adw_id: Unique 8-character hex workflow identifier
            base_path: Base directory for state files (defaults to 'agents')
        """
        self.adw_id = adw_id
        self.base_path = base_path if base_path is not None else Path("agents")
        self.state_dir = self.base_path / adw_id
        self.state_file = self.state_dir / "adw_state.json"
        self.state: ADWState | None = None

    def initialize(
        self,
        issue_number: int,
        worktree_path: str,
        backend_port: int,
        frontend_port: int,
        branch_name: str,
        repo_url: str | None = None,
        plan_file: str | None = None,
        plan_json: str | None = None,
        trinity_architect_model: str | None = None,
        trinity_critic_model: str | None = None,
        trinity_advocate_model: str | None = None,
    ) -> ADWState:
        """
        Create new state. Raises FileExistsError if state already exists.

        Args:
            issue_number: GitHub issue number
            worktree_path: Path to the git worktree
            backend_port: Allocated backend port (9100-9114)
            frontend_port: Allocated frontend port (9200-9214)
            branch_name: Git branch name
            repo_url: Optional repository URL
            plan_file: Optional path to plan.md
            plan_json: Optional path to plan.json
            trinity_architect_model: Claude model version snapshot
            trinity_critic_model: GPT model version snapshot
            trinity_advocate_model: Gemini model version snapshot

        Returns:
            Initialized ADWState instance

        Raises:
            FileExistsError: If state file already exists
        """
        if self.state_file.exists():
            raise FileExistsError(
                f"State already exists at {self.state_file}. "
                "Use StateManager.load() to load existing state."
            )

        self.state = ADWState(
            adw_id=self.adw_id,
            issue_number=issue_number,
            worktree_path=worktree_path,
            backend_port=backend_port,
            frontend_port=frontend_port,
            branch_name=branch_name,
            repo_url=repo_url,
            plan_file=plan_file,
            plan_json=plan_json,
            trinity_architect_model=trinity_architect_model,
            trinity_critic_model=trinity_critic_model,
            trinity_advocate_model=trinity_advocate_model,
        )

        self.save()
        return self.state

    @classmethod
    def load(
        cls, adw_id: str, base_path: Path | None = None
    ) -> StateManager:
        """
        Load existing state from disk.

        Args:
            adw_id: Workflow identifier
            base_path: Base directory for state files

        Returns:
            StateManager instance with loaded state

        Raises:
            FileNotFoundError: If state file does not exist
            ValueError: If state file contains invalid JSON or schema
        """
        manager = cls(adw_id, base_path)

        if not manager.state_file.exists():
            raise FileNotFoundError(
                f"State file not found at {manager.state_file}. "
                "Use StateManager.initialize() to create new state."
            )

        with open(manager.state_file, encoding="utf-8") as f:
            data = json.load(f)

        # Parse datetime strings back to datetime objects
        if "created_at" in data and isinstance(data["created_at"], str):
            data["created_at"] = datetime.fromisoformat(data["created_at"])
        if "updated_at" in data and isinstance(data["updated_at"], str):
            data["updated_at"] = datetime.fromisoformat(data["updated_at"])

        # Parse phase records
        if "all_adws" in data:
            for record in data["all_adws"]:
                if "completed_at" in record and isinstance(
                    record["completed_at"], str
                ):
                    record["completed_at"] = datetime.fromisoformat(
                        record["completed_at"]
                    )

        manager.state = ADWState(**data)
        return manager

    def save(self) -> None:
        """
        Persist current state to disk atomically with file locking.

        Uses write-to-temp-then-rename strategy to prevent partial writes
        on crashes. The rename operation is atomic on POSIX systems.
        An exclusive file lock (fcntl.flock) prevents concurrent access
        from multiple workflow processes writing simultaneously.

        Raises:
            ValueError: If state has not been initialized
        """
        if self.state is None:
            raise ValueError(
                "State not initialized. Call initialize() first or use load()."
            )

        # Update the updated_at timestamp
        self.state.updated_at = datetime.now(UTC)

        # Ensure state directory exists
        self.state_dir.mkdir(parents=True, exist_ok=True)

        # Serialize state to JSON
        state_json = self.state.model_dump_json(indent=2)

        # Acquire exclusive file lock before writing
        lock_path = self.state_dir / ".adw_state.lock"
        lock_fd = os.open(str(lock_path), os.O_CREAT | os.O_RDWR)
        try:
            fcntl.flock(lock_fd, fcntl.LOCK_EX)

            # Atomic write: write to temp file, then rename
            fd, temp_path = tempfile.mkstemp(
                dir=self.state_dir, prefix=".adw_state_", suffix=".tmp"
            )
            try:
                with os.fdopen(fd, "w", encoding="utf-8") as f:
                    f.write(state_json)
                # Atomic rename (on POSIX systems)
                shutil.move(temp_path, self.state_file)
            except Exception:
                # Clean up temp file on failure
                if os.path.exists(temp_path):
                    os.unlink(temp_path)
                raise
        finally:
            # Release lock and close file descriptor
            fcntl.flock(lock_fd, fcntl.LOCK_UN)
            os.close(lock_fd)

    def record_phase_completion(
        self,
        phase: str,
        duration: float,
        success: bool,
        error_message: str | None = None,
    ) -> None:
        """
        Record completion of a workflow phase.

        Args:
            phase: Name of the completed phase (e.g., "plan", "build", "test")
            duration: Duration in seconds
            success: Whether the phase completed successfully
            error_message: Optional error message if success is False

        Raises:
            ValueError: If state has not been initialized
        """
        if self.state is None:
            raise ValueError(
                "State not initialized. Call initialize() first or use load()."
            )

        record = ADWPhaseRecord(
            phase=phase,
            completed_at=datetime.now(UTC),
            duration_seconds=duration,
            success=success,
            error_message=error_message,
        )

        self.state.all_adws.append(record)
        self.state.current_phase = phase if success else f"{phase}_failed"

    def validate_prerequisites(self, required_phases: list[str]) -> bool:
        """
        Check that all required phases have completed successfully.

        Args:
            required_phases: List of phase names that must have succeeded

        Returns:
            True if all required phases have succeeded, False otherwise

        Raises:
            ValueError: If state has not been initialized
        """
        if self.state is None:
            raise ValueError(
                "State not initialized. Call initialize() first or use load()."
            )

        completed_phases: set[str] = {
            record.phase
            for record in self.state.all_adws
            if record.success
        }

        return all(phase in completed_phases for phase in required_phases)

    def get_state(self) -> ADWState:
        """
        Get the current state object.

        Returns:
            Current ADWState instance

        Raises:
            ValueError: If state has not been initialized
        """
        if self.state is None:
            raise ValueError(
                "State not initialized. Call initialize() first or use load()."
            )
        return self.state

    def update(self, **kwargs: Any) -> None:
        """
        Update state fields.

        Args:
            **kwargs: Fields to update on the state object

        Raises:
            ValueError: If state has not been initialized
            AttributeError: If an invalid field name is provided
        """
        if self.state is None:
            raise ValueError(
                "State not initialized. Call initialize() first or use load()."
            )

        for key, value in kwargs.items():
            if not hasattr(self.state, key):
                raise AttributeError(f"ADWState has no field '{key}'")
            setattr(self.state, key, value)

    def create_snapshot(self, label: str | None = None) -> Path:
        """
        Save a snapshot of the current state for rollback.

        Snapshots are stored in agents/{adw_id}/.snapshots/ with a timestamp-
        based filename. An optional label is embedded in the filename for
        human readability.

        Args:
            label: Optional label for the snapshot (e.g., "before_build").
                   Sanitized to alphanumerics, hyphens, and underscores.

        Returns:
            Path to the created snapshot file

        Raises:
            ValueError: If state has not been initialized
        """
        if self.state is None:
            raise ValueError(
                "State not initialized. Call initialize() first or use load()."
            )

        snapshot_dir = self.state_dir / ".snapshots"
        snapshot_dir.mkdir(parents=True, exist_ok=True)

        timestamp = datetime.now(UTC).strftime("%Y%m%dT%H%M%S")
        if label:
            # Sanitize label to safe filename characters
            safe_label = "".join(
                c if c.isalnum() or c in "-_" else "_" for c in label
            )
            filename = f"snapshot_{timestamp}_{safe_label}.json"
        else:
            filename = f"snapshot_{timestamp}.json"

        snapshot_path = snapshot_dir / filename

        state_json = self.state.model_dump_json(indent=2)

        fd, temp_path = tempfile.mkstemp(
            dir=snapshot_dir, prefix=".snap_", suffix=".tmp"
        )
        try:
            with os.fdopen(fd, "w", encoding="utf-8") as f:
                f.write(state_json)
            shutil.move(temp_path, snapshot_path)
        except Exception:
            if os.path.exists(temp_path):
                os.unlink(temp_path)
            raise

        return snapshot_path

    def list_snapshots(self) -> list[Path]:
        """
        List all available snapshots for this workflow, newest first.

        Returns:
            List of snapshot file paths sorted by modification time (newest first)
        """
        snapshot_dir = self.state_dir / ".snapshots"
        if not snapshot_dir.exists():
            return []

        snapshots = sorted(
            snapshot_dir.glob("snapshot_*.json"),
            key=lambda p: p.stat().st_mtime,
            reverse=True,
        )
        return snapshots

    def rollback_to_snapshot(self, snapshot_path: Path) -> ADWState:
        """
        Restore state from a specific snapshot file.

        The current state is replaced with the snapshot contents. A backup
        snapshot of the current state is created before rollback for safety.

        Args:
            snapshot_path: Path to the snapshot file to restore

        Returns:
            The restored ADWState

        Raises:
            FileNotFoundError: If snapshot file does not exist
            ValueError: If snapshot contains invalid data
        """
        if not snapshot_path.exists():
            raise FileNotFoundError(f"Snapshot not found: {snapshot_path}")

        # Create safety backup of current state before rollback
        if self.state is not None:
            self.create_snapshot(label="pre_rollback")

        with open(snapshot_path, encoding="utf-8") as f:
            data = json.load(f)

        # Parse datetime strings
        if "created_at" in data and isinstance(data["created_at"], str):
            data["created_at"] = datetime.fromisoformat(data["created_at"])
        if "updated_at" in data and isinstance(data["updated_at"], str):
            data["updated_at"] = datetime.fromisoformat(data["updated_at"])
        if "all_adws" in data:
            for record in data["all_adws"]:
                if "completed_at" in record and isinstance(
                    record["completed_at"], str
                ):
                    record["completed_at"] = datetime.fromisoformat(
                        record["completed_at"]
                    )

        self.state = ADWState(**data)
        self.save()
        return self.state

    def rollback_to_phase(self, phase: str) -> ADWState:
        """
        Rollback to the state as it was after a specific phase completed.

        Searches snapshots for the most recent one where the given phase
        was the last successfully completed phase. Falls back to trimming
        the phase history if no matching snapshot is found.

        Args:
            phase: Phase name to rollback to (e.g., "plan", "build")

        Returns:
            The restored ADWState

        Raises:
            ValueError: If state is not initialized or no matching snapshot found
        """
        if self.state is None:
            raise ValueError(
                "State not initialized. Call initialize() first or use load()."
            )

        # Try to find a snapshot that has the target phase as current
        for snapshot_path in self.list_snapshots():
            try:
                with open(snapshot_path, encoding="utf-8") as f:
                    snap_data = json.load(f)
                if snap_data.get("current_phase") == phase:
                    return self.rollback_to_snapshot(snapshot_path)
            except (json.JSONDecodeError, OSError):
                continue

        # No snapshot found — trim phase history to the target phase
        # Create a safety snapshot first
        self.create_snapshot(label=f"pre_rollback_to_{phase}")

        trimmed_records: list[ADWPhaseRecord] = []
        found = False
        for record in self.state.all_adws:
            trimmed_records.append(record)
            if record.phase == phase and record.success:
                found = True
                break

        if not found:
            raise ValueError(
                f"Phase '{phase}' was never successfully completed. "
                f"Cannot rollback to it."
            )

        self.state.all_adws = trimmed_records
        self.state.current_phase = phase
        self.save()
        return self.state
