"use client"

import { useState } from "react"
import Image from "next/image"
import { DEFAULT_THEMES, type Theme } from "@themegpt/shared"

// Separate themes by premium status
const FREE_THEMES = DEFAULT_THEMES.filter(t => !t.isPremium)
const PREMIUM_THEMES = DEFAULT_THEMES.filter(t => t.isPremium)

// Helper to determine theme type label
function getThemeTypeLabel(theme: Theme): string {
  // Check for animated effects
  if (theme.effects?.auroraGradient?.enabled) return "✨ Aurora Effect"
  if (theme.effects?.animatedSnowfall?.enabled) return "❄️ Snowfall Effect"
  if (theme.effects?.twinklingStars?.enabled) return "⭐ Starfield Effect"
  if (theme.effects?.ambientEffects?.neonGrid) return "🌆 Neon Grid Effect"

  // Check if light or dark based on background
  const bg = theme.colors['--cgpt-bg']
  const isLight = isLightColor(bg)
  return isLight ? "☀️ Light Theme" : "🌙 Dark Theme"
}

// Helper to check if a color is light
function isLightColor(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.5
}

// Helper to check if theme has animated effects
function hasAnimatedEffects(theme: Theme): boolean {
  return !!(
    theme.effects?.auroraGradient?.enabled ||
    theme.effects?.animatedSnowfall?.enabled ||
    theme.effects?.twinklingStars?.enabled ||
    theme.effects?.ambientEffects?.neonGrid ||
    theme.effects?.ambientEffects?.auroraWaves
  )
}

// Map theme IDs to screenshot filenames
function getThemeScreenshots(themeId: string): { home: string; content: string } {
  const mapping: Record<string, { home: string; content: string }> = {
    'themegpt-dark': { home: '/themes/themegpt_dark_1.png', content: '/themes/themegpt_dark_2.png' },
    'themegpt-light': { home: '/themes/themegpt_light_1.png', content: '/themes/themegpt_light_2.png' },
    'solarized-dark': { home: '/themes/solarized_dark_1.png', content: '/themes/solarized_dark_2.png' },
    'dracula': { home: '/themes/dracula_1.png', content: '/themes/dracula_2.png' },
    'monokai-pro': { home: '/themes/monokai_pro_1.png', content: '/themes/monokai_pro_2.png' },
    'high-contrast': { home: '/themes/high_contrast_1.png', content: '/themes/high_contrast_2.png' },
    'one-dark': { home: '/themes/one_dark_1.png', content: '/themes/one_dark_2.png' },
    'aurora-borealis': { home: '/themes/aurora_borealis_1.png', content: '/themes/aurora_borealis_2.png' },
    'sunset-blaze': { home: '/themes/sunset_blaze_1.png', content: '/themes/sunset_blaze_2.png' },
    'electric-dreams': { home: '/themes/electric_dreams_1.png', content: '/themes/electric_dreams_2.png' },
    'woodland-retreat': { home: '/themes/woodland_retreat_1.png', content: '/themes/woodland_retreat_2.png' },
    'frosted-windowpane': { home: '/themes/frosted_windowpane_1.png', content: '/themes/frosted_windowpane_2.png' },
    'silent-night-starfield': { home: '/themes/silent_night_1.png', content: '/themes/silent_night_2.png' },
    'synth-wave': { home: '/themes/synth_wave_1.png', content: '/themes/synth_wave_2.png' },
    'shades-of-purple': { home: '/themes/shades_of_purple_1.png', content: '/themes/shades_of_purple_2.png' },
  }
  return mapping[themeId] || { home: '', content: '' }
}

