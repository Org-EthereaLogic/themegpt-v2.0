# Weekly Split Scorecard: Week Ending 2026-02-26

**Purpose:** Weekly operating snapshot covering paid acquisition, conversion funnel, and performance.
**Cadence:** Weekly
**Owner:** Growth + Product

> Current execution uses server-side monetization KPIs and the updated
> template in `doc/dev/weekly-split-scorecard-template.md`.

---

## 1) Week Metadata

- **Tracking window start:** `2026-02-21` (True Gate Day 1 after GA4 recovery)
- **Tracking window end:** `2026-02-26` (Weekly report cutoff; earliest 7-day gate checkpoint is Feb 27)
- **Prepared on:** `2026-02-26` (updated with post-change Clarity data)
- **Prepared by:** EthereaLogic Team

---

## 2) Traffic Overview (GA4, Feb 22-25 vs Feb 18-21)

| Metric | Feb 22-25 | Feb 18-21 | Change |
|--------|-----------|-----------|--------|
| Sessions | 41 | 10 | +310% |
| Users | 38 | 6 | +533% |
| New Users | 37 | 6 | +517% |
| Engaged Sessions | 12 | 4 | +200% |
| Avg Session Duration | 13.3s | 502.4s | -97%* |
| Page Views | 49 | 26 | +88% |
| Bounce Rate | 70.7% | 60% | +10.7pp worse |

*Previous period inflated by dev sessions (low volume skew). Current 13.3s is the real baseline.

### Channel Breakdown (Feb 22-25)

| Channel | Sessions | Engaged | Bounce Rate | Avg Duration |
|---------|----------|---------|-------------|-------------|
| Paid Search | 30 (73%) | 7 (23%) | 76.7% | 7.7s |
| Direct | 6 (15%) | 3 (50%) | 50% | 47.8s |
| Cross-network | 4 (10%) | 2 (50%) | 50% | 6.8s |
| Paid Social | 1 (2%) | 0 (0%) | 100% | 0s |

### Device Split (Feb 22-25)

| Device | Sessions | Bounce Rate | Avg Duration |
|--------|----------|-------------|-------------|
| Mobile | 37 (90%) | 73% | 12.9s |
| Desktop | 4 (10%) | 50% | 16.9s |

### Device Split Post-Changes (Clarity, Feb 24-26)

| Device | Sessions | Share | Avg Duration (PC) |
|--------|----------|-------|--------------------|
| PC | 8 | 62% | 107s |
| Mobile | 3 | 23% | — |
| Tablet | 2 | 15% | — |

Desktop share flipped from 10% to 62% after Google Ads targeting fixes and negative keywords.

---

## 3) Conversion Funnel (GA4 Events, Feb 22-25)

| Event | Count | Assessment |
|-------|-------|------------|
| page_view | 49 | Traffic arriving |
| pricing_view | 1 | Almost nobody sees pricing |
| checkout_start | 0 | No checkouts initiated |
| trial_start | 0 | No trials started |
| purchase_success | 0 | Zero revenue |
| mobile_landing | 4 | Mobile redirect working |
| mobile_email_capture | 1 | 1 email lead captured |

---

## 4) Performance (Clarity, p75)

| Metric | Feb 21-23 | Feb 24-26 | Threshold | Change |
|--------|-----------|-----------|-----------|--------|
| LCP | 3,844ms | 6,028ms | 2.5s good / 4.0s poor | +56.8% WORSE |
| INP | 464ms | 1,736ms | 200ms good / 500ms poor | +274% WORSE |
| CLS | 0 | 12 | 0.1 good / 0.25 poor | CATASTROPHIC |

**CWV regression detected.** All three metrics worsened after Feb 25 code changes (dynamic imports, font swap). CLS of 12 is extreme — likely caused by lazy-loaded sections shifting layout. Small sample (13 sessions) adds noise, but magnitude demands investigation.

---

## 5) Google Ads Campaign (Feb 21-24)

| Metric | Value |
|--------|-------|
| Clicks | 310 |
| Impressions | 4,600 |
| CTR | 6.7% |
| Avg CPC | $1.16 |
| Total Spend | $361 |
| Conversions | 0 |
| Budget (current) | $65/day (reduced from $130 on Feb 25) |

---

## 6) Chrome Web Store (Last 90 Days)

| Metric | Value | Change |
|--------|-------|--------|
| Installs | 158 | +378.79% |
| Uninstalls | 37 | +825% |
| Net Installs | 121 | Positive |
| Retention Rate | 76.6% | Reasonable |

