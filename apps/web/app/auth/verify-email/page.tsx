"use client"

import { useSearchParams } from "next/navigation"
import { useEffect, useState, Suspense } from "react"
import { signIn } from "next-auth/react"
import Image from "next/image"

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const email = searchParams.get("email")
  const callbackUrl = searchParams.get("callbackUrl") || "/auth/extension"
  const [status, setStatus] = useState<"verifying" | "error">("verifying")

  useEffect(() => {
    if (!token || !email) {
      setStatus("error")
      return
    }

    signIn("email", {
      email,
      token,
      callbackUrl,
      redirect: true,
    })
  }, [token, email, callbackUrl])

  return (
    <div className="min-h-screen bg-cream font-sans text-brown flex flex-col items-center justify-center p-8">
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
        {status === "verifying" ? (
          <>
            <h1 className="text-xl font-bold mb-2">Verifying your email...</h1>
            <p className="text-sm opacity-70">
              Please wait while we sign you in.
            </p>
          </>
        ) : (
          <>
            <h1 className="text-xl font-bold mb-2 text-red-600">
              Invalid or Expired Link
            </h1>
            <p className="text-sm opacity-70 mb-6">
              This sign-in link is invalid or has expired. Please request a new one.
            </p>
            <a
              href="/auth/extension"
              className="inline-block bg-coral text-brown px-6 py-3 rounded-full font-semibold hover:bg-coral-bright transition-colors"
            >
              Try Again
            </a>
          </>
        )}
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-cream font-sans text-brown flex items-center justify-center">
          <p>Loading...</p>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  )
}
