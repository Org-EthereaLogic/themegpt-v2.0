# Measurement Gate Tracking Log

**Period:** Feb 20–27, 2026 (includes Feb 20 NO DATA incident + 7-day gate window Feb 21–27)
**Updated:** Daily, by checking GA4
**Blocker:** No hard launch blocker. Gate 1 and Gate 3 are tracked as diagnostics while paid acquisition begins.
**Latest deployment snapshot:** Feb 24, 2026 — commit `f4458c7` deployed via trigger `deploy-themegpt-on-push` (build `5b73bea4-3a48-4593-870d-2962a2f9bfc8`, status `SUCCESS`), serving on Cloud Run revision `themegpt-web-00209-xjk` (100% traffic).

---

## Gate Definitions

### Gate 1 — Unassigned Traffic Reduction

- **Measures:** Percentage of GA4 sessions with no UTM attribution and no referrer (Session source/medium = `(not set)`)
- **Pass criterion:** ≤10% unassigned sessions for 7 consecutive calendar days
- **Status as of Feb 20:** TRACKING — GA4 was not collecting web app data until mid-day Feb 20 (Firebase env vars missing from Cloud Run build; redeployed with fix). True data collection starts Feb 20 evening. Pre-filter baseline of 25% (Feb 19) was from wrong property (CWS listing) and is invalid.
- **Filter activation status:** COMPLETE — applied, realtime-verified, and activated per `docs/ga4-filter-guide.md`
- **Correct GA4 property:** `516189580` (gen-lang-client-0312336987), measurement ID `G-41BZB7X7H7`
- **How to measure:**
  1. GA4 → Reports → Acquisition → Traffic Acquisition
  2. Set date range to the single day being logged
  3. Find the row where "Session default channel group" = `Unassigned` (or filter by Session medium = `(not set)`)
  4. Divide that session count by total sessions; record as a percentage

### Gate 3 — GA4 Funnel Event Visibility

- **Measures:** Whether three conversion events are visible with nonzero counts in GA4
- **Events required:** `trial_start`, `checkout_start`, `purchase_success`
- **Pass criterion:** All three events visible in GA4 for 7 consecutive calendar days
- **Observation window started:** Feb 21, 2026 (first full day after mid-day Feb 20 redeploy; instrumentation was deployed in v2.2.1 web release)
- **Status as of Feb 20:** TRACKING — GA4 confirmed receiving data post-redeploy (Realtime: 1 active user, 25 events). True Day 1 is effectively Feb 21 (first full day of collection). Earliest pass date slides to Feb 27.
- **Correct GA4 property:** `516189580` (gen-lang-client-0312336987), measurement ID `G-41BZB7X7H7`
- **How to measure:**
  1. GA4 → Reports → Engagement → Events
  2. Set date range to the single day being logged
  3. Scan the event name list for each of the three events
  4. Mark Y if the event appears with count > 0; mark N if absent

---

## Gate 1 Daily Log

| Date | Unassigned % | Filter Active? | Status | Notes |
|------|-------------|----------------|--------|-------|
| 2026-02-20 | 0% | Y | TRACKING | 2 total Direct sessions. No unassigned traffic. (Data API lagging, true Day 1 still Feb 21). |
| 2026-02-21 | 0% | Y | PASS | 4 total sessions (Direct 3, Referral 1). No unassigned traffic after full-day reprocessing. |
| 2026-02-22 | 0% | Y | PASS | **First PASS day.** GA4 full-day: 17 total sessions (Paid Search 11, Cross-network 3, Direct 2, Paid Social 1, Unassigned 0). Zero unassigned traffic — all sessions attributed. Note: earlier midday snapshot showed 32% from 25 sessions; full-day reprocessing corrected the count. |
| 2026-02-23 | 0% | Y | PASS | GA4 full-day: 21 total sessions (Paid Search 19, Cross-network 1, Direct 1). No unassigned traffic after reprocessing. |
| 2026-02-24 | 50% | Y | FAIL | 2 total sessions (Direct 1, Unassigned 1). Very low volume day; treat as directional only. |
| 2026-02-25 | | | | |
| 2026-02-26 | | | | |
| 2026-02-27 | | | | |

**Status values:** `PASS` (≤10%), `FAIL` (>10%), `TRACKING` (window in progress)

---

## Gate 3 Daily Log

