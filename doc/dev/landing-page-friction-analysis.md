# Landing Page Friction Analysis
Prepared: Feb 23, 2026

## Context
Desktop-only search ad traffic (from campaign "Website traffic-Search-1") is reflecting a 100% bounce rate with 0.0s average engagement time in GA4 and only 0.8s average duration on Clarity. We need to identify why high-intent search users are bouncing instantly.

## Current Experience Review
Based on a review of `apps/web/app/page.tsx` and its components:

### 1. The Ad-to-Message Match
- **The Ad:** The search campaign is called "Website traffic-Search-1". Assuming standard search intent (e.g., users searching for "ChatGPT themes" or "Customize ChatGPT").
- **The Landing Page Hero:** "Give ChatGPT your vibe" + "Free on Chrome Web Store" badge + "Start Free 30-Day Trial" primary CTA.
- **The Problem:** 
  - Mixed messaging: The "Free on Chrome Web Store" badge clashes immediately with the "Start Free 30-Day Trial" primary button.
  - Value proposition delay: The core functionality (it's a Chrome extension that themes ChatGPT) is somewhat buried in abstract copy ("Give ChatGPT your vibe"). A high-intent search user looking for a specific solution might not immediately recognize this as what they searched for.
  - Video dependency: The actual demonstration of the product is in an autoplay video that is *hidden on mobile* and tucked to the side on desktop.

### 2. The Conversion Funnel
- **Primary CTA Routing:** The main Hero and Navigation buttons route to `#pricing`. 
- **The Flow:** 
  `Search Ad -> Landing Page -> Click "Start Free Trial" -> Scrolls to Pricing -> Selects Plan -> Auth Redirect -> Stripe Checkout`
- **The Problem:** This is a heavy upfront commitment. A desktop user coming from a Google Search likely expects to just install the extension first, then upgrade later if they like it. Forcing them to commit to a 30-day trial (which requires auth and presumably a credit card via Stripe) *before* experiencing the product is massive friction.

### 3. Desktop vs Mobile Context
- The extension *only* works on desktop browsers (Chrome/Edge).
- When mobile users were hitting the page, they couldn't install it, so they explored the page (giving 21.9s duration).
- When desktop users hit the page, they *can* install it, but the page tells them to "Start Free 30-Day Trial", pushing them into a checkout flow rather than a simple Web Store install. The immediate cognitive load of a subscription wall causes an instant bounce (0.8s duration).

## Recommended Action Plan

To fix the 100% desktop bounce rate, we must reduce the initial friction and align the page with standard Chrome extension acquisition flows.

1. **Change the Primary CTA:**
   - **From:** `Start Free 30-Day Trial` (routing to `#pricing`)
   - **To:** `Add to Chrome — It's Free` (routing directly to the Chrome Web Store listing).
   
2. **Shift Monetization Strategy:**
   - Let users install the free version of the extension directly from the landing page.
   - Rely on *in-extension* upselling (e.g., locking premium themes behind a "Start Trial" button inside the extension popup itself) to drive subscriptions, rather than trying to force the subscription upfront on the marketing site.

3. **Clarify the Hero Copy:**
   - Make it immediately obvious that this is a browser extension.
   - Example: "The easiest way to theme ChatGPT. Install the free Chrome extension in seconds."
