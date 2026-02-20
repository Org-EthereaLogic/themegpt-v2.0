"use client";

import { useEffect } from "react";
import { initAnalyticsIfConsented } from "@/lib/firebase";

export function Analytics() {
  useEffect(() => {
    initAnalyticsIfConsented();

    const handler = () => initAnalyticsIfConsented();
    window.addEventListener("analytics-consent-changed", handler);
    return () => window.removeEventListener("analytics-consent-changed", handler);
  }, []);

  return null;
}
