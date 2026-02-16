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
    req: { type: string },
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
}

if (isContextValid()) {
    initObserver()
    chrome.runtime.onMessage.addListener(messageListener)
}
