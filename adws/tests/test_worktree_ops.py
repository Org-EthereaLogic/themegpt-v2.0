"""
Tests for ADWS Worktree Operations Module.

Tests cover:
- ADW ID generation
- Deterministic port allocation
- Worktree creation in temporary git repos
- Worktree removal and cleanup
- Active worktree listing
"""

import subprocess
from pathlib import Path

import pytest

from adws.adw_modules.worktree_ops import (
    create_worktree,
    generate_adw_id,
    get_ports_for_adw,
    get_worktree_info,
    list_active_worktrees,
    remove_worktree,
)


@pytest.fixture
def temp_git_repo(temp_workspace: Path) -> Path:
    """Create a temporary git repository for testing worktrees."""
    repo_path = temp_workspace / "repo"
    repo_path.mkdir()

    # Initialize git repo
    subprocess.run(
        ["git", "init"],
        cwd=repo_path,
        capture_output=True,
        check=True,
    )

    # Configure git user for commits
    subprocess.run(
        ["git", "config", "user.email", "test@example.com"],
        cwd=repo_path,
        capture_output=True,
        check=True,
    )
    subprocess.run(
        ["git", "config", "user.name", "Test User"],
        cwd=repo_path,
        capture_output=True,
        check=True,
    )

    # Create initial commit
    test_file = repo_path / "README.md"
    test_file.write_text("# Test Repository\n")
    subprocess.run(
        ["git", "add", "."],
        cwd=repo_path,
        capture_output=True,
        check=True,
    )
    subprocess.run(
        ["git", "commit", "-m", "Initial commit"],
        cwd=repo_path,
        capture_output=True,
        check=True,
    )

    return repo_path


class TestGenerateAdwId:
    """Tests for generate_adw_id function."""

    def test_generates_8_char_hex(self) -> None:
        """Test that generate_adw_id returns 8-character hex string."""
        adw_id = generate_adw_id()
        assert len(adw_id) == 8
        assert all(c in "0123456789abcdef" for c in adw_id)

    def test_generates_unique_ids(self) -> None:
        """Test that consecutive calls generate different IDs."""
        ids = {generate_adw_id() for _ in range(100)}
        assert len(ids) == 100  # All unique


class TestGetPortsForAdw:
    """Tests for get_ports_for_adw function."""

    def test_returns_valid_port_ranges(self) -> None:
        """Test that ports are within valid ranges."""
        for _ in range(100):
            adw_id = generate_adw_id()
            backend, frontend = get_ports_for_adw(adw_id)
            assert 9100 <= backend <= 9114
            assert 9200 <= frontend <= 9214
            assert frontend == backend + 100

    def test_deterministic_allocation(self) -> None:
        """Test that same ID always gets same ports."""
        adw_id = "a1b2c3d4"
        ports1 = get_ports_for_adw(adw_id)
        ports2 = get_ports_for_adw(adw_id)
        assert ports1 == ports2

    def test_known_value(self) -> None:
        """Test a known input produces expected output."""
        # int("a1b2c3d4", 36) = 16705508236 -> 16705508236 % 15 = 1
        # So ports should be (9101, 9201)
        adw_id = "a1b2c3d4"
        backend, frontend = get_ports_for_adw(adw_id)
        expected_index = int(adw_id[:8], 36) % 15
        assert backend == 9100 + expected_index
        assert frontend == 9200 + expected_index


