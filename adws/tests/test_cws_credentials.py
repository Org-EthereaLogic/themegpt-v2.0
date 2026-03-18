"""Tests for secure CWS OAuth credential storage."""

from __future__ import annotations

import json
from pathlib import Path

import pytest

from adw_modules import credentials
import setup_cws_auth


class FakeKeyring:
    """In-memory keyring replacement for credential tests."""

    def __init__(self) -> None:
        self.values: dict[tuple[str, str], str] = {}

    def get_password(self, service: str, account: str) -> str | None:
        return self.values.get((service, account))

    def set_password(self, service: str, account: str, payload: str) -> None:
        self.values[(service, account)] = payload


class FakeInstalledAppFlow:
    """Small InstalledAppFlow stand-in for OAuth setup tests."""

    def __init__(self, creds: object) -> None:
        self._creds = creds

    def run_local_server(self, port: int) -> object:
        assert port == 8080
        return self._creds


class FakeOAuthCreds:
    """Credential object with the fields used by secure storage helpers."""

    def __init__(
        self,
        *,
        token: str = "access-token",
        refresh_token: str = "refresh-token",
        expired: bool = False,
    ) -> None:
        self.token = token
        self.refresh_token = refresh_token
        self.token_uri = "https://oauth2.googleapis.com/token"
        self.client_id = "client-id"
        self.client_secret = "client-secret"
        self.scopes = list(credentials.CWS_SCOPES)
        self.expired = expired
        self.refresh_calls = 0

    def refresh(self, _request: object) -> None:
        self.refresh_calls += 1
        self.token = "refreshed-token"
        self.expired = False


class CapturingClient:
    """Collect the credentials passed into the client constructor."""

    def __init__(self, credentials: object) -> None:
        self.credentials = credentials


@pytest.fixture
def fake_keyring(monkeypatch: pytest.MonkeyPatch) -> FakeKeyring:
    """Patch the credential module to use an in-memory keyring."""
    store = FakeKeyring()
    monkeypatch.setattr(credentials, "keyring", store)
    monkeypatch.setattr(setup_cws_auth, "store_cws_authorized_user_info", credentials.store_cws_authorized_user_info)
    monkeypatch.setattr(setup_cws_auth, "build_cws_authorized_user_info", credentials.build_cws_authorized_user_info)
    return store


def test_setup_cws_auth_stores_credentials_in_keychain_without_file_writes(
    monkeypatch: pytest.MonkeyPatch,
    tmp_path: Path,
    fake_keyring: FakeKeyring,
    capsys: pytest.CaptureFixture[str],
) -> None:
    client_secrets = tmp_path / "client_secrets.json"
    client_secrets.write_text("{}")

    def forbidden_write_text(self: Path, *_args: object, **_kwargs: object) -> int:
        raise AssertionError(f"unexpected plaintext write to {self}")

    monkeypatch.setattr(setup_cws_auth, "CLIENT_SECRETS", client_secrets)
    monkeypatch.setattr(Path, "write_text", forbidden_write_text)

    fake_creds = FakeOAuthCreds()

    def fake_from_client_secrets_file(path: str, scopes: list[str]) -> FakeInstalledAppFlow:
        assert path == str(client_secrets)
        assert scopes == credentials.CWS_SCOPES
        return FakeInstalledAppFlow(fake_creds)

    monkeypatch.setattr(
        setup_cws_auth.InstalledAppFlow,
        "from_client_secrets_file",
        staticmethod(fake_from_client_secrets_file),
    )

    setup_cws_auth.main()

    saved_payload = fake_keyring.get_password(
        credentials.CWS_KEYCHAIN_SERVICE,
        credentials.CWS_KEYCHAIN_ACCOUNT,
    )
    assert saved_payload is not None
    assert json.loads(saved_payload)["refresh_token"] == "refresh-token"

    output = capsys.readouterr().out
    assert "system keychain" in output
    assert "No CWS secret entry is needed in adws/.env." in output


def test_cws_ga4_client_loads_credentials_from_keychain(
    monkeypatch: pytest.MonkeyPatch,
    fake_keyring: FakeKeyring,
) -> None:
    monkeypatch.setattr(credentials, "_load_env", lambda: None)
    fake_keyring.set_password(
        credentials.CWS_KEYCHAIN_SERVICE,
        credentials.CWS_KEYCHAIN_ACCOUNT,
        json.dumps(
            {
                "token": "access-token",
                "refresh_token": "refresh-token",
                "token_uri": "https://oauth2.googleapis.com/token",
                "client_id": "client-id",
                "client_secret": "client-secret",
                "scopes": credentials.CWS_SCOPES,
            }
        ),
    )

    import google.oauth2.credentials as google_credentials

    fake_creds = FakeOAuthCreds()
    calls: dict[str, object] = {}

    def fake_from_authorized_user_info(
        cls: type[object],
        info: dict[str, object],
        scopes: list[str] | None = None,
    ) -> FakeOAuthCreds:
        calls["info"] = info
        calls["scopes"] = scopes
        return fake_creds

    monkeypatch.setattr(
        google_credentials.Credentials,
        "from_authorized_user_info",
        classmethod(fake_from_authorized_user_info),
    )

    client = credentials.cws_ga4_client(CapturingClient)

    assert isinstance(client, CapturingClient)
    assert client.credentials is fake_creds
    assert calls["scopes"] == credentials.CWS_SCOPES
    assert fake_creds.refresh_calls == 0