| Date | `trial_start` | `checkout_start` | `purchase_success` | All 3 visible? | Notes |
|------|--------------|-----------------|-------------------|----------------|-------|
| 2026-02-20 | N | N | N | N | GA4 SDK was not loading pre-redeploy. Post-fix: GA4 confirmed working via Realtime. No conversion activity today (expected — funnel events require real user purchases). |
| 2026-02-21 | N | Y (×5) | N | N | GA4 Data API full-day: checkout_start ×5 and pricing_view ×3 (all from Feb 21). trial_start and purchase_success absent. |
| 2026-02-22 | N | N | N | N | No checkout_start/trial_start/purchase_success visible on Feb 22 despite paid traffic volume. |
| 2026-02-23 | N | N | N | N | No checkout_start/trial_start/purchase_success visible on Feb 23. |
| 2026-02-24 | N | N | N | N | No checkout_start/trial_start/purchase_success visible on Feb 24. mobile_landing ×4 and mobile_email_capture ×1 were recorded this day. |
| 2026-02-25 | | | | | |
| 2026-02-26 | | | | | |
| 2026-02-27 | | | | | |

**Event column values:** `Y` (visible, count > 0), `N` (absent), `—` (no conversion activity that day, but instrumentation confirmed working), `TBD` (pending GA4 daily check)

---

## Diagnostic Summary

```
Gate 1 result:  [ ] PASS  [ ] FAIL
  First passing day: ___________
  Last passing day:  ___________

Gate 3 result:  [ ] PASS  [ ] FAIL
  First passing day: ___________
  Last passing day:  ___________

Product Hunt launch unlocked:
  [ ] YES — launch decision no longer gate-bound
  [ ] NO  — optional tracking-only status
```

---

## Countdown Note

GA4 was not collecting web app data until the mid-day Feb 20 redeploy (Firebase env vars were missing from the Cloud Run build). True Day 1 of meaningful data collection is **Feb 21, 2026**. Continue logging Gate 1 and Gate 3 daily as quality diagnostics while optimization is driven by server-side monetization metrics.

Gate 1 and Gate 3 remain independent diagnostic indicators. They inform quality, but no longer block acquisition starts.

---

## v2.3.1 Extension Submission — Feb 23, 2026

- **v2.3.1 Chrome Web Store**: Submitted for review Feb 23, 2026. Status: **Pending review**. Draft v2.3.1 uploaded; Published still at v2.3.0.
- **v2.3.1 Edge Add-ons**: Submitted for review Feb 23, 2026. Status: **Pending review** (separate submission from the earlier manual upload of v2.3.1 on Feb 22).
- **CI/CD pipeline fixed**: Two blocking issues resolved before submission landed:
  1. `pnpm-lock.yaml` had duplicate `@types/node@25.3.0` entries (Dependabot merge artifact) — regenerated to fix `ERR_PNPM_BROKEN_LOCKFILE`.
  2. Dependabot bumped extension's `tailwindcss` from v3 to v4 — pinned back to `^3.4.19` since extension PostCSS/Tailwind config is v3-format.
- **Automated submission**: `submit-extension.yml` now triggers automatically on `v*.*.*` tags in addition to `workflow_dispatch`. Future releases: bump version → `git tag vX.X.X && git push origin vX.X.X`.

---

## v2.3.0 CWS Approval & Listing Update — Feb 22, 2026

- **v2.3.1 (web) deployed**: Feb 22, 2026 — critical checkout fix. `payment_method_collection: 'if_required'` for trial subscriptions. Root cause of 18 checkouts / 0 conversions resolved. Canary purchase confirmed: `adrielletherat@gmail.com` → Trial | Monthly Plan | Full Access. **First live trial conversion verified.**
- **v2.3.0 CWS review**: APPROVED (submitted Feb 20, approved Feb 22, 2026)
- **CWS listing update**: **Submitted for review** Feb 22, 2026. Includes promo video (YouTube), refreshed screenshots (5 total: 3 dark + Frosted Windowpane light + ThemeGPT Light). Metadata-only review — no extension binary change.
- **Landing page**: Hero video deployed in commit `3d868e9` — autoplay `demo-30s.mp4` inside macOS browser mockup, desktop-only.

---

## Mobile Onboarding Theme Preview Refresh — Feb 24, 2026

