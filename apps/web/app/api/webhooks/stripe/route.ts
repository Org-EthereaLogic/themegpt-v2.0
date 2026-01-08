import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { getStripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import {
  sendSubscriptionConfirmationEmail,
  sendThemePurchaseConfirmationEmail,
  sendTrialEndingEmail,
} from "@/lib/email";
import { LicenseEntitlement, PlanType } from "@themegpt/shared";
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
    case "invoice.paid": {
      const invoice = event.data.object as Stripe.Invoice;
      await handleInvoicePaid(invoice);
      break;
    }
    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      await handleSubscriptionUpdated(subscription);
      break;
    }
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      await handleSubscriptionDeleted(subscription);
      break;
    }
    case "customer.subscription.trial_will_end": {
      const subscription = event.data.object as Stripe.Subscription;
      await handleTrialWillEnd(subscription);
      break;
    }
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  const { type, themeId, userId, planType, isEarlyAdopterEligible } = session.metadata || {};
  const licenseKey = `KEY-${uuidv4().substring(0, 8).toUpperCase()}`;

  let entitlement: LicenseEntitlement;

  // Handle subscription types (monthly, yearly, or legacy "subscription")
  const isSubscription = type === "monthly" || type === "yearly" || type === "subscription";

  if (isSubscription) {
    entitlement = {
      active: true,
      type: "subscription",
      maxSlots: 3,
      permanentlyUnlocked: [],
      activeSlotThemes: [],
    };

    // If user is logged in, create subscription record for credit tracking
    if (userId && session.subscription) {
      const stripeSubscription = await getStripe().subscriptions.retrieve(
        session.subscription as string,
        { expand: ['items.data'] }
      ) as Stripe.Subscription;

      // Get billing period from the first subscription item
      const firstItem = stripeSubscription.items?.data?.[0];
      const currentPeriodStart = firstItem?.current_period_start
        ? new Date(firstItem.current_period_start * 1000)
        : new Date();
      const currentPeriodEnd = firstItem?.current_period_end
        ? new Date(firstItem.current_period_end * 1000)
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // Default 30 days

      // Determine plan type (normalize legacy "subscription" to "monthly")
      const normalizedPlanType: PlanType =
        (planType === "yearly" ? "yearly" : "monthly");

      // Calculate trial end date for yearly plans
      const trialEndsAt = normalizedPlanType === "yearly" && stripeSubscription.trial_end
        ? new Date(stripeSubscription.trial_end * 1000)
        : null;

      // Calculate commitment end date (12 months from start for yearly)
      const commitmentEndsAt = normalizedPlanType === "yearly"
        ? new Date(currentPeriodStart.getTime() + 365 * 24 * 60 * 60 * 1000)
        : null;

      // Check if this yearly subscriber should get lifetime access
      let shouldBeLifetime = false;
      if (normalizedPlanType === "yearly" && isEarlyAdopterEligible === "true") {
        shouldBeLifetime = await db.claimEarlyAdopterSlot();
      }

      await db.createSubscription({
        userId,
        stripeSubscriptionId: stripeSubscription.id,
        stripeCustomerId: session.customer as string,
        status: stripeSubscription.status === 'trialing' ? 'trialing' : 'active',
        planType: shouldBeLifetime ? 'lifetime' : normalizedPlanType,
        currentPeriodStart,
        currentPeriodEnd,
        trialEndsAt,
        commitmentEndsAt,
        isLifetime: shouldBeLifetime,
      });

      if (shouldBeLifetime) {
        console.log(`Early adopter lifetime access granted for user: ${userId}`);
      }
      console.log(`Subscription record created for user: ${userId} (plan: ${normalizedPlanType})`);
    }
  } else {
    // Single theme purchase
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

  // Send confirmation email
  const customerEmail = session.customer_email || session.customer_details?.email;
  if (customerEmail) {
    if (isSubscription) {
      // Determine the plan type for email
      const emailPlanType = planType === "yearly"
        ? (await db.getSubscriptionByUserId(userId || ""))?.isLifetime
          ? "lifetime"
          : "yearly"
        : "monthly";
      await sendSubscriptionConfirmationEmail(customerEmail, emailPlanType as "monthly" | "yearly" | "lifetime");
    } else if (themeId) {
      // Single theme purchase
      const themeName = db.getThemeName(themeId);
      await sendThemePurchaseConfirmationEmail(customerEmail, themeName);
    }
  } else {
    console.warn("No customer email found for confirmation email");
  }
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  // Only process subscription renewals (not initial payment)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const invoiceAny = invoice as any;
  const subscriptionId = typeof invoiceAny.subscription === 'string'
    ? invoiceAny.subscription
    : invoiceAny.subscription?.id;

  if (!subscriptionId || invoice.billing_reason === 'subscription_create') {
    return;
  }

  const subscription = await db.getSubscriptionByStripeId(subscriptionId);

  if (!subscription) {
    console.log(`No subscription record found for Stripe ID: ${subscriptionId}`);
    return;
  }

  // Get updated subscription details from Stripe
  const stripeSubscription = await getStripe().subscriptions.retrieve(
    subscriptionId,
    { expand: ['items.data'] }
  ) as Stripe.Subscription;

  // Get billing period from the first subscription item
  const firstItem = stripeSubscription.items?.data?.[0];
  const currentPeriodStart = firstItem?.current_period_start
    ? new Date(firstItem.current_period_start * 1000)
    : new Date();
  const currentPeriodEnd = firstItem?.current_period_end
    ? new Date(firstItem.current_period_end * 1000)
    : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  // Reset credits for the new billing period
  await db.resetCredits(subscription.id, currentPeriodStart, currentPeriodEnd);

  console.log(`Credits reset for subscription: ${subscription.id}`);
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const dbSubscription = await db.getSubscriptionByStripeId(subscription.id);

  if (!dbSubscription) {
    return;
  }

  // Check if subscription was canceled (entering grace period)
  if (subscription.cancel_at_period_end && dbSubscription.status === 'active') {
    await db.updateSubscription(dbSubscription.id, {
      status: 'canceled',
      canceledAt: new Date(),
    });

    console.log(`Subscription entering grace period: ${dbSubscription.id}`);
  }

  // Check if cancellation was reversed
  if (!subscription.cancel_at_period_end && dbSubscription.status === 'canceled') {
    await db.updateSubscription(dbSubscription.id, {
      status: 'active',
      canceledAt: null,
    });

    console.log(`Subscription cancellation reversed: ${dbSubscription.id}`);
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  try {
    // Update subscription record to expired
    const dbSubscription = await db.getSubscriptionByStripeId(subscription.id);
    if (dbSubscription) {
      await db.updateSubscription(dbSubscription.id, {
        status: 'expired',
      });
      console.log(`Subscription expired: ${dbSubscription.id}`);
    }

    // Also deactivate legacy license key
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
    console.error("Error handling subscription deletion:", error);
  }
}

async function handleTrialWillEnd(subscription: Stripe.Subscription) {
  // This event fires 3 days before trial ends
  // Can be used to send reminder emails or perform pre-conversion tasks
  const dbSubscription = await db.getSubscriptionByStripeId(subscription.id);

  if (!dbSubscription) {
    console.log(`No subscription record found for trial ending: ${subscription.id}`);
    return;
  }

  console.log(`Trial ending soon for subscription: ${dbSubscription.id}, user: ${dbSubscription.userId}`);

  // Get customer email from Stripe
  try {
    const customer = await getStripe().customers.retrieve(subscription.customer as string);
    if (!customer.deleted && customer.email) {
      await sendTrialEndingEmail(customer.email, 3);
    }
  } catch (error) {
    console.error("Error sending trial ending email:", error);
  }
}
