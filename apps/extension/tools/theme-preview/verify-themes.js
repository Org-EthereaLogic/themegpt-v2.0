/**
 * Theme Verification Script for ThemeGPT Preview
 * Run this in the browser console at http://localhost:8889/index.html
 */

const VERIFICATION_TESTS = [
  {
    id: 'vscode-dark-plus',
    name: 'VS Code Dark+',
    expectedFeatures: {
      pattern: 'dots',
      overlay: 'noise',
      isPremium: false
    }
  },
  {
    id: 'dracula',
    name: 'Dracula',
    expectedFeatures: {
      pattern: 'dots',
      overlay: 'glow',
      isPremium: false
    }
  },
  {
    id: 'aurora-borealis',
    name: 'Aurora Borealis',
    expectedFeatures: {
      pattern: 'stars',
      overlay: 'glow',
      isPremium: false
    }
  },
  {
    id: 'cozy-cabin-christmas',
    name: 'Cozy Cabin Christmas',
    expectedFeatures: {
      isPremium: true,
      effects: ['treeSilhouettes', 'animatedSnowfall'],
      overlay: 'noise'
    }
  },
  {
    id: 'frosted-windowpane',
    name: 'Frosted Windowpane',
    expectedFeatures: {
      isPremium: true,
      effects: ['animatedSnowfall', 'seasonalDecorations'],
      frostedGlass: true
    }
  },
  {
    id: 'purple-twilight',
    name: 'Purple Twilight',
    expectedFeatures: {
      isPremium: true,
      effects: ['twinklingStars', 'ambientEffects', 'seasonalDecorations'],
      overlay: 'noise', // noise takes priority over glow
      candleGlow: true
    }
  }
];