def test_cws_ga4_client_refresh_persists_back_to_keychain(
    monkeypatch: pytest.MonkeyPatch,
    fake_keyring: FakeKeyring,
) -> None:
    monkeypatch.setattr(credentials, "_load_env", lambda: None)
    fake_keyring.set_password(
        credentials.CWS_KEYCHAIN_SERVICE,
        credentials.CWS_KEYCHAIN_ACCOUNT,
        json.dumps(
            {
                "token": "stale-token",
                "refresh_token": "refresh-token",
                "token_uri": "https://oauth2.googleapis.com/token",
                "client_id": "client-id",
                "client_secret": "client-secret",
                "scopes": credentials.CWS_SCOPES,
            }
        ),
    )

    import google.oauth2.credentials as google_credentials

    fake_creds = FakeOAuthCreds(token="stale-token", expired=True)

    def fake_from_authorized_user_info(
        cls: type[object],
        info: dict[str, object],
        scopes: list[str] | None = None,
    ) -> FakeOAuthCreds:
        assert info["token"] == "stale-token"
        assert scopes == credentials.CWS_SCOPES
        return fake_creds

    monkeypatch.setattr(
        google_credentials.Credentials,
        "from_authorized_user_info",
        classmethod(fake_from_authorized_user_info),
    )

    client = credentials.cws_ga4_client(CapturingClient)

    assert isinstance(client, CapturingClient)
    assert fake_creds.refresh_calls == 1

    saved_payload = fake_keyring.get_password(
        credentials.CWS_KEYCHAIN_SERVICE,
        credentials.CWS_KEYCHAIN_ACCOUNT,
    )
    assert saved_payload is not None
    assert json.loads(saved_payload)["token"] == "refreshed-token"


def test_cws_ga4_client_migrates_legacy_file_to_keychain(
    monkeypatch: pytest.MonkeyPatch,
    tmp_path: Path,
    fake_keyring: FakeKeyring,
) -> None:
    monkeypatch.setattr(credentials, "_load_env", lambda: None)
    legacy_path = tmp_path / "cws-user-oauth.json"
    legacy_path.write_text(
        json.dumps(
            {
                "token": "legacy-token",
                "refresh_token": "refresh-token",
                "token_uri": "https://oauth2.googleapis.com/token",
                "client_id": "client-id",
                "client_secret": "client-secret",
                "scopes": credentials.CWS_SCOPES,
            }
        )
    )
    monkeypatch.setattr(credentials, "_CWS_LEGACY_PATH", legacy_path)

    import google.oauth2.credentials as google_credentials

    fake_creds = FakeOAuthCreds(token="legacy-token")

    monkeypatch.setattr(
        google_credentials.Credentials,
        "from_authorized_user_info",
        classmethod(lambda cls, info, scopes=None: fake_creds),
    )

    client = credentials.cws_ga4_client(CapturingClient)

    assert isinstance(client, CapturingClient)
    assert not legacy_path.exists()
    saved_payload = fake_keyring.get_password(
        credentials.CWS_KEYCHAIN_SERVICE,
        credentials.CWS_KEYCHAIN_ACCOUNT,
    )
    assert saved_payload is not None
    assert json.loads(saved_payload)["token"] == "legacy-token"


def test_cws_ga4_client_errors_when_keychain_is_unavailable(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setattr(credentials, "_load_env", lambda: None)

    def broken_get_password(_service: str, _account: str) -> str | None:
        raise credentials.keyring_errors.NoKeyringError("no backend")

    monkeypatch.setattr(credentials.keyring, "get_password", broken_get_password)

    with pytest.raises(RuntimeError, match="system keychain backend"):
        credentials.cws_ga4_client(CapturingClient)


def test_validate_credentials_reports_cws_keychain_readiness(
    monkeypatch: pytest.MonkeyPatch,
    fake_keyring: FakeKeyring,
) -> None:
    monkeypatch.setattr(credentials, "_load_env", lambda: None)
    monkeypatch.delenv("GOOGLE_APPLICATION_CREDENTIALS", raising=False)
    monkeypatch.delenv("GOOGLE_ADS_CREDENTIALS_PATH", raising=False)
    monkeypatch.delenv("CLARITY_API_TOKEN", raising=False)
    monkeypatch.delenv("MONETIZATION_SESSION_COOKIE", raising=False)

    results = credentials.validate_credentials()
    assert results["cws"] is False

    fake_keyring.set_password(
        credentials.CWS_KEYCHAIN_SERVICE,
        credentials.CWS_KEYCHAIN_ACCOUNT,
        '{"token":"present"}',
    )

    results = credentials.validate_credentials()
    assert results["cws"] is True
