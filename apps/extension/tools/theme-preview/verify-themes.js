/**
 * Theme Verification Script for ThemeGPT Preview
 * Production-15 audit mode
 *
 * Run this in the browser console at http://localhost:8889/index.html
 */

const PRODUCTION_THEME_IDS = [
  'themegpt-dark',
  'themegpt-light',
  'solarized-dark',
  'dracula',
  'monokai-pro',
  'high-contrast',
  'one-dark',
  'aurora-borealis',
  'sunset-blaze',
  'electric-dreams',
  'woodland-retreat',
  'frosted-windowpane',
  'silent-night-starfield',
  'synth-wave',
  'shades-of-purple'
]

function verifyThemeById(themeId) {
  const availableThemes = ThemeGPT.list()
  const themeExists = availableThemes.some((theme) => theme.id === themeId)

  console.group(`\n🎨 Verifying: ${themeId}`)

  if (!themeExists) {
    console.warn(`⚠️  Missing in preview catalog: ${themeId}`)
    console.groupEnd()
    return {
      themeId,
      status: 'missing',
      checks: [],
      allPass: false
    }
  }

  const applyResult = ThemeGPT.apply(themeId)
  if (!applyResult.success) {
    console.error(`❌ Failed to apply theme: ${themeId}`)
    console.groupEnd()
    return {
      themeId,
      status: 'apply-failed',
      checks: [],
      allPass: false
    }
  }

  const state = ThemeGPT.getState()
  const validation = ThemeGPT.validate()

  console.log(`✅ Applied: ${state.theme?.name || themeId}`)

  if (validation.allPass) {
    console.log('✅ Quality checks passed')
  } else {
    console.warn('⚠️  Quality check warnings:')
    validation.checks
      .filter((check) => !check.pass)
      .forEach((check) => {
        console.warn(`  - ${check.name}: ${check.value} (target: ${check.target})`)
      })
  }

  console.groupEnd()
  return {
    themeId,
    status: 'verified',
    checks: validation.checks,
    allPass: validation.allPass
  }
}

function verifyProductionCoverage() {
  const available = ThemeGPT.list().map((theme) => theme.id)
  const missing = PRODUCTION_THEME_IDS.filter((id) => !available.includes(id))
  const extra = available.filter((id) => !PRODUCTION_THEME_IDS.includes(id))

  console.group('\n📋 Production Coverage Audit')
  console.log(`Production IDs expected: ${PRODUCTION_THEME_IDS.length}`)
  console.log(`Preview IDs available: ${available.length}`)

  if (missing.length === 0) {
    console.log('✅ All production IDs are present in preview tool')
  } else {
    console.warn(`⚠️  Missing production IDs in preview: ${missing.join(', ')}`)
  }

  if (extra.length === 0) {
    console.log('✅ No preview-only extra IDs detected')
  } else {
    console.warn(`ℹ️  Preview-only IDs (non-blocking drift): ${extra.join(', ')}`)
  }

  console.groupEnd()
  return { missing, extra, available }
}

function runAllVerifications() {
  console.clear()
  console.log('🚀 ThemeGPT Production-15 Verification\n')

  const coverage = verifyProductionCoverage()
  const results = []

  PRODUCTION_THEME_IDS.forEach((themeId, index) => {
    setTimeout(() => {
      results.push(verifyThemeById(themeId))

      if (index === PRODUCTION_THEME_IDS.length - 1) {
        setTimeout(() => {
          const verified = results.filter((result) => result.status === 'verified')
          const missing = results.filter((result) => result.status === 'missing')
          const applyFailed = results.filter((result) => result.status === 'apply-failed')
          const qualityWarnings = verified.filter((result) => !result.allPass)

          console.log('\n\n✨ Verification Complete')
          console.log(`- Verified themes: ${verified.length}`)
          console.log(`- Missing themes: ${missing.length}`)
          console.log(`- Apply failures: ${applyFailed.length}`)
          console.log(`- Quality warnings: ${qualityWarnings.length}`)

          if (coverage.missing.length > 0) {
            console.log('\n⚠️ Preview drift detected. Missing production IDs:')
            console.log(`  ${coverage.missing.join(', ')}`)
          }

          if (coverage.extra.length > 0) {
            console.log('\nℹ️ Preview includes additional non-production IDs:')
            console.log(`  ${coverage.extra.join(', ')}`)
          }

          console.log('\nUse ThemeGPT.apply("theme-id") for targeted manual inspection.')
        }, 500)
      }
    }, index * 600)
  })
}

console.log('Theme verification script loaded!')
console.log('Run: runAllVerifications()')
console.log('Run single theme: verifyThemeById("aurora-borealis")')
