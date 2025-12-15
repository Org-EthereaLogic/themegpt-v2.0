"use client"

import { useSearchParams } from "next/navigation"
import { Suspense, useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"

function SuccessContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("session_id")
  const [licenseKey, setLicenseKey] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!sessionId) {
      setError("No session ID provided")
      setLoading(false)
      return
    }

    let attempts = 0
    const maxAttempts = 10

    async function fetchLicenseKey() {
      try {
        const res = await fetch(`/api/session?session_id=${sessionId}`)
        const data = await res.json()

        if (data.success && data.licenseKey) {
          setLicenseKey(data.licenseKey)
          setLoading(false)
        } else if (data.pending && attempts < maxAttempts) {
          attempts++
          setTimeout(fetchLicenseKey, 2000)
        } else {
          setError(data.message || "Failed to retrieve license key")
          setLoading(false)
        }
      } catch {
        setError("Failed to connect to server")
        setLoading(false)
      }
    }

    fetchLicenseKey()
  }, [sessionId])

  if (loading) {
    return (
      <div className="min-h-screen bg-cream font-sans text-brown-900 flex flex-col items-center justify-center p-8 text-center">
        <div className="bg-white p-8 rounded-[30px] shadow-[0_8px_32px_rgba(75,46,30,0.1)] max-w-md w-full">
          <div className="mb-6 flex justify-center">
            <Image
              src="/mascot-48.png"
              alt="ThemeGPT mascot"
              width={64}
              height={64}
              className="rounded-full shadow-sm animate-pulse"
            />
          </div>
          <h1 className="text-2xl font-bold mb-4 text-teal-600">Processing Payment...</h1>
          <p className="opacity-80">Please wait while we generate your license key.</p>
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

  return (
    <div className="min-h-screen bg-cream font-sans text-brown-900 flex flex-col items-center justify-center p-8 text-center">
      <div className="bg-white p-8 rounded-[30px] shadow-[0_8px_32px_rgba(75,46,30,0.1)] max-w-md w-full">
        <div className="mb-6 flex justify-center">
          <Image
            src="/mascot-48.png"
            alt="ThemeGPT mascot"
            width={64}
            height={64}
            className="rounded-full shadow-sm"
          />
        </div>
        <h1 className="text-2xl font-bold mb-4 text-teal-600">Purchase Successful!</h1>
        <p className="mb-6 opacity-80">
          Thank you for your order. Here is your license key. Please copy it and enter it in the extension settings.
        </p>

        <div className="bg-brand-brown-900/5 p-4 rounded-xl border border-brown-900/10 mb-6">
          <code className="text-lg font-mono font-bold text-brown-900 select-all">
            {licenseKey}
          </code>
        </div>

        <p className="text-sm opacity-60 mb-8">
          Keep this key safe! You can use it to verify your purchase.
        </p>

        <Link href="/" className="inline-block bg-brown-900 text-white px-6 py-3 rounded-full font-semibold hover:-translate-y-1 transition-transform">
          Back to Home
        </Link>
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
