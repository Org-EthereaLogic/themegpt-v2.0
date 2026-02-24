"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import Link from "next/link"
import { AnimatedMascot } from "@/components/ui/AnimatedMascot"
import { DEFAULT_THEMES } from "@themegpt/shared"
import { trackFunnelEvent } from "@/lib/funnel-events"
import { captureAttributionFromLocation } from "@/lib/attribution"
import { getStoredAttribution } from "@/lib/attribution"

const PREMIUM_THEMES = DEFAULT_THEMES.filter((t) => t.isPremium).slice(0, 4)

function MobileContent() {
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    captureAttributionFromLocation("/mobile", searchParams)
    trackFunnelEvent("mobile_landing", { device_type: "mobile" })
  }, [searchParams])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return

    setStatus("loading")
    setErrorMessage("")

    try {
      const res = await fetch("/api/mobile-reminder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), attribution: getStoredAttribution() }),
      })

      if (res.ok) {
        setStatus("success")
        trackFunnelEvent("mobile_email_capture", { device_type: "mobile" })
      } else {
        const data = await res.json()
        setErrorMessage(data.message || "Something went wrong")
        setStatus("error")
        trackFunnelEvent("mobile_email_error", { device_type: "mobile" })
      }
    } catch {
      setErrorMessage("Unable to connect. Please try again.")
      setStatus("error")
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center px-6 py-12"
      style={{ background: "#FAF6F0" }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-10">
        <AnimatedMascot size="md" />
        <span
          className="text-2xl font-semibold tracking-tight"
          style={{ fontFamily: "var(--font-fraunces), serif", color: "#4A3728" }}
        >
          ThemeGPT
        </span>
      </div>

      {/* Main Card */}
      <div
        className="w-full max-w-md rounded-[28px] p-8 text-center"
        style={{
          background: "#ffffff",
          boxShadow: "0 12px 40px rgba(74, 55, 40, 0.08)",
        }}
      >
        {/* Desktop icon */}
        <div
          className="mx-auto mb-5 w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{ background: "rgba(91, 181, 162, 0.12)" }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#5BB5A2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
            <line x1="8" y1="21" x2="16" y2="21" />
            <line x1="12" y1="17" x2="12" y2="21" />
          </svg>
        </div>

        <h1
          className="text-[1.6rem] font-semibold leading-tight mb-3"
          style={{ fontFamily: "var(--font-fraunces), serif", color: "#4A3728" }}
        >
          ThemeGPT is a Desktop Experience
        </h1>

        <p className="text-[0.95rem] leading-relaxed mb-6" style={{ color: "#7A6555" }}>
          ThemeGPT is a Chrome extension that transforms how ChatGPT looks.
          Extensions only work on desktop browsers — but we can email you a link
          to install it when you&apos;re at your computer.
        </p>

        {/* Email Capture */}
        {status === "success" ? (
          <div
            className="rounded-xl p-5 mb-6"
            style={{ background: "rgba(91, 181, 162, 0.1)", border: "1px solid rgba(91, 181, 162, 0.3)" }}
          >
            <div
              className="w-10 h-10 mx-auto mb-3 rounded-full flex items-center justify-center"
              style={{ background: "#5BB5A2" }}
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="font-semibold mb-1" style={{ color: "#4A3728" }}>
              Check your inbox!
            </p>
            <p className="text-sm" style={{ color: "#7A6555" }}>
              We sent an install link to <strong>{email}</strong>. Open it on your computer to get ThemeGPT.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mb-6">
            <label htmlFor="mobile-email" className="sr-only">
              Email address
            </label>
            <div className="flex gap-2">
              <input
                id="mobile-email"
                type="email"
                required
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 rounded-xl border px-4 py-3 text-[0.95rem] focus:outline-none focus:ring-2 focus:ring-[#5BB5A2]"
                style={{
                  borderColor: "rgba(74, 55, 40, 0.2)",
                  color: "#4A3728",
                }}
                disabled={status === "loading"}
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="rounded-xl px-5 py-3 font-semibold text-white transition-all duration-300 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: "#E8A87C",
                  boxShadow: "0 4px 16px rgba(232, 168, 124, 0.3)",
                }}
              >
                {status === "loading" ? (
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  "Send"
                )}
              </button>
            </div>
            {status === "error" && (
              <p className="mt-2 text-sm text-red-600">{errorMessage}</p>
            )}
          </form>
        )}

        {/* Theme Preview */}
        <p
          className="text-[0.75rem] font-semibold uppercase tracking-[0.15em] mb-3"
          style={{ color: "#5BB5A2" }}
        >
          Preview Premium Themes
        </p>
        <div className="grid grid-cols-2 gap-2 mb-6">
          {PREMIUM_THEMES.map((theme) => (
            <div
              key={theme.id}
              className="rounded-lg p-3 text-left"
              style={{
                background: theme.colors["--cgpt-bg"],
                border: "1px solid rgba(74, 55, 40, 0.08)",
              }}
            >
              <div
                className="text-[0.7rem] font-semibold mb-1"
                style={{ color: theme.colors["--cgpt-text"] }}
              >
                {theme.name}
              </div>
              <div className="flex gap-1">
                {[theme.colors["--cgpt-accent"], theme.colors["--cgpt-surface"], theme.colors["--cgpt-border"]].map(
                  (color, i) => (
                    <div
                      key={i}
                      className="w-3 h-3 rounded-full"
                      style={{ background: color }}
                    />
                  )
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Features */}
        <div className="flex justify-center gap-6 text-[0.8rem]" style={{ color: "#7A6555" }}>
          <span>7 free themes</span>
          <span>Privacy-first</span>
          <span>One-click setup</span>
        </div>
      </div>

      {/* Skip link */}
      <Link
        href="/?skip_mobile=1"
        onClick={() => trackFunnelEvent("mobile_skip_to_site", { device_type: "mobile" })}
        className="mt-8 text-sm underline transition-colors"
        style={{ color: "#7A6555" }}
      >
        Browse the full site anyway
      </Link>
    </div>
  )
}

export default function MobilePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center" style={{ background: "#FAF6F0" }}>
          <div className="animate-pulse" style={{ color: "#4A3728" }}>Loading...</div>
        </div>
      }
    >
      <MobileContent />
    </Suspense>
  )
}
