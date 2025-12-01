/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        background: '#0B0F19',
        surface: {
          DEFAULT: '#121826',
          '30': 'rgba(18, 24, 38, 0.3)',
          '20': 'rgba(18, 24, 38, 0.2)',
        },
        border: {
          DEFAULT: 'rgba(255,255,255,0.08)',
        },
        primary: '#6366f1',
      }
    },
  },
  plugins: [],
}
