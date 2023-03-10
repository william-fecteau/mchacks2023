/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "node_modules/flowbite-react/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    colors: {
      primary: "#49E36D",
      navGreen: "#3B824C",
    },
    extend: {
      rotate: {
        '270': '270deg',
      }
    }
  },
  plugins: [require("flowbite/plugin")],
};
