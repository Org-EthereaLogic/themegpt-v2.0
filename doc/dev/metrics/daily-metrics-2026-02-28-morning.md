# Daily Metrics Report: 2026-02-28 (Morning)

**Generated:** 23:51 UTC  
**Period:** Morning  
**Lookback:** 1 day(s)  

**Data Sources:** 5/6 succeeded

- **ga4_traffic**: OK
- **ga4_funnel**: OK
- **google_ads**: FAILED ((<_SingleThreadedRendezvous of RPC that terminated with:
	status = StatusCode.PERMISSION_DENIED
	details = "The caller does not have permission"
	debug_error_string = "UNKNOWN:Error received from peer ipv4:142.251.46.74:443 {grpc_message:"The caller does not have permission", grpc_status:7}"
>, <_SingleThreadedRendezvous of RPC that terminated with:
	status = StatusCode.PERMISSION_DENIED
	details = "The caller does not have permission"
	debug_error_string = "UNKNOWN:Error received from peer ipv4:142.251.46.74:443 {grpc_message:"The caller does not have permission", grpc_status:7}"
>, errors {
  error_code {
    authorization_error: USER_PERMISSION_DENIED
  }
  message: "User doesn\'t have permission to access customer. Note: If you\'re accessing a client customer, the manager\'s customer id must be set in the \'login-customer-id\' header. See https://developers.google.com/google-ads/api/docs/concepts/call-structure#cid"
}
request_id: "o32x1c9EjwufLjzSF_lfzQ"
, 'o32x1c9EjwufLjzSF_lfzQ'))
- **clarity**: OK
- **cws**: OK
- **monetization**: OK

---

## 1) Traffic Overview (GA4)

| Metric | Value |
|--------|-------|
| Sessions | 11 |
| Users | 10 |
| New Users | 10 |
| Engaged Sessions | 11 |
| Avg Session Duration | 100.5s |
| Page Views | 13 |
| Bounce Rate | 0.0% |

### Channel Breakdown

| Channel | Sessions | Engaged | Bounce Rate | Avg Duration |
|---------|----------|---------|-------------|-------------|
| Paid Search | 6 | 6 | 0.0% | 9.1s |
| Direct | 3 | 3 | 0.0% | 337.3s |
| Organic Search | 2 | 2 | 0.0% | 19.6s |

### Device Split

| Device | Sessions | Bounce Rate | Avg Duration |
|--------|----------|-------------|-------------|
| desktop | 11 | 0.0% | 100.5s |

### Country Split (Top 10)

| Country | Users | Share |
|---------|-------|-------|
| United States | 3 | 30.0% |
|  | 2 | 20.0% |
| Mexico | 2 | 20.0% |
| Brazil | 1 | 10.0% |
| Pakistan | 1 | 10.0% |
| Venezuela | 1 | 10.0% |

---

## 2) Conversion Funnel (GA4 Events)

| Event | Count |
|-------|-------|
| `pricing_view` | 4 |
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

*Google Ads data unavailable: (<_SingleThreadedRendezvous of RPC that terminated with:
	status = StatusCode.PERMISSION_DENIED
	details = "The caller does not have permission"
	debug_error_string = "UNKNOWN:Error received from peer ipv4:142.251.46.74:443 {grpc_message:"The caller does not have permission", grpc_status:7}"
>, <_SingleThreadedRendezvous of RPC that terminated with:
	status = StatusCode.PERMISSION_DENIED
	details = "The caller does not have permission"
	debug_error_string = "UNKNOWN:Error received from peer ipv4:142.251.46.74:443 {grpc_message:"The caller does not have permission", grpc_status:7}"
>, errors {
  error_code {
    authorization_error: USER_PERMISSION_DENIED
  }
  message: "User doesn\'t have permission to access customer. Note: If you\'re accessing a client customer, the manager\'s customer id must be set in the \'login-customer-id\' header. See https://developers.google.com/google-ads/api/docs/concepts/call-structure#cid"
}
request_id: "o32x1c9EjwufLjzSF_lfzQ"
, 'o32x1c9EjwufLjzSF_lfzQ')*

---

## 5) Chrome Web Store

| Metric | Value |
|--------|-------|
| Installs | 39 |
| Listing Views | 38 |

### Raw CWS GA4 Events

| Event | Count |
|-------|-------|
| `install` | 39 |
| `page_view` | 38 |
| `session_start` | 32 |
| `first_visit` | 29 |

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
