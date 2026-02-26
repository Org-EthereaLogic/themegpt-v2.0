import { Suspense } from "react"
import Link from "next/link"
import { AnimatedMascot } from "@/components/ui/AnimatedMascot"
import { DEFAULT_THEMES } from "@themegpt/shared"
import { MobileEmailForm } from "./MobileEmailForm"
import { MobileSkipLink } from "./MobileSkipLink"
import { MobileTracking } from "./MobileTracking"

const MOBILE_PREVIEW_THEME_IDS = [
  "themegpt-light",
  "electric-dreams",
  "woodland-retreat",
  "frosted-windowpane",
]
const MOBILE_PREVIEW_THEMES = MOBILE_PREVIEW_THEME_IDS
  .map((themeId) => DEFAULT_THEMES.find((theme) => theme.id === themeId))
  .filter((theme): theme is (typeof DEFAULT_THEMES)[number] => theme !== undefined)
const MAIN_THEME_GALLERY_HREF = "/?skip_mobile=1#themes"
const FALLBACK_PREVIEW_SCREENSHOT = "/themes/themegpt_light_1.webp"
const PREVIEW_THEME_SCREENSHOT_BY_ID: Record<string, string> = {
  "themegpt-light": "/themes/themegpt_light_1.webp",
  "aurora-borealis": "/themes/aurora_borealis_1.webp",
  "sunset-blaze": "/themes/sunset_blaze_1.webp",
  "electric-dreams": "/themes/electric_dreams_1.webp",
  "woodland-retreat": "/themes/woodland_retreat_1.webp",
  "frosted-windowpane": "/themes/frosted_windowpane_1.webp",
  "silent-night-starfield": "/themes/silent_night_1.webp",
  "synth-wave": "/themes/synth_wave_1.webp",
  "shades-of-purple": "/themes/shades_of_purple_1.webp",
}

function getPreviewThemeScreenshot(themeId: string): string {
  return PREVIEW_THEME_SCREENSHOT_BY_ID[themeId] ?? FALLBACK_PREVIEW_SCREENSHOT
}

export default function MobilePage() {
  return (
    <div
      className="min-h-screen flex flex-col items-center px-6 py-12"
      style={{ background: "#FAF6F0" }}
    >
      {/* Attribution + funnel tracking (no visual output) */}
      <Suspense fallback={null}>
        <MobileTracking />
      </Suspense>

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

        {/* Social Proof */}
        <p className="text-[0.8rem] font-medium mb-5" style={{ color: "#5BB5A2" }}>
          Join 22+ users customizing ChatGPT
        </p>

        {/* Email capture form (client island) */}
        <MobileEmailForm />

        <p className="text-[0.85rem] leading-relaxed mb-6" style={{ color: "#7A6555" }}>
          ThemeGPT is a Chrome extension that transforms ChatGPT&apos;s look.
          We&apos;ll email you a direct install link for your computer.
        </p>

        {/* Theme Preview */}
        <Link
          href={MAIN_THEME_GALLERY_HREF}
          className="block text-[0.75rem] font-semibold uppercase tracking-[0.15em] mb-3 transition-opacity active:opacity-80 hover:opacity-80"
          style={{ color: "#5BB5A2" }}
        >
          Preview Free + Premium Themes
        </Link>
        <div className="grid grid-cols-2 gap-2 mb-6">
          {MOBILE_PREVIEW_THEMES.map((theme) => (
            <Link
              key={theme.id}
              href={MAIN_THEME_GALLERY_HREF}
              className="group relative block overflow-hidden rounded-lg border text-left"
              aria-label={`View ${theme.name} in the full theme gallery`}
              style={{
                border: "1px solid rgba(74, 55, 40, 0.08)",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={getPreviewThemeScreenshot(theme.id)}
                alt={`${theme.name} theme preview`}
                loading="lazy"
                decoding="async"
                className="h-16 w-full object-cover transition-transform duration-300 group-active:scale-[0.98] group-hover:scale-[1.03]"
                style={{ background: theme.colors["--cgpt-bg"] }}
              />
              <div
                className="absolute inset-x-0 bottom-0 px-2 py-1.5"
                style={{
                  background: "linear-gradient(to top, rgba(0,0,0,0.75), rgba(0,0,0,0.2), transparent)",
                }}
              >
                <div
                  className="text-[0.72rem] font-semibold leading-tight"
                  style={{
                    color: "#F5F0EB",
                    textShadow: "0 1px 2px rgba(0,0,0,0.35)",
                  }}
                >
                  {theme.name}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Features */}
        <div className="flex justify-center gap-6 text-[0.8rem]" style={{ color: "#7A6555" }}>
          <span>7 free themes</span>
          <span>Privacy-first</span>
          <span>One-click setup</span>
        </div>
      </div>

      {/* Skip link (tracked in client island) */}
      <MobileSkipLink />
    </div>
  )
}
