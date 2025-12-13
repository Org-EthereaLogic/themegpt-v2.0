#!/usr/bin/env python3
"""
ThemeGPT Animated GIF Generator
Creates animated mascot GIFs with a star shimmer effect
"""

from PIL import Image, ImageDraw, ImageEnhance
import os
import math


def create_shimmer_frames(base_img, num_frames=20):
    """
    Create shimmer animation frames by pulsing brightness/contrast
    Creates a subtle "breathing" effect on the entire image
    """
    frames = []
    base = base_img.convert("RGBA")

    for i in range(num_frames):
        # Create a subtle pulse using sine wave (0 to 2pi over num_frames)
        phase = (i / num_frames) * 2 * math.pi
        # Brightness varies from 0.97 to 1.03 (subtle 6% variation)
        brightness_factor = 1.0 + 0.03 * math.sin(phase)

        # Apply brightness adjustment
        enhancer = ImageEnhance.Brightness(base)
        frame = enhancer.enhance(brightness_factor)

        frames.append(frame)

    return frames


def create_star_pulse_frames(base_img, num_frames=20):
    """
    Create frames with a pulsing star effect
    The star in the top-right pulses in brightness
    """
    frames = []
    base = base_img.convert("RGBA")
    width, height = base.size

    # Star is approximately in top-right quadrant
    # Based on SVG, star center is around (425, 88) in 512x512
    star_center_x = int(width * 0.83)
    star_center_y = int(height * 0.17)
    star_radius = int(width * 0.12)

    for i in range(num_frames):
        frame = base.copy()
        pixels = frame.load()

        # Create pulse effect using sine wave
        phase = (i / num_frames) * 2 * math.pi
        pulse = 0.5 + 0.5 * math.sin(phase)  # 0 to 1

        # Brighten pixels in star region
        for y in range(max(0, star_center_y - star_radius),
                       min(height, star_center_y + star_radius)):
            for x in range(max(0, star_center_x - star_radius),
                           min(width, star_center_x + star_radius)):
                # Distance from star center
                dist = math.sqrt((x - star_center_x)**2 + (y - star_center_y)**2)
                if dist < star_radius:
                    r, g, b, a = pixels[x, y]
                    # Only affect lighter colored pixels (the star is light teal #c0e1d4)
                    if r > 150 and g > 180 and b > 180 and a > 100:
                        # Apply brightness boost based on pulse and distance
                        factor = 1.0 + 0.15 * pulse * (1 - dist/star_radius)
                        new_r = min(255, int(r * factor))
                        new_g = min(255, int(g * factor))
                        new_b = min(255, int(b * factor))
                        pixels[x, y] = (new_r, new_g, new_b, a)

        frames.append(frame)

    return frames


def save_animated_gif(frames, output_path, duration=140):
    """Save frames as animated GIF"""
    if not frames:
        return

    # Convert RGBA to P (palette) mode for GIF
    palette_frames = []
    for frame in frames:
        # Convert to RGB first (GIF doesn't support alpha well)
        rgb_frame = Image.new("RGB", frame.size, (255, 250, 241))  # cream background
        rgb_frame.paste(frame, mask=frame.split()[3] if frame.mode == "RGBA" else None)
        # Quantize to palette
        p_frame = rgb_frame.quantize(colors=256, method=Image.Quantize.MEDIANCUT)
        palette_frames.append(p_frame)

    palette_frames[0].save(
        output_path,
        save_all=True,
        append_images=palette_frames[1:],
        duration=duration,
        loop=0,
        optimize=True
    )
    print(f"  {os.path.basename(output_path)} ({len(frames)} frames, {duration}ms/frame)")


def main():
    print("=" * 50)
    print("ThemeGPT Animated GIF Generator")
    print("=" * 50)

    # Load source mascot
    source_path = "source-mascot-512.png"
    if not os.path.exists(source_path):
        print(f"Error: {source_path} not found")
        return

    print("\nLoading source mascot...")
    mascot = Image.open(source_path).convert("RGBA")
    print(f"  Source size: {mascot.size}")

    # Create shimmer frames
    print("\nGenerating shimmer animation frames...")
    frames_512 = create_star_pulse_frames(mascot, num_frames=20)

    # Generate 400px and 500px versions
    print("\nCreating animated GIFs...")

    # 400px version
    frames_400 = [f.resize((400, 400), Image.Resampling.LANCZOS) for f in frames_512]
    save_animated_gif(frames_400, "icons/animated-clean-400.gif", duration=140)

    # 500px version
    frames_500 = [f.resize((500, 500), Image.Resampling.LANCZOS) for f in frames_512]
    save_animated_gif(frames_500, "icons/animated-clean-500.gif", duration=140)

    print("\n" + "=" * 50)
    print("Animated GIF generation complete!")
    print("=" * 50)


if __name__ == "__main__":
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    main()
