"use client";

import { useState } from "react";
import { DEFAULT_THEMES } from "@themegpt/shared";
import { CustomCursor } from "@/components/ui/CustomCursor";
import { Navigation } from "@/components/sections/Navigation";
import { Hero } from "@/components/sections/Hero";
import { ThemesSection } from "@/components/sections/ThemesSection";
import { FeaturesSection } from "@/components/sections/FeaturesSection";
import { PricingSection } from "@/components/sections/PricingSection";
import { Footer } from "@/components/sections/Footer";

const PREMIUM_THEMES = DEFAULT_THEMES.filter((t) => t.isPremium);

export default function Home() {
  const [selectedTheme, setSelectedTheme] = useState<string>(
    PREMIUM_THEMES[0]?.id || ""
  );
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const handleCheckout = async (
    type: "yearly" | "monthly" | "single",
    themeId?: string
  ) => {
    setCheckoutError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, themeId }),
      });
      const data = await res.json();
      if (data.success && data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        setCheckoutError(
          "Checkout failed: " + (data.message || "Unknown error")
        );
      }
    } catch (error) {
      console.error("Checkout error", error);
      setCheckoutError("Unable to process checkout. Please try again.");
    }
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--cream)" }}>
      <CustomCursor />
      <Navigation />
      <Hero />
      <ThemesSection />
      <FeaturesSection />
      <PricingSection
        selectedTheme={selectedTheme}
        onThemeChange={setSelectedTheme}
        onCheckout={handleCheckout}
        checkoutError={checkoutError}
      />
      <Footer />
    </div>
  );
}
