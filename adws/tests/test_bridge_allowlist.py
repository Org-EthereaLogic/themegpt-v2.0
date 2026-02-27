"""
Bridge Allowlist Tests

Verifies:
- Non-allowlisted scripts are rejected (400 at validation, 403 conceptually)
- All allowlisted scripts are accepted
- Script names cannot include paths
"""

import sys

import pytest
from fastapi.testclient import TestClient

from infrastructure.bridge.app import ALLOWLISTED_SCRIPTS

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


class TestBridgeAllowlist:
    def test_nonallowlisted_script_rejected(self, client, auth_header):
        response = client.post(
            "/execute",
            headers=auth_header,
            json={
                "script": "malicious_script",
                "project": "test-project",
                "args": []
            }
        )
        assert response.status_code == 422  # Pydantic validation error
        assert "not in allowlist" in response.json()["detail"][0]["msg"].lower()

    def test_all_allowlisted_scripts_valid(self, client, auth_header):
        for script_name in ALLOWLISTED_SCRIPTS:
            response = client.post(
                "/execute",
                headers=auth_header,
                json={
                    "script": script_name,
                    "project": "test-project",
                    "args": ["42"]
                }
            )
            # Should not fail validation (may fail execution due to missing project)
            assert response.status_code != 422 or "script" not in str(response.json())

    def test_script_with_path_rejected(self, client, auth_header):
        response = client.post(
            "/execute",
            headers=auth_header,
            json={
                "script": "../../../etc/passwd",
                "project": "test-project",
                "args": []
            }
        )
        assert response.status_code == 422

    def test_script_with_absolute_path_rejected(self, client, auth_header):
        response = client.post(
            "/execute",
            headers=auth_header,
            json={
                "script": "/usr/bin/evil",
                "project": "test-project",
                "args": []
            }
        )
        assert response.status_code == 422

    def test_script_with_extension_rejected(self, client, auth_header):
        response = client.post(
            "/execute",
            headers=auth_header,
            json={
                "script": "adw_plan_iso.py",
                "project": "test-project",
                "args": []
            }
        )
        assert response.status_code == 422
        # Should fail because "adw_plan_iso.py" is not in allowlist (only "adw_plan_iso")

    def test_empty_script_name_rejected(self, client, auth_header):
        response = client.post(
            "/execute",
            headers=auth_header,
            json={
                "script": "",
                "project": "test-project",
                "args": []
            }
        )
        assert response.status_code == 422

    def test_allowlist_contains_expected_scripts(self):
        """Verify the allowlist contains all expected ADWS workflow scripts."""
        expected_scripts = {
            "adw_plan_iso",
            "adw_build_iso",
            "adw_test_iso",
            "adw_review_iso",
            "adw_document_iso",
            "adw_ship_iso",
        }
        assert set(ALLOWLISTED_SCRIPTS.keys()) == expected_scripts

    def test_allowlist_paths_are_valid(self):
        """Verify allowlist script paths follow expected pattern."""
        for script_name, script_path in ALLOWLISTED_SCRIPTS.items():
            assert script_path.startswith("adws/scripts/")
            assert script_path.endswith(".py")
            assert script_name in script_path
