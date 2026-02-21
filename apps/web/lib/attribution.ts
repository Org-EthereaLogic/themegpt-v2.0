export const ATTRIBUTION_STORAGE_KEY = "themegpt_attribution_v1";

const MAX_ATTR_VALUE = 120;
const MAX_PATH_VALUE = 240;

type SearchParamsLike = {
  get(name: string): string | null;
  toString(): string;
};

type AttributionMap = {
  [queryParam: string]: keyof CheckoutAttribution;
};

const TRACKING_MAP: AttributionMap = {
  utm_source: "utmSource",
  utm_medium: "utmMedium",
  utm_campaign: "utmCampaign",
  utm_content: "utmContent",
  utm_term: "utmTerm",
  gclid: "gclid",
  fbclid: "fbclid",
  ttclid: "ttclid",
};

export interface CheckoutAttribution {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  gclid?: string;
  fbclid?: string;
  ttclid?: string;
  landingPath?: string;
  firstSeenAt?: string;
  lastSeenAt?: string;
}

function sanitizeValue(input: unknown, maxLength: number): string | undefined {
  if (typeof input !== "string") return undefined;
  const cleaned = input
    .replace(/[\r\n\t]/g, " ")
    .replace(/[^\x20-\x7E]/g, "")
    .trim()
    .slice(0, maxLength);
  return cleaned || undefined;
}

function parseStoredValue(raw: string | null): CheckoutAttribution | null {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as CheckoutAttribution;
    if (!parsed || typeof parsed !== "object") return null;
    return {
      utmSource: sanitizeValue(parsed.utmSource, MAX_ATTR_VALUE),
      utmMedium: sanitizeValue(parsed.utmMedium, MAX_ATTR_VALUE),
      utmCampaign: sanitizeValue(parsed.utmCampaign, MAX_ATTR_VALUE),
      utmContent: sanitizeValue(parsed.utmContent, MAX_ATTR_VALUE),
      utmTerm: sanitizeValue(parsed.utmTerm, MAX_ATTR_VALUE),
      gclid: sanitizeValue(parsed.gclid, MAX_ATTR_VALUE),
      fbclid: sanitizeValue(parsed.fbclid, MAX_ATTR_VALUE),
      ttclid: sanitizeValue(parsed.ttclid, MAX_ATTR_VALUE),
      landingPath: sanitizeValue(parsed.landingPath, MAX_PATH_VALUE),
      firstSeenAt: sanitizeValue(parsed.firstSeenAt, MAX_ATTR_VALUE),
      lastSeenAt: sanitizeValue(parsed.lastSeenAt, MAX_ATTR_VALUE),
    };
  } catch {
    return null;
  }
}

export function getStoredAttribution(): CheckoutAttribution | null {
  if (typeof window === "undefined") return null;
  return parseStoredValue(localStorage.getItem(ATTRIBUTION_STORAGE_KEY));
}

export function captureAttributionFromLocation(
  pathname: string,
  searchParams: SearchParamsLike
): void {
  if (typeof window === "undefined") return;

  const incoming: CheckoutAttribution = {};
  for (const [queryParam, field] of Object.entries(TRACKING_MAP)) {
    const value = sanitizeValue(searchParams.get(queryParam), MAX_ATTR_VALUE);
    if (value) incoming[field] = value;
  }

  if (!Object.keys(incoming).length) return;

  const existing = getStoredAttribution() || {};
  const nowIso = new Date().toISOString();
  const query = searchParams.toString();
  const landingPath = sanitizeValue(
    query ? `${pathname}?${query}` : pathname,
    MAX_PATH_VALUE
  );

  const merged: CheckoutAttribution = {
    ...existing,
    ...incoming,
    landingPath: existing.landingPath || landingPath,
    firstSeenAt: existing.firstSeenAt || nowIso,
    lastSeenAt: nowIso,
  };

  localStorage.setItem(ATTRIBUTION_STORAGE_KEY, JSON.stringify(merged));
}

export function getAttributionEventParams(
  source: CheckoutAttribution | null = getStoredAttribution()
): Record<string, string> {
  if (!source) return {};
  const params: Record<string, string> = {};

  if (source.utmSource) params.source = source.utmSource;
  if (source.utmMedium) params.medium = source.utmMedium;
  if (source.utmCampaign) params.campaign = source.utmCampaign;

  return params;
}
