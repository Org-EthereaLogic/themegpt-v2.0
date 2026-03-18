# Daily Metrics Report: 2026-03-01 (Morning)

**Generated:** 23:36 UTC  
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
| Sessions | 9 |
| Users | 7 |
| New Users | 7 |
| Engaged Sessions | 8 |
| Avg Session Duration | 15.2s |
| Page Views | 10 |
| Bounce Rate | 11.1% |

### Channel Breakdown

| Channel | Sessions | Engaged | Bounce Rate | Avg Duration |
|---------|----------|---------|-------------|-------------|
| Paid Search | 5 | 4 | 20.0% | 23.1s |
| Cross-network | 3 | 3 | 0.0% | 3.5s |
| Unassigned | 2 | 0 | 100.0% | 5.5s |
| Referral | 1 | 1 | 0.0% | 0.0s |

### Device Split

| Device | Sessions | Bounce Rate | Avg Duration |
|--------|----------|-------------|-------------|
| desktop | 9 | 11.1% | 15.2s |

### Country Split (Top 10)

| Country | Users | Share |
|---------|-------|-------|
| (not set) | 2 | 28.6% |
| Ecuador | 2 | 28.6% |
| Brazil | 1 | 14.3% |
| Mexico | 1 | 14.3% |
| Uganda | 1 | 14.3% |

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
| Dead Clicks | 2 |

### Device Breakdown (Clarity)

| Device | Sessions | Share |
|--------|----------|-------|
| PC | 0 | 0.0% |

---

## 4) Google Ads Campaign

*API unavailable (developer token pending Basic access upgrade — applied Mar 1). Data below captured manually via browser dashboard.*

**Date range shown: Feb 21 – 28, 2026 (cumulative since campaign launch)**

| Metric | Value |
|--------|-------|
| Clicks | 1,080 |
| Impressions | 13,810 |
| Avg CPC | $0.71 |
| Total Spend (Feb 21-28) | $762.09 |
| Campaign Status | Bid strategy learning |
| Budget | $100.00/day |

**March 1 Spend (from billing):** $140.32 (campaign actively running)
**February total net cost:** $829.39 (month still processing)
**Last payment processed:** $242.28 on Mar 1 (monthly auto-charge, Visa ···5393)

### ⚠️ BILLING ALERT — Action Required

| Item | Status |
|------|--------|
| Primary: Visa ···5393 | ✅ Active |
| Backup: Mastercard ···8331 | ❌ Payment declined |

**"There's an issue with your backup payment method. Fix it to help prevent campaign interruption."**
→ Navigate to Billing → Settings → Fix backup card to prevent potential campaign pause.

---

## 5) Chrome Web Store

| Metric | Value |
|--------|-------|
| Installs | 57 |
| Listing Views | 51 |

### Raw CWS GA4 Events

| Event | Count |
|-------|-------|
| `install` | 57 |
| `page_view` | 51 |
| `session_start` | 41 |
| `first_visit` | 37 |

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
