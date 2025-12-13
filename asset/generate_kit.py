#!/usr/bin/env python3
"""
ThemeGPT Logo Kit Generator
Generates all standard sizes and variants for web development
"""

from PIL import Image
import os

# Paths - two separate sources: logo (with wordmark) and mascot (icon only)
SOURCE_LOGO = "source-logo-512.png"
SOURCE_MASCOT = "source-mascot-512.png"
ICONS_DIR = "icons"
FAVICONS_DIR = "favicons"
SOCIAL_DIR = "social"
VARIANTS_DIR = "variants"

# Brand colors from spec
# Support both canonical cream (#FAF6F0) and observed SVG background (#FFFAF1)
CREAM_BG = (250, 246, 240)       # #FAF6F0 - canonical brand cream
CREAM_ALT = (255, 250, 241)     # #FFFAF1 - observed SVG background
DARK_BG = (30, 30, 30)          # Dark mode background
WHITE = (255, 255, 255)
TRANSPARENT = (0, 0, 0, 0)


def load_logo():
    """Load the logo source (includes wordmark)"""
    return Image.open(SOURCE_LOGO).convert("RGBA")


def load_mascot():
    """Load the mascot source (icon only, no wordmark)"""
    return Image.open(SOURCE_MASCOT).convert("RGBA")


def resize_with_quality(img, size, resample=Image.Resampling.LANCZOS):
    """Resize image maintaining quality"""
    return img.resize((size, size), resample=resample)


def is_cream(r, g, b, tolerance=20):
    """Check if a color is close to cream background (supports both cream variants)"""
    # Check canonical cream #FAF6F0
    canonical_match = (abs(r - CREAM_BG[0]) < tolerance and
                       abs(g - CREAM_BG[1]) < tolerance and
                       abs(b - CREAM_BG[2]) < tolerance)
    # Check alt cream #FFFAF1
    alt_match = (abs(r - CREAM_ALT[0]) < tolerance and
                 abs(g - CREAM_ALT[1]) < tolerance and
                 abs(b - CREAM_ALT[2]) < tolerance)
    return canonical_match or alt_match


def replace_cream_background(img, new_color, tolerance=25):
    """Replace cream background (both variants) with a new color"""
    img = img.convert("RGBA")
    pixels = img.load()
    width, height = img.size

    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            if is_cream(r, g, b, tolerance):
                if len(new_color) == 4:
                    pixels[x, y] = new_color
                else:
                    pixels[x, y] = (*new_color, 255)

    return img


def make_transparent_bg(img, tolerance=25):
    """Make cream background transparent"""
    return replace_cream_background(img, (0, 0, 0, 0), tolerance)


def make_dark_bg(img, tolerance=25):
    """Replace cream background with dark color"""
    return replace_cream_background(img, DARK_BG, tolerance)


def make_white_bg(img, tolerance=25):
    """Replace cream background with white"""
    return replace_cream_background(img, WHITE, tolerance)


def generate_icon_sizes(img, output_dir, prefix="icon"):
    """Generate standard icon sizes"""
    sizes = [16, 32, 48, 64, 72, 96, 128, 144, 192, 256, 384, 512]

    for size in sizes:
        resized = resize_with_quality(img, size)
        resized.save(os.path.join(output_dir, f"{prefix}-{size}.png"), "PNG", optimize=True)
        print(f"  {prefix}-{size}.png")


def generate_favicons(logo_img, mascot_img, output_dir):
    """Generate favicon variants"""
    # Standard favicon sizes (using mascot only for small sizes)
    favicon_sizes = [16, 32, 48]

    for size in favicon_sizes:
        resized = resize_with_quality(mascot_img, size)
        resized.save(os.path.join(output_dir, f"favicon-{size}x{size}.png"), "PNG", optimize=True)
        print(f"  favicon-{size}x{size}.png")

    # Apple touch icon (180x180)
    apple_icon = resize_with_quality(mascot_img, 180)
    apple_icon.save(os.path.join(output_dir, "apple-touch-icon.png"), "PNG", optimize=True)
    print(f"  apple-touch-icon.png")

    # Android Chrome icons
    for size in [192, 512]:
        resized = resize_with_quality(mascot_img, size)
        resized.save(os.path.join(output_dir, f"android-chrome-{size}x{size}.png"), "PNG", optimize=True)
        print(f"  android-chrome-{size}x{size}.png")

    # MS Tile
    ms_tile = resize_with_quality(mascot_img, 150)
    ms_tile.save(os.path.join(output_dir, "mstile-150x150.png"), "PNG", optimize=True)
    print(f"  mstile-150x150.png")

    # Safari pinned tab (high-res PNG fallback)
    safari = resize_with_quality(mascot_img, 512)
    safari.save(os.path.join(output_dir, "safari-pinned-tab.png"), "PNG", optimize=True)
    print(f"  safari-pinned-tab.png")


