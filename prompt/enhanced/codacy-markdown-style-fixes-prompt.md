# Codacy Markdown Style Fixes - AI Agent Prompt

## Objective

Apply Markdown formatting fixes across the ThemeGPT v2.0 repository to resolve style issues identified by Codacy static analysis. The fixes ensure consistent blank line formatting before list items, particularly after headings.

---

## Problem Description

Codacy detected Markdown formatting violations in documentation files. The issues fall into one primary category:

### Missing Blank Lines Before List Items

According to Markdown best practices (and most linters like markdownlint), list items following headings require a blank line between them. This improves readability and ensures consistent rendering across different Markdown parsers.

### Current Pattern (Incorrect)

```markdown
### Heading Title
- List item immediately after heading
```

### Expected Pattern (Correct)

```markdown
### Heading Title

- List item with blank line after heading
```

---

## Affected Files and Locations

The following files require fixes. Each entry specifies the file path, line numbers, and the specific patterns to correct.

### 1. `.claude/agents/nodejs-expert.md`

| Line | Current | Fix |
|------|---------|-----|
| 64 | `-- Multiple team...` after text | Add blank line before list item |
| 71-72 | `### Asynchronous Programming` followed by `- Master async/await...` | Add blank line between heading and list |
| 78-79 | `### Event-Driven Architecture` followed by `- Design systems...` | Add blank line between heading and list |
| 84-85 | `### Streams and Data Handling` followed by `- Implement readable...` | Add blank line between heading and list |
| 90-91 | `### Express.js and API Development` followed by `- Build RESTful APIs...` | Add blank line between heading and list |
| 97-98 | `### Performance Optimization` followed by `- Profile applications...` | Add blank line between heading and list |
| 105-106 | `### Security Best Practices` followed by `- Validate and sanitize...` | Add blank line between heading and list |
| 114-115 | `### Code Quality and Testing` followed by `- Write comprehensive...` | Add blank line between heading and list |
| 122-123 | `### Dependency Management` followed by `- Keep dependencies...` | Add blank line between heading and list |
| 155 | `- Include complete...` after text | Add blank line before list item |
| 164 | `- Identify performance...` after text | Add blank line before list item |
| 172 | `- Ask for relevant...` after text | Add blank line before list item |

### 2. `.claude/agents/bash-expert.md`

| Line | Current | Fix |
|------|---------|-----|
| 57 | `- A script does more...` after text | Add blank line before list item |
| 62 | `- It's a single workflow...` after text | Add blank line before list item |
| 111 | `### Argument Parsing` followed by code block | Add blank line after heading |
| 156 | `### Logging Infrastructure` followed by code block | Add blank line after heading |
| 175 | `### Safe Temporary Resources` followed by code block | Add blank line after heading |
| 182 | `### Idempotent Operations` followed by code block | Add blank line after heading |
| 248 | `### Safe File Reading` followed by code block | Add blank line after heading |
| 255 | `### Safe Subprocess Orchestration` followed by code block | Add blank line after heading |
| 260 | `### Version Checking` followed by code block | Add blank line after heading |
| 270 | `### Command Availability Check` followed by code block | Add blank line after heading |
| 307 | `1. The complete script...` after text | Add blank line before list item |

### 3. `.claude/agents/typescript-expert.md`

| Line | Current | Fix |
|------|---------|-----|
| 56 | `- The same type pattern...` after text | Add blank line before list item |
| 61 | `- "For flexibility"...` after text | Add blank line before list item |
| 67-68 | `### Type System Mastery` followed by `- **Strict Type Safety**...` | Add blank line between heading and list |
| 75-76 | `### Async Excellence` followed by `- **Async/Await**...` | Add blank line between heading and list |
| 80-81 | `### Module Architecture` followed by `- **Import/Export**...` | Add blank line between heading and list |
| 87-88 | `### When Writing Code` followed by `1. Start with...` | Add blank line between heading and list |
| 95-96 | `### When Refactoring` followed by `1. Identify...` | Add blank line between heading and list |
| 103-104 | `### When Reviewing` followed by `1. Verify zero...` | Add blank line between heading and list |
| 113-114 | `### Must Pass` followed by `- Zero TypeScript...` | Add blank line between heading and list |
| 120-121 | `### Best Practices` followed by `- Prefer interface...` | Add blank line between heading and list |
| 131 | `1. Include complete...` after text | Add blank line before list item |
| 138 | `1. List type safety...` after text | Add blank line before list item |
| 146 | `1. **Type Safety**...` after text | Add blank line before list item |

