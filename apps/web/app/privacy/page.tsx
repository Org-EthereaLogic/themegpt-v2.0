import type { Metadata } from "next";
import Link from "next/link";
import { AnimatedMascot } from "@/components/ui/AnimatedMascot";

export const metadata: Metadata = {
  title: "Privacy Policy | ThemeGPT",
  description: "ThemeGPT privacy policy - Learn how we protect your data and respect your privacy.",
};

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen" style={{ background: "#FDF8F3" }}>
      {/* Header */}
      <header
        className="flex items-center justify-between px-6 py-5 md:px-12"
        style={{ borderBottom: "1px solid rgba(74, 55, 40, 0.1)" }}
      >
        <Link href="/" className="flex items-center gap-3.5 no-underline">
          <AnimatedMascot size="md" />
          <span
            className="text-[1.6rem] font-semibold tracking-tight"
            style={{ fontFamily: "var(--font-fraunces), serif", color: "#4A3728" }}
          >
            ThemeGPT
          </span>
        </Link>
        <nav className="hidden items-center gap-7 md:flex">
          <Link
            href="/#themes"
            className="text-[0.95rem] font-medium no-underline transition-colors"
            style={{ color: "#7A6555" }}
          >
            Themes
          </Link>
          <Link
            href="/#pricing"
            className="text-[0.95rem] font-medium no-underline transition-colors"
            style={{ color: "#7A6555" }}
          >
            Pricing
          </Link>
          <a
            href="/install-extension?utm_source=cws&utm_medium=share&utm_campaign=item-share"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full px-6 py-3 font-semibold text-white no-underline transition-all duration-300 hover:-translate-y-0.5"
            style={{
              background: "#5BB5A2",
              boxShadow: "0 4px 16px rgba(91, 181, 162, 0.25)",
            }}
          >
            Add to Chrome — Free
          </a>
        </nav>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-3xl px-8 py-12">
        <h1
          className="mb-8 text-4xl font-semibold"
          style={{ fontFamily: "var(--font-fraunces), serif", color: "#4A3728" }}
        >
          Privacy Policy
        </h1>
        <p className="mb-6 text-sm" style={{ color: "#7A6555" }}>
          Last updated: February 2026
        </p>

        <div className="space-y-8">
          <section>
            <h2
              className="text-2xl font-semibold mb-4"
              style={{ fontFamily: "var(--font-fraunces), serif", color: "#4A3728" }}
            >
              Our Commitment to Privacy
            </h2>
            <p className="leading-relaxed" style={{ color: "#7A6555" }}>
              ThemeGPT is built with privacy as a core principle. The Chrome extension operates
              entirely within your browser—no personal data, conversation content, or usage
              patterns are ever transmitted to our servers.
            </p>
          </section>

          <section>
            <h2
              className="text-2xl font-semibold mb-4"
              style={{ fontFamily: "var(--font-fraunces), serif", color: "#4A3728" }}
            >
              What the Extension Does
            </h2>
            <ul className="list-disc pl-6 space-y-2" style={{ color: "#7A6555" }}>
              <li>Applies visual themes to ChatGPT using CSS customization</li>
              <li>Tracks token usage locally using the gpt-tokenizer library</li>
              <li>Stores your preferences (theme selection, license key) in Chrome local storage</li>
              <li>Validates license keys against our server (key only, no personal data)</li>
            </ul>
          </section>

          <section>
            <h2
              className="text-2xl font-semibold mb-4"
              style={{ fontFamily: "var(--font-fraunces), serif", color: "#4A3728" }}
            >
              Data We Collect
            </h2>

            <h3
              className="text-xl font-semibold mt-6 mb-3"
              style={{ fontFamily: "var(--font-fraunces), serif", color: "#4A3728" }}
            >
              From the Extension: None
            </h3>
            <p className="leading-relaxed" style={{ color: "#7A6555" }}>
              The extension does not collect, transmit, or store any personal data on external
              servers. All theme preferences and token statistics remain on your device.
            </p>

            <h3
              className="text-xl font-semibold mt-6 mb-3"
              style={{ fontFamily: "var(--font-fraunces), serif", color: "#4A3728" }}
            >
              From Account Creation
            </h3>
            <p className="leading-relaxed" style={{ color: "#7A6555" }}>
              When you create an optional account using Google or GitHub OAuth, we collect:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2" style={{ color: "#7A6555" }}>
              <li>Your email address (for account identification)</li>
              <li>Your name (as provided by the OAuth provider)</li>
              <li>A unique user ID (generated by us, not your social ID)</li>
            </ul>
            <p className="leading-relaxed mt-4" style={{ color: "#7A6555" }}>
              We do not access your social media posts, contacts, or any other data from
              Google or GitHub beyond what is listed above.
            </p>

            <h3
              className="text-xl font-semibold mt-6 mb-3"
              style={{ fontFamily: "var(--font-fraunces), serif", color: "#4A3728" }}
            >
              From Purchases
            </h3>
            <p className="leading-relaxed" style={{ color: "#7A6555" }}>
              When you make a purchase, payment processing is handled entirely by Stripe.
              We receive only:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2" style={{ color: "#7A6555" }}>
              <li>A confirmation that payment succeeded</li>
              <li>The purchase type (subscription or single theme)</li>
              <li>A generated license key linked to your account (if logged in)</li>
            </ul>
            <p className="leading-relaxed mt-4" style={{ color: "#7A6555" }}>
              We do not receive or store your credit card details. For payment-related inquiries, refer to{" "}
              <a
                href="https://stripe.com/privacy"
                className="transition-colors hover:underline"
                style={{ color: "#5BB5A2" }}
                target="_blank"
                rel="noopener noreferrer"
              >
                Stripe&apos;s Privacy Policy
              </a>.
            </p>
          </section>

          <section>
            <h2
              className="text-2xl font-semibold mb-4"
              style={{ fontFamily: "var(--font-fraunces), serif", color: "#4A3728" }}
            >
              Website Analytics
            </h2>
            <p className="leading-relaxed" style={{ color: "#7A6555" }}>
              The themegpt.ai marketing website uses Google Analytics (GA4) to understand
              how visitors interact with our purchase funnel. Analytics are only activated
              after you provide consent via the cookie banner. We track:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2" style={{ color: "#7A6555" }}>
              <li>Page views (automatic when consent is given)</li>
              <li>Checkout start, purchase success, and trial start events</li>
            </ul>
            <p className="leading-relaxed mt-4" style={{ color: "#7A6555" }}>
              You can withdraw consent at any time by clearing your browser data for
              themegpt.ai. The ThemeGPT Chrome extension does not use any analytics or tracking.
            </p>
          </section>

          <section>
            <h2
              className="text-2xl font-semibold mb-4"
              style={{ fontFamily: "var(--font-fraunces), serif", color: "#4A3728" }}
            >
              License Validation
            </h2>
            <p className="leading-relaxed" style={{ color: "#7A6555" }}>
              When you enter a license key, the extension sends only the key itself to verify
              its validity. No browser fingerprints, IP addresses, or device identifiers are
              collected during this process.
            </p>
          </section>

          <section>
            <h2
              className="text-2xl font-semibold mb-4"
              style={{ fontFamily: "var(--font-fraunces), serif", color: "#4A3728" }}
            >
              Third-Party Services
            </h2>
            <ul className="list-disc pl-6 space-y-3" style={{ color: "#7A6555" }}>
              <li>
                <strong style={{ color: "#4A3728" }}>Stripe:</strong> Processes payments securely. Subject to{" "}
                <a
                  href="https://stripe.com/privacy"
                  className="transition-colors hover:underline"
                  style={{ color: "#5BB5A2" }}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Stripe&apos;s Privacy Policy
                </a>
              </li>
              <li>
                <strong style={{ color: "#4A3728" }}>Google OAuth:</strong> Used for optional account authentication. We only
                receive your email address and name. Subject to{" "}
                <a
                  href="https://policies.google.com/privacy"
                  className="transition-colors hover:underline"
                  style={{ color: "#5BB5A2" }}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Google&apos;s Privacy Policy
                </a>
              </li>
              <li>
                <strong style={{ color: "#4A3728" }}>GitHub OAuth:</strong> Used for optional account authentication. We only
                receive your email address and name. Subject to{" "}
                <a
                  href="https://docs.github.com/en/site-policy/privacy-policies/github-privacy-statement"
                  className="transition-colors hover:underline"
                  style={{ color: "#5BB5A2" }}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GitHub&apos;s Privacy Statement
                </a>
              </li>
              <li>
                <strong style={{ color: "#4A3728" }}>Firebase:</strong> Stores license and subscription data securely. Subject to{" "}
                <a
                  href="https://firebase.google.com/support/privacy"
                  className="transition-colors hover:underline"
                  style={{ color: "#5BB5A2" }}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Firebase Privacy Policy
                </a>
              </li>
            </ul>
          </section>

          <section>
            <h2
              className="text-2xl font-semibold mb-4"
              style={{ fontFamily: "var(--font-fraunces), serif", color: "#4A3728" }}
            >
              Case Studies &amp; Testimonials
            </h2>
            <p className="leading-relaxed" style={{ color: "#7A6555" }}>
              We do not collect data for marketing purposes without your knowledge. If we
              wish to feature your experience in a case study, testimonial, or promotional
              material, we will request your explicit, written consent beforehand.
              Participation is entirely voluntary and you may withdraw consent at any time
              by contacting{" "}
              <a
                href="mailto:privacy@themegpt.ai"
                className="transition-colors hover:underline"
                style={{ color: "#5BB5A2" }}
              >
                privacy@themegpt.ai
              </a>.
            </p>
          </section>

          <section>
            <h2
              className="text-2xl font-semibold mb-4"
              style={{ fontFamily: "var(--font-fraunces), serif", color: "#4A3728" }}
            >
              Your Rights
            </h2>
            <p className="leading-relaxed" style={{ color: "#7A6555" }}>
              You have the right to access, correct, or delete your account data at any time.
              To request data deletion or export, please contact us at{" "}
              <a
                href="mailto:privacy@themegpt.ai"
                className="transition-colors hover:underline"
                style={{ color: "#5BB5A2" }}
              >
                privacy@themegpt.ai
              </a>. Your local extension data (themes, preferences) can be cleared at any time
              through Chrome&apos;s extension settings.
            </p>
          </section>

          <section>
            <h2
              className="text-2xl font-semibold mb-4"
              style={{ fontFamily: "var(--font-fraunces), serif", color: "#4A3728" }}
            >
              Changes to This Policy
            </h2>
            <p className="leading-relaxed" style={{ color: "#7A6555" }}>
              We may update this policy to reflect changes in our practices or for legal
              compliance. Material changes will be announced on our website.
            </p>
          </section>

          <section>
            <h2
              className="text-2xl font-semibold mb-4"
              style={{ fontFamily: "var(--font-fraunces), serif", color: "#4A3728" }}
            >
              Contact
            </h2>
            <p className="leading-relaxed" style={{ color: "#7A6555" }}>
              For privacy-related questions, contact us at{" "}
              <a
                href="mailto:privacy@themegpt.ai"
                className="transition-colors hover:underline"
                style={{ color: "#5BB5A2" }}
              >
                privacy@themegpt.ai
              </a>
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer
        className="py-16 px-8 text-center"
        style={{ background: "#4A3728", color: "#FDF8F3" }}
      >
        <div className="flex justify-center gap-10 mb-8 flex-wrap">
          <Link
            href="/privacy"
            className="text-[0.9rem] no-underline transition-colors duration-300"
            style={{ color: "rgba(253, 248, 243, 0.7)" }}
          >
            Privacy Policy
          </Link>
          <Link
            href="/terms"
            className="text-[0.9rem] no-underline transition-colors duration-300"
            style={{ color: "rgba(253, 248, 243, 0.7)" }}
          >
            Terms of Service
          </Link>
        </div>
        <p className="opacity-40 text-[0.85rem]">
          Extension: No tracking. Website: Analytics with consent.
        </p>
      </footer>
    </div>
  );
}
