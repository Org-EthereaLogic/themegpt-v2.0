# ThemeGPT Documentation Directory

`doc/` stores development, operations, and marketing documentation for ThemeGPT. Files here are references, runbooks, guides, and historical records — not production runtime code.

## Structure

| Path | Purpose | Files |
| ------ | ------- | ------ |
| `ai_docs/` | External SDK and tool references (Claude Code, OpenAI, Bun, UV, GenAI) | 29 |
| `chat/` | Session transcripts and implementation decision logs | 10 |
| `dev/` | Operational docs: scorecards, runbooks, security, analysis | 18 |
| `dev/failures/` | ADWS metrics collector failure manifests and diagnostic artifacts | by date |
| `dev/metrics/` | ADWS daily metrics reports (`.md` + `.html` pairs) | 13 |
| `dev/themes/` | Theme design research, visual explorations, and asset references | 5 |
| `guard/` | Complexity guardrails and archaeology lessons | 1 |
| `marketing/` | Chrome Web Store listing copy, store descriptions, feature highlights | 2 |
| `mock/` | HTML mockups and design explorations | 2 |
| `report/` | Project health reports, audits, and assignment submissions | 15 |
| `report/audit-artifacts/` | CWS, popup, theme-catalog, and theme-thumbnail audit screenshots/data | nested |
| `screenshots/` | Temporary LLM troubleshooting screenshots (gitignored) | — |
| `specs/` | Product specifications and scoped requirements | 1 |

## Key Operational Docs

| File | Purpose |
| ------ | ------- |
| `dev/gate-tracking-log.md` | Measurement gates, submission status, deployment integrity timeline |
| `dev/monetization-growth-execution-checklist.md` | Active growth execution checklist |
| `dev/weekly-split-scorecard-*.md` | Weekly campaign and KPI scorecards |
| `dev/metrics/daily-metrics-*.md` | ADWS daily metrics reports (with paired `.html` renders) |
| `dev/SECURITY_ADVISORIES.md` | Security advisory tracking |
| `dev/themegpt-adws-api-design-doc.pdf` | ADWS metrics collector API design document |
| `dev/ga4-filter-guide.md` | Step-by-step guide for GA4 internal traffic filtering setup |
| `dev/v2.3.0-cws-submission-runbook.md` | CWS submission runbook for v2.3.0 |

## Dev Subdirectory Breakdown

| Category | Location | Examples |
| ---------- | ------ | ------- |
| Daily metrics | `dev/metrics/` | `daily-metrics-2026-03-03-morning.md` + `.html` |
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
