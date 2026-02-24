import { NextRequest, NextResponse } from "next/server"
import {
  detectExtensionBrowser,
  getInstallStoreUrl
} from "@/lib/extension-distribution"

export function GET(request: NextRequest) {
  const userAgent = request.headers.get("user-agent") || ""

  // Mobile users can't install extensions — send them to the mobile landing page
  const isMobile = /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)
  if (isMobile) {
    const mobileUrl = new URL("/mobile", request.nextUrl.origin)
    mobileUrl.searchParams.set("from", "install")
    return NextResponse.redirect(mobileUrl.toString())
  }

  const browser = detectExtensionBrowser(userAgent)
  const queryString = request.nextUrl.searchParams.toString()
  const destination = getInstallStoreUrl(browser, queryString)

  return NextResponse.redirect(destination)
}
