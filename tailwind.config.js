/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        anton: ['var(--font-anton)', 'sans-serif'],
        impact: ['Impact', 'sans-serif'],
        manrope: ['var(--font-manrope)', 'sans-serif'],
        bebas: ['var(--font-bebas)', 'sans-serif'],
        poppins: ['var(--font-poppins)', 'sans-serif'],

      },
    },
  },
  plugins: [],
};