- **Scope:** Improve mobile expectation-setting by replacing abstract swatch cards with real theme screenshots and direct gallery links.
- **Shipped behavior (`/mobile`):**
  - Screenshot cards now show a mixed set of free + premium themes:
    - ThemeGPT Light
    - Frosted Windowpane
    - Electric Dreams
    - Woodland Retreat
  - Section heading and each card deep-link to `/?skip_mobile=1#themes`.
- **Deploy evidence:** commit `2ce4adb` auto-triggered Cloud Build build `f08d5ef3-51ab-42fb-9cee-d52d154677e1` (SUCCESS) and rolled out Cloud Run revision `themegpt-web-00202-kkv` at 100% traffic.

---

## Deployment Integrity — Feb 23, 2026 (commit 540f9e7)

**Scope:** Payment funnel hardening and edge-case bug fixes (commit `540f9e7`).

### Audit Results & Fixes Applied

- **Abandoned checkout recovery emails:** System working as intended. 3 legitimate recovery triggers successfully caught from test account sessions that expired without completing payment.

### Bugs Patched

| Area | Issue & Fix | Severity |
|---|---|---|
| `success/page.tsx` | **Issue:** Single-theme buyers hit an infinite spinner after 20s if webhook is slow.<br>**Fix:** Added fallback branch to show a support message and clear loading state. | HIGH |
| `webhooks/stripe/route.ts` | **Issue:** `trialing` → `active` transition never written to DB when a user adds a payment method.<br>**Fix:** Broadened `handleSubscriptionUpdated` to catch any `active` transition. | HIGH |
| `webhooks/stripe/route.ts` | **Issue:** `session.customer` cast without null guard could write `"null"` as `stripeCustomerId` in Firestore, breaking portal access.<br>**Fix:** Added `typeof session.customer === 'string'` guard. | MEDIUM |

### Confirmed Clean Flows

The following items were audited and confirmed cleanly working:

- Trial subscription success page polling ✅
- Pending checkout resume after auth redirect ✅
- 409 duplicate subscription guard for trialing users ✅
- `allow_promotion_codes: true` — no conflicts ✅
- `hasFullAccess` logic for trialing/active/grace period ✅
- Trial cancellation on no payment method (handled via `subscription.deleted`) ✅

### Build & Revision

Deploy **`9923844c`** is building to deploy these changes.

---

## Deployment Integrity — Feb 23, 2026 (commit b48a056)

**Scope:** Stripe integration hardening — Customer Portal, payment failure handling, checkout improvements.

### Analytics Findings (Feb 22 Audit)

- **Sessions:** 21 (Clarity) / 17 (GA4). Campaigns confirmed live: Google Ads "Website traffic-Search-1" + Reddit "reddit_launch_v1"
- **Critical finding:** 0 `checkout_start` events from 17 paid ad sessions (100% bounce, avg 2.4s). Feb 21 organic (4 sessions) generated 5 `checkout_start` + 3 `pricing_view` — organic intent > paid click quality
- **Diagnosis:** Ad creative/landing page message mismatch. Paid traffic not reaching pricing section. Mobile = 57% of paid sessions
- **Stripe referrals (Clarity):** 3 sessions returned from `checkout.stripe.com` — likely internal testing carry-over from prior day

### Changes Deployed

| Area | Change |
|---|---|
| `app/api/portal/route.ts` | **New** — Stripe Billing Portal session endpoint (authenticated POST, returns `billing.stripe.com` URL) |
| `app/account/page.tsx` | "Manage Subscription" button — visible for non-lifetime subscribers, triggers portal redirect |
| `app/api/webhooks/stripe/route.ts` | `invoice.payment_failed` handler: sets `past_due` status + sends payment failure email |
| `app/api/webhooks/stripe/route.ts` | `handleSubscriptionUpdated` now syncs `past_due` ↔ `active` transitions (was only `cancel_at_period_end`) |
| `app/api/checkout/route.ts` | `allow_promotion_codes: true` — promo code field now visible at checkout |
| `lib/email.ts` | `sendPaymentFailedEmail` — branded dunning email prompting card update |

### Stripe Customer Portal — Live Configuration

Configured at `dashboard.stripe.com/settings/billing/portal` (live mode):

- Payment methods: enabled | Cancellations: end-of-period, collect reason | Invoice history: enabled
- Redirect URL: `https://themegpt.ai/account` | Terms + Privacy: set via Public Business Information
- EIN/tax ID verification submitted — Stripe review in progress (2–3 days)

