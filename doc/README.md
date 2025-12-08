# Documentation Directory

This directory contains development documentation and design mockups for the ThemeGPT project. These files are **not part of the production codebase** and are excluded from security and quality analysis tools.

## Structure

| Subdirectory | Purpose |
|--------------|---------|
| `dev/` | Development documentation including MVP specifications, project archaeology, and technical decisions |
| `mock/` | HTML mockups for the marketing website's landing page and coming-soon page |

## Why This Directory Is Excluded from Analysis

- **Not production code:** These files are reference materials and design artifacts
- **Avoids false positives:** Documentation and HTML mockups may trigger irrelevant security/quality warnings
- **Reduces CI/CD noise:** Excluding non-code files keeps analysis reports focused on actual codebase issues

## Exclusion Configuration

This directory is excluded in:
- `.codacy.yml` - Codacy code quality analysis
- `.snyk` - Snyk security scanning
- `.github/workflows/security-quality.yml` - CI/CD pipeline scans
