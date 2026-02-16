import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { SignJWT } from "jose";
import { getStripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit";

const getAllowedOrigin = () => {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://themegpt.ai";
  return appUrl;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": getAllowedOrigin(),
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new Response(null, { headers: corsHeaders });
}

// Generate a token for an authenticated user
export async function POST(request: NextRequest) {
  // Apply rate limiting for auth endpoints
  const rateLimitResponse = checkRateLimit(request, RATE_LIMITS.auth);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || !session?.user?.email) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401, headers: corsHeaders }
      );
    }

    // Check if user has a subscription - if not, try to link from Stripe
    const existingSubscription = await db.getSubscriptionByUserId(session.user.id);

    if (!existingSubscription) {
      await linkStripeSubscription(session.user.id, session.user.email);
    }

    // Generate JWT for extension
    const secret = new TextEncoder().encode(
      process.env.EXTENSION_JWT_SECRET || process.env.NEXTAUTH_SECRET
    );

    const token = await new SignJWT({
      userId: session.user.id,
      email: session.user.email,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("30d")
      .sign(secret);

    return NextResponse.json(
      {
        success: true,
        token,
        user: {
          email: session.user.email,
          name: session.user.name,
        },
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error("Extension auth error:", error);
    return NextResponse.json(
      { success: false, message: "Authentication failed" },
      { status: 500, headers: corsHeaders }
    );
  }
}

// Link Stripe subscription to user by email
async function linkStripeSubscription(userId: string, email: string) {
  try {
    // Search for Stripe customers by email
    const customers = await getStripe().customers.list({
      email: email,
      limit: 1,
    });

    if (customers.data.length === 0) {
      return;
    }

    const customer = customers.data[0];

    // Get active subscriptions for this customer
    const subscriptions = await getStripe().subscriptions.list({
      customer: customer.id,
      status: "all",
      limit: 10,
    });

    // Find the most recent active/trialing subscription
    const activeSubscription = subscriptions.data.find(
      (sub) => sub.status === "active" || sub.status === "trialing"
    );

    if (!activeSubscription) {
      return;
    }

    // Check if this subscription already exists in our DB
    const existingDbSub = await db.getSubscriptionByStripeId(activeSubscription.id);
    if (existingDbSub) {
      // Already linked, update with this user if different
      if (existingDbSub.userId !== userId) {
        await db.updateSubscription(existingDbSub.id, { userId });
      }
      return;
    }

    // Create new subscription record
    const firstItem = activeSubscription.items?.data?.[0];
    const currentPeriodStart = firstItem?.current_period_start
      ? new Date(firstItem.current_period_start * 1000)
      : new Date();
    const currentPeriodEnd = firstItem?.current_period_end
      ? new Date(firstItem.current_period_end * 1000)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    // Determine plan type from subscription metadata or price
    const metadata = activeSubscription.metadata || {};
    let planType: "monthly" | "yearly" = "monthly";
    if (metadata.planType === "yearly" || activeSubscription.items.data[0]?.price?.recurring?.interval === "year") {
      planType = "yearly";
    }

    // Lifetime must be explicitly marked; eligibility at checkout is not lifetime.
    const isLifetime = metadata.isLifetime === "true";

    await db.createSubscription({
      userId,
      stripeSubscriptionId: activeSubscription.id,
      stripeCustomerId: customer.id,
      status: activeSubscription.status === "trialing" ? "trialing" : "active",
      planType: isLifetime ? "lifetime" : planType,
      currentPeriodStart,
      currentPeriodEnd,
      trialEndsAt: activeSubscription.trial_end
        ? new Date(activeSubscription.trial_end * 1000)
        : null,
      commitmentEndsAt: planType === "yearly"
        ? new Date(currentPeriodStart.getTime() + 365 * 24 * 60 * 60 * 1000)
        : null,
      isLifetime,
    });
  } catch (error) {
    console.error("Error linking Stripe subscription:", error);
  }
}

// Get auth page URL
export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://themegpt.ai";

  return NextResponse.json(
    {
      success: true,
      authUrl: `${baseUrl}/auth/extension`,
    },
    { headers: corsHeaders }
  );
}
