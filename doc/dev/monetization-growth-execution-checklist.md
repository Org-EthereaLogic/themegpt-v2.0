# Monetization & Growth Execution Checklist

**Date:** 2026-02-21  
**Mode:** Advertising live with guardrails  
**Source strategy:** `ThemeGPT-Monetization-Strategy.docx`

---

## 1) Completed Engineering Actions

- [x] Fixed Stripe checkout regression by removing `consent_collection.promotions`.
- [x] Added GA4 `pricing_view` event on pricing section visibility.
- [x] Added GA4 `theme_preview` event on single-theme selector interaction.
- [x] Added GA4 `checkout_abandon` event on Stripe cancel return.
- [x] Captured first-touch attribution (`utm_*`, `gclid`, `fbclid`, `ttclid`) client-side.
- [x] Forwarded attribution into Stripe checkout metadata.
- [x] Persisted checkout + revenue events server-side for source-of-truth reporting.
- [x] Added internal endpoint: `GET /api/metrics/monetization?days=7`.
- [x] Added checkout API regression tests for payment session creation.
- [x] Fixed Cloud Build trigger: added all 7 Firebase `NEXT_PUBLIC_*` vars and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` as substitution variables (were missing since Jan 13 trigger creation — GA4/Firebase was silently broken in all prior production builds).
- [x] Added Sign In nav link to navigation bar (`/login`). Verified live.
- [x] Verified checkout flow end-to-end on production: pricing → `POST /api/checkout` → live Stripe session created → `checkout.stripe.com` redirect confirmed (Feb 22, 2026).

---

## 2) Manual Console Tasks (Owner Action Required)

- [x] Link Clarity project `vky4a128au` to GA4 property `516189580` in Clarity settings.
- [x] Opt in to CWS GA4 in Chrome Web Store Developer Dashboard.
- [x] Mark CWS `install` event as key event in the CWS GA4 property.
- [x] Create Clarity funnel 1: `Marketing → Purchase` (Landing → Purchase Success).
- [x] Create Clarity funnel 2: `Extension → Purchase` (Extension Auth → Account → Purchase Success).
- [x] Add Clarity IP block for `50.53.12.179` (EthereaLogic Dev) in Clarity project settings (Feb 22, 2026).
- [x] Add GA4 internal traffic rule `EthereaLogic Dev` (`50.53.12.179`) on property `516189580` / stream `G-41BZB7X7H7` (Feb 22, 2026).
- [x] Activate GA4 `Internal Traffic` data filter on property `516189580` — previously in Testing state (Feb 22, 2026).

---

## 3) Channel Launch Tasks (This Week)

- [x] Launch Google Search campaign with distinct UTM campaign name (`search_launch_v1`, $25/day, published Feb 21).
- [x] Launch Reddit paid campaign with distinct UTM campaign name (`reddit_launch_v1`, $50/day — approved exception for $500 ad credit, published Feb 21).
- [ ] Publish week-1 social posts using `doc/dev/launch-asset-pack.md`.
- [ ] Ensure every outbound campaign URL uses unique `utm_source`, `utm_medium`, `utm_campaign`.

---

## 3a) Launch Verification Notes (Feb 21, 2026)

- Google Ads evidence: campaign `Website traffic-Search-1` shown as **Enabled** with `$0.00` spend in console screenshot captured Feb 21, 2026.
- Reddit Ads evidence: campaign `Traffic Campaign` shown as **Active** with `$0.00` spend in console screenshot captured Feb 21, 2026.
- Evidence scope: campaign live status currently rests on manual console snapshots; ad-platform API/CSV exports are not yet committed in this repository.
- Deployment correction: commit `dff49c0` push (Feb 21, 2026) auto-triggered Cloud Build and Cloud Run deployment via trigger `deploy-themegpt-on-push` (build `c4216605-4ff6-4c1c-a7c6-547c2e87a69e`, status `SUCCESS`). No manual deploy command was required.
- Infra cleanup: duplicate failing Cloud Build trigger `themegpt-web-deploy` (`352d347d-7674-4e07-8d9a-03544d9f0698`) removed on Feb 21, 2026. Remaining main-branch deploy trigger: `deploy-themegpt-on-push`.

---

## 3b) CWS Listing Enhancement (Blocked on v2.3.0 Approval)

- [ ] Upload `asset/launch/demo-30s-source.mp4` to YouTube (title: "ThemeGPT — Custom Themes for ChatGPT").
- [ ] Add YouTube URL to CWS Store Listing → "Global promo video" field.
- [ ] Review and refresh CWS screenshots with before/after GIFs from `asset/launch/`.
- [ ] Submit listing update for review.

---

## 4) Daily Ops Checklist

- [ ] Pull `GET /api/metrics/monetization?days=7` and log:
  - `checkoutCreated`, `checkoutCompleted`, `checkoutExpired`
  - `totalRevenueCents`, top channels by revenue
- [ ] Review GA4 diagnostics (`pricing_view`, `checkout_start`, `checkout_abandon`, `purchase_success`).
- [ ] Review 5-10 Clarity replays for largest funnel drop-off.
- [ ] Enforce guardrails:
  - Pause a channel at `>= $75` spend with zero checkout sessions.
  - Pause a channel if CAC `> $45` for 3 consecutive days.
  - Do not increase daily caps during first 7 days.
  - **Budget exception:** Reddit approved at `$50/day` (vs standard `$25/day`) to qualify for `$500` ad credit. Google Search remains at `$25/day`.

---

## 5) Decision Rule

Scale only channels with attributed server-side revenue.  
Treat GA4/Clarity as diagnostic context, not billing truth.
