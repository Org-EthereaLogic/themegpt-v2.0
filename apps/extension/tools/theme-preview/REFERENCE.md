# ThemeGPT Interface Reference System

Standardized indexing for precise theme modifications. Use variable codes instead of verbose descriptions.

## Quick Reference

```
Format: [ZONE]-[ELEMENT]-[VARIANT]

Example: "Set SB-BG to #1E1E1E and MSG-TXT to #F8F8F2"
```

---

## Zone Index

| Code | Zone | Description |
|------|------|-------------|
| `SB` | Sidebar | Left navigation panel |
| `CH` | Chat | Main content area background |
| `MSG` | Message | Individual message containers |
| `CP` | Composer | Bottom input area |
| `GL` | Global | Document-wide elements |

---

## Element Index

| Code | Element | CSS Target |
|------|---------|------------|
| `BG` | Background | `background-color` |
| `TXT` | Text | `color` |
| `TXM` | Text Muted | Subdued text color |
| `BRD` | Border | `border-color` |
| `ACC` | Accent | Highlight/link color |
| `AVT` | Avatar | User/assistant icons |
| `BTN` | Button | Interactive buttons |
| `INP` | Input | Text input fields |
| `SCR` | Scrollbar | Scroll track/thumb |
| `SEL` | Selection | Text selection highlight |
| `COD` | Code | Code blocks and inline code |

---

## Variant Index

| Code | Variant | Usage |
|------|---------|-------|
| `-H` | Hover | Mouse-over state |
| `-A` | Active | Pressed/selected state |
| `-F` | Focus | Keyboard focus state |
| `-U` | User | User-specific element |
| `-AI` | Assistant | AI-specific element |

---

## Complete Variable Map

### Global (GL)

| Variable | Maps To | Description |
|----------|---------|-------------|
| `GL-BG` | `--cgpt-bg` | Page background |
| `GL-TXT` | `--cgpt-text` | Primary text |
| `GL-TXM` | `--cgpt-text-muted` | Secondary text |
| `GL-BRD` | `--cgpt-border` | Default borders |
| `GL-ACC` | `--cgpt-accent` | Links, highlights |
| `GL-SRF` | `--cgpt-surface` | Elevated surfaces |

### Sidebar (SB)

| Variable | Derives From | Description |
|----------|--------------|-------------|
| `SB-BG` | `GL-SRF` | Sidebar background |
| `SB-TXT` | `GL-TXT` | Sidebar text |
| `SB-TXM` | `GL-TXM` | Chat item text |
| `SB-BRD` | `GL-BRD` | Right border, dividers |
| `SB-BTN-BG` | transparent | New chat button bg |
| `SB-BTN-BG-H` | `GL-BRD` | New chat hover |
| `SB-ITEM-BG` | transparent | Chat item background |
| `SB-ITEM-BG-H` | `GL-BRD` | Chat item hover |
| `SB-ITEM-BG-A` | `GL-BRD` | Active chat item |

### Chat Area (CH)

| Variable | Derives From | Description |
|----------|--------------|-------------|
| `CH-BG` | `GL-BG` | Chat background |
| `CH-SCR-TRACK` | `GL-BG` | Scrollbar track |
| `CH-SCR-THUMB` | `GL-BRD` | Scrollbar thumb |
| `CH-SCR-THUMB-H` | `GL-TXM` | Scrollbar hover |

### Messages (MSG)

| Variable | Derives From | Description |
|----------|--------------|-------------|
| `MSG-TXT` | `GL-TXT` | Message text |
| `MSG-AVT-U-BG` | `GL-ACC` | User avatar background |
| `MSG-AVT-U-TXT` | `GL-BG` | User avatar text |
| `MSG-AVT-AI-BG` | `GL-SRF` | Assistant avatar bg |
| `MSG-AVT-AI-BRD` | `GL-BRD` | Assistant avatar border |
| `MSG-COD-BG` | `GL-SRF` | Code block background |
| `MSG-COD-BRD` | `GL-BRD` | Code block border |
| `MSG-COD-TXT` | `GL-TXT` | Code block text |
| `MSG-COD-INL` | `GL-ACC` | Inline code color |

### Composer (CP)

| Variable | Derives From | Description |
|----------|--------------|-------------|
| `CP-BG` | transparent | Composer area bg |
| `CP-BRD-TOP` | `GL-BRD` | Top border |
| `CP-INP-BG` | `GL-SRF` | Input container bg |
| `CP-INP-BRD` | `GL-BRD` | Input border |
| `CP-INP-TXT` | `GL-TXT` | Input text |
| `CP-INP-PH` | `GL-TXM` | Placeholder text |
| `CP-BTN-BG` | `GL-ACC` | Send button bg |
| `CP-BTN-TXT` | `GL-BG` | Send button icon |

### Effects (FX)

