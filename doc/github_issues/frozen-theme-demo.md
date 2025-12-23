# ADWS GitHub Issue Generator - Demonstration

**Date:** 2025-12-23  
**Source Prompt:** `/Users/etherealogic/Dev/themegpt-v2.0/prompt/enhanced/018-create-frozen-theme-with-snowflake-background.md`

---

## Demonstration: Natural Language → ADWS-Ready Issue

This demonstration shows how the ADWS GitHub Issue Generator transforms a vague natural language request into a structured GitHub issue suitable for autonomous resolution.

---

## Step 1: Original Natural Language Input

> "Create a frozen theme with snowflake background like the CodePen example"

This is the type of vague request a developer might submit. It lacks:
- Specific file paths
- Color palette details
- Effect configuration
- Verification criteria
- Guardrails

---

## Step 2: Classification (Automated)

The n8n workflow classifies the input:

```json
{
  "type": "Feature",
  "complexity": "Moderate",
  "useSynthesis": true,
  "title": "Create Frozen Theme with Snowflake Background",
  "reasoning": "New theme creation with visual effects requires 2-3 files and ~150 lines"
}
```

---

## Step 3: Context Enrichment

The system gathers project-specific context:

| Source | Key Takeaways |
|--------|---------------|
| AGENTS.md | Complexity budget: < 500 lines; prefer hard-coded values |
| DIRECTIVES.md | No premature abstraction; use existing effect patterns |
| packages/shared/src/index.ts | Theme interface with effects; frozen-glass as reference |
| packages/shared/src/css/generators.ts | frozenIce effect implementation exists |

---

## Step 4: Transformed ADWS-Ready GitHub Issue

```markdown
# Feature: Create Frozen Theme with Realistic Snowflake Background

## Classification
- **Type:** Feature
- **Complexity:** Moderate (2-3 files, ~150 lines)
- **ADWS Mode:** `--synthesis`
- **Labels:** `adws-ready`, `enhancement`, `theme`, `christmas`

## Description

Create a new "Frozen" premium theme that combines a realistic snowflake-on-blue-backdrop background with falling snowflake animations using the existing `animatedSnowfall` effect and the `frozenIce` ambient effect pattern.

## Technical Context

ThemeGPT themes are defined as TypeScript objects in `packages/shared/src/index.ts` with the `Theme` interface. Visual effects are implemented through:

1. **Theme definition** (`DEFAULT_THEMES` array): Contains color palette, premium status, and effects configuration
2. **CSS generators** (`packages/shared/src/css/generators.ts`): Convert effect configurations into injectable CSS

The existing "Frozen Glass" theme (`frozen-glass`) provides a reference implementation.

### Relevant Files
- `packages/shared/src/index.ts` - Theme definition (add new theme to DEFAULT_THEMES)
- `packages/shared/src/css/generators.ts` - CSS generators (reference only, no modifications)

### Design Rationale
Reusing existing effects (`animatedSnowfall`, `frozenIce`) ensures consistency with other themes and avoids creating new CSS generator code.

## Problem-State Table

| Component | Current State | Target State |
|-----------|---------------|--------------|
| Theme count | 21 themes in DEFAULT_THEMES | 22 themes (add "Frozen") |
| Frozen theme | Does not exist | Premium theme with ice texture + snowfall |
| Background effect | N/A | Deep blue gradient with ice texture blend |
| Animation effects | N/A | animatedSnowfall (shaking) + frozenIce shine |

## Acceptance Criteria

- [ ] New theme has unique id: `'frozen'`
- [ ] Theme is in `category: 'christmas'`
- [ ] Theme is marked `isPremium: true`
- [ ] Colors provide sufficient contrast (text readable on background)
- [ ] `animatedSnowfall` effect enabled with `style: 'shaking'`
- [ ] `frozenIce` ambient effect enabled
- [ ] Build succeeds with no errors
- [ ] Tests pass
- [ ] Visual verification confirms snow animation and ice shine effect
- [ ] Snyk scan shows no new security issues
- [ ] No TODO/FIXME/NotImplementedError markers
- [ ] No mock or simulation code

## Implementation Guidance

### Pre-Flight Checks
```bash
# Verify theme definition file exists
test -f packages/shared/src/index.ts && echo "✓ Theme definitions file exists"

# Confirm frozen-glass theme exists as reference
grep -c "id: 'frozen-glass'" packages/shared/src/index.ts
# Expected: 1

