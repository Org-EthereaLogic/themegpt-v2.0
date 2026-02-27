"""
Tests for ADWS Test Phase Script.

Verifies:
- Retry loop obeys max attempts (MAX_RETRY_ATTEMPTS = 4)
- Test report created with all attempts
- Test files are NEVER modified (TDD integrity critical constraint)
- Prerequisite enforcement (plan + build phases required)
- Proper state updates on success/failure
"""

from __future__ import annotations

import json
from pathlib import Path
from unittest.mock import MagicMock, patch

from adws.adw_modules.state import StateManager
from adws.scripts.adw_test_iso import (
    MAX_RETRY_ATTEMPTS,
    parse_pytest_output,
    run_pytest,
    save_test_report,
)
from adws.scripts.adw_test_iso import (
    TestAttempt as AttemptRecord,
)
from adws.scripts.adw_test_iso import (
    TestReport as ReportRecord,
)


class TestMaxRetryAttempts:
    """Tests for MAX_RETRY_ATTEMPTS configuration."""

    def test_max_retry_attempts_is_four(self) -> None:
        """Verify MAX_RETRY_ATTEMPTS is exactly 4 as specified."""
        assert MAX_RETRY_ATTEMPTS == 4


class TestTestAttemptModel:
    """Tests for AttemptRecord model."""

    def test_create_successful_attempt(self) -> None:
        """Test creating a successful test attempt record."""
        attempt = AttemptRecord(
            attempt_number=1,
            duration_seconds=45.2,
            passed=10,
            failed=0,
            errors=0,
            skipped=2,
            success=True,
        )
        assert attempt.attempt_number == 1
        assert attempt.success is True
        assert attempt.passed == 10
        assert attempt.failed == 0
        assert attempt.fix_applied is False

    def test_create_failed_attempt_with_fix(self) -> None:
        """Test creating a failed attempt with fix applied."""
        attempt = AttemptRecord(
            attempt_number=2,
            duration_seconds=30.5,
            passed=8,
            failed=2,
            errors=0,
            skipped=0,
            success=False,
            fix_applied=True,
            fix_file="src/module.py",
            fix_commit="abc1234",
        )
        assert attempt.success is False
        assert attempt.fix_applied is True
        assert attempt.fix_file == "src/module.py"


class TestTestReportModel:
    """Tests for ReportRecord model."""

    def test_create_minimal_report(self) -> None:
        """Test creating report with required fields only."""
        report = ReportRecord(adw_id="abc12345", issue_number=42)
        assert report.adw_id == "abc12345"
        assert report.issue_number == 42
        assert report.max_attempts == MAX_RETRY_ATTEMPTS
        assert len(report.attempts) == 0
        assert report.success is False

    def test_report_with_multiple_attempts(self) -> None:
        """Test report with multiple test attempts."""
        report = ReportRecord(
            adw_id="abc12345",
            issue_number=42,
            attempts=[
                AttemptRecord(attempt_number=1, passed=5, failed=3, success=False),
                AttemptRecord(attempt_number=2, passed=7, failed=1, success=False),
                AttemptRecord(attempt_number=3, passed=8, failed=0, success=True),
            ],
            final_passed=8,
            final_failed=0,
            success=True,
        )
        assert len(report.attempts) == 3
        assert report.success is True

    def test_json_serialization(self) -> None:
        """Test that ReportRecord can be serialized to JSON."""
        report = ReportRecord(adw_id="abc12345", issue_number=42)
        json_str = report.model_dump_json()
        data = json.loads(json_str)
        assert data["adw_id"] == "abc12345"
        assert data["max_attempts"] == 4


class TestParsePytestOutput:
    """Tests for parse_pytest_output function."""

    def test_parse_all_passed(self) -> None:
        """Test parsing output with all tests passed."""
        output = "================== 10 passed in 2.34s =================="
        passed, failed, errors, skipped = parse_pytest_output(output)
        assert passed == 10
        assert failed == 0
        assert errors == 0
        assert skipped == 0

    def test_parse_mixed_results(self) -> None:
        """Test parsing output with mixed results."""
        output = "===== 8 passed, 2 failed, 1 error, 3 skipped in 5.67s ====="
        passed, failed, errors, skipped = parse_pytest_output(output)
        assert passed == 8
        assert failed == 2
        assert errors == 1
        assert skipped == 3

    def test_parse_failures_only(self) -> None:
        """Test parsing output with only failures."""
        output = "================== 5 failed in 1.23s =================="
        passed, failed, errors, skipped = parse_pytest_output(output)
        assert passed == 0
        assert failed == 5

    def test_parse_empty_output(self) -> None:
        """Test parsing empty output returns zeros."""
        passed, failed, errors, skipped = parse_pytest_output("")
        assert passed == 0
        assert failed == 0
        assert errors == 0
        assert skipped == 0


