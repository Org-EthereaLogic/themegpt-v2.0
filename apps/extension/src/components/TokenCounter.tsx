import { useState, useEffect } from "react"
import { Storage } from "@plasmohq/storage"
import { MSG_GET_TOKENS, MSG_TOKEN_UPDATE, STORAGE_TOKEN_ENABLED, type TokenStats } from "@themegpt/shared"

interface ChromeMessage {
    type: string;
    payload?: TokenStats;
}

const storage = new Storage({ area: "local" })

/**
 * Check if popup extension context is still valid
 * Returns false when extension has been reloaded/updated
 */
function isPopupContextValid(): boolean {
    try {
        return Boolean(chrome?.runtime?.id)
    } catch {
        return false
    }
}

export function TokenCounter() {
    const [enabled, setEnabled] = useState(true)
    const [stats, setStats] = useState<TokenStats | null>(null)

    useEffect(() => {
        storage.get<boolean>(STORAGE_TOKEN_ENABLED).then((val) => {
            if (val !== undefined) setEnabled(val)
        })
    }, [])

    useEffect(() => {
        if (!enabled) return

        const fetchStats = () => {
            if (!isPopupContextValid()) return

            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (!isPopupContextValid()) return

                const tabId = tabs[0]?.id
                if (!tabId) return

                try {
                    chrome.tabs.sendMessage(tabId, { type: MSG_GET_TOKENS }, (res) => {
                        if (!isPopupContextValid()) return
                        if (!chrome.runtime.lastError && res) setStats(res)
                    })
                } catch {
                    // Context invalidated
                }
            })
        }

        // Initial fetch
        fetchStats()

        const listener = (message: ChromeMessage) => {
            if (message.type === MSG_TOKEN_UPDATE && message.payload) {
                setStats(message.payload)
            }
        }

        chrome.runtime.onMessage.addListener(listener)
        return () => {
            try {
                chrome.runtime.onMessage.removeListener(listener)
            } catch {
                // Context might already be gone
            }
        }
    }, [enabled])

    const toggle = () => {
        const next = !enabled
        setEnabled(next)
        storage.set(STORAGE_TOKEN_ENABLED, next)
    }

    if (!enabled) {
        return (
            <div className="pt-2 border-t border-brown/10 mt-2">
                <button
                    onClick={toggle}
                    className="text-xs text-brown-soft hover:text-brown w-full text-center transition-colors"
                >
                    Show Token Counter
                </button>
            </div>
        )
    }

    return (
        <div className="pt-3 border-t border-brown/10 mt-2">
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-[0.15em] text-brown-soft">
                    Session Tokens
                </span>
                <button
                    onClick={toggle}
                    className="text-[10px] text-brown-soft hover:text-coral-bright transition-colors"
                >
                    Hide
                </button>
            </div>

            <div className="bg-cream-deep rounded-[16px] p-4 flex items-center justify-between text-brown shadow-card">
                <StatBlock label="Input" value={stats?.user} />
                <Divider />
                <StatBlock label="Output" value={stats?.assistant} />
                <Divider />
                <StatBlock label="Total" value={stats?.total} highlight />
            </div>

            <p className="text-[10px] text-center mt-2 text-brown-soft">
                Estimated · No data leaves your browser
            </p>
        </div>
    )
}

function StatBlock({ label, value, highlight }: { label: string; value?: number; highlight?: boolean }) {
    return (
        <div className={`text-center ${highlight ? "text-teal" : ""}`}>
            <div className={`text-[10px] uppercase tracking-wider font-semibold ${highlight ? "text-teal" : "text-brown-soft"}`}>{label}</div>
            <div className="font-mono text-base font-bold mt-0.5">{value?.toLocaleString() ?? "-"}</div>
        </div>
    )
}

function Divider() {
    return <div className="h-6 w-px bg-brown/10" />
}
