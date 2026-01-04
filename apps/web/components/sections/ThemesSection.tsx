"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { DEFAULT_THEMES, type Theme } from "@themegpt/shared";

const PREMIUM_THEMES = DEFAULT_THEMES.filter((t) => t.isPremium).slice(0, 5);

function getThemeScreenshots(themeId: string): { home: string; content: string } {
  const mapping: Record<string, { home: string; content: string }> = {
    "aurora-borealis": { home: "/themes/aurora_borealis_1.png", content: "/themes/aurora_borealis_2.png" },
    "sunset-blaze": { home: "/themes/sunset_blaze_1.png", content: "/themes/sunset_blaze_2.png" },
    "electric-dreams": { home: "/themes/electric_dreams_1.png", content: "/themes/electric_dreams_2.png" },
    "woodland-retreat": { home: "/themes/woodland_retreat_1.png", content: "/themes/woodland_retreat_2.png" },
    "frosted-windowpane": { home: "/themes/frosted_windowpane_1.png", content: "/themes/frosted_windowpane_2.png" },
    "silent-night-starfield": { home: "/themes/silent_night_1.png", content: "/themes/silent_night_2.png" },
    "synth-wave": { home: "/themes/synth_wave_1.png", content: "/themes/synth_wave_2.png" },
    "shades-of-purple": { home: "/themes/shades_of_purple_1.png", content: "/themes/shades_of_purple_2.png" },
  };
  return mapping[themeId] || { home: "", content: "" };
}

const gradientFallbacks: Record<string, string> = {
  "aurora-borealis": "linear-gradient(135deg, #0a1628 0%, #1a3a5c 100%)",
  "sunset-blaze": "linear-gradient(135deg, #2d1b4e 0%, #4a2c7a 100%)",
  "electric-dreams": "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
  "woodland-retreat": "linear-gradient(135deg, #1a3c34 0%, #2d5a4a 100%)",
  "frosted-windowpane": "linear-gradient(135deg, #f8f5ff 0%, #e8dff5 100%)",
  "silent-night-starfield": "linear-gradient(135deg, #0f0c29 0%, #1a1a2e 100%)",
  "synth-wave": "linear-gradient(135deg, #2d1b4e 0%, #4a2c7a 100%)",
  "shades-of-purple": "linear-gradient(135deg, #2d2b55 0%, #4a4878 100%)",
};

function isLightTheme(themeId: string): boolean {
  return themeId === "frosted-windowpane";
}

export function ThemesSection() {
  return (
    <section
      id="themes"
      className="py-24 px-8 lg:px-16"
      style={{ background: "#FFF9F2" }}
    >
      {/* Section Header */}
      <div className="text-center mb-16">
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

      {/* Masonry Grid - Responsive */}
      <div className="mx-auto max-w-[1200px] grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 auto-rows-[180px] lg:auto-rows-[200px]">

        {PREMIUM_THEMES.map((theme, index) => (
          <ThemeItem key={theme.id} theme={theme} index={index} />
        ))}
      </div>
    </section>
  );
}

interface ThemeItemProps {
  theme: Theme;
  index: number;
}

function ThemeItem({ theme, index }: ThemeItemProps) {
  const screenshots = getThemeScreenshots(theme.id);
  const hasScreenshot = !!screenshots.home;
  const isLight = isLightTheme(theme.id);
  const isFeatured = index === 0;

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
      transition={{ duration: 0.5, delay: index * 0.1 }}
      onClick={handleClick}
      className={`group relative rounded-[20px] overflow-hidden cursor-pointer transition-all duration-400 hover:scale-[1.03] hover:z-10 ${
        isFeatured ? "md:col-span-2 md:row-span-2" : "col-span-1"
      }`}
      style={{
        background: hasScreenshot ? undefined : gradientFallbacks[theme.id],
      }}
    >
      {hasScreenshot ? (
        <Image
          src={screenshots.home}
          alt={theme.name}
          fill
          className="object-cover"
        />
      ) : (
        <div className="w-full h-full p-5 flex flex-col">
          {/* Placeholder content */}
          <div className="flex gap-1.5 mb-4">
            <div className="w-3 h-3 rounded-full bg-[#ff6b6b]" />
            <div className="w-3 h-3 rounded-full bg-[#feca57]" />
            <div className="w-3 h-3 rounded-full bg-[#48dbfb]" />
          </div>
          <div className="flex flex-col gap-2.5 flex-1">
            <div className="h-2 rounded bg-white/30" style={{ width: "80%" }} />
            <div className="h-2 rounded bg-white/30" style={{ width: "60%" }} />
            <div className="h-2 rounded bg-white/30" style={{ width: "90%" }} />
          </div>
        </div>
      )}

      {/* Metadata overlay */}
      <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end opacity-0 translate-y-2.5 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
        <span
          className="text-base font-semibold"
          style={{
            fontFamily: "var(--font-fraunces), serif",
            color: isLight ? "#4A3728" : "white",
            textShadow: isLight ? "none" : "0 2px 8px rgba(0,0,0,0.3)",
          }}
        >
          {theme.name}
        </span>
        <span
          className="px-2.5 py-1 rounded-md text-[0.65rem] font-semibold uppercase tracking-wider"
          style={{
            background: isLight ? "rgba(74, 55, 40, 0.1)" : "rgba(255,255,255,0.2)",
            color: isLight ? "#4A3728" : "white",
          }}
        >
          Premium
        </span>
      </div>
    </motion.div>
  );
}
