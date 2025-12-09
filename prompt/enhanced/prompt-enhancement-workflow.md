# Prompt Enhancement Workflow

**Date:** 2024-12-09  
**Prompt Level:** Level 2 (Workflow Prompt)  
**Purpose:** Transform vague or incomplete prompts into fully actionable plans that AI coding agents can execute without ambiguity.

---

## Inputs Consulted

| Source | Key Takeaways |
|--------|---------------|
| [agentic-prompt-engineering.md](../prompt-docs/agentic-prompt-engineering.md) | 7 levels of prompt formats, section anatomy (Metadata, Variables, Workflow, Instructions, Report), system vs user prompt distinction |
| [anthropic-prompting-best-practices.md](../prompt-docs/anthropic-prompting-best-practices.md) | Be explicit, provide context/motivation, use modifiers to shape quality, structure outputs with XML tags, avoid "think" when extended thinking disabled |
| [theme-library-agentic-implementation.md](theme-library-agentic-implementation.md) | Example of structured implementation plan with code blocks and execution instructions |
| [themegpt-extension-fix-prompt.md](themegpt-extension-fix-prompt.md) | Example of problem-state tables, ordered action steps, pre-flight checks, verification criteria |

---

## Mission Statement

Given an ambiguous or high-level prompt, produce a self-contained, test-ready enhanced prompt that an AI coding agent can execute step-by-step without further clarification.

---

## Workflow

### Phase 1: Analyze Source Prompt

1. **Extract the core intent:** Identify the single main goal in one sentence.
2. **Define scope boundaries:** List what IS in scope and what is NOT.
3. **Identify success criteria:** What measurable outcomes confirm completion?
4. **Catalog missing details:** List every ambiguous element that would block execution:
   - Target file paths or directories
   - Required tools, frameworks, or dependencies
   - Input/output formats
   - Testing or verification steps
   - Edge cases or error handling requirements

### Phase 2: Synthesize Reference Guidance

5. **Gather project constraints:** Read `AGENTS.md`, `DIRECTIVES.md`, and any `.instructions.md` files applicable to the workspace.
6. **Identify coding standards:** Note naming conventions, file organization patterns, and forbidden practices.
7. **Resolve conflicts:** If reference materials contradict each other, apply this precedence:
   1. Security rules (highest priority)
   2. Project-specific instructions (`AGENTS.md`, `DIRECTIVES.md`)
   3. General best practices
8. **Summarize key rules:** Produce a concise list (5-10 items) of constraints the enhanced prompt must respect.

### Phase 3: Draft Enhanced Prompt

9. **Write the mission statement:** One clear sentence stating what the agent must accomplish.
10. **Create the problem-state table (if applicable):** Use a table to contrast expected vs actual state for debugging/fix prompts.
11. **Write numbered, sequential instructions:** Each step should be:
    - Atomic (one action per step)
    - Verifiable (includes success signal)
    - Explicit (contains file paths, commands, or code snippets)
12. **Add guardrails section:** List forbidden actions, performance budgets, and dependency constraints.
13. **Add pre-flight checks:** What must the agent verify before starting?
14. **Add verification checklist:** What confirms the task is complete?
15. **Define error handling:** Provide a resolution table for foreseeable failures.

### Phase 4: Quality Check

16. **Self-containment test:** Can an agent execute this prompt with only the information provided? If not, add missing context.
17. **Ambiguity test:** Read each instruction. Is there only ONE way to interpret it? If not, rewrite.
18. **Tone review:** Remove hedging language ("maybe", "consider", "you could"). Use directive imperatives ("Create", "Execute", "Verify").
19. **Complexity budget:** Does the enhanced prompt encourage minimal solutions? Add explicit anti-over-engineering guidance if needed.

---

## Instructions

- **Do NOT expand scope:** The enhanced prompt should solve the original problem, not a larger imagined one.
- **Preserve intent:** If the source prompt is intentionally vague (e.g., "explore options"), retain exploratory language but add structure.
- **Use XML tags for formatting control:** Wrap sections in descriptive tags (e.g., `<guardrails>`, `<verification>`) when the prompt will be consumed by another AI agent.
- **Include code blocks:** Where implementation is required, provide complete, copy-pasteable code—not pseudocode.
- **Reference concrete paths:** Use absolute paths or paths relative to workspace root. Never use generic placeholders like `<project-root>`.
- **Specify tools explicitly:** If a terminal command is needed, write the exact command. If a file edit is needed, show the before/after.