### 4. `.claude/agents/tech-docs-specialist.md`

| Line | Current | Fix |
|------|---------|-----|
| 68 | `### Documentation Creation` followed by text | Add blank line after heading |
| 70 | `- **API Documentation**...` after text | Add blank line before list item |
| 77 | `### Audience Adaptation` followed by text | Add blank line after heading |
| 79 | `- **For Developers**...` after text | Add blank line before list item |
| 84 | `### Information Gathering Process` followed by text | Add blank line after heading |
| 86 | `1. Analyze source code...` after text | Add blank line before list item |
| 94-95 | `### Structure & Formatting` followed by `- Use consistent...` | Add blank line between heading and list |
| 101-102 | `### Content Requirements` followed by `- Define all...` | Add blank line between heading and list |
| 109-110 | `### Code Examples` followed by `- Ensure all...` | Add blank line between heading and list |
| 119 | `- [ ] Technical accuracy...` after text | Add blank line before list item |
| 163 | `### For Brand-Specific Projects` followed by text | Add blank line after heading |
| 165 | `- Adhere to brand...` after text | Add blank line before list item |
| 169 | `### For API Documentation` followed by text | Add blank line after heading |
| 171 | `- Include authentication...` after text | Add blank line before list item |
| 177-178 | `### For User-Facing Documentation` followed by `- Start with...` | Add blank line between heading and list |

### 5. `AGENTS.md`

| Line | Current | Fix |
|------|---------|-----|
| 135 | `- What problem this solves` after text | Add blank line before list item |

### 6. `DIRECTIVES.md`

| Line | Current | Fix |
|------|---------|-----|
| 17 | Table row alignment (cosmetic) | N/A - table formatting |
| 22 | Table row alignment (cosmetic) | N/A - table formatting |
| 188 | `1. What specific problem...` after text | Add blank line before list item |

### 7. `doc/dev/SYNTHAI_PROJECT_ARCHAEOLOGY.md`

| Line | Current | Fix |
|------|---------|-----|
| 8 | `- The original minimal goal` after text | Add blank line before list item |
| 75 | `- Provider adapter pattern...` after text | Add blank line before list item |
| 83 | `- "Six-Stage Review Pipeline..."` after text | Add blank line before list item |
| 93 | `- Full SDLC orchestration...` after text | Add blank line before list item |
| 107 | `- Consolidated Adaptive Plan...` after text | Add blank line before list item |
| 139 | `- cap_generator.py...` after text | Add blank line before list item |
| 150 | `- "Validate QCE/CRE..."` after text | Add blank line before list item |
| 156 | `- metrics_tracker.py...` after text | Add blank line before list item |
| 190 | `- base_adapter.py...` after text | Add blank line before list item |
| 259 | `- A simple multi-step...` after text | Add blank line before list item |

### 8. `asset/README.md`

