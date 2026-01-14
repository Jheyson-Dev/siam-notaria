/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#10b981', // Emerald 500 - Verde Vibrante
          light: '#34d399', // Emerald 400 - Hover
          dark: '#047857', // Emerald 700 - Texto/Active
        },
        secondary: '#064e3b', // Emerald 900 - Bosque Oscuro
        accent: '#d1fae5', // Emerald 100 - Menta Suave
        background: '#f0fdf4', // Emerald 50 - Fondo Fresco
        surface: '#ffffff',
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
