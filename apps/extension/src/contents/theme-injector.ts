import type { PlasmoCSConfig } from "plasmo"
import { Storage } from "@plasmohq/storage"
import { DEFAULT_THEMES, type Theme, type ThemePattern, type ThemeEffects } from "@themegpt/shared"

export const config: PlasmoCSConfig = {
  matches: ["https://chat.openai.com/*", "https://chatgpt.com/*"],
  run_at: "document_start"
}

const storage = new Storage({ area: "local" })
let styleElement: HTMLStyleElement | null = null

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

/**
 * Generate CSS for background patterns
 */
function generatePatternCSS(pattern: ThemePattern, accentColor: string): string {
  const color = pattern.color || accentColor
  const opacity = pattern.opacity
  const size = pattern.size || 1

  switch (pattern.type) {
    case 'dots':
      // Polka dot pattern - size controls both dot diameter and spacing
      const dotRadius = Math.max(2, Math.round(2.5 * size))
      const dotSpacing = Math.round(25 * size)
      // Offset pattern to avoid alignment with UI elements like sidebar ribbon
      const dotOffset = Math.round(dotSpacing / 3)
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
  z-index: -1;
  background-image: radial-gradient(${color} ${dotRadius}px, transparent ${dotRadius}px);
  background-size: ${dotSpacing}px ${dotSpacing}px;
  background-position: ${dotOffset}px ${dotOffset}px;
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
  z-index: -1;
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
  z-index: -1;
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
  z-index: -1;
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
  z-index: -1;
  background-image: url('data:image/svg+xml;base64,${encodedSvg}');
  background-repeat: repeat;
  opacity: ${opacity * 3};
}`

    case 'giftwrap':
      // Gift wrapping paper pattern with polka dots and diagonal ribbons
      return `
/* Pattern: Gift Wrap */
body::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: -1;
  background-image:
    /* Polka dots */
    radial-gradient(${color} 3px, transparent 3px),
    radial-gradient(${color} 2px, transparent 2px),
    /* Diagonal ribbon lines */
    repeating-linear-gradient(45deg, transparent, transparent 60px, ${color}33 60px, ${color}33 62px),
    repeating-linear-gradient(-45deg, transparent, transparent 60px, ${color}22 60px, ${color}22 62px);
  background-size:
    ${40 * size}px ${40 * size}px,
    ${25 * size}px ${25 * size}px,
    100% 100%,
    100% 100%;
  background-position:
    0 0,
    ${12 * size}px ${12 * size}px,
    0 0,
    0 0;
  opacity: ${opacity};
}`

    case 'christmastrees':
      // Christmas tree pattern using SVG for crisp tree shapes
      const treeSize = Math.round(60 * size)
      const treeSpacing = Math.round(100 * size)
      const treeSvg = `<svg xmlns='http://www.w3.org/2000/svg' width='${treeSpacing}' height='${treeSpacing}' viewBox='0 0 100 100'>
        <polygon points='50,8 35,35 42,35 30,55 38,55 22,80 78,80 62,55 70,55 58,35 65,35' fill='${color}' opacity='0.9'/>
        <rect x='45' y='80' width='10' height='12' fill='${color}' opacity='0.7'/>
        <circle cx='50' cy='15' r='3' fill='${color}' opacity='0.6'/>
        <circle cx='20' cy='20' r='1.5' fill='${color}' opacity='0.4'/>
        <circle cx='80' cy='30' r='1.5' fill='${color}' opacity='0.4'/>
        <circle cx='15' cy='70' r='1.5' fill='${color}' opacity='0.4'/>
        <circle cx='85' cy='85' r='1.5' fill='${color}' opacity='0.4'/>
      </svg>`
      const treeEncoded = btoa(treeSvg)
      return `