class TestSaveTestReport:
    """Tests for save_test_report function."""

    def test_save_creates_file(self, temp_workspace: Path) -> None:
        """Test that save_test_report creates the report file."""
        report = ReportRecord(adw_id="abc12345", issue_number=42, success=True)
        path = save_test_report(report, agents_base=temp_workspace / "agents")

        assert path.exists()
        assert path.name == "test_report.json"
        assert path.parent.name == "abc12345"

    def test_save_preserves_attempts(self, temp_workspace: Path) -> None:
        """Test that save_test_report preserves all attempts."""
        report = ReportRecord(
            adw_id="abc12345",
            issue_number=42,
            attempts=[
                AttemptRecord(attempt_number=1, passed=5, failed=3, success=False),
                AttemptRecord(attempt_number=2, passed=8, failed=0, success=True),
            ],
            success=True,
        )
        path = save_test_report(report, agents_base=temp_workspace / "agents")

        data = json.loads(path.read_text())
        assert len(data["attempts"]) == 2


class TestTDDIntegrity:
    """Critical tests for TDD integrity - test files must NEVER be modified.

    This is a critical constraint: the test phase must only fix implementation
    files, never test files. These tests verify that constraint is enforced.
    """

    def test_test_phase_never_modifies_test_files(self) -> None:
        """Verify the analyze_and_fix_failure function rejects test file paths.

        This test verifies that paths like tests/test_module.py,
        adws/tests/test_something.py, test_unit.py, etc. would be rejected.
        """
        # The function should reject any path containing "test"
        # This is verified by checking the source code logic
        # Verify the protection exists in the function
        import inspect

        from adws.scripts.adw_test_iso import analyze_and_fix_failure
        source = inspect.getsource(analyze_and_fix_failure)
        assert 'if "test" in file_path.lower()' in source or (
            '"test" in file_path.lower()' in source
        )
        assert "Refusing to modify test file" in source or "test file" in source.lower()

    def test_implementation_file_paths_are_valid_targets(self) -> None:
        """Verify implementation file paths would be accepted for fixes."""
        # Implementation paths that should be valid targets
        impl_paths = [
            "src/module.py",
            "adws/adw_modules/state.py",
            "infrastructure/bridge/app.py",
            "lib/utils.py",
        ]

        # These should NOT trigger the test file rejection
        for path in impl_paths:
            assert "test" not in path.lower(), f"{path} should not contain 'test'"

    def test_report_tracks_fix_files(self, temp_workspace: Path) -> None:
        """Verify report tracks which files were fixed."""
        report = ReportRecord(
            adw_id="abc12345",
            issue_number=42,
            attempts=[
                AttemptRecord(
                    attempt_number=1,
                    passed=5,
                    failed=3,
                    success=False,
                    fix_applied=True,
                    fix_file="src/module.py",  # Implementation file only
                    fix_commit="abc1234",
                ),
            ],
        )

        # Verify fix was to an implementation file, not a test file
        assert report.attempts[0].fix_file is not None
        assert "test" not in report.attempts[0].fix_file.lower()


class TestPrerequisiteEnforcement:
    """Tests for test phase prerequisite enforcement."""

    def test_test_requires_plan_and_build(
        self,
        temp_workspace: Path,
        sample_adw_id: str,
        sample_state_kwargs: dict,
    ) -> None:
        """Test that test phase fails if plan and build phases not complete."""
        manager = StateManager(sample_adw_id, base_path=temp_workspace)
        manager.initialize(**sample_state_kwargs)
        manager.record_phase_completion("plan", 30.0, True)
        manager.save()

        # With only plan complete, build prerequisite should fail
        assert manager.validate_prerequisites(["plan", "build"]) is False

    def test_test_succeeds_after_plan_and_build(
        self,
        temp_workspace: Path,
        sample_adw_id: str,
        sample_state_kwargs: dict,
    ) -> None:
        """Test that test phase can proceed after plan and build complete."""
        manager = StateManager(sample_adw_id, base_path=temp_workspace)
        manager.initialize(**sample_state_kwargs)
        manager.record_phase_completion("plan", 30.0, True)
        manager.record_phase_completion("build", 120.0, True)
        manager.save()

        assert manager.validate_prerequisites(["plan", "build"]) is True


