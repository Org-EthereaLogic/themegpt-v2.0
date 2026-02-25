# Weekly Monetization & Growth Scorecard: Week of Feb 23, 2026

**Purpose:** Weekly operating snapshot for active paid + organic growth.
**Cadence:** Weekly
**Owner:** Growth + Product + Ops
**Data freshness:** GA4 data reflects Feb 21–24 (full-day processed as of Feb 25 verification pull). GA4 OAuth token was re-authed Feb 24 evening.

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
| Web sessions (GA4, Feb 21–23) | 42 | N/A (Days 2–4) | GA4 property `516189580`. Feb 21: 4 sessions (Direct 3, Referral 1). Feb 22: 17 sessions (Paid Search 11, Cross-network 3, Direct 2, Paid Social 1). Feb 23: 21 sessions (Paid Search 19, Cross-network 1, Direct 1). |
| Paid traffic share % | 83% | N/A | Paid Search (30) + Cross-network (4) + Paid Social (1) = 35 of 42 total sessions. Paid channels dominant. |

**Session channel breakdown (Feb 21–23 full-day processed):**

| Channel | Sessions | Notes |
|---------|----------|-------|
| Paid Search | 30 | Google Search "Website traffic-Search-1". Strong volume, weak engagement (5.3–11.9s avg session duration). |
| Cross-network | 4 | Google cross-network traffic (mostly mobile). |
| Direct | 6 | Organic/bookmarks. |
| Paid Social | 1 | Reddit `reddit_launch_v1` appears minimally in GA4 attribution for this window. |
| Referral | 1 | Organic referral traffic present on Feb 21. |
| Unassigned | 0 | No unassigned sessions in Feb 21–23 after full-day reprocessing. |
| **Total** | **42** | Attribution quality improved versus earlier snapshots. |

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

## 4) Client-Side Diagnostic Funnel (GA4 — Feb 21–23)

| Event / signal | Value | WoW change | Diagnostic note |
|----------------|-------|-----------|-----------------|
| `pricing_view` | 3 | N/A | All from Feb 21 organic traffic only |
| `theme_preview` | 0 | N/A | No single-theme intent signals yet |
| `checkout_start` | 5 | N/A | All from Feb 21 organic traffic only (confirmed via MCP cumulative Feb 21–23) |
| `checkout_abandon` | 0 | N/A | Not firing — users may not return via `/?canceled=true` consistently |
| `purchase_success` | 0 | N/A | No completed purchases in GA4 yet |
| `trial_start` | 0 | N/A | No trial conversions visible in GA4 |

> **Feb 24 update (revalidated Feb 25):** checkout_start=5 and pricing_view=3 are still concentrated on Feb 21. `trial_start` and `purchase_success` remain at zero in GA4 for Feb 21–24. Feb 24 did record mobile funnel activity (`mobile_landing`=4, `mobile_email_capture`=1), but no checkout-stage events.

Clarity weekly review:

- Top friction point observed: Users reaching Stripe checkout then abandoning (multiple `/?canceled=true` returns observed Feb 21–22)
- Replay evidence: Clarity project `vky4a128au` — filter for `checkout_start` sessions
- UI/content fix shipped: `payment_method_collection: 'if_required'` deployed Feb 22 (v2.3.1 web)
- Checkout UX fixes deployed Feb 23: callbackUrl with `#pricing` anchor, login page checkout context, extension auth race condition fix

---

## 5) Paid Guardrail Checks

| Guardrail | Current value | Threshold | Status | Action |
|-----------|---------------|-----------|--------|--------|
| Daily spend per channel | Reddit: $50/day | `Google: $25/day, Reddit: $50/day` | TRACKING | Google Ads MCP still expired (separate OAuth from GA4). Reddit campaign manually set to $50/day for promo requirements. |
| No-signal kill switch | >$200 cumulative, 0 paid checkouts | `>= $75 with 0 checkouts` | EXCEEDED | Exceeded threshold but decision is to CONTINUE — 150+ CWS installs suggest product-market fit exists. The conversion gap (installs vs paid conversions) is the investigation focus, not ad pause. |
| CAC kill switch | — | `> $45 for 3 consecutive days` | UNKNOWN | Pull from Google Ads dashboard manually |
| Channel expansion gate | NOT MET | `first attributed revenue required` | HOLD | Server-side conversion on Feb 22 not yet attributed to paid channel |
| Reddit device limitation | No desktop-only targeting | Platform limitation | ACCEPTED | Reddit has no device exclusion feature. 97% of Reddit clicks go to mobile. Decision: continue running while investigating conversion barriers. |

> Google Ads MCP API expired (separate OAuth from GA4 Data API — needs its own re-auth). Pull campaign spend manually from Google Ads dashboard for guardrail verification.
> **Decision (Feb 24):** Continue both Google Ads and Reddit Ads while investigating the conversion gap. 150+ CWS downloads with daily installs indicate product demand — the problem is conversion path, not product interest.

---

## 6) Country Mix Watch (India vs US)