| Line | Current | Fix |
|------|---------|-----|
| 35 | `### Full Logo (with wordmark)` followed by table | Add blank line after heading |
| 51 | `### Mascot Only (no wordmark)` followed by text | Add blank line after heading |
| 71 | `### HTML Implementation` followed by code block | Add blank line after heading |
| 83 | `### Web Manifest...` followed by code block | Add blank line after heading |
| 116 | `### Meta Tags` followed by code block | Add blank line after heading |
| 132 | `### Full Logo Variants` followed by table | Add blank line after heading |
| 140 | `### Mascot-Only Variants` followed by table | Add blank line after heading |
| 152 | `### For Website Header` followed by text | Add blank line after heading |
| 155 | `### For Browser Tab` followed by text | Add blank line after heading |
| 158 | `### For Social Sharing` followed by text | Add blank line after heading |
| 161 | `### For App Stores / Extensions` followed by list | Add blank line after heading |
| 162 | `- Chrome Web Store...` after text | Add blank line before list item |
| 165 | `### For Dark Mode` followed by text | Add blank line after heading |

### 9. `prompt/enhanced/themegpt-extension-fix-prompt.md`

| Line | Current | Fix |
|------|---------|-----|
| 36 | `- \`tailwindcss\`` after text | Add blank line before list item |
| 220 | `- Create stub/placeholder...` after text | Add blank line before list item |

---

## Implementation Instructions

### Step 1: Create a New Branch

```bash
git checkout -b fix/codacy-markdown-style-issues
```

### Step 2: Apply Fixes

For each file listed above, apply the formatting fix pattern:

**Before:**

```markdown
### Some Heading
- First list item
- Second list item
```

**After:**

```markdown
### Some Heading

- First list item
- Second list item
```

**Before (numbered list):**

```markdown
When providing code:
1. Include complete type definitions
2. Add brief inline comments
```

**After (numbered list):**

```markdown
When providing code:

1. Include complete type definitions
2. Add brief inline comments
```

### Step 3: Verify Fixes

After making changes, verify no new issues are introduced:

```bash
# Check for any remaining issues with markdownlint (if available)
npx markdownlint-cli2 "**/*.md" --fix

# Or manually verify blank lines exist after headings and before lists
grep -rn "^###.*$" --include="*.md" | head -20
```

### Step 4: Commit Changes

```bash
git add -A
git commit -m "style: fix markdown formatting issues per Codacy analysis

- Add blank lines between headings and list items
- Ensure consistent markdown formatting across documentation
- Affected files: agent definitions, AGENTS.md, DIRECTIVES.md, 
  SYNTHAI_PROJECT_ARCHAEOLOGY.md, asset/README.md, prompt docs"
```

### Step 5: Push and Create PR

```bash
git push -u origin fix/codacy-markdown-style-issues
```

Create a pull request with:

- **Title:** `style: Fix Codacy markdown formatting issues`
- **Description:** Fixes blank line formatting between headings and list items across documentation files

---

## Acceptance Criteria

- [ ] All files listed above have been updated
- [ ] Every heading followed by a list has a blank line between them
- [ ] Every paragraph followed by a list has a blank line between them
- [ ] No new markdown linting errors are introduced
- [ ] Files remain readable and properly formatted
- [ ] Changes are committed on a separate branch
- [ ] Pull request is created for review

---

## Notes

### Why These Fixes Matter

1. **Consistency**: Uniform formatting makes documentation easier to maintain
2. **Parser Compatibility**: Some Markdown parsers require blank lines for proper list rendering
3. **Readability**: Visual separation improves document scanning
4. **CI/CD Compliance**: Codacy checks will pass, keeping the repo clean

### Files NOT Requiring Changes

The following file has table formatting issues flagged but no action needed:

- `DIRECTIVES.md` lines 17, 22 - These are table alignment issues that are cosmetic only

### Edge Cases

Some headings are followed by code blocks rather than lists. The same rule applies—ensure a blank line exists between the heading and the code fence:

````markdown
### Heading

```bash
code here
```
````

---

## Summary

This prompt provides a complete specification for fixing Markdown style issues identified by Codacy. The changes are purely cosmetic formatting improvements that add blank lines where required by Markdown best practices. No content changes are needed—only whitespace adjustments.

**Total Files to Modify:** 9
**Estimated Time:** 15-30 minutes
**Risk Level:** Low (formatting only, no logic changes)
