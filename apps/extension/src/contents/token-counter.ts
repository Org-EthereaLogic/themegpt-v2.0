import type { PlasmoCSConfig } from "plasmo"
import { Storage } from "@plasmohq/storage"
import { encode } from "gpt-tokenizer"
import {
    MSG_GET_TOKENS,
    MSG_TOKEN_UPDATE,
    MSG_TOKEN_SETTINGS_UPDATE,
    STORAGE_TOKEN_ENABLED,
    STORAGE_TOKEN_DISPLAY_MODE,
    STORAGE_TOKEN_CANVAS_PLACEMENT,
    type TokenStats,
    type TokenDisplayMode,
    type TokenCanvasPlacement
} from "@themegpt/shared"

export const config: PlasmoCSConfig = {
    matches: ["https://chat.openai.com/*", "https://chatgpt.com/*"]
}

const storage = new Storage({ area: "local" })
const CANVAS_COUNTER_ID = "themegpt-token-counter-canvas"
const CANVAS_COUNTER_STYLES_ID = "themegpt-token-counter-canvas-styles"
const THEMEGPT_INPUT_COLOR = "#F4A988"
const THEMEGPT_OUTPUT_COLOR = "#9BB5FF"
const THEMEGPT_TOTAL_COLOR = "#7ECEC5"
const COMPOSER_RIGHT_GAP_PX = 12
const COMPOSER_RIGHT_VIEWPORT_PADDING_PX = 16
const COMPOSER_RIGHT_VIEWPORT_MARGIN_PX = 8
const TOKEN_COUNTER_ICON_DATA_URI = "data:image/png;base64,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"

/**
 * Check if extension context is still valid
 * Returns false when extension has been reloaded/updated
 */
function isContextValid(): boolean {
    if (typeof chrome === "undefined") return false
    try {
        return Boolean(chrome.runtime?.id)
    } catch {
        return false
    }
}

let latestStats: TokenStats = { user: 0, assistant: 0, total: 0, lastUpdated: 0 }
let debounceTimer: ReturnType<typeof setTimeout>
let canvasCounterElement: HTMLDivElement | null = null

const displaySettings: {
    enabled: boolean
    placement: TokenCanvasPlacement
} = {
    enabled: true,
    placement: "sidebar-top"
}

function isTokenDisplayMode(value: unknown): value is TokenDisplayMode {
    return value === "popup" || value === "canvas" || value === "both"
}

function mapLegacyModeToEnabled(value: TokenDisplayMode): boolean {
    return value !== "popup"
}

function isTokenCanvasPlacement(value: unknown): value is TokenCanvasPlacement {
    return value === "sidebar-top" || value === "composer-right"
}

function shouldRenderCanvasCounter(): boolean {
    return displaySettings.enabled
}

