import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      spacing: {
        1: "4px",
        2: "8px",
        3: "12px",
        4: "16px",
        6: "24px",
        8: "32px",
        12: "48px"
      },
      borderRadius: {
        xl: "12px",
        "2xl": "16px"
      },
      boxShadow: {
        md: "0 4px 12px rgba(15, 23, 42, 0.12)",
        lg: "0 8px 24px rgba(15, 23, 42, 0.16)"
      },
      colors: {
        brand: {
          DEFAULT: "#2563eb",
          foreground: "#ffffff",
          muted: "#dbeafe"
        }
      },
      fontFamily: {
        sans: ["var(--font-noto)", "Noto Sans", "sans-serif"]
      }
    }
  },
  plugins: [require("@tailwindcss/forms")]
};

export default config;
