#!/usr/bin/env python3
"""
ThemeGPT Logo Kit Generator
Generates all standard sizes and variants for web development
"""

from PIL import Image, ImageDraw
import os

# Paths
SOURCE = "source-512.png"
ICONS_DIR = "icons"
FAVICONS_DIR = "favicons"
SOCIAL_DIR = "social"
VARIANTS_DIR = "variants"

# Brand colors from spec
CREAM_BG = (250, 246, 240)  # #FAF6F0
DARK_BG = (30, 30, 30)      # Dark mode background
WHITE = (255, 255, 255)
TRANSPARENT = (0, 0, 0, 0)

def load_source():
    """Load the source logo"""
    return Image.open(SOURCE).convert("RGBA")

def resize_with_quality(img, size, resample=Image.Resampling.LANCZOS):
    """Resize image maintaining quality"""
    return img.resize((size, size), resample=resample)

def extract_mascot(img):
    """
    Extract just the mascot (icon) without wordmark
    The mascot is roughly in the upper 65% of the image
    """
    width, height = img.size
    # Mascot is centered horizontally and in upper portion
    # Estimate: mascot takes up roughly top 60-65% of height
    mascot_bottom = int(height * 0.62)
    
    # Find the actual mascot bounds by looking for non-background pixels
    pixels = img.load()
    
    # Find top (first non-cream row)
    top = 0
    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            if a > 200 and not is_cream(r, g, b):
                top = y
                break
        else:
            continue
        break
    
    # Find bottom of mascot (before wordmark)
    bottom = mascot_bottom
    
    # Find left edge
    left = width
    for y in range(top, bottom):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            if a > 200 and not is_cream(r, g, b):
                left = min(left, x)
                break
    
    # Find right edge
    right = 0
    for y in range(top, bottom):
        for x in range(width - 1, -1, -1):
            r, g, b, a = pixels[x, y]
            if a > 200 and not is_cream(r, g, b):
                right = max(right, x)
                break
    
    # Add some padding
    padding = int((right - left) * 0.08)
    left = max(0, left - padding)
    right = min(width, right + padding)
    top = max(0, top - padding)
    bottom = min(mascot_bottom, bottom + padding // 2)
    
    # Make it square
    crop_width = right - left
    crop_height = bottom - top
    size = max(crop_width, crop_height)
    
    # Center the crop
    center_x = (left + right) // 2
    center_y = (top + bottom) // 2
    
    half = size // 2
    crop_left = center_x - half
    crop_top = center_y - half
    crop_right = center_x + half
    crop_bottom = center_y + half
    
    # Adjust if out of bounds
    if crop_left < 0:
        crop_right -= crop_left
        crop_left = 0
    if crop_top < 0:
        crop_bottom -= crop_top
        crop_top = 0
    
    return img.crop((crop_left, crop_top, crop_right, crop_bottom))

def is_cream(r, g, b, tolerance=20):
    """Check if a color is close to cream background"""
    return (abs(r - CREAM_BG[0]) < tolerance and 
            abs(g - CREAM_BG[1]) < tolerance and 
            abs(b - CREAM_BG[2]) < tolerance)

def replace_background(img, old_color, new_color, tolerance=25):
    """Replace background color with a new color"""
    img = img.convert("RGBA")
    pixels = img.load()
    width, height = img.size
    
    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            if (abs(r - old_color[0]) < tolerance and 
                abs(g - old_color[1]) < tolerance and 
                abs(b - old_color[2]) < tolerance):
                if len(new_color) == 4:
                    pixels[x, y] = new_color
                else:
                    pixels[x, y] = (*new_color, 255)
    
    return img

def make_transparent_bg(img, tolerance=25):
    """Make cream background transparent"""
    return replace_background(img, CREAM_BG, (0, 0, 0, 0), tolerance)

def make_dark_bg(img, tolerance=25):
    """Replace cream background with dark color"""
    return replace_background(img, CREAM_BG, DARK_BG, tolerance)

def make_white_bg(img, tolerance=25):
    """Replace cream background with white"""
    return replace_background(img, CREAM_BG, WHITE, tolerance)

def generate_icon_sizes(img, output_dir, prefix="icon"):
    """Generate standard icon sizes"""
    sizes = [16, 32, 48, 64, 72, 96, 128, 144, 192, 256, 384, 512]
    
    for size in sizes:
        resized = resize_with_quality(img, size)
        # Save as PNG
        resized.save(os.path.join(output_dir, f"{prefix}-{size}.png"), "PNG", optimize=True)
        print(f"  ✓ {prefix}-{size}.png")

def generate_favicons(img, mascot_img, output_dir):
    """Generate favicon variants"""
    # Standard favicon sizes (using mascot only for small sizes)
    favicon_sizes = [16, 32, 48]
    
    for size in favicon_sizes:
        resized = resize_with_quality(mascot_img, size)
        resized.save(os.path.join(output_dir, f"favicon-{size}x{size}.png"), "PNG", optimize=True)
        print(f"  ✓ favicon-{size}x{size}.png")
    
    # Apple touch icon (180x180)
    apple_icon = resize_with_quality(mascot_img, 180)
    apple_icon.save(os.path.join(output_dir, "apple-touch-icon.png"), "PNG", optimize=True)
    print(f"  ✓ apple-touch-icon.png")
    
    # Android Chrome icons
    for size in [192, 512]:
        resized = resize_with_quality(mascot_img, size)
        resized.save(os.path.join(output_dir, f"android-chrome-{size}x{size}.png"), "PNG", optimize=True)
        print(f"  ✓ android-chrome-{size}x{size}.png")
    
    # MS Tile
    ms_tile = resize_with_quality(mascot_img, 150)
    ms_tile.save(os.path.join(output_dir, "mstile-150x150.png"), "PNG", optimize=True)
    print(f"  ✓ mstile-150x150.png")
    
    # Safari pinned tab (SVG would be ideal, but we'll provide a high-contrast PNG)
    safari = resize_with_quality(mascot_img, 512)
    safari.save(os.path.join(output_dir, "safari-pinned-tab.png"), "PNG", optimize=True)
    print(f"  ✓ safari-pinned-tab.png")

def generate_social_images(img, output_dir):
    """Generate social media sized images"""
    # Open Graph / Facebook (1200x630)
    og = Image.new("RGBA", (1200, 630), CREAM_BG + (255,))
    # Center the logo
    logo_height = 450
    ratio = logo_height / img.height
    logo_width = int(img.width * ratio)
    resized_logo = img.resize((logo_width, logo_height), Image.Resampling.LANCZOS)
    x = (1200 - logo_width) // 2
    y = (630 - logo_height) // 2
    og.paste(resized_logo, (x, y), resized_logo)
    og.convert("RGB").save(os.path.join(output_dir, "og-image.png"), "PNG", optimize=True)
    print(f"  ✓ og-image.png (1200x630)")
    
    # Twitter Card (1200x600)
    twitter = Image.new("RGBA", (1200, 600), CREAM_BG + (255,))
    logo_height = 420
    ratio = logo_height / img.height
    logo_width = int(img.width * ratio)
    resized_logo = img.resize((logo_width, logo_height), Image.Resampling.LANCZOS)
    x = (1200 - logo_width) // 2
    y = (600 - logo_height) // 2
    twitter.paste(resized_logo, (x, y), resized_logo)
    twitter.convert("RGB").save(os.path.join(output_dir, "twitter-card.png"), "PNG", optimize=True)
    print(f"  ✓ twitter-card.png (1200x600)")
    
    # LinkedIn Banner (1584x396) - wider format
    linkedin = Image.new("RGBA", (1584, 396), CREAM_BG + (255,))
    logo_height = 300
    ratio = logo_height / img.height
    logo_width = int(img.width * ratio)
    resized_logo = img.resize((logo_width, logo_height), Image.Resampling.LANCZOS)
    x = (1584 - logo_width) // 2
    y = (396 - logo_height) // 2
    linkedin.paste(resized_logo, (x, y), resized_logo)
    linkedin.convert("RGB").save(os.path.join(output_dir, "linkedin-banner.png"), "PNG", optimize=True)
    print(f"  ✓ linkedin-banner.png (1584x396)")

def generate_variants(img, mascot_img, output_dir):
    """Generate logo variants (transparent, dark bg, etc.)"""
    
    # Full logo - transparent background
    transparent = make_transparent_bg(img.copy())
    transparent.save(os.path.join(output_dir, "logo-full-transparent.png"), "PNG", optimize=True)
    print(f"  ✓ logo-full-transparent.png")
    
    # Full logo - white background
    white_bg = make_white_bg(img.copy())
    white_bg.save(os.path.join(output_dir, "logo-full-white.png"), "PNG", optimize=True)
    print(f"  ✓ logo-full-white.png")
    
    # Full logo - dark background
    dark_bg = make_dark_bg(img.copy())
    dark_bg.save(os.path.join(output_dir, "logo-full-dark.png"), "PNG", optimize=True)
    print(f"  ✓ logo-full-dark.png")
    
    # Full logo - original cream
    img.save(os.path.join(output_dir, "logo-full-cream.png"), "PNG", optimize=True)
    print(f"  ✓ logo-full-cream.png")
    
    # Mascot only - transparent
    mascot_trans = make_transparent_bg(mascot_img.copy())
    mascot_trans.save(os.path.join(output_dir, "mascot-transparent.png"), "PNG", optimize=True)
    print(f"  ✓ mascot-transparent.png")
    
    # Mascot only - cream
    mascot_img.save(os.path.join(output_dir, "mascot-cream.png"), "PNG", optimize=True)
    print(f"  ✓ mascot-cream.png")
    
    # Mascot only - dark
    mascot_dark = make_dark_bg(mascot_img.copy())
    mascot_dark.save(os.path.join(output_dir, "mascot-dark.png"), "PNG", optimize=True)
    print(f"  ✓ mascot-dark.png")
    
    # Mascot only - white
    mascot_white = make_white_bg(mascot_img.copy())
    mascot_white.save(os.path.join(output_dir, "mascot-white.png"), "PNG", optimize=True)
    print(f"  ✓ mascot-white.png")

def create_ico_file(mascot_img, output_dir):
    """Create .ico file with multiple sizes"""
    sizes = [(16, 16), (32, 32), (48, 48)]
    icons = []
    
    for size in sizes:
        resized = mascot_img.resize(size, Image.Resampling.LANCZOS)
        icons.append(resized)
    
    # Save as ICO
    icons[0].save(
        os.path.join(output_dir, "favicon.ico"),
        format="ICO",
        sizes=sizes,
        append_images=icons[1:]
    )
    print(f"  ✓ favicon.ico (16x16, 32x32, 48x48)")

def main():
    print("=" * 50)
    print("ThemeGPT Logo Kit Generator")
    print("=" * 50)
    
    # Load source
    print("\n📁 Loading source image...")
    img = load_source()
    print(f"  Source size: {img.size[0]}x{img.size[1]}")
    
    # Extract mascot
    print("\n🎨 Extracting mascot...")
    mascot = extract_mascot(img)
    print(f"  Mascot size: {mascot.size[0]}x{mascot.size[1]}")
    
    # Generate icons
    print("\n📐 Generating icon sizes...")
    generate_icon_sizes(img, ICONS_DIR, "logo")
    
    # Generate mascot-only icons
    print("\n🎯 Generating mascot-only icons...")
    generate_icon_sizes(mascot, ICONS_DIR, "mascot")
    
    # Generate favicons
    print("\n⭐ Generating favicons...")
    generate_favicons(img, mascot, FAVICONS_DIR)
    create_ico_file(mascot, FAVICONS_DIR)
    
    # Generate social images
    print("\n📱 Generating social media images...")
    generate_social_images(img, SOCIAL_DIR)
    
    # Generate variants
    print("\n🎨 Generating logo variants...")
    generate_variants(img, mascot, VARIANTS_DIR)
    
    print("\n" + "=" * 50)
    print("✅ Logo kit generation complete!")
    print("=" * 50)

if __name__ == "__main__":
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    main()
