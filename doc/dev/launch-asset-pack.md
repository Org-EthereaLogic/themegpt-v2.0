# ThemeGPT Launch Asset Pack — Checklist

**Target**: One organic launch channel (Product Hunt recommended)
**Timeline**: Ready before Phase 2, Week 5 (Mar 16, 2026)
**Prerequisite**: CWS v2.1.0 approved + 7 days stable

---

## 1. Before/After GIFs

Show ChatGPT's default look vs ThemeGPT themes applied. Each GIF: 1280x880, <5 MB, crossfade loop.

| # | GIF | Size | Status |
|---|-----|------|--------|
| 1 | `default-to-aurora-borealis.gif` | 2.7 MB | [x] Done |
| 2 | `default-to-synth-wave.gif` | 2.3 MB | [x] Done |
| 3 | `default-to-woodland-retreat.gif` | 5.0 MB | [x] Done |
| 4 | `default-to-themegpt-dark.gif` | 4.8 MB | [x] Done |

**Location**: `asset/launch/`
**Source screenshots**: `asset/images/chrome-store/Before_screenshot.png` + `After_*.png`
**Generator script**: `asset/launch/create_before_after_gifs.py`

**Lead GIF**: `default-to-aurora-borealis.gif` — Aurora Borealis is the most visually striking premium theme and should be the hero image across all channels.

**Note**: Dracula was replaced with ThemeGPT Dark for stronger visual contrast in the before/after.

---

## 2. Demo Recording (30 seconds)

One continuous screen recording showing the full value loop.

**Deliverables:**

| # | File | Size | Status |
|---|------|------|--------|
| 1 | `demo-30s-source.mp4` | 38 MB | [x] Source recording (1080p, 30fps) |
| 2 | `demo-30s.mp4` | 1.1 MB | [x] Web-optimized MP4 (1280w, h264, fast-start) |
| 3 | `demo-highlight.gif` | 2.8 MB | [x] 10s highlight GIF (12-22s, popup → theme switch) |

**Location**: `asset/launch/`
**Content**: Default ChatGPT → scroll → open extension popup → browse themes → apply Aurora Borealis → scroll themed conversation

---

## 3. Copy Assets

### 3a. Tagline (one-liner)

Primary: **"Make ChatGPT yours."**
Alternatives:
- "One-click themes for ChatGPT. No data leaves your browser."
- "Beautiful themes for ChatGPT — privacy-first, one click to apply."

**Status**: [x] Finalized

### 3b. Short Description (1-2 sentences)

> ThemeGPT is a privacy-first Chrome extension that transforms ChatGPT's appearance with handcrafted themes — from Dracula to Aurora Borealis. One click to apply, zero data leaves your browser.

**Status**: [x] Finalized

### 3c. Founder Story (3-5 sentences)

> I built ThemeGPT because I spend hours in ChatGPT every day and the default interface felt sterile. I wanted it to feel like mine — like my code editor, where I pick the theme that matches my mood. ThemeGPT started as a personal tool: swap ChatGPT's look with one click, no data ever leaving the browser. Now it has 15 handcrafted themes, animated effects, and a growing community of 130+ users who feel the same way. Privacy isn't a feature — it's the foundation.

**Status**: [x] Finalized

### 3d. Call-to-Action Variants

| Context | CTA |
|---------|-----|
| Product Hunt | "Try it free — 7 free themes included, no sign-up needed." |
| Social media | "Make ChatGPT beautiful. Free Chrome extension." |
| Landing page | "Get ThemeGPT Free" |
| Upgrade prompt | "Start your 30-day free trial" |

**Status**: [x] Finalized

---

## 4. Product Hunt Specific Assets

| # | Asset | File | Status |
|---|-------|------|--------|
| 1 | Thumbnail (240x240) | `ph-thumbnail.png` | [x] Done |
| 2 | Gallery: hero before/after | `ph-gallery-1-hero.png` | [x] Done |
| 3 | Gallery: theme grid | `ph-gallery-2-themes.png` | [x] Done |
| 4 | Gallery: privacy callout | `ph-gallery-3-privacy.png` | [x] Done |
| 5 | Gallery: pricing card | `ph-gallery-4-pricing.png` | [x] Done (regenerated Feb 20 — now shows Free/Monthly/Yearly with early adopter callout + single theme note) |
| 6 | Maker comment | See draft below | [x] Finalized |
| 7 | Tagline | "Make ChatGPT yours." (20 chars) | [x] Finalized |

