"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { DEFAULT_THEMES, type Theme } from "@themegpt/shared";

const PREMIUM_THEMES = DEFAULT_THEMES.filter((t) => t.isPremium);
const FREE_THEMES = DEFAULT_THEMES.filter((t) => !t.isPremium);

function getThemeScreenshots(themeId: string): { home: string; content: string } {
  const mapping: Record<string, { home: string; content: string }> = {
    // Premium themes
    "aurora-borealis": { home: "/themes/aurora_borealis_1.png", content: "/themes/aurora_borealis_2.png" },
    "sunset-blaze": { home: "/themes/sunset_blaze_1.png", content: "/themes/sunset_blaze_2.png" },
    "electric-dreams": { home: "/themes/electric_dreams_1.png", content: "/themes/electric_dreams_2.png" },
    "woodland-retreat": { home: "/themes/woodland_retreat_1.png", content: "/themes/woodland_retreat_2.png" },
    "frosted-windowpane": { home: "/themes/frosted_windowpane_1.png", content: "/themes/frosted_windowpane_2.png" },
    "silent-night-starfield": { home: "/themes/silent_night_1.png", content: "/themes/silent_night_2.png" },
    "synth-wave": { home: "/themes/synth_wave_1.png", content: "/themes/synth_wave_2.png" },
    "shades-of-purple": { home: "/themes/shades_of_purple_1.png", content: "/themes/shades_of_purple_2.png" },
    // Free themes
    "themegpt-dark": { home: "/themes/themegpt_dark_1.png", content: "/themes/themegpt_dark_2.png" },
    "themegpt-light": { home: "/themes/themegpt_light_1.png", content: "/themes/themegpt_light_2.png" },
    "solarized-dark": { home: "/themes/solarized_dark_1.png", content: "/themes/solarized_dark_2.png" },
    "dracula": { home: "/themes/dracula_1.png", content: "/themes/dracula_2.png" },
    "monokai-pro": { home: "/themes/monokai_pro_1.png", content: "/themes/monokai_pro_2.png" },
    "high-contrast": { home: "/themes/high_contrast_1.png", content: "/themes/high_contrast_2.png" },
    "one-dark": { home: "/themes/one_dark_1.png", content: "/themes/one_dark_2.png" },
  };
  return mapping[themeId] || { home: "", content: "" };
}

function isLightTheme(themeId: string): boolean {
  return themeId === "frosted-windowpane" || themeId === "themegpt-light";
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
    "dracula": { category: "Classic IDE", description: "The iconic Dracula theme for night owls" },
    "monokai-pro": { category: "Classic IDE", description: "Professional Monokai with refined colors" },
    "high-contrast": { category: "Accessibility", description: "Maximum contrast for better visibility" },
    "one-dark": { category: "Classic IDE", description: "Atom's popular One Dark color scheme" },
  };

  return descriptions[theme.id] || {
    category: isLightTheme(theme.id) ? "Light Theme" : "Dark Theme",
    description: "A beautiful theme for your ChatGPT experience"
  };
}

// Tab Button Component
interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
  accentColor: string;
}

function TabButton({ active, onClick, label, count, accentColor }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`relative px-6 py-3 rounded-full font-semibold text-[0.95rem] transition-all duration-300 ${
        active ? "text-white" : ""
      }`}
      style={{
        background: active ? accentColor : "transparent",
        border: `2px solid ${active ? accentColor : "#4A3728"}`,
        color: active ? "white" : "#4A3728",
        boxShadow: active ? `0 4px 16px ${accentColor}40` : "none",
      }}
    >
      {label}
      <span
        className="ml-2 px-2 py-0.5 rounded-full text-[0.75rem]"
        style={{
          background: active ? "rgba(255,255,255,0.2)" : `${accentColor}20`,
          color: active ? "white" : accentColor,
        }}
      >
        {count}
      </span>
    </button>
  );
}

// Theme Card Component
interface ThemeCardProps {
  theme: Theme;
  index: number;
  isPremium: boolean;
}

