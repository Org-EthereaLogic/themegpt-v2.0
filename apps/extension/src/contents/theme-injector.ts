import type { PlasmoCSConfig } from "plasmo"
import { Storage } from "@plasmohq/storage"
import {
  DEFAULT_THEMES,
  type Theme,
  type ThemePattern,
  type ThemeEffects,
  type DarkVeilConfig,
  // CSS Generators (R1-R3: Using shared module)
  BASE_OVERLAY_CSS,
  KEYFRAMES_CSS,
  generatePatternCSS,
  generateNoiseOverlayCSS,
  generateGlowOverlayCSS,
  generateEffectsCSS,
} from "@themegpt/shared"
import { mountDarkVeil } from "../components/DarkVeil"

export const config: PlasmoCSConfig = {
  matches: ["https://chat.openai.com/*", "https://chatgpt.com/*"],
  run_at: "document_start"
}

const storage = new Storage({ area: "local" })
let styleElement: HTMLStyleElement | null = null
let darkVeilCleanup: (() => void) | null = null

/**
 * Check if extension context is still valid
 * Returns false when extension has been reloaded/updated
 */
function isContextValid(): boolean {
  if (typeof chrome === "undefined") return false
  try {
    return Boolean(chrome.runtime?.id)
  } catch {
    return false
  }
}

// Local CSS generator implementations removed - using @themegpt/shared (R1-R3)
// See packages/shared/src/css/generators.ts for implementations

/**
 * Create effects layer DOM elements
 */
