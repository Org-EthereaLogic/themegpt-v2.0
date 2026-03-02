"""Credential loading for ADWS metrics collectors.

Single responsibility: load and validate credentials for each data source.
No collection logic here.
"""

from __future__ import annotations

import os
from pathlib import Path
from typing import Any

from dotenv import load_dotenv

_ENV_PATH = Path(__file__).parent.parent / ".env"

_SA_SETUP_HINT = (
    "See doc/dev/auth-setup.md for service account setup instructions. "
    "Set GOOGLE_APPLICATION_CREDENTIALS=credentials/ga4-sa.json in adws/.env"
)


def _load_env() -> None:
    if _ENV_PATH.exists():
        load_dotenv(_ENV_PATH, override=True)
    else:
        load_dotenv(override=True)


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
            scopes = ["https://www.googleapis.com/auth/analytics.readonly"]
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
            scopes = ["https://www.googleapis.com/auth/analytics.readonly"]
            creds, _ = google.auth.default(scopes=scopes)
            creds.refresh(Request())
            return ClientClass(credentials=creds)
        except Exception as exc:
            raise PermissionError(
                f"GA4 authentication failed (no service account configured). "
                f"{_SA_SETUP_HINT}. Original error: {exc}"
            ) from exc


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
