# Measurement Gate Tracking Log

**Period:** Feb 20–27, 2026 (includes Feb 20 NO DATA incident + 7-day gate window Feb 21–27)
**Updated:** Daily, by checking GA4
**Blocker:** No hard launch blocker. Gate 1 and Gate 3 are tracked as diagnostics while paid acquisition begins.

---

## Gate Definitions

### Gate 1 — Unassigned Traffic Reduction

- **Measures:** Percentage of GA4 sessions with no UTM attribution and no referrer (Session source/medium = `(not set)`)
- **Pass criterion:** ≤10% unassigned sessions for 7 consecutive calendar days
- **Status as of Feb 20:** TRACKING — GA4 was not collecting web app data until mid-day Feb 20 (Firebase env vars missing from Cloud Run build; redeployed with fix). True data collection starts Feb 20 evening. Pre-filter baseline of 25% (Feb 19) was from wrong property (CWS listing) and is invalid.
- **Filter activation status:** COMPLETE — applied, realtime-verified, and activated per `docs/ga4-filter-guide.md`
- **Correct GA4 property:** `516189580` (gen-lang-client-0312336987), measurement ID `G-41BZB7X7H7`
- **How to measure:**
  1. GA4 → Reports → Acquisition → Traffic Acquisition
  2. Set date range to the single day being logged
  3. Find the row where "Session default channel group" = `Unassigned` (or filter by Session medium = `(not set)`)
  4. Divide that session count by total sessions; record as a percentage

### Gate 3 — GA4 Funnel Event Visibility

- **Measures:** Whether three conversion events are visible with nonzero counts in GA4
- **Events required:** `trial_start`, `checkout_start`, `purchase_success`
- **Pass criterion:** All three events visible in GA4 for 7 consecutive calendar days
- **Observation window started:** Feb 21, 2026 (first full day after mid-day Feb 20 redeploy; instrumentation was deployed in v2.2.1 web release)
- **Status as of Feb 20:** TRACKING — GA4 confirmed receiving data post-redeploy (Realtime: 1 active user, 25 events). True Day 1 is effectively Feb 21 (first full day of collection). Earliest pass date slides to Feb 27.
- **Correct GA4 property:** `516189580` (gen-lang-client-0312336987), measurement ID `G-41BZB7X7H7`
- **How to measure:**
  1. GA4 → Reports → Engagement → Events
  2. Set date range to the single day being logged
  3. Scan the event name list for each of the three events
  4. Mark Y if the event appears with count > 0; mark N if absent

---

## Gate 1 Daily Log

| Date | Unassigned % | Filter Active? | Status | Notes |
|------|-------------|----------------|--------|-------|
| 2026-02-20 | 0% | Y | TRACKING | 2 total Direct sessions. No unassigned traffic. (Data API lagging, true Day 1 still Feb 21). |
| 2026-02-21 | 50% | Y | FAIL | 2 total sessions (1 Direct, 1 Unassigned). Low volume — not statistically meaningful. GA4 Data API confirmed: page_view×7, checkout_start×3, pricing_view×2. |
| 2026-02-22 | TBD | Y | TRACKING | GA4 historical not yet processed (24–48h window). Clarity: 13 sessions / 7 users across Feb 21–22. Reddit UTM traffic confirmed landing (`reddit_launch_v1`). Multiple `/?canceled=true` returns from Stripe — real users reaching checkout, not yet converting. Data integrity fully locked: Clarity IP block (`50.53.12.179`), GA4 internal traffic rule (`EthereaLogic Dev`, property `516189580`, stream `G-41BZB7X7H7`) + GA4 data filter `Internal Traffic` set to **Active**. Clarity `NODE_ENV` guard deployed. |
| 2026-02-23 | | | | |
| 2026-02-24 | | | | |
| 2026-02-25 | | | | |
| 2026-02-26 | | | | |
| 2026-02-27 | | | | |

**Status values:** `PASS` (≤10%), `FAIL` (>10%), `TRACKING` (window in progress)

---

## Gate 3 Daily Log

| Date | `trial_start` | `checkout_start` | `purchase_success` | All 3 visible? | Notes |
|------|--------------|-----------------|-------------------|----------------|-------|
| 2026-02-20 | N | N | N | N | GA4 SDK was not loading pre-redeploy. Post-fix: GA4 confirmed working via Realtime. No conversion activity today (expected — funnel events require real user purchases). |
| 2026-02-21 | N | Y (×3) | N | N | GA4 Data API confirmed. checkout_start firing (3 events). pricing_view firing (2 events). trial_start and purchase_success absent — expected, no completed purchases yet. |
| 2026-02-22 | N | Y (realtime) | N | N | GA4 historical processing. Clarity confirms checkout_start firing for real users. Multiple sessions show `/?canceled=true` return from Stripe — funnel drop-off at payment step. No completed purchases yet. |
| 2026-02-23 | | | | | |
| 2026-02-24 | | | | | |
| 2026-02-25 | | | | | |
| 2026-02-26 | | | | | |
| 2026-02-27 | | | | | |

