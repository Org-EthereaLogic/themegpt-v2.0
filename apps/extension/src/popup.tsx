import { useState, useEffect } from "react"
import { Storage } from "@plasmohq/storage"
import { API_BASE_URL, DEFAULT_THEMES, type LicenseEntitlement, type Theme, type VerifyResponse } from "@themegpt/shared"
import { TokenCounter } from "./components/TokenCounter"

import "../style.css"

// ThemeGPT mascot logo
import mascotUrl from "url:../assets/mascot-32.png"

const storage = new Storage({ area: "local" })

// Environment-controlled: true in dev, false in production
const DEV_UNLOCK_ALL_PREMIUM = process.env.PLASMO_PUBLIC_DEV_UNLOCK_PREMIUM === 'true'

export default function Popup() {
  const [activeThemeId, setActiveThemeId] = useState<string>("system")
  // In dev mode, initialize with all premium theme IDs
  const [unlockedThemeIds, setUnlockedThemeIds] = useState<string[]>(
    DEV_UNLOCK_ALL_PREMIUM ? DEFAULT_THEMES.filter(t => t.isPremium).map(t => t.id) : []
  )
  
  // --- License Logic ---
  const [licenseKey, setLicenseKey] = useState("")
  const [entitlement, setEntitlement] = useState<LicenseEntitlement | null>(null)
  const [showLicenseInput, setShowLicenseInput] = useState(false)
  const [statusMsg, setStatusMsg] = useState("")
  const [slotError, setSlotError] = useState<string | null>(null)

  useEffect(() => {
    storage.get<Theme>("activeTheme").then((t) => {
      if (t) setActiveThemeId(t.id)
    })
    // In dev mode, skip loading stored unlock state to keep all premium themes unlocked
    if (!DEV_UNLOCK_ALL_PREMIUM) {
      storage.get<string[]>("unlockedThemes").then((ids) => {
        if (ids) setUnlockedThemeIds(ids)
      })
    }
    // Load saved license
    storage.get<string>("licenseKey").then((key) => {
      if (key) {
        setLicenseKey(key)
        validateLicense(key)
      }
    })
  }, [])

  const validateLicense = async (key: string) => {
    if (!key) return
    setStatusMsg("Validating...")
    try {
      const res = await fetch(`${API_BASE_URL}/api/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ licenseKey: key })
      })
      if (!res.ok) {
        setStatusMsg("Validation failed. Try again.")
        return
      }

      const data: VerifyResponse = await res.json()
      
      if (data.valid && data.entitlement) {
        setEntitlement(data.entitlement)
        setStatusMsg("License Active ✅")
        // Update local unlocked state based on entitlement
        updateUnlockedState(data.entitlement)
        storage.set("licenseKey", key)
        return
      }

      setEntitlement(null)
      setStatusMsg(`Error: ${data.message ?? "Invalid key"}`)
    } catch (e) {
      console.error(e)
      setStatusMsg("Connection Error")
    }
  }

  const updateUnlockedState = (ent: LicenseEntitlement) => {
    const unlocked: string[] = []
    if (ent.permanentlyUnlocked?.length) unlocked.push(...ent.permanentlyUnlocked)
    if (ent.activeSlotThemes?.length) unlocked.push(...ent.activeSlotThemes)
    setUnlockedThemeIds(unlocked)
    storage.set("unlockedThemes", unlocked)
  }

  const handleApply = (theme: Theme) => {
    setSlotError(null) // Clear any previous error
    // Check if unlocked
    if (!theme.isPremium || unlockedThemeIds.includes(theme.id)) {
      setActiveThemeId(theme.id)
      storage.set("activeTheme", theme)
      return
    }

    // Handle Subscription Slot Logic
    if (entitlement?.type === 'subscription') {
      const currentEntitlement = entitlement as LicenseEntitlement
      const currentSlots = currentEntitlement.activeSlotThemes ?? []
      if (currentSlots.length < entitlement.maxSlots) {
        const newSlots = [...currentSlots, theme.id]
        const newEntitlement: LicenseEntitlement = {
          ...currentEntitlement,
          activeSlotThemes: newSlots
        }
        setEntitlement(newEntitlement)
        updateUnlockedState(newEntitlement)
        
        setActiveThemeId(theme.id)
        storage.set("activeTheme", theme)
        storage.set("localEntitlement", newEntitlement)
        
        // Sync to server
        fetch(`${API_BASE_URL}/api/sync`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                licenseKey, 
                activeSlotThemes: newSlots 
            })
        }).catch(err => console.error("Sync failed", err))

        return
      } else {
        setSlotError(`Subscription limit reached (${entitlement.maxSlots} themes). Deactivate another theme via web settings to continue.`)
        return
      }
    }
    
    // Fallback: Open buy page
    window.open(`https://themegpt.ai/themes/${theme.id}`, '_blank')
  }

  const freeThemes = DEFAULT_THEMES.filter(t => !t.isPremium)
  const premiumThemes = DEFAULT_THEMES.filter(t => t.isPremium)

  return (
    <div className="flex flex-col h-full bg-brand-bg text-brand-text font-sans relative">
      {/* HEADER */}
      <header className="flex items-center gap-3 p-4 border-b border-brand-text/10 bg-white/50 backdrop-blur-sm sticky top-0 z-10">
        <img src={mascotUrl} alt="ThemeGPT" className="w-8 h-8" />
        <h1 className="text-lg font-bold tracking-tight">ThemeGPT</h1>
        <div className="ml-auto flex items-center gap-2">
           <button 
             onClick={() => setShowLicenseInput(!showLicenseInput)}
             className="text-xs font-medium text-brand-teal hover:text-brand-text transition-colors"
           >
             {entitlement ? "Premium" : "Activate"}
           </button>
          <div className="w-2 h-2 rounded-full bg-brand-teal shadow-[0_0_8px_rgba(126,206,197,0.8)]" title="Active" />
        </div>
      </header>
      
      {/* LICENSE INPUT DROPDOWN */}
      {showLicenseInput && (
        <div className="bg-white/90 p-4 border-b border-brand-text/10 animate-in slide-in-from-top-2">
            <h3 className="text-xs font-bold uppercase mb-2">License Key</h3>
            <div className="flex gap-2">
                <input 
                  value={licenseKey}
                  onChange={(e) => setLicenseKey(e.target.value)}
                  className="flex-1 text-xs p-2 rounded border border-brand-text/20"
                  placeholder="Enter key..."
                />
                <button 
                  onClick={() => validateLicense(licenseKey)}
                  className="bg-brand-teal text-white text-xs px-3 rounded font-bold"
                >
                  Verify
                </button>
            </div>
            {statusMsg && <div className="text-[10px] mt-1 opacity-70">{statusMsg}</div>}
            {entitlement?.type === 'subscription' && (
                <div className="text-[10px] mt-2 text-brand-text/60">
                    Slots Used: {(entitlement.activeSlotThemes?.length ?? 0)} / {entitlement.maxSlots}
                </div>
            )}
        </div>
      )}

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
                onSelect={() => handleApply(theme)}
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
                  onSelect={() => handleApply(theme)}
                />
              )
            })}
          </div>
        </section>

        {/* SLOT ERROR MESSAGE */}
        {slotError && (
          <div className="mt-4 p-3 rounded-lg bg-brand-peach/10 border border-brand-peach/30 text-brand-text text-xs" role="alert">
            {slotError}
          </div>
        )}
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

