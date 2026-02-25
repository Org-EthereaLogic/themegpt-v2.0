#!/usr/bin/env node

import fs from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"
import sharp from "sharp"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT = path.resolve(__dirname, "..")

const SHARED_INDEX = path.join(ROOT, "packages/shared/src/index.ts")
const SOURCE_DIR = path.join(ROOT, "asset/images")
const TARGET_DIR = path.join(ROOT, "apps/extension/assets/themes")
const ARTIFACT_DIR = path.join(ROOT, "doc/report/audit-artifacts/theme-thumbs")
const ARTIFACT_PATH = path.join(ARTIFACT_DIR, "thumb-generation.json")

const OVERRIDE_BASE_NAMES = {
  "silent-night-starfield": "silent_night"
}

function extractThemesFromShared(sourceText) {
  const marker = "export const DEFAULT_THEMES: Theme[] = ["
  const start = sourceText.indexOf(marker)
  if (start === -1) {
    throw new Error("Could not find DEFAULT_THEMES marker in shared index")
  }

  const equalsIndex = sourceText.indexOf("=", start)
  const arrayStart = sourceText.indexOf("[", equalsIndex)
  if (arrayStart === -1) {
    throw new Error("Could not locate DEFAULT_THEMES array start")
  }

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

  if (arrayEnd === -1) {
    throw new Error("Could not locate DEFAULT_THEMES array end")
  }

  const arrayLiteral = sourceText.slice(arrayStart, arrayEnd + 1)
  return Function(`"use strict"; return (${arrayLiteral});`)()
}

function toSourceBaseName(themeId) {
  if (OVERRIDE_BASE_NAMES[themeId]) return OVERRIDE_BASE_NAMES[themeId]
  return themeId.replaceAll("-", "_")
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

async function main() {
  const sharedSource = await fs.readFile(SHARED_INDEX, "utf8")
  const themes = extractThemesFromShared(sharedSource)

  await fs.mkdir(TARGET_DIR, { recursive: true })
  await fs.mkdir(ARTIFACT_DIR, { recursive: true })

  const results = []
  const missingSources = []

  for (const theme of themes) {
    const themeId = theme.id
    const baseName = toSourceBaseName(themeId)
    const candidates = [
      path.join(SOURCE_DIR, `${baseName}_1.png`),
      path.join(SOURCE_DIR, `${baseName}.png`)
    ]

    let sourcePath = null
    for (const candidate of candidates) {
      if (await fileExists(candidate)) {
        sourcePath = candidate
        break
      }
    }

    if (!sourcePath) {
      missingSources.push({
        themeId,
        checked: candidates
      })
      continue
    }

    const targetPath = path.join(TARGET_DIR, `${themeId}.png`)
    await sharp(sourcePath)
      .resize(280, 160, { fit: "cover", position: "centre" })
      .png({ compressionLevel: 9 })
      .toFile(targetPath)

    const metadata = await sharp(targetPath).metadata()
    results.push({
      themeId,
      source: path.relative(ROOT, sourcePath),
      output: path.relative(ROOT, targetPath),
      width: metadata.width,
      height: metadata.height
    })
  }

  const artifact = {
    generatedAt: new Date().toISOString(),
    totalThemes: themes.length,
    generated: results.length,
    missingSources,
    files: results
  }

  await fs.writeFile(ARTIFACT_PATH, JSON.stringify(artifact, null, 2))

  if (missingSources.length > 0) {
    console.error("Missing source screenshots for one or more themes:")
    for (const missing of missingSources) {
      console.error(`- ${missing.themeId}`)
      for (const candidate of missing.checked) {
        console.error(`  - ${path.relative(ROOT, candidate)}`)
      }
    }
    process.exit(1)
  }

  console.log(`Generated ${results.length} popup thumbnails in ${path.relative(ROOT, TARGET_DIR)}`)
  console.log(`Artifact written to ${path.relative(ROOT, ARTIFACT_PATH)}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
