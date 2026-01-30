# Fix: ThemeGPT Extension Connection Failures (Multiple Error States)

**Date:** 2026-01-30
**Prompt Level:** Level 3 (Task Execution)
**Complexity:** Moderate (2-3 files, requires investigation + verification)
**Status:** Enhanced & Ready for Execution

---

## Source Prompt

> I have attached 2 images. In the first image appeared after attempting to connect the themeGPT extension. Although I have downloaded the themeGPT extension. The message says that I have not. In the second image, this message appears when I tried to connect the themeGPT extension using the anthony.johnsonii@etherealogic.ai. Please investigate and help me resolve this issue.

---

## Prompt Classification & Core Intent

**Type:** Fix/Debug
**Core Intent (1 sentence):** Debug why ThemeGPT extension shows "not downloaded" despite being installed, and why connecting with anthony.johnsonii@etherealogic.ai fails with an unspecified error.

**Scope (In):**
- Extension installation detection logic
- OAuth/email connection flow
- Account creation and linking
- Browser extension communication with web app

**Scope (Out):**
- Payment/subscription processing (separate system)
- General Google/GitHub OAuth setup (assumed working)
- Chrome Web Store listing or deployment

---

## Success Criteria

Upon completion:
- Extension detection correctly identifies installed extension
- OAuth flow succeeds with anthony.johnsonii@etherealogic.ai account
- User can retrieve connection token without errors
- Token successfully validates in extension popup
- Account status displays accurate subscription info

---

## Technical Context

### Extension Architecture

The ThemeGPT extension uses a **split authentication model:**

1. **Web App** (`apps/web/`) - OAuth via Google/GitHub + Session management
   - Creates user records in Firestore (`/users` collection)
   - Issues JWT tokens via `/api/extension/auth`
   - Stores subscriptions in Firestore (`/subscriptions` collection)

2. **Extension** (`apps/extension/`) - Token-based verification
   - Popup interface with "Connect" button
   - Opens `/auth/extension` page to retrieve token
   - Stores token in browser local storage (Plasmo `Storage` API)
   - Polls `/api/extension/status` to verify subscription

### Key Detection Points

**Detection 1: Extension Installation** (`apps/web/app/success/page.tsx`)
```typescript
async function checkExtensionInstalled(): Promise<boolean> {
  // Uses Chrome extension messaging API to detect EXTENSION_ID
  const EXTENSION_ID = "dlphknialdlpmcgoknkcmapmclgckhba"
  try {
    const response = await chrome.runtime.sendMessage(EXTENSION_ID, { check: true })
    return response?.success === true
  } catch {
    return false
  }
}
```

**Detection 2: Auth Token Presence** (`apps/web/app/success/page.tsx`)
```typescript
async function checkExtensionAuthStatus(): Promise<boolean> {
  // Checks if extension already has a valid token stored
  return await chrome.storage.local.get("authToken").then(result => !!result.authToken)
}
```

### Critical Auth Flow Sequence

1. User clicks "Connect Account" in extension popup
2. Extension calls `window.open('/auth/extension', '_blank')`
3. User authenticates via Google/GitHub on web app
4. Web app redirects to `/success` page
5. `/success` detects extension installation
6. Shows "Connect Now" button that calls `/api/extension/auth`
7. `/api/extension/auth` returns JWT token
8. User copies token back to extension popup
9. Extension stores token and fetches account status

---

## Problem-State Table

| Aspect | Current State (Error) | Target State (Working) |
|--------|----------------------|------------------------|
| **Extension Detection** | Shows "not downloaded" error despite installed | Correctly detects extension, shows connection button |
| **Email Connection** | anthony.johnsonii@etherealogic.ai fails [specific error unknown] | Email successfully authenticates and creates user record |
| **Token Generation** | Auth endpoint may not be receiving authenticated session | `/api/extension/auth` returns valid JWT within 30 seconds |
| **Account Status** | Extension shows "not connected" or error state | Extension displays email + subscription status |
| **Flow Completion** | User stuck at error state, cannot proceed | User can download premium themes after connecting |

---

## Pre-Flight Checks

Before starting investigation, verify prerequisites:

1. **Extension is installed in Chrome:**
   ```bash
   echo "Open Chrome and visit: chrome://extensions/"
   echo "Search for 'ThemeGPT' and verify it's enabled"
   echo "Copy Extension ID from details panel"
   ```
   *Expected:* ThemeGPT extension visible and enabled

