# ADWS Metrics — Service Account Setup

One-time operator runbook for setting up GA4 authentication used by the daily metrics report.

## Why a service account?

Application Default Credentials (ADC) require an interactive `gcloud auth login` browser flow.
That breaks any unattended/scheduled run. A service account JSON key authenticates without
human interaction and never expires unless explicitly revoked.

---

## Steps

### 1. Create the service account

In GCP Console → [IAM & Admin → Service Accounts](https://console.cloud.google.com/iam-admin/serviceaccounts?project=gen-lang-client-0312336987):

1. Click **Create Service Account**
2. Name: `adws-metrics`
3. Service account ID: `adws-metrics-369` (email will be `adws-metrics-369@gen-lang-client-0312336987.iam.gserviceaccount.com`)
4. Skip optional role grants at the project level (GA4 access is granted per-property)
5. Click **Done**

### 2. Grant access to GA4 properties

In [Google Analytics Admin](https://analytics.google.com/):

For the web app property below, go to Property → Property Access Management → Add users:

| Property | ID | Role | Service Account Access? |
|----------|----|------|------------------------|
| ThemeGPT web app | `516189580` | Viewer | Yes — add service account here |
| CWS listing | `521095252` | Viewer | **No** — CWS-managed property; cannot grant service account access (see [CWS Authentication](#cws-authentication) below) |

Add `adws-metrics-369@gen-lang-client-0312336987.iam.gserviceaccount.com` as **Viewer** to property `516189580` only.

> **Note:** Property `521095252` is managed by Chrome Web Store. The developer does not have Admin role on it and cannot add service accounts. CWS GA4 data is accessed via user-account OAuth instead — see the CWS Authentication section below.

### 3. Download the JSON key

1. In GCP Console → Service Accounts → click `adws-metrics-369`
2. Keys tab → **Add Key → Create new key → JSON**
3. Save the downloaded file as:

```
adws/credentials/ga4-sa.json
```

The `credentials/` directory is gitignored — never commit this file.

### 4. Verify the .env setting

Confirm `adws/.env` contains:

```
GOOGLE_APPLICATION_CREDENTIALS=credentials/ga4-sa.json
```

(This is a relative path resolved from the `adws/` directory.)

---

## CWS Authentication

The CWS GA4 property (`521095252`) is managed by Chrome Web Store. Only the developer's personal Google account has Viewer access via the CWS Developer Console — the service account cannot be added.

**Solution:** A one-time OAuth flow creates a user-account token with `analytics.readonly` scope for querying CWS GA4 data, then stores the authorized-user payload in the local system keychain.

### Setup

1. Run the setup script (sign in as `anthony.johnsonii@etherealogic.ai` when prompted):

```bash
cd adws && uv run python setup_cws_auth.py
```

2. The script opens a browser for Google OAuth consent. Authorize the `analytics.readonly` scope.

3. The script stores the authorized-user payload in the system keychain:

```text
service: themegpt.adws.cws-ga4
account: anthony.johnsonii@etherealogic.ai
```

4. No `CWS_GOOGLE_CREDENTIALS` entry is required in `adws/.env`.

### One-time migration

If you still have the legacy plaintext file at `adws/credentials/cws-user-oauth.json`, the next CWS collector run will import it into the system keychain and delete the file after verifying the keychain save.

### How it works

- `adw_modules/credentials.py` provides `cws_ga4_client()` which loads the user OAuth token from the system keychain
- `adw_modules/metrics_collectors.py` uses `cws_ga4_client()` for CWS data collection
- The token auto-refreshes on use and writes the refreshed token back to the system keychain; re-run `setup_cws_auth.py` only if the token is revoked or the refresh token expires

---

## Verification

```bash
# Check file exists
ls adws/credentials/ga4-sa.json

# Validate credentials load without making API calls
cd adws && uv run python -c "
from adw_modules.credentials import validate_credentials
print(validate_credentials())
"
# Expected: {'ga4': True, 'cws': True, 'google_ads': True, 'clarity': True, 'monetization': True}

# Run full report (5/6 sources expected — google_ads blocked pending Basic token approval)
cd adws && uv run python -m scripts.metrics_report
```

---

## Key rotation

Service account JSON keys do not expire, but rotate annually as a best practice:

1. GCP Console → Service Accounts → `adws-metrics-369` → Keys → **Add Key**
2. Download new JSON → replace `adws/credentials/ga4-sa.json`
3. Delete the old key from GCP Console after confirming the new one works
