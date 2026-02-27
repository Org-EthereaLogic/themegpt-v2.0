"""
Bridge Execution Tests

Verifies:
- Health endpoint returns correct response
- Execute endpoint handles missing projects
- Execute endpoint handles script execution
- Execution logging works correctly
"""

import json
import sys
import tempfile
from pathlib import Path
from unittest.mock import MagicMock, patch

import pytest
from fastapi.testclient import TestClient

from infrastructure.bridge.app import (
    EXECUTION_TIMEOUT,
    ExecuteRequest,
    ExecuteResponse,
    HealthResponse,
    log_execution,
)

TEST_TOKEN = "test-secret-token-12345"


def get_bridge_module():
    """Get the bridge module from sys.modules."""
    bridge_module = sys.modules.get("infrastructure.bridge.app")
    if bridge_module is None:
        from infrastructure.bridge import app as _  # noqa: F401
        bridge_module = sys.modules["infrastructure.bridge.app"]
    return bridge_module


@pytest.fixture
def patched_token(monkeypatch):
    """Patch the auth token before creating the client."""
    bridge_module = get_bridge_module()
    monkeypatch.setattr(bridge_module, "BRIDGE_AUTH_TOKEN", TEST_TOKEN)
    return TEST_TOKEN


@pytest.fixture
def client(patched_token):
    """Create a test client after the token is patched."""
    from infrastructure.bridge.app import app
    return TestClient(app)


@pytest.fixture
def auth_header():
    return {"Authorization": f"Bearer {TEST_TOKEN}"}


@pytest.fixture
def temp_workspace(monkeypatch, tmp_path):
    """Create a temporary workspace with a test project."""
    workspace = tmp_path / "workspace"
    workspace.mkdir()

    # Create test project
    project = workspace / "test-project"
    project.mkdir()

    # Create adws/scripts directory
    scripts_dir = project / "adws" / "scripts"
    scripts_dir.mkdir(parents=True)

    # Create a simple test script
    test_script = scripts_dir / "adw_plan_iso.py"
    test_script.write_text("""#!/usr/bin/env python3
import sys
print("Planning issue:", sys.argv[1] if len(sys.argv) > 1 else "none")
print("Success!")
""")

    # Patch WORKSPACE_PATH
    bridge_module = get_bridge_module()
    monkeypatch.setattr(bridge_module, "WORKSPACE_PATH", workspace)

    return workspace


@pytest.fixture
def temp_log_path(monkeypatch, tmp_path):
    """Create a temporary log directory."""
    log_dir = tmp_path / "logs"
    log_dir.mkdir()

    bridge_module = get_bridge_module()
    monkeypatch.setattr(bridge_module, "LOG_PATH", log_dir)

    return log_dir


class TestHealthEndpoint:
    def test_health_returns_200(self):
        from infrastructure.bridge.app import app
        client = TestClient(app)
        response = client.get("/health")
        assert response.status_code == 200

    def test_health_returns_ok_status(self):
        from infrastructure.bridge.app import app
        client = TestClient(app)
        response = client.get("/health")
        data = response.json()
        assert data["status"] == "ok"

    def test_health_returns_version(self):
        from infrastructure.bridge.app import app
        client = TestClient(app)
        response = client.get("/health")
        data = response.json()
        assert data["version"] == "1.0.0"

    def test_health_returns_timestamp(self):
        from infrastructure.bridge.app import app
        client = TestClient(app)
        response = client.get("/health")
        data = response.json()
        assert "timestamp" in data

    def test_health_no_auth_required(self):
        # Health endpoint should work without any auth headers
        from infrastructure.bridge.app import app
        client = TestClient(app)
        response = client.get("/health")
        assert response.status_code == 200


