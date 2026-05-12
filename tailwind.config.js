/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx,css}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
    "./hooks/**/*.{js,ts,jsx,tsx,mdx}",
    "./actions/**/*.{js,ts,jsx,tsx,mdx}",
    "./services/**/*.{js,ts,jsx,tsx,mdx}",
    "./config/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      // ─── PALETA DE CORES ────────────────────────────────────────────────────
      colors: {
        // Preto profundo — backgrounds principais
        pitch: {
          950: "#080808",
          900: "#0f0f0f",
          800: "#161616",
          700: "#1e1e1e",
          600: "#262626",
          500: "#303030",
        },
        // Ouro — cor de destaque da marca
        gold: {
          50:  "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fbbf24",
          400: "#f59e0b",
          500: "#d97706",
          600: "#b45309",
          DEFAULT: "#f59e0b",
        },
        // Verde — resultado positivo / ganhou
        win: {
          DEFAULT: "#22c55e",
          light: "#dcfce7",
          dark: "#166534",
        },
        // Vermelho — resultado negativo / perdeu
        loss: {
          DEFAULT: "#ef4444",
          light: "#fee2e2",
          dark: "#991b1b",
        },
        // Cinza neutro — textos secundários
        muted: {
          DEFAULT: "#737373",
          light: "#a3a3a3",
          dark: "#525252",
        },
      },

      // ─── TIPOGRAFIA ─────────────────────────────────────────────────────────
      fontFamily: {
        // Display — títulos e destaques
        display: ["var(--font-display)", "Georgia", "serif"],
        // Body — textos e UI
        body: ["var(--font-body)", "system-ui", "sans-serif"],
        // Mono — odds e números
        mono: ["var(--font-mono)", "Courier New", "monospace"],
      },

      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "0.875rem" }],
        xs:   ["0.75rem",  { lineHeight: "1rem" }],
        sm:   ["0.875rem", { lineHeight: "1.25rem" }],
        base: ["1rem",     { lineHeight: "1.5rem" }],
        lg:   ["1.125rem", { lineHeight: "1.75rem" }],
        xl:   ["1.25rem",  { lineHeight: "1.75rem" }],
        "2xl":["1.5rem",   { lineHeight: "2rem" }],
        "3xl":["1.875rem", { lineHeight: "2.25rem" }],
        "4xl":["2.25rem",  { lineHeight: "2.5rem" }],
        "5xl":["3rem",     { lineHeight: "1.1" }],
        "6xl":["3.75rem",  { lineHeight: "1" }],
      },

      // ─── ESPAÇAMENTO ────────────────────────────────────────────────────────
      spacing: {
        18: "4.5rem",
        22: "5.5rem",
        88: "22rem",
        112:"28rem",
        128:"32rem",
      },

      // ─── BORDAS ─────────────────────────────────────────────────────────────
      borderRadius: {
        "4xl": "2rem",
      },

      // ─── SOMBRAS ────────────────────────────────────────────────────────────
      boxShadow: {
        "gold-sm":  "0 0 12px rgba(245, 158, 11, 0.15)",
        "gold-md":  "0 0 24px rgba(245, 158, 11, 0.25)",
        "gold-lg":  "0 0 48px rgba(245, 158, 11, 0.35)",
        "card":     "0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.6)",
        "card-hover":"0 4px 16px rgba(0,0,0,0.6)",
      },

      // ─── ANIMAÇÕES ──────────────────────────────────────────────────────────
      animation: {
        "fade-in":       "fadeIn 0.4s ease-out forwards",
        "slide-up":      "slideUp 0.5s ease-out forwards",
        "slide-down":    "slideDown 0.3s ease-out forwards",
        "pulse-gold":    "pulseGold 2s ease-in-out infinite",
        "shimmer":       "shimmer 1.5s linear infinite",
        "count-up":      "countUp 0.6s ease-out forwards",
      },

      keyframes: {
        fadeIn: {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%":   { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideDown: {
          "0%":   { opacity: "0", transform: "translateY(-8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseGold: {
          "0%, 100%": { boxShadow: "0 0 12px rgba(245,158,11,0.15)" },
          "50%":      { boxShadow: "0 0 32px rgba(245,158,11,0.4)" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        countUp: {
          "0%":   { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },

      // ─── BREAKPOINTS ────────────────────────────────────────────────────────
      screens: {
        xs: "375px",  // Smartphones pequenos
        sm: "640px",  // Smartphones
        md: "768px",  // Tablets
        lg: "1024px", // Laptops
        xl: "1280px", // Desktops
        "2xl":"1536px",// Wide screens
      },

      // ─── BACKGROUND PATTERNS ────────────────────────────────────────────────
      backgroundImage: {
        "noise": "url('/images/noise.png')",
        "grid-pattern":
          "linear-gradient(rgba(255,255,255,.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.03) 1px, transparent 1px)",
        "gold-shine":
          "linear-gradient(105deg, transparent 40%, rgba(245,158,11,0.08) 50%, transparent 60%)",
      },

      backgroundSize: {
        "grid": "40px 40px",
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"),

    // Plugin custom para utilitários da marca
    function ({ addUtilities, theme }) {
      addUtilities({
        // Texto com gradiente dourado
        ".text-gold-gradient": {
          background: `linear-gradient(135deg, ${theme("colors.gold.300")}, ${theme("colors.gold.500")})`,
          "-webkit-background-clip": "text",
          "-webkit-text-fill-color": "transparent",
          "background-clip": "text",
        },
        // Container padrão do site
        ".container-site": {
          width: "100%",
          maxWidth: "1280px",
          marginLeft: "auto",
          marginRight: "auto",
          paddingLeft: "1rem",
          paddingRight: "1rem",
          "@screen sm": {
            paddingLeft: "1.5rem",
            paddingRight: "1.5rem",
          },
          "@screen lg": {
            paddingLeft: "2rem",
            paddingRight: "2rem",
          },
        },
        // Card base do site
        ".card-base": {
          backgroundColor: theme("colors.pitch.800"),
          border: `1px solid ${theme("colors.pitch.600")}`,
          borderRadius: theme("borderRadius.xl"),
          transition: "border-color 0.2s, box-shadow 0.2s",
          "&:hover": {
            borderColor: `${theme("colors.gold.500")}40`,
            boxShadow: theme("boxShadow.card-hover"),
          },
        },
        // Skeleton / loading state
        ".skeleton": {
          background: `linear-gradient(90deg, ${theme("colors.pitch.700")} 25%, ${theme("colors.pitch.600")} 50%, ${theme("colors.pitch.700")} 75%)`,
          backgroundSize: "200% 100%",
          animation: "shimmer 1.5s linear infinite",
          borderRadius: theme("borderRadius.lg"),
        },
        // Badge de odd
        ".badge-odd": {
          fontFamily: theme("fontFamily.mono"),
          fontWeight: "700",
          fontSize: "0.875rem",
          padding: "0.125rem 0.5rem",
          borderRadius: theme("borderRadius.md"),
          backgroundColor: `${theme("colors.gold.500")}20`,
          color: theme("colors.gold.400"),
          border: `1px solid ${theme("colors.gold.500")}40`,
        },
      });
    },
  ],
};
