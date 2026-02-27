"""
Tests for ADWS Document Phase Script.

Verifies:
- Prerequisite enforcement (plan, build, test, review phases required)
- Changelog generation
- Doc log creation
- README update logic
- Commit behavior in worktree
"""

from __future__ import annotations

import json
import subprocess
from datetime import UTC, datetime
from pathlib import Path
from unittest.mock import AsyncMock, MagicMock

import pytest

from adws.adw_modules.state import StateManager
from adws.adw_modules.trinity_protocol import TrinityPlan
from adws.scripts.adw_document_iso import (
    DocChange,
    DocLog,
    generate_changelog_entry,
    load_build_log,
    load_plan,
    save_doc_log,
    should_update_readme,
    update_changelog,
)


class TestDocChangeModel:
    """Tests for DocChange model."""

    def test_create_created_change(self) -> None:
        """Test creating a 'created' doc change record."""
        change = DocChange(
            file_path="CHANGELOG.md",
            action="created",
            description="Created changelog with initial entry",
        )
        assert change.file_path == "CHANGELOG.md"
        assert change.action == "created"
        assert change.tokens_used == 0

    def test_create_updated_change(self) -> None:
        """Test creating an 'updated' doc change record."""
        change = DocChange(
            file_path="README.md",
            action="updated",
            description="Updated API documentation",
            tokens_used=300,
            latency_ms=500.0,
        )
        assert change.action == "updated"
        assert change.tokens_used == 300


class TestDocLogModel:
    """Tests for DocLog model."""

    def test_create_minimal_log(self) -> None:
        """Test creating doc log with required fields only."""
        log = DocLog(adw_id="abc12345", issue_number=42)
        assert log.adw_id == "abc12345"
        assert log.issue_number == 42
        assert log.success is False
        assert log.changelog_entry == ""
        assert len(log.changes) == 0

    def test_create_complete_log(self) -> None:
        """Test creating doc log with all fields."""
        log = DocLog(
            adw_id="abc12345",
            issue_number=42,
            changelog_entry="### Added\n- New feature",
            changes=[
                DocChange(
                    file_path="CHANGELOG.md", action="updated", description="Added entry"
                ),
                DocChange(
                    file_path="README.md", action="unchanged", description="No update needed"
                ),
            ],
            total_tokens=500,
            commit_sha="abc123",
            success=True,
        )
        assert len(log.changes) == 2
        assert log.success is True

    def test_json_serialization(self) -> None:
        """Test that DocLog can be serialized to JSON."""
        log = DocLog(adw_id="abc12345", issue_number=42)
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

    def test_load_missing_plan_raises(self, temp_workspace: Path) -> None:
        """Test that loading missing plan raises FileNotFoundError."""
        with pytest.raises(FileNotFoundError, match="Plan not found"):
            load_plan("nonexistent", specs_base=temp_workspace / "specs")


class TestLoadBuildLog:
    """Tests for load_build_log function."""

    def test_load_valid_build_log(self, temp_workspace: Path) -> None:
        """Test loading a valid build log file."""
        adw_id = "abc12345"
        agents_dir = temp_workspace / "agents" / adw_id
        agents_dir.mkdir(parents=True)

        build_log_data = {
            "adw_id": "abc12345",
            "issue_number": 42,
            "files_created": [{"file_path": "src/new.py", "action": "created"}],
            "files_modified": [],
            "success": True,
        }
        (agents_dir / "build_log.json").write_text(json.dumps(build_log_data))

        data = load_build_log(adw_id, agents_base=temp_workspace / "agents")
        assert data["adw_id"] == "abc12345"
        assert len(data["files_created"]) == 1

    def test_load_missing_build_log_raises(self, temp_workspace: Path) -> None:
        """Test that loading missing build log raises FileNotFoundError."""
        with pytest.raises(FileNotFoundError, match="Build log not found"):
            load_build_log("nonexistent", agents_base=temp_workspace / "agents")


class TestSaveDocLog:
    """Tests for save_doc_log function."""

    def test_save_creates_file(self, temp_workspace: Path) -> None:
        """Test that save_doc_log creates the log file."""
        log = DocLog(adw_id="abc12345", issue_number=42, success=True)
        path = save_doc_log(log, agents_base=temp_workspace / "agents")

        assert path.exists()
        assert path.name == "doc_log.json"
        assert path.parent.name == "abc12345"

    def test_save_preserves_changes(self, temp_workspace: Path) -> None:
        """Test that save_doc_log preserves all changes."""
        log = DocLog(
            adw_id="abc12345",
            issue_number=42,
            changes=[
                DocChange(file_path="CHANGELOG.md", action="created", description="New"),
                DocChange(file_path="README.md", action="updated", description="Updated"),
            ],
        )
        path = save_doc_log(log, agents_base=temp_workspace / "agents")

        data = json.loads(path.read_text())
        assert len(data["changes"]) == 2


