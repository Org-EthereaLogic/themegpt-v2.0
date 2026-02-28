import os
os.environ["OAUTHLIB_RELAX_TOKEN_SCOPE"] = "1"
from google_auth_oauthlib.flow import InstalledAppFlow

flow = InstalledAppFlow.from_client_secrets_file(
    "client_secrets.json",
    scopes=["https://www.googleapis.com/auth/adwords"],
)
creds = flow.run_local_server(port=8080)
print(f"\nRefresh token: {creds.refresh_token}\n")
