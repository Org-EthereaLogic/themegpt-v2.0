// Pre-computed blur placeholder data URLs for theme images
// These are tiny SVG gradients that approximate each theme's dominant colors
// Used with Next.js Image placeholder="blur" for instant perceived loading

function createBlurDataUrl(color1: string, color2: string): string {
  // Create a tiny 10x10 SVG with a gradient
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 10 10">
    <defs>
      <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${color1}"/>
        <stop offset="100%" style="stop-color:${color2}"/>
      </linearGradient>
    </defs>
    <rect width="10" height="10" fill="url(#g)"/>
  </svg>`;
  const base64 = typeof globalThis.btoa === "function" ? globalThis.btoa(svg) : Buffer.from(svg).toString("base64");
  return `data:image/svg+xml;base64,${base64}`;
}

// Theme blur placeholders based on dominant colors
export const THEME_BLUR_DATA: Record<string, string> = {
  // Premium themes
  "aurora-borealis": createBlurDataUrl("#1a1a2e", "#16a085"),
  "sunset-blaze": createBlurDataUrl("#2c1810", "#e74c3c"),
  "electric-dreams": createBlurDataUrl("#0f0f23", "#9b59b6"),
  "woodland-retreat": createBlurDataUrl("#1a2a1a", "#2d5a27"),
  "frosted-windowpane": createBlurDataUrl("#e8f4f8", "#b8d4dd"),
  "silent-night-starfield": createBlurDataUrl("#0a0a1a", "#1a1a3a"),
  "synth-wave": createBlurDataUrl("#1a0a2e", "#ff0080"),
  "shades-of-purple": createBlurDataUrl("#1e1e3f", "#6943ff"),
  // Free themes
  "themegpt-dark": createBlurDataUrl("#1a1a1a", "#2a2a2a"),
  "themegpt-light": createBlurDataUrl("#faf6f0", "#f0e8dc"),
  "solarized-dark": createBlurDataUrl("#002b36", "#073642"),
  dracula: createBlurDataUrl("#282a36", "#44475a"),
  "monokai-pro": createBlurDataUrl("#2d2a2e", "#403e41"),
  "high-contrast": createBlurDataUrl("#000000", "#1a1a1a"),
  "one-dark": createBlurDataUrl("#282c34", "#3e4451"),
};

// Get blur data URL for a theme, with fallback
export function getThemeBlurData(themeId: string): string {
  return THEME_BLUR_DATA[themeId] || THEME_BLUR_DATA["themegpt-dark"];
}
