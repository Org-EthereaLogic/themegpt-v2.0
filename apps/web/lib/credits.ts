import { db } from "./db";
import { CreditStatus, Subscription } from "@themegpt/shared";

const MAX_CREDITS = 3;

export function getCreditStatus(subscription: Subscription): CreditStatus {
  const now = new Date();
  const isGracePeriod = subscription.status === 'canceled' && now < subscription.currentPeriodEnd;

  return {
    remaining: MAX_CREDITS - subscription.creditsUsed,
    used: subscription.creditsUsed,
    total: MAX_CREDITS,
    resetsAt: subscription.currentPeriodEnd,
    isGracePeriod,
  };
}

export async function canDownloadTheme(
  userId: string,
  themeId: string,
  subscription: Subscription & { id: string }
): Promise<{ allowed: boolean; reason?: string; isRedownload?: boolean }> {
  const now = new Date();

  // Check if subscription is expired
  if (subscription.status === 'expired') {
    return { allowed: false, reason: 'Subscription expired' };
  }

  // Check if past billing period end
  if (now > subscription.currentPeriodEnd && subscription.status !== 'active') {
    return { allowed: false, reason: 'Billing period ended' };
  }

  // Check if user has already downloaded this theme (ever)
  const hasDownloaded = await db.hasDownloadedTheme(userId, themeId);
  if (hasDownloaded) {
    // Allow re-download even in grace period
    return { allowed: true, isRedownload: true };
  }

  // In grace period, only re-downloads are allowed
  if (subscription.status === 'canceled') {
    return { allowed: false, reason: 'New downloads blocked during grace period' };
  }

  // Check credits
  if (subscription.creditsUsed >= MAX_CREDITS) {
    return { allowed: false, reason: 'No credits remaining this period' };
  }

  return { allowed: true, isRedownload: false };
}

export async function consumeCredit(
  userId: string,
  themeId: string,
  subscription: Subscription & { id: string }
): Promise<{ success: boolean; error?: string }> {
  // Verify can download
  const check = await canDownloadTheme(userId, themeId, subscription);

  if (!check.allowed) {
    return { success: false, error: check.reason };
  }

  // If it's a re-download, no credit consumption needed
  if (check.isRedownload) {
    return { success: true };
  }

  // Increment credit usage
  const creditIncremented = await db.incrementCreditsUsed(subscription.id);
  if (!creditIncremented) {
    return { success: false, error: 'Failed to consume credit' };
  }

  // Record the download
  await db.recordDownload({
    userId,
    subscriptionId: subscription.id,
    themeId,
  });

  return { success: true };
}
