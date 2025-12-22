---
agent: agent
---
# Prompt Enhancement Workflow

**Date:** 2025-12-21  
**Version:** 2.0  
**Prompt Level:** Level 2 (Workflow Prompt)  
**Purpose:** Transform vague or incomplete prompts into fully actionable plans that AI coding agents can execute without ambiguity.

---

## Inputs Consulted

| Source | Key Takeaways |
|--------|---------------|
| [agentic-prompt-engineering.md](../prompt-docs/agentic-prompt-engineering.md) | 7 levels of prompt formats, section anatomy (Metadata, Variables, Workflow, Instructions, Report), system vs user prompt distinction |
| [anthropic-prompting-best-practices.md](../prompt-docs/anthropic-prompting-best-practices.md) | Be explicit, provide context/motivation, use modifiers to shape quality, structure outputs with XML tags, avoid "think" when extended thinking disabled |
| [prompt/enhanced/](../../prompt/enhanced/) | 30+ production-enhanced prompts showing effective patterns for fix, feature, research, and troubleshooting prompts |
| [prompt/draft/](../../prompt/draft/) | Original vague prompts that were successfully transformed into actionable specifications |

---

## Mission Statement

Given an ambiguous or high-level prompt, produce a self-contained, test-ready enhanced prompt that an AI coding agent can execute step-by-step without further clarification.

---

## Prompt Type Classification

Before enhancing, classify the source prompt into one of these categories to apply the appropriate template:

| Type | Indicators | Key Sections Needed |
|------|------------|---------------------|
| **Fix/Debug** | "broken", "not working", "error", "gap", "issue" | Root Cause Analysis phase, Problem-State Table, Alternative Solutions |
| **Feature** | "implement", "add", "create", "build" | Technical Context, Problem-State Table (current → target), Phased Instructions |
| **Research** | "investigate", "evaluate", "compare", "find" | Research Criteria, Deliverables spec, Decision Matrix template |
| **Troubleshoot** | "diagnose", "why", "understand", "check" | Investigation Phase, Hypothesis Table, Verification Commands |
| **Refactor** | "optimize", "clean up", "improve", "consolidate" | Before/After examples, Complexity Budget, Regression Tests |

**Complexity Classification Rubric:**

| Complexity | Criteria | Instruction Count | Line Budget |
|------------|----------|-------------------|-------------|
| **Simple** | Single file, < 50 lines changed, no dependencies | 3-6 instructions | 50-100 lines |
| **Moderate** | 2-5 files, < 200 lines changed, existing patterns | 7-12 instructions | 100-300 lines |
| **Complex** | 5+ files, new patterns introduced, integration needed | 13-20 instructions | 300-500 lines |

---

## Workflow

### Phase 1: Analyze Source Prompt

1. **Classify prompt type:** Determine if this is a Fix, Feature, Research, Troubleshoot, or Refactor prompt.
2. **Extract the core intent:** Identify the single main goal in one sentence.
3. **Define scope boundaries:** List what IS in scope and what is NOT.
4. **Identify success criteria:** What measurable outcomes confirm completion?
5. **Catalog missing details:** List every ambiguous element that would block execution:
   - Target file paths or directories
   - Required tools, frameworks, or dependencies
   - Input/output formats
   - Testing or verification steps
   - Edge cases or error handling requirements
6. **Assess complexity:** Use the rubric above to classify as Simple, Moderate, or Complex.

### Phase 2: Synthesize Reference Guidance

7. **Gather project constraints:** Read `AGENTS.md`, `DIRECTIVES.md`, and any `.instructions.md` files applicable to the workspace.
8. **Identify coding standards:** Note naming conventions, file organization patterns, and forbidden practices.
9. **Resolve conflicts:** If reference materials contradict each other, apply this precedence:
   1. Security rules (highest priority)
   2. Project-specific instructions (`AGENTS.md`, `DIRECTIVES.md`)
   3. General best practices
10. **Summarize key rules:** Produce a concise list (5-10 items) of constraints the enhanced prompt must respect.

### Phase 3: Draft Enhanced Prompt

11. **Write the mission statement:** One clear sentence stating what the agent must accomplish.
12. **Add technical context section:** Explain *why* this solution works and what the agent needs to understand to implement it correctly. Include:
    - Relevant architecture context
    - Key files and their purposes
    - Design rationale for the chosen approach
