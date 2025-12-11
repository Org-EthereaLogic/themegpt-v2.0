# Constitution for ThemeGPT v2.0 Development

This constitution defines the philosophical foundation for all development work on ThemeGPT v2.0 — a privacy-first Chrome extension for customizing ChatGPT appearance and tracking token usage.

## Scope

Governs all development for ThemeGPT v2.0, including:

- Chrome extension development (Plasmo, React 18)
- TypeScript implementation
- UI/UX with the Cream & Chocolate design system
- Token counting and analytics features
- Privacy-preserving architecture (all data stays in browser)

## Historical Context

This project operates under lessons learned from the SynthAI project archaeology (`doc/guard/SYNTHAI_PROJECT_ARCHAEOLOGY.md`), which documented how a simple 200-line solution became a 7,900-line enterprise platform through unchecked complexity accumulation. That cautionary tale informs several principles below.

## Foundational Principles (Priority Order)

These principles are ordered by priority. When principles conflict, higher-numbered principles yield to lower-numbered ones.

### 1. Simplicity & Proportionality

**Match complexity to problem scale.** A 200-line problem should not become a 7,900-line solution. Every abstraction, pattern, and architectural decision must justify its existence against the actual problem being solved.

**Application:**

- Before adding code, ask: "Does this complexity match the problem scale?"
- Prefer direct, obvious implementations over clever, abstract ones
- A working 50-line script beats an elegant 500-line framework
- Default to hard-coded values; add configuration only when proven necessary

**Why this matters:** The SynthAI archaeology demonstrates that unchecked complexity accumulation transforms simple tools into unmaintainable systems. Enterprise patterns designed for large-scale distributed systems have no place in a browser extension.

### 2. Working Code Over Specifications

**Start with minimal working implementations, not elaborate specifications.** Extract abstractions only after duplication is proven (3+ occurrences). Specifications describe outcomes, not implementation details.

**Application:**

- Write working code first, refactor when patterns emerge
- No abstract base classes until 3+ concrete implementations exist
- No adapter patterns for single implementations
- No configuration systems for values that could be hard-coded
- Specifications state what success looks like, not how to build it

**Why this matters:** Specification-driven development led SynthAI to implement every documented requirement rather than solving the core problem. The spec alone exceeded what the implementation should have been.

### 3. Brand Integrity

All visual elements must align with the Cream & Chocolate design system, reflecting a warm, approachable aesthetic that complements ChatGPT's interface.

**Core Brand Colors:**

| Color | Hex | Usage |
|-------|-----|-------|
| Cream | #FAF6F0 | Primary background, light surfaces |
| Chocolate | #4B2E1E | Primary text, dark accents |
| Peach | #F4A988 | CTAs, highlights, interactive elements |
| Teal | #7ECEC5 | Secondary accent, success states |

**Typography:**

| Element | Font |
|---------|------|
| Headings | Space Grotesk |
| Body | Inter |
| Monospace | JetBrains Mono |

**Why this matters:** Brand consistency creates recognition and trust. The extension should feel native to ChatGPT while maintaining its own identity.

### 4. Privacy First

All data processing occurs locally in the browser. No telemetry, no external analytics, no data leaves the user's machine unless they explicitly choose to export it.

**Application:**

- Token counts stored in browser local storage only
- Theme preferences stored locally
- No network requests for analytics
- Export features produce local files only

**Why this matters:** Privacy is the core value proposition. Users choose ThemeGPT because they trust it won't surveil their ChatGPT usage.

### 5. Accessibility First

All UI meets WCAG 2.1 AA standards minimum. Accessibility is not optional — it expands the potential user base and ensures the extension works for everyone.

**Application:**

- Semantic HTML structure
- Keyboard navigation for all interactive elements
- Color contrast ratio >= 4.5:1 for text
- Visible focus indicators
- Screen reader compatibility

**Why this matters:** An inaccessible extension excludes potential users. Accessibility built in from the start costs less than retrofitting.

### 6. Complete Implementation

Every feature and component must be production-ready. No placeholder content, TODO markers, or incomplete sections.

**Application:**

- No TODO, FIXME, or TBD markers in shipped code
- All code examples must be syntactically valid
- All UI states must be implemented (loading, error, empty, success)
- No "lorem ipsum" or placeholder text

**Why this matters:** Incomplete work in a user-facing extension damages trust and creates confusion.

### 7. Investigation Before Action

Understand existing patterns before modifying code. Check what exists before creating something new.

**Application:**

- Review existing components before creating new ones
- Check shared packages for reusable utilities
- Reference design tokens before implementing styles
- Search codebase for similar patterns

**Why this matters:** Duplicate code increases maintenance burden and creates inconsistencies.

## Decision Framework

When principles or directives conflict, apply this hierarchy:

1. **Simplicity** — Never add complexity beyond what the problem requires
2. **Privacy** — Never compromise user data protection
3. **Accessibility** — Never exclude users
4. **Brand integrity** — Maintain visual consistency
5. **Completeness** — No placeholders or incomplete features
6. **Performance** — Fast, responsive extension

**Complexity Gate:** Before implementing any solution, answer: "Is this the simplest approach that solves the actual problem?" If the answer involves phrases like "we might need," "for flexibility," or "in case of," reconsider.

## Anti-Patterns to Avoid

These patterns emerged from the SynthAI archaeology and must be actively prevented:

| Anti-Pattern | Description | Prevention |
|--------------|-------------|------------|
| Specification Inflation | Specs become implementation blueprints | Specs describe outcomes only |
| Enterprise Pattern Obsession | Circuit breakers, registries for simple tools | Match patterns to scale |
| Premature Abstraction | Abstractions before proven need | Wait for 3+ duplications |
| Configuration Explosion | Everything becomes configurable | Hard-code by default |
| Framework Absorption | Domain complexity leaks everywhere | Keep frameworks separate |
| Test Suite Inflation | Tests > implementation size | Tests < 50% of impl |

## Relationship to Other Documents

| Document | Purpose |
|----------|---------|
| DIRECTIVES.md | Enforcement rules derived from these principles |
| AGENTS.md | Operational procedures for development |
| CLAUDE.md | Quick reference for Claude Code sessions |
| doc/guard/SYNTHAI_PROJECT_ARCHAEOLOGY.md | Historical lessons informing these principles |
