/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}", "./features/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#FBF7F4",
        foreground: "#221019",
        card: "#FFFFFF",
        muted: "#F1E9E3",
        "muted-foreground": "#6B5D63",
        border: "#E6DCD3",
        primary: "#7A2C4C",
        "primary-foreground": "#FBF4F6",
        secondary: "#F3E4DC",
        "secondary-foreground": "#5C2138",
        accent: "#C9954A",
        "accent-foreground": "#241A0B",
        ember: "#D9704A",
        "ember-foreground": "#FDF4EF",
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