**Location**: `asset/launch/`
**Generator script**: `asset/launch/create_ph_gallery.py`

### Maker Comment Draft (First Comment)

> Hey Product Hunt! I'm Anthony, the solo builder behind ThemeGPT.
>
> I use ChatGPT for hours every day and got tired of staring at the same interface. So I built something simple: one-click themes that make ChatGPT feel personal.
>
> What makes ThemeGPT different:
> - **7 free themes** — no account needed, works instantly
> - **8 premium themes** with animated effects (Aurora Borealis, Synth Wave, Electric Dreams...)
> - **Privacy-first** — all processing happens locally, zero data leaves your browser
> - **30-day free trial** for premium, $6.99/mo after
>
> The first 60 yearly subscribers get converted to lifetime access as a thank-you to early supporters.
>
> I'd love your feedback — what themes would you want to see next?

**Status**: [x] Finalized

---

## 5. Social Media Announcement Assets

| # | Asset | Platform | Spec | Status |
|---|-------|----------|------|--------|
| 1 | Announcement post | Twitter/X | 280 chars + 1 GIF (lead before/after) | [x] Finalized |
| 2 | Announcement post | LinkedIn | Short post + lead GIF | [x] Finalized |
| 3 | OG image | All | 1200x630 — already exists at `apps/web/public/og-image.png` | [x] |
| 4 | Twitter card | Twitter/X | 1200x600 — already exists in `asset/archive/` | [x] |

### Twitter/X Post (278 chars)

> I built ThemeGPT because ChatGPT's default look felt sterile.
>
> 15 handcrafted themes. One click to apply. Zero data leaves your browser.
>
> 7 free themes — no sign-up needed.
> 8 premium with animated effects — 30-day free trial.
>
> Try it free: themegpt.ai

**Attach**: `default-to-aurora-borealis.gif`

### LinkedIn Post

> I just launched ThemeGPT — a privacy-first Chrome extension that transforms ChatGPT's appearance with handcrafted themes.
>
> The problem: I spend hours in ChatGPT every day and the default interface felt sterile. I wanted it to feel like mine — like my code editor, where I pick the theme that matches my mood.
>
> The solution: One-click themes that make ChatGPT personal. 15 handcrafted designs ranging from Dracula to Aurora Borealis with animated gradient effects.
>
> What makes it different:
> - 7 free themes — no account needed, works instantly
> - 8 premium themes with animated effects
> - Privacy-first — all processing happens locally, zero data leaves your browser
> - 30-day free trial for premium
>
> The first 60 yearly subscribers get converted to lifetime access as a thank-you to early supporters.
>
> Try it free at themegpt.ai — I'd love to hear what themes you'd want to see next.
>
> #ChromeExtension #ChatGPT #Privacy #IndieHacker

**Attach**: `default-to-aurora-borealis.gif`

---

## 6. Existing Assets (Already Done)

| Asset | Location | Notes |
|-------|----------|-------|
| Animated logo GIF | `asset/GIFs/animated-logo-400.gif` | Used in README header |
| CWS promo frame | `asset/ads/ThemeGPT Chrome Web Store Export Frames 1.png` | "Transform Your Browser" + mascot |
| Theme preview screenshots | `apps/web/public/themes/` | 2 screenshots per theme, webp + png, 3 sizes each |
| OG image | `apps/web/public/og-image.png` | 1200x630 Open Graph |
| Social media images | `asset/archive/.../social/` | OG, Twitter card, LinkedIn banner |
| Full icon kit | `asset/archive/.../icons/` | 12 sizes, logo + mascot variants |
| Brand color reference | `asset/README.md` | Complete brand kit documentation |

---

## Production Order (Recommended)

Work in dependency order — later items build on earlier ones.

1. **Before/after GIFs** — everything else references these
2. **Demo recording** — uses same screen capture setup
3. **Copy finalization** — tagline, description, founder story, CTAs
4. **Product Hunt gallery images** — composites using GIFs + copy + screenshots
5. **Social media posts** — written last, reference all other assets

---

## Notes

- All new assets go in `asset/launch/` directory
- Keep GIFs under 5 MB for fast loading (use lossy compression, 15 fps max)
- Theme screenshots already exist in webp — use those as fallback stills
- The lead before/after GIF (Aurora Borealis) gets reused across PH gallery, social posts, and the landing page
