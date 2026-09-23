/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "hsl(275 60% 7%)",
        foreground: "hsl(280 100% 95%)",
        card: "hsl(278 55% 12%)",
        "card-foreground": "hsl(280 100% 95%)",
        popover: "hsl(278 55% 12%)",
        "popover-foreground": "hsl(280 100% 95%)",
        primary: "hsl(315 100% 59%)",
        "primary-foreground": "hsl(275 60% 7%)",
        secondary: "hsl(268 70% 45%)",
        "secondary-foreground": "hsl(280 100% 95%)",
        muted: "hsl(275 40% 18%)",
        "muted-foreground": "hsl(280 25% 70%)",
        accent: "hsl(45 100% 65%)",
        "accent-foreground": "hsl(275 60% 7%)",
        destructive: "hsl(0 84% 60%)",
        "destructive-foreground": "hsl(0 0% 100%)",
        border: "hsl(280 45% 28%)",
        input: "hsl(280 45% 28%)",
        ring: "hsl(315 100% 59%)",
      },
      fontFamily: {
        display: ["'Russo One'", "sans-serif"],
        score: ["'Orbitron'", "sans-serif"],
      },
      boxShadow: {
        neon: "0 0 22px hsl(315 100% 59% / .6)",
        gold: "0 0 20px hsl(45 100% 65% / .45)",
        red: "0 0 30px hsl(315 100% 59% / .5)",
        win: "0 0 60px hsl(315 100% 59% / .85)",
      },
      backgroundImage: {
        "gradient-neon":
          "linear-gradient(135deg, hsl(268 85% 55%), hsl(315 100% 59%), hsl(325 100% 68%))",
        "gradient-gold":
          "linear-gradient(135deg, hsl(45 100% 72%), hsl(38 96% 55%), hsl(45 100% 78%))",
        "gradient-purple":
          "linear-gradient(180deg, hsl(272 72% 32%), hsl(278 80% 14%))",
      },
    },
  },
  plugins: [],
};