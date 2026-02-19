"use client"

import { useSession, signIn } from "next-auth/react"
import { useEffect, useState, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"

// Chrome Web Store extension ID
const PRODUCTION_EXTENSION_ID = "dlphknialdlpmcgoknkcmapmclgckhba"
const LOCAL_EXTENSION_ID = process.env.NEXT_PUBLIC_EXTENSION_ID

const EXTENSION_IDS = [PRODUCTION_EXTENSION_ID]
if (LOCAL_EXTENSION_ID && LOCAL_EXTENSION_ID !== PRODUCTION_EXTENSION_ID) {
  EXTENSION_IDS.push(LOCAL_EXTENSION_ID)
}

// Check if we can communicate with the extension
async function pingExtension(): Promise<boolean> {
  return new Promise((resolve) => {
    // Check if chrome.runtime is available (only in Chrome)
    if (typeof chrome === "undefined" || !chrome.runtime?.sendMessage) {
      resolve(false)
      return
    }

    // Try all configured extension IDs
    let checkedCount = 0
    let detected = false

    EXTENSION_IDS.forEach((id) => {
      try {
        chrome.runtime.sendMessage(
          id,
          { type: "themegpt-ping" },
          (response) => {
            checkedCount++
            if (!chrome.runtime.lastError && response?.success && response?.installed) {
              detected = true
              // Store the working ID for subsequent calls
              sessionStorage.setItem("connected_extension_id", id)
              resolve(true)
            } else if (checkedCount === EXTENSION_IDS.length && !detected) {
              resolve(false)
            }
          }
        )
      } catch {
        checkedCount++
        if (checkedCount === EXTENSION_IDS.length && !detected) {
          resolve(false)
        }
      }
    })
      
    // Global timeout
    setTimeout(() => {
      if (!detected) resolve(false)
    }, 2000)
  })
}

// Send auth token to extension
async function sendTokenToExtension(token: string): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof chrome === "undefined" || !chrome.runtime?.sendMessage) {
      resolve(false)
      return
    }

    const targetId = sessionStorage.getItem("connected_extension_id") || EXTENSION_IDS[0]

    try {
      chrome.runtime.sendMessage(
        targetId,
        { type: "themegpt-auth", token },
        (response) => {
          if (chrome.runtime.lastError) {
            resolve(false)
            return
          }
          resolve(response?.success === true ? true : false)
        }
      )
      setTimeout(() => resolve(false), 3000)
    } catch {
      resolve(false)
    }
  })
}

