import type { Metadata } from "next";
import { Navigation } from "@/components/sections/Navigation";
import { Footer } from "@/components/sections/Footer";

export const metadata: Metadata = {
  title: "ChatGPT Themes — All 15 Themes | ThemeGPT",
  description:
    "Browse all ChatGPT themes from ThemeGPT: Dracula, Monokai Pro, Solarized Dark, One Dark, Aurora Borealis, Synth Wave, and more. Free Chrome extension.",
  alternates: { canonical: "https://themegpt.ai/themes" },
  keywords: [
    "chatgpt themes",
    "chatgpt custom theme",
    "chatgpt dark mode extension",
    "dracula chatgpt",
    "monokai chatgpt",
    "chatgpt appearance",
  ],
  openGraph: {
    title: "ChatGPT Themes — All 15 Themes | ThemeGPT",
    description:
      "Browse all 15 ChatGPT themes: Dracula, Monokai Pro, Solarized Dark, One Dark, Aurora Borealis, Synth Wave, and more.",
    url: "https://themegpt.ai/themes",
  },
};

const freeThemes = [
  {
    name: "ThemeGPT Dark",
    id: "themegpt-dark",
    accent: "#7ECEC5",
    bg: "#1A1512",
    description:
      "The brand's signature dark theme. Warm chocolate-toned grays replace the cold blue-gray of most dark interfaces, with a teal accent that's easy on the eyes during long sessions.",
  },
  {
    name: "ThemeGPT Light",
    id: "themegpt-light",
    accent: "#7ECEC5",
    bg: "#FAF6F0",
    description:
      "A warm cream-white alternative to ChatGPT's default light mode. Uses the Cream & Chocolate design system — softer than stark white, with the same teal accent.",
  },
  {
    name: "Dracula",
    id: "dracula",
    accent: "#BD93F9",
    bg: "#282A36",
    description:
      "One of the most popular developer themes in the world, brought to ChatGPT. Deep purple-gray background with the signature purple accent — exactly the Dracula palette you know from VS Code and Sublime Text.",
  },
  {
    name: "Monokai Pro",
    id: "monokai-pro",
    accent: "#FFD866",
    bg: "#2D2A2E",
    description:
      "The warm-toned dark theme from Sublime Text. A slightly warm dark base and golden yellow accent make long reading sessions more comfortable than high-contrast alternatives.",
  },
  {
    name: "Solarized Dark",
    id: "solarized-dark",
    accent: "#2AA198",
    bg: "#002B36",
    description:
      "Ethan Schoonover's scientifically-designed palette for minimal eye strain. The distinctive teal-tinted dark background and carefully calibrated contrast have made Solarized a developer staple since 2011.",
  },
  {
    name: "One Dark",
    id: "one-dark",
    accent: "#61AFEF",
    bg: "#282C34",
    description:
      "Atom's famous dark theme and the inspiration for VS Code's default appearance. Slate-blue background, soft blue accent, and a glow overlay for a polished modern look.",
  },
  {
    name: "High Contrast",
    id: "high-contrast",
    accent: "#FFD700",
    bg: "#000000",
    description:
      "Pure black background with white text and a gold accent. No effects, no distractions — maximum readability for accessibility-focused users and OLED displays.",
  },
];

const premiumThemes = [
  {
    name: "Aurora Borealis",
    id: "aurora-borealis",
    accent: "#00E5CC",
    bg: "#0A1628",
    description:
      "A live aurora gradient animation — teal, cyan, and aqua shifting slowly behind your conversations like northern lights. Deep midnight navy base keeps it readable while the effect runs.",
    badge: "Animated",
  },
  {
    name: "Sunset Blaze",
    id: "sunset-blaze",
    accent: "#FF6B4A",
    bg: "#1A0A14",
    description:
      "Warm sunset gradient animation in coral, tangerine, and red-orange tones. A glow overlay adds depth. For users who want an animated theme with warmer colors than Aurora Borealis.",
    badge: "Animated",
  },
  {
    name: "Electric Dreams",
    id: "electric-dreams",
    accent: "#FF2E97",
    bg: "#0D0221",
    description:
      "Deep purple-black background with a cosmic aurora gradient animation in purples and violets. Combined with a hot-pink accent for a cyberpunk aesthetic.",
    badge: "Animated",
  },
  {
    name: "Synth Wave",
    id: "synth-wave",
    accent: "#FF6AC1",
    bg: "#262335",
    description:
      "Deep purple base with a neon grid overlay and pink accent. The neon grid effect is subtle — present without being distracting. Built for developers with a retro-futurist aesthetic.",
    badge: "Premium",
  },
  {
    name: "Apple II Phosphor",
    id: "apple-ii-phosphor",
    accent: "#00FF41",
    bg: "#000000",
    description:
      "Monochrome green phosphor on pure black, inspired by vintage Apple II and early terminal displays. Extremely high contrast, distraction-free, and uniquely readable.",
    badge: "Premium",
  },
  {
    name: "Tomorrow Night Blue",
    id: "tomorrow-night-blue",
    accent: "#4FC3F7",
    bg: "#002451",
    description:
      "Deep navy blue background with soft sky blue accents and sparse twinkling star animations. Clean and focused — the blue tones are easier on the eyes than dark grays in many lighting conditions.",
    badge: "Premium",
  },
  {
    name: "Shades of Purple",
    id: "shades-of-purple",
    accent: "#FAD000",
    bg: "#2D2B56",
    description:
      "A VS Code-inspired purple palette popular among developers. Rich purple base, white text, and a yellow accent that pops against the dark background.",
    badge: "Premium",
  },
  {
    name: "Dark Forest",
    id: "dark-forest",
    accent: "#22C55E",
    bg: "#101917",
    description:
      "Deep forest green background with pine tree silhouettes along the bottom edge, drifting fireflies, and a rising fog effect. Atmospheric without being distracting.",
    badge: "Animated",
  },
];

