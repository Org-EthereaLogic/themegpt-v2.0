"""
Bridge Authentication Tests

Verifies:
- Requests without Authorization header are rejected (401)
- Requests with invalid token are rejected (401)
- Requests with wrong format are rejected (401)
- Valid Bearer token is accepted
"""

import sys

import pytest
from fastapi.testclient import TestClient

TEST_TOKEN = "test-secret-token-12345"


@pytest.fixture
def patched_token(monkeypatch):
    """Patch the auth token before creating the client."""
    # Get the module from sys.modules to ensure we have the actual module
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


class TestBridgeAuth:
    def test_missing_auth_header_returns_401(self, client):
        response = client.post("/execute", json={
            "script": "adw_plan_iso",
            "project": "test-project",
            "args": ["42"]
        })
        assert response.status_code == 401

    def test_invalid_token_returns_401(self, client):
        response = client.post(
            "/execute",
            headers={"Authorization": "Bearer wrong-token"},
            json={
                "script": "adw_plan_iso",
                "project": "test-project",
                "args": ["42"]
            }
        )
        assert response.status_code == 401

    def test_wrong_auth_format_returns_401(self, client):
        response = client.post(
            "/execute",
            headers={"Authorization": f"Basic {TEST_TOKEN}"},
            json={
                "script": "adw_plan_iso",
                "project": "test-project",
                "args": ["42"]
            }
        )
        assert response.status_code == 401

    def test_valid_token_is_accepted(self, client):
        # Note: This will fail at project validation stage, not auth
        response = client.post(
            "/execute",
            headers={"Authorization": f"Bearer {TEST_TOKEN}"},
            json={
                "script": "adw_plan_iso",
                "project": "nonexistent",
                "args": ["42"]
            }
        )
        # Should not be 401 - auth passed
        assert response.status_code != 401

    def test_missing_bearer_prefix_returns_401(self, client):
        response = client.post(
            "/execute",
            headers={"Authorization": TEST_TOKEN},
            json={
                "script": "adw_plan_iso",
                "project": "test-project",
                "args": ["42"]
            }
        )
        assert response.status_code == 401

    def test_empty_authorization_header_returns_401(self, client):
        response = client.post(
            "/execute",
            headers={"Authorization": ""},
            json={
                "script": "adw_plan_iso",
                "project": "test-project",
                "args": ["42"]
            }
        )
        assert response.status_code == 401

    def test_bearer_with_extra_spaces_returns_401(self, client):
        response = client.post(
            "/execute",
            headers={"Authorization": f"Bearer  {TEST_TOKEN}"},  # Extra space
            json={
                "script": "adw_plan_iso",
                "project": "test-project",
                "args": ["42"]
            }
        )
        # Our implementation splits on first space, so extra spaces make token invalid
        assert response.status_code == 401
