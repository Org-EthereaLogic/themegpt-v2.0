import type { PlasmoCSConfig } from "plasmo"
import { encode } from "gpt-tokenizer"
import { MSG_GET_TOKENS, type TokenStats } from "@themegpt/shared"

export const config: PlasmoCSConfig = {
    matches: ["https://chat.openai.com/*", "https://chatgpt.com/*"]
}

let latestStats: TokenStats = { user: 0, assistant: 0, total: 0, lastUpdated: 0 }
let debounceTimer: ReturnType<typeof setTimeout>

function calculateTokens(): void {
    const messages = document.querySelectorAll("[data-message-author-role]")
    let userTokens = 0
    let assistantTokens = 0

    messages.forEach((msg) => {
        const role = msg.getAttribute("data-message-author-role")
        const tokens = encode(msg.textContent || "").length
        if (role === "user") userTokens += tokens
        else assistantTokens += tokens
    })

    latestStats = {
        user: userTokens,
        assistant: assistantTokens,
        total: userTokens + assistantTokens,
        lastUpdated: Date.now()
    }
}

const observer = new MutationObserver(() => {
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(calculateTokens, 1000)
})

function initObserver(): void {
    const main = document.querySelector("main")
    if (main) {
        calculateTokens()
        observer.observe(main, { childList: true, subtree: true, characterData: true })
    } else {
        setTimeout(initObserver, 1000)
    }
}

initObserver()

chrome.runtime.onMessage.addListener((req, _sender, sendResponse) => {
    if (req.type === MSG_GET_TOKENS) {
        sendResponse(latestStats)
        return true // Required for async response
    }
})
