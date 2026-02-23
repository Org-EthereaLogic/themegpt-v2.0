import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { getStripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import {
  sendSubscriptionConfirmationEmail,
  sendCheckoutRecoveryEmail,
  sendThemePurchaseConfirmationEmail,
  sendTrialEndingEmail,
  sendPaymentFailedEmail,
} from "@/lib/email";
import { LicenseEntitlement, PlanType, SubscriptionStatus } from "@themegpt/shared";
import { v4 as uuidv4 } from "uuid";
import Stripe from "stripe";

type AttributionSnapshot = {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  gclid?: string;
  fbclid?: string;
  ttclid?: string;
  landingPath?: string;
  firstSeenAt?: string;
  lastSeenAt?: string;
};

function sanitizeMetadataValue(input: unknown, maxLength = 120): string | undefined {
  if (typeof input !== "string") return undefined;
  const cleaned = input
    .replace(/[\r\n\t]/g, " ")
    .replace(/[^\x20-\x7E]/g, "")
    .trim()
    .slice(0, maxLength);
  return cleaned || undefined;
}

function attributionFromMetadata(metadata?: Stripe.Metadata | null): AttributionSnapshot {
  return {
    utmSource: sanitizeMetadataValue(metadata?.utm_source),
    utmMedium: sanitizeMetadataValue(metadata?.utm_medium),
    utmCampaign: sanitizeMetadataValue(metadata?.utm_campaign),
    utmContent: sanitizeMetadataValue(metadata?.utm_content),
    utmTerm: sanitizeMetadataValue(metadata?.utm_term),
    gclid: sanitizeMetadataValue(metadata?.gclid),
    fbclid: sanitizeMetadataValue(metadata?.fbclid),
    ttclid: sanitizeMetadataValue(metadata?.ttclid),
    landingPath: sanitizeMetadataValue(metadata?.landing_path, 240),
    firstSeenAt: sanitizeMetadataValue(metadata?.first_seen_at),
    lastSeenAt: sanitizeMetadataValue(metadata?.last_seen_at),
  };
}

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

  const processingState = await db.beginWebhookEventProcessing(event.id, event.type);
  if (processingState === "already_processed") {
    console.log(`Skipping already-processed event: ${event.id} (${event.type})`);
    return NextResponse.json({ received: true });
  }
  if (processingState === "error") {
    return NextResponse.json({ error: "Failed to acquire webhook processing lock" }, { status: 500 });
  }
  if (processingState === "in_progress") {
    console.log(`Event already in progress, will retry: ${event.id} (${event.type})`);
    return NextResponse.json({ error: "Event processing already in progress" }, { status: 409 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutComplete(session);
        break;
      }
      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutExpired(session);
        break;
      }
      case "invoice.paid":
      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaid(invoice, event.id);
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
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentFailed(invoice);
        break;
      }
    }
  } catch (error) {
    // Release lock so Stripe retries can process the event again.
    await db.abandonWebhookEventProcessing(event.id);
    console.error(`Webhook processing failed for event ${event.id}:`, error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }

  await db.completeWebhookEventProcessing(event.id, event.type);

  return NextResponse.json({ received: true });
}

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  const { type, themeId, userId, planType } = session.metadata || {};
  const attribution = attributionFromMetadata(session.metadata);
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

      // Calculate trial end date — applies to both monthly and yearly trials.
      // Previously gated on yearly only, which dropped trial countdown for monthly users.
      const trialEndsAt = stripeSubscription.trial_end
        ? new Date(stripeSubscription.trial_end * 1000)
        : null;

      // Calculate commitment end date (12 months from start for yearly)
      const commitmentEndsAt = normalizedPlanType === "yearly"
        ? new Date(currentPeriodStart.getTime() + 365 * 24 * 60 * 60 * 1000)
        : null;

      // NOTE: Early adopter lifetime access is NOT claimed here.
      // Lifetime slots are claimed in handleInvoicePaid after the first
      // paid yearly charge completes, preventing claims before payment.
      const normalizedStatus: SubscriptionStatus =
        stripeSubscription.status === 'trialing'
          ? 'trialing'
          : stripeSubscription.status === 'active'
            ? 'active'
            : stripeSubscription.status === 'past_due'
              ? 'past_due'
              : stripeSubscription.status === 'canceled'
                ? 'canceled'
                : 'expired';

      const subscriptionPayload = {
        userId,
        stripeSubscriptionId: stripeSubscription.id,
        stripeCustomerId: typeof session.customer === 'string' ? session.customer : '',
        status: normalizedStatus,
        planType: normalizedPlanType,
        currentPeriodStart,
        currentPeriodEnd,
        trialEndsAt,
        commitmentEndsAt,
        isLifetime: false,
      } as const;
      const recordId = await db.upsertSubscriptionByStripeId(subscriptionPayload);
      console.log(`Subscription record upserted for user: ${userId} (plan: ${normalizedPlanType}, id: ${recordId})`);
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

  await db.upsertCheckoutSession(session.id, {
    stripeSessionId: session.id,
    userId: userId || null,
    customerId: typeof session.customer === "string" ? session.customer : null,
    customerEmail: session.customer_email || session.customer_details?.email || null,
    stripeSubscriptionId: typeof session.subscription === "string" ? session.subscription : null,
    checkoutType: type || null,
    planType: planType || null,
    themeId: themeId || null,
    sessionStatus: "completed",
    paymentStatus: session.payment_status || null,
    mode: session.mode,
    currency: session.currency || "usd",
    amountTotalCents: session.amount_total ?? null,
    checkoutCreatedAt: new Date(session.created * 1000),
    utmSource: attribution.utmSource || null,
    utmMedium: attribution.utmMedium || null,
    utmCampaign: attribution.utmCampaign || null,
    utmContent: attribution.utmContent || null,
    utmTerm: attribution.utmTerm || null,
    gclid: attribution.gclid || null,
    fbclid: attribution.fbclid || null,
    ttclid: attribution.ttclid || null,
    landingPath: attribution.landingPath || null,
    firstSeenAt: attribution.firstSeenAt || null,
    lastSeenAt: attribution.lastSeenAt || null,
    completedAt: new Date(),
  });

  if (!isSubscription && (session.amount_total ?? 0) > 0 && session.payment_status === "paid") {
    await db.upsertRevenueEvent(`checkout_${session.id}`, {
      sourceType: "checkout_session",
      stripeSessionId: session.id,
      userId: userId || null,
      customerId: typeof session.customer === "string" ? session.customer : null,
      checkoutType: type || "single",
      planType: planType || "single",
      amountPaidCents: session.amount_total ?? 0,
      currency: session.currency || "usd",
      paidAt: new Date(),
      utmSource: attribution.utmSource || null,
      utmMedium: attribution.utmMedium || null,
      utmCampaign: attribution.utmCampaign || null,
      utmContent: attribution.utmContent || null,
      utmTerm: attribution.utmTerm || null,
      gclid: attribution.gclid || null,
      fbclid: attribution.fbclid || null,
      ttclid: attribution.ttclid || null,
      landingPath: attribution.landingPath || null,
      firstSeenAt: attribution.firstSeenAt || null,
      lastSeenAt: attribution.lastSeenAt || null,
    });
  }

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

