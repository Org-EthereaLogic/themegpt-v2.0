# Contributing to ThemeGPT

Thank you for your interest in contributing to ThemeGPT!

**Important:** All contributions must respect the **Local-First privacy architecture**. This means:

- No external API calls for core functionality
- No analytics or tracking code
- All data processing must happen in the browser
- No dependencies that send data externally

We welcome contributions that align with these principles.

## Getting Started

```bash
# Clone the repository
git clone https://github.com/themegpt/themegpt-v2.0.git
cd themegpt-v2.0

# Install dependencies (requires pnpm)
pnpm install

# Start development
pnpm dev

# Run tests
pnpm test

# Build for production
pnpm build
```

## Code Style

- **TypeScript:** Strict mode enabled, no `any` types without justification
- **Formatting:** Prettier with default configuration (run `pnpm format`)
- **Linting:** ESLint with project configuration (run `pnpm lint`)
- **Complexity:** Max 500 lines per feature; pause at 200 lines to reassess (see DIRECTIVES.md)
- **No placeholders:** No TODO, FIXME, or lorem ipsum in committed code

## Pull Request Process

1. **Branch naming:** Use `feat/`, `fix/`, or `docs/` prefix (e.g., `feat/dark-theme`)
2. **Commit messages:** Use conventional commit format (e.g., `feat: add dark theme support`)
3. **Tests required:** Include tests for new functionality
4. **Build check:** Ensure `pnpm build` passes before submitting
5. **Review:** PRs require at least one maintainer approval

## What We Accept

- Bug fixes with reproduction steps
- New themes following the design system (see CLAUDE.md)
- Documentation improvements
- Accessibility enhancements
- Performance optimizations with benchmarks

## Questions?

Open an issue for questions or feature discussions before starting work on large changes.
