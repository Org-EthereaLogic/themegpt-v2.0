# Landing Page Friction Analysis
Prepared: Feb 23, 2026

## Status Update — Feb 25, 2026

- This document captures a **historical Feb 23 snapshot** and should not be treated as current page state.
- The CTA recommendation in this document has already been shipped:
  - Hero CTA now points directly to CWS with "Add to Chrome — It's Free"
  - Navigation CTA now points directly to CWS with "Add to Chrome — It's Free"
  - Features CTA now points directly to CWS with "Add to Chrome — It's Free"
- Updated GA4 pulls for Feb 21-24 show mobile traffic is still the core issue, but attribution is primarily Google mobile (`google / cpc`), not Reddit-dominant.

## Context
Desktop-only search ad traffic (from campaign "Website traffic-Search-1") is reflecting a 100% bounce rate with 0.0s average engagement time in GA4 and only 0.8s average duration on Clarity. We need to identify why high-intent search users are bouncing instantly.

## Historical Experience Review (Feb 23 Snapshot)
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

## Historical Action Plan (Completed)

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

---

## Evening Update — Feb 23, 2026

### Additional Friction Points Identified (Clarity Session Replays)

Deep analysis of Clarity session recordings revealed three additional friction points beyond the ad-to-message mismatch:

#### 4. Checkout Double-Login Bug (FIXED — commit `9537d36`)
A user clicked "Start Free Month" → redirected to `/login` → logged in → came back → clicked "Buy Theme" → redirected to `/login` AGAIN → gave up and went to `/support` asking "How do I unlock premium themes?"

**Root cause:** `callbackUrl` was set to `window.location.href` (just `/`), so after OAuth the user returned to the page top, not the pricing section. If the auto-resume POST to `/api/checkout` hit a 401 (server-side session not ready), the error message had no retry action, forcing the user to click the CTA again which triggered another `signIn()` call.

**Fix:** Changed `callbackUrl` to include `#pricing` anchor. Added contextual messaging on `/login` page: "One more step! Sign in to complete your checkout."

#### 5. Extension Auth Race Condition (FIXED — commit `9537d36`)
A user hit `/auth/extension` for 3 seconds with 0 clicks and left.

**Root cause:** `generateToken` callback captured `extensionDetected` (from `pingExtension` with 2s timeout) in its closure. If the API responded faster than the ping, `extensionDetected` was still `null`, so auto-send was skipped. User landed on confusing manual token copy screen.

**Fix:** Decoupled token generation from extension send. New `useEffect` watches both `token` and `extensionDetected` independently.

#### 6. Reddit Ads — Platform Device Limitation (Historical Spend Observation)
Reddit Ads device breakdown: iOS 88 clicks, Android 34 clicks, macOS 1 click, Windows 3 clicks. Only 4 desktop clicks out of 126 total ($115 spend). Reddit Ads has no device exclusion feature at the ad group level — only Feed/Conversations placement controls.

**Status:** Campaign kept running while evaluating pause decision. No platform-level mitigation available.  
**Note (Feb 25 GA4 verification):** session attribution for Feb 21-24 shows 1 `reddit / paid_social` mobile session versus 28 `google / cpc` mobile sessions.

### Analytics Snapshot (Clarity — Last 3 Days)
- 50 sessions, 40 unique users, 1.68 pages/session
- Performance: LCP 3.8s, INP 460ms (desktop likely better — mobile inflates averages)
- Quick backs: 10% (5 sessions)
- Google = 49% of traffic, Direct = 28%
- CWS users: 8 → 22 (+175%)
