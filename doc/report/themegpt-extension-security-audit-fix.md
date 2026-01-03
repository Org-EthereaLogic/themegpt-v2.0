# ThemeGPT Extension Security Audit and Fix Instructions

## Identified Issues Regarding Chrome Extension Policies

1. **Overly Broad Host Permissions:** The extension’s manifest currently requests access to all URLs (`"https://*/*"`). This broad permission is **not aligned with Google’s “least privilege” policy**, which mandates extensions should request the minimum access necessary. Since ThemeGPT’s functionality is limited to ChatGPT’s domains, the host permissions should be narrowed to those specific sites (e.g. `https://chat.openai.com/*` and related domains) instead of every website. Failing to restrict this can trigger Chrome Web Store warnings (the install dialog will say the extension can “Read and change data on all websites”) and may be flagged during review for unnecessary access. Reducing the host scope to only ChatGPT (and any required API endpoints) will make the extension compliant with Chrome’s recent permission guidelines and reassure users that it isn’t accessing unrelated sites.

2. **Inclusion of Localhost in Allowed Origins:** The manifest and background script include `http://localhost:3000` in the externally_connectable allowed origins. This was likely added for development and testing, but leaving a localhost origin in a production extension is not recommended. While `localhost` is generally only accessible on a developer’s machine, **Google’s policies advise removing development backdoors or test URLs** in production builds. An attacker could potentially run a service on a user's machine at that port to send messages to the extension (since the extension would trust that origin). To be safe, the extension should **drop or conditionally compile out** the localhost origin from `externally_connectable.matches` before release. The only permitted external origins should be the official ThemeGPT web app domains (e.g. `themegpt.app`) which are needed for OAuth and subscription messaging. Removing unnecessary origins ensures compliance with Google’s **authorized domains** rules and minimizes potential abuse vectors.

