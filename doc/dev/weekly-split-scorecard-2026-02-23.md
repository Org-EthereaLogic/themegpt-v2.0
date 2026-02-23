# Weekly Monetization & Growth Scorecard: Week of Feb 23, 2026

**Purpose:** Weekly operating snapshot for active paid + organic growth.
**Cadence:** Weekly
**Owner:** Growth + Product + Ops
**Data freshness:** GA4 data reflects Feb 21–22 (24–48h processing delay); Feb 23 data pending.

---

## 1) Week Metadata

- **Week start (Mon):** `2026-02-17`
- **Week end (Sun):** `2026-02-23`
- **Prepared on:** `2026-02-23`
- **Prepared by:** EthereaLogic Team

---

## 2) Top-of-Funnel (Chrome Web Store + Acquisition)

| Metric | Value | WoW change | Notes |
|--------|-------|-----------|-------|
| CWS listing views | — | — | Pull from CWS dashboard |
| CWS installs | — | — | Pull from CWS dashboard |
| CWS uninstall rate % | — | — | Pull from CWS dashboard |
| Web sessions (GA4, Feb 21–22) | 29 | N/A (Day 2–3) | GA4 property `516189580`. Consent-gated diagnostic only. |
| Paid traffic share % | 51.7% | N/A | Cross-network (9) + Paid Search (5) + Paid Social (1) = 15 of 29 sessions |

**Session channel breakdown (Feb 21–22 combined):**

| Channel | Sessions | Notes |
|---------|----------|-------|
| Cross-network | 9 | Google Performance Max / multi-channel |
| Unassigned | 8 | 32% of Feb 22 total — Gate 1 FAIL |
| Paid Search | 5 | Google Search ads active |
| Direct | 5 | 3 on Feb 21, 2 on Feb 22 |
| Paid Social | 1 | |
| Referral | 1 | Reddit `reddit_launch_v1` UTM from Feb 21 |
| **Total** | **29** | |

---

## 3) Server-Side Monetization (Source of Truth)

Pull from: `GET /api/metrics/monetization?days=7` (requires auth — pull manually)

| Metric | Value | WoW change | Notes |
|--------|-------|-----------|-------|
| Checkout sessions created | — | — | `totals.checkoutCreated` |
| Checkout sessions completed | — | — | `totals.checkoutCompleted` |
| Checkout sessions expired | — | — | `totals.checkoutExpired` |
| One-time revenue (USD) | — | — | |
| Subscription revenue (USD) | — | — | First trial conversion: `adrielletherat@gmail.com` on Feb 22 |
| Total attributed revenue (USD) | — | — | |
| Paid conversion events | — | — | |

### Channel Breakdown (Top 5 by Revenue)

| Channel | Created | Completed | Revenue (USD) | Paid events | Notes |
|-----------------------------------------|---------|-----------|---------------|-------------|-------|
| — | — | — | — | — | Pull from server-side API |

---

## 4) Client-Side Diagnostic Funnel (GA4 — Feb 21–22)

| Event / signal | Value | WoW change | Diagnostic note |
|----------------|-------|-----------|-----------------|
| `pricing_view` | 3 | N/A | Pricing section scroll confirmed |
| `theme_preview` | 0 | N/A | No single-theme intent signals yet |
| `checkout_start` | 5 | N/A | Real checkout attempts firing |
| `checkout_abandon` | 0 | N/A | Not firing — users may not returning via `/?canceled=true` consistently or abandoning before cancel |
| `purchase_success` | 0 | N/A | No completed purchases in GA4 yet |
| `trial_start` | 0 | N/A | No trial conversions visible in GA4 |

> Note: First live trial conversion confirmed server-side on Feb 22 (`adrielletherat@gmail.com`). GA4 client-side event not yet reflected — either consent not given or event timing gap.

