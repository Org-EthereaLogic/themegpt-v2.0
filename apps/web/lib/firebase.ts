// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// Firebase client config — NEXT_PUBLIC_ vars are baked in at build time.
// When not configured (e.g. Docker build without build-args), degrade gracefully
// so prerendering and SSR don't crash.
const hasConfig =
  !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
  !!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN &&
  !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

let app: ReturnType<typeof initializeApp> | null = null;
let analytics: ReturnType<typeof getAnalytics> | null = null;

if (hasConfig) {
  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "",
  };

  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  // Analytics is NOT initialized eagerly — gated on user consent via initAnalyticsIfConsented()
}

/** Initialize GA4 only if the user has accepted analytics consent. Memoized. */
export function initAnalyticsIfConsented(): ReturnType<typeof getAnalytics> | null {
  if (typeof window === "undefined" || !app) return null;
  if (localStorage.getItem("themegpt_analytics_consent") !== "accepted") return null;
  if (!analytics) {
    analytics = getAnalytics(app);
  }
  return analytics;
}

export { app, analytics };
