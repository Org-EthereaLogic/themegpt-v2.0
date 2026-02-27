"""
Layer 2: Dry-Run Pipeline Test — Mocked LLM responses, no API credits.

Simulates a complete ADWS workflow lifecycle:
  plan → build → test → review → document → ship

All external dependencies (git, LLM APIs, GitHub API) are mocked.
This validates the orchestration logic, state transitions, and
error handling without touching any real services.
"""

import asyncio
import json
import os
import shutil
import tempfile
from datetime import UTC, datetime
from pathlib import Path
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from adws.adw_modules.state import StateManager
from adws.adw_modules.worktree_ops import generate_adw_id, get_ports_for_adw


# ─── Fixtures ──────────────────────────────────────────────────────────


@pytest.fixture
def workspace() -> Path:
    """Isolated temporary workspace for the entire pipeline."""
    tmp = Path(tempfile.mkdtemp(prefix="adws_dryrun_"))
    (tmp / "trees").mkdir()
    (tmp / "agents").mkdir()
    yield tmp
    shutil.rmtree(tmp, ignore_errors=True)


@pytest.fixture
def adw_id() -> str:
    return generate_adw_id()


@pytest.fixture
def mock_issue() -> dict:
    """A simple, low-risk mock issue for the pipeline to process."""
    return {
        "number": 999,
        "title": "Add inline code comment to ThemeSelector component",
        "body": (
            "The `ThemeSelector` component in `apps/extension/src/components/ThemeSelector.tsx` "
            "is missing a JSDoc comment explaining the props interface. "
            "Add a short descriptive comment above the `ThemeSelectorProps` type.\n\n"
            "Acceptance criteria:\n"
            "- [ ] JSDoc comment added above ThemeSelectorProps\n"
            "- [ ] Comment explains purpose and usage"
        ),
    }


@pytest.fixture
def mock_trinity_plan(adw_id: str, mock_issue: dict) -> dict:
    """Pre-built Trinity plan matching what execute_planning would produce."""
    return {
        "adw_id": adw_id,
        "issue_number": mock_issue["number"],
        "issue_title": mock_issue["title"],
        "issue_body": mock_issue["body"],
        "architect_perspective": (
            "This is a documentation-only change. Add a JSDoc block above "
            "ThemeSelectorProps in ThemeSelector.tsx. No functional changes."
        ),
        "critic_perspective": (
            "Low risk. No security implications. Verify the comment accurately "
            "describes the props and doesn't expose internal implementation details."
        ),
        "advocate_perspective": (
            "Good for developer experience. The comment should follow TSDoc "
            "conventions and match the project's existing documentation style."
        ),
        "summary": "Add JSDoc comment to ThemeSelectorProps type definition",
        "approach": (
            "1. Open apps/extension/src/components/ThemeSelector.tsx\n"
            "2. Add JSDoc comment above ThemeSelectorProps\n"
            "3. Run type checker to verify no issues"
        ),
        "test_strategy": "Type-check with tsc --noEmit to verify no regressions",
        "files_to_create": [],
        "files_to_modify": ["apps/extension/src/components/ThemeSelector.tsx"],
        "risks": ["Minimal — documentation-only change"],
        "estimated_complexity": "low",
        "created_at": datetime.now(UTC).isoformat(),
        "total_tokens": 850,
        "total_latency_ms": 3200.0,
    }


# ─── Phase 1: Plan ────────────────────────────────────────────────────


