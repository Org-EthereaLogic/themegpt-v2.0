# ThemeGPT Preview Tool

Standalone HTML mockup for real-time theme visualization and quality verification. Designed for autonomous LLM agent operation and rapid theme iteration.

## Quick Start

```bash
# Open in browser (from project root)
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
    type: 'dots' | 'grid' | 'snowflakes' | 'stars' | 'noise';
    opacity: number;   // 0.01-0.15
    color?: string;
    size?: number;
  };
  noiseOverlay?: boolean;  // SVG noise texture (body::after)
  glowOverlay?: boolean;   // Radial glow from accent (body::after)
}
```

## LLM Agent Protocol

### Console Output

All theme changes log to console:

```javascript
[ThemeGPT] Applied: theme-id { checks: [...] }
[ThemeGPT] Export: { /* theme JSON */ }
[ThemeGPT] Panel toggled
```

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+H` | Toggle theme panel |
| `Ctrl+E` | Export current theme to console |

### Programmatic Theme Application

```javascript
// From browser console
applyTheme(THEMES.find(t => t.id === 'cozy-cabin-christmas'));
```

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
├── index.html     # Complete standalone preview
└── README.md      # This documentation
```

## Synchronization

Theme definitions should match `packages/shared/src/index.ts`. When updating themes:

1. Update source of truth in shared package
2. Mirror changes to preview tool
3. Verify visual parity

## Troubleshooting

**Patterns not showing**: Check `body::before` in DevTools. Ensure opacity > 0.

**Overlays conflicting**: Only one overlay (noise OR glow) can be active. Noise takes priority.

**Contrast check failing**: Adjust color values. Background-to-text ratio is critical for readability.

**Theme not appearing**: Verify theme ID in `THEMES` array matches source.
