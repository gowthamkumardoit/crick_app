/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,ts,tsx}",
    "./screens/**/*.{js,ts,tsx}",
    "./components/**/*.{js,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        /* APP THEME */
        bg: "#0B0F14",
        card: "#121823",
        border: "rgba(255,255,255,0.05)",

        /* BRAND */
        primary: "#22C55E",
        danger: "#EF4444",

        /* TEXT */
        text: "#E5E7EB",
        muted: "#94A3B8",
      },
      borderRadius: {
        xl: "16px",
        lg: "14px",
      },
    },
  },
  plugins: [],
};
