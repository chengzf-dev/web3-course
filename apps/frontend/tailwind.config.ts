import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: "#13ec80",
        "background-light": "#f6f8f7",
        "background-dark": "#102219",
        "surface-dark": "#162e24",
        "border-dark": "#234836",
        "text-muted": "#92c9ad"
      },
      fontFamily: {
        display: ["Inter", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;
