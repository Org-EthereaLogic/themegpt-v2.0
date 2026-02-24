import { logEvent } from "firebase/analytics"
import { initAnalyticsIfConsented } from "@/lib/firebase"

/**
 * Fire a GA4 funnel event if analytics consent has been granted.
 * Returns true if the event was sent, false if analytics was unavailable.
 */
export function trackFunnelEvent(
  eventName: string,
  params?: Record<string, string | boolean | number>
): boolean {
  const analytics = initAnalyticsIfConsented()
  if (!analytics) return false
  logEvent(analytics, eventName, params)
  return true
}
