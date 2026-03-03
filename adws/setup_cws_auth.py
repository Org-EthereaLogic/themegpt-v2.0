"""One-time setup: authorize your Google account for CWS GA4 analytics access.

Run this once from the adws/ directory:
    uv run python setup_cws_auth.py

Opens a browser for OAuth consent, then saves credentials/cws-user-oauth.json.
The collect_cws collector uses this file to query GA4 property 521095252.

Why needed: the CWS GA4 property (521095252) is managed by Chrome Web Store —
you cannot grant service accounts access to it. A user-account OAuth token
for anthony.johnsonii@etherealogic.ai works because that account has Viewer
access via the CWS Developer Console.
"""

import json
import os
from pathlib import Path

from google_auth_oauthlib.flow import InstalledAppFlow

SCOPES = ["https://www.googleapis.com/auth/analytics.readonly"]
CLIENT_SECRETS = Path(__file__).parent / "client_secrets.json"
OUT_PATH = Path(__file__).parent / "credentials" / "cws-user-oauth.json"


def main() -> None:
    if not CLIENT_SECRETS.exists():
        raise FileNotFoundError(f"client_secrets.json not found at {CLIENT_SECRETS}")

    print("Opening browser for Google OAuth consent...")
    print(f"Sign in as: anthony.johnsonii@etherealogic.ai")
    print(f"Scope requested: analytics.readonly\n")

    flow = InstalledAppFlow.from_client_secrets_file(str(CLIENT_SECRETS), scopes=SCOPES)
    creds = flow.run_local_server(port=8080)

    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    token_data = {
        "token": creds.token,
        "refresh_token": creds.refresh_token,
        "token_uri": creds.token_uri,
        "client_id": creds.client_id,
        "client_secret": creds.client_secret,
        "scopes": list(creds.scopes or SCOPES),
    }
    OUT_PATH.write_text(json.dumps(token_data, indent=2))
    print(f"\nSaved to {OUT_PATH}")
    print("Add this to adws/.env:")
    print("  CWS_GOOGLE_CREDENTIALS=credentials/cws-user-oauth.json")


if __name__ == "__main__":
    main()