def generate_social_images(img, output_dir):
    """Generate social media sized images"""
    # Open Graph / Facebook (1200x630)
    og = Image.new("RGBA", (1200, 630), CREAM_BG + (255,))
    logo_height = 450
    ratio = logo_height / img.height
    logo_width = int(img.width * ratio)
    resized_logo = img.resize((logo_width, logo_height), Image.Resampling.LANCZOS)
    x = (1200 - logo_width) // 2
    y = (630 - logo_height) // 2
    og.paste(resized_logo, (x, y), resized_logo)
    og.convert("RGB").save(os.path.join(output_dir, "og-image.png"), "PNG", optimize=True)
    print(f"  og-image.png (1200x630)")

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
    print(f"  twitter-card.png (1200x600)")

    # LinkedIn Banner (1584x396)
    linkedin = Image.new("RGBA", (1584, 396), CREAM_BG + (255,))
    logo_height = 300
    ratio = logo_height / img.height
    logo_width = int(img.width * ratio)
    resized_logo = img.resize((logo_width, logo_height), Image.Resampling.LANCZOS)
    x = (1584 - logo_width) // 2
    y = (396 - logo_height) // 2
    linkedin.paste(resized_logo, (x, y), resized_logo)
    linkedin.convert("RGB").save(os.path.join(output_dir, "linkedin-banner.png"), "PNG", optimize=True)
    print(f"  linkedin-banner.png (1584x396)")


def generate_variants(logo_img, mascot_img, output_dir):
    """Generate logo variants (transparent, dark bg, etc.)"""

    # Full logo - transparent background
    transparent = make_transparent_bg(logo_img.copy())
    transparent.save(os.path.join(output_dir, "logo-full-transparent.png"), "PNG", optimize=True)
    print(f"  logo-full-transparent.png")

    # Full logo - white background
    white_bg = make_white_bg(logo_img.copy())
    white_bg.save(os.path.join(output_dir, "logo-full-white.png"), "PNG", optimize=True)
    print(f"  logo-full-white.png")

    # Full logo - dark background
    dark_bg = make_dark_bg(logo_img.copy())
    dark_bg.save(os.path.join(output_dir, "logo-full-dark.png"), "PNG", optimize=True)
    print(f"  logo-full-dark.png")

    # Full logo - original cream
    logo_img.save(os.path.join(output_dir, "logo-full-cream.png"), "PNG", optimize=True)
    print(f"  logo-full-cream.png")

    # Mascot only - transparent
    mascot_trans = make_transparent_bg(mascot_img.copy())
    mascot_trans.save(os.path.join(output_dir, "mascot-transparent.png"), "PNG", optimize=True)
    print(f"  mascot-transparent.png")

    # Mascot only - cream
    mascot_img.save(os.path.join(output_dir, "mascot-cream.png"), "PNG", optimize=True)
    print(f"  mascot-cream.png")

    # Mascot only - dark
    mascot_dark = make_dark_bg(mascot_img.copy())
    mascot_dark.save(os.path.join(output_dir, "mascot-dark.png"), "PNG", optimize=True)
    print(f"  mascot-dark.png")

    # Mascot only - white
    mascot_white = make_white_bg(mascot_img.copy())
    mascot_white.save(os.path.join(output_dir, "mascot-white.png"), "PNG", optimize=True)
    print(f"  mascot-white.png")


def create_ico_file(mascot_img, output_dir):
    """Create .ico file with multiple sizes"""
    sizes = [(16, 16), (32, 32), (48, 48)]
    icons = []

    for size in sizes:
        resized = mascot_img.resize(size, Image.Resampling.LANCZOS)
        icons.append(resized)

    icons[0].save(
        os.path.join(output_dir, "favicon.ico"),
        format="ICO",
        sizes=sizes,
        append_images=icons[1:]
    )
    print(f"  favicon.ico (16x16, 32x32, 48x48)")


def create_webmanifest(output_dir):
    """Create site.webmanifest file"""
    manifest = """{
  "name": "ThemeGPT",
  "short_name": "ThemeGPT",
  "description": "Customize ChatGPT with beautiful themes",
  "icons": [
    {
      "src": "/android-chrome-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/android-chrome-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ],
  "theme_color": "#FAF6F0",
  "background_color": "#FAF6F0",
  "display": "standalone",
  "start_url": "/",
  "scope": "/"
}
"""
    with open(os.path.join(output_dir, "site.webmanifest"), "w") as f:
        f.write(manifest)
    print(f"  site.webmanifest")


def main():
    print("=" * 50)
    print("ThemeGPT Logo Kit Generator")
    print("=" * 50)

    # Load sources
    print("\nLoading source images...")
    logo = load_logo()
    mascot = load_mascot()
    print(f"  Logo size: {logo.size[0]}x{logo.size[1]}")
    print(f"  Mascot size: {mascot.size[0]}x{mascot.size[1]}")

    # Generate logo icons
    print("\nGenerating logo icon sizes...")
    generate_icon_sizes(logo, ICONS_DIR, "logo")

    # Generate mascot-only icons
    print("\nGenerating mascot-only icons...")
    generate_icon_sizes(mascot, ICONS_DIR, "mascot")

    # Generate favicons
    print("\nGenerating favicons...")
    generate_favicons(logo, mascot, FAVICONS_DIR)
    create_ico_file(mascot, FAVICONS_DIR)
    create_webmanifest(FAVICONS_DIR)

    # Generate social images
    print("\nGenerating social media images...")
    generate_social_images(logo, SOCIAL_DIR)

    # Generate variants
    print("\nGenerating logo variants...")
    generate_variants(logo, mascot, VARIANTS_DIR)

    print("\n" + "=" * 50)
    print("Logo kit generation complete!")
    print("=" * 50)


if __name__ == "__main__":
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    main()
