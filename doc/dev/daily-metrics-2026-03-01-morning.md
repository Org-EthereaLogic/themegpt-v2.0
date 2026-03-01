# Daily Metrics Report: 2026-03-01 (Morning)

**Generated:** 17:19 UTC
**Period:** Morning  
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
| Sessions | 5 |
| Users | 4 |
| New Users | 4 |
| Engaged Sessions | 5 |
| Avg Session Duration | 25.2s |
| Page Views | 6 |
| Bounce Rate | 0.0% |

### Channel Breakdown

| Channel | Sessions | Engaged | Bounce Rate | Avg Duration |
|---------|----------|---------|-------------|-------------|
| Paid Search | 4 | 4 | 0.0% | 28.9s |
| Cross-network | 1 | 1 | 0.0% | 10.4s |
| Unassigned | 1 | 0 | 100.0% | 0.0s |

### Device Split

| Device | Sessions | Bounce Rate | Avg Duration |
|--------|----------|-------------|-------------|
| desktop | 5 | 0.0% | 25.2s |

### Country Split (Top 10)

| Country | Users | Share |
|---------|-------|-------|
| (not set) | 2 | 50.0% |
| Ecuador | 1 | 25.0% |
| Uganda | 1 | 25.0% |

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
| Installs | 36 |
| Listing Views | 34 |

### Raw CWS GA4 Events

| Event | Count |
|-------|-------|
| `install` | 36 |
| `page_view` | 34 |
| `session_start` | 29 |
| `first_visit` | 26 |

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
