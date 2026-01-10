# ThemeGPT Web App

Marketing website and API backend for ThemeGPT - the Chrome extension for customizing ChatGPT's appearance.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Styling:** Tailwind CSS 4
- **Authentication:** NextAuth.js (Google, GitHub OAuth)
- **Database:** Firebase Firestore
- **Payments:** Stripe (subscriptions + one-time purchases)
- **Email:** Resend
- **Deployment:** Google Cloud Run

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9+
- Firebase project with Firestore enabled
- Stripe account with products configured
- Resend account for transactional emails

### Environment Setup

Copy the example environment file and fill in your values:

```bash
cp .env.example .env.local
```

See `.env.example` for all required environment variables.

### Development

```bash
# From monorepo root
pnpm dev:web

# Or from this directory
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

## Project Structure

```
apps/web/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   │   ├── checkout/      # Stripe checkout
│   │   ├── extension/     # Extension API endpoints
│   │   ├── webhooks/      # Stripe webhooks
│   │   └── ...
│   ├── account/           # User account page
│   ├── auth/              # Auth pages
│   └── ...
├── components/            # React components
│   ├── sections/          # Page sections (Hero, Features, etc.)
│   └── ui/                # UI components (ThemeCard, etc.)
├── lib/                   # Utilities
│   ├── auth.ts           # NextAuth configuration
│   ├── db.ts             # Firestore operations
│   ├── stripe.ts         # Stripe configuration
│   └── email.ts          # Email templates
└── public/               # Static assets
    └── themes/           # Theme preview images
```

## API Endpoints

### Extension API
- `GET /api/extension/status` - Check subscription status
- `POST /api/extension/auth` - Authenticate extension
- `POST /api/extension/download` - Download premium theme

### Payment API
- `POST /api/checkout` - Create Stripe checkout session
- `POST /api/webhooks/stripe` - Handle Stripe webhooks

### User API
- `GET /api/subscription` - Get subscription details
- `POST /api/verify` - Verify license key

## Deployment

### Build

```bash
pnpm build
```

### Docker

```bash
docker build -t themegpt-web .
docker run -p 3000:3000 themegpt-web
```

### Cloud Run

Deployed automatically via Cloud Build on push to main. See `cloudbuild.yaml` in the repository root.

## Scripts

```bash
# Test email templates
pnpm tsx scripts/test-email.ts all your@email.com

# Manage Resend domain
pnpm tsx scripts/resend-domain.ts status

# Verify Cloud Run deployment
pnpm tsx scripts/verify-cloud-run.ts https://themegpt.app
```