3. **Permission and Manifest Declarations (Manifest V3 Compliance):** The extension is built with Manifest V3 (evidenced by the use of the `host_permissions` field and a background service worker), which is good because Chrome now **requires Manifest V3** for new extensions. However, we should ensure all required permissions are explicitly declared:
   - The code uses the Chrome Storage API (via the Plasmo `Storage` wrapper), which typically requires the `"storage"` permission. The Plasmo framework automatically adds this permission, but it’s important to verify that the final manifest includes it. Explicitly declaring `"permissions": ["storage"]` would guarantee compliance with the **extension API permission declaration** policy.
   - No other special permissions (like `"activeTab"` or `"scripting"`) are used in this project, which is appropriate – the extension doesn’t request more powerful permissions than needed. We should maintain this minimal permissions approach. After removing the broad host access (point #1 above), the manifest’s remaining permissions should align exactly with extension functionality (e.g., access to ChatGPT pages, storage, and possibly connectivity to the ThemeGPT API domain).
   - Double-check the manifest has `"manifest_version": 3` set (Plasmo will handle this by default). Also verify that the background script is correctly registered as a service worker (which it is under Plasmo). These ensure compliance with Google’s **Manifest V3 migration** requirements (no persistent background page, etc.), which ThemeGPT already follows.

4. **User Data Privacy Compliance:** ThemeGPT is marketed as a privacy-first extension, and our code review confirms it does **not transmit or collect chat content or user input** – all ChatGPT page interactions (theme styling, token counting) happen locally in the browser. The only data sent externally is the subscription authentication token and minimal account info for verifying premium status, which is an expected part of the extension’s functionality. This implementation aligns with Chrome Web Store’s **User Data** and **Privacy** policies, as data collection is limited and transparently related to user features. A few recommendations to maintain full compliance:
   - Ensure the extension’s **Privacy Policy** (already created by the developer) explicitly covers the subscription flow data. For example, when the user connects their account, the extension receives an auth token and then fetches the user’s subscription status (email and plan info). This is used only to enable premium themes and is stored locally. The policy should state that the user’s email and subscription status are retrieved and stored locally for account purposes, and no ChatGPT content or personal data is collected or transmitted. Given that the README’s privacy pledge says *“No data leaves your browser”*, the code adheres to that pledge. We just need to ensure all such practices remain documented and truthful.
   - The extension provides a **disconnect** option that clears the auth token and any stored subscription data, which is a good practice for user control. Continue to support user ability to remove their data easily, in line with Google’s data minimization and user control guidelines.
   - No analytics or tracking scripts are present (and none should be added), which keeps the extension compliant with the **no unauthorized tracking** rule. We should maintain this stance – if telemetry is ever needed, it must be disclosed and user-consented, but currently the extension correctly avoids it.
   - As an extra precaution, avoid logging sensitive information to the console. The current code logs events (e.g., “[ThemeGPT] Auth token saved” or errors) but does not log the token value or user info, which is good. Continue to ensure that any debugging logs do not accidentally expose personal data, especially if the extension is run in a user’s developer mode.

Overall, aside from the host permission scope, the extension’s code is **clean and compliant** with Google’s recent Chrome extension security policies. It uses Manifest V3, does not execute remote code (only fetches data from its own backend over HTTPS), and respects user privacy by keeping all ChatGPT content local. The identified concerns above should be addressed to ensure a smooth review process and adherence to all relevant policies.

## Detailed Fix Instructions for the AI Coding Agent

Please implement the following changes in the **ThemeGPT-v2.0** codebase to address the policy issues identified:

1. **Restrict Host Permissions to Necessary Domains:**
   In the extension manifest (located in `apps/extension/package.json` under the `"manifest"` field), replace the wildcard host permission with specific host patterns. Currently it is:
   ```json
   "host_permissions": [
       "https://*/*"
   ],
````

Update this to only include the domains that ThemeGPT actually needs to operate on. For example:

```json
"host_permissions": [
    "https://chat.openai.com/*",
    "https://chatgpt.com/*"
],
```

If the extension needs to make network requests to your backend API, include that domain as well (for instance, if your API is hosted at `themegpt.app` or a specific subdomain/URL). This ensures the extension **only** has access to ChatGPT (and your API), complying with least-privilege principles. After this change, the extension will no longer request blanket access to all websites, satisfying Chrome Web Store requirements.

2. **Remove Unneeded Localhost Origin from Externally Connectable:**
   The manifest’s `externally_connectable.matches` array currently includes the development URL `http://localhost:3000/*`. This entry should be removed for the production build. Modify the manifest section to only list the real website origins, for example:

   ```json
   "externally_connectable": {
       "matches": [
         "https://themegpt.app/*",
         "https://*.themegpt.app/*"
       ]
   }
   ```

   and **omit the localhost entry**. Likewise, in the background script (`src/background.ts`), you can remove or conditionalize the `allowedOrigins` check for localhost so that only your actual domain(s) are trusted in production. This will prevent any external page other than your official site from communicating with the extension. Make sure to test that the OAuth/token exchange with **themegpt.app** still works after removing localhost. (For development, you can temporarily add localhost back or use a config flag, but it shouldn’t be present in the published extension manifest.)

3. **Verify and Declare Required Permissions:**
   Ensure the manifest explicitly declares any needed Chrome API permissions:

   * Add a `"permissions"` array if not already present. For example:

     ```json
     "permissions": [
       "storage"
     ],
     ```

     This will cover use of the chrome.storage API (used via Plasmo’s Storage). Plasmo usually injects this permission automatically, but explicitly listing it avoids any ambiguity and satisfies the Chrome Web Store that you’ve declared your use of storage. No other permissions (like tabs, scripting, etc.) seem necessary given the current code, so keep this list minimal.
   * Double-check that `"manifest_version": 3` is set in the final manifest (it should be, given Plasmo’s defaults). If it’s not visible in package.json, you may add it under the manifest section for completeness:

     ```json
     "manifest_version": 3,
     ```

     (Plasmo will merge this correctly during build.) This is just to explicitly align with Manifest V3 requirements.
   * After making these changes, rebuild the extension and inspect the generated `manifest.json` (in `build/chrome-mv3-prod` or similar) to ensure it now shows only the intended host permissions and the storage permission. The **permission warning** on installation should now indicate access only to the specified domains (e.g. “Read and change data on chat.openai.com”) instead of all sites.

4. **Maintain Privacy-by-Design in Code:**
   No major code changes are required for privacy, since the implementation is already compliant, but as a precaution:

   * Review the extension’s console logging and remove any debug logs that could reveal user data. For instance, it’s fine to log events like “token saved” or errors, but ensure no sensitive info (token string, user email, etc.) is printed. In the current code this looks okay – just be mindful of this if adding new logs.
   * Ensure that all data related to the user’s subscription (auth token, unlocked themes, email, etc.) continues to be stored locally (`chrome.storage.local`) and not sent anywhere except the ThemeGPT API endpoints. The current design does this (token and email are used only in `fetch` calls to your API and never to third parties), so keep this architecture. If any future feature requires sending any data off-device, remember to update the privacy policy and get user consent as required by Google’s policies.
   * It’s good to keep the “Disconnect” functionality intact (and perhaps clearly visible) so that users can revoke the extension’s access to their account easily. The current implementation clearing `authToken` and related data on disconnect is correct – ensure this remains in place and consider testing it once to confirm no residual data is kept after disconnecting.

5. **Final Review and Testing:**
   After implementing the above changes, run `pnpm build` (or `plasmo build`) to generate the production extension package. **Test the extension** in Chrome **before submitting**:

   * Install it as an unpacked extension and verify that it still functions: the theme customization and token counter should work on ChatGPT, and the account connect flow should still succeed (try logging in and applying a premium theme to confirm the API calls go through).
   * Go to `chrome://extensions`, find ThemeGPT, and check the “Site access” section. It should now list only the ChatGPT site (and your API domain if applicable), not “all sites”. Also, no extra warnings about permissions should appear.
   * Ensure that no errors appear in the extension background console or content script console related to permissions. For example, the content scripts should still load on the chat.openai.com pages (since we explicitly allowed that domain), and the background/service worker should be able to `fetch` your API (if you included the API host in host_permissions or if CORS is open – make sure the calls are succeeding).

By making these changes, the ThemeGPT extension will adhere to Google’s latest Chrome extension security policies. It will **limit its access** strictly to what’s necessary, clearly declare its permissions, and maintain its privacy-first promise. This will help avoid any compliance issues during Chrome Web Store review and ensure user trust in the extension.
