import { Subscription } from "@themegpt/shared";

/**
 * Check if subscription has full premium access.
 * With the simplified model, active/trialing subscriptions have full access
 * to all premium themes (no credit limits).
 */
export function hasFullAccess(subscription: Subscription): boolean {
  const now = new Date();

  // Lifetime users always have full access
  if (subscription.isLifetime) {
    return true;
  }

  // Active or trialing subscriptions have full access
  if (subscription.status === 'active' || subscription.status === 'trialing') {
    return true;
  }

  // Canceled subscriptions retain access until period end (grace period)
  if (subscription.status === 'canceled' && now < subscription.currentPeriodEnd) {
    return true;
  }

  // Past-due subscriptions retain access during Stripe's Smart Retry window
  if (subscription.status === 'past_due' && now < subscription.currentPeriodEnd) {
    return true;
  }

  return false;
}

/**
 * Check if a user can download a premium theme.
 * With full access model, any active subscriber can download any premium theme.
 */
export async function canDownloadTheme(
  subscription: Subscription & { id: string }
): Promise<{ allowed: boolean; reason?: string }> {
  // Check if subscription is expired
  if (subscription.status === 'expired') {
    return { allowed: false, reason: 'Subscription expired' };
  }

  // Check full access
  if (!hasFullAccess(subscription)) {
    return { allowed: false, reason: 'No active subscription' };
  }

  return { allowed: true };
}
