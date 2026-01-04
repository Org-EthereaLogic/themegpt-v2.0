/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: "jit",
  content: ["./src/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Primary palette (matching website)
        cream: {
          DEFAULT: "#FDF8F3",
          warm: "#FFF9F2",
          deep: "#F5EDE3",
        },
        brown: {
          DEFAULT: "#4A3728",
          soft: "#7A6555",
        },
        teal: {
          DEFAULT: "#5BB5A2",
          soft: "#7BCBB9",
          bright: "#3AA08C",
        },
        coral: {
          DEFAULT: "#E8A87C",
          soft: "#F4C4A0",
          bright: "#E08A54",
        },
        yellow: {
          DEFAULT: "#F4E4BA",
          bright: "#FFDF82",
        },
        // Backwards compatibility aliases
        brand: {
          bg: "#FDF8F3",
          text: "#4A3728",
          peach: "#E8A87C",
          teal: "#5BB5A2",
          yellow: "#F4E4BA",
        },
      },
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        display: ['Fraunces', 'Georgia', 'serif'],
      },
      borderRadius: {
        'card': '20px',
        'button': '14px',
      },
      boxShadow: {
        'card': '0 8px 24px rgba(74, 55, 40, 0.06)',
        'card-hover': '0 12px 32px rgba(74, 55, 40, 0.10)',
        'button': '0 4px 16px rgba(91, 181, 162, 0.25)',
      },
      animation: {
        'bounce-short': 'bounce 1s infinite 3',
        'badge-float': 'badgeFloat 3s ease-in-out infinite',
        'badge-glow': 'badgeGlow 3s ease-in-out infinite',
        'check-pop': 'checkPop 0.3s ease-out forwards',
        'slide-in': 'slideIn 0.2s ease-out',
        'mascot-wobble': 'mascotWobble 4s ease-in-out infinite',
        'blink': 'blink 4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
