"""
Layer 1: Local Smoke Test — No API keys required.

Validates that all ADWS core modules are correctly wired up in ThemeGPT:
- State management (init, save, load, snapshot, rollback, locking)
- Worktree operations (ID generation, port allocation, cleanup)
- Provider client instantiation (factory pattern, fallback chains)
- Bridge API argument validation (blocklist)
- Trinity Protocol class instantiation (no network calls)
"""

import json
import os
import shutil
import tempfile
import threading
from datetime import UTC, datetime
from pathlib import Path

import pytest

from adws.adw_modules.state import ADWPhaseRecord, ADWState, StateManager
from adws.adw_modules.worktree_ops import (
    cleanup_old_worktrees,
    generate_adw_id,
    get_ports_for_adw,
)
from adws.adw_modules.provider_clients import (
    ClaudeClient,
    GeminiClient,
    GPTClient,
    ProviderClientFactory,
)


# ─── Fixtures ──────────────────────────────────────────────────────────


@pytest.fixture
def workspace() -> Path:
    """Create a temporary workspace that is cleaned up after the test."""
    tmp = Path(tempfile.mkdtemp(prefix="adws_smoke_"))
    yield tmp
    shutil.rmtree(tmp, ignore_errors=True)


@pytest.fixture
def adw_id() -> str:
    return generate_adw_id()


@pytest.fixture
def base_kwargs(adw_id: str, workspace: Path) -> dict:
    backend, frontend = get_ports_for_adw(adw_id)
    return {
        "issue_number": 1,
        "worktree_path": str(workspace / "trees" / adw_id),
        "backend_port": backend,
        "frontend_port": frontend,
        "branch_name": f"feat/issue-1-{adw_id}",
    }


# ─── 1. Identity & Ports ──────────────────────────────────────────────


class TestIdentityAndPorts:
    """Verify ADW ID generation and deterministic port allocation."""

    def test_adw_id_format(self) -> None:
        """IDs are 8-char lowercase hex strings."""
        aid = generate_adw_id()
        assert len(aid) == 8
        assert all(c in "0123456789abcdef" for c in aid)

    def test_adw_ids_are_unique(self) -> None:
        """100 consecutive IDs should all be distinct."""
        ids = {generate_adw_id() for _ in range(100)}
        assert len(ids) == 100

    def test_port_allocation_deterministic(self) -> None:
        """Same ID always returns the same ports."""
        aid = generate_adw_id()
        a = get_ports_for_adw(aid)
        b = get_ports_for_adw(aid)
        assert a == b

    def test_port_ranges(self) -> None:
        """Ports must fall within allocated ranges."""
        for _ in range(50):
            aid = generate_adw_id()
            be, fe = get_ports_for_adw(aid)
            assert 9100 <= be <= 9114
            assert 9200 <= fe <= 9214
            assert fe - be == 100


# ─── 2. State Management ──────────────────────────────────────────────


class TestStateLifecycle:
    """Full state lifecycle: init → update → save → load → verify."""

    def test_init_creates_file(
        self, workspace: Path, adw_id: str, base_kwargs: dict
    ) -> None:
        mgr = StateManager(adw_id, base_path=workspace)
        state = mgr.initialize(**base_kwargs)
        assert mgr.state_file.exists()
        assert state.current_phase == "initialized"

    def test_save_load_roundtrip(
        self, workspace: Path, adw_id: str, base_kwargs: dict
    ) -> None:
        mgr = StateManager(adw_id, base_path=workspace)
        mgr.initialize(**base_kwargs)
        mgr.record_phase_completion("plan", 10.0, True)
        mgr.update(plan_file="/plans/plan.md")
        mgr.save()

        loaded = StateManager.load(adw_id, base_path=workspace)
        s = loaded.get_state()
        assert s.plan_file == "/plans/plan.md"
        assert s.current_phase == "plan"
        assert len(s.all_adws) == 1

    def test_model_version_tracking(
        self, workspace: Path, adw_id: str, base_kwargs: dict
    ) -> None:
        mgr = StateManager(adw_id, base_path=workspace)
        mgr.initialize(
            **base_kwargs,
            trinity_architect_model="claude-opus-4-5-20251101",
            trinity_critic_model="gpt-5.2",
            trinity_advocate_model="gemini-3.1-pro-preview",
        )
        mgr.save()

        loaded = StateManager.load(adw_id, base_path=workspace)
        s = loaded.get_state()
        assert s.trinity_architect_model == "claude-opus-4-5-20251101"
        assert s.trinity_critic_model == "gpt-5.2"
        assert s.trinity_advocate_model == "gemini-3.1-pro-preview"

    def test_test_results_field(
        self, workspace: Path, adw_id: str, base_kwargs: dict
    ) -> None:
        mgr = StateManager(adw_id, base_path=workspace)
        mgr.initialize(**base_kwargs)
        mgr.update(
            test_results={"passed": 42, "failed": 0, "skipped": 2},
            test_coverage=87.5,
        )
        mgr.save()

        loaded = StateManager.load(adw_id, base_path=workspace)
        s = loaded.get_state()
        assert s.test_results["passed"] == 42
        assert s.test_coverage == 87.5

    def test_prerequisite_validation(
        self, workspace: Path, adw_id: str, base_kwargs: dict
    ) -> None:
        mgr = StateManager(adw_id, base_path=workspace)
        mgr.initialize(**base_kwargs)
        mgr.record_phase_completion("plan", 10.0, True)
        mgr.record_phase_completion("build", 30.0, True)
        mgr.record_phase_completion("test", 20.0, False, "3 tests failed")

        assert mgr.validate_prerequisites(["plan", "build"]) is True
        assert mgr.validate_prerequisites(["plan", "build", "test"]) is False
        assert mgr.validate_prerequisites(["review"]) is False


