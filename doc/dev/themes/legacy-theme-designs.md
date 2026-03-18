# Legacy Theme Enhancement Designs

Modest visual upgrade specifications for all 8 free (legacy) themes.

---

## Enhancement Philosophy

Legacy themes receive subtle polish while maintaining:
- **Simplicity**: No complex visual effects
- **Performance**: No animations (static only)
- **Differentiation**: Clearly distinct from premium themes
- **Minimal footprint**: ≤50 lines of new CSS per theme

---

## Legacy Themes (8 total)

### 1. VS Code Dark+

**ID**: `vscode-dark-plus`
**Current State**: Classic dark IDE colors, no effects
**Target**: Subtle texture polish

**Texture Addition**:
- Faint noise overlay at 0.03 opacity
- Mimics slight screen grain for depth

**New Components**:
1. **Subtle border accent** - 1px darker border on main container edges
2. **Corner radius refinement** - Consistent 4px radius on panels

**Visual Differentiation**:
Premium themes use animated effects; this remains static with minimal texture only.

**Implementation**:
```css
.theme-vscode-dark-plus {
  background-image: url("data:image/svg+xml,..."); /* noise pattern */
  background-blend-mode: overlay;
}
```

**Estimated Lines**: 25
**Differentiation Note**: No glow, no particles, no animation

---

### 2. Solarized Dark

**ID**: `solarized-dark`
**Current State**: Warm dark palette, no effects
**Target**: Subtle grid texture

**Texture Addition**:
- Faint grid pattern at 0.02 opacity
- Complements the structured Solarized aesthetic

**New Components**:
1. **Hairline grid overlay** - 32px repeating grid lines
2. **Soft inner shadow** - Subtle vignette on container edges

**Visual Differentiation**:
Grid is static and barely perceptible; premium grids are animated and prominent.

**Implementation**:
```css
.theme-solarized-dark {
  background-image:
    linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
  background-size: 32px 32px;
}
```

**Estimated Lines**: 30
**Differentiation Note**: No movement, minimal contrast

---

### 3. Dracula

**ID**: `dracula`
**Current State**: Purple-tinted dark palette, no effects
**Target**: Subtle glow accent

**Texture Addition**:
- Very faint purple radial glow at 0.04 opacity
- Emanating from center-top

**New Components**:
1. **Ambient glow** - Soft purple radial gradient in background
2. **Border tint** - 1px purple-tinted border on panels

**Visual Differentiation**:
Glow is static and subtle; premium purple themes have animated shimmer and crystals.

**Implementation**:
```css
.theme-dracula {
  background-image: radial-gradient(
    ellipse at 50% 0%,
    rgba(189, 147, 249, 0.04) 0%,
    transparent 60%
  );
}
```

**Estimated Lines**: 28
**Differentiation Note**: No animation, no particles, minimal glow

---

### 4. Monokai Pro

**ID**: `monokai-pro`
**Current State**: Warm dark palette, no effects
**Target**: Film grain texture

**Texture Addition**:
- Subtle noise texture at 0.03 opacity
- Warm-tinted grain for vintage feel

**New Components**:
1. **Film grain overlay** - SVG noise pattern
2. **Warm highlight** - Faint orange tint on top edge

**Visual Differentiation**:
Static texture only; premium warm themes have animated particles and glows.

**Implementation**:
```css
.theme-monokai-pro {
  background-image: url("data:image/svg+xml,..."); /* noise */
  position: relative;
}
.theme-monokai-pro::before {
  background: linear-gradient(rgba(249, 174, 88, 0.03), transparent 100px);
}
```

**Estimated Lines**: 35
**Differentiation Note**: No movement, barely visible enhancement

---

### 5. One Dark

**ID**: `one-dark`
**Current State**: Blue-gray dark palette, no effects
**Target**: Subtle border glow

**Texture Addition**:
- Faint inner glow at 0.03 opacity
- Blue-tinted soft focus effect

**New Components**:
1. **Inner border glow** - Soft blue box-shadow inset
2. **Panel definition** - Slightly darker panel borders

**Visual Differentiation**:
Static glow, no pulse or animation; premium blue themes have twinkling stars.

**Implementation**:
```css
.theme-one-dark {
  box-shadow: inset 0 0 100px rgba(97, 175, 239, 0.03);
}
```

**Estimated Lines**: 22
**Differentiation Note**: Static shadow only, no twinkle

---

### 6. Aurora Borealis

**ID**: `aurora-borealis`
**Current State**: Green/purple gradient palette, no effects
**Target**: Static aurora hint

**Texture Addition**:
- Very faint gradient band at 0.05 opacity
- Green-to-purple horizontal band at top

**New Components**:
1. **Aurora band** - Soft gradient stripe across top 20%
2. **Star dot hint** - 3-5 static small white dots

