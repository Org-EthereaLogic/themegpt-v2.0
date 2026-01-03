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

export const STRIPE_PRICES = {
  monthly: process.env.STRIPE_SUBSCRIPTION_PRICE_ID || "", // $1.99/mo (legacy, now monthly)
  yearly: process.env.STRIPE_YEARLY_PRICE_ID || "", // $14.99/yr with 30-day trial
  singleTheme: process.env.STRIPE_SINGLE_THEME_PRICE_ID || "", // $0.99/ea
};

// Early Adopter Program Configuration
export const EARLY_ADOPTER_CONFIG = {
  maxSlots: parseInt(process.env.EARLY_ADOPTER_MAX_SLOTS || "60", 10),
  windowDays: parseInt(process.env.EARLY_ADOPTER_WINDOW_DAYS || "60", 10),
  launchDate: process.env.LAUNCH_DATE ? new Date(process.env.LAUNCH_DATE) : null,
};

// Trial configuration
export const TRIAL_DAYS = 30; // 1 month free trial for yearly