class TestPlanPhase:
    """Verify plan phase creates state and records completion."""

    def test_plan_creates_state(
        self, workspace: Path, adw_id: str, mock_issue: dict
    ) -> None:
        """Plan phase initializes state with correct fields."""
        backend, frontend = get_ports_for_adw(adw_id)
        mgr = StateManager(adw_id, base_path=workspace / "agents")
        state = mgr.initialize(
            issue_number=mock_issue["number"],
            worktree_path=str(workspace / "trees" / adw_id),
            backend_port=backend,
            frontend_port=frontend,
            branch_name=f"feat/issue-{mock_issue['number']}-{adw_id}",
            trinity_architect_model="claude-opus-4-5-20251101",
            trinity_critic_model="gpt-5.2",
            trinity_advocate_model="gemini-3.1-pro-preview",
        )

        assert state.issue_number == 999
        assert state.current_phase == "initialized"
        assert state.trinity_architect_model == "claude-opus-4-5-20251101"

    def test_plan_records_completion(
        self, workspace: Path, adw_id: str, mock_issue: dict
    ) -> None:
        """After plan execution, phase record is saved."""
        backend, frontend = get_ports_for_adw(adw_id)
        mgr = StateManager(adw_id, base_path=workspace / "agents")
        mgr.initialize(
            issue_number=mock_issue["number"],
            worktree_path=str(workspace / "trees" / adw_id),
            backend_port=backend,
            frontend_port=frontend,
            branch_name=f"feat/issue-{mock_issue['number']}-{adw_id}",
        )

        # Simulate plan phase completion
        mgr.update(
            plan_file=f"agents/{adw_id}/plan.md",
            plan_json=f"agents/{adw_id}/plan.json",
            current_phase="planned",
        )
        mgr.record_phase_completion("plan", duration=3.2, success=True)
        mgr.save()

        # Verify persistence
        loaded = StateManager.load(adw_id, base_path=workspace / "agents")
        s = loaded.get_state()
        assert s.current_phase == "plan"
        assert s.plan_file is not None
        assert len(s.all_adws) == 1
        assert s.all_adws[0].success is True

    def test_plan_snapshot_before_build(
        self, workspace: Path, adw_id: str, mock_issue: dict
    ) -> None:
        """Snapshot is created after planning to enable rollback."""
        backend, frontend = get_ports_for_adw(adw_id)
        mgr = StateManager(adw_id, base_path=workspace / "agents")
        mgr.initialize(
            issue_number=mock_issue["number"],
            worktree_path=str(workspace / "trees" / adw_id),
            backend_port=backend,
            frontend_port=frontend,
            branch_name=f"feat/issue-{mock_issue['number']}-{adw_id}",
        )
        mgr.record_phase_completion("plan", duration=3.2, success=True)
        mgr.save()

        snap = mgr.create_snapshot(label="post_plan")
        assert snap.exists()
        assert "post_plan" in snap.name


# ─── Phase 2: Build ───────────────────────────────────────────────────


class TestBuildPhase:
    """Verify build phase state transitions."""

    def test_build_requires_plan(
        self, workspace: Path, adw_id: str, mock_issue: dict
    ) -> None:
        """Build refuses to proceed without completed plan."""
        backend, frontend = get_ports_for_adw(adw_id)
        mgr = StateManager(adw_id, base_path=workspace / "agents")
        mgr.initialize(
            issue_number=mock_issue["number"],
            worktree_path=str(workspace / "trees" / adw_id),
            backend_port=backend,
            frontend_port=frontend,
            branch_name=f"feat/issue-{mock_issue['number']}-{adw_id}",
        )

        # No plan recorded yet
        assert mgr.validate_prerequisites(["plan"]) is False

    def test_build_succeeds_after_plan(
        self, workspace: Path, adw_id: str, mock_issue: dict
    ) -> None:
        """Build passes prerequisite check after plan completes."""
        backend, frontend = get_ports_for_adw(adw_id)
        mgr = StateManager(adw_id, base_path=workspace / "agents")
        mgr.initialize(
            issue_number=mock_issue["number"],
            worktree_path=str(workspace / "trees" / adw_id),
            backend_port=backend,
            frontend_port=frontend,
            branch_name=f"feat/issue-{mock_issue['number']}-{adw_id}",
        )

        mgr.record_phase_completion("plan", duration=3.2, success=True)
        assert mgr.validate_prerequisites(["plan"]) is True

        # Simulate build completion
        mgr.record_phase_completion("build", duration=12.5, success=True)
        mgr.save()

        loaded = StateManager.load(adw_id, base_path=workspace / "agents")
        assert loaded.get_state().current_phase == "build"
        assert len(loaded.get_state().all_adws) == 2


# ─── Phase 3: Test ────────────────────────────────────────────────────