class TestCreateWorktree:
    """Tests for create_worktree function."""

    def test_creates_worktree_directory(
        self,
        temp_git_repo: Path,
        temp_workspace: Path,
    ) -> None:
        """Test that worktree is created on disk."""
        trees_base = temp_workspace / "trees"
        adw_id = "test1234"

        worktree_path, branch_name = create_worktree(
            adw_id=adw_id,
            issue_number=42,
            repo_path=temp_git_repo,
            trees_base=trees_base,
        )

        assert worktree_path.exists()
        assert worktree_path == trees_base / adw_id
        assert branch_name == "feat/issue-42-test1234"

    def test_worktree_contains_repo_content(
        self,
        temp_git_repo: Path,
        temp_workspace: Path,
    ) -> None:
        """Test that worktree contains repository files."""
        trees_base = temp_workspace / "trees"

        worktree_path, _ = create_worktree(
            adw_id="abc12345",
            issue_number=1,
            repo_path=temp_git_repo,
            trees_base=trees_base,
        )

        # Check that README.md exists in worktree
        readme = worktree_path / "README.md"
        assert readme.exists()
        assert "Test Repository" in readme.read_text()

    def test_creates_correct_branch(
        self,
        temp_git_repo: Path,
        temp_workspace: Path,
    ) -> None:
        """Test that worktree is on the correct branch."""
        trees_base = temp_workspace / "trees"

        worktree_path, branch_name = create_worktree(
            adw_id="def67890",
            issue_number=99,
            repo_path=temp_git_repo,
            trees_base=trees_base,
        )

        # Verify branch in worktree
        result = subprocess.run(
            ["git", "branch", "--show-current"],
            cwd=worktree_path,
            capture_output=True,
            text=True,
            check=True,
        )
        assert result.stdout.strip() == branch_name
        assert branch_name == "feat/issue-99-def67890"

    def test_raises_if_worktree_exists(
        self,
        temp_git_repo: Path,
        temp_workspace: Path,
    ) -> None:
        """Test that creating duplicate worktree raises FileExistsError."""
        trees_base = temp_workspace / "trees"
        adw_id = "dup12345"

        create_worktree(
            adw_id=adw_id,
            issue_number=1,
            repo_path=temp_git_repo,
            trees_base=trees_base,
        )

        with pytest.raises(FileExistsError):
            create_worktree(
                adw_id=adw_id,
                issue_number=1,
                repo_path=temp_git_repo,
                trees_base=trees_base,
            )


class TestRemoveWorktree:
    """Tests for remove_worktree function."""

    def test_removes_worktree_directory(
        self,
        temp_git_repo: Path,
        temp_workspace: Path,
    ) -> None:
        """Test that worktree directory is removed."""
        trees_base = temp_workspace / "trees"
        adw_id = "rm123456"

        worktree_path, _ = create_worktree(
            adw_id=adw_id,
            issue_number=1,
            repo_path=temp_git_repo,
            trees_base=trees_base,
        )

        assert worktree_path.exists()

        remove_worktree(
            adw_id=adw_id,
            trees_base=trees_base,
            repo_path=temp_git_repo,
        )

        assert not worktree_path.exists()

    def test_removes_branch_when_requested(
        self,
        temp_git_repo: Path,
        temp_workspace: Path,
    ) -> None:
        """Test that branch is deleted when delete_branch=True."""
        trees_base = temp_workspace / "trees"
        adw_id = "br123456"

        _, branch_name = create_worktree(
            adw_id=adw_id,
            issue_number=1,
            repo_path=temp_git_repo,
            trees_base=trees_base,
        )

        # Verify branch exists
        result = subprocess.run(
            ["git", "branch", "--list", branch_name],
            cwd=temp_git_repo,
            capture_output=True,
            text=True,
        )
        assert branch_name in result.stdout

        remove_worktree(
            adw_id=adw_id,
            trees_base=trees_base,
            repo_path=temp_git_repo,
            delete_branch=True,
        )

        # Verify branch is deleted
        result = subprocess.run(
            ["git", "branch", "--list", branch_name],
            cwd=temp_git_repo,
            capture_output=True,
            text=True,
        )
        assert branch_name not in result.stdout

    def test_handles_nonexistent_worktree(
        self,
        temp_git_repo: Path,
        temp_workspace: Path,
    ) -> None:
        """Test that removing nonexistent worktree doesn't raise."""
        trees_base = temp_workspace / "trees"

        # Should not raise
        remove_worktree(
            adw_id="nonexistent",
            trees_base=trees_base,
            repo_path=temp_git_repo,
        )


