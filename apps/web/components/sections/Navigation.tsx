"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatedMascot } from "@/components/ui/AnimatedMascot";

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-[1000] flex items-center justify-between px-6 py-5 transition-all duration-400 md:px-12 ${
        isScrolled
          ? "bg-cream/90 backdrop-blur-[20px] shadow-[0_4px_30px_rgba(74,55,40,0.06)]"
          : "bg-transparent"
      }`}
    >
      {/* Logo */}
      <Link href="/" className="flex items-center gap-3.5 no-underline">
        <AnimatedMascot size="md" />
        <span
          className="text-[1.6rem] font-semibold tracking-tight"
          style={{ fontFamily: "var(--font-fraunces), serif", color: "#4A3728" }}
        >
          ThemeGPT
        </span>
      </Link>

      {/* Nav Links - Hidden on mobile */}
      <div className="hidden items-center gap-10 md:flex">
        {["Themes", "Features", "Pricing"].map((item) => (
          <a
            key={item}
            href={`#${item.toLowerCase()}`}
            className="group relative py-2 text-[0.95rem] font-medium no-underline transition-colors"
            style={{ color: "#7A6555" }}
          >
            <span className="group-hover:text-brown transition-colors">{item}</span>
            <span
              className="absolute bottom-0 left-1/2 h-[3px] w-0 -translate-x-1/2 rounded-sm transition-all duration-300 group-hover:w-full"
              style={{ background: "#E8A87C" }}
            />
          </a>
        ))}
        <a
          href="https://chromewebstore.google.com/detail/dlphknialdlpmcgoknkcmapmclgckhba?utm_source=cws&utm_medium=share&utm_campaign=item-share"
          target="_blank"
          rel="noopener noreferrer"
          className="whitespace-nowrap rounded-full px-4 py-2.5 text-[0.9rem] font-semibold text-white no-underline transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(91,181,162,0.35)] lg:px-6 lg:py-3 lg:text-base"
          style={{
            background: "#5BB5A2",
            boxShadow: "0 4px 16px rgba(91, 181, 162, 0.25)",
          }}
        >
          Get ThemeGPT Free
        </a>
      </div>
    </nav>
  );
}
