# Refined & Actionable Prompt for AI Coding Agent

## Context & Problem Statement

The ThemeGPT v2.0 browser extension located in `apps/extension/` is in a broken intermediate state. A previous AI agent claimed to have completed styling and UI implementation, but verification of the actual repository files reveals that **none of the work was actually persisted**. The extension currently shows the default Plasmo boilerplate instead of the branded ThemeGPT UI.

---

## Current State (What's Broken)

| Component | Expected State | Actual State | Priority |
|-----------|---------------|--------------|----------|
| `package.json` | Contains `tailwindcss`, `postcss`, `autoprefixer` as devDependencies | Missing all Tailwind-related packages | 🔴 Critical |
| `tailwind.config.js` | Exists with ThemeGPT brand colors and fonts | File does not exist | 🔴 Critical |
| `postcss.config.js` | Exists with Tailwind/autoprefixer plugins | File does not exist | 🔴 Critical |
| `src/style.css` | Contains Tailwind directives and base styles | File does not exist | 🔴 Critical |
| `popup.tsx` | Contains branded UI with theme grid | Shows default "Welcome to Plasmo" boilerplate | 🔴 Critical |
| `README.md` | Contains logo image and branding | Has text but missing logo image | ⚠️ Minor |

---

## Required Actions (Execute in Order)

### Step 1: Install Dependencies

**Location:** `apps/extension/`

Run the following commands to install Tailwind CSS and its dependencies:

```bash
cd apps/extension
pnpm add -D tailwindcss@3 postcss autoprefixer
```

**Verification:** After running, confirm that `package.json` contains these in `devDependencies`:
- `tailwindcss`
- `postcss`
- `autoprefixer`

---

### Step 2: Create Tailwind Configuration

**Create file:** `apps/extension/tailwind.config.js`

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: "jit",
  content: ["./**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: "#FAF6F0",      // Cream background
          text: "#4B2E1E",    // Chocolate brown text
          peach: "#F4A988",   // Accent peach
          teal: "#7ECEC5",    // Active/success teal
          yellow: "#F5E6B8", // Highlight yellow
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        'bounce-short': 'bounce 1s infinite 3',
      }
    },
  },
  plugins: [],
}
```

---

### Step 3: Create PostCSS Configuration

**Create file:** `apps/extension/postcss.config.js`

```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

---

### Step 4: Create Global Stylesheet

**Create file:** `apps/extension/src/style.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  @apply bg-brand-bg text-brand-text w-[320px] h-[450px] overflow-hidden;
}

::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-thumb {
  @apply bg-brand-text/20 rounded-full;
}
```

---

### Step 5: Replace Popup UI Component

**Overwrite file:** `apps/extension/popup.tsx`

Replace the entire contents with the branded ThemeGPT popup:

```tsx
import { useState, useEffect } from "react"
import { Storage } from "@plasmohq/storage"
import { DEFAULT_THEMES, type Theme } from "@themegpt/shared"
import { TokenCounter } from "./src/components/TokenCounter"

import "./src/style.css"

// Fallback asset import
import mascotUrl from "url:./assets/icon.png"

const storage = new Storage({ area: "local" })

export default function Popup() {
  const [activeThemeId, setActiveThemeId] = useState<string>("system")

  useEffect(() => {
    storage.get<Theme>("activeTheme").then((t) => {
      if (t) setActiveThemeId(t.id)
    })
  }, [])

  const applyTheme = (theme: Theme) => {
    setActiveThemeId(theme.id)
    storage.set("activeTheme", theme)
  }

  return (
    <div className="flex flex-col h-full bg-brand-bg text-brand-text font-sans">
      {/* HEADER */}
      <header className="flex items-center gap-3 p-4 border-b border-brand-text/10 bg-white/50 backdrop-blur-sm sticky top-0 z-10">
        <img src={mascotUrl} alt="ThemeGPT" className="w-8 h-8" />
        <h1 className="text-lg font-bold tracking-tight">ThemeGPT</h1>
        <div className="ml-auto">
          <div className="w-2 h-2 rounded-full bg-brand-teal shadow-[0_0_8px_rgba(126,206,197,0.8)]" title="Active" />
        </div>
      </header>

      {/* THEME GRID */}
      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider opacity-60 mb-3">
            Free Themes
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {DEFAULT_THEMES.map((theme) => {
              const isActive = activeThemeId === theme.id
              return (
                <button
                  key={theme.id}
                  onClick={() => applyTheme(theme)}
                  className={`
                    group relative flex flex-col items-start p-3 rounded-xl border transition-all duration-200 text-left
                    ${isActive 
                      ? "border-brand-teal bg-white shadow-md ring-1 ring-brand-teal transform scale-[1.02]" 
                      : "border-transparent bg-white/40 hover:bg-white hover:shadow-sm"
                    }
                  `}
                >
                  <div className="w-full h-12 rounded-lg mb-2 border border-brand-text/5 overflow-hidden relative">
                     <div className="absolute inset-0" style={{ backgroundColor: theme.colors["--cgpt-bg"] || '#eee' }} />
                  </div>
                  <span className="text-sm font-medium truncate w-full">{theme.name}</span>
                </button>
              )
            })}
          </div>
        </div>
      </main>

      {/* TOKEN COUNTER & FOOTER */}
      <div className="bg-white/50 border-t border-brand-text/10">
        <div className="px-4 pb-2">
            <TokenCounter />
        </div>
        <footer className="p-3 text-center border-t border-brand-text/5">
            <a href="https://themegpt.ai" target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-brand-text/60 hover:text-brand-text">
            View Premium Catalog &rarr;
            </a>
        </footer>
      </div>
    </div>
  )
}
```

---

## Pre-Flight Checks Before Executing

Before writing files, the agent **must** verify:

1. **Workspace structure exists:** Confirm `apps/extension/` directory exists
2. **Check for existing files:** Read current `popup.tsx` to understand the base structure
3. **Verify dependencies exist:** Check if `@themegpt/shared` exports `DEFAULT_THEMES` and `Theme`
4. **Verify components exist:** Check if `src/components/TokenCounter.tsx` exists
5. **Verify assets exist:** Check if `assets/icon.png` exists

If any of these dependencies are missing, the agent should:
- Create stub/placeholder implementations
- Or report what additional files need to be created

---

## Post-Implementation Verification

After completing all steps, verify success by:

1. **Run build:** Execute `pnpm build` in `apps/extension/` — should complete without errors
2. **Check file existence:** Confirm all 4 new files exist:
   - `tailwind.config.js`
   - `postcss.config.js`
   - `src/style.css`
   - `popup.tsx` (updated)
3. **Verify dependencies:** Run `pnpm list tailwindcss` to confirm installation

---

## Error Handling

If you encounter errors:

| Error | Resolution |
|-------|------------|
| `@themegpt/shared` not found | Check monorepo structure; may need `pnpm install` at root |
| `TokenCounter` component missing | Create a placeholder component or remove the import |
| `assets/icon.png` missing | Use a placeholder or the Plasmo default icon |
| Tailwind classes not applying | Verify `postcss.config.js` exists and is properly configured |

---

## Success Criteria

The task is complete when:

- [ ] All Tailwind dependencies installed in `package.json`
- [ ] `tailwind.config.js` exists with brand colors
- [ ] `postcss.config.js` exists with correct plugins
- [ ] `src/style.css` exists with Tailwind directives
- [ ] `popup.tsx` shows branded UI (not "Welcome to Plasmo")
- [ ] Extension builds successfully with `pnpm build`
- [ ] No TypeScript/ESLint errors in the modified files
