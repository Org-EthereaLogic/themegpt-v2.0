# ThemeGPT Theme Verification Guide

## Overview

This guide helps verify that all themes in the ThemeGPT preview tool are rendering correctly with proper visual parity between the preview and the actual Chrome extension.

## Quick Start

1. **Start the preview server:**
   ```bash
   cd apps/extension/tools/theme-preview
   python3 -m http.server 8889
   ```

2. **Open the preview tool:**
   - Navigate to http://localhost:8889/index.html
   - The theme panel should appear on the right side

3. **Run automated verification:**
   - Open browser console (F12 or Cmd+Option+I)
   - Copy/paste the verification script or load it:
     ```javascript
     fetch('verify-themes.js')
       .then(r => r.text())
       .then(code => eval(code))
       .then(() => runAllVerifications());
     ```

4. **Use the verification report:**
   - Open http://localhost:8889/verification-report.html
   - Use the checkboxes to track your manual verification progress

## Themes to Verify

### Free Themes

#### 1. VS Code Dark+ (`vscode-dark-plus`)
- **Pattern:** Dots (opacity: 0.03, size: 1)
- **Overlay:** Noise
- **Key Visual:** Subtle dot pattern with noise texture overlay
- **Verification Points:**
  - Dots should be barely visible, evenly spaced
  - Noise should add film grain texture
  - No visual artifacts or alignment issues