2. **Extension ID matches hardcoded value:**
   ```bash
   grep -n "dlphknialdlpmcgoknkcmapmclgckhba" apps/web/app/success/page.tsx
   ```
   *Expected:* Extension ID appears in checkExtensionInstalled function

3. **Web app is running locally or accessible:**
   ```bash
   echo "Verify: http://localhost:3000/success (dev) or https://themegpt.ai/success (prod)"
   ```
   *Expected:* Success page loads without 404

4. **Firebase user collection exists:**
   ```bash
   echo "Check Firebase Console > users collection"
   ```
   *Expected:* Firestore has /users collection with user documents

---

## Root Cause Hypotheses

| Hypothesis | Likelihood | Investigation | Expected Evidence |
|------------|------------|-----------------|-------------------|
| **H1: Extension ID mismatch** | HIGH | Check hardcoded ID vs. actual installed ID in chrome://extensions | ID mismatch in logs or different ID in code |
| **H2: Chrome messaging disabled** | HIGH | Test chrome.runtime.sendMessage() in console | sendMessage blocked or returns error |
| **H3: Email not whitelisted/created** | MEDIUM | Query Firestore for anthony.johnsonii@etherealogic.ai | User doc exists but missing subscription link |
| **H4: OAuth provider not configured** | MEDIUM | Check env vars GOOGLE_CLIENT_ID, GITHUB_CLIENT_ID | Missing or invalid credentials in .env.local |
| **H5: CORS policy blocking auth** | MEDIUM | Check browser console for CORS errors | Cross-origin request blocked |
| **H6: Session lost between auth and token generation** | MEDIUM | Check NextAuth session duration | Session expires before /api/extension/auth called |

---

## Investigation Phase (Steps 1-6)

### Step 1: Capture and Document Error Messages

**Action:** Retrieve the exact error text from both error images

- Take screenshots of the error messages
- Record the exact wording, error codes, or HTTP status
- Note the URL shown in the browser address bar
- Check browser DevTools Console for JavaScript errors

*Success: You have documented exact error messages in text format*

### Step 2: Verify Extension Installation & ID

**Action:** Confirm the installed extension ID matches the hardcoded value

```bash
# Step 2a: Display the hardcoded extension ID in code
grep -A 2 "EXTENSION_ID = " apps/web/app/success/page.tsx

# Step 2b: Open Chrome and navigate to extensions page
# chrome://extensions/ (copy the Extension ID for ThemeGPT)

# Step 2c: Note both IDs and compare
echo "Hardcoded ID: dlphknialdlpmcgoknkcmapmclgckhba"
echo "Installed ID: [copy from chrome://extensions]"
```

*Success: IDs match exactly OR mismatch is identified*

### Step 3: Test Extension Messaging in Browser Console

**Action:** Verify Chrome extension messaging works from web app context

```javascript
// In browser console on success/auth pages:
const EXTENSION_ID = "dlphknialdlpmcgoknkcmapmclgckhba";
chrome.runtime.sendMessage(EXTENSION_ID, { check: true }, (response) => {
  console.log("Extension message response:", response);
  if (chrome.runtime.lastError) {
    console.error("Chrome error:", chrome.runtime.lastError.message);
  }
});
```

*Success: Console shows `{ success: true }` without errors*

### Step 4: Check Authentication Status

**Action:** Verify user account anthony.johnsonii@etherealogic.ai exists and is properly configured

**Via Firebase Console:**
1. Navigate to Firebase Console > Firestore Database
2. Open `/users` collection
3. Search for email = `anthony.johnsonii@etherealogic.ai`
4. Check fields: `email`, `provider`, `providerId`, `createdAt`

*Success: User document exists with all required fields*

**Via Backend Log (if available):**
```bash
# Check web app logs for signIn callback
grep -i "anthony.johnsonii" logs/web-app.log
grep -i "Error in signIn callback" logs/web-app.log
```

*Success: No authentication errors for this user*

### Step 5: Verify OAuth Configuration

**Action:** Confirm Google/GitHub OAuth credentials are set in environment

```bash
# Check local environment file
grep -E "GOOGLE_CLIENT|GITHUB_CLIENT|NEXTAUTH" apps/web/.env.local

# Verify all required OAuth env vars are present
test -n "$GOOGLE_CLIENT_ID" && echo "✓ GOOGLE_CLIENT_ID set" || echo "✗ GOOGLE_CLIENT_ID missing"
test -n "$GOOGLE_CLIENT_SECRET" && echo "✓ GOOGLE_CLIENT_SECRET set" || echo "✗ GOOGLE_CLIENT_SECRET missing"
```