---

## Guardrails

<guardrails>
- **Forbidden:** Adding features, refactoring, or improvements not requested in the source prompt.
- **Forbidden:** Creating abstract classes or utility modules unless the source prompt explicitly requires them.
- **Forbidden:** Introducing new dependencies without explicit justification.
- **Required:** Every implementation step must have a corresponding verification step.
- **Required:** Security scan (`snyk_code_scan`) for any new first-party code in supported languages.
- **Budget:** Enhanced prompts should add no more than 2x the word count of the source prompt (compressed ideas, not padding).
</guardrails>

---

## Deliverables

The enhanced prompt file must contain:

1. **Title** (action-oriented, describes what gets done)
2. **Date** (ISO format: YYYY-MM-DD)
3. **Inputs Consulted** (table listing sources and key takeaways)
4. **Mission Statement** (one sentence)
5. **Problem-State Table** (if applicable)
6. **Numbered Instructions** (setup → implementation → verification)
7. **Pre-Flight Checks** (what to verify before starting)
8. **Guardrails** (forbidden actions, constraints)
9. **Verification Checklist** (success criteria as checkboxes)
10. **Error Handling Table** (error → resolution mapping)

---

## Verification Checklist

- [ ] Mission statement is one sentence and unambiguous
- [ ] All file paths are explicit (no placeholders)
- [ ] All terminal commands are complete and copy-pasteable
- [ ] Every action step has a verification signal
- [ ] Guardrails section prevents scope creep
- [ ] Pre-flight checks prevent execution on invalid state
- [ ] Error handling covers foreseeable failure modes
- [ ] Tone is directive (imperatives, no hedging)
- [ ] Word count is justified by complexity, not padding

---

## Error Handling

| Error Condition | Resolution |
|-----------------|------------|
| Source prompt has no clear goal | Ask clarifying question; do not guess intent |
| Reference docs contradict each other | Apply precedence rules (security > project-specific > general) |
| Required file paths unknown | Use workspace search tools to discover; document assumptions |
| Source prompt requests forbidden action | Flag the conflict; produce prompt that addresses intent without violation |
| Enhanced prompt exceeds complexity budget | Split into multiple focused prompts or simplify approach |

---

## Example Transformation

### Source Prompt (Vague)

```
Make the login page look better
```

### Enhanced Prompt (Actionable)

```markdown
# Improve Login Page Visual Design

**Date:** 2024-12-09

## Mission Statement
Update the login page (`apps/web/app/login/page.tsx`) to match the ThemeGPT brand guidelines with improved typography, spacing, and color usage.

## Pre-Flight Checks
1. Verify `apps/web/app/login/page.tsx` exists
2. Confirm Tailwind CSS is configured in `apps/web/tailwind.config.ts`
3. Read `packages/shared/src/index.ts` for brand color constants

## Instructions
1. **Read current login page:** Open `apps/web/app/login/page.tsx` and note existing structure.
2. **Apply brand colors:** Replace generic grays with `brand.cream` (#FAF6F0) for background, `brand.chocolate` (#4B2E1E) for text.
3. **Update typography:** Set heading to `text-2xl font-bold`, body to `text-base`.
4. **Improve spacing:** Add `p-8` to container, `space-y-4` between form fields.
5. **Run build:** Execute `pnpm build` in `apps/web/` to verify no errors.
6. **Security scan:** Run Snyk code scan on modified files.

## Guardrails
- Do NOT change login functionality or form validation
- Do NOT add new dependencies
- Do NOT modify any files outside `apps/web/app/login/`

## Verification Checklist
- [ ] Login page uses brand colors from shared package
- [ ] Build completes without errors
- [ ] No new TypeScript errors introduced
- [ ] Snyk scan shows no new security issues
```

---

## Report Format

When reporting completion of an enhanced prompt, provide:

1. **Source prompt** (original text)
2. **Enhanced prompt location** (file path)
3. **Key clarifications made** (what ambiguities were resolved)
4. **Assumptions documented** (what was inferred vs explicit)
5. **Complexity assessment** (simple/moderate/complex based on instruction count)
