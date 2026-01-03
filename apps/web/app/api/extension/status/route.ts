import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { db } from "@/lib/db";
import { DEFAULT_THEMES } from "@themegpt/shared";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new Response(null, { headers: corsHeaders });
}

interface TokenPayload {
  userId: string;
  email: string;
}

export async function GET(request: Request) {
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

    // Check if subscription is active
    const isActive =
      subscription.status === "active" ||
      subscription.status === "trialing" ||
      subscription.isLifetime;

    // Get list of premium themes user has downloaded
    const downloads = await db.getDownloadHistory(payload.userId, 100);
    const downloadedThemeIds = [...new Set(downloads.map((d) => d.themeId))];

    // Get all premium theme IDs
    const premiumThemeIds = DEFAULT_THEMES.filter((t) => t.isPremium).map(
      (t) => t.id
    );

    // Determine which themes the user can access
    let accessibleThemes: string[] = [];

    if (isActive) {
      // Active subscription = all premium themes
      accessibleThemes = premiumThemeIds;
    } else {
      // Only themes they've downloaded while subscribed
      accessibleThemes = downloadedThemeIds.filter((id) =>
        premiumThemeIds.includes(id)
      );
    }

    return NextResponse.json(
      {
        success: true,
        hasSubscription: true,
        subscription: {
          status: subscription.status,
          planType: subscription.planType,
          isLifetime: subscription.isLifetime,
          isActive,
          currentPeriodEnd: subscription.currentPeriodEnd,
          trialEndsAt: subscription.trialEndsAt,
          creditsRemaining: isActive ? 3 - subscription.creditsUsed : 0,
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