function ensureCanvasCounterStyles(): void {
    if (document.getElementById(CANVAS_COUNTER_STYLES_ID)) return

    const styleElement = document.createElement("style")
    styleElement.id = CANVAS_COUNTER_STYLES_ID
    styleElement.textContent = `
#${CANVAS_COUNTER_ID} {
  font-family: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 11px;
  line-height: 1.2;
  letter-spacing: 0.02em;
  color: var(--text-primary, #f5f5f5);
  background:
    linear-gradient(
      180deg,
      color-mix(in srgb, var(--main-surface-secondary, #202123) 88%, transparent),
      color-mix(in srgb, var(--main-surface-secondary, #202123) 78%, transparent)
    );
  border: 1px solid color-mix(in srgb, var(--cgpt-accent, #7ECEC5) 36%, var(--border-medium, #3f4045));
  border-radius: 12px;
  padding: 8px 10px;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.28);
  backdrop-filter: blur(8px);
  pointer-events: none;
  width: fit-content;
  max-width: 230px;
  z-index: 2147483000;
}

#${CANVAS_COUNTER_ID}.themegpt-token-counter--sidebar {
  margin: 8px 10px 10px;
}

#${CANVAS_COUNTER_ID}.themegpt-token-counter--composer-right {
  position: fixed;
  max-width: 172px;
  padding: 6px 8px;
  border-radius: 10px;
  z-index: 2147483600;
}

#${CANVAS_COUNTER_ID}.themegpt-token-counter--floating {
  position: fixed;
  right: 20px;
  bottom: 102px;
}

#${CANVAS_COUNTER_ID} .themegpt-token-counter__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  font-size: 9px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--text-secondary, #9ca3af) 92%, #ffffff 8%);
  margin-bottom: 6px;
}

#${CANVAS_COUNTER_ID} .themegpt-token-counter__title {
  min-width: 0;
}

#${CANVAS_COUNTER_ID} .themegpt-token-counter__icon {
  display: block;
  width: 14px;
  height: 14px;
  object-fit: cover;
  border-radius: 999px;
  background: #f9f4ed;
  border: 1px solid color-mix(in srgb, var(--cgpt-accent, #7ECEC5) 40%, transparent);
}

#${CANVAS_COUNTER_ID} .themegpt-token-counter__stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

#${CANVAS_COUNTER_ID} .themegpt-token-counter__metric {
  min-width: 54px;
}

#${CANVAS_COUNTER_ID} .themegpt-token-counter__label {
  display: block;
  font-size: 9px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--text-secondary, #9ca3af) 92%, #ffffff 8%);
  margin-bottom: 2px;
}

#${CANVAS_COUNTER_ID} .themegpt-token-counter__value {
  display: block;
  font-weight: 700;
  font-size: 13px;
  letter-spacing: 0.01em;
  color: var(--text-primary, #f5f5f5);
}

#${CANVAS_COUNTER_ID} .themegpt-token-counter__metric--input .themegpt-token-counter__value {
  color: ${THEMEGPT_INPUT_COLOR};
}

#${CANVAS_COUNTER_ID} .themegpt-token-counter__metric--output .themegpt-token-counter__value {
  color: ${THEMEGPT_OUTPUT_COLOR};
}

#${CANVAS_COUNTER_ID} .themegpt-token-counter__metric--total .themegpt-token-counter__value {
  color: ${THEMEGPT_TOTAL_COLOR};
}

#${CANVAS_COUNTER_ID}.themegpt-token-counter--composer-right .themegpt-token-counter__header {
  font-size: 8px;
  margin-bottom: 4px;
}

#${CANVAS_COUNTER_ID}.themegpt-token-counter--composer-right .themegpt-token-counter__stats {
  gap: 6px;
}

#${CANVAS_COUNTER_ID}.themegpt-token-counter--composer-right .themegpt-token-counter__metric {
  min-width: 44px;
}

#${CANVAS_COUNTER_ID}.themegpt-token-counter--composer-right .themegpt-token-counter__label {
  font-size: 8px;
}

#${CANVAS_COUNTER_ID}.themegpt-token-counter--composer-right .themegpt-token-counter__value {
  font-size: 11px;
}
`
    document.documentElement.appendChild(styleElement)
}

function ensureCanvasCounterElement(): HTMLDivElement {
    const existing = document.getElementById(CANVAS_COUNTER_ID)
    if (existing instanceof HTMLDivElement) {
        canvasCounterElement = existing
        return existing
    }

    const element = document.createElement("div")
    element.id = CANVAS_COUNTER_ID
    element.setAttribute("aria-live", "polite")
    element.setAttribute("role", "status")
    canvasCounterElement = element
    return element
}

function removeCanvasCounter(): void {
    const existing = document.getElementById(CANVAS_COUNTER_ID)
    if (existing) existing.remove()
    canvasCounterElement = null
}

