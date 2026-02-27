"""
Tests for ADWS Build Phase Script.

Verifies:
- Prerequisite enforcement (plan phase must complete first)
- Missing plan handling
- Build log creation
- State update on success
- File generation workflow
"""

from __future__ import annotations

import json
from datetime import UTC, datetime
from pathlib import Path
from unittest.mock import AsyncMock, MagicMock

import pytest

from adws.adw_modules.state import StateManager
from adws.adw_modules.trinity_protocol import TrinityPlan
from adws.scripts.adw_build_iso import (
    BuildLog,
    FileChange,
    generate_file_content,
    git_add_commit,
    load_plan,
    save_build_log,
)


class TestFileChangeModel:
    """Tests for FileChange model."""

    def test_create_successful_change(self) -> None:
        """Test creating a successful file change record."""
        change = FileChange(
            file_path="src/module.py",
            action="created",
            tokens_used=500,
            latency_ms=1234.5,
        )
        assert change.file_path == "src/module.py"
        assert change.action == "created"
        assert change.success is True
        assert change.error_message is None

    def test_create_failed_change(self) -> None:
        """Test creating a failed file change record."""
        change = FileChange(
            file_path="src/broken.py",
            action="modified",
            tokens_used=0,
            latency_ms=0,
            success=False,
            error_message="API error",
        )
        assert change.success is False
        assert change.error_message == "API error"


class TestBuildLogModel:
    """Tests for BuildLog model."""

    def test_create_minimal_log(self) -> None:
        """Test creating build log with required fields only."""
        log = BuildLog(adw_id="abc12345", issue_number=42)
        assert log.adw_id == "abc12345"
        assert log.issue_number == 42
        assert log.success is False
        assert log.commit_sha is None
        assert len(log.files_created) == 0
        assert len(log.files_modified) == 0

    def test_create_complete_log(self) -> None:
        """Test creating build log with all fields."""
        log = BuildLog(
            adw_id="abc12345",
            issue_number=42,
            duration_seconds=120.5,
            files_created=[
                FileChange(
                    file_path="src/new.py",
                    action="created",
                    tokens_used=200,
                    latency_ms=500,
                )
            ],
            total_tokens=200,
            commit_sha="abc123",
            success=True,
        )
        assert len(log.files_created) == 1
        assert log.total_tokens == 200
        assert log.success is True

    def test_json_serialization(self) -> None:
        """Test that BuildLog can be serialized to JSON."""
        log = BuildLog(adw_id="abc12345", issue_number=42)
        json_str = log.model_dump_json()
        data = json.loads(json_str)
        assert data["adw_id"] == "abc12345"
        assert "started_at" in data


class TestLoadPlan:
    """Tests for load_plan function."""

    def test_load_valid_plan(
        self,
        temp_workspace: Path,
        sample_adw_id: str,
        sample_plan_data: dict,
    ) -> None:
        """Test loading a valid plan file."""
        specs_dir = temp_workspace / "specs" / sample_adw_id
        specs_dir.mkdir(parents=True)

        (specs_dir / "plan.json").write_text(json.dumps(sample_plan_data))

        plan = load_plan(sample_adw_id, specs_base=temp_workspace / "specs")
        assert plan.issue_number == 42
        assert plan.issue_title == "Test issue"
        assert "src/new.py" in plan.files_to_create

    def test_load_missing_plan_raises(self, temp_workspace: Path) -> None:
        """Test that loading missing plan raises FileNotFoundError."""
        with pytest.raises(FileNotFoundError, match="Plan not found"):
            load_plan("nonexistent", specs_base=temp_workspace / "specs")


