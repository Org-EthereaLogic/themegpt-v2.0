"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface Feature {
  id: string;
  icon: string;
  title: string;
  description: string;
  highlight?: string;
  accentColor: "teal" | "coral";
  isHero?: boolean;
}

const features: Feature[] = [
  {
    id: "one-click",
    icon: "🎨",
    title: "One-Click Setup",
    description: "No coding required. Browse themes, click to apply, and watch ChatGPT transform instantly. It's that simple.",
    highlight: "Zero configuration",
    accentColor: "teal",
    isHero: true,
  },
  {
    id: "free-themes",
    icon: "🎁",
    title: "Free Themes Included",
    description: "Start with 7 beautiful themes at no cost. Classic favorites like Dracula, Monokai, and Solarized.",
    highlight: "7 free themes",
    accentColor: "teal",
  },
  {
    id: "premium-themes",
    icon: "💎",
    title: "Premium Collection",
    description: "Unlock 8 exclusive premium themes with stunning animated effects and seasonal designs.",
    highlight: "8 premium themes",
    accentColor: "coral",
  },
  {
    id: "token-counter",
    icon: "📊",
    title: "Token Counter",
    description: "Track your usage in real-time. See token and word counts as you chat with GPT.",
    highlight: "Real-time tracking",
    accentColor: "teal",
  },
  {
    id: "privacy",
    icon: "🔒",
    title: "Privacy First",
    description: "We never read or store your conversations. Everything runs locally in your browser. Your data stays yours.",
    highlight: "Zero data collection",
    accentColor: "teal",
    isHero: true,
  },
  {
    id: "animated-effects",
    icon: "✨",
    title: "Animated Effects",
    description: "Premium themes feature aurora waves, falling snowflakes, twinkling stars, and neon grids.",
    highlight: "Living themes",
    accentColor: "coral",
  },
  {
    id: "auto-updates",
    icon: "🔄",
    title: "Automatic Updates",
    description: "New themes delivered automatically. Your collection grows without lifting a finger.",
    highlight: "Always fresh",
    accentColor: "teal",
  },
  {
    id: "designer-quality",
    icon: "🖌️",
    title: "Designer Quality",
    description: "Every theme is handcrafted by real designers. No AI-generated color schemes here.",
    highlight: "Human-crafted",
    accentColor: "coral",
  },
];

// Hero Feature Card Component (larger, more prominent)
function HeroFeatureCard({ feature, index }: { feature: Feature; index: number }) {
  const [isHovered, setIsHovered] = useState(false);
  const accentHex = feature.accentColor === "coral" ? "#E8A87C" : "#5BB5A2";

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative bg-white p-8 rounded-[24px] col-span-2 transition-all duration-400 overflow-hidden"
      style={{
        boxShadow: isHovered
          ? `0 24px 50px rgba(74, 55, 40, 0.15), 0 0 0 2px ${accentHex}40`
          : "0 12px 30px rgba(74, 55, 40, 0.08)",
        transform: isHovered ? "translateY(-12px)" : "translateY(0)",
      }}
    >
      {/* Gradient reveal on hover */}
      <div
        className="absolute inset-0 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `linear-gradient(180deg, transparent 50%, ${accentHex}08 100%)`,
          opacity: isHovered ? 1 : 0,
        }}
      />

      {/* Accent bar */}
      <div
        className="absolute top-0 left-0 right-0 h-1 transition-all duration-400"
        style={{
          background: `linear-gradient(90deg, ${accentHex}, ${accentHex}60)`,
          opacity: isHovered ? 1 : 0.6,
        }}
      />

      <div className="relative z-10 flex flex-col sm:flex-row gap-6 items-start">
        {/* Icon with animated background */}
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-400"
          style={{
            background: isHovered ? `${accentHex}25` : `${accentHex}12`,
            transform: isHovered ? "scale(1.15) rotate(5deg)" : "scale(1)",
            boxShadow: isHovered ? `0 0 24px ${accentHex}40` : "none",
          }}
        >
          <span className="text-[2rem]">{feature.icon}</span>
        </div>

        <div className="flex-1">
          {/* Highlight badge */}
          {feature.highlight && (
            <span
              className="inline-block px-3 py-1.5 rounded-full text-[0.7rem] font-semibold uppercase tracking-wider mb-3 transition-all duration-300"
              style={{
                background: `${accentHex}15`,
                color: accentHex,
              }}
            >
              {feature.highlight}
            </span>
          )}

          {/* Title */}
          <h3
            className="text-[1.35rem] font-semibold mb-3"
            style={{
              fontFamily: "var(--font-fraunces), serif",
              color: "#4A3728",
            }}
          >
            {feature.title}
          </h3>

          {/* Description */}
          <p
            className="text-[0.95rem] leading-relaxed"
            style={{ color: "#7A6555" }}
          >
            {feature.description}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// Standard Feature Card Component
