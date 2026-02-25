import { useState, useEffect, type ChangeEvent } from "react"
import { Storage } from "@plasmohq/storage"
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

interface ChromeMessage {
    type: string;
    payload?: TokenStats;
}

const storage = new Storage({ area: "local" })
type CanvasSelection = "off" | TokenCanvasPlacement

function notifyActiveTabSettings(payload: {
    enabled?: boolean
    placement?: TokenCanvasPlacement
}): void {
    if (!isPopupContextValid()) return

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (!isPopupContextValid()) return
        const tabId = tabs[0]?.id
        if (!tabId) return

        try {
            chrome.tabs.sendMessage(
                tabId,
                { type: MSG_TOKEN_SETTINGS_UPDATE, payload },
                () => {
                    // Ignore when content script is not available in current tab
                    void chrome.runtime.lastError
                }
            )
        } catch {
            // Context invalidated
        }
    })
}

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

function normalizeLegacyDisplayMode(value: unknown): TokenDisplayMode | undefined {
    if (value === "popup" || value === "canvas" || value === "both") {
        return value
    }
    return undefined
}

function mapLegacyModeToEnabled(mode: TokenDisplayMode | undefined): boolean | undefined {
    if (!mode) return undefined
    return mode !== "popup"
}

export function TokenCounter() {
    const [canvasEnabled, setCanvasEnabled] = useState(true)
    const [stats, setStats] = useState<TokenStats | null>(null)
    const [canvasPlacement, setCanvasPlacement] = useState<TokenCanvasPlacement>("sidebar-top")

    useEffect(() => {
        Promise.all([
            storage.get<boolean>(STORAGE_TOKEN_ENABLED),
            storage.get<unknown>(STORAGE_TOKEN_DISPLAY_MODE),
            storage.get<TokenCanvasPlacement>(STORAGE_TOKEN_CANVAS_PLACEMENT)
        ]).then(([enabledValue, legacyModeValue, placementValue]) => {
            const legacyMode = normalizeLegacyDisplayMode(legacyModeValue)
            const resolvedEnabled = typeof enabledValue === "boolean"
                ? enabledValue
                : (mapLegacyModeToEnabled(legacyMode) ?? true)
            const resolvedPlacement = (placementValue === "sidebar-top" || placementValue === "composer-right")
                ? placementValue
                : "sidebar-top"

            setCanvasEnabled(resolvedEnabled)
            setCanvasPlacement(resolvedPlacement)

            notifyActiveTabSettings({
                enabled: resolvedEnabled,
                placement: resolvedPlacement
            })
        })
    }, [])

    useEffect(() => {
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
    }, [])

    const updateCanvasSelection = (event: ChangeEvent<HTMLSelectElement>) => {
        const nextSelection = event.target.value as CanvasSelection
        if (nextSelection === "off") {
            setCanvasEnabled(false)
            storage.set(STORAGE_TOKEN_ENABLED, false)
            notifyActiveTabSettings({ enabled: false })
            return
        }

        setCanvasEnabled(true)
        setCanvasPlacement(nextSelection)
        storage.set(STORAGE_TOKEN_ENABLED, true)
        storage.set(STORAGE_TOKEN_CANVAS_PLACEMENT, nextSelection)
        notifyActiveTabSettings({
            enabled: true,
            placement: nextSelection
        })
    }

    const canvasSelection: CanvasSelection = canvasEnabled ? canvasPlacement : "off"

    return (
        <div className="pt-3 border-t border-brown/10 mt-2">
            <div className="mb-2">
                <span className="text-xs font-semibold uppercase tracking-[0.15em] text-brown-soft">
                    Session Tokens
                </span>
            </div>

            <div className="bg-cream-deep rounded-[16px] p-4 flex items-center justify-between text-brown shadow-card">
                <StatBlock label="Input" value={stats?.user} />
                <Divider />
                <StatBlock label="Output" value={stats?.assistant} />
                <Divider />
                <StatBlock label="Total" value={stats?.total} highlight />
            </div>

            <div className="mt-3 grid grid-cols-1 gap-2">
                <label className="text-[10px] uppercase tracking-[0.12em] text-brown-soft">
                    Canvas
                    <select
                        value={canvasSelection}
                        onChange={updateCanvasSelection}
                        className="mt-1 block w-full rounded-button border border-brown/15 bg-white px-2 py-1 text-[11px] text-brown focus:outline-none focus:ring-2 focus:ring-teal/30"
                    >
                        <option value="off">Off</option>
                        <option value="sidebar-top">Side Top</option>
                        <option value="composer-right">Compose Right</option>
                    </select>
                </label>
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