function verifyTheme(testSpec) {
  console.group(`\n🎨 Verifying: ${testSpec.name}`);

  // Apply the theme
  const result = ThemeGPT.apply(testSpec.id);
  if (!result.success) {
    console.error(`❌ Failed to load theme: ${testSpec.id}`);
    console.groupEnd();
    return false;
  }

  // Get current state
  const state = ThemeGPT.getState();
  const theme = state.theme;

  if (!theme) {
    console.error('❌ No theme loaded');
    console.groupEnd();
    return false;
  }

  console.log('✅ Theme loaded:', theme.name);

  // Verify premium status
  if (theme.isPremium !== testSpec.expectedFeatures.isPremium) {
    console.error(`❌ Premium status mismatch: expected ${testSpec.expectedFeatures.isPremium}, got ${theme.isPremium}`);
  } else {
    console.log(`✅ Premium status: ${theme.isPremium}`);
  }

  // Verify pattern
  if (testSpec.expectedFeatures.pattern) {
    if (theme.pattern?.type === testSpec.expectedFeatures.pattern) {
      console.log(`✅ Pattern: ${theme.pattern.type} (opacity: ${theme.pattern.opacity})`);
    } else {
      console.error(`❌ Pattern mismatch: expected ${testSpec.expectedFeatures.pattern}, got ${theme.pattern?.type}`);
    }
  }

  // Verify overlay
  if (testSpec.expectedFeatures.overlay === 'noise') {
    if (theme.noiseOverlay) {
      console.log('✅ Noise overlay present');
    } else {
      console.error('❌ Noise overlay missing');
    }
  } else if (testSpec.expectedFeatures.overlay === 'glow') {
    if (theme.glowOverlay) {
      console.log('✅ Glow overlay present');
    } else {
      console.error('❌ Glow overlay missing');
    }
  } else if (testSpec.expectedFeatures.overlay === 'both') {
    if (theme.noiseOverlay && theme.glowOverlay) {
      console.log('✅ Both overlay flags set (noise takes priority over glow)');
    } else {
      console.error(`❌ Overlays missing: noise=${theme.noiseOverlay}, glow=${theme.glowOverlay}`);
    }
  }

  // Verify effects
  if (testSpec.expectedFeatures.effects) {
    if (!theme.effects) {
      console.error('❌ No effects defined');
    } else {
      console.log('✅ Effects object present');

      // Check specific effects
      testSpec.expectedFeatures.effects.forEach(effectType => {
        if (effectType === 'treeSilhouettes' && theme.effects.treeSilhouettes?.enabled) {
          console.log(`  ✅ Tree silhouettes: ${theme.effects.treeSilhouettes.style}, density: ${theme.effects.treeSilhouettes.density}`);
        } else if (effectType === 'animatedSnowfall' && theme.effects.animatedSnowfall?.enabled) {
          console.log(`  ✅ Snowfall: ${theme.effects.animatedSnowfall.style}, density: ${theme.effects.animatedSnowfall.density}`);
        } else if (effectType === 'twinklingStars' && theme.effects.twinklingStars?.enabled) {
          console.log(`  ✅ Twinkling stars: count=${theme.effects.twinklingStars.count}`);
        } else if (effectType === 'ambientEffects' && theme.effects.ambientEffects) {
          const ambient = Object.keys(theme.effects.ambientEffects).filter(k => theme.effects.ambientEffects[k]);
          console.log(`  ✅ Ambient effects: ${ambient.join(', ')}`);
        } else if (effectType === 'seasonalDecorations' && theme.effects.seasonalDecorations) {
          const seasonal = Object.keys(theme.effects.seasonalDecorations).filter(k => theme.effects.seasonalDecorations[k]);
          console.log(`  ✅ Seasonal decorations: ${seasonal.join(', ')}`);
        } else {
          console.warn(`  ⚠️  Effect not found or disabled: ${effectType}`);
        }
      });

      // Check for frosted glass specifically
      if (testSpec.expectedFeatures.frostedGlass) {
        if (theme.effects.seasonalDecorations?.frostedGlass) {
          console.log('  ✅ Frosted glass effect present');
        } else {
          console.error('  ❌ Frosted glass effect missing');
        }
      }

      // Check for candle glow specifically
      if (testSpec.expectedFeatures.candleGlow) {
        if (theme.effects.ambientEffects?.candleGlow) {
          console.log('  ✅ Candle glow effect present');
        } else {
          console.error('  ❌ Candle glow effect missing');
        }
      }
    }
  }

  // Run quality validation
  const validation = ThemeGPT.validate();
  if (validation.allPass) {
    console.log('✅ All quality checks passed');
  } else {
    console.warn('⚠️  Some quality checks failed:');
    validation.checks.filter(c => !c.pass).forEach(check => {
      console.warn(`  - ${check.name}: ${check.value} (target: ${check.target})`);
    });
  }

  // Check console for errors
  console.log('\n📋 Check for visual rendering:');
  console.log('  - Background patterns should be visible and properly positioned');
  console.log('  - Overlays should be subtle but present');
  console.log('  - Effects should animate smoothly');
  console.log('  - No console errors should appear');

  console.groupEnd();
  return true;
}

function runAllVerifications() {
  console.clear();
  console.log('🚀 ThemeGPT Verification Suite\n');
  console.log('Testing themes for visual parity and feature completeness...\n');

  VERIFICATION_TESTS.forEach((test, index) => {
    setTimeout(() => {
      verifyTheme(test);

      // Final summary after last test
      if (index === VERIFICATION_TESTS.length - 1) {
        setTimeout(() => {
          console.log('\n\n✨ Verification Complete!');
          console.log('\nNext steps:');
          console.log('1. Visually inspect each theme using the theme panel');
          console.log('2. Verify animations are smooth and effects render correctly');
          console.log('3. Take screenshots for documentation if needed');
          console.log('\nUse ThemeGPT.list() to see all available themes');
          console.log('Use ThemeGPT.apply("theme-id") to switch themes');
        }, 1000);
      }
    }, index * 2000); // Stagger tests by 2 seconds
  });
}

// Auto-run when script is executed
console.log('Theme verification script loaded!');
console.log('Run: runAllVerifications() to start testing');
console.log('Or verify individual themes: verifyTheme(VERIFICATION_TESTS[0])');
