# ThemeGPT v2.0 Repository Guidelines

Operational procedures for AI coding agents working on ThemeGPT v2.0. Before reading this document, familiarize yourself with the historical context in `doc/guard/SYNTHAI_PROJECT_ARCHAEOLOGY.md`.

## Project Structure & Module Organization

```text
themegpt-v2.0/
├── apps/
│   ├── extension/     # Plasmo Chrome extension (React, TypeScript)
│   └── web/           # Next.js marketing/documentation website
├── packages/
│   └── shared/        # Shared TypeScript types & constants
├── prompt/            # AI prompt templates and documentation
├── doc/               # Development documentation
│   └── dev/           # Developer docs including archaeology
└── .claude/
    └── agents/        # Specialized agent definitions
```

Group new work by these domains. Check existing modules before creating new files.

## Complexity Awareness

**Required Reading:** `doc/guard/SYNTHAI_PROJECT_ARCHAEOLOGY.md`

Before implementing any solution, apply the complexity gate:

1. **Scale Check:** Does this complexity match the problem scale?
2. **Abstraction Check:** Is there proven duplication (3+ occurrences)?
3. **Pattern Check:** Would this pattern be appropriate for a browser extension?
4. **Configuration Check:** Can this value be hard-coded instead?

If the answer to any check suggests simpler alternatives, use them.

### Complexity Budget Enforcement

| Metric | Limit | Action |
|--------|-------|--------|
| New file | > 200 lines | Pause and reassess |
| Feature total | > 500 lines | Require architectural review |
| Config files | > 50 lines total | Justify why hard-coding fails |
| Abstract classes | Any | Require 3+ concrete implementations first |

## Anti-Pattern Recognition

Actively flag code that trends toward these patterns from the SynthAI archaeology:

| Anti-Pattern | Warning Signs | Response |
|--------------|---------------|----------|
| **Specification Inflation** | Specs describe how, not what | Rewrite to focus on outcomes |
| **Enterprise Pattern Obsession** | Circuit breakers, registries for simple tools | Remove or justify |
| **Premature Abstraction** | Abstract class with 1 implementation | Delete abstraction, use concrete |
| **Configuration Explosion** | Config file growing | Hard-code values |
| **Framework Absorption** | Domain types in utilities | Separate concerns |
| **Test Suite Inflation** | Tests approaching implementation size | Review test necessity |

When you see these patterns emerging, stop and raise the concern before continuing.

## Working Code First Methodology

1. **Start minimal:** Write the simplest code that solves the immediate problem
2. **Prove need:** Wait for actual duplication before extracting patterns
3. **Refactor late:** Only abstract when you have 3+ similar implementations
4. **Delete freely:** Remove unused abstractions immediately

**Order of operations:**

```
Working code → Observe duplication → Extract pattern → Document why
```

**NOT:**

```
Design pattern → Implement abstraction → Hope for reuse
```

## Build, Test, and Development Commands

```bash
# Development
pnpm install              # Install dependencies
pnpm dev                  # Run extension in development mode
pnpm build                # Build for production

# Testing
pnpm test                 # Run test suite
pnpm lint                 # Run linter

# Documentation slash commands (from repo root)
/doc-plan "Topic"         # Create document specification
/doc-write specs/...      # Generate from spec
/doc-review path/to/doc   # Validate quality
```

## Coding Style & Naming Conventions

Follow `DIRECTIVES.md` for enforcement rules. Key principles:

1. **Simplicity first:** Prefer simple, direct implementations over elaborate abstractions
2. **Hard-code by default:** Make values configurable only when users need to change them
3. **Use existing patterns:** Check `apps/extension/src/components/` before creating new components
4. **Follow conventions:**
   - Component files: `PascalCase.tsx`
   - Utility files: `camelCase.ts`
   - Type files: `types.ts` or `*.types.ts`

### Code Examples

```typescript
// GOOD: Simple, direct
export function countTokens(text: string): number {
  return encode(text).length;
}

// BAD: Premature abstraction
abstract class TokenCounter {
  abstract count(text: string): number;
}
class GPTTokenCounter extends TokenCounter { ... }
// Only one implementation exists!
```

## Testing Guidelines

- Tests should be < 50% of implementation lines
- Test behavior, not implementation details
- One test file per feature, not per function
- Skip tests for trivial code (getters, simple mappings)

## Commit & Pull Request Guidelines

Use imperative style: `fix: resolve token count overflow`, `feat: add theme persistence`

PR descriptions should include:

- What problem this solves
- How it was tested
- Any complexity budget impacts (new lines added)

## Security & Configuration

- All data stays in browser local storage
- No external network requests for analytics
- No telemetry or tracking
- Sanitize any user input before display

## Key Resources

| Resource | Purpose |
|----------|---------|
| `CONSTITUTION.md` | Philosophical principles |
| `DIRECTIVES.md` | Enforcement rules |
| `doc/guard/SYNTHAI_PROJECT_ARCHAEOLOGY.md` | Historical lessons (required reading) |
| `.claude/agents/*.md` | Specialized agent definitions |
