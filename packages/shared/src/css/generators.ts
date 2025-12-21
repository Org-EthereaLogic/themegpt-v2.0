/**
 * Shared CSS generators for ThemeGPT
 * Consolidates repeated patterns and keyframes for DRY compliance
 */

import type { ThemePattern, ThemeEffects } from '../index'

// ============================================================================
// BASE STYLES (R2: Consolidated overlay patterns)
// ============================================================================

/**
 * Base CSS classes for overlay layers
 * Eliminates repeated position/pointer-events declarations
 */
export const BASE_OVERLAY_CSS = `
/* ThemeGPT Base Overlay Classes */
.themegpt-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}
.themegpt-overlay--background { z-index: -1; }
.themegpt-overlay--effects { z-index: 0; overflow: hidden; }
.themegpt-overlay--foreground { z-index: 1; }
.themegpt-overlay--high { z-index: 5; }

.themegpt-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
`

// ============================================================================
// KEYFRAMES (R3: Consolidated animation definitions)
// ============================================================================

/**
 * All keyframe animations defined once
 * Injected once per theme application, not per effect
 */
export const KEYFRAMES_CSS = `
/* ThemeGPT Keyframe Animations */

/* Aurora gradient animations */
@keyframes themegpt-aurora-vertical {
  0% { transform: translateY(-50%); }
  50% { transform: translateY(50%); }
  100% { transform: translateY(-50%); }
}
@keyframes themegpt-aurora-horizontal {
  0% { transform: translate(0%, 0%) translateX(-10%); }
  50% { transform: translate(10%, 10%) translateX(10%); }
  100% { transform: translate(0%, 0%) translateX(-10%); }
}
@keyframes themegpt-aurora-circle {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
@keyframes themegpt-aurora-circle-reverse {
  0% { transform: rotate(360deg); }
  100% { transform: rotate(0deg); }
}

/* Snowfall animations */
@keyframes themegpt-snow-gradient {
  0% { background-position: 0px 0px; }
  100% { background-position: 500px 1000px; }
}
@keyframes themegpt-snowflakes-fall {
  0% { top: -10%; }
  100% { top: 100%; }
}
@keyframes themegpt-snowflakes-shake {
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(80px); }
}

/* Star animations */
@keyframes themegpt-twinkle {
  0%, 100% { opacity: 0.15; transform: scale(0.7); }
  50% { opacity: var(--peak-opacity, 0.8); transform: scale(1.1); }
}
@keyframes themegpt-shooting {
  0% { transform: translateX(0) translateY(0); opacity: 1; }
  100% { transform: translateX(150px) translateY(100px); opacity: 0; }
}

/* Ambient effect animations */
@keyframes themegpt-fog {
  0%, 100% { transform: translateY(0); opacity: 0.4; }
  50% { transform: translateY(-20px); opacity: 0.6; }
}
@keyframes themegpt-aurora {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}
@keyframes themegpt-sparkle {
  0%, 100% { opacity: 0; transform: scale(0) rotate(0deg); }
  50% { opacity: 1; transform: scale(1) rotate(180deg); }
}
`

// ============================================================================
// Z-INDEX CONSTANTS
// ============================================================================

export const Z_INDEX = {
  BACKGROUND: 0,
  EFFECTS_BASE: 0,
  EFFECTS_OVERLAY: 1,
  UI_HIGH: 5,
  UI_RIBBON: 6,
  SNOWFLAKE_SHAKING: 9999,
} as const

// ============================================================================
// AURORA GRADIENT PALETTES
// ============================================================================

export const AURORA_PALETTES: Record<string, string[]> = {
  arctic: ['18, 180, 200', '80, 220, 230', '0, 150, 180', '100, 200, 220', '40, 190, 200'],
  northern: ['0, 229, 204', '80, 222, 234', '0, 150, 136', '128, 222, 234', '0, 188, 212'],
  cosmic: ['138, 43, 226', '75, 0, 130', '148, 0, 211', '186, 85, 211', '123, 104, 238'],
}

// ============================================================================
// PATTERN GENERATORS
// ============================================================================

