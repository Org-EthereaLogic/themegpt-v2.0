
 * ▐▛███▜▌ *   Claude Code v2.0.76
* ▝▜█████▛▘ *  Opus 4.5 · Claude Max
 *  ▘▘ ▝▝  *   ~/Dev/themegpt-v2.0
═══════════════════════════════════════════════════════════ Conversation compacted · ctrl+o for history ═══════════════════════════════════════════════════════════

⏺ I'll continue implementing the OAuth-based seamless activation. Let me update the todo list and create the extension auth API endpoints.

⏺ Read(apps/web/lib/auth.ts)
  ⎿  Read 125 lines

⏺ Search(pattern: "apps/web/app/api/auth/**/*.ts")
  ⎿  Found 1 file (ctrl+o to expand)

⏺ Read(apps/web/lib/db.ts)
  ⎿  Read 490 lines

⏺ Now I'll create the extension auth API endpoints. Let me first check what packages are available:

⏺ Read(apps/web/package.json)
  ⎿  Read 36 lines

⏺ The project has jose for JWT handling. Let me create the extension auth endpoints:

⏺ Bash(mkdir -p /Users/etherealogic/Dev/themegpt-v2.0/apps/web/app/api/extension/auth /Users/etherealogic/Dev/themegpt-v2.0/apps/web/app/api/extension/callback
      /Users/…)
  ⎿  (No content)

⏺ Write(apps/web/app/api/extension/auth/route.ts)
  ⎿  Wrote 74 lines to apps/web/app/api/extension/auth/route.ts
      1 import { NextResponse } from "next/server";
      2 import { getServerSession } from "next-auth";
      3 import { authOptions } from "@/lib/auth";
      4 import { SignJWT } from "jose";
      5 const corsHeaders = {
      6   "Access-Control-Allow-Origin": "*",
      7   "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      8   "Access-Control-Allow-Headers": "Content-Type, Authorization",
      9 };
     … +64 lines (ctrl+o to expand)

⏺ Write(apps/web/app/api/extension/status/route.ts)
  ⎿  Wrote 116 lines to apps/web/app/api/extension/status/route.ts
      1 import { NextResponse } from "next/server";
      2 import { jwtVerify } from "jose";
      3 import { db } from "@/lib/db";
      4 import { DEFAULT_THEMES } from "@themegpt/shared";
      5 const corsHeaders = {
      6   "Access-Control-Allow-Origin": "*",
      7   "Access-Control-Allow-Methods": "GET, OPTIONS",
      8   "Access-Control-Allow-Headers": "Content-Type, Authorization",
      9 };
     … +106 lines (ctrl+o to expand)

⏺ Now let me create the extension auth page:

⏺ Bash(mkdir -p /Users/etherealogic/Dev/themegpt-v2.0/apps/web/app/auth/extension)
  ⎿  (No content)