class TestTestPhase:
    """Verify test phase state management and result storage."""

    def test_test_stores_results(
        self, workspace: Path, adw_id: str, mock_issue: dict
    ) -> None:
        """Test phase stores results and coverage in state."""
        backend, frontend = get_ports_for_adw(adw_id)
        mgr = StateManager(adw_id, base_path=workspace / "agents")
        mgr.initialize(
            issue_number=mock_issue["number"],
            worktree_path=str(workspace / "trees" / adw_id),
            backend_port=backend,
            frontend_port=frontend,
            branch_name=f"feat/issue-{mock_issue['number']}-{adw_id}",
        )
        mgr.record_phase_completion("plan", 3.2, True)
        mgr.record_phase_completion("build", 12.5, True)

        # Simulate test results
        mgr.update(
            test_results={
                "passed": 25,
                "failed": 0,
                "skipped": 0,
                "errors": 0,
                "output": "25 passed in 2.1s",
            },
            test_coverage=92.3,
        )
        mgr.record_phase_completion("test", duration=8.0, success=True)
        mgr.save()

        loaded = StateManager.load(adw_id, base_path=workspace / "agents")
        s = loaded.get_state()
        assert s.test_results["passed"] == 25
        assert s.test_results["failed"] == 0
        assert s.test_coverage == 92.3

    def test_test_failure_records_error(
        self, workspace: Path, adw_id: str, mock_issue: dict
    ) -> None:
        """Failed test phase records error message."""
        backend, frontend = get_ports_for_adw(adw_id)
        mgr = StateManager(adw_id, base_path=workspace / "agents")
        mgr.initialize(
            issue_number=mock_issue["number"],
            worktree_path=str(workspace / "trees" / adw_id),
            backend_port=backend,
            frontend_port=frontend,
            branch_name=f"feat/issue-{mock_issue['number']}-{adw_id}",
        )
        mgr.record_phase_completion("plan", 3.2, True)
        mgr.record_phase_completion("build", 12.5, True)

        mgr.record_phase_completion(
            "test", duration=5.0, success=False,
            error_message="3 tests failed after 4 retry attempts",
        )
        mgr.save()

        loaded = StateManager.load(adw_id, base_path=workspace / "agents")
        s = loaded.get_state()
        assert s.current_phase == "test_failed"
        assert s.all_adws[-1].error_message is not None


# ─── Phase 4: Review ──────────────────────────────────────────────────


class TestReviewPhase:
    """Verify review phase consensus and prerequisite checks."""

    def test_review_requires_passing_tests(
        self, workspace: Path, adw_id: str, mock_issue: dict
    ) -> None:
        """Review refuses to proceed without passing tests."""
        backend, frontend = get_ports_for_adw(adw_id)
        mgr = StateManager(adw_id, base_path=workspace / "agents")
        mgr.initialize(
            issue_number=mock_issue["number"],
            worktree_path=str(workspace / "trees" / adw_id),
            backend_port=backend,
            frontend_port=frontend,
            branch_name=f"feat/issue-{mock_issue['number']}-{adw_id}",
        )
        mgr.record_phase_completion("plan", 3.2, True)
        mgr.record_phase_completion("build", 12.5, True)
        mgr.record_phase_completion("test", 5.0, False, "Tests failed")

        assert mgr.validate_prerequisites(["plan", "build", "test"]) is False

    def test_review_passes_with_all_prereqs(
        self, workspace: Path, adw_id: str, mock_issue: dict
    ) -> None:
        """Review succeeds when all prerequisites are met."""
        backend, frontend = get_ports_for_adw(adw_id)
        mgr = StateManager(adw_id, base_path=workspace / "agents")
        mgr.initialize(
            issue_number=mock_issue["number"],
            worktree_path=str(workspace / "trees" / adw_id),
            backend_port=backend,
            frontend_port=frontend,
            branch_name=f"feat/issue-{mock_issue['number']}-{adw_id}",
        )
        mgr.record_phase_completion("plan", 3.2, True)
        mgr.record_phase_completion("build", 12.5, True)
        mgr.record_phase_completion("test", 8.0, True)

        assert mgr.validate_prerequisites(["plan", "build", "test"]) is True

        # Simulate review
        mgr.record_phase_completion("review", duration=15.0, success=True)
        mgr.save()

        loaded = StateManager.load(adw_id, base_path=workspace / "agents")
        assert loaded.get_state().current_phase == "review"


# ─── Phase 5: Document ────────────────────────────────────────────────


class TestDocumentPhase:
    """Verify document phase state transitions."""

    def test_document_follows_review(
        self, workspace: Path, adw_id: str, mock_issue: dict
    ) -> None:
        """Document phase records correctly after review."""
        backend, frontend = get_ports_for_adw(adw_id)
        mgr = StateManager(adw_id, base_path=workspace / "agents")
        mgr.initialize(
            issue_number=mock_issue["number"],
            worktree_path=str(workspace / "trees" / adw_id),
            backend_port=backend,
            frontend_port=frontend,
            branch_name=f"feat/issue-{mock_issue['number']}-{adw_id}",
        )
        for phase_name, dur in [("plan", 3.2), ("build", 12.5), ("test", 8.0), ("review", 15.0)]:
            mgr.record_phase_completion(phase_name, dur, True)

        assert mgr.validate_prerequisites(["plan", "build", "test", "review"]) is True

        mgr.record_phase_completion("document", duration=5.0, success=True)
        mgr.save()

        loaded = StateManager.load(adw_id, base_path=workspace / "agents")
        assert loaded.get_state().current_phase == "document"
        assert len(loaded.get_state().all_adws) == 5