| Variable | Type | Description |
|----------|------|-------------|
| `FX-PAT-TYPE` | Pattern | dots, grid, snowflakes, stars, noise |
| `FX-PAT-OPACITY` | Number | Pattern opacity (0.01-0.15) |
| `FX-PAT-COLOR` | Color | Pattern color override |
| `FX-PAT-SIZE` | Number | Pattern scale (default 1) |
| `FX-OVL-NOISE` | Boolean | Enable noise overlay |
| `FX-OVL-GLOW` | Boolean | Enable glow overlay |

---

## Usage Examples

### Simple Color Change

```
Set GL-ACC to #FF6AC1
```
Changes the accent color throughout the interface.

### Multiple Adjustments

```
Set:
- GL-BG to #0A0A1A
- GL-SRF to #12122A
- GL-ACC to #FFD700
```

### Component-Specific

```
Set MSG-AVT-U-BG to #22C55E
```
Changes only the user avatar background.

### Effect Configuration

```
Set:
- FX-PAT-TYPE to stars
- FX-PAT-OPACITY to 0.12
- FX-PAT-COLOR to #FFD700
```

### Full Theme Specification

```
Theme: Custom Night
GL-BG: #0A0A1A
GL-SRF: #12122A
GL-TXT: #FAFAFA
GL-TXM: #B8B8D1
GL-BRD: #2A2A4A
GL-ACC: #FFD700
FX-PAT-TYPE: stars
FX-PAT-OPACITY: 0.15
```

---

## Derivation Rules

Most variables derive from the 6 core globals. Understanding this hierarchy enables efficient adjustments:

```
GL-BG ──────────────────┬── CH-BG
                        ├── CH-SCR-TRACK
                        ├── MSG-AVT-U-TXT
                        └── CP-BTN-TXT

GL-SRF ─────────────────┬── SB-BG
                        ├── MSG-AVT-AI-BG
                        ├── MSG-COD-BG
                        └── CP-INP-BG

GL-TXT ─────────────────┬── SB-TXT
                        ├── MSG-TXT
                        ├── MSG-COD-TXT
                        └── CP-INP-TXT

GL-TXM ─────────────────┬── SB-TXM
                        ├── CP-INP-PH
                        └── CH-SCR-THUMB-H

GL-BRD ─────────────────┬── SB-BRD
                        ├── SB-BTN-BG-H
                        ├── SB-ITEM-BG-H
                        ├── MSG-AVT-AI-BRD
                        ├── MSG-COD-BRD
                        ├── CP-BRD-TOP
                        ├── CP-INP-BRD
                        └── CH-SCR-THUMB

GL-ACC ─────────────────┬── MSG-AVT-U-BG
                        ├── MSG-COD-INL
                        ├── CP-BTN-BG
                        └── GL-SEL (35% opacity)
```

---

## JSON Schema

For programmatic use:

```json
{
  "id": "theme-id",
  "name": "Theme Name",
  "global": {
    "BG": "#000000",
    "SRF": "#111111",
    "TXT": "#FFFFFF",
    "TXM": "#888888",
    "BRD": "#333333",
    "ACC": "#00FF00"
  },
  "effects": {
    "pattern": {
      "type": "dots",
      "opacity": 0.05,
      "color": null,
      "size": 1
    },
    "overlay": "noise"
  }
}
```

---

## Validation Rules

| Rule | Constraint |
|------|------------|
| `GL-BG` to `GL-TXT` contrast | >= 4.5:1 (WCAG AA) |
| `GL-BG` to `GL-TXM` contrast | >= 3.0:1 (WCAG AA Large) |
| `GL-BG` to `GL-ACC` contrast | >= 3.0:1 |
| `FX-PAT-OPACITY` | 0.01 - 0.15 |
| `FX-OVL-NOISE` + `FX-OVL-GLOW` | Mutually exclusive |

---

## Communication Templates

### Request Format

```
[ACTION] [VARIABLE(S)] [VALUE(S)]

Examples:
- SET GL-ACC #FF2E97
- SET GL-BG #0D0221, GL-SRF #150634
- ENABLE FX-OVL-GLOW
- DISABLE FX-PAT
```

### Response Format

```
[STATUS] [VARIABLE] [OLD] → [NEW] [VALIDATION]

Examples:
- OK GL-ACC #569CD6 → #FF2E97 ✓
- OK GL-BG #1E1E1E → #0D0221 ✓ Contrast: 12.4:1
- WARN GL-TXM contrast 2.8:1 < 3.0:1
```

### Batch Modification

```
BATCH theme-name
  GL-BG: #0A0A1A
  GL-SRF: #12122A
  GL-TXT: #FAFAFA
  GL-TXM: #B8B8D1
  GL-BRD: #2A2A4A
  GL-ACC: #FFD700
  FX-PAT-TYPE: stars
  FX-PAT-OPACITY: 0.15
END
```
