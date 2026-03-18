"""One-time setup: authorize your Google account for CWS GA4 analytics access.

Run this once from the adws/ directory:
    uv run python setup_cws_auth.py

Opens a browser for OAuth consent, then saves the authorized-user payload
to the local system keychain. The collect_cws collector uses that keychain
entry to query GA4 property 521095252.

Why needed: the CWS GA4 property (521095252) is managed by Chrome Web Store —
you cannot grant service accounts access to it. A user-account OAuth token
for anthony.johnsonii@etherealogic.ai works because that account has Viewer
access via the CWS Developer Console.
"""

from pathlib import Path

from google_auth_oauthlib.flow import InstalledAppFlow

from adw_modules.credentials import (
    CWS_KEYCHAIN_ACCOUNT,
    CWS_KEYCHAIN_SERVICE,
    CWS_SCOPES,
    build_cws_authorized_user_info,
    store_cws_authorized_user_info,
)

CLIENT_SECRETS = Path(__file__).parent / "client_secrets.json"


def main() -> None:
    if not CLIENT_SECRETS.exists():
        raise FileNotFoundError(f"client_secrets.json not found at {CLIENT_SECRETS}")

    print("Opening browser for Google OAuth consent...")
    print(f"Sign in as: anthony.johnsonii@etherealogic.ai")
    print(f"Scope requested: analytics.readonly\n")

    flow = InstalledAppFlow.from_client_secrets_file(str(CLIENT_SECRETS), scopes=CWS_SCOPES)
    creds = flow.run_local_server(port=8080)

    store_cws_authorized_user_info(build_cws_authorized_user_info(creds))
    print("\nSaved CWS GA4 credentials to the system keychain:")
    print(f"  service: {CWS_KEYCHAIN_SERVICE}")
    print(f"  account: {CWS_KEYCHAIN_ACCOUNT}")
    print("No CWS secret entry is needed in adws/.env.")


if __name__ == "__main__":
    main()
