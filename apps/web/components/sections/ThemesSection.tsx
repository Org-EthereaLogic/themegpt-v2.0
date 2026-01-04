"use client";

import { useState } from "react";
import { motion, LayoutGroup } from "framer-motion";
import { DEFAULT_THEMES } from "@themegpt/shared";
import { ThemeCard } from "@/components/ui/ThemeCard";

const PREMIUM_THEMES = DEFAULT_THEMES.filter((t) => t.isPremium);
const FREE_THEMES = DEFAULT_THEMES.filter((t) => !t.isPremium);

// Tab Button Component with sliding indicator
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
      className="relative px-6 py-3 rounded-full font-semibold text-[0.95rem] transition-colors duration-300"
      style={{
        color: active ? "white" : "#4A3728",
        border: "2px solid transparent",
      }}
    >
      {/* Sliding background pill */}
      {active && (
        <motion.div
          layoutId="activeTabPill"
          className="absolute inset-0 rounded-full"
          style={{
            background: accentColor,
            boxShadow: `0 4px 16px ${accentColor}40`,
          }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        />
      )}
      <span className="relative z-10 flex items-center">
        {label}
        <span
          className="ml-2 px-2 py-0.5 rounded-full text-[0.75rem] transition-colors duration-300"
          style={{
            background: active ? "rgba(255,255,255,0.2)" : `${accentColor}20`,
            color: active ? "white" : accentColor,
          }}
        >
          {count}
        </span>
      </span>
    </button>
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
      <LayoutGroup>
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
      </LayoutGroup>

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
