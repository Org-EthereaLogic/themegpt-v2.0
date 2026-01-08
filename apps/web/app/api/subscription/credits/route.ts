import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { hasFullAccess } from "@/lib/credits";

/**
 * @deprecated Credit system has been replaced with full premium access.
 * Use GET /api/subscription for subscription status.
 * This endpoint is kept for backwards compatibility.
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const subscription = await db.getSubscriptionByUserId(session.user.id);

    if (!subscription) {
      return NextResponse.json(
        { error: "No subscription found" },
        { status: 404 }
      );
    }

    // Return simplified response for backwards compatibility
    // All active subscriptions now have unlimited access
    return NextResponse.json({
      hasFullAccess: hasFullAccess(subscription),
      unlimited: true,
      message: "Credit system deprecated. All subscribers have full premium access.",
    });
  } catch (error) {
    console.error("Error fetching credits:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
