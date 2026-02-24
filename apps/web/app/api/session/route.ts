import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const sessionId = url.searchParams.get("session_id");

  if (!sessionId) {
    return NextResponse.json(
      { success: false, message: "Missing session_id" },
      { status: 400 }
    );
  }

  try {
    const session = await getStripe().checkout.sessions.retrieve(sessionId);

    // Subscription trials can complete with no immediate charge.
    // In that case Stripe marks payment_status as "no_payment_required".
    const paymentConfirmed =
      session.payment_status === "paid" ||
      (session.mode === "subscription" && session.payment_status === "no_payment_required");

    if (!paymentConfirmed) {
      return NextResponse.json(
        { success: false, message: "Payment not completed" },
        { status: 400 }
      );
    }

    // For subscriptions, check if subscription exists and is active
    if (session.mode === "subscription" && session.subscription) {
      const subscription = await getStripe().subscriptions.retrieve(
        session.subscription as string
      );

      if (subscription.status === "active" || subscription.status === "trialing") {
        // Determine plan type from metadata or subscription interval
        const planType = session.metadata?.planType ||
          (subscription.items.data[0]?.plan?.interval === "year" ? "yearly" : "monthly");

        // Lifetime must be explicitly marked; checkout-time eligibility is not sufficient.
        const isLifetime = subscription.metadata?.isLifetime === "true";

        return NextResponse.json({
          success: true,
          planType,
          isLifetime,
          subscriptionStatus: subscription.status,
          value: (session.amount_total || 0) / 100,
          currency: session.currency || "USD",
        });
      }
    }

    // For single theme purchases, check license key in customer metadata
    if (session.customer) {
      const customer = await getStripe().customers.retrieve(session.customer as string);
      if (!customer.deleted && customer.metadata?.licenseKey) {
        return NextResponse.json({
          success: true,
          hasLicense: true,
          planType: "single",
          themeId: session.metadata?.themeId,
          themeName: session.metadata?.themeName,
          value: (session.amount_total || 0) / 100,
          currency: session.currency || "USD",
        });
      }
    }

    // If webhook hasn't processed yet for single purchase, return pending
    if (session.mode === "payment") {
      return NextResponse.json({
        success: true,
        pending: true,
        message: "License key is being generated. Please refresh in a moment.",
      });
    }

    // Subscription exists but status is unexpected - still return success
    return NextResponse.json({
      success: true,
      planType: session.metadata?.planType || "monthly",
    });
  } catch (error) {
    console.error("Session retrieval error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to retrieve session" },
      { status: 500 }
    );
  }
}
