# Fix: Cloud Run Origin Rejected by Extension Background Script

**Date:** 2026-01-30
**Prompt Level:** Level 3 (Task Execution)
**Complexity:** Simple (single file, ~3 lines changed)
**Status:** Enhanced & Ready for Execution

---

## Source Prompt

> I have uploaded the Chrome dash mv3 prod extension to my Google Chrome. I used the link (https://theme-gpt-web-dufb63uofq-uc.a.run.app/auth/extension) you provided for testing.
>
> Unfortunately, as you can see in the attached image, the error is still present. Also, prior to testing I Committed and pushed all changes to origin/main. Added the enhanced debug prompt doc and allowed *.a.run.app in the extension's externally connectable hosts.
>
> Updated package.json to include https://*.a.run.app/* in externally_connectable.matches.
> Added 001-debug-extension-connection-failure.md.
> Tests not run (not requested).
>
> Note: GitHub reports 7 Dependabot vulnerabilities on the default branch.

---

## Prompt Classification & Core Intent

**Type:** Fix/Debug
**Core Intent (1 sentence):** Fix extension connection failure by adding Cloud Run origin to the background script's `allowedOrigins` validation, which currently rejects messages from `*.a.run.app` despite the manifest allowing them.

**Scope (In):**
- Background script origin validation logic
- Cloud Run testing URL support

**Scope (Out):**
- Dependabot vulnerability remediation (7 reported)
- Chrome Web Store listing updates
- Production domain configuration
- OAuth provider setup

---

## Success Criteria

Upon completion:
- Extension responds to messages from `https://theme-gpt-web-dufb63uofq-uc.a.run.app`
- `themegpt-ping` message returns `{ success: true, installed: true }`
- Auth flow completes without "Untrusted origin" error
- Build succeeds without TypeScript errors

---

## Technical Context

### Root Cause Identified

The extension uses **two layers** of origin validation:

1. **Manifest layer** (`externally_connectable.matches` in `package.json`):
   - Controls which origins can call `chrome.runtime.sendMessage(extensionId, ...)`
   - Currently includes `https://*.a.run.app/*` ✓

2. **Application layer** (`allowedOrigins` in `background.ts`):
   - Additional validation inside `onMessageExternal` listener
   - Currently **only** includes `themegpt.ai` domains ✗

When the Cloud Run URL sends a message, Chrome delivers it to the extension (manifest allows it), but `background.ts` rejects it with `"Untrusted origin"` because the sender's origin doesn't match the hardcoded list.

**Solution:** Add the Cloud Run origin pattern to the `allowedOrigins` array in [apps/extension/src/background.ts](apps/extension/src/background.ts#L17-L20).

---

## Problem-State Table

| Aspect | Current State | Target State |
|--------|---------------|--------------|
| Manifest `externally_connectable` | Includes `*.a.run.app` | No change needed |
| `background.ts` `allowedOrigins` | Only `themegpt.ai` domains | Includes Cloud Run origin |
| Message from Cloud Run | Returns `"Untrusted origin"` | Returns `{ success: true }` |
| Auth flow | Fails with error | Completes successfully |

---

## Pre-Flight Checks

1. **Verify the current allowedOrigins array:**
   ```bash
   grep -A 5 "allowedOrigins" apps/extension/src/background.ts
   ```
   *Expected:* Array contains only `themegpt.ai` domains

2. **Confirm manifest already allows Cloud Run:**
   ```bash
   grep -A 10 "externally_connectable" apps/extension/package.json
   ```
   *Expected:* `"https://*.a.run.app/*"` is present in `matches`

---

## Instructions

### Phase 1: Implementation

1. **Update the allowedOrigins array in background.ts:**

   Open [apps/extension/src/background.ts](apps/extension/src/background.ts#L17-L20) and add the Cloud Run origin to the validation list.

   **Before:**
   ```typescript
   const allowedOrigins = [
     "https://themegpt.ai",
     "https://www.themegpt.ai"
   ]
   ```

   **After:**
   ```typescript
   const allowedOrigins = [
     "https://themegpt.ai",
     "https://www.themegpt.ai",
     "https://theme-gpt-web-dufb63uofq-uc.a.run.app"
   ]
   ```

   *Success: File saved without syntax errors*

### Phase 2: Verification

2. **Build the extension:**
   ```bash
   cd /Users/etherealogic/Dev/themegpt-v2.0 && pnpm --filter extension build
   ```
   *Success: Build completes with exit code 0, no TypeScript errors*

3. **Reload extension in Chrome:**
   - Navigate to `chrome://extensions/`
   - Find ThemeGPT extension
   - Click the refresh/reload button

   *Success: Extension reloads without errors*

4. **Test the auth flow:**
   - Navigate to `https://theme-gpt-web-dufb63uofq-uc.a.run.app/auth/extension`
   - Attempt to connect the extension
   - Check browser console for messaging results

   *Success: No "Untrusted origin" error; extension responds with success*

### Phase 3: Security

5. **Run Snyk security scan:**

   Execute `snyk_code_scan` on the modified file.

   *Success: No new security issues introduced*

---

## Guardrails

<guardrails>
- **Forbidden:** Adding wildcard origins like `https://*.a.run.app` (security risk)
- **Forbidden:** Removing production `themegpt.ai` domains
- **Forbidden:** Modifying the auth token storage logic
- **Required:** Use exact origin match (not URL patterns)
- **Budget:** < 5 lines changed
</guardrails>

---

## Verification Checklist

- [ ] `allowedOrigins` includes Cloud Run origin
- [ ] Build succeeds without errors
- [ ] Extension reloads in Chrome
- [ ] Auth flow from Cloud Run URL works
- [ ] Snyk scan passes

---

## Error Handling

| Error Condition | Resolution |
|-----------------|------------|
| Build fails with TypeScript error | Check for trailing comma or quote issues |
| Still getting "Untrusted origin" | Verify the exact origin URL matches (no trailing slash) |
| Extension doesn't reload | Hard refresh: disable and re-enable extension |
| Different Cloud Run URL | Update the origin to match actual deployment URL |

---

## Out of Scope

- Dependabot vulnerabilities (7 reported) — separate remediation task
- Adding localhost for development — removed per security audit
- Wildcard origin matching — security risk, use exact origins
- Web app code changes — only extension background script needs update
- Chrome Web Store republishing — test first, then deploy

---

## Alternative Solutions

1. **Environment-based origins:** If multiple Cloud Run URLs exist, consider a build-time injection of allowed origins based on environment (adds complexity, not recommended for 1 URL).

2. **Origin pattern matching:** Could use regex to match `*.a.run.app`, but this is less secure than explicit origins. Only use if deployment URLs change frequently.

3. **Remove application-layer validation:** Rely solely on manifest `externally_connectable`. Not recommended—defense in depth is better.

---

## Report Format

Upon completion, provide:

1. **Root cause confirmed:** Background script `allowedOrigins` missing Cloud Run origin
2. **Fix applied:** Added `"https://theme-gpt-web-dufb63uofq-uc.a.run.app"` to allowedOrigins array
3. **Files modified:** `apps/extension/src/background.ts` (~1 line)
4. **Build status:** Pass/Fail
5. **Auth test result:** Success/Failure with details
6. **Security scan:** Snyk pass/fail
