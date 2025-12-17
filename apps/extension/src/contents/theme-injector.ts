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

/* ============================================
   THEMEGPT - Comprehensive ChatGPT Styling
   ============================================ */

/* --- Base Elements --- */
html, body {
  background-color: var(--cgpt-bg) !important;
}

/* --- Main Content Area --- */
main {
  background-color: var(--cgpt-bg) !important;
}

main > div {
  background-color: var(--cgpt-bg) !important;
}

/* --- Sidebar (nav) and all its children --- */
nav {
  background-color: var(--cgpt-surface) !important;
}

nav > div,
nav > div > div,
nav * {
  background-color: transparent !important;
}

/* Sidebar container */
nav > div:first-child {
  background-color: var(--cgpt-surface) !important;
}

/* --- Header Area (top bar with model selector) --- */
header,
[class*="sticky"] {
  background-color: var(--cgpt-bg) !important;
}

/* --- Conversation List Items --- */
nav a,
nav button {
  background-color: transparent !important;
}

nav a:hover,
nav button:hover {
  background-color: var(--cgpt-border) !important;
}

/* Active/selected conversation */
nav a[class*="bg-"],
nav [data-state="open"] {
  background-color: var(--cgpt-border) !important;
}

/* --- Message Bubbles --- */
[data-message-author-role] {
  background-color: transparent !important;
  color: var(--cgpt-text) !important;
}

[data-message-author-role="assistant"] {
  background-color: var(--cgpt-surface) !important;
}

/* Message container backgrounds */
article,
[data-testid*="conversation-turn"] {
  background-color: var(--cgpt-bg) !important;
}

/* --- Input Area --- */
form {
  background-color: transparent !important;
}

/* Input container/composer */
[class*="composer"],
[class*="ProseMirror"],
#prompt-textarea,
textarea {
  background-color: var(--cgpt-surface) !important;
  color: var(--cgpt-text) !important;
  border-color: var(--cgpt-border) !important;
}

/* Input wrapper with border */
form > div,
[class*="stretch"] {
  background-color: var(--cgpt-surface) !important;
  border-color: var(--cgpt-border) !important;
}

/* --- Text Colors --- */
p, span, div, li, td, th {
  color: var(--cgpt-text) !important;
}

h1, h2, h3, h4, h5, h6 {
  color: var(--cgpt-text) !important;
}

/* Token text classes used by ChatGPT */
.text-token-text-primary,
[class*="text-token-text-primary"] {
  color: var(--cgpt-text) !important;
}

.text-token-text-secondary,
[class*="text-token-text-secondary"] {
  color: var(--cgpt-text-muted) !important;
}

.text-token-text-tertiary,
[class*="text-token-text-tertiary"] {
  color: var(--cgpt-text-muted) !important;
}

/* --- Links and Accents --- */
a {
  color: var(--cgpt-accent) !important;
}

a:hover {
  color: var(--cgpt-accent) !important;
  opacity: 0.8;
}

/* --- Buttons --- */
button {
  border-color: var(--cgpt-border) !important;
}

button:hover {
  background-color: var(--cgpt-border) !important;
}

/* Icon buttons */
button svg {
  color: var(--cgpt-text-muted) !important;
}

button:hover svg {
  color: var(--cgpt-text) !important;
}

/* --- Borders and Dividers --- */
[class*="border"] {
  border-color: var(--cgpt-border) !important;
}

hr {
  border-color: var(--cgpt-border) !important;
  background-color: var(--cgpt-border) !important;
}

/* --- Code Blocks --- */
pre {
  background-color: var(--cgpt-surface) !important;
  border-color: var(--cgpt-border) !important;
}

code {
  background-color: var(--cgpt-surface) !important;
  color: var(--cgpt-accent) !important;
}

/* Code block header */
pre > div:first-child {
  background-color: var(--cgpt-border) !important;
  border-color: var(--cgpt-border) !important;
}

/* --- Dropdowns and Menus --- */
[role="menu"],
[role="listbox"],
[data-radix-popper-content-wrapper] {
  background-color: var(--cgpt-surface) !important;
  border-color: var(--cgpt-border) !important;
}

[role="menuitem"],
[role="option"] {
  background-color: transparent !important;
  color: var(--cgpt-text) !important;
}

[role="menuitem"]:hover,
[role="option"]:hover,
[role="menuitem"][data-highlighted],
[role="option"][data-highlighted] {
  background-color: var(--cgpt-border) !important;
}

/* --- Modal/Dialog Backgrounds --- */
[role="dialog"],
[data-state="open"][role="dialog"] {
  background-color: var(--cgpt-surface) !important;
}

/* Overlay/backdrop */
[data-radix-overlay],
[class*="fixed"][class*="inset"] {
  background-color: rgba(0, 0, 0, 0.5) !important;
}

/* --- Tooltips --- */
[role="tooltip"] {
  background-color: var(--cgpt-surface) !important;
  color: var(--cgpt-text) !important;
  border-color: var(--cgpt-border) !important;
}

/* --- Scrollbar Styling --- */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: var(--cgpt-bg);
}

::-webkit-scrollbar-thumb {
  background: var(--cgpt-border);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--cgpt-text-muted);
}

/* --- Token Surface Classes --- */
.bg-token-main-surface-primary,
[class*="bg-token-main-surface-primary"] {
  background-color: var(--cgpt-bg) !important;
}

.bg-token-main-surface-secondary,
[class*="bg-token-main-surface-secondary"] {
  background-color: var(--cgpt-surface) !important;
}

.bg-token-main-surface-tertiary,
[class*="bg-token-main-surface-tertiary"] {
  background-color: var(--cgpt-surface) !important;
}

.bg-token-sidebar-surface-primary,
[class*="bg-token-sidebar-surface-primary"] {
  background-color: var(--cgpt-surface) !important;
}

.bg-token-sidebar-surface-secondary,
[class*="bg-token-sidebar-surface-secondary"] {
  background-color: var(--cgpt-border) !important;
}

/* --- Placeholder Text --- */
::placeholder {
  color: var(--cgpt-text-muted) !important;
  opacity: 0.7;
}

/* --- Selection --- */
::selection {
  background-color: var(--cgpt-accent) !important;
  color: var(--cgpt-bg) !important;
}

/* --- Focus States --- */
*:focus-visible {
  outline-color: var(--cgpt-accent) !important;
}

/* --- SVG Icons --- */
svg {
  color: currentColor;
}

/* --- Specific ChatGPT Elements --- */

/* New chat button */
nav button[class*="new"],
nav a[href="/"] {
  background-color: transparent !important;
  border-color: var(--cgpt-border) !important;
}

/* Model selector dropdown */
button[class*="model"],
[class*="model-selector"] {
  background-color: transparent !important;
  color: var(--cgpt-text) !important;
}

/* Conversation action buttons (edit, copy, etc.) */
[class*="flex"][class*="gap"] button {
  background-color: transparent !important;
}

/* Empty state / welcome message */
[class*="empty-state"],
[class*="welcome"] {
  color: var(--cgpt-text-muted) !important;
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