#### 2. Dracula (`dracula`)
- **Pattern:** Dots (opacity: 0.03, size: 1)
- **Overlay:** Glow
- **Key Visual:** Purple accent with radial glow effects
- **Verification Points:**
  - Glow should create subtle radial gradients from top and bottom
  - Purple accent (#BD93F9) should be vibrant
  - Dots pattern should be subtle

#### 3. Aurora Borealis (`aurora-borealis`)
- **Pattern:** Stars (opacity: 0.04, size: 1)
- **Overlay:** Glow
- **Key Visual:** Multi-layered star field pattern
- **Verification Points:**
  - Stars should appear in 3 overlapping layers (80px, 60px, 40px spacing)
  - Position offsets should create depth: (0,0), (30px,40px), (15px,20px)
  - Teal glow should enhance the northern lights atmosphere

### Premium Themes

#### 4. Cozy Cabin Christmas (`cozy-cabin-christmas`)
- **Effects:**
  - Tree Silhouettes (Christmas style, few density, with ornaments)
  - Animated Snowfall (gentle style, light density, slow speed)
- **Overlay:** Noise
- **Key Visual:** Christmas tree silhouettes at bottom with gentle snowfall
- **Verification Points:**
  - Trees should render with jagged pine shape using clip-path polygon
  - Trees should have visible trunks at bottom
  - Snowflakes should drift diagonally downward (not straight down)
  - Warm color palette (#140E0A bg, #D97757 accent)

#### 5. Frosted Windowpane (`frosted-windowpane`)
- **Effects:**
  - Animated Snowfall (gradient style, medium density, slow speed, #B8D4E8 color)
  - Frosted Glass (vignette + condensation)
- **Key Visual:** Light theme with frost vignette and water droplets
- **Verification Points:**
  - Gradient snowfall should use pure CSS radial gradients (no DOM elements)
  - Frost vignette should create heavy white/blue edge glow using box-shadow
  - Condensation droplets should appear at bottom with water trails
  - 6 large droplets with 6 corresponding trails running down
  - Light theme should maintain good contrast (#F5F7FB bg, #0F172A text)

#### 6. Purple Twilight (`purple-twilight`)
- **Effects:**
  - Twinkling Stars (sparse count, organic variation, 10s duration)
  - Candle Glow (ambient effect)
  - Frost Edge (seasonal decoration)
- **Overlay:** Noise (note: if both are set, noise takes priority over glow)
- **Key Visual:** Deep purple with twinkling stars and warm candle glow
- **Verification Points:**
  - Stars should twinkle with desynchronized timing (highly varied delays)
  - Star animation duration should vary per star (50%-150% of base)
  - Peak opacity should vary per star (0.6-1.0)
  - Candle glow should create warm amber radial gradients at viewport corners
  - Frost edge should add subtle frosted vignette
  - Noise overlay should be present (glow is not rendered when noiseOverlay is enabled)

## Common Verification Points

### All Themes Should Have:
- ✅ No console errors
- ✅ Proper WCAG AA contrast ratios (4.5:1 for text, 3:1 for muted/accent)
- ✅ Smooth animations (no jank or stuttering)
- ✅ Pattern opacity <= 0.15 (unless it's a special overlay pattern)
- ✅ Proper z-index layering (patterns behind content, effects above)

### Pattern Positioning
- **Dots:** Offset by 1/3 of spacing to avoid ribbon alignment issues
- **Grid:** Standard positioning (0, 0)
- **Stars:** 3-layer system with specific offsets
- **Snowflakes:** 2-layer system with offset
- **Christmas Trees:** SVG-based, offset by 1/4 spacing

### Effect Layering
Effects should render in this z-index order (back to front):
1. Background patterns (`body::before`, z-index: 0)
2. Overlays (`body::after`, z-index: 1)
3. Effect elements (`#themegpt-effects .themegpt-*`, varies)
4. Ribbon/decorations (z-index: 5-6 for ribbons)

### Animation Performance
- Snowfall should be smooth, no dropped frames
- Stars should twinkle organically, not in sync
- Hover effects should respond within 200ms
- Reduced motion preference should disable animations

## Browser Compatibility

Test in these browsers if possible:
- Chrome/Edge (primary target)
- Firefox (secondary)
- Safari (check for webkit-specific issues)

### Known Browser Differences:
- **Safari:** May require `-webkit-` prefixes for some mask properties
- **Firefox:** Conic gradients may render slightly differently
- **Chrome:** Reference implementation

## API Testing

Use the browser console to test the ThemeGPT API:

```javascript
// Get current state
ThemeGPT.getState()

// List all themes
ThemeGPT.list()

// Apply a theme
ThemeGPT.apply('purple-twilight')

// Validate quality
ThemeGPT.validate()

// Toggle effects on/off
ThemeGPT.toggleEffects()

// Export current theme
ThemeGPT.export()

// Modify colors
ThemeGPT.setColor('--cgpt-accent', '#FF1493')

// Set pattern
ThemeGPT.setPattern({ type: 'stars', opacity: 0.05, size: 1.2 })

// Create custom theme
ThemeGPT.create({
  id: 'my-custom-theme',
  name: 'My Custom Theme',
  colors: {
    '--cgpt-bg': '#000000',
    '--cgpt-surface': '#111111',
    '--cgpt-text': '#FFFFFF',
    '--cgpt-text-muted': '#999999',
    '--cgpt-border': '#333333',
    '--cgpt-accent': '#FF1493'
  },
  pattern: { type: 'dots', opacity: 0.03, size: 1 },
  glowOverlay: true
})
```

## Screenshot Guidelines

When taking screenshots for documentation:

1. **Full viewport:** Show entire ChatGPT interface with theme applied
2. **Pattern closeup:** Zoom in to show pattern detail
3. **Effect showcase:** Capture animated effects (may need video/GIF)
4. **Before/after:** Show theme vs. default for comparison

Recommended screenshot tool settings:
- Format: PNG for static, WebP for compression
- Scale: 0.3 for previews, 1.0 for detailed views
- Quality: 0.85 for WebP

## Troubleshooting

### Pattern not visible:
- Check opacity value (should be 0.03-0.15)
- Verify pattern color contrasts with background
- Inspect `body::before` element in DevTools

### Overlay not visible:
- Check `body::after` element in DevTools
- Verify overlay opacity (typically 0.035 for noise, 0.08 for glow)
- Ensure theme has `noiseOverlay` or `glowOverlay` property

### Effects not animating:
- Check that effects are enabled: `ThemeGPT.getState().effectsEnabled`
- Verify browser doesn't have `prefers-reduced-motion` enabled
- Check console for JavaScript errors
- Inspect `#themegpt-effects` container for child elements

### Contrast issues:
- Run `ThemeGPT.validate()` to see specific ratios
- Check color values in theme definition
- Verify text is readable against background

## Reporting Issues

When reporting theme issues, include:
1. Theme ID and name
2. Browser and version
3. Screenshot or screen recording
4. Console errors (if any)
5. Output of `ThemeGPT.getState()` and `ThemeGPT.validate()`

## Success Criteria

A theme passes verification when:
- ✅ All visual elements render as expected
- ✅ All animations run smoothly
- ✅ Quality checks pass (`ThemeGPT.validate()` returns `allPass: true`)
- ✅ No console errors
- ✅ Matches design specification
- ✅ Maintains visual parity with Chrome extension implementation

---

**Last Updated:** 2025-12-18
**ThemeGPT Version:** v2.0
