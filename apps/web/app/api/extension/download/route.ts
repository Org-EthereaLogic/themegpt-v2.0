import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { db } from "@/lib/db";
import { DEFAULT_THEMES } from "@themegpt/shared";
import { hasFullAccess } from "@/lib/credits";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new Response(null, { headers: corsHeaders });
}

interface TokenPayload {
  userId: string;
  email: string;
}

export async function POST(request: Request) {
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

    // Parse request body
    const body = await request.json();
    const { themeId } = body;

    if (!themeId) {
      return NextResponse.json(
        { success: false, message: "Theme ID required" },
        { status: 400, headers: corsHeaders }
      );
    }

    // Verify theme exists and is premium
    const theme = DEFAULT_THEMES.find((t) => t.id === themeId);
    if (!theme) {
      return NextResponse.json(
        { success: false, message: "Theme not found" },
        { status: 404, headers: corsHeaders }
      );
    }

    if (!theme.isPremium) {
      // Free theme, no need to track
      return NextResponse.json(
        { success: true, message: "Free theme, no download needed" },
        { headers: corsHeaders }
      );
    }

    // Get user subscription
    const subscription = await db.getSubscriptionByUserId(payload.userId);

    if (!subscription) {
      return NextResponse.json(
        { success: false, message: "No active subscription" },
        { status: 403, headers: corsHeaders }
      );
    }

    // Check if user has full access (active subscription or in grace period)
    if (!hasFullAccess(subscription)) {
      return NextResponse.json(
        { success: false, message: "Subscription not active" },
        { status: 403, headers: corsHeaders }
      );
    }

    // Record the download for audit purposes
    await db.recordDownload({
      userId: payload.userId,
      subscriptionId: subscription.id,
      themeId,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Theme unlocked successfully",
        theme: {
          id: theme.id,
          name: theme.name,
        },
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error("Extension download error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to download theme" },
      { status: 500, headers: corsHeaders }
    );
  }
}
