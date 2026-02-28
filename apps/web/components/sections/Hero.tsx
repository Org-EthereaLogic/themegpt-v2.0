import { OrganicBlob } from "@/components/ui/OrganicBlob";
import { HeroChromeButton } from "@/components/ui/HeroChromeButton";

export function Hero() {
  return (
    <section className="relative min-h-screen grid grid-cols-1 lg:grid-cols-2 items-center gap-8 lg:gap-16 px-6 py-32 lg:px-24 overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Teal blob - RIGHT side, constrained to stay right of center */}
        <OrganicBlob
          color="teal-soft"
          size={500}
          position={{ top: "-100px", right: "10%" }}
          animationDelay="0s"
          animationVariant="right"
        />
        {/* Coral blob - LEFT side, constrained to stay left of center */}
        <OrganicBlob
          color="coral-soft"
          size={400}
          position={{ bottom: "10%", left: "-100px" }}
          animationDelay="-7s"
          animationVariant="left"
        />
        {/* Yellow blob - center, uses default animation */}
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
          ChatGPT Themes &
          <br />
          <span className="wave-underline relative inline-block">Dark Mode</span>
        </h1>

        {/* Description */}
        <p
          className="text-lg mb-8 max-w-[480px] mx-auto lg:mx-0"
          style={{
            color: "#7A6555",
            animation: "slideInLeft 0.6s ease-out 0.2s both",
          }}
        >
          15 handcrafted themes including dark mode and animated aurora effects.
          Install in one click.
        </p>

        {/* Buttons */}
        <div
          className="flex flex-wrap gap-4 justify-center lg:justify-start"
          style={{ animation: "slideInLeft 0.6s ease-out 0.3s both" }}
        >
          <HeroChromeButton />
          <a
            href="#pricing"
            className="inline-flex items-center rounded-full border-2 px-6 py-3.5 font-semibold transition-all duration-300 hover:-translate-y-0.5"
            style={{
              borderColor: "#4A3728",
              color: "#4A3728",
            }}
          >
            See Plans — from $6.99/mo
          </a>
        </div>

        {/* Trust Signal */}
        <p
          className="text-[0.85rem] mt-5 text-center lg:text-left"
          style={{
            color: "#7A6555",
            animation: "slideInLeft 0.6s ease-out 0.4s both",
          }}
        >
          7 free themes included — premium from $6.99/mo — 30-day free trial
        </p>
      </div>

      {/* Video Demo - Hidden on mobile, shown on desktop */}
      <a
        href="https://chromewebstore.google.com/detail/themegpt/dlphknialdlpmcgoknkcmapmclgckhba"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Get ThemeGPT on the Chrome Web Store"
        className="group relative hidden lg:block rounded-xl overflow-hidden shadow-2xl border border-white/10 transition-transform duration-300 hover:scale-[1.02]"
        style={{ animation: "slideInRight 0.8s ease-out 0.2s both" }}
      >
        {/* Browser Mockup Top Bar */}
        <div className="bg-[#2D2D2D] px-4 py-3 flex items-center gap-2 border-b border-black/20">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#FF5F56]"></div>
            <div className="w-3 h-3 rounded-full bg-[#FFBD2E]"></div>
            <div className="w-3 h-3 rounded-full bg-[#27C93F]"></div>
          </div>
          <div className="bg-[#1e1e1e] rounded-md text-xs text-center text-white/50 w-full py-1">
            chatgpt.com
          </div>
        </div>
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="none"
          className="w-full h-auto object-cover bg-black"
        >
          <source src="/media/demo-30s.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* Hover Overlay Hint */}
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="bg-[#E8A87C] text-white px-6 py-3 rounded-full font-semibold shadow-lg flex items-center gap-2">
            Get it on Chrome
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </a>
    </section>
  );
}