class TestExecuteEndpoint:
    def test_missing_project_returns_400(self, client, auth_header, monkeypatch):
        """Execute should return 400 for non-existent project."""
        # Set up a valid workspace
        with tempfile.TemporaryDirectory() as tmpdir:
            bridge_module = get_bridge_module()
            monkeypatch.setattr(bridge_module, "WORKSPACE_PATH", Path(tmpdir))

            response = client.post(
                "/execute",
                headers=auth_header,
                json={
                    "script": "adw_plan_iso",
                    "project": "nonexistent-project",
                    "args": ["42"]
                }
            )
            assert response.status_code == 400
            assert "does not exist" in response.json()["detail"]

    def test_execute_returns_structured_response(
        self, client, auth_header, temp_workspace, temp_log_path
    ):
        """Execute should return structured ExecuteResponse."""
        with patch("infrastructure.bridge.app.subprocess.run") as mock_run:
            mock_run.return_value = MagicMock(
                returncode=0,
                stdout="Planning complete",
                stderr=""
            )

            response = client.post(
                "/execute",
                headers=auth_header,
                json={
                    "script": "adw_plan_iso",
                    "project": "test-project",
                    "args": ["42"]
                }
            )

            assert response.status_code == 200
            data = response.json()

            assert "success" in data
            assert "script" in data
            assert "project" in data
            assert "exit_code" in data
            assert "stdout" in data
            assert "stderr" in data
            assert "duration_seconds" in data
            assert "timestamp" in data

    def test_execute_success_true_on_zero_exit_code(
        self, client, auth_header, temp_workspace, temp_log_path
    ):
        """success should be True when exit_code is 0."""
        with patch("infrastructure.bridge.app.subprocess.run") as mock_run:
            mock_run.return_value = MagicMock(
                returncode=0,
                stdout="Success",
                stderr=""
            )

            response = client.post(
                "/execute",
                headers=auth_header,
                json={
                    "script": "adw_plan_iso",
                    "project": "test-project",
                    "args": ["42"]
                }
            )

            data = response.json()
            assert data["success"] is True
            assert data["exit_code"] == 0

    def test_execute_success_false_on_nonzero_exit_code(
        self, client, auth_header, temp_workspace, temp_log_path
    ):
        """success should be False when exit_code is non-zero."""
        with patch("infrastructure.bridge.app.subprocess.run") as mock_run:
            mock_run.return_value = MagicMock(
                returncode=1,
                stdout="",
                stderr="Error occurred"
            )

            response = client.post(
                "/execute",
                headers=auth_header,
                json={
                    "script": "adw_plan_iso",
                    "project": "test-project",
                    "args": ["42"]
                }
            )

            data = response.json()
            assert data["success"] is False
            assert data["exit_code"] == 1

    def test_execute_captures_stdout(
        self, client, auth_header, temp_workspace, temp_log_path
    ):
        """Execute should capture stdout from script."""
        expected_output = "This is stdout output\nWith multiple lines"
        with patch("infrastructure.bridge.app.subprocess.run") as mock_run:
            mock_run.return_value = MagicMock(
                returncode=0,
                stdout=expected_output,
                stderr=""
            )

            response = client.post(
                "/execute",
                headers=auth_header,
                json={
                    "script": "adw_plan_iso",
                    "project": "test-project",
                    "args": ["42"]
                }
            )

            data = response.json()
            assert data["stdout"] == expected_output

    def test_execute_captures_stderr(
        self, client, auth_header, temp_workspace, temp_log_path
    ):
        """Execute should capture stderr from script."""
        expected_error = "Warning: something happened"
        with patch("infrastructure.bridge.app.subprocess.run") as mock_run:
            mock_run.return_value = MagicMock(
                returncode=0,
                stdout="",
                stderr=expected_error
            )

            response = client.post(
                "/execute",
                headers=auth_header,
                json={
                    "script": "adw_plan_iso",
                    "project": "test-project",
                    "args": ["42"]
                }
            )

            data = response.json()
            assert data["stderr"] == expected_error


