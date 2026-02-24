"use client"

import { useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { trackFunnelEvent } from "@/lib/funnel-events"

export default function WelcomePage() {
  useEffect(() => {
    trackFunnelEvent("extension_installed", {
      source: "oninstall_welcome",
    })
  }, [])

  const steps = [
    {
      number: "1",
      title: "Install",
      description: "ThemeGPT is installed and ready to go.",
      done: true,
    },
    {
      number: "2",
      title: "Connect Account",
      description: "Link your account to unlock premium features.",
      done: false,
    },
    {
      number: "3",
      title: "Try Premium Free",
      description: "8 animated themes, free for 30 days.",
      done: false,
    },
  ]

  return (
    <div className="min-h-screen bg-cream font-sans text-brown flex flex-col items-center justify-center p-6">
      <div className="bg-white p-8 rounded-[30px] shadow-[0_8px_32px_rgba(75,46,30,0.1)] max-w-lg w-full text-center">
        {/* Mascot + Headline */}
        <div className="mb-6 flex justify-center">
          <Image
            src="/mascot-transparent.png"
            alt="ThemeGPT mascot"
            width={80}
            height={80}
            className="rounded-full shadow-sm"
          />
        </div>
        <h1 className="text-3xl font-serif font-bold mb-2">
          Welcome to ThemeGPT!
        </h1>
        <p className="text-sm text-brown/70 mb-8">
          Personalize your ChatGPT with beautiful, animated themes.
        </p>

        {/* 3-Step Visual Guide */}
        <div className="flex items-center justify-center gap-3 mb-8">
          {steps.map((step, i) => (
            <div key={step.number} className="flex items-center gap-3">
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                    step.done
                      ? "bg-teal text-white"
                      : "bg-cream-deep text-brown/60"
                  }`}
                >
                  {step.done ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    step.number
                  )}
                </div>
                <span className="text-xs font-medium whitespace-nowrap">{step.title}</span>
              </div>
              {i < steps.length - 1 && (
                <div className="w-8 h-px bg-brown/20 mb-5" />
              )}
            </div>
          ))}
        </div>

        {/* Value Prop */}
        <div className="bg-cream p-4 rounded-xl mb-6">
          <p className="text-sm text-brown/80">
            8 animated premium themes, free for 30 days. No credit card required.
          </p>
        </div>

        {/* CTAs */}
        <div className="space-y-3">
          <Link
            href="/auth/extension?utm_source=extension&utm_medium=welcome&utm_campaign=onboarding"
            className="block w-full py-3 rounded-xl font-semibold bg-coral text-brown hover:bg-coral-bright transition-colors text-center"
          >
            Connect Your Account
          </Link>
          <a
            href="https://chatgpt.com"
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full py-3 rounded-xl font-semibold border border-brown/20 text-brown/70 hover:bg-cream transition-colors text-center"
          >
            Start Using Free Themes
          </a>
        </div>
      </div>
    </div>
  )
}