function updateCanvasCounterText(): void {
    if (!canvasCounterElement) return
    const iconMarkup = `<img class="themegpt-token-counter__icon" src="${TOKEN_COUNTER_ICON_DATA_URI}" alt="ThemeGPT" />`

    canvasCounterElement.innerHTML = `
<div class="themegpt-token-counter__header">
  <span class="themegpt-token-counter__title">Session Tokens</span>
  ${iconMarkup}
</div>
<div class="themegpt-token-counter__stats">
  <span class="themegpt-token-counter__metric themegpt-token-counter__metric--input">
    <span class="themegpt-token-counter__label">Input</span>
    <span class="themegpt-token-counter__value">${latestStats.user.toLocaleString()}</span>
  </span>
  <span class="themegpt-token-counter__metric themegpt-token-counter__metric--output">
    <span class="themegpt-token-counter__label">Output</span>
    <span class="themegpt-token-counter__value">${latestStats.assistant.toLocaleString()}</span>
  </span>
  <span class="themegpt-token-counter__metric themegpt-token-counter__metric--total">
    <span class="themegpt-token-counter__label">Total</span>
    <span class="themegpt-token-counter__value">${latestStats.total.toLocaleString()}</span>
  </span>
</div>
`
}

function isVisibleElement(element: Element | null): element is HTMLElement {
    if (!(element instanceof HTMLElement)) return false
    const style = window.getComputedStyle(element)
    return style.display !== "none" && style.visibility !== "hidden"
}

function findSidebarAnchor(): HTMLElement | null {
    const candidates = [
        document.querySelector("[data-testid='history-and-skills-sidebar']"),
        document.querySelector("aside nav"),
        document.querySelector("aside"),
        document.querySelector("nav[aria-label='Chat history']")
    ]

    for (const candidate of candidates) {
        if (isVisibleElement(candidate)) {
            return candidate
        }
    }

    return null
}

function findComposerInputAnchor(): HTMLElement | null {
    const candidates = [
        document.querySelector("textarea[data-testid='prompt-textarea']"),
        document.querySelector("[data-testid='prompt-textarea']"),
        document.querySelector("main form textarea"),
        document.querySelector("main form [contenteditable='true']"),
        document.querySelector("form textarea"),
        document.querySelector("form [contenteditable='true']")
    ]

    for (const candidate of candidates) {
        if (isVisibleElement(candidate)) {
            return candidate
        }
    }

    return null
}

function mountCanvasCounterInAnchor(anchor: HTMLElement, className: string): void {
    if (!canvasCounterElement) return

    if (canvasCounterElement.parentElement !== anchor || anchor.firstChild !== canvasCounterElement) {
        anchor.insertBefore(canvasCounterElement, anchor.firstChild)
    }

    canvasCounterElement.style.removeProperty("left")
    canvasCounterElement.style.removeProperty("top")
    canvasCounterElement.className = className
}

function mountCanvasCounterFloating(): void {
    if (!canvasCounterElement) return
    if (canvasCounterElement.parentElement !== document.body) {
        document.body.appendChild(canvasCounterElement)
    }
    canvasCounterElement.style.removeProperty("left")
    canvasCounterElement.style.removeProperty("top")
    canvasCounterElement.className = "themegpt-token-counter--floating"
}

function mountComposerRight(anchor: HTMLElement): boolean {
    if (!canvasCounterElement) return false
    if (canvasCounterElement.parentElement !== document.body) {
        document.body.appendChild(canvasCounterElement)
    }

    canvasCounterElement.className = "themegpt-token-counter--composer-right"

    const anchorRect = anchor.getBoundingClientRect()
    const counterRect = canvasCounterElement.getBoundingClientRect()
    const minimumLeft = anchorRect.right + COMPOSER_RIGHT_GAP_PX
    const preferredLeft = window.innerWidth - counterRect.width - COMPOSER_RIGHT_VIEWPORT_PADDING_PX

    if (preferredLeft < minimumLeft) {
        return false
    }

    const rawTop = anchorRect.top + ((anchorRect.height - counterRect.height) / 2)
    const maxTop = Math.max(
        COMPOSER_RIGHT_VIEWPORT_MARGIN_PX,
        window.innerHeight - counterRect.height - COMPOSER_RIGHT_VIEWPORT_MARGIN_PX
    )
    const top = Math.min(
        Math.max(COMPOSER_RIGHT_VIEWPORT_MARGIN_PX, rawTop),
        maxTop
    )

    canvasCounterElement.style.left = `${Math.round(preferredLeft)}px`
    canvasCounterElement.style.top = `${Math.round(top)}px`
    return true
}

