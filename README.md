<div align="center">
  <img src="asset/GIFs/animated-mascot-400.gif" alt="ThemeGPT Logo" width="200" />
  <h1>ThemeGPT</h1>
  <p><b>The privacy-first ChatGPT theme manager</b></p>
  <p>
    <img src="https://img.shields.io/badge/Privacy-Local--Only-green" alt="Privacy Focused" />
    <img src="https://img.shields.io/badge/License-MIT-blue" alt="License" />
  </p>
</div>
A Chrome extension that lets you customize ChatGPT's appearance and track token usage locally. Optional web account/billing flows run on themegpt.ai.

---

## Get ThemeGPT

**[Install from the Chrome Web Store](https://chromewebstore.google.com/detail/dlphknialdlpmcgoknkcmapmclgckhba?utm_source=cws&utm_medium=share&utm_campaign=item-share)**

> **Latest published extension: v2.3.0** — approved by the Chrome Web Store on February 22, 2026.
>
> **Current extension source version in this repo: v2.3.1** — submitted to CWS and Edge; review status is tracked in `doc/dev/gate-tracking-log.md`.
>
> **Latest production web deployment:** commit `402b19e` auto-deployed via Cloud Build trigger `deploy-themegpt-on-push` (build `ad520a63-e595-4df0-af0a-b6341e22d222`, status `SUCCESS`) on February 27, 2026. CRO change: PricingSection moved before FeaturesSection to sit within the 52% median scroll depth.
>
> See [CHANGELOG.md](./CHANGELOG.md) for release notes and [doc/dev/gate-tracking-log.md](./doc/dev/gate-tracking-log.md) for live submission/review status.

---

## Privacy Pledge

> **Your data stays with you. Always.**

- **Extension theme/token data stays on-device** — Rendering and token counting happen locally in your browser
- **No analytics in the extension** — The web app uses consent-gated GA4 for funnel analytics
- **Token counting is 100% local** — Uses bundled `gpt-tokenizer` library
- **Open source** — Full transparency and auditability

---

## Features

- **Custom Themes** — Personalize ChatGPT's look and feel
- **Token Counter** — Track your input/output token usage in real-time
- **Local-First** — Everything runs in your browser, nothing is sent externally
- **Mobile-Aware Web Onboarding** — `/mobile` route captures desktop install reminder email and previews mixed free + premium theme screenshots with direct links to the main `#themes` gallery

---

## Available Themes

### Free Themes (7)

| Theme | Description |
|-------|-------------|
| ThemeGPT Dark | Brand dark theme with warm chocolate tones and teal accent |
| ThemeGPT Light | Brand light theme with cream background and teal accent |
| Solarized Dark | Precision colors for readability |
| Dracula | Popular dark theme with purple accents |
| Monokai Pro | Warm, golden syntax highlighting colors |
| High Contrast | Maximum readability with pure black/white |
| One Dark | Atom editor's signature dark theme |

### Premium Themes (8)

| Theme | Description |
|-------|-------------|
| Aurora Borealis | Northern lights with animated aurora effect |
| Sunset Blaze | Warm sunset gradient with ambient glow |
| Electric Dreams | Cyberpunk neon with cosmic aurora |
| Woodland Retreat | Forest background with gentle snowfall |
| Frosted Windowpane | Light theme with frosted glass and snow |
| Silent Night (Starfield) | Deep space with twinkling stars and aurora |
| Synth Wave | Retro 80s neon with animated grid |
| Shades of Purple | Rich purple tones with golden accents |

---

## Repository Structure

```
themegpt-v2.0/
├── apps/
│   ├── extension/    # Plasmo Chrome extension (React, TypeScript)
│   └── web/          # Next.js website
└── packages/
    └── shared/       # Shared TypeScript types & constants
```

| Directory | Description |
|-----------|-------------|
| `apps/extension` | Chrome extension built with [Plasmo](https://plasmo.com) framework |
| `apps/web` | Marketing/docs website built with [Next.js](https://nextjs.org) |
| `packages/shared` | Shared types, constants, and theme definitions |

---

## Quick Start

**Prerequisites:** [Node.js](https://nodejs.org) 20+ and [pnpm](https://pnpm.io) 9+

```bash
# Clone the repository
git clone https://github.com/Org-EthereaLogic/themegpt-v2.0.git
cd themegpt-v2.0

# Install dependencies
pnpm install

# Run the extension (default)
pnpm dev

# Run the web app
pnpm dev:web

# Run quality checks
pnpm lint
pnpm test
```

### Loading the Extension in Chrome

1. Run `pnpm dev` in the `apps/extension` directory
2. Open Chrome and go to `chrome://extensions`
3. Enable "Developer mode" (top right)
4. Click "Load unpacked"
5. Select the `apps/extension/build/chrome-mv3-dev` folder

---

## Tech Stack

| Component | Technologies |
|-----------|-------------|
| **Extension** | Plasmo, React 19, TypeScript, gpt-tokenizer |
| **Web App** | Next.js 16, React 19, Tailwind CSS 4, TypeScript |
| **Shared** | TypeScript |
| **Tooling** | pnpm workspaces, Prettier, ESLint |

---

## Roadmap and Governance

- Product/growth roadmap: [themegpt-90-day-monetization-roadmap.html](./themegpt-90-day-monetization-roadmap.html)
- Daily gate and deployment integrity log: [doc/dev/gate-tracking-log.md](./doc/dev/gate-tracking-log.md)
- Engineering execution checklist: [doc/dev/monetization-growth-execution-checklist.md](./doc/dev/monetization-growth-execution-checklist.md)
- Governance and standards: [CONSTITUTION.md](./CONSTITUTION.md), [DIRECTIVES.md](./DIRECTIVES.md), [AGENTS.md](./AGENTS.md)

Latest campaign snapshot (GA4 web property `516189580`, Feb 21-27):
- 17 total external users in Firestore (5 new Feb 25, 4 new Feb 26; up from 4 on Feb 24)
- Desktop session share: 62% post-targeting fixes (up from 10% on Feb 22-24)
- Homepage scroll depth: 52.3% (up from 28.8%) — pricing section now within median reach
- Google Ads: $100/day budget; 310 clicks / $361 spend through Feb 24, 0 conversions; negative keyword refinements applied Feb 25
- Multi-channel launch Feb 26: Product Hunt listed, Reddit r/chrome_extensions posted, Twitter/X + LinkedIn published
- Conversion funnel: `checkout_start=5`, `trial_start=0`, `purchase_success=0` — focusing on user base growth to 100 before monetization push
- CWV regression under investigation: LCP 6.0s, INP 1.7s, CLS 12 (likely dynamic imports — see gate-tracking-log.md)
- Campaign-ops note: Google Ads API auth is currently invalid (developer token); spend/click reporting is being validated manually in ad dashboards

---

## Brand Identity

ThemeGPT uses the **"Cream & Chocolate"** design system:

| Color | Hex | Usage |
|-------|-----|-------|
| Cream | `#FAF6F0` | Backgrounds |
| Chocolate | `#4B2E1E` | Primary text |
| Peach | `#F4A988` | Accents |
| Teal | `#7ECEC5` | Highlights |

---

## License

MIT License - see [LICENSE](./LICENSE) for details.

Copyright (c) 2025-2026 Etherealogic.ai