type CheckoutRecoveryType = "monthly" | "yearly" | "single" | "subscription" | "unknown";

function getCheckoutRecoveryType(rawType: unknown): CheckoutRecoveryType {
  if (rawType === "monthly" || rawType === "yearly" || rawType === "single" || rawType === "subscription") {
    return rawType;
  }
  return "unknown";
}

async function resolveCheckoutEmail(session: Stripe.Checkout.Session): Promise<string | null> {
  if (session.customer_email) {
    return session.customer_email;
  }

  if (session.customer_details?.email) {
    return session.customer_details.email;
  }

  const metadataUserId = session.metadata?.userId;
  if (metadataUserId) {
    const user = await db.getUserById(metadataUserId);
    if (user?.email) {
      return user.email;
    }
  }

  if (typeof session.customer === "string") {
    try {
      const customer = await getStripe().customers.retrieve(session.customer);
      if (!customer.deleted && customer.email) {
        return customer.email;
      }
    } catch (error) {
      console.error(`Failed to resolve customer email for session ${session.id}:`, error);
    }
  }

  return null;
}

async function handleCheckoutExpired(session: Stripe.Checkout.Session) {
  const sessionId = session.id;
  const checkoutType = getCheckoutRecoveryType(session.metadata?.type);
  const attribution = attributionFromMetadata(session.metadata);
  const email = await resolveCheckoutEmail(session);
  const promotionsConsent = session.consent?.promotions || null;
  const recoveryUrl = session.after_expiration?.recovery?.url || null;
  const recoveryExpiresAt = session.after_expiration?.recovery?.expires_at
    ? new Date(session.after_expiration.recovery.expires_at * 1000)
    : null;
  // Treat checkout recovery as transactional lifecycle messaging.
  const reminderEligible = Boolean(email && recoveryUrl);

  const existingRecord = await db.getAbandonedCheckoutBySessionId(sessionId);
  const reminderAlreadyAttempted = Boolean(
    existingRecord?.reminderAttemptedAt || existingRecord?.reminderSentAt
  );

  await db.upsertAbandonedCheckout(sessionId, {
    stripeSessionId: sessionId,
    userId: session.metadata?.userId || null,
    customerId: typeof session.customer === "string" ? session.customer : null,
    customerEmail: email,
    checkoutType,
    planType: session.metadata?.planType || null,
    mode: session.mode,
    sessionStatus: session.status,
    paymentStatus: session.payment_status,
    promotionsConsent,
    recoveryUrl,
    recoveryExpiresAt,
    checkoutCreatedAt: new Date(session.created * 1000),
    checkoutExpiresAt: session.expires_at ? new Date(session.expires_at * 1000) : null,
    abandonedAt: new Date(),
    reminderEligible,
  });

  await db.upsertCheckoutSession(sessionId, {
    stripeSessionId: sessionId,
    userId: session.metadata?.userId || null,
    customerId: typeof session.customer === "string" ? session.customer : null,
    customerEmail: email,
    checkoutType,
    planType: session.metadata?.planType || null,
    sessionStatus: "expired",
    paymentStatus: session.payment_status || null,
    mode: session.mode,
    currency: session.currency || "usd",
    amountTotalCents: session.amount_total ?? null,
    utmSource: attribution.utmSource || null,
    utmMedium: attribution.utmMedium || null,
    utmCampaign: attribution.utmCampaign || null,
    utmContent: attribution.utmContent || null,
    utmTerm: attribution.utmTerm || null,
    gclid: attribution.gclid || null,
    fbclid: attribution.fbclid || null,
    ttclid: attribution.ttclid || null,
    landingPath: attribution.landingPath || null,
    firstSeenAt: attribution.firstSeenAt || null,
    lastSeenAt: attribution.lastSeenAt || null,
    checkoutCreatedAt: new Date(session.created * 1000),
    checkoutExpiredAt: session.expires_at ? new Date(session.expires_at * 1000) : new Date(),
  });

  if (!reminderEligible || reminderAlreadyAttempted || !email || !recoveryUrl) {
    return;
  }

  const reminderResult = await sendCheckoutRecoveryEmail(email, recoveryUrl, checkoutType);
  await db.upsertAbandonedCheckout(sessionId, {
    reminderAttemptedAt: new Date(),
    reminderSentAt: reminderResult.success ? new Date() : null,
    reminderMessageId: reminderResult.messageId || null,
    reminderError: reminderResult.success ? null : reminderResult.error || "Unknown email error",
  });
}