# ─── 3. File Locking ──────────────────────────────────────────────────


class TestFileLocking:
    """Concurrent saves must not corrupt state."""

    def test_concurrent_saves(
        self, workspace: Path, base_kwargs: dict
    ) -> None:
        aid = "locktest1"
        mgr = StateManager(aid, base_path=workspace)
        mgr.initialize(**base_kwargs)

        errors: list[Exception] = []

        def save_phase(i: int) -> None:
            try:
                m = StateManager.load(aid, base_path=workspace)
                m.update(current_phase=f"iter_{i}")
                m.save()
            except Exception as e:
                errors.append(e)

        threads = [threading.Thread(target=save_phase, args=(i,)) for i in range(15)]
        for t in threads:
            t.start()
        for t in threads:
            t.join(timeout=10)

        assert len(errors) == 0, f"Concurrent errors: {errors}"
        loaded = StateManager.load(aid, base_path=workspace)
        assert loaded.get_state().current_phase.startswith("iter_")


# ─── 4. Snapshots & Rollback ──────────────────────────────────────────


class TestSnapshotRollback:
    """Snapshot creation, listing, and rollback."""

    def test_snapshot_roundtrip(
        self, workspace: Path, adw_id: str, base_kwargs: dict
    ) -> None:
        mgr = StateManager(adw_id, base_path=workspace)
        mgr.initialize(**base_kwargs)
        mgr.record_phase_completion("plan", 10.0, True)
        mgr.save()

        snap = mgr.create_snapshot(label="after_plan")
        assert snap.exists()

        # Advance state
        mgr.record_phase_completion("build", 30.0, True)
        mgr.save()
        assert mgr.get_state().current_phase == "build"

        # Rollback
        restored = mgr.rollback_to_snapshot(snap)
        assert restored.current_phase == "plan"
        assert len(restored.all_adws) == 1

    def test_rollback_to_phase(
        self, workspace: Path, adw_id: str, base_kwargs: dict
    ) -> None:
        mgr = StateManager(adw_id, base_path=workspace)
        mgr.initialize(**base_kwargs)
        mgr.record_phase_completion("plan", 10.0, True)
        mgr.save()
        mgr.record_phase_completion("build", 30.0, True)
        mgr.save()
        mgr.record_phase_completion("test", 20.0, True)
        mgr.save()

        restored = mgr.rollback_to_phase("plan")
        assert restored.current_phase == "plan"
        assert len(restored.all_adws) == 1

    def test_rollback_creates_safety_backup(
        self, workspace: Path, adw_id: str, base_kwargs: dict
    ) -> None:
        mgr = StateManager(adw_id, base_path=workspace)
        mgr.initialize(**base_kwargs)
        mgr.record_phase_completion("plan", 10.0, True)
        mgr.save()
        snap = mgr.create_snapshot()

        mgr.record_phase_completion("build", 30.0, True)
        mgr.save()

        mgr.rollback_to_snapshot(snap)
        backups = [s for s in mgr.list_snapshots() if "pre_rollback" in s.name]
        assert len(backups) >= 1

    def test_list_snapshots_ordering(
        self, workspace: Path, adw_id: str, base_kwargs: dict
    ) -> None:
        mgr = StateManager(adw_id, base_path=workspace)
        mgr.initialize(**base_kwargs)

        import time
        s1 = mgr.create_snapshot(label="first")
        time.sleep(0.05)
        s2 = mgr.create_snapshot(label="second")

        snaps = mgr.list_snapshots()
        assert snaps[0] == s2  # newest first
        assert snaps[1] == s1


# ─── 5. Provider Clients ──────────────────────────────────────────────


