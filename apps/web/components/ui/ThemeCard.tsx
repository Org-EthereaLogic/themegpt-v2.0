"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import type { Theme } from "@themegpt/shared";
import { getThemeBlurColor } from "@/lib/theme-blur-data";

// Generate responsive srcset from pre-optimized variants
// Variants: base (640w), -md (1280w), -lg (2560w) are pre-built WebP files
function getResponsiveSrcSet(basePath: string): string {
  const withoutExt = basePath.replace(".webp", "");
  return `${withoutExt}.webp 640w, ${withoutExt}-md.webp 1280w, ${withoutExt}-lg.webp 2560w`;
}

// Screenshot mapping for theme previews (base WebP - srcset provides responsive variants)
const THEME_SCREENSHOTS: Record<string, { home: string; content: string }> = {
  // Premium themes
  "aurora-borealis": { home: "/themes/aurora_borealis_1.webp", content: "/themes/aurora_borealis_2.webp" },
  "sunset-blaze": { home: "/themes/sunset_blaze_1.webp", content: "/themes/sunset_blaze_2.webp" },
  "electric-dreams": { home: "/themes/electric_dreams_1.webp", content: "/themes/electric_dreams_2.webp" },
  "woodland-retreat": { home: "/themes/woodland_retreat_1.webp", content: "/themes/woodland_retreat_2.webp" },
  "frosted-windowpane": { home: "/themes/frosted_windowpane_1.webp", content: "/themes/frosted_windowpane_2.webp" },
  "silent-night-starfield": { home: "/themes/silent_night_1.webp", content: "/themes/silent_night_2.webp" },
  "synth-wave": { home: "/themes/synth_wave_1.webp", content: "/themes/synth_wave_2.webp" },
  "shades-of-purple": { home: "/themes/shades_of_purple_1.webp", content: "/themes/shades_of_purple_2.webp" },
  // Free themes
  "themegpt-dark": { home: "/themes/themegpt_dark_1.webp", content: "/themes/themegpt_dark_2.webp" },
  "themegpt-light": { home: "/themes/themegpt_light_1.webp", content: "/themes/themegpt_light_2.webp" },
  "solarized-dark": { home: "/themes/solarized_dark_1.webp", content: "/themes/solarized_dark_2.webp" },
  dracula: { home: "/themes/dracula_1.webp", content: "/themes/dracula_2.webp" },
  "monokai-pro": { home: "/themes/monokai_pro_1.webp", content: "/themes/monokai_pro_2.webp" },
  "high-contrast": { home: "/themes/high_contrast_1.webp", content: "/themes/high_contrast_2.webp" },
  "one-dark": { home: "/themes/one_dark_1.webp", content: "/themes/one_dark_2.webp" },
};

const LIGHT_THEMES = new Set(["frosted-windowpane", "themegpt-light"]);

function getThemeScreenshots(themeId: string): { home: string; content: string } {
  return THEME_SCREENSHOTS[themeId] || { home: "", content: "" };
}

function isLightTheme(themeId: string): boolean {
  return LIGHT_THEMES.has(themeId);
}

