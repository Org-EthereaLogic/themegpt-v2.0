# Daily Metrics Report: 2026-03-02 (Morning)

**Generated:** 16:44 UTC  
**Period:** Morning  
**Lookback:** 1 day(s)  

**Data Sources:** 2/6 succeeded

- **ga4_traffic**: FAILED (403 Request had insufficient authentication scopes. [reason: "ACCESS_TOKEN_SCOPE_INSUFFICIENT"
domain: "googleapis.com"
metadata {
  key: "service"
  value: "analyticsdata.googleapis.com"
}
metadata {
  key: "method"
  value: "google.analytics.data.v1beta.BetaAnalyticsData.RunReport"
}
])
- **ga4_funnel**: FAILED (403 Request had insufficient authentication scopes. [reason: "ACCESS_TOKEN_SCOPE_INSUFFICIENT"
domain: "googleapis.com"
metadata {
  key: "service"
  value: "analyticsdata.googleapis.com"
}
metadata {
  key: "method"
  value: "google.analytics.data.v1beta.BetaAnalyticsData.RunReport"
}
])
- **google_ads**: FAILED (authorization_error: USER_PERMISSION_DENIED: User doesn't have permission to access customer. Note: If you're accessing a client customer, the manager's customer id must be set in the 'login-customer-id' header. See https://developers.google.com/google-ads/api/docs/concepts/call-structure#cid)
- **clarity**: OK
- **cws**: FAILED (403 Request had insufficient authentication scopes. [reason: "ACCESS_TOKEN_SCOPE_INSUFFICIENT"
domain: "googleapis.com"
metadata {
  key: "service"
  value: "analyticsdata.googleapis.com"
}
metadata {
  key: "method"
  value: "google.analytics.data.v1beta.BetaAnalyticsData.RunReport"
}
])
- **monetization**: OK

---

## 1) Traffic Overview (GA4)

*GA4 traffic data unavailable: 403 Request had insufficient authentication scopes. [reason: "ACCESS_TOKEN_SCOPE_INSUFFICIENT"
domain: "googleapis.com"
metadata {
  key: "service"
  value: "analyticsdata.googleapis.com"
}
metadata {
  key: "method"
  value: "google.analytics.data.v1beta.BetaAnalyticsData.RunReport"
}
]*

---

## 2) Conversion Funnel (GA4 Events)

*GA4 funnel data unavailable: 403 Request had insufficient authentication scopes. [reason: "ACCESS_TOKEN_SCOPE_INSUFFICIENT"
domain: "googleapis.com"
metadata {
  key: "service"
  value: "analyticsdata.googleapis.com"
}
metadata {
  key: "method"
  value: "google.analytics.data.v1beta.BetaAnalyticsData.RunReport"
}
]*

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
| Dead Clicks | 5 |

### Device Breakdown (Clarity)

| Device | Sessions | Share |
|--------|----------|-------|
| PC | 0 | 0.0% |

---

## 4) Google Ads Campaign

*Google Ads data unavailable: authorization_error: USER_PERMISSION_DENIED: User doesn't have permission to access customer. Note: If you're accessing a client customer, the manager's customer id must be set in the 'login-customer-id' header. See https://developers.google.com/google-ads/api/docs/concepts/call-structure#cid*

---

## 5) Chrome Web Store

*CWS data unavailable: 403 Request had insufficient authentication scopes. [reason: "ACCESS_TOKEN_SCOPE_INSUFFICIENT"
domain: "googleapis.com"
metadata {
  key: "service"
  value: "analyticsdata.googleapis.com"
}
metadata {
  key: "method"
  value: "google.analytics.data.v1beta.BetaAnalyticsData.RunReport"
}
]*

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
