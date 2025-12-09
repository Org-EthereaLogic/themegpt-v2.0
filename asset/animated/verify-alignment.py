#!/usr/bin/env python3
"""
ThemeGPT Mascot Wink GIF Alignment Verification

Extracts frames from the generated GIF and verifies pixel alignment
between static and wink frames to detect any visual jitter.

No external dependencies beyond PIL/Pillow.
"""

import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageChops

# Configuration
GIF_PATH = Path(__file__).parent / "mascot-wink.gif"
DIFF_OUTPUT = Path(__file__).parent / "mascot-wink-diff.png"

# Eye region to exclude from alignment check (wink changes are expected here)
EYE_CENTER_X = 175
EYE_CENTER_Y = 218
EYE_RADIUS = 25  # Slightly larger exclusion zone

# Alignment tolerance - GIF palette quantization can cause minor color shifts (0-50)
# Values under 50 are acceptable palette artifacts, not alignment issues
TOLERANCE_PIXELS = 50


def extract_frames(gif_path: Path) -> list[Image.Image]:
    """Extract all frames from an animated GIF."""
    frames = []
    with Image.open(gif_path) as gif:
        for i in range(gif.n_frames):
            gif.seek(i)
            frames.append(gif.copy().convert("RGB"))
    return frames


def create_eye_mask(width: int, height: int) -> Image.Image:
    """Create a mask that excludes the eye region (white = include, black = exclude)."""
    mask = Image.new("L", (width, height), 255)
    draw = ImageDraw.Draw(mask)

    # Draw black circle for eye exclusion
    draw.ellipse(
        [
            EYE_CENTER_X - EYE_RADIUS,
            EYE_CENTER_Y - EYE_RADIUS,
            EYE_CENTER_X + EYE_RADIUS,
            EYE_CENTER_Y + EYE_RADIUS,
        ],
        fill=0,
    )
    return mask


def calculate_frame_diff(
    frame1: Image.Image, frame2: Image.Image, mask: Image.Image
) -> tuple[int, int]:
    """
    Calculate pixel difference between two frames, excluding masked region.

    Returns:
        Tuple of (max_pixel_diff, total_diff_pixels)
    """
    # Get difference image
    diff = ImageChops.difference(frame1, frame2)

    # Apply mask (multiply by mask to zero out excluded region)
    diff_r, diff_g, diff_b = diff.split()
    masked_r = ImageChops.multiply(diff_r, mask)
    masked_g = ImageChops.multiply(diff_g, mask)
    masked_b = ImageChops.multiply(diff_b, mask)

    # Get max value across channels
    max_r = max(masked_r.getdata())
    max_g = max(masked_g.getdata())
    max_b = max(masked_b.getdata())
    max_diff = max(max_r, max_g, max_b)

    # Count non-zero pixels
    diff_pixels = sum(1 for p in masked_r.getdata() if p > 0)
    diff_pixels += sum(1 for p in masked_g.getdata() if p > 0)
    diff_pixels += sum(1 for p in masked_b.getdata() if p > 0)

    return max_diff, diff_pixels


def create_diff_visualization(
    frames: list[Image.Image], baseline: Image.Image, mask: Image.Image
) -> Image.Image:
    """Create a visualization showing frame differences."""
    width, height = baseline.size

    # Create composite showing differences
    num_frames = min(len(frames), 6)
    output = Image.new("RGB", (width * num_frames, height), (255, 255, 255))

    for i, frame in enumerate(frames[:num_frames]):
        # Calculate difference
        diff = ImageChops.difference(baseline, frame)

        # Amplify differences for visibility (multiply by 10, capped at 255)
        diff_enhanced = diff.point(lambda x: min(x * 10, 255))

        # Mark eye region in gray
        gray_overlay = Image.new("RGB", (width, height), (128, 128, 128))
        diff_with_mask = Image.composite(diff_enhanced, gray_overlay, mask)

        output.paste(diff_with_mask, (i * width, 0))

    return output


def main():
    print("ThemeGPT Mascot Wink GIF Alignment Verification")
    print("=" * 50)

    # Check GIF exists
    if not GIF_PATH.exists():
        print(f"\nERROR: GIF not found at {GIF_PATH}")
        print("Run generate-wink-gif.py first.")
        return 1

    # Extract frames
    print(f"\nExtracting frames from: {GIF_PATH}")
    frames = extract_frames(GIF_PATH)
    print(f"  Total frames: {len(frames)}")

    if len(frames) < 2:
        print("ERROR: GIF must have at least 2 frames")
        return 1

    # Get frame dimensions
    width, height = frames[0].size
    print(f"  Frame size: {width}x{height}")

    # Create eye exclusion mask
    print(f"\nCreating eye exclusion mask:")
    print(f"  Eye center: ({EYE_CENTER_X}, {EYE_CENTER_Y})")
    print(f"  Exclusion radius: {EYE_RADIUS}px")
    mask = create_eye_mask(width, height)
    excluded_pixels = sum(1 for p in mask.getdata() if p == 0)
    total_pixels = width * height
    print(
        f"  Excluded pixels: {excluded_pixels} ({100*excluded_pixels/total_pixels:.1f}%)"
    )

    # Use first frame as baseline
    baseline = frames[0]

    # Check alignment for all frames
    print(f"\nAlignment Verification Results")
    print("=" * 50)
    print(
        f"Source eye position: ({EYE_CENTER_X - EYE_RADIUS}, {EYE_CENTER_Y - EYE_RADIUS}) - ({EYE_CENTER_X + EYE_RADIUS}, {EYE_CENTER_Y + EYE_RADIUS})"
    )
    print("Frame alignment check:")

    all_pass = True
    max_deviation = 0
    wink_start = len(frames) - 4  # Last 4 frames are wink frames

    for i, frame in enumerate(frames):
        max_diff, diff_pixels = calculate_frame_diff(baseline, frame, mask)

        if i == 0:
            status = "✓ baseline"
        else:
            max_deviation = max(max_deviation, max_diff)
            if max_diff <= TOLERANCE_PIXELS:
                status = f"✓ deviation: {max_diff}px"
            else:
                status = f"✗ deviation: {max_diff}px (exceeds tolerance)"
                all_pass = False

        # Label frame type
        if i == 0:
            frame_type = "static"
        elif i >= wink_start:
            frame_type = f"wink-{i - wink_start + 1}"
        else:
            frame_type = "static"

        # Only print key frames
        if i == 0 or i >= wink_start or max_diff > 0:
            print(f"  Frame {i + 1:2d} ({frame_type:7s}): {status}")

    # Summary
    print(f"\n{'=' * 50}")
    if all_pass:
        print("Result: PASS - All frames aligned within tolerance")
    else:
        print("Result: FAIL - Some frames have alignment issues")

    print(f"\nMetrics:")
    print(f"  Maximum deviation: {max_deviation}px")
    print(f"  Tolerance: {TOLERANCE_PIXELS}px")

    # Create diff visualization
    print(f"\nGenerating diff visualization...")
    # Select key frames: first static, and all wink frames
    key_frames = [frames[0]] + frames[wink_start:]
    diff_img = create_diff_visualization(key_frames, baseline, mask)
    diff_img.save(DIFF_OUTPUT)
    print(f"  Saved to: {DIFF_OUTPUT}")

    print(f"\n{'=' * 50}")
    print("VERIFICATION COMPLETE")

    return 0 if all_pass else 1


if __name__ == "__main__":
    sys.exit(main())
