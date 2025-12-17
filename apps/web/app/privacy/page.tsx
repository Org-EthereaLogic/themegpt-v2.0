import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Privacy Policy - ThemeGPT",
  description: "Privacy Policy for ThemeGPT Chrome extension",
};

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-cream font-sans text-brown-900">
      <header className="flex items-center justify-between border-b border-cream-dark bg-cream px-8 py-4">
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="/mascot-48.png"
            alt="ThemeGPT mascot"
            width={40}
            height={40}
            className="h-10 w-10 rounded-full shadow-sm"
          />
          <span className="text-xl font-bold text-brown-900">ThemeGPT</span>
        </Link>
      </header>

      <main className="mx-auto max-w-3xl px-8 py-12">
        <h1 className="mb-8 text-4xl font-bold text-brown-900">Privacy Policy</h1>
        <p className="mb-6 text-sm text-brown-600">Last updated: December 2024</p>

        <div className="prose prose-brown max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-brown-900 mb-4">Our Commitment to Privacy</h2>
            <p className="text-brown-700 leading-relaxed">
              ThemeGPT is built with privacy as a core principle. The Chrome extension operates
              entirely within your browser—no personal data, conversation content, or usage
              patterns are ever transmitted to our servers.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-brown-900 mb-4">What the Extension Does</h2>
            <ul className="list-disc pl-6 space-y-2 text-brown-700">
              <li>Applies visual themes to ChatGPT using CSS customization</li>
              <li>Tracks token usage locally using the gpt-tokenizer library</li>
              <li>Stores your preferences (theme selection, license key) in Chrome local storage</li>
              <li>Validates license keys against our server (key only, no personal data)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-brown-900 mb-4">Data We Collect</h2>

            <h3 className="text-xl font-semibold text-brown-900 mt-6 mb-3">From the Extension: None</h3>
            <p className="text-brown-700 leading-relaxed">
              The extension does not collect, transmit, or store any personal data on external
              servers. All theme preferences and token statistics remain on your device.
            </p>

            <h3 className="text-xl font-semibold text-brown-900 mt-6 mb-3">From Purchases</h3>
            <p className="text-brown-700 leading-relaxed">
              When you make a purchase, payment processing is handled entirely by Stripe.
              We receive only:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-brown-700 mt-2">
              <li>A confirmation that payment succeeded</li>
              <li>The purchase type (subscription or single theme)</li>
              <li>A generated license key (not linked to your identity)</li>
            </ul>
            <p className="text-brown-700 leading-relaxed mt-4">
              We do not receive or store your name, email, credit card details, or billing
              address. For payment-related inquiries, refer to{" "}
              <a
                href="https://stripe.com/privacy"
                className="text-teal-600 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Stripe&apos;s Privacy Policy
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-brown-900 mb-4">License Validation</h2>
            <p className="text-brown-700 leading-relaxed">
              When you enter a license key, the extension sends only the key itself to verify
              its validity. No browser fingerprints, IP addresses, or device identifiers are
              collected during this process.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-brown-900 mb-4">Third-Party Services</h2>
            <ul className="list-disc pl-6 space-y-2 text-brown-700">
              <li>
                <strong>Stripe:</strong> Processes payments securely. Subject to{" "}
                <a
                  href="https://stripe.com/privacy"
                  className="text-teal-600 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Stripe&apos;s Privacy Policy
                </a>
              </li>
              <li>
                <strong>Google Cloud:</strong> Hosts our license validation API. No personal
                data is logged.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-brown-900 mb-4">Your Rights</h2>
            <p className="text-brown-700 leading-relaxed">
              Since we don&apos;t collect personal data, there is nothing to delete, export,
              or correct. Your license key can be removed at any time by clearing the
              extension&apos;s storage in Chrome settings.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-brown-900 mb-4">Changes to This Policy</h2>
            <p className="text-brown-700 leading-relaxed">
              We may update this policy to reflect changes in our practices or for legal
              compliance. Material changes will be announced on our website.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-brown-900 mb-4">Contact</h2>
            <p className="text-brown-700 leading-relaxed">
              For privacy-related questions, contact us at{" "}
              <a href="mailto:privacy@themegpt.app" className="text-teal-600 hover:underline">
                privacy@themegpt.app
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