---

## 7) Weekly Decision Log

| Decision | Owner | Due date | Status |
|----------|-------|----------|--------|
| Redeploy Cloud Run with Firebase env vars to fix GA4 | Ops | Feb 20 | DONE |
| Correct pull_ga4.js property ID from 521095252 (CWS) to 516189580 (web app) | Ops | Feb 20 | DONE |
| Shift gate Day 1 to Feb 21 (first full day of GA4 data collection) | Growth | Feb 20 | DONE |
| Fix Cloud Build trigger: add all Firebase + Stripe NEXT_PUBLIC_* vars as substitutions | Ops | Feb 22 | DONE |
| Gate Clarity SDK behind NODE_ENV=production to prevent localhost contamination | Eng | Feb 22 | DONE |
| Add IP block 50.53.12.179 in Clarity + GA4 internal traffic filter | Ops | Feb 22 | DONE |
| Activate GA4 Internal Traffic data filter on correct property (516189580) | Ops | Feb 22 | DONE |
| Traffic & conversion audit: Hero CTA → #pricing, font swap, dynamic imports, IO threshold | Eng | Feb 25 | DONE |
| Google Ads: Reduce budget $130 → $65/day | Growth | Feb 25 | DONE |
| Google Ads: Add 15 negative keywords for intent mismatch | Growth | Feb 25 | DONE |
| Google Ads: Remove disapproved "Install Chrome Extension" sitelink | Growth | Feb 25 | DONE |
| Add email sign-in + open auth gate to free users | Eng | Feb 25 | DONE |
| Replace /account dead-end with 3-step onboarding for free users | Eng | Feb 25 | DONE |
| Update login copy to welcome free users | Eng | Feb 25 | DONE |
| Add pricing link to empty download history | Eng | Feb 25 | DONE |
| Strategy: shift to user base growth (100 users) before monetization | Growth | Feb 25 | DONE |
| Google Ads: Consider keyword-specific ad groups | Growth | Feb 28 | TODO |
| P0: Investigate CWV regression (LCP, INP, CLS all worse post-deploy) | Eng | Feb 27 | TODO |
| P0: Complete gcloud reauth to restore GA4 Data API | Ops | Feb 26 | TODO |
| P1: Investigate dynamic imports as CLS/INP root cause; consider reverting | Eng | Feb 27 | TODO |
| P1: Track 5 new signups through onboarding funnel (extension install rate) | Growth | Feb 28 | TODO |
| P2: Evaluate Google Ads ROI ($13/session, 0 conversions) | Growth | Feb 28 | TODO |

---

## 8) Narrative Summary

- **What improved this week:** Traffic volume up 310% (41 sessions vs 10) driven by Google Ads campaign. Desktop share flipped from 10% to 62% after targeting fixes. Homepage scroll depth nearly doubled (28.8% → 52.3%) — users now see pricing section. Organic search emerging (4 sessions). Free user acquisition funnel working — 5 signups in one day (Feb 25). Multiple payment and auth fixes shipped.
- **What regressed this week:** CWV regression after Feb 25 code changes — LCP 3.8s → 6.0s, INP 464ms → 1.7s, CLS 0 → 12 (catastrophic). Session volume dropped 74% (50 → 13) after budget cut and negative keywords. PC session duration halved (215s → 107s). PC quick backs worsened (19% → 25%). Sign-up flow had a blocking bug overnight Feb 25-26 (resolved morning Feb 26).
- **Critical finding:** Zero revenue from entire week. $361+ ad spend with 0 conversions. CWV regression may be undermining the scroll depth and targeting gains. Dynamic imports likely root cause of CLS/INP degradation.
- **Actions taken (Feb 25-26):** Hero CTA → #pricing, font swap, dynamic imports, IO threshold lowered. Google Ads: budget $130 → $65 → $100/day, 15 negative keywords, removed disapproved sitelink. Email sign-in + free auth gate. Account onboarding flow. Sign-up bug fix (morning Feb 26).
- **Key results:** Desktop targeting working (62% share). Scroll depth doubled. 5 new signups in 1 day. Organic search appearing. But CWV catastrophe (CLS 12) and 0 revenue remain critical.
- **Strategy:** User base growth to 100 users before monetization push. Budget raised to $100/day to stay competitive on keyword bidding.
- **Next week action:** P0: Diagnose and fix CWV regression (likely revert dynamic imports). P0: Restore GA4 Data API access. P1: Track new signups through extension install funnel. P2: Monitor $100/day budget ROI.