/* Pattern: Christmas Trees */
body::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: -1;
  background-image: url('data:image/svg+xml;base64,${treeEncoded}');
  background-size: ${treeSpacing}px ${treeSpacing}px;
  background-position: ${Math.round(treeSpacing / 4)}px ${Math.round(treeSpacing / 4)}px;
  opacity: ${opacity};
}`

    case 'peppermints':
      // Peppermint candy pattern using SVG for swirl design
      const mintSpacing = Math.round(80 * size)
      const mintRadius = Math.round(25 * size)
      // Create peppermint with red swirls on white background
      const mintSvg = `<svg xmlns='http://www.w3.org/2000/svg' width='${mintSpacing}' height='${mintSpacing}' viewBox='0 0 80 80'>
        <defs>
          <clipPath id='mintClip'>
            <circle cx='40' cy='40' r='22'/>
          </clipPath>
        </defs>
        <circle cx='40' cy='40' r='24' fill='#FFFFFF' opacity='0.95'/>
        <g clip-path='url(#mintClip)'>
          <path d='M40,18 L40,62 L52,62 L52,18 Z' fill='${color}' opacity='0.9'/>
          <path d='M40,18 L28,18 L28,62 L40,62 Z' fill='${color}' opacity='0.9' transform='rotate(60,40,40)'/>
          <path d='M40,18 L28,18 L28,62 L40,62 Z' fill='${color}' opacity='0.9' transform='rotate(120,40,40)'/>
          <path d='M40,18 L52,18 L52,62 L40,62 Z' fill='${color}' opacity='0.9' transform='rotate(180,40,40)'/>
          <path d='M40,18 L52,18 L52,62 L40,62 Z' fill='${color}' opacity='0.9' transform='rotate(240,40,40)'/>
          <path d='M40,18 L52,18 L52,62 L40,62 Z' fill='${color}' opacity='0.9' transform='rotate(300,40,40)'/>
        </g>
        <circle cx='40' cy='40' r='22' fill='none' stroke='#FFFFFF' stroke-width='2' opacity='0.5'/>
      </svg>`
      const mintEncoded = btoa(mintSvg)
      return `
/* Pattern: Peppermints */
body::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: -1;
  background-image: url('data:image/svg+xml;base64,${mintEncoded}');
  background-size: ${mintSpacing}px ${mintSpacing}px;
  background-position: ${Math.round(mintSpacing / 4)}px ${Math.round(mintSpacing / 4)}px;
  opacity: ${opacity};
}`

    case 'christmaswrap':
      // Christmas tree wrapping paper pattern using pure CSS conic gradients
      // Source: css-pattern.com/christmas-tree/
      const s = Math.round(132 * size)
      const c1 = '#ffffff'
      const c2 = '#a31e39'
      const c3 = '#31570e'
      return `
/* Pattern: Christmas Tree Wrap */
body::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: -1;
  --s: ${s}px;
  --c1: ${c1};
  --c2: ${c2};
  --c3: ${c3};
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

    default:
      return ''
  }
}

/**
 * Generate CSS for premium noise overlay texture
 * Uses SVG feTurbulence for subtle tactile quality
 */
function generateNoiseOverlayCSS(): string {
  return `
/* Premium: Subtle Noise Texture Overlay */
body::after {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 1;
  opacity: 0.035;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}`
}

/**
 * Generate CSS for ambient radial glow overlay
 * Creates atmospheric depth using accent color
 */
function generateGlowOverlayCSS(accentColor: string): string {
  return `
/* Premium: Ambient Radial Glow Overlay */
body::after {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 1;
  opacity: 0.08;
  background-image:
    radial-gradient(ellipse 80% 50% at 50% 0%, ${accentColor} 0%, transparent 50%),
    radial-gradient(ellipse 60% 40% at 20% 100%, ${accentColor} 0%, transparent 40%);
}`
}

/**
 * Generate CSS for premium animated effects
 * Creates immersive visual experiences for premium themes
 */
