import { useState, useEffect, useMemo } from "react"
import { Storage } from "@plasmohq/storage"
import { API_BASE_URL, DEFAULT_THEMES, type Theme } from "@themegpt/shared"
import { TokenCounter } from "./components/TokenCounter"

import "../style.css"

// ThemeGPT mascot logo
import mascotUrl from "url:../assets/mascot-32.png"

const storage = new Storage({ area: "local" })

// Environment-controlled: true in dev, false in production
const DEV_UNLOCK_ALL_PREMIUM = process.env.PLASMO_PUBLIC_DEV_UNLOCK_PREMIUM === 'true'

interface AccountStatus {
  connected: boolean
  email?: string
  hasSubscription: boolean
  isActive: boolean
  planType?: string
  isLifetime?: boolean
  accessibleThemes: string[]
  creditsRemaining?: number
}

export default function Popup() {
  const [activeThemeId, setActiveThemeId] = useState<string>("system")
  // In dev mode, initialize with all premium theme IDs
  const [unlockedThemeIds, setUnlockedThemeIds] = useState<string[]>(
    DEV_UNLOCK_ALL_PREMIUM ? DEFAULT_THEMES.filter(t => t.isPremium).map(t => t.id) : []
  )

  // --- Account Logic ---
  const [showAccountPanel, setShowAccountPanel] = useState(false)
  const [tokenInput, setTokenInput] = useState("")
  const [accountStatus, setAccountStatus] = useState<AccountStatus>({
    connected: false,
    hasSubscription: false,
    isActive: false,
    accessibleThemes: []
  })
  const [statusMsg, setStatusMsg] = useState("")
  const [slotError, setSlotError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

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
    // Load saved auth token and check status
    storage.get<string>("authToken").then((token) => {
      if (token) {
        checkAccountStatus(token)
      }
    })
  }, [])

  const checkAccountStatus = async (token: string) => {
    setIsLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/api/extension/status`, {
        headers: { "Authorization": `Bearer ${token}` }
      })

      if (!res.ok) {
        if (res.status === 401) {
          // Token expired, clear it
          await storage.remove("authToken")
          setAccountStatus({
            connected: false,
            hasSubscription: false,
            isActive: false,
            accessibleThemes: []
          })
          setStatusMsg("Session expired. Please reconnect.")
          return
        }
        throw new Error("Failed to check status")
      }

      const data = await res.json()

      if (data.success) {
        const newStatus: AccountStatus = {
          connected: true,
          email: data.user?.email,
          hasSubscription: data.hasSubscription,
          isActive: data.subscription?.isActive || false,
          planType: data.subscription?.planType,
          isLifetime: data.subscription?.isLifetime,
          accessibleThemes: data.accessibleThemes || [],
          creditsRemaining: data.subscription?.creditsRemaining
        }
        setAccountStatus(newStatus)

        // Update unlocked themes
        if (!DEV_UNLOCK_ALL_PREMIUM) {
          setUnlockedThemeIds(data.accessibleThemes || [])
          storage.set("unlockedThemes", data.accessibleThemes || [])
        }

        setStatusMsg(newStatus.isActive ? "Account Connected ✅" : "Account Connected")
      }
    } catch (e) {
      console.error("Status check error:", e)
      setStatusMsg("Connection Error")
    } finally {
      setIsLoading(false)
    }
  }

  const handleConnect = () => {
    // Open auth page in new tab
    window.open(`${API_BASE_URL}/auth/extension`, '_blank')
  }

  const handleTokenSubmit = async () => {
    if (!tokenInput.trim()) return

    setIsLoading(true)
    setStatusMsg("Connecting...")

    try {
      // Verify the token works
      const res = await fetch(`${API_BASE_URL}/api/extension/status`, {
        headers: { "Authorization": `Bearer ${tokenInput.trim()}` }
      })

      if (!res.ok) {
        setStatusMsg("Invalid token. Please try again.")
        setIsLoading(false)
        return
      }

      const data = await res.json()
      if (data.success) {
        // Save the token
        await storage.set("authToken", tokenInput.trim())
        setTokenInput("")

        // Update status
        await checkAccountStatus(tokenInput.trim())
        setStatusMsg("Account Connected ✅")
      } else {
        setStatusMsg("Connection failed. Please try again.")
      }
    } catch {
      setStatusMsg("Connection Error")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDisconnect = async () => {
    await storage.remove("authToken")
    await storage.remove("unlockedThemes")
    setAccountStatus({
      connected: false,
      hasSubscription: false,
      isActive: false,
      accessibleThemes: []
    })
    setUnlockedThemeIds([])
    setStatusMsg("")
  }

  const handleApply = async (theme: Theme) => {
    setSlotError(null) // Clear any previous error

    // Check if unlocked
    if (!theme.isPremium || unlockedThemeIds.includes(theme.id)) {
      setActiveThemeId(theme.id)
      storage.set("activeTheme", theme)
      return
    }

    // Premium theme - check if user has active subscription
    if (accountStatus.isActive) {
      // Check credits
      if (accountStatus.creditsRemaining !== undefined && accountStatus.creditsRemaining <= 0) {
        setSlotError("No downloads remaining this period. Manage your account at themegpt.ai")
        return
      }

      // Download the theme
      const token = await storage.get<string>("authToken")
      if (!token) {
        setSlotError("Please connect your account first.")
        return
      }

      try {
        const res = await fetch(`${API_BASE_URL}/api/extension/download`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ themeId: theme.id })
        })

        if (res.ok) {
          // Add theme to unlocked list
          const newUnlocked = [...unlockedThemeIds, theme.id]
          setUnlockedThemeIds(newUnlocked)
          storage.set("unlockedThemes", newUnlocked)

          // Apply the theme
          setActiveThemeId(theme.id)
          storage.set("activeTheme", theme)

          // Refresh status to update credits
          checkAccountStatus(token)
        } else {
          const data = await res.json()
          setSlotError(data.message || "Failed to unlock theme")
        }
      } catch {
        setSlotError("Connection error. Please try again.")
      }
      return
    }

    // Not subscribed - prompt to subscribe
    setSlotError("Subscribe to unlock premium themes!")
    window.open(`${API_BASE_URL}/#pricing`, '_blank')
  }

  const freeThemes = useMemo(() => DEFAULT_THEMES.filter(t => !t.isPremium), [])
  const premiumThemes = useMemo(() => DEFAULT_THEMES.filter(t => t.isPremium), [])

  return (
    <div className="flex flex-col h-full bg-cream text-brown font-sans relative">
      {/* HEADER */}
      <header className="flex items-center gap-3 p-4 border-b border-brown/10 bg-cream-warm sticky top-0 z-50">
        {/* Animated mascot matching website */}
        <div
          className="w-8 h-8 rounded-full relative animate-mascot-wobble"
          style={{
            background: 'conic-gradient(from 0deg, #E8A87C 0deg, #5BB5A2 120deg, #F4E4BA 240deg, #E8A87C 360deg)',
          }}
        >
          <div className="absolute inset-[3px] rounded-full bg-cream flex flex-col items-center justify-center">
            {/* Eyes - smaller to match website logo */}
            <div className="flex gap-[6px] mt-[2.5px]">
              <div className="w-1 h-1 rounded-full bg-brown animate-blink" />
              <div className="w-1 h-1 rounded-full bg-brown animate-blink" />
            </div>
            {/* Smile */}
            <div className="w-2.5 h-1 mt-[2.5px] border-b-[1.5px] border-brown rounded-b-full" />
          </div>
        </div>
        <h1 className="text-lg font-display font-semibold tracking-tight text-brown">ThemeGPT</h1>
        <div className="ml-auto flex items-center gap-2">
           <button
             onClick={() => setShowAccountPanel(!showAccountPanel)}
             className="text-xs font-medium text-teal hover:text-brown transition-colors"
           >
             {accountStatus.connected ? (accountStatus.isLifetime ? "Lifetime" : "Premium") : "Connect"}
           </button>
          {accountStatus.connected && (
            <div
              className={`w-2 h-2 rounded-full ${accountStatus.isActive ? 'bg-teal shadow-[0_0_8px_rgba(91,181,162,0.8)]' : 'bg-coral'}`}
              title={accountStatus.isActive ? "Active" : "Connected"}
            />
          )}
        </div>
      </header>

      {/* ACCOUNT PANEL */}
      {showAccountPanel && (
        <div className="bg-cream-warm/95 p-4 border-b border-brown/10 animate-slide-in">
          {accountStatus.connected ? (
            <>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-brown-soft">Account</h3>
                <button
                  onClick={handleDisconnect}
                  className="text-[10px] text-coral-bright hover:text-coral font-medium transition-colors"
                >
                  Disconnect
                </button>
              </div>
              <div className="text-xs text-brown-soft mb-2">{accountStatus.email}</div>
              {accountStatus.hasSubscription && (
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] px-2.5 py-1 rounded-full font-medium ${
                    accountStatus.isLifetime
                      ? 'bg-gradient-to-r from-teal to-teal-bright text-white'
                      : accountStatus.isActive
                        ? 'bg-teal/10 text-teal'
                        : 'bg-coral/10 text-coral'
                  }`}>
                    {accountStatus.isLifetime ? 'Lifetime Access' : accountStatus.planType === 'yearly' ? 'Yearly' : 'Monthly'}
                  </span>
                  {accountStatus.isActive && !accountStatus.isLifetime && accountStatus.creditsRemaining !== undefined && (
                    <span className="text-[10px] text-brown-soft">
                      {accountStatus.creditsRemaining} downloads left
                    </span>
                  )}
                </div>
              )}
              {!accountStatus.hasSubscription && (
                <button
                  onClick={() => window.open(`${API_BASE_URL}/#pricing`, '_blank')}
                  className="mt-3 text-xs bg-teal text-white px-4 py-2 rounded-button font-semibold hover:translate-y-[-1px] hover:shadow-button transition-all duration-300"
                >
                  Subscribe
                </button>
              )}
            </>
          ) : (
            <>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-brown-soft mb-2">Connect Account</h3>
              <p className="text-[10px] text-brown-soft mb-3">
                Sign in to access your premium themes and subscription.
              </p>
              <button
                onClick={handleConnect}
                disabled={isLoading}
                className="w-full bg-teal text-white text-sm py-2.5 rounded-button font-semibold hover:translate-y-[-1px] hover:shadow-button transition-all duration-300 disabled:opacity-50 mb-3"
              >
                {isLoading ? "Connecting..." : "Connect with Google/GitHub"}
              </button>

              <div className="relative my-3">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-brown/10"></div>
                </div>
                <div className="relative flex justify-center text-[10px]">
                  <span className="bg-cream-warm px-2 text-brown-soft">or paste token</span>
                </div>
              </div>

              <div className="flex gap-2">
                <input
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  className="flex-1 text-xs p-2.5 rounded-button border border-brown/15 bg-white focus:outline-none focus:ring-2 focus:ring-teal/30 transition-all"
                  placeholder="Paste token..."
                />
                <button
                  onClick={handleTokenSubmit}
                  disabled={isLoading || !tokenInput.trim()}
                  className="bg-brown text-cream text-xs px-4 rounded-button font-semibold hover:bg-brown-soft disabled:opacity-50 transition-colors"
                >
                  Go
                </button>
              </div>
              {statusMsg && <div className="text-[10px] mt-2 text-brown-soft">{statusMsg}</div>}
            </>
          )}
        </div>
      )}

      {/* THEME GRID */}
      <main className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* FREE TIER */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-brown-soft mb-3 flex items-center gap-2">
            <span>Free Collection</span>
            <span className="bg-teal/10 text-teal px-2 py-0.5 rounded-full text-[10px] font-semibold">
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
          <h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-brown-soft mb-3 flex items-center gap-2">
            <span>Premium Collection</span>
            <span className="bg-coral/10 text-coral px-2 py-0.5 rounded-full text-[10px] font-semibold">
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
          <div className="mt-4 p-3 rounded-card bg-coral/10 border border-coral/30 text-brown text-xs" role="alert">
            {slotError}
          </div>
        )}
      </main>

      {/* TOKEN COUNTER & FOOTER */}
      <div className="bg-cream-warm/60 border-t border-brown/10">
        <div className="px-4 pb-2">
            <TokenCounter />
        </div>
        <footer className="p-3 text-center border-t border-brown/5">
            <a
              href={`${API_BASE_URL}/account`}
              target="_blank"
              className="group inline-flex items-center gap-1 text-xs font-medium text-brown-soft hover:text-brown transition-colors"
            >
              Manage Account
              <span className="group-hover:translate-x-0.5 transition-transform">&rarr;</span>
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
        group relative flex flex-col items-start p-2.5 rounded-card border transition-all duration-300 text-left w-full
        ${isActive
          ? "border-teal bg-white shadow-card-hover ring-2 ring-teal/30 transform scale-[1.02]"
          : "border-transparent bg-white/60 hover:bg-white hover:shadow-card hover:scale-[1.01]"
        }
      `}
    >
      {/* Animated effect badge */}
      {hasEffects && (
        <div className="absolute top-1 right-1 z-20 bg-gradient-to-r from-coral to-coral-bright text-white text-[8px] uppercase font-bold px-1.5 py-0.5 rounded-full shadow-sm flex items-center gap-0.5 animate-badge-float">
          <span>✨</span>
          <span>FX</span>
        </div>
      )}

      {/* Preview area - increased height */}
      <div className="w-full h-24 rounded-[16px] mb-2 border border-brown/5 overflow-hidden relative">
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
        <span className="text-xs font-medium truncate text-brown">{theme.name}</span>
        <div className="flex items-center gap-1 flex-shrink-0">
          {effectType && (
            <span className="text-[9px] text-brown-soft" title={`${effectType} effect`}>
              {effectType === "aurora" && "🌌"}
              {effectType === "snow" && "❄️"}
              {effectType === "stars" && "⭐"}
              {effectType === "neon" && "🌆"}
            </span>
          )}
          {isLocked && (
            <span className="text-[9px] font-semibold text-coral bg-coral/10 px-1.5 py-0.5 rounded-full uppercase">
              Pro
            </span>
          )}
        </div>
      </div>
    </button>
  )
}
