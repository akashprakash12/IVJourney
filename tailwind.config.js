/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: [
    "./App.{js,jsx,ts,tsx}",
  "./app/**/*.{js,jsx,ts,tsx}",
  "./src/**/*.{js,jsx,ts,tsx}",
  
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors:{
        primary: "#F22E63", 
        secondary: "#2A0D2E",
        secondary_2:"#2B003D",
        primary_1:"#FF6480",
        dark: "#1A0329", // Dark background
        inputBg: "#290C3E", // Input background
        placeholder: "#aaa",
      }
    },
  },
  plugins: [],
};
