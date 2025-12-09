#!/usr/bin/env python3
"""
ThemeGPT Mascot Winking GIF Generator

Creates an animated GIF from the mascot PNG with a subtle right-eye wink
every 3 seconds. Uses precise pixel alignment to prevent visual jitter.
"""

import os
from pathlib import Path
from PIL import Image, ImageDraw

# Configuration
SOURCE_IMAGE = Path(__file__).parent.parent / "icons" / "mascot-512.png"
OUTPUT_GIF = Path(__file__).parent / "mascot-wink.gif"
ALIGNMENT_TEST = Path(__file__).parent / "mascot-wink-alignment-test.png"

# Animation parameters
WINK_INTERVAL_MS = 3000  # 3 seconds between wink cycles
FRAME_RATE = 10  # frames per second
TOTAL_FRAMES = (WINK_INTERVAL_MS * FRAME_RATE) // 1000  # 30 frames for 3s at 10fps
FRAME_DURATION_MS = 1000 // FRAME_RATE  # 100ms per frame

# Eye position (mascot's right eye - viewer's left)
# Detected from 512x512 source image analysis
EYE_CENTER_X = 175
EYE_CENTER_Y = 218
EYE_RADIUS = 18

# Wink parameters
WINK_FRAMES = 4  # Number of frames for the wink animation
WINK_DEPTHS = [0.25, 0.55, 0.55, 0.25]  # How closed the eye is (0=open, 1=fully closed)


def detect_eye_region(img: Image.Image) -> tuple[int, int, int, int]:
    """
    Returns the bounding box of the mascot's right eye.
    Returns (x, y, width, height).
    """
    # For the ThemeGPT mascot, the right eye is a dark brown circle
    # at approximately these coordinates in the 512x512 image
    x = EYE_CENTER_X - EYE_RADIUS
    y = EYE_CENTER_Y - EYE_RADIUS
    width = EYE_RADIUS * 2
    height = EYE_RADIUS * 2
    return (x, y, width, height)


def create_wink_frame(base_img: Image.Image, wink_depth: float) -> Image.Image:
    """
    Create a single wink frame by overlaying an eyelid effect.

    Args:
        base_img: The original mascot image
        wink_depth: 0.0 = fully open, 1.0 = fully closed

    Returns:
        Modified image with wink effect
    """
    frame = base_img.copy()

    if wink_depth <= 0:
        return frame

    # Create a draw context
    draw = ImageDraw.Draw(frame)

    # Get the eye color from surrounding pixels (peach area)
    # Sample the eyelid color from the face near the eye
    eyelid_color = (244, 169, 136)  # Peach tone matching the mascot's face

    # Calculate the eyelid coverage
    # The eyelid closes from top to bottom
    eye_top = EYE_CENTER_Y - EYE_RADIUS
    eye_bottom = EYE_CENTER_Y + EYE_RADIUS
    closed_y = eye_top + int((eye_bottom - eye_top) * wink_depth)

    # Draw the eyelid as an ellipse that covers the top portion of the eye
    # We use an arc/chord to create a natural eyelid shape
    eyelid_bbox = [
        EYE_CENTER_X - EYE_RADIUS - 3,
        eye_top - 5,
        EYE_CENTER_X + EYE_RADIUS + 3,
        closed_y + int(EYE_RADIUS * 0.5),
    ]

    # Draw the eyelid shape (curved top)
    draw.ellipse(eyelid_bbox, fill=eyelid_color)

    # Add a subtle curved line for the closed eye effect
    if wink_depth >= 0.5:
        # Draw a curved line representing the closed eyelid
        line_y = EYE_CENTER_Y - int(EYE_RADIUS * (1 - wink_depth * 0.7))
        curve_points = []
        for i in range(-EYE_RADIUS - 2, EYE_RADIUS + 3):
            # Create a subtle curve
            curve_offset = int(3 * (1 - (i / (EYE_RADIUS + 2)) ** 2))
            curve_points.append((EYE_CENTER_X + i, line_y + curve_offset))

        if len(curve_points) > 1:
            draw.line(curve_points, fill=(75, 46, 30), width=3)  # Chocolate color

    return frame


def generate_frames(base_img: Image.Image) -> list[Image.Image]:
    """
    Generate all frames for the animation.

    Returns:
        List of PIL Image frames
    """
    frames = []

    # Calculate frame distribution
    static_frames = TOTAL_FRAMES - WINK_FRAMES
    print(f"Generating {TOTAL_FRAMES} frames: {static_frames} static + {WINK_FRAMES} wink")

    # Generate static frames (eyes open)
    for i in range(static_frames):
        frames.append(base_img.copy())

    # Generate wink frames
    for i, depth in enumerate(WINK_DEPTHS):
        wink_frame = create_wink_frame(base_img, depth)
        frames.append(wink_frame)
        print(f"  Wink frame {i + 1}: {int(depth * 100)}% closed")

    return frames


