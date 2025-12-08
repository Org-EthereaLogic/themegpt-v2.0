import { useState, useEffect } from "react"
import { Storage } from "@plasmohq/storage"
import { DEFAULT_THEMES, type Theme } from "@themegpt/shared"
import { TokenCounter } from "./src/components/TokenCounter"

import "./style.css"

// Fallback asset import if logo-full.png isn't ready
import mascotUrl from "url:../assets/icon.png"

const storage = new Storage({ area: "local" })

export default function Popup() {
  const [activeThemeId, setActiveThemeId] = useState<string>("system")

  useEffect(() => {
    storage.get<Theme>("activeTheme").then((t) => {
      if (t) setActiveThemeId(t.id)
    })
  }, [])

  const applyTheme = (theme: Theme) => {
    setActiveThemeId(theme.id)
    storage.set("activeTheme", theme)
  }

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
      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider opacity-60 mb-3">
            Free Themes
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {DEFAULT_THEMES.map((theme) => {
              const isActive = activeThemeId === theme.id
              return (
                <button
                  key={theme.id}
                  onClick={() => applyTheme(theme)}
                  className={`
                    group relative flex flex-col items-start p-3 rounded-xl border transition-all duration-200 text-left
                    ${isActive 
                      ? "border-brand-teal bg-white shadow-md ring-1 ring-brand-teal transform scale-[1.02]" 
                      : "border-transparent bg-white/40 hover:bg-white hover:shadow-sm"
                    }
                  `}
                >
                  <div className="w-full h-12 rounded-lg mb-2 border border-brand-text/5 overflow-hidden relative">
                     <div className="absolute inset-0" style={{ backgroundColor: theme.colors["--cgpt-bg"] || '#eee' }} />
                  </div>
                  <span className="text-sm font-medium truncate w-full">{theme.name}</span>
                </button>
              )
            })}
          </div>
        </div>
      </main>

      {/* TOKEN COUNTER & FOOTER */}
      <div className="bg-white/50 border-t border-brand-text/10">
        <div className="px-4 pb-2">
            <TokenCounter />
        </div>
        <footer className="p-3 text-center border-t border-brand-text/5">
            <a href="https://themegpt.ai" target="_blank" className="text-xs font-medium text-brand-text/60 hover:text-brand-text">
            View Premium Catalog &rarr;
            </a>
        </footer>
      </div>
    </div>
  )
}