function ThemeCard({ theme, index, isPremium }: ThemeCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const screenshots = getThemeScreenshots(theme.id);
  const { category, description } = getThemeDescription(theme);
  const isLight = isLightTheme(theme.id);

  const accentColor = isPremium ? "#E8A87C" : "#5BB5A2";
  const textColor = isLight ? "#4A3728" : "white";
  const badgeBg = isLight ? "rgba(74, 55, 40, 0.15)" : "rgba(255,255,255,0.2)";

  const handleClick = () => {
    const pricingSection = document.getElementById("pricing");
    if (pricingSection) {
      pricingSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
      className="group relative rounded-[20px] overflow-hidden cursor-pointer transition-all duration-400 hover:scale-[1.03] hover:z-10 aspect-[16/10]"
      style={{
        boxShadow: isHovered
          ? `0 20px 40px rgba(74, 55, 40, 0.15), 0 0 0 2px ${accentColor}40`
          : "0 8px 24px rgba(74, 55, 40, 0.08)",
      }}
    >
      {/* Image Container with Crossfade */}
      <div className="absolute inset-0">
        {/* Home Image (default) */}
        <Image
          src={screenshots.home}
          alt={`${theme.name} home screen`}
          fill
          className={`object-cover transition-opacity duration-500 ${isHovered ? "opacity-0" : "opacity-100"}`}
        />
        {/* Content Image (on hover) */}
        <Image
          src={screenshots.content}
          alt={`${theme.name} content view`}
          fill
          className={`object-cover transition-opacity duration-500 ${isHovered ? "opacity-100" : "opacity-0"}`}
        />
      </div>

      {/* Category Badge - Top Right */}
      <div
        className="absolute top-3 right-3 px-3 py-1.5 rounded-full text-[0.7rem] font-semibold uppercase tracking-wider backdrop-blur-sm"
        style={{
          background: badgeBg,
          color: textColor,
        }}
      >
        {category}
      </div>

      {/* Bottom Overlay - Expands on Hover */}
      <div
        className={`absolute bottom-0 left-0 right-0 transition-all duration-400 ${
          isHovered ? "h-[50%]" : "h-[35%]"
        }`}
        style={{
          background: `linear-gradient(to top, ${isLight ? "rgba(255,255,255,0.95)" : "rgba(0,0,0,0.85)"} 0%, transparent 100%)`,
        }}
      >
        <div className="absolute bottom-4 left-4 right-4">
          {/* Theme Name */}
          <h3
            className="text-[1.1rem] font-semibold mb-1"
            style={{
              fontFamily: "var(--font-fraunces), serif",
              color: textColor,
              textShadow: isLight ? "none" : "0 2px 8px rgba(0,0,0,0.3)",
            }}
          >
            {theme.name}
          </h3>

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
          <div className="flex items-center gap-2">
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
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Main ThemesSection Component
export function ThemesSection() {
  const [activeTab, setActiveTab] = useState<"premium" | "free">("premium");

  const themes = activeTab === "premium" ? PREMIUM_THEMES : FREE_THEMES;

  return (
    <section
      id="themes"
      className="py-24 px-8 lg:px-16"
      style={{ background: "#FFF9F2" }}
    >
      {/* Section Header */}
      <div className="text-center mb-12">
        <p
          className="text-[0.8rem] font-semibold uppercase tracking-[0.2em] mb-3"
          style={{ color: "#5BB5A2" }}
        >
          Theme Gallery
        </p>
        <h2
          className="text-[clamp(2rem,4vw,3rem)] font-semibold tracking-tight"
          style={{ fontFamily: "var(--font-fraunces), serif" }}
        >
          Pick your perfect look
        </h2>
      </div>

      {/* Tab Navigation */}
      <div className="flex justify-center gap-4 mb-12">
        <TabButton
          active={activeTab === "premium"}
          onClick={() => setActiveTab("premium")}
          label="Premium Themes"
          count={PREMIUM_THEMES.length}
          accentColor="#E8A87C"
        />
        <TabButton
          active={activeTab === "free"}
          onClick={() => setActiveTab("free")}
          label="Free Themes"
          count={FREE_THEMES.length}
          accentColor="#5BB5A2"
        />
      </div>

      {/* Theme Grid */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mx-auto max-w-[1100px] grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
      >
        {themes.map((theme, index) => (
          <ThemeCard
            key={theme.id}
            theme={theme}
            index={index}
            isPremium={activeTab === "premium"}
          />
        ))}
      </motion.div>
    </section>
  );
}
