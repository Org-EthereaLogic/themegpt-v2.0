import type { PlasmoCSConfig } from "plasmo"
import { Storage } from "@plasmohq/storage"
import type { Theme, ThemePattern } from "@themegpt/shared"

export const config: PlasmoCSConfig = {
  matches: ["https://chat.openai.com/*", "https://chatgpt.com/*"],
  run_at: "document_start"
}

const storage = new Storage({ area: "local" })
let styleElement: HTMLStyleElement | null = null

/**
 * Generate CSS for background patterns
 */
function generatePatternCSS(pattern: ThemePattern, accentColor: string): string {
  const color = pattern.color || accentColor
  const opacity = pattern.opacity
  const size = pattern.size || 1

  switch (pattern.type) {
    case 'dots':
      // Subtle dot grid pattern
      return `
/* Pattern: Dots */
body::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 0;
  background-image: radial-gradient(${color} 1px, transparent 1px);
  background-size: ${20 * size}px ${20 * size}px;
  opacity: ${opacity};
}`

    case 'grid':
      // Fine grid lines (tartan-inspired)
      return `
/* Pattern: Grid */
body::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 0;
  background-image:
    linear-gradient(${color} 1px, transparent 1px),
    linear-gradient(90deg, ${color} 1px, transparent 1px);
  background-size: ${24 * size}px ${24 * size}px;
  opacity: ${opacity};
}`

    case 'snowflakes':
      // Scattered snowflake-like pattern (multiple dot sizes)
      return `
/* Pattern: Snowflakes */
body::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 0;
  background-image:
    radial-gradient(${color} 2px, transparent 2px),
    radial-gradient(${color} 1px, transparent 1px);
  background-size: ${50 * size}px ${50 * size}px, ${30 * size}px ${30 * size}px;
  background-position: 0 0, ${15 * size}px ${15 * size}px;
  opacity: ${opacity};
}`

    case 'stars':
      // Sparse star-like points
      return `
/* Pattern: Stars */
body::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 0;
  background-image:
    radial-gradient(${color} 1.5px, transparent 1.5px),
    radial-gradient(${color} 1px, transparent 1px),
    radial-gradient(${color} 0.5px, transparent 0.5px);
  background-size: ${80 * size}px ${80 * size}px, ${60 * size}px ${60 * size}px, ${40 * size}px ${40 * size}px;
  background-position: 0 0, ${30 * size}px ${40 * size}px, ${15 * size}px ${20 * size}px;
  opacity: ${opacity};
}`

    case 'noise':
      // Subtle noise texture using SVG
      const noiseSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch"/></filter><rect width="100" height="100" filter="url(#n)" opacity="${opacity}"/></svg>`
      const encodedSvg = btoa(noiseSvg)
      return `
/* Pattern: Noise */
body::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 0;
  background-image: url('data:image/svg+xml;base64,${encodedSvg}');
  background-repeat: repeat;
  opacity: ${opacity * 3};
}`

    default:
      return ''
  }
}

function applyTheme(theme: Theme | null): void {
  if (!theme || !theme.colors) {
    removeTheme()
    return
  }

  const cssVars = Object.entries(theme.colors)
    .map(([key, value]) => `${key}: ${value};`)
    .join("\n  ")

  // Generate pattern CSS if theme has a pattern
  const patternCSS = theme.pattern
    ? generatePatternCSS(theme.pattern, theme.colors['--cgpt-accent'])
    : ''

  const css = `
/* ============================================
   THEMEGPT - CSS Variable Override System
   ============================================

   Strategy: Override ChatGPT's CSS custom properties
   directly to ensure consistent theming throughout
   the entire interface.
   ============================================ */

/* Define our theme variables */
:root {
  ${cssVars}
}

/* ============================================
   CORE: Override ChatGPT's Theme Variables
   ============================================ */

:root,
:root.dark,
:root.light,
.dark,
.light,
html,
html.dark,
html.light {
  /* --- Main Surface Colors --- */
  --main-surface-primary: var(--cgpt-bg) !important;
  --main-surface-secondary: var(--cgpt-surface) !important;
  --main-surface-tertiary: var(--cgpt-surface) !important;
  --main-surface-background: var(--cgpt-bg) !important;
  --main-surface-primary-inverse: var(--cgpt-text) !important;
  --main-surface-secondary-selected: var(--cgpt-border) !important;

  /* --- Sidebar Surface Colors --- */
  --sidebar-surface-primary: var(--cgpt-surface) !important;
  --sidebar-surface-secondary: var(--cgpt-border) !important;
  --sidebar-surface-tertiary: var(--cgpt-border) !important;

  /* --- Composer/Input Area --- */
  --composer-surface: var(--cgpt-surface) !important;
  --composer-surface-primary: var(--cgpt-surface) !important;

  /* --- Message Surface --- */
  --message-surface: var(--cgpt-surface) !important;

  /* --- Text Colors --- */
  --text-primary: var(--cgpt-text) !important;
  --text-primary-inverse: var(--cgpt-bg) !important;
  --text-secondary: var(--cgpt-text-muted) !important;
  --text-tertiary: var(--cgpt-text-muted) !important;
  --text-quaternary: var(--cgpt-text-muted) !important;
  --hint-text: var(--cgpt-text-muted) !important;

  /* --- Border Colors --- */
  --border-light: var(--cgpt-border) !important;
  --border-medium: var(--cgpt-border) !important;
  --border-heavy: var(--cgpt-border) !important;
  --border-xheavy: var(--cgpt-border) !important;
  --border-default: var(--cgpt-border) !important;
  --border-xlight: var(--cgpt-border) !important;
  --border-sharp: var(--cgpt-border) !important;

  /* --- Background Utilities --- */
  --bg-primary: var(--cgpt-bg) !important;
  --bg-secondary: var(--cgpt-surface) !important;
  --bg-tertiary: var(--cgpt-surface) !important;
  --bg-quaternary: var(--cgpt-border) !important;
  --bg-elevated-primary: var(--cgpt-surface) !important;
  --bg-elevated-secondary: var(--cgpt-surface) !important;

  /* --- Link/Accent Colors --- */
  --link: var(--cgpt-accent) !important;
  --link-hover: var(--cgpt-accent) !important;

  /* --- Icon Colors --- */
  --icon-surface: var(--cgpt-surface) !important;

  /* --- Interactive Elements --- */
  --interactive-bg-accent-default: var(--cgpt-accent) !important;
  --interactive-bg-accent-hover: var(--cgpt-accent) !important;

  /* --- Code/Canvas --- */
  --canvas-bg: var(--cgpt-bg) !important;
  --codemirror-bg: var(--cgpt-surface) !important;

  /* --- Scrollbar --- */
  --utility-scrollbar: var(--cgpt-border) !important;

  /* --- Selection Colors (subtle, semi-transparent) --- */
  --theme-user-selection-bg: color-mix(in srgb, var(--cgpt-accent) 35%, transparent) !important;
  --default-theme-user-selection-bg: color-mix(in srgb, var(--cgpt-accent) 35%, transparent) !important;
  --black-theme-user-selection-bg: color-mix(in srgb, var(--cgpt-accent) 35%, transparent) !important;
  --blue-theme-user-selection-bg: color-mix(in srgb, var(--cgpt-accent) 35%, transparent) !important;
  --green-theme-user-selection-bg: color-mix(in srgb, var(--cgpt-accent) 35%, transparent) !important;
  --orange-theme-user-selection-bg: color-mix(in srgb, var(--cgpt-accent) 35%, transparent) !important;

  /* --- Gray Scale Override (for referenced variables) --- */
  --gray-50: var(--cgpt-surface) !important;
  --gray-100: var(--cgpt-surface) !important;
  --gray-200: var(--cgpt-border) !important;
  --gray-600: var(--cgpt-border) !important;
  --gray-700: var(--cgpt-surface) !important;
  --gray-750: var(--cgpt-surface) !important;
  --gray-800: var(--cgpt-bg) !important;
  --gray-900: var(--cgpt-bg) !important;
  --gray-950: var(--cgpt-text) !important;
  --white: var(--cgpt-bg) !important;
}

/* ============================================
   FALLBACKS: Direct Element Overrides
   ============================================
   These catch any elements that don't use
   ChatGPT's variable system.
   ============================================ */

/* Base document */
html, body {
  background-color: var(--cgpt-bg) !important;
  color: var(--cgpt-text) !important;
}

/* Scrollbar styling (not variable-controlled) */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: var(--cgpt-bg) !important;
}

::-webkit-scrollbar-thumb {
  background: var(--cgpt-border) !important;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--cgpt-text-muted) !important;
}

/* Selection highlighting - subtle, semi-transparent for modern elegance */
::selection {
  background-color: color-mix(in srgb, var(--cgpt-accent) 35%, transparent) !important;
  color: inherit !important;
}

/* Firefox selection */
::-moz-selection {
  background-color: color-mix(in srgb, var(--cgpt-accent) 35%, transparent) !important;
  color: inherit !important;
}

/* Placeholder text */
::placeholder {
  color: var(--cgpt-text-muted) !important;
  opacity: 0.7;
}

/* Focus states */
*:focus-visible {
  outline-color: var(--cgpt-accent) !important;
}

/* Code blocks (ensure syntax highlighting works) */
pre, code {
  background-color: var(--cgpt-surface) !important;
}

code {
  color: var(--cgpt-accent) !important;
}

/* Overlay/backdrop for modals */
[data-radix-overlay] {
  background-color: rgba(0, 0, 0, 0.5) !important;
}

${patternCSS}
`

  if (!styleElement) {
    styleElement = document.createElement("style")
    styleElement.id = "themegpt-styles"
    document.documentElement.appendChild(styleElement)
  }

  styleElement.textContent = css
}

function removeTheme(): void {
  if (styleElement) {
    styleElement.remove()
    styleElement = null
  }
}

async function init(): Promise<void> {
  const theme = await storage.get<Theme>("activeTheme")
  if (theme) {
    applyTheme(theme)
  }

  storage.watch({
    activeTheme: (change) => {
      applyTheme(change.newValue as Theme | null)
    }
  })
}

init()