class TestProviderClients:
    """Verify provider client instantiation and factory routing."""

    def test_claude_client_defaults(self, monkeypatch: pytest.MonkeyPatch) -> None:
        monkeypatch.setenv("ANTHROPIC_API_KEY", "sk-ant-test-fake-key")
        client = ClaudeClient()
        assert "claude" in client.model.lower()

    def test_gpt_client_fallback_chain(self, monkeypatch: pytest.MonkeyPatch) -> None:
        monkeypatch.setenv("OPENAI_API_KEY", "sk-test-fake-key")
        client = GPTClient()
        assert len(client.FALLBACK_CHAIN) >= 3
        assert "gpt-5.2" in client.FALLBACK_CHAIN

    def test_gemini_client_defaults(self, monkeypatch: pytest.MonkeyPatch) -> None:
        monkeypatch.setenv("GEMINI_API_KEY", "fake-gemini-key")
        client = GeminiClient()
        assert "gemini" in client.model_name.lower()

    def test_factory_creates_claude(self, monkeypatch: pytest.MonkeyPatch) -> None:
        monkeypatch.setenv("ANTHROPIC_API_KEY", "sk-ant-test-fake-key")
        client = ProviderClientFactory.create_claude()
        assert client is not None

    def test_factory_creates_gpt(self, monkeypatch: pytest.MonkeyPatch) -> None:
        monkeypatch.setenv("OPENAI_API_KEY", "sk-test-fake-key")
        client = ProviderClientFactory.create_gpt()
        assert client is not None

    def test_factory_creates_gemini(self, monkeypatch: pytest.MonkeyPatch) -> None:
        monkeypatch.setenv("GEMINI_API_KEY", "fake-gemini-key")
        client = ProviderClientFactory.create_gemini()
        assert client is not None


# ─── 6. Bridge Validation ─────────────────────────────────────────────


class TestBridgeValidation:
    """Verify bridge argument blocklist rejects dangerous patterns."""

    def test_import_bridge_model(self) -> None:
        from infrastructure.bridge.app import ExecuteRequest
        req = ExecuteRequest(
            script="adw_build_iso",
            project="themegpt-v2",
            args=["--adw-id", "abc123"],
        )
        assert req.script == "adw_build_iso"

    def test_safe_args_accepted(self) -> None:
        from infrastructure.bridge.app import ExecuteRequest
        safe = [
            "--adw-id=abc123",
            "--issue-number=42",
            "feat/issue-42-abc123",
            "path/to/file.py",
            "arg with spaces",
        ]
        req = ExecuteRequest(
            script="adw_test_iso",
            project="themegpt-v2",
            args=safe,
        )
        assert req.args == safe

    def test_dangerous_args_rejected(self) -> None:
        from infrastructure.bridge.app import ExecuteRequest
        dangerous = [
            "$(whoami)",        # command substitution
            "; rm -rf /",       # semicolon chaining
            "| cat /etc/passwd", # pipe
            "../../etc/passwd", # path traversal
            "foo`id`bar",       # backtick
            "${HOME}",          # variable expansion
            "arg > /tmp/out",   # redirect
            "cmd & bg",         # background
        ]
        for arg in dangerous:
            with pytest.raises(ValueError):
                ExecuteRequest(
                    script="adw_build_iso",
                    project="themegpt-v2",
                    args=[arg],
                )


# ─── 7. Trinity Protocol (structure only) ─────────────────────────────


class TestTrinityStructure:
    """Verify Trinity Protocol classes instantiate (no API calls)."""

    def test_trinity_plan_fields(self) -> None:
        from adws.adw_modules.trinity_protocol import TrinityPlan
        plan = TrinityPlan(
            adw_id="smoke123",
            issue_number=1,
            issue_title="Smoke test",
            issue_body="Body",
            architect_perspective="arch",
            critic_perspective="crit",
            advocate_perspective="adv",
            summary="summary",
            approach="approach",
            test_strategy="tests",
            files_to_create=["a.py"],
            files_to_modify=["b.py"],
            risks=["low"],
            estimated_complexity="low",
            created_at=datetime.now(UTC).isoformat(),
            total_tokens=100,
        )
        assert plan.adw_id == "smoke123"
        assert plan.estimated_complexity == "low"

    def test_trinity_perspective_fields(self) -> None:
        from adws.adw_modules.trinity_protocol import TrinityPerspective
        persp = TrinityPerspective(
            role="architect",
            provider="anthropic",
            model="claude-opus-4-5-20251101",
            content="analysis here",
            tokens_used=50,
            latency_ms=2500.0,
        )
        assert persp.role == "architect"
        assert persp.tokens_used == 50
        assert persp.provider == "anthropic"
        assert persp.latency_ms == 2500.0
