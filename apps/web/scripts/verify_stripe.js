/* eslint-disable @typescript-eslint/no-require-imports */
const { execFileSync } = require("node:child_process");
const dotenv = require("dotenv");
const Stripe = require("stripe");

const STRIPE_API_VERSION = "2026-01-28.clover";
const DEFAULT_PROJECT = "gen-lang-client-0312336987";
const DEFAULT_REGION = "us-central1";
const DEFAULT_SERVICE = "themegpt-web";

function arg(name, fallback) {
  const exact = process.argv.find((v) => v.startsWith(`${name}=`));
  if (!exact) return fallback;
  return exact.slice(name.length + 1);
}

function isCloudRunMode() {
  return process.argv.includes("--cloud-run");
}

function getServiceEnv(project, region, service) {
  const raw = execFileSync(
    "gcloud",
    [
      "run",
      "services",
      "describe",
      service,
      "--platform=managed",
      "--project",
      project,
      "--region",
      region,
      "--format=json",
    ],
    { encoding: "utf8" }
  );
  const svc = JSON.parse(raw);
  return svc?.spec?.template?.spec?.containers?.[0]?.env || [];
}

function accessSecret(project, secretName, version) {
  const key = version || "latest";
  return execFileSync(
    "gcloud",
    [
      "secrets",
      "versions",
      "access",
      key,
      "--secret",
      secretName,
      "--project",
      project,
    ],
    { encoding: "utf8" }
  );
}

function loadEnvFromCloudRun(project, region, service) {
  const serviceEnv = getServiceEnv(project, region, service);
  for (const entry of serviceEnv) {
    if (!entry?.name || process.env[entry.name]) continue;
    if (typeof entry.value === "string") {
      process.env[entry.name] = entry.value;
      continue;
    }
    const ref = entry.valueFrom?.secretKeyRef;
    if (ref?.name) {
      process.env[entry.name] = accessSecret(project, ref.name, ref.key);
    }
  }
}

function loadEnv() {
  if (isCloudRunMode()) {
    const project = arg("--project", DEFAULT_PROJECT);
    const region = arg("--region", DEFAULT_REGION);
    const service = arg("--service", DEFAULT_SERVICE);
    loadEnvFromCloudRun(project, region, service);
    return;
  }
  dotenv.config({ path: ".env.local" });
}

function required(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function shortId(value) {
  if (!value || value.length < 12) return value || "n/a";
  return `${value.slice(0, 12)}...`;
}

async function verifyStripe() {
  loadEnv();

  const stripeSecretKey = required("STRIPE_SECRET_KEY");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://themegpt.ai";
  const priceIds = {
    monthly: required("STRIPE_SUBSCRIPTION_PRICE_ID"),
    yearly: required("STRIPE_YEARLY_PRICE_ID"),
    single: required("STRIPE_SINGLE_THEME_PRICE_ID"),
  };

  const stripe = new Stripe(stripeSecretKey, { apiVersion: STRIPE_API_VERSION });

  console.log("--- STRIPE CONFIGURATION VERIFICATION ---");
  console.log(`Mode: ${stripeSecretKey.startsWith("sk_live_") ? "LIVE" : "TEST"}`);
  console.log(`API Version: ${STRIPE_API_VERSION}`);

  await stripe.balance.retrieve();
  console.log("Connectivity: PASS");

  let allPass = true;

  for (const [label, id] of Object.entries(priceIds)) {
    try {
      const price = await stripe.prices.retrieve(id);
      console.log(
        `Price ${label}: PASS (${price.id}, active=${String(price.active)}, amount=${String(
          price.unit_amount
        )} ${price.currency})`
      );
      if (!price.active) allPass = false;
    } catch (error) {
      allPass = false;
      const message = error instanceof Error ? error.message : String(error);
      console.log(`Price ${label}: FAIL (${message})`);
    }
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceIds.monthly, quantity: 1 }],
      success_url: `${appUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/?canceled=true`,
      metadata: { source: "verify_stripe_script" },
    });

    const host = session.url ? new URL(session.url).host : "n/a";
    console.log(`Checkout Session: PASS (${shortId(session.id)}, host=${host})`);
  } catch (error) {
    allPass = false;
    const message = error instanceof Error ? error.message : String(error);
    console.log(`Checkout Session: FAIL (${message})`);
  }

  if (!allPass) {
    process.exitCode = 1;
    console.log("Result: FAIL");
    return;
  }

  console.log("Result: PASS");
}

verifyStripe().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Verification aborted: ${message}`);
  process.exit(1);
});
