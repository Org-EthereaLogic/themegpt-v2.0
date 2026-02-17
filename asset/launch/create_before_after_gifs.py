"""
Generate before/after GIFs for ThemeGPT launch assets.

Creates crossfade animations from default ChatGPT → themed screenshots.
Output: 1280x880 GIFs at 15fps, optimized for web (<5MB each).
"""

from PIL import Image
import os

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
SOURCE_DIR = os.path.join(SCRIPT_DIR, "..", "images", "chrome-store")
OUTPUT_DIR = SCRIPT_DIR

# Target dimensions (retina source ~2880x1980, scale down for web)
TARGET_W = 1280
TARGET_H = 880

# Timing (in frames at ~12fps via GIF frame delays)
HOLD_BEFORE_MS = 2000    # Show "before" for 2s
HOLD_AFTER_MS = 2500     # Show "after" for 2.5s
CROSSFADE_STEPS = 6      # Number of blend frames
CROSSFADE_FRAME_MS = 70  # ~70ms per crossfade frame

# Color palette size (lower = smaller file, less quality)
PALETTE_COLORS = 128

THEMES = [
    {
        "name": "aurora-borealis",
        "after": "After_Aurora Borealis_screenshot.png",
        "label": "Aurora Borealis",
    },
    {
        "name": "synth-wave",
        "after": "After_Synth_Wave_screenshot.png",
        "label": "Synth Wave",
    },
    {
        "name": "woodland-retreat",
        "after": "After_Woodland_Retreat_screenshot.png",
        "label": "Woodland Retreat",
    },
    {
        "name": "themegpt-dark",
        "after": "After_ThemeGPT_Dark_screenshot.png",
        "label": "ThemeGPT Dark",
    },
]

BEFORE_FILE = "Before_screenshot.png"


def load_and_resize(path):
    """Load image and resize to target dimensions."""
    img = Image.open(path).convert("RGB")
    img = img.resize((TARGET_W, TARGET_H), Image.LANCZOS)
    return img


def create_crossfade_gif(before_img, after_img, output_path, label):
    """Create a looping before→after crossfade GIF."""
    frames = []
    durations = []

    # Convert to palette-friendly format
    before_p = before_img.quantize(colors=PALETTE_COLORS, method=Image.MEDIANCUT, dither=Image.Dither.NONE)
    after_p = after_img.quantize(colors=PALETTE_COLORS, method=Image.MEDIANCUT, dither=Image.Dither.NONE)

    # Frame 1: Hold on "before"
    frames.append(before_p)
    durations.append(HOLD_BEFORE_MS)

    # Crossfade frames: before → after
    for i in range(1, CROSSFADE_STEPS + 1):
        alpha = i / CROSSFADE_STEPS
        blended = Image.blend(before_img, after_img, alpha)
        frames.append(blended.quantize(colors=PALETTE_COLORS, method=Image.MEDIANCUT, dither=Image.Dither.NONE))
        durations.append(CROSSFADE_FRAME_MS)

    # Frame N: Hold on "after"
    frames.append(after_p)
    durations.append(HOLD_AFTER_MS)

    # Crossfade frames: after → before (for smooth loop)
    for i in range(1, CROSSFADE_STEPS + 1):
        alpha = i / CROSSFADE_STEPS
        blended = Image.blend(after_img, before_img, alpha)
        frames.append(blended.quantize(colors=PALETTE_COLORS, method=Image.MEDIANCUT, dither=Image.Dither.NONE))
        durations.append(CROSSFADE_FRAME_MS)

    # Save GIF
    frames[0].save(
        output_path,
        save_all=True,
        append_images=frames[1:],
        duration=durations,
        loop=0,
        optimize=True,
    )

    size_mb = os.path.getsize(output_path) / (1024 * 1024)
    print(f"  {label}: {output_path} ({size_mb:.1f} MB)")
    return size_mb


def main():
    before_path = os.path.join(SOURCE_DIR, BEFORE_FILE)
    before_img = load_and_resize(before_path)

    print("Generating before/after GIFs...")
    print(f"  Source: {SOURCE_DIR}")
    print(f"  Output: {OUTPUT_DIR}")
    print(f"  Size: {TARGET_W}x{TARGET_H}")
    print()

    total_size = 0
    for theme in THEMES:
        after_path = os.path.join(SOURCE_DIR, theme["after"])
        after_img = load_and_resize(after_path)

        output_name = f"default-to-{theme['name']}.gif"
        output_path = os.path.join(OUTPUT_DIR, output_name)

        size = create_crossfade_gif(before_img, after_img, output_path, theme["label"])
        total_size += size

    print(f"\nTotal: {total_size:.1f} MB across {len(THEMES)} GIFs")


if __name__ == "__main__":
    main()