function getThemeDescription(theme: Theme): { category: string; description: string } {
  // Premium animated effects
  if (theme.effects?.auroraGradient?.enabled) {
    return { category: "Aurora Effect", description: "Mesmerizing northern lights animation that flows across your screen" };
  }
  if (theme.effects?.animatedSnowfall?.enabled) {
    return { category: "Snowfall Effect", description: "Gentle animated snowflakes drifting across the interface" };
  }
  if (theme.effects?.twinklingStars?.enabled) {
    return { category: "Starfield Effect", description: "Twinkling stars with occasional shooting stars" };
  }
  if (theme.effects?.ambientEffects?.neonGrid) {
    return { category: "Neon Grid", description: "Retro synthwave aesthetic with animated neon grid" };
  }

  // Specific theme descriptions
  const descriptions: Record<string, { category: string; description: string }> = {
    "shades-of-purple": { category: "Rich Purple", description: "Deep purple tones for a royal coding experience" },
    "themegpt-dark": { category: "Dark Theme", description: "Our signature dark theme with warm accents" },
    "themegpt-light": { category: "Light Theme", description: "Clean and bright with excellent readability" },
    "solarized-dark": { category: "Classic IDE", description: "The beloved Solarized palette in dark mode" },
    dracula: { category: "Classic IDE", description: "The iconic Dracula theme for night owls" },
    "monokai-pro": { category: "Classic IDE", description: "Professional Monokai with refined colors" },
    "high-contrast": { category: "Accessibility", description: "Maximum contrast for better visibility" },
    "one-dark": { category: "Classic IDE", description: "Atom's popular One Dark color scheme" },
  };

  return descriptions[theme.id] || {
    category: isLightTheme(theme.id) ? "Light Theme" : "Dark Theme",
    description: "A beautiful theme for your ChatGPT experience",
  };
}

// Responsive image sizes for srcset selection
const CARD_SIZES = "(max-width: 768px) 95vw, 350px";
const MODAL_SIZES = "(max-width: 768px) 90vw, 60vw";

export interface ThemeCardProps {
  theme: Theme;
  index?: number;
  isPremium?: boolean;
  onClick?: () => void;
}

// Expanded Modal Component
interface ThemeModalProps {
  theme: Theme;
  isPremium: boolean;
  screenshots: { home: string; content: string };
  category: string;
  description: string;
  isLight: boolean;
  onClose: () => void;
}

