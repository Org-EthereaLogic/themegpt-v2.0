# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## ⚠️ CRITICAL: Development-Only Policy

> **STATUS: DEVELOPMENT PHASE — DO NOT DEPLOY TO PRODUCTION**

All code changes, builds, and updates MUST target the **development build only** until formal production approval is granted.

### Mandatory Requirements

| Requirement | Details |
|-------------|---------|
| **Build Target** | Always use `pnpm dev` for development builds |
| **Extension Loading** | Load from `apps/extension/build/chrome-mv3-dev` only |
| **Production Builds** | `pnpm build` creates `chrome-mv3-prod` — DO NOT load or distribute |
| **Git Pushes** | Allowed to `main` branch for code storage, but NOT for production release |

### Prohibited Actions

- Loading `chrome-mv3-prod` build into Chrome for testing
- Publishing to Chrome Web Store
- Distributing production builds to users
- Running production deployments of the web app

### When Production Is Approved

Production deployment will only occur when:
1. User explicitly states "ready for production" or "deploy to production"
2. All features are tested and verified in development
3. User provides formal approval for the transition

**Historical Context:** Multiple instances have occurred where changes intended for development were incorrectly applied to production. This policy prevents that pattern.

---

## 🎨 Theme Freeze Policy (Launch Themes)

> **STATUS: THEME ROSTER FROZEN UNTIL JANUARY 1, 2026**

The following themes have been finalized for the product launch and **must not be modified or added to** until after the release date.

### Free Themes (9)

| Theme | Category |
|-------|----------|
| VS Code Dark+ | Core |
| Solarized Dark | Core |
| Dracula | Core |
| Monokai Pro | Core |
| High Contrast | Core |
| One Dark | Core |
| Aurora Borealis | Core |
| Sunset Blaze | Core |
| Electric Dreams | Core |

### Premium Themes (5)

| Theme | Category |
|-------|----------|
| Woodland Retreat | Christmas |
| Frosted Windowpane | Christmas |
| Silent Night (Starfield) | Christmas |
| Synth Wave | Core |
| Shades of Purple | Core |

### Prohibited Theme Actions (Until Jan 1, 2026)

- Adding new themes to `DEFAULT_THEMES` array
- Modifying existing theme colors, effects, or properties
- Changing theme categories or premium status
- Renaming or removing any launch themes

### When Theme Changes Are Allowed

Theme modifications will only occur when:
1. The date is **after January 1, 2026**
2. User explicitly requests theme additions or modifications
3. Critical bug fixes that don't alter visual appearance

---

## Project Overview

**ThemeGPT v2.0** is a privacy-first Chrome extension that lets users customize ChatGPT's appearance and track token usage — all without data leaving the browser.

This project follows a **simplicity-first development philosophy** informed by historical lessons documented in `doc/guard/SYNTHAI_PROJECT_ARCHAEOLOGY.md`. That document describes how a simple 200-line solution became a 7,900-line enterprise platform through unchecked complexity accumulation. We actively prevent that pattern here.

## Technology Stack

- **Extension**: Plasmo, React 18, TypeScript, gpt-tokenizer
- **Web**: Next.js, React 19, Tailwind CSS 4, TypeScript
- **Tooling**: pnpm workspaces, Prettier, ESLint

## Repository Structure

```text
themegpt-v2.0/
├── apps/
│   ├── extension/     # Chrome extension (main product)
│   └── web/           # Marketing/documentation site
├── packages/
│   └── shared/        # Shared types & constants
├── prompt/            # AI prompt templates
├── doc/dev/           # Developer documentation
└── .claude/agents/    # Specialized agent definitions
```

## Design System: Cream & Chocolate

| Color | Hex | Usage |
|-------|-----|-------|
| Cream | `#FAF6F0` | Primary background |
| Chocolate | `#4B2E1E` | Primary text, dark accents |
| Peach | `#F4A988` | CTAs, highlights |
| Teal | `#7ECEC5` | Secondary accent, success |

| Element | Font |
|---------|------|
| Headings | Space Grotesk |
| Body | Inter |
| Monospace | JetBrains Mono |

## Mandatory Directives

From DIRECTIVES.md and CONSTITUTION.md:

### Critical (Must Pass)

1. **Complexity Budget** — Max 500 lines per feature; pause at 200 lines to reassess
2. **No Placeholder Content** — No TODO, FIXME, lorem ipsum, or mock data
3. **Accessibility Standards** — WCAG 2.1 AA minimum, semantic HTML, keyboard navigation
4. **Brand Color Compliance** — Only use Cream & Chocolate design system colors

### Important (Warnings)

5. **No Premature Abstraction** — No abstract classes until 3+ concrete implementations exist
6. **Pattern Justification** — Enterprise patterns require written justification
7. **Component Architecture** — Check existing components before creating new ones

### Decision Priority

When principles conflict: **Simplicity > Privacy > Accessibility > Brand > Completeness > Performance**

## Historical Lessons

The SynthAI project archaeology (`doc/guard/SYNTHAI_PROJECT_ARCHAEOLOGY.md`) documents these failure patterns we must avoid:

| Anti-Pattern | What Happened | Prevention |
|--------------|---------------|------------|
| Specification Inflation | 1,868 lines of specs for a 200-line solution | Specs describe outcomes only |
| Enterprise Pattern Obsession | Rollback managers for a local tool | Match patterns to scale |
| Premature Abstraction | 1,035-line adapter hierarchy for 3 function calls | Wait for 3+ duplications |
| Configuration Explosion | 507 lines of config | Hard-code by default |

**Key Lesson:** Sometimes the best code is the code you don't write.

## Quick Commands

```bash
pnpm install    # Install dependencies
pnpm dev        # Development mode (USE THIS for all testing)
pnpm build      # Production build (DO NOT USE until production approved)
pnpm test       # Run tests
pnpm lint       # Lint code
```

### Development Workflow

1. Run `pnpm dev` to start the development server
2. Load extension from `apps/extension/build/chrome-mv3-dev`
3. Changes hot-reload automatically
4. **Never** load `chrome-mv3-prod` during development phase

## Key Resources

| Resource | Purpose |
|----------|---------|
| `CONSTITUTION.md` | Philosophical principles for development |
| `DIRECTIVES.md` | Enforcement rules for AI coding agents |
| `AGENTS.md` | Operational procedures and guidelines |
| `doc/guard/SYNTHAI_PROJECT_ARCHAEOLOGY.md` | **Required reading** — Historical lessons on avoiding over-engineering |
| `.claude/agents/*.md` | Specialized agent definitions |

## Complexity Gate

Before implementing any solution, ask:

1. Is this the simplest approach that solves the actual problem?
2. Would a browser extension reasonably need this pattern?
3. Am I building for a real need or an anticipated one?

If unsure, start simpler. You can always add complexity later — removing it is much harder.
