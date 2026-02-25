#!/usr/bin/env node

import fs from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"
import sharp from "sharp"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT = path.resolve(__dirname, "..")

const SHARED_INDEX = path.join(ROOT, "packages/shared/src/index.ts")
const PREVIEW_INDEX = path.join(ROOT, "apps/extension/tools/theme-preview/index.html")
const WEB_THEME_CARD = path.join(ROOT, "apps/web/components/ui/ThemeCard.tsx")
const EXT_THUMBS_DIR = path.join(ROOT, "apps/extension/assets/themes")

const ARTIFACT_DIR = path.join(ROOT, "doc/report/audit-artifacts/theme-catalog")
const ARTIFACT_JSON = path.join(ARTIFACT_DIR, "theme-catalog-checks.json")
const REPORT_PATH = path.join(ROOT, "doc/report/theme-catalog-audit-2026-02-25.md")

const REQUIRED_COLOR_KEYS = [
  "--cgpt-bg",
  "--cgpt-surface",
  "--cgpt-text",
  "--cgpt-text-muted",
  "--cgpt-border",
  "--cgpt-accent"
]

function extractThemesFromShared(sourceText) {
  const marker = "export const DEFAULT_THEMES: Theme[] = ["
  const start = sourceText.indexOf(marker)
  if (start === -1) throw new Error("DEFAULT_THEMES marker not found")

  const equalsIndex = sourceText.indexOf("=", start)
  const arrayStart = sourceText.indexOf("[", equalsIndex)
  if (arrayStart === -1) throw new Error("DEFAULT_THEMES array start not found")

  let depth = 0
  let arrayEnd = -1
  for (let i = arrayStart; i < sourceText.length; i += 1) {
    const ch = sourceText[i]
    if (ch === "[") depth += 1
    if (ch === "]") {
      depth -= 1
      if (depth === 0) {
        arrayEnd = i
        break
      }
    }
  }

  if (arrayEnd === -1) throw new Error("DEFAULT_THEMES array end not found")
  const arrayLiteral = sourceText.slice(arrayStart, arrayEnd + 1)
  return Function(`"use strict"; return (${arrayLiteral});`)()
}

function parsePreviewThemeIds(previewSource) {
  const ids = new Set()
  for (const match of previewSource.matchAll(/id:\s*'([^']+)'/g)) {
    ids.add(match[1])
  }
  return Array.from(ids)
}

