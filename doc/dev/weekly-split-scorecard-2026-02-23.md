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
| Web sessions (GA4, Feb 21–23) | 55 | N/A (Days 2–4) | GA4 property `516189580`. Consent-gated diagnostic only. Feb 23 midday: 26 sessions (0 checkout_start — all paid traffic bounced). |
| Paid traffic share % | 54% | N/A | Cross-network (9) + Paid Search (5) + Paid Social (1) + Reddit (1) = ~35% of Feb 22+23 combined |

**Session channel breakdown (Feb 21–23 combined):**

| Channel | Sessions | Notes |
|---------|----------|-------|
| Cross-network | 9 | Google Performance Max / multi-channel |
| Unassigned | 17 | 31% of Feb 23 midday total — Gate 1 FAIL |
| Paid Search | 10 | Google Search "Website traffic-Search-1" — 100% bounce, avg 0.0s in GA4 |
| Direct | 7 | |
| Paid Social | 1 | Reddit `reddit_launch_v1` |
| Referral | 3 | `checkout.stripe.com` returns (portal/testing) |
| **Total** | **46** | |

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
| Daily spend per channel | Reddit: $50/day | `Google: $25/day, Reddit: $50/day` | TRACKING | Google API auth insufficient. Reddit campaign manually set to $50/day to hit promo requirements. |
| No-signal kill switch | — | `>= $75 with 0 checkouts` | UNKNOWN | 5 checkout_start events (Feb 21) are test data, not real signal |
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
| Optimize Google/Reddit Ads for Desktop-Only | Growth | Feb 23 | DONE |
| Launch Reddit Campaign at $50/day for Credit Promo | Growth | Feb 23 | DONE |
| Configure Stripe Customer Portal (live mode) | Eng | Feb 23 | DONE — payment methods, cancellations, legal links, redirect URL |
| Add Manage Subscription button to /account | Eng | Feb 23 | DONE — commit b48a056, revision 00173-xb7 |
| Handle invoice.payment_failed webhook + dunning email | Eng | Feb 23 | DONE |
| Fix trialing→active DB transition (HIGH audit finding) | Eng | Feb 23 | DONE — commit 540f9e7, revision 00176-5ts |
| Fix single-theme infinite spinner (HIGH audit finding) | Eng | Feb 23 | DONE |
| Submit EIN/tax ID to Stripe for account verification | Ops | Feb 23 | DONE — review in progress (2–3 days) |
| Apply Google Ads structured snippets (Styles) | Growth | Feb 23 | DONE — Aurora Borealis, Synth Wave, Midnight Dark |
| Fix checkout double-login UX (callbackUrl + login context) | Eng | Feb 23 | DONE — commit 9537d36, deployed |
| Fix extension auth race condition (ping vs token timing) | Eng | Feb 23 | DONE — commit 9537d36, deployed |
| Investigate Reddit Ads mobile spend waste | Growth | Feb 23 | DONE — 97% mobile, no platform fix available |
| Evaluate Reddit Ads pause decision | Growth | Feb 24 | OPEN — keeping running while evaluating |
| Add 8 specialized agents to .claude/agents/ | Eng | Feb 23 | DONE — commit f6e35a7 |
| Update CLAUDE.md + AGENTS.md with agent routing | Eng | Feb 23 | DONE — commit f6e35a7 |
| Monitor post-fix checkout completion rate | Growth | Feb 24+ | OPEN |
| Test extension auth flow end-to-end in production | QA | Feb 24 | OPEN |

---

## 8) Narrative Summary

- **What improved this week:** First live trial conversion on Feb 22 (`adrielletherat@gmail.com` — Monthly Trial). Root cause of 18 checkouts / 0 conversions resolved (`payment_method_collection: 'if_required'`). Full payment system audit completed — 3 conversion blockers patched (infinite spinner for single-theme buyers, `trialing→active` DB sync gap, `session.customer` null cast). Abandoned checkout recovery pipeline confirmed live via 3 received recovery emails. Stripe Customer Portal shipped and live-tested end-to-end with real subscriber. `allow_promotion_codes: true` added to checkout. Google Ads and Reddit Ads pivoted to desktop-only targeting. Reddit campaign launched at $50/day for $500 credit promo. EIN/tax ID submitted to Stripe. Two deploys: revisions `00173-xb7` and `00176-5ts`.
- **What regressed this week:** Gate 1 (unassigned traffic) FAIL for 3 consecutive days. Paid ad traffic generating 0 funnel events (day 3) — 100% bounce. Device engagement inversion: mobile traffic averaged 21.9s vs PC 0.8s on Clarity. Desktop targeting shift is intentional (extension not usable on mobile), but emphasizes the poor PC performance. GA4 events missing for known conversion (consent gap).
- **Evening session (Feb 23):** Deep Clarity session replay analysis identified three UX friction points: (1) checkout double-login caused by `callbackUrl` losing scroll position + silent 401 on auto-resume, (2) login page giving no context about pending checkout, (3) extension auth race condition where fast API beat 2s ping timeout. All three fixed and deployed (commit `9537d36`, build `df4378ef`). Google Ads structured snippets applied (Styles: Aurora Borealis, Synth Wave, Midnight Dark). Reddit Ads investigation revealed 97% mobile spend waste ($112/$115) with no platform-level device exclusion available. 8 specialized agents added to `.claude/agents/` with routing rules in CLAUDE.md and AGENTS.md.
- **Biggest unknown:** Whether the checkout UX fixes will reduce the double-login friction and improve checkout completion rate. Reddit Ads ROI remains questionable given inability to target desktop-only.
- **Next week action:** Monitor checkout completion rate post-UX-fix. Evaluate Reddit Ads pause/continue decision based on desktop conversion data. Pull Google Ads spend manually for guardrail verification. Test extension auth flow end-to-end to confirm race condition fix works in production.