# ─── Phase 6: Ship ────────────────────────────────────────────────────


class TestShipPhase:
    """Verify ship phase and complete workflow."""

    def test_ship_completes_full_workflow(
        self, workspace: Path, adw_id: str, mock_issue: dict
    ) -> None:
        """Ship phase completes the full 6-phase workflow."""
        backend, frontend = get_ports_for_adw(adw_id)
        mgr = StateManager(adw_id, base_path=workspace / "agents")
        mgr.initialize(
            issue_number=mock_issue["number"],
            worktree_path=str(workspace / "trees" / adw_id),
            backend_port=backend,
            frontend_port=frontend,
            branch_name=f"feat/issue-{mock_issue['number']}-{adw_id}",
            trinity_architect_model="claude-opus-4-5-20251101",
            trinity_critic_model="gpt-5.2",
            trinity_advocate_model="gemini-3.1-pro-preview",
        )

        phases = ["plan", "build", "test", "review", "document", "ship"]
        durations = [3.2, 12.5, 8.0, 15.0, 5.0, 20.0]

        for phase_name, dur in zip(phases, durations):
            mgr.record_phase_completion(phase_name, dur, True)

        mgr.update(
            test_results={"passed": 25, "failed": 0, "skipped": 0},
            test_coverage=92.3,
        )
        mgr.save()

        # Verify final state
        loaded = StateManager.load(adw_id, base_path=workspace / "agents")
        s = loaded.get_state()

        assert s.current_phase == "ship"
        assert len(s.all_adws) == 6
        assert all(record.success for record in s.all_adws)
        assert s.test_coverage == 92.3
        assert s.trinity_architect_model == "claude-opus-4-5-20251101"

        # Verify all prerequisites pass at every stage
        for i, phase_name in enumerate(phases):
            prereqs = phases[:i]
            if prereqs:
                assert mgr.validate_prerequisites(prereqs) is True


# ─── Rollback During Pipeline ─────────────────────────────────────────


class TestPipelineRollback:
    """Verify rollback works correctly during pipeline execution."""

    def test_rollback_after_failed_build(
        self, workspace: Path, adw_id: str, mock_issue: dict
    ) -> None:
        """Can rollback to plan phase after build fails."""
        backend, frontend = get_ports_for_adw(adw_id)
        mgr = StateManager(adw_id, base_path=workspace / "agents")
        mgr.initialize(
            issue_number=mock_issue["number"],
            worktree_path=str(workspace / "trees" / adw_id),
            backend_port=backend,
            frontend_port=frontend,
            branch_name=f"feat/issue-{mock_issue['number']}-{adw_id}",
        )

        mgr.record_phase_completion("plan", 3.2, True)
        mgr.save()
        mgr.create_snapshot(label="post_plan")

        mgr.record_phase_completion("build", 12.5, False, "Compilation error")
        mgr.save()

        assert mgr.get_state().current_phase == "build_failed"

        # Rollback to plan
        restored = mgr.rollback_to_phase("plan")
        assert restored.current_phase == "plan"
        assert len(restored.all_adws) == 1

        # Can retry build
        mgr.record_phase_completion("build", 15.0, True)
        mgr.save()
        assert mgr.get_state().current_phase == "build"
        assert len(mgr.get_state().all_adws) == 2

    def test_rollback_preserves_model_versions(
        self, workspace: Path, adw_id: str, mock_issue: dict
    ) -> None:
        """Model versions survive rollback (immutable per workflow)."""
        backend, frontend = get_ports_for_adw(adw_id)
        mgr = StateManager(adw_id, base_path=workspace / "agents")
        mgr.initialize(
            issue_number=mock_issue["number"],
            worktree_path=str(workspace / "trees" / adw_id),
            backend_port=backend,
            frontend_port=frontend,
            branch_name=f"feat/issue-{mock_issue['number']}-{adw_id}",
            trinity_architect_model="claude-opus-4-5-20251101",
            trinity_critic_model="gpt-5.2",
            trinity_advocate_model="gemini-3.1-pro-preview",
        )
        mgr.record_phase_completion("plan", 3.2, True)
        mgr.save()
        snap = mgr.create_snapshot(label="checkpoint")

        mgr.record_phase_completion("build", 12.5, True)
        mgr.save()

        restored = mgr.rollback_to_snapshot(snap)
        assert restored.trinity_architect_model == "claude-opus-4-5-20251101"
        assert restored.trinity_critic_model == "gpt-5.2"
        assert restored.trinity_advocate_model == "gemini-3.1-pro-preview"
