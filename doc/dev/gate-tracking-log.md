# Measurement Gate Tracking Log

**Period:** Feb 20–26, 2026 (7 consecutive days required)
**Updated:** Daily, by checking GA4
**Blocker:** Product Hunt launch is blocked until Gate 1 AND Gate 3 both pass

---

## Gate Definitions

### Gate 1 — Unassigned Traffic Reduction

- **Measures:** Percentage of GA4 sessions with no UTM attribution and no referrer (Session source/medium = `(not set)`)
- **Pass criterion:** ≤10% unassigned sessions for 7 consecutive calendar days
- **Status as of Feb 20:** TRACKING STARTED — pre-filter baseline was 25% on Feb 19; GA4 internal traffic filter is Active as of Feb 20
- **Filter activation status:** COMPLETE — applied, realtime-verified, and activated per `docs/ga4-filter-guide.md`
- **How to measure:**
  1. GA4 → Reports → Acquisition → Traffic Acquisition
  2. Set date range to the single day being logged
  3. Find the row where "Session default channel group" = `Unassigned` (or filter by Session medium = `(not set)`)
  4. Divide that session count by total sessions; record as a percentage

### Gate 3 — GA4 Funnel Event Visibility

- **Measures:** Whether three conversion events are visible with nonzero counts in GA4
- **Events required:** `trial_start`, `checkout_start`, `purchase_success`
- **Pass criterion:** All three events visible in GA4 for 7 consecutive calendar days
- **Observation window started:** Feb 20, 2026 (instrumentation deployed in v2.2.1 web release)
- **Status as of Feb 20:** TRACKING STARTED — Day 1 of the 7-day validation window (earliest possible pass date: Feb 26, 2026)
- **How to measure:**
  1. GA4 → Reports → Engagement → Events
  2. Set date range to the single day being logged
  3. Scan the event name list for each of the three events
  4. Mark Y if the event appears with count > 0; mark N if absent

---

## Gate 1 Daily Log

| Date | Unassigned % | Filter Active? | Status | Notes |
|------|-------------|----------------|--------|-------|
| 2026-02-20 | | Y | TRACKING | Filter active; Day 1 of observation window |
| 2026-02-21 | | | | |
| 2026-02-22 | | | | |
| 2026-02-23 | | | | |
| 2026-02-24 | | | | |
| 2026-02-25 | | | | |
| 2026-02-26 | | | | |

**Status values:** `PASS` (≤10%), `FAIL` (>10%), `TRACKING` (window in progress)

---

## Gate 3 Daily Log

| Date | `trial_start` | `checkout_start` | `purchase_success` | All 3 visible? | Notes |
|------|--------------|-----------------|-------------------|----------------|-------|
| 2026-02-20 | | | | | Day 1 of validation window (earliest pass date: 2026-02-26) |
| 2026-02-21 | | | | | |
| 2026-02-22 | | | | | |
| 2026-02-23 | | | | | |
| 2026-02-24 | | | | | |
| 2026-02-25 | | | | | |
| 2026-02-26 | | | | | |

**Event column values:** `Y` (visible, count > 0), `N` (absent), `—` (no conversion activity that day, but instrumentation confirmed working)

---

## Pass/Fail Summary

```
Gate 1 result:  [ ] PASS  [ ] FAIL
  First passing day: ___________
  Last passing day:  ___________

Gate 3 result:  [ ] PASS  [ ] FAIL
  First passing day: ___________
  Last passing day:  ___________

Product Hunt launch unlocked:
  [ ] YES — both gates passed 7 consecutive days
  [ ] NO  — gates still in progress
```

---

## Countdown Note

With Day 1 set to Feb 20, 2026 for both Gate 1 and Gate 3, the earliest gate pass date is **Feb 26, 2026** and the earliest Product Hunt launch window is the week of **Feb 27, 2026**. If either gate does not begin passing until later, the launch date slides by the same number of days.

Gate 1 and Gate 3 are independent — one passing does not affect the other. Both must accumulate 7 consecutive passing days; they need not pass simultaneously.

---

*Track daily. Record numbers each morning for the prior day. Update the summary block when a gate resolves.*
