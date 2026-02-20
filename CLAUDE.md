# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Project Overview

**ThemeGPT v2.0** is a privacy-first Chrome extension that lets users customize ChatGPT's appearance and track token usage — all without data leaving the browser.

This project follows a **simplicity-first development philosophy** informed by historical lessons documented in `doc/guard/SYNTHAI_PROJECT_ARCHAEOLOGY.md`. That document describes how a simple 200-line solution became a 7,900-line enterprise platform through unchecked complexity accumulation. We actively prevent that pattern here.

## Technology Stack

- **Extension**: Plasmo, React 19, TypeScript, Tailwind CSS 3, gpt-tokenizer
- **Web**: Next.js 16, React 19, Tailwind CSS 4, TypeScript
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
pnpm dev        # Development mode with hot-reload
pnpm build      # Production build
pnpm test       # Run tests
pnpm lint       # Lint code
```

### Development Workflow

1. Run `pnpm dev` to start the development server
2. Load extension from `apps/extension/build/chrome-mv3-dev`
3. Changes hot-reload automatically

### Production Build

1. Run `pnpm build` to create production bundle
2. Production build outputs to `apps/extension/build/chrome-mv3-prod`
3. CWS submission is automated via `submit-extension.yml` GitHub Actions workflow (requires `SUBMIT_KEYS` secret)

### Deployment

- **Web**: GCP Cloud Run, manual deploy via `gcloud builds submit --config=cloudbuild.yaml`
- **Extension**: Chrome Web Store, automated via GitHub Actions `submit-extension.yml` workflow
- **Current published extension version**: v2.2.2 (live on CWS — published February 20, 2026 via run `22205732502`)
- **v2.3.0** — submitted to CWS February 20, 2026 (run `22238384383`); pending review
- **Current web version**: v2.2.1 base + abandoned checkout recovery deployed (Cloud Run commit `c1fffae`, February 19, 2026 — `checkout.session.expired` webhook, `abandoned_checkouts` Firestore collection, recovery email)
- **Active measurement gates**: Bridge Gate 1 TRACKING (GA4 internal traffic filter activated Feb 20; pre-filter baseline 25% on Feb 19; Day 1 of 7-day observation window started Feb 20; threshold ≤10% for 7 consecutive days). Gate 3 TRACKING (instrumentation deployed; Day 1 = Feb 20; earliest pass date Feb 26). Product Hunt launch is blocked until all three gates pass for 7 consecutive days. End-to-end payment flow confirmed validated Feb 19, 2026 (account page + extension auto-link both working).
- **Note**: `SUBMIT_KEYS` repository secret is required for automated CWS submission

### Next Actions (v2.2.2 Published — Gate Observation Mode, updated Feb 20 2026)

**Resolved:**
- ~~Monitor CWS review queue for v2.2.0 approval.~~ Done Feb 19.
- ~~Validate listing propagation and verify extension runtime behavior.~~ Done Feb 19 (canary purchase confirmed).
- ~~Fix item-share-cb UTM classification.~~ Done (all core pages, auth/extension, success install prompts tagged).
- ~~Implement GA4 funnel events (Gate 3 blocker).~~ Done (`checkout_start`, `purchase_success`, `trial_start` implemented with consent gating).
- ~~Add GA4 internal traffic filter.~~ Done Feb 20 (activated, realtime-verified).
- ~~Audit ext_sidebar and ext_app_menu links for UTM completeness.~~ Done (all 7 popup.tsx outbound links have full utm_source/medium/campaign; no separate sidebar/app_menu components exist).
- ~~Set up split weekly scorecard.~~ Done (template at `doc/dev/weekly-split-scorecard-template.md`).
- ~~Monitor Firestore index build completion.~~ Done Feb 19.
- ~~Verify account page shows trial subscription correctly.~~ Done Feb 19.
- ~~Confirm extension account linking behavior post-index fix.~~ Done Feb 19.
- ~~v2.2.2 CWS review.~~ Published Feb 20 (run `22205732502`).
- ~~Submit v2.3.0 to CWS.~~ Submitted Feb 20 (run `22238384383`); pending review.

**Pending (monitoring — no code work required):**
- Gate 1 monitoring: Day 1 = Feb 20. Pre-filter baseline 25%. Threshold ≤10% for 7 consecutive days. Earliest pass: Feb 26.
- Gate 3 monitoring: Day 1 = Feb 20. All 3 events must be visible (count > 0) for 7 consecutive days. Earliest pass: Feb 26.
- Monitor v2.3.0 CWS review status — submitted Feb 20; expected 1–3 business days.
- Monitor India user share weekly — currently tied with US at 22%. Escalation review if this holds for 2 consecutive weeks.
- Only after all gates pass for 7 consecutive days: run Product Hunt launch with US-first optimization.

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
