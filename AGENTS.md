# ThemeGPT v2.0 Repository Guidelines

Operational procedures for AI coding agents working on ThemeGPT v2.0. The current published extension version is **v2.2.0** (approved and live on Chrome Web Store as of February 19, 2026). A web-only maintenance release **v2.2.1** was deployed the same day, covering Dependabot security patches (svelte, minimatch), UTM attribution fixes across core marketing pages plus `auth/extension` and `success` CWS links, and GA4 funnel instrumentation (`trial_start` / `checkout_start` / `purchase_success`) in web flows. **Bridge Gate 1 tracking window is ACTIVE** (internal traffic filter activated February 20, 2026; pre-filter unassigned baseline 25% on Feb 19; threshold ≤10% for 7 consecutive days). **Gate 3 validation window is ACTIVE** (`trial_start` / `checkout_start` / `purchase_success` instrumentation deployed; Day 1 = Feb 20, 2026; earliest pass date Feb 26, 2026). Product Hunt launch remains blocked until all three gates pass for 7 consecutive days. **End-to-end payment flow fully validated (Feb 19, 2026):** account page confirmed showing Trial + Monthly Plan + Full Access; Firestore composite indexes confirmed built and operational; extension auto-linking confirmed working automatically via shared auth session (Generate Link Code is graceful fallback only). **v2.2.2** is pending CWS review (submitted February 19, 2026). **v2.3.0** is committed to `main` and tagged (`c1fffae`); CWS submission is queued pending v2.2.2 review clearance. The v2.3.0 web changes (abandoned checkout recovery via `checkout.session.expired` webhook, Firestore `abandoned_checkouts` collection, and `sendCheckoutRecoveryEmail`) are already live on Cloud Run. Before reading this document, familiarize yourself with the historical context in `doc/guard/SYNTHAI_PROJECT_ARCHAEOLOGY.md`.

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
- No analytics or tracking in the extension (the web app uses consent-gated GA4)
- No telemetry in the extension
- Sanitize any user input before display

## Key Resources

| Resource | Purpose |
|----------|---------|
| `CONSTITUTION.md` | Philosophical principles |
| `DIRECTIVES.md` | Enforcement rules |
| `doc/guard/SYNTHAI_PROJECT_ARCHAEOLOGY.md` | Historical lessons (required reading) |
| `.claude/agents/*.md` | Specialized agent definitions |