**Event column values:** `Y` (visible, count > 0), `N` (absent), `—` (no conversion activity that day, but instrumentation confirmed working), `TBD` (pending GA4 daily check)

---

## Diagnostic Summary

```
Gate 1 result:  [ ] PASS  [ ] FAIL
  First passing day: ___________
  Last passing day:  ___________

Gate 3 result:  [ ] PASS  [ ] FAIL
  First passing day: ___________
  Last passing day:  ___________

Product Hunt launch unlocked:
  [ ] YES — launch decision no longer gate-bound
  [ ] NO  — optional tracking-only status
```

---

## Countdown Note

GA4 was not collecting web app data until the mid-day Feb 20 redeploy (Firebase env vars were missing from the Cloud Run build). True Day 1 of meaningful data collection is **Feb 21, 2026**. Continue logging Gate 1 and Gate 3 daily as quality diagnostics while optimization is driven by server-side monetization metrics.

Gate 1 and Gate 3 remain independent diagnostic indicators. They inform quality, but no longer block acquisition starts.

---

## v2.3.0 CWS Approval & Listing Update — Feb 22, 2026

- **v2.3.1 (web) deployed**: Feb 22, 2026 — critical checkout fix. `payment_method_collection: 'if_required'` for trial subscriptions. Root cause of 18 checkouts / 0 conversions resolved. Canary purchase confirmed: `adrielletherat@gmail.com` → Trial | Monthly Plan | Full Access. **First live trial conversion verified.**
- **v2.3.0 CWS review**: APPROVED (submitted Feb 20, approved Feb 22, 2026)
- **CWS listing update**: **Submitted for review** Feb 22, 2026. Includes promo video (YouTube), refreshed screenshots (5 total: 3 dark + Frosted Windowpane light + ThemeGPT Light). Metadata-only review — no extension binary change.
- **Landing page**: Hero video deployed in commit `3d868e9` — autoplay `demo-30s.mp4` inside macOS browser mockup, desktop-only.

---

## Deployment Integrity — Feb 22, 2026

**Audit scope:** Verify commit `3d868e9` was built and deployed successfully, and confirm all Cloud Build trigger substitution variables are present.

### Commit 3d868e9 Build Status

| Build ID | Status | Started | Finished |
|---|---|---|---|
| `b9263dcf-20f8-463a-9eb6-b7e75ca4f04f` | **SUCCESS** | 2026-02-22T16:50:53Z | 2026-02-22T16:55:19Z |

Active Cloud Run revision: **`themegpt-web-00152-7jn`** (100% traffic), created 2026-02-22T16:55:03Z — timestamp aligns with build completion. Deployment confirmed.

### Trigger Substitution Variables (trigger `a34788f2`)

All 8 build-time `NEXT_PUBLIC_*` vars confirmed present and non-empty:

| Variable | Status |
|---|---|
| `_FIREBASE_API_KEY` | ✓ Present |
| `_FIREBASE_AUTH_DOMAIN` | ✓ Present |
| `_FIREBASE_PROJECT_ID` | ✓ Present |
| `_FIREBASE_STORAGE_BUCKET` | ✓ Present |
| `_FIREBASE_MESSAGING_SENDER_ID` | ✓ Present |
| `_FIREBASE_APP_ID` | ✓ Present |
| `_FIREBASE_MEASUREMENT_ID` | ✓ Present |
| `_STRIPE_PUBLISHABLE_KEY` | ✓ Present |

Also present (bonus): `_STRIPE_SUBSCRIPTION_PRICE_ID`, `_STRIPE_YEARLY_PRICE_ID`, `_STRIPE_SINGLE_THEME_PRICE_ID`.

**Mechanism clarification:** These are Cloud Build *substitution variables*, NOT Secret Manager secrets. They are passed as `--build-arg` at Docker build time and baked into the Next.js bundle. Runtime-only secrets (`NEXTAUTH_SECRET`, `STRIPE_SECRET_KEY`, etc.) are set directly on the Cloud Run service and are not managed via `cloudbuild.yaml`.

---

*Track daily. Record numbers each morning for the prior day. Update the summary block when a gate resolves.*
