# Weekly Split Scorecard: Week Ending 2026-02-26

**Purpose:** Historical pre-pivot snapshot from the gate-tracking phase.
**Cadence:** Weekly
**Owner:** Growth + Product

> Note: This file is archived context from the pre-pivot operating model.
> Current execution uses server-side monetization KPIs and the updated
> template in `doc/dev/weekly-split-scorecard-template.md`.

---

## 1) Week Metadata

- **Tracking window start:** `2026-02-21` (True Gate Day 1 after GA4 recovery)
- **Tracking window end:** `2026-02-26` (Weekly report cutoff; earliest 7-day gate checkpoint is Feb 27)
- **Prepared on:** `2026-02-21`
- **Prepared by:** EthereaLogic Team

---

## 2) Listing Views Split (Organic vs Paid)

| Metric | Value | Notes |
|--------|-------|-------|
| Total listing views |  | Chrome Web Store listing views |
| Organic listing views |  | Source medium = organic/referral/direct non-paid |
| Paid listing views |  | Source medium = cpc/paid_social/display/etc. |
| Organic share % |  | `organic / total * 100` |
| Paid share % |  | `paid / total * 100` |

Data source:
- Chrome Web Store dashboard (listing views)
- GA4 Acquisition report (source/medium split)

---

## 3) Channel-Specific Trial Conversion

| Channel | Sessions | `trial_start` events | Trial conversion % | Notes |
|---------|----------|----------------------|--------------------|-------|
| Organic | 0 | 0 | — |  |
| Paid | 0 | 0 | — |  |
| Referral | 0 | 0 | — |  |
| Direct/Unassigned | 0 | 0 | — | GA4 was broken until mid-day Feb 20 redeploy. Correct property (516189580) now receiving data; no session data in API yet (processing delay). |
| Email | 0 | 0 | — |  |

Formula:
- `Trial conversion % = trial_start events / sessions * 100`

Data source:
- GA4 Reports -> Acquisition + Events (`trial_start`)

---

## 4) Country Mix Watch (India vs US)

| Country | Users | User share % | WoW change (pp) | Notes |
|---------|-------|--------------|-----------------|-------|
| India |  |  |  | Baseline was 22% on 2026-02-20 |
| United States |  |  |  | Baseline was 22% on 2026-02-20 |
| Other (top 3) |  |  |  |  |

Escalation rule:
- Trigger escalation review if India share is tied with or above US share for 2 consecutive weekly scorecards.

---

## 5) Weekly Decision Log

| Decision | Owner | Due date | Status |
|----------|-------|----------|--------|
| Redeploy Cloud Run with Firebase env vars to fix GA4 | Ops | Feb 20 | DONE |
| Correct pull_ga4.js property ID from 521095252 (CWS) to 516189580 (web app) | Ops | Feb 20 | DONE |
| Shift gate Day 1 to Feb 21 (first full day of GA4 data collection) | Growth | Feb 20 | DONE |

---

## 6) Narrative Summary (3-5 bullets)

- What improved this week: Root-caused and fixed GA4 data collection failure. Firebase env vars were missing from Cloud Run build — redeployed with correct substitutions. GA4 Realtime confirmed working (1 active user, 25 events on correct property 516189580). Corrected pull_ga4.js to query correct property.
- What regressed this week: Discovered all prior GA4 data assumptions were invalid — pull script was querying CWS listing property (521095252), not web app property (516189580). Gate Day 1 effectively lost; true Day 1 slides to Feb 21.
- Biggest unknown: Whether GA4 Data API will show processed data by Feb 21 morning, and whether consent-gating will suppress enough traffic to make gate thresholds hard to hit.
- Action for next week: Pull GA4 data on Feb 21 for first real Day 1 reading; verify data appears in both Realtime and Data API; continue daily gate pulls through Feb 27.