class TestSaveBuildLog:
    """Tests for save_build_log function."""

    def test_save_creates_file(self, temp_workspace: Path) -> None:
        """Test that save_build_log creates the log file."""
        log = BuildLog(adw_id="abc12345", issue_number=42, success=True)
        path = save_build_log(log, agents_base=temp_workspace / "agents")

        assert path.exists()
        assert path.name == "build_log.json"
        assert path.parent.name == "abc12345"

        # Verify content
        data = json.loads(path.read_text())
        assert data["adw_id"] == "abc12345"
        assert data["success"] is True

    def test_save_creates_directory_if_missing(self, temp_workspace: Path) -> None:
        """Test that save_build_log creates parent directories."""
        log = BuildLog(adw_id="newid123", issue_number=99)
        path = save_build_log(log, agents_base=temp_workspace / "agents")
        assert path.exists()
        assert (temp_workspace / "agents" / "newid123").is_dir()


class TestGenerateFileContent:
    """Tests for generate_file_content function (mocked provider)."""

    @pytest.mark.asyncio
    async def test_generate_new_file_content(self, sample_plan_data: dict) -> None:
        """Test generating content for a new file."""
        mock_response = MagicMock()
        mock_response.content = "# New module\nclass NewClass:\n    pass"
        mock_response.tokens_used = 50
        mock_response.latency_ms = 200.0

        mock_client = AsyncMock()
        mock_client.complete = AsyncMock(return_value=mock_response)

        sample_plan_data["created_at"] = datetime.now(UTC)
        plan = TrinityPlan(**sample_plan_data)

        content, tokens, latency = await generate_file_content(
            client=mock_client,
            file_path="src/new.py",
            plan=plan,
            existing_content=None,
        )

        assert "class NewClass" in content
        assert tokens == 50
        assert latency == 200.0

    @pytest.mark.asyncio
    async def test_generate_modified_file_content(self, sample_plan_data: dict) -> None:
        """Test generating content for modifying an existing file."""
        mock_response = MagicMock()
        mock_response.content = "# Updated module\nclass UpdatedClass:\n    pass"
        mock_response.tokens_used = 75
        mock_response.latency_ms = 250.0

        mock_client = AsyncMock()
        mock_client.complete = AsyncMock(return_value=mock_response)

        sample_plan_data["created_at"] = datetime.now(UTC)
        plan = TrinityPlan(**sample_plan_data)

        content, tokens, latency = await generate_file_content(
            client=mock_client,
            file_path="src/existing.py",
            plan=plan,
            existing_content="# Old module\nclass OldClass:\n    pass",
        )

        assert "UpdatedClass" in content
        assert tokens == 75

    @pytest.mark.asyncio
    async def test_strips_code_fences_from_response(
        self, sample_plan_data: dict
    ) -> None:
        """Test that markdown code fences are stripped from response."""
        mock_response = MagicMock()
        mock_response.content = "```python\nclass Module:\n    pass\n```"
        mock_response.tokens_used = 30
        mock_response.latency_ms = 100.0

        mock_client = AsyncMock()
        mock_client.complete = AsyncMock(return_value=mock_response)

        sample_plan_data["created_at"] = datetime.now(UTC)
        plan = TrinityPlan(**sample_plan_data)

        content, _, _ = await generate_file_content(
            client=mock_client,
            file_path="src/test.py",
            plan=plan,
        )

        assert not content.startswith("```")
        assert not content.endswith("```")
        assert "class Module" in content


class TestGitAddCommit:
    """Tests for git_add_commit function."""

    def test_git_commit_in_worktree(self, temp_workspace: Path) -> None:
        """Test git add and commit in a worktree (requires git init)."""
        import subprocess

        # Initialize git repo
        subprocess.run(["git", "init"], cwd=temp_workspace, check=True, capture_output=True)
        subprocess.run(
            ["git", "config", "user.email", "test@example.com"],
            cwd=temp_workspace,
            check=True,
            capture_output=True,
        )
        subprocess.run(
            ["git", "config", "user.name", "Test"],
            cwd=temp_workspace,
            check=True,
            capture_output=True,
        )

        # Create a file to commit
        (temp_workspace / "test.txt").write_text("test content")

        sha = git_add_commit(temp_workspace, "test commit")
        assert sha is not None
        assert len(sha) >= 7  # Short SHA is at least 7 chars