function createEffectsElements(effects: ThemeEffects): void {
  // Clean up existing DarkVeil effect
  if (darkVeilCleanup) {
    darkVeilCleanup()
    darkVeilCleanup = null
  }

  // Remove existing effects layer
  const existing = document.getElementById('themegpt-effects')
  if (existing) existing.remove()

  if (!effects) return

  const container = document.createElement('div')
  container.id = 'themegpt-effects'
  container.className = 'themegpt-effects-layer'

  // Add snowflakes based on style
  if (effects.animatedSnowfall?.enabled) {
    const style = effects.animatedSnowfall.style || 'gentle'

    if (style === 'gradient') {
      // Gradient style uses a single div with CSS background animation
      const gradientDiv = document.createElement('div')
      gradientDiv.className = 'themegpt-snow-gradient'
      container.appendChild(gradientDiv)
    } else if (style === 'shaking') {
      // Shaking style: 12 snowflakes with ❅ and ❆ text characters (CSSnowflakes pattern)
      const snowflakeChars = ['❅', '❆']
      for (let i = 0; i < 12; i++) {
        const flake = document.createElement('div')
        flake.className = `themegpt-snowflake themegpt-snow-${i}`
        flake.textContent = snowflakeChars[i % 2]
        container.appendChild(flake)
      }
    } else {
      // Gentle style uses individual div elements
      const count = effects.animatedSnowfall.density === 'heavy' ? 40 :
                    effects.animatedSnowfall.density === 'medium' ? 25 : 12
      for (let i = 0; i < count; i++) {
        const flake = document.createElement('div')
        flake.className = `themegpt-snowflake themegpt-snow-${i}`
        container.appendChild(flake)
      }
    }
  }

  // Add stars
  if (effects.twinklingStars?.enabled) {
    const count = effects.twinklingStars.count === 'dense' ? 50 :
                  effects.twinklingStars.count === 'medium' ? 30 : 15
    for (let i = 0; i < count; i++) {
      const star = document.createElement('div')
      star.className = `themegpt-star themegpt-star-${i}`
      container.appendChild(star)
    }
    if (effects.twinklingStars.includeShootingStars) {
      for (let i = 1; i <= 2; i++) {
        const shooting = document.createElement('div')
        shooting.className = `themegpt-shooting-star themegpt-shooting-star-${i}`
        container.appendChild(shooting)
      }
    }
  }

  // Add trees
  if (effects.treeSilhouettes?.enabled) {
    const trees = effects.treeSilhouettes
    const count = trees.density === 'forest' ? 8 : trees.density === 'moderate' ? 5 : 3
    const isChristmas = trees.style === 'christmas'
    const withOrnaments = trees.withOrnaments || isChristmas

    for (let i = 0; i < count; i++) {
      const tree = document.createElement('div')
      tree.className = `themegpt-tree themegpt-tree-${i}`

      // Christmas trees are now refined silhouettes - no additional elements needed

      container.appendChild(tree)
    }
  }

  // Add forest background
  if (effects.forestBackground?.enabled) {
    const forest = document.createElement('div')
    forest.className = 'themegpt-forest-background'
    container.appendChild(forest)
  }

  // Add aurora gradient effect with proper isolation
  if (effects.auroraGradient?.enabled) {
    // Create SVG filter for goo/blob merging effect
    const svgNS = 'http://www.w3.org/2000/svg'
    const svg = document.createElementNS(svgNS, 'svg')
    svg.setAttribute('style', 'position: absolute; width: 0; height: 0;')
    svg.innerHTML = `
      <defs>
        <filter id="themegpt-goo">
          <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
          <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -8" result="goo" />
          <feBlend in="SourceGraphic" in2="goo" />
        </filter>
      </defs>
    `
    container.appendChild(svg)

    // Create wrapper with isolation to prevent blur from affecting page content
    const auroraWrapper = document.createElement('div')
    auroraWrapper.className = 'themegpt-aurora-wrapper'

    // Create aurora container with blobs (receives the blur effect)
    const auroraContainer = document.createElement('div')
    auroraContainer.className = 'themegpt-aurora-container'

    for (let i = 1; i <= 5; i++) {
      const blob = document.createElement('div')
      blob.className = `themegpt-aurora-blob themegpt-aurora-g${i}`
      auroraContainer.appendChild(blob)
    }

    // Interactive overlay ensures content layer stays crisp
    const auroraInteractive = document.createElement('div')
    auroraInteractive.className = 'themegpt-aurora-interactive'

    auroraWrapper.appendChild(auroraContainer)
    auroraWrapper.appendChild(auroraInteractive)
    container.appendChild(auroraWrapper)
  }

  // Add ambient effects
  if (effects.ambientEffects?.fogRising) {
    const fog = document.createElement('div')
    fog.className = 'themegpt-fog'
    container.appendChild(fog)
  }
  if (effects.ambientEffects?.neonGrid) {
    const grid = document.createElement('div')
    grid.className = 'themegpt-neon-grid'
    container.appendChild(grid)
  }
  if (effects.ambientEffects?.auroraWaves) {
    const aurora = document.createElement('div')
    aurora.className = 'themegpt-aurora'
    container.appendChild(aurora)
  }
  if (effects.ambientEffects?.candleGlow) {
    const glow = document.createElement('div')
    glow.className = 'themegpt-candle-glow'
    container.appendChild(glow)
  }

  // Add seasonal decorations
  if (effects.seasonalDecorations?.frostEdge) {
    const frost = document.createElement('div')
    frost.className = 'themegpt-frost'
    container.appendChild(frost)
  }
  if (effects.seasonalDecorations?.candyCaneFrame) {
    const frame = document.createElement('div')
    frame.className = 'themegpt-candy-frame'
    container.appendChild(frame)
  }
  if (effects.seasonalDecorations?.sparkleOverlay) {
    for (let i = 0; i < 20; i++) {
      const sparkle = document.createElement('div')
      sparkle.className = `themegpt-sparkle themegpt-sparkle-${i}`
      container.appendChild(sparkle)
    }
  }
  if (effects.seasonalDecorations?.frostedGlass) {
    // Heavy frost vignette from edges
    const vignette = document.createElement('div')
    vignette.className = 'themegpt-frost-vignette'
    container.appendChild(vignette)

    // Condensation droplets at bottom
    const condensation = document.createElement('div')
    condensation.className = 'themegpt-condensation'
    container.appendChild(condensation)
  }
  if (effects.seasonalDecorations?.ribbonBow) {
    // Vertical ribbon at sidebar edge
    const ribbon = document.createElement('div')
    ribbon.className = 'themegpt-ribbon-vertical'
    container.appendChild(ribbon)

    // Bow at top of ribbon
    const bow = document.createElement('div')
    bow.className = 'themegpt-bow'
    const knot = document.createElement('div')
    knot.className = 'themegpt-bow-knot'
    const tailLeft = document.createElement('div')
    tailLeft.className = 'themegpt-bow-tail-left'
    const tailRight = document.createElement('div')
    tailRight.className = 'themegpt-bow-tail-right'
    bow.appendChild(knot)
    bow.appendChild(tailLeft)
    bow.appendChild(tailRight)
    container.appendChild(bow)
  }

  if (container.children.length > 0) {
    document.body.appendChild(container)
  }

  // Mount DarkVeil WebGL effect (must be after container is in DOM)
  if (effects.darkVeil?.enabled) {
    const darkVeilContainer = document.createElement('div')
    darkVeilContainer.id = 'themegpt-dark-veil'
    darkVeilContainer.className = 'dark-veil-container'
    darkVeilContainer.style.cssText = 'position:fixed;inset:0;overflow:hidden;pointer-events:none;z-index:-1;'
    document.body.insertBefore(darkVeilContainer, document.body.firstChild)
    darkVeilCleanup = mountDarkVeil(darkVeilContainer, {
      hueShift: effects.darkVeil.hueShift,
      noise: effects.darkVeil.noise,
      scan: effects.darkVeil.scan,
      scanFreq: effects.darkVeil.scanFreq,
      warp: effects.darkVeil.warp,
    })
  }

}