/**
 * Theme screenshot URL builder.
 * Screenshots should be 280x160px PNG files placed in apps/extension/assets/themes/
 * and named after theme IDs (e.g., vscode-dark-plus.png).
 *
 * If screenshots are not available, the ThemeCard will show a ChatGPT-style preview
 * mockup with animated effect indicators.
 */
function getThemeScreenshotUrl(themeId: string): string | null {
  // Check if chrome.runtime is available (not available in tests)
  if (typeof chrome !== 'undefined' && chrome.runtime?.getURL) {
    return chrome.runtime.getURL(`assets/themes/${themeId}.png`)
  }
  return null
}

// Helper to check if theme has animated effects
function hasAnimatedEffects(theme: Theme): boolean {
  return !!(
    theme.effects?.auroraGradient?.enabled ||
    theme.effects?.animatedSnowfall?.enabled ||
    theme.effects?.twinklingStars?.enabled ||
    theme.effects?.ambientEffects?.neonGrid ||
    theme.effects?.ambientEffects?.auroraWaves
  )
}

// Get effect type for display
function getEffectType(theme: Theme): string | null {
  if (theme.effects?.auroraGradient?.enabled) return "aurora"
  if (theme.effects?.animatedSnowfall?.enabled) return "snow"
  if (theme.effects?.twinklingStars?.enabled) return "stars"
  if (theme.effects?.ambientEffects?.neonGrid) return "neon"
  return null
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
  const [imgError, setImgError] = useState(false)
  const screenshotUrl = getThemeScreenshotUrl(theme.id)
  const hasScreenshot = screenshotUrl && !imgError
  const hasEffects = hasAnimatedEffects(theme)
  const effectType = getEffectType(theme)

  return (
    <button
      onClick={onSelect}
      aria-label={isLocked ? `${theme.name} - Premium, click to unlock` : `Apply ${theme.name} theme`}
      className={`
        group relative flex flex-col items-start p-2.5 rounded-xl border transition-all duration-200 text-left w-full
        ${isActive
          ? "border-brand-teal bg-white shadow-md ring-1 ring-brand-teal transform scale-[1.02]"
          : "border-transparent bg-white/40 hover:bg-white hover:shadow-sm"
        }
      `}
    >
      {/* Animated effect badge */}
      {hasEffects && (
        <div className="absolute top-1 right-1 z-20 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[8px] uppercase font-bold px-1.5 py-0.5 rounded-full shadow-sm flex items-center gap-0.5">
          <span className="animate-pulse">✨</span>
          <span>FX</span>
        </div>
      )}

      {/* Preview area - increased height */}
      <div className="w-full h-24 rounded-lg mb-2 border border-brand-text/5 overflow-hidden relative">
        {hasScreenshot ? (
          <img
            src={screenshotUrl}
            alt={`${theme.name} preview`}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          // ChatGPT-style mockup preview
          <div
            className="absolute inset-0 flex flex-col p-2 gap-1.5"
            style={{ backgroundColor: theme.colors["--cgpt-bg"] }}
          >
            {/* Animated effect overlay hints */}
            {hasEffects && (
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {effectType === "aurora" && (
                  <div className="absolute inset-0 opacity-25 bg-gradient-to-t from-transparent via-emerald-500/30 to-cyan-500/40 animate-pulse" />
                )}
                {effectType === "snow" && (
                  <>
                    <div className="absolute top-1 left-[15%] w-1 h-1 bg-white/50 rounded-full animate-bounce" style={{ animationDuration: '2s' }} />
                    <div className="absolute top-2 left-[45%] w-0.5 h-0.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0.3s', animationDuration: '2.2s' }} />
                    <div className="absolute top-0 left-[75%] w-1 h-1 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '0.7s', animationDuration: '1.8s' }} />
                  </>
                )}
                {effectType === "stars" && (
                  <>
                    <div className="absolute top-2 left-[20%] w-0.5 h-0.5 bg-white rounded-full animate-pulse" style={{ animationDuration: '1.5s' }} />
                    <div className="absolute top-4 left-[60%] w-1 h-1 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.5s', animationDuration: '2s' }} />
                    <div className="absolute top-1 left-[80%] w-0.5 h-0.5 bg-white rounded-full animate-pulse" style={{ animationDelay: '1s', animationDuration: '1.8s' }} />
                  </>
                )}
                {effectType === "neon" && (
                  <div className="absolute bottom-0 left-0 right-0 h-1/3 opacity-30 bg-gradient-to-t from-pink-500/40 to-transparent" />
                )}
              </div>
            )}

            {/* Mini chat bubble */}
            <div
              className="rounded-md px-2 py-1.5 text-[8px] leading-tight relative z-10"
              style={{
                backgroundColor: theme.colors["--cgpt-surface"],
                color: theme.colors["--cgpt-text"]
              }}
            >
              <span style={{ color: theme.colors["--cgpt-accent"] }} className="font-semibold">AI: </span>
              Hello! How can I help?
            </div>

            {/* Mini input field */}
            <div
              className="mt-auto rounded-full px-2 py-1 text-[7px] border relative z-10"
              style={{
                backgroundColor: theme.colors["--cgpt-surface"],
                color: theme.colors["--cgpt-text-muted"],
                borderColor: theme.colors["--cgpt-border"]
              }}
            >
              Message...
            </div>
          </div>
        )}

        {/* Lock overlay */}
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

      {/* Theme name and badges */}
      <div className="flex items-center justify-between w-full gap-1">
        <span className="text-xs font-medium truncate opacity-90">{theme.name}</span>
        <div className="flex items-center gap-1 flex-shrink-0">
          {effectType && (
            <span className="text-[9px] opacity-60" title={`${effectType} effect`}>
              {effectType === "aurora" && "🌌"}
              {effectType === "snow" && "❄️"}
              {effectType === "stars" && "⭐"}
              {effectType === "neon" && "🌆"}
            </span>
          )}
          {isLocked && (
            <span className="text-[9px] font-bold text-brand-text/40 bg-brand-text/5 px-1 py-0.5 rounded uppercase">
              Pro
            </span>
          )}
        </div>
      </div>
    </button>
  )
}
