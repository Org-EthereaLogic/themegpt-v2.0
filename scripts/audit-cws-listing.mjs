#!/usr/bin/env node

import fs from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"
import sharp from "sharp"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT = path.resolve(__dirname, "..")

const REQUIRED_VIDEO_URL = "https://youtu.be/TFgUKvVzA6U"
const REQUIRED_VIDEO_ID = "TFgUKvVzA6U"
const LIVE_LISTING_URL = "https://chromewebstore.google.com/detail/themegpt/dlphknialdlpmcgoknkcmapmclgckhba"

const SHARED_INDEX = path.join(ROOT, "packages/shared/src/index.ts")
const DRAFT_LISTING = path.join(ROOT, "doc/chrome-store-listing.md")
const ARTIFACT_DIR = path.join(ROOT, "doc/report/audit-artifacts/cws")
const ARTIFACT_JSON = path.join(ARTIFACT_DIR, "cws-listing-checks.json")
const REPORT_PATH = path.join(ROOT, "doc/report/cws-listing-audit-2026-02-25.md")

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

function createCheck(checkId, passed, severity, evidence, details) {
  return {
    check_id: checkId,
    status: passed ? "pass" : "fail",
    severity,
    evidence,
    details
  }
}

function decodeHtmlUrl(value) {
  return value.replaceAll("&amp;", "&")
}

function hasHostname(url, hostname) {
  try {
    return new URL(url).hostname === hostname
  } catch {
    return false
  }
}

function safeHref(url) {
  try {
    return new URL(url).href
  } catch {
    return ""
  }
}

async function fetchStatus(url) {
  try {
    const response = await fetch(url, { method: "GET", redirect: "follow" })
    return response.status
  } catch {
    return 0
  }
}

async function analyzeLiveScreenshots(urls) {
  const results = []
  for (const url of urls) {
    const imageUrl = `${url}=s0`
    const response = await fetch(imageUrl)
    if (!response.ok) {
      results.push({ url, ok: false, status: response.status, width: 0, height: 0, bytes: 0 })
      continue
    }

    const buffer = Buffer.from(await response.arrayBuffer())
    const metadata = await sharp(buffer).metadata()
    results.push({
      url,
      ok: true,
      status: response.status,
      width: metadata.width || 0,
      height: metadata.height || 0,
      bytes: buffer.byteLength
    })
  }
  return results
}

