# ThemeGPT Animated GIFs

This directory contains the animated logo assets for ThemeGPT and the script used to generate them.

## 📁 Directory Structure

```
GIFs/
├── README.md              # This file
├── create_gif.py          # Animation generation script
├── source-logo.svg        # Source SVG (full logo with text)
├── source-mascot.svg      # Source SVG (mascot only, optional)
├── animated-logo-512.gif  # Generated: 512x512 high-quality
└── animated-logo-400.gif  # Generated: 400x400 web-optimized
```

## 🎬 Animation Features

The animated logo includes:

- **Gentle Float Effect** — The logo bobs up and down subtly (2.4px amplitude)
- **Twinkling Satellite Sparkles** — Small sparkles fade in/out around the main sparkle
- **Original Sparkle Preserved** — The main teal sparkle from the logo stays intact
- **Smooth Loop** — 24 frames at 70ms each = 1.7 second seamless loop

## 🛠️ Requirements

```bash
pip install Pillow cairosvg
```

**System dependencies for cairosvg:**

- **macOS**: `brew install cairo libffi`
- **Ubuntu/Debian**: `apt-get install libcairo2-dev`
- **Windows**: Install GTK3 runtime from https://github.com/nicm/msys2-devkit

## 🚀 Usage

### Generate GIFs

1. Place your source SVG file in this directory as `source-logo.svg`
2. Run the script:

```bash
cd GIFs
python create_gif.py
```

3. Output files will be created:
   - `animated-logo-512.gif` (512×512, ~250 KB)
   - `animated-logo-400.gif` (400×400, ~205 KB)

### Use in README.md

```markdown
<p align="center">
  <img src="GIFs/animated-logo-512.gif" alt="ThemeGPT Logo" width="300">
</p>
```

Or with a clickable link:

```markdown
<p align="center">
  <a href="https://themegpt.ai">
    <img src="GIFs/animated-logo-512.gif" alt="ThemeGPT Logo" width="300">
  </a>
</p>
```

## ⚙️ Configuration

Edit the constants at the top of `create_gif.py` to customize:

```python
# Animation settings
TOTAL_FRAMES = 24          # More frames = smoother but larger file
FRAME_DURATION_MS = 70     # Lower = faster animation
FLOAT_AMPLITUDE = 2.4      # Pixels of vertical motion

# Output sizes
OUTPUT_SIZES = [512, 400]  # Add/remove sizes as needed

# Colors (ThemeGPT brand palette)
TEAL_SPARKLE = (129, 200, 183)   # #81c8b7
CREAM_BG = (255, 250, 241)       # #fffaf1
```

## 🎨 Animation Customization

### Adjust Motion Intensity

To make the animation more/less pronounced:

```python
FLOAT_AMPLITUDE = 2.4  # Increase for more bounce, decrease for subtler
```

### Change Animation Speed

```python
FRAME_DURATION_MS = 70   # Lower = faster, higher = slower
TOTAL_FRAMES = 24        # More frames = smoother at same duration
```

### Add More Sparkle Positions

In the `create_animation_frame()` function, add new satellite sparkles:

```python
# Satellite sparkle 5: Custom position
s5_phase = phase + math.pi * 0.5
s5_intensity = max(0, math.sin(s5_phase))
if s5_intensity > 0.2:
    s5_size = int(4 * s5_intensity)
    s5_alpha = int(180 * s5_intensity)
    draw_mini_sparkle(draw, sparkle_x + 50, sparkle_y + 15,
                     s5_size, TEAL_SPARKLE + (s5_alpha,))
```

## 📊 Output Specifications

| File | Resolution | File Size | Use Case |
|------|------------|-----------|----------|
| `animated-logo-512.gif` | 512×512 | ~250 KB | High-DPI displays, hero images |
| `animated-logo-400.gif` | 400×400 | ~205 KB | GitHub README, web pages |

## 🔧 Troubleshooting

### "cairosvg not found" error

```bash
pip install cairosvg
# If that fails, install system dependencies first (see Requirements above)
```

### "SVG file not found" error

Make sure `source-logo.svg` exists in the GIFs directory. You can copy it from your brand assets:

```bash
cp path/to/artie-logo-main.svg GIFs/source-logo.svg
```

### GIF colors look wrong

The script uses adaptive palette quantization. If colors look off, try increasing the color count in `generate_animation_frames()`:

```python
frame_p = frame.convert('RGB').convert('P', 
                                        palette=Image.Palette.ADAPTIVE, 
                                        colors=256)  # Increase from 128
```

### Animation is too fast/slow

Adjust `FRAME_DURATION_MS` (in milliseconds per frame):
- 50ms = Fast, energetic
- 70ms = Default, balanced  
- 100ms = Slow, relaxed

## 📝 License

The animation script is provided under the same license as the ThemeGPT project (Apache 2.0).
