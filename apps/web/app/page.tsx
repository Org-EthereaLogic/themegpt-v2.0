"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { logEvent } from "firebase/analytics";
import { initAnalyticsIfConsented } from "@/lib/firebase";
import { DEFAULT_THEMES } from "@themegpt/shared";
import { CustomCursor } from "@/components/ui/CustomCursor";
import { Navigation } from "@/components/sections/Navigation";
import { Hero } from "@/components/sections/Hero";
import { ThemesSection } from "@/components/sections/ThemesSection";
import { FeaturesSection } from "@/components/sections/FeaturesSection";
import { PricingSection } from "@/components/sections/PricingSection";
import { Footer } from "@/components/sections/Footer";

const PREMIUM_THEMES = DEFAULT_THEMES.filter((t) => t.isPremium);
const PENDING_CHECKOUT_KEY = "themegpt_pending_checkout_v1";

type CheckoutType = "yearly" | "monthly" | "single";

export default function Home() {
  const { data: session } = useSession();
  const [selectedTheme, setSelectedTheme] = useState<string>(
    PREMIUM_THEMES[0]?.id || ""
  );
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const handleCheckout = useCallback(async (type: CheckoutType, themeId?: string) => {
    // Enforce login before checkout; persist intent so purchase resumes immediately after auth.
    if (!session) {
      window.sessionStorage.setItem(PENDING_CHECKOUT_KEY, JSON.stringify({ type, themeId }));
      signIn(undefined, { callbackUrl: window.location.href });
      return;
    }

    setCheckoutError(null);

    // Gate 3: fire checkout_start before the POST so the event is always recorded
    const a = initAnalyticsIfConsented();
    if (a) {
      logEvent(a, "checkout_start", { plan_type: type });
    }

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, themeId }),
      });
      const data = await res.json();
      if (data.success && data.checkoutUrl) {
        // Validate checkout URL to prevent open redirect attacks
        const url = String(data.checkoutUrl);
        if (url.startsWith("https://checkout.stripe.com/") || url.startsWith("https://billing.stripe.com/")) {
          window.location.href = url;
        } else {
          console.error("Untrusted checkout URL:", url);
          setCheckoutError("Security error: Untrusted redirection target");
        }
      } else {
        setCheckoutError(
          "Checkout failed: " + (data.message || "Unknown error")
        );
      }
    } catch (error) {
      console.error("Checkout error", error);
      setCheckoutError("Unable to process checkout. Please try again.");
    }
  }, [session]);

  useEffect(() => {
    if (!session) {
      return;
    }

    const raw = window.sessionStorage.getItem(PENDING_CHECKOUT_KEY);
    if (!raw) {
      return;
    }

    window.sessionStorage.removeItem(PENDING_CHECKOUT_KEY);

    try {
      const parsed = JSON.parse(raw) as { type?: CheckoutType; themeId?: string };
      if (parsed.type === "monthly" || parsed.type === "yearly" || parsed.type === "single") {
        const resumeTimer = window.setTimeout(() => {
          void handleCheckout(parsed.type as CheckoutType, parsed.themeId);
        }, 0);
        return () => window.clearTimeout(resumeTimer);
      }
    } catch (error) {
      console.error("Failed to restore pending checkout intent", error);
    }
  }, [session, handleCheckout]);

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