function parseWebThemeScreenshotIds(themeCardSource) {
  const startMarker = "const THEME_SCREENSHOTS"
  const start = themeCardSource.indexOf(startMarker)
  if (start === -1) return []

  const equalsIndex = themeCardSource.indexOf("=", start)
  const objectStart = themeCardSource.indexOf("{", equalsIndex)
  if (objectStart === -1) return []

  let depth = 0
  let objectEnd = -1
  for (let i = objectStart; i < themeCardSource.length; i += 1) {
    const ch = themeCardSource[i]
    if (ch === "{") depth += 1
    if (ch === "}") {
      depth -= 1
      if (depth === 0) {
        objectEnd = i
        break
      }
    }
  }

  if (objectEnd === -1) return []

  const block = themeCardSource.slice(objectStart, objectEnd + 1)
  const ids = new Set()
  for (const match of block.matchAll(/^\s*(?:"([a-z0-9-]+)"|([a-z0-9-]+))\s*:\s*\{\s*home:\s*"/gm)) {
    const id = match[1] || match[2]
    if (id) ids.add(id)
  }
  return Array.from(ids)
}

function luminance(hex) {
  const color = hex.replace("#", "")
  const r = Number.parseInt(color.slice(0, 2), 16) / 255
  const g = Number.parseInt(color.slice(2, 4), 16) / 255
  const b = Number.parseInt(color.slice(4, 6), 16) / 255
  const f = (value) => (value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4)
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
}

function contrastRatio(a, b) {
  const la = luminance(a)
  const lb = luminance(b)
  const lighter = Math.max(la, lb)
  const darker = Math.min(la, lb)
  return (lighter + 0.05) / (darker + 0.05)
}

function formatList(items) {
  if (!items || items.length === 0) return "none"
  return items.join(", ")
}

function createCheck(checkId, passed, severity, evidence, details) {
  return {
    check_id: checkId,
    status: passed ? "pass" : "fail",
    severity,
    evidence,
    details
  }
}

async function main() {
  await fs.mkdir(ARTIFACT_DIR, { recursive: true })

  const [sharedSource, previewSource, webThemeCardSource] = await Promise.all([
    fs.readFile(SHARED_INDEX, "utf8"),
    fs.readFile(PREVIEW_INDEX, "utf8"),
    fs.readFile(WEB_THEME_CARD, "utf8")
  ])

  const themes = extractThemesFromShared(sharedSource)
  const productionIds = themes.map((theme) => theme.id)
  const productionSet = new Set(productionIds)
  const previewIds = parsePreviewThemeIds(previewSource)
  const previewSet = new Set(previewIds)
  const webShotIds = parseWebThemeScreenshotIds(webThemeCardSource)
  const webShotSet = new Set(webShotIds)

  const checks = []

  checks.push(
    createCheck(
      "production_theme_total",
      themes.length === 15,
      "blocker",
      path.relative(ROOT, SHARED_INDEX),
      `Expected 15 production themes, found ${themes.length}.`
    )
  )

  const freeCount = themes.filter((theme) => !theme.isPremium).length
  const premiumCount = themes.filter((theme) => theme.isPremium).length
  checks.push(
    createCheck(
      "production_theme_split",
      freeCount === 7 && premiumCount === 8,
      "blocker",
      path.relative(ROOT, SHARED_INDEX),
      `Expected 7 free / 8 premium. Found ${freeCount} free / ${premiumCount} premium.`
    )
  )

  const uniqueIds = new Set(productionIds)
  checks.push(
    createCheck(
      "theme_ids_unique",
      uniqueIds.size === productionIds.length,
      "blocker",
      path.relative(ROOT, SHARED_INDEX),
      uniqueIds.size === productionIds.length
        ? `All ${productionIds.length} production theme IDs are unique.`
        : "Duplicate production theme IDs found."
    )
  )

  const missingColorKeys = []
  for (const theme of themes) {
    for (const key of REQUIRED_COLOR_KEYS) {
      if (!Object.hasOwn(theme.colors, key)) {
        missingColorKeys.push(`${theme.id}:${key}`)
      }
    }
  }
  checks.push(
    createCheck(
      "theme_required_color_keys",
      missingColorKeys.length === 0,
      "blocker",
      path.relative(ROOT, SHARED_INDEX),
      missingColorKeys.length === 0
        ? "All production themes include required color keys."
        : `Missing required color keys: ${formatList(missingColorKeys)}.`
    )
  )

  const invalidHexValues = []
  const hexPattern = /^#[0-9A-Fa-f]{6}$/
  for (const theme of themes) {
    for (const [key, value] of Object.entries(theme.colors)) {
      if (!hexPattern.test(value)) {
        invalidHexValues.push(`${theme.id}:${key}=${value}`)
      }
    }
  }
  checks.push(
    createCheck(
      "theme_hex_color_values",
      invalidHexValues.length === 0,
      "blocker",
      path.relative(ROOT, SHARED_INDEX),
      invalidHexValues.length === 0
        ? "All production color values are valid 6-digit hex strings."
        : `Invalid hex values: ${formatList(invalidHexValues)}.`
    )
  )

  const contrastFailures = []
  for (const theme of themes) {
    const c = theme.colors
    const ratios = [
      { name: "text/bg", value: contrastRatio(c["--cgpt-text"], c["--cgpt-bg"]), min: 4.5 },
      { name: "text/surface", value: contrastRatio(c["--cgpt-text"], c["--cgpt-surface"]), min: 4.5 },
      { name: "muted/bg", value: contrastRatio(c["--cgpt-text-muted"], c["--cgpt-bg"]), min: 3.0 },
      { name: "accent/bg", value: contrastRatio(c["--cgpt-accent"], c["--cgpt-bg"]), min: 3.0 }
    ]
    for (const ratio of ratios) {
      if (ratio.value < ratio.min) {
        contrastFailures.push(`${theme.id}:${ratio.name}=${ratio.value.toFixed(2)}<${ratio.min}`)
      }
    }
  }
  checks.push(
    createCheck(
      "theme_contrast_thresholds",
      contrastFailures.length === 0,
      "warning",
      path.relative(ROOT, SHARED_INDEX),
      contrastFailures.length === 0
        ? "All contrast thresholds passed (text/bg, text/surface, muted/bg, accent/bg)."
        : `Contrast warnings: ${formatList(contrastFailures)}.`
    )
  )

  const thumbFiles = new Set()
  try {
    for (const fileName of await fs.readdir(EXT_THUMBS_DIR)) {
      if (fileName.toLowerCase().endsWith(".png")) {
        thumbFiles.add(fileName.replace(/\.png$/i, ""))
      }
    }
  } catch {
    // handled in check below
  }

  const missingThumbs = productionIds.filter((id) => !thumbFiles.has(id))
  checks.push(
    createCheck(
      "popup_thumbnail_files_present",
      missingThumbs.length === 0,
      "blocker",
      path.relative(ROOT, EXT_THUMBS_DIR),
      missingThumbs.length === 0
        ? `All ${productionIds.length} production themes have popup thumbnails.`
        : `Missing popup thumbnails: ${formatList(missingThumbs)}.`
    )
  )

  const invalidThumbDimensions = []
  for (const id of productionIds) {
    if (!thumbFiles.has(id)) continue
    const thumbPath = path.join(EXT_THUMBS_DIR, `${id}.png`)
    const metadata = await sharp(thumbPath).metadata()
    if (metadata.width !== 280 || metadata.height !== 160) {
      invalidThumbDimensions.push(`${id}:${metadata.width || "?"}x${metadata.height || "?"}`)
    }
  }
  checks.push(
    createCheck(
      "popup_thumbnail_dimensions",
      invalidThumbDimensions.length === 0,
      "blocker",
      path.relative(ROOT, EXT_THUMBS_DIR),
      invalidThumbDimensions.length === 0
        ? "All popup thumbnails are 280x160 PNG."
        : `Invalid thumbnail dimensions: ${formatList(invalidThumbDimensions)}.`
    )
  )

  const missingInPreview = productionIds.filter((id) => !previewSet.has(id))
  const extraInPreview = previewIds.filter((id) => !productionSet.has(id))

  checks.push(
    createCheck(
      "preview_missing_production_themes",
      missingInPreview.length === 0,
      "warning",
      path.relative(ROOT, PREVIEW_INDEX),
      missingInPreview.length === 0
        ? "Preview tool contains all production theme IDs."
        : `Production IDs missing from preview tool: ${formatList(missingInPreview)}.`
    )
  )

  checks.push(
    createCheck(
      "preview_extra_non_production_themes",
      extraInPreview.length === 0,
      "warning",
      path.relative(ROOT, PREVIEW_INDEX),
      extraInPreview.length === 0
        ? "Preview tool has no non-production extras."
        : `Preview-only IDs: ${formatList(extraInPreview)}.`
    )
  )

  const webMissing = productionIds.filter((id) => !webShotSet.has(id))
  const webExtra = webShotIds.filter((id) => !productionSet.has(id))

  checks.push(
    createCheck(
      "web_theme_screenshot_mapping_missing",
      webMissing.length === 0,
      "warning",
      path.relative(ROOT, WEB_THEME_CARD),
      webMissing.length === 0
        ? "Web theme screenshot mapping covers all production IDs."
        : `Web screenshot mapping missing production IDs: ${formatList(webMissing)}.`
    )
  )

  checks.push(
    createCheck(
      "web_theme_screenshot_mapping_extra",
      webExtra.length === 0,
      "warning",
      path.relative(ROOT, WEB_THEME_CARD),
      webExtra.length === 0
        ? "Web theme screenshot mapping has no non-production IDs."
        : `Web screenshot mapping extra IDs: ${formatList(webExtra)}.`
    )
  )

  const blockerFailures = checks.filter((check) => check.status === "fail" && check.severity === "blocker")
  const warningFailures = checks.filter((check) => check.status === "fail" && check.severity === "warning")

  const artifact = {
    generatedAt: new Date().toISOString(),
    sourceOfTruth: path.relative(ROOT, SHARED_INDEX),
    totals: {
      productionThemes: themes.length,
      freeThemes: freeCount,
      premiumThemes: premiumCount,
      checks: checks.length,
      blockerFailures: blockerFailures.length,
      warningFailures: warningFailures.length
    },
    checks
  }

  await fs.writeFile(ARTIFACT_JSON, JSON.stringify(artifact, null, 2))

  const reportLines = [
    "# Theme Catalog Audit - 2026-02-25",
    "",
    "## Scope",
    "- Production source of truth: `packages/shared/src/index.ts`",
    "- Popup thumbnail requirement: real screenshot PNG files in `apps/extension/assets/themes`",
    "- Drift checks: preview tool catalog and web screenshot mapping",
    "",
    "## Summary",
    `- Production themes: ${themes.length} (free ${freeCount}, premium ${premiumCount})`,
    `- Total checks: ${checks.length}`,
    `- Blocker failures: ${blockerFailures.length}`,
    `- Warning failures: ${warningFailures.length}`,
    `- JSON artifact: \`${path.relative(ROOT, ARTIFACT_JSON)}\``,
    "",
    "## Checks",
    "| Check ID | Status | Severity | Details | Evidence |",
    "|---|---|---|---|---|"
  ]

  for (const check of checks) {
    reportLines.push(`| ${check.check_id} | ${check.status} | ${check.severity} | ${check.details.replaceAll("|", "\\|")} | ${check.evidence} |`)
  }

  reportLines.push("")
  await fs.writeFile(REPORT_PATH, reportLines.join("\n"))

  console.log(`Theme catalog audit complete: ${path.relative(ROOT, REPORT_PATH)}`)
  console.log(`Artifact JSON: ${path.relative(ROOT, ARTIFACT_JSON)}`)

  if (blockerFailures.length > 0) {
    process.exit(1)
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
