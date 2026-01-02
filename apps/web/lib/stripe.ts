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
  subscription: process.env.STRIPE_SUBSCRIPTION_PRICE_ID || "",
  singleTheme: process.env.STRIPE_SINGLE_THEME_PRICE_ID || "",
};
