"use client";

import { motion } from "framer-motion";
import { OrganicBlob } from "@/components/ui/OrganicBlob";
import { DEFAULT_THEMES, type Theme } from "@themegpt/shared";

const PREMIUM_THEMES = DEFAULT_THEMES.filter((t) => t.isPremium);

function hasAnimatedEffects(theme: Theme): boolean {
  return !!(
    theme.effects?.auroraGradient?.enabled ||
    theme.effects?.animatedSnowfall?.enabled ||
    theme.effects?.twinklingStars?.enabled ||
    theme.effects?.ambientEffects?.neonGrid ||
    theme.effects?.ambientEffects?.auroraWaves
  );
}

interface PricingSectionProps {
  selectedTheme: string;
  onThemeChange: (themeId: string) => void;
  onCheckout: (type: "yearly" | "monthly" | "single", themeId?: string) => void;
  checkoutError?: string | null;
}

export function PricingSection({
  selectedTheme,
  onThemeChange,
  onCheckout,
  checkoutError,
}: PricingSectionProps) {
  return (
    <section
      id="pricing"
      className="relative py-24 px-8 lg:px-16 overflow-hidden"
      style={{ background: "#FFF9F2" }}
    >
      {/* Background blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <OrganicBlob
          color="teal"
          size={400}
          position={{ top: "-100px", left: "-100px" }}
          blur={80}
          opacity={0.3}
        />
        <OrganicBlob
          color="coral"
          size={300}
          position={{ bottom: "-50px", right: "-50px" }}
          blur={80}
          opacity={0.3}
        />
      </div>

      <div className="relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <p
            className="text-[0.8rem] font-semibold uppercase tracking-[0.2em] mb-3"
            style={{ color: "#5BB5A2" }}
          >
            Pricing
          </p>
          <h2
            className="text-[clamp(2rem,4vw,3rem)] font-semibold tracking-tight"
            style={{ fontFamily: "var(--font-fraunces), serif" }}
          >
            Start free, upgrade anytime
          </h2>
        </div>

        {/* Pricing Cards */}
        <div className="flex flex-col md:flex-row justify-center gap-8 flex-wrap max-w-[800px] mx-auto">
          {/* Single Theme Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0 }}
            className="bg-white rounded-[28px] p-10 w-full md:w-[340px] text-center transition-all duration-400 hover:-translate-y-2.5"
            style={{ boxShadow: "0 12px 40px rgba(74, 55, 40, 0.08)" }}
          >
            <h3
              className="text-[1.35rem] font-semibold mb-2"
              style={{ fontFamily: "var(--font-fraunces), serif" }}
            >
              Single Theme
            </h3>
            <div className="text-[3rem] font-bold mb-1">$0.99</div>
            <p className="opacity-60 text-[0.9rem] mb-6">one-time purchase</p>

            {/* Theme Selector */}
            <label
              htmlFor="theme-select"
              className="block text-sm font-medium mb-2 text-left"
              style={{ color: "#7A6555" }}
            >
              Select Theme
            </label>
            <select
              id="theme-select"
              value={selectedTheme}
              onChange={(e) => onThemeChange(e.target.value)}
              className="w-full mb-6 py-2.5 px-3 rounded-lg border focus:outline-none focus:ring-2"
              style={{
                borderColor: "rgba(74, 55, 40, 0.2)",
                color: "#4A3728",
              }}
            >
              {PREMIUM_THEMES.map((theme) => (
                <option key={theme.id} value={theme.id}>
                  {theme.name} {hasAnimatedEffects(theme) ? "✨" : ""}
                </option>
              ))}
            </select>

            <ul className="text-left mb-8 space-y-2.5">
              {["Choose any premium theme", "Keep it forever", "Free updates included"].map(
                (item) => (
                  <li key={item} className="flex items-center gap-2.5 text-[0.95rem]">
                    <span
                      className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[0.7rem] font-bold flex-shrink-0"
                      style={{ background: "#5BB5A2" }}
                    >
                      ✓
                    </span>
                    {item}
                  </li>
                )
              )}
            </ul>

            <button
              onClick={() => onCheckout("single", selectedTheme)}
              className="w-full py-4 rounded-[14px] font-semibold text-white transition-all duration-300 hover:scale-[1.02]"
              style={{
                background: "#4A3728",
                boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
              }}
            >
              Buy a Theme
            </button>
          </motion.div>

          {/* Subscription Card (Featured) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative rounded-[28px] p-10 w-full md:w-[340px] text-center transition-all duration-400 hover:-translate-y-2.5"
            style={{
              background: "#4A3728",
              color: "#FDF8F3",
              boxShadow: "0 12px 40px rgba(74, 55, 40, 0.08)",
            }}
          >
            {/* Best Value Badge */}
            <span
              className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-[0.75rem] font-semibold uppercase tracking-wider text-white"
              style={{ background: "#E8A87C" }}
            >
              Best Value
            </span>

            <h3
              className="text-[1.35rem] font-semibold mb-2"
              style={{ fontFamily: "var(--font-fraunces), serif" }}
            >
              Infinite Style
            </h3>
            <div className="text-[3rem] font-bold mb-1">$1.99</div>
            <p className="opacity-60 text-[0.9rem] mb-6">per month</p>

            <ul className="text-left mb-8 space-y-2.5">
              {[
                "Access all themes",
                "New themes every month",
                "Seasonal exclusives",
                "Priority support",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2.5 text-[0.95rem]">
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[0.7rem] font-bold flex-shrink-0"
                    style={{ background: "#E8A87C" }}
                  >
                    ✓
                  </span>
                  {item}
                </li>
              ))}
            </ul>

            <button
              onClick={() => onCheckout("monthly")}
              className="w-full py-4 rounded-[14px] font-semibold text-white transition-all duration-300 hover:scale-[1.02]"
              style={{
                background: "#E8A87C",
                boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
              }}
            >
              Get Started
            </button>
          </motion.div>
        </div>

        {/* Error Message */}
        {checkoutError && (
          <div
            className="mt-6 max-w-[700px] mx-auto p-4 rounded-lg text-sm text-center"
            style={{
              background: "rgba(220, 38, 38, 0.1)",
              border: "1px solid rgba(220, 38, 38, 0.2)",
              color: "#b91c1c",
            }}
            role="alert"
          >
            {checkoutError}
          </div>
        )}
      </div>
    </section>
  );
}
