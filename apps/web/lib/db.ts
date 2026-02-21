import {
  LicenseEntitlement,
  Subscription,
  Download,
  LicenseLink,
  SubscriptionStatus,
  PlanType,
  EarlyAdopterProgram,
  DEFAULT_THEMES
} from "@themegpt/shared";
import { db as firestore } from "./firebase-admin";

// Firestore collection names
const LICENSES_COLLECTION = 'licenses';
const USERS_COLLECTION = 'users';
const SUBSCRIPTIONS_COLLECTION = 'subscriptions';
const DOWNLOADS_COLLECTION = 'downloads';
const LICENSE_LINKS_COLLECTION = 'license_links';
const EARLY_ADOPTER_COLLECTION = 'early_adopter_program';
const ABANDONED_CHECKOUTS_COLLECTION = 'abandoned_checkouts';
const CHECKOUT_SESSIONS_COLLECTION = 'checkout_sessions';
const REVENUE_EVENTS_COLLECTION = 'revenue_events';
const PROCESSED_EVENTS_COLLECTION = 'processed_webhook_events';
const WEBHOOK_PROCESSING_STALE_MS = 10 * 60 * 1000;

type WebhookEventProcessingState = 'acquired' | 'already_processed' | 'in_progress' | 'error';

function toMillis(value: unknown): number | null {
  if (value instanceof Date) return value.getTime();

  if (value && typeof value === 'object' && 'toDate' in value) {
    const candidate = value as { toDate: () => Date };
    const date = candidate.toDate();
    return date.getTime();
  }

  if (typeof value === 'number') return value;
  return null;
}

