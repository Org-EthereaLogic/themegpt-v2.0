# ThemeGPT Documentation Directory

`doc/` stores development, operations, and marketing documentation for ThemeGPT. Files here are references, runbooks, guides, and historical records — not production runtime code.

## Structure

| Path | Purpose | Files |
| ------ | ------- | ------ |
| `ai_docs/` | External SDK and tool references (Claude Code, OpenAI, Bun, UV, GenAI) | rolling reference set |
| `chat/` | Session transcripts and implementation decision logs | dated records |
| `dev/` | Live operational docs, release notes, scorecards, and current ADWS snapshots | rolling set |
| `dev/failures/` | ADWS metrics collector failure manifests and diagnostic artifacts | dated JSON + attachments |
| `dev/metrics/` | Older archived daily metrics reports (`.md` + `.html` pairs) | archive |
| `dev/themes/` | Theme design research, visual explorations, and asset references | rolling set |
| `guard/` | Complexity guardrails and archaeology lessons | required references |
| `marketing/` | Chrome Web Store listing copy, store descriptions, feature highlights | working docs |
| `mock/` | HTML mockups and design explorations | prototypes |
| `report/` | Project health reports, audits, and assignment submissions | mostly archival |
| `report/audit-artifacts/` | CWS, popup, theme-catalog, and theme-thumbnail audit screenshots/data | generated artifacts |
| `screenshots/` | Temporary troubleshooting screenshots | ephemeral |
| `specs/` | Product specifications and scoped requirements | scoped specs |

## Current Layout Notes (updated 2026-03-12)

- **Docs consolidation:** legacy `docs/` marketing artifacts were moved into `doc/marketing/`.
- **Current daily metrics location:** recent ADWS reports are written directly into `doc/dev/` as `daily-metrics-YYYY-MM-DD-*.md` and `.html`.
- **Archived daily metrics:** older report pairs remain in `doc/dev/metrics/`.
- **Theme research:** theme design and asset research live under `doc/dev/themes/`.
- **Archive policy:** treat `doc/chat/` and most of `doc/report/` as historical unless the linked audit or transcript itself changes.

## Key Operational Docs

| File | Purpose |
| ------ | ------- |
| `dev/gate-tracking-log.md` | Measurement gates, submission status, deployment integrity timeline |
| `dev/monetization-growth-execution-checklist.md` | Active growth execution checklist |
| `dev/weekly-split-scorecard-*.md` | Weekly campaign and KPI scorecards |
| `dev/daily-metrics-*.md` | Current ADWS daily metrics reports (with paired `.html` renders) |
| `dev/metrics/daily-metrics-*.md` | Older archived ADWS daily metrics reports |
| `dev/SECURITY_ADVISORIES.md` | Security advisory tracking |
| `dev/themegpt-adws-api-design-doc.pdf` | ADWS metrics collector API design document |
| `dev/ga4-filter-guide.md` | Step-by-step guide for GA4 internal traffic filtering setup |
| `dev/v2.3.0-cws-submission-runbook.md` | CWS submission runbook for v2.3.0 |

## Dev Subdirectory Breakdown

| Category | Location | Examples |
| ---------- | ------ | ------- |
| Daily metrics (current) | `dev/` | `daily-metrics-2026-03-11-morning.md` + `.html` |
| Daily metrics (archived) | `dev/metrics/` | `daily-metrics-2026-03-03-morning.md` + `.html` |
| Theme design | `dev/themes/` | `premium-theme-designs.md`, `theme-enhancement-strategy.md` |
| Scorecards | `dev/` | `weekly-split-scorecard-2026-02-26.md`, template |
| Deployment/releases | `dev/` | `deployment-integrity-*.md`, `v2.3.0-cws-submission-runbook.md` |
| Analysis/audits | `dev/` | `landing-page-friction-analysis.md`, `utm-audit.md` |
| Reference | `dev/` | `THEMES_REFERENCE.md`, `CSS_ARTISTIC_CONTROL.md`, `auth-setup.md` |
| Failure manifests | `dev/failures/` | `2026-03-01.json` with per-date artifact subdirectories |

## Guardrails

- `guard/SYNTHAI_PROJECT_ARCHAEOLOGY.md` is **required reading** before major implementation work.
- Use it to enforce simplicity-first engineering and avoid over-architecture.

## Analysis Exclusions

Many `doc/` files are excluded from strict code analysis because they are documentation artifacts, not deployable runtime logic. Keep this directory focused on:

- Decision records
- Operational status and audits
- Architecture constraints and lessons learned
