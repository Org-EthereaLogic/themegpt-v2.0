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
3. Service account ID: `adws-metrics` (email will be `adws-metrics@gen-lang-client-0312336987.iam.gserviceaccount.com`)
4. Skip optional role grants at the project level (GA4 access is granted per-property)
5. Click **Done**

### 2. Grant access to GA4 properties

In [Google Analytics Admin](https://analytics.google.com/):

For **both** properties below, go to Property → Property Access Management → Add users:

| Property | ID | Role |
|----------|----|------|
| ThemeGPT web app | `516189580` | Viewer |
| CWS listing | `521095252` | Viewer |

Add `adws-metrics@gen-lang-client-0312336987.iam.gserviceaccount.com` as **Viewer**.

### 3. Download the JSON key

1. In GCP Console → Service Accounts → click `adws-metrics`
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

## Verification

```bash
# Check file exists
ls adws/credentials/ga4-sa.json

# Validate credentials load without making API calls
cd adws && uv run python -c "
from adw_modules.credentials import validate_credentials
print(validate_credentials())
"
# Expected: {'ga4': True, 'google_ads': True, 'clarity': True, 'monetization': True}

# Run full report
cd adws && uv run python -m scripts.metrics_report
```

---

## Key rotation

Service account JSON keys do not expire, but rotate annually as a best practice:

1. GCP Console → Service Accounts → `adws-metrics` → Keys → **Add Key**
2. Download new JSON → replace `adws/credentials/ga4-sa.json`
3. Delete the old key from GCP Console after confirming the new one works