Clarity weekly review:
- Top friction point observed: Users reaching Stripe checkout then abandoning (multiple `/?canceled=true` returns observed Feb 21–22)
- Replay evidence: Clarity project `vky4a128au` — filter for `checkout_start` sessions
- UI/content fix shipped: `payment_method_collection: 'if_required'` deployed Feb 22 (v2.3.1 web)

---

## 5) Paid Guardrail Checks

| Guardrail | Current value | Threshold | Status | Action |
|-----------|---------------|-----------|--------|--------|
| Daily spend per channel | — | `$25/day/channel` | UNKNOWN | Pull from Google Ads dashboard — API auth insufficient |
| No-signal kill switch | — | `>= $75 with 0 checkouts` | UNKNOWN | 5 checkout_start events recorded Feb 22 — suggests signal exists |
| CAC kill switch | — | `> $45 for 3 consecutive days` | UNKNOWN | Pull from Google Ads |
| Channel expansion gate | NOT MET | `first attributed revenue required` | HOLD | Server-side conversion on Feb 22 not yet attributed to paid channel |

> Google Ads MCP API returned `ACCESS_TOKEN_SCOPE_INSUFFICIENT` — pull campaign spend manually from Google Ads dashboard for guardrail verification.

---

## 6) Country Mix Watch (India vs US)

| Country | Users | User share % | WoW change (pp) | Notes |
|---------|-------|--------------|-----------------|-------|
| United States | 6 | 35% | N/A | #1 country — healthy |
| Canada | 4 | 24% | N/A | Strong #2 |
| United Kingdom | 2 | 12% | N/A | |
| India | 0 | 0% | N/A (baseline 22%) | Not in top 8 this period — no escalation concern |
| Other (top 5) | 5 | 29% | N/A | Australia, Cyprus, Estonia, Ireland, Mexico (1 each) |

Total visible users from API: 17 (row_count: 11 countries total)

Escalation rule: India share 0% vs US 35% — no escalation. Good signal.

---

## 7) Weekly Decision Log

| Decision | Owner | Due date | Status |
|----------|-------|----------|--------|
| Fix broken pnpm lockfile (Dependabot merge artifact) | Eng | Feb 23 | DONE |
| Pin extension tailwindcss back to v3 (Dependabot v4 bump broke CI) | Eng | Feb 23 | DONE |
| Submit v2.3.1 to CWS + Edge via automated pipeline | Eng | Feb 23 | DONE — both stores Pending Review |
| Add v*.*.* tag trigger to submit-extension.yml | Eng | Feb 23 | DONE |
| Dismiss CVE-2025-56648 Dependabot alert (already patched) | Sec | Feb 23 | DONE |
| Pull Google Ads spend manually for guardrail check | Growth | Feb 23 | OPEN |
| Pull server-side monetization API for revenue totals | Growth | Feb 23 | OPEN |

---

## 8) Narrative Summary

- **What improved this week:** First live trial conversion on Feb 22 (adrielletherat@gmail.com — Monthly Trial). Root cause of 18 checkouts / 0 conversions resolved (`payment_method_collection: 'if_required'`). Paid channels active: Cross-network (9 sessions), Paid Search (5 sessions). v2.3.1 submitted to both CWS and Edge. CI/CD pipeline fully automated — future releases via `git tag vX.X.X`.
- **What regressed this week:** Gate 1 (unassigned traffic) still at 32% on Feb 22 — FAIL threshold. GA4 client-side events not reflecting the server-confirmed trial conversion (consent gap or event gap). Google Ads API auth insufficient for automated spend tracking.
- **Biggest unknown:** Whether the Feb 22 trial conversion was a one-off or the start of a conversion pattern now that the payment flow is fixed. No `purchase_success` GA4 event yet — unclear if consent was given or event is missing.
- **Next week action:** Monitor daily for additional trial conversions post-payment-fix. Pull Google Ads spend manually to verify guardrails. Investigate why `trial_start` / `purchase_success` GA4 events absent despite server-confirmed conversion.
