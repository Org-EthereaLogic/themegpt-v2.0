import type { Metadata } from "next";
import Link from "next/link";
import { AnimatedMascot } from "@/components/ui/AnimatedMascot";

export const metadata: Metadata = {
  title: "Terms of Service | ThemeGPT",
  description: "ThemeGPT terms of service - Usage terms, licensing, and policies.",
};

export default function TermsOfService() {
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
            href="https://chromewebstore.google.com/detail/dlphknialdlpmcgoknkcmapmclgckhba?utm_source=item-share-cb"
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
          Terms of Service
        </h1>
        <p className="mb-6 text-sm" style={{ color: "#7A6555" }}>
          Last updated: January 2025
        </p>

        <div className="space-y-8">
          <section>
            <h2
              className="text-2xl font-semibold mb-4"
              style={{ fontFamily: "var(--font-fraunces), serif", color: "#4A3728" }}
            >
              1. Service Description
            </h2>
            <p className="leading-relaxed" style={{ color: "#7A6555" }}>
              ThemeGPT is a Chrome browser extension that allows users to customize the visual
              appearance of ChatGPT and track token usage. The extension operates locally
              within your browser.
            </p>
          </section>

          <section>
            <h2
              className="text-2xl font-semibold mb-4"
              style={{ fontFamily: "var(--font-fraunces), serif", color: "#4A3728" }}
            >
              2. License Grant
            </h2>
            <p className="leading-relaxed" style={{ color: "#7A6555" }}>
              Upon purchase, you receive a personal, non-exclusive, non-transferable license
              to use ThemeGPT themes according to your purchase type:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-4" style={{ color: "#7A6555" }}>
              <li>
                <strong style={{ color: "#4A3728" }}>Monthly Subscription ($1.99/month):</strong> Access to 3 active premium themes
                at a time. You may swap themes freely. Cancel anytime with no commitment.
              </li>
              <li>
                <strong style={{ color: "#4A3728" }}>Yearly Subscription ($14.99/year):</strong> Access to 3 active premium themes
                at a time with a 30-day free trial. Includes a 12-month commitment period.
              </li>
              <li>
                <strong style={{ color: "#4A3728" }}>Single Theme ($0.99):</strong> Permanent access to one specific theme.
                This license does not expire.
              </li>
            </ul>
          </section>

          <section>
            <h2
              className="text-2xl font-semibold mb-4"
              style={{ fontFamily: "var(--font-fraunces), serif", color: "#4A3728" }}
            >
              3. Payment Terms
            </h2>
            <ul className="list-disc pl-6 space-y-2" style={{ color: "#7A6555" }}>
              <li>All payments are processed securely through Stripe</li>
              <li>Monthly subscription fees are billed monthly on your purchase anniversary date</li>
              <li>Yearly subscription fees are billed annually after the 30-day free trial</li>
              <li>Prices are in USD and subject to applicable taxes</li>
              <li>Monthly subscriptions may be canceled at any time through Stripe</li>
              <li>Yearly subscriptions include a 12-month commitment period</li>
            </ul>
          </section>

          <section>
            <h2
              className="text-2xl font-semibold mb-4"
              style={{ fontFamily: "var(--font-fraunces), serif", color: "#4A3728" }}
            >
              4. Refund Policy
            </h2>
            <p className="leading-relaxed" style={{ color: "#7A6555" }}>
              Due to the digital nature of our product:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-4" style={{ color: "#7A6555" }}>
              <li>
                <strong style={{ color: "#4A3728" }}>Monthly subscriptions:</strong> Refunds available within 7 days of initial
                purchase if you have not activated any premium themes
              </li>
              <li>
                <strong style={{ color: "#4A3728" }}>Yearly subscriptions:</strong> Full refund available within 7 days of purchase
                or during the 30-day free trial if you have not activated any premium themes
              </li>
              <li>
                <strong style={{ color: "#4A3728" }}>Single themes:</strong> No refunds once the license key has been
                activated
              </li>
            </ul>
            <p className="leading-relaxed mt-4" style={{ color: "#7A6555" }}>
              For refund requests, contact{" "}
              <a
                href="mailto:support@themegpt.ai"
                className="transition-colors hover:underline"
                style={{ color: "#5BB5A2" }}
              >
                support@themegpt.ai
              </a>
            </p>
          </section>

          <section>
            <h2
              className="text-2xl font-semibold mb-4"
              style={{ fontFamily: "var(--font-fraunces), serif", color: "#4A3728" }}
            >
              5. Acceptable Use
            </h2>
            <p className="leading-relaxed" style={{ color: "#7A6555" }}>
              You agree not to:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-4" style={{ color: "#7A6555" }}>
              <li>Share, resell, or distribute your license key</li>
              <li>Reverse engineer, decompile, or modify the extension</li>
              <li>Use automated systems to bypass license validation</li>
              <li>Claim ownership of ThemeGPT themes or branding</li>
            </ul>
          </section>

          <section>
            <h2
              className="text-2xl font-semibold mb-4"
              style={{ fontFamily: "var(--font-fraunces), serif", color: "#4A3728" }}
            >
              6. Intellectual Property
            </h2>
            <p className="leading-relaxed" style={{ color: "#7A6555" }}>
              ThemeGPT, including all themes, code, and branding, is owned by ThemeGPT and
              protected by copyright laws. Your purchase grants a license to use, not
              ownership of, the intellectual property.
            </p>
          </section>

          <section>
            <h2
              className="text-2xl font-semibold mb-4"
              style={{ fontFamily: "var(--font-fraunces), serif", color: "#4A3728" }}
            >
              7. Third-Party Services
            </h2>
            <p className="leading-relaxed" style={{ color: "#7A6555" }}>
              ThemeGPT is not affiliated with OpenAI or ChatGPT. We customize the visual
              interface only and do not modify ChatGPT&apos;s functionality. Changes to ChatGPT
              by OpenAI may affect theme compatibility.
            </p>
          </section>

          <section>
            <h2
              className="text-2xl font-semibold mb-4"
              style={{ fontFamily: "var(--font-fraunces), serif", color: "#4A3728" }}
            >
              8. Limitation of Liability
            </h2>
            <p className="leading-relaxed" style={{ color: "#7A6555" }}>
              ThemeGPT is provided &quot;as is&quot; without warranties of any kind. We are not
              liable for any indirect, incidental, or consequential damages arising from your
              use of the extension. Our maximum liability is limited to the amount you paid
              for the service.
            </p>
          </section>

          <section>
            <h2
              className="text-2xl font-semibold mb-4"
              style={{ fontFamily: "var(--font-fraunces), serif", color: "#4A3728" }}
            >
              9. Termination
            </h2>
            <p className="leading-relaxed" style={{ color: "#7A6555" }}>
              We may terminate or suspend your license if you violate these terms. Upon
              termination for cause, no refund will be provided.
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-4" style={{ color: "#7A6555" }}>
              <li>
                <strong style={{ color: "#4A3728" }}>Monthly subscriptions:</strong> You may cancel at any time, effective at
                the end of the current billing period.
              </li>
              <li>
                <strong style={{ color: "#4A3728" }}>Yearly subscriptions:</strong> You may cancel within the first 7 days for
                a full refund with no penalty. After the first week, yearly subscriptions include
                a 12-month commitment period.
              </li>
            </ul>
          </section>

          <section>
            <h2
              className="text-2xl font-semibold mb-4"
              style={{ fontFamily: "var(--font-fraunces), serif", color: "#4A3728" }}
            >
              10. Changes to Terms
            </h2>
            <p className="leading-relaxed" style={{ color: "#7A6555" }}>
              We may update these terms to reflect changes in our service or legal
              requirements. Continued use after changes constitutes acceptance. Material
              changes will be announced on our website.
            </p>
          </section>

          <section>
            <h2
              className="text-2xl font-semibold mb-4"
              style={{ fontFamily: "var(--font-fraunces), serif", color: "#4A3728" }}
            >
              11. Contact
            </h2>
            <p className="leading-relaxed" style={{ color: "#7A6555" }}>
              For questions about these terms, contact us at{" "}
              <a
                href="mailto:legal@themegpt.ai"
                className="transition-colors hover:underline"
                style={{ color: "#5BB5A2" }}
              >
                legal@themegpt.ai
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
          No tracking - No data collection - Just beautiful themes
        </p>
      </footer>
    </div>
  );
}
