"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

const CONSENT_KEY = "themegpt_analytics_consent";

function subscribeToNothing() {
  return () => {};
}

function getConsentSnapshot(): string | null {
  return localStorage.getItem(CONSENT_KEY);
}

function getServerSnapshot(): string | null {
  return "unknown"; // SSR: assume unknown, banner won't render server-side
}

export function CookieConsent() {
  const consent = useSyncExternalStore(subscribeToNothing, getConsentSnapshot, getServerSnapshot);
  const [dismissed, setDismissed] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (consent === "accepted" || consent === "declined") return;
    const timer = window.setTimeout(() => setVisible(true), 5000);
    const onScroll = () => {
      if (window.scrollY > window.innerHeight * 0.8) setVisible(true);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
    };
  }, [consent]);

  if (dismissed || consent === "accepted" || consent === "declined" || !visible) return null;

  function respond(value: "accepted" | "declined") {
    localStorage.setItem(CONSENT_KEY, value);
    setDismissed(true);
    if (value === "accepted") {
      window.dispatchEvent(new Event("analytics-consent-changed"));
    }
  }

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 bg-[#4B2E1E] text-white px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-sm shadow-lg">
      <p className="max-w-2xl">
        This website uses cookies for analytics to improve your experience. The
        ThemeGPT extension does not use any tracking.
      </p>
      <div className="flex gap-2 shrink-0">
        <button
          onClick={() => respond("accepted")}
          className="bg-[#E8A87C] text-[#4B2E1E] font-semibold px-4 py-1.5 rounded-full hover:opacity-90 transition-opacity"
        >
          Accept
        </button>
        <button
          onClick={() => respond("declined")}
          className="border border-white/40 px-4 py-1.5 rounded-full hover:bg-white/10 transition-colors"
        >
          Decline
        </button>
      </div>
    </div>
  );
}