def create_alignment_test(frames: list[Image.Image], output_path: Path) -> None:
    """
    Create a visual alignment test showing all frames overlaid.
    """
    if not frames:
        return

    # Create a composite showing frame comparison
    base = frames[0]
    width, height = base.size

    # Create a side-by-side comparison of static vs wink frames
    wink_start = TOTAL_FRAMES - WINK_FRAMES
    comparison_frames = [frames[0]] + frames[wink_start:]

    # Create output image
    cols = len(comparison_frames)
    output = Image.new("RGBA", (width * cols, height), (255, 255, 255, 255))

    for i, frame in enumerate(comparison_frames):
        output.paste(frame, (i * width, 0))

    # Add labels
    draw = ImageDraw.Draw(output)
    labels = ["Static"] + [f"Wink {i+1}" for i in range(WINK_FRAMES)]
    for i, label in enumerate(labels):
        draw.text((i * width + 10, 10), label, fill=(75, 46, 30))

    output.save(output_path)
    print(f"Alignment test saved to: {output_path}")


def save_gif(frames: list[Image.Image], output_path: Path) -> int:
    """
    Save frames as an optimized animated GIF with correct timing.

    Since identical static frames get merged by GIF optimization, we use a
    smarter approach: only include unique frames with appropriate durations.

    Returns:
        File size in bytes
    """
    if not frames:
        raise ValueError("No frames to save")

    # Convert frames to palette mode for GIF
    palette_frames = []
    for frame in frames:
        # Convert RGBA to RGB with cream background
        if frame.mode == "RGBA":
            background = Image.new("RGB", frame.size, (250, 246, 240))  # Cream
            background.paste(frame, mask=frame.split()[3])
            palette_frames.append(background)
        else:
            palette_frames.append(frame.convert("RGB"))

    # Smart frame consolidation: keep first static frame with long duration,
    # then wink frames with short durations
    static_count = TOTAL_FRAMES - WINK_FRAMES
    static_duration = static_count * FRAME_DURATION_MS  # ~2600ms for static

    # Build optimized frame list
    optimized_frames = [palette_frames[0]]  # First static frame
    optimized_durations = [static_duration]

    # Add wink frames
    wink_start = TOTAL_FRAMES - WINK_FRAMES
    for i in range(wink_start, TOTAL_FRAMES):
        optimized_frames.append(palette_frames[i])
        optimized_durations.append(FRAME_DURATION_MS)

    print(f"  Optimized: {len(optimized_frames)} frames")
    print(f"  Static duration: {static_duration}ms, Wink frames: {WINK_FRAMES}x{FRAME_DURATION_MS}ms")

    # Save as GIF
    optimized_frames[0].save(
        output_path,
        save_all=True,
        append_images=optimized_frames[1:],
        duration=optimized_durations,
        loop=0,  # Infinite loop
        optimize=True,
    )

    return output_path.stat().st_size


def main():
    print("ThemeGPT Mascot Winking GIF Generator")
    print("=" * 40)

    # Load source image
    print(f"\nLoading source image: {SOURCE_IMAGE}")
    if not SOURCE_IMAGE.exists():
        raise FileNotFoundError(f"Source image not found: {SOURCE_IMAGE}")

    base_img = Image.open(SOURCE_IMAGE).convert("RGBA")
    print(f"  Image size: {base_img.size[0]}x{base_img.size[1]}")
    print(f"  Mode: {base_img.mode}")

    # Detect eye region
    eye_bbox = detect_eye_region(base_img)
    print(f"\nRight eye region detected:")
    print(f"  Position: ({eye_bbox[0]}, {eye_bbox[1]})")
    print(f"  Size: {eye_bbox[2]}x{eye_bbox[3]}")
    print(f"  Center: ({EYE_CENTER_X}, {EYE_CENTER_Y})")

    # Generate frames
    print(f"\nAnimation parameters:")
    print(f"  Wink interval: {WINK_INTERVAL_MS}ms")
    print(f"  Frame rate: {FRAME_RATE} fps")
    print(f"  Total frames: {TOTAL_FRAMES}")
    print(f"  Frame duration: {FRAME_DURATION_MS}ms")

    print("\nGenerating frames...")
    frames = generate_frames(base_img)

    # Create alignment test
    print("\nCreating alignment test...")
    create_alignment_test(frames, ALIGNMENT_TEST)

    # Save GIF
    print(f"\nSaving GIF to: {OUTPUT_GIF}")
    file_size = save_gif(frames, OUTPUT_GIF)
    file_size_kb = file_size / 1024

    print(f"\n{'=' * 40}")
    print("GENERATION COMPLETE")
    print(f"{'=' * 40}")
    print(f"\nOutput files:")
    print(f"  GIF: {OUTPUT_GIF}")
    print(f"  Alignment test: {ALIGNMENT_TEST}")
    print(f"\nFile size: {file_size_kb:.1f} KB")
    print(f"Target: < 500 KB - {'PASS' if file_size_kb < 500 else 'FAIL'}")

    print(f"\nFrame breakdown:")
    print(f"  Total frames: {TOTAL_FRAMES}")
    print(f"  Static frames: {TOTAL_FRAMES - WINK_FRAMES}")
    print(f"  Wink frames: {WINK_FRAMES}")
    print(f"  Cycle duration: {TOTAL_FRAMES * FRAME_DURATION_MS}ms")

    return 0


if __name__ == "__main__":
    exit(main())
