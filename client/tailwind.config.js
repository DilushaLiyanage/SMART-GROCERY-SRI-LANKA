/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ceylon: {
          50: '#f4faf6',
          100: '#e3f3e9',
          500: '#198754', // Ceylon Green
          600: '#146c43',
          700: '#0f5132', // Deep Ceylon Green
          900: '#072517',
        },
        marigold: {
          500: '#FFB703', // Marigold yellow
          600: '#FB8500',
        },
        slateDark: {
          900: '#0F172A',
          950: '#020617',
          800: '#1E293B',
          700: '#334155'
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'glass-hover': '0 8px 32px 0 rgba(31, 38, 135, 0.6)'
      }
    },
  },
  plugins: [],
}