class TestUpdateChangelog:
    """Tests for update_changelog function."""

    def test_create_new_changelog(self, temp_workspace: Path) -> None:
        """Test creating a new CHANGELOG.md when none exists."""
        entry = "### Added\n- New feature for issue #42"
        action, description = update_changelog(
            worktree_path=temp_workspace,
            entry=entry,
            issue_number=42,
        )

        assert action == "created"
        assert (temp_workspace / "CHANGELOG.md").exists()

        content = (temp_workspace / "CHANGELOG.md").read_text()
        assert "New feature for issue #42" in content
        assert "Keep a Changelog" in content

    def test_update_existing_changelog(self, temp_workspace: Path) -> None:
        """Test updating an existing CHANGELOG.md."""
        # Create existing changelog
        existing = """# Changelog

## [Unreleased]

### Added
- Previous feature

## [1.0.0] - 2024-01-01

### Added
- Initial release
"""
        (temp_workspace / "CHANGELOG.md").write_text(existing)

        entry = "### Added\n- New feature for issue #42"
        action, description = update_changelog(
            worktree_path=temp_workspace,
            entry=entry,
            issue_number=42,
        )

        assert action == "updated"
        content = (temp_workspace / "CHANGELOG.md").read_text()
        assert "New feature for issue #42" in content
        assert "Previous feature" in content  # Preserved existing content


class TestGenerateChangelogEntry:
    """Tests for generate_changelog_entry function (mocked provider)."""

    @pytest.mark.asyncio
    async def test_generate_entry_for_new_files(self, sample_plan_data: dict) -> None:
        """Test generating changelog entry for new files."""
        mock_response = MagicMock()
        mock_response.content = "### Added\n- New module for data processing"
        mock_response.tokens_used = 50
        mock_response.latency_ms = 200.0

        mock_client = AsyncMock()
        mock_client.complete = AsyncMock(return_value=mock_response)

        sample_plan_data["created_at"] = datetime.now(UTC)
        plan = TrinityPlan(**sample_plan_data)

        build_log = {
            "files_created": [{"file_path": "src/processing.py"}],
            "files_modified": [],
        }

        entry, tokens, latency = await generate_changelog_entry(
            client=mock_client,
            plan=plan,
            build_log=build_log,
        )

        assert "Added" in entry
        assert tokens == 50


class TestShouldUpdateReadme:
    """Tests for should_update_readme function (mocked provider)."""

    @pytest.mark.asyncio
    async def test_no_update_for_minor_changes(self, sample_plan_data: dict) -> None:
        """Test that minor changes don't trigger README update."""
        mock_response = MagicMock()
        mock_response.content = '{"should_update": false, "reason": "Internal refactoring only"}'
        mock_response.tokens_used = 30
        mock_response.latency_ms = 100.0

        mock_client = AsyncMock()
        mock_client.complete = AsyncMock(return_value=mock_response)

        sample_plan_data["created_at"] = datetime.now(UTC)
        sample_plan_data["summary"] = "Internal cleanup"
        plan = TrinityPlan(**sample_plan_data)

        should_update, reason, _, _ = await should_update_readme(
            client=mock_client,
            plan=plan,
            readme_content="# Project\n\nExisting README content",
        )

        assert should_update is False
        assert "refactoring" in reason.lower()

    @pytest.mark.asyncio
    async def test_update_for_new_public_api(self, sample_plan_data: dict) -> None:
        """Test that new public API triggers README update."""
        mock_response = MagicMock()
        mock_response.content = '{"should_update": true, "reason": "New public API added"}'
        mock_response.tokens_used = 30
        mock_response.latency_ms = 100.0

        mock_client = AsyncMock()
        mock_client.complete = AsyncMock(return_value=mock_response)

        sample_plan_data["created_at"] = datetime.now(UTC)
        sample_plan_data["summary"] = "Add new public API endpoints"
        sample_plan_data["files_to_create"] = ["src/api/public.py"]
        plan = TrinityPlan(**sample_plan_data)

        should_update, reason, _, _ = await should_update_readme(
            client=mock_client,
            plan=plan,
            readme_content="# Project\n\nExisting README",
        )

        assert should_update is True


