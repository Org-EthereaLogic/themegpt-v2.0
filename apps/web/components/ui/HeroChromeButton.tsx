"use client";

import { useRipple, RippleContainer } from "@/components/ui/ButtonRipple";

export function HeroChromeButton() {
  const { ripples, createRipple } = useRipple();
  return (
    <a
      href="https://chromewebstore.google.com/detail/themegpt-chatgpt-themes/dlphknialdlpmcgoknkcmapmclgckhba"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Add ThemeGPT to Chrome for free (opens Chrome Web Store)"
      className="group relative inline-flex items-center gap-2.5 rounded-full px-7 py-4 font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.02] active:scale-[0.98] overflow-hidden"
      style={{
        background: "#E8A87C",
        boxShadow: "0 8px 24px rgba(232, 168, 124, 0.35)",
      }}
      onClick={createRipple}
    >
      <RippleContainer ripples={ripples} />
      Add to Chrome — It&apos;s Free
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        className="transition-transform duration-300 group-hover:translate-x-1"
      >
        <path d="M5 12h14M12 5l7 7-7 7" />
      </svg>
    </a>
  );
}
