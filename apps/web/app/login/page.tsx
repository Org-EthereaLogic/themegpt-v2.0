"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function Spinner({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`animate-spin h-5 w-5 ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

function LoginContent() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/account";
  const error = searchParams.get("error");
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);

  const handleSignIn = async (provider: "google" | "github") => {
    setLoadingProvider(provider);
    await signIn(provider, { callbackUrl });
    // Note: signIn redirects, so state reset is not needed
  };

  return (
    <div className="min-h-screen bg-[#FAF6F0] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#4B2E1E] mb-2">
            Sign in to ThemeGPT
          </h1>
          <p className="text-[#7D5A4A]">
            Access your account to manage subscriptions and download themes
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error === "OAuthAccountNotLinked"
              ? "This email is already associated with another account."
              : "An error occurred during sign in. Please try again."}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg p-8 space-y-4">
          <button
            onClick={() => handleSignIn("google")}
            disabled={loadingProvider !== null}
            aria-busy={loadingProvider === "google"}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-[#E5DDD5] rounded-lg hover:bg-[#FAF6F0] transition-all duration-300 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#5BB5A2] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
          >
            {loadingProvider === "google" ? (
              <Spinner className="text-[#4B2E1E]" />
            ) : (
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
            )}
            <span className="text-[#4B2E1E] font-medium">
              {loadingProvider === "google" ? "Signing in..." : "Continue with Google"}
            </span>
          </button>

          <button
            onClick={() => handleSignIn("github")}
            disabled={loadingProvider !== null}
            aria-busy={loadingProvider === "github"}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-[#E5DDD5] rounded-lg hover:bg-[#FAF6F0] transition-all duration-300 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#5BB5A2] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
          >
            {loadingProvider === "github" ? (
              <Spinner className="text-[#4B2E1E]" />
            ) : (
              <svg className="w-5 h-5" fill="#4B2E1E" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
            )}
            <span className="text-[#4B2E1E] font-medium">
              {loadingProvider === "github" ? "Signing in..." : "Continue with GitHub"}
            </span>
          </button>
        </div>

        <p className="text-center text-sm text-[#7D5A4A] mt-6">
          By signing in, you agree to our{" "}
          <a href="/terms" className="text-[#7ECEC5] hover:underline">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="/privacy" className="text-[#7ECEC5] hover:underline">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAF6F0] flex items-center justify-center">
          <div className="animate-pulse text-[#4B2E1E]">Loading...</div>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
