"use client"

import { useSearchParams } from "next/navigation"
import { Suspense, useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import Image from "next/image"
import { logEvent } from "firebase/analytics"
import { initAnalyticsIfConsented } from "@/lib/firebase"
import { getAttributionEventParams } from "@/lib/attribution"
import {
  getClientExtensionBrowser,
  getExtensionIdsForBrowser
} from "@/lib/extension-distribution"

const POST_PURCHASE_INSTALL_QUERY =
  "utm_source=cws&utm_medium=post_purchase&utm_campaign=install_prompt"
const GOOGLE_ADS_CONVERSION_SEND_TO = "AW-17968263674/DN9FCKXF1fwbEPrj9_dC"

interface SessionData {
  success: boolean
  planType?: 'yearly' | 'monthly' | 'single'
  themeId?: string
  themeName?: string
  isLifetime?: boolean
  hasLicense?: boolean
  message?: string
  subscriptionStatus?: string
  value?: number
  currency?: string
}

function trackGoogleAdsConversion(sessionId: string, value?: number, currency?: string) {
  if (typeof window === "undefined") return
  if (localStorage.getItem("themegpt_analytics_consent") !== "accepted") return

  const browserWindow = window as Window & { gtag?: (...args: unknown[]) => void }
  if (typeof browserWindow.gtag !== "function") return

  // 1. Google Ads Conversion
  browserWindow.gtag("event", "conversion", {
    send_to: GOOGLE_ADS_CONVERSION_SEND_TO,
    transaction_id: sessionId,
    value,
    currency,
  })

  // 2. GA4 Standard Purchase Event
  browserWindow.gtag("event", "purchase", {
    transaction_id: sessionId,
    value,
    currency,
    items: [{
      item_id: sessionId,
      item_name: "ThemeGPT Subscription/License",
    }]
  })
}

function getPrimaryExtensionId(): string | null {
  const extensionIds = getExtensionIdsForBrowser(getClientExtensionBrowser())
  return extensionIds[0] || null
}

// Check if extension is installed
async function checkExtensionInstalled(): Promise<boolean> {
  return new Promise((resolve) => {
    const extensionId = getPrimaryExtensionId()
    if (!extensionId || typeof chrome === "undefined" || !chrome.runtime?.sendMessage) {
      resolve(false)
      return
    }

    try {
      chrome.runtime.sendMessage(
        extensionId,
        { type: "themegpt-ping" },
        (response) => {
          if (chrome.runtime.lastError) {
            resolve(false)
            return
          }
          resolve(!!(response?.success && response?.installed))
        }
      )
      setTimeout(() => resolve(false), 2000)
    } catch {
      resolve(false)
    }
  })
}

// Check if extension already has an auth token
async function checkExtensionAuthStatus(): Promise<boolean> {
  return new Promise((resolve) => {
    const extensionId = getPrimaryExtensionId()
    if (!extensionId || typeof chrome === "undefined" || !chrome.runtime?.sendMessage) {
      resolve(false)
      return
    }

    try {
      chrome.runtime.sendMessage(
        extensionId,
        { type: "themegpt-check-status" },
        (response) => {
          if (chrome.runtime.lastError) {
            resolve(false)
            return
          }
          resolve(!!(response?.success && response?.hasToken))
        }
      )
      setTimeout(() => resolve(false), 2000)
    } catch {
      resolve(false)
    }
  })
}

function SuccessContent() {
  const searchParams = useSearchParams()
  const { data: authSession } = useSession()
  const installStoreUrl = `/install-extension?${POST_PURCHASE_INSTALL_QUERY}`
  const sessionId = searchParams.get("session_id")
  const [sessionData, setSessionData] = useState<SessionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [extensionInstalled, setExtensionInstalled] = useState<boolean | null>(null)
  const [extensionConnected, setExtensionConnected] = useState<boolean>(false)
  const [isMobile] = useState(() =>
    typeof navigator !== "undefined" &&
    /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  )
  const [mobileReminderStatus, setMobileReminderStatus] = useState<"idle" | "loading" | "sent">("idle")
  const [mobileReminderError, setMobileReminderError] = useState<string | null>(null)

  async function sendMobileReminder() {
    const email = authSession?.user?.email?.trim()
    if (!email) {
      setMobileReminderError("Sign in to send the install link.")
      return
    }

    setMobileReminderStatus("loading")
    setMobileReminderError(null)
    try {
      const response = await fetch("/api/mobile-reminder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(typeof data.message === "string" ? data.message : "Failed to send install link")
      }

      setMobileReminderStatus("sent")
    } catch (err) {
      setMobileReminderStatus("idle")
      setMobileReminderError(err instanceof Error ? err.message : "Failed to send install link")
    }
  }

  useEffect(() => {
    // Skip extension detection on mobile — chrome.runtime doesn't exist
    if (isMobile) {
      setExtensionInstalled(false)
      return
    }
    // Check extension status on mount
    checkExtensionInstalled().then((installed) => {
      setExtensionInstalled(installed)
      if (installed) {
        checkExtensionAuthStatus().then(setExtensionConnected)
      }
    })
  }, [isMobile])

  useEffect(() => {
    if (!sessionId) {
      setError("No session ID provided")
      setLoading(false)
      return
    }

    let attempts = 0
    const maxAttempts = 10

    async function fetchSessionData() {
      try {
        const res = await fetch(`/api/session?session_id=${sessionId}`)
        const data = await res.json()

        if (data.success && !data.pending) {
          setSessionData(data)
          setLoading(false)

          // Gate 3: fire purchase funnel events once, deduplicated by session
          const trackingKey = `purchase_tracked_${sessionId}`;
          if (!sessionStorage.getItem(trackingKey)) {
            const a = initAnalyticsIfConsented();
            if (a) {
              const attributionParams = getAttributionEventParams();
              logEvent(a, "purchase_success", {
                plan_type: data.planType ?? "unknown",
                is_lifetime: data.isLifetime ?? false,
                ...attributionParams,
              })
              // trial_start gates on actual Stripe subscription status — NOT planType.
              // Monthly plans start trialing; yearly early-adopter pays immediately (active).
              if (data.subscriptionStatus === "trialing") {
                logEvent(a, "trial_start", {
                  plan_type: data.planType ?? "unknown",
                  ...attributionParams,
                })
              }
            }
            if (sessionId) {
              trackGoogleAdsConversion(sessionId, data.value, data.currency)
            }
            sessionStorage.setItem(trackingKey, "1");
          }
        } else if (data.pending && attempts < maxAttempts) {
          attempts++
          setTimeout(fetchSessionData, 2000)
        } else if (!data.success) {
          setError(data.message || "Failed to process payment")
          setLoading(false)
        } else {
          // pending still true after maxAttempts — webhook took too long
          setError("Your purchase is taking longer than expected to activate. Please check your email for confirmation or contact support@themegpt.ai.")
          setLoading(false)
        }
      } catch {
        setError("Failed to connect to server")
        setLoading(false)
      }
    }

    fetchSessionData()
  }, [sessionId])

  if (loading) {
    return (
      <div className="min-h-screen bg-cream font-sans text-brown-900 flex flex-col items-center justify-center p-8 text-center">
        <div className="bg-white p-8 rounded-[30px] shadow-[0_8px_32px_rgba(75,46,30,0.1)] max-w-md w-full">
          <div className="mb-6 flex justify-center">
            <Image
              src="/animated-logo-400.gif"
              alt="ThemeGPT"
              width={120}
              height={120}
              unoptimized
            />
          </div>
          <h1 className="text-2xl font-bold mb-4 text-teal">Processing Payment...</h1>
          <p className="opacity-80">Please wait while we activate your subscription.</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-cream font-sans text-brown-900 flex flex-col items-center justify-center p-8 text-center">
        <div className="bg-white p-8 rounded-[30px] shadow-[0_8px_32px_rgba(75,46,30,0.1)] max-w-md w-full">
          <h1 className="text-2xl font-bold mb-4 text-red-600">Something went wrong</h1>
          <p className="mb-6 opacity-80">{error}</p>
          <Link href="/" className="inline-block bg-brown-900 text-white px-6 py-3 rounded-full font-semibold hover:-translate-y-1 transition-transform">
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  // Single theme purchase
  if (sessionData?.planType === 'single') {
    return (
      <div className="min-h-screen bg-cream font-sans text-brown-900 flex flex-col items-center justify-center p-8 text-center">
        <div className="bg-white p-8 rounded-[30px] shadow-[0_8px_32px_rgba(75,46,30,0.1)] max-w-md w-full">
          <div className="mb-6 flex justify-center">
            <div className="w-16 h-16 bg-teal rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h1 className="text-2xl font-bold mb-4 text-teal">Theme Purchased!</h1>
          <p className="mb-6 opacity-80">
            You now own <strong>{sessionData.themeName || 'your theme'}</strong> forever.
          </p>

          {/* Extension status - single theme (mobile) */}
          {extensionInstalled === false && isMobile && (
            <div className="bg-teal/10 p-4 rounded-xl border border-teal/30 mb-6">
              <h3 className="font-semibold text-brown mb-2">Install on Desktop</h3>
              <p className="text-sm text-brown/70 mb-3">
                ThemeGPT works on desktop browsers. Open your email on your computer to install it.
              </p>
              {mobileReminderStatus === "sent" ? (
                <p className="text-sm text-teal font-semibold">Install link sent!</p>
              ) : (
                <>
                  <button
                    onClick={sendMobileReminder}
                    disabled={mobileReminderStatus === "loading"}
                    className="inline-block bg-coral text-white px-4 py-2 rounded-full text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {mobileReminderStatus === "loading" ? "Sending..." : "Email Me the Install Link"}
                  </button>
                  {mobileReminderError && (
                    <p className="mt-2 text-sm text-red-600">{mobileReminderError}</p>
                  )}
                </>
              )}
            </div>
          )}

          {/* Extension status - single theme (desktop) */}
          {extensionInstalled === false && !isMobile && (
            <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 mb-6">
              <h3 className="font-semibold text-amber-700 mb-2">Get the Extension</h3>
              <p className="text-sm text-amber-600 mb-3">
                Install the ThemeGPT extension to use your theme.
              </p>
              <Link
                href={installStoreUrl}
                target="_blank"
                className="inline-block bg-amber-500 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-amber-600 transition-colors"
              >
                Install Extension
              </Link>
            </div>
          )}

          {extensionInstalled === true && !extensionConnected && (
            <div className="bg-teal/10 p-4 rounded-xl border border-teal/30 mb-6">
              <h3 className="font-semibold text-brown mb-2">Connect Your Extension</h3>
              <p className="text-sm text-brown/70 mb-3">
                Sign in to access your purchased theme.
              </p>
              <Link
                href="/auth/extension"
                className="inline-block bg-coral text-white px-4 py-2 rounded-full text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                Connect Now
              </Link>
            </div>
          )}

          {extensionInstalled === true && extensionConnected && (
            <div className="bg-teal/10 p-4 rounded-xl border border-teal/30 mb-6">
              <p className="text-sm text-brown flex items-center justify-center gap-2">
                <span className="w-2 h-2 bg-teal rounded-full"></span>
                Extension connected! Open the extension to use your theme.
              </p>
            </div>
          )}

          <Link href="/" className="inline-block bg-brown-900 text-white px-6 py-3 rounded-full font-semibold hover:-translate-y-1 transition-transform">
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  // Subscription (monthly or yearly)
  return (
    <div className="min-h-screen bg-cream font-sans text-brown-900 flex flex-col items-center justify-center p-8 text-center">
      <div className="bg-white p-8 rounded-[30px] shadow-[0_8px_32px_rgba(75,46,30,0.1)] max-w-md w-full">
        <div className="mb-6 flex justify-center">
          <div className="w-16 h-16 bg-teal rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        <h1 className="text-2xl font-bold mb-2 text-teal">
          {sessionData?.isLifetime ? 'Lifetime Access Activated!' : 'Subscription Active!'}
        </h1>

        {sessionData?.isLifetime && (
          <div className="inline-block bg-gradient-to-r from-teal to-teal/80 text-white text-xs font-bold px-3 py-1 rounded-full mb-4">
            Early Adopter - Lifetime Member
          </div>
        )}

        <p className="mb-6 opacity-80">
          {sessionData?.planType === 'yearly'
            ? sessionData?.isLifetime
              ? "Congratulations! As an early adopter, you have lifetime access to all premium themes."
              : "Your yearly subscription is now active. Enjoy all premium themes!"
            : "Your monthly subscription is now active. Your first month is free!"}
        </p>

        {/* Extension not installed - mobile-aware CTA */}
        {extensionInstalled === false && isMobile && (
          <div className="bg-gradient-to-br from-teal/10 to-coral/10 p-5 rounded-xl border-2 border-teal/30 mb-6">
            <div className="flex items-center justify-center gap-3 mb-3">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#5BB5A2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
              <h3 className="font-bold text-brown text-lg">Install on Desktop</h3>
            </div>
            <p className="text-sm text-brown/70 mb-4">
              ThemeGPT is a desktop browser extension. We&apos;ll email you the install link to use on your computer.
            </p>
            {mobileReminderStatus === "sent" ? (
              <p className="text-sm text-teal font-semibold">Install link sent! Check your inbox.</p>
            ) : (
              <>
                <button
                  onClick={sendMobileReminder}
                  disabled={mobileReminderStatus === "loading"}
                  className="inline-flex items-center gap-2 bg-coral text-white px-5 py-2.5 rounded-full font-semibold hover:opacity-90 transition-opacity shadow-md disabled:opacity-50"
                >
                  {mobileReminderStatus === "loading" ? "Sending..." : "Email Me the Install Link"}
                </button>
                {mobileReminderError && (
                  <p className="mt-2 text-sm text-red-600">{mobileReminderError}</p>
                )}
              </>
            )}
          </div>
        )}

        {/* Extension not installed - desktop CTA */}
        {extensionInstalled === false && !isMobile && (
          <div className="bg-gradient-to-br from-teal/10 to-coral/10 p-5 rounded-xl border-2 border-teal/30 mb-6">
            <div className="flex items-center justify-center gap-3 mb-3">
              <svg className="w-8 h-8 text-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <h3 className="font-bold text-brown text-lg">Install the Extension</h3>
            </div>
            <p className="text-sm text-brown/70 mb-4">
              Get the ThemeGPT extension to start using your premium themes.
            </p>
            <Link
              href={installStoreUrl}
              target="_blank"
              className="inline-flex items-center gap-2 bg-coral text-white px-5 py-2.5 rounded-full font-semibold hover:opacity-90 transition-opacity shadow-md"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C8.21 0 4.831 1.757 2.632 4.501l3.953 6.848A5.454 5.454 0 0 1 12 6.545h10.691A12 12 0 0 0 12 0zM1.931 5.47A11.943 11.943 0 0 0 0 12c0 6.012 4.42 10.991 10.189 11.864l3.953-6.847a5.454 5.454 0 0 1-6.865-2.78L1.931 5.47zm13.281 2.166A5.454 5.454 0 0 1 12 17.455c-1.019 0-1.975-.28-2.791-.766L5.256 23.536A11.943 11.943 0 0 0 12 24c6.627 0 12-5.373 12-12 0-1.924-.453-3.741-1.258-5.352l-7.53-.012z"/>
              </svg>
              Add to Chrome - Free
            </Link>
          </div>
        )}

        {/* Extension installed but not connected */}
        {extensionInstalled === true && !extensionConnected && (
          <div className="bg-teal/10 p-4 rounded-xl border border-teal/30 mb-6">
            <h3 className="font-semibold text-brown mb-2">Connect Your Extension</h3>
            <p className="text-sm text-brown/70 mb-3">
              Sign in to sync your subscription with the extension.
            </p>
            <Link
              href="/auth/extension"
              className="inline-block bg-coral text-white px-4 py-2 rounded-full text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Connect Now
            </Link>
          </div>
        )}

        {/* Extension installed and connected */}
        {extensionInstalled === true && extensionConnected && (
          <div className="bg-teal/10 p-4 rounded-xl border border-teal/30 mb-6">
            <p className="text-sm text-brown flex items-center justify-center gap-2">
              <span className="w-2 h-2 bg-teal rounded-full animate-pulse"></span>
              Extension connected! Open the extension to browse premium themes.
            </p>
          </div>
        )}

        {/* Fallback instructions when extension status unknown or not detected */}
        {extensionInstalled === null && (
          <div className="bg-cream p-4 rounded-xl border border-brown-900/10 mb-6">
            <h3 className="font-semibold text-brown-900 mb-2">Next Steps</h3>
            <ol className="text-sm text-left space-y-2 text-brown-900/80">
              <li className="flex items-start gap-2">
                <span className="bg-coral text-white w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">1</span>
                <span>Install the <Link href={installStoreUrl} target="_blank" className="text-teal underline">ThemeGPT extension</Link></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-coral text-white w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">2</span>
                <span>Click &quot;Sign In&quot; in the extension header</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-coral text-white w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">3</span>
                <span>Sign in with the same account you used here</span>
              </li>
            </ol>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <Link href="/account" className="inline-block bg-coral text-white px-6 py-3 rounded-full font-semibold hover:opacity-90 transition-opacity">
            View Account
          </Link>
          <Link href="/" className="inline-block text-brown-900 hover:text-teal font-medium transition-colors">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-cream flex items-center justify-center">Loading...</div>}>
      <SuccessContent />
    </Suspense>
  )
}
