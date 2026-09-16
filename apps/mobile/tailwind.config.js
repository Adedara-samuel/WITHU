/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}", "./features/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Brand palette sampled from the WITHU logo: muted emerald + warm sand,
        // instead of the old magenta/pink theme.
        background: "#FAF8F5",
        foreground: "#1A2320",
        card: "#FFFFFF",
        muted: "#F1EEEA",
        "muted-foreground": "#63746E",
        border: "#E7E2DA",
        primary: "#276852",
        "primary-foreground": "#FBF8F4",
        secondary: "#F0E8DB",
        "secondary-foreground": "#214539",
        accent: "#C89741",
        "accent-foreground": "#2C1F11",
        ember: "#C26447",
        "ember-foreground": "#FCFAF8",
        destructive: "#C6402F",
      },
      fontFamily: {
        display: ["Fraunces_500Medium"],
        sans: ["Inter_400Regular"],
        "sans-medium": ["Inter_600SemiBold"],
      },
    },
  },
  plugins: [],
};
