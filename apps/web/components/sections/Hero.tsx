"use client";

import { OrganicBlob } from "@/components/ui/OrganicBlob";
import { FloatingCard } from "@/components/ui/FloatingCard";
import { useRipple, RippleContainer } from "@/components/ui/ButtonRipple";

export function Hero() {
  const { ripples, createRipple } = useRipple();
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
            href="https://chromewebstore.google.com/detail/dlphknialdlpmcgoknkcmapmclgckhba?utm_source=item-share-cb"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative inline-flex items-center gap-2.5 rounded-full px-7 py-4 font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.02] active:scale-[0.98] overflow-hidden"
            style={{
              background: "#E8A87C",
              boxShadow: "0 8px 24px rgba(232, 168, 124, 0.35)",
            }}
            onClick={createRipple}
          >
            <RippleContainer ripples={ripples} />
            Install Extension
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
          gradient="linear-gradient(135deg, #0A1628 0%, #164E63 100%)"
          label="Aurora Borealis"
          dotColors={["#00E5CC", "#80DEEA", "#164E63"]}
          lineColor="#00E5CC"
          labelBgColor="rgba(0, 229, 204, 0.2)"
          labelTextColor="#00E5CC"
          rotation={-8}
          animationName="float1"
          position={{ top: "20px", left: "0" }}
          size={{ width: 260, height: 180 }}
        />
        <FloatingCard
          gradient="linear-gradient(135deg, #282A36 0%, #44475A 100%)"
          label="Dracula"
          dotColors={["#FF79C6", "#BD93F9", "#50FA7B"]}
          lineColor="#BD93F9"
          labelBgColor="rgba(189, 147, 249, 0.2)"
          labelTextColor="#BD93F9"
          rotation={6}
          animationName="float2"
          animationDelay="-2s"
          position={{ top: "80px", right: "20px" }}
          size={{ width: 240, height: 170 }}
        />
        <FloatingCard
          gradient="linear-gradient(135deg, #262335 0%, #4a2c7a 100%)"
          label="Synth Wave"
          dotColors={["#FF6AC1", "#FAD000", "#36F9F6"]}
          lineColor="#FF6AC1"
          labelBgColor="rgba(255, 106, 193, 0.2)"
          labelTextColor="#FF6AC1"
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