function ThemeModal({ theme, isPremium, screenshots, category, description, isLight, onClose }: ThemeModalProps) {
  const [activeView, setActiveView] = useState<"home" | "content">("home");
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const accentColor = isPremium ? "#E8A87C" : "#5BB5A2";
  const textColor = isLight ? "#4A3728" : "white";
  const subtleText = isLight ? "#7A6555" : "rgba(255,255,255,0.7)";

  // Focus trap and ESC key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
      // Focus trap - query inside handler to catch dynamically rendered elements
      if (e.key === "Tab" && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    // Lock body scroll - store original value for proper restoration
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  const handleCTAClick = () => {
    onClose();
    const pricingSection = document.getElementById("pricing");
    if (pricingSection) {
      setTimeout(() => {
        pricingSection.scrollIntoView({ behavior: "smooth" });
      }, 300);
    }
  };

  // SSR guard - createPortal requires document.body
  if (typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-8"
    >
        {/* Backdrop - keyboard accessible */}
        <motion.div
          role="button"
          tabIndex={0}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 cursor-pointer"
          style={{
            background: "radial-gradient(ellipse at center, rgba(74, 55, 40, 0.6) 0%, rgba(74, 55, 40, 0.85) 100%)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
          }}
          onClick={onClose}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onClose();
            }
          }}
          aria-label="Close modal"
        />

        {/* Modal Container */}
        <motion.div
          ref={modalRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 30,
          }}
          className="relative w-full max-w-[65vw] max-h-[90vh] overflow-hidden rounded-3xl"
          style={{
            background: isLight
              ? "linear-gradient(145deg, rgba(255,255,255,0.98) 0%, rgba(253,248,243,0.98) 100%)"
              : "linear-gradient(145deg, rgba(30,28,26,0.98) 0%, rgba(20,18,16,0.98) 100%)",
            boxShadow: `
              0 0 0 1px ${isLight ? "rgba(74, 55, 40, 0.1)" : "rgba(255,255,255,0.1)"},
              0 25px 50px -12px rgba(0, 0, 0, 0.4),
              0 0 80px ${accentColor}25
            `,
          }}
        >
          {/* Close Button */}
          <motion.button
            ref={closeButtonRef}
            onClick={onClose}
            className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200"
            style={{
              background: isLight ? "rgba(74, 55, 40, 0.1)" : "rgba(255,255,255,0.1)",
              color: textColor,
            }}
            whileHover={{
              scale: 1.1,
              background: isLight ? "rgba(74, 55, 40, 0.2)" : "rgba(255,255,255,0.2)",
            }}
            whileTap={{ scale: 0.95 }}
            aria-label="Close modal"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </motion.button>

          {/* Content Layout */}
          <div className="flex flex-col lg:flex-row">
            {/* Image Section */}
            <div className="relative lg:w-[65%] aspect-[16/10]">
              {/* Home Image - uses native img for custom srcSet with pre-optimized variants */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={screenshots.home}
                srcSet={getResponsiveSrcSet(screenshots.home)}
                sizes={MODAL_SIZES}
                alt={`${theme.name} home screen`}
                loading="eager"
                decoding="async"
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${activeView === "home" ? "opacity-100" : "opacity-0"}`}
                style={{ backgroundColor: getThemeBlurColor(theme.id) }}
              />
              {/* Content Image - uses native img for custom srcSet with pre-optimized variants */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={screenshots.content}
                srcSet={getResponsiveSrcSet(screenshots.content)}
                sizes={MODAL_SIZES}
                alt={`${theme.name} content view`}
                loading="eager"
                decoding="async"
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${activeView === "content" ? "opacity-100" : "opacity-0"}`}
                style={{ backgroundColor: getThemeBlurColor(theme.id) }}
              />

              {/* View Toggle Pills */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 p-1.5 rounded-full backdrop-blur-md"
                style={{ background: isLight ? "rgba(255,255,255,0.85)" : "rgba(0,0,0,0.6)" }}
              >
                <button
                  onClick={() => setActiveView("home")}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 ${
                    activeView === "home" ? "text-white" : ""
                  }`}
                  style={{
                    background: activeView === "home" ? accentColor : "transparent",
                    color: activeView === "home" ? "white" : subtleText,
                  }}
                >
                  Home View
                </button>
                <button
                  onClick={() => setActiveView("content")}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 ${
                    activeView === "content" ? "text-white" : ""
                  }`}
                  style={{
                    background: activeView === "content" ? accentColor : "transparent",
                    color: activeView === "content" ? "white" : subtleText,
                  }}
                >
                  Content View
                </button>
              </div>
            </div>

            {/* Info Section */}
            <div className="lg:w-[35%] p-6 lg:p-8 flex flex-col justify-between">
              {/* Top: Theme Info */}
              <div>
                {/* Category Badge */}
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="inline-flex items-center gap-2 mb-4"
                >
                  <span
                    className="px-3 py-1 rounded-full text-[0.7rem] font-bold uppercase tracking-wider"
                    style={{ background: `${accentColor}20`, color: accentColor }}
                  >
                    {isPremium ? "Premium" : "Free"}
                  </span>
                  <span
                    className="px-3 py-1 rounded-full text-[0.7rem] font-semibold uppercase tracking-wider"
                    style={{
                      background: isLight ? "rgba(74, 55, 40, 0.08)" : "rgba(255,255,255,0.1)",
                      color: subtleText,
                    }}
                  >
                    {category}
                  </span>
                </motion.div>

                {/* Theme Name */}
                <motion.h2
                  id="modal-title"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="text-2xl lg:text-3xl font-bold mb-3"
                  style={{
                    fontFamily: "var(--font-fraunces), serif",
                    color: textColor,
                  }}
                >
                  {theme.name}
                </motion.h2>

                {/* Description */}
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-base leading-relaxed mb-6"
                  style={{ color: subtleText }}
                >
                  {description}
                </motion.p>

                {/* Features List */}
                <motion.ul
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.25 }}
                  className="space-y-2 mb-6"
                >
                  {[
                    "Carefully crafted color palette",
                    "Optimized for readability",
                    isPremium ? "Exclusive animated effects" : "Instant activation",
                  ].map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm" style={{ color: subtleText }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ color: accentColor }}>
                        <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </motion.ul>
              </div>

              {/* Bottom: CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-3"
              >
                {/* Primary CTA */}
                <motion.button
                  onClick={handleCTAClick}
                  className="w-full py-4 px-6 rounded-2xl font-semibold text-base transition-all duration-300 flex items-center justify-center gap-2"
                  style={{
                    background: `linear-gradient(135deg, ${accentColor} 0%, ${isPremium ? "#d4956c" : "#4aa393"} 100%)`,
                    color: "white",
                    boxShadow: `0 4px 20px ${accentColor}40`,
                  }}
                  whileHover={{
                    scale: 1.02,
                    boxShadow: `0 6px 30px ${accentColor}50`,
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isPremium ? (
                    <>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 2L15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2z" />
                      </svg>
                      Subscribe to Unlock
                    </>
                  ) : (
                    <>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
                      </svg>
                      Install Free Theme
                    </>
                  )}
                </motion.button>

                {/* Secondary CTA */}
                <motion.button
                  onClick={onClose}
                  className="w-full py-3 px-6 rounded-xl font-medium text-sm transition-all duration-300"
                  style={{
                    background: isLight ? "rgba(74, 55, 40, 0.06)" : "rgba(255,255,255,0.08)",
                    color: subtleText,
                  }}
                  whileHover={{
                    background: isLight ? "rgba(74, 55, 40, 0.1)" : "rgba(255,255,255,0.12)",
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  Continue Browsing
                </motion.button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </motion.div>,
    document.body
  );
}

export function ThemeCard({ theme, index = 0, isPremium = false, onClick }: ThemeCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [shouldLoadContent, setShouldLoadContent] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const screenshots = getThemeScreenshots(theme.id);
  const { category, description } = getThemeDescription(theme);
  const isLight = isLightTheme(theme.id);

  const accentColor = isPremium ? "#E8A87C" : "#5BB5A2";
  const textColor = isLight ? "#4A3728" : "white";
  const badgeBg = isLight ? "rgba(74, 55, 40, 0.15)" : "rgba(255,255,255,0.2)";

  // Defer content image loading until card is near viewport
  useEffect(() => {
    const card = cardRef.current;
    if (!card || shouldLoadContent) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoadContent(true);
          observer.disconnect();
        }
      },
      { rootMargin: "100px" } // Start loading 100px before entering viewport
    );

    observer.observe(card);
    return () => observer.disconnect();
  }, [shouldLoadContent]);

  const handleClick = useCallback(() => {
    if (onClick) {
      onClick();
    } else {
      setIsExpanded(true);
    }
  }, [onClick]);

  const handleClose = useCallback(() => {
    setIsExpanded(false);
  }, []);

  return (
    <>
      <motion.div
        ref={cardRef}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: index * 0.08 }}
        onMouseEnter={() => {
          setShouldLoadContent(true);
          setIsHovered(true);
        }}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleClick}
        className="group relative rounded-[20px] overflow-hidden cursor-pointer transition-all duration-400 hover:scale-[1.03] hover:z-10 aspect-[16/10]"
        style={{
          border: isHovered
            ? "2px solid rgba(255, 255, 255, 0.8)"
            : "2px solid rgba(255, 255, 255, 0.4)",
          boxShadow: isHovered
            ? "0 4px 8px rgba(74, 55, 40, 0.1), 0 16px 32px rgba(74, 55, 40, 0.15), 0 32px 48px rgba(74, 55, 40, 0.1)"
            : "0 4px 12px rgba(74, 55, 40, 0.08), 0 8px 24px rgba(74, 55, 40, 0.1)",
        }}
      >
        {/* Image Container with Crossfade */}
        <div className="absolute inset-0">
          {/* Home Image (default) - uses native img for custom srcSet with pre-optimized variants and crossfade animations */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={screenshots.home}
            srcSet={getResponsiveSrcSet(screenshots.home)}
            sizes={CARD_SIZES}
            alt={`${theme.name} home screen`}
            loading={index < 6 ? "eager" : "lazy"}
            decoding="async"
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${isHovered ? "opacity-0" : "opacity-100"}`}
            style={{ backgroundColor: getThemeBlurColor(theme.id) }}
          />
          {/* Content Image (on hover) - uses native img for custom srcSet with pre-optimized variants and crossfade animations */}
          {shouldLoadContent && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={screenshots.content}
              srcSet={getResponsiveSrcSet(screenshots.content)}
              sizes={CARD_SIZES}
              alt={`${theme.name} content view`}
              loading="lazy"
              decoding="async"
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${isHovered ? "opacity-100" : "opacity-0"}`}
              style={{ backgroundColor: getThemeBlurColor(theme.id) }}
            />
          )}
        </div>

        {/* Category Badge - Top Right */}
        <div
          className={`absolute top-3 right-3 px-3 py-1.5 rounded-full text-[0.7rem] font-semibold uppercase tracking-wider backdrop-blur-sm transition-all duration-300 ${
            isHovered ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
          }`}
          style={{
            background: badgeBg,
            color: textColor,
          }}
        >
          {category}
        </div>

        {/* "Click to Preview" indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        >
          <div
            className="px-4 py-2 rounded-full backdrop-blur-md flex items-center gap-2"
            style={{
              background: isLight ? "rgba(255,255,255,0.9)" : "rgba(0,0,0,0.7)",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={accentColor} strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
              <path d="M11 8v6M8 11h6" />
            </svg>
            <span className="text-xs font-semibold" style={{ color: textColor }}>
              Click to Preview
            </span>
          </div>
        </motion.div>

        {/* Bottom Overlay - Hidden by default, expands on hover */}
        <div
          className={`absolute bottom-0 left-0 right-0 transition-all duration-400 ${
            isHovered ? "h-[50%] opacity-100" : "h-0 opacity-0"
          }`}
          style={{
            background: `linear-gradient(to top, ${isLight ? "rgba(255,255,255,0.95)" : "rgba(0,0,0,0.85)"} 0%, transparent 100%)`,
          }}
        >
          <div className="absolute bottom-4 left-4 right-4">
            {/* Theme Name */}
            <motion.h3
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 10 }}
              transition={{ duration: 0.3 }}
              className="text-[1.1rem] font-semibold mb-1"
              style={{
                fontFamily: "var(--font-fraunces), serif",
                color: textColor,
                textShadow: isLight ? "none" : "0 2px 8px rgba(0,0,0,0.3)",
              }}
            >
              {theme.name}
            </motion.h3>

            {/* Description - Only on Hover */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 10 }}
              transition={{ duration: 0.3 }}
              className="text-[0.85rem] mb-3 line-clamp-2"
              style={{ color: isLight ? "#7A6555" : "rgba(255,255,255,0.8)" }}
            >
              {description}
            </motion.p>

            {/* Badge Row */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 10 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="flex items-center gap-2"
            >
              <span
                className="px-2.5 py-1 rounded-md text-[0.65rem] font-semibold uppercase tracking-wider"
                style={{
                  background: `${accentColor}30`,
                  color: accentColor,
                }}
              >
                {isPremium ? "Premium" : "Free"}
              </span>

              {/* View indicator on hover */}
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: isHovered ? 0.7 : 0, x: isHovered ? 0 : -10 }}
                className="text-[0.7rem]"
                style={{ color: textColor }}
              >
                Content View
              </motion.span>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Expanded Modal - AnimatePresence in parent for proper exit animations */}
      <AnimatePresence>
        {isExpanded && (
          <ThemeModal
            theme={theme}
            isPremium={isPremium}
            screenshots={screenshots}
            category={category}
            description={description}
            isLight={isLight}
            onClose={handleClose}
          />
        )}
      </AnimatePresence>
    </>
  );
}

export { getThemeScreenshots, isLightTheme, getThemeDescription };
