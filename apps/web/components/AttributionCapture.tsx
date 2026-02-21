"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { captureAttributionFromLocation } from "@/lib/attribution";

export function AttributionCapture() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!pathname) return;
    captureAttributionFromLocation(pathname, searchParams);
  }, [pathname, searchParams]);

  return null;
}
