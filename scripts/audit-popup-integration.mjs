#!/usr/bin/env node

import fs from "node:fs/promises"
import path from "node:path"
import { spawnSync } from "node:child_process"
import { fileURLToPath } from "node:url"
import puppeteer from "puppeteer"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT = path.resolve(__dirname, "..")

const SHARED_INDEX = path.join(ROOT, "packages/shared/src/index.ts")
const EXTENSION_BUILD_DIR = path.join(ROOT, "apps/extension/build/chrome-mv3-prod")

const ARTIFACT_DIR = path.join(ROOT, "doc/report/audit-artifacts/popup")
const CARD_SHOTS_DIR = path.join(ARTIFACT_DIR, "theme-cards")
const ARTIFACT_JSON = path.join(ARTIFACT_DIR, "popup-checks.json")
const ARTIFACT_MD = path.join(ARTIFACT_DIR, "popup-audit.md")
const POPUP_SCREENSHOT = path.join(ARTIFACT_DIR, "popup-full.png")

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

async function ensureBuild() {
  const result = spawnSync("pnpm", ["--filter", "extension", "build"], {
    cwd: ROOT,
    stdio: "inherit"
  })

  if (result.status !== 0) {
    throw new Error("Failed to build extension before popup audit")
  }
}

async function main() {
  await ensureBuild()
  await fs.mkdir(ARTIFACT_DIR, { recursive: true })
  await fs.mkdir(CARD_SHOTS_DIR, { recursive: true })

  const sharedSource = await fs.readFile(SHARED_INDEX, "utf8")
  const themes = extractThemesFromShared(sharedSource)
  const themeNames = themes.map((theme) => theme.name)
  const premiumIds = themes.filter((theme) => theme.isPremium).map((theme) => theme.id)

  const browser = await puppeteer.launch({
    headless: "new",
    args: [
      `--disable-extensions-except=${EXTENSION_BUILD_DIR}`,
      `--load-extension=${EXTENSION_BUILD_DIR}`,
      "--no-sandbox",
      "--disable-setuid-sandbox"
    ]
  })

  let page
  let extensionId = null

  try {
    const serviceWorkerTarget = await browser.waitForTarget(
      (target) => target.type() === "service_worker" && target.url().startsWith("chrome-extension://"),
      { timeout: 20000 }
    )

    extensionId = new URL(serviceWorkerTarget.url()).host
    page = await browser.newPage()
    await page.setViewport({ width: 420, height: 980 })

    const popupUrl = `chrome-extension://${extensionId}/popup.html`
    await page.goto(popupUrl, { waitUntil: "networkidle2" })

    await page.evaluate(
      (ids) =>
        new Promise((resolve) => {
          chrome.storage.local.set(
            {
              unlockedThemes: ids,
              themeApplyCount: 0,
              reviewAskDismissed: true
            },
            resolve
          )
        }),
      premiumIds
    )

    await page.reload({ waitUntil: "networkidle2" })
    await page.waitForSelector("body")
    await page.screenshot({ path: POPUP_SCREENSHOT, fullPage: true })

    const metrics = await page.evaluate((expectedThemeNames) => {
      const labels = Array.from(document.querySelectorAll("button[aria-label]"))
        .map((el) => el.getAttribute("aria-label") || "")

      const themeButtons = Array.from(document.querySelectorAll("button[aria-label]"))
        .filter((button) => {
          const label = button.getAttribute("aria-label") || ""
          return label.startsWith("Apply ") || label.includes(" - Premium")
        })

      const cardsMissingImage = []
      const cardsWithImage = []
      for (const button of themeButtons) {
        const label = button.getAttribute("aria-label") || ""
        const img = button.querySelector("img[alt$='preview']")
        if (!img || !img.complete || img.naturalWidth === 0) {
          cardsMissingImage.push(label)
        } else {
          cardsWithImage.push(label)
        }
      }

      const missingThemeNames = expectedThemeNames.filter((name) => {
        return !labels.some((label) => label.includes(name))
      })

      const clickableButtons = themeButtons.filter((button) => {
        const label = button.getAttribute("aria-label") || ""
        return label.startsWith("Apply ")
      })

      const clickFailures = []
      for (const button of clickableButtons) {
        const label = button.getAttribute("aria-label") || ""
        try {
          button.click()
        } catch {
          clickFailures.push(label)
        }
      }

      const sessionTokenVisible = document.body.textContent.includes("Session Tokens")
      const canvasLabel = Array.from(document.querySelectorAll("label")).find((label) => {
        return label.textContent && label.textContent.includes("Canvas")
      })
      const select = canvasLabel ? canvasLabel.querySelector("select") : null
      const canvasOptions = select ? Array.from(select.options).map((option) => option.textContent.trim()) : []

      return {
        themeButtonCount: themeButtons.length,
        cardsMissingImage,
        cardsWithImage,
        missingThemeNames,
        clickFailures,
        clickableCount: clickableButtons.length,
        sessionTokenVisible,
        canvasOptions
      }
    }, themeNames)

    for (const theme of themes) {
      const box = await page.evaluate((name) => {
        const buttons = Array.from(document.querySelectorAll("button[aria-label]"))
        const button = buttons.find((el) => (el.getAttribute("aria-label") || "").includes(name))
        if (!button) return null

        button.scrollIntoView({ behavior: "instant", block: "center" })
        const rect = button.getBoundingClientRect()
        return {
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height
        }
      }, theme.name)

      if (!box || box.width <= 0 || box.height <= 0) continue
      await new Promise((resolve) => setTimeout(resolve, 100))

      await page.screenshot({
        path: path.join(CARD_SHOTS_DIR, `${theme.id}.png`),
        clip: {
          x: Math.max(0, Math.floor(box.x)),
          y: Math.max(0, Math.floor(box.y)),
          width: Math.max(1, Math.floor(box.width)),
          height: Math.max(1, Math.floor(box.height))
        }
      })
    }

    const cardShotFiles = await fs.readdir(CARD_SHOTS_DIR)
    const shotCount = cardShotFiles.filter((file) => file.endsWith(".png")).length

    const checks = [
      createCheck(
        "popup_theme_card_count",
        metrics.themeButtonCount === themes.length,
        "blocker",
        path.relative(ROOT, POPUP_SCREENSHOT),
        `Expected ${themes.length} theme cards, found ${metrics.themeButtonCount}.`
      ),
      createCheck(
        "popup_theme_names_present",
        metrics.missingThemeNames.length === 0,
        "blocker",
        path.relative(ROOT, POPUP_SCREENSHOT),
        metrics.missingThemeNames.length === 0
          ? "All production theme names are visible in popup cards."
          : `Missing theme names in popup: ${metrics.missingThemeNames.join(", ")}.`
      ),
      createCheck(
        "popup_thumbnails_loaded",
        metrics.cardsMissingImage.length === 0,
        "blocker",
        path.relative(ROOT, POPUP_SCREENSHOT),
        metrics.cardsMissingImage.length === 0
          ? `All ${themes.length} theme cards render loaded screenshot thumbnails.`
          : `Cards missing loaded screenshots: ${metrics.cardsMissingImage.join(" | ")}.`
      ),
      createCheck(
        "popup_canvas_selector_options",
        JSON.stringify(metrics.canvasOptions) === JSON.stringify(["Off", "Side Top", "Compose Right"]),
        "blocker",
        path.relative(ROOT, POPUP_SCREENSHOT),
        `Canvas options rendered: ${metrics.canvasOptions.join(", ") || "none"}.`
      ),
      createCheck(
        "popup_session_tokens_visible",
        metrics.sessionTokenVisible,
        "blocker",
        path.relative(ROOT, POPUP_SCREENSHOT),
        metrics.sessionTokenVisible
          ? "Session Tokens block is visible in popup."
          : "Session Tokens block is not visible in popup."
      ),
      createCheck(
        "popup_theme_cards_clickable",
        metrics.clickableCount > 0 && metrics.clickFailures.length === 0,
        "warning",
        path.relative(ROOT, POPUP_SCREENSHOT),
        metrics.clickableCount === 0
          ? "No apply-state theme cards were available for click interaction checks."
          : metrics.clickFailures.length === 0
            ? `All ${metrics.clickableCount} apply-state theme cards accepted click interactions.`
            : `Theme card click failures: ${metrics.clickFailures.join(", ")}.`
      ),
      createCheck(
        "popup_theme_card_screenshots_created",
        shotCount === themes.length,
        "warning",
        path.relative(ROOT, CARD_SHOTS_DIR),
        `Expected ${themes.length} per-card screenshots, wrote ${shotCount}.`
      )
    ]

    const blockerFailures = checks.filter((check) => check.status === "fail" && check.severity === "blocker")
    const warningFailures = checks.filter((check) => check.status === "fail" && check.severity === "warning")

    const artifact = {
      generatedAt: new Date().toISOString(),
      extensionId,
      totals: {
        checks: checks.length,
        blockerFailures: blockerFailures.length,
        warningFailures: warningFailures.length
      },
      checks
    }

    await fs.writeFile(ARTIFACT_JSON, JSON.stringify(artifact, null, 2))

    const lines = [
      "# Popup Integration Audit",
      "",
      `- Extension ID: ${extensionId}`,
      `- Popup screenshot: \`${path.relative(ROOT, POPUP_SCREENSHOT)}\``,
      `- Card screenshots directory: \`${path.relative(ROOT, CARD_SHOTS_DIR)}\``,
      `- JSON artifact: \`${path.relative(ROOT, ARTIFACT_JSON)}\``,
      "",
      "| Check ID | Status | Severity | Details | Evidence |",
      "|---|---|---|---|---|"
    ]

    for (const check of checks) {
      lines.push(`| ${check.check_id} | ${check.status} | ${check.severity} | ${check.details.replaceAll("|", "\\|")} | ${check.evidence} |`)
    }

    lines.push("")
    await fs.writeFile(ARTIFACT_MD, lines.join("\n"))

    console.log(`Popup audit complete: ${path.relative(ROOT, ARTIFACT_MD)}`)

    if (blockerFailures.length > 0) {
      process.exit(1)
    }
  } finally {
    await browser.close()
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
