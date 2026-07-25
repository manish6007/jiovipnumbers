import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/app/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "ui-serif", "Georgia", "serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
        // VIP homepage redesign — additive, opt-in via explicit utility class.
        poppins: ["var(--font-poppins)", "ui-sans-serif", "system-ui", "sans-serif"],
        inter: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        // Repaint Tailwind's built-in blue/sky/amber scales so every literal
        // utility class (icon accents, badges, ratings) picks up the site's
        // brass + signal palette without touching each call site.
        blue: {
          50: "#F7F1E4",
          200: "#E3CFA0",
          500: "#8C6435",
          600: "#6E4E29",
        },
        sky: {
          500: "#C9985C",
        },
        amber: {
          300: "#DFA98C",
          400: "#CB8058",
          500: "#C0602C",
          600: "#A34D22",
          700: "#833D1B",
          950: "#2A150B",
        },
        switchboard: "hsl(var(--switchboard))",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        gold: {
          DEFAULT: "hsl(var(--gold))",
          deep: "hsl(var(--gold-deep))",
          foreground: "hsl(var(--gold-foreground))",
        },
        // VIP homepage redesign — additive, literal-hex tokens (not threaded
        // through the HSL primary/accent system) so out-of-scope pages that
        // consume --primary/--accent/blue/sky/amber are unaffected.
        vipCream: "var(--vip-cream)",
        vipCardBorder: "var(--vip-card-border)",
        vipTile: "var(--vip-tile-bg)",
        vipNavy: {
          900: "var(--vip-navy-900)",
          800: "var(--vip-navy-800)",
        },
        vipPurple: {
          800: "var(--vip-purple-800)",
          700: "var(--vip-purple-700)",
        },
        vipOrange: {
          from: "var(--vip-orange-from)",
          to: "var(--vip-orange-to)",
        },
        vipWhatsapp: "var(--vip-whatsapp)",
        rank: {
          diamondBg: "var(--vip-rank-diamond-bg)",
          diamondFg: "var(--vip-rank-diamond-fg)",
          platinumBg: "var(--vip-rank-platinum-bg)",
          platinumFg: "var(--vip-rank-platinum-fg)",
          goldBg: "var(--vip-rank-gold-bg)",
          goldFg: "var(--vip-rank-gold-fg)",
          newBg: "var(--vip-rank-new-bg)",
          newFg: "var(--vip-rank-new-fg)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        glass: "0 8px 28px 0 rgba(43, 30, 16, 0.10)",
        "glass-lg": "0 16px 44px 0 rgba(43, 30, 16, 0.16)",
        glow: "0 0 22px 0 rgba(140, 100, 53, 0.35)",
        gold: "0 6px 20px 0 rgba(192, 96, 44, 0.32)",
        "gold-lg": "0 10px 30px 0 rgba(192, 96, 44, 0.4)",
      },
      backgroundImage: {
        "hero-gradient":
          "radial-gradient(1200px 600px at 10% -10%, rgba(140,100,53,0.12), transparent), radial-gradient(1000px 500px at 100% 0%, rgba(192,96,44,0.10), transparent)",
        "vip-hero-gradient":
          "radial-gradient(circle at 15% 20%, #3a2560 0%, transparent 45%), radial-gradient(circle at 90% 10%, rgba(124,58,237,0.2) 0%, transparent 40%), linear-gradient(135deg, #0f1626 0%, #1a2140 45%, #2a1a4a 100%)",
        "vip-cta-gradient": "linear-gradient(135deg, #f0a83c, #d1791f)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
        "vip-marquee": {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
        "vip-float-card": {
          "0%, 100%": { transform: "translateY(0) rotate(var(--vip-rot, 0deg))" },
          "50%": { transform: "translateY(-10px) rotate(var(--vip-rot, 0deg))" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        float: "float 6s ease-in-out infinite",
        "vip-marquee": "vip-marquee 30s linear infinite",
        "vip-marquee-fast": "vip-marquee 34s linear infinite",
        "vip-float-card": "vip-float-card 5s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