# Verify CSS generators support required effects
grep -c "frozenIce\|animatedSnowfall" packages/shared/src/css/generators.ts
# Expected: 2+ matches
```

### Suggested Approach

1. **Add theme definition** to `packages/shared/src/index.ts`:

   ```typescript
   {
     id: 'frozen',
     name: 'Frozen',
     category: 'christmas',
     colors: {
       '--cgpt-bg': '#000428',
       '--cgpt-surface': '#081830',
       '--cgpt-text': '#E2E8F0',
       '--cgpt-text-muted': '#94A3B8',
       '--cgpt-border': '#1E3A5F',
       '--cgpt-accent': '#4FC3F7',
     },
     isPremium: true,
     effects: {
       animatedSnowfall: {
         enabled: true,
         density: 'medium',
         speed: 'slow',
         snowColor: '#B8D4E8',
         style: 'shaking'
       },
       ambientEffects: {
         frozenIce: true
       }
     },
   },
   ```

2. **Build and test**

### Verification Commands
```bash
# Build the extension
cd /Users/etherealogic/Dev/themegpt-v2.0 && pnpm build
# Expected: Exit code 0

# Run tests
pnpm test
# Expected: All tests pass

# Verify theme was added
grep -c "id: 'frozen'" packages/shared/src/index.ts
# Expected: 1
```

## Guardrails

### Forbidden
- [ ] Creating new CSS generator functions for this theme
- [ ] Adding new TypeScript interfaces or types
- [ ] Modifying existing themes (frozen-glass must remain unchanged)
- [ ] Adding external font dependencies
- [ ] No TODO/FIXME/NotImplementedError markers
- [ ] No mock or simulation code

### Required
- [ ] Use only existing effects (animatedSnowfall, frozenIce)
- [ ] Theme must be marked `isPremium: true`
- [ ] Line budget: < 30 lines added to index.ts
- [ ] No modifications to generators.ts

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Snow not visible | Confirm snowColor is light enough; try '#FFFFFF' |
| Shine animation too subtle | Expected - frozenIce uses 15% opacity |
| Theme not in popup | Ensure added inside DEFAULT_THEMES array |

## Out of Scope

- Custom "Frozen" font (would require font-face injection)
- Text effects from CodePen source
- Background image hosting (using CSS gradients only)
- New CSS generator functions
- Modifications to frozenIce or animatedSnowfall implementations

## ADWS Execution Command

```bash
cd /Users/etherealogic/Dev/themegpt-v2.0/adws
uv run adw_plan_build.py --synthesis "Feature: Create Frozen Theme with Realistic Snowflake Background"
```

## Success Signals

- [ ] Theme appears in DEFAULT_THEMES with id 'frozen'
- [ ] `pnpm build` completes with exit code 0
- [ ] `pnpm test` shows all tests passing
- [ ] Visual verification confirms snow + ice effects
- [ ] PR created and ready for review
```

---

## Transformation Summary

| Aspect | Before (Natural Language) | After (ADWS-Ready) |
|--------|---------------------------|-------------------|
| **Length** | 12 words | ~400 lines structured markdown |
| **File paths** | None | 2 explicit paths with line references |
| **Colors** | None | 6 specific hex values |
| **Effects** | "snowflake background" | animatedSnowfall + frozenIce config |
| **Verification** | None | 12 acceptance criteria + 3 commands |
| **Guardrails** | None | 6 forbidden + 4 required constraints |
| **Edge cases** | None | 3 documented scenarios |

---

## How to Use This Demo

### Via n8n Webhook (once configured)

```bash
curl -X POST https://etherealogic.app.n8n.cloud/webhook/adws-issue-generator \
  -H "Content-Type: application/json" \
  -d '{
    "request": "Create a frozen theme with snowflake background like the CodePen example",
    "project": "themegpt-v2.0",
    "useSynthesis": true
  }'
```

### Via ADWS CLI (direct execution)

```bash
cd /Users/etherealogic/Dev/themegpt-v2.0/adws
uv run adw_plan_build.py --synthesis "Feature: Create Frozen Theme with Realistic Snowflake Background"
```

---

## Reference

The enhanced prompt that this demonstration is based on:
`/Users/etherealogic/Dev/themegpt-v2.0/prompt/enhanced/018-create-frozen-theme-with-snowflake-background.md`
