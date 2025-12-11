# Documentation Directory

This directory contains development documentation, design mockups, and reference materials for the ThemeGPT project. These files are **not part of the production codebase** and are excluded from security and quality analysis tools.

## Structure

| Subdirectory | Purpose |
|--------------|---------|
| `ai_docs/` | AI/LLM SDK documentation and reference materials for development |
| `dev/` | Active development concerns: security advisories, environment notes, temporary decisions |
| `github_issues/` | GitHub issue templates for consistent issue reporting |
| `guard/` | Historical lessons and architectural anti-patterns to avoid (complexity guardrails) |
| `mock/` | HTML mockups for the marketing website's landing page and coming-soon page |
| `report/` | Development status reports and project health tracking |
| `specs/` | Product specifications and feature requirements |

## Folder Details

### `specs/` — Product Specifications

Contains formal specifications that define **what** to build:

- `themegpt-mvp.md` — ThemeGPT MVP feature specification

Use this folder for feature requirements, acceptance criteria, and product definitions.

### `report/` — Status Reports

Contains periodic development status reports:

- `DEVELOPMENT_STATUS_REPORT.md` — Current project health and progress

Use this folder for sprint summaries, milestone tracking, and stakeholder updates.

### `guard/` — Complexity Guardrails

Contains historical lessons and anti-pattern documentation:

- `SYNTHAI_PROJECT_ARCHAEOLOGY.md` — Case study of how a 200-line solution became 7,900 lines

This folder serves as a **warning system**. Reference these documents when making architectural decisions to avoid repeating past mistakes.

### `dev/` — Active Development Concerns

Contains documentation about the **current development environment**:

- `SECURITY_ADVISORIES.md` — Known vulnerabilities affecting development (not production)

Use this folder for:

- Security advisories for dev dependencies (like the current Parcel CVE)
- Environment setup notes specific to this project
- Temporary workarounds awaiting upstream fixes
- Developer-facing warnings that don't belong in user documentation

### `github_issues/` — Issue Templates

Contains GitHub issue templates for consistent reporting. Templates are copied to `.github/ISSUE_TEMPLATE/` when ready for use.

### `mock/` — Design Mockups

Contains HTML mockups for visual design reference:

- `themegpt-coming-soon-page.html` — Coming soon page design
- `themegpt-option-b.html` — Landing page variant

### `ai_docs/` — AI/LLM Reference

Contains SDK documentation and guides for AI integrations used in development tooling.

## Why This Directory Is Excluded from Analysis

- **Not production code:** These files are reference materials and design artifacts
- **Avoids false positives:** Documentation and HTML mockups may trigger irrelevant security/quality warnings
- **Reduces CI/CD noise:** Excluding non-code files keeps analysis reports focused on actual codebase issues

## Exclusion Configuration

This directory is excluded in:

- `.codacy.yml` — Codacy code quality analysis
- `.snyk` — Snyk security scanning
- `.github/workflows/security-quality.yml` — CI/CD pipeline scans
