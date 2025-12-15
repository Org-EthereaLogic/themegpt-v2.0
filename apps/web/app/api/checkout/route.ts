import { NextResponse } from "next/server";
import { getStripe, STRIPE_PRICES } from "@/lib/stripe";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new Response(null, { headers: corsHeaders });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, themeId } = body as { type: "subscription" | "single"; themeId?: string };

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://themegpt.app";

    const priceId = type === "subscription"
      ? STRIPE_PRICES.subscription
      : STRIPE_PRICES.singleTheme;

    const session = await getStripe().checkout.sessions.create({
      mode: type === "subscription" ? "subscription" : "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      metadata: {
        type,
        themeId: themeId || "",
      },
      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/?canceled=true`,
    });

    return NextResponse.json(
      {
        success: true,
        checkoutUrl: session.url
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error("Checkout API error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create checkout session" },
      { status: 500, headers: corsHeaders }
    );
  }
}
