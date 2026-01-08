# ThemeGPT Brand Kit

Master brand asset collection for ThemeGPT across all platforms and use cases.

## Quick Reference

| Platform | Asset | File |
|----------|-------|------|
| Instagram | Profile | `social/instagram/ig-profile-320x320.png` |
| Instagram | Post (Square) | `social/instagram/ig-post-square-1080x1080.png` |
| Instagram | Story | `social/instagram/ig-story-1080x1920.png` |
| Facebook | Profile | `social/facebook/fb-profile-320x320.png` |
| Facebook | Cover | `social/facebook/fb-cover-820x312.png` |
| YouTube | Channel Art | `social/youtube/yt-channel-art-2560x1440.png` |
| YouTube | Thumbnail | `social/youtube/yt-thumbnail-1280x720.png` |
| Web | Favicon | `core/mascot/transparent/mascot-64.png` |
| Web | Logo | `core/logo/transparent/logo-256.png` |

---

## Directory Structure

```
brand-kit/
├── README.md                    # This file
├── generate_brand_kit.py        # Regeneration script
│
├── core/                        # Master assets
│   ├── mascot/
│   │   ├── transparent/         # For overlays
│   │   ├── cream-bg/            # Brand background (#FAF6F0)
│   │   └── white-bg/            # Universal background
│   └── logo/
│       ├── transparent/
│       ├── cream-bg/
│       └── white-bg/
│
├── social/                      # Social media assets
│   ├── instagram/
│   ├── facebook/
│   └── youtube/
│
└── marketing/                   # Marketing materials
    ├── banners/                 # Web banners (IAB standard)
    └── ads/                     # Advertisement formats
```

---

## Brand Colors

| Color | Hex | RGB | Usage |
|-------|-----|-----|-------|
| Cream | `#FAF6F0` | `(250, 246, 240)` | Primary background |
| Chocolate | `#4B2E1E` | `(75, 46, 30)` | Primary text |
| Peach | `#F4A988` | `(244, 169, 136)` | CTAs, highlights |
| Teal | `#7ECEC5` | `(126, 206, 197)` | Secondary accent |

---

## Asset Specifications

### Core Assets

#### Mascot (Icon only)
| Size | Use Case |
|------|----------|
| 512x512 | High-res source, print |
| 256x256 | Web, app icons |
| 128x128 | Thumbnails |
| 64x64 | Favicons, small icons |

#### Logo (Mascot + Text)
| Size | Use Case |
|------|----------|
| 512px height | Hero sections, print |
| 256px height | Headers, navigation |
| 128px height | Footers, compact spaces |

### Social Media

#### Instagram
| Asset | Dimensions | Notes |
|-------|------------|-------|
| Profile | 320x320 | Displays at 110x110, use high-res |
| Post Square | 1080x1080 | Standard feed post |
| Post Portrait | 1080x1350 | 4:5 ratio, more screen space |
| Story | 1080x1920 | 9:16 ratio, full screen |

#### Facebook
| Asset | Dimensions | Notes |
|-------|------------|-------|
| Profile | 320x320 | Minimum 180x180 |
| Cover Desktop | 820x312 | Desktop display |
| Cover Mobile | 640x360 | Mobile-safe area |

#### YouTube
| Asset | Dimensions | Notes |
|-------|------------|-------|
| Channel Art | 2560x1440 | Full banner, safe area 1546x423 |
| Channel Icon | 800x800 | Displays at 98x98 |
| Thumbnail | 1280x720 | 16:9 video thumbnail |

### Marketing

#### Web Banners (IAB Standard)
| Asset | Dimensions | Type |
|-------|------------|------|
| Leaderboard | 728x90 | Top of page |
| Medium Rectangle | 300x250 | Sidebar, inline |
| Wide Skyscraper | 160x600 | Sidebar |
| Mobile Leaderboard | 320x50 | Mobile header |
| Billboard | 970x250 | Premium placement |

#### Advertisements
| Asset | Dimensions | Ratio | Use Case |
|-------|------------|-------|----------|
| Square | 1200x1200 | 1:1 | Feed ads |
| Landscape | 1920x1080 | 16:9 | Video, display |
| Portrait | 1080x1350 | 4:5 | Mobile feed |
| Vertical | 1080x1920 | 9:16 | Stories, reels |

---

## Naming Convention

```
{type}-{variant}-{width}x{height}.png
```

**Examples:**
- `mascot-512.png` - Transparent mascot at 512px
- `mascot-512-cream.png` - Mascot with cream background
- `ig-profile-320x320.png` - Instagram profile picture
- `banner-leaderboard-728x90.png` - Leaderboard web banner

---

## Background Usage Guide

| Background | When to Use |
|------------|-------------|
| **Transparent** | Overlays, custom compositions, dark backgrounds |
| **Cream (#FAF6F0)** | Brand-consistent materials, social media |
| **White (#FFFFFF)** | Print, formal documents, universal compatibility |

---

## Regenerating Assets

If source mascot changes, regenerate all assets:

```bash
cd asset/brand-kit
python3 generate_brand_kit.py
```

**Requirements:**
- Python 3.x
- Pillow (`pip3 install Pillow`)

---

## Source Files

| File | Location | Description |
|------|----------|-------------|
| Animated Mascot | `asset/GIFs/animated-mascot-400-transparent.gif` | Source animation |
| Original Icons | `asset/icons/` | Legacy icon set |

---

## License

All brand assets are proprietary to ThemeGPT. Do not distribute or modify without authorization.
