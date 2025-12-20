#!/usr/bin/env node
/**
 * Theme Sync Script
 *
 * Extracts theme definitions from the preview tool (index.html) and
 * updates the shared package (packages/shared/src/index.ts).
 *
 * Usage: node sync-themes.js
 * Or:    pnpm preview:sync (from monorepo root)
 */

const fs = require('fs');
const path = require('path');

// File paths (relative to this script)
const PREVIEW_HTML = path.join(__dirname, 'index.html');
const SHARED_INDEX = path.join(__dirname, '..', '..', '..', '..', 'packages', 'shared', 'src', 'index.ts');

/**
 * Extract THEMES array from the preview HTML file
 */
function extractThemesFromPreview() {
  const html = fs.readFileSync(PREVIEW_HTML, 'utf-8');

  // Find the THEMES array between "const THEMES = [" and "];"
  const startMarker = 'const THEMES = [';
  const startIdx = html.indexOf(startMarker);
  if (startIdx === -1) {
    throw new Error('Could not find THEMES array in index.html');
  }

  // Find the closing bracket (account for nested arrays)
  let bracketCount = 0;
  let endIdx = startIdx + startMarker.length - 1; // Start at the '['

  for (let i = endIdx; i < html.length; i++) {
    if (html[i] === '[') bracketCount++;
    if (html[i] === ']') bracketCount--;
    if (bracketCount === 0) {
      endIdx = i + 1;
      break;
    }
  }

  const themesArrayStr = html.slice(startIdx + startMarker.length - 1, endIdx);

  // Parse the JavaScript array (it's essentially JSON with some JS syntax)
  // We need to handle: comments, trailing commas, unquoted keys
  const cleanedJson = themesArrayStr
    .replace(/\/\/[^\n]*/g, '') // Remove single-line comments
    .replace(/,(\s*[}\]])/g, '$1'); // Remove trailing commas

  try {
    return JSON.parse(cleanedJson);
  } catch (e) {
    // If direct parse fails, try eval (themes are trusted local data)
    return eval('(' + themesArrayStr + ')');
  }
}

/**
 * Convert a theme object to TypeScript code
 */
function themeToTypeScript(theme, indent = 2) {
  const pad = ' '.repeat(indent);
  const pad2 = ' '.repeat(indent + 2);
  const pad3 = ' '.repeat(indent + 4);

  let lines = [`${pad}{`];

  // Simple properties first
  lines.push(`${pad2}id: '${theme.id}',`);
  lines.push(`${pad2}name: '${theme.name}',`);
  lines.push(`${pad2}category: '${theme.category}',`);

  // Colors object
  lines.push(`${pad2}colors: {`);
  for (const [key, value] of Object.entries(theme.colors)) {
    lines.push(`${pad3}'${key}': '${value}',`);
  }
  lines.push(`${pad2}},`);

  // Boolean flags
  lines.push(`${pad2}isPremium: ${theme.isPremium},`);

  // Optional overlays
  if (theme.noiseOverlay) lines.push(`${pad2}noiseOverlay: true,`);
  if (theme.glowOverlay) lines.push(`${pad2}glowOverlay: true,`);

  // Optional pattern
  if (theme.pattern) {
    const patternParts = [`type: '${theme.pattern.type}'`, `opacity: ${theme.pattern.opacity}`];
    if (theme.pattern.color) patternParts.push(`color: '${theme.pattern.color}'`);
    if (theme.pattern.size) patternParts.push(`size: ${theme.pattern.size}`);
    lines.push(`${pad2}pattern: { ${patternParts.join(', ')} },`);
  }

  // Optional effects (complex nested object)
  if (theme.effects) {
    lines.push(`${pad2}effects: ${JSON.stringify(theme.effects, null, 2).split('\n').map((l, i) => i === 0 ? l : pad2 + l).join('\n')},`);
  }

  lines.push(`${pad}},`);
  return lines.join('\n');
}

/**
 * Generate the full DEFAULT_THEMES TypeScript code
 */