class TestPrerequisiteEnforcement:
    """Tests for document phase prerequisite enforcement."""

    def test_document_requires_all_prior_phases(
        self,
        temp_workspace: Path,
        sample_adw_id: str,
        sample_state_kwargs: dict,
    ) -> None:
        """Test that document phase fails if prior phases not complete."""
        manager = StateManager(sample_adw_id, base_path=temp_workspace)
        manager.initialize(**sample_state_kwargs)
        manager.record_phase_completion("plan", 30.0, True)
        manager.record_phase_completion("build", 120.0, True)
        manager.record_phase_completion("test", 60.0, True)
        manager.save()

        # Without review phase complete, prerequisites should fail
        assert manager.validate_prerequisites(["plan", "build", "test", "review"]) is False

    def test_document_succeeds_after_all_prerequisites(
        self,
        temp_workspace: Path,
        sample_adw_id: str,
        sample_state_kwargs: dict,
    ) -> None:
        """Test that document phase can proceed after all prerequisites complete."""
        manager = StateManager(sample_adw_id, base_path=temp_workspace)
        manager.initialize(**sample_state_kwargs)
        manager.record_phase_completion("plan", 30.0, True)
        manager.record_phase_completion("build", 120.0, True)
        manager.record_phase_completion("test", 60.0, True)
        manager.record_phase_completion("review", 45.0, True)
        manager.save()

        assert manager.validate_prerequisites(["plan", "build", "test", "review"]) is True


class TestDocLogPersistence:
    """Tests for doc log persistence and retrieval."""

    def test_doc_log_contains_changelog_entry(self, temp_workspace: Path) -> None:
        """Test that doc log includes the changelog entry."""
        log = DocLog(
            adw_id="abc12345",
            issue_number=42,
            changelog_entry="### Added\n- New feature",
            success=True,
        )

        path = save_doc_log(log, agents_base=temp_workspace / "agents")
        data = json.loads(path.read_text())

        assert "changelog_entry" in data
        assert "Added" in data["changelog_entry"]


class TestGitCommitInWorktree:
    """Tests for git commit behavior in worktree."""

    def test_git_commit_documentation_changes(self, temp_workspace: Path) -> None:
        """Test git commit of documentation changes."""
        # Initialize git repo
        subprocess.run(
            ["git", "init"], cwd=temp_workspace, check=True, capture_output=True
        )
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

        # Create a CHANGELOG.md
        changelog = temp_workspace / "CHANGELOG.md"
        changelog.write_text("# Changelog\n\n## [Unreleased]\n\n### Added\n- New feature")

        # Add and commit
        subprocess.run(
            ["git", "add", "CHANGELOG.md"],
            cwd=temp_workspace,
            check=True,
            capture_output=True,
        )
        result = subprocess.run(
            ["git", "commit", "-m", "docs: update changelog"],
            cwd=temp_workspace,
            capture_output=True,
            text=True,
        )

        assert result.returncode == 0

        # Verify commit exists
        log_result = subprocess.run(
            ["git", "log", "--oneline", "-1"],
            cwd=temp_workspace,
            capture_output=True,
            text=True,
        )
        assert "docs: update changelog" in log_result.stdout


class TestStateUpdates:
    """Tests for state updates after document phase."""

    def test_state_updated_on_document_success(
        self,
        temp_workspace: Path,
        sample_adw_id: str,
        sample_state_kwargs: dict,
    ) -> None:
        """Test that state reflects document phase success."""
        manager = StateManager(sample_adw_id, base_path=temp_workspace)
        manager.initialize(**sample_state_kwargs)
        manager.record_phase_completion("plan", 30.0, True)
        manager.record_phase_completion("build", 120.0, True)
        manager.record_phase_completion("test", 60.0, True)
        manager.record_phase_completion("review", 45.0, True)

        # Simulate document success
        manager.record_phase_completion("document", 30.0, True)
        manager.update(current_phase="documented")
        manager.save()

        # Reload and verify
        loaded = StateManager.load(sample_adw_id, base_path=temp_workspace)
        state = loaded.get_state()
        assert state.current_phase == "documented"
        assert loaded.validate_prerequisites(
            ["plan", "build", "test", "review", "document"]
        )
