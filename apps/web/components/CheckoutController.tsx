"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { logEvent } from "firebase/analytics";
import { initAnalyticsIfConsented } from "@/lib/firebase";
import { getAttributionEventParams, getStoredAttribution } from "@/lib/attribution";
import { DEFAULT_THEMES } from "@themegpt/shared";
import { PricingSection } from "@/components/sections/PricingSection";
import Link from "next/link";

const PREMIUM_THEMES = DEFAULT_THEMES.filter((t) => t.isPremium);
const PENDING_CHECKOUT_KEY = "themegpt_pending_checkout_v1";
const LAST_CHECKOUT_TYPE_KEY = "themegpt_last_checkout_type_v1";
const CHECKOUT_ABANDON_LOGGED_KEY = "themegpt_checkout_abandon_logged_v1";

type CheckoutType = "yearly" | "monthly" | "single";

export default function CheckoutController() {
  const { data: session } = useSession();
  const [selectedTheme, setSelectedTheme] = useState<string>(
    PREMIUM_THEMES[0]?.id || ""
  );
  const [checkoutError, setCheckoutError] = useState<React.ReactNode | null>(null);

  const handleCheckout = useCallback(async (type: CheckoutType, themeId?: string, isResume = false) => {
    if (!isResume) {
      const a = initAnalyticsIfConsented();
      if (a) {
        logEvent(a, "checkout_start", { plan_type: type, ...getAttributionEventParams() });
      }
    }
    if (!session) {
      window.sessionStorage.setItem(PENDING_CHECKOUT_KEY, JSON.stringify({ type, themeId }));
      const callbackUrl = window.location.origin + window.location.pathname + "#pricing";
      signIn(undefined, { callbackUrl });
      return;
    }

    setCheckoutError(null);

    try {
      window.sessionStorage.removeItem(CHECKOUT_ABANDON_LOGGED_KEY);
      window.sessionStorage.setItem(LAST_CHECKOUT_TYPE_KEY, type);
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, themeId, attribution: getStoredAttribution() }),
      });
      const data = await res.json();
      if (data.success && data.checkoutUrl) {
        const url = String(data.checkoutUrl);
        try {
          const parsed = new URL(url);
          if (parsed.protocol === "https:" && (parsed.hostname === "checkout.stripe.com" || parsed.hostname === "billing.stripe.com")) {
            window.location.href = url;
          } else {
            console.error("Untrusted checkout URL:", url);
            setCheckoutError("Security error: Untrusted redirection target");
          }
        } catch {
          console.error("Invalid checkout URL:", url);
          setCheckoutError("Security error: Invalid redirection target");
        }
      } else {
        if (data.code === "ALREADY_SUBSCRIBED") {
          setCheckoutError(
            <span>
              You already have an active subscription. Manage your plan from{" "}
              <Link href="/account" className="underline font-semibold hover:text-red-800">
                your account
              </Link>.
            </span>
          );
        } else {
          setCheckoutError(
            "Checkout failed: " + (data.message || "Unknown error")
          );
        }
      }
    } catch (error) {
      console.error("Checkout error", error);
      setCheckoutError("Unable to process checkout. Please try again.");
    }
  }, [session]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const isCanceled = params.get("canceled") === "true";
    if (!isCanceled) return;
    if (window.sessionStorage.getItem(CHECKOUT_ABANDON_LOGGED_KEY) === "1") return;

    window.sessionStorage.setItem(CHECKOUT_ABANDON_LOGGED_KEY, "1");
    const planType = window.sessionStorage.getItem(LAST_CHECKOUT_TYPE_KEY) || "unknown";
    const a = initAnalyticsIfConsented();
    if (a) {
      logEvent(a, "checkout_abandon", {
        plan_type: planType,
        ...getAttributionEventParams(),
      });
    }
  }, []);

  useEffect(() => {
    if (!session) return;

    const raw = window.sessionStorage.getItem(PENDING_CHECKOUT_KEY);
    if (!raw) return;

    window.sessionStorage.removeItem(PENDING_CHECKOUT_KEY);

    try {
      const parsed = JSON.parse(raw) as { type?: CheckoutType; themeId?: string };
      if (parsed.type === "monthly" || parsed.type === "yearly" || parsed.type === "single") {
        const resumeTimer = window.setTimeout(() => {
          void handleCheckout(parsed.type as CheckoutType, parsed.themeId, true);
        }, 0);
        return () => window.clearTimeout(resumeTimer);
      }
    } catch (error) {
      console.error("Failed to restore pending checkout intent", error);
    }
  }, [session, handleCheckout]);

  return (
    <PricingSection
      selectedTheme={selectedTheme}
      onThemeChange={setSelectedTheme}
      onCheckout={handleCheckout}
      checkoutError={checkoutError}
    />
  );
}