function generateThemesTypeScript(themes) {
  const freeThemes = themes.filter(t => !t.isPremium);
  const premiumChristmas = themes.filter(t => t.isPremium && t.category === 'christmas');
  const premiumCore = themes.filter(t => t.isPremium && t.category === 'core');

  let output = `export const DEFAULT_THEMES: Theme[] = [\n`;

  // Free themes section
  output += `  // =============================================\n`;
  output += `  // FREE THEMES (Classic IDE themes from v1.0)\n`;
  output += `  // =============================================\n`;
  freeThemes.forEach(theme => {
    output += themeToTypeScript(theme) + '\n';
  });

  // Premium Christmas section
  if (premiumChristmas.length > 0) {
    output += `\n  // =============================================\n`;
    output += `  // PREMIUM THEMES - Christmas Collection\n`;
    output += `  // =============================================\n`;
    premiumChristmas.forEach(theme => {
      output += themeToTypeScript(theme) + '\n';
    });
  }

  // Premium Core section
  if (premiumCore.length > 0) {
    output += `\n  // =============================================\n`;
    output += `  // PREMIUM THEMES - Core Collection\n`;
    output += `  // =============================================\n`;
    premiumCore.forEach(theme => {
      output += themeToTypeScript(theme) + '\n';
    });
  }

  output += `];`;
  return output;
}

/**
 * Update the shared package index.ts with new themes
 */
function updateSharedPackage(themesTypeScript) {
  const indexTs = fs.readFileSync(SHARED_INDEX, 'utf-8');

  // Find and replace the DEFAULT_THEMES section
  const startPattern = /^export const DEFAULT_THEMES: Theme\[\] = \[/m;
  const startMatch = indexTs.match(startPattern);

  if (!startMatch) {
    throw new Error('Could not find DEFAULT_THEMES in index.ts');
  }

  const startIdx = startMatch.index;

  // Find the closing ]; by counting brackets
  let bracketCount = 0;
  let closingBracketIdx = -1;
  let foundStart = false;

  for (let i = startIdx; i < indexTs.length; i++) {
    if (indexTs[i] === '[') {
      bracketCount++;
      foundStart = true;
    }
    if (indexTs[i] === ']') {
      bracketCount--;
      if (foundStart && bracketCount === 0) {
        closingBracketIdx = i;
        break;
      }
    }
  }

  if (closingBracketIdx === -1) {
    throw new Error('Could not find closing bracket for DEFAULT_THEMES');
  }

  // Find the semicolon after the closing bracket
  let endIdx = closingBracketIdx + 1;
  while (endIdx < indexTs.length && indexTs[endIdx] !== ';') {
    endIdx++;
  }
  endIdx++; // Include the semicolon

  const before = indexTs.slice(0, startIdx);
  const after = indexTs.slice(endIdx);

  return before + themesTypeScript + after;
}

// Main execution
function main() {
  console.log('Theme Sync Script\n');
  console.log('Reading themes from preview tool...');

  const themes = extractThemesFromPreview();
  console.log(`  Found ${themes.length} themes (${themes.filter(t => !t.isPremium).length} free, ${themes.filter(t => t.isPremium).length} premium)\n`);

  console.log('Generating TypeScript code...');
  const themesTs = generateThemesTypeScript(themes);

  console.log('Updating shared package...');
  const updatedIndexTs = updateSharedPackage(themesTs);

  fs.writeFileSync(SHARED_INDEX, updatedIndexTs);
  console.log(`  Updated: ${SHARED_INDEX}\n`);

  console.log('Sync complete! Theme changes:');
  themes.forEach(t => {
    const icon = t.isPremium ? '  ' : '  ';
    console.log(`  ${icon} ${t.name} (${t.id})`);
  });

  console.log('\nNext steps:');
  console.log('  1. Review changes: git diff packages/shared/src/index.ts');
  console.log('  2. Rebuild extension: pnpm --filter extension build');
}

main();