export default function ExtensionAuthPage() {
  const { data: session, status } = useSession()
  const [token, setToken] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [extensionDetected, setExtensionDetected] = useState<boolean | null>(null)
  const [tokenSent, setTokenSent] = useState(false)

  // Check for extension on mount
  useEffect(() => {
    pingExtension().then(setExtensionDetected)
  }, [])

  const generateToken = useCallback(async () => {
    setIsGenerating(true)
    try {
      const res = await fetch("/api/extension/auth", {
        method: "POST",
      })
      const data = await res.json()

      if (data.success) {
        setToken(data.token)

        // Try to send token directly to extension
        if (extensionDetected) {
          const sent = await sendTokenToExtension(data.token)
          setTokenSent(sent)
        }
      } else {
        setError(data.message || "Failed to generate token")
      }
    } catch {
      setError("Failed to connect to server")
    } finally {
      setIsGenerating(false)
    }
  }, [extensionDetected])

  useEffect(() => {
    if (session?.user && !token && !isGenerating) {
      generateToken()
    }
  }, [session, token, isGenerating, generateToken])

  async function handleCopy() {
    if (!token) return
    try {
      await navigator.clipboard.writeText(token)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setError("Failed to copy token")
    }
  }

  // Retry sending to extension
  async function handleRetrySend() {
    if (!token) return
    const sent = await sendTokenToExtension(token)
    setTokenSent(sent)
  }

  if (status === "loading" || isGenerating) {
    return (
      <div className="min-h-screen bg-cream font-sans text-brown-900 flex flex-col items-center justify-center p-8">
        <div className="bg-white p-8 rounded-[30px] shadow-[0_8px_32px_rgba(75,46,30,0.1)] max-w-md w-full text-center">
          <div className="mb-6 flex justify-center">
            <Image
              src="/animated-logo-400.gif"
              alt="ThemeGPT"
              width={100}
              height={100}
              unoptimized
            />
          </div>
          <h1 className="text-xl font-bold mb-2">Connecting...</h1>
          <p className="text-sm opacity-70">Please wait while we set up your connection.</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-cream font-sans text-brown-900 flex flex-col items-center justify-center p-8">
        <div className="bg-white p-8 rounded-[30px] shadow-[0_8px_32px_rgba(75,46,30,0.1)] max-w-md w-full text-center">
          <div className="mb-6 flex justify-center">
            <Image
              src="/mascot-transparent.png"
              alt="ThemeGPT mascot"
              width={64}
              height={64}
              className="rounded-full shadow-sm"
            />
          </div>
          <h1 className="text-2xl font-bold mb-2">Connect Extension</h1>
          <p className="text-sm opacity-70 mb-6">
            Sign in to connect your ThemeGPT extension with your account.
          </p>

          {/* Extension status indicator */}
          {extensionDetected !== null && (
            <div className={`mb-4 p-3 rounded-xl text-sm ${
              extensionDetected
                ? "bg-teal-50 text-teal-700 border border-teal-200"
                : "bg-amber-50 text-amber-700 border border-amber-200"
            }`}>
              {extensionDetected ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-2 h-2 bg-teal-500 rounded-full animate-pulse"></span>
                  Extension detected
                </span>
              ) : (
                <span>
                  Extension not detected.{" "}
                  <Link
                    href="https://chromewebstore.google.com/detail/dlphknialdlpmcgoknkcmapmclgckhba?utm_source=web&utm_medium=referral&utm_campaign=extension_auth"
                    target="_blank"
                    className="underline font-medium"
                  >
                    Install it first
                  </Link>
                </span>
              )}
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={() => signIn("google", { callbackUrl: "/auth/extension" })}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white border border-brown-900/20 rounded-xl hover:bg-cream transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span className="font-medium">Continue with Google</span>
            </button>

            <button
              onClick={() => signIn("github", { callbackUrl: "/auth/extension" })}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-brown-900 text-white rounded-xl hover:bg-brown-900/90 transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              <span className="font-medium">Continue with GitHub</span>
            </button>
          </div>

          <p className="text-xs text-brown-900/50 mt-6">
            Your email is only used to link your subscription.
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-cream font-sans text-brown-900 flex flex-col items-center justify-center p-8">
        <div className="bg-white p-8 rounded-[30px] shadow-[0_8px_32px_rgba(75,46,30,0.1)] max-w-md w-full text-center">
          <h1 className="text-xl font-bold mb-2 text-red-600">Connection Failed</h1>
          <p className="text-sm opacity-70 mb-6">{error}</p>
          <button
            onClick={() => {
              setError(null)
              generateToken()
            }}
            className="bg-teal-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-teal-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  // Successfully sent token to extension
  if (tokenSent) {
    return (
      <div className="min-h-screen bg-cream font-sans text-brown-900 flex flex-col items-center justify-center p-8">
        <div className="bg-white p-8 rounded-[30px] shadow-[0_8px_32px_rgba(75,46,30,0.1)] max-w-md w-full text-center">
          <div className="mb-6 flex justify-center">
            <div className="w-16 h-16 bg-teal-500 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          <h1 className="text-2xl font-bold mb-2 text-teal-600">Extension Connected!</h1>
          <p className="text-sm opacity-70 mb-6">
            Signed in as <strong>{session.user?.email}</strong>
          </p>

          <div className="bg-teal-50 p-4 rounded-xl border border-teal-200 mb-6">
            <p className="text-sm text-teal-700">
              Your extension is now connected to your account. You can close this page and start using ThemeGPT!
            </p>
          </div>

          <button
            onClick={() => window.close()}
            className="w-full py-3 rounded-xl font-semibold bg-brown-900 text-white hover:bg-brown-900/90 transition-colors"
          >
            Close This Page
          </button>
        </div>
      </div>
    )
  }

  // Token generated but extension not detected or send failed - show manual copy
  return (
    <div className="min-h-screen bg-cream font-sans text-brown-900 flex flex-col items-center justify-center p-8">
      <div className="bg-white p-8 rounded-[30px] shadow-[0_8px_32px_rgba(75,46,30,0.1)] max-w-md w-full text-center">
        <div className="mb-6 flex justify-center">
          <div className="w-16 h-16 bg-teal-500 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        <h1 className="text-2xl font-bold mb-2 text-teal-600">Account Connected!</h1>
        <p className="text-sm opacity-70 mb-6">
          Signed in as <strong>{session.user?.email}</strong>
        </p>

        {/* Extension not detected warning */}
        {extensionDetected === false && (
          <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 mb-6">
            <h3 className="font-semibold text-amber-700 mb-2">Extension Not Detected</h3>
            <p className="text-sm text-amber-600 mb-3">
              Install the ThemeGPT extension to unlock premium themes.
            </p>
            <Link
              href="https://chromewebstore.google.com/detail/dlphknialdlpmcgoknkcmapmclgckhba?utm_source=web&utm_medium=referral&utm_campaign=extension_auth"
              target="_blank"
              className="inline-block bg-amber-500 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-amber-600 transition-colors"
            >
              Install Extension
            </Link>
          </div>
        )}

        {/* Extension detected but send failed */}
        {extensionDetected === true && !tokenSent && (
          <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 mb-6">
            <p className="text-sm text-amber-700 mb-3">
              Couldn&apos;t auto-connect to the extension. You may need to reload the extension.
            </p>
            <button
              onClick={handleRetrySend}
              className="text-sm text-amber-700 underline font-medium"
            >
              Try Again
            </button>
          </div>
        )}

        <div className="bg-teal-50 p-4 rounded-xl border border-teal-200 mb-6">
          <h3 className="font-semibold text-teal-700 mb-2">Manual Connection</h3>
          <p className="text-sm text-teal-600">
            Copy the token below and paste it in the ThemeGPT extension.
          </p>
        </div>

        {token && (
          <div className="mb-6">
            <div className="bg-cream p-3 rounded-xl border border-brown-900/10 mb-3">
              <code className="text-xs break-all select-all opacity-70">
                {token.substring(0, 20)}...{token.substring(token.length - 20)}
              </code>
            </div>
            <button
              onClick={handleCopy}
              className={`w-full py-3 rounded-xl font-semibold transition-colors ${
                copied
                  ? "bg-teal-500 text-white"
                  : "bg-brown-900 text-white hover:bg-brown-900/90"
              }`}
            >
              {copied ? "Copied!" : "Copy Connection Token"}
            </button>
          </div>
        )}

        <p className="text-xs text-brown-900/50">
          You can close this window after copying the token.
        </p>
      </div>
    </div>
  )
}
