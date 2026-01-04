"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

interface Feature {
  id: string;
  icon: string;
  title: string;
  description: string;
  highlight?: string;
  accentColor: "teal" | "coral";
}

const features: Feature[] = [
  {
    id: "one-click",
    icon: "🎨",
    title: "One-Click Setup",
    description: "No coding required. Browse themes, click to apply, and watch ChatGPT transform instantly.",
    highlight: "Zero configuration",
    accentColor: "teal",
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
    id: "animated-effects",
    icon: "✨",
    title: "Animated Effects",
    description: "Premium themes feature aurora waves, falling snowflakes, twinkling stars, and neon grids.",
    highlight: "Living themes",
    accentColor: "coral",
  },
  {
    id: "privacy",
    icon: "🔒",
    title: "Privacy First",
    description: "We never read or store your conversations. Everything runs locally in your browser.",
    highlight: "Zero data collection",
    accentColor: "teal",
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

// Feature Card Component
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
          ? `0 16px 40px rgba(74, 55, 40, 0.12), 0 0 0 2px ${accentHex}30`
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

// Screenshot Showcase Component
function ScreenshotShowcase({
  src,
  alt,
  caption,
  position,
}: {
  src: string;
  alt: string;
  caption: string;
  position: "left" | "right" | "center";
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative ${position === "center" ? "col-span-full" : ""}`}
    >
      <div
        className="relative rounded-[24px] overflow-hidden transition-all duration-500"
        style={{
          boxShadow: isHovered
            ? "0 24px 60px rgba(74, 55, 40, 0.2)"
            : "0 12px 40px rgba(74, 55, 40, 0.1)",
          transform: isHovered ? "translateY(-4px) scale(1.01)" : "translateY(0) scale(1)",
        }}
      >
        <Image
          src={src}
          alt={alt}
          width={600}
          height={400}
          className="w-full h-auto object-cover"
        />

        {/* Gradient overlay on hover */}
        <div
          className="absolute inset-0 transition-opacity duration-300"
          style={{
            background: "linear-gradient(to top, rgba(74, 55, 40, 0.6) 0%, transparent 50%)",
            opacity: isHovered ? 1 : 0,
          }}
        />

        {/* Caption on hover */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 20 }}
          transition={{ duration: 0.3 }}
          className="absolute bottom-4 left-4 right-4"
        >
          <p
            className="text-white text-[0.9rem] font-medium"
            style={{ textShadow: "0 2px 8px rgba(0,0,0,0.3)" }}
          >
            {caption}
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}

// Main FeaturesSection Component
export function FeaturesSection() {
  return (
    <section
      id="features"
      className="py-24 px-8 lg:px-16"
      style={{ background: "#FDF8F3" }}
    >
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
          Everything you need, nothing you don't
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
        {/* First Row: 4 features */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-5">
          {features.slice(0, 4).map((feature, index) => (
            <FeatureCard key={feature.id} feature={feature} index={index} />
          ))}
        </div>

        {/* Second Row: Screenshot showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
          <ScreenshotShowcase
            src="/features/electric-dreams.png"
            alt="Electric Dreams theme with cosmic aurora"
            caption="Electric Dreams - Cosmic aurora with neon accents"
            position="left"
          />
          <ScreenshotShowcase
            src="/features/sunset-blaze.png"
            alt="Sunset Blaze theme with warm gradients"
            caption="Sunset Blaze - Warm gradients that flow"
            position="center"
          />
          <ScreenshotShowcase
            src="/features/woodland.png"
            alt="Woodland Retreat theme with animated snowfall"
            caption="Woodland Retreat - Animated snowfall effect"
            position="right"
          />
        </div>

        {/* Third Row: 4 more features */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.slice(4).map((feature, index) => (
            <FeatureCard key={feature.id} feature={feature} index={index + 4} />
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
          href="#pricing"
          className="inline-block px-8 py-4 rounded-full font-semibold text-white transition-all duration-300 hover:-translate-y-1"
          style={{
            background: "#5BB5A2",
            boxShadow: "0 8px 24px rgba(91, 181, 162, 0.3)",
          }}
        >
          Get Started Free
        </a>
      </motion.div>
    </section>
  );
}