class TestExecutionLogging:
    def test_log_execution_creates_file(self, temp_log_path):
        """log_execution should create JSONL file."""
        log_execution(
            script="adw_plan_iso",
            project="test-project",
            args=["42"],
            exit_code=0,
            duration=1.5,
            success=True,
        )

        log_file = temp_log_path / "executions.jsonl"
        assert log_file.exists()

    def test_log_execution_writes_json_line(self, temp_log_path):
        """log_execution should write valid JSON line."""
        log_execution(
            script="adw_plan_iso",
            project="test-project",
            args=["42", "abc123"],
            exit_code=0,
            duration=2.5,
            success=True,
        )

        log_file = temp_log_path / "executions.jsonl"
        with open(log_file) as f:
            line = f.readline()
            entry = json.loads(line)

        assert entry["script"] == "adw_plan_iso"
        assert entry["project"] == "test-project"
        assert entry["args"] == ["42", "abc123"]
        assert entry["exit_code"] == 0
        assert entry["duration_seconds"] == 2.5
        assert entry["success"] is True
        assert "timestamp" in entry

    def test_log_execution_appends_multiple_entries(self, temp_log_path):
        """log_execution should append entries, not overwrite."""
        for i in range(3):
            log_execution(
                script="adw_plan_iso",
                project=f"project-{i}",
                args=[str(i)],
                exit_code=0,
                duration=float(i),
                success=True,
            )

        log_file = temp_log_path / "executions.jsonl"
        with open(log_file) as f:
            lines = f.readlines()

        assert len(lines) == 3

        for i, line in enumerate(lines):
            entry = json.loads(line)
            assert entry["project"] == f"project-{i}"


class TestExecutionTimeout:
    def test_execution_timeout_constant_is_set(self):
        """Verify EXECUTION_TIMEOUT is set to expected value."""
        assert EXECUTION_TIMEOUT == 600  # 10 minutes

    def test_timeout_returns_500_error(
        self, client, auth_header, temp_workspace, temp_log_path
    ):
        """Timeout should return 500 error."""
        import subprocess

        with patch("infrastructure.bridge.app.subprocess.run") as mock_run:
            mock_run.side_effect = subprocess.TimeoutExpired(
                cmd=["uv", "run", "python", "test.py"],
                timeout=EXECUTION_TIMEOUT
            )

            response = client.post(
                "/execute",
                headers=auth_header,
                json={
                    "script": "adw_plan_iso",
                    "project": "test-project",
                    "args": ["42"]
                }
            )

            assert response.status_code == 500
            assert "timed out" in response.json()["detail"].lower()


class TestModels:
    def test_health_response_defaults(self):
        """HealthResponse should have correct defaults."""
        response = HealthResponse()
        assert response.status == "ok"
        assert response.version == "1.0.0"
        assert response.timestamp is not None

    def test_execute_request_validation(self):
        """ExecuteRequest should validate fields."""
        # Valid request
        request = ExecuteRequest(
            script="adw_plan_iso",
            project="my-project",
            args=["42"]
        )
        assert request.script == "adw_plan_iso"
        assert request.project == "my-project"
        assert request.args == ["42"]

    def test_execute_request_default_args(self):
        """ExecuteRequest should default args to empty list."""
        request = ExecuteRequest(
            script="adw_plan_iso",
            project="my-project"
        )
        assert request.args == []

    def test_execute_response_fields(self):
        """ExecuteResponse should contain all required fields."""
        response = ExecuteResponse(
            success=True,
            script="adw_plan_iso",
            project="test",
            exit_code=0,
            stdout="output",
            stderr="",
            duration_seconds=1.5,
        )

        assert response.success is True
        assert response.script == "adw_plan_iso"
        assert response.project == "test"
        assert response.exit_code == 0
        assert response.stdout == "output"
        assert response.stderr == ""
        assert response.duration_seconds == 1.5
        assert response.timestamp is not None
