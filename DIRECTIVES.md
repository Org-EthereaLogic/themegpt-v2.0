# ThemeGPT v2.0 Development Directives

Enforcement rules for AI coding agents working on ThemeGPT v2.0. Rules derive from CONSTITUTION.md principles and lessons from `doc/guard/SYNTHAI_PROJECT_ARCHAEOLOGY.md`.

**Enforcement Model:**

- **Critical**: Must pass before deployment (hook-enforced, blocks operations)
- **Important**: Should be addressed, may proceed with documented exceptions
- **Recommended**: Best practices for optimal results

## Quick Reference Matrix

| Directive | Priority | Category | Primary Files |
|-----------|----------|----------|---------------|
| Complexity Budget | Critical | Architecture | All code files |
| No Placeholder Content | Critical | Content | All files |
| Accessibility Standards | Critical | Markup | *.tsx,*.html |
| Brand Color Compliance | Critical | Visual | *.css, *.tsx, tailwind.config.* |
| No Premature Abstraction | Important | Architecture | All code files |
| Pattern Justification | Important | Architecture | New patterns, abstractions |
| Framework Separation | Important | Architecture | Utility code |
| Responsive Implementation | Important | Layout | *.css,*.tsx |
| Component Architecture | Important | Structure | components/**/* |
| Performance Budgets | Recommended | Optimization | All files |

## Critical Directives

These directives are enforced by hooks. Violations block the operation until resolved.

### Complexity Budget

**Principle:** Simplicity & Proportionality (CONSTITUTION Section 1)

**Why this matters:** The SynthAI archaeology shows how a 200-line solution became 7,900 lines. Complexity budgets prevent this accumulation by requiring review before code exceeds reasonable bounds.

**LIMITS:**

| Metric | Limit | Enforcement |
|--------|-------|-------------|
| Single feature/module | 500 lines max | Block if exceeded without review |
| Configuration files (total) | 50 lines max | Warn on threshold |
| Test files | < 50% of implementation | Warn on threshold |
| Abstract classes | 0 until 3+ concrete exist | Block premature creation |

**Application:**

- Before writing code exceeding 200 lines, pause and reassess
- Features over 500 lines require architectural review
- Prefer multiple small files over one large file
- If you need to add configuration, justify why hard-coding won't work

**Verification:**

```bash
# Count lines in new/modified files
wc -l path/to/file.ts

# Check for files over 500 lines
find apps packages -name "*.ts" -o -name "*.tsx" | xargs wc -l | awk '$1 > 500'

# Check test-to-implementation ratio
find apps packages -name "*.test.ts" | xargs wc -l | awk '{sum+=$1} END {print "Test lines:", sum}'
find apps packages -name "*.ts" ! -name "*.test.ts" | xargs wc -l | awk '{sum+=$1} END {print "Impl lines:", sum}'
```

### No Placeholder Content

**Principle:** Complete Implementation (CONSTITUTION Section 6)

**Why this matters:** Placeholder content in a user-facing extension damages trust.

**FORBIDDEN PATTERNS:**

| Pattern | Category | Detection |
|---------|----------|-----------|
| `TODO`, `FIXME`, `TBD`, `XXX` | Deferral | grep |
| `lorem ipsum` | Filler | grep |
| `example.com` | Mock domain | grep |
| `[your-*]`, `<your-*>` | Template | grep |
| `placeholder.png` | Mock image | grep |
| `foo`, `bar`, `baz` | Generic names | grep |

**Verification:**

```bash
# Check for placeholder patterns
grep -rE "TODO|FIXME|TBD|XXX|lorem ipsum|example\.com|\[your-|placeholder\." \
  --include="*.ts" --include="*.tsx" --include="*.css" apps/ packages/
```

### Accessibility Standards

**Principle:** Accessibility First (CONSTITUTION Section 5)

**Why this matters:** Accessibility expands the user base and ensures the extension works for everyone.

**ALWAYS:**

- Use semantic HTML (`<button>`, `<nav>`, `<main>`, etc.)
- Provide alt text for all meaningful images
- Ensure color contrast >= 4.5:1 (Cream & Chocolate palette is tested)
- Include visible focus indicators
- Support keyboard navigation for all interactive elements
- Use ARIA labels for icon-only buttons

**FORBIDDEN PATTERNS:**

| Pattern | Issue | Fix |
|---------|-------|-----|
| `<div onClick>` | Not keyboard accessible | Use `<button>` |
| `alt=""` on meaningful images | Missing description | Describe the content |
| Color-only indicators | Not accessible | Add icon or text |
| `tabindex > 0` | Breaks natural order | Use 0 or -1 only |

### Brand Color Compliance

**Principle:** Brand Integrity (CONSTITUTION Section 3)

**Why this matters:** Color consistency builds brand recognition.

**ALWAYS use CSS custom properties:**

```css
/* Cream & Chocolate Design System */
--theme-cream: #FAF6F0;       /* Primary background */
--theme-chocolate: #4B2E1E;   /* Primary text, dark accents */
--theme-peach: #F4A988;       /* CTAs, highlights */
--theme-teal: #7ECEC5;        /* Secondary accent, success */

/* Supporting neutrals */
--theme-light: #FFFFFF;
--theme-muted: #F5F5F5;
--theme-border: #E5E5E5;
```