function applyTheme(theme: Theme | null): void {
  if (!theme || !theme.colors) {
    removeTheme()
    return
  }

  // Toggle High Contrast class for special styling parity with the preview tool.
  document.documentElement.classList.toggle('themegpt-high-contrast', theme.id === 'high-contrast')

  // Look up current theme definition for latest properties (overlays, patterns)
  // This ensures stored themes get new features without re-selection
  const currentDef = DEFAULT_THEMES.find(t => t.id === theme.id)

  const cssVars = Object.entries(theme.colors)
    .map(([key, value]) => `${key}: ${value};`)
    .join("\n  ")

  // Generate pattern CSS if theme has a pattern (prefer current definition)
  const pattern = currentDef?.pattern ?? theme.pattern
  const patternCSS = pattern
    ? generatePatternCSS(pattern, theme.colors['--cgpt-accent'])
    : ''

  // Get effects for generating CSS and DOM elements
  const effects = currentDef?.effects ?? theme.effects

  // Patterns are rendered behind ChatGPT surfaces; for themes that use semi-transparent
  // surfaces, ensure the underlying pattern is visible through the content area.
  const surfaceColor = theme.colors['--cgpt-surface'] || ''
  const hasSemiTransparentSurface = surfaceColor.length === 9 && surfaceColor.startsWith('#')
  const transparencyCSS = (pattern && hasSemiTransparentSurface) ? `
/* ============================================
   PATTERN TRANSPARENCY: Make content areas see-through
   for themes with patterns that should show through
   ============================================ */

/* Main content area - transparent to show pattern */
[class*="react-scroll-to-bottom"] {
  background: transparent !important;
}

/* Conversation container */
main, main > div {
  background: transparent !important;
}

/* Message area container */
[data-testid="conversation-turn-list"],
[class*="conversation-content"] {
  background: transparent !important;
}

/* Override ChatGPT's main surface for pattern visibility */
:root, :root.dark, :root.light, .dark, .light, html, html.dark, html.light {
  --main-surface-primary: transparent !important;
  --main-surface-background: transparent !important;
}
` : ''

  // Generate overlay effect if theme opts in (noise takes priority over glow)
  const hasNoise = currentDef?.noiseOverlay ?? theme.noiseOverlay
  const hasGlow = currentDef?.glowOverlay ?? theme.glowOverlay
  let overlayCSS = ''
  if (hasNoise) {
    overlayCSS = generateNoiseOverlayCSS()
  } else if (hasGlow) {
    overlayCSS = generateGlowOverlayCSS(theme.colors['--cgpt-accent'])
  }

  // Generate premium effects CSS if theme has effects
  const effectsCSS = effects
    ? generateEffectsCSS(effects, theme.colors['--cgpt-accent'])
    : ''

  // Create effects DOM elements
  if (effects) {
    createEffectsElements(effects)
  } else {
    // Remove effects layer if no effects
    const existing = document.getElementById('themegpt-effects')
    if (existing) existing.remove()
  }

  const css = `
/* ============================================
   THEMEGPT - CSS Variable Override System
   ============================================

   Strategy: Override ChatGPT's CSS custom properties
   directly to ensure consistent theming throughout
   the entire interface.
   ============================================ */

/* --- Base Overlay Classes (R2: Consolidated) --- */
${BASE_OVERLAY_CSS}

/* --- Keyframe Animations (R3: Consolidated) --- */
${KEYFRAMES_CSS}

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
  outline: 2px solid var(--cgpt-accent) !important;
  outline-offset: 2px !important;
}

/* Code blocks (match ThemeGPT preview tool) */
main pre,
[data-testid="conversation-turn-list"] pre {
  background: var(--cgpt-surface) !important;
  border: 1px solid var(--cgpt-border) !important;
  border-radius: 8px !important;
  padding: 16px !important;
  overflow-x: auto !important;
  margin: 12px 0 !important;
}

main code,
[data-testid="conversation-turn-list"] code {
  font-family: ui-monospace, "JetBrains Mono", "Fira Code", SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace !important;
  font-size: 14px !important;
  color: var(--cgpt-accent) !important;
  background: transparent !important;
}

main pre code,
[data-testid="conversation-turn-list"] pre code {
  color: var(--cgpt-text) !important;
}

/* Composer (High Contrast only): transparent input + bordered container to match preview */
html.themegpt-high-contrast form:has(#prompt-textarea),
html.themegpt-high-contrast form:has([data-testid="prompt-textarea"]) {
  background: transparent !important;
  border: 1px solid var(--cgpt-border) !important;
  border-radius: 12px !important;
  box-shadow: none !important;
}

/* ChatGPT often applies surface backgrounds and focus rings on nested wrappers */
html.themegpt-high-contrast form:has(#prompt-textarea) > *,
html.themegpt-high-contrast form:has([data-testid="prompt-textarea"]) > *,
html.themegpt-high-contrast form:has(#prompt-textarea) > * > *,
html.themegpt-high-contrast form:has([data-testid="prompt-textarea"]) > * > * {
  background: transparent !important;
  box-shadow: none !important;
}

html.themegpt-high-contrast form:has(#prompt-textarea):focus-within,
html.themegpt-high-contrast form:has([data-testid="prompt-textarea"]):focus-within {
  outline: none !important;
  box-shadow: none !important;
  border-color: var(--cgpt-border) !important;
}

html.themegpt-high-contrast textarea#prompt-textarea,
html.themegpt-high-contrast textarea[data-testid="prompt-textarea"],
html.themegpt-high-contrast #prompt-textarea,
html.themegpt-high-contrast [data-testid="prompt-textarea"] {
  background: transparent !important;
  border: none !important;
  color: var(--cgpt-text) !important;
}

html.themegpt-high-contrast textarea#prompt-textarea:focus,
html.themegpt-high-contrast textarea#prompt-textarea:focus-visible,
html.themegpt-high-contrast textarea[data-testid="prompt-textarea"]:focus,
html.themegpt-high-contrast textarea[data-testid="prompt-textarea"]:focus-visible {
  outline: none !important;
  box-shadow: none !important;
}

html.themegpt-high-contrast textarea#prompt-textarea::placeholder,
html.themegpt-high-contrast textarea[data-testid="prompt-textarea"]::placeholder {
  color: var(--cgpt-text-muted) !important;
}

html.themegpt-high-contrast form:has(#prompt-textarea) button[type="submit"],
html.themegpt-high-contrast form:has([data-testid="prompt-textarea"]) button[type="submit"],
html.themegpt-high-contrast button[data-testid="send-button"],
html.themegpt-high-contrast button[data-testid="voice-button"] {
  background: var(--cgpt-accent) !important;
  color: var(--cgpt-bg) !important;
  border: none !important;
}

/* High Contrast: Remove gold/accent outlines from composer area to eliminate yellow line artifact */
html.themegpt-high-contrast form:has(#prompt-textarea) *:focus-visible,
html.themegpt-high-contrast form:has([data-testid="prompt-textarea"]) *:focus-visible,
html.themegpt-high-contrast form:has(#prompt-textarea) *:focus,
html.themegpt-high-contrast form:has([data-testid="prompt-textarea"]) *:focus {
  outline: none !important;
  box-shadow: none !important;
}

/* High Contrast: Remove any divider/border above composer that might use accent color */
html.themegpt-high-contrast main > div:last-child,
html.themegpt-high-contrast [class*="composer"],
html.themegpt-high-contrast [class*="Composer"] {
  border-top: none !important;
}

/* High Contrast: Ensure contenteditable elements don't show accent outlines */
html.themegpt-high-contrast [contenteditable]:focus,
html.themegpt-high-contrast [contenteditable]:focus-visible {
  outline: none !important;
  box-shadow: none !important;
  caret-color: var(--cgpt-text) !important;
}

/* High Contrast parity: keep sidebar "active" state visible when border == text */
html.themegpt-high-contrast,
html.themegpt-high-contrast.dark,
html.themegpt-high-contrast.light,
.themegpt-high-contrast,
.themegpt-high-contrast.dark,
.themegpt-high-contrast.light {
  --sidebar-surface-secondary: var(--cgpt-surface) !important;
  --sidebar-surface-tertiary: var(--cgpt-surface) !important;
  --main-surface-secondary-selected: var(--cgpt-surface) !important;
}

html.themegpt-high-contrast aside [aria-current="page"] {
  background: var(--cgpt-surface) !important;
  box-shadow: inset 3px 0 0 var(--cgpt-accent) !important;
  font-weight: 600;
}

/* Overlay/backdrop for modals */
[data-radix-overlay] {
  background-color: rgba(0, 0, 0, 0.5) !important;
}

${patternCSS}
${transparencyCSS}
${overlayCSS}
${effectsCSS}
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
  document.documentElement.classList.remove('themegpt-high-contrast')
  // Remove effects layer
  const effectsLayer = document.getElementById('themegpt-effects')
  if (effectsLayer) effectsLayer.remove()
  // Clean up DarkVeil WebGL effect
  if (darkVeilCleanup) {
    darkVeilCleanup()
    darkVeilCleanup = null
  }
  const darkVeilContainer = document.getElementById('themegpt-dark-veil')
  if (darkVeilContainer) darkVeilContainer.remove()
}

async function init(): Promise<void> {
  // Retry context validation (production may need time to initialize)
  let attempts = 0
  while (!isContextValid() && attempts < 5) {
    await new Promise(resolve => setTimeout(resolve, 100))
    attempts++
  }

  if (!isContextValid()) {
    console.warn('[ThemeGPT] Extension context not available after retries')
    return
  }

  try {
    const theme = await storage.get<Theme>("activeTheme")
    if (theme) {
      applyTheme(theme)
    }

    storage.watch({
      activeTheme: (change) => {
        if (!isContextValid()) return
        applyTheme(change.newValue as Theme | null)
      }
    })
  } catch (e) {
    console.error('[ThemeGPT] Theme initialization failed:', e)
  }
}

if (isContextValid()) {
  init()
}
