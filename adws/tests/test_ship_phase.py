"""
Ship Phase Tests

Covers:
- ShipLog and PullRequestInfo models
- GitHub API interactions (mocked)
- Repository info extraction
- Worktree cleanup
- State archiving
- PR body generation
"""

from datetime import UTC, datetime
from unittest.mock import AsyncMock, MagicMock

import pytest

from adws.scripts.adw_ship_iso import (
    PullRequestInfo,
    ShipLog,
    archive_state,
    cleanup_worktree,
    create_pull_request,
    generate_pr_body,
    get_repo_info,
    load_build_log,
    load_plan_summary,
    load_review_summary,
    load_test_report,
    push_branch,
    save_ship_log,
)


class TestShipLogModel:
    """Tests for ShipLog model."""

    def test_create_minimal_ship_log(self):
        log = ShipLog(
            adw_id="test1234",
            issue_number=42,
            branch_name="feat/issue-42-test1234",
        )
        assert log.adw_id == "test1234"
        assert log.issue_number == 42
        assert log.branch_name == "feat/issue-42-test1234"
        assert log.auto_merge_requested is False
        assert log.worktree_removed is False
        assert log.state_archived is False
        assert log.pull_request is None
        assert log.error_message is None

    def test_ship_log_with_auto_merge(self):
        log = ShipLog(
            adw_id="test1234",
            issue_number=42,
            branch_name="feat/issue-42-test1234",
            auto_merge_requested=True,
            auto_merge_succeeded=True,
        )
        assert log.auto_merge_requested is True
        assert log.auto_merge_succeeded is True

    def test_ship_log_serialization(self):
        log = ShipLog(
            adw_id="test1234",
            issue_number=42,
            branch_name="feat/issue-42-test1234",
            duration_seconds=5.5,
        )
        json_str = log.model_dump_json()
        assert "test1234" in json_str
        assert "42" in json_str


class TestPullRequestInfoModel:
    """Tests for PullRequestInfo model."""

    def test_create_pr_info(self):
        now = datetime.now(UTC)
        pr_info = PullRequestInfo(
            number=123,
            url="https://api.github.com/repos/owner/repo/pulls/123",
            html_url="https://github.com/owner/repo/pull/123",
            state="open",
            title="feat: Implement issue #42",
            head_branch="feat/issue-42-test1234",
            base_branch="main",
            created_at=now,
        )
        assert pr_info.number == 123
        assert pr_info.state == "open"
        assert pr_info.merged is False
        assert pr_info.merged_at is None

    def test_pr_info_merged(self):
        now = datetime.now(UTC)
        pr_info = PullRequestInfo(
            number=123,
            url="https://api.github.com/repos/owner/repo/pulls/123",
            html_url="https://github.com/owner/repo/pull/123",
            state="closed",
            title="feat: Implement issue #42",
            head_branch="feat/issue-42-test1234",
            base_branch="main",
            created_at=now,
            merged=True,
            merged_at=now,
        )
        assert pr_info.merged is True
        assert pr_info.merged_at == now


class TestShipLogWithPR:
    """Tests for ShipLog with attached PullRequestInfo."""

    def test_ship_log_with_pr(self):
        now = datetime.now(UTC)
        pr_info = PullRequestInfo(
            number=123,
            url="https://api.github.com/repos/owner/repo/pulls/123",
            html_url="https://github.com/owner/repo/pull/123",
            state="open",
            title="feat: Implement issue #42",
            head_branch="feat/issue-42-test1234",
            base_branch="main",
            created_at=now,
        )
        log = ShipLog(
            adw_id="test1234",
            issue_number=42,
            branch_name="feat/issue-42-test1234",
            pull_request=pr_info,
        )
        assert log.pull_request is not None
        assert log.pull_request.number == 123
        assert log.pull_request.html_url == "https://github.com/owner/repo/pull/123"