13. **Create the problem-state table:** Use a table to contrast current vs. target state (for all prompt types, not just debug).
14. **Write numbered, phased instructions:** Organize instructions into logical phases:
    - **Investigation/Setup Phase:** Gather context, verify prerequisites
    - **Implementation Phase:** Execute the core work
    - **Verification Phase:** Test and validate changes
    - **Security/Quality Phase:** Run scans, check for regressions
    
    Each step should be:
    - Atomic (one action per step)
    - Verifiable (includes explicit success signal in italics)
    - Explicit (contains file paths, commands, or code snippets)
15. **Add guardrails section:** List forbidden actions, performance budgets, and dependency constraints.
16. **Add pre-flight checks:** What must the agent verify before starting?
17. **Add verification checklist:** What confirms the task is complete?
18. **Define error handling:** Provide a resolution table for foreseeable failures.
19. **Add out-of-scope section:** Explicitly list related work that is NOT part of this prompt.
20. **Add alternative solutions (for Fix/Debug prompts):** Provide fallback approaches if primary solution fails.

### Phase 4: Quality Check

21. **Self-containment test:** Can an agent execute this prompt with only the information provided? If not, add missing context.
22. **Ambiguity test:** Read each instruction. Is there only ONE way to interpret it? If not, rewrite.
23. **Tone review:** Remove hedging language ("maybe", "consider", "you could"). Use directive imperatives ("Create", "Execute", "Verify").
24. **Complexity budget:** Does the enhanced prompt encourage minimal solutions? Add explicit anti-over-engineering guidance if needed.
25. **Bash command audit:** Every shell command should be copy-pasteable and include expected output where relevant.

---

## Instructions

- **Do NOT expand scope:** The enhanced prompt should solve the original problem, not a larger imagined one.
- **Preserve intent:** If the source prompt is intentionally vague (e.g., "explore options"), retain exploratory language but add structure.
- **Use XML tags for formatting control:** Wrap sections in descriptive tags (e.g., `<guardrails>`, `<verification>`) when the prompt will be consumed by another AI agent.
- **Include code blocks:** Where implementation is required, provide complete, copy-pasteable code—not pseudocode.
- **Reference concrete paths:** Use absolute paths or paths relative to workspace root. Never use generic placeholders like `<project-root>`.
- **Specify tools explicitly:** If a terminal command is needed, write the exact command. If a file edit is needed, show the before/after.
- **Add success signals:** After each instruction, include an italicized success signal (e.g., *Success: Build completes without errors*).
- **Include rationale:** For non-obvious decisions, add a brief "**Rationale:**" explaining why.

---

## Guardrails

<guardrails>
- **Forbidden:** Adding features, refactoring, or improvements not requested in the source prompt.
- **Forbidden:** Creating abstract classes or utility modules unless the source prompt explicitly requires them.
- **Forbidden:** Introducing new dependencies without explicit justification.
- **Required:** Every implementation step must have a corresponding verification step.
- **Required:** Security scan (`snyk_code_scan`) for any new first-party code in supported languages.
- **Required:** Classify complexity and include classification in prompt metadata.
- **Budget:** Enhanced prompts should add no more than 2x the word count of the source prompt (compressed ideas, not padding).
- **Budget:** Instructions must respect the line count limits in the Complexity Classification Rubric.
</guardrails>

---

## Deliverables

The enhanced prompt file must contain:

1. **Title** (action-oriented, describes what gets done)
2. **Date** (ISO format: YYYY-MM-DD)
3. **Prompt Level** (Level 2-5 per agentic prompt engineering taxonomy)
4. **Complexity Classification** (Simple/Moderate/Complex with justification)
5. **Inputs Consulted** (table listing sources and key takeaways)
6. **Mission Statement** (one sentence)
7. **Technical Context** (architecture understanding, design rationale)
8. **Problem-State Table** (current vs. target state for all prompt types)
9. **Pre-Flight Checks** (what to verify before starting)
10. **Numbered Phased Instructions** (Investigation → Implementation → Verification → Security)
11. **Guardrails** (forbidden actions, constraints)
12. **Verification Checklist** (success criteria as checkboxes)
13. **Error Handling Table** (error → resolution mapping)
14. **Out of Scope** (explicitly deferred work)
15. **Alternative Solutions** (fallback approaches, especially for Fix/Debug prompts)
16. **Report Format** (what the agent should report on completion)

---

## Verification Checklist