export default function Home() {
  const [selectedTheme, setSelectedTheme] = useState<string>(PREMIUM_THEMES[0]?.id || '')
  const [checkoutError, setCheckoutError] = useState<string | null>(null)

  const handleCheckout = async (type: 'subscription' | 'single', themeId?: string) => {
    setCheckoutError(null)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, themeId })
      })
      const data = await res.json()
      if (data.success && data.checkoutUrl) {
        window.location.href = data.checkoutUrl
      } else {
        setCheckoutError('Checkout failed: ' + (data.message || 'Unknown error'))
      }
    } catch (error) {
      console.error('Checkout error', error)
      setCheckoutError('Unable to process checkout. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-cream font-sans text-brown-900">

      {/* Header */}
      <header className="flex items-center justify-between border-b border-cream-dark bg-cream px-8 py-4">
        <div className="flex items-center gap-2.5">
          <Image
            src="/mascot-48.png"
            alt="ThemeGPT mascot"
            width={40}
            height={40}
            className="h-10 w-10 rounded-full shadow-sm"
            priority
          />
          <span className="text-xl font-bold text-brown-900">ThemeGPT</span>
        </div>
        <nav className="flex items-center gap-7">
          {[
            { label: "Themes", href: "#themes" },
            { label: "Pricing", href: "#pricing" },
            { label: "Features", href: "#features" },
          ].map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-[15px] font-medium text-brown-900 hover:text-teal-500 transition-colors"
            >
              {item.label}
            </a>
          ))}
          <a href="#waitlist" className="cursor-pointer rounded-full bg-teal-500 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:-translate-y-px hover:shadow-lg hover:shadow-teal-500/30">
            Join Waitlist
          </a>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative px-8 py-[70px] text-center">

        <h1 className="mb-4.5 text-5xl font-bold leading-[1.15] text-brown-900">
          Make ChatGPT <span className="text-teal-500">yours</span>
        </h1>
        <p className="mx-auto mb-7 max-w-[520px] text-lg leading-relaxed text-brown-600">
          Beautiful themes that match your style. No coding, no hassle—just click
          and transform your ChatGPT experience.
        </p>
        <div className="flex justify-center gap-3.5">
          <a href="#waitlist" className="cursor-pointer rounded-full bg-brown-900 px-7 py-3.5 text-base font-semibold text-white transition-transform hover:-translate-y-px">
            Join Waitlist
          </a>
          <a href="#themes" className="cursor-pointer rounded-full border-[2px] border-brown-900 bg-transparent px-6 py-3 text-base font-semibold text-brown-900 transition-all hover:bg-brown-900 hover:text-white">
            View Themes
          </a>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="bg-cream px-8 pt-[30px] pb-[30px] text-center">
        <h2 className="mb-6 text-[32px] font-bold text-brown-900">
          ✨ Simple Pricing
        </h2>
        <div className="flex flex-wrap justify-center gap-6 max-w-4xl mx-auto">
            {/* Subscription Card */}
            <div className="bg-white p-6 rounded-[24px] shadow-sm flex-1 min-w-[280px] border-2 border-teal-500 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-teal-500 text-white text-[10px] uppercase font-bold px-3 py-1 rounded-bl-lg">
                    Best Value
                </div>
                <h3 className="text-xl font-bold mb-2">Infinite Style</h3>
                <div className="text-4xl font-bold text-brown-900 mb-2">$1.99<span className="text-base font-normal opacity-60">/mo</span></div>
                <p className="opacity-70 text-sm mb-6 min-h-[40px]">Access to 3 active premium themes at once. Swap anytime.</p>
                <button
                  onClick={() => handleCheckout('subscription')}
                  className="w-full py-3 rounded-xl bg-teal-500 text-white font-bold hover:bg-teal-600 transition-colors"
                >
                    Subscribe Now
                </button>
            </div>

            {/* Pay Per Theme Card */}
            <div className="bg-white p-6 rounded-[24px] shadow-sm flex-1 min-w-[280px] border border-brown-900/10">
                <h3 className="text-xl font-bold mb-2">Single Theme</h3>
                <div className="text-4xl font-bold text-brown-900 mb-2">$0.99<span className="text-base font-normal opacity-60">/ea</span></div>
                <p className="opacity-70 text-sm mb-4 min-h-[40px]">Own a specific theme forever. One-time purchase.</p>
                <label htmlFor="theme-select" className="block text-sm font-medium text-brown-900/70 mb-2 text-left">
                  Select Theme
                </label>
                <select
                  id="theme-select"
                  value={selectedTheme}
                  onChange={(e) => setSelectedTheme(e.target.value)}
                  className="w-full mb-4 py-2.5 px-3 rounded-lg border border-brown-900/20 bg-white text-brown-900 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                >
                  {PREMIUM_THEMES.map((theme) => (
                    <option key={theme.id} value={theme.id}>
                      {theme.name} {hasAnimatedEffects(theme) ? '✨' : ''}
                    </option>
                  ))}
                </select>
                <button
                   onClick={() => handleCheckout('single', selectedTheme)}
                   className="w-full py-3 rounded-xl bg-brown-900 text-white font-bold hover:bg-brown-800 transition-colors"
                >
                    Buy One Theme
                </button>
            </div>
        </div>
        {checkoutError && (
          <div className="mt-4 max-w-4xl mx-auto p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm" role="alert">
            {checkoutError}
          </div>
        )}
      </section>

      {/* Premium Themes Section */}
      <div className="bg-cream px-8 pt-[50px] pb-[30px] text-center">
        <h2 className="mb-2 text-[32px] font-bold text-brown-900">
          ✨ Premium Collection
        </h2>
        <p className="text-base text-brown-600 max-w-2xl mx-auto">
          Stunning themes with animated effects — aurora lights, snowfall, starfields, and more.
        </p>
      </div>

      {/* Premium Theme Gallery */}
      <section id="themes" className="px-8 pb-[50px] pt-5">
        <div className="mx-auto grid max-w-[1000px] grid-cols-1 gap-7 md:grid-cols-2 lg:grid-cols-3">
          {PREMIUM_THEMES.map((theme) => (
            <ThemeCard
              key={theme.id}
              theme={theme}
              onBuy={() => handleCheckout('single', theme.id)}
            />
          ))}
        </div>
      </section>

      {/* Free Themes Section */}
      <div className="bg-cream-dark/30 px-8 pt-[50px] pb-[30px] text-center">
        <h2 className="mb-2 text-[32px] font-bold text-brown-900">
          🎁 Free Themes
        </h2>
        <p className="text-base text-brown-600 max-w-2xl mx-auto">
          Classic IDE themes included free with the extension. No purchase required.
        </p>
      </div>

      {/* Free Theme Gallery */}
      <section className="bg-cream-dark/30 px-8 pb-[70px] pt-5">
        <div className="mx-auto grid max-w-[1000px] grid-cols-1 gap-7 md:grid-cols-2 lg:grid-cols-3">
          {FREE_THEMES.map((theme) => (
            <ThemeCard
              key={theme.id}
              theme={theme}
              isFree
            />
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t border-cream-dark bg-cream px-8 py-[70px] text-center">
        <h2 className="mb-9 text-[32px] font-bold text-brown-900">
          Why ThemeGPT?
        </h2>
        <div className="mx-auto grid max-w-[900px] grid-cols-1 gap-6 md:grid-cols-3">
          <FeatureCard
            icon="🎨"
            title="One-Click Themes"
            description="Transform ChatGPT instantly with beautiful, professionally designed themes. No coding required."
          />
          <FeatureCard
            icon="🔒"
            title="Privacy First"
            description="Everything runs locally in your browser. We never collect your data or track your conversations."
          />
          <FeatureCard
            icon="📊"
            title="Token Tracking"
            description="Monitor your ChatGPT usage in real-time. Know exactly how many tokens each conversation uses."
          />
        </div>
      </section>

      {/* Waitlist */}
      <section id="waitlist" className="bg-brown-900 px-8 py-[70px] text-center">
        <h2 className="mb-4 text-[32px] font-bold text-cream">
          Join the Waitlist
        </h2>
        <p className="mx-auto mb-8 max-w-[480px] text-lg text-cream/80">
          Be the first to know when ThemeGPT launches. Get early access and exclusive themes.
        </p>
        <div className="mx-auto flex max-w-md gap-3">
          <input
            type="email"
            placeholder="Enter your email"
            className="flex-1 rounded-full bg-white/10 px-5 py-3 text-cream placeholder:text-cream/50 border border-cream/20 focus:outline-none focus:border-teal-500"
          />
          <button className="rounded-full bg-teal-500 px-6 py-3 font-semibold text-white hover:bg-teal-600 transition-colors">
            Notify Me
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-brown-900 p-7 text-center text-sm text-cream">
        <div className="flex justify-center gap-6 mb-4">
          <a href="/privacy" className="text-cream/80 hover:text-cream">
            Privacy Policy
          </a>
          <a href="/terms" className="text-cream/80 hover:text-cream">
            Terms of Service
          </a>
        </div>
        <span className="opacity-85">
          No tracking - No data collection - Just beautiful themes
        </span>
      </footer>
    </div>
  );
}

// --- Helper Components ---

interface ThemeCardProps {
  theme: Theme;
  onBuy?: () => void;
  isFree?: boolean;
}

function ThemeCard({ theme, onBuy, isFree }: ThemeCardProps) {
  const typeLabel = getThemeTypeLabel(theme)
  const hasEffects = hasAnimatedEffects(theme)
  const screenshots = getThemeScreenshots(theme.id)

  return (
    <div className="group relative cursor-pointer overflow-hidden rounded-[20px] bg-white p-3 shadow-[0_4px_24px_rgba(75,46,30,0.1)] transition-all duration-300 ease-out hover:scale-[1.15] hover:z-20 hover:shadow-[0_16px_48px_rgba(75,46,30,0.25)]">
      {/* Animated effect badge */}
      {hasEffects && (
        <div className="absolute top-5 right-5 z-10 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[10px] uppercase font-bold px-2.5 py-1 rounded-full shadow-lg">
          ✨ Animated
        </div>
      )}

      <div className="overflow-hidden rounded-xl">
        {/* Theme screenshot preview with hover transition */}
        <div className="relative min-h-[180px] overflow-hidden">
          {/* Home screen (default) */}
          <Image
            src={screenshots.home}
            alt={`${theme.name} home screen`}
            width={400}
            height={225}
            className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-0"
          />
          {/* Content screen (on hover) */}
          <Image
            src={screenshots.content}
            alt={`${theme.name} content view`}
            width={400}
            height={225}
            className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          />
          {/* Hover indicator */}
          <div className="absolute bottom-2 right-2 bg-black/50 text-white text-[9px] px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
            Content View
          </div>
        </div>
      </div>

      {/* Card footer */}
      <div className="flex items-center justify-between bg-white px-1.5 pt-3.5 pb-1.5">
        <div>
          <div className="text-[15px] font-semibold text-brown-900">{theme.name}</div>
          <div className="mt-0.5 text-xs text-brown-600">{typeLabel}</div>
        </div>
        {isFree ? (
          <span className="rounded-[20px] bg-green-500/10 text-green-600 px-4 py-2 text-[13px] font-medium">
            Free
          </span>
        ) : (
          <button
            onClick={(e) => {
                e.stopPropagation()
                onBuy?.()
            }}
            className="cursor-pointer rounded-[20px] bg-teal-500/10 text-teal-600 hover:bg-teal-500 hover:text-white px-4 py-2 text-[13px] font-medium transition-colors"
          >
            Buy $0.99
          </button>
        )}
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center rounded-[20px] bg-white p-8 shadow-[0_4px_24px_rgba(75,46,30,0.08)]">
      <div className="mb-4 text-4xl">{icon}</div>
      <h3 className="mb-2 text-lg font-bold text-brown-900">{title}</h3>
      <p className="text-sm leading-relaxed text-brown-600">{description}</p>
    </div>
  );
}