*Success: All OAuth credentials are present and non-empty*

### Step 6: Test Token Generation Flow

**Action:** Attempt to manually trigger auth flow and capture token generation response

```bash
# Step 6a: Start the web app in development mode
cd /Users/etherealogic/Dev/themegpt-v2.0
pnpm dev

# Step 6b: Navigate to http://localhost:3000/login
# Step 6c: Authenticate with anthony.johnsonii@etherealogic.ai (Google/GitHub)
# Step 6d: After redirect to /success, open browser DevTools Network tab
# Step 6e: Click "Connect Now" button
# Step 6f: Inspect the POST request to /api/extension/auth
# Look for response: { success: true, token: "eyJ...", user: {...} }
```

*Success: `/api/extension/auth` returns HTTP 200 with valid JWT token and user email*

---

## Root Cause Determination

Based on investigation results, identify the primary issue:

| Evidence Pattern | Root Cause | Fix Category |
|------------------|-----------|--------------|
| Extension ID mismatch (H1) | Hardcoded ID is outdated | Code Update |
| chrome.runtime.sendMessage fails (H2) | Extension not responding | Extension Issue |
| User doc missing (H3) | Registration failed silently | Data Cleanup + Retry |
| OAuth creds missing (H4) | Environment not configured | Environment Setup |
| CORS error in console (H5) | Origin not whitelisted | Server Config |
| Auth endpoint 401/403 (H6) | Session invalid or expired | Auth Flow Debug |

---

## Implementation Phase (Steps 7-10)

### Step 7: Apply Root Cause Fix

