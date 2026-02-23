import { NextRequest, NextResponse } from "next/server"
import {
  detectExtensionBrowser,
  getInstallStoreUrl
} from "@/lib/extension-distribution"

export function GET(request: NextRequest) {
  const userAgent = request.headers.get("user-agent") || ""
  const browser = detectExtensionBrowser(userAgent)
  const queryString = request.nextUrl.searchParams.toString()
  const destination = getInstallStoreUrl(browser, queryString)

  return NextResponse.redirect(destination)
}
