# Recreate Logo + Mascot Variant Asset Kit From New SVG Sources

**Date:** 2025-12-12

## Inputs Consulted

| Source | Key Takeaways |
|---|---|
| AGENTS.md | Keep changes simple; avoid premature abstraction; prefer direct working code. |
| DIRECTIVES.md | No placeholder content; avoid premature abstraction; keep complexity proportional. |
| .github/prompts/prompt-enhancement-workflow.prompt.md | Enhanced prompt must be stepwise, test-ready, with guardrails and verification. |
| asset/README.md | Canonical asset kit structure and required filenames/sizes for icons/favicons/social/variants. |
| asset/archive/* | Reference for “old” output inventory and exact filenames to recreate. |
| asset/artie-logo-main.svg + asset/artie-mascot-main.svg | New source-of-truth vector artwork to render from. |

## Mission Statement
Recreate the full ThemeGPT logo kit outputs (icons, favicons, social images, and background variants) using the new SVG sources in `asset/`, matching the filename inventory found in `asset/archive/`.

## Problem-State Table

| Area | Expected | Actual |
|---|---|---|
| Source artwork | High-quality SVG sources present | Present: `asset/artie-logo-main.svg`, `asset/artie-mascot-main.svg` |
| Generated kit | `asset/icons`, `asset/favicons`, `asset/social`, `asset/variants` populated | Missing; only `asset/archive/` contains prior outputs |
| Output inventory | Filenames match `asset/archive/**` | Not regenerated yet |

## Numbered Instructions

1. **Inventory what must be recreated (do not guess).**
   - List the required output files by reading directory contents of:
     - `asset/archive/icons/`
     - `asset/archive/favicons/`
     - `asset/archive/social/`
     - `asset/archive/variants/`
   - Success signal: you have a concrete file list and counts per folder.

2. **Create the new output directories under `asset/` (if missing).**
   - Create these directories:
     - `asset/icons/`, `asset/favicons/`, `asset/social/`, `asset/variants/`
   - Success signal: directories exist and are empty or ready for regeneration.

3. **Select an SVG → PNG renderer available on this machine.**
   - Run these commands (exactly) and pick the first one that exists:
     - `command -v rsvg-convert`
     - `command -v resvg`
     - `command -v inkscape`
   - Success signal: you have one renderer command you can use non-interactively.

4. **Finalize (optimize) any SVGs with SVGO before rendering.**
   - Goal: ensure any SVG inputs/outputs are SVGO-optimized (the same optimization you previously applied via a website).
   - Verify SVGO is available using these commands (stop at the first one that works):
     - `command -v svgo && svgo --version`
     - `pnpm -w exec svgo --version`
   - Optimize the source SVGs in place:
     - `svgo --multipass asset/artie-logo-main.svg -o asset/artie-logo-main.svg`
     - `svgo --multipass asset/artie-mascot-main.svg -o asset/artie-mascot-main.svg`
   - If this task creates ANY additional SVG outputs (for example, a Safari pinned tab SVG), optimize them too with:
     - `svgo --multipass path/to/file.svg -o path/to/file.svg`
   - Success signal: `svgo --version` succeeds and the optimized SVGs still contain a valid `<svg` root (quick check: `grep -q "<svg" asset/artie-logo-main.svg`).

5. **Render 512×512 PNG sources from the new SVGs.**
   - Create:
     - `asset/source-logo-512.png` from `asset/artie-logo-main.svg`
     - `asset/source-mascot-512.png` from `asset/artie-mascot-main.svg`
   - Use one of these command sets based on the tool found in Step 3:

   **If `rsvg-convert` is available**
   - `rsvg-convert -w 512 -h 512 -o asset/source-logo-512.png asset/artie-logo-main.svg`
   - `rsvg-convert -w 512 -h 512 -o asset/source-mascot-512.png asset/artie-mascot-main.svg`

   **If `resvg` is available**
   - `resvg asset/artie-logo-main.svg asset/source-logo-512.png --width 512 --height 512`
   - `resvg asset/artie-mascot-main.svg asset/source-mascot-512.png --width 512 --height 512`

   **If `inkscape` is available**
   - `inkscape asset/artie-logo-main.svg --export-type=png --export-filename=asset/source-logo-512.png -w 512 -h 512`
   - `inkscape asset/artie-mascot-main.svg --export-type=png --export-filename=asset/source-mascot-512.png -w 512 -h 512`

   - Success signal: both PNGs exist and are 512×512.

6. **Generate the full kit using a single simple Python script (no new frameworks).**
   - Create a new script at `asset/generate_kit.py` by copying the logic from `asset/archive/generate_kit.py`, but make these minimal changes:
     - Replace the single `SOURCE` input with two inputs:
       - `SOURCE_LOGO = "source-logo-512.png"`
       - `SOURCE_MASCOT = "source-mascot-512.png"`
     - Remove mascot auto-extraction; instead load `SOURCE_MASCOT` directly.
     - Write outputs to these directories (created in Step 2):
       - `ICONS_DIR = "icons"`, `FAVICONS_DIR = "favicons"`, `SOCIAL_DIR = "social"`, `VARIANTS_DIR = "variants"`
     - Ensure background replacement functions treat BOTH of these as “cream background”:
       - `#FAF6F0` (canonical brand cream in `asset/README.md`)
       - `#FFFAF1` (observed SVG background fill in `asset/artie-logo-main.svg`)
     - Preserve the exact filenames defined in `asset/README.md` and present in `asset/archive/`.
   - Run it from the repo root:
     - `python3 asset/generate_kit.py`
   - Success signal: all expected PNGs are generated under `asset/icons`, `asset/favicons`, `asset/social`, `asset/variants`.

7. **Recreate the inventory exactly (file-for-file) against `asset/archive/`.**
   - Compare the regenerated output filenames to the archived inventory.
   - Success signal: every file present in `asset/archive/**` (excluding `.DS_Store`) exists in the new output directories with the same name.

8. **Animated GIFs: gate on required inputs (no placeholders).**
   - `asset/archive/icons/` contains `animated-clean-400.gif` and `animated-clean-500.gif`.
   - Before attempting GIF regeneration, verify whether a “wink/alt-frame” source exists (for example: `asset/*wink*.(svg|png)`).
     - If a wink/alt-frame exists: regenerate the GIFs with the same dimensions as the archived ones.
     - If no wink/alt-frame exists: STOP and ask the user to provide the wink/alt-frame asset path or to explicitly approve dropping the GIF deliverable.
   - Success signal: either (A) GIFs are regenerated, or (B) you have explicit user confirmation to omit them.

9. **Do not change app/runtime code unless explicitly requested.**
   - Do not modify `apps/extension/assets/` or web app assets as part of this task.
   - Success signal: git diff shows changes only inside `asset/` (and optionally the new generator script).

## Pre-Flight Checks

1. Confirm these files exist:
   - `asset/artie-logo-main.svg`
   - `asset/artie-mascot-main.svg`
   - `asset/archive/icons/`, `asset/archive/favicons/`, `asset/archive/social/`, `asset/archive/variants/`
2. Confirm Python can import Pillow:
   - `python3 -c "import PIL; print('Pillow OK')"`
3. Confirm SVGO is available (required for SVG finalization):
  - `command -v svgo && svgo --version` (or `pnpm -w exec svgo --version`)
4. Confirm at least one SVG renderer exists (Step 3).

## Guardrails

<guardrails>
- Forbidden: generating “close enough” filenames; match the archived inventory exactly.
- Forbidden: placeholder images, placeholder colors, or fake “wink” frames.
- Forbidden: adding new dependencies unless absolutely required; if SVGO or an SVG renderer is missing, ask for explicit approval before installing anything.
- Required: keep implementation minimal (single generator script; no new abstraction layers).
- Required: keep edits confined to `asset/` unless the user explicitly expands scope.
</guardrails>

## Verification Checklist

- [ ] `asset/icons/` contains all `logo-*.png` and `mascot-*.png` sizes matching `asset/archive/icons/`
- [ ] `asset/favicons/` contains `favicon.ico`, `site.webmanifest`, and all PNGs matching `asset/archive/favicons/`
- [ ] `asset/social/` contains `og-image.png`, `twitter-card.png`, `linkedin-banner.png`
- [ ] `asset/variants/` contains `logo-full-*.png` and `mascot-*.png` variants matching `asset/archive/variants/`
- [ ] If GIFs are expected, they are regenerated; otherwise, omission is explicitly approved
- [ ] No files outside `asset/` were changed

## Error Handling

| Error Condition | Resolution |
|---|---|
| SVGO is not available in pre-flight | Ask the user whether to install SVGO globally (preferred if they already use global tooling) or as a workspace dev dependency; do not proceed until approved. |
| No SVG renderer found in Step 3 | Ask the user which renderer they prefer to install (`librsvg`/`resvg`/`inkscape`) and pause. |
| `python3 -c "import PIL"` fails | Install Pillow in the active environment, then rerun the pre-flight check. |
| Background replacement doesn’t work | Expand “cream detection” to include both `#FAF6F0` and `#FFFAF1` (and re-run generation). |
| Output inventory mismatch vs archive | Do not rename files ad-hoc; fix generator logic so it emits the missing names/sizes. |
| GIF inputs missing | Stop and request the missing wink/alt-frame asset or approval to omit GIFs. |
