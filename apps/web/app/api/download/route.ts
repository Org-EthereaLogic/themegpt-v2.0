import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { consumeCredit, getCreditStatus } from "@/lib/credits";
import { DEFAULT_THEMES } from "@themegpt/shared";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { themeId } = body;

    if (!themeId || typeof themeId !== 'string') {
      return NextResponse.json(
        { error: "Invalid theme ID" },
        { status: 400 }
      );
    }

    // Verify theme exists and is premium
    const theme = DEFAULT_THEMES.find(t => t.id === themeId);
    if (!theme) {
      return NextResponse.json(
        { error: "Theme not found" },
        { status: 404 }
      );
    }

    if (!theme.isPremium) {
      // Free themes don't require credits
      return NextResponse.json({
        success: true,
        theme,
        creditsUsed: false,
      });
    }

    const subscription = await db.getSubscriptionByUserId(session.user.id);

    if (!subscription) {
      return NextResponse.json(
        { error: "No active subscription" },
        { status: 403 }
      );
    }

    const result = await consumeCredit(session.user.id, themeId, subscription);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 403 }
      );
    }

    // Refresh subscription to get updated credits
    const updatedSubscription = await db.getSubscriptionByUserId(session.user.id);
    const credits = updatedSubscription ? getCreditStatus(updatedSubscription) : null;

    return NextResponse.json({
      success: true,
      theme,
      credits,
    });
  } catch (error) {
    console.error("Error processing download:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