class TestGetRepoInfo:
    """Tests for get_repo_info function."""

    @pytest.mark.asyncio
    async def test_get_repo_info_https(self, monkeypatch):
        def mock_run(*args, **kwargs):
            result = MagicMock()
            result.stdout = "https://github.com/owner/repo.git\n"
            result.returncode = 0
            return result
        monkeypatch.setattr("subprocess.run", mock_run)
        owner, repo = await get_repo_info("fake-token")
        assert owner == "owner"
        assert repo == "repo"

    @pytest.mark.asyncio
    async def test_get_repo_info_https_no_git_suffix(self, monkeypatch):
        def mock_run(*args, **kwargs):
            result = MagicMock()
            result.stdout = "https://github.com/owner/repo\n"
            result.returncode = 0
            return result
        monkeypatch.setattr("subprocess.run", mock_run)
        owner, repo = await get_repo_info("fake-token")
        assert owner == "owner"
        assert repo == "repo"

    @pytest.mark.asyncio
    async def test_get_repo_info_ssh(self, monkeypatch):
        def mock_run(*args, **kwargs):
            result = MagicMock()
            result.stdout = "git@github.com:owner/repo.git\n"
            result.returncode = 0
            return result
        monkeypatch.setattr("subprocess.run", mock_run)
        owner, repo = await get_repo_info("fake-token")
        assert owner == "owner"
        assert repo == "repo"

    @pytest.mark.asyncio
    async def test_get_repo_info_ssh_no_git_suffix(self, monkeypatch):
        def mock_run(*args, **kwargs):
            result = MagicMock()
            result.stdout = "git@github.com:owner/repo\n"
            result.returncode = 0
            return result
        monkeypatch.setattr("subprocess.run", mock_run)
        owner, repo = await get_repo_info("fake-token")
        assert owner == "owner"
        assert repo == "repo"

    @pytest.mark.asyncio
    async def test_get_repo_info_failure(self, monkeypatch):
        def mock_run(*args, **kwargs):
            result = MagicMock()
            result.stdout = ""
            result.stderr = "fatal: not a git repository"
            result.returncode = 128
            return result
        monkeypatch.setattr("subprocess.run", mock_run)
        with pytest.raises(ValueError, match="Failed to get git remote"):
            await get_repo_info("fake-token")

    @pytest.mark.asyncio
    async def test_get_repo_info_invalid_url(self, monkeypatch):
        def mock_run(*args, **kwargs):
            result = MagicMock()
            result.stdout = "https://gitlab.com/owner/repo.git\n"
            result.returncode = 0
            return result
        monkeypatch.setattr("subprocess.run", mock_run)
        with pytest.raises(ValueError, match="Could not parse remote URL"):
            await get_repo_info("fake-token")


class TestPushBranch:
    """Tests for push_branch function."""

    @pytest.mark.asyncio
    async def test_push_branch_success(self, monkeypatch, temp_workspace):
        def mock_run(*args, **kwargs):
            result = MagicMock()
            result.stdout = "Everything up-to-date"
            result.stderr = ""
            result.returncode = 0
            return result
        monkeypatch.setattr("subprocess.run", mock_run)
        worktree_path = temp_workspace / "trees" / "test1234"
        worktree_path.mkdir(parents=True)

        result = await push_branch(worktree_path, "feat/test-branch")
        assert result is True

    @pytest.mark.asyncio
    async def test_push_branch_failure(self, monkeypatch, temp_workspace):
        def mock_run(*args, **kwargs):
            result = MagicMock()
            result.stdout = ""
            result.stderr = "error: failed to push some refs"
            result.returncode = 1
            return result
        monkeypatch.setattr("subprocess.run", mock_run)
        worktree_path = temp_workspace / "trees" / "test1234"
        worktree_path.mkdir(parents=True)

        result = await push_branch(worktree_path, "feat/test-branch")
        assert result is False


class TestCreatePullRequest:
    """Tests for create_pull_request function."""

    @pytest.mark.asyncio
    async def test_create_pull_request_success(self, monkeypatch):
        mock_response = MagicMock()
        mock_response.status_code = 201
        mock_response.json.return_value = {
            "number": 123,
            "url": "https://api.github.com/repos/owner/repo/pulls/123",
            "html_url": "https://github.com/owner/repo/pull/123",
            "state": "open",
            "title": "Test PR",
            "head": {"ref": "feature-branch"},
            "base": {"ref": "main"},
            "created_at": "2025-12-24T00:00:00Z",
        }
        mock_response.raise_for_status = MagicMock()

        mock_client = AsyncMock()
        mock_client.post = AsyncMock(return_value=mock_response)
        mock_client.__aenter__ = AsyncMock(return_value=mock_client)
        mock_client.__aexit__ = AsyncMock(return_value=None)

        monkeypatch.setattr("httpx.AsyncClient", lambda: mock_client)

        pr_info = await create_pull_request(
            github_token="fake-token",
            owner="owner",
            repo="repo",
            title="Test PR",
            body="Test body",
            head_branch="feature-branch",
        )

        assert pr_info.number == 123
        assert pr_info.html_url == "https://github.com/owner/repo/pull/123"
        assert pr_info.state == "open"

    @pytest.mark.asyncio
    async def test_create_pull_request_already_exists(self, monkeypatch):
        mock_response = MagicMock()
        mock_response.status_code = 422
        mock_response.json.return_value = {
            "message": "Validation Failed",
            "errors": [
                {"message": "A pull request already exists for owner:feature-branch"}
            ],
        }

        mock_client = AsyncMock()
        mock_client.post = AsyncMock(return_value=mock_response)
        mock_client.__aenter__ = AsyncMock(return_value=mock_client)
        mock_client.__aexit__ = AsyncMock(return_value=None)

        monkeypatch.setattr("httpx.AsyncClient", lambda: mock_client)

        with pytest.raises(ValueError, match="already exists"):
            await create_pull_request(
                github_token="fake-token",
                owner="owner",
                repo="repo",
                title="Test PR",
                body="Test body",
                head_branch="feature-branch",
            )