function syncCanvasCounterPlacement(): void {
    if (!document.body || !shouldRenderCanvasCounter()) {
        removeCanvasCounter()
        return
    }

    ensureCanvasCounterStyles()
    ensureCanvasCounterElement()
    updateCanvasCounterText()

    if (!canvasCounterElement) return

    if (displaySettings.placement === "sidebar-top") {
        const sidebarAnchor = findSidebarAnchor()
        if (sidebarAnchor) {
            mountCanvasCounterInAnchor(sidebarAnchor, "themegpt-token-counter--sidebar")
            return
        }
    } else {
        const composerAnchor = findComposerInputAnchor()
        if (composerAnchor && mountComposerRight(composerAnchor)) {
            return
        }
    }

    mountCanvasCounterFloating()
}

async function loadDisplaySettings(): Promise<void> {
    try {
        const [enabled, legacyMode, placement] = await Promise.all([
            storage.get<boolean>(STORAGE_TOKEN_ENABLED),
            storage.get<TokenDisplayMode>(STORAGE_TOKEN_DISPLAY_MODE),
            storage.get<TokenCanvasPlacement>(STORAGE_TOKEN_CANVAS_PLACEMENT)
        ])

        if (typeof enabled === "boolean") {
            displaySettings.enabled = enabled
        } else if (isTokenDisplayMode(legacyMode)) {
            displaySettings.enabled = mapLegacyModeToEnabled(legacyMode)
        }
        if (isTokenCanvasPlacement(placement)) {
            displaySettings.placement = placement
        }
    } catch {
        // keep defaults if storage is unavailable
    }

    syncCanvasCounterPlacement()
}

function watchDisplaySettings(): void {
    try {
        storage.watch({
            [STORAGE_TOKEN_ENABLED]: (change) => {
                if (typeof change.newValue === "boolean") {
                    displaySettings.enabled = change.newValue
                    syncCanvasCounterPlacement()
                }
            },
            [STORAGE_TOKEN_DISPLAY_MODE]: (change) => {
                if (isTokenDisplayMode(change.newValue)) {
                    displaySettings.enabled = mapLegacyModeToEnabled(change.newValue)
                    syncCanvasCounterPlacement()
                }
            },
            [STORAGE_TOKEN_CANVAS_PLACEMENT]: (change) => {
                if (isTokenCanvasPlacement(change.newValue)) {
                    displaySettings.placement = change.newValue
                    syncCanvasCounterPlacement()
                }
            }
        })
    } catch {
        // ignore watch registration errors (e.g. context teardown)
    }
}

// Pure(ish) function for testing - takes role/text pairs instead of DOM nodes
export function calculateTokenStats(messages: Array<{ role: string | null, text: string | null }>): TokenStats {
    let userTokens = 0
    let assistantTokens = 0

    messages.forEach((msg) => {
        const role = msg.role
        const text = msg.text || ""
        const tokens = encode(text).length

        if (role === "user") {
            userTokens += tokens
        } else if (role === "assistant") {
            assistantTokens += tokens
        }
    })

    return {
        user: userTokens,
        assistant: assistantTokens,
        total: userTokens + assistantTokens,
        lastUpdated: Date.now()
    }
}

function getStatsFromSelector(selector: string): TokenStats {
    const elements = document.querySelectorAll(selector)
    if (elements.length === 0) return { user: 0, assistant: 0, total: 0, lastUpdated: 0 }

    const messageData = Array.from(elements).map(el => {
        let role = el.getAttribute("data-message-author-role")
        // If attribute missing, try validation from testid or class
        if (!role) {
            const testId = el.getAttribute("data-testid") || ""
            if (testId.includes("user")) role = "user"
            else if (testId.includes("assistant")) role = "assistant"
            else if (el.classList.contains("markdown")) role = "assistant"
        }
        return {
            role: role,
            text: el.textContent
        }
    })

    return calculateTokenStats(messageData)
}

