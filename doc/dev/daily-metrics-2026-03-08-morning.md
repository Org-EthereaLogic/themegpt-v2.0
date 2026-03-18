# Daily Metrics Report: 2026-03-08 (Morning)

**Generated:** 05:59 UTC  
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
| Sessions | 9 |
| Users | 9 |
| New Users | 8 |
| Engaged Sessions | 8 |
| Avg Session Duration | 141.9s |
| Page Views | 13 |
| Bounce Rate | 11.1% |

### Channel Breakdown

| Channel | Sessions | Engaged | Bounce Rate | Avg Duration |
|---------|----------|---------|-------------|-------------|
| Cross-network | 5 | 5 | 0.0% | 28.2s |
| Unassigned | 5 | 0 | 100.0% | 5.4s |
| Paid Search | 2 | 2 | 0.0% | 554.7s |
| Direct | 1 | 1 | 0.0% | 0.0s |

### Device Split

| Device | Sessions | Bounce Rate | Avg Duration |
|--------|----------|-------------|-------------|
| desktop | 9 | 11.1% | 141.9s |

### Country Split (Top 10)

| Country | Users | Share |
|---------|-------|-------|
| United States | 6 | 66.7% |
| United Kingdom | 2 | 22.2% |
| Philippines | 1 | 11.1% |

---

## 2) Conversion Funnel (GA4 Events)

| Event | Count |
|-------|-------|
| `pricing_view` | 1 |
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

### Device Breakdown (Clarity)

| Device | Sessions | Share |
|--------|----------|-------|
| PC | 0 | 0.0% |

---

## 4) Google Ads Campaign

*Google Ads data unavailable: Google Ads API: Basic developer token access pending. Check status at ads.google.com/aw/developer-token.*

---

## 5) Chrome Web Store

| Metric | Value |
|--------|-------|
| Installs | 6 |
| Listing Views | 6 |

### Raw CWS GA4 Events

| Event | Count |
|-------|-------|
| `install` | 6 |
| `page_view` | 6 |
| `first_visit` | 4 |
| `session_start` | 4 |

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