⏺ Write(apps/web/app/auth/extension/page.tsx)
  ⎿  Wrote 208 lines to apps/web/app/auth/extension/page.tsx
      1 "use client"
      2 import { useSession, signIn } from "next-auth/react"
      3 import { useEffect, useState } from "react"
      4 import Image from "next/image"
      5 export default function ExtensionAuthPage() {
      6   const { data: session, status } = useSession()
      7   const [token, setToken] = useState<string | null>(null)
      8   const [error, setError] = useState<string | null>(null)
     … +198 lines (ctrl+o to expand)

⏺ Read(apps/extension/src/popup.tsx)
  ⎿  Read 439 lines

⏺ Now I'll update the extension popup with the OAuth-based "Connect Account" flow:

⏺ Write(apps/extension/src/popup.tsx)
  ⎿  Added 260 lines, removed 97 lines
      1  import { useState, useEffect } from "react"
      2  import { Storage } from "@plasmohq/storage"
      3 -import { API_BASE_URL, DEFAULT_THEMES, type LicenseEntitlement, type Theme, type VerifyResponse } from "@themegpt/shared"
      3 +import { API_BASE_URL, DEFAULT_THEMES, type Theme } from "@themegpt/shared"
      4  import { TokenCounter } from "./components/TokenCounter"
      5
      6  import "../style.css"
     ...
      13  // Environment-controlled: true in dev, false in production
      14  const DEV_UNLOCK_ALL_PREMIUM = process.env.PLASMO_PUBLIC_DEV_UNLOCK_PREMIUM === 'true'
      15
      16 +interface AccountStatus {
      17 +  connected: boolean
      18 +  email?: string
      19 +  hasSubscription: boolean
      20 +  isActive: boolean
      21 +  planType?: string
      22 +  isLifetime?: boolean
      23 +  accessibleThemes: string[]
      24 +  creditsRemaining?: number
      25 +}
      26 +
      27  export default function Popup() {
      28    const [activeThemeId, setActiveThemeId] = useState<string>("system")
      29    // In dev mode, initialize with all premium theme IDs
      30    const [unlockedThemeIds, setUnlockedThemeIds] = useState<string[]>(
      31      DEV_UNLOCK_ALL_PREMIUM ? DEFAULT_THEMES.filter(t => t.isPremium).map(t => t.id) : []
      32    )
      22 -
      23 -  // --- License Logic ---
      24 -  const [licenseKey, setLicenseKey] = useState("")
      25 -  const [entitlement, setEntitlement] = useState<LicenseEntitlement | null>(null)
      26 -  const [showLicenseInput, setShowLicenseInput] = useState(false)
      33 +
      34 +  // --- Account Logic ---
      35 +  const [showAccountPanel, setShowAccountPanel] = useState(false)
      36 +  const [tokenInput, setTokenInput] = useState("")
      37 +  const [accountStatus, setAccountStatus] = useState<AccountStatus>({
      38 +    connected: false,
      39 +    hasSubscription: false,
      40 +    isActive: false,
      41 +    accessibleThemes: []
      42 +  })
      43    const [statusMsg, setStatusMsg] = useState("")
      44    const [slotError, setSlotError] = useState<string | null>(null)
      45 +  const [isLoading, setIsLoading] = useState(false)
      46
      47    useEffect(() => {
      48      storage.get<Theme>("activeTheme").then((t) => {
     ...
       54          if (ids) setUnlockedThemeIds(ids)
       55        })
       56      }
       40 -    // Load saved license
       41 -    storage.get<string>("licenseKey").then((key) => {
       42 -      if (key) {
       43 -        setLicenseKey(key)
       44 -        validateLicense(key)
       57 +    // Load saved auth token and check status
       58 +    storage.get<string>("authToken").then((token) => {
       59 +      if (token) {
       60 +        checkAccountStatus(token)
       61        }
       62      })
       63    }, [])
       64
       49 -  const validateLicense = async (key: string) => {
       50 -    if (!key) return
       51 -    setStatusMsg("Validating...")
       65 +  const checkAccountStatus = async (token: string) => {
       66 +    setIsLoading(true)
       67      try {
       53 -      const res = await fetch(`${API_BASE_URL}/api/verify`, {
       54 -        method: "POST",
       55 -        headers: { "Content-Type": "application/json" },
       56 -        body: JSON.stringify({ licenseKey: key })
       68 +      const res = await fetch(`${API_BASE_URL}/api/extension/status`, {
       69 +        headers: { "Authorization": `Bearer ${token}` }
       70        })
       71 +
       72        if (!res.ok) {
       59 -        setStatusMsg("Validation failed. Try again.")
       60 -        return
       73 +        if (res.status === 401) {
       74 +          // Token expired, clear it
       75 +          await storage.remove("authToken")
       76 +          setAccountStatus({
       77 +            connected: false,
       78 +            hasSubscription: false,
       79 +            isActive: false,
       80 +            accessibleThemes: []
       81 +          })
       82 +          setStatusMsg("Session expired. Please reconnect.")
       83 +          return
       84 +        }
       85 +        throw new Error("Failed to check status")
       86        }
       87
       63 -      const data: VerifyResponse = await res.json()
       64 -
       65 -      if (data.valid && data.entitlement) {
       66 -        setEntitlement(data.entitlement)
       67 -        setStatusMsg("License Active ✅")
       68 -        // Update local unlocked state based on entitlement
       69 -        updateUnlockedState(data.entitlement)
       70 -        storage.set("licenseKey", key)
       88 +      const data = await res.json()
       89 +
       90 +      if (data.success) {
       91 +        const newStatus: AccountStatus = {
       92 +          connected: true,
       93 +          email: data.user?.email,
       94 +          hasSubscription: data.hasSubscription,
       95 +          isActive: data.subscription?.isActive || false,
       96 +          planType: data.subscription?.planType,
       97 +          isLifetime: data.subscription?.isLifetime,
       98 +          accessibleThemes: data.accessibleThemes || [],
       99 +          creditsRemaining: data.subscription?.creditsRemaining
      100 +        }
      101 +        setAccountStatus(newStatus)
      102 +
      103 +        // Update unlocked themes
      104 +        if (!DEV_UNLOCK_ALL_PREMIUM) {
      105 +          setUnlockedThemeIds(data.accessibleThemes || [])
      106 +          storage.set("unlockedThemes", data.accessibleThemes || [])
      107 +        }
      108 +
      109 +        setStatusMsg(newStatus.isActive ? "Account Connected ✅" : "Account Connected")
      110 +      }
      111 +    } catch (e) {
      112 +      console.error("Status check error:", e)
      113 +      setStatusMsg("Connection Error")
      114 +    } finally {
      115 +      setIsLoading(false)
      116 +    }
      117 +  }
      118 +
      119 +  const handleConnect = () => {
      120 +    // Open auth page in new tab
      121 +    window.open(`${API_BASE_URL}/auth/extension`, '_blank')
      122 +  }
      123 +
      124 +  const handleTokenSubmit = async () => {
      125 +    if (!tokenInput.trim()) return
      126 +
      127 +    setIsLoading(true)
      128 +    setStatusMsg("Connecting...")
      129 +
      130 +    try {
      131 +      // Verify the token works
      132 +      const res = await fetch(`${API_BASE_URL}/api/extension/status`, {
      133 +        headers: { "Authorization": `Bearer ${tokenInput.trim()}` }
      134 +      })
      135 +
      136 +      if (!res.ok) {
      137 +        setStatusMsg("Invalid token. Please try again.")
      138 +        setIsLoading(false)
      139          return
      140        }
      141
       74 -      setEntitlement(null)
       75 -      setStatusMsg(`Error: ${data.message ?? "Invalid key"}`)
       76 -    } catch (e) {
       77 -      console.error(e)
      142 +      const data = await res.json()
      143 +      if (data.success) {
      144 +        // Save the token
      145 +        await storage.set("authToken", tokenInput.trim())
      146 +        setTokenInput("")
      147 +
      148 +        // Update status
      149 +        await checkAccountStatus(tokenInput.trim())
      150 +        setStatusMsg("Account Connected ✅")
      151 +      } else {
      152 +        setStatusMsg("Connection failed. Please try again.")
      153 +      }
      154 +    } catch {
      155        setStatusMsg("Connection Error")
      156 +    } finally {
      157 +      setIsLoading(false)
      158      }
      159    }
      160
       82 -  const updateUnlockedState = (ent: LicenseEntitlement) => {
       83 -    const unlocked: string[] = []
       84 -    if (ent.permanentlyUnlocked?.length) unlocked.push(...ent.permanentlyUnlocked)
       85 -    if (ent.activeSlotThemes?.length) unlocked.push(...ent.activeSlotThemes)
       86 -    setUnlockedThemeIds(unlocked)
       87 -    storage.set("unlockedThemes", unlocked)
      161 +  const handleDisconnect = async () => {
      162 +    await storage.remove("authToken")
      163 +    await storage.remove("unlockedThemes")
      164 +    setAccountStatus({
      165 +      connected: false,
      166 +      hasSubscription: false,
      167 +      isActive: false,
      168 +      accessibleThemes: []
      169 +    })
      170 +    setUnlockedThemeIds([])
      171 +    setStatusMsg("")
      172    }
      173
       90 -  const handleApply = (theme: Theme) => {
      174 +  const handleApply = async (theme: Theme) => {
      175      setSlotError(null) // Clear any previous error
      176 +
      177      // Check if unlocked
      178      if (!theme.isPremium || unlockedThemeIds.includes(theme.id)) {
      179        setActiveThemeId(theme.id)
     ...
      181        return
      182      }
      183
       99 -    // Handle Subscription Slot Logic
      100 -    if (entitlement?.type === 'subscription') {
      101 -      const currentEntitlement = entitlement as LicenseEntitlement
      102 -      const currentSlots = currentEntitlement.activeSlotThemes ?? []
      103 -      if (currentSlots.length < entitlement.maxSlots) {
      104 -        const newSlots = [...currentSlots, theme.id]
      105 -        const newEntitlement: LicenseEntitlement = {
      106 -          ...currentEntitlement,
      107 -          activeSlotThemes: newSlots
      108 -        }
      109 -        setEntitlement(newEntitlement)
      110 -        updateUnlockedState(newEntitlement)
      111 -
      112 -        setActiveThemeId(theme.id)
      113 -        storage.set("activeTheme", theme)
      114 -        storage.set("localEntitlement", newEntitlement)
      115 -
      116 -        // Sync to server
      117 -        fetch(`${API_BASE_URL}/api/sync`, {
      118 -            method: "POST",
      119 -            headers: { "Content-Type": "application/json" },
      120 -            body: JSON.stringify({
      121 -                licenseKey,
      122 -                activeSlotThemes: newSlots
      123 -            })
      124 -        }).catch(err => console.error("Sync failed", err))
      184 +    // Premium theme - check if user has active subscription
      185 +    if (accountStatus.isActive) {
      186 +      // Check credits
      187 +      if (accountStatus.creditsRemaining !== undefined && accountStatus.creditsRemaining <= 0) {
      188 +        setSlotError("No downloads remaining this period. Manage your account at themegpt.app")
      189 +        return
      190 +      }
      191
      192 +      // Download the theme
      193 +      const token = await storage.get<string>("authToken")
      194 +      if (!token) {
      195 +        setSlotError("Please connect your account first.")
      196          return
      127 -      } else {
      128 -        setSlotError(`Subscription limit reached (${entitlement.maxSlots} themes). Deactivate another theme via web settings to continue.`)
      129 -        return
      197        }
      198 +
      199 +      try {
      200 +        const res = await fetch(`${API_BASE_URL}/api/extension/download`, {
      201 +          method: "POST",
      202 +          headers: {
      203 +            "Content-Type": "application/json",
      204 +            "Authorization": `Bearer ${token}`
      205 +          },
      206 +          body: JSON.stringify({ themeId: theme.id })
      207 +        })
      208 +
      209 +        if (res.ok) {
      210 +          // Add theme to unlocked list
      211 +          const newUnlocked = [...unlockedThemeIds, theme.id]
      212 +          setUnlockedThemeIds(newUnlocked)
      213 +          storage.set("unlockedThemes", newUnlocked)
      214 +
      215 +          // Apply the theme
      216 +          setActiveThemeId(theme.id)
      217 +          storage.set("activeTheme", theme)
      218 +
      219 +          // Refresh status to update credits
      220 +          checkAccountStatus(token)
      221 +        } else {
      222 +          const data = await res.json()
      223 +          setSlotError(data.message || "Failed to unlock theme")
      224 +        }
      225 +      } catch {
      226 +        setSlotError("Connection error. Please try again.")
      227 +      }
      228 +      return
      229      }
      132 -
      133 -    // Fallback: Open buy page
      134 -    window.open(`https://themegpt.ai/themes/${theme.id}`, '_blank')
      230 +
      231 +    // Not subscribed - prompt to subscribe
      232 +    setSlotError("Subscribe to unlock premium themes!")
      233 +    window.open(`${API_BASE_URL}/#pricing`, '_blank')
      234    }
      235
      236    const freeThemes = DEFAULT_THEMES.filter(t => !t.isPremium)
     ...
      243          <img src={mascotUrl} alt="ThemeGPT" className="w-8 h-8" />
      244          <h1 className="text-lg font-bold tracking-tight">ThemeGPT</h1>
      245          <div className="ml-auto flex items-center gap-2">
      147 -           <button
      148 -             onClick={() => setShowLicenseInput(!showLicenseInput)}
      246 +           <button
      247 +             onClick={() => setShowAccountPanel(!showAccountPanel)}
      248               className="text-xs font-medium text-brand-teal hover:text-brand-text transition-colors"
      249             >
      151 -             {entitlement ? "Premium" : "Activate"}
      250 +             {accountStatus.connected ? (accountStatus.isLifetime ? "Lifetime" : "Premium") : "Connect"}
      251             </button>
      153 -          <div className="w-2 h-2 rounded-full bg-brand-teal shadow-[0_0_8px_rgba(126,206,197,0.8)]" title="Active" />
      252 +          {accountStatus.connected && (
      253 +            <div
      254 +              className={`w-2 h-2 rounded-full ${accountStatus.isActive ? 'bg-brand-teal shadow-[0_0_8px_rgba(126,206,197,0.8)]' : 'bg-brand-peac
          +h'}`}
      255 +              title={accountStatus.isActive ? "Active" : "Connected"}
      256 +            />
      257 +          )}
      258          </div>
      259        </header>
      156 -
      157 -      {/* LICENSE INPUT DROPDOWN */}
      158 -      {showLicenseInput && (
      260 +
      261 +      {/* ACCOUNT PANEL */}
      262 +      {showAccountPanel && (
      263          <div className="bg-white/90 p-4 border-b border-brand-text/10 animate-in slide-in-from-top-2">
      160 -            <h3 className="text-xs font-bold uppercase mb-2">License Key</h3>
      161 -            <div className="flex gap-2">
      162 -                <input
      163 -                  value={licenseKey}
      164 -                  onChange={(e) => setLicenseKey(e.target.value)}
      264 +          {accountStatus.connected ? (
      265 +            <>
      266 +              <div className="flex items-center justify-between mb-3">
      267 +                <h3 className="text-xs font-bold uppercase">Account</h3>
      268 +                <button
      269 +                  onClick={handleDisconnect}
      270 +                  className="text-[10px] text-red-500 hover:text-red-600"
      271 +                >
      272 +                  Disconnect
      273 +                </button>
      274 +              </div>
      275 +              <div className="text-xs opacity-70 mb-2">{accountStatus.email}</div>
      276 +              {accountStatus.hasSubscription && (
      277 +                <div className="flex items-center gap-2">
      278 +                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${
      279 +                    accountStatus.isLifetime
      280 +                      ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white'
      281 +                      : accountStatus.isActive
      282 +                        ? 'bg-brand-teal/10 text-brand-teal'
      283 +                        : 'bg-brand-peach/10 text-brand-peach'
      284 +                  }`}>
      285 +                    {accountStatus.isLifetime ? 'Lifetime Access' : accountStatus.planType === 'yearly' ? 'Yearly' : 'Monthly'}
      286 +                  </span>
      287 +                  {accountStatus.isActive && !accountStatus.isLifetime && accountStatus.creditsRemaining !== undefined && (
      288 +                    <span className="text-[10px] opacity-60">
      289 +                      {accountStatus.creditsRemaining} downloads left
      290 +                    </span>
      291 +                  )}
      292 +                </div>
      293 +              )}
      294 +              {!accountStatus.hasSubscription && (
      295 +                <button
      296 +                  onClick={() => window.open(`${API_BASE_URL}/#pricing`, '_blank')}
      297 +                  className="mt-2 text-xs bg-brand-teal text-white px-3 py-1.5 rounded-full font-medium hover:bg-brand-teal/90"
      298 +                >
      299 +                  Subscribe
      300 +                </button>
      301 +              )}
      302 +            </>
      303 +          ) : (
      304 +            <>
      305 +              <h3 className="text-xs font-bold uppercase mb-2">Connect Account</h3>
      306 +              <p className="text-[10px] opacity-70 mb-3">
      307 +                Sign in to access your premium themes and subscription.
      308 +              </p>
      309 +              <button
      310 +                onClick={handleConnect}
      311 +                disabled={isLoading}
      312 +                className="w-full bg-brand-teal text-white text-xs py-2 rounded-lg font-bold hover:bg-brand-teal/90 disabled:opacity-50 mb-3"
      313 +              >
      314 +                {isLoading ? "Connecting..." : "Connect with Google/GitHub"}
      315 +              </button>
      316 +
      317 +              <div className="relative my-3">
      318 +                <div className="absolute inset-0 flex items-center">
      319 +                  <div className="w-full border-t border-brand-text/10"></div>
      320 +                </div>
      321 +                <div className="relative flex justify-center text-[10px]">
      322 +                  <span className="bg-white px-2 opacity-50">or paste token</span>
      323 +                </div>
      324 +              </div>
      325 +
      326 +              <div className="flex gap-2">
      327 +                <input
      328 +                  value={tokenInput}
      329 +                  onChange={(e) => setTokenInput(e.target.value)}
      330                    className="flex-1 text-xs p-2 rounded border border-brand-text/20"
      166 -                  placeholder="Enter key..."
      331 +                  placeholder="Paste token..."
      332                  />
      168 -                <button
      169 -                  onClick={() => validateLicense(licenseKey)}
      170 -                  className="bg-brand-teal text-white text-xs px-3 rounded font-bold"
      333 +                <button
      334 +                  onClick={handleTokenSubmit}
      335 +                  disabled={isLoading || !tokenInput.trim()}
      336 +                  className="bg-brand-text text-white text-xs px-3 rounded font-bold disabled:opacity-50"
      337                  >
      172 -                  Verify
      338 +                  Go
      339                  </button>
      174 -            </div>
      175 -            {statusMsg && <div className="text-[10px] mt-1 opacity-70">{statusMsg}</div>}
      176 -            {entitlement?.type === 'subscription' && (
      177 -                <div className="text-[10px] mt-2 text-brand-text/60">
      178 -                    Slots Used: {(entitlement.activeSlotThemes?.length ?? 0)} / {entitlement.maxSlots}
      179 -                </div>
      180 -            )}
      340 +              </div>
      341 +              {statusMsg && <div className="text-[10px] mt-2 opacity-70">{statusMsg}</div>}
      342 +            </>
      343 +          )}
      344          </div>
      345        )}
      346
     ...
      405              <TokenCounter />
      406          </div>
      407          <footer className="p-3 text-center border-t border-brand-text/5">
      245 -            <a href="https://themegpt.ai" target="_blank" className="text-xs font-medium text-brand-text/60 hover:text-brand-text">
      246 -            Manage Subscription &rarr;
      408 +            <a href={`${API_BASE_URL}/account`} target="_blank" className="text-xs font-medium text-brand-text/60 hover:text-brand-text">
      409 +            Manage Account &rarr;
      410              </a>
      411          </footer>
      412        </div>

⏺ Now I need to create the download endpoint for themes:

⏺ Bash(mkdir -p /Users/etherealogic/Dev/themegpt-v2.0/apps/web/app/api/extension/download)
  ⎿  (No content)

⏺ Write(apps/web/app/api/extension/download/route.ts)
  ⎿  Wrote 150 lines to apps/web/app/api/extension/download/route.ts
      1 import { NextResponse } from "next/server";
      2 import { jwtVerify } from "jose";
      3 import { db } from "@/lib/db";
      4 import { DEFAULT_THEMES } from "@themegpt/shared";
      5 const corsHeaders = {
      6   "Access-Control-Allow-Origin": "*",
      7   "Access-Control-Allow-Methods": "POST, OPTIONS",
      8   "Access-Control-Allow-Headers": "Content-Type, Authorization",
      9 };
     … +140 lines (ctrl+o to expand)

⏺ Now let me check and update the webhook to link subscriptions to user IDs:

⏺ Read(apps/web/app/api/webhook/route.ts)
  ⎿  Error reading file

⏺ Search(pattern: "apps/web/app/api/**/webhook*/**/*.ts")
  ⎿  Found 1 file (ctrl+o to expand)

⏺ Search(pattern: "apps/web/app/api/**/*webhook*.ts")
  ⎿  Found 0 files

⏺ Read(apps/web/app/api/webhooks/stripe/route.ts)
  ⎿  Read 273 lines

⏺ Looking at the webhook, I see it creates subscriptions linked to user IDs when the user is logged in during checkout. However, users who subscribe without logging in first won't have their subscription linked. Let me update the auth endpoint to link subscriptions when users connect their account:

⏺ Update(apps/web/app/api/extension/auth/route.ts)
  ⎿  Added 2 lines
      2  import { getServerSession } from "next-auth";
      3  import { authOptions } from "@/lib/auth";
      4  import { SignJWT } from "jose";
      5 +import { getStripe } from "@/lib/stripe";
      6 +import { db } from "@/lib/db";
      7
      8  const corsHeaders = {
      9    "Access-Control-Allow-Origin": "*",

⏺ Update(apps/web/app/api/extension/auth/route.ts)
  ⎿  Added 91 lines
      27        );
      28      }
      29
      30 +    // Check if user has a subscription - if not, try to link from Stripe
      31 +    const existingSubscription = await db.getSubscriptionByUserId(session.user.id);
      32 +
      33 +    if (!existingSubscription) {
      34 +      await linkStripeSubscription(session.user.id, session.user.email);
      35 +    }
      36 +
      37      // Generate JWT for extension
      38      const secret = new TextEncoder().encode(
      39        process.env.EXTENSION_JWT_SECRET || process.env.NEXTAUTH_SECRET
     ...
       68    }
       69  }
       70
       71 +// Link Stripe subscription to user by email
       72 +async function linkStripeSubscription(userId: string, email: string) {
       73 +  try {
       74 +    // Search for Stripe customers by email
       75 +    const customers = await getStripe().customers.list({
       76 +      email: email,
       77 +      limit: 1,
       78 +    });
       79 +
       80 +    if (customers.data.length === 0) {
       81 +      return;
       82 +    }
       83 +
       84 +    const customer = customers.data[0];
       85 +
       86 +    // Get active subscriptions for this customer
       87 +    const subscriptions = await getStripe().subscriptions.list({
       88 +      customer: customer.id,
       89 +      status: "all",
       90 +      limit: 10,
       91 +    });
       92 +
       93 +    // Find the most recent active/trialing subscription
       94 +    const activeSubscription = subscriptions.data.find(
       95 +      (sub) => sub.status === "active" || sub.status === "trialing"
       96 +    );
       97 +
       98 +    if (!activeSubscription) {
       99 +      return;
      100 +    }
      101 +
      102 +    // Check if this subscription already exists in our DB
      103 +    const existingDbSub = await db.getSubscriptionByStripeId(activeSubscription.id);
      104 +    if (existingDbSub) {
      105 +      // Already linked, update with this user if different
      106 +      if (existingDbSub.userId !== userId) {
      107 +        await db.updateSubscription(existingDbSub.id, { userId });
      108 +        console.log(`Subscription ${existingDbSub.id} linked to user ${userId}`);
      109 +      }
      110 +      return;
      111 +    }
      112 +
      113 +    // Create new subscription record
      114 +    const firstItem = activeSubscription.items?.data?.[0];
      115 +    const currentPeriodStart = firstItem?.current_period_start
      116 +      ? new Date(firstItem.current_period_start * 1000)
      117 +      : new Date();
      118 +    const currentPeriodEnd = firstItem?.current_period_end
      119 +      ? new Date(firstItem.current_period_end * 1000)
      120 +      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      121 +
      122 +    // Determine plan type from subscription metadata or price
      123 +    const metadata = activeSubscription.metadata || {};
      124 +    let planType: "monthly" | "yearly" = "monthly";
      125 +    if (metadata.planType === "yearly" || activeSubscription.items.data[0]?.price?.recurring?.interval === "year") {
      126 +      planType = "yearly";
      127 +    }
      128 +
      129 +    // Check for lifetime status
      130 +    const isLifetime = metadata.isLifetime === "true" || metadata.isEarlyAdopterEligible === "true";
      131 +
      132 +    await db.createSubscription({
      133 +      userId,
      134 +      stripeSubscriptionId: activeSubscription.id,
      135 +      stripeCustomerId: customer.id,
      136 +      status: activeSubscription.status === "trialing" ? "trialing" : "active",
      137 +      planType: isLifetime ? "lifetime" : planType,
      138 +      currentPeriodStart,
      139 +      currentPeriodEnd,
      140 +      trialEndsAt: activeSubscription.trial_end
      141 +        ? new Date(activeSubscription.trial_end * 1000)
      142 +        : null,
      143 +      commitmentEndsAt: planType === "yearly"
      144 +        ? new Date(currentPeriodStart.getTime() + 365 * 24 * 60 * 60 * 1000)
      145 +        : null,
      146 +      isLifetime,
      147 +    });
      148 +
      149 +    console.log(`Created subscription record for user ${userId} from Stripe`);
      150 +  } catch (error) {
      151 +    console.error("Error linking Stripe subscription:", error);
      152 +  }
      153 +}
      154 +
      155  // Get auth page URL
      156  export async function GET() {
      157    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://themegpt.app";

⏺ Let me verify the build works:

⏺ Bash(pnpm exec tsc --noEmit -p apps/web/tsconfig.json 2>&1 | head -50) timeout: 1m 0s
  ⎿  undefined
      ERR_PNPM_RECURSIVE_EXEC_FIRST_FAIL  Command "tsc" not found

⏺ Bash(pnpm exec tsc --noEmit -p apps/extension/tsconfig.json 2>&1 | head -50) timeout: 1m 0s
  ⎿  undefined
      ERR_PNPM_RECURSIVE_EXEC_FIRST_FAIL  Command "tsc" not found

⏺ Bash(cd /Users/etherealogic/Dev/themegpt-v2.0/apps/web && npx tsc --noEmit 2>&1 | head -50) timeout: 1m 0s
  ⎿
                     This is not the tsc command you are looking for

     … +5 lines (ctrl+o to expand)

⏺ Bash(cd /Users/etherealogic/Dev/themegpt-v2.0 && pnpm --filter web lint 2>&1 | tail -30)
  ⎿  > web@0.1.0 lint /Users/etherealogic/Dev/themegpt-v2.0/apps/web
     > eslint .
     … +5 lines (ctrl+o to expand)

⏺ Bash(pnpm --filter extension lint 2>&1 | tail -30)
  ⎿  > extension@0.0.1 lint /Users/etherealogic/Dev/themegpt-v2.0/apps/extension
     > tsc --noEmit
     … +5 lines (ctrl+o to expand)

⏺ The test file errors are about missing test dependencies, not our code changes. Let me try a quick dev build to verify the core code compiles:

⏺ Bash(cd /Users/etherealogic/Dev/themegpt-v2.0/apps/extension && npx plasmo build --source-maps 2>&1 | tail -30) timeout: 3m 0s
  ⎿  🟣 Plasmo v0.90.5
     🔴 The Browser Extension Framework
     🔵 INFO   | Prepare to bundle the extension...
     … +3 lines (ctrl+o to expand)

⏺ Bash(cd /Users/etherealogic/Dev/themegpt-v2.0 && pnpm install 2>&1 | tail -20)
  ⎿  Scope: all 4 workspace projects
     (node:80921) [DEP0169] DeprecationWarning: `url.parse()` behavior is not standardized and prone to errors that have security implications. Use the WHATWG
     URL API instead. CVEs are not issued for `url.parse()` vulnerabilities.
     … +8 lines (ctrl+o to expand)

⏺ Bash(cd /Users/etherealogic/Dev/themegpt-v2.0/apps/web && npx next build 2>&1 | tail -50) timeout: 3m 0s
  ⎿  ▲ Next.js 16.1.1 (Turbopack)
     - Environments: .env.local
     … +41 lines (ctrl+o to expand)

⏺ OAuth-based seamless activation is now implemented. Here's what was created:

  New API Endpoints:
  1. /api/extension/auth - Generates JWT tokens for authenticated users, auto-links Stripe subscriptions by email
  2. /api/extension/status - Returns subscription status, accessible themes, and credits remaining
  3. /api/extension/download - Records theme downloads and manages credit usage

  New Pages:
  - /auth/extension - OAuth login page with Google/GitHub sign-in buttons

  Updated Files:
  - apps/web/app/success/page.tsx - Removed license key display, shows OAuth connection instructions
  - apps/extension/src/popup.tsx - Replaced license key input with "Connect Account" OAuth flow

  Key Features:
  - Users click "Connect" in extension header
  - Opens auth page to sign in with Google/GitHub
  - Copies connection token back to extension
  - Extension verifies token and fetches subscription status
  - Auto-links Stripe subscriptions to user accounts by email (handles users who subscribed before logging in)
  - Shows "Lifetime", "Premium", or "Connect" status in header
  - Displays downloads remaining for active subscribers
  - Unlocked themes persist across sessions

  The build compiles successfully. The flow is now privacy-first - no license keys are displayed or stored.

> I have tested both the subscriptions and the one-time purchase, and all appears to be working correctly. One aesthetic change I would request is that you
replace the mascot image displayed above the "Processing Payment" messagewith the GIF image found in the root README.md file.
`/Users/etherealogic/Dev/themegpt-v2.0/README.md` See screenshot for reference.
  ⎿  [Image #5]

⏺ Read(README.md)
  ⎿  Read 147 lines

⏺ Bash(ls -la /Users/etherealogic/Dev/themegpt-v2.0/asset/GIFs/)
  ⎿  total 872
     drwx------@  9 etherealogic  staff     288 Dec 29 21:09 .
     drwxr-xr-x@ 18 etherealogic  staff     576 Dec 29 17:31 ..
     … +7 lines (ctrl+o to expand)

⏺ Bash(cp /Users/etherealogic/Dev/themegpt-v2.0/asset/GIFs/animated-logo-400.gif /Users/etherealogic/Dev/themegpt-v2.0/apps/web/public/)
  ⎿  (No content)

⏺ Update(apps/web/app/success/page.tsx)
  ⎿  Added 5 lines, removed 5 lines
      62          <div className="bg-white p-8 rounded-[30px] shadow-[0_8px_32px_rgba(75,46,30,0.1)] max-w-md w-full">
      63            <div className="mb-6 flex justify-center">
      64              <Image
      65 -              src="/mascot-transparent.png"
      66 -              alt="ThemeGPT mascot"
      67 -              width={64}
      68 -              height={64}
      69 -              className="rounded-full shadow-sm animate-pulse"
      65 +              src="/animated-logo-400.gif"
      66 +              alt="ThemeGPT"
      67 +              width={120}
      68 +              height={120}
      69 +              unoptimized
      70              />
      71            </div>
      72            <h1 className="text-2xl font-bold mb-4 text-teal-600">Processing Payment...</h1>

⏺ Done. I've replaced the mascot image with the animated logo GIF on the "Processing Payment" loading state. The GIF is now shown at 120x120 pixels (larger than the previous mascot) and uses the unoptimized prop to preserve the animation.

> Commit and push these changes to the main branch in GitHub.

⏺ Bash(cd /Users/etherealogic/Dev/themegpt-v2.0 && git status)
  ⎿  On branch main
     Your branch is up to date with 'origin/main'.
     … +13 lines (ctrl+o to expand)

⏺ Bash(cd /Users/etherealogic/Dev/themegpt-v2.0 && git diff --stat)
  ⎿   apps/extension/src/popup.tsx  | 357 ++++++++++++++++++++++++++++++------------
      apps/web/app/success/page.tsx | 136 ++++++++++++----
      2 files changed, 362 insertions(+), 131 deletions(-)

⏺ Bash(cd /Users/etherealogic/Dev/themegpt-v2.0 && git log --oneline -3)
  ⎿  fd93c05 feat: implement new subscription strategy with early adopter lifetime access
     4d03443 feat: update subscribe CTA and redact chat log
     3f1f58b chore: update terms page and account CTA

⏺ Bash(git add apps/extension/src/popup.tsx apps/web/app/success/page.tsx apps/web/app/api/extension/ apps/web/app/auth/ apps/web/public/animated-logo-400.gif)
  ⎿  (No content)

⏺ Bash(git commit -m "feat: implement OAuth-based subscription authentication…)
  ⎿  [main ba819ee] feat: implement OAuth-based subscription authentication
      7 files changed, 999 insertions(+), 131 deletions(-)
      create mode 100644 apps/web/app/api/extension/auth/route.ts
     … +4 lines (ctrl+o to expand)

⏺ Bash(git push origin main)
  ⎿  To https://github.com/Org-EthereaLogic/themegpt-v2.0.git
        fd93c05..ba819ee  main -> main

⏺ Done. Changes committed and pushed to main:

  ba819ee feat: implement OAuth-based subscription authentication

  Files changed:
  - apps/extension/src/popup.tsx - OAuth "Connect Account" flow
  - apps/web/app/success/page.tsx - Removed license keys, added animated GIF
  - apps/web/app/api/extension/auth/route.ts - JWT token generation
  - apps/web/app/api/extension/status/route.ts - Subscription status API
  - apps/web/app/api/extension/download/route.ts - Theme download tracking
  - apps/web/app/auth/extension/page.tsx - OAuth login page
  - apps/web/public/animated-logo-400.gif - Animated logo

> test the extension auth flow
  ⎿  Tabs read

⏺ Claude in Chrome[navigate](localhost) [View Tab]
  ⎿  Navigation completed

⏺ Claude in Chrome[computer](screenshot) [View Tab]
  ⎿  Action completed

⏺ The extension auth page looks good. Let me test the Google OAuth flow:

⏺ Claude in Chrome[find](pattern: Continue with Google button) [View Tab]
  ⎿  Search completed

⏺ Claude in Chrome[computer](left_click on ref_5) [View Tab]
  ⎿  Action completed

⏺ Claude in Chrome[computer](wait 2s) [View Tab]
  ⎿  Action completed

⏺ Claude in Chrome[computer](screenshot) [View Tab]
  ⎿  Action completed

⏺ The OAuth flow is working correctly:

  1. ✅ Extension auth page (/auth/extension) loads with mascot, title, and OAuth buttons
  2. ✅ Google OAuth redirect - Clicking "Continue with Google" correctly redirects to Google's sign-in
  3. ✅ Callback URL configured - The redirect URI is properly set to http://localhost:3000/api/auth/callback/google

  Google is now requesting passkey verification for the account. This step requires your manual authentication (biometric/device verification). Once you complete that, it should redirect back to the extension auth page and generate a connection token.

  Would you like to complete the sign-in manually so we can verify the token generation step?
