import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { getStripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { LicenseEntitlement } from "@themegpt/shared";
import { v4 as uuidv4 } from "uuid";
import Stripe from "stripe";

export async function POST(request: Request) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      await handleCheckoutComplete(session);
      break;
    }
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      await handleSubscriptionCanceled(subscription);
      break;
    }
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  const { type, themeId } = session.metadata || {};
  const licenseKey = `KEY-${uuidv4().substring(0, 8).toUpperCase()}`;

  let entitlement: LicenseEntitlement;

  if (type === "subscription") {
    entitlement = {
      active: true,
      type: "subscription",
      maxSlots: 3,
      permanentlyUnlocked: [],
      activeSlotThemes: [],
    };
  } else {
    entitlement = {
      active: true,
      type: "lifetime",
      maxSlots: 0,
      permanentlyUnlocked: themeId ? [themeId] : [],
      activeSlotThemes: [],
    };
  }

  await db.createLicense(licenseKey, entitlement);

  // Store license key in Stripe customer metadata for retrieval
  if (session.customer) {
    await getStripe().customers.update(session.customer as string, {
      metadata: { licenseKey },
    });
  }

  console.log(`License created: ${licenseKey} for ${type}`);
}

async function handleSubscriptionCanceled(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  try {
    const customer = await getStripe().customers.retrieve(customerId);
    if (customer.deleted) return;

    const licenseKey = customer.metadata?.licenseKey;
    if (!licenseKey) {
      console.error("No license key found for customer:", customerId);
      return;
    }

    const license = await db.getLicense(licenseKey);
    if (license) {
      await db.updateLicense(licenseKey, { ...license, active: false });
      console.log(`Subscription canceled, license deactivated: ${licenseKey}`);
    }
  } catch (error) {
    console.error("Error handling subscription cancellation:", error);
  }
}
