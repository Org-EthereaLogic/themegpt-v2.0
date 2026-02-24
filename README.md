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

[![Codacy Badge](https://api.codacy.com/project/badge/Grade/9440b1101c2543e8a123c1de839a269c)](https://app.codacy.com/gh/Org-EthereaLogic/themegpt-v2.0?utm_source=github.com&utm_medium=referral&utm_content=Org-EthereaLogic/themegpt-v2.0&utm_campaign=Badge_Grade)

## Get ThemeGPT

**[Install from the Chrome Web Store](https://chromewebstore.google.com/detail/dlphknialdlpmcgoknkcmapmclgckhba?utm_source=cws&utm_medium=share&utm_campaign=item-share)**

> **Latest published extension: v2.3.0** — approved by the Chrome Web Store February 22, 2026.
>
> CWS store listing update (promo video + refreshed screenshots) submitted for review February 22, 2026.
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

**Prerequisites:** [Node.js](https://nodejs.org) 18+ and [pnpm](https://pnpm.io) 9+

```bash
# Clone the repository
git clone https://github.com/yourusername/themegpt-v2.0.git
cd themegpt-v2.0

# Install dependencies
pnpm install

# Run both apps in development mode
pnpm dev

# Or run just the extension
cd apps/extension && pnpm dev
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
