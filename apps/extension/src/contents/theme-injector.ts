import type { PlasmoCSConfig } from "plasmo"
import { Storage } from "@plasmohq/storage"
import type { Theme } from "@themegpt/shared"

export const config: PlasmoCSConfig = {
  matches: ["https://chat.openai.com/*", "https://chatgpt.com/*"],
  run_at: "document_start"
}

const storage = new Storage({ area: "local" })
let styleElement: HTMLStyleElement | null = null

function applyTheme(theme: Theme | null): void {
  if (!theme || !theme.colors) {
    removeTheme()
    return
  }

  const cssVars = Object.entries(theme.colors)
    .map(([key, value]) => `${key}: ${value};`)
    .join("\n  ")

  const css = `
:root {
  ${cssVars}
}

/* ChatGPT UI overrides */
body {
  background-color: var(--cgpt-bg) !important;
}

main {
  background-color: var(--cgpt-bg) !important;
}

/* Sidebar */
nav {
  background-color: var(--cgpt-surface) !important;
}

/* Message bubbles */
[data-message-author-role] {
  background-color: var(--cgpt-surface) !important;
  color: var(--cgpt-text) !important;
}

/* Input area */
form {
  background-color: var(--cgpt-surface) !important;
}

textarea {
  background-color: var(--cgpt-bg) !important;
  color: var(--cgpt-text) !important;
  border-color: var(--cgpt-border) !important;
}

/* General text */
p, span, div, h1, h2, h3, h4, h5, h6 {
  color: var(--cgpt-text) !important;
}

/* Muted text */
.text-token-text-secondary {
  color: var(--cgpt-text-muted) !important;
}

/* Links and accents */
a {
  color: var(--cgpt-accent) !important;
}

/* Buttons */
button {
  border-color: var(--cgpt-border) !important;
}

/* Code blocks */
pre, code {
  background-color: var(--cgpt-surface) !important;
  color: var(--cgpt-text) !important;
}
`

  if (!styleElement) {
    styleElement = document.createElement("style")
    styleElement.id = "themegpt-styles"
    document.documentElement.appendChild(styleElement)
  }

  styleElement.textContent = css
}

function removeTheme(): void {
  if (styleElement) {
    styleElement.remove()
    styleElement = null
  }
}

async function init(): Promise<void> {
  const theme = await storage.get<Theme>("activeTheme")
  if (theme) {
    applyTheme(theme)
  }

  storage.watch({
    activeTheme: (change) => {
      applyTheme(change.newValue as Theme | null)
    }
  })
}

init()