async function main() {
  await fs.mkdir(ARTIFACT_DIR, { recursive: true })

  const [sharedSource, draftSource, liveHtml] = await Promise.all([
    fs.readFile(SHARED_INDEX, "utf8"),
    fs.readFile(DRAFT_LISTING, "utf8"),
    fetch(LIVE_LISTING_URL).then(async (response) => {
      if (!response.ok) {
        throw new Error(`Failed to fetch live CWS listing (${response.status})`)
      }
      return response.text()
    })
  ])

  const themes = extractThemesFromShared(sharedSource)
  const totalThemes = themes.length
  const freeThemes = themes.filter((theme) => !theme.isPremium).length
  const premiumThemes = themes.filter((theme) => theme.isPremium).length

  const mediaUrls = Array.from(liveHtml.matchAll(/data-media-url="([^"]+)"/g)).map((match) => decodeHtmlUrl(match[1]))
  const screenshotUrls = Array.from(new Set(mediaUrls.filter((url) => hasHostname(url, "lh3.googleusercontent.com")))).map(safeHref)
  const videoEmbeds = Array.from(new Set(mediaUrls.filter((url) => {
    try {
      const parsed = new URL(url)
      return parsed.hostname === "www.youtube.com" && parsed.pathname.startsWith("/embed/")
    } catch {
      return false
    }
  }))).map(safeHref)

  const screenshotAnalysis = await analyzeLiveScreenshots(screenshotUrls)
  const screenshotFailures = screenshotAnalysis.filter((item) => {
    if (!item.ok) return true
    if (item.width < 1280 || item.height < 800) return true
    if (item.bytes > 5 * 1024 * 1024) return true
    return false
  })

  const matchingVideoEmbeds = videoEmbeds.filter((url) => url.includes(REQUIRED_VIDEO_ID))

  const shortDescriptionMatch = draftSource.match(/## Short Description \(132 chars max\)\n([^\n]+)/)
  const shortDescription = shortDescriptionMatch ? shortDescriptionMatch[1].trim() : ""
  const shortDescriptionLength = Array.from(shortDescription).length

  const totalClaimMatch = draftSource.match(/(\d+)\s+HANDCRAFTED THEMES/i)
  const freeClaimMatch = draftSource.match(/FREE COLLECTION \((\d+) themes\)/i)
  const premiumClaimMatch = draftSource.match(/PREMIUM COLLECTION \((\d+) themes/i)

  const claimedTotal = totalClaimMatch ? Number.parseInt(totalClaimMatch[1], 10) : null
  const claimedFree = freeClaimMatch ? Number.parseInt(freeClaimMatch[1], 10) : null
  const claimedPremium = premiumClaimMatch ? Number.parseInt(premiumClaimMatch[1], 10) : null

  const requiredVideoParsed = new URL(REQUIRED_VIDEO_URL)
  const draftUrlMatches = Array.from(draftSource.matchAll(/https?:\/\/[^\s)>\]]+/g), (m) => m[0])
  const draftHasVideoUrl = draftUrlMatches.some((rawUrl) => {
    try {
      const parsed = new URL(rawUrl)
      return parsed.origin === requiredVideoParsed.origin && parsed.pathname === requiredVideoParsed.pathname
    } catch {
      return false
    }
  })

  const supportStatus = await fetchStatus("https://themegpt.ai/support")
  const privacyStatus = await fetchStatus("https://themegpt.ai/privacy")

  const checks = [
    createCheck(
      "draft_short_description_length",
      shortDescriptionLength > 0 && shortDescriptionLength <= 132,
      "blocker",
      path.relative(ROOT, DRAFT_LISTING),
      `Short description length is ${shortDescriptionLength} characters.`
    ),
    createCheck(
      "draft_contains_required_video_url",
      draftHasVideoUrl,
      "blocker",
      path.relative(ROOT, DRAFT_LISTING),
      draftHasVideoUrl
        ? `Draft listing includes required promo video URL ${REQUIRED_VIDEO_URL}.`
        : `Draft listing is missing required promo video URL ${REQUIRED_VIDEO_URL}.`
    ),
    createCheck(
      "draft_theme_counts_match_production",
      claimedTotal === totalThemes && claimedFree === freeThemes && claimedPremium === premiumThemes,
      "blocker",
      path.relative(ROOT, DRAFT_LISTING),
      `Draft claims total/free/premium = ${claimedTotal ?? "missing"}/${claimedFree ?? "missing"}/${claimedPremium ?? "missing"}; production is ${totalThemes}/${freeThemes}/${premiumThemes}.`
    ),
    createCheck(
      "live_screenshot_media_present",
      screenshotUrls.length > 0,
      "blocker",
      LIVE_LISTING_URL,
      `Live listing screenshot count: ${screenshotUrls.length}.`
    ),
    createCheck(
      "live_screenshot_media_compliance",
      screenshotFailures.length === 0,
      "blocker",
      LIVE_LISTING_URL,
      screenshotFailures.length === 0
        ? "All live screenshots meet dimension and size limits (>=1280x800, <=5MB)."
        : `Screenshot compliance failures: ${screenshotFailures
            .map((item) => `${item.url} [${item.width}x${item.height}, ${item.bytes} bytes]`)
            .join("; ")}`
    ),
    createCheck(
      "live_required_video_embed_present",
      matchingVideoEmbeds.length === 1,
      "blocker",
      LIVE_LISTING_URL,
      `Found ${matchingVideoEmbeds.length} unique embed URLs containing ${REQUIRED_VIDEO_ID}.`
    ),
    createCheck(
      "live_support_link_status",
      supportStatus === 200,
      "blocker",
      "https://themegpt.ai/support",
      `Support URL returned HTTP ${supportStatus}.`
    ),
    createCheck(
      "live_privacy_link_status",
      privacyStatus === 200,
      "blocker",
      "https://themegpt.ai/privacy",
      `Privacy URL returned HTTP ${privacyStatus}.`
    ),
    createCheck(
      "live_contains_video_url_evidence",
      matchingVideoEmbeds.length > 0,
      "info",
      LIVE_LISTING_URL,
      matchingVideoEmbeds.length > 0
        ? `Video embed URLs: ${matchingVideoEmbeds.join(", ")}`
        : `No embed URLs matched required video ID ${REQUIRED_VIDEO_ID}.`
    )
  ]

  const blockerFailures = checks.filter((check) => check.status === "fail" && check.severity === "blocker")
  const warningFailures = checks.filter((check) => check.status === "fail" && check.severity === "warning")

  const artifact = {
    generatedAt: new Date().toISOString(),
    liveListingUrl: LIVE_LISTING_URL,
    requiredVideoUrl: REQUIRED_VIDEO_URL,
    requiredVideoId: REQUIRED_VIDEO_ID,
    screenshotAnalysis,
    videoEmbeds,
    checks,
    totals: {
      checks: checks.length,
      blockerFailures: blockerFailures.length,
      warningFailures: warningFailures.length
    }
  }

  await fs.writeFile(ARTIFACT_JSON, JSON.stringify(artifact, null, 2))

  const lines = [
    "# CWS Listing Audit - 2026-02-25",
    "",
    `- Live listing: ${LIVE_LISTING_URL}`,
    `- Required promo video: ${REQUIRED_VIDEO_URL}`,
    `- JSON artifact: \`${path.relative(ROOT, ARTIFACT_JSON)}\``,
    "",
    "## Live Media",
    `- Screenshot URLs found: ${screenshotUrls.length}`,
    `- Video embed URLs found: ${videoEmbeds.length}`,
    `- Required video embeds found: ${matchingVideoEmbeds.length}`,
    "",
    "## Checks",
    "| Check ID | Status | Severity | Details | Evidence |",
    "|---|---|---|---|---|"
  ]

  for (const check of checks) {
    lines.push(`| ${check.check_id} | ${check.status} | ${check.severity} | ${check.details.replaceAll("|", "\\|")} | ${check.evidence} |`)
  }

  lines.push("")
  const report = lines.join("\n")
  // Validate report before writing — reject unexpected control characters from network data
  if (/[\x00-\x08\x0B\x0C\x0E-\x1F]/.test(report)) {
    throw new Error("Report contains unexpected control characters from fetched data")
  }
  await fs.writeFile(REPORT_PATH, report)

  console.log(`CWS listing audit complete: ${path.relative(ROOT, REPORT_PATH)}`)
  console.log(`Artifact JSON: ${path.relative(ROOT, ARTIFACT_JSON)}`)

  if (blockerFailures.length > 0) {
    process.exit(1)
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