- [ ] Prompt type is classified (Fix/Feature/Research/Troubleshoot/Refactor)
- [ ] Complexity classification is included (Simple/Moderate/Complex)
- [ ] Mission statement is one sentence and unambiguous
- [ ] Technical context section explains the *why* behind the solution
- [ ] All file paths are explicit (no placeholders)
- [ ] All terminal commands are complete and copy-pasteable with expected output
- [ ] Instructions are organized into phases (Investigation → Implementation → Verification → Security)
- [ ] Every action step has an explicit success signal in italics
- [ ] Guardrails section prevents scope creep
- [ ] Pre-flight checks prevent execution on invalid state
- [ ] Error handling covers foreseeable failure modes with specific resolutions
- [ ] Out-of-scope section lists deferred work
- [ ] Alternative solutions provided for Fix/Debug prompts
- [ ] Report format specifies what agent should deliver on completion
- [ ] Tone is directive (imperatives, no hedging)
- [ ] Word count and line count are justified by complexity classification

---

## Error Handling

| Error Condition | Resolution |
|-----------------|------------|
| Source prompt has no clear goal | Ask clarifying question; do not guess intent |
| Reference docs contradict each other | Apply precedence rules (security > project-specific > general) |
| Required file paths unknown | Use workspace search tools to discover; document assumptions |
| Source prompt requests forbidden action | Flag the conflict; produce prompt that addresses intent without violation |
| Enhanced prompt exceeds complexity budget | Split into multiple focused prompts or simplify approach |
| Cannot classify prompt type | Default to "Feature" type; note assumption in metadata |
| Multiple root causes possible | Structure as hypothesis table with investigation steps for each |
| Source prompt lacks verification criteria | Derive from inverse of problem statement; verify fix addressed original issue |

---

## Example Transformations

### Example 1: Fix/Debug Prompt

**Source Prompt (Vague):**
```
The grid pattern has a gap in it
```

**Enhanced Prompt (Actionable):**

```markdown
# Fix 3D Neon Grid Animation Gap

**Date:** 2025-12-21  
**Prompt Level:** Level 3 (Implementation Prompt)  
**Complexity:** Simple (single file, ~7 lines added)

---

## Mission Statement

Eliminate the horizontal line gap in the 3D neon grid animation by adding sufficient animated `<use>` elements to cover the full animation cycle.

---

## Technical Context

The grid creates a "racing into the horizon" effect using 20 SVG `<use>` elements that animate their `y` position over 13.33 seconds. With 20 elements staggered 0.5s apart, only 10s of the 13.33s cycle has coverage, creating a 3.33s gap.

**Solution:** Add 7 more elements (27 total) to achieve 13.5s of coverage, eliminating the gap.

---

## Problem-State Table

| Aspect | Current State | Target State |
|--------|---------------|--------------|
| Horizontal lines | Gap appears mid-animation | Continuous coverage |
| `<use>` elements | 20 elements, 10s coverage | 27 elements, 13.5s coverage |
| Begin times | -0 to -9.5 | -0 to -13 |

---

## Pre-Flight Checks

1. Verify file exists: `packages/shared/src/css/generators.ts`
   ```bash
   test -f packages/shared/src/css/generators.ts && echo "✓ File exists"
   ```

---

## Instructions

### Phase 1: Implementation

1. **Open the generators file:**
   
   Read `packages/shared/src/css/generators.ts` lines 618-668.
   
   *Success: File opens without error*

2. **Add 7 new `<use>` elements:**
   
   Insert after the existing `<use>` elements with begin=-9.5, before `</svg>`:
   ```xml
   <use href='%23a'><animate attributeName='y' values='0%3B540' dur='13.33' calcMode='spline' keySplines='.8 0 1 .2' repeatCount='indefinite' begin='-10'/%3E</use>
   <use href='%23a'><animate attributeName='y' values='0%3B540' dur='13.33' calcMode='spline' keySplines='.8 0 1 .2' repeatCount='indefinite' begin='-10.5'/%3E</use>
   <use href='%23a'><animate attributeName='y' values='0%3B540' dur='13.33' calcMode='spline' keySplines='.8 0 1 .2' repeatCount='indefinite' begin='-11'/%3E</use>
   <use href='%23a'><animate attributeName='y' values='0%3B540' dur='13.33' calcMode='spline' keySplines='.8 0 1 .2' repeatCount='indefinite' begin='-11.5'/%3E</use>
   <use href='%23a'><animate attributeName='y' values='0%3B540' dur='13.33' calcMode='spline' keySplines='.8 0 1 .2' repeatCount='indefinite' begin='-12'/%3E</use>
   <use href='%23a'><animate attributeName='y' values='0%3B540' dur='13.33' calcMode='spline' keySplines='.8 0 1 .2' repeatCount='indefinite' begin='-12.5'/%3E</use>
   <use href='%23a'><animate attributeName='y' values='0%3B540' dur='13.33' calcMode='spline' keySplines='.8 0 1 .2' repeatCount='indefinite' begin='-13'/%3E</use>
   ```
   
   *Success: 7 lines added to SVG data URI*

### Phase 2: Verification

3. **Build the extension:**
   ```bash
   cd /Users/etherealogic/Dev/themegpt-v2.0 && pnpm build
   ```
   *Success: Build completes with exit code 0*

4. **Visual verification:**
   
   Observe the grid animation for 20+ seconds (1.5 full loops).
   
   *Success: No visible gaps in horizontal lines throughout cycle*

### Phase 3: Security

5. **Run Snyk scan:**
   
   Execute `snyk_code_scan` on modified file.
   
   *Success: No new security issues*

---

## Guardrails

- **Forbidden:** Changing animation duration (13.33s)
- **Forbidden:** Modifying viewBox dimensions
- **Forbidden:** Adding configuration options
- **Budget:** < 10 lines changed

---

## Verification Checklist

- [ ] 7 new `<use>` elements added (total 27)
- [ ] Build succeeds
- [ ] Animation loops without visible gaps
- [ ] Snyk scan passes

---

## Error Handling

| Error | Resolution |
|-------|------------|
| Gap still visible | Increase to 30 elements or reduce stagger to 0.4s |
| Build fails | Verify URL encoding in data URI |

---

## Out of Scope

- Animation speed adjustments
- Alternative visual effects
- Configuration options for line count

---

## Alternative Solutions

1. **Adjust duration:** Change from 13.33s to 10s to match 20 elements (changes animation speed)
2. **Reduce interval:** Change begin stagger from 0.5s to 0.4s (increases line density)

---

## Report Format

1. **Root cause:** [Describe finding]
2. **Solution applied:** Added N `<use>` elements with begin times -10 to -13
3. **Files modified:** packages/shared/src/css/generators.ts
4. **Verification:** Observed for X seconds, no gaps visible
5. **Security:** Snyk scan passed
```

