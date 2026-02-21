# Weekly Monetization & Growth Scorecard Template

**Purpose:** Weekly operating snapshot for active paid + organic growth.
**Cadence:** Weekly (recommended every Monday for prior Mon-Sun week).
**Owner:** Growth + Product + Ops

---

## 1) Week Metadata

- **Week start (Mon):** `YYYY-MM-DD`
- **Week end (Sun):** `YYYY-MM-DD`
- **Prepared on:** `YYYY-MM-DD`
- **Prepared by:** `Name`

---

## 2) Top-of-Funnel (Chrome Web Store + Acquisition)

| Metric | Value | WoW change | Notes |
|--------|-------|-----------|-------|
| CWS listing views |  |  | CWS dashboard |
| CWS installs |  |  | CWS dashboard |
| CWS uninstall rate % |  |  | `uninstalls / installs * 100` |
| Web sessions (GA4) |  |  | Consent-gated diagnostic only |
| Paid traffic share % |  |  | From UTM source/medium |

Data source:
- Chrome Web Store dashboard
- GA4 Acquisition report

---

## 3) Server-Side Monetization (Source of Truth)

Pull from: `GET /api/metrics/monetization?days=7`

| Metric | Value | WoW change | Notes |
|--------|-------|-----------|-------|
| Checkout sessions created |  |  | `totals.checkoutCreated` |
| Checkout sessions completed |  |  | `totals.checkoutCompleted` |
| Checkout sessions expired |  |  | `totals.checkoutExpired` |
| One-time revenue (USD) |  |  | `totals.oneTimeRevenueCents / 100` |
| Subscription revenue (USD) |  |  | `totals.subscriptionRevenueCents / 100` |
| Total attributed revenue (USD) |  |  | `totals.totalRevenueCents / 100` |
| Paid conversion events |  |  | `totals.paidEvents` |

### Channel Breakdown (Top 5 by Revenue)

| Channel (`source / medium / campaign`) | Created | Completed | Revenue (USD) | Paid events | Notes |
|-----------------------------------------|---------|-----------|---------------|-------------|-------|
|  |  |  |  |  |  |
|  |  |  |  |  |  |
|  |  |  |  |  |  |
|  |  |  |  |  |  |
|  |  |  |  |  |  |

---

## 4) Client-Side Diagnostic Funnel (GA4 + Clarity)

| Event / signal | Value | WoW change | Diagnostic note |
|----------------|-------|-----------|-----------------|
| `pricing_view` |  |  | Scroll/visibility of pricing section |
| `theme_preview` |  |  | Intent signal on single-theme plan |
| `checkout_start` |  |  | Checkout attempts (consent-gated) |
| `checkout_abandon` |  |  | Return from Stripe without completion |
| `purchase_success` |  |  | Should directionally align with server-side completes |
| `trial_start` |  |  | Trial starts from successful subscription flow |

Clarity weekly review:
- Top friction point observed:
- Replay evidence (URL/timestamp):
- UI/content fix shipped:

---

## 5) Paid Guardrail Checks

| Guardrail | Current value | Threshold | Status | Action |
|-----------|---------------|-----------|--------|--------|
| Daily spend per channel |  | `$25/day/channel` |  |  |
| No-signal kill switch |  | `>= $75 with 0 checkouts` |  |  |
| CAC kill switch |  | `> $45 for 3 consecutive days` |  |  |
| Channel expansion gate |  | `first attributed revenue required` |  |  |

---

## 6) Country Mix Watch (India vs US)

| Country | Users | User share % | WoW change (pp) | Notes |
|---------|-------|--------------|-----------------|-------|
| India |  |  |  |  |
| United States |  |  |  |  |
| Other (top 3) |  |  |  |  |

Escalation rule:
- Trigger escalation review if India share is tied with or above US share for 2 consecutive weekly scorecards.

---

## 7) Weekly Decision Log

| Decision | Owner | Due date | Status |
|----------|-------|----------|--------|
|  |  |  |  |
|  |  |  |  |
|  |  |  |  |

---

## 8) Narrative Summary (3-5 bullets)

- What improved this week:
- What regressed this week:
- Biggest unknown:
- Next week action:
