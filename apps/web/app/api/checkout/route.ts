import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getStripe, STRIPE_PRICES, TRIAL_DAYS } from "@/lib/stripe";
import { db } from "@/lib/db";
import type { PlanType } from "@themegpt/shared";
import Stripe from "stripe";

/** Sanitize user input for safe logging (prevents log injection attacks) */
function sanitizeForLog(input: string, maxLength = 50): string {
  return input
    .replace(/[\r\n\t]/g, ' ')     // Replace control chars with space
    .replace(/[^\x20-\x7E]/g, '')  // Remove non-printable chars
    .substring(0, maxLength);
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new Response(null, { headers: corsHeaders });
}

type CheckoutType = "yearly" | "monthly" | "single" | "subscription"; // subscription is legacy alias for monthly

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, themeId } = body as { type: CheckoutType; themeId?: string };

    // Get user session if logged in
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://themegpt.app";

    // Normalize type (subscription is legacy alias for monthly)
    const normalizedType: CheckoutType = type === "subscription" ? "monthly" : type;

    // Determine price ID based on type
    let priceId: string;
    let mode: "subscription" | "payment";
    let planType: PlanType | null = null;

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
      console.error("Missing price ID for checkout type:", normalizedType, "STRIPE_PRICES:", {
        monthly: STRIPE_PRICES.monthly ? "set" : "empty",
        yearly: STRIPE_PRICES.yearly ? "set" : "empty",
        singleTheme: STRIPE_PRICES.singleTheme ? "set" : "empty",
      });
      return NextResponse.json(
        { success: false, message: `Price not configured for ${normalizedType}` },
        { status: 500, headers: corsHeaders }
      );
    }

    console.log(`Checkout request: type=${sanitizeForLog(normalizedType)}, priceId=${priceId.substring(0, 20)}...`);

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
      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/?canceled=true`,
    };

    // Add subscription metadata
    if (normalizedType === "yearly") {
      // Yearly: No trial, but early adopters get lifetime access
      checkoutParams.subscription_data = {
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
    console.error("Checkout API error:", error);

    // Extract detailed error information
    let errorMessage = "Unknown error";
    let errorType = "unknown";

    if (error instanceof Stripe.errors.StripeError) {
      errorMessage = error.message;
      errorType = error.type;
      console.error("Stripe error details:", {
        type: error.type,
        code: error.code,
        param: error.param,
        message: error.message,
      });
    } else if (error instanceof Error) {
      errorMessage = error.message;
      errorType = error.name;
    }

    return NextResponse.json(
      {
        success: false,
        message: `Failed to create checkout session: ${errorMessage}`,
        errorType,
      },
      { status: 500, headers: corsHeaders }
    );
  }
}
