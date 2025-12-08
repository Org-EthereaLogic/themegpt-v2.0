/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: "jit",
  content: ["./**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: "#FAF6F0",      // Cream
          text: "#4B2E1E",    // Chocolate
          peach: "#F4A988",
          teal: "#7ECEC5",
          yellow: "#F5E6B8",
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        'bounce-short': 'bounce 1s infinite 3',
      }
    },
  },
  plugins: [],
}
