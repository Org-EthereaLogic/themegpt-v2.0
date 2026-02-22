"use client";

import { useEffect, useState } from "react";
import Script from "next/script";

const CONSENT_KEY = "themegpt_analytics_consent";
const GOOGLE_ADS_ID = "AW-17968263674";

let configured = false;

function configureGoogleAds() {
  if (configured) return;
  window.dataLayer = window.dataLayer || [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function gtag(...args: any[]) {
    window.dataLayer!.push(args);
  }
  gtag("js", new Date());
  gtag("config", GOOGLE_ADS_ID);
  configured = true;
}

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dataLayer?: any[];
  }
}

export function GoogleAdsAnalytics() {
  const [consented, setConsented] = useState(false);

  useEffect(() => {
    const check = () =>
      setConsented(localStorage.getItem(CONSENT_KEY) === "accepted");
    check();

    const handler = () => check();
    window.addEventListener("analytics-consent-changed", handler);
    return () =>
      window.removeEventListener("analytics-consent-changed", handler);
  }, []);

  useEffect(() => {
    if (consented) configureGoogleAds();
  }, [consented]);

  if (!consented) return null;

  return (
    <Script
      src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`}
      strategy="afterInteractive"
    />
  );
}
