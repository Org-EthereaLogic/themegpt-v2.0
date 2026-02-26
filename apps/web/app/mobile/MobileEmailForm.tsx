"use client"

import { useState } from "react"
import Link from "next/link"
import { trackFunnelEvent } from "@/lib/funnel-events"
import { getStoredAttribution } from "@/lib/attribution"

const MAIN_THEME_GALLERY_HREF = "/?skip_mobile=1#themes"

export function MobileEmailForm() {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")

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

  if (status === "success") {
    return (
      <div
        className="rounded-xl p-5 mb-4"
        style={{ background: "rgba(91, 181, 162, 0.1)", border: "1px solid rgba(91, 181, 162, 0.3)" }}
      >
        <div
          className="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center"
          style={{ background: "#5BB5A2" }}
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="font-semibold mb-1" style={{ color: "#4A3728" }}>
          Check your inbox — link arrives in under a minute
        </p>
        <p className="text-sm mb-3" style={{ color: "#7A6555" }}>
          Open the email on your computer to install ThemeGPT.
        </p>
        <Link
          href={MAIN_THEME_GALLERY_HREF}
          className="inline-block text-[0.85rem] font-semibold transition-opacity active:opacity-80 hover:opacity-80"
          style={{ color: "#5BB5A2" }}
        >
          Preview themes while you wait
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <label htmlFor="mobile-email" className="sr-only">
        Email address
      </label>
      <input
        id="mobile-email"
        type="email"
        required
        placeholder="your@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full rounded-xl border px-4 py-3 text-[0.95rem] mb-3 focus:outline-none focus:ring-2 focus:ring-[#5BB5A2]"
        style={{
          borderColor: "rgba(74, 55, 40, 0.2)",
          color: "#4A3728",
        }}
        disabled={status === "loading"}
      />
      <button
        type="submit"
        disabled={status === "loading"}
        aria-label="Email me the install link"
        className="w-full rounded-xl px-5 py-3.5 font-semibold text-white transition-all duration-300 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          background: "#E8A87C",
          boxShadow: "0 4px 16px rgba(232, 168, 124, 0.3)",
        }}
      >
        {status === "loading" ? (
          <svg className="animate-spin h-5 w-5 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        ) : (
          "Email Me the Link"
        )}
      </button>
      {status === "error" && (
        <p className="mt-2 text-sm text-red-600">{errorMessage}</p>
      )}
      <p className="mt-2 text-[0.8rem]" style={{ color: "#7A6555" }}>
        Takes 10 seconds to install on desktop
      </p>
    </form>
  )
}
