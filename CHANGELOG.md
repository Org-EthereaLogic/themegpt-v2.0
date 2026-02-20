# Changelog

All notable changes to ThemeGPT will be documented in this file.

## [2.3.0] - 2026-02-19 (Awaiting CWS Submission — Blocked by v2.2.2 Review)

### Added (Extension)

- **`extension_version` UTM Attribution:** New `getExtensionVersion()` helper reads the manifest version at runtime and appends `&extension_version=X.Y.Z` to all 7 outbound links in `popup.tsx`, satisfying the Analytics Contract roadmap requirement for per-version tracking in GA4.
- **Abandoned Checkout Recovery (Web):** Stripe Checkout sessions now enable `after_expiration.recovery` and collect promotional consent via `consent_collection: { promotions: "auto" }`. The `checkout.session.expired` webhook event triggers `handleCheckoutExpired()`, which records the abandoned session to a new `abandoned_checkouts` Firestore collection and sends a recovery email when the customer opted in to promotions.
- **`sendCheckoutRecoveryEmail` (Web):** New transactional email sent to opted-in customers with a Stripe-hosted recovery URL; uses the brand's Cream & Chocolate design.

### Improved (Extension)

- **QA Test Coverage:** 6 new tests added to `popup.qa.test.tsx` covering trialing state ("Trial" header, "Trial Active" badge, days-remaining countdown), canceled state (reactivation copy + UTM-tagged account link), past-due state (billing failure copy + coral-styled link), escalating lifecycle nudge (3-click sequence), review ask banner (3rd apply trigger, CWS link, permanent dismiss), and footer UTM validation.

### Improved (Web)

- **Webhook Event Coverage:** Added `invoice.payment_succeeded` as an alias for `invoice.paid` to handle both Stripe event name variants. Added `checkout.session.expired` to the webhook listener and updated the setup script and documentation.
- **Firestore `abandoned_checkouts` collection:** New methods `upsertAbandonedCheckout`, `getAbandonedCheckoutBySessionId`, and `getUserById` in `lib/db.ts` for tracking abandoned checkout sessions, reminder eligibility, and send state.

### Tested

- Updated `popup.test.tsx` and `popup.qa.test.tsx` to match new URL shape with `extension_version=unknown` test-env fallback — 94/94 tests passing (was 88).
- Recovery email template verified via `test-email.ts recovery <email>` script.

---

## [2.2.2] - 2026-02-19 (CWS Submission — Pending Review)

### Fixed
- **Pricing CTA URL Order:** Corrected 3 `window.open()` calls in `apps/extension/src/popup.tsx` (lines 251, 254, 352) from `/#pricing?utm_source=...` to `/?utm_source=...#pricing` so GA4 receives UTM parameters before the SPA hash fragment discards them.
- **Firestore Composite Indexes:** Added missing composite indexes to `firestore.indexes.json` and deployed via Firebase CLI. Two indexes: `subscriptions` (`userId` ASC + `createdAt` DESC) and `downloads` (`userId` ASC + `downloadedAt` DESC). Fixes account page `FAILED_PRECONDITION: 9` error and extension premium theme unlock failure.

### Improved
- **Attribution Remediation:** Standardized UTM parameters across extension and web surfaces to resolve "Unassigned" traffic issues (Bridge Gate 1).
  - Extension links now carry `utm_source=extension`, `utm_medium=popup`, and specific campaigns (`auth_flow`, `trial_teaser`, `account_management`).
  - Web app Chrome Web Store links harmonized to `utm_source=cws&utm_medium=share&utm_campaign=item-share`.
- **Measurement Integrity:** Added `docs/ga4-filter-guide.md` to document internal traffic filtering for staging and development URLs.

### Tested
- Updated `popup.test.tsx` and `popup.qa.test.tsx` to match corrected URL shape — 88/88 tests passing.
- Canary purchase validated end-to-end: checkout, Stripe webhook, Firestore subscription record, success page rendering, and license key creation confirmed with external account.
- Firestore indexes confirmed built and operational: account page verified showing Trial + Monthly Plan + Full Access (confirmed Feb 19, 2026).
- Extension account linking confirmed automatic via shared auth session; Generate Link Code button serves as graceful fallback for edge cases (different browser profile, incognito, session issues) only.

## [2.2.1] - 2026-02-19

> **Web-only release.** The Chrome Web Store extension version remains at **2.2.0**. These changes affect the web app (`apps/web`) and build configuration only — no extension code was modified and no new CWS submission was made.

### Security

- Resolved Dependabot advisory: upgraded svelte transitive override from `^4.2.20` to `^5.53.0` (SSR XSS / tag validation; transitive dep of `@plasmohq/parcel-transformer-svelte` — no `.svelte` files in project, zero-risk upgrade)
- Resolved Dependabot advisory: added `minimatch` override at `^10.2.1` (resolves to `10.2.2`) to fix ReDoS vulnerability (High severity)

### Fixed

- Updated CWS install link UTM parameters from `utm_source=item-share-cb` to explicit campaign tags: `utm_source=cws&utm_medium=share&utm_campaign=item-share` for core marketing surfaces, `utm_source=web&utm_medium=referral&utm_campaign=extension_auth` for `auth/extension` links, and `utm_source=cws&utm_medium=post_purchase&utm_campaign=install_prompt` for `success` page install prompts
- Implemented GA4 funnel instrumentation in web flows: `checkout_start` (pre-checkout POST), `purchase_success` (confirmed session), and `trial_start` (gated on `subscriptionStatus === "trialing"`)

## [2.2.0] - 2026-02-18

### Added

- Escalating lifecycle nudges for premium theme clicks (3-step: soft teaser → stronger CTA + redirect → persistent interest copy + redirect)
- Non-incentivized Chrome Web Store review prompt after 3rd successful theme apply (one-time, permanently dismissible)
- Trial state display: "Trial" header label, "Trial Active" badge, days-remaining countdown
- Canceled subscription state with contextual reactivation message and account page link
- Past-due payment state with billing failure message and billing page link

### Improved

- Subscribe CTA changed from "Subscribe" to "Start free 30-day trial" (risk-free framing)
- Header button changed from "Connect" to "Sign In" (universal web convention)
- Account panel description updated to highlight "8 animated premium themes"
- Token counter footer simplified to "Estimated · No data leaves your browser"

## [2.1.0] - 2026-02-16

### Improved

- Enhanced reliability of premium theme access and subscription management
- Strengthened authentication flow for seamless login and theme downloading
- Improved extension stability across Chrome updates

### Security

- Applied latest security patches and dependency updates

## [2.0.2] - 2026-02-14

### Fixed

- Resolved critical connection issue between Chrome Extension and Web App
- Fixed authentication flow for seamless login
- Verified secure token exchange for premium theme downloads

## [2.0.1] - 2026-01-26

### Changed

- Submitted for Chrome Web Store review
- Updated store listing URLs to themegpt.ai domain
- Updated Privacy tab with proper "Single Purpose" description
- Added test instructions for reviewer access to premium features

### Fixed

- Version increment required for new submission (2.0.0 was already published)

## [2.0.0] - 2026-01-13

### Added

- Premium theme collection with animated effects
- Aurora Borealis, Synthwave, Woodland Retreat, and more premium themes
- Subscription system with Google/GitHub authentication
- Real-time token counting with local processing
- Support for chatgpt.com domain

### Changed

- Complete UI redesign with "Cream & Chocolate" brand identity
- Migrated to Plasmo framework
- Improved theme injection performance

### Security

- Privacy-first architecture: all data stays local
- No analytics or tracking