### Build & Revision

| Build ID | Status | Commit |
|---|---|---|
| `e5892d01-8a5a-4c58-807c-8071850ffb63` | **SUCCESS** | `b48a056` |

Active Cloud Run revision: **`themegpt-web-00173-xb7`** (100% traffic).

### Verification

- TypeScript: clean (`tsc --noEmit`)
- Live test: `asap@beatsbyasap.com` (Expired/Yearly) → "Manage Subscription" button visible → `billing.stripe.com/p/session/live_...` — **portal confirmed working end-to-end in production**

---

## Deployment Integrity — Feb 23, 2026 (commit 6aab968)

**Scope:** Subscription state correctness patch + trial funnel conversion improvements (commit `6aab968`).

### Changes Deployed

| Area | Fix |
|---|---|
| `db.ts` | Priority-based subscription selection (active > trialing > canceled-in-grace > expired); `upsertSubscriptionByStripeId` prevents duplicate records on webhook retries |
| `webhooks/stripe/route.ts` | `trialEndsAt` now persisted for monthly trials (was yearly-only); status normalization; upsert replaces insert |
| `checkout/route.ts` | 409 guard blocks duplicate checkouts for active/trialing users |
| `webhooks/stripe/route.ts` | Abandoned checkout recovery unblocked — `reminderEligible` no longer requires `promotions=opt_in`; 11/15 historical abandoned checkouts now eligible |
| `extension/auth/route.ts` | Stripe-link flow uses upsert + full status normalization |
| `Hero`, `Navigation`, `FeaturesSection` | Primary CTAs route to `#pricing` trial entry (was CWS install page) |
| `popup.tsx` | Locked-theme click opens trial/pricing on first interaction (was second) |

### Build & Revision

| Build ID | Status | Commit |
|---|---|---|
| `43f0a24e-975d-4c14-9266-b2d0b8648520` | **SUCCESS** | `6aab968` |

Active Cloud Run revision: **`themegpt-web-00170-rbc`** (100% traffic). Service traffic updated to `LATEST` — future deploys go live automatically.

### Test Results (pre-deploy)

- Web: **36/36 passed**
- Extension: **94/94 passed**
- TypeScript: clean (`tsc --noEmit`)

---

## Deployment Integrity — Feb 22, 2026

**Audit scope:** Verify commit `3d868e9` was built and deployed successfully, and confirm all Cloud Build trigger substitution variables are present.

### Commit 3d868e9 Build Status

| Build ID | Status | Started | Finished |
|---|---|---|---|
| `b9263dcf-20f8-463a-9eb6-b7e75ca4f04f` | **SUCCESS** | 2026-02-22T16:50:53Z | 2026-02-22T16:55:19Z |

Active Cloud Run revision: **`themegpt-web-00152-7jn`** (100% traffic), created 2026-02-22T16:55:03Z — timestamp aligns with build completion. Deployment confirmed.

### Trigger Substitution Variables (trigger `a34788f2`)

All 8 build-time `NEXT_PUBLIC_*` vars confirmed present and non-empty:

| Variable | Status |
|---|---|
| `_FIREBASE_API_KEY` | ✓ Present |
| `_FIREBASE_AUTH_DOMAIN` | ✓ Present |
| `_FIREBASE_PROJECT_ID` | ✓ Present |
| `_FIREBASE_STORAGE_BUCKET` | ✓ Present |
| `_FIREBASE_MESSAGING_SENDER_ID` | ✓ Present |
| `_FIREBASE_APP_ID` | ✓ Present |
| `_FIREBASE_MEASUREMENT_ID` | ✓ Present |
| `_STRIPE_PUBLISHABLE_KEY` | ✓ Present |

Also present (bonus): `_STRIPE_SUBSCRIPTION_PRICE_ID`, `_STRIPE_YEARLY_PRICE_ID`, `_STRIPE_SINGLE_THEME_PRICE_ID`.

**Mechanism clarification:** These are Cloud Build *substitution variables*, NOT Secret Manager secrets. They are passed as `--build-arg` at Docker build time and baked into the Next.js bundle. Runtime-only secrets (`NEXTAUTH_SECRET`, `STRIPE_SECRET_KEY`, etc.) are set directly on the Cloud Run service and are not managed via `cloudbuild.yaml`.