| Country | Users | User share % | WoW change (pp) | Notes |
|---------|-------|--------------|-----------------|-------|
| Cyprus | 5 | 13% | N/A | Tied #1 — new entrant at top |
| United States | 5 | 13% | N/A | Tied #1 — was sole #1 in Feb 21–22 data |
| Pakistan | 4 | 11% | N/A | New entrant — not present in earlier pulls |
| Canada | 4 | 11% | N/A | Stable |
| United Kingdom | 2 | 5% | N/A | Stable |
| India | 0 | 0% | N/A (baseline 22%) | Still absent — no escalation concern |
| Other | ~18 | ~47% | N/A | Broader geographic spread in full Feb 21–23 data |

Total visible users from GA4 API: ~38 (Feb 21–23 full-day processed)

Escalation rule: India share 0% vs US 13% — no escalation. Pakistan at 11% is new; monitor for bot/VPN patterns. Cyprus tied with US at top is unusual — may be VPN or ad geo spillover.

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
| Evaluate Reddit Ads pause decision | Growth | Feb 24 | DECIDED — continue running while investigating conversion barriers; 97% mobile waste accepted as platform limitation |
| Add 8 specialized agents to .claude/agents/ | Eng | Feb 23 | DONE — commit f6e35a7 |
| Update CLAUDE.md + AGENTS.md with agent routing | Eng | Feb 23 | DONE — commit f6e35a7 |
| Monitor post-fix checkout completion rate | Growth | Feb 24+ | OPEN |
| Test extension auth flow end-to-end in production | QA | Feb 24 | OPEN |
| Re-auth Google OAuth token (GA4 Data API) | Ops | Feb 24 | DONE — token refreshed, GA4 pulls working |
| Continue Google Ads despite zero funnel events from paid | Growth | Feb 24 | DECIDED — 150+ CWS installs suggest product interest; focus on conversion path optimization |
| Investigate conversion gap: 150+ CWS installs vs 0 paid conversions | Growth | Feb 25 | OPEN — need Clarity session replays + user feedback to diagnose |
| Evaluate mobile checkout email-link flow for mobile ad traffic | Growth | Feb 25 | OPEN — brainstorm: send desktop download link via email for mobile visitors |
| Google Ads MCP re-auth (separate OAuth from GA4, still expired) | Ops | Feb 25 | OPEN |

---

## 8) Narrative Summary

- **What improved this week:** First live trial conversion on Feb 22 (`adrielletherat@gmail.com` — Monthly Trial). Root cause of 18 checkouts / 0 conversions resolved (`payment_method_collection: 'if_required'`). Full payment system audit completed — 3 conversion blockers patched (infinite spinner for single-theme buyers, `trialing→active` DB sync gap, `session.customer` null cast). Abandoned checkout recovery pipeline confirmed live via 3 received recovery emails. Stripe Customer Portal shipped and live-tested end-to-end with real subscriber. `allow_promotion_codes: true` added to checkout. Google Ads and Reddit Ads pivoted to desktop-only targeting. Reddit campaign launched at $50/day for $500 credit promo. EIN/tax ID submitted to Stripe. Two deploys: revisions `00173-xb7` and `00176-5ts`.
- **What regressed this week:** Paid ad traffic generated no checkout-stage funnel events after Feb 21. Mobile volume remained high (37/44 sessions across Feb 21–24), while checkout-stage conversion signals stayed flat. GA4 still does not reflect the known server-side trial conversion (consent or timing gap).
- **Evening session (Feb 23):** Deep Clarity session replay analysis identified three UX friction points: (1) checkout double-login caused by `callbackUrl` losing scroll position + silent 401 on auto-resume, (2) login page giving no context about pending checkout, (3) extension auth race condition where fast API beat 2s ping timeout. All three fixed and deployed (commit `9537d36`, build `df4378ef`). Google Ads structured snippets applied (Styles: Aurora Borealis, Synth Wave, Midnight Dark). Reddit Ads investigation revealed 97% mobile spend waste ($112/$115) with no platform-level device exclusion available. 8 specialized agents added to `.claude/agents/` with routing rules in CLAUDE.md and AGENTS.md.
- **Feb 24 evening session (revalidated Feb 25):** GA4 full-day data now shows Feb 21 PASS (0% unassigned), Feb 22 PASS (0%), Feb 23 PASS (0%), and Feb 24 FAIL (50% on 2-session volume). Mobile remained dominant (37 of 44 sessions across Feb 21–24). Source/device split indicates mobile traffic is primarily Google-attributed (`google / cpc` mobile = 28 sessions) while Reddit attribution remains low (`reddit / paid_social` mobile = 1 session). Checkout-stage funnel events remain concentrated on Feb 21 only.
- **Biggest unknown:** Why 150+ CWS installs (with daily growth) have produced zero paid conversions. The gap between product installs and revenue is the key mystery — is it pricing, trial friction, extension-to-web disconnect, or something else?
- **Next week action:** Investigate conversion gap via Clarity session replays and user feedback. Monitor checkout completion rate post-UX-fix. Evaluate mobile email-link flow feasibility. Re-auth Google Ads MCP for automated spend tracking. Pull Google Ads spend manually for guardrail verification. Test extension auth flow end-to-end in production.
