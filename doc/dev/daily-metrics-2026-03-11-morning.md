# Daily Metrics Report: 2026-03-11 (Morning)

**Generated:** 21:37 UTC
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
| New Users | 7 |
| Engaged Sessions | 7 |
| Avg Session Duration | 30.1s |
| Page Views | 9 |
| Bounce Rate | 12.5% |

### Channel Breakdown

| Channel | Sessions | Engaged | Bounce Rate | Avg Duration |
|---------|----------|---------|-------------|-------------|
| Paid Search | 5 | 5 | 0.0% | 1.1s |
| Unassigned | 2 | 0 | 100.0% | 35.5s |
| Cross-network | 1 | 1 | 0.0% | 139.1s |
| Referral | 1 | 1 | 0.0% | 25.0s |

### Device Split

| Device | Sessions | Bounce Rate | Avg Duration |
|--------|----------|-------------|-------------|
| desktop | 8 | 12.5% | 30.1s |

### Country Split (Top 10)

| Country | Users | Share |
|---------|-------|-------|
| United States | 5 | 62.5% |
| United Kingdom | 3 | 37.5% |

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
| Dead Clicks | 1 |

### Device Breakdown (Clarity)

| Device | Sessions | Share |
|--------|----------|-------|
| PC | 0 | 0.0% |

---

## 4) Google Ads Campaign

*Google Ads API unavailable (developer token pending). Data below captured manually from Google Ads UI.*

| Metric | Value |
|--------|-------|
| Clicks | 90 |
| Impressions | 617 |
| Avg CPC | $0.39 |
| Est. Cost | ~$35.10 |
| Conversions | 0 |

*vs. prior day: -31 clicks, -366 impr, -$0.03 CPC*

> Screenshot: [doc/dev/failures/2026-03-11/google_ads.webp](failures/2026-03-11/google_ads.webp)

---

## 5) Chrome Web Store

| Metric | Value |
|--------|-------|
| Installs | 22 |
| Listing Views | 21 |

### Raw CWS GA4 Events

| Event | Count |
|-------|-------|
| `install` | 22 |
| `page_view` | 21 |
| `first_visit` | 17 |
| `session_start` | 17 |

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
| No-signal kill | Spend: ~$35.10, Checkouts: 0 | >= $75 with 0 checkouts | OK |
| CAC | N/A (0 conversions) | > $45 | — |