---

## Campaign Optimization Integrity — Feb 23, 2026

**Scope:** Desktop-only targeting enforcement and Reddit promo activation to address the 100% bounce rate for paid mobile traffic.

### Actions Taken

- **Google Ads:** Applied -100% bid adjustment to Mobile phones and Tablets for the "Website traffic-Search-1" campaign. Paid search traffic is now forced to 100% desktop.
- **Reddit Ads:**
  - Activated "Traffic Campaign 2026-02-21 13:48:14 PST"
  - Fixed ad-to-page message mismatch with a new headline: *"Tired of ChatGPT's boring look? Get premium themes, dark modes, and token tracking with one click."*
  - Explicitly set device targeting to Desktop only (iOS and Android unchecked).
  - Set Daily Budget to **$50.00** to qualify for the Reddit $500 ad credit promotion. Status: Active.

---

## Deployment Integrity — Feb 23, 2026 (commit 540f9e7)

**Scope:** Payment system audit — three conversion blockers patched.

### Audit Trigger

Full payment system audit initiated after receiving 3 abandoned checkout recovery emails at test accounts confirming `sendCheckoutRecoveryEmail` is firing live in production (monthly ×2, yearly ×1 from `hello@notification.themegpt.ai`). Audit revealed three confirmed bugs.

### Bugs Found and Fixed

| ID | Severity | File | Issue |
|----|----------|------|-------|
| HIGH-1 | HIGH | `app/success/page.tsx` | Infinite spinner for single-theme buyers when polling exhausts `maxAttempts` with `pending: true` — missing `else` branch left loading state permanently set |
| HIGH-2 | HIGH | `app/api/webhooks/stripe/route.ts` | `trialing → active` transition never synced to DB when trial user adds payment method — downstream cancellation handling silently broken for converted trial subscribers |
| MEDIUM-1 | MEDIUM | `app/api/webhooks/stripe/route.ts` | `session.customer as string` cast without null guard could write string `"null"` as `stripeCustomerId`, permanently breaking portal access |

### Confirmed Clean (no action needed)

- Trial success page polling handles `no_payment_required` correctly ✅
- Pending checkout resume after auth redirect — no race condition ✅
- 409 duplicate subscription guard for trialing/active users ✅
- `allow_promotion_codes: true` — no conflicts ✅
- `hasFullAccess` logic for all subscription states ✅

### Build & Revision

| Build ID | Status | Commit |
|---|---|---|
| `9923844c-fb9b-46e1-af17-081629aec749` | **SUCCESS** | `540f9e7` |

Active Cloud Run revision: **`themegpt-web-00176-5ts`** (100% traffic). Two deploys on Feb 23: `00173-xb7` (commit `b48a056`) → `00176-5ts` (commit `540f9e7`).

---

## Deployment Integrity — Feb 23, 2026 (commit 9537d36)

**Scope:** Checkout UX friction fixes and extension auth race condition resolution.

### Audit Trigger

Clarity session replay analysis revealed:
1. A user clicked "Start Free Month" → login → "Buy Theme" → login AGAIN → ended on `/support` asking "How do I unlock premium themes?" (double-login bug)
2. A user hit `/auth/extension` for 3 seconds with 0 clicks (extension auth race condition)
3. 4 out of 5 Stripe checkout sessions abandoned (`?canceled=true`)

### Root Cause Analysis

| Issue | Root Cause | Fix |
|---|---|---|
| Double login redirect | `callbackUrl` was `window.location.href` (just `/`), losing scroll position. If server-side `getServerSession` failed on the auto-resume POST to `/api/checkout` (cookie timing), user saw "Checkout failed: Authentication required" with no retry action. Clicking CTA again triggered `signIn()` a second time. | Changed `callbackUrl` to include `#pricing` anchor. User returns to pricing section after login. |
| Login page confusion | No context on `/login` about pending checkout. User didn't know their trial would resume after auth. | Added `isCheckoutFlow` detection: shows "One more step!" heading and "Your selection will be waiting for you." copy when arriving from checkout. |
| Extension auth 3s bounce | `generateToken` captured `extensionDetected` in its `useCallback` closure. If `/api/extension/auth` responded before the 2s `pingExtension` timeout, `extensionDetected` was still `null`, so `sendTokenToExtension` was never called. User landed on confusing manual copy screen. | Decoupled token generation from extension send. New `useEffect` watches both `token` and `extensionDetected` independently — auto-sends once both are ready, regardless of timing. |

