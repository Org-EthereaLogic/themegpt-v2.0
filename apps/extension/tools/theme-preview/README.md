# ThemeGPT Preview Tool

Standalone HTML mockup for real-time theme visualization and quality verification. Designed for autonomous LLM agent operation and rapid theme iteration.

## Quick Start

```bash
# Start local server (recommended for verification features)
cd apps/extension/tools/theme-preview
python3 -m http.server 8889

# Open in browser
open http://localhost:8889/index.html

# Or open directly (file:// - some features may be limited)
open apps/extension/tools/theme-preview/index.html
```

No build step required. Works offline.

## Purpose

This tool enables:

1. **Visual Preview**: See themes applied to ChatGPT-like interface elements
2. **Quality Verification**: Automated contrast ratio and accessibility checks
3. **LLM Agent Integration**: Console logging and JSON export for autonomous workflows
4. **Rapid Iteration**: Instant theme switching without extension reload

## Interface Components

The mockup includes all ChatGPT interface elements:

| Component | Purpose |
|-----------|---------|
| Sidebar | Navigation, chat history, user info |
| Chat Area | User/assistant messages with code blocks |
| Composer | Message input with send button |
| Scrollbars | Theme-aware styling |
| Selection | Accent-colored text selection |

## Quality Checks

Each theme is automatically validated:

| Check | Target | WCAG Level |
|-------|--------|------------|
| Text Contrast | >= 4.5:1 | AA |
| Muted Contrast | >= 3.0:1 | AA Large |
| Accent Visibility | >= 3.0:1 | AA Large |
| Pattern Opacity | <= 0.15 | - |

Failed checks appear in red in the Quality Panel.

## Theme Properties

Themes support these visual effects:

```typescript
interface Theme {
  id: string;
  name: string;
  colors: { /* CSS variables */ };
  isPremium: boolean;
  pattern?: {          // Background pattern (body::before)
    type: 'dots' | 'grid' | 'snowflakes' | 'stars' | 'noise' | 'giftwrap' | 'christmastrees' | 'peppermints' | 'christmaswrap';
    opacity: number;   // 0.01-0.15
    color?: string;
    size?: number;
  };
  noiseOverlay?: boolean;  // SVG noise texture (body::after)
  glowOverlay?: boolean;   // Radial glow from accent (body::after)
  effects?: { /* Premium animated visual effects */ };
}
```

## Theme Verification

### Automated Verification

Run the automated verification script in the browser console:

```javascript
// Load and run verification script
fetch('verify-themes.js')
  .then(r => r.text())
  .then(code => eval(code))
  .then(() => runAllVerifications());
```

This will test all priority themes and report on:
- Theme loading success
- Pattern and overlay presence
- Effect rendering
- Quality check compliance
- Console errors

### Manual Verification

Open `verification-report.html` for a structured checklist with:
- Expected features for each theme
- Visual verification points
- Checkbox tracking (persisted in localStorage)

See `VERIFICATION_GUIDE.md` for detailed verification procedures.

## ThemeGPT API

The preview tool exposes `window.ThemeGPT` for programmatic control:

```javascript
// Get current state
ThemeGPT.getState()
// Returns: { theme, effectsEnabled, themeIndex, totalThemes }

// List all themes
ThemeGPT.list()
// Returns: Array of { id, name, isPremium, hasEffects }

// Apply a theme
ThemeGPT.apply('purple-twilight')
// Returns: { success, theme } or { success, error }

// Validate quality
ThemeGPT.validate()
// Returns: { success, allPass, checks }

// Modify current theme
ThemeGPT.setColor('--cgpt-accent', '#FF1493')
ThemeGPT.setColors({ '--cgpt-bg': '#000', '--cgpt-text': '#fff' })
ThemeGPT.setPattern({ type: 'stars', opacity: 0.05, size: 1 })
ThemeGPT.setOverlay('glow') // 'noise', 'glow', or 'none'

// Toggle effects
ThemeGPT.toggleEffects()

// Export current theme
ThemeGPT.export()
// Returns theme object and copies JSON to clipboard
```

### Console Output

All theme changes log to console:

```javascript
[ThemeGPT] Applied: theme-id { checks: [...] }
[ThemeGPT] Export: { /* theme JSON */ }
[ThemeGPT] Panel toggled
[ThemeGPT] Agentic API ready. Use ThemeGPT.getState(), ThemeGPT.setColor(), etc.
```

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+H` | Toggle theme panel |
| `Ctrl+E` | Export current theme to console |
| `←` / `→` | Navigate between themes |

### Export Workflow

1. Select theme in panel
2. Click "Export Theme JSON" or press `Ctrl+E`
3. JSON copied to clipboard and logged to console
4. Use exported JSON for theme definitions

## Development Workflow

### Adding a New Theme

1. Add theme object to `THEMES` array in index.html
2. Test visual appearance across all interface elements
3. Verify quality checks pass
4. Export JSON and add to `packages/shared/src/index.ts`

### Testing Patterns

Pattern effects use `body::before`:

```css
body::before {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  /* pattern-specific background */
}
```

### Testing Overlays

Overlay effects use `body::after`:

- `noiseOverlay`: SVG feTurbulence texture at 3.5% opacity
- `glowOverlay`: Radial gradients from accent color at 8% opacity

## Theme Categories

### Current MVP (Seasonal)

- **Free Core**: Classic IDE themes (VS Code, Dracula, etc.)
- **Premium Christmas**: Holiday-themed with patterns/overlays
- **Premium Core**: Enhanced variants with visual effects

### Future Roadmap

The preview tool architecture supports:

- Licensed themes (NFL, NBA, TV franchises)
- Logo/imagery integration testing
- Premium tier visualization

## File Structure

```
tools/theme-preview/
├── index.html                # Core preview tool with ThemeGPT API
├── verification-report.html  # Visual verification checklist
├── verify-themes.js          # Automated verification script
├── VERIFICATION_GUIDE.md     # Detailed verification instructions
├── catalog-complete.html     # Marketing theme catalog
├── REFERENCE.md              # UI element indexing system
├── README.md                 # This documentation
└── archive/                  # Deprecated prototypes
    ├── prototype-animated.html
    └── prototype-christmas-custom.html
```

## Complexity Justification

Per DIRECTIVES.md, files exceeding 500 lines require architectural review.

**index.html (>500 lines)**: Justified because it must:
1. Mirror theme-injector.ts exactly for visual parity
2. Include all 24 theme definitions inline (no external dependencies)
3. Provide complete ChatGPT mockup UI for accurate preview
4. Contain pattern/effect generators matching production code
5. Include WCAG quality checks for accessibility validation

**verification-report.html (>500 lines)**: Justified because it provides an explicit per-theme checklist UI with zero dependencies and persistent local state.

**Archived files**: `prototype-animated.html` and `prototype-christmas-custom.html` were development exploration artifacts. Their patterns have been incorporated into the main tool or deemed unnecessary. Archived 2024-12 per complexity audit.

## Synchronization

Theme definitions should match `packages/shared/src/index.ts`. When updating themes:

1. Update source of truth in shared package
2. Mirror changes to preview tool
3. Verify visual parity

## Troubleshooting

**Patterns not showing**: Check `body::before` in DevTools. Ensure opacity > 0.

**Overlays conflicting**: Only one overlay is rendered; if both flags are set, noise takes priority.

**Contrast check failing**: Adjust color values. Background-to-text ratio is critical for readability.

**Theme not appearing**: Verify theme ID in `THEMES` array matches source.