class TestArchiveState:
    """Tests for archive_state function."""

    def test_archive_state_creates_directory(self, temp_workspace):
        agents_base = temp_workspace / "agents"
        state_dir = agents_base / "test1234"
        state_dir.mkdir(parents=True)

        # Create some artifact files
        (state_dir / "build_log.json").write_text("{}")
        (state_dir / "test_report.json").write_text("{}")

        archive_path = archive_state("test1234", agents_base=agents_base)

        assert archive_path.exists()
        assert (archive_path / "build_log.json").exists()
        assert (archive_path / "test_report.json").exists()

    def test_archive_state_nonexistent_dir(self, temp_workspace):
        agents_base = temp_workspace / "agents"

        # Should create directory structure
        archive_path = archive_state("test1234", agents_base=agents_base)
        assert archive_path.exists()

    def test_archive_state_preserves_originals(self, temp_workspace):
        agents_base = temp_workspace / "agents"
        state_dir = agents_base / "test1234"
        state_dir.mkdir(parents=True)

        # Create artifacts
        (state_dir / "build_log.json").write_text('{"test": true}')

        archive_state("test1234", agents_base=agents_base)

        # Original should still exist (copy, not move)
        assert (state_dir / "build_log.json").exists()


class TestCleanupWorktree:
    """Tests for cleanup_worktree function."""

    def test_cleanup_nonexistent_worktree(self, temp_workspace):
        trees_base = temp_workspace / "trees"

        # Should return True for nonexistent worktree
        result = cleanup_worktree("test1234", trees_base=trees_base)
        assert result is True

    def test_cleanup_worktree_calls_remove(self, monkeypatch, temp_workspace):
        trees_base = temp_workspace / "trees"
        worktree_path = trees_base / "test1234"
        worktree_path.mkdir(parents=True)

        mock_remove = MagicMock()
        monkeypatch.setattr(
            "adws.scripts.adw_ship_iso.remove_worktree",
            mock_remove,
        )

        result = cleanup_worktree("test1234", trees_base=trees_base)

        assert result is True
        mock_remove.assert_called_once()


class TestLoadArtifacts:
    """Tests for artifact loading functions."""

    def test_load_plan_summary_exists(self, temp_workspace):
        specs_base = temp_workspace / "specs"
        plan_dir = specs_base / "test1234"
        plan_dir.mkdir(parents=True)
        (plan_dir / "plan.json").write_text('{"summary": "Test plan"}')

        data = load_plan_summary("test1234", specs_base=specs_base)
        assert data["summary"] == "Test plan"

    def test_load_plan_summary_missing(self, temp_workspace):
        specs_base = temp_workspace / "specs"

        data = load_plan_summary("test1234", specs_base=specs_base)
        assert data == {}

    def test_load_build_log_exists(self, temp_workspace):
        agents_base = temp_workspace / "agents"
        agent_dir = agents_base / "test1234"
        agent_dir.mkdir(parents=True)
        (agent_dir / "build_log.json").write_text('{"files_created": []}')

        data = load_build_log("test1234", agents_base=agents_base)
        assert "files_created" in data

    def test_load_build_log_missing(self, temp_workspace):
        agents_base = temp_workspace / "agents"

        data = load_build_log("test1234", agents_base=agents_base)
        assert data == {}

    def test_load_test_report_exists(self, temp_workspace):
        agents_base = temp_workspace / "agents"
        agent_dir = agents_base / "test1234"
        agent_dir.mkdir(parents=True)
        (agent_dir / "test_report.json").write_text('{"final_passed": 10}')

        data = load_test_report("test1234", agents_base=agents_base)
        assert data["final_passed"] == 10

    def test_load_test_report_missing(self, temp_workspace):
        agents_base = temp_workspace / "agents"

        data = load_test_report("test1234", agents_base=agents_base)
        assert data == {}

    def test_load_review_summary_exists(self, temp_workspace):
        agents_base = temp_workspace / "agents"
        agent_dir = agents_base / "test1234"
        agent_dir.mkdir(parents=True)
        (agent_dir / "review_summary.md").write_text("# Review Summary")

        summary = load_review_summary("test1234", agents_base=agents_base)
        assert "Review Summary" in summary

    def test_load_review_summary_missing(self, temp_workspace):
        agents_base = temp_workspace / "agents"

        summary = load_review_summary("test1234", agents_base=agents_base)
        assert summary == ""