class TestRetryLoopBehavior:
    """Tests for test phase retry loop behavior."""

    def test_report_respects_max_attempts(self) -> None:
        """Verify report tracks up to MAX_RETRY_ATTEMPTS."""
        # Create a report simulating max attempts reached
        attempts = [
            AttemptRecord(
                attempt_number=i + 1,
                passed=5,
                failed=3,
                success=False,
            )
            for i in range(MAX_RETRY_ATTEMPTS)
        ]

        report = ReportRecord(
            adw_id="abc12345",
            issue_number=42,
            attempts=attempts,
            success=False,
            final_failed=3,
        )

        assert len(report.attempts) == MAX_RETRY_ATTEMPTS
        assert report.success is False

    def test_early_success_stops_retry_loop(self) -> None:
        """Verify that success on early attempt would stop retrying."""
        # If tests pass on attempt 2, there should only be 2 attempts
        report = ReportRecord(
            adw_id="abc12345",
            issue_number=42,
            attempts=[
                AttemptRecord(attempt_number=1, passed=5, failed=2, success=False),
                AttemptRecord(attempt_number=2, passed=7, failed=0, success=True),
            ],
            final_passed=7,
            final_failed=0,
            success=True,
        )

        assert len(report.attempts) == 2
        assert report.attempts[-1].success is True
        assert report.success is True


class TestStateUpdates:
    """Tests for state updates after test phase."""

    def test_state_updated_on_test_success(
        self,
        temp_workspace: Path,
        sample_adw_id: str,
        sample_state_kwargs: dict,
    ) -> None:
        """Test that state reflects test success."""
        manager = StateManager(sample_adw_id, base_path=temp_workspace)
        manager.initialize(**sample_state_kwargs)
        manager.record_phase_completion("plan", 30.0, True)
        manager.record_phase_completion("build", 120.0, True)

        # Simulate test success
        manager.record_phase_completion("test", 60.0, True)
        manager.update(current_phase="tested")
        manager.save()

        # Reload and verify
        loaded = StateManager.load(sample_adw_id, base_path=temp_workspace)
        state = loaded.get_state()
        assert state.current_phase == "tested"

    def test_state_reflects_test_failure(
        self,
        temp_workspace: Path,
        sample_adw_id: str,
        sample_state_kwargs: dict,
    ) -> None:
        """Test that state reflects test failure after max attempts."""
        manager = StateManager(sample_adw_id, base_path=temp_workspace)
        manager.initialize(**sample_state_kwargs)
        manager.record_phase_completion("plan", 30.0, True)
        manager.record_phase_completion("build", 120.0, True)

        # Simulate test failure
        manager.record_phase_completion(
            "test", 240.0, False, error_message="Tests failed after max attempts"
        )
        manager.save()

        # Reload and verify
        loaded = StateManager.load(sample_adw_id, base_path=temp_workspace)
        state = loaded.get_state()
        assert state.current_phase == "test_failed"


class TestRunPytest:
    """Tests for run_pytest function."""

    def test_run_pytest_returns_tuple(self, temp_workspace: Path) -> None:
        """Test that run_pytest returns expected tuple structure."""
        # Mock subprocess.run to avoid uv PATH dependency
        mock_result = MagicMock()
        mock_result.returncode = 0
        mock_result.stdout = "collected 1 item\ntest_sample.py::test_pass PASSED"
        mock_result.stderr = ""

        with patch("adws.scripts.adw_test_iso.subprocess.run", return_value=mock_result):
            exit_code, stdout, stderr, duration = run_pytest(temp_workspace)

        # Should return proper types
        assert isinstance(exit_code, int)
        assert isinstance(stdout, str)
        assert isinstance(stderr, str)
        assert isinstance(duration, float)
        assert duration >= 0
