"""Credential loading for ADWS metrics collectors.

Single responsibility: load and validate credentials for each data source.
No collection logic here.
"""

from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Any

from dotenv import load_dotenv

try:
    import keyring
    from keyring import errors as keyring_errors
except ImportError:  # pragma: no cover - guarded at runtime for operator errors
    keyring = None
    keyring_errors = None

_ENV_PATH = Path(__file__).parent.parent / ".env"
CWS_SCOPES = ["https://www.googleapis.com/auth/analytics.readonly"]
CWS_KEYCHAIN_SERVICE = "themegpt.adws.cws-ga4"
CWS_KEYCHAIN_ACCOUNT = "anthony.johnsonii@etherealogic.ai"
_CWS_SETUP_HINT = "Run: cd adws && uv run python setup_cws_auth.py"
_CWS_LEGACY_PATH = Path(__file__).parent.parent / "credentials" / "cws-user-oauth.json"

_SA_SETUP_HINT = (
    "See doc/dev/auth-setup.md for service account setup instructions. "
    "Set GOOGLE_APPLICATION_CREDENTIALS=credentials/ga4-sa.json in adws/.env"
)


def _load_env() -> None:
    if _ENV_PATH.exists():
        load_dotenv(_ENV_PATH, override=True)
    else:
        load_dotenv(override=True)


def build_cws_authorized_user_info(creds: Any) -> dict[str, Any]:
    """Serialize the Google authorized-user credentials for secure storage."""
    return {
        "token": creds.token,
        "refresh_token": creds.refresh_token,
        "token_uri": creds.token_uri,
        "client_id": creds.client_id,
        "client_secret": creds.client_secret,
        "scopes": list(creds.scopes or CWS_SCOPES),
    }


def _cws_keychain_error(exc: Exception | None = None) -> RuntimeError:
    message = (
        "CWS GA4 credentials require a working system keychain backend. "
        f"Re-run setup on this machine. {_CWS_SETUP_HINT}"
    )
    if exc is not None:
        message = f"{message} Original error: {exc}"
    return RuntimeError(message)


def _require_keyring() -> Any:
    if keyring is None or keyring_errors is None:
        raise RuntimeError(
            "Python dependency `keyring` is required for CWS GA4 credentials. "
            "Run: cd adws && uv sync --all-extras"
        )
    return keyring


def _get_cws_keychain_payload() -> str | None:
    keyring_module = _require_keyring()
    try:
        return keyring_module.get_password(CWS_KEYCHAIN_SERVICE, CWS_KEYCHAIN_ACCOUNT)
    except keyring_errors.KeyringError as exc:
        raise _cws_keychain_error(exc) from exc


def store_cws_authorized_user_info(info: dict[str, Any]) -> None:
    """Persist the CWS OAuth payload in the local system keychain."""
    payload = json.dumps(info, sort_keys=True, separators=(",", ":"))
    keyring_module = _require_keyring()

    try:
        keyring_module.set_password(CWS_KEYCHAIN_SERVICE, CWS_KEYCHAIN_ACCOUNT, payload)
    except keyring_errors.KeyringError as exc:
        raise _cws_keychain_error(exc) from exc

    saved_payload = _get_cws_keychain_payload()
    if saved_payload != payload:
        raise RuntimeError(
            "Failed to verify CWS GA4 credentials in the system keychain after saving. "
            f"{_CWS_SETUP_HINT}"
        )


def _legacy_cws_paths() -> list[Path]:
    paths = [_CWS_LEGACY_PATH]
    cws_path_raw = os.getenv("CWS_GOOGLE_CREDENTIALS", "")
    if cws_path_raw:
        cws_path = Path(cws_path_raw)
        if not cws_path.is_absolute():
            cws_path = Path(__file__).parent.parent / cws_path_raw
        if cws_path not in paths:
            paths.insert(0, cws_path)
    return paths


