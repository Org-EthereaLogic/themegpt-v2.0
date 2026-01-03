import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getCreditStatus } from "@/lib/credits";
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

    if (!subscription) {
      return NextResponse.json(
        { error: "No subscription found" },
        { status: 404 }
      );
    }

    const credits = getCreditStatus(subscription);

    const response: SubscriptionResponse = {
      status: subscription.status,
      planType: subscription.planType,
      credits,
      gracePeriodEnds: subscription.status === 'canceled' ? subscription.currentPeriodEnd : undefined,
      isLifetime: subscription.isLifetime,
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
