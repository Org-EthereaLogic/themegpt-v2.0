#!/bin/bash
# ThemeGPT Production Stripe Setup Script
# Run this script with your live Stripe API key:
#   STRIPE_API_KEY=sk_live_xxx ./scripts/create-production-stripe.sh

set -e

if [[ -z "$STRIPE_API_KEY" ]]; then
  echo "Error: STRIPE_API_KEY environment variable is required"
  echo "Usage: STRIPE_API_KEY=sk_live_xxx ./scripts/create-production-stripe.sh"
  exit 1
fi

if [[ ! "$STRIPE_API_KEY" == sk_live_* ]]; then
  echo "Error: STRIPE_API_KEY must be a live key (sk_live_*)"
  echo "You provided: ${STRIPE_API_KEY:0:12}..."
  exit 1
fi

echo "🚀 Creating ThemeGPT Production Stripe Products"
echo "================================================"
echo ""

# Create Monthly Product
echo "📦 Creating Monthly Subscription Product..."
MONTHLY_PRODUCT=$(stripe products create \
  --api-key="$STRIPE_API_KEY" \
  --name="ThemeGPT Premium - Monthly" \
  --description="Full access to all 8 premium themes. Start with a 30-day free trial, then \$6.99/month. Cancel anytime.

Includes:
• 30-day free trial
• All 8 premium themes
• Animated effects (aurora, snowfall, starfield)
• All future theme updates
• Cancel anytime" \
  --format=json)

MONTHLY_PRODUCT_ID=$(echo "$MONTHLY_PRODUCT" | grep -o '"id": "[^"]*"' | head -1 | cut -d'"' -f4)
echo "   Created product: $MONTHLY_PRODUCT_ID"

# Create Monthly Price ($6.99/mo with 30-day trial)
echo "💰 Creating Monthly Price (\$6.99/mo with 30-day trial)..."
MONTHLY_PRICE=$(stripe prices create \
  --api-key="$STRIPE_API_KEY" \
  --product="$MONTHLY_PRODUCT_ID" \
  --unit-amount=699 \
  --currency=usd \
  --recurring.interval=month \
  --recurring.trial-period-days=30 \
  --nickname="Monthly Full Access - \$6.99" \
  --format=json)

MONTHLY_PRICE_ID=$(echo "$MONTHLY_PRICE" | grep -o '"id": "[^"]*"' | head -1 | cut -d'"' -f4)
echo "   Created price: $MONTHLY_PRICE_ID"

# Set as default price
stripe products update "$MONTHLY_PRODUCT_ID" \
  --api-key="$STRIPE_API_KEY" \
  --default-price="$MONTHLY_PRICE_ID" > /dev/null

echo ""

# Create Yearly Product
echo "📦 Creating Yearly Subscription Product..."
YEARLY_PRODUCT=$(stripe products create \
  --api-key="$STRIPE_API_KEY" \
  --name="ThemeGPT Premium - Yearly" \
  --description="Full access to all 8 premium themes at our best value. Early adopters get lifetime access!

Includes:
• All 8 premium themes
• Animated effects (aurora, snowfall, starfield)
• All future theme updates
• 17% savings vs monthly
• Early adopters: Lifetime access potential" \
  --format=json)

YEARLY_PRODUCT_ID=$(echo "$YEARLY_PRODUCT" | grep -o '"id": "[^"]*"' | head -1 | cut -d'"' -f4)
echo "   Created product: $YEARLY_PRODUCT_ID"

# Create Yearly Price ($69.99/yr)
echo "💰 Creating Yearly Price (\$69.99/yr)..."
YEARLY_PRICE=$(stripe prices create \
  --api-key="$STRIPE_API_KEY" \
  --product="$YEARLY_PRODUCT_ID" \
  --unit-amount=6999 \
  --currency=usd \
  --recurring.interval=year \
  --nickname="Yearly Full Access - \$69.99" \
  --format=json)

YEARLY_PRICE_ID=$(echo "$YEARLY_PRICE" | grep -o '"id": "[^"]*"' | head -1 | cut -d'"' -f4)
echo "   Created price: $YEARLY_PRICE_ID"

# Set as default price
stripe products update "$YEARLY_PRODUCT_ID" \
  --api-key="$STRIPE_API_KEY" \
  --default-price="$YEARLY_PRICE_ID" > /dev/null

echo ""

# Create Single Theme Product
echo "📦 Creating Single Theme Product..."
SINGLE_PRODUCT=$(stripe products create \
  --api-key="$STRIPE_API_KEY" \
  --name="ThemeGPT Single Theme" \
  --description="Own a premium theme forever with a one-time purchase. No subscription required.

Includes:
• Permanent ownership of chosen theme
• Animated effects (if applicable)
• All future updates to that theme" \
  -d "metadata[type]=single_theme" \
  --format=json)

SINGLE_PRODUCT_ID=$(echo "$SINGLE_PRODUCT" | grep -o '"id": "[^"]*"' | head -1 | cut -d'"' -f4)
echo "   Created product: $SINGLE_PRODUCT_ID"

# Create Single Theme Price ($3.99)
echo "💰 Creating Single Theme Price (\$3.99)..."
SINGLE_PRICE=$(stripe prices create \
  --api-key="$STRIPE_API_KEY" \
  --product="$SINGLE_PRODUCT_ID" \
  --unit-amount=399 \
  --currency=usd \
  --nickname="Single Theme - \$3.99" \
  --format=json)

SINGLE_PRICE_ID=$(echo "$SINGLE_PRICE" | grep -o '"id": "[^"]*"' | head -1 | cut -d'"' -f4)
echo "   Created price: $SINGLE_PRICE_ID"

# Set as default price
stripe products update "$SINGLE_PRODUCT_ID" \
  --api-key="$STRIPE_API_KEY" \
  --default-price="$SINGLE_PRICE_ID" > /dev/null

echo ""
echo "================================================"
echo "✅ Production Stripe Setup Complete!"
echo "================================================"
echo ""
echo "Add these to your production environment variables:"
echo ""
echo "# Stripe Production Price IDs"
echo "STRIPE_SUBSCRIPTION_PRICE_ID=$MONTHLY_PRICE_ID"
echo "STRIPE_YEARLY_PRICE_ID=$YEARLY_PRICE_ID"
echo "STRIPE_SINGLE_THEME_PRICE_ID=$SINGLE_PRICE_ID"
echo ""
echo "Don't forget to also set:"
echo "- STRIPE_SECRET_KEY (your sk_live_* key)"
echo "- STRIPE_PUBLISHABLE_KEY (your pk_live_* key)"
echo "- NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY (same as above)"
echo "- STRIPE_WEBHOOK_SECRET (from Stripe Dashboard > Webhooks)"
echo ""
echo "⚠️  Next step: Create a webhook endpoint in Stripe Dashboard"
echo "    URL: https://your-domain.com/api/webhooks/stripe"
echo "    Events: checkout.session.completed, checkout.session.expired, invoice.paid,"
echo "            customer.subscription.updated, customer.subscription.deleted,"
echo "            customer.subscription.trial_will_end"
