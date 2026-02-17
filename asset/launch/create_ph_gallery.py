"""
Generate Product Hunt gallery images and thumbnail for ThemeGPT launch.

Output:
- ph-thumbnail.png (240x240) — mascot on cream background
- ph-gallery-1-hero.png (1270x760) — before/after Aurora Borealis
- ph-gallery-2-themes.png (1270x760) — theme grid showcase
- ph-gallery-3-privacy.png (1270x760) — privacy callout
- ph-gallery-4-pricing.png (1270x760) — pricing card
"""

from PIL import Image, ImageDraw, ImageFont
import os

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
SCREENSHOTS_DIR = os.path.join(SCRIPT_DIR, "..", "images", "chrome-store")
WEB_THEMES_DIR = os.path.join(SCRIPT_DIR, "..", "..", "apps", "web", "public", "themes")
MASCOT_PATH = os.path.join(SCRIPT_DIR, "..", "..", "apps", "web", "public", "mascot-transparent.png")
OUTPUT_DIR = SCRIPT_DIR

# Brand colors
CREAM = (250, 246, 240)
CHOCOLATE = (75, 46, 30)
PEACH = (244, 169, 136)
TEAL = (126, 206, 197)
DARK_BG = (30, 30, 30)
WHITE = (255, 255, 255)

# Gallery dimensions
GW, GH = 1270, 760

# Fonts
FONT_BOLD = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"
FONT_REG = "/System/Library/Fonts/Supplemental/Arial.ttf"
FONT_HELV = "/System/Library/Fonts/Helvetica.ttc"


def font(path, size):
    return ImageFont.truetype(path, size)


def load_screenshot(name, size=None):
    """Load a screenshot and optionally resize."""
    path = os.path.join(SCREENSHOTS_DIR, name)
    img = Image.open(path).convert("RGB")
    if size:
        img = img.resize(size, Image.LANCZOS)
    return img


def load_theme_preview(name, size=None):
    """Load a theme preview from the web public folder."""
    path = os.path.join(WEB_THEMES_DIR, name)
    img = Image.open(path).convert("RGB")
    if size:
        img = img.resize(size, Image.LANCZOS)
    return img


def draw_rounded_rect(draw, xy, fill, radius=16):
    """Draw a rounded rectangle."""
    x0, y0, x1, y1 = xy
    draw.rounded_rectangle(xy, radius=radius, fill=fill)


def centered_text(draw, text, y, w, fnt, fill):
    """Draw horizontally centered text."""
    bbox = draw.textbbox((0, 0), text, font=fnt)
    tw = bbox[2] - bbox[0]
    x = (w - tw) // 2
    draw.text((x, y), text, font=fnt, fill=fill)


