import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY environment variable is required");
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-12-15.clover",
      typescript: true,
    });
  }
  return _stripe;
}

const getRequiredEnv = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

// Use getters for lazy evaluation - avoids errors during Next.js build
export const STRIPE_PRICES = {
  get monthly() {
    return getRequiredEnv("STRIPE_SUBSCRIPTION_PRICE_ID"); // $6.99/mo - Full premium access
  },
  get yearly() {
    return getRequiredEnv("STRIPE_YEARLY_PRICE_ID"); // $69.99/yr - Full premium access (17% savings)
  },
  get singleTheme() {
    return getRequiredEnv("STRIPE_SINGLE_THEME_PRICE_ID"); // $3.99/ea - Permanent single theme unlock
  },
};

// Early Adopter Program Configuration
export const EARLY_ADOPTER_CONFIG = {
  maxSlots: parseInt(process.env.EARLY_ADOPTER_MAX_SLOTS || "60", 10),
  windowDays: parseInt(process.env.EARLY_ADOPTER_WINDOW_DAYS || "60", 10),
  launchDate: process.env.LAUNCH_DATE ? new Date(process.env.LAUNCH_DATE) : null,
};

// Trial configuration
export const TRIAL_DAYS = 30; // 1 month free trial for yearly