class TestGeneratePRBody:
    """Tests for generate_pr_body function."""

    def test_generate_pr_body_includes_issue_ref(self, monkeypatch, temp_workspace):
        mock_state = MagicMock()
        mock_state.adw_id = "test1234"
        mock_state.issue_number = 42

        mock_manager = MagicMock()
        mock_manager.get_state.return_value = mock_state

        # Mock the load functions to return empty dicts
        monkeypatch.setattr(
            "adws.scripts.adw_ship_iso.load_plan_summary",
            lambda *args, **kwargs: {"summary": "Test summary", "approach": "Test approach"},
        )
        monkeypatch.setattr(
            "adws.scripts.adw_ship_iso.load_build_log",
            lambda *args, **kwargs: {},
        )
        monkeypatch.setattr(
            "adws.scripts.adw_ship_iso.load_test_report",
            lambda *args, **kwargs: {},
        )
        monkeypatch.setattr(
            "adws.scripts.adw_ship_iso.load_review_summary",
            lambda *args, **kwargs: "",
        )

        body = generate_pr_body(mock_manager, agents_base=temp_workspace / "agents")

        assert "Closes #42" in body

    def test_generate_pr_body_includes_summary(self, monkeypatch, temp_workspace):
        mock_state = MagicMock()
        mock_state.adw_id = "test1234"
        mock_state.issue_number = 42

        mock_manager = MagicMock()
        mock_manager.get_state.return_value = mock_state

        monkeypatch.setattr(
            "adws.scripts.adw_ship_iso.load_plan_summary",
            lambda *args, **kwargs: {
                "summary": "This is the implementation summary",
                "approach": "Technical approach here",
            },
        )
        monkeypatch.setattr(
            "adws.scripts.adw_ship_iso.load_build_log",
            lambda *args, **kwargs: {},
        )
        monkeypatch.setattr(
            "adws.scripts.adw_ship_iso.load_test_report",
            lambda *args, **kwargs: {},
        )
        monkeypatch.setattr(
            "adws.scripts.adw_ship_iso.load_review_summary",
            lambda *args, **kwargs: "",
        )

        body = generate_pr_body(mock_manager, agents_base=temp_workspace / "agents")

        assert "This is the implementation summary" in body
        assert "Technical approach here" in body

    def test_generate_pr_body_includes_files(self, monkeypatch, temp_workspace):
        mock_state = MagicMock()
        mock_state.adw_id = "test1234"
        mock_state.issue_number = 42

        mock_manager = MagicMock()
        mock_manager.get_state.return_value = mock_state

        monkeypatch.setattr(
            "adws.scripts.adw_ship_iso.load_plan_summary",
            lambda *args, **kwargs: {"summary": "Summary", "approach": "Approach"},
        )
        monkeypatch.setattr(
            "adws.scripts.adw_ship_iso.load_build_log",
            lambda *args, **kwargs: {
                "files_created": [{"file_path": "src/new.py"}],
                "files_modified": [{"file_path": "src/existing.py"}],
            },
        )
        monkeypatch.setattr(
            "adws.scripts.adw_ship_iso.load_test_report",
            lambda *args, **kwargs: {},
        )
        monkeypatch.setattr(
            "adws.scripts.adw_ship_iso.load_review_summary",
            lambda *args, **kwargs: "",
        )

        body = generate_pr_body(mock_manager, agents_base=temp_workspace / "agents")

        assert "`src/new.py`" in body
        assert "`src/existing.py`" in body

    def test_generate_pr_body_includes_test_results(self, monkeypatch, temp_workspace):
        mock_state = MagicMock()
        mock_state.adw_id = "test1234"
        mock_state.issue_number = 42

        mock_manager = MagicMock()
        mock_manager.get_state.return_value = mock_state

        monkeypatch.setattr(
            "adws.scripts.adw_ship_iso.load_plan_summary",
            lambda *args, **kwargs: {"summary": "Summary", "approach": "Approach"},
        )
        monkeypatch.setattr(
            "adws.scripts.adw_ship_iso.load_build_log",
            lambda *args, **kwargs: {},
        )
        monkeypatch.setattr(
            "adws.scripts.adw_ship_iso.load_test_report",
            lambda *args, **kwargs: {
                "final_passed": 50,
                "final_failed": 0,
                "final_errors": 0,
                "success": True,
            },
        )
        monkeypatch.setattr(
            "adws.scripts.adw_ship_iso.load_review_summary",
            lambda *args, **kwargs: "",
        )

        body = generate_pr_body(mock_manager, agents_base=temp_workspace / "agents")

        assert "PASSED" in body
        assert "Passed: 50" in body


