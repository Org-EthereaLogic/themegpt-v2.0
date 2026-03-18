# Daily Metrics Report: 2026-03-13 (Morning)

**Generated:** 18:09 UTC
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
| Sessions | 2 |
| Users | 2 |
| New Users | 2 |
| Engaged Sessions | 2 |
| Avg Session Duration | 91.9s |
| Page Views | 4 |
| Bounce Rate | 0.0% |

### Channel Breakdown

| Channel | Sessions | Engaged | Bounce Rate | Avg Duration |
|---------|----------|---------|-------------|-------------|
| Paid Search | 1 | 1 | 0.0% | 33.9s |
| Referral | 1 | 1 | 0.0% | 149.9s |

### Device Split

| Device | Sessions | Bounce Rate | Avg Duration |
|--------|----------|-------------|-------------|
| desktop | 2 | 0.0% | 91.9s |

### Country Split (Top 10)

| Country | Users | Share |
|---------|-------|-------|
| United States | 2 | 100.0% |

---

## 2) Conversion Funnel (GA4 Events)

| Event | Count |
|-------|-------|
| `pricing_view` | 2 |
| `theme_preview` | 0 |
| `checkout_start` | 0 |
| `checkout_abandon` | 0 |
| `purchase_success` | 0 |
| `trial_start` | 0 |
| `mobile_landing` | 0 |
| `mobile_email_capture` | 0 |

---

## 3) Core Web Vitals & UX (Clarity)

| Metric | Value | Threshold | Status |
|--------|-------|-----------|--------|
| LCP | — | 2.5s good / 4.0s poor | — |
| INP | — | 200ms good / 500ms poor | — |
| CLS | — | 0.1 good / 0.25 poor | — |

| UX Metric | Value |
|-----------|-------|
| Total Sessions | 0 |
| Scroll Depth | — |
| Rage Clicks | 0 |
| Dead Clicks | 0 |

---

## 4) Google Ads Campaign

*Google Ads data unavailable: Google Ads API: Basic developer token access pending. Check status at ads.google.com/aw/developer-token.*

---

## 5) Chrome Web Store

| Metric | Value |
|--------|-------|
| Installs | 13 |
| Listing Views | 13 |

### Raw CWS GA4 Events

| Event | Count |
|-------|-------|
| `install` | 13 |
| `page_view` | 13 |
| `first_visit` | 9 |
| `session_start` | 9 |

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
