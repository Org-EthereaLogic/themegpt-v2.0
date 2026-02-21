import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getStripe, STRIPE_PRICES, TRIAL_DAYS } from "@/lib/stripe";
import { db } from "@/lib/db";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import type { PlanType } from "@themegpt/shared";
import Stripe from "stripe";

/** Sanitize user input for safe logging (prevents log injection attacks) */
function sanitizeForLog(input: unknown, maxLength = 100): string {
  if (typeof input !== 'string') {
    return '[Non-string value]';
  }
  return input
    .replace(/[\r\n\t]/g, ' ')     // Replace control chars with space
    .replace(/[^\x20-\x7E]/g, '')  // Remove non-printable chars (prevent CRLF injection)
    .substring(0, maxLength);
}

const getAllowedOrigin = () => {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://themegpt.ai";
  return appUrl;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": getAllowedOrigin(),
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new Response(null, { headers: corsHeaders });
}

type CheckoutType = "yearly" | "monthly" | "single" | "subscription"; // subscription is legacy alias for monthly
type AttributionInput = {
  utmSource?: unknown;
  utmMedium?: unknown;
  utmCampaign?: unknown;
  utmContent?: unknown;
  utmTerm?: unknown;
  gclid?: unknown;
  fbclid?: unknown;
  ttclid?: unknown;
  landingPath?: unknown;
  firstSeenAt?: unknown;
  lastSeenAt?: unknown;
};

type SanitizedAttribution = {
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
};

function sanitizeAttributionValue(input: unknown, maxLength = 120): string | undefined {
  if (typeof input !== "string") return undefined;
  const cleaned = input
    .replace(/[\r\n\t]/g, " ")
    .replace(/[^\x20-\x7E]/g, "")
    .trim()
    .slice(0, maxLength);
  return cleaned || undefined;
}

function sanitizeAttribution(input: unknown): SanitizedAttribution {
  if (!input || typeof input !== "object") return {};
  const value = input as AttributionInput;
  return {
    utmSource: sanitizeAttributionValue(value.utmSource),
    utmMedium: sanitizeAttributionValue(value.utmMedium),
    utmCampaign: sanitizeAttributionValue(value.utmCampaign),
    utmContent: sanitizeAttributionValue(value.utmContent),
    utmTerm: sanitizeAttributionValue(value.utmTerm),
    gclid: sanitizeAttributionValue(value.gclid),
    fbclid: sanitizeAttributionValue(value.fbclid),
    ttclid: sanitizeAttributionValue(value.ttclid),
    landingPath: sanitizeAttributionValue(value.landingPath, 240),
    firstSeenAt: sanitizeAttributionValue(value.firstSeenAt),
    lastSeenAt: sanitizeAttributionValue(value.lastSeenAt),
  };
}

function compactMetadata(values: Record<string, string | undefined>): Record<string, string> {
  const entries = Object.entries(values).filter((entry): entry is [string, string] => Boolean(entry[1]));
  return Object.fromEntries(entries);
}

function attributionToStripeMetadata(attribution: SanitizedAttribution): Record<string, string> {
  return compactMetadata({
    utm_source: attribution.utmSource,
    utm_medium: attribution.utmMedium,
    utm_campaign: attribution.utmCampaign,
    utm_content: attribution.utmContent,
    utm_term: attribution.utmTerm,
    gclid: attribution.gclid,
    fbclid: attribution.fbclid,
    ttclid: attribution.ttclid,
    landing_path: attribution.landingPath,
    first_seen_at: attribution.firstSeenAt,
    last_seen_at: attribution.lastSeenAt,
  });
}

