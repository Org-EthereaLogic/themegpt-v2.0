# Prompt Engineering Directory

This directory contains AI prompt templates and documentation used during the development of ThemeGPT. These files are **not part of the production codebase** and are excluded from security and quality analysis tools.

## Structure

| Subdirectory | Purpose |
|--------------|---------|
| `draft/` | Work-in-progress prompts (rough drafts and experiments) |
| `enhanced/` | Finalized, production-ready prompts used for building ThemeGPT features |
| `prompt-docs/` | Reference materials on prompting best practices (Anthropic guidelines, agentic patterns, etc.) |

## Why This Directory Is Excluded from Analysis

- **Not production code:** These are development artifacts and reference materials
- **Contains prose, not code:** Markdown files with natural language instructions
- **Avoids false positives:** Security scanners may flag example code snippets or technical terms incorrectly
- **Reduces CI/CD noise:** Keeps analysis focused on the actual extension and website code

## Exclusion Configuration

This directory is excluded in:
- `.codacy.yml` - Codacy code quality analysis
- `.snyk` - Snyk security scanning
- `.github/workflows/security-quality.yml` - CI/CD pipeline scans