function generateEffectsCSS(effects: ThemeEffects, accentColor: string): string {
  const cssBlocks: string[] = []

  // Animated snowfall effect - supports three styles: gentle, shaking, gradient
  if (effects.animatedSnowfall?.enabled) {
    const snow = effects.animatedSnowfall
    const style = snow.style || 'gentle'
    const count = snow.density === 'heavy' ? 40 : snow.density === 'medium' ? 25 : 12
    const duration = snow.speed === 'fast' ? 8 : snow.speed === 'medium' ? 12 : 18
    const snowColor = snow.snowColor || 'white'

    // Effects layer base styles
    cssBlocks.push(`.themegpt-effects-layer { position: fixed; inset: 0; pointer-events: none; z-index: 0; overflow: hidden; }`)

    if (style === 'gradient') {
      // Pattern 3: Pure CSS radial gradient snowfall (no DOM elements needed)
      // Single element with 30 radial-gradient snowflakes, animated background position
      cssBlocks.push(`
/* Premium Effect: Gradient Snowfall - Pure CSS */
.themegpt-snow-gradient {
  position: fixed;
  top: -600px;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: -1;
  background-image: radial-gradient(5px 5px at 34px 172px, ${snowColor} 50%, transparent 50%), radial-gradient(4px 4px at 86px 25px, ${snowColor} 50%, transparent 50%), radial-gradient(5px 5px at 388px 47px, ${snowColor} 50%, transparent 50%), radial-gradient(3px 3px at 53px 303px, ${snowColor} 50%, transparent 50%), radial-gradient(4px 4px at 373px 475px, ${snowColor} 50%, transparent 50%), radial-gradient(4px 4px at 196px 261px, ${snowColor} 50%, transparent 50%), radial-gradient(5px 5px at 434px 424px, ${snowColor} 50%, transparent 50%), radial-gradient(4px 4px at 234px 213px, ${snowColor} 50%, transparent 50%), radial-gradient(4px 4px at 393px 356px, ${snowColor} 50%, transparent 50%), radial-gradient(3px 3px at 537px 497px, ${snowColor} 50%, transparent 50%), radial-gradient(3px 3px at 151px 362px, ${snowColor} 50%, transparent 50%), radial-gradient(6px 6px at 110px 99px, ${snowColor} 50%, transparent 50%), radial-gradient(3px 3px at 270px 111px, ${snowColor} 50%, transparent 50%), radial-gradient(3px 3px at 351px 424px, ${snowColor} 50%, transparent 50%), radial-gradient(5px 5px at 459px 279px, ${snowColor} 50%, transparent 50%), radial-gradient(4px 4px at 584px 126px, ${snowColor} 50%, transparent 50%), radial-gradient(6px 6px at 303px 486px, ${snowColor} 50%, transparent 50%), radial-gradient(3px 3px at 132px 292px, ${snowColor} 50%, transparent 50%), radial-gradient(3px 3px at 120px 162px, ${snowColor} 50%, transparent 50%), radial-gradient(5px 5px at 396px 460px, ${snowColor} 50%, transparent 50%), radial-gradient(5px 5px at 169px 508px, ${snowColor} 50%, transparent 50%), radial-gradient(3px 3px at 177px 298px, ${snowColor} 50%, transparent 50%), radial-gradient(4px 4px at 575px 410px, ${snowColor} 50%, transparent 50%), radial-gradient(6px 6px at 29px 140px, ${snowColor} 50%, transparent 50%), radial-gradient(3px 3px at 82px 378px, ${snowColor} 50%, transparent 50%), radial-gradient(4px 4px at 482px 473px, ${snowColor} 50%, transparent 50%), radial-gradient(6px 6px at 56px 24px, ${snowColor} 50%, transparent 50%), radial-gradient(3px 3px at 157px 73px, ${snowColor} 50%, transparent 50%), radial-gradient(6px 6px at 97px 496px, ${snowColor} 50%, transparent 50%), radial-gradient(6px 6px at 240px 225px, ${snowColor} 50%, transparent 50%);
  background-size: 600px 600px;
  animation: themegpt-snow-gradient ${duration}s linear infinite;
  opacity: 0.7;
}
@keyframes themegpt-snow-gradient {
  0% { background-position: 0px 0px; }
  100% { background-position: 500px 1000px; }
}
@media (prefers-reduced-motion: reduce) { .themegpt-snow-gradient { animation: none; } }`)
    } else if (style === 'shaking') {
      // Pattern 2: CSSnowflakes - exact implementation from pajasevi.github.io/CSSnowflakes
      // 12 snowflakes with staggered positions, vertical descent + 80px horizontal shake
      cssBlocks.push(`
/* Premium Effect: Shaking Snowfall - CSSnowflakes */
.themegpt-snowflake {
  color: ${snowColor};
  font-size: 1em;
  font-family: Arial, sans-serif;
  text-shadow: 0 0 5px #000;
}
@-webkit-keyframes themegpt-snowflakes-fall {
  0% { top: -10%; }
  100% { top: 100%; }
}
@-webkit-keyframes themegpt-snowflakes-shake {
  0%, 100% { -webkit-transform: translateX(0); transform: translateX(0); }
  50% { -webkit-transform: translateX(80px); transform: translateX(80px); }
}
@keyframes themegpt-snowflakes-fall {
  0% { top: -10%; }
  100% { top: 100%; }
}
@keyframes themegpt-snowflakes-shake {
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(80px); }
}
.themegpt-snowflake {
  position: fixed;
  top: -10%;
  z-index: 9999;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  cursor: default;
  -webkit-animation-name: themegpt-snowflakes-fall, themegpt-snowflakes-shake;
  -webkit-animation-duration: 10s, 3s;
  -webkit-animation-timing-function: linear, ease-in-out;
  -webkit-animation-iteration-count: infinite, infinite;
  -webkit-animation-play-state: running, running;
  animation-name: themegpt-snowflakes-fall, themegpt-snowflakes-shake;
  animation-duration: 10s, 3s;
  animation-timing-function: linear, ease-in-out;
  animation-iteration-count: infinite, infinite;
  animation-play-state: running, running;
}
.themegpt-snow-0 { left: 1%; -webkit-animation-delay: 0s, 0s; animation-delay: 0s, 0s; }
.themegpt-snow-1 { left: 10%; -webkit-animation-delay: 1s, 1s; animation-delay: 1s, 1s; }
.themegpt-snow-2 { left: 20%; -webkit-animation-delay: 6s, 0.5s; animation-delay: 6s, 0.5s; }
.themegpt-snow-3 { left: 30%; -webkit-animation-delay: 4s, 2s; animation-delay: 4s, 2s; }
.themegpt-snow-4 { left: 40%; -webkit-animation-delay: 2s, 2s; animation-delay: 2s, 2s; }
.themegpt-snow-5 { left: 50%; -webkit-animation-delay: 8s, 3s; animation-delay: 8s, 3s; }
.themegpt-snow-6 { left: 60%; -webkit-animation-delay: 6s, 2s; animation-delay: 6s, 2s; }
.themegpt-snow-7 { left: 70%; -webkit-animation-delay: 2.5s, 1s; animation-delay: 2.5s, 1s; }
.themegpt-snow-8 { left: 80%; -webkit-animation-delay: 1s, 0s; animation-delay: 1s, 0s; }
.themegpt-snow-9 { left: 90%; -webkit-animation-delay: 3s, 1.5s; animation-delay: 3s, 1.5s; }
.themegpt-snow-10 { left: 25%; -webkit-animation-delay: 2s, 0s; animation-delay: 2s, 0s; }
.themegpt-snow-11 { left: 65%; -webkit-animation-delay: 4s, 2.5s; animation-delay: 4s, 2.5s; }
@media (prefers-reduced-motion: reduce) { .themegpt-snowflake { animation: none; opacity: 0.3; } }`)
    } else {
      // Pattern 1 (gentle): Elegant falling snowflakes with cross pattern and rotation
      // Based on CodePen by mark_sottek - converted from SCSS to dynamic CSS
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
      cssBlocks.push(`
/* Premium Effect: Gentle Snowfall - Cross-pattern flakes with rotation */
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
  z-index: -1;
  pointer-events: none;
}
${snowflakesCSS}
@media (prefers-reduced-motion: reduce) { .themegpt-snowflake { animation: none; opacity: 0.3; } }`)
    }
  }

  // Twinkling stars effect
  if (effects.twinklingStars?.enabled) {
    const stars = effects.twinklingStars
    const count = stars.count === 'dense' ? 50 : stars.count === 'medium' ? 30 : 15
    const starColor = stars.starColor || accentColor
    const baseDuration = stars.animationDuration || 3

    let starsCSS = ''
    for (let i = 0; i < count; i++) {
      const left = Math.random() * 100
      const top = Math.random() * 70
      // Highly varied delays to desynchronize stars (spread across 5x base duration)
      const delay = Math.random() * (baseDuration * 5)
      const size = 1 + Math.random() * 2.5
      // Wide duration variation (50%-150% of base) for organic feel
      const durationVariation = baseDuration * (0.5 + Math.random())
      // Vary the peak brightness per star
      const peakOpacity = 0.6 + Math.random() * 0.4
      starsCSS += `.themegpt-star-${i}{left:${left}%;top:${top}%;animation-delay:${delay.toFixed(2)}s;animation-duration:${durationVariation.toFixed(2)}s;width:${size.toFixed(1)}px;height:${size.toFixed(1)}px;--peak-opacity:${peakOpacity.toFixed(2)};}`
    }

    cssBlocks.push(`
/* Premium Effect: Twinkling Stars - Organic variation */
@keyframes themegpt-twinkle {
  0%, 100% { opacity: 0.15; transform: scale(0.7); }
  50% { opacity: var(--peak-opacity, 0.8); transform: scale(1.1); }
}
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
@keyframes themegpt-shooting {
  0% { transform: translateX(0) translateY(0); opacity: 1; }
  100% { transform: translateX(150px) translateY(100px); opacity: 0; }
}
.themegpt-shooting-star {
  position: absolute;
  width: 2px;
  height: 2px;
  background: linear-gradient(90deg, white, transparent);
  animation: themegpt-shooting 2s ease-out infinite;
}
.themegpt-shooting-star-1 { top: 15%; left: 20%; animation-delay: 3s; }
.themegpt-shooting-star-2 { top: 25%; left: 60%; animation-delay: 7s; }` : ''}
@media (prefers-reduced-motion: reduce) { .themegpt-star { animation: none; opacity: 0.6; } }`)
  }

  // Tree silhouettes effect
  if (effects.treeSilhouettes?.enabled) {
    const trees = effects.treeSilhouettes
    const count = trees.density === 'forest' ? 8 : trees.density === 'moderate' ? 5 : 3
    const isChristmas = trees.style === 'christmas'
    const withOrnaments = trees.withOrnaments || isChristmas

    let treesCSS = ''
    for (let i = 0; i < count; i++) {
      const left = (i / count) * 80 + Math.random() * 15
      const height = isChristmas ? 90 + Math.random() * 50 : 60 + Math.random() * 80
      const width = height * (isChristmas ? 0.5 : 0.6)
      // Christmas trees: subtle background silhouettes with depth variation
      const opacity = isChristmas ? 0.12 + (i / count) * 0.18 : 0.15 + (i / count) * 0.25
      treesCSS += `.themegpt-tree-${i}{left:${left}%;height:${height}px;width:${width}px;opacity:${opacity};}`
    }

    if (isChristmas) {
      // Refined pine silhouettes - subtle background atmosphere
      cssBlocks.push(`
/* Premium Effect: Refined Pine Silhouettes */
.themegpt-tree {
  position: absolute;
  bottom: 0;
  z-index: 1;
}
/* Elegant layered pine shape */
.themegpt-tree::before {
  content: '';
  position: absolute;
  bottom: 8%;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  height: 92%;
  background: rgba(0, 0, 0, 0.7);
  clip-path: polygon(
    50% 0%,
    47% 12%, 35% 18%, 44% 20%,
    30% 32%, 42% 34%,
    22% 48%, 38% 50%,
    12% 68%, 35% 70%,
    5% 88%, 32% 88%,
    25% 100%, 75% 100%,
    68% 88%, 95% 88%,
    65% 70%, 88% 68%,
    62% 50%, 78% 48%,
    58% 34%, 70% 32%,
    56% 20%, 65% 18%, 53% 12%
  );
}
/* Subtle trunk */
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
${treesCSS}`)
    } else {
      // Forest pine silhouettes with branch-like edges
      const pineClipPath = trees.style === 'pine' || trees.style === 'mixed'
        ? 'polygon(50% 0%, 45% 15%, 30% 15%, 40% 30%, 20% 30%, 35% 45%, 10% 45%, 30% 60%, 5% 60%, 25% 75%, 0% 80%, 40% 100%, 60% 100%, 100% 80%, 75% 75%, 95% 60%, 70% 60%, 90% 45%, 65% 45%, 80% 30%, 60% 30%, 70% 15%, 55% 15%)'
        : 'polygon(50% 0%, 0% 100%, 100% 100%)'

      cssBlocks.push(`
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
${treesCSS}`)
    }
  }

  // Aurora gradient effect - morphing blob animation (based on baunov/gradients-bg)
  if (effects.auroraGradient?.enabled) {
    const aurora = effects.auroraGradient
    const speed = aurora.speed === 'fast' ? 15 : aurora.speed === 'medium' ? 25 : 40
    // Reduced intensity values to prevent excessive brightness
    const intensity = aurora.intensity === 'vivid' ? 0.6 : aurora.intensity === 'medium' ? 0.45 : 0.3

    // Color palettes for different aurora styles
    const palettes: Record<string, string[]> = {
      arctic: ['18, 180, 200', '80, 220, 230', '0, 150, 180', '100, 200, 220', '40, 190, 200'],
      northern: ['0, 229, 204', '80, 222, 234', '0, 150, 136', '128, 222, 234', '0, 188, 212'],
      cosmic: ['138, 43, 226', '75, 0, 130', '148, 0, 211', '186, 85, 211', '123, 104, 238'],
      custom: aurora.customColors || ['0, 229, 204', '80, 222, 234', '0, 150, 136', '128, 222, 234', '0, 188, 212']
    }
    const colors = palettes[aurora.palette || 'northern']

    cssBlocks.push(`
/* Premium Effect: Aurora Gradient - Morphing Blobs */
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

/* Wrapper provides isolation so blur doesn't affect page content */
.themegpt-aurora-wrapper {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  isolation: isolate;
  overflow: hidden;
}

/* Background layer that receives the blur effect */
.themegpt-aurora-container {
  position: absolute;
  inset: 0;
  filter: url(#themegpt-goo) blur(40px);
  contain: strict;
}

/* Interactive overlay ensures content remains crisp and readable */
.themegpt-aurora-interactive {
  position: absolute;
  inset: 0;
  z-index: 1;
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
}`)
  }

  // Ambient effects
  if (effects.ambientEffects?.fogRising) {
    cssBlocks.push(`
/* Premium Effect: Rising Fog */
@keyframes themegpt-fog {
  0%, 100% { transform: translateY(0); opacity: 0.4; }
  50% { transform: translateY(-20px); opacity: 0.6; }
}
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

  if (effects.ambientEffects?.neonGrid) {
    cssBlocks.push(`
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

  if (effects.ambientEffects?.auroraWaves) {
    cssBlocks.push(`
/* Premium Effect: Aurora Waves */
@keyframes themegpt-aurora {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}
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

  if (effects.ambientEffects?.candleGlow) {
    cssBlocks.push(`
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

  // Seasonal decorations
  if (effects.seasonalDecorations?.frostEdge) {
    cssBlocks.push(`
/* Premium Effect: Frost Edge */
.themegpt-frost {
  position: absolute;
  inset: 0;
  pointer-events: none;
  box-shadow: inset 0 0 100px 20px rgba(200,220,255,0.15);
  border-radius: 0;
}`)
  }

  if (effects.seasonalDecorations?.candyCaneFrame) {
    cssBlocks.push(`
/* Premium Effect: Candy Cane Frame - Static */
.themegpt-candy-frame {
  position: absolute;
  inset: 0;
  pointer-events: none;
  border: 10px solid transparent;
  background: repeating-linear-gradient(
    -45deg,
    #fff 0 5px,
    #dc2626 5px 10px
  );
  -webkit-mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
  mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  opacity: 0.6;
}`)
  }

  if (effects.seasonalDecorations?.sparkleOverlay) {
    // Generate sparkle positions
    let sparklesCSS = ''
    for (let i = 0; i < 20; i++) {
      const left = Math.random() * 100
      const top = Math.random() * 100
      const delay = Math.random() * 4
      const size = 2 + Math.random() * 4
      sparklesCSS += `.themegpt-sparkle-${i}{left:${left}%;top:${top}%;animation-delay:${delay.toFixed(2)}s;width:${size}px;height:${size}px;}`
    }

    // Use red sparkles for light backgrounds (candy cane theme), white for dark
    const sparkleColor = effects.seasonalDecorations.sparkleColor || 'white'
    const isRedSparkle = sparkleColor !== 'white'
    const shadowColor = isRedSparkle ? 'rgba(220,38,38,0.6)' : 'white'

    cssBlocks.push(`
/* Premium Effect: Festive Sparkles */
@keyframes themegpt-sparkle {
  0%, 100% { opacity: 0; transform: scale(0) rotate(0deg); }
  50% { opacity: 1; transform: scale(1) rotate(180deg); }
}
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

  if (effects.seasonalDecorations?.frostedGlass) {
    cssBlocks.push(`
/* Premium Effect: Frosted Window - Simplified for clarity */
/* Heavy frost vignette creeping from edges */
.themegpt-frost-vignette {
  position: absolute;
  inset: 0;
  pointer-events: none;
  box-shadow:
    /* Outer frost ring - prominent white frost */
    inset 0 0 80px 30px rgba(220,235,255,0.6),
    inset 0 0 150px 60px rgba(200,220,245,0.35),
    /* Subtle inner glow */
    inset 0 0 200px 80px rgba(180,210,240,0.15);
}
/* Condensation water droplets - the recognizable "frosted window" element */
.themegpt-condensation {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 180px;
  pointer-events: none;
  background:
    /* Large prominent droplets */
    radial-gradient(ellipse 8px 12px at 8% 75%, rgba(150,180,220,0.7) 0%, rgba(130,165,210,0.3) 50%, transparent 100%),
    radial-gradient(ellipse 10px 14px at 25% 85%, rgba(160,190,230,0.65) 0%, rgba(140,175,220,0.25) 45%, transparent 100%),
    radial-gradient(ellipse 7px 10px at 42% 70%, rgba(155,185,225,0.6) 0%, rgba(135,170,215,0.2) 50%, transparent 100%),
    radial-gradient(ellipse 12px 16px at 60% 82%, rgba(165,195,235,0.7) 0%, rgba(145,180,225,0.3) 40%, transparent 100%),
    radial-gradient(ellipse 6px 9px at 75% 90%, rgba(150,180,220,0.55) 0%, rgba(130,165,210,0.2) 55%, transparent 100%),
    radial-gradient(ellipse 9px 13px at 90% 78%, rgba(158,188,228,0.6) 0%, rgba(138,173,218,0.25) 50%, transparent 100%),
    /* Water trails running down */
    radial-gradient(ellipse 3px 50px at 8% 100%, rgba(140,175,215,0.5) 0%, transparent 100%),
    radial-gradient(ellipse 3px 65px at 25% 100%, rgba(145,180,220,0.45) 0%, transparent 100%),
    radial-gradient(ellipse 2px 40px at 42% 100%, rgba(135,170,210,0.4) 0%, transparent 100%),
    radial-gradient(ellipse 4px 80px at 60% 100%, rgba(150,185,225,0.5) 0%, transparent 100%),
    radial-gradient(ellipse 2px 35px at 75% 100%, rgba(138,173,213,0.35) 0%, transparent 100%),
    radial-gradient(ellipse 3px 55px at 90% 100%, rgba(142,177,217,0.45) 0%, transparent 100%);
}`)
  }

  if (effects.seasonalDecorations?.ribbonBow) {
    const ribbonColor = effects.seasonalDecorations.ribbonColor || '#FFFFFF'
    cssBlocks.push(`
/* Premium Effect: Gift Ribbon with Bow */
.themegpt-ribbon-vertical {
  position: fixed;
  left: 260px;
  top: 0;
  bottom: 0;
  width: 24px;
  pointer-events: none;
  z-index: 5;
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
  z-index: 6;
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
.themegpt-bow::before {
  left: 4px;
  top: 14px;
  transform: rotate(-25deg);
}
.themegpt-bow::after {
  right: 4px;
  top: 14px;
  transform: rotate(25deg);
}
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
.themegpt-bow-tail-left {
  left: 24px;
  transform: rotate(-8deg);
}
.themegpt-bow-tail-right {
  right: 24px;
  transform: rotate(8deg);
}`)
  }

  return cssBlocks.join('\n')
}

/**
 * Create effects layer DOM elements
 */
function createEffectsElements(effects: ThemeEffects): void {
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
}

function applyTheme(theme: Theme | null): void {
  if (!theme || !theme.colors) {
    removeTheme()
    return
  }

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
  const effects = currentDef?.effects ?? theme.effects
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
  // Remove effects layer
  const effectsLayer = document.getElementById('themegpt-effects')
  if (effectsLayer) effectsLayer.remove()
}

async function init(): Promise<void> {
  if (!isContextValid()) return

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
  } catch {
    // Context invalidated during storage operations
  }
}

if (isContextValid()) {
  init()
}