def create_thumbnail():
    """240x240 mascot on cream background."""
    img = Image.new("RGB", (240, 240), CREAM)
    mascot = Image.open(MASCOT_PATH).convert("RGBA")
    mascot = mascot.resize((200, 200), Image.LANCZOS)
    # Center mascot
    offset = ((240 - 200) // 2, (240 - 200) // 2)
    img.paste(mascot, offset, mascot)
    path = os.path.join(OUTPUT_DIR, "ph-thumbnail.png")
    img.save(path, optimize=True)
    print(f"  Thumbnail: {path}")


def create_gallery_1_hero():
    """Before/after split with Aurora Borealis."""
    img = Image.new("RGB", (GW, GH), CHOCOLATE)
    draw = ImageDraw.Draw(img)

    # Header bar
    draw.rectangle([(0, 0), (GW, 80)], fill=CHOCOLATE)
    centered_text(draw, "Before & After — One Click to Transform", 22, GW, font(FONT_BOLD, 32), CREAM)

    # Load and place before/after screenshots
    before = load_screenshot("Before_screenshot.png", (590, 400))
    after = load_screenshot("After_Aurora Borealis_screenshot.png", (590, 400))

    # Before side
    img.paste(before, (25, 120))
    draw.text((25, 530), "Default ChatGPT", font=font(FONT_BOLD, 22), fill=CREAM)

    # Arrow in center
    centered_text(draw, ">>>", 290, GW, font(FONT_BOLD, 36), PEACH)

    # After side
    img.paste(after, (655, 120))
    draw.text((655, 530), "Aurora Borealis Theme", font=font(FONT_BOLD, 22), fill=TEAL)

    # Bottom tagline
    draw_rounded_rect(draw, (GW // 2 - 220, 580, GW // 2 + 220, 630), fill=PEACH, radius=24)
    centered_text(draw, "Make ChatGPT yours.", 588, GW, font(FONT_BOLD, 28), CHOCOLATE)

    # Subtitle
    centered_text(draw, "15 handcrafted themes  \u00b7  Privacy-first  \u00b7  Free to start", 660, GW, font(FONT_REG, 20), CREAM)

    # Bottom bar
    draw.rectangle([(0, GH - 10), (GW, GH)], fill=PEACH)

    path = os.path.join(OUTPUT_DIR, "ph-gallery-1-hero.png")
    img.save(path, optimize=True)
    print(f"  Gallery 1 (hero): {path}")


def create_gallery_2_themes():
    """Theme grid showcase — 3x2 grid of theme previews."""
    img = Image.new("RGB", (GW, GH), DARK_BG)
    draw = ImageDraw.Draw(img)

    # Header
    draw.rectangle([(0, 0), (GW, 80)], fill=CHOCOLATE)
    centered_text(draw, "15 Handcrafted Themes — 7 Free, 8 Premium", 22, GW, font(FONT_BOLD, 30), CREAM)

    # Theme grid: 3 columns x 2 rows
    themes = [
        ("aurora_borealis_1.png", "Aurora Borealis", True),
        ("synth_wave_1.png", "Synth Wave", True),
        ("electric_dreams_1.png", "Electric Dreams", True),
        ("dracula_1.png", "Dracula", False),
        ("solarized_dark_1.png", "Solarized Dark", False),
        ("woodland_retreat_1.png", "Woodland Retreat", True),
    ]

    card_w, card_h = 380, 260
    gap_x, gap_y = 22, 18
    start_x = (GW - (3 * card_w + 2 * gap_x)) // 2
    start_y = 100

    for i, (filename, label, is_premium) in enumerate(themes):
        col = i % 3
        row = i // 3
        x = start_x + col * (card_w + gap_x)
        y = start_y + row * (card_h + gap_y + 30)

        # Card background
        draw_rounded_rect(draw, (x, y, x + card_w, y + card_h), fill=(45, 45, 45), radius=12)

        # Theme preview
        preview = load_theme_preview(filename, (card_w - 16, card_h - 16))
        img.paste(preview, (x + 8, y + 8))

        # Label below card
        label_text = f"{'*' if is_premium else ''}{label}"
        badge_color = PEACH if is_premium else TEAL
        draw.text((x + 8, y + card_h + 6), label, font=font(FONT_BOLD, 17), fill=WHITE)
        tag = "PREMIUM" if is_premium else "FREE"
        draw.text((x + card_w - 80, y + card_h + 6), tag, font=font(FONT_BOLD, 14), fill=badge_color)

    # Bottom bar
    draw.rectangle([(0, GH - 10), (GW, GH)], fill=TEAL)

    path = os.path.join(OUTPUT_DIR, "ph-gallery-2-themes.png")
    img.save(path, optimize=True)
    print(f"  Gallery 2 (themes): {path}")


def create_gallery_3_privacy():
    """Privacy callout card."""
    img = Image.new("RGB", (GW, GH), CREAM)
    draw = ImageDraw.Draw(img)

    # Mascot in top-right
    mascot = Image.open(MASCOT_PATH).convert("RGBA")
    mascot = mascot.resize((180, 180), Image.LANCZOS)
    img.paste(mascot, (GW - 220, 40), mascot)

    # Main headline
    draw.text((60, 80), "Privacy First.", font=font(FONT_BOLD, 64), fill=CHOCOLATE)
    draw.text((60, 160), "Always.", font=font(FONT_BOLD, 64), fill=CHOCOLATE)

    # Divider
    draw.rectangle([(60, 250), (260, 256)], fill=PEACH)

    # Bullet points
    bullets = [
        ("Zero tracking", "No analytics, no telemetry, no data collection."),
        ("Zero network requests", "All theme processing happens locally in your browser."),
        ("Zero accounts required", "7 free themes work instantly — no sign-up needed."),
        ("Your data stays yours", "Token counts, theme preferences — all stored locally."),
    ]

    y = 290
    for title, desc in bullets:
        draw.text((80, y), "\u2713", font=font(FONT_BOLD, 26), fill=TEAL)
        draw.text((120, y), title, font=font(FONT_BOLD, 24), fill=CHOCOLATE)
        draw.text((120, y + 32), desc, font=font(FONT_REG, 18), fill=(120, 90, 70))
        y += 85

    # Bottom accent bar
    draw.rectangle([(0, GH - 10), (GW, GH)], fill=TEAL)

    # Bottom-right tagline
    draw.text((GW - 400, GH - 50), "themegpt.ai", font=font(FONT_BOLD, 22), fill=CHOCOLATE)

    path = os.path.join(OUTPUT_DIR, "ph-gallery-3-privacy.png")
    img.save(path, optimize=True)
    print(f"  Gallery 3 (privacy): {path}")


def create_gallery_4_pricing():
    """Pricing card."""
    img = Image.new("RGB", (GW, GH), CREAM)
    draw = ImageDraw.Draw(img)

    # Header
    centered_text(draw, "Simple, Honest Pricing", 40, GW, font(FONT_BOLD, 48), CHOCOLATE)
    centered_text(draw, "Start free. Upgrade when you're ready.", 100, GW, font(FONT_REG, 24), (120, 90, 70))

    # Two pricing cards side by side
    card_w = 480
    card_h = 440
    gap = 60
    left_x = (GW - 2 * card_w - gap) // 2
    right_x = left_x + card_w + gap
    card_y = 160

    # FREE card
    draw_rounded_rect(draw, (left_x, card_y, left_x + card_w, card_y + card_h), fill=WHITE, radius=20)
    draw_rounded_rect(draw, (left_x, card_y, left_x + card_w, card_y + 60), fill=TEAL, radius=20)
    draw.rectangle(((left_x, card_y + 40), (left_x + card_w, card_y + 60)), fill=TEAL)
    centered_text(draw, "FREE", card_y + 14, left_x * 2 + card_w, font(FONT_BOLD, 26), WHITE)

    centered_text(draw, "$0", card_y + 90, left_x * 2 + card_w, font(FONT_BOLD, 56), CHOCOLATE)
    centered_text(draw, "forever", card_y + 155, left_x * 2 + card_w, font(FONT_REG, 20), (120, 90, 70))

    free_features = [
        "7 handcrafted themes",
        "One-click apply",
        "No account required",
        "Privacy-first architecture",
    ]
    fy = card_y + 210
    for feat in free_features:
        draw.text((left_x + 50, fy), "\u2713", font=font(FONT_BOLD, 20), fill=TEAL)
        draw.text((left_x + 80, fy), feat, font=font(FONT_REG, 20), fill=CHOCOLATE)
        fy += 40

    # PREMIUM card
    draw_rounded_rect(draw, (right_x, card_y, right_x + card_w, card_y + card_h), fill=WHITE, radius=20)
    draw_rounded_rect(draw, (right_x, card_y, right_x + card_w, card_y + 60), fill=PEACH, radius=20)
    draw.rectangle(((right_x, card_y + 40), (right_x + card_w, card_y + 60)), fill=PEACH)
    centered_text(draw, "PREMIUM", card_y + 14, right_x * 2 + card_w, font(FONT_BOLD, 26), WHITE)

    centered_text(draw, "$6.99", card_y + 90, right_x * 2 + card_w, font(FONT_BOLD, 56), CHOCOLATE)
    centered_text(draw, "/month  \u00b7  30-day free trial", card_y + 155, right_x * 2 + card_w, font(FONT_REG, 20), (120, 90, 70))

    premium_features = [
        "Everything in Free",
        "8 premium animated themes",
        "Aurora Borealis, Synth Wave & more",
        "Early adopter lifetime offer",
    ]
    py = card_y + 210
    for feat in premium_features:
        draw.text((right_x + 50, py), "\u2713", font=font(FONT_BOLD, 20), fill=PEACH)
        draw.text((right_x + 80, py), feat, font=font(FONT_REG, 20), fill=CHOCOLATE)
        py += 40

    # Bottom CTA
    cta_w, cta_h = 360, 56
    cta_x = (GW - cta_w) // 2
    cta_y = card_y + card_h + 30
    draw_rounded_rect(draw, (cta_x, cta_y, cta_x + cta_w, cta_y + cta_h), fill=PEACH, radius=28)
    centered_text(draw, "Start Your Free Trial", cta_y + 12, GW, font(FONT_BOLD, 24), WHITE)

    # Bottom bar
    draw.rectangle([(0, GH - 10), (GW, GH)], fill=PEACH)

    path = os.path.join(OUTPUT_DIR, "ph-gallery-4-pricing.png")
    img.save(path, optimize=True)
    print(f"  Gallery 4 (pricing): {path}")


def main():
    print("Generating Product Hunt assets...")
    print()
    create_thumbnail()
    create_gallery_1_hero()
    create_gallery_2_themes()
    create_gallery_3_privacy()
    create_gallery_4_pricing()
    print("\nDone!")


if __name__ == "__main__":
    main()
