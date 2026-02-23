export type ExtensionBrowser = "chrome" | "edge" | "firefox"

const CHROME_EXTENSION_ID = "dlphknialdlpmcgoknkcmapmclgckhba"
const LEGACY_LOCAL_EXTENSION_ID = process.env.NEXT_PUBLIC_EXTENSION_ID
const EDGE_EXTENSION_ID = process.env.NEXT_PUBLIC_EDGE_EXTENSION_ID || ""
const FIREFOX_EXTENSION_ID = process.env.NEXT_PUBLIC_FIREFOX_EXTENSION_ID || ""

const EDGE_ADDONS_URL = process.env.NEXT_PUBLIC_EDGE_ADDONS_URL || ""
const FIREFOX_ADDONS_URL = process.env.NEXT_PUBLIC_FIREFOX_ADDONS_URL || ""

const CHROME_STORE_BASE_URL = `https://chromewebstore.google.com/detail/${CHROME_EXTENSION_ID}`

function appendQuery(baseUrl: string, queryString: string): string {
  if (!queryString) return baseUrl

  const normalized = queryString.startsWith("?")
    ? queryString.slice(1)
    : queryString
  if (!normalized) return baseUrl

  const delimiter = baseUrl.includes("?") ? "&" : "?"
  return `${baseUrl}${delimiter}${normalized}`
}

export function detectExtensionBrowser(userAgent: string): ExtensionBrowser {
  const ua = userAgent.toLowerCase()

  if (ua.includes("edg/")) return "edge"
  if (ua.includes("firefox/")) return "firefox"
  return "chrome"
}

function getStoreBaseUrl(browser: ExtensionBrowser): string {
  if (browser === "edge" && EDGE_ADDONS_URL) return EDGE_ADDONS_URL
  if (browser === "firefox" && FIREFOX_ADDONS_URL) return FIREFOX_ADDONS_URL
  return CHROME_STORE_BASE_URL
}

export function getInstallStoreUrl(
  browser: ExtensionBrowser,
  queryString = ""
): string {
  return appendQuery(getStoreBaseUrl(browser), queryString)
}

export function getClientExtensionBrowser(): ExtensionBrowser {
  if (typeof navigator === "undefined") return "chrome"
  return detectExtensionBrowser(navigator.userAgent)
}

export function getExtensionIdsForBrowser(browser: ExtensionBrowser): string[] {
  const ids = new Set<string>()

  if (browser === "edge") {
    if (EDGE_EXTENSION_ID) ids.add(EDGE_EXTENSION_ID)
    // Chromium fallback for local/unpacked installs.
    ids.add(CHROME_EXTENSION_ID)
  } else if (browser === "firefox") {
    if (FIREFOX_EXTENSION_ID) ids.add(FIREFOX_EXTENSION_ID)
  } else {
    ids.add(CHROME_EXTENSION_ID)
  }

  if (LEGACY_LOCAL_EXTENSION_ID) ids.add(LEGACY_LOCAL_EXTENSION_ID)

  return Array.from(ids)
}

export function getClientInstallStoreUrl(queryString = ""): string {
  return getInstallStoreUrl(getClientExtensionBrowser(), queryString)
}
