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
        ink: "#F1F5F9",
        mist: "#131B26",
        tint: "#0E1722",
        accent: "#22D3EE",
        saffron: "#EAB308",
        coral: "#F97316",
        pine: "#38BDF8",
        brass: "#D8A557",
        "brass-light": "#F3C878",
        line: "#1E293B",
        obsidian: "#06080B",
        surface: "#0D1219",
        teal: {
          50: "#0A151D",
          100: "#0F2230",
          200: "#163547",
          500: "#14B8A6",
          600: "#0D9488",
          700: "#0F766E",
          800: "#5EEAD4",
          900: "#99F6E4"
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
        soft: "0 20px 60px -20px rgba(0, 0, 0, 0.7), 0 0 30px -10px rgba(6, 182, 212, 0.12)"
      }
    }
  },
  plugins: []
};

export default config;
