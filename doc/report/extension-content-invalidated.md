## Extension Content Script: "Extension context invalidated"

**Context:** ChatGPT content scripts (`token-counter`, `theme-injector`)

### Symptom
- Console error after extension reload/update while a ChatGPT tab is open:
  - `Error: Extension context invalidated`

### Why It Happens
- Content scripts can keep running briefly after the extension is reloaded/updated.
- Calls like `chrome.runtime.sendMessage(...)` can throw (or reject) once the extension context is gone.

### Fix Applied
- Add a lightweight guard (`isContextValid()`) and defensive `try/catch` around runtime messaging and storage watchers.
- When invalidation is detected, stop observers/watchers rather than continuing to run.

### Repro Steps
1. Open `https://chatgpt.com/` with the extension enabled.
2. Trigger activity (messages updating / token counter observing DOM).
3. Reload/update the extension while the tab remains open.
4. Observe invalidation errors without guards; observe clean shutdown with guards.

