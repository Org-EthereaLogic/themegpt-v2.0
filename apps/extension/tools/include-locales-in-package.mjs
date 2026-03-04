#!/usr/bin/env node

import { cpSync, existsSync, rmSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const packageTarget = process.argv[2] ?? 'chrome-mv3-prod'
const packageDir = join(__dirname, '..', 'build', packageTarget)
const localesSource = join(__dirname, '..', '_locales')
const localesDestination = join(packageDir, '_locales')
const zipPath = join(__dirname, '..', 'build', `${packageTarget}.zip`)
const packageWorkingDir = join(__dirname, '..', 'build')

if (!existsSync(packageDir)) {
  console.error(`Package directory not found: ${packageDir}`)
  process.exit(1)
}

if (!existsSync(localesSource)) {
  console.error(`Locale source directory not found: ${localesSource}`)
  process.exit(1)
}

if (existsSync(localesDestination)) {
  rmSync(localesDestination, { recursive: true, force: true })
}

cpSync(localesSource, localesDestination, { recursive: true })
console.log(`Copied locales to ${localesDestination}`)

if (existsSync(zipPath)) {
  rmSync(zipPath)
}

const zipResult = spawnSync('zip', ['-qr', `${packageTarget}.zip`, packageTarget], {
  cwd: packageWorkingDir,
  stdio: 'inherit',
  shell: false,
})

if (zipResult.status !== 0) {
  console.error('Failed to repackage extension zip with locales')
  process.exit(1)
}

console.log(`Rebuilt ${packageTarget}.zip with locale resources`)