class TestListActiveWorktrees:
    """Tests for list_active_worktrees function."""

    def test_returns_empty_when_no_worktrees(
        self,
        temp_git_repo: Path,
        temp_workspace: Path,
    ) -> None:
        """Test that empty list returned when no worktrees exist."""
        trees_base = temp_workspace / "trees"
        trees_base.mkdir()

        result = list_active_worktrees(
            trees_base=trees_base,
            repo_path=temp_git_repo,
        )
        assert result == []

    def test_lists_created_worktrees(
        self,
        temp_git_repo: Path,
        temp_workspace: Path,
    ) -> None:
        """Test that created worktrees are listed."""
        trees_base = temp_workspace / "trees"

        create_worktree(
            adw_id="list1234",
            issue_number=1,
            repo_path=temp_git_repo,
            trees_base=trees_base,
        )
        create_worktree(
            adw_id="list5678",
            issue_number=2,
            repo_path=temp_git_repo,
            trees_base=trees_base,
        )

        result = list_active_worktrees(
            trees_base=trees_base,
            repo_path=temp_git_repo,
        )

        assert "list1234" in result
        assert "list5678" in result

    def test_excludes_removed_worktrees(
        self,
        temp_git_repo: Path,
        temp_workspace: Path,
    ) -> None:
        """Test that removed worktrees are not listed."""
        trees_base = temp_workspace / "trees"

        create_worktree(
            adw_id="keep1234",
            issue_number=1,
            repo_path=temp_git_repo,
            trees_base=trees_base,
        )
        create_worktree(
            adw_id="remove12",
            issue_number=2,
            repo_path=temp_git_repo,
            trees_base=trees_base,
        )

        remove_worktree(
            adw_id="remove12",
            trees_base=trees_base,
            repo_path=temp_git_repo,
        )

        result = list_active_worktrees(
            trees_base=trees_base,
            repo_path=temp_git_repo,
        )

        assert "keep1234" in result
        assert "remove12" not in result


class TestGetWorktreeInfo:
    """Tests for get_worktree_info function."""

    def test_returns_info_for_existing_worktree(
        self,
        temp_git_repo: Path,
        temp_workspace: Path,
    ) -> None:
        """Test that info is returned for existing worktree."""
        trees_base = temp_workspace / "trees"
        adw_id = "info1234"

        worktree_path, branch_name = create_worktree(
            adw_id=adw_id,
            issue_number=42,
            repo_path=temp_git_repo,
            trees_base=trees_base,
        )

        info = get_worktree_info(adw_id, trees_base=trees_base)

        assert info is not None
        assert info["path"] == str(worktree_path)
        assert info["branch"] == branch_name
        assert "commit" in info

    def test_returns_none_for_nonexistent_worktree(
        self,
        temp_workspace: Path,
    ) -> None:
        """Test that None returned for nonexistent worktree."""
        trees_base = temp_workspace / "trees"
        trees_base.mkdir()

        info = get_worktree_info("nonexistent", trees_base=trees_base)
        assert info is None


class TestWorktreeIntegration:
    """Integration tests for full worktree workflow."""

    def test_full_lifecycle(
        self,
        temp_git_repo: Path,
        temp_workspace: Path,
    ) -> None:
        """Test complete worktree lifecycle: create -> modify -> remove."""
        trees_base = temp_workspace / "trees"
        adw_id = "life1234"

        # Create
        worktree_path, branch_name = create_worktree(
            adw_id=adw_id,
            issue_number=100,
            repo_path=temp_git_repo,
            trees_base=trees_base,
        )

        # Verify creation
        assert worktree_path.exists()
        assert adw_id in list_active_worktrees(trees_base, temp_git_repo)

        # Modify files in worktree
        new_file = worktree_path / "new_feature.py"
        new_file.write_text("# New feature implementation\n")

        subprocess.run(
            ["git", "add", "."],
            cwd=worktree_path,
            check=True,
        )
        subprocess.run(
            ["git", "commit", "-m", "Add new feature"],
            cwd=worktree_path,
            check=True,
        )

        # Verify commit
        info = get_worktree_info(adw_id, trees_base=trees_base)
        assert info is not None
        assert info["branch"] == branch_name

        # Remove
        remove_worktree(
            adw_id=adw_id,
            trees_base=trees_base,
            repo_path=temp_git_repo,
            delete_branch=True,
        )

        # Verify removal
        assert not worktree_path.exists()
        assert adw_id not in list_active_worktrees(trees_base, temp_git_repo)
