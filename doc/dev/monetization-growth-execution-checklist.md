# Monetization & Growth Execution Checklist

**Date:** 2026-02-25
**Mode:** Advertising live with guardrails + free user base growth (target: 100 users before monetization push)
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
- [x] Replaced `/mobile` theme swatch previews with real screenshot cards that deep-link to `/?skip_mobile=1#themes`.
- [x] Rebalanced mobile theme preview sequence to alternate light/dark by row using a mixed free + premium set.
- [x] Verified deployment of mobile preview refresh: commit `2ce4adb` → Cloud Build `f08d5ef3-51ab-42fb-9cee-d52d154677e1` (`SUCCESS`) → Cloud Run revision `themegpt-web-00202-kkv` at 100% traffic.
- [x] Tightened install-first Hero + navigation messaging to reduce ad-to-page mismatch.
- [x] Refactored `/mobile` into email-first conversion flow with social proof and stronger primary CTA ("Email Me the Link").
- [x] Added delayed cookie-consent reveal (5s) to reduce immediate first-screen interruption on paid sessions.
- [x] Standardized funnel event naming in extension auth handoff: `trial_started` → `trial_start` (GA4 consistency).
- [x] Verified conversion UX deploy: commit `c9d2cb5` → Cloud Build `999bff5b-31d3-409d-9a69-cb975873d715` (`SUCCESS`) → Cloud Run revision `themegpt-web-00211-84v` at 100% traffic.
- [x] Traffic & conversion audit (Feb 25): Hero CTA changed from "See Themes" to "See Plans" (#pricing) to fix 31% avg scroll depth / 1 pricing_view in 4 days.
- [x] Added `display: "swap"` to DM Sans + Fraunces fonts; trimmed Fraunces to weights 600/700 to reduce LCP (was 13.4s p75).
- [x] Dynamic imports for ThemesSection + FeaturesSection to code-split below-fold framer-motion bundles and reduce INP (was 544ms).
- [x] Lowered PricingSection IntersectionObserver threshold from 0.45 → 0.15 to improve `pricing_view` event capture.
- [x] Verified audit deploy: commit `64f0d85` → Cloud Build `f8775498` (`SUCCESS`) → Cloud Run revision `themegpt-web-00215-dvw` at 100% traffic.
- [x] Added email magic-link sign-in via `/api/auth/magic-link` endpoint + email input on `/login` page.
- [x] Opened server-side auth gate so free users can sign in and access `/account` without a subscription.
- [x] Replaced `/account` dead-end ("You don't have an active subscription / Subscribe Now") with 3-step onboarding: install extension CTA, free theme list, soft premium upsell.
- [x] Updated `/login` sub-copy to welcome free users: "Sign in to get free themes and personalize your ChatGPT".
- [x] Added "Explore premium themes →" link to empty download history state on `/account`.
- [x] Verified onboarding deploys: commit `8214c55` → Cloud Build `6a2fc928` (`SUCCESS`) → revision `themegpt-web-00218-95f`; commit `a873048` → Cloud Build `34ae7481` (`SUCCESS`) → revision `themegpt-web-00219-95f` at 100% traffic.
- [x] **CRO: Moved PricingSection before FeaturesSection** — Clarity showed 37–52% median scroll depth; PricingSection was at ~76% (above most users' exit point). Swapped order so pricing sits at ~44% depth (Hero → ThemesSection → PricingSection → FeaturesSection). Features now reinforce post-decision. Verified: `#pricing` anchor intact, `pricing_view` GA4 event unaffected, all 3 pricing cards rendered. Commit `402b19e` → Cloud Build `ad520a63` (`SUCCESS`), Feb 27, 2026.

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

- [x] Launch Google Search campaign with distinct UTM campaign name (`search_launch_v1`, currently $80/day after optimization; launched Feb 21).
- [x] Launch Reddit paid campaign with distinct UTM campaign name (`reddit_launch_v1`, $50/day — approved exception for $500 ad credit, published Feb 21).
- [x] Publish week-1 social posts — Twitter/X (@ThemeGPT) + LinkedIn published Feb 22, 2026 with Aurora Borealis GIF and `launch_week_v1` UTM campaign.
- [ ] Ensure every outbound campaign URL uses unique `utm_source`, `utm_medium`, `utm_campaign`.
- [x] Apply structured snippets to Google Ads (Styles: Aurora Borealis, Synth Wave, Midnight Dark) — Feb 23, 2026.
- [x] Investigate Reddit Ads mobile waste — confirmed 97% of spend going to iOS/Android with no platform-level device exclusion. Decision pending on pause/continue.
- [x] Re-validate paid traffic composition via GA4 Data API (Feb 21-24): 44 sessions total, 84% mobile; `google / cpc` mobile = 28 sessions vs `reddit / paid_social` mobile = 1 session.
- [ ] Restore Google Ads API auth (developer token invalid as of Feb 24-25) so spend/click/impression reporting can return to automated pulls instead of manual dashboard checks.
- [x] Fix checkout double-login friction (callbackUrl #pricing anchor + login page context messaging) — commit `9537d36`, deployed Feb 23.
- [x] Fix extension auth race condition (decoupled token generation from ping timeout) — commit `9537d36`, deployed Feb 23.
- [x] Ship mobile onboarding theme-mix refresh (ThemeGPT Light, Frosted Windowpane, Electric Dreams, Woodland Retreat) — commit `2ce4adb`, deployed Feb 24.
- [x] Google Ads: Reduced daily budget from $130 → $65/day (Feb 25). Zero conversions after $361 spend; halved burn until first conversion.
- [x] Google Ads: Added 15 negative keywords to block intent-mismatched queries (chatgpt login/free/download/app/sign up/account/api/plus, open ai, openai, chat gpt variants, desktop/mobile app) — Feb 25.
- [x] Google Ads: Removed disapproved "Install Chrome Extension" sitelink (flagged for "Free desktop software" policy) — Feb 25.
- [ ] Google Ads: Consider keyword-specific ad groups targeting "chatgpt themes", "chatgpt dark mode", "customize chatgpt" instead of broad match.

---

## 3a) Launch Verification Notes (Feb 21, 2026)

- Google Ads evidence: campaign `Website traffic-Search-1` shown as **Enabled** with `$0.00` spend in console screenshot captured Feb 21, 2026.
- Reddit Ads evidence: campaign `Traffic Campaign` shown as **Active** with `$0.00` spend in console screenshot captured Feb 21, 2026.
- Evidence scope: campaign live status currently rests on manual console snapshots; ad-platform API/CSV exports are not yet committed in this repository.
- Deployment correction: commit `dff49c0` push (Feb 21, 2026) auto-triggered Cloud Build and Cloud Run deployment via trigger `deploy-themegpt-on-push` (build `c4216605-4ff6-4c1c-a7c6-547c2e87a69e`, status `SUCCESS`). No manual deploy command was required.
- Infra cleanup: duplicate failing Cloud Build trigger `themegpt-web-deploy` (`352d347d-7674-4e07-8d9a-03544d9f0698`) removed on Feb 21, 2026. Remaining main-branch deploy trigger: `deploy-themegpt-on-push`.

---

## 3b) CWS Listing Enhancement (v2.3.0 APPROVED — unblocked Feb 22, 2026)

- [x] Upload `asset/launch/demo-30s-source.mp4` to YouTube (title: "ThemeGPT — Custom Themes for ChatGPT").
- [x] Add YouTube URL to CWS Store Listing → "Global promo video" field. (saved as draft Feb 22, 2026)
- [x] Updated landing page Hero with autoplay video demo (`apps/web/components/sections/Hero.tsx`, deployed commit `3d868e9`).
- [x] Refresh CWS screenshots: added Frosted Windowpane (light) + ThemeGPT Light; all 5 slots filled (Feb 22, 2026).
- [x] Submit listing draft for CWS review (Feb 22, 2026). Pending CWS metadata review.

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
  - **Current caps:** Google Search `$100/day` (raised from $65 on evening Feb 25 — $65 was uncompetitive in keyword auctions), Reddit `$50/day` (approved exception for $500 ad credit).
  - **Guardrail reset note (Feb 22, 2026):** Reddit campaign reached $75+ spend with 0 conversions but was NOT paused — the 0-conversion period was caused by a broken Stripe checkout (3DS authentication failure blocking all channels equally, not Reddit-specific). Checkout fixed in v2.3.1. Guardrail evaluation resets from Feb 22 with a functional payment system.
  - **Audit action (Feb 25, 2026):** Google Search budget halved ($130 → $65) after 310 clicks / $361 spend / 0 conversions. 15 negative keywords added. Disapproved sitelink removed. Mobile -100% bid adj still in effect (set Feb 23; Smart Bidding may override during learning phase).

---

## 5) Decision Rule

Scale only channels with attributed server-side revenue.  
Treat GA4/Clarity as diagnostic context, not billing truth.
