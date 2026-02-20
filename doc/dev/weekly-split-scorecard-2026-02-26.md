# Weekly Split Scorecard: Week Ending 2026-02-26

**Purpose:** Weekly operating snapshot for launch-readiness monitoring.
**Cadence:** Weekly
**Owner:** Growth + Product

---

## 1) Week Metadata

- **Tracking window start:** `2026-02-20` (Gate tracking Day 1)
- **Tracking window end:** `2026-02-26` (Earliest 7-day gate checkpoint)
- **Prepared on:** `2026-02-20`
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
| Direct/Unassigned | 5 | 0 | 0% | 3 Unassigned + 2 Direct (Day 1 only) |
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
|  |  |  |  |
|  |  |  |  |
|  |  |  |  |

---

## 6) Narrative Summary (3-5 bullets)

- What improved this week: ADC auth + GA4 pull script operational; gate tracking live
- What regressed this week: Gate 1 at 60% unassigned (tiny sample of 5 sessions); Gate 3 zero funnel events on Day 1
- Biggest unknown: Whether unassigned % will stabilize once volume grows and internal filter has time to take effect
- Action for next week: Continue daily gate pulls; investigate if internal filter is actually excluding dev traffic