**Visual Differentiation**:
Static band and dots; premium aurora would have animated wave movement.

**Implementation**:
```css
.theme-aurora-borealis::before {
  background: linear-gradient(
    180deg,
    rgba(126, 206, 197, 0.05) 0%,
    rgba(189, 147, 249, 0.03) 15%,
    transparent 25%
  );
}
```

**Estimated Lines**: 40
**Differentiation Note**: No wave animation, no northern lights movement

---

### 7. Sunset Blaze

**ID**: `sunset-blaze`
**Current State**: Warm orange/red palette, no effects
**Target**: Warm glow accent

**Texture Addition**:
- Soft warm radial glow at 0.04 opacity
- Emanating from bottom-left corner

**New Components**:
1. **Sun glow** - Orange radial gradient in corner
2. **Horizon line** - Subtle darker band at bottom

**Visual Differentiation**:
Static warm glow; premium sunset would have animated color shifts and particles.

**Implementation**:
```css
.theme-sunset-blaze {
  background-image: radial-gradient(
    circle at 20% 90%,
    rgba(244, 169, 136, 0.04) 0%,
    transparent 50%
  );
}
```

**Estimated Lines**: 30
**Differentiation Note**: No animation, no particle effects

---

### 8. Electric Dreams

**ID**: `electric-dreams`
**Current State**: Neon cyan/magenta palette, no effects
**Target**: Static neon hint

**Texture Addition**:
- Faint neon edge glow at 0.04 opacity
- Cyan tint on edges

**New Components**:
1. **Edge glow** - Neon-colored border glow effect
2. **Grid hint** - Very faint 64px grid pattern

**Visual Differentiation**:
Static glow and grid; premium neon themes (Synth Wave) have animated pulses and retro sun.

**Implementation**:
```css
.theme-electric-dreams {
  box-shadow: inset 0 0 50px rgba(0, 255, 255, 0.04);
  background-image:
    linear-gradient(rgba(0,255,255,0.01) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0,255,255,0.01) 1px, transparent 1px);
  background-size: 64px 64px;
}
```

**Estimated Lines**: 38
**Differentiation Note**: No animation, no neon pulse, no scan lines

---

## Differentiation Matrix

| Feature | Legacy (Free) | Premium (Paid) |
|---------|---------------|----------------|
| Texture overlay | Yes (0.02-0.05 opacity) | Yes (0.05-0.15 opacity) |
| Static accents | 1-2 elements | 4-6 elements |
| Animations | None | 2-4 animated layers |
| Particles | None | Floating/falling elements |
| Complex shapes | None | Trees, stars, ornaments |
| Custom elements | None | Seasonal decorations |
| Code footprint | ≤50 lines | 150-270 lines |

---

## Implementation Summary

| Theme | Texture Type | New Elements | Est. Lines |
|-------|--------------|--------------|------------|
| VS Code Dark+ | Noise | Border, radius | 25 |
| Solarized Dark | Grid | Grid overlay, shadow | 30 |
| Dracula | Glow | Radial glow, border | 28 |
| Monokai Pro | Noise | Grain, highlight | 35 |
| One Dark | Glow | Inner shadow, borders | 22 |
| Aurora Borealis | Gradient | Aurora band, dots | 40 |
| Sunset Blaze | Glow | Sun glow, horizon | 30 |
| Electric Dreams | Grid+Glow | Edge glow, grid | 38 |
| **Total** | - | - | **248** |
| **Average** | - | - | **31** |

All themes well within 50-line budget per theme.

---

## CSS Pattern Library

### Noise Texture (Base64 SVG)

```css
/* Use for: VS Code Dark+, Monokai Pro */
background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
background-blend-mode: overlay;
opacity: 0.03;
```

### Faint Grid Pattern

```css
/* Use for: Solarized Dark, Electric Dreams */
background-image:
  linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
  linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
background-size: 32px 32px;
```

### Radial Glow

```css
/* Use for: Dracula, Sunset Blaze */
background-image: radial-gradient(
  ellipse at var(--glow-x, 50%) var(--glow-y, 0%),
  var(--glow-color) 0%,
  transparent var(--glow-radius, 60%)
);
```

### Inner Shadow Glow

```css
/* Use for: One Dark, Electric Dreams */
box-shadow: inset 0 0 var(--glow-size, 100px) var(--glow-color);
```

---

## Verification Checklist

For each legacy theme enhancement:

- [ ] Texture added with opacity ≤ 0.05
- [ ] 1-2 new components only
- [ ] No animations present
- [ ] Total new CSS ≤ 50 lines
- [ ] Clear visual distinction from premium themes
- [ ] All colors use `--cgpt-*` variables where applicable
- [ ] No TODO/FIXME comments
