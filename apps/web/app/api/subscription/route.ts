import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { hasFullAccess } from "@/lib/credits";
import { SubscriptionResponse } from "@themegpt/shared";

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

    // INTERNAL OVERRIDE: Grant full access to etherealogic.ai emails
    const isInternalUser = session.user.email?.endsWith("@etherealogic.ai");

    // If internal user and no subscription, create a mock one
    if (isInternalUser && !subscription) {
      const response: SubscriptionResponse = {
        status: 'active',
        planType: 'lifetime',
        hasFullAccess: true,
        isLifetime: true,
      };
      return NextResponse.json(response);
    }

    if (!subscription) {
      return NextResponse.json(
        { error: "No subscription found" },
        { status: 404 }
      );
    }

    // For internal users with existing subscriptions, ensure they have full access
    const isActive = isInternalUser ? true : hasFullAccess(subscription);

    const response: SubscriptionResponse = {
      status: subscription.status,
      planType: isInternalUser ? 'lifetime' : subscription.planType,
      hasFullAccess: isActive,
      gracePeriodEnds: subscription.status === 'canceled' ? subscription.currentPeriodEnd : undefined,
      isLifetime: isInternalUser || subscription.isLifetime,
      trialEndsAt: subscription.trialEndsAt || undefined,
      commitmentEndsAt: subscription.commitmentEndsAt || undefined,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching subscription:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
