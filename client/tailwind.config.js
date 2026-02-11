/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#2563eb", // blue-600
          light: "#3b82f6", // blue-500
          dark: "#1d4ed8", // blue-700
        },
        urgent: {
          DEFAULT: "#ef4444", // red-500
          light: "#f87171", // red-400
          dark: "#dc2626", // red-600
        },
        medium: {
          DEFAULT: "#f59e0b", // amber-500
          light: "#fbbf24", // amber-400
          dark: "#d97706", // amber-600
        },
        low: {
          DEFAULT: "#22c55e", // green-500
          light: "#4ade80", // green-400
          dark: "#16a34a", // green-600
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      },
      animation: {
        fadeIn: "fadeIn 0.3s ease-in-out",
        slideInFromTop: "slideInFromTop 0.3s ease-out",
        slideInFromBottom: "slideInFromBottom 0.3s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": {opacity: "0"},
          "100%": {opacity: "1"},
        },
        slideInFromTop: {
          "0%": {transform: "translateY(-100%)", opacity: "0"},
          "100%": {transform: "translateY(0)", opacity: "1"},
        },
        slideInFromBottom: {
          "0%": {transform: "translateY(100%)", opacity: "0"},
          "100%": {transform: "translateY(0)", opacity: "1"},
        },
      },
      boxShadow: {
        smooth: "0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.06)",
        elevated:
          "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      },
    },
  },
  plugins: [],
};