function FeatureCard({ feature, index }: { feature: Feature; index: number }) {
  const [isHovered, setIsHovered] = useState(false);
  const accentHex = feature.accentColor === "coral" ? "#E8A87C" : "#5BB5A2";

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group bg-white p-6 rounded-[20px] transition-all duration-300"
      style={{
        boxShadow: isHovered
          ? `0 16px 40px rgba(74, 55, 40, 0.12), 0 0 0 1px ${accentHex}30`
          : "0 8px 24px rgba(74, 55, 40, 0.06)",
        transform: isHovered ? "translateY(-8px)" : "translateY(0)",
        border: "1px solid rgba(74, 55, 40, 0.05)",
      }}
    >
      {/* Icon with animated background */}
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300"
        style={{
          background: isHovered ? `${accentHex}20` : "rgba(74, 55, 40, 0.04)",
          transform: isHovered ? "scale(1.1)" : "scale(1)",
        }}
      >
        <span className="text-[1.75rem]">{feature.icon}</span>
      </div>

      {/* Highlight badge */}
      {feature.highlight && (
        <span
          className="inline-block px-2.5 py-1 rounded-full text-[0.65rem] font-semibold uppercase tracking-wider mb-3 transition-all duration-300"
          style={{
            background: `${accentHex}15`,
            color: accentHex,
          }}
        >
          {feature.highlight}
        </span>
      )}

      {/* Title */}
      <h3
        className="text-[1.15rem] font-semibold mb-2"
        style={{
          fontFamily: "var(--font-fraunces), serif",
          color: "#4A3728",
        }}
      >
        {feature.title}
      </h3>

      {/* Description */}
      <p
        className="text-[0.9rem] leading-relaxed"
        style={{ color: "#7A6555" }}
      >
        {feature.description}
      </p>
    </motion.div>
  );
}

// Main FeaturesSection Component
export function FeaturesSection() {
  // Separate hero and standard features
  const heroFeatures = features.filter(f => f.isHero);
  const standardFeatures = features.filter(f => !f.isHero);

  // Row 1: Hero (One-Click Setup) + 2 standard
  const row1Hero = heroFeatures[0]; // One-Click Setup
  const row1Standards = standardFeatures.slice(0, 2); // Free Themes, Premium

  // Row 2: 1 standard + Hero (Privacy) + 1 standard
  const row2Standard1 = standardFeatures[2]; // Token Counter
  const row2Hero = heroFeatures[1]; // Privacy First
  const row2Standard2 = standardFeatures[3]; // Animated Effects

  // Bottom row: 2 centered standards
  const bottomFeatures = standardFeatures.slice(4); // Auto-Updates, Designer Quality

  return (
    <section
      id="features"
      className="relative py-24 px-8 lg:px-16 overflow-hidden"
      style={{ background: "#FDF8F3" }}
    >
      {/* Ambient Glow Pulse Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Top-left teal glow */}
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full ambient-glow animate-glow-pulse" />
        {/* Bottom-right teal glow */}
        <div className="absolute -bottom-[15%] -right-[10%] w-[45%] h-[45%] rounded-full ambient-glow-soft animate-glow-pulse-delayed" />
      </div>

      <div className="relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="text-[0.8rem] font-semibold uppercase tracking-[0.2em] mb-3"
            style={{ color: "#5BB5A2" }}
          >
            Why ThemeGPT
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="text-[clamp(2rem,4vw,3rem)] font-semibold tracking-tight mb-4"
            style={{ fontFamily: "var(--font-fraunces), serif", color: "#4A3728" }}
          >
            Everything you need, nothing you don&apos;t
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="text-lg max-w-2xl mx-auto"
            style={{ color: "#7A6555" }}
          >
            A lightweight Chrome extension that transforms your ChatGPT experience with beautiful themes and useful tools.
          </motion.p>
        </div>

        {/* Bento Grid Layout */}
        <div className="max-w-[1100px] mx-auto">
          {/* Row 1: Hero + 2 Standards */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 mb-5">
            <HeroFeatureCard feature={row1Hero} index={0} />
            {row1Standards.map((feature, idx) => (
              <FeatureCard key={feature.id} feature={feature} index={idx + 1} />
            ))}
          </div>

          {/* Row 2: Standard + Hero + Standard */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 mb-5">
            <FeatureCard feature={row2Standard1} index={3} />
            <HeroFeatureCard feature={row2Hero} index={4} />
            <FeatureCard feature={row2Standard2} index={5} />
          </div>

          {/* Bottom Row: 2 centered standards */}
          <div className="flex flex-col sm:flex-row justify-center gap-5 max-w-[550px] mx-auto">
            {bottomFeatures.map((feature, idx) => (
              <div key={feature.id} className="flex-1">
                <FeatureCard feature={feature} index={idx + 6} />
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center mt-16"
        >
          <p
            className="text-[0.95rem] mb-5"
            style={{ color: "#7A6555" }}
          >
            Ready to transform your ChatGPT?
          </p>
          <a
            href="https://chromewebstore.google.com/detail/dlphknialdlpmcgoknkcmapmclgckhba?utm_source=cws&utm_medium=share&utm_campaign=item-share"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-8 py-4 rounded-full font-semibold text-white transition-all duration-300 hover:-translate-y-1"
            style={{
              background: "#5BB5A2",
              boxShadow: "0 8px 24px rgba(91, 181, 162, 0.3)",
            }}
          >
            Add to Chrome — It&apos;s Free
          </a>
        </motion.div>
      </div>
    </section>
  );
}
