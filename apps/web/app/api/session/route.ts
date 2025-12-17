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

    if (session.payment_status !== "paid") {
      return NextResponse.json(
        { success: false, message: "Payment not completed" },
        { status: 400 }
      );
    }

    // Get the license key from customer metadata (set by webhook)
    if (session.customer) {
      const customer = await getStripe().customers.retrieve(session.customer as string);
      if (!customer.deleted && customer.metadata?.licenseKey) {
        return NextResponse.json({
          success: true,
          licenseKey: customer.metadata.licenseKey,
        });
      }
    }

    // If webhook hasn't processed yet, return pending
    return NextResponse.json({
      success: true,
      pending: true,
      message: "License key is being generated. Please refresh in a moment.",
    });
  } catch (error) {
    console.error("Session retrieval error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to retrieve session" },
      { status: 500 }
    );
  }
}
