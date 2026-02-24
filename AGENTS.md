# ThemeGPT v2.0 Repository Guidelines

Operational procedures for AI coding agents working on ThemeGPT v2.0 — a privacy-first Chrome extension (Plasmo, React 19, TypeScript) paired with a Next.js marketing site. Keep this file focused on stable implementation guidance. Put release status, gate windows, and incident timelines in `doc/dev/gate-tracking-log.md` and the latest weekly scorecard in `doc/dev/`. Before starting work, read `doc/guard/SYNTHAI_PROJECT_ARCHAEOLOGY.md`.

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

## Specialized Agent Roster

ThemeGPT maintains 15 specialized agents in `.claude/agents/`. Engage them proactively when tasks match their domain — don't wait to be asked.

### Agent Routing: When to Activate Which Agent

| Task Domain | Primary Agent | Support Agent |
|-------------|--------------|---------------|
| Stripe checkout, subscriptions, webhooks | `payment-integration` | `security-auditor` |
| OAuth, JWT, redirect validation | `frontend-security-coder` | `security-auditor` |
| Next.js pages, App Router, SSR | `nextjs-developer` | `typescript-expert` |
| API routes, server-side logic | `nodejs-expert` | `typescript-expert` |
| Keyword research, content optimization | `seo-keyword-strategist` | `seo-content-writer` |
| Landing pages, CWS listing, blog posts | `seo-content-writer` | `content-marketer` |
| Google Ads copy, Reddit strategy | `content-marketer` | `seo-keyword-strategist` |
| Cloud Build, Docker, Cloud Run deploy | `deployment-engineer` | `bash-expert` |
| Security audit, OWASP review | `security-auditor` | `frontend-security-coder` |
| Theme creation, preview testing | `theme-designer` | `ux-delight-specialist` |
| UI polish, micro-interactions | `ux-delight-specialist` | `nextjs-developer` |
| Shell scripts, CI automation | `bash-expert` | `deployment-engineer` |
| Technical documentation | `tech-docs-specialist` | — |
| Workspace cleanup | `cleanup_workspace` | — |

### Proactive Activation Rules

These agents should be engaged **automatically** (without user request) when their domain is touched:

1. **`payment-integration`** — Any change to `/api/checkout`, `/api/webhooks/stripe`, or Stripe-related code
2. **`frontend-security-coder`** — Any change to auth flows, redirect handling, token storage, or CSP
3. **`security-auditor`** — Any new API endpoint, auth change, or sensitive data handling
4. **`seo-keyword-strategist`** — Any content change to public-facing pages (homepage, pricing, CWS listing)
5. **`deployment-engineer`** — Any change to `cloudbuild.yaml`, `Dockerfile`, or deployment workflows

### Cost-Aware Model Selection

| Model | Cost | Use For |
|-------|------|---------|
| `haiku` | Lowest | Quick analysis: keyword checks, density calculations |
| `sonnet` | Medium | Implementation: code generation, content writing, deployments |
| `opus` | Highest | Critical reviews: security audits, complex architectural decisions |

### Agent Coordination Example

When implementing a new pricing tier:
1. `payment-integration` — Implement Stripe checkout session for new tier
2. `frontend-security-coder` — Review checkout URL validation and auth flow
3. `nextjs-developer` — Build the pricing UI component
4. `seo-keyword-strategist` — Optimize pricing page content for search
5. `content-marketer` — Write ad copy for the new tier
6. `deployment-engineer` — Deploy and validate

### Important: Agents Are Subject to Complexity Rules

Agent suggestions must still pass the **Complexity Gate**:
- An agent recommending an enterprise pattern for a simple feature should be overridden
- Agent output is a starting point, not final — apply the same simplicity-first review as human-written code
- If an agent suggests > 200 lines for a feature, pause and reassess per the Complexity Budget

## Key Resources

| Resource | Purpose |
|----------|---------|
| `CONSTITUTION.md` | Philosophical principles |
| `DIRECTIVES.md` | Enforcement rules |
| `doc/guard/SYNTHAI_PROJECT_ARCHAEOLOGY.md` | Historical lessons (required reading) |
| `.claude/agents/*.md` | Specialized agent definitions (15 agents) |
