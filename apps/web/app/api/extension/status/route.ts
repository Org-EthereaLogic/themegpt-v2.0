import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { db } from "@/lib/db";
import { DEFAULT_THEMES } from "@themegpt/shared";
import { hasFullAccess } from "@/lib/credits";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit";

const getAllowedOrigin = () => {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://themegpt.app";
  return appUrl;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": getAllowedOrigin(),
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Cache-Control": "private, max-age=60", // Cache for 1 minute (user-specific data)
};

export async function OPTIONS() {
  return new Response(null, { headers: corsHeaders });
}

interface TokenPayload {
  userId: string;
  email: string;
}

export async function GET(request: NextRequest) {
  // Rate limit check
  const rateLimitResponse = checkRateLimit(request, RATE_LIMITS.sync);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const authHeader = request.headers.get("Authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, message: "Missing authorization token" },
        { status: 401, headers: corsHeaders }
      );
    }

    const token = authHeader.substring(7);
    const secret = new TextEncoder().encode(
      process.env.EXTENSION_JWT_SECRET || process.env.NEXTAUTH_SECRET
    );

    let payload: TokenPayload;
    try {
      const verified = await jwtVerify(token, secret);
      payload = verified.payload as unknown as TokenPayload;
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid or expired token" },
        { status: 401, headers: corsHeaders }
      );
    }

    // Get user subscription
    const subscription = await db.getSubscriptionByUserId(payload.userId);

    if (!subscription) {
      return NextResponse.json(
        {
          success: true,
          hasSubscription: false,
          user: { email: payload.email },
        },
        { headers: corsHeaders }
      );
    }

    // Check if user has full access
    const isActive = hasFullAccess(subscription);

    // Get all premium theme IDs
    const premiumThemeIds = DEFAULT_THEMES.filter((t) => t.isPremium).map(
      (t) => t.id
    );

    // Determine which themes the user can access
    // Active subscribers get all premium themes
    const accessibleThemes = isActive ? premiumThemeIds : [];

    return NextResponse.json(
      {
        success: true,
        hasSubscription: true,
        subscription: {
          status: subscription.status,
          planType: subscription.planType,
          isLifetime: subscription.isLifetime,
          isActive,
          hasFullAccess: isActive,
          currentPeriodEnd: subscription.currentPeriodEnd,
          trialEndsAt: subscription.trialEndsAt,
        },
        accessibleThemes,
        user: { email: payload.email },
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error("Extension status error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to get status" },
      { status: 500, headers: corsHeaders }
    );
  }
}