function ThemeCard({
  name,
  description,
  bg,
  accent,
  badge,
}: {
  name: string;
  description: string;
  bg: string;
  accent: string;
  badge?: string;
}) {
  return (
    <article
      className="rounded-2xl overflow-hidden border"
      style={{ borderColor: "#E5DDD5", background: "#FFFFFF" }}
    >
      <div
        className="h-20 flex items-center justify-between px-5"
        style={{ background: bg }}
      >
        <span className="text-sm font-semibold" style={{ color: accent }}>
          {name}
        </span>
        <div className="flex gap-1.5">
          {[accent, accent + "99", accent + "55"].map((c, i) => (
            <div key={i} className="w-2 h-2 rounded-full" style={{ background: c }} />
          ))}
        </div>
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-2">
          <h2 className="text-base font-semibold" style={{ color: "#4A3728" }}>
            {name}
          </h2>
          {badge && (
            <span
              className="shrink-0 text-xs font-medium px-2 py-0.5 rounded-full"
              style={{ background: "#F5EDE3", color: "#7A6555" }}
            >
              {badge}
            </span>
          )}
        </div>
        <p className="text-sm leading-relaxed" style={{ color: "#7A6555" }}>
          {description}
        </p>
      </div>
    </article>
  );
}

export default function ThemesPage() {
  return (
    <div className="min-h-screen" style={{ background: "var(--color-cream)" }}>
      <Navigation />
      <main className="pt-28 pb-24 px-6">
        <div className="max-w-4xl mx-auto">
          <header className="mb-14 text-center">
            <h1
              className="text-4xl md:text-5xl font-bold mb-4"
              style={{ fontFamily: "var(--font-fraunces), serif", color: "#4A3728" }}
            >
              ChatGPT Themes
            </h1>
            <p className="text-lg max-w-xl mx-auto" style={{ color: "#7A6555" }}>
              Handcrafted themes for ChatGPT — from classic developer palettes to animated
              effects. All applied instantly, no data leaves your browser.
            </p>
            <div className="mt-8">
              <a
                href="https://chromewebstore.google.com/detail/themegpt-chatgpt-themes/dlphknialdlpmcgoknkcmapmclgckhba"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block rounded-full px-7 py-3.5 text-sm font-semibold text-white no-underline transition-all duration-300 hover:-translate-y-0.5"
                style={{
                  background: "#5BB5A2",
                  boxShadow: "0 4px 16px rgba(91, 181, 162, 0.25)",
                }}
              >
                Install Free — Add to Chrome
              </a>
            </div>
          </header>

          <section className="mb-16">
            <h2
              className="text-2xl font-semibold mb-2"
              style={{ fontFamily: "var(--font-fraunces), serif", color: "#4A3728" }}
            >
              Free Themes
            </h2>
            <p className="text-sm mb-8" style={{ color: "#9B8070" }}>
              No account required. Install and use immediately.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {freeThemes.map((theme) => (
                <ThemeCard key={theme.id} {...theme} />
              ))}
            </div>
          </section>

          <section>
            <h2
              className="text-2xl font-semibold mb-2"
              style={{ fontFamily: "var(--font-fraunces), serif", color: "#4A3728" }}
            >
              Premium Themes
            </h2>
            <p className="text-sm mb-8" style={{ color: "#9B8070" }}>
              Animated effects and exclusive palettes. Available with a ThemeGPT subscription.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {premiumThemes.map((theme) => (
                <ThemeCard key={theme.id} {...theme} />
              ))}
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