### Changes Deployed

| File | Change |
|---|---|
| `apps/web/app/page.tsx` | `callbackUrl` now uses `window.location.origin + pathname + "#pricing"` instead of `window.location.href` |
| `apps/web/app/login/page.tsx` | Added `isCheckoutFlow` detection with contextual heading/copy |
| `apps/web/app/auth/extension/page.tsx` | Decoupled `generateToken` from `extensionDetected`. New `useEffect` for auto-send. |

### Build & Revision

| Build ID | Status | Commit |
|---|---|---|
| `df4378ef-83c8-44cc-ac90-6a434c6d68dc` | **SUCCESS** | `9537d36` |

Build time: 5m 03s. Deployed to Cloud Run production (`themegpt-web`).

---

## Agent Infrastructure — Feb 23, 2026 (commit f6e35a7)

**Scope:** Added 8 specialized agents to `.claude/agents/` and updated CLAUDE.md + AGENTS.md with routing and activation rules.

### Agents Added

**Tier 1 (address current gaps):**
- `payment-integration` (sonnet) — Stripe checkout, subscriptions, webhooks, trial flows
- `frontend-security-coder` (opus) — XSS, CSP, OAuth redirects, JWT security
- `seo-keyword-strategist` (haiku) — Keyword analysis for ChatGPT customization niche
- `nextjs-developer` (sonnet) — Next.js 16, App Router, performance, Cloud Run deploy

**Tier 2 (growth enablers):**
- `seo-content-writer` (sonnet) — Landing pages, blog posts, CWS listing copy
- `deployment-engineer` (sonnet) — Cloud Build, Docker, CWS/Edge store submissions
- `security-auditor` (opus) — OAuth audit, JWT review, OWASP compliance
- `content-marketer` (sonnet) — Google Ads copy, Reddit strategy, CWS optimization

### Documentation Updates
- CLAUDE.md: Added Specialized Agents section with 15-agent roster by category
- AGENTS.md: Added agent routing table, proactive activation rules, cost-aware model selection, coordination examples

No Cloud Build deployment — docs-only change.

---

## Evening Analytics Snapshot — Feb 23, 2026

**Scope:** Cross-platform analytics review (Google Ads, Clarity, Reddit Ads).

### Google Ads (Feb 21–22)
- 83 clicks, 1,255 impressions, **6.61% CTR**, $1.45 avg CPC, $120 total spend
- Top keyword: "custom chatgpt" ($76, 53 clicks, 7.55% CTR)
- Sleeper keyword: "customizing chatgpt" (22.22% CTR on $5.68 spend)
- Device: Mobile -100% bid adj already in place, but $108 still leaked to mobile (smart bidding override during learning phase)
- Structured snippets applied: Styles — Aurora Borealis, Synth Wave, Midnight Dark (+2.7% est. CTR lift)

### Clarity (Last 3 Days)
- 50 sessions, 40 unique users, 1.68 pages/session, 1.1 min active time
- 98% new users, 2% returning
- Quick backs: 10% (5 sessions) — worth monitoring
- Performance: LCP 3.8s (needs improvement), INP 460ms (needs improvement), CLS 0 (good)
- Funnel: Marketing→Purchase — 16 sessions entered, 0% conversion

### Reddit Ads (Feb 17–23)
- $115.31 spend, 37,569 impressions, 126 clicks, $0.92 CPC, 0.335% CTR
- **Critical finding:** 97% of clicks (122/126) went to mobile (iOS: 88, Android: 34, macOS: 1, Windows: 3)
- Reddit Ads has no device exclusion feature — platform limitation
- Only 2 Reddit sessions detected in Clarity (matching ~4 desktop clicks)

### CWS Growth
- Users grew from 8 to **22** (+175%) over a few days

### Checkout Funnel (Clarity Session Recordings)
- 5 users reached Stripe checkout in last 7 days
- 4 returned with `?canceled=true` (abandoned)
- 1 returned without cancel param but Stripe confirms 0 new subscribers
- 1 user attempted extension auth flow (3s, 0 clicks — race condition)
- Session #2 notable: user clicked login twice, ended on support page — fixed in commit 9537d36

---

*Track daily. Record numbers each morning for the prior day. Update the summary block when a gate resolves.*