---

### Example 2: Feature Prompt

**Source Prompt (Vague):**
```
Add premium theme support
```

**Enhanced Prompt (Actionable):**

```markdown
# Implement Premium Themes UI Framework

**Date:** 2025-12-21  
**Prompt Level:** Level 3 (Task Execution)  
**Complexity:** Moderate (2 files, ~180 lines)

---

## Mission Statement

Update the shared theme definitions to designate 6 themes as premium and modify the extension popup to display separate Free/Premium sections with lock overlays for unpurchased premium themes.

---

## Technical Context

Themes are defined in `packages/shared/src/index.ts` and rendered in `apps/extension/popup.tsx`. The `isPremium` boolean already exists on the `Theme` interface but all themes currently have it set to `false`. Premium themes should open a purchase URL when clicked while locked.

---

## Problem-State Table

| Component | Current State | Target State |
|-----------|---------------|--------------|
| Theme distribution | 12 free themes | 6 free + 6 premium |
| Popup UI | Single grid section | Two sections: "Free" and "Premium" |
| Premium indicator | None | Lock overlay + "Pro" badge |
| Locked theme click | N/A | Opens purchase URL |

---

## Pre-Flight Checks

1. Verify files exist:
   ```bash
   test -f packages/shared/src/index.ts && test -f apps/extension/popup.tsx && echo "✓ Files exist"
   ```

2. Confirm current theme count:
   ```bash
   grep -c "isPremium:" packages/shared/src/index.ts
   # Expected: 12
   ```

---

## Instructions

### Phase 1: Update Theme Definitions

1. **Mark 6 themes as premium:**
   
   In `packages/shared/src/index.ts`, set `isPremium: true` for:
   - synth-wave
   - tomorrow-night-blue
   - shades-of-purple
   - silent-night-starfield
   - candy-cane-chat
   - minimal-advent

   *Success: `grep -c "isPremium: true" packages/shared/src/index.ts` returns 6*

### Phase 2: Update Popup UI

2. **Add unlocked themes state:**
   
   After `const [activeThemeId, setActiveThemeId] = useState<string>("system")`, add:
   ```typescript
   const [unlockedThemeIds, setUnlockedThemeIds] = useState<string[]>([])
   ```
   
   *Success: No TypeScript errors*

3. **Split themes into arrays:**
   
   Before the `return` statement, add:
   ```typescript
   const freeThemes = DEFAULT_THEMES.filter(t => !t.isPremium)
   const premiumThemes = DEFAULT_THEMES.filter(t => t.isPremium)
   ```
   
   *Success: Arrays have 6 items each*

4. **Update applyTheme to check lock status:**
   
   Replace the `applyTheme` function to open purchase URL for locked themes.
   
   *Success: Clicking locked theme opens URL instead of applying*

5. **Update grid to show two sections:**
   
   Replace single grid with "Free Collection" and "Premium Collection" sections.
   
   *Success: Two sections visible in popup*

### Phase 3: Verification

6. **Build extension:**
   ```bash
   pnpm --filter extension build
   ```
   *Success: Build completes without errors*

7. **Visual verification:**
   - Open extension popup
   - Confirm 6 themes in "Free Collection" without lock icons
   - Confirm 6 themes in "Premium Collection" with lock icons
   - Click locked theme → opens purchase URL
   
   *Success: All UI behaviors match requirements*

### Phase 4: Security

8. **Run security scans:**
   
   Execute `snyk_code_scan` on both modified files.
   
   *Success: No new security issues*

---

## Guardrails

- **Forbidden:** Adding new themes beyond existing 12
- **Forbidden:** Implementing actual payment/authentication
- **Forbidden:** Modifying files outside scope
- **Required:** All buttons have `aria-label` for accessibility
- **Budget:** < 200 lines across both files

---

## Verification Checklist

- [ ] Exactly 6 themes have `isPremium: true`
- [ ] Popup shows two sections
- [ ] Premium themes show lock overlay
- [ ] Clicking locked theme opens URL
- [ ] Build succeeds
- [ ] Snyk scan passes

---

## Out of Scope

- Payment integration
- User authentication
- Theme unlock persistence
- Purchase flow UI

---

## Report Format

1. **Files modified:** [List with line counts]
2. **Themes marked premium:** [List 6 theme IDs]
3. **UI changes:** [Describe sections, overlays, badges]
4. **Build status:** Pass/Fail
5. **Security status:** Snyk results
```

