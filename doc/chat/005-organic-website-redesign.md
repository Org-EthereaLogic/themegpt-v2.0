⏺ Let me start implementing the plan. First, I'll create the feature branch and set up my task tracking.

⏺ Bash(git checkout -b feature/organic-website-redesign)
  ⎿  Switched to a new branch 'feature/organic-website-redesign'

⏺ Read(apps/web/app/layout.tsx)
  ⎿  Read 54 lines

⏺ Read(apps/web/app/globals.css)
  ⎿  Read 57 lines

⏺ Now I'll update the fonts and color palette. Let me start with the layout.tsx:

⏺ Update(apps/web/app/layout.tsx)
  ⎿  Added 7 lines, removed 5 lines
       1  import type { Metadata } from "next";
       2 -import { Geist, Geist_Mono } from "next/font/google";
       2 +import { DM_Sans, Fraunces } from "next/font/google";
       3  import { SessionProvider } from "@/components/SessionProvider";
       4  import "./globals.css";
       5
       6 -const geistSans = Geist({
       7 -  variable: "--font-geist-sans",
       6 +const dmSans = DM_Sans({
       7    subsets: ["latin"],
       8 +  variable: "--font-dm-sans",
       9 +  weight: ["400", "500", "600", "700"],
      10  });
      11
      11 -const geistMono = Geist_Mono({
      12 -  variable: "--font-geist-mono",
      12 +const fraunces = Fraunces({
      13    subsets: ["latin"],
      14 +  variable: "--font-fraunces",
      15 +  weight: ["400", "500", "600", "700"],
      16  });
      17
      18  export const metadata: Metadata = {

⏺ Update(apps/web/app/layout.tsx)
  ⎿  Added 1 line, removed 1 line
      46    return (
      47      <html lang="en">
      48        <body
      49 -        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      49 +        className={`${dmSans.variable} ${fraunces.variable} antialiased`}
      50        >
      51          <SessionProvider>{children}</SessionProvider>
      52        </body>

⏺ Now let me update globals.css with the organic color palette and animations:

⏺ Write(apps/web/app/globals.css)
  ⎿  Added 122 lines, removed 34 lines
        1  @import "tailwindcss";
        2
        3  :root {
        4 -  /* Brand Palette - Option B */
        5 -  --cream: #FFF8E8;
        6 -  --cream-dark: #E5DECF;
        7 -  --brown-900: #4B2E1E;
        8 -  --brown-600: #7a5a49;
        9 -  --teal-500: #1F9E8F;
       10 -  --teal-600: #178a7b;
       11 -  --orange-accent: #E8956A;
       12 -
       13 -  /* Semantic Mappings */
        4 +  /* ThemeGPT Brand - Warm & Organic */
        5 +  --cream: #FDF8F3;
        6 +  --cream-warm: #FFF9F2;
        7 +  --cream-deep: #F5EDE3;
        8 +  --teal: #5BB5A2;
        9 +  --teal-soft: #7BCBB9;
       10 +  --teal-bright: #3AA08C;
       11 +  --coral: #E8A87C;
       12 +  --coral-soft: #F4C4A0;
       13 +  --coral-bright: #E08A54;
       14 +  --brown: #4A3728;
       15 +  --brown-soft: #7A6555;
       16 +  --yellow: #F4E4BA;
       17 +  --yellow-bright: #FFDF82;
       18 +
       19 +  /* Semantic */
       20    --background: var(--cream);
       15 -  --foreground: var(--brown-900);
       21 +  --foreground: var(--brown);
       22  }
       23
       24  @theme inline {
       25    --color-background: var(--background);
       26    --color-foreground: var(--foreground);
       21 -
       22 -  /* Custom Color Utilities */
       23 -  --color-cream: var(--cream);
       24 -  --color-cream-dark: var(--cream-dark);
       25 -  --color-brown-900: var(--brown-900);
       26 -  --color-brown-600: var(--brown-600);
       27 -  --color-teal-500: var(--teal-500);
       28 -  --color-teal-600: var(--teal-600);
       29 -  --color-orange-accent: var(--orange-accent);
       27
       31 -  --font-sans: var(--font-geist-sans);
       32 -  --font-mono: var(--font-geist-mono);
       28 +  /* Organic Color Utilities */
       29 +  --color-cream: #FDF8F3;
       30 +  --color-cream-warm: #FFF9F2;
       31 +  --color-cream-deep: #F5EDE3;
       32 +  --color-teal: #5BB5A2;
       33 +  --color-teal-soft: #7BCBB9;
       34 +  --color-teal-bright: #3AA08C;
       35 +  --color-coral: #E8A87C;
       36 +  --color-coral-soft: #F4C4A0;
       37 +  --color-coral-bright: #E08A54;
       38 +  --color-brown: #4A3728;
       39 +  --color-brown-soft: #7A6555;
       40 +  --color-yellow: #F4E4BA;
       41 +  --color-yellow-bright: #FFDF82;
       42 +
       43 +  --font-sans: var(--font-dm-sans);
       44 +  --font-serif: var(--font-fraunces);
       45  }
       46
       47 +html {
       48 +  scroll-behavior: smooth;
       49 +}
       50 +
       51  body {
       52    background: var(--background);
       53    color: var(--foreground);
       54    font-family: var(--font-sans), system-ui, sans-serif;
       55 +  overflow-x: hidden;
       56 +  line-height: 1.6;
       57  }
       58
       41 -/* Subtle noise texture overlay for tactile warmth */
       42 -.noise-texture {
       43 -  position: relative;
       59 +/* ===== ANIMATIONS ===== */
       60 +
       61 +/* Blob float animation - organic shape morphing */
       62 +@keyframes blobFloat {
       63 +  0%, 100% {
       64 +    transform: translate(0, 0) rotate(0deg) scale(1);
       65 +    border-radius: 40% 60% 60% 40% / 60% 40% 60% 40%;
       66 +  }
       67 +  33% {
       68 +    transform: translate(30px, -30px) rotate(120deg) scale(1.05);
       69 +    border-radius: 60% 40% 30% 70% / 50% 60% 40% 50%;
       70 +  }
       71 +  66% {
       72 +    transform: translate(-20px, 20px) rotate(240deg) scale(0.95);
       73 +    border-radius: 30% 60% 70% 40% / 50% 30% 50% 70%;
       74 +  }
       75  }
       76
       46 -.noise-texture::before {
       77 +/* Mascot wobble animation */
       78 +@keyframes mascotWobble {
       79 +  0%, 100% { border-radius: 50% 50% 50% 50%; }
       80 +  25% { border-radius: 45% 55% 55% 45%; }
       81 +  50% { border-radius: 55% 45% 45% 55%; }
       82 +  75% { border-radius: 50% 50% 45% 55%; }
       83 +}
       84 +
       85 +/* Eye blink animation */
       86 +@keyframes blink {
       87 +  0%, 45%, 55%, 100% { transform: scaleY(1); }
       88 +  50% { transform: scaleY(0.1); }
       89 +}
       90 +
       91 +/* Wave underline flow */
       92 +@keyframes waveFlow {
       93 +  from { background-position-x: 0; }
       94 +  to { background-position-x: 50px; }
       95 +}
       96 +
       97 +/* Float animations for hero cards */
       98 +@keyframes float1 {
       99 +  0%, 100% { transform: rotate(-8deg) translateY(0); }
      100 +  50% { transform: rotate(-6deg) translateY(-15px); }
      101 +}
      102 +
      103 +@keyframes float2 {
      104 +  0%, 100% { transform: rotate(6deg) translateY(0); }
      105 +  50% { transform: rotate(4deg) translateY(-12px); }
      106 +}
      107 +
      108 +@keyframes float3 {
      109 +  0%, 100% { transform: rotate(4deg) translateY(0); }
      110 +  50% { transform: rotate(6deg) translateY(-18px); }
      111 +}
      112 +
      113 +/* Slide in animations */
      114 +@keyframes slideInLeft {
      115 +  from { opacity: 0; transform: translateX(-40px); }
      116 +  to { opacity: 1; transform: translateX(0); }
      117 +}
      118 +
      119 +@keyframes slideInRight {
      120 +  from { opacity: 0; transform: translateX(60px); }
      121 +  to { opacity: 1; transform: translateX(0); }
      122 +}
      123 +
      124 +/* ===== UTILITY CLASSES ===== */
      125 +
      126 +/* Wave underline for hero title */
      127 +.wave-underline::after {
      128    content: '';
       48 -  position: fixed;
       49 -  inset: 0;
       50 -  pointer-events: none;
       51 -  z-index: 0;
       52 -  opacity: 0.4;
       53 -  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n
          -oise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect w
          -idth='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
       54 -  background-repeat: repeat;
       55 -  background-size: 180px 180px;
      129 +  position: absolute;
      130 +  bottom: 4px;
      131 +  left: 0;
      132 +  right: 0;
      133 +  height: 8px;
      134 +  background: url("data:image/svg+xml,%3Csvg viewBox='0 0 100 10' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 5 Q25 0
          +50 5 T100 5' stroke='%23E8A87C' stroke-width='3' fill='none'/%3E%3C/svg%3E") repeat-x;
      135 +  background-size: 50px 10px;
      136 +  animation: waveFlow 2s linear infinite;
      137  }
      138 +
      139 +/* Custom cursor hidden on touch devices */
      140 +@media (pointer: coarse) {
      141 +  .custom-cursor {
      142 +    display: none !important;
      143 +  }
      144 +}

⏺ Phase 1 complete. Now moving to Phase 2 - creating UI components:

⏺ Bash(mkdir -p /Users/etherealogic/Dev/themegpt-v2.0/apps/web/components/ui
      /Users/etherealogic/Dev/themegpt-v2.0/apps/web/components/sections)
  ⎿  (No content)

⏺ Write(apps/web/components/ui/AnimatedMascot.tsx)
  ⎿  Wrote 71 lines to apps/web/components/ui/AnimatedMascot.tsx
      1 "use client";
      2 interface AnimatedMascotProps {
      3   size?: "sm" | "md" | "lg";
      4   className?: string;
      5 }
      6 const sizeClasses = {
      7   sm: { outer: "w-10 h-10", eye: "w-1 h-1 gap-2", smile: "w-3 h-1.5" },
      8   md: { outer: "w-[52px] h-[52px]", eye: "w-1.5 h-1.5 gap-2.5", smile: "w-3.5 h-[7px]" },
     … +61 lines (ctrl+o to expand)

⏺ Write(apps/web/components/ui/OrganicBlob.tsx)
  ⎿  Wrote 46 lines to apps/web/components/ui/OrganicBlob.tsx
      1 "use client";
      2 interface OrganicBlobProps {
      3   color: "teal-soft" | "coral-soft" | "yellow" | "teal" | "coral";
      4   size: number;
      5   position: { top?: string; right?: string; bottom?: string; left?: string };
      6   animationDelay?: string;
      7   blur?: number;
      8   opacity?: number;
      9   className?: string;
     … +36 lines (ctrl+o to expand)

⏺ Write(apps/web/components/ui/FloatingCard.tsx)
  ⎿  Wrote 82 lines to apps/web/components/ui/FloatingCard.tsx
      1 "use client";
      2 interface FloatingCardProps {
      3   gradient: string;
      4   label: string;
      5   dotColors: [string, string, string];
      6   lineColor: string;
      7   labelBgColor: string;
      8   labelTextColor: string;
      9   rotation: number;
     … +72 lines (ctrl+o to expand)

⏺ Write(apps/web/components/ui/CustomCursor.tsx)
  ⎿  Wrote 59 lines to apps/web/components/ui/CustomCursor.tsx
      1 "use client";
      2 import { useEffect, useState } from "react";
      3 export function CustomCursor() {
      4   const [position, setPosition] = useState({ x: 0, y: 0 });
      5   const [isHovering, setIsHovering] = useState(false);
      6   const [isVisible, setIsVisible] = useState(false);
      7   useEffect(() => {
     … +49 lines (ctrl+o to expand)

⏺ Now Phase 3 - creating section components. Let me first read the current page.tsx to understand the Stripe checkout integration:

⏺ Read(apps/web/app/page.tsx)
  ⎿  Read 422 lines

⏺ Now I understand the checkout integration. Let me create all section components:

⏺ Write(apps/web/components/sections/Navigation.tsx)
  ⎿  Wrote 63 lines to apps/web/components/sections/Navigation.tsx
      1 "use client";
      2 import { useEffect, useState } from "react";
      3 import { AnimatedMascot } from "@/components/ui/AnimatedMascot";
      4 export function Navigation() {
      5   const [isScrolled, setIsScrolled] = useState(false);
      6   useEffect(() => {
      7     const handleScroll = () => {
     … +53 lines (ctrl+o to expand)

⏺ Write(apps/web/components/sections/Hero.tsx)
  ⎿  Wrote 162 lines to apps/web/components/sections/Hero.tsx
      1 "use client";
      2 import { OrganicBlob } from "@/components/ui/OrganicBlob";
      3 import { FloatingCard } from "@/components/ui/FloatingCard";
      4 export function Hero() {
      5   return (
      6     <section className="relative min-h-screen grid grid-cols-1 lg:grid-cols-2 items-center gap-8 lg:gap-16 px-6 py-32 lg:px-24 o
        verflow-hidden">
      7       {/* Background Blobs */}
      8       <div className="absolute inset-0 pointer-events-none overflow-hidden">
     … +152 lines (ctrl+o to expand)

⏺ Write(apps/web/components/sections/ThemesSection.tsx)
  ⎿  Wrote 149 lines to apps/web/components/sections/ThemesSection.tsx
      1 "use client";
      2 import { motion } from "framer-motion";
      3 import Image from "next/image";
      4 import { DEFAULT_THEMES, type Theme } from "@themegpt/shared";
      5 const PREMIUM_THEMES = DEFAULT_THEMES.filter((t) => t.isPremium).slice(0, 5);
      6 function getThemeScreenshots(themeId: string): { home: string; content: string } {
      7   const mapping: Record<string, { home: string; content: string }> = {
     … +139 lines (ctrl+o to expand)

⏺ Write(apps/web/components/sections/FeaturesSection.tsx)
  ⎿  Wrote 79 lines to apps/web/components/sections/FeaturesSection.tsx
      1 "use client";
      2 import { motion } from "framer-motion";
      3 const features = [
      4   {
      5     emoji: "🎨",
      6     title: "One-Click Magic",
      7     description:
      8       "No coding, no CSS editing. Just browse, click, and watch your ChatGPT transform instantly.",
     … +69 lines (ctrl+o to expand)

⏺ Write(apps/web/components/sections/PricingSection.tsx)
  ⎿  Wrote 226 lines to apps/web/components/sections/PricingSection.tsx
      1 "use client";
      2 import { motion } from "framer-motion";
      3 import { OrganicBlob } from "@/components/ui/OrganicBlob";
      4 import { DEFAULT_THEMES, type Theme } from "@themegpt/shared";
      5 const PREMIUM_THEMES = DEFAULT_THEMES.filter((t) => t.isPremium);
      6 function hasAnimatedEffects(theme: Theme): boolean {
      7   return !!(
     … +216 lines (ctrl+o to expand)

⏺ Write(apps/web/components/sections/Footer.tsx)
  ⎿  Wrote 63 lines to apps/web/components/sections/Footer.tsx
      1 "use client";
      2 import { AnimatedMascot } from "@/components/ui/AnimatedMascot";
      3 const footerLinks = [
      4   { label: "Privacy", href: "/privacy" },
      5   { label: "Terms", href: "/terms" },
      6   { label: "Support", href: "mailto:support@themegpt.app" },
      7   { label: "Chrome Web Store", href: "https://chromewebstore.google.com", external: true },
      8 ];
     … +53 lines (ctrl+o to expand)

⏺ Excellent! All section components created. Now Phase 4 - installing framer-motion and assembling the page:

⏺ Bash(cd /Users/etherealogic/Dev/themegpt-v2.0/apps/web && pnpm add framer-motion)
  ⎿ ../..                                    |  WARN  `node_modules` is present. Lockfile only installation will make it out-of-date
    ../..                                    | Progress: resolved 1, reused 0, downloaded 0, added 0
     WARN  deprecated @types/uuid@11.0.0: This is a stub types definition. uuid provides its own type definitions, so you do not need this
    … +37 lines (ctrl+o to expand)


⏺ Now let me rewrite page.tsx to assemble all the new sections:

⏺ Write(app/page.tsx)
  ⎿  Added 46 lines, removed 405 lines
        1 -"use client"
        1 +"use client";
        2
        3 -import { useState } from "react"
        4 -import Image from "next/image"
        5 -import { DEFAULT_THEMES, type Theme } from "@themegpt/shared"
        3 +import { useState } from "react";
        4 +import { DEFAULT_THEMES } from "@themegpt/shared";
        5 +import { CustomCursor } from "@/components/ui/CustomCursor";
        6 +import { Navigation } from "@/components/sections/Navigation";
        7 +import { Hero } from "@/components/sections/Hero";
        8 +import { ThemesSection } from "@/components/sections/ThemesSection";
        9 +import { FeaturesSection } from "@/components/sections/FeaturesSection";
       10 +import { PricingSection } from "@/components/sections/PricingSection";
       11 +import { Footer } from "@/components/sections/Footer";
       12
        7 -// Separate themes by premium status
        8 -const FREE_THEMES = DEFAULT_THEMES.filter(t => !t.isPremium)
        9 -const PREMIUM_THEMES = DEFAULT_THEMES.filter(t => t.isPremium)
       13 +const PREMIUM_THEMES = DEFAULT_THEMES.filter((t) => t.isPremium);
       14
       11 -// Helper to determine theme type label
       12 -function getThemeTypeLabel(theme: Theme): string {
       13 -  // Check for animated effects
       14 -  if (theme.effects?.auroraGradient?.enabled) return "✨ Aurora Effect"
       15 -  if (theme.effects?.animatedSnowfall?.enabled) return "❄️ Snowfall Effect"
       16 -  if (theme.effects?.twinklingStars?.enabled) return "⭐ Starfield Effect"
       17 -  if (theme.effects?.ambientEffects?.neonGrid) return "🌆 Neon Grid Effect"
       18 -
       19 -  // Check if light or dark based on background
       20 -  const bg = theme.colors['--cgpt-bg']
       21 -  const isLight = isLightColor(bg)
       22 -  return isLight ? "☀️ Light Theme" : "🌙 Dark Theme"
       23 -}
       24 -
       25 -// Helper to check if a color is light
       26 -function isLightColor(hex: string): boolean {
       27 -  const r = parseInt(hex.slice(1, 3), 16)
       28 -  const g = parseInt(hex.slice(3, 5), 16)
       29 -  const b = parseInt(hex.slice(5, 7), 16)
       30 -  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
       31 -  return luminance > 0.5
       32 -}
       33 -
       34 -// Helper to check if theme has animated effects
       35 -function hasAnimatedEffects(theme: Theme): boolean {
       36 -  return !!(
       37 -    theme.effects?.auroraGradient?.enabled ||
       38 -    theme.effects?.animatedSnowfall?.enabled ||
       39 -    theme.effects?.twinklingStars?.enabled ||
       40 -    theme.effects?.ambientEffects?.neonGrid ||
       41 -    theme.effects?.ambientEffects?.auroraWaves
       42 -  )
       43 -}
       44 -
       45 -// Map theme IDs to screenshot filenames
       46 -function getThemeScreenshots(themeId: string): { home: string; content: string } {
       47 -  const mapping: Record<string, { home: string; content: string }> = {
       48 -    'themegpt-dark': { home: '/themes/themegpt_dark_1.png', content: '/themes/themegpt_dark_2.png' },
       49 -    'themegpt-light': { home: '/themes/themegpt_light_1.png', content: '/themes/themegpt_light_2.png' },
       50 -    'solarized-dark': { home: '/themes/solarized_dark_1.png', content: '/themes/solarized_dark_2.png' },
       51 -    'dracula': { home: '/themes/dracula_1.png', content: '/themes/dracula_2.png' },
       52 -    'monokai-pro': { home: '/themes/monokai_pro_1.png', content: '/themes/monokai_pro_2.png' },
       53 -    'high-contrast': { home: '/themes/high_contrast_1.png', content: '/themes/high_contrast_2.png' },
       54 -    'one-dark': { home: '/themes/one_dark_1.png', content: '/themes/one_dark_2.png' },
       55 -    'aurora-borealis': { home: '/themes/aurora_borealis_1.png', content: '/themes/aurora_borealis_2.png' },
       56 -    'sunset-blaze': { home: '/themes/sunset_blaze_1.png', content: '/themes/sunset_blaze_2.png' },
       57 -    'electric-dreams': { home: '/themes/electric_dreams_1.png', content: '/themes/electric_dreams_2.png' },
       58 -    'woodland-retreat': { home: '/themes/woodland_retreat_1.png', content: '/themes/woodland_retreat_2.png' },
       59 -    'frosted-windowpane': { home: '/themes/frosted_windowpane_1.png', content: '/themes/frosted_windowpane_2.png' },
       60 -    'silent-night-starfield': { home: '/themes/silent_night_1.png', content: '/themes/silent_night_2.png' },
       61 -    'synth-wave': { home: '/themes/synth_wave_1.png', content: '/themes/synth_wave_2.png' },
       62 -    'shades-of-purple': { home: '/themes/shades_of_purple_1.png', content: '/themes/shades_of_purple_2.png' },
       63 -  }
       64 -  return mapping[themeId] || { home: '', content: '' }
       65 -}
       66 -
       15  export default function Home() {
       68 -  const [selectedTheme, setSelectedTheme] = useState<string>(PREMIUM_THEMES[0]?.id || '')
       69 -  const [checkoutError, setCheckoutError] = useState<string | null>(null)
       16 +  const [selectedTheme, setSelectedTheme] = useState<string>(
       17 +    PREMIUM_THEMES[0]?.id || ""
       18 +  );
       19 +  const [checkoutError, setCheckoutError] = useState<string | null>(null);
       20
       71 -  const handleCheckout = async (type: 'yearly' | 'monthly' | 'single', themeId?: string) => {
       72 -    setCheckoutError(null)
       21 +  const handleCheckout = async (
       22 +    type: "yearly" | "monthly" | "single",
       23 +    themeId?: string
       24 +  ) => {
       25 +    setCheckoutError(null);
       26      try {
       74 -      const res = await fetch('/api/checkout', {
       75 -        method: 'POST',
       76 -        headers: { 'Content-Type': 'application/json' },
       77 -        body: JSON.stringify({ type, themeId })
       78 -      })
       79 -      const data = await res.json()
       27 +      const res = await fetch("/api/checkout", {
       28 +        method: "POST",
       29 +        headers: { "Content-Type": "application/json" },
       30 +        body: JSON.stringify({ type, themeId }),
       31 +      });
       32 +      const data = await res.json();
       33        if (data.success && data.checkoutUrl) {
       81 -        window.location.href = data.checkoutUrl
       34 +        window.location.href = data.checkoutUrl;
       35        } else {
       83 -        setCheckoutError('Checkout failed: ' + (data.message || 'Unknown error'))
       36 +        setCheckoutError(
       37 +          "Checkout failed: " + (data.message || "Unknown error")
       38 +        );
       39        }
       40      } catch (error) {
       86 -      console.error('Checkout error', error)
       87 -      setCheckoutError('Unable to process checkout. Please try again.')
       41 +      console.error("Checkout error", error);
       42 +      setCheckoutError("Unable to process checkout. Please try again.");
       43      }
       89 -  }
       44 +  };
       45
       46    return (
       92 -    <div className="noise-texture min-h-screen bg-cream font-sans text-brown-900">
       93 -
       94 -      {/* Header */}
       95 -      <header className="flex items-center justify-between border-b border-cream-dark bg-cream px-8 py-4">
       96 -        <div className="flex items-center gap-2.5">
       97 -          <Image
       98 -            src="/mascot-transparent.png"
       99 -            alt="ThemeGPT mascot"
      100 -            width={48}
      101 -            height={48}
      102 -            className="h-12 w-12"
      103 -            priority
      104 -          />
      105 -          <span className="text-xl font-bold text-brown-900">ThemeGPT</span>
      106 -        </div>
      107 -        <nav className="flex items-center gap-7">
      108 -          {[
      109 -            { label: "Themes", href: "#themes" },
      110 -            { label: "Pricing", href: "#pricing" },
      111 -            { label: "Features", href: "#features" },
      112 -          ].map((item) => (
      113 -            <a
      114 -              key={item.label}
      115 -              href={item.href}
      116 -              className="text-[15px] font-medium text-brown-900 hover:text-teal-500 transition-colors"
      117 -            >
      118 -              {item.label}
      119 -            </a>
      120 -          ))}
      121 -          <a href="#pricing" className="cursor-pointer rounded-full bg-teal-500 px-5 py-2.5 text-sm font-semibold text-white
          -transition-all hover:-translate-y-px hover:shadow-lg hover:shadow-teal-500/30">
      122 -            Subscribe Now
      123 -          </a>
      124 -        </nav>
      125 -      </header>
      126 -
      127 -      {/* Hero */}
      128 -      <section className="relative px-8 py-[70px] text-center">
      129 -
      130 -        <h1 className="mb-4.5 text-5xl font-bold leading-[1.15] text-brown-900">
      131 -          Make ChatGPT <span className="text-teal-500">yours</span>
      132 -        </h1>
      133 -        <p className="mx-auto mb-7 max-w-[520px] text-lg leading-relaxed text-brown-600">
      134 -          Beautiful themes that match your style. No coding, no hassle—just click
      135 -          and transform your ChatGPT experience.
      136 -        </p>
      137 -        <div className="flex justify-center gap-3.5">
      138 -          <a href="#pricing" className="cursor-pointer rounded-full bg-brown-900 px-7 py-3.5 text-base font-semibold text-whi
          -te transition-transform hover:-translate-y-px">
      139 -            Subscribe Now
      140 -          </a>
      141 -          <a href="#themes" className="cursor-pointer rounded-full border-[2px] border-brown-900 bg-transparent px-6 py-3 tex
          -t-base font-semibold text-brown-900 transition-all hover:bg-brown-900 hover:text-white">
      142 -            View Themes
      143 -          </a>
      144 -        </div>
      145 -      </section>
      146 -
      147 -      {/* Pricing Section */}
      148 -      <section id="pricing" className="bg-cream px-8 pt-[30px] pb-[30px] text-center">
      149 -        <h2 className="mb-6 text-[32px] font-bold text-brown-900">
      150 -          Choose Your Plan
      151 -        </h2>
      152 -        <div className="flex flex-wrap justify-center gap-6 max-w-5xl mx-auto">
      153 -            {/* Monthly Card */}
      154 -            <div className="bg-white p-6 rounded-[24px] shadow-sm flex-1 min-w-[260px] max-w-[320px] border border-brown-900/
          -10">
      155 -                <h3 className="text-xl font-bold mb-2">Monthly</h3>
      156 -                <div className="text-4xl font-bold text-brown-900 mb-1">$1.99<span className="text-base font-normal opacity-6
          -0">/mo</span></div>
      157 -                <div className="text-sm text-teal-600 font-medium mb-2">First month free</div>
      158 -                <p className="opacity-70 text-sm mb-4 min-h-[40px]">Try free for 30 days. Access 3 premium themes at once. Ca
          -ncel anytime.</p>
      159 -                <ul className="text-left text-sm space-y-2 mb-6">
      160 -                  <li className="flex items-center gap-2"><span className="text-teal-500">✓</span> 30-day free trial</li>
      161 -                  <li className="flex items-center gap-2"><span className="text-teal-500">✓</span> 3 active premium themes</l
          -i>
      162 -                  <li className="flex items-center gap-2"><span className="text-teal-500">✓</span> Swap themes anytime</li>
      163 -                  <li className="flex items-center gap-2"><span className="text-teal-500">✓</span> Cancel anytime</li>
      164 -                </ul>
      165 -                <button
      166 -                  onClick={() => handleCheckout('monthly')}
      167 -                  className="w-full py-3 rounded-xl bg-brown-900 text-white font-bold hover:bg-brown-800 transition-colors"
      168 -                >
      169 -                    Start Free Month
      170 -                </button>
      171 -            </div>
      172 -
      173 -            {/* Yearly Card - Best Value */}
      174 -            <div className="bg-white p-6 rounded-[24px] shadow-sm flex-1 min-w-[260px] max-w-[320px] border-2 border-teal-500
          - relative overflow-hidden">
      175 -                <div className="absolute top-0 right-0 bg-teal-500 text-white text-[10px] uppercase font-bold px-3 py-1 round
          -ed-bl-lg">
      176 -                    Best Value
      177 -                </div>
      178 -                <h3 className="text-xl font-bold mb-2">Yearly</h3>
      179 -                <div className="text-4xl font-bold text-brown-900 mb-1">$14.99<span className="text-base font-normal opacity-
          -60">/yr</span></div>
      180 -                <div className="text-sm text-teal-600 font-medium mb-2">Lifetime access for early adopters</div>
      181 -                <p className="opacity-70 text-sm mb-4 min-h-[40px]">Early adopters get lifetime access. Subscribe yearly and
          -never pay again.</p>
      182 -                <ul className="text-left text-sm space-y-2 mb-6">
      183 -                  <li className="flex items-center gap-2"><span className="text-peach">★</span> Lifetime access potential</li
          ->
      184 -                  <li className="flex items-center gap-2"><span className="text-teal-500">✓</span> 3 active premium themes</l
          -i>
      185 -                  <li className="flex items-center gap-2"><span className="text-teal-500">✓</span> Swap themes anytime</li>
      186 -                  <li className="flex items-center gap-2"><span className="text-teal-500">✓</span> All future theme updates</
          -li>
      187 -                </ul>
      188 -                <button
      189 -                  onClick={() => handleCheckout('yearly')}
      190 -                  className="w-full py-3 rounded-xl bg-teal-500 text-white font-bold hover:bg-teal-600 transition-colors"
      191 -                >
      192 -                    Get Lifetime Access
      193 -                </button>
      194 -            </div>
      195 -
      196 -            {/* Single Theme Card */}
      197 -            <div className="bg-white p-6 rounded-[24px] shadow-sm flex-1 min-w-[260px] max-w-[320px] border border-brown-900/
          -10">
      198 -                <h3 className="text-xl font-bold mb-2">Single Theme</h3>
      199 -                <div className="text-4xl font-bold text-brown-900 mb-2">$0.99<span className="text-base font-normal opacity-6
          -0">/ea</span></div>
      200 -                <p className="opacity-70 text-sm mb-4 min-h-[40px]">Own a specific theme forever. One-time purchase, lifetime
          - ownership.</p>
      201 -                <label htmlFor="theme-select" className="block text-sm font-medium text-brown-900/70 mb-2 text-left">
      202 -                  Select Theme
      203 -                </label>
      204 -                <select
      205 -                  id="theme-select"
      206 -                  value={selectedTheme}
      207 -                  onChange={(e) => setSelectedTheme(e.target.value)}
      208 -                  className="w-full mb-4 py-2.5 px-3 rounded-lg border border-brown-900/20 bg-white text-brown-900 focus:outl
          -ine-none focus:ring-2 focus:ring-teal-500/50"
      209 -                >
      210 -                  {PREMIUM_THEMES.map((theme) => (
      211 -                    <option key={theme.id} value={theme.id}>
      212 -                      {theme.name} {hasAnimatedEffects(theme) ? '✨' : ''}
      213 -                    </option>
      214 -                  ))}
      215 -                </select>
      216 -                <button
      217 -                   onClick={() => handleCheckout('single', selectedTheme)}
      218 -                   className="w-full py-3 rounded-xl bg-brown-900 text-white font-bold hover:bg-brown-800 transition-colors"
      219 -                >
      220 -                    Buy Theme
      221 -                </button>
      222 -            </div>
      223 -        </div>
      224 -        {checkoutError && (
      225 -          <div className="mt-4 max-w-5xl mx-auto p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm" role="a
          -lert">
      226 -            {checkoutError}
      227 -          </div>
      228 -        )}
      229 -      </section>
      230 -
      231 -      {/* Premium Themes Section */}
      232 -      <div className="bg-cream px-8 pt-[50px] pb-[30px] text-center">
      233 -        <h2 className="mb-2 text-[32px] font-bold text-brown-900">
      234 -          ✨ Premium Collection
      235 -        </h2>
      236 -        <p className="text-base text-brown-600 max-w-2xl mx-auto">
      237 -          Stunning themes with animated effects — aurora lights, snowfall, starfields, and more.
      238 -        </p>
      239 -      </div>
      240 -
      241 -      {/* Premium Theme Gallery */}
      242 -      <section id="themes" className="px-8 pb-[50px] pt-5">
      243 -        <div className="mx-auto grid max-w-[1000px] grid-cols-1 gap-7 md:grid-cols-2 lg:grid-cols-3">
      244 -          {PREMIUM_THEMES.map((theme) => (
      245 -            <ThemeCard
      246 -              key={theme.id}
      247 -              theme={theme}
      248 -              onBuy={() => handleCheckout('single', theme.id)}
      249 -            />
      250 -          ))}
      251 -        </div>
      252 -      </section>
      253 -
      254 -      {/* Free Themes Section */}
      255 -      <div className="bg-cream-dark/30 px-8 pt-[50px] pb-[30px] text-center">
      256 -        <h2 className="mb-2 text-[32px] font-bold text-brown-900">
      257 -          🎁 Free Themes
      258 -        </h2>
      259 -        <p className="text-base text-brown-600 max-w-2xl mx-auto">
      260 -          Classic IDE themes included free with the extension. No purchase required.
      261 -        </p>
      262 -      </div>
      263 -
      264 -      {/* Free Theme Gallery */}
      265 -      <section className="bg-cream-dark/30 px-8 pb-[70px] pt-5">
      266 -        <div className="mx-auto grid max-w-[1000px] grid-cols-1 gap-7 md:grid-cols-2 lg:grid-cols-3">
      267 -          {FREE_THEMES.map((theme) => (
      268 -            <ThemeCard
      269 -              key={theme.id}
      270 -              theme={theme}
      271 -              isFree
      272 -            />
      273 -          ))}
      274 -        </div>
      275 -      </section>
      276 -
      277 -      {/* Features */}
      278 -      <section id="features" className="border-t border-cream-dark bg-cream px-8 py-[70px] text-center">
      279 -        <h2 className="mb-9 text-[32px] font-bold text-brown-900">
      280 -          Why ThemeGPT?
      281 -        </h2>
      282 -        <div className="mx-auto grid max-w-[900px] grid-cols-1 gap-6 md:grid-cols-3">
      283 -          <FeatureCard
      284 -            icon="🎨"
      285 -            title="One-Click Themes"
      286 -            description="Transform ChatGPT instantly with beautiful, professionally designed themes. No coding required."
      287 -          />
      288 -          <FeatureCard
      289 -            icon="🔒"
      290 -            title="Privacy First"
      291 -            description="Everything runs locally in your browser. We never collect your data or track your conversations."
      292 -          />
      293 -          <FeatureCard
      294 -            icon="📊"
      295 -            title="Token Tracking"
      296 -            description="Monitor your ChatGPT usage in real-time. Know exactly how many tokens each conversation uses."
      297 -          />
      298 -        </div>
      299 -      </section>
      300 -
      301 -      {/* Newsletter */}
      302 -      <section id="newsletter" className="bg-brown-900 px-8 py-[70px] text-center">
      303 -        <h2 className="mb-4 text-[32px] font-bold text-cream">
      304 -          Stay Updated
      305 -        </h2>
      306 -        <p className="mx-auto mb-8 max-w-[480px] text-lg text-cream/80">
      307 -          Get notified about new premium themes, product updates, and exclusive offers.
      308 -        </p>
      309 -        <div className="mx-auto flex max-w-md gap-3">
      310 -          <input
      311 -            type="email"
      312 -            placeholder="Enter your email"
      313 -            className="flex-1 rounded-full bg-white/10 px-5 py-3 text-cream placeholder:text-cream/50 border border-cream/20
          -focus:outline-none focus:border-teal-500"
      314 -          />
      315 -          <button className="rounded-full bg-teal-500 px-6 py-3 font-semibold text-white hover:bg-teal-600 transition-colors"
          ->
      316 -            Subscribe
      317 -          </button>
      318 -        </div>
      319 -      </section>
      320 -
      321 -      {/* Footer */}
      322 -      <footer className="bg-brown-900 p-7 text-center text-sm text-cream">
      323 -        <div className="flex justify-center gap-6 mb-4">
      324 -          <a href="/privacy" className="text-cream/80 hover:text-cream">
      325 -            Privacy Policy
      326 -          </a>
      327 -          <a href="/terms" className="text-cream/80 hover:text-cream">
      328 -            Terms of Service
      329 -          </a>
      330 -        </div>
      331 -        <span className="opacity-85">
      332 -          No tracking - No data collection - Just beautiful themes
      333 -        </span>
      334 -      </footer>
       47 +    <div className="min-h-screen" style={{ background: "var(--cream)" }}>
       48 +      <CustomCursor />
       49 +      <Navigation />
       50 +      <Hero />
       51 +      <ThemesSection />
       52 +      <FeaturesSection />
       53 +      <PricingSection
       54 +        selectedTheme={selectedTheme}
       55 +        onThemeChange={setSelectedTheme}
       56 +        onCheckout={handleCheckout}
       57 +        checkoutError={checkoutError}
       58 +      />
       59 +      <Footer />
       60      </div>
       61    );
       62  }
      338 -
      339 -// --- Helper Components ---
      340 -
      341 -interface ThemeCardProps {
      342 -  theme: Theme;
      343 -  onBuy?: () => void;
      344 -  isFree?: boolean;
      345 -}
      346 -
      347 -function ThemeCard({ theme, onBuy, isFree }: ThemeCardProps) {
      348 -  const typeLabel = getThemeTypeLabel(theme)
      349 -  const hasEffects = hasAnimatedEffects(theme)
      350 -  const screenshots = getThemeScreenshots(theme.id)
      351 -
      352 -  return (
      353 -    <div className="group relative cursor-pointer overflow-hidden rounded-[20px] bg-white p-3 shadow-[0_4px_24px_rgba(75,46,3
          -0,0.1)] transition-all duration-300 ease-out hover:scale-[1.15] hover:z-20 hover:shadow-[0_16px_48px_rgba(75,46,30,0.25)]">
      354 -      {/* Animated effect badge */}
      355 -      {hasEffects && (
      356 -        <div className="absolute top-5 right-5 z-10 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[10px] upper
          -case font-bold px-2.5 py-1 rounded-full shadow-lg">
      357 -          ✨ Animated
      358 -        </div>
      359 -      )}
      360 -
      361 -      <div className="overflow-hidden rounded-xl">
      362 -        {/* Theme screenshot preview with hover transition */}
      363 -        <div className="relative min-h-[180px] overflow-hidden">
      364 -          {/* Home screen (default) */}
      365 -          <Image
      366 -            src={screenshots.home}
      367 -            alt={`${theme.name} home screen`}
      368 -            width={400}
      369 -            height={225}
      370 -            className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-0"
      371 -          />
      372 -          {/* Content screen (on hover) */}
      373 -          <Image
      374 -            src={screenshots.content}
      375 -            alt={`${theme.name} content view`}
      376 -            width={400}
      377 -            height={225}
      378 -            className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-300 group-hover:opac
          -ity-100"
      379 -          />
      380 -          {/* Hover indicator */}
      381 -          <div className="absolute bottom-2 right-2 bg-black/50 text-white text-[9px] px-2 py-0.5 rounded-full opacity-0 grou
          -p-hover:opacity-100 transition-opacity">
      382 -            Content View
      383 -          </div>
      384 -        </div>
      385 -      </div>
      386 -
      387 -      {/* Card footer */}
      388 -      <div className="flex items-center justify-between bg-white px-1.5 pt-3.5 pb-1.5">
      389 -        <div>
      390 -          <div className="text-[15px] font-semibold text-brown-900">{theme.name}</div>
      391 -          <div className="mt-0.5 text-xs text-brown-600">{typeLabel}</div>
      392 -        </div>
      393 -        {isFree ? (
      394 -          <span className="rounded-[20px] bg-green-500/10 text-green-600 px-4 py-2 text-[13px] font-medium">
      395 -            Free
      396 -          </span>
      397 -        ) : (
      398 -          <button
      399 -            onClick={(e) => {
      400 -                e.stopPropagation()
      401 -                onBuy?.()
      402 -            }}
      403 -            className="cursor-pointer rounded-[20px] bg-teal-500/10 text-teal-600 hover:bg-teal-500 hover:text-white px-4 py-
          -2 text-[13px] font-medium transition-colors"
      404 -          >
      405 -            Buy $0.99
      406 -          </button>
      407 -        )}
      408 -      </div>
      409 -    </div>
      410 -  );
      411 -}
      412 -
      413 -function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
      414 -  return (
      415 -    <div className="flex flex-col items-center rounded-[20px] bg-white p-8 shadow-[0_4px_24px_rgba(75,46,30,0.08)]">
      416 -      <div className="mb-4 text-4xl">{icon}</div>
      417 -      <h3 className="mb-2 text-lg font-bold text-brown-900">{title}</h3>
      418 -      <p className="text-sm leading-relaxed text-brown-600">{description}</p>
      419 -    </div>
      420 -  );
      421 -}

⏺ Now let me verify the build works:

⏺ Bash(pnpm exec tsc --noEmit 2>&1 | head -50)
  ⎿  (No content)

⏺ TypeScript passes. Let me also verify the web app builds correctly:

⏺ Bash(pnpm next build 2>&1 | tail -30)
  ⎿  ┌ ○ /
     ├ ○ /_not-found
     ├ ○ /account
     … +26 lines (ctrl+o to expand)

⏺ Build successful. Now let me fix the responsive styles in ThemesSection for the masonry grid:

⏺ Update(components/sections/ThemesSection.tsx)
  ⎿  Added 3 lines, removed 8 lines
      58          </h2>
      59        </div>
      60
      61 -      {/* Masonry Grid */}
      62 -      <div
      63 -        className="mx-auto max-w-[1200px] grid gap-6"
      64 -        style={{
      65 -          gridTemplateColumns: "repeat(4, 1fr)",
      66 -          gridTemplateRows: "repeat(2, 200px)",
      67 -        }}
      68 -      >
      61 +      {/* Masonry Grid - Responsive */}
      62 +      <div className="mx-auto max-w-[1200px] grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 auto-rows-[180px] lg:auto-ro
         +ws-[200px]">
      63 +
      64          {PREMIUM_THEMES.map((theme, index) => (
      65            <ThemeItem key={theme.id} theme={theme} index={index} />
      66          ))}

⏺ Update(components/sections/ThemesSection.tsx)
  ⎿  Added 2 lines, removed 2 lines
      86        whileInView={{ opacity: 1, y: 0 }}
      87        viewport={{ once: true }}
      88        transition={{ duration: 0.5, delay: index * 0.1 }}
      89 -      className={`relative rounded-[20px] overflow-hidden cursor-pointer transition-all duration-400 hover:scale-[1.03] hover:
         -z-10 ${
      90 -        isFeatured ? "col-span-2 row-span-2" : "col-span-1"
      89 +      className={`group relative rounded-[20px] overflow-hidden cursor-pointer transition-all duration-400 hover:scale-[1.03]
         +hover:z-10 ${
      90 +        isFeatured ? "md:col-span-2 md:row-span-2" : "col-span-1"
      91        }`}
      92        style={{
      93          background: hasScreenshot ? undefined : gradientFallbacks[theme.id],

⏺ Update(components/sections/ThemesSection.tsx)
  ⎿  Added 1 line, removed 1 line
      117        )}
      118
      119        {/* Metadata overlay */}
      120 -      <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end opacity-0 translate-y-2.5 transition-al
          -l duration-300 group-hover:opacity-100 group-hover:translate-y-0 hover:opacity-100 hover:translate-y-0">
      120 +      <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end opacity-0 translate-y-2.5 transition-al
          +l duration-300 group-hover:opacity-100 group-hover:translate-y-0">
      121          <span
      122            className="text-base font-semibold"
      123            style={{

⏺ Let me fix the navigation link hover underline effect:

⏺ Update(components/sections/Navigation.tsx)
  ⎿  Added 6 lines, removed 3 lines
      39            <a
      40              key={item}
      41              href={`#${item.toLowerCase()}`}
      42 -            className="relative py-2 text-[0.95rem] font-medium no-underline transition-colors hover:text-brown"
      42 +            className="group relative py-2 text-[0.95rem] font-medium no-underline transition-colors"
      43              style={{ color: "var(--brown-soft)" }}
      44            >
      45 -            {item}
      46 -            <span className="absolute bottom-0 left-1/2 h-[3px] w-0 -translate-x-1/2 rounded-sm bg-coral transition-all durati
         -on-300 hover:w-full" />
      45 +            <span className="group-hover:text-brown transition-colors">{item}</span>
      46 +            <span
      47 +              className="absolute bottom-0 left-1/2 h-[3px] w-0 -translate-x-1/2 rounded-sm transition-all duration-300 group-
         +hover:w-full"
      48 +              style={{ background: "var(--coral)" }}
      49 +            />
      50            </a>
      51          ))}
      52          <a

⏺ Let me run a quick type check to make sure everything is still working:

⏺ Bash(pnpm exec tsc --noEmit 2>&1 | head -20)
  ⎿  (No content)

⏺ All checks pass. Let me finalize the todos and create a commit:

⏺ Bash(git status)
  ⎿  On branch feature/organic-website-redesign
     Changes not staged for commit:
       (use "git add <file>..." to update what will be committed)
     … +15 lines (ctrl+o to expand)

⏺ Bash(git diff apps/extension/src/contents/theme-injector.ts | head -30)
  ⎿  fatal: ambiguous argument 'apps/extension/src/contents/theme-injector.ts': unknown revision or path not in the working tree.
     Use '--' to separate paths from revisions, like this:
     'git <command> [<revision>...] -- [<file>...]'

⏺ Bash(cd /Users/etherealogic/Dev/themegpt-v2.0 && git diff -- apps/extension/src/contents/theme-injector.ts | head -30)
  ⎿  diff --git a/apps/extension/src/contents/theme-injector.ts b/apps/extension/src/contents/theme-injector.ts
     index c3f918c..3af3466 100644
     --- a/apps/extension/src/contents/theme-injector.ts
     … +27 lines (ctrl+o to expand)

⏺ I'll commit only the web redesign changes:

⏺ Bash(git add apps/web/app/globals.css apps/web/app/layout.tsx apps/web/app/page.tsx apps/web/package.json apps/web/components/
      pnpm-lock.yaml)
  ⎿  (No content)

⏺ Bash(git diff --cached --stat)
  ⎿   apps/web/app/globals.css                         | 156 ++++++--
      apps/web/app/layout.tsx                          |  14 +-
      apps/web/app/page.tsx                            | 451 +++--------------------
     … +13 lines (ctrl+o to expand)

⏺ Bash(git commit -m "feat(web): implement Organic Flow website redesign…)
  ⎿  [feature/organic-website-redesign 52b69ed] feat(web): implement Organic Flow website redesign
      15 files changed, 1208 insertions(+), 450 deletions(-)
      create mode 100644 apps/web/components/sections/FeaturesSection.tsx
     … +9 lines (ctrl+o to expand)

⏺ Bash(git log -1 --oneline && echo "" && git branch -v)
  ⎿  52b69ed feat(web): implement Organic Flow website redesign

     + distracted-hertz                 4daa43b feat: add coding guardrails skill
     … +2 lines (ctrl+o to expand)

⏺ Implementation Complete ✅

  I've implemented the Organic Flow website redesign on branch feature/organic-website-redesign.

  Summary of Changes

  New Components Created (10 files):

  | UI Components                                            | Section Components                            |
  |----------------------------------------------------------|-----------------------------------------------|
  | AnimatedMascot.tsx - Blinking mascot with conic gradient | Navigation.tsx - Fixed nav with scroll effect |
  | OrganicBlob.tsx - Animated background blobs              | Hero.tsx - Split layout with floating cards   |
  | FloatingCard.tsx - Hero preview cards                    | ThemesSection.tsx - Masonry grid gallery      |
  | CustomCursor.tsx - Organic cursor (desktop)              | FeaturesSection.tsx - 3-card row              |
  |                                                          | PricingSection.tsx - 2-card pricing           |
  |                                                          | Footer.tsx - Brown footer with mascot         |

  Core Changes:
  - layout.tsx - Replaced Geist with DM Sans + Fraunces fonts
  - globals.css - New organic color palette + 10 animation keyframes
  - page.tsx - Refactored to compose section components (451→62 lines)
  - Added framer-motion for scroll animations

  Preserved Integrations:
  - Stripe checkout (monthly, yearly, single purchase)
  - Theme selector dropdown
  - SessionProvider wrapper
  - DEFAULT_THEMES from @themegpt/shared

  Next Steps

  To review the redesign:
  cd apps/web && pnpm dev

  To merge when approved:
  git checkout main
  git merge feature/organic-website-redesign
