"use client";

import { AnimatedMascot } from "@/components/ui/AnimatedMascot";

const footerLinks = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "Support", href: "/support" },
  { label: "Chrome Web Store", href: "https://chromewebstore.google.com/detail/dlphknialdlpmcgoknkcmapmclgckhba?utm_source=item-share-cb", external: true },
];

export function Footer() {
  return (
    <footer
      className="py-16 px-8 text-center"
      style={{ background: "#4A3728", color: "#FDF8F3" }}
    >
      {/* Brand */}
      <div className="inline-flex items-center gap-3.5 mb-8">
        <AnimatedMascot size="sm" />
        <span
          className="text-[1.35rem] font-semibold"
          style={{ fontFamily: "var(--font-fraunces), serif" }}
        >
          ThemeGPT
        </span>
      </div>

      {/* Links */}
      <div className="flex justify-center gap-10 mb-8 flex-wrap">
        {footerLinks.map((link) => (
          <a
            key={link.label}
            href={link.href}
            target={link.external ? "_blank" : undefined}
            rel={link.external ? "noopener noreferrer" : undefined}
            className="text-[0.9rem] no-underline transition-colors duration-300 hover:text-cream"
            style={{ color: "rgba(253, 248, 243, 0.7)" }}
          >
            {link.label}
          </a>
        ))}
      </div>

      {/* Copyright */}
      <p className="opacity-40 text-[0.85rem]">
        © 2025 ThemeGPT. Made with ☕ for ChatGPT fans everywhere.
      </p>
    </footer>
  );
}
