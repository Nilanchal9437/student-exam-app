/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.tsx",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./features/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  darkMode: "media",
  theme: {
    extend: {
      colors: {
        brand: {
          blue: "#2452FF",
          "blue-dark": "#1a3fd4",
          "blue-light": "#EEF1FF",
        },
      },
    },
  },
  plugins: [],
};
