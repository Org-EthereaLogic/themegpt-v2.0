#!/usr/bin/env python3
"""
ThemeGPT Brand Kit Generator
Generates comprehensive brand assets from source mascot and logo.
"""

from PIL import Image, ImageDraw, ImageFont
import os

# =============================================================================
# Brand Colors
# =============================================================================
CREAM = (250, 246, 240)       # #FAF6F0 - Primary background
WHITE = (255, 255, 255)       # #FFFFFF - Universal background
CHOCOLATE = (75, 46, 30)      # #4B2E1E - Primary text
PEACH = (244, 169, 136)       # #F4A988 - CTA accent
TEAL = (126, 206, 197)        # #7ECEC5 - Secondary accent

# =============================================================================
# Paths
# =============================================================================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(os.path.dirname(BASE_DIR))
GIF_PATH = os.path.join(PROJECT_ROOT, 'asset/GIFs/animated-mascot-400-transparent.gif')
CLEAN_MASCOT_PATH = os.path.join(PROJECT_ROOT, 'asset/GIFs/mascot-clean-400.png')

# =============================================================================
# Helper Functions
# =============================================================================

def load_mascot():
    """Load cleaned mascot (artifact-free)."""
    # Prefer cleaned mascot if available
    if os.path.exists(CLEAN_MASCOT_PATH):
        return Image.open(CLEAN_MASCOT_PATH).convert('RGBA')
    # Fallback to GIF extraction
    with Image.open(GIF_PATH) as img:
        img.seek(0)
        return img.convert('RGBA')

def add_background(img, bg_color, padding=0):
    """Add solid background to transparent image."""
    if padding > 0:
        new_size = (img.width + padding * 2, img.height + padding * 2)
        bg = Image.new('RGBA', new_size, bg_color + (255,))
        bg.paste(img, (padding, padding), img)
        return bg
    else:
        bg = Image.new('RGBA', img.size, bg_color + (255,))
        bg.paste(img, (0, 0), img)
        return bg

def create_logo(mascot, size, with_text=True):
    """Create logo with mascot and optional text."""
    if not with_text:
        return mascot.resize((size, size), Image.Resampling.LANCZOS)

    # Logo with text: mascot on left, text on right
    mascot_size = size
    spacing = int(size * 0.15)

    mascot_resized = mascot.resize((mascot_size, mascot_size), Image.Resampling.LANCZOS)

    # Calculate text dimensions
    font_size = int(size * 0.35)
    try:
        font = ImageFont.truetype('/System/Library/Fonts/Helvetica.ttc', font_size)
    except:
        font = ImageFont.load_default()

    # Measure text
    temp_img = Image.new('RGBA', (1, 1))
    temp_draw = ImageDraw.Draw(temp_img)
    bbox = temp_draw.textbbox((0, 0), 'ThemeGPT', font=font)
    text_w = bbox[2] - bbox[0]
    text_h = bbox[3] - bbox[1]

    # Create canvas
    logo_width = mascot_size + spacing + text_w + spacing
    logo = Image.new('RGBA', (logo_width, mascot_size), (0, 0, 0, 0))

    # Paste mascot
    logo.paste(mascot_resized, (0, 0), mascot_resized)

    # Draw text
    draw = ImageDraw.Draw(logo)
    text_x = mascot_size + spacing
    text_y = (mascot_size - text_h) // 2 - bbox[1]
    draw.text((text_x, text_y), 'ThemeGPT', fill=CHOCOLATE, font=font)

    return logo

def create_social_asset(mascot, width, height, bg_color, mascot_scale=0.6, center=True):
    """Create a social media asset with mascot centered on background."""
    canvas = Image.new('RGBA', (width, height), bg_color + (255,))

    # Scale mascot to fit
    max_dim = min(width, height) * mascot_scale
    mascot_resized = mascot.resize((int(max_dim), int(max_dim)), Image.Resampling.LANCZOS)

    # Center position
    if center:
        x = (width - mascot_resized.width) // 2
        y = (height - mascot_resized.height) // 2
    else:
        x = (width - mascot_resized.width) // 2
        y = int(height * 0.1)  # Top-aligned with padding

    canvas.paste(mascot_resized, (x, y), mascot_resized)
    return canvas

