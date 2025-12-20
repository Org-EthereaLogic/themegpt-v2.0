# ThemeGPT Themes Reference

Complete reference documentation for all ThemeGPT themes, including color variables, effects, and configuration details.

**Last Updated:** 2025-12-20
**Total Themes:** 28 (9 Free, 19 Premium)

## Table of Contents

- [Theme Architecture](#theme-architecture)
- [Color Variables](#color-variables)
- [Effect Types](#effect-types)
- [Free Themes](#free-themes)
- [Premium Themes](#premium-themes)
  - [Christmas Collection](#christmas-collection)
  - [Core Premium Collection](#core-premium-collection)

---

## Theme Architecture

Each theme is defined with the following structure:

```typescript
interface Theme {
  id: string;              // Unique identifier (kebab-case)
  name: string;            // Display name
  category: 'christmas' | 'core' | 'premium';
  colors: ThemeColors;     // CSS custom properties
  isPremium: boolean;      // Requires license
  pattern?: ThemePattern;  // Optional background pattern
  noiseOverlay?: boolean;  // Subtle texture overlay
  glowOverlay?: boolean;   // Ambient radial glow
  effects?: ThemeEffects;  // Animated visual effects
}
```

---

## Color Variables

All themes define six CSS custom properties:

| Variable | Purpose |
|----------|---------|
| `--cgpt-bg` | Primary background color |
| `--cgpt-surface` | Card/panel surface color |
| `--cgpt-text` | Primary text color |
| `--cgpt-text-muted` | Secondary/muted text color |
| `--cgpt-border` | Border color |
| `--cgpt-accent` | Accent/highlight color |

---

## Effect Types

### Aurora Gradient
Animated morphing gradient blobs with blur effect.

```typescript
interface AuroraGradient {
  enabled: boolean;
  palette?: 'arctic' | 'northern' | 'cosmic' | 'custom';
  speed?: 'slow' | 'medium' | 'fast';
  intensity?: 'subtle' | 'medium' | 'vivid';  // 0.3 | 0.45 | 0.6 opacity
  customColors?: string[];  // RGB values like '255, 107, 74'
}
```

**Palettes:**
- `northern`: Teal/cyan aurora colors (0, 229, 204), (80, 222, 234), (0, 150, 136), (128, 222, 234), (0, 188, 212)
- `cosmic`: Purple/violet colors (138, 43, 226), (75, 0, 130), (148, 0, 211), (186, 85, 211), (123, 104, 238)
- `arctic`: Ice blue colors (18, 180, 200), (80, 220, 230), (0, 150, 180), (100, 200, 220), (40, 190, 200)
- `custom`: User-defined RGB array

### Animated Snowfall
Falling snow particles with various styles.

```typescript
interface AnimatedSnowfall {
  enabled: boolean;
  density: 'light' | 'medium' | 'heavy';
  speed: 'slow' | 'medium' | 'fast';
  snowColor?: string;  // For light backgrounds
  style?: 'gentle' | 'shaking' | 'gradient';
}
```

### Twinkling Stars
Animated star field with optional shooting stars.

```typescript
interface TwinklingStars {
  enabled: boolean;
  count: 'sparse' | 'medium' | 'dense';
  includeShootingStars?: boolean;
  starColor?: string;
  animationDuration?: number;  // Base twinkle duration in seconds
}
```

### Tree Silhouettes
Forest silhouette overlays.

```typescript
interface TreeSilhouettes {
  enabled: boolean;
  style: 'pine' | 'bare' | 'mixed' | 'christmas';
  density: 'few' | 'moderate' | 'forest';
  withOrnaments?: boolean;  // Twinkling lights on trees
}
```

### Ambient Effects

```typescript
interface AmbientEffects {
  fogRising?: boolean;
  firefliesOrParticles?: boolean;
  auroraWaves?: boolean;
  neonGrid?: boolean;
  candleGlow?: boolean;
}
```

### Seasonal Decorations

```typescript
interface SeasonalDecorations {
  candlesticks?: boolean;
  ornaments?: boolean;
  candyCaneFrame?: boolean;
  frostEdge?: boolean;
  sparkleOverlay?: boolean;
  sparkleColor?: string;
  frostedGlass?: boolean;
  ribbonBow?: boolean;
  ribbonColor?: string;
}
```

### Pattern Types

```typescript
type PatternType = 'dots' | 'grid' | 'snowflakes' | 'stars' | 'noise' |
                   'giftwrap' | 'christmastrees' | 'peppermints' | 'christmaswrap';

interface ThemePattern {
  type: PatternType;
  opacity: number;  // 0.01-0.15 for subtlety
  color?: string;
  size?: number;
}
```

---

## Free Themes

### VS Code Dark+

| Property | Value |
|----------|-------|
| **ID** | `vscode-dark-plus` |
| **Category** | core |
| **Premium** | No |

**Colors:**
| Variable | Hex | Preview |
|----------|-----|---------|
| `--cgpt-bg` | `#1E1E1E` | ![#1E1E1E](https://via.placeholder.com/20/1E1E1E/1E1E1E) |
| `--cgpt-surface` | `#252526` | ![#252526](https://via.placeholder.com/20/252526/252526) |
| `--cgpt-text` | `#D4D4D4` | ![#D4D4D4](https://via.placeholder.com/20/D4D4D4/D4D4D4) |
| `--cgpt-text-muted` | `#808080` | ![#808080](https://via.placeholder.com/20/808080/808080) |
| `--cgpt-border` | `#3C3C3C` | ![#3C3C3C](https://via.placeholder.com/20/3C3C3C/3C3C3C) |
| `--cgpt-accent` | `#569CD6` | ![#569CD6](https://via.placeholder.com/20/569CD6/569CD6) |

**Effects:** `noiseOverlay: true`

---

### Solarized Dark

| Property | Value |
|----------|-------|
| **ID** | `solarized-dark` |
| **Category** | core |
| **Premium** | No |

**Colors:**
| Variable | Hex | Preview |
|----------|-----|---------|
| `--cgpt-bg` | `#002B36` | ![#002B36](https://via.placeholder.com/20/002B36/002B36) |
| `--cgpt-surface` | `#073642` | ![#073642](https://via.placeholder.com/20/073642/073642) |
| `--cgpt-text` | `#839496` | ![#839496](https://via.placeholder.com/20/839496/839496) |
| `--cgpt-text-muted` | `#657B83` | ![#657B83](https://via.placeholder.com/20/657B83/657B83) |
| `--cgpt-border` | `#094959` | ![#094959](https://via.placeholder.com/20/094959/094959) |
| `--cgpt-accent` | `#2AA198` | ![#2AA198](https://via.placeholder.com/20/2AA198/2AA198) |

**Effects:** `noiseOverlay: true`

---

### Dracula

| Property | Value |
|----------|-------|
| **ID** | `dracula` |
| **Category** | core |
| **Premium** | No |

**Colors:**
| Variable | Hex | Preview |
|----------|-----|---------|
| `--cgpt-bg` | `#282A36` | ![#282A36](https://via.placeholder.com/20/282A36/282A36) |
| `--cgpt-surface` | `#343746` | ![#343746](https://via.placeholder.com/20/343746/343746) |
| `--cgpt-text` | `#F8F8F2` | ![#F8F8F2](https://via.placeholder.com/20/F8F8F2/F8F8F2) |
| `--cgpt-text-muted` | `#6272A4` | ![#6272A4](https://via.placeholder.com/20/6272A4/6272A4) |
| `--cgpt-border` | `#44475A` | ![#44475A](https://via.placeholder.com/20/44475A/44475A) |
| `--cgpt-accent` | `#BD93F9` | ![#BD93F9](https://via.placeholder.com/20/BD93F9/BD93F9) |

**Effects:** `glowOverlay: true`

---

### Monokai Pro

| Property | Value |
|----------|-------|
| **ID** | `monokai-pro` |
| **Category** | core |
| **Premium** | No |

**Colors:**
| Variable | Hex | Preview |
|----------|-----|---------|
| `--cgpt-bg` | `#2D2A2E` | ![#2D2A2E](https://via.placeholder.com/20/2D2A2E/2D2A2E) |
| `--cgpt-surface` | `#403E41` | ![#403E41](https://via.placeholder.com/20/403E41/403E41) |
| `--cgpt-text` | `#FCFCFA` | ![#FCFCFA](https://via.placeholder.com/20/FCFCFA/FCFCFA) |
| `--cgpt-text-muted` | `#939293` | ![#939293](https://via.placeholder.com/20/939293/939293) |
| `--cgpt-border` | `#49474A` | ![#49474A](https://via.placeholder.com/20/49474A/49474A) |
| `--cgpt-accent` | `#FFD866` | ![#FFD866](https://via.placeholder.com/20/FFD866/FFD866) |

**Effects:** `noiseOverlay: true`

---

### High Contrast

| Property | Value |
|----------|-------|
| **ID** | `high-contrast` |
| **Category** | core |
| **Premium** | No |

**Colors:**
| Variable | Hex | Preview |
|----------|-----|---------|
| `--cgpt-bg` | `#000000` | ![#000000](https://via.placeholder.com/20/000000/000000) |
| `--cgpt-surface` | `#1A1A1A` | ![#1A1A1A](https://via.placeholder.com/20/1A1A1A/1A1A1A) |
| `--cgpt-text` | `#FFFFFF` | ![#FFFFFF](https://via.placeholder.com/20/FFFFFF/FFFFFF) |
| `--cgpt-text-muted` | `#CCCCCC` | ![#CCCCCC](https://via.placeholder.com/20/CCCCCC/CCCCCC) |
| `--cgpt-border` | `#FFFFFF` | ![#FFFFFF](https://via.placeholder.com/20/FFFFFF/FFFFFF) |
| `--cgpt-accent` | `#FFD700` | ![#FFD700](https://via.placeholder.com/20/FFD700/FFD700) |

**Effects:** None (accessibility-focused theme)

**Special Styling:** Uses `.high-contrast` class for enhanced visibility with white borders and highlighted sidebar items.

---

### One Dark

| Property | Value |
|----------|-------|
| **ID** | `one-dark` |
| **Category** | core |
| **Premium** | No |

**Colors:**
| Variable | Hex | Preview |
|----------|-----|---------|
| `--cgpt-bg` | `#282C34` | ![#282C34](https://via.placeholder.com/20/282C34/282C34) |
| `--cgpt-surface` | `#21252B` | ![#21252B](https://via.placeholder.com/20/21252B/21252B) |
| `--cgpt-text` | `#ABB2BF` | ![#ABB2BF](https://via.placeholder.com/20/ABB2BF/ABB2BF) |
| `--cgpt-text-muted` | `#5C6370` | ![#5C6370](https://via.placeholder.com/20/5C6370/5C6370) |
| `--cgpt-border` | `#3E4451` | ![#3E4451](https://via.placeholder.com/20/3E4451/3E4451) |
| `--cgpt-accent` | `#61AFEF` | ![#61AFEF](https://via.placeholder.com/20/61AFEF/61AFEF) |

**Effects:** `glowOverlay: true`

---

### Aurora Borealis

| Property | Value |
|----------|-------|
| **ID** | `aurora-borealis` |
| **Category** | core |
| **Premium** | No |

**Colors:**
| Variable | Hex | Preview |
|----------|-----|---------|
| `--cgpt-bg` | `#0A1628` | ![#0A1628](https://via.placeholder.com/20/0A1628/0A1628) |
| `--cgpt-surface` | `#0F2137` | ![#0F2137](https://via.placeholder.com/20/0F2137/0F2137) |
| `--cgpt-text` | `#E0F7FA` | ![#E0F7FA](https://via.placeholder.com/20/E0F7FA/E0F7FA) |
| `--cgpt-text-muted` | `#80DEEA` | ![#80DEEA](https://via.placeholder.com/20/80DEEA/80DEEA) |
| `--cgpt-border` | `#164E63` | ![#164E63](https://via.placeholder.com/20/164E63/164E63) |
| `--cgpt-accent` | `#00E5CC` | ![#00E5CC](https://via.placeholder.com/20/00E5CC/00E5CC) |

**Effects:**
```typescript
auroraGradient: {
  enabled: true,
  palette: 'northern',
  speed: 'slow',
  intensity: 'medium'  // 0.45 opacity
}
```

**Technical Details:**
- Uses 5 animated gradient blobs with `mix-blend-mode: hard-light`
- Wrapper uses `isolation: isolate` to prevent blur bleeding
- Container uses `contain: strict` and `blur(40px)` filter
- SVG goo filter for blob merging effect

---

### Sunset Blaze

| Property | Value |
|----------|-------|
| **ID** | `sunset-blaze` |
| **Category** | core |
| **Premium** | No |

**Colors:**
| Variable | Hex | Preview |
|----------|-----|---------|
| `--cgpt-bg` | `#1A0A14` | ![#1A0A14](https://via.placeholder.com/20/1A0A14/1A0A14) |
| `--cgpt-surface` | `#2D1220` | ![#2D1220](https://via.placeholder.com/20/2D1220/2D1220) |
| `--cgpt-text` | `#FFF5F0` | ![#FFF5F0](https://via.placeholder.com/20/FFF5F0/FFF5F0) |
| `--cgpt-text-muted` | `#FFAB91` | ![#FFAB91](https://via.placeholder.com/20/FFAB91/FFAB91) |
| `--cgpt-border` | `#4A1A2E` | ![#4A1A2E](https://via.placeholder.com/20/4A1A2E/4A1A2E) |
| `--cgpt-accent` | `#FF6B4A` | ![#FF6B4A](https://via.placeholder.com/20/FF6B4A/FF6B4A) |

**Effects:**
```typescript
glowOverlay: true,
auroraGradient: {
  enabled: true,
  palette: 'custom',
  speed: 'slow',
  intensity: 'subtle',  // 0.3 opacity
  customColors: [
    '255, 107, 74',   // Coral orange
    '255, 152, 67',   // Tangerine
    '255, 87, 51',    // Red-orange
    '255, 171, 145',  // Peach
    '230, 74, 25'     // Deep orange
  ]
}
```

---

### Electric Dreams

| Property | Value |
|----------|-------|
| **ID** | `electric-dreams` |
| **Category** | core |
| **Premium** | No |

**Colors:**
| Variable | Hex | Preview |
|----------|-----|---------|
| `--cgpt-bg` | `#0D0221` | ![#0D0221](https://via.placeholder.com/20/0D0221/0D0221) |
| `--cgpt-surface` | `#150634` | ![#150634](https://via.placeholder.com/20/150634/150634) |
| `--cgpt-text` | `#F5E6FF` | ![#F5E6FF](https://via.placeholder.com/20/F5E6FF/F5E6FF) |
| `--cgpt-text-muted` | `#D4AAFF` | ![#D4AAFF](https://via.placeholder.com/20/D4AAFF/D4AAFF) |
| `--cgpt-border` | `#3D1A6D` | ![#3D1A6D](https://via.placeholder.com/20/3D1A6D/3D1A6D) |
| `--cgpt-accent` | `#FF2E97` | ![#FF2E97](https://via.placeholder.com/20/FF2E97/FF2E97) |

**Effects:**
```typescript
glowOverlay: true,
auroraGradient: {
  enabled: true,
  palette: 'cosmic',
  speed: 'slow',
  intensity: 'subtle'  // 0.3 opacity
}
```

**Technical Details:**
- Cosmic palette uses purple/violet colors: BlueViolet, Indigo, DarkViolet, MediumOrchid, MediumSlateBlue
- Combined with hot pink accent for cyberpunk aesthetic

---

## Premium Themes

### Christmas Collection

#### Cozy Cabin Christmas

| Property | Value |
|----------|-------|
| **ID** | `cozy-cabin-christmas` |
| **Category** | christmas |
| **Premium** | Yes |

**Colors:**
| Variable | Hex | Preview |
|----------|-----|---------|
| `--cgpt-bg` | `#140E0A` | ![#140E0A](https://via.placeholder.com/20/140E0A/140E0A) |
| `--cgpt-surface` | `#1E1410` | ![#1E1410](https://via.placeholder.com/20/1E1410/1E1410) |
| `--cgpt-text` | `#F9FAFB` | ![#F9FAFB](https://via.placeholder.com/20/F9FAFB/F9FAFB) |
| `--cgpt-text-muted` | `#E5E7EB` | ![#E5E7EB](https://via.placeholder.com/20/E5E7EB/E5E7EB) |
| `--cgpt-border` | `#4B2E23` | ![#4B2E23](https://via.placeholder.com/20/4B2E23/4B2E23) |
| `--cgpt-accent` | `#D97757` | ![#D97757](https://via.placeholder.com/20/D97757/D97757) |

**Effects:**
```typescript
noiseOverlay: true,
treeSilhouettes: { enabled: true, style: 'christmas', density: 'few', withOrnaments: true },
animatedSnowfall: { enabled: true, density: 'light', speed: 'slow', style: 'gentle' }
```

---

#### Frosted Windowpane

| Property | Value |
|----------|-------|
| **ID** | `frosted-windowpane` |
| **Category** | christmas |
| **Premium** | Yes |

**Colors:**
| Variable | Hex | Preview |
|----------|-----|---------|
| `--cgpt-bg` | `#F5F7FB` | ![#F5F7FB](https://via.placeholder.com/20/F5F7FB/F5F7FB) |
| `--cgpt-surface` | `#FFFFFF` | ![#FFFFFF](https://via.placeholder.com/20/FFFFFF/FFFFFF) |
| `--cgpt-text` | `#0F172A` | ![#0F172A](https://via.placeholder.com/20/0F172A/0F172A) |
| `--cgpt-text-muted` | `#4B5563` | ![#4B5563](https://via.placeholder.com/20/4B5563/4B5563) |
| `--cgpt-border` | `#D1D5DB` | ![#D1D5DB](https://via.placeholder.com/20/D1D5DB/D1D5DB) |
| `--cgpt-accent` | `#3B82F6` | ![#3B82F6](https://via.placeholder.com/20/3B82F6/3B82F6) |

**Effects:**
```typescript
animatedSnowfall: { enabled: true, density: 'medium', speed: 'slow', snowColor: '#B8D4E8', style: 'gradient' },
seasonalDecorations: { frostedGlass: true }
```

---

#### Midnight Evergreen

| Property | Value |
|----------|-------|
| **ID** | `midnight-evergreen` |
| **Category** | christmas |
| **Premium** | Yes |

**Colors:**
| Variable | Hex | Preview |
|----------|-----|---------|
| `--cgpt-bg` | `#020817` | ![#020817](https://via.placeholder.com/20/020817/020817) |
| `--cgpt-surface` | `#07120E` | ![#07120E](https://via.placeholder.com/20/07120E/07120E) |
| `--cgpt-text` | `#F9FAFB` | ![#F9FAFB](https://via.placeholder.com/20/F9FAFB/F9FAFB) |
| `--cgpt-text-muted` | `#E5E7EB` | ![#E5E7EB](https://via.placeholder.com/20/E5E7EB/E5E7EB) |
| `--cgpt-border` | `#14532D` | ![#14532D](https://via.placeholder.com/20/14532D/14532D) |
| `--cgpt-accent` | `#22C55E` | ![#22C55E](https://via.placeholder.com/20/22C55E/22C55E) |

**Effects:**
```typescript
noiseOverlay: true,
treeSilhouettes: { enabled: true, style: 'pine', density: 'forest' },
twinklingStars: { enabled: true, count: 'medium', starColor: '#FFFFFF' },
ambientEffects: { fogRising: true }
```

---

#### Candy Cane Chat

| Property | Value |
|----------|-------|
| **ID** | `candy-cane-chat` |
| **Category** | christmas |
| **Premium** | Yes |

**Colors:**
| Variable | Hex | Preview |
|----------|-----|---------|
| `--cgpt-bg` | `#FDF2F2` | ![#FDF2F2](https://via.placeholder.com/20/FDF2F2/FDF2F2) |
| `--cgpt-surface` | `#FFFFFF` | ![#FFFFFF](https://via.placeholder.com/20/FFFFFF/FFFFFF) |
| `--cgpt-text` | `#111827` | ![#111827](https://via.placeholder.com/20/111827/111827) |
| `--cgpt-text-muted` | `#4B5563` | ![#4B5563](https://via.placeholder.com/20/4B5563/4B5563) |
| `--cgpt-border` | `#FECACA` | ![#FECACA](https://via.placeholder.com/20/FECACA/FECACA) |
| `--cgpt-accent` | `#DC2626` | ![#DC2626](https://via.placeholder.com/20/DC2626/DC2626) |

**Effects:**
```typescript
noiseOverlay: true,
seasonalDecorations: { candyCaneFrame: true, sparkleOverlay: true, sparkleColor: '#dc2626' }
```

---

#### Silent Night (Starfield)

| Property | Value |
|----------|-------|
| **ID** | `silent-night-starfield` |
| **Category** | christmas |
| **Premium** | Yes |

**Colors:**
| Variable | Hex | Preview |
|----------|-----|---------|
| `--cgpt-bg` | `#020617` | ![#020617](https://via.placeholder.com/20/020617/020617) |
| `--cgpt-surface` | `#02081C` | ![#02081C](https://via.placeholder.com/20/02081C/02081C) |
| `--cgpt-text` | `#F9FAFB` | ![#F9FAFB](https://via.placeholder.com/20/F9FAFB/F9FAFB) |
| `--cgpt-text-muted` | `#CBD5F5` | ![#CBD5F5](https://via.placeholder.com/20/CBD5F5/CBD5F5) |
| `--cgpt-border` | `#1D4ED8` | ![#1D4ED8](https://via.placeholder.com/20/1D4ED8/1D4ED8) |
| `--cgpt-accent` | `#38BDF8` | ![#38BDF8](https://via.placeholder.com/20/38BDF8/38BDF8) |

**Effects:**
```typescript
glowOverlay: true,
twinklingStars: { enabled: true, count: 'dense', includeShootingStars: true, starColor: '#FFFFFF', animationDuration: 8 },
ambientEffects: { auroraWaves: true }
```

---

#### Purple Twilight

| Property | Value |
|----------|-------|
| **ID** | `purple-twilight` |
| **Category** | christmas |
| **Premium** | Yes |

**Colors:**
| Variable | Hex | Preview |
|----------|-----|---------|
| `--cgpt-bg` | `#0B0712` | ![#0B0712](https://via.placeholder.com/20/0B0712/0B0712) |
| `--cgpt-surface` | `#141021` | ![#141021](https://via.placeholder.com/20/141021/141021) |
| `--cgpt-text` | `#F9FAFB` | ![#F9FAFB](https://via.placeholder.com/20/F9FAFB/F9FAFB) |
| `--cgpt-text-muted` | `#E5E7EB` | ![#E5E7EB](https://via.placeholder.com/20/E5E7EB/E5E7EB) |
| `--cgpt-border` | `#4C1D95` | ![#4C1D95](https://via.placeholder.com/20/4C1D95/4C1D95) |
| `--cgpt-accent` | `#7C3AED` | ![#7C3AED](https://via.placeholder.com/20/7C3AED/7C3AED) |

**Effects:**
```typescript
noiseOverlay: true,
glowOverlay: true,
twinklingStars: { enabled: true, count: 'sparse', starColor: '#FFFFFF', animationDuration: 10 },
ambientEffects: { candleGlow: true },
seasonalDecorations: { frostEdge: true }
```

---

#### Snowfall Serenity

| Property | Value |
|----------|-------|
| **ID** | `snowfall-serenity` |
| **Category** | christmas |
| **Premium** | Yes |

**Colors:**
| Variable | Hex | Preview |
|----------|-----|---------|
| `--cgpt-bg` | `#0F172A` | ![#0F172A](https://via.placeholder.com/20/0F172A/0F172A) |
| `--cgpt-surface` | `#1E293B` | ![#1E293B](https://via.placeholder.com/20/1E293B/1E293B) |
| `--cgpt-text` | `#F1F5F9` | ![#F1F5F9](https://via.placeholder.com/20/F1F5F9/F1F5F9) |
| `--cgpt-text-muted` | `#94A3B8` | ![#94A3B8](https://via.placeholder.com/20/94A3B8/94A3B8) |
| `--cgpt-border` | `#334155` | ![#334155](https://via.placeholder.com/20/334155/334155) |
| `--cgpt-accent` | `#38BDF8` | ![#38BDF8](https://via.placeholder.com/20/38BDF8/38BDF8) |

**Effects:**
```typescript
noiseOverlay: true,
glowOverlay: true,
pattern: { type: 'snowflakes', opacity: 0.04, size: 1.2 },
animatedSnowfall: { enabled: true, density: 'medium', speed: 'slow', style: 'gentle' },
twinklingStars: { enabled: true, count: 'sparse', starColor: '#E0F2FE', animationDuration: 12 },
seasonalDecorations: { frostEdge: true }
```

---

#### Holiday Gift Wrapping

| Property | Value |
|----------|-------|
| **ID** | `holiday-gift-wrapping` |
| **Category** | christmas |
| **Premium** | Yes |

**Colors:**
| Variable | Hex | Preview |
|----------|-----|---------|
| `--cgpt-bg` | `#B83A4B` | ![#B83A4B](https://via.placeholder.com/20/B83A4B/B83A4B) |
| `--cgpt-surface` | `#B83A4B90` | ![#B83A4B](https://via.placeholder.com/20/B83A4B/B83A4B) |
| `--cgpt-text` | `#FFF8F5` | ![#FFF8F5](https://via.placeholder.com/20/FFF8F5/FFF8F5) |
| `--cgpt-text-muted` | `#FFE8E8` | ![#FFE8E8](https://via.placeholder.com/20/FFE8E8/FFE8E8) |
| `--cgpt-border` | `#9A3040` | ![#9A3040](https://via.placeholder.com/20/9A3040/9A3040) |
| `--cgpt-accent` | `#FFF8F5` | ![#FFF8F5](https://via.placeholder.com/20/FFF8F5/FFF8F5) |

**Effects:**
```typescript
pattern: { type: 'dots', opacity: 0.35, color: '#FFF8F5', size: 3 },
seasonalDecorations: { ribbonBow: true, ribbonColor: '#FFF8F5' }
```

---

#### Sage Forest Gift

| Property | Value |
|----------|-------|
| **ID** | `sage-forest-gift` |
| **Category** | christmas |
| **Premium** | Yes |

**Colors:**
| Variable | Hex | Preview |
|----------|-----|---------|
| `--cgpt-bg` | `#9DB4A0` | ![#9DB4A0](https://via.placeholder.com/20/9DB4A0/9DB4A0) |
| `--cgpt-surface` | `#9DB4A090` | ![#9DB4A0](https://via.placeholder.com/20/9DB4A0/9DB4A0) |
| `--cgpt-text` | `#FFFFFF` | ![#FFFFFF](https://via.placeholder.com/20/FFFFFF/FFFFFF) |
| `--cgpt-text-muted` | `#F0F5F0` | ![#F0F5F0](https://via.placeholder.com/20/F0F5F0/F0F5F0) |
| `--cgpt-border` | `#7A9A7E` | ![#7A9A7E](https://via.placeholder.com/20/7A9A7E/7A9A7E) |
| `--cgpt-accent` | `#FFFFFF` | ![#FFFFFF](https://via.placeholder.com/20/FFFFFF/FFFFFF) |

**Effects:**
```typescript
pattern: { type: 'christmastrees', opacity: 0.5, color: '#FFFFFF', size: 1.2 },
seasonalDecorations: { ribbonBow: true, ribbonColor: '#FFFFFF' }
```

---

#### Festive Tree Gift

| Property | Value |
|----------|-------|
| **ID** | `festive-tree-gift` |
| **Category** | christmas |
| **Premium** | Yes |

**Colors:**
| Variable | Hex | Preview |
|----------|-----|---------|
| `--cgpt-bg` | `#a31e39` | ![#a31e39](https://via.placeholder.com/20/a31e39/a31e39) |
| `--cgpt-surface` | `#0A0A0A50` | ![#0A0A0A](https://via.placeholder.com/20/0A0A0A/0A0A0A) |
| `--cgpt-text` | `#FFF8E1` | ![#FFF8E1](https://via.placeholder.com/20/FFF8E1/FFF8E1) |
| `--cgpt-text-muted` | `#D4C8B0` | ![#D4C8B0](https://via.placeholder.com/20/D4C8B0/D4C8B0) |
| `--cgpt-border` | `#FFFFFF30` | ![#FFFFFF](https://via.placeholder.com/20/FFFFFF/FFFFFF) |
| `--cgpt-accent` | `#FFD700` | ![#FFD700](https://via.placeholder.com/20/FFD700/FFD700) |

**Effects:**
```typescript
pattern: { type: 'christmaswrap', opacity: 1, size: 1 }
```

---

#### Gingerbread Warmth

| Property | Value |
|----------|-------|
| **ID** | `gingerbread-warmth` |
| **Category** | christmas |
| **Premium** | Yes |

**Colors:**
| Variable | Hex | Preview |
|----------|-----|---------|
| `--cgpt-bg` | `#1C120D` | ![#1C120D](https://via.placeholder.com/20/1C120D/1C120D) |
| `--cgpt-surface` | `#2A1B14` | ![#2A1B14](https://via.placeholder.com/20/2A1B14/2A1B14) |
| `--cgpt-text` | `#FFF8E1` | ![#FFF8E1](https://via.placeholder.com/20/FFF8E1/FFF8E1) |
| `--cgpt-text-muted` | `#D7CCC8` | ![#D7CCC8](https://via.placeholder.com/20/D7CCC8/D7CCC8) |
| `--cgpt-border` | `#4E342E` | ![#4E342E](https://via.placeholder.com/20/4E342E/4E342E) |
| `--cgpt-accent` | `#FF8A65` | ![#FF8A65](https://via.placeholder.com/20/FF8A65/FF8A65) |

**Effects:**
```typescript
pattern: { type: 'dots', opacity: 0.05, color: '#A1887F', size: 1 }
```

---

#### Winter Wonderland

| Property | Value |
|----------|-------|
| **ID** | `winter-wonderland` |
| **Category** | christmas |
| **Premium** | Yes |

**Colors:**
| Variable | Hex | Preview |
|----------|-----|---------|
| `--cgpt-bg` | `#E3F2FD` | ![#E3F2FD](https://via.placeholder.com/20/E3F2FD/E3F2FD) |
| `--cgpt-surface` | `#FFFFFF` | ![#FFFFFF](https://via.placeholder.com/20/FFFFFF/FFFFFF) |
| `--cgpt-text` | `#0D47A1` | ![#0D47A1](https://via.placeholder.com/20/0D47A1/0D47A1) |
| `--cgpt-text-muted` | `#5472D3` | ![#5472D3](https://via.placeholder.com/20/5472D3/5472D3) |
| `--cgpt-border` | `#BBDEFB` | ![#BBDEFB](https://via.placeholder.com/20/BBDEFB/BBDEFB) |
| `--cgpt-accent` | `#1976D2` | ![#1976D2](https://via.placeholder.com/20/1976D2/1976D2) |

**Effects:**
```typescript
animatedSnowfall: { enabled: true, density: 'heavy', speed: 'medium', style: 'shaking' },
seasonalDecorations: { frostEdge: true }
```

---

#### Starry Christmas Eve

| Property | Value |
|----------|-------|
| **ID** | `starry-christmas-eve` |
| **Category** | christmas |
| **Premium** | Yes |

**Colors:**
| Variable | Hex | Preview |
|----------|-----|---------|
| `--cgpt-bg` | `#0A0A1A` | ![#0A0A1A](https://via.placeholder.com/20/0A0A1A/0A0A1A) |
| `--cgpt-surface` | `#12122A` | ![#12122A](https://via.placeholder.com/20/12122A/12122A) |
| `--cgpt-text` | `#FAFAFA` | ![#FAFAFA](https://via.placeholder.com/20/FAFAFA/FAFAFA) |
| `--cgpt-text-muted` | `#B8B8D1` | ![#B8B8D1](https://via.placeholder.com/20/B8B8D1/B8B8D1) |
| `--cgpt-border` | `#2A2A4A` | ![#2A2A4A](https://via.placeholder.com/20/2A2A4A/2A2A4A) |
| `--cgpt-accent` | `#FFD700` | ![#FFD700](https://via.placeholder.com/20/FFD700/FFD700) |

**Effects:**
```typescript
twinklingStars: { enabled: true, count: 'dense', includeShootingStars: true }
```

---

### Core Premium Collection

#### Synth Wave

| Property | Value |
|----------|-------|
| **ID** | `synth-wave` |
| **Category** | core |
| **Premium** | Yes |

**Colors:**
| Variable | Hex | Preview |
|----------|-----|---------|
| `--cgpt-bg` | `#262335` | ![#262335](https://via.placeholder.com/20/262335/262335) |
| `--cgpt-surface` | `#2E2943` | ![#2E2943](https://via.placeholder.com/20/2E2943/2E2943) |
| `--cgpt-text` | `#F9FAFB` | ![#F9FAFB](https://via.placeholder.com/20/F9FAFB/F9FAFB) |
| `--cgpt-text-muted` | `#C7D2FE` | ![#C7D2FE](https://via.placeholder.com/20/C7D2FE/C7D2FE) |
| `--cgpt-border` | `#433162` | ![#433162](https://via.placeholder.com/20/433162/433162) |
| `--cgpt-accent` | `#FF6AC1` | ![#FF6AC1](https://via.placeholder.com/20/FF6AC1/FF6AC1) |

**Effects:**
```typescript
glowOverlay: true,
ambientEffects: { neonGrid: true }
```

---

#### Apple II Phosphor

| Property | Value |
|----------|-------|
| **ID** | `apple-ii-phosphor` |
| **Category** | core |
| **Premium** | Yes |

**Colors:**
| Variable | Hex | Preview |
|----------|-----|---------|
| `--cgpt-bg` | `#000000` | ![#000000](https://via.placeholder.com/20/000000/000000) |
| `--cgpt-surface` | `#0A120A` | ![#0A120A](https://via.placeholder.com/20/0A120A/0A120A) |
| `--cgpt-text` | `#33FF33` | ![#33FF33](https://via.placeholder.com/20/33FF33/33FF33) |
| `--cgpt-text-muted` | `#22AA22` | ![#22AA22](https://via.placeholder.com/20/22AA22/22AA22) |
| `--cgpt-border` | `#1A3A1A` | ![#1A3A1A](https://via.placeholder.com/20/1A3A1A/1A3A1A) |
| `--cgpt-accent` | `#00FF41` | ![#00FF41](https://via.placeholder.com/20/00FF41/00FF41) |

**Effects:**
```typescript
noiseOverlay: true,
glowOverlay: true
```

---

#### Tomorrow Night Blue

| Property | Value |
|----------|-------|
| **ID** | `tomorrow-night-blue` |
| **Category** | core |
| **Premium** | Yes |

**Colors:**
| Variable | Hex | Preview |
|----------|-----|---------|
| `--cgpt-bg` | `#002451` | ![#002451](https://via.placeholder.com/20/002451/002451) |
| `--cgpt-surface` | `#001C40` | ![#001C40](https://via.placeholder.com/20/001C40/001C40) |
| `--cgpt-text` | `#E0F2FF` | ![#E0F2FF](https://via.placeholder.com/20/E0F2FF/E0F2FF) |
| `--cgpt-text-muted` | `#BFDBFE` | ![#BFDBFE](https://via.placeholder.com/20/BFDBFE/BFDBFE) |
| `--cgpt-border` | `#003566` | ![#003566](https://via.placeholder.com/20/003566/003566) |
| `--cgpt-accent` | `#4FC3F7` | ![#4FC3F7](https://via.placeholder.com/20/4FC3F7/4FC3F7) |

**Effects:**
```typescript
glowOverlay: true,
twinklingStars: { enabled: true, count: 'sparse' }
```

---

#### Shades of Purple

| Property | Value |
|----------|-------|
| **ID** | `shades-of-purple` |
| **Category** | core |
| **Premium** | Yes |

**Colors:**
| Variable | Hex | Preview |
|----------|-----|---------|
| `--cgpt-bg` | `#2D2B56` | ![#2D2B56](https://via.placeholder.com/20/2D2B56/2D2B56) |
| `--cgpt-surface` | `#222244` | ![#222244](https://via.placeholder.com/20/222244/222244) |
| `--cgpt-text` | `#FFFFFF` | ![#FFFFFF](https://via.placeholder.com/20/FFFFFF/FFFFFF) |
| `--cgpt-text-muted` | `#C7D2FE` | ![#C7D2FE](https://via.placeholder.com/20/C7D2FE/C7D2FE) |
| `--cgpt-border` | `#3F3C78` | ![#3F3C78](https://via.placeholder.com/20/3F3C78/3F3C78) |
| `--cgpt-accent` | `#FAD000` | ![#FAD000](https://via.placeholder.com/20/FAD000/FAD000) |

**Effects:** None

---

#### Dark Forest

| Property | Value |
|----------|-------|
| **ID** | `dark-forest` |
| **Category** | core |
| **Premium** | Yes |

**Colors:**
| Variable | Hex | Preview |
|----------|-----|---------|
| `--cgpt-bg` | `#101917` | ![#101917](https://via.placeholder.com/20/101917/101917) |
| `--cgpt-surface` | `#131F1D` | ![#131F1D](https://via.placeholder.com/20/131F1D/131F1D) |
| `--cgpt-text` | `#E5F5F0` | ![#E5F5F0](https://via.placeholder.com/20/E5F5F0/E5F5F0) |
| `--cgpt-text-muted` | `#94A3B8` | ![#94A3B8](https://via.placeholder.com/20/94A3B8/94A3B8) |
| `--cgpt-border` | `#1F2933` | ![#1F2933](https://via.placeholder.com/20/1F2933/1F2933) |
| `--cgpt-accent` | `#22C55E` | ![#22C55E](https://via.placeholder.com/20/22C55E/22C55E) |

**Effects:**
```typescript
noiseOverlay: true,
treeSilhouettes: { enabled: true, style: 'mixed', density: 'moderate' },
ambientEffects: { fogRising: true, firefliesOrParticles: true }
```

---

#### Chocolate Caramel

| Property | Value |
|----------|-------|
| **ID** | `chocolate-caramel` |
| **Category** | core |
| **Premium** | Yes |

**Colors:**
| Variable | Hex | Preview |
|----------|-----|---------|
| `--cgpt-bg` | `#221A0F` | ![#221A0F](https://via.placeholder.com/20/221A0F/221A0F) |
| `--cgpt-surface` | `#362712` | ![#362712](https://via.placeholder.com/20/362712/362712) |
| `--cgpt-text` | `#FDEFD9` | ![#FDEFD9](https://via.placeholder.com/20/FDEFD9/FDEFD9) |
| `--cgpt-text-muted` | `#D1B59A` | ![#D1B59A](https://via.placeholder.com/20/D1B59A/D1B59A) |
| `--cgpt-border` | `#4A3419` | ![#4A3419](https://via.placeholder.com/20/4A3419/4A3419) |
| `--cgpt-accent` | `#FBBF77` | ![#FBBF77](https://via.placeholder.com/20/FBBF77/FBBF77) |

**Effects:**
```typescript
noiseOverlay: true
```

---

## Quick Reference Tables

### All Themes by Category

| Theme | ID | Premium | Key Effects |
|-------|-----|---------|-------------|
| **Free - Core** ||||
| VS Code Dark+ | `vscode-dark-plus` | No | noiseOverlay |
| Solarized Dark | `solarized-dark` | No | noiseOverlay |
| Dracula | `dracula` | No | glowOverlay |
| Monokai Pro | `monokai-pro` | No | noiseOverlay |
| High Contrast | `high-contrast` | No | - |
| One Dark | `one-dark` | No | glowOverlay |
| Aurora Borealis | `aurora-borealis` | No | auroraGradient (northern) |
| Sunset Blaze | `sunset-blaze` | No | auroraGradient (custom), glowOverlay |
| Electric Dreams | `electric-dreams` | No | auroraGradient (cosmic), glowOverlay |
| **Premium - Christmas** ||||
| Cozy Cabin Christmas | `cozy-cabin-christmas` | Yes | treeSilhouettes, animatedSnowfall |
| Frosted Windowpane | `frosted-windowpane` | Yes | animatedSnowfall, frostedGlass |
| Midnight Evergreen | `midnight-evergreen` | Yes | treeSilhouettes, twinklingStars, fog |
| Candy Cane Chat | `candy-cane-chat` | Yes | candyCaneFrame, sparkles |
| Silent Night | `silent-night-starfield` | Yes | twinklingStars, shootingStars, aurora |
| Purple Twilight | `purple-twilight` | Yes | twinklingStars, candleGlow, frostEdge |
| Snowfall Serenity | `snowfall-serenity` | Yes | snowfall, stars, frostEdge |
| Holiday Gift Wrapping | `holiday-gift-wrapping` | Yes | dots pattern, ribbonBow |
| Sage Forest Gift | `sage-forest-gift` | Yes | christmastrees pattern, ribbonBow |
| Festive Tree Gift | `festive-tree-gift` | Yes | christmaswrap pattern |
| Gingerbread Warmth | `gingerbread-warmth` | Yes | dots pattern |
| Winter Wonderland | `winter-wonderland` | Yes | heavy snowfall, frostEdge |
| Starry Christmas Eve | `starry-christmas-eve` | Yes | dense twinklingStars, shootingStars |
| **Premium - Core** ||||
| Synth Wave | `synth-wave` | Yes | neonGrid, glowOverlay |
| Apple II Phosphor | `apple-ii-phosphor` | Yes | noiseOverlay, glowOverlay |
| Tomorrow Night Blue | `tomorrow-night-blue` | Yes | twinklingStars, glowOverlay |
| Shades of Purple | `shades-of-purple` | Yes | - |
| Dark Forest | `dark-forest` | Yes | treeSilhouettes, fog, fireflies |
| Chocolate Caramel | `chocolate-caramel` | Yes | noiseOverlay |

### Themes with Aurora Gradient Effect

| Theme | Palette | Intensity | Custom Colors |
|-------|---------|-----------|---------------|
| Aurora Borealis | northern | medium (0.45) | - |
| Sunset Blaze | custom | subtle (0.3) | Warm sunset oranges |
| Electric Dreams | cosmic | subtle (0.3) | - |

---

## Source Files

- **Theme Definitions:** `packages/shared/src/index.ts`
- **Theme Injector:** `apps/extension/src/contents/theme-injector.ts`
- **Theme Preview Tool:** `apps/extension/tools/theme-preview/index.html`
