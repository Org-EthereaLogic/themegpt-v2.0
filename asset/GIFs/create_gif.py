#!/usr/bin/env python3
"""
ThemeGPT Animated GIF Generator
Creates animated logo GIFs with twinkling satellite sparkles and gentle float effect.

Uses SVG source files for pixel-perfect rendering at any resolution.
The original sparkle is preserved intact while additional satellite sparkles
animate around it with smooth fade in/out transparency.

Requirements:
    pip install Pillow cairosvg

Usage:
    python create_gif.py

Output:
    - animated-logo-512.gif  (512x512, highest quality)
    - animated-logo-400.gif  (400x400, optimized for web)
"""

import os
import sys
import math
import io

try:
    from PIL import Image, ImageDraw
except ImportError:
    print("Error: Pillow is required. Install with: pip install Pillow")
    sys.exit(1)

try:
    import cairosvg
except ImportError:
    print("Error: cairosvg is required. Install with: pip install cairosvg")
    sys.exit(1)


# =============================================================================
# Configuration
# =============================================================================

# Animation settings
TOTAL_FRAMES = 24          # Number of frames in the animation loop
FRAME_DURATION_MS = 70     # Milliseconds per frame (~14 fps)
FLOAT_AMPLITUDE = 2.4      # Pixels of vertical float motion

# Output sizes
OUTPUT_SIZES = [512, 400]  # Generate these sizes

# Colors (from ThemeGPT brand palette)
TEAL_SPARKLE = (129, 200, 183)   # #81c8b7 - sparkle color
CREAM_BG = (255, 250, 241)       # #fffaf1 - background color

# Transparency flag (set to True for transparent GIFs)
TRANSPARENT_BG = True

# Sparkle position ratios (relative to image size)
# Based on the logo SVG where sparkle is at approximately (355, 93) in 512x512
SPARKLE_X_RATIO = 0.694
SPARKLE_Y_RATIO = 0.182

# Source file paths (relative to script directory)
LOGO_SVG = "source-logo.svg"
MASCOT_SVG = "source-mascot.svg"


# =============================================================================
# Rendering Functions
# =============================================================================

def render_svg_to_pil(svg_path, size):
    """
    Render an SVG file to a PIL Image at the specified size.

    Args:
        svg_path: Path to the SVG file
        size: Output size in pixels (square)

    Returns:
        PIL Image in RGBA mode
    """
    if not os.path.exists(svg_path):
        raise FileNotFoundError(f"SVG file not found: {svg_path}")

    png_data = cairosvg.svg2png(
        url=svg_path,
        output_width=size,
        output_height=size
    )
    img = Image.open(io.BytesIO(png_data)).convert('RGBA')

    # If transparent mode, replace cream background color with transparency
    if TRANSPARENT_BG:
        img = remove_cream_background(img)

    return img


def remove_cream_background(img):
    """
    Replace cream background color (#fffaf1) with transparency.
    Uses color distance to handle anti-aliased edges.

    Args:
        img: PIL Image in RGBA mode

    Returns:
        PIL Image with cream pixels made transparent
    """
    import numpy as np

    # Convert to numpy array for efficient processing
    data = np.array(img)

    # Target cream color: #fffaf1 = (255, 250, 241)
    target_r, target_g, target_b = 255, 250, 241

    # Calculate color distance from cream for each pixel
    r, g, b, a = data[:,:,0], data[:,:,1], data[:,:,2], data[:,:,3]

    # Color distance threshold (pixels within this distance are made transparent)
    threshold = 15

    # Calculate Euclidean distance from cream color
    distance = np.sqrt(
        (r.astype(float) - target_r)**2 +
        (g.astype(float) - target_g)**2 +
        (b.astype(float) - target_b)**2
    )

    # Create mask for cream-like pixels
    cream_mask = distance < threshold

    # Set alpha to 0 for cream pixels
    data[:,:,3] = np.where(cream_mask, 0, a)

    return Image.fromarray(data, 'RGBA')


