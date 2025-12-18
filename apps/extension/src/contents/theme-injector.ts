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
  z-index: 0;
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

  // Animated snowfall effect
  if (effects.animatedSnowfall?.enabled) {
    const snow = effects.animatedSnowfall
    const count = snow.density === 'heavy' ? 40 : snow.density === 'medium' ? 25 : 12
    const duration = snow.speed === 'fast' ? 8 : snow.speed === 'medium' ? 12 : 18

    let snowflakesCSS = ''
    for (let i = 0; i < count; i++) {
      const left = Math.random() * 100
      const delay = Math.random() * duration
      const size = 2 + Math.random() * 4
      const drift = -15 + Math.random() * 30
      snowflakesCSS += `.themegpt-snow-${i}{left:${left}%;animation-delay:${delay}s;width:${size}px;height:${size}px;--drift:${drift}px;}`
    }

    cssBlocks.push(`
/* Premium Effect: Animated Snowfall */
@keyframes themegpt-snowfall {
  0% { transform: translateY(-10px) translateX(0); opacity: 0; }
  10% { opacity: 0.9; }
  90% { opacity: 0.9; }
  100% { transform: translateY(100vh) translateX(var(--drift, 20px)); opacity: 0; }
}
.themegpt-effects-layer { position: fixed; inset: 0; pointer-events: none; z-index: 2; overflow: hidden; }
.themegpt-snowflake {
  position: absolute;
  top: -10px;
  background: white;
  border-radius: 50%;
  animation: themegpt-snowfall ${duration}s linear infinite;
  box-shadow: 0 0 3px rgba(255,255,255,0.5);
}
${snowflakesCSS}
@media (prefers-reduced-motion: reduce) { .themegpt-snowflake { animation: none; opacity: 0.3; } }`)
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
      // More varied delays for less repetitive appearance
      const delay = Math.random() * (baseDuration * 3)
      const size = 1 + Math.random() * 3
      // Individual duration variation (±30% of base)
      const durationVariation = baseDuration * (0.7 + Math.random() * 0.6)
      starsCSS += `.themegpt-star-${i}{left:${left}%;top:${top}%;animation-delay:${delay.toFixed(2)}s;animation-duration:${durationVariation.toFixed(2)}s;width:${size}px;height:${size}px;}`
    }

    cssBlocks.push(`
/* Premium Effect: Twinkling Stars */
@keyframes themegpt-twinkle {
  0%, 100% { opacity: 0.3; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1.2); }
}
.themegpt-star {
  position: absolute;
  background: ${starColor};
  border-radius: 50%;
  animation: themegpt-twinkle ${baseDuration}s ease-in-out infinite;
  box-shadow: 0 0 4px ${starColor};
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
      const height = isChristmas ? 80 + Math.random() * 60 : 60 + Math.random() * 80
      const width = height * (isChristmas ? 0.7 : 0.6)
      const opacity = isChristmas ? 0.85 : 0.15 + (i / count) * 0.25
      treesCSS += `.themegpt-tree-${i}{left:${left}%;height:${height}px;width:${width}px;opacity:${opacity};}`
    }

    if (isChristmas) {
      // Decorated Christmas tree with layered triangles, star, and ornaments
      cssBlocks.push(`
/* Premium Effect: Decorated Christmas Trees */
@keyframes themegpt-ornament-glow {
  0%, 100% { opacity: 0.4; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1.1); }
}
.themegpt-tree {
  position: absolute;
  bottom: 0;
}
/* Three layered triangles for tree tiers */
.themegpt-tree::before {
  content: '';
  position: absolute;
  bottom: 12%;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  height: 90%;
  background: #1B5E20;
  clip-path: polygon(50% 0%, 5% 35%, 15% 35%, 0% 65%, 20% 65%, 0% 100%, 100% 100%, 80% 65%, 100% 65%, 85% 35%, 95% 35%);
}
/* Trunk */
.themegpt-tree::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 18%;
  height: 15%;
  background: #5D4037;
  border-radius: 0 0 3px 3px;
}
/* Star on top */
.themegpt-tree-star {
  position: absolute;
  top: -5%;
  left: 50%;
  transform: translateX(-50%);
  width: 15%;
  aspect-ratio: 1;
  background: #FFD700;
  clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
  filter: drop-shadow(0 0 4px #FFD700);
}
/* Ornament lights */
.themegpt-ornament {
  position: absolute;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  animation: themegpt-ornament-glow 2s ease-in-out infinite;
  box-shadow: 0 0 4px currentColor;
}
${treesCSS}
@media (prefers-reduced-motion: reduce) { .themegpt-ornament { animation: none; opacity: 0.7; } }`)
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
/* Premium Effect: Candy Cane Frame */
.themegpt-candy-frame {
  position: absolute;
  inset: 0;
  border: 8px solid transparent;
  border-image: repeating-linear-gradient(-45deg, #fff 0 5px, #dc2626 5px 10px) 8;
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

    cssBlocks.push(`
/* Premium Effect: Festive Sparkles */
@keyframes themegpt-sparkle {
  0%, 100% { opacity: 0; transform: scale(0) rotate(0deg); }
  50% { opacity: 1; transform: scale(1) rotate(180deg); }
}
.themegpt-sparkle {
  position: absolute;
  background: white;
  clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
  animation: themegpt-sparkle 3s ease-in-out infinite;
  filter: drop-shadow(0 0 2px white);
}
${sparklesCSS}
@media (prefers-reduced-motion: reduce) { .themegpt-sparkle { animation: none; opacity: 0.4; } }`)
  }

  if (effects.seasonalDecorations?.frostedGlass) {
    cssBlocks.push(`
/* Premium Effect: Frosted Glass Window Pane */
.themegpt-frosted-glass {
  position: absolute;
  inset: 0;
  pointer-events: none;
  /* Frosted edge border with blur effect */
  box-shadow:
    inset 0 0 60px 15px rgba(220,235,255,0.4),
    inset 0 0 120px 30px rgba(200,220,250,0.2);
}
/* Ice crystal patterns at edges */
.themegpt-ice-crystals {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    /* Top left corner frost */
    radial-gradient(ellipse 25% 20% at 5% 5%, rgba(255,255,255,0.6) 0%, transparent 70%),
    /* Top right corner frost */
    radial-gradient(ellipse 20% 25% at 95% 8%, rgba(255,255,255,0.5) 0%, transparent 65%),
    /* Bottom left corner frost */
    radial-gradient(ellipse 22% 18% at 8% 92%, rgba(255,255,255,0.55) 0%, transparent 60%),
    /* Bottom right corner frost */
    radial-gradient(ellipse 18% 22% at 92% 95%, rgba(255,255,255,0.5) 0%, transparent 65%),
    /* Edge frost lines */
    linear-gradient(90deg, rgba(255,255,255,0.3) 0%, transparent 10%, transparent 90%, rgba(255,255,255,0.3) 100%),
    linear-gradient(180deg, rgba(255,255,255,0.25) 0%, transparent 8%, transparent 92%, rgba(255,255,255,0.25) 100%);
}
/* Condensation drips at bottom */
.themegpt-condensation {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 80px;
  pointer-events: none;
  background:
    radial-gradient(ellipse 3px 20px at 15% 100%, rgba(200,220,250,0.4) 0%, transparent 100%),
    radial-gradient(ellipse 2px 15px at 25% 100%, rgba(200,220,250,0.3) 0%, transparent 100%),
    radial-gradient(ellipse 4px 25px at 45% 100%, rgba(200,220,250,0.35) 0%, transparent 100%),
    radial-gradient(ellipse 2px 18px at 65% 100%, rgba(200,220,250,0.3) 0%, transparent 100%),
    radial-gradient(ellipse 3px 22px at 85% 100%, rgba(200,220,250,0.4) 0%, transparent 100%);
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

  // Add snowflakes
  if (effects.animatedSnowfall?.enabled) {
    const count = effects.animatedSnowfall.density === 'heavy' ? 40 :
                  effects.animatedSnowfall.density === 'medium' ? 25 : 12
    for (let i = 0; i < count; i++) {
      const flake = document.createElement('div')
      flake.className = `themegpt-snowflake themegpt-snow-${i}`
      container.appendChild(flake)
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

      // Add star on top for Christmas trees
      if (isChristmas) {
        const star = document.createElement('div')
        star.className = 'themegpt-tree-star'
        tree.appendChild(star)

        // Add ornament lights
        if (withOrnaments) {
          const ornamentColors = ['#DC2626', '#FFD700', '#3B82F6', '#22C55E']
          const ornamentPositions = [
            { top: '30%', left: '35%' },
            { top: '35%', left: '60%' },
            { top: '50%', left: '25%' },
            { top: '55%', left: '70%' },
            { top: '70%', left: '40%' },
            { top: '75%', left: '58%' },
          ]
          ornamentPositions.forEach((pos, idx) => {
            const ornament = document.createElement('div')
            ornament.className = 'themegpt-ornament'
            ornament.style.top = pos.top
            ornament.style.left = pos.left
            ornament.style.color = ornamentColors[idx % ornamentColors.length]
            ornament.style.background = ornamentColors[idx % ornamentColors.length]
            ornament.style.animationDelay = `${idx * 0.3}s`
            tree.appendChild(ornament)
          })
        }
      }

      container.appendChild(tree)
    }
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
    const frosted = document.createElement('div')
    frosted.className = 'themegpt-frosted-glass'
    container.appendChild(frosted)

    const crystals = document.createElement('div')
    crystals.className = 'themegpt-ice-crystals'
    container.appendChild(crystals)

    const condensation = document.createElement('div')
    condensation.className = 'themegpt-condensation'
    container.appendChild(condensation)
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