// Database Interface
export const db = {
  // === Legacy License Methods ===
  async getLicense(key: string): Promise<LicenseEntitlement | undefined> {
    try {
      const docRef = firestore.collection(LICENSES_COLLECTION).doc(key);
      const docSnap = await docRef.get();

      if (docSnap.exists) {
        return docSnap.data() as LicenseEntitlement;
      } else {
        return undefined;
      }
    } catch (error) {
      console.error("Error fetching license:", error);
      return undefined;
    }
  },

  async createLicense(key: string, entitlement: LicenseEntitlement): Promise<void> {
    try {
      await firestore.collection(LICENSES_COLLECTION).doc(key).set(entitlement);
    } catch (error) {
      console.error("Error creating license:", error);
      throw error;
    }
  },

  async updateLicense(key: string, entitlement: LicenseEntitlement): Promise<boolean> {
    try {
      const docRef = firestore.collection(LICENSES_COLLECTION).doc(key);
      const docSnap = await docRef.get();
      if (!docSnap.exists) {
        return false;
      }

      await docRef.set(entitlement, { merge: true });
      return true;
    } catch (error) {
      console.error("Error updating license:", error);
      return false;
    }
  },

  // === Subscription Methods ===
  async getSubscriptionByUserId(userId: string): Promise<(Subscription & { id: string }) | null> {
    try {
      const snapshot = await firestore
        .collection(SUBSCRIPTIONS_COLLECTION)
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .limit(1)
        .get();

      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      const data = doc.data();
      return {
        id: doc.id,
        userId: data.userId,
        stripeSubscriptionId: data.stripeSubscriptionId,
        stripeCustomerId: data.stripeCustomerId,
        status: data.status as SubscriptionStatus,
        planType: (data.planType as PlanType) || 'monthly',
        currentPeriodStart: data.currentPeriodStart.toDate(),
        currentPeriodEnd: data.currentPeriodEnd.toDate(),
        canceledAt: data.canceledAt?.toDate() || null,
        createdAt: data.createdAt.toDate(),
        trialEndsAt: data.trialEndsAt?.toDate() || null,
        commitmentEndsAt: data.commitmentEndsAt?.toDate() || null,
        isLifetime: data.isLifetime || false,
        earlyAdopterConvertedAt: data.earlyAdopterConvertedAt?.toDate() || null,
      };
    } catch (error) {
      console.error("Error fetching subscription:", error);
      return null;
    }
  },

  async getSubscriptionByStripeId(stripeSubscriptionId: string): Promise<(Subscription & { id: string }) | null> {
    try {
      const snapshot = await firestore
        .collection(SUBSCRIPTIONS_COLLECTION)
        .where('stripeSubscriptionId', '==', stripeSubscriptionId)
        .limit(1)
        .get();

      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      const data = doc.data();
      return {
        id: doc.id,
        userId: data.userId,
        stripeSubscriptionId: data.stripeSubscriptionId,
        stripeCustomerId: data.stripeCustomerId,
        status: data.status as SubscriptionStatus,
        planType: (data.planType as PlanType) || 'monthly',
        currentPeriodStart: data.currentPeriodStart.toDate(),
        currentPeriodEnd: data.currentPeriodEnd.toDate(),
        canceledAt: data.canceledAt?.toDate() || null,
        createdAt: data.createdAt.toDate(),
        trialEndsAt: data.trialEndsAt?.toDate() || null,
        commitmentEndsAt: data.commitmentEndsAt?.toDate() || null,
        isLifetime: data.isLifetime || false,
        earlyAdopterConvertedAt: data.earlyAdopterConvertedAt?.toDate() || null,
      };
    } catch (error) {
      console.error("Error fetching subscription by Stripe ID:", error);
      return null;
    }
  },

  async createSubscription(subscription: Omit<Subscription, 'canceledAt' | 'createdAt' | 'isLifetime' | 'earlyAdopterConvertedAt'> & { isLifetime?: boolean }): Promise<string> {
    try {
      const docRef = await firestore.collection(SUBSCRIPTIONS_COLLECTION).add({
        ...subscription,
        canceledAt: null,
        createdAt: new Date(),
        isLifetime: subscription.isLifetime || false,
        earlyAdopterConvertedAt: null,
      });
      return docRef.id;
    } catch (error) {
      console.error("Error creating subscription:", error);
      throw error;
    }
  },

  async updateSubscription(subscriptionId: string, updates: Partial<Subscription>): Promise<boolean> {
    try {
      await firestore
        .collection(SUBSCRIPTIONS_COLLECTION)
        .doc(subscriptionId)
        .update(updates);
      return true;
    } catch (error) {
      console.error("Error updating subscription:", error);
      return false;
    }
  },

  async updateBillingPeriod(subscriptionId: string, newPeriodStart: Date, newPeriodEnd: Date): Promise<boolean> {
    try {
      await firestore
        .collection(SUBSCRIPTIONS_COLLECTION)
        .doc(subscriptionId)
        .update({
          currentPeriodStart: newPeriodStart,
          currentPeriodEnd: newPeriodEnd,
          status: 'active',
        });
      return true;
    } catch (error) {
      console.error("Error updating billing period:", error);
      return false;
    }
  },

  // === Download Methods (for audit/history purposes) ===
  async recordDownload(download: Omit<Download, 'downloadedAt' | 'billingPeriod'>): Promise<string> {
    try {
      const docRef = await firestore.collection(DOWNLOADS_COLLECTION).add({
        ...download,
        downloadedAt: new Date(),
        billingPeriod: '', // Deprecated: kept for schema compatibility
      });
      return docRef.id;
    } catch (error) {
      console.error("Error recording download:", error);
      throw error;
    }
  },

  async getDownloadHistory(userId: string, limit: number = 50): Promise<Download[]> {
    try {
      const snapshot = await firestore
        .collection(DOWNLOADS_COLLECTION)
        .where('userId', '==', userId)
        .orderBy('downloadedAt', 'desc')
        .limit(limit)
        .get();

      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          userId: data.userId,
          subscriptionId: data.subscriptionId,
          themeId: data.themeId,
          downloadedAt: data.downloadedAt.toDate(),
          billingPeriod: data.billingPeriod || '',
        };
      });
    } catch (error) {
      console.error("Error fetching download history:", error);
      return [];
    }
  },

  async hasDownloadedTheme(userId: string, themeId: string): Promise<boolean> {
    try {
      const snapshot = await firestore
        .collection(DOWNLOADS_COLLECTION)
        .where('userId', '==', userId)
        .where('themeId', '==', themeId)
        .limit(1)
        .get();

      return !snapshot.empty;
    } catch (error) {
      console.error("Error checking download:", error);
      return false;
    }
  },

  // === License Link Methods ===
  async getLicenseLink(licenseKey: string): Promise<LicenseLink | null> {
    try {
      const docRef = firestore.collection(LICENSE_LINKS_COLLECTION).doc(licenseKey);
      const doc = await docRef.get();

      if (!doc.exists) {
        return null;
      }

      const data = doc.data();
      return {
        userId: data?.userId || null,
        linkedAt: data?.linkedAt?.toDate() || null,
      };
    } catch (error) {
      console.error("Error fetching license link:", error);
      return null;
    }
  },

  async linkLicenseToUser(licenseKey: string, userId: string): Promise<boolean> {
    try {
      await firestore.collection(LICENSE_LINKS_COLLECTION).doc(licenseKey).set({
        userId,
        linkedAt: new Date(),
      });
      return true;
    } catch (error) {
      console.error("Error linking license:", error);
      return false;
    }
  },

  async getUserIdByLicense(licenseKey: string): Promise<string | null> {
    try {
      const link = await this.getLicenseLink(licenseKey);
      return link?.userId || null;
    } catch (error) {
      console.error("Error getting user by license:", error);
      return null;
    }
  },

  // === User Methods ===
  async getUserByEmail(email: string): Promise<{ id: string; email: string } | null> {
    try {
      const snapshot = await firestore
        .collection(USERS_COLLECTION)
        .where('email', '==', email)
        .limit(1)
        .get();

      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      return {
        id: doc.id,
        email: doc.data().email,
      };
    } catch (error) {
      console.error("Error fetching user:", error);
      return null;
    }
  },

  async getUserById(userId: string): Promise<{ id: string; email: string } | null> {
    try {
      const doc = await firestore.collection(USERS_COLLECTION).doc(userId).get();
      if (!doc.exists) {
        return null;
      }

      const data = doc.data();
      const email = data?.email;
      if (typeof email !== 'string' || !email) {
        return null;
      }

      return { id: doc.id, email };
    } catch (error) {
      console.error("Error fetching user by id:", error);
      return null;
    }
  },

  async getAbandonedCheckoutBySessionId(sessionId: string): Promise<{
    reminderAttemptedAt?: Date | null;
    reminderSentAt?: Date | null;
  } | null> {
    try {
      const doc = await firestore.collection(ABANDONED_CHECKOUTS_COLLECTION).doc(sessionId).get();
      if (!doc.exists) {
        return null;
      }

      const data = doc.data();
      return {
        reminderAttemptedAt: data?.reminderAttemptedAt?.toDate?.() || null,
        reminderSentAt: data?.reminderSentAt?.toDate?.() || null,
      };
    } catch (error) {
      console.error("Error fetching abandoned checkout:", error);
      return null;
    }
  },

  async upsertAbandonedCheckout(sessionId: string, payload: Record<string, unknown>): Promise<boolean> {
    try {
      const ref = firestore.collection(ABANDONED_CHECKOUTS_COLLECTION).doc(sessionId);
      const existing = await ref.get();

      if (existing.exists) {
        await ref.set(
          {
            ...payload,
            updatedAt: new Date(),
          },
          { merge: true }
        );
      } else {
        await ref.set({
          ...payload,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }

      return true;
    } catch (error) {
      console.error("Error upserting abandoned checkout:", error);
      return false;
    }
  },

  async upsertCheckoutSession(sessionId: string, payload: Record<string, unknown>): Promise<boolean> {
    try {
      const ref = firestore.collection(CHECKOUT_SESSIONS_COLLECTION).doc(sessionId);
      const existing = await ref.get();

      if (existing.exists) {
        await ref.set(
          {
            ...payload,
            updatedAt: new Date(),
          },
          { merge: true }
        );
      } else {
        await ref.set({
          ...payload,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }

      return true;
    } catch (error) {
      console.error("Error upserting checkout session:", error);
      return false;
    }
  },

  async upsertRevenueEvent(eventId: string, payload: Record<string, unknown>): Promise<boolean> {
    try {
      await firestore.collection(REVENUE_EVENTS_COLLECTION).doc(eventId).set(
        {
          ...payload,
          updatedAt: new Date(),
        },
        { merge: true }
      );
      return true;
    } catch (error) {
      console.error("Error upserting revenue event:", error);
      return false;
    }
  },

  async getMonetizationSummary(days: number = 7): Promise<{
    windowDays: number;
    windowStart: string;
    windowEnd: string;
    totals: {
      checkoutCreated: number;
      checkoutCompleted: number;
      checkoutExpired: number;
      oneTimeRevenueCents: number;
      subscriptionRevenueCents: number;
      totalRevenueCents: number;
      paidEvents: number;
    };
    byChannel: Array<{
      channel: string;
      utmSource: string;
      utmMedium: string;
      utmCampaign: string;
      checkoutCreated: number;
      checkoutCompleted: number;
      checkoutExpired: number;
      oneTimeRevenueCents: number;
      subscriptionRevenueCents: number;
      totalRevenueCents: number;
      paidEvents: number;
    }>;
  }> {
    const safeDays = Number.isFinite(days) ? Math.min(Math.max(Math.floor(days), 1), 90) : 7;
    const now = new Date();
    const since = new Date(now.getTime() - safeDays * 24 * 60 * 60 * 1000);

    const channelIndex = new Map<string, {
      channel: string;
      utmSource: string;
      utmMedium: string;
      utmCampaign: string;
      checkoutCreated: number;
      checkoutCompleted: number;
      checkoutExpired: number;
      oneTimeRevenueCents: number;
      subscriptionRevenueCents: number;
      totalRevenueCents: number;
      paidEvents: number;
    }>();

    const getChannelBucket = (
      rawSource: unknown,
      rawMedium: unknown,
      rawCampaign: unknown
    ) => {
      const utmSource = typeof rawSource === 'string' && rawSource ? rawSource : '(direct)';
      const utmMedium = typeof rawMedium === 'string' && rawMedium ? rawMedium : '(none)';
      const utmCampaign = typeof rawCampaign === 'string' && rawCampaign ? rawCampaign : '(none)';
      const channel = `${utmSource} / ${utmMedium} / ${utmCampaign}`;

      if (!channelIndex.has(channel)) {
        channelIndex.set(channel, {
          channel,
          utmSource,
          utmMedium,
          utmCampaign,
          checkoutCreated: 0,
          checkoutCompleted: 0,
          checkoutExpired: 0,
          oneTimeRevenueCents: 0,
          subscriptionRevenueCents: 0,
          totalRevenueCents: 0,
          paidEvents: 0,
        });
      }

      return channelIndex.get(channel)!;
    };

    const totals = {
      checkoutCreated: 0,
      checkoutCompleted: 0,
      checkoutExpired: 0,
      oneTimeRevenueCents: 0,
      subscriptionRevenueCents: 0,
      totalRevenueCents: 0,
      paidEvents: 0,
    };

    try {
      const checkoutSnapshot = await firestore
        .collection(CHECKOUT_SESSIONS_COLLECTION)
        .where('checkoutCreatedAt', '>=', since)
        .get();

      for (const doc of checkoutSnapshot.docs) {
        const data = doc.data();
        const sessionStatus = data.sessionStatus;
        const amount = typeof data.amountTotalCents === 'number' ? data.amountTotalCents : 0;
        const mode = data.mode;

        totals.checkoutCreated += 1;
        const bucket = getChannelBucket(data.utmSource, data.utmMedium, data.utmCampaign);
        bucket.checkoutCreated += 1;

        if (sessionStatus === 'completed') {
          totals.checkoutCompleted += 1;
          bucket.checkoutCompleted += 1;
        } else if (sessionStatus === 'expired') {
          totals.checkoutExpired += 1;
          bucket.checkoutExpired += 1;
        }

        if (sessionStatus === 'completed' && mode === 'payment' && amount > 0) {
          totals.oneTimeRevenueCents += amount;
          bucket.oneTimeRevenueCents += amount;
        }
      }

      const revenueSnapshot = await firestore
        .collection(REVENUE_EVENTS_COLLECTION)
        .where('paidAt', '>=', since)
        .get();

      for (const doc of revenueSnapshot.docs) {
        const data = doc.data();
        const amount = typeof data.amountPaidCents === 'number' ? data.amountPaidCents : 0;
        if (amount <= 0) continue;

        totals.subscriptionRevenueCents += amount;
        totals.paidEvents += 1;

        const bucket = getChannelBucket(data.utmSource, data.utmMedium, data.utmCampaign);
        bucket.subscriptionRevenueCents += amount;
        bucket.paidEvents += 1;
      }
    } catch (error) {
      console.error("Error fetching monetization summary:", error);
    }

    totals.totalRevenueCents = totals.oneTimeRevenueCents + totals.subscriptionRevenueCents;

    const byChannel = Array.from(channelIndex.values())
      .map((item) => ({
        ...item,
        totalRevenueCents: item.oneTimeRevenueCents + item.subscriptionRevenueCents,
      }))
      .sort((a, b) => b.totalRevenueCents - a.totalRevenueCents);

    return {
      windowDays: safeDays,
      windowStart: since.toISOString(),
      windowEnd: now.toISOString(),
      totals,
      byChannel,
    };
  },

  // === Utility Methods ===
  getThemeName(themeId: string): string {
    const theme = DEFAULT_THEMES.find(t => t.id === themeId);
    return theme?.name || themeId;
  },

  // === Early Adopter Program Methods ===
  async getEarlyAdopterProgram(): Promise<EarlyAdopterProgram | null> {
    try {
      const doc = await firestore.collection(EARLY_ADOPTER_COLLECTION).doc('config').get();
      if (!doc.exists) {
        return null;
      }
      const data = doc.data();
      return {
        launchDate: data?.launchDate?.toDate(),
        maxSlots: data?.maxSlots || 60,
        usedSlots: data?.usedSlots || 0,
        cutoffDate: data?.cutoffDate?.toDate(),
        isActive: data?.isActive ?? true,
      };
    } catch (error) {
      console.error("Error fetching early adopter program:", error);
      return null;
    }
  },

  async initializeEarlyAdopterProgram(launchDate: Date, maxSlots: number = 60, windowDays: number = 60): Promise<void> {
    try {
      const cutoffDate = new Date(launchDate);
      cutoffDate.setDate(cutoffDate.getDate() + windowDays);

      await firestore.collection(EARLY_ADOPTER_COLLECTION).doc('config').set({
        launchDate,
        maxSlots,
        usedSlots: 0,
        cutoffDate,
        isActive: true,
      });
    } catch (error) {
      console.error("Error initializing early adopter program:", error);
      throw error;
    }
  },

  async isEarlyAdopterEligible(): Promise<boolean> {
    try {
      const program = await this.getEarlyAdopterProgram();
      if (!program || !program.isActive) {
        return false;
      }

      const now = new Date();
      const withinWindow = now <= program.cutoffDate;
      const slotsAvailable = program.usedSlots < program.maxSlots;

      return withinWindow && slotsAvailable;
    } catch (error) {
      console.error("Error checking early adopter eligibility:", error);
      return false;
    }
  },

  async claimEarlyAdopterSlot(): Promise<boolean> {
    try {
      const configRef = firestore.collection(EARLY_ADOPTER_COLLECTION).doc('config');

      // Use transaction to safely increment the slot count
      const result = await firestore.runTransaction(async (transaction) => {
        const doc = await transaction.get(configRef);
        if (!doc.exists) {
          return false;
        }

        const data = doc.data();
        const currentSlots = data?.usedSlots || 0;
        const maxSlots = data?.maxSlots || 60;
        const isActive = data?.isActive ?? true;
        const cutoffDate = data?.cutoffDate?.toDate();

        // Check if still eligible
        if (!isActive || currentSlots >= maxSlots || (cutoffDate && new Date() > cutoffDate)) {
          return false;
        }

        transaction.update(configRef, {
          usedSlots: currentSlots + 1,
          // Auto-deactivate if this was the last slot
          isActive: currentSlots + 1 < maxSlots,
        });

        return true;
      });

      return result;
    } catch (error) {
      console.error("Error claiming early adopter slot:", error);
      return false;
    }
  },

  async convertToLifetime(subscriptionId: string): Promise<boolean> {
    try {
      await firestore
        .collection(SUBSCRIPTIONS_COLLECTION)
        .doc(subscriptionId)
        .update({
          isLifetime: true,
          planType: 'lifetime',
          earlyAdopterConvertedAt: new Date(),
        });
      return true;
    } catch (error) {
      console.error("Error converting to lifetime:", error);
      return false;
    }
  },

  /**
   * Release an early adopter slot (decrement usedSlots).
   * Used to roll back a claimed slot when convertToLifetime() fails.
   */
  async releaseEarlyAdopterSlot(): Promise<boolean> {
    try {
      const configRef = firestore.collection(EARLY_ADOPTER_COLLECTION).doc('config');

      const result = await firestore.runTransaction(async (transaction) => {
        const doc = await transaction.get(configRef);
        if (!doc.exists) {
          return false;
        }

        const data = doc.data();
        const currentSlots = data?.usedSlots || 0;
        if (currentSlots <= 0) {
          return false;
        }

        transaction.update(configRef, {
          usedSlots: currentSlots - 1,
          isActive: true, // Re-activate since a slot freed up
        });

        return true;
      });

      return result;
    } catch (error) {
      console.error("Error releasing early adopter slot:", error);
      return false;
    }
  },

  async getEarlyAdopterCount(): Promise<number> {
    try {
      const program = await this.getEarlyAdopterProgram();
      return program?.usedSlots || 0;
    } catch (error) {
      console.error("Error getting early adopter count:", error);
      return 0;
    }
  },

  // === Webhook Idempotency Methods ===
  async beginWebhookEventProcessing(
    eventId: string,
    eventType: string
  ): Promise<WebhookEventProcessingState> {
    const ref = firestore.collection(PROCESSED_EVENTS_COLLECTION).doc(eventId);
    try {
      // Atomic create: only one delivery can acquire processing for this event.
      await ref.create({
        eventType,
        status: 'processing',
        processingStartedAt: new Date(),
      });
      return 'acquired';
    } catch (error) {
      const code = (error as { code?: unknown })?.code;
      const isAlreadyExists =
        code === 6 ||
        code === 'already-exists' ||
        (error instanceof Error && error.message.includes('Already exists'));

      if (!isAlreadyExists) {
        console.error("Error acquiring webhook event lock:", error);
        return 'error';
      }

      try {
        const doc = await ref.get();
        const data = doc.data();
        const status = data?.status;
        if (status === 'processed') {
          return 'already_processed';
        }

        if (status === 'processing') {
          const startedAtMs = toMillis(data?.processingStartedAt);
          const isStale = startedAtMs !== null && (Date.now() - startedAtMs) > WEBHOOK_PROCESSING_STALE_MS;

          if (isStale) {
            console.warn(`Reclaiming stale webhook lock for event ${eventId}`);
            await ref.delete();
            await ref.create({
              eventType,
              status: 'processing',
              processingStartedAt: new Date(),
              recoveredAt: new Date(),
            });
            return 'acquired';
          }
        }
      } catch (readError) {
        console.error("Error reading webhook event state:", readError);
        return 'error';
      }

      return 'in_progress';
    }
  },

  async completeWebhookEventProcessing(eventId: string, eventType: string): Promise<void> {
    try {
      await firestore.collection(PROCESSED_EVENTS_COLLECTION).doc(eventId).set(
        {
          eventType,
          status: 'processed',
          processedAt: new Date(),
        },
        { merge: true }
      );
    } catch (error) {
      console.error("Error marking event processed:", error);
    }
  },

  async abandonWebhookEventProcessing(eventId: string): Promise<void> {
    try {
      const ref = firestore.collection(PROCESSED_EVENTS_COLLECTION).doc(eventId);
      const doc = await ref.get();
      if (doc.exists && doc.data()?.status === 'processing') {
        await ref.delete();
      }
    } catch (error) {
      console.error("Error abandoning webhook event lock:", error);
    }
  },
};
