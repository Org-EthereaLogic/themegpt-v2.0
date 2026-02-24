# ThemeGPT Chrome Extension

Privacy-first Chrome extension for customizing ChatGPT themes and tracking token counts locally.

## Current Status (As of February 24, 2026)

- Extension package version in repo: `2.3.1`
- Latest published Chrome Web Store version: `2.3.0` (approved February 22, 2026)
- `2.3.1` store submissions are still pending review (see [`gate-tracking-log.md`](../../doc/dev/gate-tracking-log.md))
- `externally_connectable` is restricted to production domains and the explicit production Cloud Run URL

## Development Workflow

### Which Build to Load in Chrome

| Phase | Command | Load This Directory | Hot Reload? |
|-------|---------|---------------------|-------------|
| Development | `pnpm dev` | `build/chrome-mv3-dev` | Yes |
| Production | `pnpm build` | `build/chrome-mv3-prod` | No |

Use `chrome-mv3-dev` during active development.

### Loading the Extension in Chrome

1. Run `pnpm dev`
2. Open `chrome://extensions`
3. Enable Developer mode
4. Click Load unpacked
5. Select `apps/extension/build/chrome-mv3-dev`

If updates do not appear, refresh the extension card.

### Dev Mode Feature Flag

`DEV_UNLOCK_ALL_PREMIUM` in `src/popup.tsx` unlocks premium themes for local testing and must remain `false` for production builds.

## Commands

```bash
pnpm dev          # Plasmo dev server (hot reload)
pnpm build        # Production build
pnpm build:edge   # Edge MV3 build
pnpm package      # Package Chrome zip
pnpm package:edge # Package Edge zip
pnpm lint         # Type check (tsc --noEmit)
pnpm test         # Vitest
```

## Production Submission

Automated webstore submission is handled by `.github/workflows/submit-extension.yml`.

Triggers:

- Manual: `workflow_dispatch`
- Tag push: `v*.*.*`

The workflow builds and packages both Chrome and Edge extension artifacts, then submits through Plasmo BPP using `SUBMIT_KEYS` GitHub secret.

## Privacy and Security Boundaries

- No analytics/telemetry in the extension
- Theme and token state are local-only
- Premium entitlement checks are performed against ThemeGPT web APIs
- External messaging is limited by manifest `externally_connectable` allowlist
