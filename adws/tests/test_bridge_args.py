"""
Bridge Argument Sanitization Tests

Verifies:
- Path traversal in project name is rejected
- Path traversal in arguments is rejected
- Valid arguments are accepted
"""

import sys

import pytest
from fastapi.testclient import TestClient

TEST_TOKEN = "test-secret-token-12345"


@pytest.fixture
def patched_token(monkeypatch):
    """Patch the auth token before creating the client."""
    bridge_module = sys.modules.get("infrastructure.bridge.app")
    if bridge_module is None:
        from infrastructure.bridge import app as _  # noqa: F401
        bridge_module = sys.modules["infrastructure.bridge.app"]
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


class TestBridgeArgSanitization:
    @pytest.mark.parametrize("project", [
        "../etc",
        "project/../secret",
        "/absolute/path",
        "project\\windows",
        "project/subdir",
    ])
    def test_path_traversal_in_project_rejected(self, client, auth_header, project):
        response = client.post(
            "/execute",
            headers=auth_header,
            json={
                "script": "adw_plan_iso",
                "project": project,
                "args": ["42"]
            }
        )
        assert response.status_code == 422

    @pytest.mark.parametrize("args", [
        ["../../../etc/passwd"],
        ["42", "--output=../secret"],
        ["42", "normal", ".."],
    ])
    def test_path_traversal_in_args_rejected(self, client, auth_header, args):
        response = client.post(
            "/execute",
            headers=auth_header,
            json={
                "script": "adw_plan_iso",
                "project": "test-project",
                "args": args
            }
        )
        assert response.status_code == 422

    def test_valid_project_name_accepted(self, client, auth_header):
        response = client.post(
            "/execute",
            headers=auth_header,
            json={
                "script": "adw_plan_iso",
                "project": "my-project-123",
                "args": ["42"]
            }
        )
        # Should pass validation (may fail execution if project doesn't exist)
        assert response.status_code != 422 or "project" not in str(response.json())

    @pytest.mark.parametrize("project", [
        "valid-project",
        "project123",
        "my_project",
        "Project-Name-123",
        "a",
        "project-with-many-hyphens",
    ])
    def test_valid_project_names_accepted(self, client, auth_header, project):
        response = client.post(
            "/execute",
            headers=auth_header,
            json={
                "script": "adw_plan_iso",
                "project": project,
                "args": ["42"]
            }
        )
        # Should not fail validation (may fail for missing project)
        if response.status_code == 422:
            # Ensure it's not a project validation error
            detail = response.json().get("detail", [])
            for error in detail:
                if isinstance(error, dict):
                    assert "project" not in error.get("loc", [])

    @pytest.mark.parametrize("project", [
        "project with spaces",
        "project@name",
        "project#name",
        "project$name",
        "project%name",
        "project&name",
        "project*name",
        "project(name)",
        "project[name]",
        "project{name}",
        "project|name",
        "project`name",
        "project~name",
        "project!name",
        "project+name",
        "project=name",
    ])
    def test_invalid_characters_in_project_rejected(self, client, auth_header, project):
        response = client.post(
            "/execute",
            headers=auth_header,
            json={
                "script": "adw_plan_iso",
                "project": project,
                "args": ["42"]
            }
        )
        assert response.status_code == 422

    @pytest.mark.parametrize("args", [
        ["42"],
        ["42", "abc12345"],
        ["issue=42"],
        ["branch:feature/test"],
        ["@user"],
        ["--flag=value"],
        ["path/to/file.txt"],
        ["https://example.com"],
    ])
    def test_valid_args_accepted(self, client, auth_header, args):
        response = client.post(
            "/execute",
            headers=auth_header,
            json={
                "script": "adw_plan_iso",
                "project": "test-project",
                "args": args
            }
        )
        # Should not fail validation (may fail for missing project)
        if response.status_code == 422:
            detail = response.json().get("detail", [])
            for error in detail:
                if isinstance(error, dict):
                    assert "args" not in error.get("loc", [])

    @pytest.mark.parametrize("args", [
        ["arg\twith\ttabs"],
        ["arg\nwith\nnewlines"],
        ["arg`with`backticks"],
        ["arg$with$dollars"],
        ["arg;with;semicolons"],
        ["arg|with|pipes"],
        ["arg<with>angles"],
        ["arg&with&ampersands"],
        ["$(whoami)"],
        ["${HOME}"],
        ["arg&&rm -rf /"],
        ["arg||true"],
    ])
    def test_dangerous_args_rejected(self, client, auth_header, args):
        response = client.post(
            "/execute",
            headers=auth_header,
            json={
                "script": "adw_plan_iso",
                "project": "test-project",
                "args": args
            }
        )
        assert response.status_code == 422

    @pytest.mark.parametrize("args", [
        ["Fix bug in login page"],
        ["issue title with spaces"],
        ["feat/my-feature branch"],
        ["file name with spaces.txt"],
        ["--message=hello world"],
    ])
    def test_args_with_spaces_accepted(self, client, auth_header, args):
        """Spaces are safe with subprocess list args (no shell=True)."""
        response = client.post(
            "/execute",
            headers=auth_header,
            json={
                "script": "adw_plan_iso",
                "project": "test-project",
                "args": args
            }
        )
        # Should not fail arg validation (may fail for missing project)
        if response.status_code == 422:
            detail = response.json().get("detail", [])
            for error in detail:
                if isinstance(error, dict):
                    assert "args" not in error.get("loc", [])

    def test_empty_args_accepted(self, client, auth_header):
        response = client.post(
            "/execute",
            headers=auth_header,
            json={
                "script": "adw_plan_iso",
                "project": "test-project",
                "args": []
            }
        )
        # Empty args should be valid
        if response.status_code == 422:
            detail = response.json().get("detail", [])
            for error in detail:
                if isinstance(error, dict):
                    assert "args" not in error.get("loc", [])