class TestSaveShipLog:
    """Tests for save_ship_log function."""

    def test_save_ship_log_creates_file(self, temp_workspace):
        agents_base = temp_workspace / "agents"

        log = ShipLog(
            adw_id="test1234",
            issue_number=42,
            branch_name="feat/issue-42-test1234",
        )

        path = save_ship_log(log, agents_base=agents_base)

        assert path.exists()
        assert path.name == "ship_log.json"

        content = path.read_text()
        assert "test1234" in content
        assert "42" in content

    def test_save_ship_log_creates_directory(self, temp_workspace):
        agents_base = temp_workspace / "agents"
        assert not agents_base.exists()

        log = ShipLog(
            adw_id="test1234",
            issue_number=42,
            branch_name="feat/issue-42-test1234",
        )

        path = save_ship_log(log, agents_base=agents_base)

        assert path.exists()
        assert (agents_base / "test1234").exists()


class TestIntegrationScenarios:
    """Integration-style tests for ship phase scenarios."""

    def test_complete_ship_log_scenario(self, temp_workspace):
        """Test a complete ship log with all fields populated."""
        now = datetime.now(UTC)

        pr_info = PullRequestInfo(
            number=456,
            url="https://api.github.com/repos/test/repo/pulls/456",
            html_url="https://github.com/test/repo/pull/456",
            state="open",
            title="feat: Implement issue #99",
            head_branch="feat/issue-99-abcd1234",
            base_branch="main",
            created_at=now,
        )

        log = ShipLog(
            adw_id="abcd1234",
            issue_number=99,
            branch_name="feat/issue-99-abcd1234",
            pull_request=pr_info,
            auto_merge_requested=True,
            auto_merge_succeeded=True,
            worktree_removed=True,
            state_archived=True,
            duration_seconds=15.5,
            completed_at=now,
        )

        agents_base = temp_workspace / "agents"
        path = save_ship_log(log, agents_base=agents_base)

        # Reload and verify
        import json
        with open(path) as f:
            data = json.load(f)

        assert data["adw_id"] == "abcd1234"
        assert data["issue_number"] == 99
        assert data["pull_request"]["number"] == 456
        assert data["auto_merge_succeeded"] is True
        assert data["worktree_removed"] is True
        assert data["state_archived"] is True

    def test_archive_then_save_log(self, temp_workspace):
        """Test archiving state then saving ship log."""
        agents_base = temp_workspace / "agents"
        state_dir = agents_base / "test1234"
        state_dir.mkdir(parents=True)

        # Create artifacts
        (state_dir / "build_log.json").write_text('{"test": true}')
        (state_dir / "test_report.json").write_text('{"passed": 10}')

        # Archive
        archive_path = archive_state("test1234", agents_base=agents_base)
        assert archive_path.exists()

        # Save ship log
        log = ShipLog(
            adw_id="test1234",
            issue_number=42,
            branch_name="feat/issue-42-test1234",
            state_archived=True,
        )
        save_ship_log(log, agents_base=agents_base)

        # Both should exist
        assert (state_dir / "ship_log.json").exists()
        assert archive_path.exists()
