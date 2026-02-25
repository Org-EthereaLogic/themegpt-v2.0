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
- **Prepared on:** `2026-02-25`
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

| Metric | Value | Threshold | Rating |
|--------|-------|-----------|--------|
| LCP | 13.4s | 2.5s good / 4.0s poor | POOR |
| INP | 544ms | 200ms good / 500ms poor | POOR |
| CLS | 0.005 | 0.1 good / 0.25 poor | GOOD |
| Performance Score | 68.6/100 | | Needs improvement |

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
| Google Ads: Consider keyword-specific ad groups | Growth | Feb 28 | TODO |

---

## 8) Narrative Summary

- **What improved this week:** Traffic volume up 310% (41 sessions vs 10) driven by Google Ads `search_launch_v1` campaign. 4 CWS install clicks from organic visitors. Mobile redirect and email capture working. Multiple payment system fixes shipped (session cookie expiry, past_due access, trial email branching, checkout double-login).
- **What regressed this week:** 90% of GA4 sessions are mobile — users who cannot install a Chrome extension. $230+ of $361 ad spend wasted on mobile traffic. Bounce rate worsened to 70.7%. Only 1 pricing_view in 4 days (31% avg scroll depth means users never see pricing). LCP 13.4s / INP 544ms causing immediate bounces.
- **Critical finding:** Zero conversions from 310 paid clicks ($361 spend). Three high-intent users attempted purchase but encountered friction (login loops, Stripe abandonment). The conversion path exists but users aren't reaching it.
- **Actions taken (Feb 25):** Deployed conversion path fixes (Hero CTA → pricing, IO threshold, font optimization, dynamic imports). Reduced Google Ads budget 50% ($130 → $65). Added 15 negative keywords. Removed disapproved sitelink.
- **Next week action:** Monitor desktop session volume increase after negative keywords take effect. Track pricing_view/checkout_start rates. Re-check Clarity LCP after font optimization. Investigate User B's possible Stripe completion on Feb 22.
