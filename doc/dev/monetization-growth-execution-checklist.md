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

---

## 2) Manual Console Tasks (Owner Action Required)

- [x] Link Clarity project `vky4a128au` to GA4 property `516189580` in Clarity settings.
- [x] Opt in to CWS GA4 in Chrome Web Store Developer Dashboard.
- [x] Mark CWS `install` event as key event in the CWS GA4 property.
- [x] Create Clarity funnel 1: `Marketing → Purchase` (Landing → Purchase Success).
- [x] Create Clarity funnel 2: `Extension → Purchase` (Extension Auth → Account → Purchase Success).

---

## 3) Channel Launch Tasks (This Week)

- [ ] Launch Google Search campaign with distinct UTM campaign name.
- [ ] Launch Reddit paid campaign with distinct UTM campaign name.
- [ ] Publish week-1 social posts using `doc/dev/launch-asset-pack.md`.
- [ ] Ensure every outbound campaign URL uses unique `utm_source`, `utm_medium`, `utm_campaign`.

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

---

## 5) Decision Rule

Scale only channels with attributed server-side revenue.  
Treat GA4/Clarity as diagnostic context, not billing truth.
