# Weekly Split Scorecard Template

**Purpose:** Weekly operating snapshot for launch-readiness monitoring.
**Cadence:** Weekly (recommended every Monday for prior Mon-Sun week).
**Owner:** Growth + Product

---

## 1) Week Metadata

- **Week start (Mon):** `YYYY-MM-DD`
- **Week end (Sun):** `YYYY-MM-DD`
- **Prepared on:** `YYYY-MM-DD`
- **Prepared by:** `Name`

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
| Organic |  |  |  |  |
| Paid |  |  |  |  |
| Referral |  |  |  |  |
| Direct/Unassigned |  |  |  |  |
| Email |  |  |  |  |

Formula:
- `Trial conversion % = trial_start events / sessions * 100`

Data source:
- GA4 Reports -> Acquisition + Events (`trial_start`)

---

## 4) Country Mix Watch (India vs US)

| Country | Users | User share % | WoW change (pp) | Notes |
|---------|-------|--------------|-----------------|-------|
| India |  |  |  |  |
| United States |  |  |  |  |
| Other (top 3) |  |  |  |  |

Escalation rule:
- Trigger escalation review if India share is tied with or above US share for 2 consecutive weekly scorecards.
- Current reference point (2026-02-20): India 22%, US 22%.

---

## 5) Weekly Decision Log

| Decision | Owner | Due date | Status |
|----------|-------|----------|--------|
|  |  |  |  |
|  |  |  |  |
|  |  |  |  |

---

## 6) Narrative Summary (3-5 bullets)

- What improved this week:
- What regressed this week:
- Biggest unknown:
- Action for next week:
