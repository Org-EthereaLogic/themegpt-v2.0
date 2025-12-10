import { useState, useEffect } from "react"
import { Storage } from "@plasmohq/storage"
import { DEFAULT_THEMES, type Theme } from "@themegpt/shared"
import { TokenCounter } from "./src/components/TokenCounter"

import "./style.css"

// ThemeGPT mascot logo
import mascotUrl from "url:./assets/mascot-32.png"

const storage = new Storage({ area: "local" })

export default function Popup() {
  const [activeThemeId, setActiveThemeId] = useState<string>("system")
  const [unlockedThemeIds, setUnlockedThemeIds] = useState<string[]>([])

  useEffect(() => {
    storage.get<Theme>("activeTheme").then((t) => {
      if (t) setActiveThemeId(t.id)
    })
    storage.get<string[]>("unlockedThemes").then((ids) => {
      if (ids) setUnlockedThemeIds(ids)
    })
  }, [])

  const applyTheme = (theme: Theme) => {
    if (theme.isPremium && !unlockedThemeIds.includes(theme.id)) {
      window.open(`https://themegpt.ai/themes/${theme.id}`, '_blank')
      return
    }
    setActiveThemeId(theme.id)
    storage.set("activeTheme", theme)
  }

  const freeThemes = DEFAULT_THEMES.filter(t => !t.isPremium)
  const premiumThemes = DEFAULT_THEMES.filter(t => t.isPremium)

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
      <main className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* FREE TIER */}
        <section>
          <h2 className="text-xs font-bold uppercase tracking-wider opacity-60 mb-3 flex items-center gap-2">
            <span>Free Collection</span>
            <span className="bg-brand-teal/10 text-brand-teal px-1.5 py-0.5 rounded text-[10px]">
              {freeThemes.length}
            </span>
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {freeThemes.map((theme) => (
              <ThemeCard
                key={theme.id}
                theme={theme}
                isActive={activeThemeId === theme.id}
                isLocked={false}
                onSelect={() => applyTheme(theme)}
              />
            ))}
          </div>
        </section>

        {/* PREMIUM TIER */}
        <section>
          <h2 className="text-xs font-bold uppercase tracking-wider opacity-60 mb-3 flex items-center gap-2">
            <span>Premium Collection</span>
            <span className="bg-brand-peach/10 text-brand-peach px-1.5 py-0.5 rounded text-[10px]">
              {premiumThemes.length}
            </span>
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {premiumThemes.map((theme) => {
              const isLocked = !unlockedThemeIds.includes(theme.id)
              return (
                <ThemeCard
                  key={theme.id}
                  theme={theme}
                  isActive={activeThemeId === theme.id}
                  isLocked={isLocked}
                  onSelect={() => applyTheme(theme)}
                />
              )
            })}
          </div>
        </section>
      </main>

      {/* TOKEN COUNTER & FOOTER */}
      <div className="bg-white/50 border-t border-brand-text/10">
        <div className="px-4 pb-2">
            <TokenCounter />
        </div>
        <footer className="p-3 text-center border-t border-brand-text/5">
            <a href="https://themegpt.ai" target="_blank" className="text-xs font-medium text-brand-text/60 hover:text-brand-text">
            Manage Subscription &rarr;
            </a>
        </footer>
      </div>
    </div>
  )
}

function ThemeCard({
  theme,
  isActive,
  isLocked,
  onSelect
}: {
  theme: Theme
  isActive: boolean
  isLocked: boolean
  onSelect: () => void
}) {
  return (
    <button
      onClick={onSelect}
      aria-label={isLocked ? `${theme.name} - Premium, click to unlock` : `Apply ${theme.name} theme`}
      className={`
        group relative flex flex-col items-start p-3 rounded-xl border transition-all duration-200 text-left w-full
        ${isActive
          ? "border-brand-teal bg-white shadow-md ring-1 ring-brand-teal transform scale-[1.02]"
          : "border-transparent bg-white/40 hover:bg-white hover:shadow-sm"
        }
      `}
    >
      <div className="w-full h-12 rounded-lg mb-2 border border-brand-text/5 overflow-hidden relative">
        <div className="absolute inset-0" style={{ backgroundColor: theme.colors["--cgpt-bg"] }} />

        {isLocked && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center z-10 transition-opacity group-hover:bg-black/50">
            <div className="bg-white/20 p-1.5 rounded-full backdrop-blur-md">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4 text-white"
                aria-hidden="true"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between w-full">
        <span className="text-sm font-medium truncate opacity-90">{theme.name}</span>
        {isLocked && (
          <span className="text-[10px] font-bold text-brand-text/40 bg-brand-text/5 px-1.5 py-0.5 rounded uppercase">
            Pro
          </span>
        )}
      </div>
    </button>
  )
}
