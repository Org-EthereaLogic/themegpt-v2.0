"use client";

import { OrganicBlob } from "@/components/ui/OrganicBlob";
import { FloatingCard } from "@/components/ui/FloatingCard";

export function Hero() {
  return (
    <section className="relative min-h-screen grid grid-cols-1 lg:grid-cols-2 items-center gap-8 lg:gap-16 px-6 py-32 lg:px-24 overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <OrganicBlob
          color="teal-soft"
          size={500}
          position={{ top: "-100px", right: "10%" }}
          animationDelay="0s"
        />
        <OrganicBlob
          color="coral-soft"
          size={400}
          position={{ bottom: "10%", left: "-100px" }}
          animationDelay="-7s"
        />
        <OrganicBlob
          color="yellow"
          size={300}
          position={{ top: "40%", left: "30%" }}
          animationDelay="-14s"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center lg:text-left">
        {/* Tag */}
        <div
          className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[0.85rem] font-medium mb-6"
          style={{
            background: "#F5EDE3",
            color: "#7A6555",
            animation: "slideInLeft 0.6s ease-out",
          }}
        >
          <span
            className="w-2 h-2 rounded-full"
            style={{ background: "#5BB5A2" }}
          />
          Free on Chrome Web Store
        </div>

        {/* Title */}
        <h1
          className="text-[clamp(2.5rem,5vw,4rem)] font-semibold leading-[1.15] tracking-tight mb-5"
          style={{
            fontFamily: "var(--font-fraunces), serif",
            animation: "slideInLeft 0.6s ease-out 0.1s both",
          }}
        >
          Give ChatGPT
          <br />
          <span className="wave-underline relative inline-block">your vibe</span>
        </h1>

        {/* Description */}
        <p
          className="text-lg mb-8 max-w-[480px] mx-auto lg:mx-0"
          style={{
            color: "#7A6555",
            animation: "slideInLeft 0.6s ease-out 0.2s both",
          }}
        >
          Beautiful themes that match your personality. Transform your ChatGPT
          interface with one click—no tech skills needed.
        </p>

        {/* Buttons */}
        <div
          className="flex flex-wrap gap-4 justify-center lg:justify-start"
          style={{ animation: "slideInLeft 0.6s ease-out 0.3s both" }}
        >
          <a
            href="https://chromewebstore.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 rounded-full px-7 py-4 font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.02]"
            style={{
              background: "#E8A87C",
              boxShadow: "0 8px 24px rgba(232, 168, 124, 0.35)",
            }}
          >
            Install Extension
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
          <a
            href="#themes"
            className="inline-flex items-center rounded-full border-2 px-6 py-3.5 font-semibold transition-all duration-300 hover:-translate-y-0.5"
            style={{
              borderColor: "#4A3728",
              color: "#4A3728",
            }}
          >
            See Themes
          </a>
        </div>
      </div>

      {/* Floating Cards - Hidden on mobile */}
      <div
        className="relative h-[500px] hidden lg:block"
        style={{ animation: "slideInRight 0.8s ease-out 0.2s both" }}
      >
        <FloatingCard
          gradient="linear-gradient(135deg, #1a3c34 0%, #2d5a4a 100%)"
          label="Forest Zen"
          dotColors={["#ff6b6b", "#feca57", "#1dd1a1"]}
          lineColor="#55efc4"
          labelBgColor="rgba(85, 239, 196, 0.2)"
          labelTextColor="#55efc4"
          rotation={-8}
          animationName="float1"
          position={{ top: "20px", left: "0" }}
          size={{ width: 260, height: 180 }}
        />
        <FloatingCard
          gradient="linear-gradient(135deg, #fff5f5 0%, #ffe4d4 100%)"
          label="Coral Sunset"
          dotColors={["#ff6b6b", "#feca57", "#1dd1a1"]}
          lineColor="#e17055"
          labelBgColor="rgba(225, 112, 85, 0.2)"
          labelTextColor="#c44e32"
          rotation={6}
          animationName="float2"
          animationDelay="-2s"
          position={{ top: "80px", right: "20px" }}
          size={{ width: 240, height: 170 }}
        />
        <FloatingCard
          gradient="linear-gradient(135deg, #f8f5ff 0%, #e8dff5 100%)"
          label="Lavender"
          dotColors={["#a29bfe", "#fd79a8", "#00cec9"]}
          lineColor="#6c5ce7"
          labelBgColor="rgba(108, 92, 231, 0.2)"
          labelTextColor="#6c5ce7"
          rotation={4}
          animationName="float3"
          animationDelay="-4s"
          position={{ bottom: "60px", left: "40px" }}
          size={{ width: 280, height: 190 }}
        />
      </div>
    </section>
  );
}
