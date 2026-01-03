"use client"

import { useSearchParams } from "next/navigation"
import { Suspense, useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"

interface SessionData {
  success: boolean
  planType?: 'yearly' | 'monthly' | 'single'
  themeId?: string
  themeName?: string
  isLifetime?: boolean
  userEmail?: string
  message?: string
}

function SuccessContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("session_id")
  const [sessionData, setSessionData] = useState<SessionData | null>(null)
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

    async function fetchSessionData() {
      try {
        const res = await fetch(`/api/session?session_id=${sessionId}`)
        const data = await res.json()

        if (data.success && !data.pending) {
          setSessionData(data)
          setLoading(false)
        } else if (data.pending && attempts < maxAttempts) {
          attempts++
          setTimeout(fetchSessionData, 2000)
        } else if (!data.success) {
          setError(data.message || "Failed to process payment")
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
          <h1 className="text-2xl font-bold mb-4 text-teal-600">Processing Payment...</h1>
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
            <div className="w-16 h-16 bg-teal-500 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h1 className="text-2xl font-bold mb-4 text-teal-600">Theme Purchased!</h1>
          <p className="mb-6 opacity-80">
            You now own <strong>{sessionData.themeName || 'your theme'}</strong> forever.
          </p>

          <div className="bg-teal-50 p-4 rounded-xl border border-teal-200 mb-6">
            <h3 className="font-semibold text-teal-700 mb-2">Activate in Extension</h3>
            <p className="text-sm text-teal-600">
              Sign in to your account in the ThemeGPT extension to access your purchased theme.
            </p>
          </div>

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
          <div className="w-16 h-16 bg-teal-500 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        <h1 className="text-2xl font-bold mb-2 text-teal-600">
          {sessionData?.isLifetime ? 'Lifetime Access Activated!' : 'Subscription Active!'}
        </h1>

        {sessionData?.isLifetime && (
          <div className="inline-block bg-gradient-to-r from-teal-500 to-teal-600 text-white text-xs font-bold px-3 py-1 rounded-full mb-4">
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

        <div className="bg-teal-50 p-4 rounded-xl border border-teal-200 mb-6">
          <h3 className="font-semibold text-teal-700 mb-2">Next Step: Connect Your Extension</h3>
          <ol className="text-sm text-teal-600 text-left space-y-2">
            <li className="flex items-start gap-2">
              <span className="bg-teal-500 text-white w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">1</span>
              <span>Open the ThemeGPT extension in Chrome</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="bg-teal-500 text-white w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">2</span>
              <span>Click &quot;Connect Account&quot; in the header</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="bg-teal-500 text-white w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">3</span>
              <span>Sign in with the same account you used here</span>
            </li>
          </ol>
        </div>

        <div className="flex flex-col gap-3">
          <Link href="/account" className="inline-block bg-teal-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-teal-600 transition-colors">
            View Account
          </Link>
          <Link href="/" className="inline-block text-brown-900 hover:text-teal-600 font-medium transition-colors">
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
