# Daily Metrics Report: 2026-03-01 (Morning)

**Generated:** 00:22 UTC  
**Period:** Morning  
**Lookback:** 1 day(s)  

**Data Sources:** 5/6 succeeded

- **ga4_traffic**: OK
- **ga4_funnel**: OK
- **google_ads**: FAILED ((<_SingleThreadedRendezvous of RPC that terminated with:
	status = StatusCode.UNAUTHENTICATED
	details = "Request is missing required authentication credential. Expected OAuth 2 access token, login cookie or other valid authentication credential. See https://developers.google.com/identity/sign-in/web/devconsole-project."
	debug_error_string = "UNKNOWN:Error received from peer ipv4:142.251.46.74:443 {grpc_status:16, grpc_message:"Request is missing required authentication credential. Expected OAuth 2 access token, login cookie or other valid authentication credential. See https://developers.google.com/identity/sign-in/web/devconsole-project."}"
>, <_SingleThreadedRendezvous of RPC that terminated with:
	status = StatusCode.UNAUTHENTICATED
	details = "Request is missing required authentication credential. Expected OAuth 2 access token, login cookie or other valid authentication credential. See https://developers.google.com/identity/sign-in/web/devconsole-project."
	debug_error_string = "UNKNOWN:Error received from peer ipv4:142.251.46.74:443 {grpc_status:16, grpc_message:"Request is missing required authentication credential. Expected OAuth 2 access token, login cookie or other valid authentication credential. See https://developers.google.com/identity/sign-in/web/devconsole-project."}"
>, errors {
  error_code {
    authentication_error: DEVELOPER_TOKEN_INVALID
  }
  message: "The developer token is not valid."
}
request_id: "0Bu7jfpH2qFDtnrN0ayprg"
, '0Bu7jfpH2qFDtnrN0ayprg'))
- **clarity**: OK
- **cws**: OK
- **monetization**: OK

---

## 1) Traffic Overview (GA4)

| Metric | Value |
|--------|-------|
| Sessions | 2 |
| Users | 2 |
| New Users | 2 |
| Engaged Sessions | 2 |
| Avg Session Duration | 0.0s |
| Page Views | 2 |
| Bounce Rate | 0.0% |

### Channel Breakdown

| Channel | Sessions | Engaged | Bounce Rate | Avg Duration |
|---------|----------|---------|-------------|-------------|
| Paid Search | 2 | 2 | 0.0% | 0.0s |

### Device Split

| Device | Sessions | Bounce Rate | Avg Duration |
|--------|----------|-------------|-------------|
| desktop | 2 | 0.0% | 0.0s |

### Country Split (Top 10)

| Country | Users | Share |
|---------|-------|-------|
|  | 2 | 100.0% |

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

---

## 4) Google Ads Campaign

*Google Ads data unavailable: (<_SingleThreadedRendezvous of RPC that terminated with:
	status = StatusCode.UNAUTHENTICATED
	details = "Request is missing required authentication credential. Expected OAuth 2 access token, login cookie or other valid authentication credential. See https://developers.google.com/identity/sign-in/web/devconsole-project."
	debug_error_string = "UNKNOWN:Error received from peer ipv4:142.251.46.74:443 {grpc_status:16, grpc_message:"Request is missing required authentication credential. Expected OAuth 2 access token, login cookie or other valid authentication credential. See https://developers.google.com/identity/sign-in/web/devconsole-project."}"
>, <_SingleThreadedRendezvous of RPC that terminated with:
	status = StatusCode.UNAUTHENTICATED
	details = "Request is missing required authentication credential. Expected OAuth 2 access token, login cookie or other valid authentication credential. See https://developers.google.com/identity/sign-in/web/devconsole-project."
	debug_error_string = "UNKNOWN:Error received from peer ipv4:142.251.46.74:443 {grpc_status:16, grpc_message:"Request is missing required authentication credential. Expected OAuth 2 access token, login cookie or other valid authentication credential. See https://developers.google.com/identity/sign-in/web/devconsole-project."}"
>, errors {
  error_code {
    authentication_error: DEVELOPER_TOKEN_INVALID
  }
  message: "The developer token is not valid."
}
request_id: "0Bu7jfpH2qFDtnrN0ayprg"
, '0Bu7jfpH2qFDtnrN0ayprg')*

---

## 5) Chrome Web Store

| Metric | Value |
|--------|-------|
| Installs | 14 |
| Listing Views | 15 |

### Raw CWS GA4 Events

| Event | Count |
|-------|-------|
| `page_view` | 15 |
| `install` | 14 |
| `session_start` | 12 |
| `first_visit` | 11 |

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
