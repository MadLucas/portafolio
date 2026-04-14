/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        page: {
          DEFAULT: "#0a0a0a",
          muted: "#0f0f0f",
        },
        surface: {
          DEFAULT: "#0d1117",
          elevated: "#161b22",
          border: "#30363d",
        },
        accent: {
          orange: "#f97316",
          coral: "#ea580c",
          rose: "#f43f5e",
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "hero-glow":
          "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(249,115,22,0.12), transparent)",
        "section-fade":
          "radial-gradient(ellipse 100% 80% at 50% 100%, rgba(13,17,23,0.9), #0a0a0a)",
      },
      boxShadow: {
        card: "0 0 0 1px rgba(255,255,255,0.06), 0 12px 40px rgba(0,0,0,0.45)",
        glow: "0 0 60px rgba(249,115,22,0.08)",
      },
      keyframes: {
        "nav-dropdown": {
          "0%": { opacity: "0", transform: "translateY(-12px) scale(0.96)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        "nav-link-in": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "contact-feedback-in": {
          "0%": { opacity: "0", transform: "translateY(14px) scale(0.94)" },
          "55%": { opacity: "1", transform: "translateY(-3px) scale(1.02)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        "contact-float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        "contact-shake": {
          "0%, 100%": { transform: "translateX(0)" },
          "20%": { transform: "translateX(-5px)" },
          "40%": { transform: "translateX(5px)" },
          "60%": { transform: "translateX(-3px)" },
          "80%": { transform: "translateX(3px)" },
        },
      },
      animation: {
        "nav-dropdown": "nav-dropdown 0.34s cubic-bezier(0.16, 1, 0.3, 1) both",
        "nav-link-in": "nav-link-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) both",
        "contact-feedback-in":
          "contact-feedback-in 0.65s cubic-bezier(0.22, 1, 0.36, 1) both",
        "contact-float": "contact-float 2.2s ease-in-out infinite",
        "contact-shake": "contact-shake 0.45s ease-in-out both",
      },
    },
  },
  plugins: [],
};
