# ThemeGPT Logo Kit v1.0

Complete branding asset package for web development.

---

## 📁 Directory Structure

```
themegpt-logo-kit/
├── icons/           # Standard icon sizes (full logo + mascot-only)
├── favicons/        # Browser favicon files
├── social/          # Social media sized images
├── variants/        # Background variants (transparent, dark, white, cream)
└── source-512.png   # Original source file
```

---

## 🎨 Brand Colors

| Name          | Hex       | RGB             | Usage                    |
|---------------|-----------|-----------------|--------------------------|
| Cream         | `#FAF6F0` | `250, 246, 240` | Primary background       |
| Chocolate     | `#4B2E1E` | `75, 46, 30`    | Text, outlines           |
| Coral Peach   | `#F4A988` | `244, 169, 136` | Mascot segment           |
| Teal          | `#7ECEC5` | `126, 206, 197` | Mascot segment, sparkle  |
| Butter Yellow | `#F5E6B8` | `245, 230, 184` | Mascot segment           |
| Light Teal    | `#8DD4CB` | `141, 212, 203` | Sparkle accent           |

---

## 📐 Icons Directory (`/icons`)

### Full Logo (with wordmark)
| File | Size | Use Case |
|------|------|----------|
| `logo-16.png` | 16×16 | Tiny favicon fallback |
| `logo-32.png` | 32×32 | Small displays |
| `logo-48.png` | 48×48 | Chrome extension |
| `logo-64.png` | 64×64 | Medium displays |
| `logo-72.png` | 72×72 | iOS home screen (legacy) |
| `logo-96.png` | 96×96 | Google TV, Android |
| `logo-128.png` | 128×128 | Chrome Web Store |
| `logo-144.png` | 144×144 | Windows 8 tiles |
| `logo-192.png` | 192×192 | PWA icon |
| `logo-256.png` | 256×256 | High-res displays |
| `logo-384.png` | 384×384 | Extra high-res |
| `logo-512.png` | 512×512 | App stores, splash screens |

### Mascot Only (no wordmark)
Same sizes as above with `mascot-` prefix.
**Use mascot-only versions for small sizes (≤64px) where wordmark becomes illegible.**

---

## ⭐ Favicons Directory (`/favicons`)

| File | Size | Purpose |
|------|------|---------|
| `favicon.ico` | 16, 32, 48 | Legacy browser favicon |
| `favicon-16x16.png` | 16×16 | Modern browser favicon |
| `favicon-32x32.png` | 32×32 | Retina favicon |
| `favicon-48x48.png` | 48×48 | Large favicon |
| `apple-touch-icon.png` | 180×180 | iOS home screen bookmark |
| `android-chrome-192x192.png` | 192×192 | Android Chrome |
| `android-chrome-512x512.png` | 512×512 | Android splash screen |
| `mstile-150x150.png` | 150×150 | Windows tile |
| `safari-pinned-tab.png` | 512×512 | Safari pinned tab |

### HTML Implementation
```html
<link rel="icon" type="image/x-icon" href="/favicon.ico">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<meta name="msapplication-TileImage" content="/mstile-150x150.png">
<meta name="msapplication-TileColor" content="#FAF6F0">
<meta name="theme-color" content="#FAF6F0">
```

### Web Manifest (`site.webmanifest`)
```json
{
  "name": "ThemeGPT",
  "short_name": "ThemeGPT",
  "icons": [
    {
      "src": "/android-chrome-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/android-chrome-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ],
  "theme_color": "#FAF6F0",
  "background_color": "#FAF6F0",
  "display": "standalone"
}
```

---

## 📱 Social Media Directory (`/social`)

| File | Dimensions | Platform |
|------|------------|----------|
| `og-image.png` | 1200×630 | Facebook, LinkedIn, Open Graph |
| `twitter-card.png` | 1200×600 | Twitter/X summary card |
| `linkedin-banner.png` | 1584×396 | LinkedIn company banner |

### Meta Tags
```html
<!-- Open Graph -->
<meta property="og:image" content="https://themegpt.ai/og-image.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">

<!-- Twitter -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="https://themegpt.ai/twitter-card.png">
```

---

## 🎨 Variants Directory (`/variants`)

### Full Logo Variants
| File | Background | Use Case |
|------|------------|----------|
| `logo-full-cream.png` | Cream (#FAF6F0) | Default, warm surfaces |
| `logo-full-white.png` | White (#FFFFFF) | Clean white backgrounds |
| `logo-full-dark.png` | Dark (#1E1E1E) | Dark mode, dark surfaces |
| `logo-full-transparent.png` | Transparent | Overlays, flexible placement |

### Mascot-Only Variants
| File | Background | Use Case |
|------|------------|----------|
| `mascot-cream.png` | Cream (#FAF6F0) | Default app icon |
| `mascot-white.png` | White (#FFFFFF) | White backgrounds |
| `mascot-dark.png` | Dark (#1E1E1E) | Dark mode |
| `mascot-transparent.png` | Transparent | Flexible placement |

---

## ✅ Quick Reference

### For Website Header
Use `logo-full-transparent.png` or appropriate size from `/icons`

### For Browser Tab
Use files from `/favicons`

### For Social Sharing
Use files from `/social`

### For App Stores / Extensions
- Chrome Web Store: `logo-128.png` (main), `mascot-48.png` (toolbar)
- PWA: `android-chrome-192x192.png`, `android-chrome-512x512.png`

### For Dark Mode
Use `*-dark.png` variants or `*-transparent.png` on dark backgrounds

---

## 📝 Notes

1. **Scaling**: Mascot-only versions are recommended for sizes ≤64px
2. **Background**: Cream (#FAF6F0) is the brand background; transparent versions provided for flexibility
3. **File Format**: All files are optimized PNG for quality and transparency support
4. **Retina**: Use 2× sizes for retina displays (e.g., 64px for 32px display)

---

Generated: December 2024
Version: 1.0
