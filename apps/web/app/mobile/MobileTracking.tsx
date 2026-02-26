"use client"

import { useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { captureAttributionFromLocation } from "@/lib/attribution"
import { trackFunnelEvent } from "@/lib/funnel-events"

export function MobileTracking() {
  const searchParams = useSearchParams()

  useEffect(() => {
    captureAttributionFromLocation("/mobile", searchParams)
    trackFunnelEvent("mobile_landing", { device_type: "mobile" })
  }, [searchParams])

  return null
}
