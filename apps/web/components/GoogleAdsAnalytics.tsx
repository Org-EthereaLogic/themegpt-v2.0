"use client";

import { useEffect } from "react";
import Script from "next/script";

const CONSENT_KEY = "themegpt_analytics_consent";
const GOOGLE_ADS_ID = "AW-17968263674";
const CONVERSION_LABEL = "DN9FCKXF1fwbEPrj9_dC";

let initialized = false;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function gtag(...args: any[]) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(args);
}

/** Set consent defaults to denied and configure the Google tag */
function initGoogleAds() {
  if (initialized) return;
  // Consent Mode v2: default all consent signals to denied
  gtag("consent", "default", {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: "denied",
  });
  gtag("js", new Date());
  gtag("config", GOOGLE_ADS_ID);
  // Fire "Page view" conversion so Google Ads can verify and track it
  gtag("event", "conversion", {
    send_to: `${GOOGLE_ADS_ID}/${CONVERSION_LABEL}`,
    value: 1.0,
    currency: "USD",
  });
  initialized = true;
}

/** Grant consent — called when the user accepts cookies */
function grantConsent() {
  gtag("consent", "update", {
    ad_storage: "granted",
    ad_user_data: "granted",
    ad_personalization: "granted",
    analytics_storage: "granted",
  });
}

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dataLayer?: any[];
  }
}

export function GoogleAdsAnalytics() {
  useEffect(() => {
    // Initialize the tag on first render
    initGoogleAds();

    // If user already consented in a previous session, grant immediately
    if (localStorage.getItem(CONSENT_KEY) === "accepted") {
      grantConsent();
    }

    // Listen for future consent changes (user clicks Accept)
    const handler = () => {
      if (localStorage.getItem(CONSENT_KEY) === "accepted") {
        grantConsent();
      }
    };
    window.addEventListener("analytics-consent-changed", handler);
    return () =>
      window.removeEventListener("analytics-consent-changed", handler);
  }, []);

  // Always render the script — Google needs to see it for tag verification.
  // Tracking is gated by Consent Mode, not by script presence.
  return (
    <Script
      src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`}
      strategy="afterInteractive"
    />
  );
}
