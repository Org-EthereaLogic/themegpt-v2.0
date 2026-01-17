      492 +  userId: string | null;
      493 +  linkedAt: Date | null;
      494 +}
      495 +
      496 +export interface CreditStatus {
      497 +  remaining: number;
      498 +  used: number;
      499 +  total: number;
      500 +  resetsAt: Date;
      501 +  isGracePeriod: boolean;
      502 +}
      503 +
      504 +export interface DownloadHistoryItem {
      505 +  themeId: string;
      506 +  themeName: string;
      507 +  downloadedAt: Date;
      508 +  billingPeriod: string;
      509 +}
      510 +
      511 +export interface SubscriptionResponse {
      512 +  status: SubscriptionStatus;
      513 +  credits: CreditStatus;
      514 +  gracePeriodEnds?: Date;
      515 +}
      516 +
      517  const globalLocation =
      518    typeof globalThis !== 'undefined'
      519      ? (globalThis as { location?: { hostname?: string } }).location

⏺ Bash(cd /Users/etherealogic/Dev/themegpt-v2.0 && pnpm --filter @themegpt/shared build) timeout: 30s
  ⎿  > @themegpt/shared@2.0.0 build /Users/etherealogic/Dev/themegpt-v2.0/packages/shared
     > tsc

⏺ Now let me extend db.ts with the new collection methods:

⏺ Update(apps/web/lib/db.ts)
  ⎿  Added 307 lines, removed 6 lines
       1 -import { LicenseEntitlement } from "@themegpt/shared";
       1 +import {
       2 +  LicenseEntitlement,
       3 +  Subscription,
       4 +  Download,
       5 +  LicenseLink,
       6 +  SubscriptionStatus,
       7 +  DEFAULT_THEMES
       8 +} from "@themegpt/shared";
       9  import { db as firestore } from "./firebase-admin";
      10
       4 -// Firestore collection name
      11 +// Firestore collection names
      12  const LICENSES_COLLECTION = 'licenses';
      13 +const USERS_COLLECTION = 'users';
      14 +const SUBSCRIPTIONS_COLLECTION = 'subscriptions';
      15 +const DOWNLOADS_COLLECTION = 'downloads';
      16 +const LICENSE_LINKS_COLLECTION = 'license_links';
      17
      18 +// Helper to get current billing period string (YYYY-MM)
      19 +function getCurrentBillingPeriod(): string {
      20 +  const now = new Date();
      21 +  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      22 +}
      23 +
      24  // Database Interface
      25  export const db = {
      26 +  // === Legacy License Methods ===
      27    async getLicense(key: string): Promise<LicenseEntitlement | undefined> {
      28      try {
      29        const docRef = firestore.collection(LICENSES_COLLECTION).doc(key);
     ...
       52    async updateLicense(key: string, entitlement: LicenseEntitlement): Promise<boolean> {
       53      try {
       54        const docRef = firestore.collection(LICENSES_COLLECTION).doc(key);
       37 -      // Check existence first or just use set/update. Update fails if doc doesn't exist.
       38 -      // The original mock behavior: "if (this.licenses.has(key))"
       55        const docSnap = await docRef.get();
       56        if (!docSnap.exists) {
       57          return false;
       58        }
       43 -
       59 +
       60        await docRef.set(entitlement, { merge: true });
       61        return true;
       62      } catch (error) {
       63        console.error("Error updating license:", error);
       64        return false;
       65      }
       50 -  }
       66 +  },
       67 +
       68 +  // === Subscription Methods ===
       69 +  async getSubscriptionByUserId(userId: string): Promise<(Subscription & { id: string }) | null> {
       70 +    try {
       71 +      const snapshot = await firestore
       72 +        .collection(SUBSCRIPTIONS_COLLECTION)
       73 +        .where('userId', '==', userId)
       74 +        .orderBy('createdAt', 'desc')
       75 +        .limit(1)
       76 +        .get();
       77 +
       78 +      if (snapshot.empty) {
       79 +        return null;
       80 +      }
       81 +
       82 +      const doc = snapshot.docs[0];
       83 +      const data = doc.data();
       84 +      return {
       85 +        id: doc.id,
       86 +        userId: data.userId,
       87 +        stripeSubscriptionId: data.stripeSubscriptionId,
       88 +        stripeCustomerId: data.stripeCustomerId,
       89 +        status: data.status as SubscriptionStatus,
       90 +        currentPeriodStart: data.currentPeriodStart.toDate(),
       91 +        currentPeriodEnd: data.currentPeriodEnd.toDate(),
       92 +        creditsUsed: data.creditsUsed || 0,
       93 +        canceledAt: data.canceledAt?.toDate() || null,
       94 +        createdAt: data.createdAt.toDate(),
       95 +      };
       96 +    } catch (error) {
       97 +      console.error("Error fetching subscription:", error);
       98 +      return null;
       99 +    }
      100 +  },
      101 +
      102 +  async getSubscriptionByStripeId(stripeSubscriptionId: string): Promise<(Subscription & { id: string }) | null> {
      103 +    try {
      104 +      const snapshot = await firestore
      105 +        .collection(SUBSCRIPTIONS_COLLECTION)
      106 +        .where('stripeSubscriptionId', '==', stripeSubscriptionId)
      107 +        .limit(1)
      108 +        .get();
      109 +
      110 +      if (snapshot.empty) {
      111 +        return null;
      112 +      }
      113 +
      114 +      const doc = snapshot.docs[0];
      115 +      const data = doc.data();
      116 +      return {
      117 +        id: doc.id,
      118 +        userId: data.userId,
      119 +        stripeSubscriptionId: data.stripeSubscriptionId,
      120 +        stripeCustomerId: data.stripeCustomerId,
      121 +        status: data.status as SubscriptionStatus,
      122 +        currentPeriodStart: data.currentPeriodStart.toDate(),
      123 +        currentPeriodEnd: data.currentPeriodEnd.toDate(),
      124 +        creditsUsed: data.creditsUsed || 0,
      125 +        canceledAt: data.canceledAt?.toDate() || null,
      126 +        createdAt: data.createdAt.toDate(),
      127 +      };
      128 +    } catch (error) {
      129 +      console.error("Error fetching subscription by Stripe ID:", error);
      130 +      return null;
      131 +    }
      132 +  },
      133 +
      134 +  async createSubscription(subscription: Omit<Subscription, 'creditsUsed' | 'canceledAt' | 'createdAt'>): Promise<string> {
      135 +    try {
      136 +      const docRef = await firestore.collection(SUBSCRIPTIONS_COLLECTION).add({
      137 +        ...subscription,
      138 +        creditsUsed: 0,
      139 +        canceledAt: null,
      140 +        createdAt: new Date(),
      141 +      });
      142 +      return docRef.id;
      143 +    } catch (error) {
      144 +      console.error("Error creating subscription:", error);
      145 +      throw error;
      146 +    }
      147 +  },
      148 +
      149 +  async updateSubscription(subscriptionId: string, updates: Partial<Subscription>): Promise<boolean> {
      150 +    try {
      151 +      await firestore
      152 +        .collection(SUBSCRIPTIONS_COLLECTION)
      153 +        .doc(subscriptionId)
      154 +        .update(updates);
      155 +      return true;
      156 +    } catch (error) {
      157 +      console.error("Error updating subscription:", error);
      158 +      return false;
      159 +    }
      160 +  },
      161 +
      162 +  async resetCredits(subscriptionId: string, newPeriodStart: Date, newPeriodEnd: Date): Promise<boolean> {
      163 +    try {
      164 +      await firestore
      165 +        .collection(SUBSCRIPTIONS_COLLECTION)
      166 +        .doc(subscriptionId)
      167 +        .update({
      168 +          creditsUsed: 0,
      169 +          currentPeriodStart: newPeriodStart,
      170 +          currentPeriodEnd: newPeriodEnd,
      171 +          status: 'active',
      172 +        });
      173 +      return true;
      174 +    } catch (error) {
      175 +      console.error("Error resetting credits:", error);
      176 +      return false;
      177 +    }
      178 +  },
      179 +
      180 +  async incrementCreditsUsed(subscriptionId: string): Promise<boolean> {
      181 +    try {
      182 +      const docRef = firestore.collection(SUBSCRIPTIONS_COLLECTION).doc(subscriptionId);
      183 +      const doc = await docRef.get();
      184 +
      185 +      if (!doc.exists) {
      186 +        return false;
      187 +      }
      188 +
      189 +      const data = doc.data();
      190 +      const currentCredits = data?.creditsUsed || 0;
      191 +
      192 +      if (currentCredits >= 3) {
      193 +        return false; // No credits remaining
      194 +      }
      195 +
      196 +      await docRef.update({
      197 +        creditsUsed: currentCredits + 1,
      198 +      });
      199 +      return true;
      200 +    } catch (error) {
      201 +      console.error("Error incrementing credits:", error);
      202 +      return false;
      203 +    }
      204 +  },
      205 +
      206 +  // === Download Methods ===
      207 +  async recordDownload(download: Omit<Download, 'downloadedAt' | 'billingPeriod'>): Promise<string> {
      208 +    try {
      209 +      const docRef = await firestore.collection(DOWNLOADS_COLLECTION).add({
      210 +        ...download,
      211 +        downloadedAt: new Date(),
      212 +        billingPeriod: getCurrentBillingPeriod(),
      213 +      });
      214 +      return docRef.id;
      215 +    } catch (error) {
      216 +      console.error("Error recording download:", error);
      217 +      throw error;
      218 +    }
      219 +  },
      220 +
      221 +  async getDownloadHistory(userId: string, limit: number = 50): Promise<Download[]> {
      222 +    try {
      223 +      const snapshot = await firestore
      224 +        .collection(DOWNLOADS_COLLECTION)
      225 +        .where('userId', '==', userId)
      226 +        .orderBy('downloadedAt', 'desc')
      227 +        .limit(limit)
      228 +        .get();
      229 +
      230 +      return snapshot.docs.map(doc => {
      231 +        const data = doc.data();
      232 +        return {
      233 +          userId: data.userId,
      234 +          subscriptionId: data.subscriptionId,
      235 +          themeId: data.themeId,
      236 +          downloadedAt: data.downloadedAt.toDate(),
      237 +          billingPeriod: data.billingPeriod,
      238 +        };
      239 +      });
      240 +    } catch (error) {
      241 +      console.error("Error fetching download history:", error);
      242 +      return [];
      243 +    }
      244 +  },
      245 +
      246 +  async hasDownloadedTheme(userId: string, themeId: string): Promise<boolean> {
      247 +    try {
      248 +      const snapshot = await firestore
      249 +        .collection(DOWNLOADS_COLLECTION)
      250 +        .where('userId', '==', userId)
      251 +        .where('themeId', '==', themeId)
      252 +        .limit(1)
      253 +        .get();
      254 +
      255 +      return !snapshot.empty;
      256 +    } catch (error) {
      257 +      console.error("Error checking download:", error);
      258 +      return false;
      259 +    }
      260 +  },
      261 +
      262 +  async hasDownloadedThemeInPeriod(userId: string, themeId: string, billingPeriod: string): Promise<boolean> {
      263 +    try {
      264 +      const snapshot = await firestore
      265 +        .collection(DOWNLOADS_COLLECTION)
      266 +        .where('userId', '==', userId)
      267 +        .where('themeId', '==', themeId)
      268 +        .where('billingPeriod', '==', billingPeriod)
      269 +        .limit(1)
      270 +        .get();
      271 +
      272 +      return !snapshot.empty;
      273 +    } catch (error) {
      274 +      console.error("Error checking download in period:", error);
      275 +      return false;
      276 +    }
      277 +  },
      278 +
      279 +  // === License Link Methods ===
      280 +  async getLicenseLink(licenseKey: string): Promise<LicenseLink | null> {
      281 +    try {
      282 +      const docRef = firestore.collection(LICENSE_LINKS_COLLECTION).doc(licenseKey);
      283 +      const doc = await docRef.get();
      284 +
      285 +      if (!doc.exists) {
      286 +        return null;
      287 +      }
      288 +
      289 +      const data = doc.data();
      290 +      return {
      291 +        userId: data?.userId || null,
      292 +        linkedAt: data?.linkedAt?.toDate() || null,
      293 +      };
      294 +    } catch (error) {
      295 +      console.error("Error fetching license link:", error);
      296 +      return null;
      297 +    }
      298 +  },
      299 +
      300 +  async linkLicenseToUser(licenseKey: string, userId: string): Promise<boolean> {
      301 +    try {
      302 +      await firestore.collection(LICENSE_LINKS_COLLECTION).doc(licenseKey).set({
      303 +        userId,
      304 +        linkedAt: new Date(),
      305 +      });
      306 +      return true;
      307 +    } catch (error) {
      308 +      console.error("Error linking license:", error);
      309 +      return false;
      310 +    }
      311 +  },
      312 +
      313 +  async getUserIdByLicense(licenseKey: string): Promise<string | null> {
      314 +    try {
      315 +      const link = await this.getLicenseLink(licenseKey);
      316 +      return link?.userId || null;
      317 +    } catch (error) {
      318 +      console.error("Error getting user by license:", error);
      319 +      return null;
      320 +    }
      321 +  },
      322 +
      323 +  // === User Methods ===
      324 +  async getUserByEmail(email: string): Promise<{ id: string; email: string } | null> {
      325 +    try {
      326 +      const snapshot = await firestore
      327 +        .collection(USERS_COLLECTION)
      328 +        .where('email', '==', email)
      329 +        .limit(1)
      330 +        .get();
      331 +
      332 +      if (snapshot.empty) {
      333 +        return null;
      334 +      }
      335 +
      336 +      const doc = snapshot.docs[0];
      337 +      return {
      338 +        id: doc.id,
      339 +        email: doc.data().email,
      340 +      };
      341 +    } catch (error) {
      342 +      console.error("Error fetching user:", error);
      343 +      return null;
      344 +    }
      345 +  },
      346 +
      347 +  // === Utility Methods ===
      348 +  getThemeName(themeId: string): string {
      349 +    const theme = DEFAULT_THEMES.find(t => t.id === themeId);
      350 +    return theme?.name || themeId;
      351 +  },
      352  };

⏺ Write(apps/web/lib/credits.ts)
  ⎿  Wrote 88 lines to apps/web/lib/credits.ts
      1 import { db } from "./db";
      2 import { CreditStatus, Subscription } from "@themegpt/shared";
      3 const MAX_CREDITS = 3;
      4 export function getCreditStatus(subscription: Subscription): CreditStatus {
      5   const now = new Date();
      6   const isGracePeriod = subscription.status === 'canceled' && now < subscription.currentPeriodEnd;
      7   return {
     … +78 lines (ctrl+o to expand)

⏺ Bash(mkdir -p /Users/etherealogic/Dev/themegpt-v2.0/apps/web/app/api/subscription/credits
      /Users/etherealogic/Dev/themegpt-v2.0/apps/web/app/api/download/history /Us…)
  ⎿  (No content)

⏺ Write(apps/web/app/api/subscription/route.ts)
  ⎿  Wrote 45 lines to apps/web/app/api/subscription/route.ts
      1 import { NextResponse } from "next/server";
      2 import { getServerSession } from "next-auth";
      3 import { authOptions } from "@/lib/auth";
      4 import { db } from "@/lib/db";
      5 import { getCreditStatus } from "@/lib/credits";
      6 import { SubscriptionResponse } from "@themegpt/shared";
      7 export async function GET() {
      8   try {
      9     const session = await getServerSession(authOptions);
     … +35 lines (ctrl+o to expand)

⏺ Write(apps/web/app/api/subscription/credits/route.ts)
  ⎿  Wrote 38 lines to apps/web/app/api/subscription/credits/route.ts
      1 import { NextResponse } from "next/server";
      2 import { getServerSession } from "next-auth";
      3 import { authOptions } from "@/lib/auth";
      4 import { db } from "@/lib/db";
      5 import { getCreditStatus } from "@/lib/credits";
      6 export async function GET() {
      7   try {
      8     const session = await getServerSession(authOptions);
     … +28 lines (ctrl+o to expand)

⏺ Write(apps/web/app/api/download/route.ts)
  ⎿  Wrote 82 lines to apps/web/app/api/download/route.ts
      1 import { NextRequest, NextResponse } from "next/server";
      2 import { getServerSession } from "next-auth";
      3 import { authOptions } from "@/lib/auth";
      4 import { db } from "@/lib/db";
      5 import { consumeCredit, getCreditStatus } from "@/lib/credits";
      6 import { DEFAULT_THEMES } from "@themegpt/shared";
      7 export async function POST(request: NextRequest) {
      8   try {
      9     const session = await getServerSession(authOptions);
     … +72 lines (ctrl+o to expand)

⏺ Write(apps/web/app/api/download/history/route.ts)
  ⎿  Wrote 39 lines to apps/web/app/api/download/history/route.ts
      1 import { NextRequest, NextResponse } from "next/server";
      2 import { getServerSession } from "next-auth";
      3 import { authOptions } from "@/lib/auth";
      4 import { db } from "@/lib/db";
      5 import { DownloadHistoryItem } from "@themegpt/shared";
      6 export async function GET(request: NextRequest) {
      7   try {
      8     const session = await getServerSession(authOptions);
     … +29 lines (ctrl+o to expand)

⏺ Write(apps/web/app/api/download/redownload/route.ts)
  ⎿  Wrote 80 lines to apps/web/app/api/download/redownload/route.ts
      1 import { NextRequest, NextResponse } from "next/server";
      2 import { getServerSession } from "next-auth";
      3 import { authOptions } from "@/lib/auth";
      4 import { db } from "@/lib/db";
      5 import { DEFAULT_THEMES } from "@themegpt/shared";
      6 export async function POST(request: NextRequest) {
      7   try {
      8     const session = await getServerSession(authOptions);
     … +70 lines (ctrl+o to expand)

⏺ Now let me create the account linking endpoints:

⏺ Write(apps/web/app/api/link/generate/route.ts)
  ⎿  Wrote 48 lines to apps/web/app/api/link/generate/route.ts
      1 import { NextResponse } from "next/server";
      2 import { getServerSession } from "next-auth";
      3 import { authOptions } from "@/lib/auth";
      4 import { SignJWT } from "jose";
      5 const JWT_SECRET = new TextEncoder().encode(
      6   process.env.NEXTAUTH_SECRET || 'default-secret-change-in-production'
      7 );
      8 export async function POST() {
     … +38 lines (ctrl+o to expand)

⏺ Write(apps/web/app/api/link/confirm/route.ts)
  ⎿  Wrote 81 lines to apps/web/app/api/link/confirm/route.ts
      1 import { NextRequest, NextResponse } from "next/server";
      2 import { jwtVerify } from "jose";
      3 import { db } from "@/lib/db";
      4 const JWT_SECRET = new TextEncoder().encode(
      5   process.env.NEXTAUTH_SECRET || 'default-secret-change-in-production'
      6 );
      7 export async function POST(request: NextRequest) {
      8   try {
     … +71 lines (ctrl+o to expand)

⏺ Write(apps/web/app/api/link/status/route.ts)
  ⎿  Wrote 40 lines to apps/web/app/api/link/status/route.ts
      1 import { NextRequest, NextResponse } from "next/server";
      2 import { db } from "@/lib/db";
      3 export async function GET(request: NextRequest) {
      4   try {
      5     const { searchParams } = new URL(request.url);
      6     const licenseKey = searchParams.get('licenseKey');
      7     if (!licenseKey) {
      8       return NextResponse.json(
     … +30 lines (ctrl+o to expand)

⏺ Bash(cd /Users/etherealogic/Dev/themegpt-v2.0/apps/web && pnpm add jose) timeout: 30s
  ⎿  ../..                                    |  WARN  `node_modules` is present. Lockfile only installation will make it out-of-date
      WARN  deprecated @types/uuid@11.0.0: This is a stub types definition. uuid provides its own type definitions, so you do not need this installed.
     ../..                                    | Progress: resolved 1, reused 0, downloaded 0, added 0
     … +36 lines (ctrl+o to expand)

⏺ Read(app/api/webhooks/stripe/route.ts)
  ⎿  Read 105 lines

⏺ Update(app/api/webhooks/stripe/route.ts)
  ⎿  Added 11 lines, removed 1 line
      34        await handleCheckoutComplete(session);
      35        break;
      36      }
      37 +    case "invoice.paid": {
      38 +      const invoice = event.data.object as Stripe.Invoice;
      39 +      await handleInvoicePaid(invoice);
      40 +      break;
      41 +    }
      42 +    case "customer.subscription.updated": {
      43 +      const subscription = event.data.object as Stripe.Subscription;
      44 +      await handleSubscriptionUpdated(subscription);
      45 +      break;
      46 +    }
      47      case "customer.subscription.deleted": {
      48        const subscription = event.data.object as Stripe.Subscription;
      39 -      await handleSubscriptionCanceled(subscription);
      49 +      await handleSubscriptionDeleted(subscription);
      50        break;
      51      }
      52    }

⏺ Update(app/api/webhooks/stripe/route.ts)
  ⎿  Added 86 lines, removed 3 lines
      55  }
      56
      57  async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
      58 -  const { type, themeId } = session.metadata || {};
      58 +  const { type, themeId, userId } = session.metadata || {};
      59    const licenseKey = `KEY-${uuidv4().substring(0, 8).toUpperCase()}`;
      60
      61    let entitlement: LicenseEntitlement;
     ...
      68        permanentlyUnlocked: [],
      69        activeSlotThemes: [],
      70      };
      71 +
      72 +    // If user is logged in, create subscription record for credit tracking
      73 +    if (userId && session.subscription) {
      74 +      const stripeSubscription = await getStripe().subscriptions.retrieve(
      75 +        session.subscription as string
      76 +      );
      77 +
      78 +      await db.createSubscription({
      79 +        userId,
      80 +        stripeSubscriptionId: stripeSubscription.id,
      81 +        stripeCustomerId: session.customer as string,
      82 +        status: 'active',
      83 +        currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
      84 +        currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
      85 +      });
      86 +
      87 +      console.log(`Subscription record created for user: ${userId}`);
      88 +    }
      89    } else {
      90      entitlement = {
      91        active: true,
     ...
      108    console.log(`License created: ${licenseKey} for ${type}`);
      109  }
      110
       93 -async function handleSubscriptionCanceled(subscription: Stripe.Subscription) {
      111 +async function handleInvoicePaid(invoice: Stripe.Invoice) {
      112 +  // Only process subscription renewals (not initial payment)
      113 +  if (!invoice.subscription || invoice.billing_reason === 'subscription_create') {
      114 +    return;
      115 +  }
      116 +
      117 +  const stripeSubscriptionId = invoice.subscription as string;
      118 +  const subscription = await db.getSubscriptionByStripeId(stripeSubscriptionId);
      119 +
      120 +  if (!subscription) {
      121 +    console.log(`No subscription record found for Stripe ID: ${stripeSubscriptionId}`);
      122 +    return;
      123 +  }
      124 +
      125 +  // Get updated subscription details from Stripe
      126 +  const stripeSubscription = await getStripe().subscriptions.retrieve(stripeSubscriptionId);
      127 +
      128 +  // Reset credits for the new billing period
      129 +  await db.resetCredits(
      130 +    subscription.id,
      131 +    new Date(stripeSubscription.current_period_start * 1000),
      132 +    new Date(stripeSubscription.current_period_end * 1000)
      133 +  );
      134 +
      135 +  console.log(`Credits reset for subscription: ${subscription.id}`);
      136 +}
      137 +
      138 +async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
      139 +  const dbSubscription = await db.getSubscriptionByStripeId(subscription.id);
      140 +
      141 +  if (!dbSubscription) {
      142 +    return;
      143 +  }
      144 +
      145 +  // Check if subscription was canceled (entering grace period)
      146 +  if (subscription.cancel_at_period_end && dbSubscription.status === 'active') {
      147 +    await db.updateSubscription(dbSubscription.id, {
      148 +      status: 'canceled',
      149 +      canceledAt: new Date(),
      150 +    });
      151 +
      152 +    console.log(`Subscription entering grace period: ${dbSubscription.id}`);
      153 +  }
      154 +
      155 +  // Check if cancellation was reversed
      156 +  if (!subscription.cancel_at_period_end && dbSubscription.status === 'canceled') {
      157 +    await db.updateSubscription(dbSubscription.id, {
      158 +      status: 'active',
      159 +      canceledAt: null,
      160 +    });
      161 +
      162 +    console.log(`Subscription cancellation reversed: ${dbSubscription.id}`);
      163 +  }
      164 +}
      165 +
      166 +async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
      167    const customerId = subscription.customer as string;
      168
      169    try {
      170 +    // Update subscription record to expired
      171 +    const dbSubscription = await db.getSubscriptionByStripeId(subscription.id);
      172 +    if (dbSubscription) {
      173 +      await db.updateSubscription(dbSubscription.id, {
      174 +        status: 'expired',
      175 +      });
      176 +      console.log(`Subscription expired: ${dbSubscription.id}`);
      177 +    }
      178 +
      179 +    // Also deactivate legacy license key
      180      const customer = await getStripe().customers.retrieve(customerId);
      181      if (customer.deleted) return;
      182
     ...
      192        console.log(`Subscription canceled, license deactivated: ${licenseKey}`);
      193      }
      194    } catch (error) {
      112 -    console.error("Error handling subscription cancellation:", error);
      195 +    console.error("Error handling subscription deletion:", error);
      196    }
      197  }

⏺ Read(app/api/checkout/route.ts)
  ⎿  Read 57 lines

⏺ Update(app/api/checkout/route.ts)
  ⎿  Added 9 lines, removed 2 lines
      1  import { NextResponse } from "next/server";
      2 +import { getServerSession } from "next-auth";
      3 +import { authOptions } from "@/lib/auth";
      4  import { getStripe, STRIPE_PRICES } from "@/lib/stripe";
      5
      6  const corsHeaders = {
     ...
      18      const body = await request.json();
      19      const { type, themeId } = body as { type: "subscription" | "single"; themeId?: string };
      20
      21 +    // Get user session if logged in
      22 +    const session = await getServerSession(authOptions);
      23 +    const userId = session?.user?.id;
      24 +
      25      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://themegpt.app";
      26
      27      const priceId = type === "subscription"
      28        ? STRIPE_PRICES.subscription
      29        : STRIPE_PRICES.singleTheme;
      30
      25 -    const session = await getStripe().checkout.sessions.create({
      31 +    const checkoutSession = await getStripe().checkout.sessions.create({
      32        mode: type === "subscription" ? "subscription" : "payment",
      33        payment_method_types: ["card"],
      34        line_items: [
     ...
      40        metadata: {
      41          type,
      42          themeId: themeId || "",
      43 +        userId: userId || "",
      44        },
      45        success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      46        cancel_url: `${baseUrl}/?canceled=true`,
     ...
      49      return NextResponse.json(
      50        {
      51          success: true,
      45 -        checkoutUrl: session.url
      52 +        checkoutUrl: checkoutSession.url
      53        },
      54        { headers: corsHeaders }
      55      );

⏺ Search(pattern: "apps/web/app/**/layout.tsx")
  ⎿  Found 1 file (ctrl+o to expand)

⏺ Search(pattern: "apps/web/app/**/page.tsx")
  ⎿  Found 4 files (ctrl+o to expand)

⏺ Read(app/layout.tsx)
  ⎿  Read 53 lines

⏺ Bash(mkdir -p /Users/etherealogic/Dev/themegpt-v2.0/apps/web/app/login /Users/etherealogic/Dev/themegpt-v2.0/apps/web/app/account
      /Users/etherealogic/Dev/themegpt-v2…)
  ⎿  (No content)

⏺ Write(components/SessionProvider.tsx)
  ⎿  Wrote 9 lines to components/SessionProvider.tsx
      1 "use client";
      2 import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";
      3 import { ReactNode } from "react";
      4 export function SessionProvider({ children }: { children: ReactNode }) {
      5   return <NextAuthSessionProvider>{children}</NextAuthSessionProvider>;
      6 }

⏺ Write(app/login/page.tsx)
  ⎿  Wrote 101 lines to app/login/page.tsx
      1 "use client";
      2 import { signIn } from "next-auth/react";
      3 import { useSearchParams } from "next/navigation";
      4 import { Suspense } from "react";
      5 function LoginContent() {
      6   const searchParams = useSearchParams();
      7   const callbackUrl = searchParams.get("callbackUrl") || "/account";
      8   const error = searchParams.get("error");
     … +91 lines (ctrl+o to expand)

⏺ Write(app/account/page.tsx)
  ⎿  Wrote 278 lines to app/account/page.tsx
      1 "use client";
      2 import { useSession, signOut } from "next-auth/react";
      3 import { useRouter } from "next/navigation";
      4 import { useEffect, useState } from "react";
      5 import { SubscriptionResponse, DownloadHistoryItem } from "@themegpt/shared";
      6 export default function AccountPage() {
      7   const { data: session, status } = useSession();
      8   const router = useRouter();
     … +268 lines (ctrl+o to expand)

⏺ Update(app/layout.tsx)
  ⎿  Added 2 lines, removed 1 line
      1  import type { Metadata } from "next";
      2  import { Geist, Geist_Mono } from "next/font/google";
      3 +import { SessionProvider } from "@/components/SessionProvider";
      4  import "./globals.css";
      5
      6  const geistSans = Geist({
     ...
      46        <body
      47          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      48        >
      48 -        {children}
      49 +        <SessionProvider>{children}</SessionProvider>
      50        </body>
      51      </html>
      52    );

⏺ Update(.env.local)
  ⎿  Added 12 lines
      17
      18  # App URL
      19  NEXT_PUBLIC_APP_URL=http://localhost:3000
      20 +
      21 +# NextAuth.js Configuration
      22 +NEXTAUTH_URL=http://localhost:3000
      23 +NEXTAUTH_SECRET=<your-nextauth-secret-here>
      24 +
      25 +# Google OAuth (placeholder - configure at console.cloud.google.com)
      26 +GOOGLE_CLIENT_ID=your-google-client-id
      27 +GOOGLE_CLIENT_SECRET=your-google-client-secret
      28 +
      29 +# GitHub OAuth (placeholder - configure at github.com/settings/developers)
      30 +GITHUB_CLIENT_ID=your-github-client-id
      31 +GITHUB_CLIENT_SECRET=your-github-client-secret

⏺ Bash(npx tsc --noEmit 2>&1 | head -50) timeout: 1m 0s
  ⎿
                     This is not the tsc command you are looking for

     … +5 lines (ctrl+o to expand)

⏺ Bash(pnpm exec tsc --noEmit 2>&1 | head -100) timeout: 1m 0s
  ⎿  app/api/webhooks/stripe/route.ts(83,57): error TS2339: Property 'current_period_start' does not exist on type 'Response<Subscription>'.
     app/api/webhooks/stripe/route.ts(84,55): error TS2339: Property 'current_period_end' does not exist on type 'Response<Subscription>'.
     app/api/webhooks/stripe/route.ts(113,16): error TS2339: Property 'subscription' does not exist on type 'Invoice'.
     … +4 lines (ctrl+o to expand)

⏺ Read(lib/stripe.ts)
  ⎿  Read 22 lines

⏺ Update(lib/stripe.ts)
  ⎿  Added 1 line, removed 1 line
       8        throw new Error("STRIPE_SECRET_KEY environment variable is required");
       9      }
      10      _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      11 -      apiVersion: "2025-11-17.clover",
      11 +      apiVersion: "2025-12-15.clover",
      12        typescript: true,
      13      });
      14    }

⏺ Read(app/api/webhooks/stripe/route.ts)
  ⎿  Read 198 lines

⏺ Update(app/api/webhooks/stripe/route.ts)
  ⎿  Added 1 line, removed 1 line
      73      if (userId && session.subscription) {
      74        const stripeSubscription = await getStripe().subscriptions.retrieve(
      75          session.subscription as string
      76 -      );
      76 +      ) as Stripe.Subscription;
      77
      78        await db.createSubscription({
      79          userId,

⏺ Update(app/api/webhooks/stripe/route.ts)
  ⎿  Added 8 lines, removed 5 lines
      110
      111  async function handleInvoicePaid(invoice: Stripe.Invoice) {
      112    // Only process subscription renewals (not initial payment)
      113 -  if (!invoice.subscription || invoice.billing_reason === 'subscription_create') {
      113 +  const subscriptionId = typeof invoice.subscription === 'string'
      114 +    ? invoice.subscription
      115 +    : invoice.subscription?.id;
      116 +
      117 +  if (!subscriptionId || invoice.billing_reason === 'subscription_create') {
      118      return;
      119    }
      120
      117 -  const stripeSubscriptionId = invoice.subscription as string;
      118 -  const subscription = await db.getSubscriptionByStripeId(stripeSubscriptionId);
      121 +  const subscription = await db.getSubscriptionByStripeId(subscriptionId);
      122
      123    if (!subscription) {
      121 -    console.log(`No subscription record found for Stripe ID: ${stripeSubscriptionId}`);
      124 +    console.log(`No subscription record found for Stripe ID: ${subscriptionId}`);
      125      return;
      126    }
      127
      128    // Get updated subscription details from Stripe
      126 -  const stripeSubscription = await getStripe().subscriptions.retrieve(stripeSubscriptionId);
      129 +  const stripeSubscription = await getStripe().subscriptions.retrieve(subscriptionId) as Stripe.Subscription;
      130
      131    // Reset credits for the new billing period
      132    await db.resetCredits(

⏺ Bash(pnpm exec tsc --noEmit 2>&1 | head -50) timeout: 1m 0s
  ⎿  app/api/webhooks/stripe/route.ts(83,57): error TS2339: Property 'current_period_start' does not exist on type 'Subscription'.
     app/api/webhooks/stripe/route.ts(84,55): error TS2339: Property 'current_period_end' does not exist on type 'Subscription'.
     app/api/webhooks/stripe/route.ts(113,41): error TS2339: Property 'subscription' does not exist on type 'Invoice'.
     … +4 lines (ctrl+o to expand)

⏺ Bash(grep -r "current_period" node_modules/stripe/types 2>/dev/null | head -10)
  ⎿ node_modules/stripe/types/SubscriptionsResource.d.ts:       * Indicate whether this subscription should cancel at the end of the current period (`c
    urrent_period_end`). Defaults to `false`.
    node_modules/stripe/types/SubscriptionsResource.d.ts:       * Indicate whether this subscription should cancel at the end of the current period (`c
    … +12 lines (ctrl+o to expand)



⏺ Bash(grep -A5 "interface Subscription" node_modules/stripe/types/Subscriptions.d.ts 2>/dev/null | head -30)
  ⎿      interface Subscription {
           /**
            * Unique identifier for the object.
     … +2 lines (ctrl+o to expand)

⏺ Bash(grep -E "(current_period|billing)" node_modules/stripe/types/Subscriptions.d.ts 2>/dev/null | head -20)
  ⎿      * Related guide: [Creating subscriptions](https://docs.stripe.com/billing/subscriptions/creating)
           * The reference point that aligns future [billing cycle](https://docs.stripe.com/subscriptions/billing-cycle) dates. It sets the day of week
     for `week` intervals, the day of month for `month` and `year` intervals, and the month of year for `year` intervals. The timestamp is in UTC forma
    … +26 lines (ctrl+o to expand)



⏺ Bash(grep -A100 "interface Subscription {" node_modules/stripe/types/Subscriptions.d.ts 2>/dev/null | grep -E "(period|items)" | head -10)
  ⎿         * Define thresholds at which an invoice will be sent, and the subscription advanced to a new billing period
            * Whether this subscription will (if `status=active`) or did (if `status=canceled`) cancel at the end of the current billing period.
           cancel_at_period_end: boolean;
     … +3 lines (ctrl+o to expand)

⏺ Bash(grep -A200 "interface Subscription {" node_modules/stripe/types/Subscriptions.d.ts 2>/dev/null | head -100)
  ⎿      interface Subscription {
           /**
            * Unique identifier for the object.
     … +109 lines (ctrl+o to expand)

⏺ Bash(grep "current_period" node_modules/stripe/types/Subscriptions.d.ts 2>/dev/null)
  ⎿  No matches found

⏺ Bash(grep -A10 "current_period" node_modules/stripe/types/SubscriptionItems.d.ts 2>/dev/null)
  ⎿        current_period_end: number;

           /**
     … +14 lines (ctrl+o to expand)

⏺ Update(app/api/webhooks/stripe/route.ts)
  ⎿  Added 13 lines, removed 3 lines
      72      // If user is logged in, create subscription record for credit tracking
      73      if (userId && session.subscription) {
      74        const stripeSubscription = await getStripe().subscriptions.retrieve(
      75 -        session.subscription as string
      75 +        session.subscription as string,
      76 +        { expand: ['items.data'] }
      77        ) as Stripe.Subscription;
      78
      79 +      // Get billing period from the first subscription item
      80 +      const firstItem = stripeSubscription.items?.data?.[0];
      81 +      const currentPeriodStart = firstItem?.current_period_start
      82 +        ? new Date(firstItem.current_period_start * 1000)
      83 +        : new Date();
      84 +      const currentPeriodEnd = firstItem?.current_period_end
      85 +        ? new Date(firstItem.current_period_end * 1000)
      86 +        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // Default 30 days
      87 +
      88        await db.createSubscription({
      89          userId,
      90          stripeSubscriptionId: stripeSubscription.id,
      91          stripeCustomerId: session.customer as string,
      92          status: 'active',
      83 -        currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
      84 -        currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
      93 +        currentPeriodStart,
      94 +        currentPeriodEnd,
      95        });
      96
      97        console.log(`Subscription record created for user: ${userId}`);

⏺ Update(app/api/webhooks/stripe/route.ts)
  ⎿  Added 19 lines, removed 9 lines
      120
      121  async function handleInvoicePaid(invoice: Stripe.Invoice) {
      122    // Only process subscription renewals (not initial payment)
      123 -  const subscriptionId = typeof invoice.subscription === 'string'
      124 -    ? invoice.subscription
      125 -    : invoice.subscription?.id;
      123 +  // eslint-disable-next-line @typescript-eslint/no-explicit-any
      124 +  const invoiceAny = invoice as any;
      125 +  const subscriptionId = typeof invoiceAny.subscription === 'string'
      126 +    ? invoiceAny.subscription
      127 +    : invoiceAny.subscription?.id;
      128
      129    if (!subscriptionId || invoice.billing_reason === 'subscription_create') {
      130      return;
     ...
      138    }
      139
      140    // Get updated subscription details from Stripe
      139 -  const stripeSubscription = await getStripe().subscriptions.retrieve(subscriptionId) as Stripe.Subscription;
      141 +  const stripeSubscription = await getStripe().subscriptions.retrieve(
      142 +    subscriptionId,
      143 +    { expand: ['items.data'] }
      144 +  ) as Stripe.Subscription;
      145
      146 +  // Get billing period from the first subscription item
      147 +  const firstItem = stripeSubscription.items?.data?.[0];
      148 +  const currentPeriodStart = firstItem?.current_period_start
      149 +    ? new Date(firstItem.current_period_start * 1000)
      150 +    : new Date();
      151 +  const currentPeriodEnd = firstItem?.current_period_end
      152 +    ? new Date(firstItem.current_period_end * 1000)
      153 +    : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      154 +
      155    // Reset credits for the new billing period
      142 -  await db.resetCredits(
      143 -    subscription.id,
      144 -    new Date(stripeSubscription.current_period_start * 1000),
      145 -    new Date(stripeSubscription.current_period_end * 1000)
      146 -  );
      156 +  await db.resetCredits(subscription.id, currentPeriodStart, currentPeriodEnd);
      157
      158    console.log(`Credits reset for subscription: ${subscription.id}`);
      159  }

⏺ Bash(pnpm exec tsc --noEmit 2>&1 | head -50) timeout: 1m 0s
  ⎿  (No content)

⏺ The subscription management system is now fully implemented. Let me verify everything compiles and provide a summary:

⏺ Bash(cd /Users/etherealogic/Dev/themegpt-v2.0 && pnpm --filter @themegpt/shared build && pnpm --filter web build 2>&1 | tail -30)
  ⎿  > @themegpt/shared@2.0.0 build /Users/etherealogic/Dev/themegpt-v2.0/packages/shared
     > tsc
     … +29 lines (ctrl+o to expand)

⏺ The subscription management system has been fully implemented. Here's a summary of what was created:

  Implementation Complete

  New Files Created

  Authentication:
  - apps/web/lib/auth.ts - NextAuth.js configuration with Google/GitHub providers
  - apps/web/app/api/auth/[...nextauth]/route.ts - Auth API route handler
  - apps/web/components/SessionProvider.tsx - Session provider wrapper
  - apps/web/app/login/page.tsx - OAuth login page

  Credit System:
  - apps/web/lib/credits.ts - Credit consumption and status logic
  - apps/web/app/api/subscription/route.ts - Get subscription status
  - apps/web/app/api/subscription/credits/route.ts - Get credit balance
  - apps/web/app/api/download/route.ts - Consume credit and download theme
  - apps/web/app/api/download/history/route.ts - Get download history
  - apps/web/app/api/download/redownload/route.ts - Re-download previous themes

  Account Linking:
  - apps/web/app/api/link/generate/route.ts - Generate linking token
  - apps/web/app/api/link/confirm/route.ts - Confirm account link
  - apps/web/app/api/link/status/route.ts - Check link status

  Dashboard:
  - apps/web/app/account/page.tsx - Account management dashboard

  Modified Files

  - packages/shared/src/index.ts - Added new types (Subscription, Download, etc.)
  - apps/web/lib/db.ts - Extended with subscription, download, and linking methods
  - apps/web/app/api/webhooks/stripe/route.ts - Added credit reset and grace period handling
  - apps/web/app/api/checkout/route.ts - Includes userId in Stripe metadata
  - apps/web/app/layout.tsx - Wrapped with SessionProvider
  - apps/web/.env.local - Added OAuth placeholder credentials

  Next Steps

  To enable OAuth login, you'll need to:
  1. Create OAuth apps at https://console.cloud.google.com and https://github.com/settings/developers
  2. Update .env.local with the real OAuth credentials
  3. Set callback URLs to http://localhost:3000/api/auth/callback/google and /github

> OAuth client created
The client ID can always be accessed from Clients tab under Google Auth Platform.

OAuth access is restricted to the test users  listed on your OAuth consent screen
Client ID
712139777205-gd1ph7ff5nru5biao8j0pe4oiikqoo1t.apps.googleusercontent.com

⏺ I'll update the .env.local with your Google OAuth Client ID:

⏺ Update(apps/web/.env.local)
  ⎿  Added 2 lines, removed 2 lines
      22  NEXTAUTH_URL=http://localhost:3000
      23  NEXTAUTH_SECRET=<your-nextauth-secret-here>
      24
      25 -# Google OAuth (placeholder - configure at console.cloud.google.com)
      26 -GOOGLE_CLIENT_ID=your-google-client-id
      25 +# Google OAuth
      26 +GOOGLE_CLIENT_ID=712139777205-gd1ph7ff5nru5biao8j0pe4oiikqoo1t.apps.googleusercontent.com
      27  GOOGLE_CLIENT_SECRET=your-google-client-secret
      28
      29  # GitHub OAuth (placeholder - configure at github.com/settings/developers)

⏺ Client ID added. You'll also need to provide the Client Secret from Google Cloud Console (it should have been shown when you created the OAuth client, or you can find it in the Credentials section).

  Also, make sure you've added the authorized redirect URI in Google Cloud Console:
  http://localhost:3000/api/auth/callback/google

  Once you have the client secret, let me know and I'll add it to the config.

> [REDACTED]

⏺ Update(apps/web/.env.local)
  ⎿  Added 1 line, removed 1 line
      24
      25  # Google OAuth
      26  GOOGLE_CLIENT_ID=712139777205-gd1ph7ff5nru5biao8j0pe4oiikqoo1t.apps.googleusercontent.com
      27 -GOOGLE_CLIENT_SECRET=your-google-client-secret
      27 +GOOGLE_CLIENT_SECRET=your-google-client-secret
      28
      29  # GitHub OAuth (placeholder - configure at github.com/settings/developers)
      30  GITHUB_CLIENT_ID=your-github-client-id

⏺ Google OAuth is now configured. You can test the login flow at http://localhost:3000/login.

  Reminder: Ensure you've added this redirect URI in Google Cloud Console → Credentials → Your OAuth Client → Authorized redirect URIs:
  http://localhost:3000/api/auth/callback/google

  Do you also want to set up GitHub OAuth, or would you like to test Google login first?