**NEVER:**

- Use color literals outside the defined palette
- Introduce new colors without design system approval
- Override brand colors with inline styles

## Important Directives

These directives generate warnings but do not block operations. Proceed with documented justification.

### No Premature Abstraction

**Principle:** Working Code Over Specifications (CONSTITUTION Section 2)

**Why this matters:** SynthAI created 1,035 lines of adapter infrastructure for what could have been 3 function calls. Abstractions created before proven need increase complexity without benefit.

**AVOID:**

- Creating abstract base classes before 3+ concrete implementations exist
- Adapter patterns for single implementations
- Configuration systems for values that could be hard-coded
- Factory patterns for single object types
- Registry patterns for < 5 registered items

**EXAMPLES:**

```typescript
// BAD: Premature abstraction
abstract class BaseProvider {
  abstract call(input: string): Promise<string>;
}
class OpenAIProvider extends BaseProvider { ... }
// Only one provider exists!

// GOOD: Direct implementation
async function callOpenAI(input: string): Promise<string> {
  return await openai.complete(input);
}
// Add abstraction when you actually need multiple providers
```

```typescript
// BAD: Configuration for hard-codeable value
const config = loadConfig();
const MAX_TOKENS = config.maxTokens ?? 4096;

// GOOD: Hard-coded default
const MAX_TOKENS = 4096;
// Make configurable only if users actually need to change it
```

**Justification Required:** If you must create an abstraction early, document:

1. What specific problem it solves
2. Why simpler approaches are insufficient
3. When the additional implementations will be added

### Pattern Justification

**Principle:** Simplicity & Proportionality (CONSTITUTION Section 1)

**Why this matters:** Enterprise patterns like circuit breakers, service registries, and rollback managers have no place in a browser extension. SynthAI used rollback managers for a single-user local tool.

**REQUIRES JUSTIFICATION:**

- Circuit breakers
- Service registries / dependency injection containers
- Rollback managers
- Event sourcing
- CQRS patterns
- Multi-layer adapter hierarchies
- Plugin architectures

**JUSTIFICATION TEMPLATE:**

```
Pattern: [Name]
Problem: [What specific, immediate problem does this solve?]
Simpler alternatives considered: [What was rejected and why?]
Scale justification: [Why is this pattern appropriate for a browser extension?]
```

### Framework Separation

**Principle:** Working Code Over Specifications (CONSTITUTION Section 2)

**Why this matters:** SynthAI's UMIF/QCE/CRE framework complexity leaked into every module. Domain-specific frameworks must stay contained.

**Application:**

- Utility code should be generic and reusable
- Domain-specific logic stays in domain modules
- No framework-specific types in shared utilities
- Keep dependencies flowing one direction (utilities have no domain dependencies)

### Responsive Implementation

**Principle:** Accessibility & Brand Integrity

**Why this matters:** Extension popups have constrained space. Content must adapt gracefully.

**Application:**

- Design for popup width constraints (typically 300-400px)
- Use relative units where appropriate
- Test at minimum and maximum popup sizes

### Component Architecture

**Principle:** Investigation Before Action (CONSTITUTION Section 7)

**Why this matters:** Duplicate components increase maintenance burden.

**ALWAYS:**

- Check `apps/extension/src/components/` before creating new ones
- Check `packages/shared/` for reusable utilities
- Follow naming convention: `PascalCase.tsx`

**COMPONENT STRUCTURE:**

```text
apps/extension/src/
├── components/
│   ├── ui/           # Primitive components (Button, Card)
│   ├── features/     # Feature-specific components
│   └── layout/       # Layout components
```

## Recommended Directives

These directives represent best practices. No automated enforcement.

### Performance Budgets

**Why this matters:** Extensions should be lightweight and fast.

**TARGETS:**

| Metric | Target |
|--------|--------|
| Bundle size | < 500KB |
| Popup render | < 100ms |
| Token calculation | < 50ms for typical message |

## Verification Commands

### Critical Checks (Must Pass)

```bash
# Check for placeholder content
grep -rE "TODO|FIXME|lorem ipsum|example\.com" --include="*.tsx" --include="*.ts" apps/ packages/

# Check for non-semantic buttons
grep -rE "<div.*onClick" --include="*.tsx" apps/ packages/

# Check complexity budget (files over 500 lines)
find apps packages -name "*.ts" -o -name "*.tsx" | xargs wc -l | awk '$1 > 500 {print}'
```

### Important Checks (Should Pass)

```bash
# Check for premature abstractions
grep -rE "abstract class|interface.*Adapter|Registry|Factory" --include="*.ts" apps/ packages/

# Check config file sizes
find . -name "*.json" -o -name "*.yaml" | xargs wc -l
```

## Relationship to Other Documents

| Document | Purpose |
|----------|---------|
| CONSTITUTION.md | Philosophical principles these rules enforce |
| AGENTS.md | Operational procedures using these rules |
| CLAUDE.md | Quick reference summarizing key rules |
| doc/guard/SYNTHAI_PROJECT_ARCHAEOLOGY.md | Historical lessons informing complexity rules |