export async function POST(request: NextRequest) {
  // Apply rate limiting for payment endpoints
  const rateLimitResponse = checkRateLimit(request, RATE_LIMITS.payment);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await request.json();
    const { type, themeId, attribution: rawAttribution } = body as {
      type: CheckoutType;
      themeId?: string;
      attribution?: unknown;
    };
    const attribution = sanitizeAttribution(rawAttribution);
    const attributionMetadata = attributionToStripeMetadata(attribution);

    // Require authenticated user for checkout
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    const userEmail = session?.user?.email;
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401, headers: corsHeaders }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://themegpt.ai";

    // Normalize type (subscription is legacy alias for monthly)
    const normalizedType: CheckoutType = type === "subscription" ? "monthly" : type;

    // Determine price ID based on type
    let priceId: string;
    let mode: "subscription" | "payment";
    let planType: PlanType | null = null;

    // Use a whitelist for logging to prevent any potential log injection
    const logSafeType = (["yearly", "monthly", "single"].includes(normalizedType))
      ? normalizedType
      : "unknown";

    switch (normalizedType) {
      case "yearly":
        priceId = STRIPE_PRICES.yearly;
        mode = "subscription";
        planType = "yearly";
        break;
      case "monthly":
        priceId = STRIPE_PRICES.monthly;
        mode = "subscription";
        planType = "monthly";
        break;
      case "single":
        priceId = STRIPE_PRICES.singleTheme;
        mode = "payment";
        break;
      default:
        return NextResponse.json(
          { success: false, message: "Invalid checkout type" },
          { status: 400, headers: corsHeaders }
        );
    }

    if (!priceId) {
      console.error(`Missing price ID for checkout type: ${logSafeType}`);
      return NextResponse.json(
        { success: false, message: `Price not configured for ${normalizedType}` },
        { status: 500, headers: corsHeaders }
      );
    }

    console.log(`Checkout request: type=${logSafeType}, priceId=${priceId.substring(0, 20)}...`);

    // Check early adopter eligibility for yearly subscriptions
    let isEarlyAdopterEligible = false;
    if (normalizedType === "yearly") {
      isEarlyAdopterEligible = await db.isEarlyAdopterEligible();
    }

    // Build checkout session config
    const checkoutParams: Stripe.Checkout.SessionCreateParams = {
      mode: mode,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      metadata: {
        type: normalizedType,
        planType: planType || "",
        themeId: themeId || "",
        userId: userId || "",
        isEarlyAdopterEligible: isEarlyAdopterEligible ? "true" : "false",
        ...attributionMetadata,
      },
      customer_email: userEmail || undefined,
      after_expiration: {
        recovery: {
          enabled: true,
        },
      },
      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/?canceled=true`,
    };

    // Add subscription metadata
    if (normalizedType === "yearly") {
      // Yearly early adopters (slots available): No trial — pay immediately to qualify for lifetime.
      // Yearly post-early-adopter (slots exhausted): 30-day free trial, then annual billing.
      checkoutParams.subscription_data = {
        ...(isEarlyAdopterEligible ? {} : { trial_period_days: TRIAL_DAYS }),
        metadata: {
          planType: "yearly",
          isEarlyAdopterEligible: isEarlyAdopterEligible ? "true" : "false",
          ...attributionMetadata,
        },
      };
    } else if (normalizedType === "monthly") {
      // Monthly: First month free trial
      checkoutParams.subscription_data = {
        trial_period_days: TRIAL_DAYS,
        metadata: {
          planType: "monthly",
          ...attributionMetadata,
        },
      };
    }

    const checkoutSession = await getStripe().checkout.sessions.create(checkoutParams);
    const checkoutCreatedAt = checkoutSession.created
      ? new Date(checkoutSession.created * 1000)
      : new Date();

    await db.upsertCheckoutSession(checkoutSession.id, {
      stripeSessionId: checkoutSession.id,
      userId,
      customerEmail: userEmail || null,
      checkoutType: normalizedType,
      planType: planType || normalizedType,
      themeId: themeId || null,
      sessionStatus: "created",
      mode,
      currency: checkoutSession.currency || "usd",
      amountTotalCents: checkoutSession.amount_total ?? null,
      utmSource: attribution.utmSource || null,
      utmMedium: attribution.utmMedium || null,
      utmCampaign: attribution.utmCampaign || null,
      utmContent: attribution.utmContent || null,
      utmTerm: attribution.utmTerm || null,
      gclid: attribution.gclid || null,
      fbclid: attribution.fbclid || null,
      ttclid: attribution.ttclid || null,
      landingPath: attribution.landingPath || null,
      firstSeenAt: attribution.firstSeenAt || null,
      lastSeenAt: attribution.lastSeenAt || null,
      checkoutCreatedAt,
    });

    return NextResponse.json(
      {
        success: true,
        checkoutUrl: checkoutSession.url,
        isEarlyAdopterEligible,
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    // Sanitize error info for logging to prevent injection attacks
    const sanitizedErrorMsg = error instanceof Error ? sanitizeForLog(error.message) : "Unknown error";
    console.error(`Checkout API error: ${sanitizedErrorMsg}`);

    // Extract detailed error information
    let displayErrorMessage = "Unknown error";
    let errorType = "unknown";

    if (error instanceof Stripe.errors.StripeError) {
      displayErrorMessage = error.message;
      errorType = error.type;
      console.error("Stripe error details:", {
        type: sanitizeForLog(error.type),
        code: sanitizeForLog(error.code),
        param: sanitizeForLog(error.param),
        message: sanitizedErrorMsg,
      });
    } else if (error instanceof Error) {
      displayErrorMessage = error.message;
      errorType = error.name;
    }

    return NextResponse.json(
      {
        success: false,
        message: `Failed to create checkout session: ${displayErrorMessage}`,
        errorType,
      },
      { status: 500, headers: corsHeaders }
    );
  }
}
