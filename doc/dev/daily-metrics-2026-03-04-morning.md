# Daily Metrics Report: 2026-03-04 (Morning)

**Generated:** 02:35 UTC  
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
| Sessions | 6 |
| Users | 6 |
| New Users | 5 |
| Engaged Sessions | 5 |
| Avg Session Duration | 73.8s |
| Page Views | 6 |
| Bounce Rate | 16.7% |

### Channel Breakdown

| Channel | Sessions | Engaged | Bounce Rate | Avg Duration |
|---------|----------|---------|-------------|-------------|
| Cross-network | 2 | 2 | 0.0% | 219.8s |
| Paid Search | 2 | 2 | 0.0% | 1.5s |
| Unassigned | 2 | 0 | 100.0% | 0.0s |
| Direct | 1 | 1 | 0.0% | 0.0s |

### Device Split

| Device | Sessions | Bounce Rate | Avg Duration |
|--------|----------|-------------|-------------|
| desktop | 6 | 16.7% | 73.8s |

### Country Split (Top 10)

| Country | Users | Share |
|---------|-------|-------|
| United States | 3 | 50.0% |
| Mexico | 2 | 33.3% |
| Bhutan | 1 | 16.7% |

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
| Installs | 18 |
| Listing Views | 16 |

### Raw CWS GA4 Events

| Event | Count |
|-------|-------|
| `install` | 18 |
| `page_view` | 16 |
| `session_start` | 15 |
| `first_visit` | 14 |

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