**If Extension ID Mismatch (H1):**
- Update the hardcoded ID in [apps/web/app/success/page.tsx](apps/web/app/success/page.tsx#L8)
- Ensure new ID matches chrome://extensions exactly
- Rebuild web app: `pnpm build`

**If Chrome Messaging Disabled (H2):**
- Verify extension manifest includes `"host_permissions": ["https://themegpt.ai/*"]`
- Check extension popup for permission errors
- Clear extension and reinstall from Chrome Web Store or dev build

**If User Registration Failed (H3):**
- Manually create user in Firestore `/users` collection with:
  ```json
  {
    "email": "anthony.johnsonii@etherealogic.ai",
    "provider": "google", // or "github"
    "providerId": "[provider-specific-id]",
    "name": "[user-name]",
    "createdAt": Timestamp.now(),
    "updatedAt": Timestamp.now()
  }
  ```
- Trigger re-authentication flow

**If OAuth Not Configured (H4):**
- Obtain credentials from Google Cloud Console / GitHub
- Add to `.env.local`:
  ```env
  GOOGLE_CLIENT_ID=...
  GOOGLE_CLIENT_SECRET=...
  NEXTAUTH_SECRET=...
  ```
- Restart dev server

**If CORS Error (H5):**
- Check [apps/web/app/api/extension/auth/route.ts](apps/web/app/api/extension/auth/route.ts#L8-L13)
- Verify `getAllowedOrigin()` returns correct domain
- Add extension URL to `Access-Control-Allow-Origin` if needed

**If Session Invalid (H6):**
- Check NextAuth session duration in [apps/web/lib/auth.ts](apps/web/lib/auth.ts#L35)
- Extend session timeout if needed
- Verify browser cookies are enabled

*Success: Applied targeted fix based on root cause*

### Step 8: Retry Connection Flow

**Action:** Attempt connection again with fixed code/config

```bash
# Clear browser cache and cookies for themegpt.ai
# Restart dev server if changes made: pnpm dev
# Re-open extension and click "Connect"
# Complete OAuth flow with anthony.johnsonii@etherealogic.ai
# Verify token appears in extension popup
```

*Success: Token successfully generated and stored in extension*

### Step 9: Verify Full Flow End-to-End

**Action:** Test complete scenario from connection to theme download

1. **Extension shows "Connect"** → Click it
2. **Auth page opens** → Sign in with Google/GitHub
3. **Success page appears** → Shows "Extension connected!" message
4. **Token copied** → Pasted into extension (or auto-copied)
5. **Extension shows account** → Displays email + subscription status
6. **Premium themes visible** → Can attempt to download one

*Success: All steps complete without errors*

---

## Security Phase (Step 10)

### Step 10: Run Security Analysis

**Action:** Scan modified authentication code for vulnerabilities

```bash
# Activate Snyk security scanning
snyk auth  # Authenticate if needed

# Scan auth-related files
snyk code scan apps/web/app/api/extension/auth/route.ts
snyk code scan apps/web/lib/auth.ts
snyk code scan apps/extension/src/popup.tsx

# Check for secrets exposed
grep -rE "password|secret|token|key" --include="*.ts" --include="*.tsx" \
  apps/web/app/api/extension/ apps/web/lib/auth.ts | grep -v "encryption" | head -20
```

*Success: No new security issues found, no secrets exposed in code*

---

## Guardrails

- **Forbidden:** Adding new OAuth providers without explicit request
- **Forbidden:** Storing tokens in localStorage without expiration logic
- **Forbidden:** Hardcoding credentials in source code
- **Forbidden:** Modifying subscription/payment logic
- **Required:** All auth changes must pass Snyk security scan
- **Required:** Email validation must work with etherealogic.ai domain
- **Budget:** < 50 lines of code changes (unless data migration needed)

---

## Verification Checklist

- [ ] Error messages documented in text (not just images)
- [ ] Extension installation detected correctly
- [ ] Chrome messaging test succeeds in console
- [ ] User account exists in Firestore
- [ ] OAuth credentials configured in .env.local
- [ ] No CORS errors in browser console
- [ ] Token generation endpoint returns HTTP 200
- [ ] Token successfully stored in extension popup
- [ ] Account status displays email + subscription
- [ ] Premium themes accessible after connection
- [ ] Security scan passes with no new issues
- [ ] Full end-to-end flow tested without errors

---

## Error Handling & Fallbacks

| Error Condition | Immediate Resolution | Escalation |
|-----------------|----------------------|-----------|
| "Extension not detected" persists | Clear browser cache, hard-refresh page (Ctrl+Shift+R) | Check manifest.json permissions |
| OAuth redirect fails | Verify OAuth provider credentials in console | Contact OAuth provider support |
| Token endpoint 401 "Not authenticated" | Ensure session cookie set (check DevTools) | Verify NextAuth configuration |
| User email not found in Firestore | Check spelling of email address exactly | Manually create user record |
| CORS blocked in browser console | Add extension domain to CORS allowlist | Check server CORS middleware |
| Token stored but extension says "not connected" | Hard-refresh extension popup (Ctrl+R on popup) | Check token expiration logic |

---

## Out of Scope

- Implementing new OAuth providers
- Creating payment/checkout flow
- Migrating existing user data
- Changing extension permissions or capabilities
- Updating Chrome Web Store listing
- Modifying theme definitions or premium status

---

## Alternative Solutions

If primary troubleshooting doesn't resolve issues:

1. **Clear All Data & Restart:**
   - Uninstall extension from Chrome
   - Clear all Chrome cookies/cache for themegpt.ai
   - Reinstall extension fresh from Web Store
   - Attempt connection again

2. **Use Different OAuth Provider:**
   - If Google OAuth fails, try GitHub OAuth
   - If both fail, check provider configuration

3. **Manual Token Import:**
   - If OAuth flow times out, generate token via alternate API endpoint
   - Manually paste token in extension (already supported in UI)

4. **Check Browser Console Logs:**
   - Open extension popup DevTools: right-click popup > Inspect
   - Check console for detailed error messages
   - Capture full error stack traces

---

## Report Format

Upon completion, provide:

1. **Root cause identified:** [From hypothesis list or other]
2. **Primary error message:** [Exact text from error state]
3. **Fix applied:** [Code changes or config updates]
4. **Verification results:** [Did full flow work end-to-end?]
5. **Files modified:** [List with brief description]
6. **Security scan results:** [Snyk pass/fail]
7. **Outstanding issues:** [Any remaining gaps or follow-ups]

---

## Implementation Notes

- **Snyk Integration:** If any first-party code modified, run `snyk_code_scan` before submission
- **Testing:** Test with actual email account (anthony.johnsonii@etherealogic.ai) to ensure issue resolved
- **Documentation:** If new workaround discovered, document in troubleshooting guide
- **Timeline:** This should resolve within 30-45 minutes if root cause is environmental; up to 2 hours if code fix needed

