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

## Diagnostics Phase (runs after script completes)

After the Python script finishes, check for a failure manifest and capture browser diagnostics for each failed source:

1. **Check for failure manifest**: Look for `doc/dev/failures/YYYY-MM-DD.json` (where YYYY-MM-DD is today's date).
   - Parse the JSON to get the list of failed sources and their `dashboard_url` values.
   - Skip this phase entirely if the manifest does not exist (all sources succeeded).

2. **For each failed source with a `dashboard_url`**, use Kapture MCP tools:

   ```
   a. Load ToolSearch to get Kapture tools: mcp__kapture__navigate, mcp__kapture__screenshot,
      mcp__kapture__console_logs, mcp__kapture__dom
   b. Navigate to the dashboard_url:
        mcp__kapture__navigate(url=entry.dashboard_url)
   c. Wait ~3 seconds for page load (use a brief asyncio.sleep equivalent or just proceed)
   d. Screenshot → save to doc/dev/failures/{date}/{source}.webp:
        mcp__kapture__screenshot(path="doc/dev/failures/{date}/{source}.webp")
   e. Console errors → save to doc/dev/failures/{date}/{source}-console.json:
        mcp__kapture__console_logs(pattern="error|Error|ERROR")
        Write the result as JSON to the path above.
   f. Page text → save to doc/dev/failures/{date}/{source}-page.txt:
        mcp__kapture__dom() or read_page, write text content to path above
   ```

3. **Update artifacts**: After saving diagnostics, update each failed `CollectorResult.artifacts`
   with the list of file paths saved (screenshot, console log, page text).

4. **Re-generate reports** with artifact links by re-running the report generation step:
   ```bash
   cd adws && uv run python -m scripts.metrics_report $ARGUMENTS
   ```
   The failure manifest from step 1 is replaced by the re-run, but artifact paths are now
   embedded in the reports via the updated CollectorResult.artifacts fields.

> **Note**: If Kapture tools are unavailable or browser automation fails, skip gracefully and
> note in the report that diagnostics could not be captured. The manifest JSON is sufficient
> for follow-up investigation.
