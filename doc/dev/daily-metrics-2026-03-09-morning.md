# Daily Metrics Report: 2026-03-09 (Morning)

**Generated:** 19:02 UTC
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
| Sessions | 15 |
| Users | 15 |
| New Users | 11 |
| Engaged Sessions | 12 |
| Avg Session Duration | 37.0s |
| Page Views | 21 |
| Bounce Rate | 20.0% |

### Channel Breakdown

| Channel | Sessions | Engaged | Bounce Rate | Avg Duration |
|---------|----------|---------|-------------|-------------|
| Unassigned | 9 | 0 | 100.0% | 16.4s |
| Cross-network | 5 | 5 | 0.0% | 44.2s |
| Referral | 3 | 3 | 0.0% | 24.0s |
| Paid Search | 2 | 2 | 0.0% | 24.1s |
| Direct | 1 | 1 | 0.0% | 37.2s |
| Organic Search | 1 | 1 | 0.0% | 28.8s |

### Device Split

| Device | Sessions | Bounce Rate | Avg Duration |
|--------|----------|-------------|-------------|
| desktop | 15 | 20.0% | 37.0s |

### Country Split (Top 10)

| Country | Users | Share |
|---------|-------|-------|
| United States | 12 | 80.0% |
| Costa Rica | 1 | 6.7% |
| Japan | 1 | 6.7% |
| United Kingdom | 1 | 6.7% |

---

## 2) Conversion Funnel (GA4 Events)

| Event | Count |
|-------|-------|
| `pricing_view` | 7 |
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
| Installs | 24 |
| Listing Views | 19 |

### Raw CWS GA4 Events

| Event | Count |
|-------|-------|
| `install` | 24 |
| `page_view` | 19 |
| `session_start` | 18 |
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
