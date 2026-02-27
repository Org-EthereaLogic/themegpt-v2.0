"""
Shared pytest fixtures for ADWS tests.
"""

import shutil
import tempfile
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

import pytest


@pytest.fixture
def temp_workspace() -> Path:
    """Create temporary workspace for tests."""
    temp_dir = Path(tempfile.mkdtemp())
    yield temp_dir
    shutil.rmtree(temp_dir, ignore_errors=True)


@pytest.fixture
def sample_adw_id() -> str:
    """Return consistent ADW ID for tests."""
    return "a1b2c3d4"


@pytest.fixture
def sample_state_kwargs(sample_adw_id: str, temp_workspace: Path) -> dict[str, Any]:
    """Return sample kwargs for state initialization."""
    return {
        "issue_number": 42,
        "worktree_path": str(temp_workspace / "trees" / sample_adw_id),
        "backend_port": 9103,
        "frontend_port": 9203,
        "branch_name": f"feat/issue-42-{sample_adw_id}",
        "repo_url": "https://github.com/example/repo",
    }


@pytest.fixture
def sample_plan_data(sample_adw_id: str) -> dict[str, Any]:
    """Return complete TrinityPlan data for tests."""
    return {
        "adw_id": sample_adw_id,
        "issue_number": 42,
        "issue_title": "Test issue",
        "issue_body": "Test issue body description",
        "architect_perspective": "Architect analysis of the implementation",
        "critic_perspective": "Critic analysis of potential issues",
        "advocate_perspective": "Advocate analysis of user impact",
        "summary": "Test summary of the implementation",
        "approach": "Test approach for implementation",
        "test_strategy": "Test strategy for validation",
        "files_to_create": ["src/new.py"],
        "files_to_modify": ["src/existing.py"],
        "risks": ["Risk 1"],
        "estimated_complexity": "low",
        "created_at": datetime.now(UTC).isoformat(),
        "total_tokens": 100,
    }
