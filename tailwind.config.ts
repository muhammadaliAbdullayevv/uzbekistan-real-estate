import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0F172A",
        mist: "#EFF6FF",
        tint: "#F3F6FB",
        accent: "#2563EB",
        saffron: "#D97706",
        coral: "#DC2626",
        pine: "#059669",
        brass: "#B45309",
        "brass-light": "#F59E0B",
        line: "#CBD5E1",
        obsidian: "#DCE5F2",
        surface: "#FFFFFF",
        teal: {
          50: "#EFF6FF",
          100: "#DBEAFE",
          200: "#BFDBFE",
          500: "#3B82F6",
          600: "#2563EB",
          700: "#1D4ED8",
          800: "#1E40AF",
          900: "#1E3A8A"
        }
      },
      fontFamily: {
        sans: [
          '"Plus Jakarta Sans"',
          '"Inter"',
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "sans-serif"
        ],
        display: [
          '"Plus Jakarta Sans"',
          '"Inter"',
          "-apple-system",
          "BlinkMacSystemFont",
          "sans-serif"
        ]
      },
      boxShadow: {
        soft: "0 10px 28px -10px rgba(15, 23, 42, 0.08), 0 2px 6px rgba(15, 23, 42, 0.04)"
      }
    }
  },
  plugins: []
};

export default config;
