# ThemeGPT Chrome Extension

A privacy-first Chrome extension for customizing ChatGPT's appearance.

## Development Workflow

### Which Build to Load in Chrome

| Phase | Command | Load This Directory | Hot Reload? |
|-------|---------|---------------------|-------------|
| **Development** | `pnpm dev` | `build/chrome-mv3-dev` | Yes |
| **Production** | `pnpm build` | `build/chrome-mv3-prod` | No |

**During development, always load `chrome-mv3-dev`** — it supports hot reloading so changes appear automatically without manual rebuilds.

### Loading the Extension in Chrome

1. Run `pnpm dev` to start the development server
2. Open `chrome://extensions` in Chrome
3. Enable "Developer mode" (toggle in top right)
4. Click "Load unpacked"
5. Select: `apps/extension/build/chrome-mv3-dev`

The extension will auto-update as you edit files. If changes don't appear, click the refresh icon on the extension card.

### Dev Mode Features

The `DEV_UNLOCK_ALL_PREMIUM` flag in `popup.tsx` unlocks all premium themes during development. This must be set to `false` before production builds.

## Commands

```bash
pnpm dev      # Start dev server with hot reload
pnpm build    # Create production build
pnpm test     # Run tests
pnpm lint     # Type check
```

## Production Build

Run `pnpm build` to create an optimized bundle in `build/chrome-mv3-prod`, ready for packaging and store submission.

## Submit to the webstores

The easiest way to deploy your Plasmo extension is to use the built-in [bpp](https://bpp.browser.market) GitHub action. Prior to using this action however, make sure to build your extension and upload the first version to the store to establish the basic credentials. Then, simply follow [this setup instruction](https://docs.plasmo.com/framework/workflows/submit) and you should be on your way for automated submission!
