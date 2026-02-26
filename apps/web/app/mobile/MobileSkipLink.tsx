"use client"

import Link from "next/link"
import { trackFunnelEvent } from "@/lib/funnel-events"

export function MobileSkipLink() {
  return (
    <Link
      href="/?skip_mobile=1"
      onClick={() => trackFunnelEvent("mobile_skip_to_site", { device_type: "mobile" })}
      className="mt-8 text-sm underline transition-colors"
      style={{ color: "#7A6555" }}
    >
      Browse the full site anyway
    </Link>
  )
}
