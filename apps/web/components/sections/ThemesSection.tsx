"use client";

import { useState, useCallback, useRef } from "react";
import { motion, LayoutGroup, AnimatePresence } from "framer-motion";
import { DEFAULT_THEMES } from "@themegpt/shared";
import { ThemeCard } from "@/components/ui/ThemeCard";

const PREMIUM_THEMES = DEFAULT_THEMES.filter((t) => t.isPremium);
const FREE_THEMES = DEFAULT_THEMES.filter((t) => !t.isPremium);

// Particle component for burst effect
interface Particle {
  id: number;
  x: number;
  y: number;
  angle: number;
  speed: number;
  size: number;
  color: string;
}

function ParticleBurst({ particles, onComplete }: { particles: Particle[]; onComplete: () => void }) {
  return (
    <AnimatePresence onExitComplete={onComplete}>
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: particle.size,
            height: particle.size,
            background: particle.color,
            left: particle.x,
            top: particle.y,
          }}
          initial={{ scale: 1, opacity: 1 }}
          animate={{
            x: Math.cos(particle.angle) * particle.speed * 60,
            y: Math.sin(particle.angle) * particle.speed * 60,
            scale: 0,
            opacity: 0,
          }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      ))}
    </AnimatePresence>
  );
}

// Tab Button Component with enhanced sliding indicator
interface TabButtonProps {
  active: boolean;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  label: string;
  count: number;
  accentColor: string;
}

function TabButton({ active, onClick, label, count, accentColor }: TabButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      className="relative px-6 py-3 rounded-full font-semibold text-[0.95rem] transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#5BB5A2]"
      style={{
        color: active ? "white" : "#4A3728",
      }}
      whileHover={!active ? { scale: 1.02 } : {}}
      whileTap={{ scale: 0.98 }}
    >
      {/* Sliding background pill with enhanced glow */}
      {active && (
        <motion.div
          layoutId="activeTabPill"
          className="absolute inset-0 rounded-full"
          style={{
            background: `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}dd 100%)`,
          }}
          initial={false}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 35,
            mass: 0.8,
          }}
        >
          {/* Glow layer */}
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              boxShadow: `0 4px 20px ${accentColor}50, 0 0 40px ${accentColor}30`,
            }}
            animate={{
              boxShadow: [
                `0 4px 20px ${accentColor}50, 0 0 40px ${accentColor}30`,
                `0 6px 24px ${accentColor}60, 0 0 50px ${accentColor}40`,
                `0 4px 20px ${accentColor}50, 0 0 40px ${accentColor}30`,
              ],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </motion.div>
      )}

      {/* Inactive hover indicator */}
      {!active && (
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            border: `2px solid ${accentColor}30`,
          }}
          whileHover={{
            borderColor: `${accentColor}60`,
            background: `${accentColor}10`,
          }}
          transition={{ duration: 0.2 }}
        />
      )}

      <span className="relative z-10 flex items-center">
        {label}
        <motion.span
          className="ml-2 px-2 py-0.5 rounded-full text-[0.75rem]"
          style={{
            background: active ? "rgba(255,255,255,0.25)" : `${accentColor}15`,
            color: active ? "white" : accentColor,
          }}
          animate={active ? { scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 0.3 }}
        >
          {count}
        </motion.span>
      </span>
    </motion.button>
  );
}

// Staggered card animation variants
const cardContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 30,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24,
    },
  },
};

// Main ThemesSection Component
export function ThemesSection() {
  const [activeTab, setActiveTab] = useState<"premium" | "free">("premium");
  const [particles, setParticles] = useState<Particle[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const particleIdRef = useRef(0);

  const themes = activeTab === "premium" ? PREMIUM_THEMES : FREE_THEMES;

  // Generate particle burst effect
  const createParticleBurst = useCallback((e: React.MouseEvent<HTMLButtonElement>, color: string) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const containerRect = containerRef.current?.getBoundingClientRect();
    if (!containerRect) return;

    const centerX = rect.left + rect.width / 2 - containerRect.left;
    const centerY = rect.top + rect.height / 2 - containerRect.top;

    const newParticles: Particle[] = [];
    const particleCount = 12;

    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount + Math.random() * 0.5;
      const speed = 0.8 + Math.random() * 0.6;
      const size = 4 + Math.random() * 6;

      newParticles.push({
        id: particleIdRef.current++,
        x: centerX,
        y: centerY,
        angle,
        speed,
        size,
        color: i % 2 === 0 ? color : `${color}cc`,
      });
    }

    setParticles((prev) => [...prev, ...newParticles]);
  }, []);

  const clearParticles = useCallback(() => {
    setParticles([]);
  }, []);

  const handleTabClick = useCallback(
    (tab: "premium" | "free", e: React.MouseEvent<HTMLButtonElement>) => {
      if (tab === activeTab) return;

      const color = tab === "premium" ? "#E8A87C" : "#5BB5A2";
      createParticleBurst(e, color);
      setActiveTab(tab);
    },
    [activeTab, createParticleBurst]
  );

  return (
    <section
      id="themes"
      className="relative py-24 px-8 lg:px-16 overflow-hidden"
      style={{
        background: `
          radial-gradient(ellipse at 15% 20%, rgba(91, 181, 162, 0.18) 0%, transparent 50%),
          radial-gradient(ellipse at 85% 80%, rgba(232, 168, 124, 0.18) 0%, transparent 50%),
          #FFF9F2
        `,
      }}
    >

      {/* Section Header */}
      <div className="relative z-10 text-center mb-12">
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

      {/* Tab Navigation with Particle Container */}
      <div ref={containerRef} className="relative z-10">
        <LayoutGroup>
          <div className="flex justify-center gap-4 mb-12">
            <TabButton
              active={activeTab === "premium"}
              onClick={(e) => handleTabClick("premium", e)}
              label="Premium Themes"
              count={PREMIUM_THEMES.length}
              accentColor="#E8A87C"
            />
            <TabButton
              active={activeTab === "free"}
              onClick={(e) => handleTabClick("free", e)}
              label="Free Themes"
              count={FREE_THEMES.length}
              accentColor="#5BB5A2"
            />
          </div>
        </LayoutGroup>

        {/* Particle Burst Layer */}
        {particles.length > 0 && (
          <ParticleBurst particles={particles} onComplete={clearParticles} />
        )}
      </div>

      {/* Theme Grid with Staggered Cascade Animation */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          variants={cardContainerVariants}
          initial="hidden"
          animate="visible"
          exit={{ opacity: 0, transition: { duration: 0.2 } }}
          className="relative z-10 mx-auto max-w-[1100px] grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
        >
          {themes.map((theme, index) => (
            <motion.div key={theme.id} variants={cardVariants}>
              <ThemeCard
                theme={theme}
                index={index}
                isPremium={activeTab === "premium"}
              />
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
