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
        ink: "#12202F",
        mist: "#F3F6F8",
        accent: "#0F766E",
        saffron: "#EAB308",
        coral: "#F97316",
        line: "#D7E0E7"
      },
      fontFamily: {
        sans: ['"Avenir Next"', '"Segoe UI"', "sans-serif"],
        display: ['"Iowan Old Style"', '"Palatino Linotype"', "serif"]
      },
      boxShadow: {
        soft: "0 20px 60px -30px rgba(18, 32, 47, 0.35)"
      }
    }
  },
  plugins: []
};

export default config;
