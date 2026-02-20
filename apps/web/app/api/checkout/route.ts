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

export async function POST(request: NextRequest) {
  // Apply rate limiting for payment endpoints
  const rateLimitResponse = checkRateLimit(request, RATE_LIMITS.payment);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await request.json();
    const { type, themeId } = body as { type: CheckoutType; themeId?: string };

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
      },
      customer_email: userEmail || undefined,
      consent_collection: {
        promotions: "auto",
      },
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
        },
      };
    } else if (normalizedType === "monthly") {
      // Monthly: First month free trial
      checkoutParams.subscription_data = {
        trial_period_days: TRIAL_DAYS,
        metadata: {
          planType: "monthly",
        },
      };
    }

    const checkoutSession = await getStripe().checkout.sessions.create(checkoutParams);

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