class TestPrerequisiteEnforcement:
    """Tests for build phase prerequisite enforcement."""

    def test_build_requires_plan_phase(
        self,
        temp_workspace: Path,
        sample_adw_id: str,
        sample_state_kwargs: dict,
    ) -> None:
        """Test that build phase fails if plan phase not complete."""
        manager = StateManager(sample_adw_id, base_path=temp_workspace)
        manager.initialize(**sample_state_kwargs)
        manager.save()

        # Without plan phase complete, prerequisites should fail
        assert manager.validate_prerequisites(["plan"]) is False

    def test_build_succeeds_after_plan_phase(
        self,
        temp_workspace: Path,
        sample_adw_id: str,
        sample_state_kwargs: dict,
    ) -> None:
        """Test that build phase can proceed after plan phase completes."""
        manager = StateManager(sample_adw_id, base_path=temp_workspace)
        manager.initialize(**sample_state_kwargs)
        manager.record_phase_completion("plan", 30.0, True)
        manager.save()

        # With plan phase complete, prerequisites should pass
        assert manager.validate_prerequisites(["plan"]) is True


class TestBuildLogPersistence:
    """Tests for build log persistence and retrieval."""

    def test_build_log_contains_all_changes(self, temp_workspace: Path) -> None:
        """Test that build log includes all file changes."""
        log = BuildLog(
            adw_id="abc12345",
            issue_number=42,
            files_created=[
                FileChange(
                    file_path="src/a.py", action="created", tokens_used=100, latency_ms=200
                ),
                FileChange(
                    file_path="src/b.py", action="created", tokens_used=150, latency_ms=300
                ),
            ],
            files_modified=[
                FileChange(
                    file_path="src/c.py", action="modified", tokens_used=200, latency_ms=400
                ),
            ],
            total_tokens=450,
            success=True,
        )

        path = save_build_log(log, agents_base=temp_workspace / "agents")
        data = json.loads(path.read_text())

        assert len(data["files_created"]) == 2
        assert len(data["files_modified"]) == 1
        assert data["total_tokens"] == 450


class TestStateUpdateOnSuccess:
    """Tests for state updates after successful build."""

    def test_state_updated_on_build_completion(
        self,
        temp_workspace: Path,
        sample_adw_id: str,
        sample_state_kwargs: dict,
    ) -> None:
        """Test that state is updated when build completes successfully."""
        manager = StateManager(sample_adw_id, base_path=temp_workspace)
        manager.initialize(**sample_state_kwargs)
        manager.record_phase_completion("plan", 30.0, True)

        # Simulate build completion
        manager.record_phase_completion("build", 120.0, True)
        manager.update(current_phase="built")
        manager.save()

        # Reload and verify
        loaded = StateManager.load(sample_adw_id, base_path=temp_workspace)
        state = loaded.get_state()
        assert state.current_phase == "built"
        assert loaded.validate_prerequisites(["plan", "build"]) is True

    def test_state_reflects_build_failure(
        self,
        temp_workspace: Path,
        sample_adw_id: str,
        sample_state_kwargs: dict,
    ) -> None:
        """Test that state reflects build failure correctly."""
        manager = StateManager(sample_adw_id, base_path=temp_workspace)
        manager.initialize(**sample_state_kwargs)
        manager.record_phase_completion("plan", 30.0, True)

        # Simulate build failure
        manager.record_phase_completion(
            "build", 60.0, False, error_message="Generation failed"
        )
        manager.save()

        # Reload and verify
        loaded = StateManager.load(sample_adw_id, base_path=temp_workspace)
        state = loaded.get_state()
        assert state.current_phase == "build_failed"
        assert loaded.validate_prerequisites(["build"]) is False
