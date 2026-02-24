# ThemeGPT Documentation Directory

`doc/` stores development and operations documentation for ThemeGPT. Most files here are references, runbooks, and historical records rather than production runtime code.

## Structure

| Subdirectory | Purpose |
|--------------|---------|
| `ai_docs/` | External SDK references for development workflows |
| `chat/` | Session transcripts and implementation logs |
| `dev/` | Live operational docs (gate tracking, scorecards, deployment integrity, execution checklists) |
| `guard/` | Complexity guardrails and archaeology lessons |
| `mock/` | HTML mockups and design explorations |
| `report/` | Project health reports and submissions |
| `screenshots/` | QA and release screenshot artifacts |
| `specs/` | Product specifications and scoped requirements |

## High-Value Operational Docs

- `doc/dev/gate-tracking-log.md` — Measurement gates, submission status, deployment integrity timeline
- `doc/dev/monetization-growth-execution-checklist.md` — Active growth execution checklist
- `doc/dev/weekly-split-scorecard-*.md` — Weekly campaign and KPI scorecards
- `themegpt-90-day-monetization-roadmap.html` (repo root) — Consolidated monetization roadmap

## Guardrails

- `doc/guard/SYNTHAI_PROJECT_ARCHAEOLOGY.md` is required reading before major implementation work.
- Use it to enforce simplicity-first engineering and avoid over-architecture.

## Analysis Exclusions

Many `doc/` files are excluded from strict code analysis because they are documentation artifacts, not deployable runtime logic. Keep this directory focused on:

- Decision records
- Operational status and audits
- Architecture constraints and lessons learned
