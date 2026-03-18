# Daily Metrics Report: 2026-03-04 (Morning)

**Generated:** 15:05 UTC  
**Period:** Morning  
**Lookback:** 1 day(s)  

**Data Sources:** 5/6 succeeded

- **ga4_traffic**: OK
- **ga4_funnel**: OK
- **google_ads**: FAILED (Google Ads API: Basic developer token access pending. Check status at ads.google.com/aw/developer-token.)
- **clarity**: OK
- **cws**: OK
- **monetization**: OK

---

## 1) Traffic Overview (GA4)

| Metric | Value |
|--------|-------|
| Sessions | 8 |
| Users | 8 |
| New Users | 6 |
| Engaged Sessions | 6 |
| Avg Session Duration | 58.2s |
| Page Views | 8 |
| Bounce Rate | 25.0% |

### Channel Breakdown

| Channel | Sessions | Engaged | Bounce Rate | Avg Duration |
|---------|----------|---------|-------------|-------------|
| Cross-network | 3 | 3 | 0.0% | 153.0s |
| Unassigned | 3 | 0 | 100.0% | 1.0s |
| Paid Search | 2 | 2 | 0.0% | 1.5s |
| Direct | 1 | 1 | 0.0% | 0.0s |

### Device Split

| Device | Sessions | Bounce Rate | Avg Duration |
|--------|----------|-------------|-------------|
| desktop | 8 | 25.0% | 58.2s |

### Country Split (Top 10)

| Country | Users | Share |
|---------|-------|-------|
| United States | 4 | 50.0% |
| Mexico | 2 | 25.0% |
| Bhutan | 1 | 12.5% |
| United Kingdom | 1 | 12.5% |

### Firebase Overview (Last 28 days: Feb 4 – Mar 3, 2026)

> Source: Firebase Analytics dashboard screenshot

| Metric | Value |
|--------|-------|
| 30-day Active Users | 81 |
| 7-day Active Users | 39 |
| 1-day Active Users | 7 |
| Avg Engagement Time / User | 55s |
| Engaged Sessions / User | 0.71 |

#### Event Counts (28-day)

| Event | Count |
|-------|-------|
| page_view | 135 |
| user_engagement | 98 |
| session_start | 94 |
| first_visit | 79 |
| pricing_view | 11 |
| mobile_landing | 8 |
| checkout_start | 5 |

#### Key Events (28-day)

| Event | Key Events |
|-------|------------|
| page_view | 61 |
| pricing_view | 7 |

#### Active Users by Country (28-day)

| Country | Active Users |
|---------|-------------|
| United States | 21 |
| Mexico | 12 |
| Pakistan | 7 |
| Cyprus | 5 |
| Australia | 4 |
| Canada | 4 |
| Ecuador | 3 |

**Total Revenue (28-day): $0.00**

---

## 2) Conversion Funnel (GA4 Events)

| Event | Count |
|-------|-------|
| `pricing_view` | 0 |
| `theme_preview` | 0 |
| `checkout_start` | 0 |
| `checkout_abandon` | 0 |
| `purchase_success` | 0 |
| `trial_start` | 0 |
| `mobile_landing` | 0 |
| `mobile_email_capture` | 0 |

---

## 3) Core Web Vitals & UX (Clarity)

> **Period:** Last 3 days — data confirmed via dashboard screenshot

### Performance Score: 49/100 ⚠️
0% good · 50% needs improvement · 50% poor (from 4 pageviews)

| Metric | Value | Threshold | Status |
|--------|-------|-----------|--------|
| LCP | 7.1s | 2.5s good / 4.0s poor | **POOR** |
| INP | 710ms | 200ms good / 500ms poor | **POOR** |
| CLS | 0.001 | 0.1 good / 0.25 poor | GOOD |

### Session Metrics (Clarity — Last 3 days)

| UX Metric | Value |
|-----------|-------|
| Sessions | 9 (0 bot) |
| Unique Users | 9 |
| Pages per Session | 1.67 |
| Scroll Depth | 47.53% |
| Active Time | 48s (of 1.4 min total) |
| New User Rate | 100% |
| Rage Clicks | 0% (0 sessions) |
| Dead Clicks | 22.22% (2 sessions) |
| Quick Backs | 33.33% (3 sessions) |
| Excessive Scrolling | 0% |

### Smart Events (Clarity)

| Event | Sessions |
|-------|----------|
| Outbound click | 2 |
| Contact us | 1 |

### Funnel: Marketing → Purchase (Clarity)

| Step | Sessions | Rate |
|------|----------|------|
| Landing | 1 | 11.11% of 9 |
| Purchase Success | 0 | 0% |

**Conversion rate: 0%**

### Top Pages (Clarity — Last 3 days)

| Page | Sessions |
|------|----------|
| https://themegpt.ai/ | 7 |
| https://themegpt.ai/terms | 3 |
| https://themegpt.ai/blog | 2 |
| https://themegpt.ai/support | 2 |

### Referrers & Browsers

| Referrer | Sessions |
|----------|----------|
| themegpt.ai | 5 |
| syndicatedsearch.goog | 3 |
| www.google.com | 2 |

| Browser | Share | Sessions |
|---------|-------|----------|
| Chrome | 88.89% | 8 |
| Edge | 11.11% | 1 |

**JavaScript errors:** 0 total · **Bot traffic:** No data (insufficient volume)

---

## 4) Google Ads Campaign

> **API Status:** Developer token Basic access pending — data captured manually via dashboard.
> **Diagnostic:** [doc/dev/failures/2026-03-04/google_ads-console.json](failures/2026-03-04/google_ads-console.json)

### Cumulative Performance (Feb 21 – Mar 4, 2026)

| Metric | Value |
|--------|-------|
| Clicks | 1,900 |
| Impressions | 21,374 |
| Avg. CPC | $0.58 |
| Total Spend | $1,102.77 |
| Conversions | N/A (not tracked) |

### Billing Summary

| Item | Value |
|------|-------|
| Current Balance | $19.09 |
| Last Payment | $350.00 (Mar 4, manual — Visa ···5393) |
| Next Auto-Payment | Apr 1 or at $500 balance — Visa ···5393 |
| March Net Cost | $369.09 |
| March Payments | $592.28 |
| February Net Cost | $829.39 |
| February Payments | $587.11 |

### ⚠️ ALERT: Payment Method Issue

**Banner**: "New form of payment required"
**Issue**: Mastercard ···8331 (backup card) is flagged — dialog warns "Make sure your payment method is up to date and has sufficient funds."
**Action Required**: Verify or replace Mastercard ···8331 in Google Ads → Billing → Payment methods.

---

## 5) Chrome Web Store

| Metric | Value |
|--------|-------|
| Installs | 23 |
| Listing Views | 22 |

### Raw CWS GA4 Events

| Event | Count |
|-------|-------|
| `install` | 23 |
| `page_view` | 22 |
| `session_start` | 21 |
| `first_visit` | 20 |

---

## 6) Server-Side Monetization (Source of Truth)

| Metric | Value |
|--------|-------|
| Checkout Created | 0 |
| Checkout Completed | 0 |
| Checkout Expired | 0 |
| One-Time Revenue | $0.00 |
| Subscription Revenue | $0.00 |
| **Total Revenue** | **$0.00** |
| Paid Events | 0 |

---

## 7) Guardrail Check

| Guardrail | Value | Threshold | Status |
|-----------|-------|-----------|--------|
| No-signal kill | Spend: $0.00, Checkouts: 0 | >= $75 with 0 checkouts | OK |
| CAC | N/A (0 conversions) | > $45 | — |
