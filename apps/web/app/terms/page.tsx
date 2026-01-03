import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Terms of Service | ThemeGPT",
  description: "ThemeGPT terms of service - Usage terms, licensing, and policies.",
};

export default function TermsOfService() {
  return (
    <div className="noise-texture min-h-screen bg-cream font-sans text-brown-900">
      <header className="flex items-center justify-between border-b border-cream-dark bg-cream px-8 py-4">
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="/mascot-transparent.png"
            alt="ThemeGPT mascot"
            width={48}
            height={48}
            className="h-12 w-12"
            priority
          />
          <span className="text-xl font-bold text-brown-900">ThemeGPT</span>
        </Link>
        <nav className="flex items-center gap-7">
          <Link
            href="/#themes"
            className="text-[15px] font-medium text-brown-900 hover:text-teal-500 transition-colors"
          >
            Themes
          </Link>
          <Link
            href="/#pricing"
            className="text-[15px] font-medium text-brown-900 hover:text-teal-500 transition-colors"
          >
            Pricing
          </Link>
          <Link
            href="/#pricing"
            className="cursor-pointer rounded-full bg-teal-500 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:-translate-y-px hover:shadow-lg hover:shadow-teal-500/30"
          >
            Subscribe Now
          </Link>
        </nav>
      </header>

      <main className="mx-auto max-w-3xl px-8 py-12">
        <h1 className="mb-8 text-4xl font-bold text-brown-900">Terms of Service</h1>
        <p className="mb-6 text-sm text-brown-600">Last updated: January 2025</p>

        <div className="prose prose-brown max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-brown-900 mb-4">1. Service Description</h2>
            <p className="text-brown-700 leading-relaxed">
              ThemeGPT is a Chrome browser extension that allows users to customize the visual
              appearance of ChatGPT and track token usage. The extension operates locally
              within your browser.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-brown-900 mb-4">2. License Grant</h2>
            <p className="text-brown-700 leading-relaxed">
              Upon purchase, you receive a personal, non-exclusive, non-transferable license
              to use ThemeGPT themes according to your purchase type:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-brown-700 mt-4">
              <li>
                <strong>Monthly Subscription ($1.99/month):</strong> Access to 3 active premium themes
                at a time. You may swap themes freely. Cancel anytime with no commitment.
              </li>
              <li>
                <strong>Yearly Subscription ($14.99/year):</strong> Access to 3 active premium themes
                at a time with a 30-day free trial. Includes a 12-month commitment period.
              </li>
              <li>
                <strong>Single Theme ($0.99):</strong> Permanent access to one specific theme.
                This license does not expire.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-brown-900 mb-4">3. Payment Terms</h2>
            <ul className="list-disc pl-6 space-y-2 text-brown-700">
              <li>All payments are processed securely through Stripe</li>
              <li>Monthly subscription fees are billed monthly on your purchase anniversary date</li>
              <li>Yearly subscription fees are billed annually after the 30-day free trial</li>
              <li>Prices are in USD and subject to applicable taxes</li>
              <li>Monthly subscriptions may be canceled at any time through Stripe</li>
              <li>Yearly subscriptions include a 12-month commitment period</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-brown-900 mb-4">4. Refund Policy</h2>
            <p className="text-brown-700 leading-relaxed">
              Due to the digital nature of our product:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-brown-700 mt-4">
              <li>
                <strong>Monthly subscriptions:</strong> Refunds available within 7 days of initial
                purchase if you have not activated any premium themes
              </li>
              <li>
                <strong>Yearly subscriptions:</strong> Full refund available within 7 days of purchase
                or during the 30-day free trial if you have not activated any premium themes
              </li>
              <li>
                <strong>Single themes:</strong> No refunds once the license key has been
                activated
              </li>
            </ul>
            <p className="text-brown-700 leading-relaxed mt-4">
              For refund requests, contact{" "}
              <a href="mailto:support@themegpt.ai" className="text-teal-600 hover:underline">
                support@themegpt.ai
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-brown-900 mb-4">5. Acceptable Use</h2>
            <p className="text-brown-700 leading-relaxed">You agree not to:</p>
            <ul className="list-disc pl-6 space-y-2 text-brown-700 mt-4">
              <li>Share, resell, or distribute your license key</li>
              <li>Reverse engineer, decompile, or modify the extension</li>
              <li>Use automated systems to bypass license validation</li>
              <li>Claim ownership of ThemeGPT themes or branding</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-brown-900 mb-4">6. Intellectual Property</h2>
            <p className="text-brown-700 leading-relaxed">
              ThemeGPT, including all themes, code, and branding, is owned by ThemeGPT and
              protected by copyright laws. Your purchase grants a license to use, not
              ownership of, the intellectual property.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-brown-900 mb-4">7. Third-Party Services</h2>
            <p className="text-brown-700 leading-relaxed">
              ThemeGPT is not affiliated with OpenAI or ChatGPT. We customize the visual
              interface only and do not modify ChatGPT&apos;s functionality. Changes to ChatGPT
              by OpenAI may affect theme compatibility.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-brown-900 mb-4">8. Limitation of Liability</h2>
            <p className="text-brown-700 leading-relaxed">
              ThemeGPT is provided &quot;as is&quot; without warranties of any kind. We are not
              liable for any indirect, incidental, or consequential damages arising from your
              use of the extension. Our maximum liability is limited to the amount you paid
              for the service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-brown-900 mb-4">9. Termination</h2>
            <p className="text-brown-700 leading-relaxed">
              We may terminate or suspend your license if you violate these terms. Upon
              termination for cause, no refund will be provided.
            </p>
            <ul className="list-disc pl-6 space-y-2 text-brown-700 mt-4">
              <li>
                <strong>Monthly subscriptions:</strong> You may cancel at any time, effective at
                the end of the current billing period.
              </li>
              <li>
                <strong>Yearly subscriptions:</strong> You may cancel within the first 7 days for
                a full refund with no penalty. After the first week, yearly subscriptions include
                a 12-month commitment period.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-brown-900 mb-4">10. Changes to Terms</h2>
            <p className="text-brown-700 leading-relaxed">
              We may update these terms to reflect changes in our service or legal
              requirements. Continued use after changes constitutes acceptance. Material
              changes will be announced on our website.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-brown-900 mb-4">11. Contact</h2>
            <p className="text-brown-700 leading-relaxed">
              For questions about these terms, contact us at{" "}
              <a href="mailto:legal@themegpt.ai" className="text-teal-600 hover:underline">
                legal@themegpt.ai
              </a>
            </p>
          </section>
        </div>
      </main>

      <footer className="bg-brown-900 p-7 text-center text-sm text-cream">
        <div className="flex justify-center gap-6 mb-4">
          <Link href="/privacy" className="text-cream/80 hover:text-cream">
            Privacy Policy
          </Link>
          <Link href="/terms" className="text-cream/80 hover:text-cream">
            Terms of Service
          </Link>
        </div>
        <span className="opacity-85">No tracking - No data collection - Just beautiful themes</span>
      </footer>
    </div>
  );
}