export function generatePatternCSS(pattern: ThemePattern, accentColor: string): string {
  const color = pattern.color || accentColor
  const opacity = pattern.opacity
  const size = pattern.size || 1

  switch (pattern.type) {
    case 'dots': {
      const dotRadius = Math.max(2, Math.round(2.5 * size))
      const dotSpacing = Math.round(25 * size)
      const dotOffset = Math.round(dotSpacing / 3)
      return `
/* Pattern: Dots */
body::before {
  content: '';
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: ${Z_INDEX.BACKGROUND};
  background-image: radial-gradient(${color} ${dotRadius}px, transparent ${dotRadius}px);
  background-size: ${dotSpacing}px ${dotSpacing}px;
  background-position: ${dotOffset}px ${dotOffset}px;
  opacity: ${opacity};
}`
    }

    case 'grid':
      return `
/* Pattern: Grid */
body::before {
  content: '';
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: ${Z_INDEX.BACKGROUND};
  background-image:
    linear-gradient(${color}20 1px, transparent 1px),
    linear-gradient(90deg, ${color}20 1px, transparent 1px);
  background-size: ${20 * size}px ${20 * size}px;
  opacity: ${opacity};
}`

    case 'snowflakes': {
      const flakeSize = Math.round(8 * size)
      return `
/* Pattern: Snowflakes */
body::before {
  content: '';
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: ${Z_INDEX.BACKGROUND};
  background-image: radial-gradient(${color} 1px, transparent 1px);
  background-size: ${flakeSize * 4}px ${flakeSize * 4}px;
  opacity: ${opacity};
}`
    }

    case 'stars': {
      const starSize = Math.round(3 * size)
      return `
/* Pattern: Stars */
body::before {
  content: '';
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: ${Z_INDEX.BACKGROUND};
  background-image:
    radial-gradient(${color} ${starSize}px, transparent ${starSize}px),
    radial-gradient(${color} ${Math.round(starSize * 0.5)}px, transparent ${Math.round(starSize * 0.5)}px);
  background-size: ${50 * size}px ${50 * size}px, ${30 * size}px ${30 * size}px;
  background-position: 0 0, ${15 * size}px ${15 * size}px;
  opacity: ${opacity};
}`
    }

    case 'christmastrees': {
      const treeSpacing = Math.round(60 * size)
      const treeBase64 = btoa(`<svg xmlns="http://www.w3.org/2000/svg" width="${treeSpacing}" height="${treeSpacing}" viewBox="0 0 60 60"><path fill="${color}" d="M30 5 L45 25 L40 25 L50 40 L35 40 L35 50 L25 50 L25 40 L10 40 L20 25 L15 25 Z"/></svg>`)
      return `
/* Pattern: Christmas Trees */
body::before {
  content: '';
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: ${Z_INDEX.BACKGROUND};
  background-image: url('data:image/svg+xml;base64,${treeBase64}');
  background-size: ${treeSpacing}px ${treeSpacing}px;
  opacity: ${opacity};
}`
    }

    case 'christmaswrap': {
      const s = Math.round(132 * size)
      return `
/* Pattern: Christmas Tree Wrap */
body::before {
  content: '';
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: ${Z_INDEX.BACKGROUND};
  --s: ${s}px;
  --c1: #ffffff;
  --c2: #a31e39;
  --c3: #31570e;
  --_c: #0000, var(--c1) 1deg 79deg, #0000 81deg;
  --g0: conic-gradient(from 140deg at 50% 87.5%, var(--_c));
  --g1: conic-gradient(from 140deg at 50% 81.25%, var(--_c));
  --g2: conic-gradient(from 140deg at 50% 75%, var(--_c));
  --g3: conic-gradient(at 10% 20%, #0000 75%, var(--c1) 0);
  background:
    var(--g0) 0 calc(var(--s) / -4),
    var(--g0) var(--s) calc(3 * var(--s) / 4),
    var(--g1),
    var(--g1) var(--s) var(--s),
    var(--g2) 0 calc(var(--s) / 4),
    var(--g2) var(--s) calc(5 * var(--s) / 4),
    var(--g3) calc(var(--s) / -10) var(--s),
    var(--g3) calc(9 * var(--s) / 10) calc(2 * var(--s)),
    repeating-conic-gradient(from 45deg, var(--c2) 0 25%, var(--c3) 0 50%);
  background-size: calc(2 * var(--s)) calc(2 * var(--s));
  opacity: ${opacity};
}`
    }

    case 'peppermints': {
      const mintSize = Math.round(40 * size)
      const mintSpacing = Math.round(80 * size)
      const mintSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${mintSize}" height="${mintSize}" viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" fill="white" stroke="#dc2626" stroke-width="2"/><path d="M20 2 A18 18 0 0 1 38 20" fill="none" stroke="#dc2626" stroke-width="6"/><path d="M38 20 A18 18 0 0 1 20 38" fill="none" stroke="#dc2626" stroke-width="6"/><path d="M20 38 A18 18 0 0 1 2 20" fill="none" stroke="#dc2626" stroke-width="6"/><path d="M2 20 A18 18 0 0 1 20 2" fill="none" stroke="#dc2626" stroke-width="6"/></svg>`
      const mintEncoded = btoa(mintSvg)
      return `
/* Pattern: Peppermints */
body::before {
  content: '';
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: ${Z_INDEX.BACKGROUND};
  background-image: url('data:image/svg+xml;base64,${mintEncoded}');
  background-size: ${mintSpacing}px ${mintSpacing}px;
  background-position: ${Math.round(mintSpacing / 4)}px ${Math.round(mintSpacing / 4)}px;
  opacity: ${opacity};
}`
    }

    default:
      return ''
  }
}

// ============================================================================
// OVERLAY GENERATORS
// ============================================================================

export function generateNoiseOverlayCSS(): string {
  return `
/* Premium: Subtle Noise Texture Overlay */
body::after {
  content: '';
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: ${Z_INDEX.EFFECTS_OVERLAY};
  opacity: 0.035;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}`
}

export function generateGlowOverlayCSS(accentColor: string): string {
  return `
/* Premium: Ambient Radial Glow Overlay */
body::after {
  content: '';
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: ${Z_INDEX.EFFECTS_OVERLAY};
  opacity: 0.08;
  background-image:
    radial-gradient(ellipse 80% 50% at 50% 0%, ${accentColor} 0%, transparent 50%),
    radial-gradient(ellipse 60% 40% at 20% 100%, ${accentColor} 0%, transparent 40%);
}`
}

// ============================================================================
// EFFECTS GENERATORS (Split into focused sub-generators)
// ============================================================================

function generateSnowfallCSS(snow: NonNullable<ThemeEffects['animatedSnowfall']>): string {
  const style = snow.style || 'gentle'
  const count = snow.density === 'heavy' ? 40 : snow.density === 'medium' ? 25 : 12
  const duration = snow.speed === 'fast' ? 8 : snow.speed === 'medium' ? 12 : 18
  const snowColor = snow.snowColor || 'white'

  if (style === 'gradient') {
    return `
/* Premium Effect: Gradient Snowfall */
.themegpt-snow-gradient {
  position: fixed;
  top: -600px;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: ${Z_INDEX.BACKGROUND};
  background-image: radial-gradient(5px 5px at 34px 172px, ${snowColor} 50%, transparent 50%), radial-gradient(4px 4px at 86px 25px, ${snowColor} 50%, transparent 50%), radial-gradient(5px 5px at 388px 47px, ${snowColor} 50%, transparent 50%), radial-gradient(3px 3px at 53px 303px, ${snowColor} 50%, transparent 50%), radial-gradient(4px 4px at 373px 475px, ${snowColor} 50%, transparent 50%), radial-gradient(4px 4px at 196px 261px, ${snowColor} 50%, transparent 50%), radial-gradient(5px 5px at 434px 424px, ${snowColor} 50%, transparent 50%), radial-gradient(4px 4px at 234px 213px, ${snowColor} 50%, transparent 50%), radial-gradient(4px 4px at 393px 356px, ${snowColor} 50%, transparent 50%), radial-gradient(3px 3px at 537px 497px, ${snowColor} 50%, transparent 50%), radial-gradient(3px 3px at 151px 362px, ${snowColor} 50%, transparent 50%), radial-gradient(6px 6px at 110px 99px, ${snowColor} 50%, transparent 50%), radial-gradient(3px 3px at 270px 111px, ${snowColor} 50%, transparent 50%), radial-gradient(3px 3px at 351px 424px, ${snowColor} 50%, transparent 50%), radial-gradient(5px 5px at 459px 279px, ${snowColor} 50%, transparent 50%), radial-gradient(4px 4px at 584px 126px, ${snowColor} 50%, transparent 50%), radial-gradient(6px 6px at 303px 486px, ${snowColor} 50%, transparent 50%), radial-gradient(3px 3px at 132px 292px, ${snowColor} 50%, transparent 50%), radial-gradient(3px 3px at 120px 162px, ${snowColor} 50%, transparent 50%), radial-gradient(5px 5px at 396px 460px, ${snowColor} 50%, transparent 50%), radial-gradient(5px 5px at 169px 508px, ${snowColor} 50%, transparent 50%), radial-gradient(3px 3px at 177px 298px, ${snowColor} 50%, transparent 50%), radial-gradient(4px 4px at 575px 410px, ${snowColor} 50%, transparent 50%), radial-gradient(6px 6px at 29px 140px, ${snowColor} 50%, transparent 50%), radial-gradient(3px 3px at 82px 378px, ${snowColor} 50%, transparent 50%), radial-gradient(4px 4px at 482px 473px, ${snowColor} 50%, transparent 50%), radial-gradient(6px 6px at 56px 24px, ${snowColor} 50%, transparent 50%), radial-gradient(3px 3px at 157px 73px, ${snowColor} 50%, transparent 50%), radial-gradient(6px 6px at 97px 496px, ${snowColor} 50%, transparent 50%), radial-gradient(6px 6px at 240px 225px, ${snowColor} 50%, transparent 50%);
  background-size: 600px 600px;
  animation: themegpt-snow-gradient ${duration}s linear infinite;
  opacity: 0.7;
}
@media (prefers-reduced-motion: reduce) { .themegpt-snow-gradient { animation: none; } }`
  }

  if (style === 'shaking') {
    return `
/* Premium Effect: Shaking Snowfall */
.themegpt-snowflake {
  color: ${snowColor};
  font-size: 1em;
  font-family: Arial, sans-serif;
  text-shadow: 0 0 5px #000;
  position: fixed;
  top: -10%;
  z-index: ${Z_INDEX.SNOWFLAKE_SHAKING};
  user-select: none;
  cursor: default;
  animation-name: themegpt-snowflakes-fall, themegpt-snowflakes-shake;
  animation-duration: 10s, 3s;
  animation-timing-function: linear, ease-in-out;
  animation-iteration-count: infinite, infinite;
}
.themegpt-snow-0 { left: 1%; animation-delay: 0s, 0s; }
.themegpt-snow-1 { left: 10%; animation-delay: 1s, 1s; }
.themegpt-snow-2 { left: 20%; animation-delay: 6s, 0.5s; }
.themegpt-snow-3 { left: 30%; animation-delay: 4s, 2s; }
.themegpt-snow-4 { left: 40%; animation-delay: 2s, 2s; }
.themegpt-snow-5 { left: 50%; animation-delay: 8s, 3s; }
.themegpt-snow-6 { left: 60%; animation-delay: 6s, 2s; }
.themegpt-snow-7 { left: 70%; animation-delay: 2.5s, 1s; }
.themegpt-snow-8 { left: 80%; animation-delay: 1s, 0s; }
.themegpt-snow-9 { left: 90%; animation-delay: 3s, 1.5s; }
.themegpt-snow-10 { left: 25%; animation-delay: 2s, 0s; }
.themegpt-snow-11 { left: 65%; animation-delay: 4s, 2.5s; }
@media (prefers-reduced-motion: reduce) { .themegpt-snowflake { animation: none; opacity: 0.3; } }`
  }

  // Gentle style
  let snowflakesCSS = ''
  for (let i = 0; i < count; i++) {
    const flakeWidth = 5 + Math.random() * 15
    const flakeVertical = -700 + Math.random() * 700
    const flakeHorizontal = Math.random() * 100
    const flakeBlur = 2 + Math.random() * 2
    const flakeOpacity = (50 + Math.random() * 50) * 0.01
    const flakeDelay = 15 + Math.random() * 55
    const rotateX = 10 + Math.random() * 40
    const rotateY = 10 + Math.random() * 40
    snowflakesCSS += `.themegpt-snow-${i}{width:${flakeWidth.toFixed(1)}px;height:${flakeWidth.toFixed(1)}px;top:${flakeVertical.toFixed(0)}px;left:${flakeHorizontal.toFixed(1)}%;opacity:${flakeOpacity.toFixed(2)};filter:blur(${flakeBlur.toFixed(1)}px);animation:themegpt-flakes-${i} ${flakeDelay.toFixed(0)}s linear infinite;}
@keyframes themegpt-flakes-${i}{100%{transform:translateY(1000px) rotateX(${rotateX.toFixed(0)}deg) rotateY(${rotateY.toFixed(0)}deg);opacity:0;}}`
  }

  return `
/* Premium Effect: Gentle Snowfall */
.themegpt-snow-container {
  position: relative;
  width: 100%;
  height: 100%;
  pointer-events: none;
}
.themegpt-snowflake {
  position: absolute;
  border-radius: 50%;
  transform: translateY(0) rotateX(0) rotateY(0);
  background-image:
    linear-gradient(180deg, rgba(255,255,255,0) 30%, ${snowColor} 50%, ${snowColor} 60%, rgba(255,255,255,0) 60%),
    linear-gradient(90deg, rgba(255,255,255,0) 30%, ${snowColor} 50%, ${snowColor} 60%, rgba(255,255,255,0) 60%),
    linear-gradient(45deg, rgba(255,255,255,0) 33%, ${snowColor} 53%, ${snowColor} 57%, rgba(255,255,255,0) 65%),
    linear-gradient(135deg, rgba(255,255,255,0) 33%, ${snowColor} 53%, ${snowColor} 57%, rgba(255,255,255,0) 65%);
  z-index: ${Z_INDEX.BACKGROUND};
  pointer-events: none;
}
${snowflakesCSS}
@media (prefers-reduced-motion: reduce) { .themegpt-snowflake { animation: none; opacity: 0.3; } }`
}

function generateStarsCSS(stars: NonNullable<ThemeEffects['twinklingStars']>, accentColor: string): string {
  const count = stars.count === 'dense' ? 50 : stars.count === 'medium' ? 30 : 15
  const starColor = stars.starColor || accentColor
  const baseDuration = stars.animationDuration || 3

  let starsCSS = ''
  for (let i = 0; i < count; i++) {
    const left = Math.random() * 100
    const top = Math.random() * 70
    const delay = Math.random() * (baseDuration * 5)
    const size = 1 + Math.random() * 2.5
    const durationVariation = baseDuration * (0.5 + Math.random())
    const peakOpacity = 0.6 + Math.random() * 0.4
    starsCSS += `.themegpt-star-${i}{left:${left}%;top:${top}%;animation-delay:${delay.toFixed(2)}s;animation-duration:${durationVariation.toFixed(2)}s;width:${size.toFixed(1)}px;height:${size.toFixed(1)}px;--peak-opacity:${peakOpacity.toFixed(2)};}`
  }

  return `
/* Premium Effect: Twinkling Stars */
.themegpt-star {
  position: absolute;
  background: ${starColor};
  border-radius: 50%;
  animation: themegpt-twinkle ${baseDuration}s ease-in-out infinite;
  box-shadow: 0 0 3px ${starColor};
  --peak-opacity: 0.8;
}
${starsCSS}
${stars.includeShootingStars ? `
.themegpt-shooting-star {
  position: absolute;
  width: 2px;
  height: 2px;
  background: linear-gradient(90deg, white, transparent);
  animation: themegpt-shooting 2s ease-out infinite;
}
.themegpt-shooting-star-1 { top: 15%; left: 20%; animation-delay: 3s; }
.themegpt-shooting-star-2 { top: 25%; left: 60%; animation-delay: 7s; }` : ''}
@media (prefers-reduced-motion: reduce) { .themegpt-star { animation: none; opacity: 0.6; } }`
}

function generateTreesCSS(trees: NonNullable<ThemeEffects['treeSilhouettes']>): string {
  const count = trees.density === 'forest' ? 8 : trees.density === 'moderate' ? 5 : 3
  const isChristmas = trees.style === 'christmas'

  let treesCSS = ''
  for (let i = 0; i < count; i++) {
    const left = (i / count) * 80 + Math.random() * 15
    const height = isChristmas ? 90 + Math.random() * 50 : 60 + Math.random() * 80
    const width = height * (isChristmas ? 0.5 : 0.6)
    const opacity = isChristmas ? 0.12 + (i / count) * 0.18 : 0.15 + (i / count) * 0.25
    treesCSS += `.themegpt-tree-${i}{left:${left}%;height:${height}px;width:${width}px;opacity:${opacity};}`
  }

  if (isChristmas) {
    return `
/* Premium Effect: Refined Pine Silhouettes */
.themegpt-tree {
  position: absolute;
  bottom: 0;
  z-index: ${Z_INDEX.EFFECTS_OVERLAY};
}
.themegpt-tree::before {
  content: '';
  position: absolute;
  bottom: 8%;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  height: 92%;
  background: rgba(0, 0, 0, 0.7);
  clip-path: polygon(50% 0%, 47% 12%, 35% 18%, 44% 20%, 30% 32%, 42% 34%, 22% 48%, 38% 50%, 12% 68%, 35% 70%, 5% 88%, 32% 88%, 25% 100%, 75% 100%, 68% 88%, 95% 88%, 65% 70%, 88% 68%, 62% 50%, 78% 48%, 58% 34%, 70% 32%, 56% 20%, 65% 18%, 53% 12%);
}
.themegpt-tree::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 12%;
  height: 10%;
  background: rgba(40, 25, 15, 0.8);
  border-radius: 0 0 2px 2px;
}
${treesCSS}`
  }

  const pineClipPath = trees.style === 'pine' || trees.style === 'mixed'
    ? 'polygon(50% 0%, 45% 15%, 30% 15%, 40% 30%, 20% 30%, 35% 45%, 10% 45%, 30% 60%, 5% 60%, 25% 75%, 0% 80%, 40% 100%, 60% 100%, 100% 80%, 75% 75%, 95% 60%, 70% 60%, 90% 45%, 65% 45%, 80% 30%, 60% 30%, 70% 15%, 55% 15%)'
    : 'polygon(50% 0%, 0% 100%, 100% 100%)'

  return `
/* Premium Effect: Forest Tree Silhouettes */
.themegpt-tree {
  position: absolute;
  bottom: 0;
  clip-path: ${pineClipPath};
  background: rgba(0,0,0,0.8);
}
.themegpt-tree::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 40%;
  width: 20%;
  height: 12px;
  background: rgba(60,30,15,0.9);
  border-radius: 2px;
}
${treesCSS}`
}

function generateAuroraCSS(aurora: NonNullable<ThemeEffects['auroraGradient']>): string {
  const speed = aurora.speed === 'fast' ? 15 : aurora.speed === 'medium' ? 25 : 40
  const intensity = aurora.intensity === 'vivid' ? 0.6 : aurora.intensity === 'medium' ? 0.45 : 0.3
  const colors = aurora.palette === 'custom' && aurora.customColors
    ? aurora.customColors
    : AURORA_PALETTES[aurora.palette || 'northern']

  return `
/* Premium Effect: Aurora Gradient - Morphing Blobs */
.themegpt-aurora-wrapper {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: ${Z_INDEX.EFFECTS_BASE};
  isolation: isolate;
  overflow: hidden;
}
.themegpt-aurora-container {
  position: absolute;
  inset: 0;
  filter: url(#themegpt-goo) blur(40px);
  contain: strict;
}
.themegpt-aurora-interactive {
  position: absolute;
  inset: 0;
  z-index: ${Z_INDEX.EFFECTS_OVERLAY};
}
.themegpt-aurora-blob {
  position: absolute;
  width: 80%;
  height: 80%;
  border-radius: 50%;
  mix-blend-mode: hard-light;
  opacity: ${intensity};
}
.themegpt-aurora-g1 {
  background: radial-gradient(circle at center, rgba(${colors[0]}, 0.5) 0%, rgba(${colors[0]}, 0) 50%);
  top: calc(50% - 40%);
  left: calc(50% - 40%);
  transform-origin: center center;
  animation: themegpt-aurora-circle ${speed}s ease infinite;
  animation-delay: -${speed * 0.25}s;
}
.themegpt-aurora-g2 {
  background: radial-gradient(circle at center, rgba(${colors[1]}, 0.5) 0%, rgba(${colors[1]}, 0) 50%);
  top: calc(50% - 40%);
  left: calc(50% - 40%);
  transform-origin: calc(50% - 200px);
  animation: themegpt-aurora-circle-reverse ${speed * 0.8}s ease infinite;
  animation-delay: -${speed * 0.4}s;
}
.themegpt-aurora-g3 {
  background: radial-gradient(circle at center, rgba(${colors[2]}, 0.5) 0%, rgba(${colors[2]}, 0) 50%);
  top: calc(50% - 40% + 100px);
  left: calc(50% - 40% - 200px);
  transform-origin: calc(50% + 200px);
  animation: themegpt-aurora-vertical ${speed * 0.75}s ease infinite;
  animation-delay: -${speed * 0.15}s;
}
.themegpt-aurora-g4 {
  background: radial-gradient(circle at center, rgba(${colors[3]}, 0.45) 0%, rgba(${colors[3]}, 0) 50%);
  top: calc(50% - 40% - 100px);
  left: calc(50% - 40% + 200px);
  transform-origin: calc(50% - 100px) calc(50% + 100px);
  animation: themegpt-aurora-horizontal ${speed * 1.2}s ease infinite;
  animation-delay: -${speed * 0.6}s;
}
.themegpt-aurora-g5 {
  background: radial-gradient(circle at center, rgba(${colors[4]}, 0.4) 0%, rgba(${colors[4]}, 0) 50%);
  width: 100%;
  height: 100%;
  top: calc(50% - 50%);
  left: calc(50% - 50%);
  transform-origin: calc(50% - 300px) calc(50% + 200px);
  animation: themegpt-aurora-circle ${speed * 1.5}s linear infinite;
  animation-delay: -${speed * 0.35}s;
  opacity: ${intensity * 0.6};
}
@media (prefers-reduced-motion: reduce) {
  .themegpt-aurora-blob { animation: none; }
}`
}

function generateAmbientCSS(ambient: NonNullable<ThemeEffects['ambientEffects']>, accentColor: string): string {
  const blocks: string[] = []

  if (ambient.fogRising) {
    blocks.push(`
/* Premium Effect: Rising Fog */
.themegpt-fog {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 150px;
  background: linear-gradient(to top, rgba(255,255,255,0.15), transparent);
  animation: themegpt-fog 8s ease-in-out infinite;
}
@media (prefers-reduced-motion: reduce) { .themegpt-fog { animation: none; } }`)
  }

  if (ambient.neonGrid) {
    blocks.push(`
/* Premium Effect: Neon Grid */
.themegpt-neon-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(${accentColor}22 1px, transparent 1px),
    linear-gradient(90deg, ${accentColor}22 1px, transparent 1px);
  background-size: 40px 40px;
  transform: perspective(500px) rotateX(60deg);
  transform-origin: center bottom;
  opacity: 0.4;
}`)
  }

  if (ambient.auroraWaves) {
    blocks.push(`
/* Premium Effect: Aurora Waves */
.themegpt-aurora {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 30%;
  background: linear-gradient(90deg,
    rgba(0,255,200,0.1),
    rgba(100,200,255,0.15),
    rgba(180,100,255,0.1),
    rgba(0,255,200,0.1));
  background-size: 300% 100%;
  animation: themegpt-aurora 15s ease-in-out infinite;
  filter: blur(30px);
}
@media (prefers-reduced-motion: reduce) { .themegpt-aurora { animation: none; } }`)
  }

  if (ambient.candleGlow) {
    blocks.push(`
/* Premium Effect: Candle Glow */
.themegpt-candle-glow {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(ellipse 30% 40% at 10% 90%, rgba(255,183,77,0.08) 0%, transparent 70%),
    radial-gradient(ellipse 25% 35% at 90% 85%, rgba(255,183,77,0.06) 0%, transparent 70%),
    radial-gradient(ellipse 20% 30% at 50% 95%, rgba(255,152,0,0.05) 0%, transparent 60%);
}`)
  }

  return blocks.join('\n')
}

/**
 * Generate forest landscape background layer
 * Paper Forest design from SVG Backgrounds, adapted for Cozy Cabin warmth
 * Features layered pine trees with superior shape definition and texture
 */
function generateForestBackgroundCSS(forest: NonNullable<ThemeEffects['forestBackground']>): string {
  const opacity = forest.opacity ?? 0.5
  // Paper Forest SVG with warm cabin-adapted colors:
  // Back trees: #8a9976 (muted sage), Middle: #5d7349 (forest olive), Front: #3d5230 (dark forest)
  // Tree shadows: #2a1f14 (dark brown), Ground: #3d2e1f (warm brown blend)

  return `
/* Premium Effect: Paper Forest Background */
.themegpt-forest-background {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60vh;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 2000 1500'%3E%3Cdefs%3E%3Cg id='t'%3E%3Cpath d='m444 650.5-104.1-147 77.1 5-115.8-163.9 46.3-3.6-79.3-115 53.3 3-114-141-79 130 40.4 2.3L79.5 362l62.8-4.9L55.5 485l60.9 4L7.5 650l436.5.5z'/%3E%3Cpath fill-opacity='0.53' fill='%232a1f14' d='m116.4 489-14.9 22 238.4-7.5L116.4 489zM301.2 344.6l-158.9 12.5 171.9 5.9-13-18.4zM168.9 220.3l-9.7 15.4 109-9.7-99.3-5.7z'/%3E%3C/g%3E%3Cg id='xl'%3E%3Cuse href='%23t' transform='translate(227 650) scale(1.1) translate(-227 -650)'/%3E%3C/g%3E%3Cg id='lg'%3E%3Cuse href='%23t' transform='translate(227 650) scale(.9) translate(-227 -650)'/%3E%3C/g%3E%3Cg id='md'%3E%3Cuse href='%23t' transform='translate(227 650) scale(.8) translate(-227 -650)'/%3E%3C/g%3E%3Cg id='sm'%3E%3Cuse href='%23t' transform='translate(227 650) scale(.7) translate(-227 -650)'/%3E%3C/g%3E%3Cg id='xs'%3E%3Cuse href='%23t' transform='translate(227 650) scale(.6) translate(-227 -650)'/%3E%3C/g%3E%3C/defs%3E%3Cg transform='translate(0 632)'%3E%3Cg transform='scale(0.7)' style='transform-origin:50%25 50%25'%3E%3Cg fill='%238a9976'%3E%3Cuse href='%23xs' x='-470'/%3E%3Cuse href='%23sm' x='-50'/%3E%3Cuse href='%23md' x='450'/%3E%3Cuse href='%23xs' x='850'/%3E%3Cuse href='%23sm' x='1200'/%3E%3Cuse href='%23xs' x='1680'/%3E%3C/g%3E%3Cg fill='%235d7349'%3E%3Cuse href='%23lg' x='160'/%3E%3Cuse href='%23t' x='650'/%3E%3Cuse href='%23md' x='1050'/%3E%3Cuse href='%23sm' x='1500'/%3E%3Cuse href='%23md' x='2110'/%3E%3C/g%3E%3Cg fill='%233d5230'%3E%3Cuse href='%23t' x='-270'/%3E%3Cuse href='%23xl' x='300'/%3E%3Cuse href='%23t' x='850'/%3E%3Cuse href='%23lg' x='1350'/%3E%3Cuse href='%23xl' x='1900'/%3E%3C/g%3E%3C/g%3E%3Cpath fill='%233d2e1f' d='M0 649s352-49 667-49 347 50 666 50 667-50 667-50v900H0V649Z'/%3E%3C/g%3E%3C/svg%3E");
  background-size: cover;
  background-position: bottom center;
  background-repeat: no-repeat;
  background-attachment: fixed;
  opacity: ${opacity};
  z-index: -1;
  pointer-events: none;
}`
}

function generateSeasonalCSS(seasonal: NonNullable<ThemeEffects['seasonalDecorations']>): string {
  const blocks: string[] = []

  if (seasonal.frostEdge) {
    blocks.push(`
/* Premium Effect: Frost Edge */
.themegpt-frost {
  position: absolute;
  inset: 0;
  pointer-events: none;
  box-shadow: inset 0 0 100px 20px rgba(200,220,255,0.15);
  border-radius: 0;
}`)
  }

  if (seasonal.candyCaneFrame) {
    blocks.push(`
/* Premium Effect: Candy Cane Frame */
.themegpt-candy-frame {
  position: absolute;
  inset: 0;
  pointer-events: none;
  border: 10px solid transparent;
  background: repeating-linear-gradient(-45deg, #fff 0 5px, #dc2626 5px 10px);
  -webkit-mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
  mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  opacity: 0.6;
}`)
  }

  if (seasonal.sparkleOverlay) {
    let sparklesCSS = ''
    for (let i = 0; i < 20; i++) {
      const left = Math.random() * 100
      const top = Math.random() * 100
      const delay = Math.random() * 4
      const size = 2 + Math.random() * 4
      sparklesCSS += `.themegpt-sparkle-${i}{left:${left}%;top:${top}%;animation-delay:${delay.toFixed(2)}s;width:${size}px;height:${size}px;}`
    }

    const sparkleColor = seasonal.sparkleColor || 'white'
    const isRedSparkle = sparkleColor !== 'white'
    const shadowColor = isRedSparkle ? 'rgba(220,38,38,0.6)' : 'white'

    blocks.push(`
/* Premium Effect: Festive Sparkles */
.themegpt-sparkle {
  position: absolute;
  background: ${sparkleColor};
  clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
  animation: themegpt-sparkle 3s ease-in-out infinite;
  filter: drop-shadow(0 0 3px ${shadowColor});
}
${sparklesCSS}
@media (prefers-reduced-motion: reduce) { .themegpt-sparkle { animation: none; opacity: 0.4; } }`)
  }

  if (seasonal.frostedGlass) {
    blocks.push(`
/* Premium Effect: Frosted Window */
.themegpt-frost-vignette {
  position: absolute;
  inset: 0;
  pointer-events: none;
  box-shadow:
    inset 0 0 80px 30px rgba(220,235,255,0.6),
    inset 0 0 150px 60px rgba(200,220,245,0.35),
    inset 0 0 200px 80px rgba(180,210,240,0.15);
}
.themegpt-condensation {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 180px;
  pointer-events: none;
  background:
    radial-gradient(ellipse 8px 12px at 8% 75%, rgba(150,180,220,0.7) 0%, rgba(130,165,210,0.3) 50%, transparent 100%),
    radial-gradient(ellipse 10px 14px at 25% 85%, rgba(160,190,230,0.65) 0%, rgba(140,175,220,0.25) 45%, transparent 100%),
    radial-gradient(ellipse 7px 10px at 42% 70%, rgba(155,185,225,0.6) 0%, rgba(135,170,215,0.2) 50%, transparent 100%),
    radial-gradient(ellipse 12px 16px at 60% 82%, rgba(165,195,235,0.7) 0%, rgba(145,180,225,0.3) 40%, transparent 100%),
    radial-gradient(ellipse 6px 9px at 75% 90%, rgba(150,180,220,0.55) 0%, rgba(130,165,210,0.2) 55%, transparent 100%),
    radial-gradient(ellipse 9px 13px at 90% 78%, rgba(158,188,228,0.6) 0%, rgba(138,173,218,0.25) 50%, transparent 100%),
    radial-gradient(ellipse 3px 50px at 8% 100%, rgba(140,175,215,0.5) 0%, transparent 100%),
    radial-gradient(ellipse 3px 65px at 25% 100%, rgba(145,180,220,0.45) 0%, transparent 100%),
    radial-gradient(ellipse 2px 40px at 42% 100%, rgba(135,170,210,0.4) 0%, transparent 100%),
    radial-gradient(ellipse 4px 80px at 60% 100%, rgba(150,185,225,0.5) 0%, transparent 100%),
    radial-gradient(ellipse 2px 35px at 75% 100%, rgba(138,173,213,0.35) 0%, transparent 100%),
    radial-gradient(ellipse 3px 55px at 90% 100%, rgba(142,177,217,0.45) 0%, transparent 100%);
}`)
  }

  if (seasonal.ribbonBow) {
    const ribbonColor = seasonal.ribbonColor || '#FFFFFF'
    blocks.push(`
/* Premium Effect: Gift Ribbon with Bow */
.themegpt-ribbon-vertical {
  position: fixed;
  left: 260px;
  top: 0;
  bottom: 0;
  width: 24px;
  pointer-events: none;
  z-index: ${Z_INDEX.UI_HIGH};
  background: linear-gradient(90deg,
    transparent 0%,
    ${ribbonColor}15 10%,
    ${ribbonColor}40 25%,
    ${ribbonColor}60 50%,
    ${ribbonColor}40 75%,
    ${ribbonColor}15 90%,
    transparent 100%);
  box-shadow: 0 0 8px ${ribbonColor}30;
}
.themegpt-bow {
  position: fixed;
  left: 236px;
  top: 80px;
  width: 72px;
  height: 48px;
  pointer-events: none;
  z-index: ${Z_INDEX.UI_RIBBON};
}
.themegpt-bow::before,
.themegpt-bow::after {
  content: '';
  position: absolute;
  width: 28px;
  height: 20px;
  border-radius: 50% 50% 50% 50%;
  background: linear-gradient(135deg, ${ribbonColor}90 0%, ${ribbonColor}60 100%);
  box-shadow: 0 2px 4px rgba(0,0,0,0.15);
}
.themegpt-bow::before { left: 4px; top: 14px; transform: rotate(-25deg); }
.themegpt-bow::after { right: 4px; top: 14px; transform: rotate(25deg); }
.themegpt-bow-knot {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 16px;
  height: 14px;
  background: ${ribbonColor};
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}
.themegpt-bow-tail-left,
.themegpt-bow-tail-right {
  position: absolute;
  top: 32px;
  width: 10px;
  height: 30px;
  background: linear-gradient(180deg, ${ribbonColor}80 0%, ${ribbonColor}50 100%);
  border-radius: 0 0 4px 4px;
}
.themegpt-bow-tail-left { left: 24px; transform: rotate(-8deg); }
.themegpt-bow-tail-right { right: 24px; transform: rotate(8deg); }`)
  }

  return blocks.join('\n')
}

// ============================================================================
// MAIN EFFECTS GENERATOR
// ============================================================================

/**
 * Generate CSS for all premium animated effects
 * Uses focused sub-generators for maintainability
 */
export function generateEffectsCSS(effects: ThemeEffects, accentColor: string): string {
  const cssBlocks: string[] = []

  // Effects layer base
  cssBlocks.push(`.themegpt-effects-layer { position: fixed; inset: 0; pointer-events: none; z-index: ${Z_INDEX.EFFECTS_BASE}; overflow: hidden; }`)

  if (effects.animatedSnowfall?.enabled) {
    cssBlocks.push(generateSnowfallCSS(effects.animatedSnowfall))
  }

  if (effects.twinklingStars?.enabled) {
    cssBlocks.push(generateStarsCSS(effects.twinklingStars, accentColor))
  }

  if (effects.treeSilhouettes?.enabled) {
    cssBlocks.push(generateTreesCSS(effects.treeSilhouettes))
  }

  if (effects.forestBackground?.enabled) {
    cssBlocks.push(generateForestBackgroundCSS(effects.forestBackground))
  }

  if (effects.auroraGradient?.enabled) {
    cssBlocks.push(generateAuroraCSS(effects.auroraGradient))
  }

  if (effects.ambientEffects) {
    cssBlocks.push(generateAmbientCSS(effects.ambientEffects, accentColor))
  }

  if (effects.seasonalDecorations) {
    cssBlocks.push(generateSeasonalCSS(effects.seasonalDecorations))
  }

  return cssBlocks.join('\n')
}
