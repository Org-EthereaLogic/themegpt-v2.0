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
  const { type, themeId, userId, planType } = session.metadata || {};
  const licenseKey = `KEY-${uuidv4().substring(0, 8).toUpperCase()}`;

  let entitlement: LicenseEntitlement;

  // Handle subscription types (monthly, yearly, or legacy "subscription")
  const isSubscription = type === "monthly" || type === "yearly" || type === "subscription";

  if (isSubscription) {
    // Full premium access model - no slot limits
    entitlement = {
      active: true,
      type: "subscription",
      maxSlots: 0, // Deprecated: full access model
      permanentlyUnlocked: [],
      activeSlotThemes: [],
    };

    // If user is logged in, create subscription record
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

      // NOTE: Early adopter lifetime access is NOT claimed here.
      // Lifetime slots are claimed in handleInvoicePaid after the first
      // paid yearly charge completes, preventing claims before payment.
      await db.createSubscription({
        userId,
        stripeSubscriptionId: stripeSubscription.id,
        stripeCustomerId: session.customer as string,
        status: stripeSubscription.status === 'trialing' ? 'trialing' : 'active',
        planType: normalizedPlanType,
        currentPeriodStart,
        currentPeriodEnd,
        trialEndsAt,
        commitmentEndsAt,
        isLifetime: false,
      });

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
      // At checkout completion, plan is always yearly/monthly (not lifetime yet).
      // Lifetime confirmation email is sent from handleInvoicePaid after slot is claimed.
      const emailPlanType = planType === "yearly" ? "yearly" : "monthly";
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const invoiceAny = invoice as any;
  const subscriptionId = typeof invoiceAny.subscription === 'string'
    ? invoiceAny.subscription
    : invoiceAny.subscription?.id;

  if (!subscriptionId) {
    return;
  }

  // Handle first paid invoice for yearly subscriptions — claim early adopter lifetime slot.
  // This ensures lifetime is only granted after a completed payment, not at checkout start.
  if (invoice.billing_reason === 'subscription_create') {
    // Only process if actual payment occurred (not a $0 trial-start invoice)
    if ((invoice.amount_paid ?? 0) > 0) {
      await handleFirstYearlyPayment(subscriptionId);
    }
    return;
  }

  // Process subscription renewals
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

  // Update billing period for the subscription
  await db.updateBillingPeriod(subscription.id, currentPeriodStart, currentPeriodEnd);

  console.log(`Billing period updated for subscription: ${subscription.id}`);
}

/**
 * Handle the first paid invoice for a yearly subscription.
 * Claims an early adopter lifetime slot if eligible, converting the subscription to lifetime.
 * This runs ONLY after Stripe confirms payment — never during a trial.
 *
 * Handles three edge cases:
 * - Stale metadata: Re-checks slot eligibility live via db.isEarlyAdopterEligible()
 *   instead of trusting the checkout-time flag.
 * - Event ordering: invoice.paid can arrive before checkout.session.completed;
 *   retries with delay if the DB subscription record doesn't exist yet.
 * - Failed conversion: If convertToLifetime() fails after slot is claimed,
 *   releases the slot to prevent leaking.
 */
async function handleFirstYearlyPayment(subscriptionId: string) {
  const stripeSubscription = await getStripe().subscriptions.retrieve(
    subscriptionId,
    { expand: ['items.data'] }
  ) as Stripe.Subscription;

  const planType = stripeSubscription.metadata?.planType;

  // Only yearly plans qualify for early adopter lifetime
  if (planType !== "yearly") {
    return;
  }

  // P1-1 FIX: Re-check eligibility live instead of trusting stale checkout-time metadata.
  // claimEarlyAdopterSlot() does its own atomic check, but we skip the DB lookup
  // and Stripe calls entirely if the program is already closed.
  const eligible = await db.isEarlyAdopterEligible();
  if (!eligible) {
    return;
  }

  // P1-2 FIX: Retry if subscription record hasn't been created yet.
  // invoice.paid can arrive before checkout.session.completed — Stripe does not
  // guarantee event ordering.
  const MAX_RETRIES = 3;
  const RETRY_DELAY_MS = 2000;
  let dbSubscription = await db.getSubscriptionByStripeId(subscriptionId);

  for (let attempt = 1; !dbSubscription && attempt <= MAX_RETRIES; attempt++) {
    console.log(
      `Subscription record not found for ${subscriptionId}, retry ${attempt}/${MAX_RETRIES} in ${RETRY_DELAY_MS}ms`
    );
    await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
    dbSubscription = await db.getSubscriptionByStripeId(subscriptionId);
  }

  if (!dbSubscription) {
    console.error(
      `Subscription record not found after ${MAX_RETRIES} retries for first yearly payment: ${subscriptionId}. ` +
      `Lifetime conversion skipped — manual review required.`
    );
    return;
  }

  // Already lifetime — skip (idempotent)
  if (dbSubscription.isLifetime) {
    return;
  }

  // Attempt to claim an early adopter slot (atomic transaction in Firestore)
  const claimed = await db.claimEarlyAdopterSlot();
  if (!claimed) {
    console.log(`Early adopter slots exhausted; yearly subscription remains standard: ${subscriptionId}`);
    return;
  }

  // P1-3 FIX: Check convertToLifetime result. If it fails, release the slot to prevent leaking.
  const converted = await db.convertToLifetime(dbSubscription.id);
  if (!converted) {
    console.error(`convertToLifetime failed for ${dbSubscription.id} — releasing claimed slot`);
    await db.releaseEarlyAdopterSlot();
    return;
  }

  console.log(`Early adopter lifetime access granted after payment for subscription: ${dbSubscription.id}`);

  // Send upgraded confirmation email
  const customer = await getStripe().customers.retrieve(stripeSubscription.customer as string);
  if (!customer.deleted && customer.email) {
    await sendSubscriptionConfirmationEmail(customer.email, "lifetime");
  }
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
