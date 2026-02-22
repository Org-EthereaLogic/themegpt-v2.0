"use client";

import { useEffect } from "react";
import Clarity from "@microsoft/clarity";

const CONSENT_KEY = "themegpt_analytics_consent";
const CLARITY_PROJECT_ID = "vky4a128au";

let initialized = false;

function initClarityIfConsented() {
  if (typeof window === "undefined") return;
  if (process.env.NODE_ENV !== "production") return;
  if (localStorage.getItem(CONSENT_KEY) !== "accepted") return;
  if (initialized) return;

  Clarity.init(CLARITY_PROJECT_ID);
  Clarity.consent();
  initialized = true;
}

export function ClarityAnalytics() {
  useEffect(() => {
    initClarityIfConsented();

    const handler = () => initClarityIfConsented();
    window.addEventListener("analytics-consent-changed", handler);
    return () => window.removeEventListener("analytics-consent-changed", handler);
  }, []);

  return null;
}