def create_banner(mascot, width, height, bg_color, include_text=True):
    """Create a banner with logo positioned appropriately."""
    canvas = Image.new('RGBA', (width, height), bg_color + (255,))

    # For wide banners, put logo on left side
    logo_height = int(height * 0.7)
    logo = create_logo(mascot, logo_height, with_text=include_text)

    # Scale if too wide
    if logo.width > width * 0.8:
        scale = (width * 0.8) / logo.width
        logo = logo.resize((int(logo.width * scale), int(logo.height * scale)), Image.Resampling.LANCZOS)

    x = (width - logo.width) // 2
    y = (height - logo.height) // 2

    canvas.paste(logo, (x, y), logo)
    return canvas

def save_asset(img, path, convert_rgb=False):
    """Save image, optionally converting to RGB for JPEG."""
    os.makedirs(os.path.dirname(path), exist_ok=True)
    if convert_rgb or path.endswith('.jpg'):
        img = img.convert('RGB')
    img.save(path)
    print(f"  Created: {os.path.basename(path)} ({img.width}x{img.height})")

# =============================================================================
# Asset Generators
# =============================================================================

def generate_core_assets(mascot):
    """Generate core mascot and logo variants."""
    print("\n[Core Assets]")

    sizes = [512, 256, 128, 64]

    for size in sizes:
        # Mascot - transparent
        m = mascot.resize((size, size), Image.Resampling.LANCZOS)
        save_asset(m, f"{BASE_DIR}/core/mascot/transparent/mascot-{size}.png")

        # Mascot - cream background
        m_cream = add_background(m, CREAM)
        save_asset(m_cream, f"{BASE_DIR}/core/mascot/cream-bg/mascot-{size}-cream.png")

        # Mascot - white background
        m_white = add_background(m, WHITE)
        save_asset(m_white, f"{BASE_DIR}/core/mascot/white-bg/mascot-{size}-white.png")

    # Logo variants
    for size in [512, 256, 128]:
        logo = create_logo(mascot, size)

        # Transparent
        save_asset(logo, f"{BASE_DIR}/core/logo/transparent/logo-{size}.png")

        # With backgrounds (add padding)
        logo_cream = add_background(logo, CREAM, padding=int(size * 0.1))
        save_asset(logo_cream, f"{BASE_DIR}/core/logo/cream-bg/logo-{size}-cream.png")

        logo_white = add_background(logo, WHITE, padding=int(size * 0.1))
        save_asset(logo_white, f"{BASE_DIR}/core/logo/white-bg/logo-{size}-white.png")

def generate_instagram_assets(mascot):
    """Generate Instagram assets."""
    print("\n[Instagram]")

    # Profile picture (320x320, displays at 110x110)
    profile = create_social_asset(mascot, 320, 320, CREAM, mascot_scale=0.85)
    save_asset(profile, f"{BASE_DIR}/social/instagram/ig-profile-320x320.png")

    # Post - Square (1080x1080)
    post_square = create_social_asset(mascot, 1080, 1080, CREAM, mascot_scale=0.5)
    save_asset(post_square, f"{BASE_DIR}/social/instagram/ig-post-square-1080x1080.png")

    # Post - Portrait (1080x1350)
    post_portrait = create_social_asset(mascot, 1080, 1350, CREAM, mascot_scale=0.45)
    save_asset(post_portrait, f"{BASE_DIR}/social/instagram/ig-post-portrait-1080x1350.png")

    # Story (1080x1920)
    story = create_social_asset(mascot, 1080, 1920, CREAM, mascot_scale=0.4, center=False)
    save_asset(story, f"{BASE_DIR}/social/instagram/ig-story-1080x1920.png")

