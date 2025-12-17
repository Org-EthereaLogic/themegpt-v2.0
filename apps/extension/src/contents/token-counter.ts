import type { PlasmoCSConfig } from "plasmo"
import { encode } from "gpt-tokenizer"
import { MSG_GET_TOKENS, MSG_TOKEN_UPDATE, type TokenStats } from "@themegpt/shared"

export const config: PlasmoCSConfig = {
    matches: ["https://chat.openai.com/*", "https://chatgpt.com/*"]
}

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

function updateCounts(): void {
    // Stop if extension context is invalidated
    if (!isContextValid()) {
        observer.disconnect()
        return
    }

    const elements = document.querySelectorAll("[data-message-author-role]")
    const messageData = Array.from(elements).map(el => ({
        role: el.getAttribute("data-message-author-role"),
        text: el.textContent
    }))

    const newStats = calculateTokenStats(messageData)

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
}

const observer = new MutationObserver(() => {
    if (!isContextValid()) {
        observer.disconnect()
        return
    }
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(updateCounts, 1000)
})

function initObserver(): void {
    const main = document.querySelector("main")
    if (main) {
        updateCounts()
        observer.observe(main, { childList: true, subtree: true, characterData: true })
    } else {
        setTimeout(initObserver, 1000)
    }
}

if (isContextValid()) {
    initObserver()

    chrome.runtime.onMessage.addListener((req, _sender, sendResponse) => {
        if (!isContextValid()) return
        if (req.type === MSG_GET_TOKENS) {
            sendResponse(latestStats)
            return true
        }
    })
}