def _load_cws_authorized_user_info() -> dict[str, Any]:
    payload = _get_cws_keychain_payload()
    if payload:
        try:
            return json.loads(payload)
        except json.JSONDecodeError as exc:
            raise RuntimeError(
                "Stored CWS GA4 credentials in the system keychain are invalid JSON. "
                f"{_CWS_SETUP_HINT}"
            ) from exc

    for legacy_path in _legacy_cws_paths():
        if not legacy_path.exists():
            continue

        try:
            legacy_info = json.loads(legacy_path.read_text())
        except json.JSONDecodeError as exc:
            raise RuntimeError(
                f"Legacy CWS credential file is invalid at {legacy_path}. {_CWS_SETUP_HINT}"
            ) from exc

        store_cws_authorized_user_info(legacy_info)
        legacy_path.unlink()
        return legacy_info

    raise FileNotFoundError(
        "CWS GA4 credentials were not found in the system keychain. "
        f"{_CWS_SETUP_HINT}"
    )


def ga4_client(ClientClass: Any) -> Any:
    """Return a GA4 client authenticated via service account JSON key.

    Reads GOOGLE_APPLICATION_CREDENTIALS from the environment (set in adws/.env).
    Falls back to Application Default Credentials if the env var is absent (local dev).
    Raises PermissionError with actionable instructions on scope or auth failure.
    """
    _load_env()

    sa_path_raw = os.getenv("GOOGLE_APPLICATION_CREDENTIALS", "")
    if sa_path_raw:
        # Resolve relative paths against adws/ directory
        sa_path = Path(sa_path_raw)
        if not sa_path.is_absolute():
            sa_path = Path(__file__).parent.parent / sa_path
        if not sa_path.exists():
            raise FileNotFoundError(
                f"Service account key not found at {sa_path}. {_SA_SETUP_HINT}"
            )
        try:
            from google.oauth2 import service_account
            scopes = CWS_SCOPES
            creds = service_account.Credentials.from_service_account_file(
                str(sa_path), scopes=scopes
            )
            return ClientClass(credentials=creds)
        except Exception as exc:
            raise PermissionError(
                f"Failed to load service account credentials from {sa_path}: {exc}. "
                f"{_SA_SETUP_HINT}"
            ) from exc
    else:
        # ADC fallback for local dev (requires manual gcloud auth login)
        try:
            import google.auth
            from google.auth.transport.requests import Request
            scopes = CWS_SCOPES
            creds, _ = google.auth.default(scopes=scopes)
            creds.refresh(Request())
            return ClientClass(credentials=creds)
        except Exception as exc:
            raise PermissionError(
                f"GA4 authentication failed (no service account configured). "
                f"{_SA_SETUP_HINT}. Original error: {exc}"
            ) from exc


def cws_ga4_client(ClientClass: Any) -> Any:
    """Return a GA4 client for the CWS property using the system-keychain OAuth token."""
    _load_env()

    from google.auth.transport.requests import Request
    from google.oauth2.credentials import Credentials

    info = _load_cws_authorized_user_info()
    creds = Credentials.from_authorized_user_info(info, scopes=CWS_SCOPES)
    if creds.expired and creds.refresh_token:
        creds.refresh(Request())
        store_cws_authorized_user_info(build_cws_authorized_user_info(creds))
    elif creds.expired:
        raise PermissionError(
            "Stored CWS GA4 credentials are expired and do not include a refresh token. "
            f"{_CWS_SETUP_HINT}"
        )

    return ClientClass(credentials=creds)


def validate_credentials() -> dict[str, bool]:
    """Check all credentials are present and loadable without making API calls.

    Returns a dict of {source_name: is_ok} for pre-flight health checks.
    Does not make any network calls — only validates that required values exist.
    """
    _load_env()

    results: dict[str, bool] = {}

    # GA4 service account
    sa_raw = os.getenv("GOOGLE_APPLICATION_CREDENTIALS", "")
    if sa_raw:
        sa_path = Path(sa_raw)
        if not sa_path.is_absolute():
            sa_path = Path(__file__).parent.parent / sa_raw
        results["ga4"] = sa_path.exists()
    else:
        results["ga4"] = False  # No SA configured; ADC fallback may or may not work

    try:
        results["cws"] = bool(_get_cws_keychain_payload())
    except RuntimeError:
        results["cws"] = False

    # Google Ads
    ads_path_raw = os.getenv("GOOGLE_ADS_CREDENTIALS_PATH", "")
    if ads_path_raw:
        results["google_ads"] = Path(ads_path_raw).exists()
    else:
        results["google_ads"] = False

    # Clarity
    results["clarity"] = bool(os.getenv("CLARITY_API_TOKEN", ""))

    # Monetization
    results["monetization"] = bool(os.getenv("MONETIZATION_SESSION_COOKIE", ""))

    return results
