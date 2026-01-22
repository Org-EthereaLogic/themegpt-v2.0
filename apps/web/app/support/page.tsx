import type { Metadata } from "next";
import Link from "next/link";
import { AnimatedMascot } from "@/components/ui/AnimatedMascot";

export const metadata: Metadata = {
  title: "Support | ThemeGPT",
  description: "Get help with ThemeGPT - FAQs, troubleshooting, and contact support for your ChatGPT theme questions.",
};

const faqs = [
  {
    question: "How do I install ThemeGPT?",
    answer: "Visit the Chrome Web Store, search for 'ThemeGPT', and click 'Add to Chrome'. The extension will install automatically and start working when you visit ChatGPT."
  },
  {
    question: "Why isn't my theme applying?",
    answer: "First, make sure you're on chat.openai.com or chatgpt.com. Try refreshing the page, or click the ThemeGPT extension icon and reselect your theme. If issues persist, try disabling and re-enabling the extension."
  },
  {
    question: "How do I unlock premium themes?",
    answer: "Click the 'Connect' button in the extension popup, sign in with Google or GitHub, and subscribe to a plan. Once subscribed, premium themes will be available immediately."
  },
  {
    question: "Can I use ThemeGPT on multiple devices?",
    answer: "Yes! Your subscription is linked to your account, not your device. Simply sign in with the same Google or GitHub account on any device to access your premium themes."
  },
  {
    question: "How do I cancel my subscription?",
    answer: "Visit your Account page on themegpt.app and click 'Manage Subscription'. You can cancel anytime, and you'll retain access until the end of your billing period."
  },
  {
    question: "Is my ChatGPT data safe?",
    answer: "Absolutely. ThemeGPT runs 100% locally in your browser. We never see, collect, or transmit your conversations. Your chat data never leaves your device."
  },
  {
    question: "What is the token counter?",
    answer: "The token counter estimates how many tokens you've used in your ChatGPT conversations. This is calculated locally on your device using the same tokenizer that ChatGPT uses. It helps you track your usage."
  },
  {
    question: "How do I request a refund?",
    answer: "If you're not satisfied with your purchase, contact us within 7 days at support@themegpt.app with your order details. We offer full refunds for first-time purchases."
  }
];

export default function SupportPage() {
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

      {/* Hero Section */}
      <section className="px-8 py-16 text-center" style={{ borderBottom: "1px solid rgba(74, 55, 40, 0.1)" }}>
        <h1
          className="mb-4 text-4xl md:text-5xl font-semibold"
          style={{ fontFamily: "var(--font-fraunces), serif", color: "#4A3728" }}
        >
          How can we help?
        </h1>
        <p className="text-lg max-w-2xl mx-auto" style={{ color: "#7A6555" }}>
          Find answers to common questions or reach out to our support team.
        </p>
      </section>

      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-8 py-12">

        {/* FAQ Section */}
        <section className="mb-16">
          <h2
            className="text-2xl font-semibold mb-8 text-center"
            style={{ fontFamily: "var(--font-fraunces), serif", color: "#4A3728" }}
          >
            Frequently Asked Questions
          </h2>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <details
                key={index}
                className="group rounded-2xl border transition-all duration-300"
                style={{
                  borderColor: "rgba(74, 55, 40, 0.15)",
                  background: "white"
                }}
              >
                <summary
                  className="flex cursor-pointer items-center justify-between px-6 py-5 font-medium list-none"
                  style={{ color: "#4A3728" }}
                >
                  <span className="text-[1.05rem] pr-4">{faq.question}</span>
                  <span
                    className="flex-shrink-0 transition-transform duration-300 group-open:rotate-45"
                    style={{ color: "#5BB5A2" }}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                  </span>
                </summary>
                <div
                  className="px-6 pb-5 leading-relaxed"
                  style={{ color: "#7A6555" }}
                >
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* Contact Section */}
        <section
          className="rounded-3xl p-8 md:p-12 text-center"
          style={{ background: "linear-gradient(135deg, rgba(91, 181, 162, 0.08) 0%, rgba(232, 168, 124, 0.08) 100%)" }}
        >
          <h2
            className="text-2xl font-semibold mb-4"
            style={{ fontFamily: "var(--font-fraunces), serif", color: "#4A3728" }}
          >
            Still need help?
          </h2>
          <p className="mb-8 max-w-xl mx-auto" style={{ color: "#7A6555" }}>
            Our support team is here to help. Send us a message and we&apos;ll get back to you within 24 hours.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="mailto:support@themegpt.app"
              className="inline-flex items-center gap-2 rounded-full px-8 py-4 font-semibold text-white no-underline transition-all duration-300 hover:-translate-y-0.5"
              style={{
                background: "#5BB5A2",
                boxShadow: "0 4px 16px rgba(91, 181, 162, 0.25)",
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
              Email Support
            </a>
          </div>

          <p className="mt-6 text-sm" style={{ color: "#7A6555" }}>
            Or email us directly at{" "}
            <a
              href="mailto:support@themegpt.app"
              className="font-medium transition-colors hover:underline"
              style={{ color: "#5BB5A2" }}
            >
              support@themegpt.app
            </a>
          </p>
        </section>

        {/* Quick Links */}
        <section className="mt-16 text-center">
          <h3
            className="text-xl font-semibold mb-6"
            style={{ fontFamily: "var(--font-fraunces), serif", color: "#4A3728" }}
          >
            Quick Links
          </h3>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/privacy"
              className="rounded-full px-6 py-3 text-sm font-medium no-underline transition-all duration-300 hover:-translate-y-0.5"
              style={{
                background: "white",
                color: "#4A3728",
                border: "1px solid rgba(74, 55, 40, 0.15)"
              }}
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="rounded-full px-6 py-3 text-sm font-medium no-underline transition-all duration-300 hover:-translate-y-0.5"
              style={{
                background: "white",
                color: "#4A3728",
                border: "1px solid rgba(74, 55, 40, 0.15)"
              }}
            >
              Terms of Service
            </Link>
            <Link
              href="/account"
              className="rounded-full px-6 py-3 text-sm font-medium no-underline transition-all duration-300 hover:-translate-y-0.5"
              style={{
                background: "white",
                color: "#4A3728",
                border: "1px solid rgba(74, 55, 40, 0.15)"
              }}
            >
              Manage Account
            </Link>
            <a
              href="https://chromewebstore.google.com/detail/dlphknialdlpmcgoknkcmapmclgckhba?utm_source=item-share-cb"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full px-6 py-3 text-sm font-medium no-underline transition-all duration-300 hover:-translate-y-0.5"
              style={{
                background: "white",
                color: "#4A3728",
                border: "1px solid rgba(74, 55, 40, 0.15)"
              }}
            >
              Chrome Web Store
            </a>
          </div>
        </section>
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
          © 2025 ThemeGPT. Made with ☕ for ChatGPT fans everywhere.
        </p>
      </footer>
    </div>
  );
}
