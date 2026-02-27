# ADWS Daily Metrics Report

Collect advertising, web traffic, and revenue data from all 6 sources and compile a daily report.

## Usage

```
/adws-metrics [--days 1] [--period morning|afternoon|evening]
```

## What This Does

1. Collects **GA4 traffic** data: sessions, users, channel/device/country splits
2. Collects **GA4 funnel events**: pricing_view, checkout_start, trial_start, purchase_success, etc.
3. Pulls **Google Ads** campaign performance: clicks, impressions, CTR, CPC, spend, conversions
4. Fetches **Microsoft Clarity** Core Web Vitals (LCP, INP, CLS) and UX metrics (scroll depth, rage clicks)
5. Gathers **Chrome Web Store** install/uninstall stats via CWS GA4 property
6. Retrieves **server-side monetization** data: checkout totals, revenue, channel attribution
7. Runs **guardrail checks** against spend thresholds (no-signal kill, CAC kill, ROAS)
8. Generates both **Markdown** and **HTML** reports in `doc/dev/`

All 6 sources are collected in parallel. If any source fails, the others still report.

## Prerequisites

- `adws/.env` file with API credentials configured:
  - `GA4_PROPERTY_ID` and `GA4_CWS_PROPERTY_ID`
  - `GOOGLE_ADS_CUSTOMER_ID` and `GOOGLE_ADS_CREDENTIALS_PATH`
  - `CLARITY_API_TOKEN` and `CLARITY_PROJECT_ID`
  - `MONETIZATION_ENDPOINT`
- `gcloud auth application-default login` executed for GA4 access

## Examples

```bash
# Morning check (default: 1 day lookback)
/adws-metrics

# Afternoon check
/adws-metrics --period afternoon

# Weekly review (7-day lookback)
/adws-metrics --days 7 --period evening
```

## Output

Reports saved to:
- `doc/dev/daily-metrics-{YYYY-MM-DD}-{period}.md`
- `doc/dev/daily-metrics-{YYYY-MM-DD}-{period}.html`

## Script

```bash
cd adws && uv run python -m scripts.metrics_report $ARGUMENTS
```