def draw_mini_sparkle(draw, cx, cy, size, color_with_alpha):
    """
    Draw a small 4-pointed star sparkle.
    
    Args:
        draw: PIL ImageDraw object
        cx, cy: Center coordinates
        size: Size of the sparkle
        color_with_alpha: RGBA tuple
    """
    if size < 1:
        return
    
    # Vertical diamond
    draw.polygon([
        (cx, cy - size),
        (cx + size * 0.2, cy),
        (cx, cy + size),
        (cx - size * 0.2, cy),
    ], fill=color_with_alpha)
    
    # Horizontal diamond
    draw.polygon([
        (cx - size, cy),
        (cx, cy - size * 0.2),
        (cx + size, cy),
        (cx, cy + size * 0.2),
    ], fill=color_with_alpha)


# =============================================================================
# Animation Functions
# =============================================================================

def create_animation_frame(frame_num, total_frames, base_image, size):
    """
    Create a single animation frame with floating motion and satellite sparkles.
    
    The original sparkle from the logo is preserved intact. Additional smaller
    sparkles fade in and out around it to create a twinkling effect.
    
    Args:
        frame_num: Current frame number (0 to total_frames-1)
        total_frames: Total number of frames in the animation
        base_image: PIL Image of the logo (rendered from SVG)
        size: Output size in pixels
    
    Returns:
        PIL Image frame
    """
    # Padding for float effect
    padding = 8
    frame_height = size + padding * 2
    
    # Create frame with cream or transparent background
    if TRANSPARENT_BG:
        frame = Image.new('RGBA', (size, frame_height), (0, 0, 0, 0))
    else:
        frame = Image.new('RGBA', (size, frame_height), CREAM_BG + (255,))
    
    # Calculate animation phase (0 to 2π)
    phase = (frame_num / total_frames) * 2 * math.pi
    
    # Calculate float offset (sinusoidal motion)
    float_offset = int(math.sin(phase) * FLOAT_AMPLITUDE) + padding
    
    # Paste the original logo (with its sparkle intact)
    frame.paste(base_image, (0, float_offset), base_image)
    
    # Create transparent overlay for satellite sparkles
    sparkle_layer = Image.new('RGBA', frame.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(sparkle_layer)
    
    # Calculate main sparkle center position
    sparkle_x = int(size * SPARKLE_X_RATIO)
    sparkle_y = int(size * SPARKLE_Y_RATIO) + float_offset
    
    # Satellite sparkle 1: Upper-left of main sparkle
    s1_phase = phase
    s1_intensity = max(0, math.sin(s1_phase))
    if s1_intensity > 0.1:
        s1_size = int(6 * s1_intensity)
        s1_alpha = int(230 * s1_intensity)
        draw_mini_sparkle(draw, sparkle_x - 28, sparkle_y - 22, 
                         s1_size, TEAL_SPARKLE + (s1_alpha,))
    
    # Satellite sparkle 2: Right of main sparkle
    s2_phase = phase + math.pi * 0.7
    s2_intensity = max(0, math.sin(s2_phase))
    if s2_intensity > 0.15:
        s2_size = int(5 * s2_intensity)
        s2_alpha = int(210 * s2_intensity)
        draw_mini_sparkle(draw, sparkle_x + 38, sparkle_y - 10,
                         s2_size, TEAL_SPARKLE + (s2_alpha,))
    
    # Satellite sparkle 3: Below-right of main sparkle
    s3_phase = phase + math.pi * 1.4
    s3_intensity = max(0, math.sin(s3_phase))
    if s3_intensity > 0.2:
        s3_size = int(4 * s3_intensity)
        s3_alpha = int(190 * s3_intensity)
        draw_mini_sparkle(draw, sparkle_x + 30, sparkle_y + 22,
                         s3_size, TEAL_SPARKLE + (s3_alpha,))
    
    # Satellite sparkle 4: Far upper-right (subtle)
    s4_phase = phase + math.pi * 2.1
    s4_intensity = max(0, math.sin(s4_phase))
    if s4_intensity > 0.25:
        s4_size = int(3 * s4_intensity)
        s4_alpha = int(160 * s4_intensity)
        draw_mini_sparkle(draw, sparkle_x + 48, sparkle_y - 30,
                         s4_size, TEAL_SPARKLE + (s4_alpha,))
    
    # Composite sparkle layer onto frame
    frame = Image.alpha_composite(frame, sparkle_layer)
    
    # Crop to final size (remove extra padding)
    frame = frame.crop((0, 0, size, size + 4))
    
    return frame


def generate_animation_frames(svg_path, size, num_frames):
    """
    Generate all animation frames for a given size.
    
    Args:
        svg_path: Path to the source SVG file
        size: Output size in pixels
        num_frames: Number of frames to generate
    
    Returns:
        List of PIL Image frames
    """
    # Render SVG at target size
    base_image = render_svg_to_pil(svg_path, size)
    
    frames = []
    for i in range(num_frames):
        frame = create_animation_frame(i, num_frames, base_image, size)

        if TRANSPARENT_BG:
            # For transparent GIFs, preserve alpha channel
            # Convert to palette mode with transparency support
            alpha = frame.getchannel('A')
            frame_rgb = frame.convert('RGB')
            frame_p = frame_rgb.convert('P', palette=Image.Palette.ADAPTIVE, colors=255)
            # Set transparency for fully transparent pixels
            mask = Image.eval(alpha, lambda a: 255 if a <= 128 else 0)
            frame_p.paste(255, mask)
            frames.append((frame_p, alpha))
        else:
            # Convert to palette mode for GIF
            frame_p = frame.convert('RGB').convert('P',
                                                    palette=Image.Palette.ADAPTIVE,
                                                    colors=128)
            frames.append(frame_p)

    return frames


def save_animated_gif(frames, output_path, duration_ms):
    """
    Save frames as an animated GIF.

    Args:
        frames: List of PIL Image frames (or tuples of (frame, alpha) for transparent)
        output_path: Output file path
        duration_ms: Duration per frame in milliseconds
    """
    if not frames:
        print(f"  Warning: No frames to save for {output_path}")
        return

    if TRANSPARENT_BG:
        # Handle transparent GIF - frames are tuples (frame_p, alpha)
        frame_images = [f[0] for f in frames]
        frame_images[0].save(
            output_path,
            save_all=True,
            append_images=frame_images[1:],
            duration=duration_ms,
            loop=0,
            optimize=False,
            disposal=2,
            transparency=255
        )
    else:
        frames[0].save(
            output_path,
            save_all=True,
            append_images=frames[1:],
            duration=duration_ms,
            loop=0,
            optimize=True,
            disposal=2
        )
    
    # Report file size
    size_kb = os.path.getsize(output_path) / 1024
    print(f"  ✓ {os.path.basename(output_path)} ({len(frames)} frames, {size_kb:.1f} KB)")


# =============================================================================
# Main Entry Point
# =============================================================================

def main():
    """Main entry point for the GIF generator."""
    print("=" * 55)
    print("  ThemeGPT Animated GIF Generator")
    print("=" * 55)
    
    # Change to script directory
    script_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(script_dir)
    
    # Check for source files
    svg_source = None
    for svg_file in [LOGO_SVG, MASCOT_SVG]:
        if os.path.exists(svg_file):
            svg_source = svg_file
            break
    
    if not svg_source:
        print(f"\nError: No source SVG found.")
        print(f"Please place one of the following in this directory:")
        print(f"  - {LOGO_SVG} (full logo with text)")
        print(f"  - {MASCOT_SVG} (mascot only)")
        sys.exit(1)
    
    print(f"\n📁 Source: {svg_source}")
    print(f"🎬 Frames: {TOTAL_FRAMES} @ {FRAME_DURATION_MS}ms")
    print(f"⏱️  Loop time: {(TOTAL_FRAMES * FRAME_DURATION_MS) / 1000:.1f}s")
    
    # Generate GIFs for each size
    print(f"\n📐 Generating animated GIFs...")
    
    for size in OUTPUT_SIZES:
        output_path = f"animated-logo-{size}.gif"
        print(f"\n  Rendering {size}x{size}...")
        
        try:
            frames = generate_animation_frames(svg_source, size, TOTAL_FRAMES)
            save_animated_gif(frames, output_path, FRAME_DURATION_MS)
        except Exception as e:
            print(f"  ✗ Error: {e}")
    
    print("\n" + "=" * 55)
    print("  Generation complete!")
    print("=" * 55)
    print("\nUsage in README.md:")
    print('  <p align="center">')
    print('    <img src="GIFs/animated-logo-512.gif" alt="ThemeGPT" width="300">')
    print('  </p>')


if __name__ == "__main__":
    main()
