import { useState, useEffect } from "react"
import { Storage } from "@plasmohq/storage"
import { MSG_GET_TOKENS, STORAGE_TOKEN_ENABLED, type TokenStats } from "@themegpt/shared"

const storage = new Storage({ area: "local" })

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
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                const tabId = tabs[0]?.id
                if (!tabId) return
                chrome.tabs.sendMessage(tabId, { type: MSG_GET_TOKENS }, (res) => {
                    if (!chrome.runtime.lastError && res) setStats(res)
                })
            })
        }

        fetchStats()
        const interval = setInterval(fetchStats, 1000)
        return () => clearInterval(interval)
    }, [enabled])

    const toggle = () => {
        const next = !enabled
        setEnabled(next)
        storage.set(STORAGE_TOKEN_ENABLED, next)
    }

    if (!enabled) {
        return (
            <div className="pt-2 border-t border-brand-text/10 mt-2">
                <button
                    onClick={toggle}
                    className="text-xs text-brand-text/50 hover:text-brand-text w-full text-center"
                >
                    Show Token Counter
                </button>
            </div>
        )
    }

    return (
        <div className="pt-3 border-t border-brand-text/10 mt-2">
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider opacity-60">
                    Session Tokens
                </span>
                <button
                    onClick={toggle}
                    className="text-[10px] opacity-40 hover:opacity-100 hover:text-red-600"
                >
                    Hide
                </button>
            </div>

            <div className="bg-brand-text/5 rounded-lg p-3 flex items-center justify-between text-brand-text">
                <StatBlock label="Input" value={stats?.user} />
                <Divider />
                <StatBlock label="Output" value={stats?.assistant} />
                <Divider />
                <StatBlock label="Total" value={stats?.total} highlight />
            </div>

            <p className="text-[10px] text-center mt-2 opacity-40">
                Estimated count. No data leaves your browser.
            </p>
        </div>
    )
}

function StatBlock({ label, value, highlight }: { label: string; value?: number; highlight?: boolean }) {
    return (
        <div className={`text-center ${highlight ? "text-brand-teal" : ""}`}>
            <div className={`text-xs ${highlight ? "opacity-80 font-bold" : "opacity-50"}`}>{label}</div>
            <div className="font-mono text-sm font-bold">{value?.toLocaleString() ?? "-"}</div>
        </div>
    )
}

function Divider() {
    return <div className="h-6 w-px bg-brand-text/10" />
}
