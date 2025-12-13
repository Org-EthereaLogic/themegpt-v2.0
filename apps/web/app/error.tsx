"use client"

import { useEffect } from "react"
import Link from "next/link"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Application error:", error)
  }, [error])

  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-4 text-center">
      <div className="max-w-md">
        <h1 className="text-6xl font-bold text-brown-900 mb-4">Oops!</h1>
        <h2 className="text-xl font-semibold text-brown-900 mb-2">
          Something went wrong
        </h2>
        <p className="text-brown-600 mb-8">
          We encountered an unexpected error. Please try again or return to the home page.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="rounded-full bg-teal-500 px-6 py-3 font-semibold text-white hover:bg-teal-600 transition-colors"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="rounded-full border-2 border-brown-900 px-6 py-3 font-semibold text-brown-900 hover:bg-brown-900 hover:text-white transition-colors"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  )
}
