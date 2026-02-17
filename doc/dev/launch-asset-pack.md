# ThemeGPT Launch Asset Pack — Checklist

**Target**: One organic launch channel (Product Hunt recommended)
**Timeline**: Ready before Phase 2, Week 5 (Mar 16, 2026)
**Prerequisite**: CWS v2.1.0 approved + 7 days stable

---

## 1. Before/After GIFs

Show ChatGPT's default look vs ThemeGPT themes applied. Each GIF: 1280x800, <5 MB, 3-5 second loop.

| # | GIF | Content | Status |
|---|-----|---------|--------|
| 1 | `default-to-aurora.gif` | Default ChatGPT → Aurora Borealis (animated gradient, hero theme) | [ ] |
| 2 | `default-to-synthwave.gif` | Default ChatGPT → Synth Wave (neon palette, strong contrast) | [ ] |
| 3 | `default-to-woodland.gif` | Default ChatGPT → Woodland Retreat (earthy tones, calm feel) | [ ] |
| 4 | `default-to-dracula.gif` | Default ChatGPT → Dracula (popular dev theme, free tier) | [ ] |

**How to capture**: Open ChatGPT with a sample conversation visible. Screen-record clicking a theme in the extension popup. Trim to the transition moment. Export as optimized GIF.

**Lead GIF**: `default-to-aurora.gif` — Aurora Borealis is the most visually striking premium theme and should be the hero image across all channels.

---

## 2. Demo Recording (30 seconds)

One continuous screen recording showing the full value loop. Format: MP4 (for social) + GIF (for Product Hunt gallery).

**Script / Shot List:**

| Time | Action | What viewer sees |
|------|--------|------------------|
| 0-5s | Open ChatGPT (default look) | Plain, boring ChatGPT interface |
| 5-8s | Click ThemeGPT extension icon | Popup opens showing theme grid |
| 8-12s | Click "Dracula" (free theme) | ChatGPT instantly transforms to Dracula |
| 12-16s | Click "Aurora Borealis" (premium) | Lock icon visible, upgrade prompt appears |
| 16-20s | Quick flash of pricing page | Shows $6.99/mo, 30-day free trial |
| 20-25s | Apply Aurora Borealis (unlocked) | ChatGPT transforms with animated gradient |
| 25-30s | Scroll the themed conversation | Polished, beautiful ChatGPT experience |

**Status**: [ ] Recorded  [ ] Trimmed  [ ] Exported MP4  [ ] Exported GIF

---

## 3. Copy Assets

### 3a. Tagline (one-liner)

Primary: **"Make ChatGPT yours."**
Alternatives:
- "One-click themes for ChatGPT. No data leaves your browser."
- "Beautiful themes for ChatGPT — privacy-first, one click to apply."

**Status**: [ ] Finalized

### 3b. Short Description (1-2 sentences)

> ThemeGPT is a privacy-first Chrome extension that transforms ChatGPT's appearance with handcrafted themes — from Dracula to Aurora Borealis. One click to apply, zero data leaves your browser.

**Status**: [ ] Finalized

### 3c. Founder Story (3-5 sentences)

> I built ThemeGPT because I spend hours in ChatGPT every day and the default interface felt sterile. I wanted it to feel like mine — like my code editor, where I pick the theme that matches my mood. ThemeGPT started as a personal tool: swap ChatGPT's look with one click, no data ever leaving the browser. Now it has 15 handcrafted themes, animated effects, and a growing community of 130+ users who feel the same way. Privacy isn't a feature — it's the foundation.

**Status**: [ ] Draft  [ ] Reviewed  [ ] Finalized

### 3d. Call-to-Action Variants

| Context | CTA |
|---------|-----|
| Product Hunt | "Try it free — 7 free themes included, no sign-up needed." |
| Social media | "Make ChatGPT beautiful. Free Chrome extension." |
| Landing page | "Get ThemeGPT Free" |
| Upgrade prompt | "Start your 30-day free trial" |

**Status**: [ ] Finalized

---

## 4. Product Hunt Specific Assets

| # | Asset | Spec | Status |
|---|-------|------|--------|
| 1 | Thumbnail | 240x240 PNG, mascot on cream background | [ ] Exists: `mascot-transparent.png` — needs crop |
| 2 | Gallery image 1 | 1270x760, hero before/after (Aurora Borealis) | [ ] |
| 3 | Gallery image 2 | 1270x760, theme grid showing free + premium themes | [ ] |
| 4 | Gallery image 3 | 1270x760, privacy callout ("Zero tracking, zero analytics") | [ ] |
| 5 | Gallery image 4 | 1270x760, pricing card ($6.99/mo, 30-day trial, 7 free themes) | [ ] |
| 6 | Maker comment | First comment draft (founder story + offer) | [ ] |
| 7 | Tagline | Max 60 chars for PH listing | [ ] |

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

**Status**: [ ] Draft  [ ] Reviewed  [ ] Finalized

---

## 5. Social Media Announcement Assets

| # | Asset | Platform | Spec | Status |
|---|-------|----------|------|--------|
| 1 | Announcement post | Twitter/X | 280 chars + 1 GIF (lead before/after) | [ ] |
| 2 | Announcement post | LinkedIn | Short post + lead GIF | [ ] |
| 3 | OG image | All | 1200x630 — already exists at `apps/web/public/og-image.png` | [x] |
| 4 | Twitter card | Twitter/X | 1200x600 — already exists in `asset/archive/` | [x] |

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
