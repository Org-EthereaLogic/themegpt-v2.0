import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
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

    // Verify theme exists
    const theme = DEFAULT_THEMES.find(t => t.id === themeId);
    if (!theme) {
      return NextResponse.json(
        { error: "Theme not found" },
        { status: 404 }
      );
    }

    // Check if user has subscription
    const subscription = await db.getSubscriptionByUserId(session.user.id);

    if (!subscription) {
      return NextResponse.json(
        { error: "No subscription found" },
        { status: 403 }
      );
    }

    // Check if subscription is completely expired
    const now = new Date();
    if (subscription.status === 'expired' || now > subscription.currentPeriodEnd) {
      return NextResponse.json(
        { error: "Subscription expired" },
        { status: 403 }
      );
    }

    // Check if user has previously downloaded this theme
    const hasDownloaded = await db.hasDownloadedTheme(session.user.id, themeId);

    if (!hasDownloaded) {
      return NextResponse.json(
        { error: "Theme not previously downloaded" },
        { status: 403 }
      );
    }

    // Allow re-download without consuming credits
    return NextResponse.json({
      success: true,
      theme,
      redownload: true,
    });
  } catch (error) {
    console.error("Error processing redownload:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