async function handleInvoicePaid(invoice: Stripe.Invoice, eventId: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const invoiceAny = invoice as any;
  const subscriptionId = typeof invoiceAny.subscription === 'string'
    ? invoiceAny.subscription
    : invoiceAny.subscription?.id;

  if (!subscriptionId) {
    return;
  }

  const stripeSubscription = await getStripe().subscriptions.retrieve(
    subscriptionId,
    { expand: ['items.data'] }
  ) as Stripe.Subscription;

  const amountPaid = invoice.amount_paid ?? 0;
  if (amountPaid > 0) {
    const attribution = attributionFromMetadata(stripeSubscription.metadata);
    const paidAtUnix = invoice.status_transitions?.paid_at || invoice.created;
    await db.upsertRevenueEvent(invoice.id || eventId, {
      sourceType: "invoice",
      stripeEventId: eventId,
      stripeInvoiceId: invoice.id,
      stripeSubscriptionId: subscriptionId,
      customerId: typeof invoice.customer === "string" ? invoice.customer : null,
      planType: stripeSubscription.metadata?.planType || null,
      amountPaidCents: amountPaid,
      currency: invoice.currency || "usd",
      paidAt: new Date((paidAtUnix || Math.floor(Date.now() / 1000)) * 1000),
      utmSource: attribution.utmSource || null,
      utmMedium: attribution.utmMedium || null,
      utmCampaign: attribution.utmCampaign || null,
      utmContent: attribution.utmContent || null,
      utmTerm: attribution.utmTerm || null,
      gclid: attribution.gclid || null,
      fbclid: attribution.fbclid || null,
      ttclid: attribution.ttclid || null,
      landingPath: attribution.landingPath || null,
      firstSeenAt: attribution.firstSeenAt || null,
      lastSeenAt: attribution.lastSeenAt || null,
    });
  }

  // Handle first paid invoice for yearly subscriptions — claim early adopter lifetime slot.
  // This ensures lifetime is only granted after a completed payment, not at checkout start.
  if (invoice.billing_reason === 'subscription_create') {
    // Only process if actual payment occurred (not a $0 trial-start invoice)
    if (amountPaid > 0) {
      await handleFirstYearlyPayment(subscriptionId, stripeSubscription);
    }
    return;
  }

  // Process subscription renewals
  const subscription = await db.getSubscriptionByStripeId(subscriptionId);

  if (!subscription) {
    console.log(`No subscription record found for Stripe ID: ${subscriptionId}`);
    return;
  }

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
async function handleFirstYearlyPayment(
  subscriptionId: string,
  existingSubscription?: Stripe.Subscription
) {
  const stripeSubscription = existingSubscription ?? await getStripe().subscriptions.retrieve(
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

  // Sync lifetime status back to Stripe subscription metadata so that routes
  // reading from Stripe (e.g. /api/session, /api/extension/auth) see the correct state.
  try {
    await getStripe().subscriptions.update(subscriptionId, {
      metadata: { isLifetime: "true", planType: "lifetime" },
    });
  } catch (stripeError) {
    // Non-fatal: Firestore is the source of truth. Log and continue.
    console.error(`Failed to sync isLifetime metadata to Stripe for ${subscriptionId}:`, stripeError);
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
    return;
  }

  // Check if cancellation was reversed
  if (!subscription.cancel_at_period_end && dbSubscription.status === 'canceled') {
    await db.updateSubscription(dbSubscription.id, {
      status: 'active',
      canceledAt: null,
    });
    console.log(`Subscription cancellation reversed: ${dbSubscription.id}`);
    return;
  }

  // Sync status changes for past_due / active / trialing transitions
  const stripeStatus = subscription.status;
  if (stripeStatus === 'past_due' && dbSubscription.status !== 'past_due') {
    await db.updateSubscription(dbSubscription.id, { status: 'past_due' });
    console.log(`Subscription marked past_due: ${dbSubscription.id}`);
  } else if (stripeStatus === 'active' && dbSubscription.status !== 'active') {
    // Covers trialing → active (trial converted to paid) and past_due → active (payment recovered)
    await db.updateSubscription(dbSubscription.id, { status: 'active' });
    console.log(`Subscription activated: ${dbSubscription.id} (was: ${dbSubscription.status})`);
  }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const invoiceAny = invoice as any;
  const subscriptionId = typeof invoiceAny.subscription === 'string'
    ? invoiceAny.subscription
    : invoiceAny.subscription?.id;

  if (!subscriptionId) {
    return;
  }

  const dbSubscription = await db.getSubscriptionByStripeId(subscriptionId);
  if (dbSubscription) {
    await db.updateSubscription(dbSubscription.id, { status: 'past_due' });
    console.log(`Subscription set to past_due after payment failure: ${dbSubscription.id}`);
  }

  // Notify the customer to update their payment method
  const customerEmail = typeof invoice.customer_email === 'string'
    ? invoice.customer_email
    : null;

  if (customerEmail) {
    await sendPaymentFailedEmail(customerEmail);
  } else if (typeof invoice.customer === 'string') {
    try {
      const customer = await getStripe().customers.retrieve(invoice.customer);
      if (!customer.deleted && customer.email) {
        await sendPaymentFailedEmail(customer.email);
      }
    } catch (error) {
      console.error(`Failed to retrieve customer for payment failed email:`, error);
    }
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