def generate_facebook_assets(mascot):
    """Generate Facebook assets."""
    print("\n[Facebook]")

    # Profile picture (320x320)
    profile = create_social_asset(mascot, 320, 320, CREAM, mascot_scale=0.85)
    save_asset(profile, f"{BASE_DIR}/social/facebook/fb-profile-320x320.png")

    # Cover photo (820x312 desktop)
    cover = create_banner(mascot, 820, 312, CREAM)
    save_asset(cover, f"{BASE_DIR}/social/facebook/fb-cover-820x312.png")

    # Cover photo mobile-safe (640x360)
    cover_mobile = create_banner(mascot, 640, 360, CREAM)
    save_asset(cover_mobile, f"{BASE_DIR}/social/facebook/fb-cover-mobile-640x360.png")

def generate_youtube_assets(mascot):
    """Generate YouTube assets."""
    print("\n[YouTube]")

    # Channel art (2560x1440 full, safe area 1546x423)
    channel_art = create_banner(mascot, 2560, 1440, CREAM)
    save_asset(channel_art, f"{BASE_DIR}/social/youtube/yt-channel-art-2560x1440.png")

    # Channel icon (800x800)
    icon = create_social_asset(mascot, 800, 800, CREAM, mascot_scale=0.85)
    save_asset(icon, f"{BASE_DIR}/social/youtube/yt-icon-800x800.png")

    # Thumbnail (1280x720)
    thumb = create_banner(mascot, 1280, 720, CREAM)
    save_asset(thumb, f"{BASE_DIR}/social/youtube/yt-thumbnail-1280x720.png")

def generate_banner_assets(mascot):
    """Generate web banner assets."""
    print("\n[Banners]")

    banner_specs = [
        (728, 90, "leaderboard"),      # Leaderboard
        (300, 250, "medium-rectangle"), # Medium Rectangle
        (160, 600, "wide-skyscraper"),  # Wide Skyscraper
        (320, 50, "mobile-leaderboard"), # Mobile Leaderboard
        (970, 250, "billboard"),        # Billboard
    ]

    for width, height, name in banner_specs:
        # Determine if text fits
        include_text = width > 200
        banner = create_banner(mascot, width, height, CREAM, include_text=include_text)
        save_asset(banner, f"{BASE_DIR}/marketing/banners/banner-{name}-{width}x{height}.png")

def generate_ad_assets(mascot):
    """Generate advertisement format assets."""
    print("\n[Advertisements]")

    # Square (1:1)
    ad_square = create_social_asset(mascot, 1200, 1200, CREAM, mascot_scale=0.5)
    save_asset(ad_square, f"{BASE_DIR}/marketing/ads/ad-square-1200x1200.png")

    # Landscape (16:9)
    ad_landscape = create_banner(mascot, 1920, 1080, CREAM)
    save_asset(ad_landscape, f"{BASE_DIR}/marketing/ads/ad-landscape-1920x1080.png")

    # Portrait (4:5)
    ad_portrait = create_social_asset(mascot, 1080, 1350, CREAM, mascot_scale=0.45)
    save_asset(ad_portrait, f"{BASE_DIR}/marketing/ads/ad-portrait-1080x1350.png")

    # Vertical (9:16)
    ad_vertical = create_social_asset(mascot, 1080, 1920, CREAM, mascot_scale=0.35)
    save_asset(ad_vertical, f"{BASE_DIR}/marketing/ads/ad-vertical-1080x1920.png")

# =============================================================================
# Main
# =============================================================================

def main():
    print("=" * 60)
    print("  ThemeGPT Brand Kit Generator")
    print("=" * 60)

    # Load source mascot
    source_path = CLEAN_MASCOT_PATH if os.path.exists(CLEAN_MASCOT_PATH) else GIF_PATH
    print(f"\nLoading mascot from: {source_path}")
    mascot = load_mascot()
    print(f"  Source size: {mascot.size}")

    # Generate all assets
    generate_core_assets(mascot)
    generate_instagram_assets(mascot)
    generate_facebook_assets(mascot)
    generate_youtube_assets(mascot)
    generate_banner_assets(mascot)
    generate_ad_assets(mascot)

    print("\n" + "=" * 60)
    print("  Brand kit generation complete!")
    print("=" * 60)

if __name__ == "__main__":
    main()