function extractMessageStats(): TokenStats {
    // Strategy 1: Standard attribute (most reliable)
    const stats1 = getStatsFromSelector("[data-message-author-role]")
    if (stats1.total > 0) return stats1

    // Strategy 2: Fallback to test ids (often stable) AND markdown class
    // We combine them to ensure we catch mixed cases (e.g. user has testid, assistant has markdown class)
    const stats2 = getStatsFromSelector("[data-testid*='message'], .markdown")
    if (stats2.total > 0) return stats2

    // Strategy 3: Loose conversation turns (last resort)
    const turnElements = document.querySelectorAll("[data-testid^='conversation-turn-']")
    if (turnElements.length > 0) {
        const messages: Array<{ role: string | null, text: string | null }> = []
        turnElements.forEach(turn => {
            // Try to find user/assistant specific elements inside
            const userMsg = turn.querySelector("[data-message-author-role='user']") ||
                turn.querySelector("[data-testid*='user']")

            // Check for assistant message
            const assistantMsg = turn.querySelector("[data-message-author-role='assistant']") ||
                turn.querySelector("[data-testid*='assistant']") ||
                turn.querySelector(".markdown") // Common for assistant

            if (userMsg) messages.push({ role: "user", text: userMsg.textContent })
            if (assistantMsg) messages.push({ role: "assistant", text: assistantMsg.textContent })

            // If neither strict role found, but we have text content
            if (!userMsg && !assistantMsg && turn.textContent) {
                messages.push({ role: "assistant", text: turn.textContent })
            }
        })

        if (messages.length > 0) {
            return calculateTokenStats(messages)
        }
    }

    return { user: 0, assistant: 0, total: 0, lastUpdated: 0 }
}

function updateCounts(): void {
    // Stop if extension context is invalidated
    if (!isContextValid()) {
        observer.disconnect()
        return
    }

    const newStats = extractMessageStats()

    // valid change check to avoid spamming events
    if (newStats.total !== latestStats.total) {
        latestStats = newStats
        // Broadcast update (safely)
        try {
            chrome.runtime.sendMessage({ type: MSG_TOKEN_UPDATE, payload: latestStats }).catch(() => {
                // Ignore error if popup not open
            })
        } catch {
            // Context invalidated - stop observer
            observer.disconnect()
        }
    }

    syncCanvasCounterPlacement()
}

/**
 * Safe wrapper that checks context validity before executing updateCounts
 * This prevents errors when setTimeout fires after context invalidation
 */
function safeUpdateCounts(): void {
    if (!isContextValid()) {
        clearTimeout(debounceTimer)
        observer.disconnect()
        return
    }
    updateCounts()
}

const observer = new MutationObserver(() => {
    if (!isContextValid()) {
        clearTimeout(debounceTimer)
        observer.disconnect()
        return
    }
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(safeUpdateCounts, 1000)
})

function initObserver(): void {
    if (document.body) {
        updateCounts()
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            characterData: true,
            attributes: true,
            attributeFilter: ["data-message-author-role", "class"]
        })
    } else {
        setTimeout(initObserver, 100)
    }
}

function messageListener(
    req: {
        type: string
        payload?: {
            enabled?: boolean
            placement?: TokenCanvasPlacement
        }
    },
    _sender: chrome.runtime.MessageSender,
    sendResponse: (response: TokenStats) => void
): boolean | undefined {
    if (!isContextValid()) {
        try {
            chrome.runtime.onMessage.removeListener(messageListener)
        } catch {
            // Context already fully gone
        }
        return
    }
    if (req.type === MSG_GET_TOKENS) {
        sendResponse(latestStats)
        return true
    }

    if (req.type === MSG_TOKEN_SETTINGS_UPDATE && req.payload) {
        if (typeof req.payload.enabled === "boolean") {
            displaySettings.enabled = req.payload.enabled
        }
        if (isTokenCanvasPlacement(req.payload.placement)) {
            displaySettings.placement = req.payload.placement
        }
        syncCanvasCounterPlacement()
        return true
    }
}

if (isContextValid()) {
    loadDisplaySettings()
    watchDisplaySettings()
    initObserver()
    window.addEventListener("resize", syncCanvasCounterPlacement)
    chrome.runtime.onMessage.addListener(messageListener)
}
