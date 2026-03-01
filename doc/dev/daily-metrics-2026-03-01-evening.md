# Daily Metrics Report: 2026-03-01 (Evening)

**Generated:** 06:26 UTC  
**Period:** Evening  
**Lookback:** 1 day(s)  

**Data Sources:** 5/6 succeeded

- **ga4_traffic**: OK
- **ga4_funnel**: OK
- **google_ads**: FAILED (authorization_error: USER_PERMISSION_DENIED: User doesn't have permission to access customer. Note: If you're accessing a client customer, the manager's customer id must be set in the 'login-customer-id' header. See https://developers.google.com/google-ads/api/docs/concepts/call-structure#cid)
- **clarity**: OK
- **cws**: OK
- **monetization**: OK

---

## 1) Traffic Overview (GA4)

| Metric | Value |
|--------|-------|
| Sessions | 3 |
| Users | 3 |
| New Users | 3 |
| Engaged Sessions | 3 |
| Avg Session Duration | 2.1s |
| Page Views | 3 |
| Bounce Rate | 0.0% |

### Channel Breakdown

| Channel | Sessions | Engaged | Bounce Rate | Avg Duration |
|---------|----------|---------|-------------|-------------|
| Paid Search | 2 | 2 | 0.0% | 0.0s |
| Cross-network | 1 | 1 | 0.0% | 6.2s |
| Unassigned | 1 | 0 | 100.0% | 0.0s |

### Device Split

| Device | Sessions | Bounce Rate | Avg Duration |
|--------|----------|-------------|-------------|
| desktop | 3 | 0.0% | 2.1s |

### Country Split (Top 10)

| Country | Users | Share |
|---------|-------|-------|
|  | 2 | 66.7% |
| Ecuador | 1 | 33.3% |

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

*Google Ads data unavailable: authorization_error: USER_PERMISSION_DENIED: User doesn't have permission to access customer. Note: If you're accessing a client customer, the manager's customer id must be set in the 'login-customer-id' header. See https://developers.google.com/google-ads/api/docs/concepts/call-structure#cid*

---

## 5) Chrome Web Store

| Metric | Value |
|--------|-------|
| Installs | 23 |
| Listing Views | 23 |

### Raw CWS GA4 Events

| Event | Count |
|-------|-------|
| `install` | 23 |
| `page_view` | 23 |
| `session_start` | 19 |
| `first_visit` | 17 |

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
