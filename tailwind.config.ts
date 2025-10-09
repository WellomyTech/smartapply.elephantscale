import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1280px" },
    },
    extend: 
    {
        fontFamily: {
    poppins: ['var(--font-poppins)', 'Poppins', 'sans-serif'], // ✅ add this
  },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",

        // Elephant Scale brand color
        'brand-blue': {
          DEFAULT: '#00A4E4',
          hover: '#008EC6',
          disabled: 'rgba(0,164,228,0.6)',
          foreground: '#FFFFFF',
        },

        // Override primary, accent, etc. to use brand-blue
        primary: { DEFAULT: '#00A4E4', foreground: '#FFFFFF', hover: '#008EC6', disabled: 'rgba(0,164,228,0.6)' },
        secondary: { DEFAULT: '#00A4E4', foreground: '#FFFFFF', hover: '#008EC6', disabled: 'rgba(0,164,228,0.6)' },
        accent: { DEFAULT: '#00A4E4', foreground: '#FFFFFF', hover: '#008EC6', disabled: 'rgba(0,164,228,0.6)' },
        muted:   { DEFAULT: "hsl(var(--muted))", foreground:"hsl(var(--muted-foreground))" },
        destructive:{ DEFAULT: "hsl(var(--destructive))", foreground:"hsl(var(--destructive-foreground))" },
        card:    { DEFAULT: "hsl(var(--card))", foreground:"hsl(var(--card-foreground))" },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: '#00A4E4',
          "primary-foreground": '#FFFFFF',
          accent: '#00A4E4',
          "accent-foreground": '#FFFFFF',
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": { from: { height: "0" }, to: { height: "var(--radix-accordion-content-height)" } },
        "accordion-up":   { from: { height: "var(--radix-accordion-content-height)" }, to: { height: "0" } },
        "shimmer": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" }
        },
        "gradient-x": {
          "0%, 100%": { "background-size": "200% 200%", "background-position": "left center" },
          "50%": { "background-size": "200% 200%", "background-position": "right center" }
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "shimmer": "shimmer 2s linear infinite",
        "gradient-x": "gradient-x 3s ease infinite",
      },
    },
    
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config


export default config
