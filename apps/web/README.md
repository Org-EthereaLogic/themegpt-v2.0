# ThemeGPT Web App

Marketing website plus API backend for ThemeGPT, including authentication, checkout, subscriptions, install reminder email, and theme preview gallery.

## Current Status (As of February 27, 2026)

- Production deploy is automated from `main` via Cloud Build trigger `deploy-themegpt-on-push`.
- Latest deployed commit: `402b19e` (Cloud Build `ad520a63-e595-4df0-af0a-b6341e22d222`, status `SUCCESS`, deployed Feb 27, 2026).
- Mobile onboarding route (`/mobile`) is live with:
  - Desktop install reminder email capture (`/api/mobile-reminder`)
  - Mixed free + premium screenshot previews
  - Direct link to full theme gallery (`/?skip_mobile=1#themes`)
- Recent conversion UX changes:
  - **CRO (Feb 27):** `PricingSection` moved before `FeaturesSection` on homepage. Pricing now at ~44% scroll depth (was ~76%), within the 52% Clarity median scroll range. Features serve as post-decision reinforcement.
  - Hero and navigation copy tightened for install-first clarity
  - `/mobile` converted to email-first flow with social proof and stronger primary CTA
  - Cookie consent banner delayed by 5s to reduce first-impression interruption
- Web package version: `2.3.1` (`apps/web/package.json`).
- Post-change traffic (Clarity, Feb 24-26): desktop share 62% (up from 10% pre-changes), homepage scroll depth 52.3% (up from 28.8%), 17 total external users in Firestore (up from 4 on Feb 24). CWV regression under investigation (LCP 6s, INP 1.7s, CLS 12 — dynamic imports likely root cause).
- Campaign reporting note: Google Ads API auth is currently invalid (developer token); ad-spend and click validation is temporarily manual in platform dashboards.

## Tech Stack

- Framework: Next.js 16 (App Router)
- Styling: Tailwind CSS 4
- Authentication: NextAuth.js (Google + GitHub OAuth)
- Data: Firebase Firestore
- Billing: Stripe (subscriptions + one-time purchases)
- Email: Resend
- Analytics: Consent-gated GA4 + Microsoft Clarity
- Deployment: Google Cloud Build + Cloud Run

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9+
- Firebase project with Firestore enabled
- Stripe account with products configured
- Resend account for transactional emails

### Environment Setup

```bash
cp .env.example .env.local
```

Fill all required values in `.env.local`.

### Development

```bash
# From monorepo root
pnpm dev:web

# Or from this directory
pnpm dev
```

Open `http://localhost:3000`.

## Key Routes

- `/` — Marketing landing page
- `/#themes` — Theme gallery section
- `/mobile` — Mobile onboarding/desktop install reminder page
- `/auth/extension` — Extension auth handoff flow
- `/account` — Subscription and billing surface
- `/success` — Checkout completion state

## API Endpoints

### Extension API

- `GET /api/extension/status` — Subscription status for extension
- `POST /api/extension/auth` — Extension authentication
- `POST /api/extension/download` — Premium theme download

### Billing API

- `POST /api/checkout` — Create Stripe Checkout session
- `POST /api/webhooks/stripe` — Stripe webhook handler
- `POST /api/portal` — Stripe customer portal session
- `GET /api/metrics/monetization` — Internal server-side monetization summary

### User and Lifecycle API

- `GET /api/subscription` — Subscription details
- `POST /api/verify` — License key verification
- `POST /api/mobile-reminder` — Send desktop install reminder from mobile flow

## Testing and Quality

```bash
pnpm lint
pnpm test
pnpm build
```

## Deployment

### Automated Production Deploy

Push to `main` triggers Cloud Build using root `cloudbuild.yaml`.

Pipeline shape:

1. Validate required Firebase/Stripe build substitutions
2. Build and push image to Artifact Registry
3. Deploy to Cloud Run (`themegpt-web`)
4. Inject runtime Firebase private key from Secret Manager

### Build-Time Substitutions (Cloud Build trigger)

- `_FIREBASE_API_KEY`
- `_FIREBASE_AUTH_DOMAIN`
- `_FIREBASE_PROJECT_ID`
- `_FIREBASE_STORAGE_BUCKET`
- `_FIREBASE_MESSAGING_SENDER_ID`
- `_FIREBASE_APP_ID`
- `_FIREBASE_MEASUREMENT_ID`
- `_STRIPE_PUBLISHABLE_KEY`

### Runtime Secrets (Cloud Run)

- `FIREBASE_PRIVATE_KEY` (secret: `firebase-private-key`)
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXTAUTH_SECRET`
- OAuth and Resend secrets

## Scripts

```bash
# Test email templates
pnpm tsx scripts/test-email.ts all your@email.com

# Verify Stripe configuration
pnpm verify:stripe
pnpm verify:stripe:cloud-run

# Verify Cloud Run deployment
pnpm tsx scripts/verify-cloud-run.ts https://themegpt.ai
```

## Notes

- Extension privacy promise remains strict: no extension telemetry.
- Web analytics are consent-gated and used for funnel diagnostics.
- Server-side Stripe + Firestore records are the source of truth for monetization reporting.
