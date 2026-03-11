/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        gold: '#C9973A',
        'gold-light': '#E8C97A',
        'gold-dark': '#8B6420',
        cream: '#FAF6EE',
        'warm-white': '#FFFDF8',
        bark: '#3D2B1F',
        'bark-light': '#6B4C3B',
        leaf: '#4A7C59',
        terracotta: '#C4622D',
        sand: '#E8D5B7',
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'serif'],
        sans: ['"DM Sans"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
