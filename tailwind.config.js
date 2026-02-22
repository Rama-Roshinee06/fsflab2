/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'vanilla-cream': '#FDFCF0',
        'pale-mint': '#E8F5E9',
        'soft-peach': '#FFD2A0',
        'periwinkle': '#B8C1EC',
        'slate-blue': '#455A64',
      },
      fontFamily: {
        'rounded': ['Fredoka', 'Nunito', 'sans-serif'],
      },
      animation: {
        'blob': 'blob 7s infinite',
        'pulse-gentle': 'pulse-gentle 2s ease-in-out infinite',
        'hop-back': 'hop-back 0.6s ease-out',
      },
      keyframes: {
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        },
        'pulse-gentle': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
        'hop-back': {
          '0%': { transform: 'translateY(0)' },
          '30%': { transform: 'translateY(-20px)' },
          '100%': { transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}