---

## Report Format

When reporting completion of an enhanced prompt, provide:

1. **Source prompt** (original text, quoted verbatim)
2. **Prompt classification** (Fix/Feature/Research/Troubleshoot/Refactor)
3. **Complexity assessment** (Simple/Moderate/Complex with justification)
4. **Enhanced prompt location** (file path where enhanced prompt was saved)
5. **Key clarifications made** (what ambiguities were resolved)
6. **Assumptions documented** (what was inferred vs. explicit)
7. **Sections included** (checklist of deliverables present in enhanced prompt)

---

## Prompt Type Templates

### Fix/Debug Template Additions

For Fix/Debug prompts, include these additional sections:

```markdown
## Root Cause Analysis

**Hypothesis 1:** [Description]
- Investigation: [How to verify]
- Evidence needed: [What would confirm/refute]

**Hypothesis 2:** [Description]
- Investigation: [How to verify]
- Evidence needed: [What would confirm/refute]

## Alternative Solutions

If primary solution fails:

1. **Fallback A:** [Description] - Pros: X, Cons: Y
2. **Fallback B:** [Description] - Pros: X, Cons: Y
```

### Research Template Additions

For Research prompts, include these additional sections:

```markdown
## Research Criteria

| Criterion | Weight | Scoring Method |
|-----------|--------|----------------|
| [Criterion 1] | High | [How to evaluate] |
| [Criterion 2] | Medium | [How to evaluate] |

## Decision Matrix Template

| Option | Criterion 1 | Criterion 2 | Total Score |
|--------|-------------|-------------|-------------|
| Option A | ? | ? | ? |
| Option B | ? | ? | ? |

## Deliverable Format

The research output should include:
- [Specific document to create]
- [Sections required]
- [Recommendation format]
```

### Troubleshoot Template Additions

For Troubleshoot prompts, include these additional sections:

```markdown
## Hypothesis Table

| Hypothesis | Likelihood | Investigation Command | Expected if True |
|------------|------------|----------------------|------------------|
| [Cause 1] | High | `command here` | [Expected output] |
| [Cause 2] | Medium | `command here` | [Expected output] |

## Diagnostic Commands

Before implementation, run these diagnostics:
1. `[command]` → Expected: [output]
2. `[command]` → Expected: [output]
```
