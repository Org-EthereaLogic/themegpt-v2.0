---
agent: agent
---
# Prompt Enhancement Workflow (Workspace-Level)

**Date:** 2025-12-24
**Version:** 2.1
**Prompt Level:** Level 2 (Workflow Prompt)
**Purpose:** Transform vague or incomplete prompts into self-contained, executable plans an AI coding agent can execute without ambiguity.

---

## Workspace Applicability Contract

This is a **workspace-level** prompt enhancement workflow.

- It MUST NOT assume a specific repository, tech stack, package manager, or CI system.
- It MUST remain compatible with any workspace where it is deployed.
- It MAY assume the workspace’s **project root contains** `AGENTS.md` and `DIRECTIVES.md`.
  - Per your standard, these files are always located at the root of the project folder.
  - If either file is missing at the presumed root, the enhanced prompt MUST include a **blocking** pre-flight step that stops and asks the user to confirm the correct root folder.

---

## Inputs Consulted (Discovery Order)

When enhancing, discover and consult relevant workspace guidance in this order:

1. **Security / compliance rules (highest priority)**
   - `.github/instructions/**/*.md` (if present)
   - policy files (e.g., `.snyk`, `SECURITY.md`, org policy docs)
2. **Project operating rules**
   - `AGENTS.md` (expected at project root)
   - `DIRECTIVES.md` (expected at project root)
3. **Project context & conventions**
   - `README.md`, `CONTRIBUTING.md`, `docs/**`
   - build/test manifests (as applicable): `pyproject.toml`, `requirements*.txt`, `package.json`, `pom.xml`, `go.mod`, etc.
4. **Codebase reality**
   - existing patterns in adjacent files
   - project structure under the root

If some inputs don’t exist, proceed with what’s available and document the gap under **Assumptions**.

---

## Mission Statement

Given an ambiguous or high-level source prompt, produce a **self-contained, test-ready enhanced prompt** that an AI coding agent can execute step-by-step without further clarification.

---

## Prompt Type Classification

Classify the source prompt into one of these categories to apply the right template emphasis:

| Type | Indicators | Must Include |
|------|------------|--------------|
| **Fix/Debug** | “broken”, “error”, “regression”, stack trace | Root-cause hypotheses, reproduction, verification, fallbacks |
| **Feature** | “implement”, “add”, “create”, “build” | Current→Target table, acceptance criteria, phased instructions |
| **Research** | “investigate”, “evaluate”, “compare” | Criteria + weights, decision matrix, deliverable format |
| **Troubleshoot** | “diagnose”, “why”, “understand” | Hypothesis table, diagnostic commands, evidence plan |
| **Refactor** | “clean up”, “simplify”, “optimize” | Safety rails, regression tests, before/after goals |

---

## Complexity Classification Rubric

| Complexity | Typical Criteria | Instruction Count | Change Budget |
|------------|------------------|-------------------|--------------|
| **Simple** | 1 file, < ~50 LOC, no deps | 3–6 | ~50–100 LOC |
| **Moderate** | 2–5 files, existing patterns | 7–12 | ~100–300 LOC |
| **Complex** | 5+ files, integration, new patterns | 13–20 | ~300–500 LOC |

If the task is complex and underspecified, the enhanced prompt MUST split into phases with checkpoints.

---

## Workflow

### Phase 0: Confirm Project Root (Required)

1. Confirm `AGENTS.md` and `DIRECTIVES.md` exist at the workspace root.
   - Example check: `test -f AGENTS.md && test -f DIRECTIVES.md && echo "✓ project root confirmed"`
2. If they are not found, STOP and ask the user to confirm the correct root folder.

### Phase 1: Analyze Source Prompt

1. **Classify prompt type** (Fix/Feature/Research/Troubleshoot/Refactor).
2. **Extract the core intent** (one sentence).
3. **Define scope boundaries** (In scope / Out of scope).
4. **Identify success criteria** (measurable outcomes).
5. **Catalog missing details** that would block execution:
   - target file paths or directories
   - required tools/frameworks/dependencies
   - input/output formats
   - testing/verification steps
   - edge cases and error handling
6. **Assess complexity** (Simple/Moderate/Complex).

### Phase 2: Synthesize Workspace Constraints

7. Read `AGENTS.md`, `DIRECTIVES.md`, and any `.github/instructions/**/*.md` files.
8. Identify coding standards (naming, layout, forbidden practices).
9. Resolve conflicts with precedence: **security** > **project rules** > **general best practices**.
10. Summarize constraints as 5–10 bullets the enhanced prompt must respect.

### Phase 3: Draft Enhanced Prompt

11. Write a one-sentence **Mission Statement**.
12. Add **Technical Context** (why this approach works; what the agent must understand).
13. Create a **Problem–State Table** (Current vs Target).
14. Write **numbered, phased instructions**:
   - Investigation/Setup
   - Implementation
   - Verification
   - Security/Quality

Each instruction MUST be:
- atomic (one action)
- verifiable (includes an italic success signal)
- concrete (paths/commands where possible)

15. Add **Guardrails** (scope creep prevention, dependency policy, budgets).
16. Add **Pre-Flight Checks** (blocking prerequisites).
17. Add **Verification Checklist** (checkboxes).
18. Add **Error Handling Table** (error → resolution).
19. Add **Out of Scope**.
20. Add **Alternative Solutions** (required for Fix/Debug).

### Phase 4: Quality Check

21. Self-containment: executable with the prompt + workspace files.
22. Ambiguity: each instruction has one interpretation.
23. Tone: imperative, no hedging.
24. Minimalism: smallest safe change that meets success criteria.
25. Command audit: copy-pasteable commands; include expected outputs when helpful.

---

## Path & Command Policy (Workspace-Agnostic)

- Prefer **paths relative to project root**.
- Do NOT hard-code machine-specific absolute paths (e.g., `/Users/<name>/...`).
- If a tool requires an absolute path, derive it in-command (e.g., `ROOT="$PWD"; tool "$ROOT/path"`).
- If an exact file path is unknown, include a discovery step (search/list) and then reference the discovered path.

---

## Security / Quality Phase (Portable)

The enhanced prompt MUST include a Security/Quality phase that aligns with what the workspace supports:

- If a security scanner is configured (Snyk, CodeQL, etc.), run it.
- If not, run the project’s standard lint/typecheck/tests as available.

The enhanced prompt must specify the chosen commands explicitly based on files present in the repo (examples: `pytest`, `ruff check .`, `npm test`, `go test ./...`).

---

## Deliverables (Enhanced Prompt Must Contain)

1. Title
2. Date (YYYY-MM-DD)
3. Prompt Level (Level 2–5)
4. Prompt Type (Fix/Feature/Research/Troubleshoot/Refactor)
5. Complexity (Simple/Moderate/Complex + justification)
6. Inputs Consulted (what was actually read in THIS workspace)
7. Mission Statement
8. Technical Context
9. Problem–State Table
10. Pre-Flight Checks
11. Numbered Phased Instructions
12. Guardrails
13. Verification Checklist
14. Error Handling Table
15. Out of Scope
16. Alternative Solutions (required for Fix/Debug)
17. Report Format

---

## Report Format (When You Finish Enhancing)

1. Source prompt (verbatim)
2. Classification + complexity (with justification)
3. Key clarifications added
4. Assumptions made (explicitly labeled)
5. Enhanced prompt location
6. Verification plan (commands + success signals)
