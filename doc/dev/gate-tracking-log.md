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
| 2026-02-21 | — | Y | TRACKING | Clarity deployed and linked to GA4. CWS GA4 opted in. Funnels configured. Awaiting end-of-day GA4 data. |
| 2026-02-22 | TBD | Y | TRACKING | Cloud Build trigger fixed: all 7 Firebase vars + Stripe key now correctly passed as build args. Firebase SDK confirmed initializing with real values in production bundle (verified in chunk `fcf8539a7a2dfa1b.js`). GA4 collection now reliable. Awaiting end-of-day data. |
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
| 2026-02-21 | — | — | — | N | Day 1 of full collection. Clarity live (2 sessions tracked). No conversion events yet (no purchases today). |
| 2026-02-22 | TBD | TBD | TBD | TBD | Cloud Build trigger fixed with correct Firebase vars. Checkout flow verified end-to-end: live Stripe session (`cs_live_a12839WF…`) created successfully. Events should fire on next real purchase. Awaiting end-of-day GA4 data. |
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

*Track daily. Record numbers each morning for the prior day. Update the summary block when a gate resolves.*
