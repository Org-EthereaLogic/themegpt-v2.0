# Daily Metrics Report: 2026-03-03 (Morning)

**Generated:** 19:24 UTC  
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
| Sessions | 5 |
| Users | 5 |
| New Users | 5 |
| Engaged Sessions | 5 |
| Avg Session Duration | 97.2s |
| Page Views | 6 |
| Bounce Rate | 0.0% |

### Channel Breakdown

| Channel | Sessions | Engaged | Bounce Rate | Avg Duration |
|---------|----------|---------|-------------|-------------|
| Direct | 3 | 3 | 0.0% | 15.4s |
| Unassigned | 2 | 0 | 100.0% | 0.0s |
| Cross-network | 1 | 1 | 0.0% | 439.5s |
| Paid Search | 1 | 1 | 0.0% | 0.0s |

### Device Split

| Device | Sessions | Bounce Rate | Avg Duration |
|--------|----------|-------------|-------------|
| desktop | 5 | 0.0% | 97.2s |

### Country Split (Top 10)

| Country | Users | Share |
|---------|-------|-------|
| United States | 3 | 60.0% |
| Bhutan | 1 | 20.0% |
| Mexico | 1 | 20.0% |

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
| Dead Clicks | 1 |

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
| Installs | 28 |
| Listing Views | 30 |

### Raw CWS GA4 Events

| Event | Count |
|-------|-------|
| `page_view` | 30 |
| `install` | 28 |
| `session_start` | 24 |
| `first_visit` | 23 |

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
